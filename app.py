import os
import io
import zipfile
from flask import (
    Flask, render_template, request, jsonify,
    send_file, abort, Response, stream_with_context
)
from flask_socketio import SocketIO, join_room, leave_room
from pygments import highlight
from pygments.lexers import get_lexer_by_name, guess_lexer_for_filename, TextLexer
from pygments.formatters import HtmlFormatter
from pygments.util import ClassNotFound

from config import HOST, PORT, SECRET_KEY, VAULTS_DIR
from database import (
    init_db, client_fingerprint, get_settings, update_settings
)
from utils import (
    list_directory, list_vaults, search_files, safe_join,
    to_rel_path, get_file_kind, get_mime, format_size, get_icon
)
from watcher import start_watcher


app = Flask(__name__)
app.config["SECRET_KEY"] = SECRET_KEY
app.config["MAX_CONTENT_LENGTH"] = None

# ИСПОЛЬЗУЕМ СУПЕРСТАБИЛЬНЫЙ THREADING РЕЖИМ! 🚀
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

init_db()


def get_client_id() -> str:
    ip = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown")
    ua = request.headers.get("User-Agent", "unknown")
    return client_fingerprint(ip, ua)


# ===================== СТРАНИЦЫ =====================

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/browse/")
@app.route("/browse/<path:subpath>")
def browse(subpath=""):
    return render_template("explorer.html", initial_path=subpath)


# ===================== API =====================

@app.route("/api/vaults")
def api_vaults():
    return jsonify({"vaults": list_vaults()})


@app.route("/api/list/")
@app.route("/api/list/<path:subpath>")
def api_list(subpath=""):
    try:
        data = list_directory(subpath)
    except FileNotFoundError:
        return jsonify({"error": "not_found"}), 404
    except ValueError:
        return jsonify({"error": "invalid_path"}), 400
    return jsonify(data)


@app.route("/api/search")
def api_search():
    q = request.args.get("q", "").strip()
    base = request.args.get("path", "").strip()
    if not q:
        return jsonify({"results": []})
    try:
        results = search_files(q, base)
    except ValueError:
        return jsonify({"error": "invalid_path"}), 400
    return jsonify({"results": results, "query": q})


@app.route("/api/download/<path:subpath>")
def api_download(subpath):
    try:
        abs_path = safe_join(subpath)
    except ValueError:
        abort(400)
    if not os.path.isfile(abs_path):
        abort(404)
    disposition = request.args.get("inline") == "1"
    return send_file(
        abs_path,
        as_attachment=not disposition,
        download_name=os.path.basename(abs_path),
        mimetype=get_mime(abs_path),
        conditional=True,
    )


@app.route("/api/download-zip/<path:subpath>")
def api_download_zip(subpath):
    try:
        abs_path = safe_join(subpath)
    except ValueError:
        abort(400)
    if not os.path.isdir(abs_path):
        abort(404)

    base_name = os.path.basename(abs_path) or "vault"

    def generate():
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED, allowZip64=True) as zf:
            for root, dirs, files in os.walk(abs_path):
                if not dirs and not files:
                    arc = os.path.relpath(root, abs_path).replace(os.sep, "/") + "/"
                    if arc != "./":
                        zf.writestr(arc, "")
                for f in files:
                    full = os.path.join(root, f)
                    arc = os.path.relpath(full, abs_path).replace(os.sep, "/")
                    try:
                        zf.write(full, arc)
                    except OSError:
                        continue
                    buffer.seek(0)
                    chunk = buffer.read()
                    if chunk:
                        yield chunk
                    buffer.seek(0)
                    buffer.truncate(0)
        buffer.seek(0)
        remaining = buffer.read()
        if remaining:
            yield remaining

    resp = Response(stream_with_context(generate()), mimetype="application/zip")
    resp.headers["Content-Disposition"] = f'attachment; filename="{base_name}.zip"'
    return resp


@app.route("/api/zip-size/<path:subpath>")
def api_zip_size(subpath):
    try:
        abs_path = safe_join(subpath)
    except ValueError:
        abort(400)
    if not os.path.isdir(abs_path):
        abort(404)
    total = 0
    files_count = 0
    for root, _, files in os.walk(abs_path):
        for f in files:
            try:
                total += os.path.getsize(os.path.join(root, f))
                files_count += 1
            except OSError:
                pass
    return jsonify({
        "size": total,
        "size_human": format_size(total),
        "files_count": files_count,
    })


@app.route("/api/preview/<path:subpath>")
def api_preview(subpath):
    try:
        abs_path = safe_join(subpath)
    except ValueError:
        abort(400)
    if not os.path.isfile(abs_path):
        abort(404)

    max_bytes = 2 * 1024 * 1024
    try:
        with open(abs_path, "rb") as f:
            raw = f.read(max_bytes + 1)
    except OSError:
        return jsonify({"error": "read_failed"}), 500

    truncated = len(raw) > max_bytes
    if truncated:
        raw = raw[:max_bytes]

    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text = raw.decode("cp1251")
        except UnicodeDecodeError:
            text = raw.decode("utf-8", errors="replace")

    try:
        lexer = guess_lexer_for_filename(os.path.basename(abs_path), text)
    except ClassNotFound:
        lexer = TextLexer()

    formatter = HtmlFormatter(
        nowrap=False, linenos="table", cssclass="pygments-code",
        style="monokai"
    )
    html_code = highlight(text, lexer, formatter)
    css = formatter.get_style_defs(".pygments-code")

    return jsonify({
        "html": html_code,
        "css": css,
        "truncated": truncated,
        "language": lexer.name,
    })


@app.route("/api/file-info/<path:subpath>")
def api_file_info(subpath):
    try:
        abs_path = safe_join(subpath)
    except ValueError:
        abort(400)
    if not os.path.exists(abs_path):
        abort(404)
    stat = os.stat(abs_path)
    is_dir = os.path.isdir(abs_path)
    name = os.path.basename(abs_path)
    return jsonify({
        "name": name,
        "path": to_rel_path(abs_path),
        "is_dir": is_dir,
        "size": stat.st_size if not is_dir else 0,
        "size_human": format_size(stat.st_size) if not is_dir else "",
        "modified": stat.st_mtime,
        "kind": "folder" if is_dir else get_file_kind(name),
        "mime": get_mime(name),
        "icon": get_icon(name, is_dir),
    })


@app.route("/api/settings", methods=["GET"])
def api_get_settings():
    cid = get_client_id()
    return jsonify(get_settings(cid))


@app.route("/api/settings", methods=["POST"])
def api_set_settings():
    cid = get_client_id()
    data = request.get_json(silent=True) or {}
    updated = update_settings(cid, data)
    return jsonify(updated)


# ===================== SOCKET.IO =====================

@socketio.on("connect")
def on_connect():
    pass


@socketio.on("subscribe_path")
def on_subscribe(data):
    path = (data or {}).get("path", "")
    join_room(f"path:{path}")


@socketio.on("unsubscribe_path")
def on_unsubscribe(data):
    path = (data or {}).get("path", "")
    leave_room(f"path:{path}")


# ===================== ЗАПУСК =====================

if __name__ == "__main__":
    os.makedirs(VAULTS_DIR, exist_ok=True)
    start_watcher(socketio)
    print(f"╔══════════════════════════════════════════╗")
    print(f"║       botyaracloud is running!           ║")
    print(f"║       http://{HOST}:{PORT}              ║")
    print(f"╚══════════════════════════════════════════╝")
    # debug=True может запускать watcher дважды из-за релоадера, поэтому debug=False
    socketio.run(app, host=HOST, port=PORT, debug=False, allow_unsafe_werkzeug=True)

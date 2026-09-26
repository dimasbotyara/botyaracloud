import os
import mimetypes
from datetime import datetime
from config import VAULTS_DIR


# ========== ИКОНКИ (Symbols Nerd Font) ==========
# 200+ расширений → Nerd Font glyphs
FILE_ICONS = {
    # Папки
    "__folder__": "\uf07b",         # 
    "__folder_open__": "\uf07c",    # 
    "__vault__": "\ueb09",          # 
    "__file__": "\uf15b",           # 

    # Программирование
    "py": "\ue606", "pyc": "\ue606", "pyw": "\ue606", "pyi": "\ue606",
    "ipynb": "\ue606",
    "js": "\ue60c", "mjs": "\ue60c", "cjs": "\ue60c",
    "ts": "\ue628", "tsx": "\ue7ba", "jsx": "\ue7ba",
    "html": "\ue60e", "htm": "\ue60e", "xhtml": "\ue60e",
    "css": "\ue614", "scss": "\ue603", "sass": "\ue603", "less": "\ue60b",
    "json": "\ue60b", "jsonc": "\ue60b", "json5": "\ue60b",
    "xml": "\ue619", "svg": "\ufc1f",
    "yaml": "\uf481", "yml": "\uf481",
    "toml": "\ue6b2",
    "md": "\ue609", "markdown": "\ue609", "mdx": "\ue609",
    "rst": "\uf15c",
    "c": "\ue61e", "h": "\ue61e",
    "cpp": "\ue61d", "cc": "\ue61d", "cxx": "\ue61d", "hpp": "\ue61d",
    "cs": "\U000f031b",
    "java": "\ue738", "class": "\ue738", "jar": "\ue738",
    "kt": "\ue634", "kts": "\ue634",
    "rs": "\ue7a8", "rlib": "\ue7a8",
    "go": "\ue627",
    "rb": "\ue21e", "erb": "\ue21e",
    "php": "\ue608",
    "swift": "\ue755",
    "dart": "\ue64c",
    "lua": "\ue620",
    "pl": "\ue769", "pm": "\ue769",
    "r": "\uf25d", "rmd": "\uf25d",
    "scala": "\ue737",
    "clj": "\ue768", "cljs": "\ue768",
    "hs": "\ue777", "lhs": "\ue777",
    "ml": "\ue67a", "mli": "\ue67a",
    "elm": "\ue62c",
    "ex": "\ue62d", "exs": "\ue62d",
    "erl": "\ue7b1", "hrl": "\ue7b1",
    "vue": "\ufd42",
    "svelte": "\ue697",
    "astro": "\ue6b3",

    # Shell / Configs
    "sh": "\uf489", "bash": "\uf489", "zsh": "\uf489", "fish": "\uf489",
    "ps1": "\uf489", "bat": "\uf489", "cmd": "\uf489",
    "vim": "\ue62b", "vimrc": "\ue62b", "nvim": "\ue62b",
    "conf": "\ue615", "config": "\ue615", "cfg": "\ue615",
    "ini": "\ue615",
    "env": "\uf462",
    "gitignore": "\ue65d", "gitattributes": "\ue65d", "gitmodules": "\ue65d",
    "editorconfig": "\ue652",
    "dockerfile": "\uf308", "dockerignore": "\uf308",
    "makefile": "\ue673", "mk": "\ue673",
    "cmake": "\ue794",

    # Данные / Логи
    "csv": "\uf1c3", "tsv": "\uf1c3",
    "sql": "\uf1c0", "sqlite": "\ue7c4", "db": "\uf1c0",
    "log": "\uf18d",
    "txt": "\uf15c", "text": "\uf15c",
    "nfo": "\uf15c",

    # Документы
    "pdf": "\uf1c1",
    "doc": "\uf1c2", "docx": "\uf1c2", "odt": "\uf1c2", "rtf": "\uf1c2",
    "xls": "\uf1c3", "xlsx": "\uf1c3", "ods": "\uf1c3",
    "ppt": "\uf1c4", "pptx": "\uf1c4", "odp": "\uf1c4",
    "epub": "\ue28b", "mobi": "\ue28b", "azw": "\ue28b", "azw3": "\ue28b",
    "djvu": "\ue28b",
    "tex": "\uf034", "bib": "\uf02d",

    # Изображения
    "jpg": "\uf1c5", "jpeg": "\uf1c5", "png": "\uf1c5", "gif": "\uf1c5",
    "bmp": "\uf1c5", "tiff": "\uf1c5", "tif": "\uf1c5", "ico": "\uf1c5",
    "webp": "\uf1c5", "avif": "\uf1c5", "jfif": "\uf1c5", "heic": "\uf1c5",
    "heif": "\uf1c5", "raw": "\uf1c5", "cr2": "\uf1c5", "nef": "\uf1c5",
    "psd": "\ue7b8", "ai": "\ue7b4", "xd": "\ue784", "sketch": "\ue785",
    "fig": "\uf1c5",

    # Видео
    "mp4": "\uf1c8", "mkv": "\uf1c8", "avi": "\uf1c8", "mov": "\uf1c8",
    "wmv": "\uf1c8", "flv": "\uf1c8", "webm": "\uf1c8", "m4v": "\uf1c8",
    "mpg": "\uf1c8", "mpeg": "\uf1c8", "3gp": "\uf1c8", "ogv": "\uf1c8",
    "ts_video": "\uf1c8", "vob": "\uf1c8", "rm": "\uf1c8", "rmvb": "\uf1c8",

    # Аудио
    "mp3": "\uf1c7", "wav": "\uf1c7", "flac": "\uf1c7", "aac": "\uf1c7",
    "ogg": "\uf1c7", "opus": "\uf1c7", "wma": "\uf1c7", "m4a": "\uf1c7",
    "aiff": "\uf1c7", "ape": "\uf1c7", "alac": "\uf1c7", "amr": "\uf1c7",
    "mid": "\uf1c7", "midi": "\uf1c7",

    # Архивы
    "zip": "\uf1c6", "rar": "\uf1c6", "7z": "\uf1c6", "tar": "\uf1c6",
    "gz": "\uf1c6", "bz2": "\uf1c6", "xz": "\uf1c6", "zst": "\uf1c6",
    "tgz": "\uf1c6", "tbz2": "\uf1c6", "lz": "\uf1c6", "lzma": "\uf1c6",
    "iso": "\ue271", "img": "\ue271", "dmg": "\ue271",

    # Исполняемые
    "exe": "\uf17a", "msi": "\uf17a", "app": "\uf179", "apk": "\ue70e",
    "ipa": "\uf179", "deb": "\uf17c", "rpm": "\uf17c", "pkg": "\uf179",
    "appimage": "\uf17c", "run": "\uf17c",

    # Шрифты
    "ttf": "\uf031", "otf": "\uf031", "woff": "\uf031", "woff2": "\uf031",
    "eot": "\uf031",

    # 3D / CAD
    "obj": "\uf1b2", "fbx": "\uf1b2", "stl": "\uf1b2", "blend": "\uf1b2",
    "dae": "\uf1b2", "3ds": "\uf1b2", "gltf": "\uf1b2", "glb": "\uf1b2",

    # Прочее
    "torrent": "\uf019",
    "lock": "\uf023",
    "bak": "\uf24a", "backup": "\uf24a", "old": "\uf24a",
    "tmp": "\uf24a", "temp": "\uf24a",
    "part": "\uf019",
    "key": "\uf084", "pem": "\uf084", "crt": "\uf084", "cer": "\uf084",
    "license": "\uf718",
    "readme": "\uf7fb",
}


# Файлы, которые можно подсветить через Pygments
CODE_EXTENSIONS = {
    "py", "pyw", "pyi", "js", "mjs", "cjs", "ts", "tsx", "jsx",
    "html", "htm", "xhtml", "css", "scss", "sass", "less",
    "json", "jsonc", "json5", "xml", "yaml", "yml", "toml",
    "md", "markdown", "mdx", "rst", "txt", "log", "nfo",
    "c", "h", "cpp", "cc", "cxx", "hpp", "cs",
    "java", "kt", "kts", "rs", "go", "rb", "erb",
    "php", "swift", "dart", "lua", "pl", "pm", "r",
    "scala", "clj", "cljs", "hs", "ml", "elm", "ex", "exs",
    "erl", "vue", "svelte", "astro",
    "sh", "bash", "zsh", "fish", "ps1", "bat", "cmd",
    "vim", "conf", "config", "cfg", "ini", "env",
    "gitignore", "gitattributes", "editorconfig",
    "dockerfile", "makefile", "mk", "cmake",
    "csv", "tsv", "sql",
}

IMAGE_EXTENSIONS = {
    "jpg", "jpeg", "png", "gif", "bmp", "webp", "avif",
    "svg", "ico", "jfif",
}
VIDEO_EXTENSIONS = {
    "mp4", "webm", "ogv", "mov", "mkv", "m4v",
}
AUDIO_EXTENSIONS = {
    "mp3", "wav", "ogg", "opus", "aac", "m4a", "flac",
}
PDF_EXTENSIONS = {"pdf"}


def get_extension(filename: str) -> str:
    name = filename.lower()
    if name in ("makefile", "dockerfile", "license", "readme"):
        return name
    if "." not in name:
        return ""
    return name.rsplit(".", 1)[-1]


def get_icon(filename: str, is_dir: bool = False) -> str:
    if is_dir:
        return FILE_ICONS["__folder__"]
    ext = get_extension(filename)
    return FILE_ICONS.get(ext, FILE_ICONS["__file__"])


def get_file_kind(filename: str) -> str:
    """Возвращает 'image' | 'video' | 'audio' | 'pdf' | 'code' | 'other'"""
    ext = get_extension(filename)
    if ext in IMAGE_EXTENSIONS:
        return "image"
    if ext in VIDEO_EXTENSIONS:
        return "video"
    if ext in AUDIO_EXTENSIONS:
        return "audio"
    if ext in PDF_EXTENSIONS:
        return "pdf"
    if ext in CODE_EXTENSIONS:
        return "code"
    return "other"


def format_size(size: int) -> str:
    if size < 1024:
        return f"{size} B"
    for unit in ["KB", "MB", "GB", "TB"]:
        size /= 1024.0
        if size < 1024:
            return f"{size:.2f} {unit}"
    return f"{size:.2f} PB"


def safe_join(*parts) -> str:
    """
    Безопасно джойнит путь внутри VAULTS_DIR.
    Возвращает абсолютный путь или бросает ValueError при попытке выхода.
    """
    joined = os.path.abspath(os.path.join(VAULTS_DIR, *parts))
    if not (joined == VAULTS_DIR or joined.startswith(VAULTS_DIR + os.sep)):
        raise ValueError("Path escapes vaults directory")
    return joined


def to_rel_path(abs_path: str) -> str:
    """Возвращает путь относительно VAULTS_DIR, с прямыми слешами."""
    rel = os.path.relpath(abs_path, VAULTS_DIR)
    if rel == ".":
        return ""
    return rel.replace(os.sep, "/")


def count_dir_items(path: str) -> tuple:
    """Возвращает (кол-во файлов рекурсивно, суммарный размер)"""
    total_files = 0
    total_size = 0
    try:
        for root, _, files in os.walk(path):
            total_files += len(files)
            for f in files:
                try:
                    total_size += os.path.getsize(os.path.join(root, f))
                except OSError:
                    pass
    except OSError:
        pass
    return total_files, total_size


def list_directory(rel_path: str) -> dict:
    """Возвращает список файлов/папок в директории."""
    abs_path = safe_join(rel_path)
    if not os.path.isdir(abs_path):
        raise FileNotFoundError(rel_path)

    entries = []
    for name in os.listdir(abs_path):
        full = os.path.join(abs_path, name)
        try:
            stat = os.stat(full)
        except OSError:
            continue
        is_dir = os.path.isdir(full)
        item = {
            "name": name,
            "is_dir": is_dir,
            "path": to_rel_path(full),
            "size": stat.st_size if not is_dir else 0,
            "size_human": format_size(stat.st_size) if not is_dir else "",
            "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "modified_ts": stat.st_mtime,
            "icon": get_icon(name, is_dir),
            "ext": get_extension(name) if not is_dir else "",
            "kind": "folder" if is_dir else get_file_kind(name),
        }
        entries.append(item)

    return {
        "path": rel_path,
        "entries": entries,
    }


def list_vaults() -> list:
    """Возвращает список хранилищ (папок в vaults/)."""
    result = []
    if not os.path.isdir(VAULTS_DIR):
        return result
    for name in sorted(os.listdir(VAULTS_DIR)):
        full = os.path.join(VAULTS_DIR, name)
        if not os.path.isdir(full):
            continue
        files_count, total_size = count_dir_items(full)
        result.append({
            "name": name,
            "path": name,
            "files_count": files_count,
            "total_size": total_size,
            "size_human": format_size(total_size) if total_size > 0 else "",
            "is_empty": files_count == 0,
        })
    return result


def search_files(query: str, base_path: str = "") -> list:
    """Ищет файлы по имени (регистронезависимо)."""
    query = query.lower().strip()
    if not query:
        return []
    abs_base = safe_join(base_path)
    results = []
    for root, dirs, files in os.walk(abs_base):
        for name in dirs + files:
            if query in name.lower():
                full = os.path.join(root, name)
                is_dir = os.path.isdir(full)
                try:
                    stat = os.stat(full)
                except OSError:
                    continue
                results.append({
                    "name": name,
                    "is_dir": is_dir,
                    "path": to_rel_path(full),
                    "size": stat.st_size if not is_dir else 0,
                    "size_human": format_size(stat.st_size) if not is_dir else "",
                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "modified_ts": stat.st_mtime,
                    "icon": get_icon(name, is_dir),
                    "ext": get_extension(name) if not is_dir else "",
                    "kind": "folder" if is_dir else get_file_kind(name),
                })
                if len(results) >= 500:
                    return results
    return results


def get_mime(filename: str) -> str:
    mime, _ = mimetypes.guess_type(filename)
    return mime or "application/octet-stream"

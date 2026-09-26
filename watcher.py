import os
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from config import VAULTS_DIR
from utils import to_rel_path


class VaultEventHandler(FileSystemEventHandler):
    def __init__(self, socketio):
        super().__init__()
        self.socketio = socketio

    def _emit(self, event_name: str, src_path: str, is_dir: bool, dest_path: str = None):
        try:
            rel = to_rel_path(src_path)
        except Exception:
            return
        parent = os.path.dirname(rel).replace(os.sep, "/")
        data = {
            "path": rel,
            "parent": parent,
            "is_dir": is_dir,
            "name": os.path.basename(rel),
        }
        if dest_path:
            try:
                data["dest_path"] = to_rel_path(dest_path)
                data["dest_parent"] = os.path.dirname(
                    to_rel_path(dest_path)
                ).replace(os.sep, "/")
            except Exception:
                pass
        self.socketio.emit(event_name, data)
        # Также вещаем в общий канал для главной страницы (обновление хранилищ)
        self.socketio.emit("vaults_changed", {})

    def on_created(self, event):
        self._emit("file_created", event.src_path, event.is_directory)

    def on_deleted(self, event):
        self._emit("file_deleted", event.src_path, event.is_directory)

    def on_modified(self, event):
        if event.is_directory:
            return
        self._emit("file_modified", event.src_path, event.is_directory)

    def on_moved(self, event):
        self._emit(
            "file_moved", event.src_path, event.is_directory, event.dest_path
        )


def start_watcher(socketio):
    os.makedirs(VAULTS_DIR, exist_ok=True)
    observer = Observer()
    observer.schedule(VaultEventHandler(socketio), VAULTS_DIR, recursive=True)
    observer.daemon = True
    thread = threading.Thread(target=observer.start, daemon=True)
    observer.start()
    return observer

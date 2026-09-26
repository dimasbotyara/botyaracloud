import sqlite3
import hashlib
from contextlib import contextmanager
from datetime import datetime
from config import DB_PATH


def init_db():
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS client_settings (
                id TEXT PRIMARY KEY,
                theme TEXT DEFAULT 'catppuccin-mocha',
                accent TEXT DEFAULT 'green',
                language TEXT DEFAULT 'auto',
                ui_font TEXT DEFAULT 'geist',
                filename_font TEXT DEFAULT 'inter',
                view_mode TEXT DEFAULT 'list',
                sort_by TEXT DEFAULT 'name',
                sort_order TEXT DEFAULT 'asc',
                created_at TEXT,
                updated_at TEXT
            );
        """)
        conn.commit()


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def client_fingerprint(ip: str, user_agent: str) -> str:
    raw = f"{ip}::{user_agent}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def get_settings(client_id: str) -> dict:
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM client_settings WHERE id = ?", (client_id,)
        ).fetchone()
        if row:
            return dict(row)
        # Дефолтные настройки + создать запись
        now = datetime.utcnow().isoformat()
        conn.execute(
            """INSERT INTO client_settings 
               (id, created_at, updated_at) VALUES (?, ?, ?)""",
            (client_id, now, now),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM client_settings WHERE id = ?", (client_id,)
        ).fetchone()
        return dict(row)


def update_settings(client_id: str, data: dict) -> dict:
    allowed = {
        "theme", "accent", "language", "ui_font",
        "filename_font", "view_mode", "sort_by", "sort_order"
    }
    updates = {k: v for k, v in data.items() if k in allowed}
    if not updates:
        return get_settings(client_id)

    with get_db() as conn:
        # Убедимся что запись есть
        row = conn.execute(
            "SELECT id FROM client_settings WHERE id = ?", (client_id,)
        ).fetchone()
        now = datetime.utcnow().isoformat()
        if not row:
            conn.execute(
                "INSERT INTO client_settings (id, created_at, updated_at) VALUES (?, ?, ?)",
                (client_id, now, now),
            )
        set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
        values = list(updates.values()) + [now, client_id]
        conn.execute(
            f"UPDATE client_settings SET {set_clause}, updated_at = ? WHERE id = ?",
            values,
        )
        conn.commit()
    return get_settings(client_id)

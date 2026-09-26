import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VAULTS_DIR = os.path.join(BASE_DIR, "vaults")
DB_PATH = os.path.join(BASE_DIR, "botyaracloud.db")
HOST = "0.0.0.0"
PORT = 4440
SECRET_KEY = "botyaracloud-secret-key-change-me"

# Создадим папку vaults если её нет
os.makedirs(VAULTS_DIR, exist_ok=True)

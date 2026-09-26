<div align="center">

# ☁️ botyaracloud

### 🚀 A blazing-fast, fully offline, self-hosted file sharing server built with Flask + Socket.IO

*Think `python -m http.server`, but on steroids — with real-time updates, previews, themes, and a slick file explorer UI.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-5.3-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/dimasbotyara/botyaracloud/pulls)

[✨ Features](#-features) •
[🚀 Quick Start](#-quick-start) •
[📸 Screenshots](#-screenshots) •
[🎨 Themes](#-themes) •
[⚙️ Configuration](#️-configuration) •
[🛠️ Tech Stack](#️-tech-stack)

</div>

---

## 🌟 About

**botyaracloud** is a self-hosted, LAN-friendly file sharing server designed to be **simple, fast, and beautiful**. Just drop files into a folder — everyone on your network sees them appear in real-time, right in their browser. No sign-ups, no accounts, no cloud — just pure local file sharing done right.

Perfect for:
- 🏠 **Home networks** — share media between devices
- 🏢 **Office LANs** — quick file distribution
- 📚 **Classrooms** — teacher shares materials with students
- 🧑‍💻 **Developers** — self-host your own personal drive

---

## ✨ Features

### 📁 File Management
- 🗄️ **Vault-based structure** — organize files into "vaults" (top-level folders)
- 🔄 **Real-time updates** — Watchdog + Socket.IO instantly reflect file system changes
- 🔍 **Fast recursive search** across the current vault
- 🧭 **Full explorer navigation** — back/forward/up, clickable breadcrumbs, browser history
- 📦 **Download folders as ZIP** with a live progress bar
- 🖱️ **Right-click context menu** on desktop
- 📱 **Bottom sheet menu** on mobile (triggered via ⋮ button)

### 👁️ Built-in File Viewer
Preview files right in the browser — no downloads needed!
- 🖼️ **Images** — JPG, PNG, GIF, WebP, AVIF, SVG, BMP, ICO, and more
- 🎬 **Video** — MP4, WebM, MOV, MKV, M4V (native HTML5)
- 🎵 **Audio** — MP3, WAV, OGG, FLAC, M4A, Opus
- 📄 **PDF** — inline preview via iframe
- 💻 **Code & text** — syntax highlighting via **Pygments** for 60+ languages

### 🎨 Beautiful UI
- 🌈 **8 gorgeous themes** with theme-specific accent color palettes
- 🔤 **Switchable fonts** — Geist, Inter, Manrope, Fira Code
- 🎯 **200+ file-type icons** via Symbols Nerd Font
- 📐 **List / Grid view** toggle
- 🔽 **Flexible sorting** — by name, size, date, or type (asc/desc)
- 📱 **Fully responsive** — beautiful on desktop, tablet, and phone

### 🔒 Privacy & Offline-First
- 🌐 **100% offline** — no CDN dependencies, all fonts and JS libraries bundled
- 💾 **Per-client settings** identified by IP + User-Agent fingerprint (no cookies, no accounts)
- 🛡️ **Path traversal protection** — all file access is safely sandboxed to `vaults/`

### 🌍 Internationalization
- 🇷🇺 Russian
- 🇺🇸 English
- 🔄 Auto-detection from browser locale

---

## 🚀 Quick Start

### Prerequisites
- 🐍 Python **3.10+**
- 📦 `pip`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/dimasbotyara/botyaracloud.git
cd botyaracloud

# 2. Create and activate a virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate    # Linux/macOS
# .venv\Scripts\activate     # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the server
python app.py
```

Then open **http://localhost:4440** in your browser! 🎉

To let others on your LAN access it, use your machine's local IP:
```
http://192.168.x.x:4440
```

---

## 📂 How to Share Files

1. Create a folder inside `vaults/` — this becomes a **"vault"**:
   ```
   vaults/
   ├── movies/
   ├── music/
   ├── documents/
   └── projects/
   ```

2. Drop any files or folders inside — they'll appear instantly for everyone connected. ✨

3. Empty vaults are still visible in the UI. Just add files whenever you're ready!

---

## 🎨 Themes

Choose from **8 hand-picked themes**, each with its own curated accent color palette:

| Theme | Style |
|-------|-------|
| 🌙 **Catppuccin Mocha** | Dark & cozy *(default)* |
| 🌌 **Catppuccin Macchiato** | Dark, less contrast |
| 🌆 **Catppuccin Frappé** | Medium-dark |
| ☀️ **Catppuccin Latte** | Light & warm |
| ❄️ **Nord Dark** | Arctic dark |
| 🌨️ **Nord Light** | Arctic light |
| 🧛 **Dracula** | Classic vibrant dark |
| 🍂 **Gruvbox Dark** | Retro warm dark |

Every theme comes with **6 unique accent colors** carefully matched to its palette. Change them anytime in the settings — everything auto-saves per client!

---

## ⚙️ Configuration

Edit `config.py` to customize:

```python
HOST = "0.0.0.0"          # Listen on all interfaces
PORT = 4440               # Change to any port you like
VAULTS_DIR = "vaults"     # Where your shared folders live
SECRET_KEY = "..."        # Change this in production!
```

---

## 🛠️ Tech Stack

### Backend
- 🐍 **Flask 3** — web framework
- ⚡ **Flask-SocketIO** — real-time bidirectional communication
- 👀 **Watchdog** — filesystem monitoring
- 🎨 **Pygments** — syntax highlighting for 500+ languages
- 🗃️ **SQLite** — lightweight per-client settings storage

### Frontend
- 🍦 **Vanilla JavaScript** — no frameworks, no bloat
- 🎭 **CSS Variables** — instant theming
- 🔌 **Socket.IO Client** — live updates
- 🔠 **Nerd Fonts** — beautiful iconography
- 🔤 **Geist, Inter, Manrope, Fira Code** — carefully selected typography

---

## 📁 Project Structure

```
botyaracloud/
├── app.py                  # Main Flask app + routes
├── config.py               # Configuration
├── database.py             # SQLite models
├── utils.py                # Helpers, icons mapping, path safety
├── watcher.py              # Watchdog → Socket.IO bridge
├── requirements.txt
├── vaults/                 # 📂 Drop your shared folders here!
├── static/
│   ├── css/                # Themes, fonts, main styles, responsive
│   ├── js/                 # All client-side logic (modular)
│   │   └── vendor/         # Bundled Socket.IO client
│   └── fonts/              # Bundled fonts (Geist, Inter, Manrope, FiraCode, Symbols)
└── templates/              # Jinja2 templates
    └── components/         # Reusable UI components
```

---

## 🔮 Roadmap

- [ ] 🖼️ Image thumbnails in grid view
- [ ] 🎞️ Video thumbnails (with optional ffmpeg)
- [ ] 🔐 Optional password-protected vaults
- [ ] 📊 Storage usage statistics
- [ ] 🌐 More language translations
- [ ] 📤 Optional upload from browser (currently intentionally disabled)
- [ ] 🎨 Custom user-defined themes

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/dimasbotyara/botyaracloud/issues).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 🙏 Acknowledgments

- 💜 [Catppuccin](https://github.com/catppuccin/catppuccin) — for the gorgeous color palettes
- ❄️ [Nord](https://www.nordtheme.com/) — for the arctic vibes
- 🧛 [Dracula](https://draculatheme.com/) — for the classic dark theme
- 🍂 [Gruvbox](https://github.com/morhetz/gruvbox) — for the retro warmth
- 🔠 [Nerd Fonts](https://www.nerdfonts.com/) — for 10000+ icons
- 🎨 All the font authors: [Geist](https://vercel.com/font), [Inter](https://rsms.me/inter/), [Manrope](https://manropefont.com/), [Fira Code](https://github.com/tonsky/FiraCode)

---

<div align="center">

**Made with ❤️ and lots of ☕ by [dimasbotyara](https://github.com/dimasbotyara)**

⭐ Star this repo if you found it useful!

</div>

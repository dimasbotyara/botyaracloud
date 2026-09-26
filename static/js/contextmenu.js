window.ctxMenu = {
    el: null,
    sheet: null,

    init() {
        this.el = document.getElementById('context-menu');
        this.sheet = document.getElementById('mobile-sheet');

        document.addEventListener('click', (e) => {
            if (!this.el.contains(e.target)) this.hide();
        });
            document.addEventListener('scroll', () => this.hide(), true);
            window.addEventListener('resize', () => this.hide());
            document.querySelectorAll('[data-close="sheet"]').forEach(el => {
                el.addEventListener('click', () => this.hideSheet());
            });
    },

    isTouch() {
        return window.matchMedia('(pointer: coarse)').matches ||
        window.innerWidth <= 600;
    },

    buildActions(item) {
        const actions = [];
        const encPath = encodeURIComponent(item.path).replace(/%2F/g, '/');

        if (item.is_dir) {
            actions.push({
                icon: '\uf07c', label: i18n.t('open'),
                         onClick: () => explorer.navigate(item.path)
            });
            actions.push({
                icon: '\uf1c6', label: i18n.t('download_zip'),
                         onClick: () => downloadZip(item.path)
            });
        } else {
            const kind = item.kind;
            if (['image', 'video', 'audio', 'pdf', 'code'].includes(kind)) {
                actions.push({
                    icon: '\uf06e', label: i18n.t('open'),
                             onClick: () => viewer.open(item)
                });
            }
            actions.push({
                icon: '\uf019', label: i18n.t('download'),
                         onClick: () => { window.location.href = `/api/download/${encPath}`; }
            });
        }
        actions.push({
            icon: '\uf0c1', label: i18n.t('copy_link'),
                     onClick: () => copyLink(item)
        });
        return actions;
    },

    show(item, x, y) {
        if (this.isTouch()) return this.showSheet(item);
        const actions = this.buildActions(item);
        this.el.innerHTML = actions.map((a, i) => `
        <button data-idx="${i}"><span class="nf">${a.icon}</span>${a.label}</button>
        `).join('');
        this.el.classList.remove('hidden');
        // Позиционируем внутри viewport
        const rect = this.el.getBoundingClientRect();
        const vw = window.innerWidth, vh = window.innerHeight;
        const left = Math.min(x, vw - rect.width - 8);
        const top = Math.min(y, vh - rect.height - 8);
        this.el.style.left = left + 'px';
        this.el.style.top = top + 'px';
        this.el.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = +btn.dataset.idx;
                this.hide();
                actions[idx].onClick();
            });
        });
    },

    hide() { this.el.classList.add('hidden'); },

    showSheet(item) {
        const actions = this.buildActions(item);
        document.getElementById('mobile-sheet-title').textContent = item.name;
        const container = document.getElementById('mobile-sheet-actions');
        container.innerHTML = actions.map((a, i) => `
        <button data-idx="${i}"><span class="nf">${a.icon}</span>${a.label}</button>
        `).join('');
        container.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = +btn.dataset.idx;
                this.hideSheet();
                actions[idx].onClick();
            });
        });
        this.sheet.classList.remove('hidden');
    },

    hideSheet() { this.sheet.classList.add('hidden'); }
};

function copyLink(item) {
    const url = location.origin + '/api/download/' +
    encodeURIComponent(item.path).replace(/%2F/g, '/');
    navigator.clipboard.writeText(url).then(() => toast(i18n.t('link_copied')));
}

async function downloadZip(path) {
    const bar = document.getElementById('zip-progress');
    const fill = document.getElementById('zip-progress-fill');
    const stats = document.getElementById('zip-progress-stats');
    const name = document.getElementById('zip-progress-name');
    const basename = path.split('/').pop() || 'vault';
    name.textContent = basename + '.zip';
    bar.classList.remove('hidden');
    fill.style.width = '0%';
    stats.textContent = i18n.t('loading');

    // Получим общий размер
    let totalSize = 0;
    try {
        const meta = await fetch('/api/zip-size/' +
        encodeURIComponent(path).replace(/%2F/g, '/')).then(r => r.json());
        totalSize = meta.size || 0;
        stats.textContent = `0 / ${meta.size_human}`;
    } catch (e) {}

    // Скачиваем с прогрессом
    try {
        const url = '/api/download-zip/' +
        encodeURIComponent(path).replace(/%2F/g, '/');
        const res = await fetch(url);
        const reader = res.body.getReader();
        const chunks = [];
        let received = 0;
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            received += value.length;
            const pct = totalSize
            ? Math.min(99, (received / totalSize) * 100)
            : Math.min(95, (received / 1048576) * 2);
            fill.style.width = pct + '%';
            stats.textContent = totalSize
            ? `${formatBytes(received)} / ${formatBytes(totalSize)}`
            : formatBytes(received);
        }
        fill.style.width = '100%';
        const blob = new Blob(chunks, { type: 'application/zip' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = basename + '.zip';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        toast(i18n.t('zip_ready'));
    } catch (e) {
        console.error(e);
    } finally {
        setTimeout(() => bar.classList.add('hidden'), 1500);
    }
}

function formatBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024**2) return (n/1024).toFixed(1) + ' KB';
    if (n < 1024**3) return (n/1024**2).toFixed(2) + ' MB';
    return (n/1024**3).toFixed(2) + ' GB';
}

function toast(msg) {
    const c = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transition = 'opacity .3s';
        setTimeout(() => el.remove(), 300);
    }, 2500);
}

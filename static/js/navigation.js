window.explorer = {
    currentPath: '',
    entries: [],
    history: [],
    historyIdx: -1,

    init(initialPath) {
        this.currentPath = initialPath || '';
        this.history = [this.currentPath];
        this.historyIdx = 0;

        document.getElementById('btn-back').addEventListener('click', () => this.back());
        document.getElementById('btn-forward').addEventListener('click', () => this.forward());
        document.getElementById('btn-up').addEventListener('click', () => this.up());

        document.getElementById('btn-view-toggle').addEventListener('click', () => {
            const newMode = settings.state.view_mode === 'list' ? 'grid' : 'list';
            settings.save({ view_mode: newMode });
            this.applyViewMode();
        });

        const sortBtn = document.getElementById('btn-sort');
        const sortMenu = document.getElementById('sort-menu');
        sortBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sortMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', () => sortMenu.classList.add('hidden'));
        sortMenu.addEventListener('click', (e) => e.stopPropagation());
        sortMenu.querySelectorAll('button[data-sort]').forEach(btn => {
            btn.addEventListener('click', () => {
                settings.save({ sort_by: btn.dataset.sort });
                this.render();
                this.updateSortUI();
            });
        });
        sortMenu.querySelectorAll('button[data-order]').forEach(btn => {
            btn.addEventListener('click', () => {
                settings.save({ sort_order: btn.dataset.order });
                this.render();
                this.updateSortUI();
            });
        });

        // Socket events
        sock.on('file_created', (d) => this.onFsChange('created', d));
        sock.on('file_deleted', (d) => this.onFsChange('deleted', d));
        sock.on('file_modified', (d) => this.onFsChange('modified', d));
        sock.on('file_moved', (d) => this.onFsChange('moved', d));

        this.load();
        this.applyViewMode();
        this.updateSortUI();
    },

    applyViewMode() {
        const el = document.getElementById('explorer');
        if (!el) return;
        const mode = settings.state.view_mode || 'list';
        el.classList.toggle('view-list', mode === 'list');
        el.classList.toggle('view-grid', mode === 'grid');
        const searchEl = document.getElementById('search-results');
        if (searchEl) {
            searchEl.classList.toggle('view-list', mode === 'list');
            searchEl.classList.toggle('view-grid', mode === 'grid');
        }
        const icon = document.getElementById('view-toggle-icon');
        if (icon) icon.textContent = mode === 'list' ? '\uf00a' : '\uf00b';
    },

    updateSortUI() {
        document.querySelectorAll('#sort-menu button[data-sort]').forEach(b => {
            b.classList.toggle('active', b.dataset.sort === settings.state.sort_by);
        });
        document.querySelectorAll('#sort-menu button[data-order]').forEach(b => {
            b.classList.toggle('active', b.dataset.order === settings.state.sort_order);
        });
    },

    async load() {
        const el = document.getElementById('explorer');
        el.innerHTML = `<div class="loading"><span class="nf spin">&#xf021;</span></div>`;
        try {
            const url = '/api/list/' +
            encodeURIComponent(this.currentPath).replace(/%2F/g, '/');
            const res = await fetch(url);
            if (!res.ok) throw new Error('load failed');
            const data = await res.json();
            this.entries = data.entries;
            this.render();
            this.renderBreadcrumb();
            sock.subscribe(this.currentPath);
        } catch (e) {
            el.innerHTML = `<div class="empty-state">
            <span class="nf">&#xf071;</span>
            <div>Ошибка загрузки</div>
            </div>`;
        }
    },

    sortedEntries() {
        const { sort_by, sort_order } = settings.state;
        const dirs = this.entries.filter(e => e.is_dir);
        const files = this.entries.filter(e => !e.is_dir);
        const cmp = (a, b) => {
            let r = 0;
            if (sort_by === 'name') r = a.name.localeCompare(b.name, undefined, {numeric:true});
            else if (sort_by === 'size') r = a.size - b.size;
            else if (sort_by === 'modified') r = a.modified_ts - b.modified_ts;
            else if (sort_by === 'kind') r = (a.ext || '').localeCompare(b.ext || '');
            return sort_order === 'desc' ? -r : r;
        };
        dirs.sort(cmp); files.sort(cmp);
        return [...dirs, ...files];
    },

    render() {
        const el = document.getElementById('explorer');
        const list = this.sortedEntries();
        if (list.length === 0) {
            el.innerHTML = `<div class="empty-state">
            <span class="nf">&#xf114;</span>
            <div>${i18n.t(this.currentPath === '' ? 'no_vaults' : 'empty_folder')}</div>
            </div>`;
            return;
        }
        el.innerHTML = `<div class="file-list">${list.map(this.renderItem).join('')}</div>`;
        this.bindItems(el);
    },

    renderItem(item) {
        const encPath = encodeURIComponent(item.path).replace(/%2F/g, '/');
        const dateStr = new Date(item.modified).toLocaleString();
        return `
        <div class="file-item ${item.is_dir ? 'dir' : ''}"
        data-path="${escapeAttr(item.path)}"
        data-kind="${item.kind}"
        data-is-dir="${item.is_dir}">
        <div class="file-icon nf" data-kind="${item.kind}" data-ext="${item.ext || ''}">${item.icon}</div>
        <div class="file-name" title="${escapeAttr(item.name)}">${escapeHtml(item.name)}</div>
        <div class="file-size">${item.is_dir ? '' : item.size_human}</div>
        <div class="file-date">${dateStr}</div>
        <div class="file-actions">
        <button class="file-menu-btn" data-menu title="More">&#xf142;</button>
        </div>
        </div>`;
    },

    bindItems(root) {
        root.querySelectorAll('.file-item').forEach(el => {
            const path = el.dataset.path;
            const item = this.entries.find(e => e.path === path);
            if (!item) return;

            el.addEventListener('click', (e) => {
                if (e.target.closest('[data-menu]')) return;
                if (item.is_dir) this.navigate(item.path);
                else if (['image','video','audio','pdf','code'].includes(item.kind)) viewer.open(item);
                else window.location.href = `/api/download/${encodeURIComponent(item.path).replace(/%2F/g, '/')}`;
            });

            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                ctxMenu.show(item, e.clientX, e.clientY);
            });

            const menuBtn = el.querySelector('[data-menu]');
            if (menuBtn) {
                menuBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const rect = menuBtn.getBoundingClientRect();
                    ctxMenu.show(item, rect.left, rect.bottom);
                });
            }
        });
    },

    renderBreadcrumb() {
        const bc = document.getElementById('breadcrumb');
        const parts = this.currentPath ? this.currentPath.split('/') : [];
        let html = `<button class="breadcrumb-item" data-nav=""><span class="nf">&#xeb09;</span>botyaracloud</button>`;
        let acc = '';
        parts.forEach((p, i) => {
            acc = acc ? acc + '/' + p : p;
            html += `<span class="breadcrumb-sep">/</span>`;
            const isLast = i === parts.length - 1;
            html += `<button class="breadcrumb-item ${isLast ? 'current' : ''}" data-nav="${escapeAttr(acc)}">${escapeHtml(p)}</button>`;
        });
        bc.innerHTML = html;
        bc.querySelectorAll('[data-nav]').forEach(b => {
            b.addEventListener('click', () => {
                if (b.classList.contains('current')) return;
                this.navigate(b.dataset.nav);
            });
        });
    },

    navigate(path, pushHistory = true) {
        if (path === this.currentPath) return;
        this.currentPath = path;
        if (pushHistory) {
            this.history = this.history.slice(0, this.historyIdx + 1);
            this.history.push(path);
            this.historyIdx = this.history.length - 1;
        }
        const url = '/browse/' + encodeURIComponent(path).replace(/%2F/g, '/');
        window.history.pushState({ path }, '', url);
        // Спрятать поиск
        document.getElementById('search-input').value = '';
        document.getElementById('search-results').classList.add('hidden');
        document.getElementById('explorer').classList.remove('hidden');
        this.load();
    },

    back() {
        if (this.historyIdx > 0) {
            this.historyIdx--;
            this.currentPath = this.history[this.historyIdx];
            window.history.pushState({ path: this.currentPath }, '',
                                     '/browse/' + encodeURIComponent(this.currentPath).replace(/%2F/g, '/'));
            this.load();
        }
    },

    forward() {
        if (this.historyIdx < this.history.length - 1) {
            this.historyIdx++;
            this.currentPath = this.history[this.historyIdx];
            window.history.pushState({ path: this.currentPath }, '',
                                     '/browse/' + encodeURIComponent(this.currentPath).replace(/%2F/g, '/'));
            this.load();
        }
    },

    up() {
        if (!this.currentPath) return;
        const parts = this.currentPath.split('/');
        parts.pop();
        this.navigate(parts.join('/'));
    },

    onFsChange(type, data) {
        // Обновляем только если событие относится к текущей папке (по parent)
        if (data.parent === this.currentPath ||
            (type === 'moved' && data.dest_parent === this.currentPath)) {
            // Дебаунс перезагрузки
            clearTimeout(this._reloadTimer);
        this._reloadTimer = setTimeout(() => this.load(), 200);
            }
    }
};

// popstate — навигация браузера назад/вперёд
window.addEventListener('popstate', (e) => {
    if (window.PAGE && window.PAGE.type === 'explorer') {
        const path = (e.state && e.state.path) || '';
        explorer.currentPath = path;
        explorer.load();
    }
});

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({
        '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[ch]));
}
function escapeAttr(s) { return escapeHtml(s); }

window.searchModule = {
    timer: null,

    init() {
        const input = document.getElementById('search-input');
        if (!input) return;
        input.addEventListener('input', () => {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => this.perform(input.value), 300);
        });
    },

    async perform(q) {
        const results = document.getElementById('search-results');
        const explorerEl = document.getElementById('explorer');
        if (!q.trim()) {
            results.classList.add('hidden');
            explorerEl.classList.remove('hidden');
            return;
        }
        explorerEl.classList.add('hidden');
        results.classList.remove('hidden');
        results.innerHTML = `<div class="loading"><span class="nf spin">&#xf021;</span></div>`;
        try {
            const url = '/api/search?q=' + encodeURIComponent(q) +
            '&path=' + encodeURIComponent(explorer.currentPath);
            const res = await fetch(url);
            const data = await res.json();
            this.render(data.results, q);
        } catch (e) {
            results.innerHTML = `<div class="empty-state"><span class="nf">&#xf071;</span>Ошибка</div>`;
        }
    },

    render(items, q) {
        const el = document.getElementById('search-results');
        if (!items.length) {
            el.innerHTML = `<div class="empty-state">
            <span class="nf">&#xf002;</span>
            <div>${i18n.t('search_no_results')}</div>
            </div>`;
            return;
        }
        el.innerHTML = `
        <div style="margin-bottom:12px;color:var(--text-muted)">
        ${i18n.t('search_results_for')}: <b>${escapeHtml(q)}</b> (${items.length})
        </div>
        <div class="file-list">${items.map(i => this.renderItem(i)).join('')}</div>`;
        // Переиспользуем bindItems (нужно временно сохранить entries)
        const originalEntries = explorer.entries;
        explorer.entries = items;
        explorer.bindItems(el);
        // Не восстанавливаем entries сразу, потому что клики берут из массива —
        // после клика произойдёт navigate, который перезагрузит entries.
    },

    renderItem(item) {
        const dateStr = new Date(item.modified).toLocaleString();
        return `
        <div class="file-item ${item.is_dir ? 'dir' : ''}"
        data-path="${escapeAttrS(item.path)}"
        data-kind="${item.kind}"
        data-is-dir="${item.is_dir}">
        <div class="file-icon nf" data-kind="${item.kind}" data-ext="${item.ext || ''}">${item.icon}</div>
        <div class="file-name" title="${escapeAttrS(item.path)}">
        ${escapeHtml(item.name)}
        <div class="search-result-path">${escapeHtml(item.path)}</div>
        </div>
        <div class="file-size">${item.is_dir ? '' : item.size_human}</div>
        <div class="file-date">${dateStr}</div>
        <div class="file-actions">
        <button class="file-menu-btn" data-menu>&#xf142;</button>
        </div>
        </div>`;
    }
};

function escapeAttrS(s) {
    return String(s).replace(/[&<>"']/g, ch => ({
        '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[ch]));
}

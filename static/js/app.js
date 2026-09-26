document.addEventListener('DOMContentLoaded', async () => {
    await settings.load();
    settings.bind();
    sock.init();
    ctxMenu.init();
    viewer.init();

    if (window.PAGE.type === 'vaults') {
        loadVaults();
        sock.on('vaults_changed', () => {
            clearTimeout(window._vaultsTimer);
            window._vaultsTimer = setTimeout(loadVaults, 300);
        });
    } else if (window.PAGE.type === 'explorer') {
        explorer.init(window.PAGE.initialPath || '');
        searchModule.init();
    }
});

async function loadVaults() {
    const el = document.getElementById('vaults-list');
    try {
        const res = await fetch('/api/vaults');
        const data = await res.json();
        if (!data.vaults.length) {
            el.innerHTML = `<div class="empty-state">
            <span class="nf">&#xf114;</span>
            <div>${i18n.t('no_vaults')}</div>
            </div>`;
            return;
        }
        el.innerHTML = data.vaults.map(v => `
        <a href="/browse/${encodeURIComponent(v.path)}" class="vault-card">
        <div class="vault-card-header">
        <span class="vault-card-icon nf">&#xeb09;</span>
        <span class="vault-card-name">${escapeHtmlA(v.name)}</span>
        </div>
        <div class="vault-card-meta">
        ${v.is_empty
            ? `<span class="vault-card-empty">${i18n.t('empty_vault')}</span>`
            : `${i18n.filesLabel(v.files_count)} · ${v.size_human}`}
            </div>
            </a>
            `).join('');
    } catch (e) {
        el.innerHTML = `<div class="empty-state"><span class="nf">&#xf071;</span>Error</div>`;
    }
}

function escapeHtmlA(s) {
    return String(s).replace(/[&<>"']/g, ch => ({
        '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[ch]));
}

window.viewer = {
    modal: null,
    body: null,

    init() {
        this.modal = document.getElementById('viewer-modal');
        this.body = document.getElementById('viewer-body');
        document.querySelectorAll('[data-close="viewer"]').forEach(el => {
            el.addEventListener('click', () => this.close());
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.close();
            }
        });
    },

    async open(item) {
        const encPath = encodeURIComponent(item.path).replace(/%2F/g, '/');
        document.getElementById('viewer-name').textContent = item.name;
        const iconEl = document.getElementById('viewer-icon');
        iconEl.textContent = item.icon || '';
        document.getElementById('viewer-download').href = `/api/download/${encPath}`;
        this.body.innerHTML = `<div class="loading"><span class="nf spin">&#xf021;</span></div>`;
        this.modal.classList.remove('hidden');

        const src = `/api/download/${encPath}?inline=1`;

        switch (item.kind) {
            case 'image':
                this.body.innerHTML = `<img src="${src}" alt="${escapeHtml(item.name)}">`;
                break;
            case 'video':
                this.body.innerHTML = `
                <video controls autoplay src="${src}">
                Your browser does not support video playback.
                </video>`;
                break;
            case 'audio':
                this.body.innerHTML = `
                <div style="text-align:center; padding:40px">
                <div class="nf" style="font-size:64px;color:var(--accent);margin-bottom:20px">&#xf1c7;</div>
                <div style="margin-bottom:20px;font-family:var(--font-filename);font-weight:600">
                ${escapeHtml(item.name)}
                </div>
                <audio controls autoplay src="${src}"></audio>
                </div>`;
                break;
            case 'pdf':
                this.body.innerHTML = `<iframe src="${src}"></iframe>`;
                break;
            case 'code':
                try {
                    const res = await fetch(`/api/preview/${encPath}`);
                    const data = await res.json();
                    this.body.innerHTML = `
                    <style>${data.css}</style>
                    <div class="viewer-code-wrap">
                    ${data.truncated ? `<div style="color:var(--danger);margin-bottom:10px">
                        &#xf071; ${i18n.t('truncated_warning')}</div>` : ''}
                        ${data.html}
                        </div>`;
                } catch (e) {
                    this.body.innerHTML = `<div class="viewer-unsupported">
                    <span class="nf">&#xf071;</span>Preview failed</div>`;
                }
                break;
            default:
                this.body.innerHTML = `
                <div class="viewer-unsupported">
                <span class="nf">&#xf071;</span>
                ${i18n.t('unsupported_preview')}
                </div>`;
        }
    },

    close() {
        this.modal.classList.add('hidden');
        this.body.innerHTML = '';
    }
};

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({
        '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[ch]));
}

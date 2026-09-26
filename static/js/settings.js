// Все темы + их акцентные палитры
window.THEMES_DATA = [
    {
        id: 'catppuccin-mocha', name: 'Catppuccin Mocha',
        preview: ['#1e1e2e', '#313244', '#a6e3a1', '#cba6f7'],
        accents: [
            { id: 'green',  color: '#a6e3a1' },
            { id: 'mauve',  color: '#cba6f7' },
            { id: 'blue',   color: '#89b4fa' },
            { id: 'pink',   color: '#f5c2e7' },
            { id: 'peach',  color: '#fab387' },
            { id: 'teal',   color: '#94e2d5' },
        ]
    },
{
    id: 'catppuccin-macchiato', name: 'Catppuccin Macchiato',
    preview: ['#24273a', '#363a4f', '#a6da95', '#b7bdf8'],
    accents: [
        { id: 'lavender', color: '#b7bdf8' },
        { id: 'sapphire', color: '#7dc4e4' },
        { id: 'green',    color: '#a6da95' },
        { id: 'flamingo', color: '#f0c6c6' },
        { id: 'yellow',   color: '#eed49f' },
        { id: 'teal',     color: '#8bd5ca' },
    ]
},
{
    id: 'catppuccin-frappe', name: 'Catppuccin Frappé',
    preview: ['#303446', '#414559', '#81c8be', '#8caaee'],
    accents: [
        { id: 'blue',      color: '#8caaee' },
        { id: 'maroon',    color: '#ea999c' },
        { id: 'teal',      color: '#81c8be' },
        { id: 'pink',      color: '#f4b8e4' },
        { id: 'peach',     color: '#ef9f76' },
        { id: 'rosewater', color: '#f2d5cf' },
    ]
},
{
    id: 'catppuccin-latte', name: 'Catppuccin Latte',
    preview: ['#eff1f5', '#ccd0da', '#40a02b', '#1e66f5'],
    accents: [
        { id: 'lavender', color: '#7287fd' },
        { id: 'blue',     color: '#1e66f5' },
        { id: 'green',    color: '#40a02b' },
        { id: 'mauve',    color: '#8839ef' },
        { id: 'flamingo', color: '#dd7878' },
        { id: 'sapphire', color: '#209fb5' },
    ]
},
{
    id: 'nord-dark', name: 'Nord Dark',
    preview: ['#2e3440', '#3b4252', '#88c0d0', '#a3be8c'],
    accents: [
        { id: 'frost',  color: '#88c0d0' },
        { id: 'green',  color: '#a3be8c' },
        { id: 'purple', color: '#b48ead' },
        { id: 'orange', color: '#d08770' },
        { id: 'red',    color: '#bf616a' },
        { id: 'cyan',   color: '#8fbcbb' },
    ]
},
{
    id: 'nord-light', name: 'Nord Light',
    preview: ['#eceff4', '#d8dee9', '#5e81ac', '#a3be8c'],
    accents: [
        { id: 'frost',  color: '#5e81ac' },
        { id: 'green',  color: '#a3be8c' },
        { id: 'purple', color: '#b48ead' },
        { id: 'yellow', color: '#ebcb8b' },
        { id: 'orange', color: '#d08770' },
        { id: 'teal',   color: '#8fbcbb' },
    ]
},
{
    id: 'dracula', name: 'Dracula',
    preview: ['#282a36', '#44475a', '#bd93f9', '#50fa7b'],
    accents: [
        { id: 'purple', color: '#bd93f9' },
        { id: 'green',  color: '#50fa7b' },
        { id: 'cyan',   color: '#8be9fd' },
        { id: 'pink',   color: '#ff79c6' },
        { id: 'orange', color: '#ffb86c' },
        { id: 'red',    color: '#ff5555' },
    ]
},
{
    id: 'gruvbox-dark', name: 'Gruvbox Dark',
    preview: ['#282828', '#3c3836', '#b8bb26', '#fe8019'],
    accents: [
        { id: 'aqua',   color: '#8ec07c' },
        { id: 'green',  color: '#b8bb26' },
        { id: 'orange', color: '#fe8019' },
        { id: 'yellow', color: '#fabd2f' },
        { id: 'purple', color: '#d3869b' },
        { id: 'red',    color: '#fb4934' },
    ]
},
];

window.settings = {
    state: {
        theme: 'catppuccin-mocha',
        accent: 'green',
        language: 'auto',
        ui_font: 'geist',
        filename_font: 'inter',
        view_mode: 'list',
        sort_by: 'name',
        sort_order: 'asc',
    },

    async load() {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            Object.assign(this.state, data);
        } catch (e) { console.warn('settings load failed', e); }
        this.apply();
    },

    async save(partial) {
        Object.assign(this.state, partial);
        this.apply();
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(partial),
            });
        } catch (e) { console.warn('settings save failed', e); }
    },

    apply() {
        const html = document.documentElement;
        // Проверяем валидность темы+акцента
        const theme = THEMES_DATA.find(t => t.id === this.state.theme) || THEMES_DATA[0];
        let accent = theme.accents.find(a => a.id === this.state.accent);
        if (!accent) {
            accent = theme.accents[0];
            this.state.accent = accent.id;
        }

        html.setAttribute('data-theme', theme.id);
        html.setAttribute('data-accent', accent.id);
        html.setAttribute('data-ui-font', this.state.ui_font);
        html.setAttribute('data-filename-font', this.state.filename_font);

        i18n.setLang(this.state.language);

        // Синхронизируем UI настроек и вида
        this.syncUI();
        if (window.explorer && typeof window.explorer.applyViewMode === 'function') {
            window.explorer.applyViewMode();
        }
    },

    syncUI() {
        // Segmented buttons
        document.querySelectorAll('.segmented').forEach(seg => {
            const key = seg.dataset.setting;
            seg.querySelectorAll('button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.value === this.state[key]);
            });
        });

        // Theme grid
        const themeGrid = document.getElementById('theme-grid');
        if (themeGrid && !themeGrid.dataset.rendered) {
            themeGrid.innerHTML = THEMES_DATA.map(t => `
            <div class="theme-card" data-theme="${t.id}">
            <div class="theme-card-preview">
            ${t.preview.map(c => `<span style="background:${c}"></span>`).join('')}
            </div>
            <div class="theme-card-name">${t.name}</div>
            </div>
            `).join('');
            themeGrid.dataset.rendered = '1';
            themeGrid.addEventListener('click', e => {
                const card = e.target.closest('.theme-card');
                if (!card) return;
                const newTheme = card.dataset.theme;
                const themeData = THEMES_DATA.find(t => t.id === newTheme);
                this.save({ theme: newTheme, accent: themeData.accents[0].id });
            });
        }
        document.querySelectorAll('.theme-card').forEach(c => {
            c.classList.toggle('active', c.dataset.theme === this.state.theme);
        });

        // Accent grid (пересобираем в зависимости от выбранной темы)
        const accentGrid = document.getElementById('accent-grid');
        if (accentGrid) {
            const theme = THEMES_DATA.find(t => t.id === this.state.theme) || THEMES_DATA[0];
            accentGrid.innerHTML = theme.accents.map(a => `
            <div class="accent-swatch ${a.id === this.state.accent ? 'active' : ''}"
            data-accent="${a.id}"
            style="background:${a.color}"
            title="${a.id}"></div>
            `).join('');
        }
    },

    bind() {
        // Открытие модалки
        document.getElementById('btn-settings').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.remove('hidden');
            this.syncUI();
        });
        document.querySelectorAll('[data-close="settings"]').forEach(el => {
            el.addEventListener('click', () => {
                document.getElementById('settings-modal').classList.add('hidden');
            });
        });

        // Segmented
        document.querySelectorAll('.segmented').forEach(seg => {
            seg.addEventListener('click', e => {
                const btn = e.target.closest('button[data-value]');
                if (!btn) return;
                const key = seg.dataset.setting;
                this.save({ [key]: btn.dataset.value });
            });
        });

        // Accent
        document.addEventListener('click', e => {
            const sw = e.target.closest('.accent-swatch');
            if (!sw) return;
            this.save({ accent: sw.dataset.accent });
        });
    }
};

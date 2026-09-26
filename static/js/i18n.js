window.I18N = {
    ru: {
        vaults_title: "Хранилища",
        vaults_subtitle: "Выберите хранилище для просмотра файлов",
        settings_title: "Настройки",
        settings_language: "Язык",
        settings_theme: "Тема",
        settings_accent: "Акцентный цвет",
        settings_ui_font: "Шрифт интерфейса",
        settings_filename_font: "Шрифт названий файлов",
        lang_auto: "Авто",
        search_placeholder: "Поиск...",
        empty_folder: "Папка пуста",
        empty_vault: "Хранилище пусто",
        no_vaults: "Хранилищ пока нет. Создайте папку внутри vaults/",
        files_count: "файлов",
        file_count_1: "файл",
        file_count_2: "файла",
        file_count_5: "файлов",
        open: "Открыть",
        download: "Скачать",
        download_zip: "Скачать как ZIP",
        copy_link: "Копировать ссылку",
        file_info: "Информация",
        zipping: "Упаковка",
        zip_ready: "Архив готов, начинается загрузка",
        link_copied: "Ссылка скопирована",
        sort_name: "Имя",
        sort_size: "Размер",
        sort_date: "Дата",
        sort_type: "Тип",
        sort_asc: "По возрастанию",
        sort_desc: "По убыванию",
        view_list: "Список",
        view_grid: "Плитка",
        search_no_results: "Ничего не найдено",
        search_results_for: "Результаты для",
        loading: "Загрузка...",
        unsupported_preview: "Просмотр этого файла не поддерживается",
        truncated_warning: "Файл слишком большой, показана только часть",
    },
    en: {
        vaults_title: "Vaults",
        vaults_subtitle: "Choose a vault to browse files",
        settings_title: "Settings",
        settings_language: "Language",
        settings_theme: "Theme",
        settings_accent: "Accent color",
        settings_ui_font: "UI font",
        settings_filename_font: "Filename font",
        lang_auto: "Auto",
        search_placeholder: "Search...",
        empty_folder: "Folder is empty",
        empty_vault: "Vault is empty",
        no_vaults: "No vaults yet. Create a folder inside vaults/",
        files_count: "files",
        file_count_1: "file",
        file_count_2: "files",
        file_count_5: "files",
        open: "Open",
        download: "Download",
        download_zip: "Download as ZIP",
        copy_link: "Copy link",
        file_info: "Info",
        zipping: "Packing",
        zip_ready: "Archive ready, downloading",
        link_copied: "Link copied",
        sort_name: "Name",
        sort_size: "Size",
        sort_date: "Date",
        sort_type: "Type",
        sort_asc: "Ascending",
        sort_desc: "Descending",
        view_list: "List",
        view_grid: "Grid",
        search_no_results: "Nothing found",
        search_results_for: "Results for",
        loading: "Loading...",
        unsupported_preview: "Preview not supported",
        truncated_warning: "File is too large, showing partial content",
    }
};

window.i18n = {
    current: 'en',

    setLang(lang) {
        if (lang === 'auto') {
            const nav = (navigator.language || 'en').toLowerCase();
            this.current = nav.startsWith('ru') ? 'ru' : 'en';
        } else {
            this.current = lang;
        }
        document.documentElement.setAttribute('lang', this.current);
        this.applyAll();
    },

    t(key) {
        return (I18N[this.current] && I18N[this.current][key]) || key;
    },

    applyAll() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = this.t(el.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = this.t(el.dataset.i18nPlaceholder);
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = this.t(el.dataset.i18nTitle);
        });
    },

    pluralRu(n) {
        const mod10 = n % 10, mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11) return 'file_count_1';
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'file_count_2';
        return 'file_count_5';
    },

    filesLabel(n) {
        if (this.current === 'ru') return `${n} ${this.t(this.pluralRu(n))}`;
        return `${n} ${n === 1 ? this.t('file_count_1') : this.t('file_count_2')}`;
    }
};

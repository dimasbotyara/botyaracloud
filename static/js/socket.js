window.sock = {
    io: null,
    currentPath: null,
    listeners: {},

    init() {
        if (typeof io === 'undefined') {
            // socket.io не загрузился — работаем без реалтайма
            console.warn('Socket.IO not available');
            return;
        }
        this.io = io();
        ['file_created', 'file_deleted', 'file_modified', 'file_moved', 'vaults_changed']
        .forEach(evt => {
            this.io.on(evt, (data) => this.emit(evt, data));
        });
    },

    subscribe(path) {
        if (!this.io) return;
        if (this.currentPath !== null) {
            this.io.emit('unsubscribe_path', { path: this.currentPath });
        }
        this.currentPath = path;
        this.io.emit('subscribe_path', { path });
    },

    on(evt, cb) {
        if (!this.listeners[evt]) this.listeners[evt] = [];
        this.listeners[evt].push(cb);
    },

    emit(evt, data) {
        (this.listeners[evt] || []).forEach(cb => {
            try { cb(data); } catch (e) { console.error(e); }
        });
    }
};

/* ==========================================================================
   MyStation Admin - CORE (js/app.js) - Added toLocalISOString
   ========================================================================== */
'use strict';

const App = {
    state: { data: { priceHistory: [], competitorPrices: [], registryEntries: [], previousYearStock: {}, clients: [], stazioni: [], turni: [], spese: [], speseEtichette: [], todos: [], appuntamenti: [], fuelOrders: [] } },
    modules: {},
    modal: null,

    init() {
        this.initTheme();
        this.loadFromStorage();
        this.modal = new Modal(document.getElementById('generic-modal'));
        this.setupGlobalListeners();
        this.setupNavigation();
        document.dispatchEvent(new CustomEvent('app:ready'));
        this.handleRoute();
        if (localStorage.getItem('sidebar-collapsed') === 'true') this.setSidebarCompact(true);
    },

    initTheme() {
        if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    registerModule(name, module) {
        this.modules[name] = module;
        if (typeof module.init === 'function') module.init();
    },

    loadFromStorage() {
        const saved = localStorage.getItem('mystation_data_v11');
        if (saved) {
            try { 
                this.state.data = Object.assign({}, this.state.data, JSON.parse(saved));
                ['todos', 'appuntamenti', 'fuelOrders'].forEach(key => { if (!this.state.data[key]) this.state.data[key] = []; });
            } catch (e) { console.error(e); }
        }
    },
    saveToStorage() { localStorage.setItem('mystation_data_v11', JSON.stringify(this.state.data)); },
    clearData() { localStorage.removeItem('mystation_data_v11'); window.location.reload(); },

    setupNavigation() { window.addEventListener('hashchange', () => this.handleRoute()); },
    handleRoute() {
        const hash = window.location.hash.substring(1) || 'home';
        document.querySelectorAll('main section').forEach(el => el.classList.add('hidden-section'));
        document.querySelectorAll('#sidebar-nav a, #link-impostazioni').forEach(link => {
            link.classList.remove('bg-gray-100', 'dark:bg-gray-700');
            if (link.getAttribute('href') === `#${hash}`) link.classList.add('bg-gray-100', 'dark:bg-gray-700');
        });
        const activeSection = document.getElementById(hash);
        if (activeSection) {
            activeSection.classList.remove('hidden-section');
            if (this.modules[hash] && typeof this.modules[hash].render === 'function') this.modules[hash].render();
        }
        if(window.innerWidth < 1024 && typeof initFlowbite !== 'undefined') {
             const d = initFlowbite.Drawer?.getInstance(document.getElementById('application-sidebar'));
             if(d) d.hide();
        }
    },

    formatCurrency(val) { return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0); },
    formatPrice(val) { return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(val || 0); },
    formatNumber(val, minDec=0, maxDec=0) { return new Intl.NumberFormat('it-IT', { minimumFractionDigits: minDec, maximumFractionDigits: maxDec }).format(val || 0); },
    formatInt(val) { return this.formatNumber(val, 0, 0); },
    formatDate(isoString) { if (!isoString) return '-'; return new Date(isoString).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }); },
    
    // NUOVA FUNZIONE PER DATE LOCALI CORRETTE
    toLocalISOString(date) {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    },

    generateId(prefix = 'id') { return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`; },

    showModal(title, bodyHTML, footerHTML = '', size = 'max-w-2xl') {
        document.getElementById('generic-modal-title').textContent = title;
        document.getElementById('generic-modal-body').innerHTML = bodyHTML;
        const footer = document.getElementById('generic-modal-footer');
        if (footerHTML) { footer.innerHTML = footerHTML; footer.classList.remove('hidden'); } else { footer.classList.add('hidden'); }
        const modalDialog = document.querySelector('#generic-modal > div');
        if (modalDialog) {
            modalDialog.classList.remove('max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl', 'max-w-4xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl', 'max-w-full');
            modalDialog.classList.add(size);
        }
        this.modal.show();
        lucide.createIcons();
    },
    closeModal() { this.modal.hide(); },

    setSidebarCompact(isCompact) {
        const sidebar = document.getElementById('application-sidebar');
        const main = document.querySelector('main');
        const icon = document.getElementById('collapse-icon');
        const header = document.getElementById('sidebar-header');
        if (isCompact) {
            sidebar.classList.replace('w-64', 'w-16'); main.classList.replace('lg:ml-64', 'lg:ml-16');
            header.classList.replace('px-6', 'px-2'); header.classList.add('justify-center');
            document.querySelectorAll('.sidebar-text').forEach(el => el.classList.add('hidden'));
            if(icon) icon.setAttribute('data-lucide', 'panel-left-open');
        } else {
            sidebar.classList.replace('w-16', 'w-64'); main.classList.replace('lg:ml-16', 'lg:ml-64');
            header.classList.replace('px-2', 'px-6'); header.classList.remove('justify-center');
            document.querySelectorAll('.sidebar-text').forEach(el => el.classList.remove('hidden'));
            if(icon) icon.setAttribute('data-lucide', 'panel-left-close');
        }
        localStorage.setItem('sidebar-collapsed', isCompact);
        lucide.createIcons();
    },

    setupGlobalListeners() {
        const darkIcon = document.getElementById('theme-toggle-dark-icon');
        const lightIcon = document.getElementById('theme-toggle-light-icon');
        if (document.documentElement.classList.contains('dark')) { lightIcon.classList.remove('hidden'); } else { darkIcon.classList.remove('hidden'); }
        document.getElementById('theme-toggle').addEventListener('click', () => {
            darkIcon.classList.toggle('hidden'); lightIcon.classList.toggle('hidden');
            if (localStorage.getItem('color-theme')) {
                if (localStorage.getItem('color-theme') === 'light') { document.documentElement.classList.add('dark'); localStorage.setItem('color-theme', 'dark'); }
                else { document.documentElement.classList.remove('dark'); localStorage.setItem('color-theme', 'light'); }
            } else {
                if (document.documentElement.classList.contains('dark')) { document.documentElement.classList.remove('dark'); localStorage.setItem('color-theme', 'light'); }
                else { document.documentElement.classList.add('dark'); localStorage.setItem('color-theme', 'dark'); }
            }
        });
        document.getElementById('sidebar-collapse-toggle')?.addEventListener('click', () => { this.setSidebarCompact(!document.getElementById('application-sidebar').classList.contains('w-16')); });
        document.getElementById('fullscreen-toggle')?.addEventListener('click', () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e=>console.log(e)); else if (document.exitFullscreen) document.exitFullscreen(); });
        document.getElementById('btn-sidebar-mobile')?.addEventListener('click', () => { document.getElementById('application-sidebar').classList.toggle('-translate-x-full'); });
        document.addEventListener('click', (e) => {
            if (e.target.closest('#btn-backup-export')) this.exportData();
            if (e.target.closest('#btn-backup-import')) document.getElementById('import-file-input').click();
        });
        document.getElementById('import-file-input')?.addEventListener('change', (e) => this.importData(e));
    },
    exportData() { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(this.state.data, null, 2)], { type: 'application/json' })); a.download = `mystation_backup_${new Date().toISOString().slice(0,10)}.json`; a.click(); },
    importData(e) { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => { try { const d = JSON.parse(ev.target.result); if (d) { this.state.data = d; this.saveToStorage(); alert('Backup importato!'); window.location.reload(); } else alert('File non valido.'); } catch (err) { alert('Errore lettura file.'); } }; r.readAsText(f); }
};
document.addEventListener('DOMContentLoaded', () => App.init());
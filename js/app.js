/* ==========================================================================
   MyStation Admin - CORE (js/app.js) - Added global showToast
   ========================================================================== */
'use strict';

const App = {
    state: { data: { priceHistory: [], competitorPrices: [], registryEntries: [], previousYearStock: {}, clients: [], stazioni: [], turni: [], spese: [], speseEtichette: [], todos: [], appuntamenti: [], fuelOrders: [] } },
    modules: {},
    modal: null,
    toastTimeout: null, // Timer per gestire la chiusura automatica del toast

    init() {
        this.loadTheme(); // MODIFICATO
        this.loadFromStorage();
        this.modal = new Modal(document.getElementById('generic-modal'));
        this.setupGlobalListeners();
        this.setupNavigation();
        document.dispatchEvent(new CustomEvent('app:ready'));
        this.handleRoute();
        if (localStorage.getItem('sidebar-collapsed') === 'true') this.setSidebarCompact(true);
    },

    // --- MODIFICA TEMA ---
    
    /**
     * Carica il tema salvato dal localStorage all'avvio dell'app.
     * Imposta 'light' come default se nessun tema valido è salvato.
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('color-theme');
        // AGGIUNTO 'notte'
        if (savedTheme === 'dark' || savedTheme === 'lavanda' || savedTheme === 'cielo' || savedTheme === 'rose' || savedTheme === 'classico' || savedTheme === 'notte') {
            this.setTheme(savedTheme);
        } else {
            this.setTheme('light'); // Imposta 'light' come default
        }
    },

    /**
     * Applica un tema specifico all'applicazione.
     * @param {string} theme - Il nome del tema da applicare.
     */
    setTheme(theme) {
        const html = document.documentElement;
        
        // 1. Rimuovere TUTTE le classi di tema per evitare conflitti
        html.classList.remove('dark', 'windows-dark', 'corporate', 'cielo', 'rose', 'lavanda', 'classico', 'notte');
        
        // 2. Aggiungere le classi corrette
        if (theme === 'dark') {
            html.classList.add('dark');
        } else if (theme === 'lavanda') { 
            html.classList.add('dark', 'lavanda'); 
        } else if (theme === 'notte') { // AGGIUNTO
            html.classList.add('dark', 'notte'); 
        } else if (theme === 'cielo') {
            html.classList.add('cielo'); 
        } else if (theme === 'rose') {
            html.classList.add('rose');
        } else if (theme === 'classico') {
            html.classList.add('classico');
        }
        // Per il tema 'light' (default), non aggiungiamo nessuna classe.
        
        // 3. Salvare la scelta in localStorage
        localStorage.setItem('color-theme', theme);
        
        // 4. Aggiorna l'UI del selettore nelle impostazioni (se il modulo è caricato)
        if (this.modules.impostazioni && typeof this.modules.impostazioni.updateThemeUI === 'function') {
            this.modules.impostazioni.updateThemeUI(theme);
        }
    },
    // --- FINE MODIFICA TEMA ---

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
            link.style.backgroundColor = '';
            link.style.color = '';
            link.querySelectorAll('[data-lucide]').forEach(icon => icon.style.color = '');

            if (link.getAttribute('href') === `#${hash}`) {
                link.classList.add('bg-gray-100', 'dark:bg-gray-700');
            }
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

    showToast(message, type = 'success') {
        const toast = document.getElementById('global-toast');
        const iconContainer = document.getElementById('toast-icon-container');
        const icon = document.getElementById('toast-icon');
        const msgEl = document.getElementById('toast-message');

        if (!toast || !iconContainer || !icon || !msgEl) return;

        clearTimeout(this.toastTimeout);

        msgEl.textContent = message;
        toast.classList.remove('hidden');

        if (type === 'success') {
            iconContainer.className = 'inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200';
            icon.setAttribute('data-lucide', 'check');
        } else if (type === 'error') {
            iconContainer.className = 'inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200';
            icon.setAttribute('data-lucide', 'x');
        } else {
            iconContainer.className = 'inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg dark:bg-blue-800 dark:text-blue-200';
            icon.setAttribute('data-lucide', 'info');
        }
        lucide.createIcons();

        this.toastTimeout = setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    },

    setSidebarCompact(isCompact) {
        const sidebar = document.getElementById('application-sidebar');
        const main = document.querySelector('main');
        const icon = document.getElementById('collapse-icon');
        const header = document.getElementById('sidebar-header');
        if (isCompact) {
            sidebar.classList.replace('w-60', 'w-16'); 
            main.classList.replace('lg:ml-60', 'lg:ml-16'); 
            header.classList.replace('px-6', 'px-2'); 
            header.classList.add('justify-center');
            document.querySelectorAll('.sidebar-text').forEach(el => el.classList.add('hidden'));
            if(icon) icon.setAttribute('data-lucide', 'panel-left-open');
        } else {
            sidebar.classList.replace('w-16', 'w-60'); 
            main.classList.replace('lg:ml-16', 'lg:ml-60'); 
            header.classList.replace('px-2', 'px-6'); 
            header.classList.remove('justify-center');
            document.querySelectorAll('.sidebar-text').forEach(el => el.classList.remove('hidden'));
            if(icon) icon.setAttribute('data-lucide', 'panel-left-close');
        }
        localStorage.setItem('sidebar-collapsed', isCompact);
        lucide.createIcons();
    },

    setupGlobalListeners() {
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
    importData(e) { 
        const f = e.target.files[0]; 
        if (!f) return; 
        const r = new FileReader(); 
        r.onload = (ev) => { 
            try { 
                const d = JSON.parse(ev.target.result); 
                if (d) { 
                    this.state.data = d; 
                    this.saveToStorage(); 
                    this.showToast('Backup importato con successo!', 'success');
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    this.showToast('File di backup non valido.', 'error');
                }
            } catch (err) { 
                this.showToast('Errore durante la lettura del file.', 'error');
            } 
        }; 
        r.readAsText(f); 
    }
};
document.addEventListener('DOMContentLoaded', () => App.init());
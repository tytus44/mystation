/* ==========================================================================
   MyStation Admin - CORE (js/app.js) - Added global showToast
   ========================================================================== */
'use strict';

const App = {
    state: { 
        data: { priceHistory: [], competitorPrices: [], registryEntries: [], previousYearStock: {}, clients: [], stazioni: [], turni: [], spese: [], speseEtichette: [], todos: [], appuntamenti: [], fuelOrders: [] },
        pin: null // Aggiunto stato per il PIN
    },
    modules: {},
    modal: null,
    toastTimeout: null, // Timer per gestire la chiusura automatica del toast

    init() {
        this.loadTheme();
        this.loadFromStorage(); // Questo ora carica anche il PIN

        const sessionActive = sessionStorage.getItem('mystation_session') === 'active';

        if (sessionActive || !this.state.pin) {
            // Se la sessione è già attiva o non c'è un PIN impostato, avvia l'app
            this.initApp();
        } else {
            // Altrimenti, mostra la schermata di blocco
            this.showLockScreen();
        }
    },

    /**
     * Inizializza l'app principale (dopo lo sblocco o se non c'è PIN)
     */
    initApp() {
        this.modal = new Modal(document.getElementById('generic-modal'));
        this.setupGlobalListeners();
        this.setupNavigation();
        document.dispatchEvent(new CustomEvent('app:ready'));
        this.handleRoute();
        if (localStorage.getItem('sidebar-collapsed') === 'true') this.setSidebarCompact(true);
        
        // Nasconde la lockscreen se fosse ancora visibile (caso: primo avvio senza PIN)
        const lockscreen = document.getElementById('pin-lockscreen');
        if (lockscreen) {
            lockscreen.style.display = 'none';
        }
    },

    // --- LOGICA DI BLOCCO PIN ---

    /**
     * Mostra la schermata di blocco e imposta i listener
     */
    showLockScreen() {
        const lockscreen = document.getElementById('pin-lockscreen');
        if (lockscreen) {
            lockscreen.style.display = 'flex';
        }
        
        const pinInput = document.getElementById('pin-input');
        const unlockBtn = document.getElementById('pin-unlock-btn');

        // Imposta il focus sull'input
        setTimeout(() => pinInput.focus(), 100);

        // Aggiunge i listener per il click e per il tasto Invio
        unlockBtn.onclick = () => this.checkPin();
        pinInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                this.checkPin();
            }
        };
    },

    /**
     * Controlla il PIN inserito
     */
    checkPin() {
        const pinInput = document.getElementById('pin-input');
        const pinError = document.getElementById('pin-error-msg');
        const pinModal = document.getElementById('pin-modal-content');
        
        if (pinInput.value === this.state.pin) {
            this.unlockApp();
        } else {
            // Mostra errore e "scuote" il modal
            pinError.style.display = 'block';
            pinModal.classList.add('animate-shake');
            pinInput.value = ''; // Pulisce l'input errato
            
            // Rimuove l'animazione dopo che è terminata
            setTimeout(() => {
                pinModal.classList.remove('animate-shake');
            }, 300);
        }
    },

    /**
     * Sblocca l'app, salva la sessione e avvia l'interfaccia
     */
    unlockApp() {
        // Salva in sessionStorage per mantenere lo sblocco durante i refresh
        sessionStorage.setItem('mystation_session', 'active');
        
        const lockscreen = document.getElementById('pin-lockscreen');
        if (lockscreen) {
            lockscreen.style.display = 'none';
        }
        
        // Pulisce il modal
        document.getElementById('pin-input').value = '';
        document.getElementById('pin-error-msg').style.display = 'none';
        
        // Avvia l'app
        this.initApp();
    },

    /**
     * Blocca l'app (funzione "Esci")
     */
    lockApp() {
        sessionStorage.removeItem('mystation_session');
        window.location.reload();
    },

    /**
     * Imposta o rimuove un nuovo PIN
     * @param {string} newPin - Il nuovo PIN da salvare
     */
    setPin(newPin) {
        if (newPin) {
            localStorage.setItem('mystation_pin', newPin);
            this.state.pin = newPin;
            App.showToast('Nuovo PIN impostato!', 'success');
        } else {
            // Se il pin è vuoto, lo rimuove
            localStorage.removeItem('mystation_pin');
            this.state.pin = null;
            App.showToast('PIN rimosso. L\'app non è più protetta.', 'success');
        }
    },

    // --- FINE LOGICA PIN ---

    loadTheme() {
        const savedTheme = localStorage.getItem('color-theme');
        const validThemes = ['dark', 'notte', 'indigo', 'pink', 'cyan', 'yellow'];
        if (validThemes.includes(savedTheme)) {
            this.setTheme(savedTheme);
        } else {
            this.setTheme('light'); 
        }
    },

    setTheme(theme) {
        const html = document.documentElement;
        html.classList.remove('dark', 'corporate', 'cielo', 'rose', 'greydark', 'indigo', 'pink', 'green', 'cyan', 'yellow', 'notte');
        
        if (theme === 'dark') {
            html.classList.add('dark');
        } else if (theme === 'notte') {
            html.classList.add('dark', 'notte'); 
        } else if (theme === 'indigo') {
            html.classList.add('indigo');
        } else if (theme === 'pink') {
            html.classList.add('pink');
        } else if (theme === 'cyan') {
            html.classList.add('cyan');
        } else if (theme === 'yellow') {
            html.classList.add('yellow');
        }
        
        localStorage.setItem('color-theme', theme);
        
        if (this.modules.impostazioni && typeof this.modules.impostazioni.updateThemeUI === 'function') {
            this.modules.impostazioni.updateThemeUI(theme);
        }
    },

    registerModule(name, module) {
        this.modules[name] = module;
        if (typeof module.init === 'function') module.init();
    },

    loadFromStorage() {
        // Carica i dati dell'app
        const saved = localStorage.getItem('mystation_data_v11');
        if (saved) {
            try { 
                this.state.data = Object.assign({}, this.state.data, JSON.parse(saved));
                ['todos', 'appuntamenti', 'fuelOrders'].forEach(key => { if (!this.state.data[key]) this.state.data[key] = []; });
            } catch (e) { console.error(e); }
        }
        // Carica il PIN salvato
        this.state.pin = localStorage.getItem('mystation_pin') || null;
    },
    saveToStorage() { localStorage.setItem('mystation_data_v11', JSON.stringify(this.state.data)); },
    clearData() { 
        localStorage.removeItem('mystation_data_v11'); 
        // Non rimuoviamo il PIN, solo i dati
        window.location.reload(); 
    },

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
/* ==========================================================================
   MyStation Admin - CORE (js/app.js) - Fix Colore Dinamico Sidebar
   ========================================================================== */
'use strict';

const App = {
    state: { 
        data: { priceHistory: [], competitorPrices: [], registryEntries: [], previousYearStock: {}, clients: [], stazioni: [], turni: [], spese: [], speseEtichette: [], todos: [], appuntamenti: [], fuelOrders: [] },
        pin: null 
    },
    modules: {},
    modal: null,
    toastTimeout: null, 

    init() {
        this.loadTheme();
        this.loadFromStorage(); 

        const sessionActive = sessionStorage.getItem('mystation_session') === 'active';

        if (sessionActive || !this.state.pin) {
            this.initApp();
        } else {
            this.showLockScreen();
        }
    },

    initApp() {
        this.modal = new Modal(document.getElementById('generic-modal'));
        this.setupGlobalListeners();
        this.setupNavigation();
        document.dispatchEvent(new CustomEvent('app:ready'));
        this.handleRoute();
        if (localStorage.getItem('sidebar-collapsed') === 'true') this.setSidebarCompact(true);
        
        const lockscreen = document.getElementById('pin-lockscreen');
        if (lockscreen) {
            lockscreen.style.display = 'none';
        }
    },

    // --- LOGICA PIN ---
    showLockScreen() {
        const lockscreen = document.getElementById('pin-lockscreen');
        if (lockscreen) lockscreen.style.display = 'flex';
        
        const inputs = document.querySelectorAll('.pin-square');
        const unlockBtn = document.getElementById('pin-unlock-btn');
        setTimeout(() => inputs[0].focus(), 100);

        inputs.forEach((input, index) => {
            input.oninput = () => { input.value = input.value.replace(/[^0-9]/g, ''); };
            input.onkeydown = (e) => {
                if (e.key >= '0' && e.key <= '9' && input.value.length === 0) {
                    e.preventDefault(); input.value = e.key;
                    if (index < inputs.length - 1) inputs[index + 1].focus();
                } else if (e.key === 'Backspace') {
                    e.preventDefault(); input.value = '';
                    if (index > 0) inputs[index - 1].focus();
                } else if (e.key === 'Enter' && index === inputs.length - 1) {
                    this.checkPin();
                } else if (e.key.includes('Arrow')) {
                    e.preventDefault();
                    if (e.key === 'ArrowRight' && index < inputs.length - 1) inputs[index + 1].focus();
                    else if (e.key === 'ArrowLeft' && index > 0) inputs[index - 1].focus();
                } else if (e.key.length === 1) e.preventDefault();
            };
        });
        unlockBtn.onclick = () => this.checkPin();
    },
    checkPin() {
        const inputs = document.querySelectorAll('.pin-square');
        let code = ''; inputs.forEach(input => code += input.value);
        if (code === this.state.pin) this.unlockApp();
        else {
            document.getElementById('pin-error-msg').style.display = 'block';
            document.getElementById('pin-modal-content').classList.add('animate-shake');
            inputs.forEach(input => input.value = ''); inputs[0].focus();
            setTimeout(() => document.getElementById('pin-modal-content').classList.remove('animate-shake'), 300);
        }
    },
    unlockApp() {
        sessionStorage.setItem('mystation_session', 'active');
        document.getElementById('pin-lockscreen').style.display = 'none';
        document.querySelectorAll('.pin-square').forEach(input => input.value = '');
        document.getElementById('pin-error-msg').style.display = 'none';
        this.initApp();
    },
    lockApp() { sessionStorage.removeItem('mystation_session'); window.location.reload(); },
    setPin(newPin) {
        if (newPin) { localStorage.setItem('mystation_pin', newPin); this.state.pin = newPin; App.showToast('Nuovo PIN impostato!', 'success'); } 
        else { localStorage.removeItem('mystation_pin'); this.state.pin = null; App.showToast('PIN rimosso.', 'success'); }
    },
    // --- FINE PIN ---

    loadTheme() {
        const savedTheme = localStorage.getItem('color-theme');
        const validThemes = ['dark', 'notte', 'indigo', 'pink', 'cyan', 'yellow'];
        if (validThemes.includes(savedTheme)) this.setTheme(savedTheme); else this.setTheme('light'); 
    },
    
    setTheme(theme) {
        const html = document.documentElement;
        html.classList.remove('dark', 'notte', 'indigo', 'pink', 'cyan', 'yellow');
        
        if (theme === 'dark') html.classList.add('dark');
        else if (theme === 'notte') html.classList.add('dark', 'notte'); 
        else if (theme !== 'light') html.classList.add(theme);
        
        localStorage.setItem('color-theme', theme);
        
        if (this.modules.impostazioni && typeof this.modules.impostazioni.updateThemeUI === 'function') {
            this.modules.impostazioni.updateThemeUI(theme);
        }

        // IMPORTANTE: Aggiorna subito la sidebar per riflettere il nuovo colore attivo
        this.handleRoute();
    },

    registerModule(name, module) { this.modules[name] = module; if (typeof module.init === 'function') module.init(); },
    loadFromStorage() {
        const saved = localStorage.getItem('mystation_data_v11');
        if (saved) try { this.state.data = Object.assign({}, this.state.data, JSON.parse(saved)); } catch (e) { console.error(e); }
        this.state.pin = localStorage.getItem('mystation_pin') || null;
    },
    saveToStorage() { localStorage.setItem('mystation_data_v11', JSON.stringify(this.state.data)); },
    clearData() { localStorage.removeItem('mystation_data_v11'); window.location.reload(); },
    setupNavigation() { window.addEventListener('hashchange', () => this.handleRoute()); },
    
    handleRoute() {
        const hash = window.location.hash.substring(1) || 'home';
        
        document.querySelectorAll('main section').forEach(el => el.classList.add('hidden-section'));
        
        // -----------------------------------------------------------
        // LOGICA SIDEBAR DINAMICA (Colore in base al tema)
        // -----------------------------------------------------------
        const theme = localStorage.getItem('color-theme') || 'light';
        
        // Determina la classe di sfondo attiva in base al tema
        let activeBgClass = 'bg-primary-600'; // Default Blue (Light/Dark)
        
        if (theme === 'indigo') activeBgClass = 'bg-indigo-600';
        else if (theme === 'pink') activeBgClass = 'bg-pink-600';
        else if (theme === 'cyan') activeBgClass = 'bg-cyan-600';
        else if (theme === 'yellow') activeBgClass = 'bg-yellow-500'; // 500 per contrasto migliore
        else if (theme === 'notte') activeBgClass = 'bg-primary-600'; // Notte usa primary/grigio

        // Lista di tutte le possibili classi di sfondo attive da rimuovere
        const allActiveBgs = ['bg-primary-600', 'bg-indigo-600', 'bg-pink-600', 'bg-cyan-600', 'bg-yellow-500'];

        const inactiveClasses = ['text-gray-900', 'dark:text-white', 'hover:bg-gray-100', 'dark:hover:bg-gray-700'];
        const activeTextClasses = ['text-white'];

        const iconInactive = ['text-gray-500'];
        const iconActive = ['text-white'];

        document.querySelectorAll('#sidebar-nav a, #link-impostazioni').forEach(link => {
            const icon = link.querySelector('svg') || link.querySelector('i');
            const isActive = link.getAttribute('href') === `#${hash}`;

            // 1. PULIZIA: Rimuove TUTTE le classi di stato (Attivo e Inattivo)
            link.classList.remove(...inactiveClasses, ...activeTextClasses, ...allActiveBgs);
            if (icon) icon.classList.remove(...iconInactive, ...iconActive);

            if (isActive) {
                // 2. APPLICA STATO ATTIVO:
                // - Sfondo del tema corrente
                // - Testo Bianco
                // - Icona Bianca
                link.classList.add(activeBgClass, ...activeTextClasses);
                if(icon) icon.classList.add(...iconActive);
            } else {
                // 3. APPLICA STATO INATTIVO:
                // - Testo scuro/chiaro standard
                // - Hover grigio
                // - Icona Grigia
                link.classList.add(...inactiveClasses);
                if(icon) icon.classList.add(...iconInactive);
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
    toLocalISOString(date) { const offset = date.getTimezoneOffset(); return new Date(date.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0]; },
    generateId(prefix = 'id') { return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`; },

    showModal(title, bodyHTML, footerHTML = '', size = 'max-w-2xl') {
        document.getElementById('generic-modal-title').textContent = title;
        document.getElementById('generic-modal-body').innerHTML = bodyHTML;
        const footer = document.getElementById('generic-modal-footer');
        if (footerHTML) { footer.innerHTML = footerHTML; footer.classList.remove('hidden'); } else { footer.classList.add('hidden'); }
        const dlg = document.querySelector('#generic-modal > div');
        if (dlg) { dlg.classList.remove('max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl', 'max-w-4xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl', 'max-w-full'); dlg.classList.add(size); }
        this.modal.show(); lucide.createIcons();
    },
    closeModal() { this.modal.hide(); },
    showToast(message, type = 'success') {
        const toast = document.getElementById('global-toast');
        if (!toast) return;
        clearTimeout(this.toastTimeout);
        document.getElementById('toast-message').textContent = message;
        const icon = document.getElementById('toast-icon');
        const container = document.getElementById('toast-icon-container');
        toast.classList.remove('hidden');
        if (type === 'success') { container.className = 'inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200'; icon.setAttribute('data-lucide', 'check'); }
        else if (type === 'error') { container.className = 'inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200'; icon.setAttribute('data-lucide', 'x'); }
        else { container.className = 'inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg dark:bg-blue-800 dark:text-blue-200'; icon.setAttribute('data-lucide', 'info'); }
        lucide.createIcons();
        this.toastTimeout = setTimeout(() => toast.classList.add('hidden'), 3000);
    },
    setSidebarCompact(isCompact) {
        const sidebar = document.getElementById('application-sidebar');
        const main = document.querySelector('main');
        const icon = document.getElementById('collapse-icon');
        const header = document.getElementById('sidebar-header');
        if (isCompact) {
            sidebar.classList.replace('w-56', 'w-16'); main.classList.replace('lg:ml-56', 'lg:ml-16');
            header.classList.replace('px-4', 'px-2'); header.classList.add('justify-center');
            document.querySelectorAll('.sidebar-text').forEach(el => el.classList.add('hidden'));
            if(icon) icon.setAttribute('data-lucide', 'panel-left-open');
        } else {
            sidebar.classList.replace('w-16', 'w-56'); main.classList.replace('lg:ml-16', 'lg:ml-56');
            header.classList.replace('px-2', 'px-4'); header.classList.remove('justify-center');
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
        const f = e.target.files[0]; if (!f) return; 
        const r = new FileReader(); r.onload = (ev) => { try { const d = JSON.parse(ev.target.result); if (d) { this.state.data = d; this.saveToStorage(); this.showToast('Backup importato con successo!', 'success'); setTimeout(() => window.location.reload(), 1500); } else this.showToast('File di backup non valido.', 'error'); } catch (err) { this.showToast('Errore durante la lettura del file.', 'error'); } }; r.readAsText(f); 
    }
};
document.addEventListener('DOMContentLoaded', () => App.init());
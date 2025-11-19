/* ==========================================================================
   MyStation Admin - CORE (js/app.js) - Unified Sidebar Styles
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
        if (lockscreen) lockscreen.style.display = 'none';
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
            const errMsg = document.getElementById('pin-error-msg');
            errMsg.classList.remove('hidden');
            document.getElementById('pin-modal-content').classList.add('animate-shake');
            inputs.forEach(input => input.value = ''); inputs[0].focus();
            setTimeout(() => document.getElementById('pin-modal-content').classList.remove('animate-shake'), 300);
        }
    },
    unlockApp() {
        sessionStorage.setItem('mystation_session', 'active');
        document.getElementById('pin-lockscreen').style.display = 'none';
        document.querySelectorAll('.pin-square').forEach(input => input.value = '');
        document.getElementById('pin-error-msg').classList.add('hidden');
        this.initApp();
    },
    lockApp() { sessionStorage.removeItem('mystation_session'); window.location.reload(); },
    setPin(newPin) {
        if (newPin) { localStorage.setItem('mystation_pin', newPin); this.state.pin = newPin; App.showToast('Nuovo PIN impostato!', 'success'); } 
        else { localStorage.removeItem('mystation_pin'); this.state.pin = null; App.showToast('PIN rimosso.', 'success'); }
    },

    // --- THEME LOGIC ---
    loadTheme() {
        const savedTheme = localStorage.getItem('color-theme');
        if (savedTheme === 'dark') this.setTheme('dark'); else this.setTheme('light'); 
    },
    
    setTheme(theme) {
        const html = document.documentElement;
        html.classList.remove('dark');
        if (theme === 'dark') html.classList.add('dark');
        localStorage.setItem('color-theme', theme);
        
        if (this.modules.impostazioni && typeof this.modules.impostazioni.updateThemeUI === 'function') {
            this.modules.impostazioni.updateThemeUI(theme);
        }
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
        
        document.querySelectorAll('#sidebar-nav a, #link-impostazioni').forEach(link => {
            const icon = link.querySelector('svg') || link.querySelector('i');
            const isActive = link.getAttribute('href') === `#${hash}`;

            // Reset to Inactive State (Gray-600)
            link.classList.remove('active-nav-item');
            link.classList.add('nav-item-inactive'); // Use CSS class
            
            if (isActive) {
                // Apply Active State
                link.classList.remove('nav-item-inactive');
                link.classList.add('active-nav-item'); 
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
        
        toast.className = 'hidden fixed top-6 right-6 z-[70] flex items-center w-full max-w-xs p-4 mb-4 bg-white rounded-md shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-all transform translate-y-0';
        
        if (type === 'success') { 
            toast.classList.add('border-l-4', 'border-l-[#0066cc]');
            container.className = 'inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-[#0066cc] bg-blue-50 rounded-md dark:bg-blue-900/30 dark:text-blue-300'; 
            icon.setAttribute('data-lucide', 'check-circle'); 
        }
        else if (type === 'error') { 
            toast.classList.add('border-l-4', 'border-l-red-600'); 
            container.className = 'inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-600 bg-red-50 rounded-md dark:bg-red-900/30 dark:text-red-400'; 
            icon.setAttribute('data-lucide', 'alert-circle'); 
        }
        else { 
            toast.classList.add('border-l-4', 'border-l-gray-500');
            container.className = 'inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-gray-600 bg-gray-100 rounded-md dark:bg-gray-700 dark:text-gray-300'; 
            icon.setAttribute('data-lucide', 'info'); 
        }
        
        toast.classList.remove('hidden');
        lucide.createIcons();
        this.toastTimeout = setTimeout(() => toast.classList.add('hidden'), 3000);
    },
    
    setSidebarCompact(isCompact) {
        const sidebar = document.getElementById('application-sidebar');
        const main = document.querySelector('main');
        const icon = document.getElementById('collapse-icon');
        const header = document.getElementById('sidebar-header');
        
        const navItems = document.querySelectorAll('#sidebar-nav a, #sidebar-footer a, #sidebar-footer button');
        const iconElems = document.querySelectorAll('.icon-elem');

        if (isCompact) {
            sidebar.classList.replace('w-64', 'w-20'); 
            main.classList.replace('lg:ml-64', 'lg:ml-20');
            header.classList.replace('px-6', 'px-4'); 
            header.classList.add('justify-center');
            
            document.querySelectorAll('.sidebar-text').forEach(el => el.classList.add('hidden'));
            
            navItems.forEach(el => {
                el.classList.remove('px-6');
                el.classList.add('px-2', 'justify-center');
            });
            iconElems.forEach(i => i.classList.remove('mr-3'));

            if(icon) icon.setAttribute('data-lucide', 'panel-left-open');
        } else {
            sidebar.classList.replace('w-20', 'w-64'); 
            main.classList.replace('lg:ml-20', 'lg:ml-64');
            header.classList.replace('px-4', 'px-6'); 
            header.classList.remove('justify-center');
            
            document.querySelectorAll('.sidebar-text').forEach(el => el.classList.remove('hidden'));
            
            navItems.forEach(el => {
                el.classList.remove('px-2', 'justify-center');
                el.classList.add('px-6');
            });
            iconElems.forEach(i => i.classList.add('mr-3'));

            if(icon) icon.setAttribute('data-lucide', 'panel-left-close');
        }
        localStorage.setItem('sidebar-collapsed', isCompact);
        lucide.createIcons();
    },

    setupGlobalListeners() {
        document.getElementById('sidebar-collapse-toggle')?.addEventListener('click', () => { this.setSidebarCompact(!document.getElementById('application-sidebar').classList.contains('w-20')); });
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
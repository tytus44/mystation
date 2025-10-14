// =============================================
// FILE: app.js (Vanilla JavaScript Version)
// DESCRIZIONE: Core dell'applicazione MyStation.
// Gestisce stato globale, routing, temi e funzioni comuni.
// =============================================

// === STATO GLOBALE DELL'APPLICAZIONE ===
class MyStationApp {
    
    // === COSTRUTTORE - Inizializza l'applicazione ===
    constructor() {
        // Timeout per la chiusura del modale, per evitare race conditions
        this.hideModalTimeout = null;

        // Stato reattivo dell'applicazione
        this.state = {
            // Tema e UI
            isDarkMode: this.loadFromStorage('isDarkMode', false),
            isSidebarCollapsed: this.loadFromStorage('isSidebarCollapsed', false),
            currentSection: this.loadFromStorage('currentSection', 'home'),
            mobileMenuOpen: false,
            
            // Dati principali
            data: this.loadFromStorage('data', {
                clients: [],
                registryEntries: [],
                priceHistory: [],
                competitorPrices: [],
                turni: [],
                contatti: [],
                etichette: [],
                stazioni: [],
                accounts: [],
                previousYearStock: { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 }
            }),
            
            // Notifiche e modal
            notification: { show: false, message: '' },
            confirm: { show: false, message: '', onConfirm: null }
        };
        
        // Bindare i metodi al contesto
        this.init = this.init.bind(this);
        this.updateTheme = this.updateTheme.bind(this);
        this.updateSidebarLayout = this.updateSidebarLayout.bind(this);
        this.switchSection = this.switchSection.bind(this);
        this.showNotification = this.showNotification.bind(this);
        this.showConfirm = this.showConfirm.bind(this);
        this.saveToStorage = this.saveToStorage.bind(this);
        this.loadFromStorage = this.loadFromStorage.bind(this);
        
        // Inizializzazione
        this.init();
    }
    
    // === INIZIALIZZAZIONE PRINCIPALE ===
    init() {
        console.log('🚀 Inizializzazione MyStation App...');
        
        if (!this.isLocalStorageAvailable()) {
            console.warn('⚠️ LocalStorage non disponibile, alcuni dati potrebbero non persistere');
        }
        
        if (typeof this.state.data.previousYearStock === 'undefined') {
            this.state.data.previousYearStock = { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 };
        }
        
        this.updateTheme();
        this.updateSidebarLayout();
        document.body.classList.add('animations-enabled');
        this.initializeModules();
        this.setupEventListeners();
        this.refreshIcons();
        this.switchSection(this.state.currentSection, true);
        
        console.log('✅ MyStation App inizializzata correttamente');
    }
    
    // === SETUP EVENT LISTENERS ===
    setupEventListeners() {
        const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');

                if (section === 'impostazioni') {
                    if (typeof showImpostazioniModal === 'function') {
                        showImpostazioniModal(this);
                    }
                } else if (section) {
                    this.switchSection(section);
                }
            });
        });
        
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
            if (this.state.mobileMenuOpen && !sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                this.toggleMobileMenu();
            }
        });
        
        const confirmYes = document.getElementById('confirm-yes');
        const confirmNo = document.getElementById('confirm-no');
        
        if (confirmYes) {
            confirmYes.addEventListener('click', () => this.handleConfirm());
        }
        
        if (confirmNo) {
            confirmNo.addEventListener('click', () => this.hideConfirm());
        }
        
        window.addEventListener('beforeunload', () => this.saveAllState());
        setInterval(() => this.saveAllState(), 30000);
    }
    
    // === INIZIALIZZAZIONE MODULI ===
    initializeModules() {
        if (typeof initHome === 'function') initHome.call(this);
        if (typeof initVirtualStation === 'function') initVirtualStation.call(this);
        if (typeof initAmministrazione === 'function') initAmministrazione.call(this);
        if (typeof initAnagrafica === 'function') initAnagrafica.call(this);
        if (typeof initRegistroDiCarico === 'function') initRegistroDiCarico.call(this);
        if (typeof initGestionePrezzi === 'function') initGestionePrezzi.call(this);
        if (typeof initImpostazioni === 'function') initImpostazioni.call(this);
        if (typeof initInfo === 'function') initInfo.call(this);
    }
    
    // === GESTIONE MOBILE MENU ===
    toggleMobileMenu() {
        this.state.mobileMenuOpen = !this.state.mobileMenuOpen;
        document.getElementById('sidebar').classList.toggle('show');
    }
    
    // === FUNZIONE PER TRANSIZIONI ANIMATE ===
    animatePageTransition(oldSection, newSection, isInitialLoad = false) {
        if (isInitialLoad) {
            if (oldSection) oldSection.classList.add('hidden');
            if (newSection) {
                newSection.classList.remove('hidden');
                newSection.classList.add('active');
            }
            return;
        }

        if (oldSection) {
            oldSection.classList.remove('active');
            oldSection.classList.add('hidden');
        }

        if (newSection) {
            newSection.classList.remove('hidden');
            newSection.classList.add('active');
        }
    }

    // === NAVIGAZIONE TRA SEZIONI ===
    switchSection(section, isInitialLoad = false) {
        if (this.state.currentSection === section && !isInitialLoad) {
            return;
        }
        console.log(`📱 Cambio sezione: ${this.state.currentSection} → ${section}`);
        
        const oldSectionEl = document.getElementById(`section-${this.state.currentSection}`);

        this.state.currentSection = section;
        this.saveToStorage('currentSection', section);
        
        if (this.state.mobileMenuOpen) this.toggleMobileMenu();
        
        const newSectionEl = document.getElementById(`section-${section}`);

        this.animatePageTransition(oldSectionEl, newSectionEl, isInitialLoad);
        
        this.updateSidebarActiveState(section);
        this.renderSection(section);
        this.onSectionChange(section);
        
        setTimeout(() => this.refreshIcons(), 100);
    }
    
    // === RENDER SEZIONE ===
    renderSection(section) {
        const sectionEl = document.getElementById(`section-${section}`);
        if (!sectionEl) return;
        
        try {
            switch (section) {
                case 'home': if (typeof renderHomeSection === 'function') renderHomeSection.call(this, sectionEl); break;
                case 'virtual': if (typeof renderVirtualSection === 'function') renderVirtualSection.call(this, sectionEl); break;
                case 'amministrazione': if (typeof renderAmministrazioneSection === 'function') renderAmministrazioneSection.call(this, sectionEl); break;
                case 'anagrafica': if (typeof renderAnagraficaSection === 'function') renderAnagraficaSection.call(this, sectionEl); break;
                case 'registro': if (typeof renderRegistroSection === 'function') renderRegistroSection.call(this, sectionEl); break;
                case 'prezzi': if (typeof renderPrezziSection === 'function') renderPrezziSection.call(this, sectionEl); break;
                case 'info': if (typeof renderInfoSection === 'function') renderInfoSection.call(this, sectionEl); break;
            }
        } catch (error) {
            console.error(`❌ Errore nel render della sezione ${section}:`, error);
        }
    }
    
    // === AGGIORNA STATO ATTIVO SIDEBAR ===
    updateSidebarActiveState(section) {
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === section);
        });
    }
    
    // === CALLBACK CAMBIO SEZIONE ===
    onSectionChange(section) {
        if (section === 'virtual' && typeof onVirtualSectionOpen === 'function') {
            onVirtualSectionOpen.call(this);
        }
    }
    
    // === GESTIONE TEMA ===
    updateTheme() {
        document.body.classList.toggle('theme-dark', this.state.isDarkMode);
        document.body.classList.toggle('theme-light', !this.state.isDarkMode);
        this.saveToStorage('isDarkMode', this.state.isDarkMode);
        if (typeof updateChartsTheme === 'function') updateChartsTheme.call(this);
    }
    
    toggleTheme() {
        this.state.isDarkMode = !this.state.isDarkMode;
        this.updateTheme();
    }

    // === GESTIONE LAYOUT SIDEBAR ===
    updateSidebarLayout() {
        document.body.classList.toggle('sidebar-collapsed', this.state.isSidebarCollapsed);
    }
    
    toggleSidebarCollapse() {
        this.state.isSidebarCollapsed = !this.state.isSidebarCollapsed;
        this.saveToStorage('isSidebarCollapsed', this.state.isSidebarCollapsed);
        this.updateSidebarLayout();
    }
    
    // === NOTIFICHE ===
    showNotification(message, type = 'success') {
        const notificationEl = document.getElementById('notification');
        const messageEl = notificationEl.querySelector('.notification-message');
        
        notificationEl.classList.remove('success', 'error', 'warning');
        if(type === 'error') notificationEl.classList.add('error');
        else if(type === 'warning') notificationEl.classList.add('warning');
        else notificationEl.classList.add('success');

        if (messageEl) messageEl.textContent = message;
        notificationEl.classList.remove('hidden');
        notificationEl.classList.add('show');
        setTimeout(() => this.hideNotification(), 3000);
    }
    
    hideNotification() {
        const notificationEl = document.getElementById('notification');
        notificationEl.classList.remove('show');
        setTimeout(() => notificationEl.classList.add('hidden'), 300);
    }
    
    // === MODAL DI CONFERMA ===
    showConfirm(message, onConfirm) {
        const modal = document.getElementById('confirm-modal');
        const messageEl = modal.querySelector('.modal-message');

        this.state.confirm.onConfirm = onConfirm;
        
        if(messageEl) messageEl.innerHTML = message;
        modal.classList.remove('hidden');
        modal.classList.add('show');
    }
    
    hideConfirm() {
        const modal = document.getElementById('confirm-modal');
        
        this.state.confirm.onConfirm = null;
        
        modal.classList.add('is-closing');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('show', 'is-closing');
        }, 500);
    }

    handleConfirm() {
        if (typeof this.state.confirm.onConfirm === 'function') {
            this.state.confirm.onConfirm();
        }
        this.hideConfirm();
    }

    // === GESTIONE MODALE FORM (CON FIX PER RACE CONDITION) ===
    showFormModal() {
        const modalEl = document.getElementById('form-modal');
        if (!modalEl) return;

        // Annulla qualsiasi animazione di chiusura in corso e la sua pulizia.
        if (this.hideModalTimeout) {
            clearTimeout(this.hideModalTimeout);
            this.hideModalTimeout = null;
        }

        // Resetta lo stato del modale per una visualizzazione pulita.
        modalEl.classList.remove('is-closing', 'hidden');

        // Mostra il modale.
        modalEl.classList.add('show');
    }
    
    hideFormModal() {
        const modalEl = document.getElementById('form-modal');
        const contentEl = document.getElementById('form-modal-content');
        
        if (modalEl) {
            modalEl.classList.add('is-closing');

            // Cancella eventuali timeout precedenti per evitare accavallamenti
            if (this.hideModalTimeout) {
                clearTimeout(this.hideModalTimeout);
            }

            this.hideModalTimeout = setTimeout(() => {
                modalEl.classList.remove('show', 'is-closing');
                modalEl.classList.add('hidden');
                if (contentEl) {
                    contentEl.innerHTML = ''; 
                    // Resetta completamente le classi, lasciando solo quella di base
                    contentEl.className = 'modal-content'; 
                }
                this.hideModalTimeout = null; // Resetta il timeout ID
            }, 500);
        }
    }
    
    // === PERSISTENZA DATI ===
    isLocalStorageAvailable() {
        try {
            localStorage.setItem('__test__', '__test__');
            localStorage.removeItem('__test__');
            return true;
        } catch (e) {
            return false;
        }
    }
    
    saveToStorage(key, value) {
        if (this.isLocalStorageAvailable()) {
            localStorage.setItem(`mystation_${key}`, JSON.stringify(value));
        }
    }
    
    loadFromStorage(key, defaultValue = null) {
        if (!this.isLocalStorageAvailable()) return defaultValue;
        const item = localStorage.getItem(`mystation_${key}`);
        return item ? JSON.parse(item) : defaultValue;
    }
    
    saveAllState() {
        const keysToSave = ['isDarkMode', 'isSidebarCollapsed', 'currentSection', 'data'];
        keysToSave.forEach(key => this.saveToStorage(key, this.state[key]));
    }
    
    // === UTILITY FUNCTIONS ===
    generateUniqueId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    
    formatInteger(num) {
        return (num === null || num === undefined) ? '0' : Math.round(num).toLocaleString('it-IT');
    }
    
    formatCurrency(amount, isPricePerLiter = false) {
        const options = { style: 'currency', currency: 'EUR', minimumFractionDigits: isPricePerLiter ? 3 : 2 };
        return new Intl.NumberFormat('it-IT', options).format(amount || 0);
    }
    
    formatDate(dateString) {
        return dateString ? this.formatToItalianDate(new Date(dateString)) : '-';
    }
    
    formatDateForFilename(date = new Date()) {
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    }
    
    parseItalianDate(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split(/[.\/-]/);
        if (parts.length !== 3) return null;
        const [day, month, year] = parts.map(p => parseInt(p, 10));
        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;
        return new Date(fullYear, month - 1, day, 12);
    }
    
    formatToItalianDate(isoDate) {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    }
    
    getTodayFormatted() {
        return this.formatToItalianDate(new Date());
    }
    
    validateItalianDate(dateStr) {
        const date = this.parseItalianDate(dateStr);
        return date instanceof Date && !isNaN(date);
    }
    
    getBalanceClass(balance) {
        if (balance > 0) return 'balance-positive';
        if (balance < 0) return 'balance-negative';
        return 'balance-zero';
    }
    
    refreshIcons() {
        setTimeout(() => {
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
            }
        }, 50);
    }
}

// === ISTANZA GLOBALE ===
let app;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM loaded, inizializzazione MyStation...');
    app = new MyStationApp();
    window.myStation = app;
});

// === FUNZIONI GLOBALI PER COMPATIBILITÀ CON I MODULI ===
function getApp() {
    return app;
}

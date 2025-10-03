// =============================================
// FILE: app.js (Vanilla JavaScript Version)
// DESCRIZIONE: Core dell'applicazione MyStation.
// Gestisce stato globale, routing, temi e funzioni comuni.
// =============================================

// === STATO GLOBALE DELL'APPLICAZIONE ===
class MyStationApp {
    
    // === COSTRUTTORE - Inizializza l'applicazione ===
    constructor() {
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
                // NUOVI DATI PER LA RUBRICA
                contatti: [],
                etichette: [],
                // FINE NUOVI DATI
                previousYearStock: { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 }
            }),
            
            // Notifiche e modal
            notification: { show: false, message: '' },
            confirm: { show: false, message: '', onConfirm: () => {} }
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
    // Inizio funzione init
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
        this.switchSection(this.state.currentSection, true); // Primo caricamento senza animazione
        
        console.log('✅ MyStation App inizializzata correttamente');
    }
    // Fine funzione init
    
    // === SETUP EVENT LISTENERS ===
    // Inizio funzione setupEventListeners
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
        
        // INIZIO MODIFICA: Rimosso listener per chiusura modale al click sul backdrop
        /*
        const modalBackdrops = document.querySelectorAll('.modal-backdrop');
        modalBackdrops.forEach(backdrop => {
            backdrop.addEventListener('click', () => {
                this.hideConfirm();
                this.hideFormModal();
            });
        });
        */
        // FINE MODIFICA

        if (confirmYes) {
            confirmYes.addEventListener('click', () => {
                this.state.confirm.onConfirm();
                this.hideConfirm();
            });
        }
        
        if (confirmNo) {
            confirmNo.addEventListener('click', () => this.hideConfirm());
        }
        
        window.addEventListener('beforeunload', () => this.saveAllState());
        setInterval(() => this.saveAllState(), 30000);
    }
    // Fine funzione setupEventListeners
    
    // === INIZIALIZZAZIONE MODULI ===
    // Inizio funzione initializeModules
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
    // Fine funzione initializeModules
    
    // === GESTIONE MOBILE MENU ===
    // Inizio funzione toggleMobileMenu
    toggleMobileMenu() {
        this.state.mobileMenuOpen = !this.state.mobileMenuOpen;
        document.getElementById('sidebar').classList.toggle('show');
    }
    // Fine funzione toggleMobileMenu
    
    // === FUNZIONE PER TRANSIZIONI ANIMATE ===
    // Inizio funzione animatePageTransition
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
    // Fine funzione animatePageTransition

    // === NAVIGAZIONE TRA SEZIONI ===
    // Inizio funzione switchSection
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
    // Fine funzione switchSection
    
    // === RENDER SEZIONE ===
    // Inizio funzione renderSection
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
    // Fine funzione renderSection
    
    // === AGGIORNA STATO ATTIVO SIDEBAR ===
    // Inizio funzione updateSidebarActiveState
    updateSidebarActiveState(section) {
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === section);
        });
    }
    // Fine funzione updateSidebarActiveState
    
    // === CALLBACK CAMBIO SEZIONE ===
    // Inizio funzione onSectionChange
    onSectionChange(section) {
        if (section === 'virtual' && typeof onVirtualSectionOpen === 'function') {
            onVirtualSectionOpen.call(this);
        }
    }
    // Fine funzione onSectionChange
    
    // === GESTIONE TEMA ===
    // Inizio funzione updateTheme
    updateTheme() {
        document.body.classList.toggle('theme-dark', this.state.isDarkMode);
        document.body.classList.toggle('theme-light', !this.state.isDarkMode);
        this.saveToStorage('isDarkMode', this.state.isDarkMode);
        if (typeof updateChartsTheme === 'function') updateChartsTheme.call(this);
    }
    // Fine funzione updateTheme
    
    // Inizio funzione toggleTheme
    toggleTheme() {
        this.state.isDarkMode = !this.state.isDarkMode;
        this.updateTheme();
    }
    // Fine funzione toggleTheme

    // === GESTIONE LAYOUT SIDEBAR ===
    // Inizio funzione updateSidebarLayout
    updateSidebarLayout() {
        // INIZIO MODIFICA: Semplificata la funzione per usare lo stato in memoria
        document.body.classList.toggle('sidebar-collapsed', this.state.isSidebarCollapsed);
        // FINE MODIFICA
    }
    // Fine funzione updateSidebarLayout
    
    // INIZIO MODIFICA: Aggiunta funzione per centralizzare la logica del collassamento
    // Inizio funzione toggleSidebarCollapse
    toggleSidebarCollapse() {
        this.state.isSidebarCollapsed = !this.state.isSidebarCollapsed;
        this.saveToStorage('isSidebarCollapsed', this.state.isSidebarCollapsed);
        this.updateSidebarLayout();
    }
    // Fine funzione toggleSidebarCollapse
    // FINE MODIFICA
    
    // === NOTIFICHE ===
    // Inizio funzione showNotification
    showNotification(message) {
        const notificationEl = document.getElementById('notification');
        const messageEl = notificationEl.querySelector('.notification-message');
        if (messageEl) messageEl.textContent = message;
        notificationEl.classList.remove('hidden');
        notificationEl.classList.add('show');
        setTimeout(() => this.hideNotification(), 3000);
    }
    // Fine funzione showNotification
    
    // Inizio funzione hideNotification
    hideNotification() {
        const notificationEl = document.getElementById('notification');
        notificationEl.classList.remove('show');
        setTimeout(() => notificationEl.classList.add('hidden'), 300);
    }
    // Fine funzione hideNotification
    
    // === MODAL DI CONFERMA ===
    // Inizio funzione showConfirm
    showConfirm(message, onConfirm) {
        this.state.confirm.message = message;
        this.state.confirm.onConfirm = onConfirm;
        const modalEl = document.getElementById('confirm-modal');
        const messageEl = modalEl.querySelector('.modal-message');

        if (messageEl) messageEl.textContent = message;
        modalEl.classList.remove('hidden');
        modalEl.classList.add('show');
    }
    // Fine funzione showConfirm
    
    // Inizio funzione hideConfirm
    hideConfirm() {
        const modalEl = document.getElementById('confirm-modal');
        if (modalEl) {
            modalEl.classList.add('is-closing');

            setTimeout(() => {
                modalEl.classList.remove('show', 'is-closing');
                modalEl.classList.add('hidden');
            }, 500);
        }
    }
    // Fine funzione hideConfirm

    // === GESTIONE MODALE FORM ===
    // Inizio funzione showFormModal
    showFormModal() {
        const modalEl = document.getElementById('form-modal');
        if (modalEl) {
            modalEl.classList.remove('hidden');
            modalEl.classList.add('show');
        }
    }
    // Fine funzione showFormModal

    // Inizio funzione hideFormModal
    hideFormModal() {
        const modalEl = document.getElementById('form-modal');
        const contentEl = document.getElementById('form-modal-content');
        const modalContent = modalEl?.querySelector('.modal-content');
        
        if (modalEl) {
            modalEl.classList.add('is-closing');

            setTimeout(() => {
                modalEl.classList.remove('show', 'is-closing');
                modalEl.classList.add('hidden');
                if (contentEl) {
                    contentEl.innerHTML = ''; 
                }
                if (modalContent) {
                    modalContent.classList.remove('modal-wide');
                }
            }, 500);
        }
    }
    // Fine funzione hideFormModal
    
    // === FUNZIONI DI STAMPA CENTRALIZZATE ===
    // Inizio funzione printClientsList
    printClientsList(clients = null) {
        console.log('🖨️ Avvio stampa elenco clienti...');
        const clientiDaStampare = clients || this.state.data.clients || [];
        document.getElementById('print-clients-date').textContent = 
            `${this.formatDate(new Date().toISOString())}`;
        const clientsTableBody = document.getElementById('print-clients-list');
        const pairs = [];
        for (let i = 0; i < clientiDaStampare.length; i += 2) {
            pairs.push({
                client1: clientiDaStampare[i],
                client2: clientiDaStampare[i + 1] || null
            });
        }
        clientsTableBody.innerHTML = pairs.map(pair => `
            <tr>
                <td>${pair.client1.name}</td>
                <td class="${this.getBalanceClass(pair.client1.balance)}">${this.formatCurrency(pair.client1.balance)}</td>
                <td>${pair.client2 ? pair.client2.name : ''}</td>
                <td class="${pair.client2 ? this.getBalanceClass(pair.client2.balance) : ''}">${pair.client2 ? this.formatCurrency(pair.client2.balance) : ''}</td>
            </tr>
        `).join('');
        document.getElementById('print-clients-content').classList.remove('hidden');
        document.getElementById('print-content').classList.add('hidden');
        document.getElementById('virtual-print-content').classList.add('hidden');
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.getElementById('print-clients-content').classList.add('hidden');
            }, 100);
        }, 100);
        console.log('✅ Stampa elenco clienti completata');
    }
    // Fine funzione printClientsList
    
    // Inizio funzione printClientAccount
    printClientAccount(client) {
        console.log(`🖨️ Avvio stampa conto cliente: ${client.name}...`);
        const transactions = client.transactions ? 
            [...client.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
        document.getElementById('print-client-name').textContent = 
            `Estratto conto ${client.name}`;
        document.getElementById('print-date-range').textContent = 
            `${this.formatDate(new Date().toISOString())}`;
        const transactionsTableBody = document.getElementById('print-transactions');
        const pairs = [];
        for (let i = 0; i < transactions.length; i += 2) {
            pairs.push({
                tx1: transactions[i],
                tx2: transactions[i + 1] || null
            });
        }
        transactionsTableBody.innerHTML = pairs.map(pair => {
            const tx1Amount = this.formatTransactionAmount(pair.tx1.amount);
            const tx2Amount = pair.tx2 ? this.formatTransactionAmount(pair.tx2.amount) : '';
            return `
                <tr>
                    <td>${pair.tx1 ? pair.tx1.description : ''}</td>
                    <td class="${pair.tx1.amount > 0 ? 'text-success' : 'text-danger'}">${tx1Amount}</td>
                    <td>${pair.tx2 ? pair.tx2.description : ''}</td>
                    <td class="${pair.tx2 ? (pair.tx2.amount > 0 ? 'text-success' : 'text-danger') : ''}">${tx2Amount}</td>
                </tr>
            `;
        }).join('');
        document.getElementById('print-final-balance').textContent = this.formatCurrency(client.balance);
        document.getElementById('print-content').classList.remove('hidden');
        document.getElementById('print-clients-content').classList.add('hidden');
        document.getElementById('virtual-print-content').classList.add('hidden');
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.getElementById('print-content').classList.add('hidden');
            }, 100);
        }, 100);
        console.log('✅ Stampa conto cliente completata');
    }
    // Fine funzione printClientAccount
    
    // Inizio funzione formatTransactionAmount
    formatTransactionAmount(amount) {
        return amount > 0 ? '+' + this.formatCurrency(amount) : this.formatCurrency(amount);
    }
    // Fine funzione formatTransactionAmount
    
    // === PERSISTENZA DATI ===
    // Inizio funzione isLocalStorageAvailable
    isLocalStorageAvailable() {
        try {
            localStorage.setItem('__test__', '__test__');
            localStorage.removeItem('__test__');
            return true;
        } catch (e) {
            return false;
        }
    }
    // Fine funzione isLocalStorageAvailable
    
    // Inizio funzione saveToStorage
    saveToStorage(key, value) {
        if (this.isLocalStorageAvailable()) {
            localStorage.setItem(`mystation_${key}`, JSON.stringify(value));
        }
    }
    // Fine funzione saveToStorage
    
    // Inizio funzione loadFromStorage
    loadFromStorage(key, defaultValue = null) {
        if (!this.isLocalStorageAvailable()) return defaultValue;
        const item = localStorage.getItem(`mystation_${key}`);
        return item ? JSON.parse(item) : defaultValue;
    }
    // Fine funzione loadFromStorage
    
    // Inizio funzione saveAllState
    saveAllState() {
        const keysToSave = ['isDarkMode', 'isSidebarCollapsed', 'currentSection', 'data'];
        keysToSave.forEach(key => this.saveToStorage(key, this.state[key]));
    }
    // Fine funzione saveAllState
    
    // === UTILITY FUNCTIONS ===
    // Inizio funzione generateUniqueId
    generateUniqueId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    // Fine funzione generateUniqueId
    
    // Inizio funzione formatInteger
    formatInteger(num) {
        return (num === null || num === undefined) ? '0' : Math.round(num).toLocaleString('it-IT');
    }
    // Fine funzione formatInteger
    
    // Inizio funzione formatCurrency
    formatCurrency(amount, isPricePerLiter = false) {
        const options = { style: 'currency', currency: 'EUR', minimumFractionDigits: isPricePerLiter ? 3 : 2 };
        return new Intl.NumberFormat('it-IT', options).format(amount || 0);
    }
    // Fine funzione formatCurrency
    
    // Inizio funzione formatDate
    formatDate(dateString) {
        return dateString ? this.formatToItalianDate(new Date(dateString)) : '-';
    }
    // Fine funzione formatDate
    
    // Inizio funzione formatDateForFilename
    formatDateForFilename(date = new Date()) {
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    }
    // Fine funzione formatDateForFilename
    
    // Inizio funzione parseItalianDate
    parseItalianDate(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split(/[.\/-]/);
        if (parts.length !== 3) return null;
        const [day, month, year] = parts.map(p => parseInt(p, 10));
        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;
        return new Date(fullYear, month - 1, day, 12);
    }
    // Fine funzione parseItalianDate
    
    // Inizio funzione formatToItalianDate
    formatToItalianDate(isoDate) {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    }
    // Fine funzione formatToItalianDate
    
    // Inizio funzione getTodayFormatted
    getTodayFormatted() {
        return this.formatToItalianDate(new Date());
    }
    // Fine funzione getTodayFormatted
    
    // Inizio funzione validateItalianDate
    validateItalianDate(dateStr) {
        const date = this.parseItalianDate(dateStr);
        return date instanceof Date && !isNaN(date);
    }
    // Fine funzione validateItalianDate
    
    // Inizio funzione getBalanceClass
    getBalanceClass(balance) {
        if (balance > 0) return 'balance-positive';
        if (balance < 0) return 'balance-negative';
        return 'balance-zero';
    }
    // Fine funzione getBalanceClass
    
    // Inizio funzione refreshIcons
    refreshIcons() {
        setTimeout(() => {
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
            }
        }, 50);
    }
    // Fine funzione refreshIcons
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

function showNotification(message) {
    if (app) app.showNotification(message);
}

function showConfirm(message, onConfirm) {
    if (app) app.showConfirm(message, onConfirm);
}

function refreshIcons() {
    if (app) app.refreshIcons();
}

function switchSection(section) {
    if (app) app.switchSection(section);
}
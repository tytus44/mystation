/**
 * MEMORIA.JS
 * Sistema unificato di gestione localStorage e stato UI per MyStation
 */

const MemoriaStorage = {
    
    keys: {
        anagrafica: 'mystation_anagrafica_contacts',
        amministrazione: 'mystation_amministrazione_clients',
        registro: 'mystation_registro_loads',
        // Aggiunta nuova chiave per le rimanenze
        rimanenze: 'mystation_registro_rimanenze',
        virtualstation: 'mystation_virtualstation_turns',
        prezzi: 'mystation_gestione_prezzi_storico', 
        concorrenza: 'mystation_concorrenza_prezzi',
        calendario: 'mystation_calendario_appointments',
        theme: 'mystation_theme',
        viewPreferences: 'mystation_view_prefs',
        lastBackup: 'mystation_last_backup'
    },
    
    colorPalette: ['#fb8500', '#ffb703', '#42bfdd', '#ff66b3', '#2ec4b6', '#7678ed', '#16db65', '#0072f5', '#fa3e41'],
    availableColorsBySection: {},

    // ============================================
    // METODI GENERALI
    // ============================================
    isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.error('localStorage non disponibile:', e);
            return false;
        }
    },
    
    // ============================================
    // GESTIONE COLORI CENTRALIZZATA
    // ============================================
    getNextColor(section) {
        if (!this.availableColorsBySection[section] || this.availableColorsBySection[section].length === 0) {
            this.availableColorsBySection[section] = [...this.colorPalette].sort(() => 0.5 - Math.random());
        }
        return this.availableColorsBySection[section].pop();
    },

    // ============================================
    // GESTIONE TEMA CENTRALIZZATA
    // ============================================
    applyTheme(theme) {
        document.body.classList.toggle('dark-theme', theme === 'dark');
    },
    
    saveTheme(theme) {
        if (!this.isAvailable()) return;
        localStorage.setItem(this.keys.theme, theme);
        this.applyTheme(theme);
    },
    
    loadTheme() {
        return this.isAvailable() ? localStorage.getItem(this.keys.theme) || 'light' : 'light';
    },

    initTheme(themeToggleElement) {
        if (!themeToggleElement) return;
        const savedTheme = this.loadTheme();
        this.applyTheme(savedTheme);
        
        themeToggleElement.addEventListener('click', () => {
            const currentTheme = this.loadTheme();
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            this.saveTheme(newTheme);
        });
    },

    // ============================================
    // GESTIONE DATI PER SEZIONE
    // ============================================
    
    // --- Anagrafica ---
    saveContacts(contacts) {
        if (this.isAvailable()) localStorage.setItem(this.keys.anagrafica, JSON.stringify(contacts));
    },
    loadContacts() {
        if (!this.isAvailable()) return [];
        const data = localStorage.getItem(this.keys.anagrafica);
        return data ? JSON.parse(data) : [];
    },
    
    // --- Amministrazione ---
    saveClients(clients) {
        if (this.isAvailable()) localStorage.setItem(this.keys.amministrazione, JSON.stringify(clients));
    },
    loadClients() {
        if (!this.isAvailable()) return [];
        const data = localStorage.getItem(this.keys.amministrazione);
        return data ? JSON.parse(data) : [];
    },

    // --- Registro di Carico ---
    saveRegistro(loads) {
        if (this.isAvailable()) localStorage.setItem(this.keys.registro, JSON.stringify(loads));
    },
    loadRegistro() {
        if (!this.isAvailable()) return [];
        const data = localStorage.getItem(this.keys.registro);
        return data ? JSON.parse(data) : [];
    },
    
    // NUOVE FUNZIONI PER GESTIRE LE RIMANENZE
    saveRimanenze(rimanenze) {
        if (this.isAvailable()) localStorage.setItem(this.keys.rimanenze, JSON.stringify(rimanenze));
    },
    loadRimanenze() {
        if (!this.isAvailable()) return { benzina: 0, gasolio: 0, diesel: 0, hvolution: 0 };
        const data = localStorage.getItem(this.keys.rimanenze);
        // Se non ci sono dati salvati, restituisce un oggetto con valori a zero
        return data ? JSON.parse(data) : { benzina: 0, gasolio: 0, diesel: 0, hvolution: 0 };
    },

    // --- Virtual Station ---
    saveTurns(turns) {
        if (this.isAvailable()) localStorage.setItem(this.keys.virtualstation, JSON.stringify(turns));
    },
    loadTurns() {
        if (!this.isAvailable()) return [];
        const data = localStorage.getItem(this.keys.virtualstation);
        return data ? JSON.parse(data) : [];
    },

    // --- Gestione Prezzi ---
    savePriceEntry(newPriceEntry) {
        if (!this.isAvailable()) return;
        const priceHistory = this.loadPriceHistory();
        priceHistory.push(newPriceEntry);
        priceHistory.sort((a, b) => b.id - a.id); 
        localStorage.setItem(this.keys.prezzi, JSON.stringify(priceHistory));
    },

    saveAllPriceHistory(priceHistory) {
        if (!this.isAvailable()) return;
        localStorage.setItem(this.keys.prezzi, JSON.stringify(priceHistory));
    },

    loadPriceHistory() {
        if (!this.isAvailable()) return [];
        const data = localStorage.getItem(this.keys.prezzi);
        return data ? JSON.parse(data) : [];
    },

    // --- Prezzi Concorrenza ---
    saveCompetitionPrices(prices) {
        if (this.isAvailable()) localStorage.setItem(this.keys.concorrenza, JSON.stringify(prices));
    },
    loadCompetitionPrices() {
        if (!this.isAvailable()) return {};
        const data = localStorage.getItem(this.keys.concorrenza);
        return data ? JSON.parse(data) : {};
    },

    // --- Calendario ---
    saveAppointments(appointments) {
        if (this.isAvailable()) localStorage.setItem(this.keys.calendario, JSON.stringify(appointments));
    },
    loadAppointments() {
        if (!this.isAvailable()) return [];
        const data = localStorage.getItem(this.keys.calendario);
        return data ? JSON.parse(data) : [];
    },

    // --- Preferenze di Visualizzazione ---
    saveViewPreference(section, view) {
        if (!this.isAvailable()) return;
        const prefs = this.loadAllViewPreferences();
        prefs[section] = view;
        localStorage.setItem(this.keys.viewPreferences, JSON.stringify(prefs));
    },
    loadAllViewPreferences() {
        if (!this.isAvailable()) return {};
        const data = localStorage.getItem(this.keys.viewPreferences);
        return data ? JSON.parse(data) : {};
    },
    loadViewPreference(section) {
        const prefs = this.loadAllViewPreferences();
        return prefs[section] || 'grid';
    }
};

// ============================================
// FUNZIONE SHOWALERT CENTRALIZZATA
// ============================================
window.showAlert = function(message, type = 'info') {
    const customAlertBox = document.getElementById('custom-alert-box');
    if (!customAlertBox) return;
    
    customAlertBox.innerHTML = message;
    customAlertBox.className = 'custom-alert';
    if (type) customAlertBox.classList.add(type);
    customAlertBox.classList.add('show');
    
    setTimeout(() => {
        customAlertBox.classList.remove('show');
        setTimeout(() => {
            customAlertBox.className = 'custom-alert';
        }, 400);
    }, 3000);
};

window.MemoriaStorage = MemoriaStorage;

document.addEventListener('DOMContentLoaded', () => {
    // Disabilita l'autocompletamento per tutti i campi di input
    document.querySelectorAll('input').forEach(input => input.setAttribute('autocomplete', 'off'));
});
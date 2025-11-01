// =============================================
// FILE: impostazioni.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Impostazioni (tema, import/export, reset).
// =============================================

// === COSTANTI ===
const THEME_COLORS = [{
    id: 'ocean',
    name: 'Ocean',
    value: '#00bcd4'
}, {
    id: 'purple',
    name: 'Purple',
    value: '#673ab7'
}, {
    id: 'lady',
    name: 'Lady',
    value: '#e91e63'
}, {
    id: 'sugar',
    name: 'Sugar',
    value: '#607d8b'
}, {
    id: 'night',
    name: 'Night',
    value: '#212121'
}, ];

// === STATO LOCALE DEL MODULO IMPOSTAZIONI ===
let impostazioniState = {
    borderRadius: null,
    isFullscreen: false,
    theme: 'default'
};

// === INIZIALIZZAZIONE MODULO IMPOSTAZIONI ===
// Inizio funzione initImpostazioni
function initImpostazioni() {
    console.log('⚙️ Inizializzazione modulo Impostazioni...');
    impostazioniState.borderRadius = this.loadFromStorage('borderRadius', 'medium');
    impostazioniState.theme = this.loadFromStorage('theme', 'default');
    updateBorderRadius();
    updateTheme(); // Applica il tema salvato (o default)
    document.addEventListener('fullscreenchange', () => {
        impostazioniState.isFullscreen = !!document.fullscreenElement;
        updateFullscreenToggle();
    });
    console.log('✅ Modulo Impostazioni inizializzato');
}
// Fine funzione initImpostazioni

// === MODAL IMPOSTAZIONI ===
// Inizio funzione showImpostazioniModal
function showImpostazioniModal(app) {
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;
    modalContent.classList.add('modal-wide');
    modalContent.innerHTML = getImpostazioniModalHTML(app);
    setupImpostazioniEventListeners(app);
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showImpostazioniModal

// Inizio funzione getImpostazioniModalHTML
function getImpostazioniModalHTML(app) {
    // Se il tema 'default' è attivo, lo stato dello switch è controllato da isDarkMode
    // Se un tema alternativo è attivo, lo switch è 'chiaro' (false)
    const isSwitchChecked = (impostazioniState.theme === 'default') ? app.state.isDarkMode : false;

    return `
        <div class="modal-header">
             <h2 class="card-title">Impostazioni</h2>
             <button type="button" id="close-impostazioni-icon-btn" class="modal-close-btn">
                <i data-lucide="x"></i>
             </button>
        </div>
        <div class="modal-body">
            <div class="impostazioni-layout">
                <div class="impostazioni-section" style="gap: 1.5rem;">
                    <h3 class="impostazioni-section-title">Personalizzazione</h3>
                    <div class="p-4" style="border: 1px solid var(--border-primary); border-radius: var(--radius-md);">
                        <div class="space-y-4">
                            <div class="flex items-center justify-between w-full">
                                <span class="font-medium text-primary">Tema Chiaro/Scuro</span>
                                <label class="switch">
                                    <input type="checkbox" id="dark-mode-toggle" ${isSwitchChecked ? 'checked' : ''}>
                                    <span class="switch-slider"></span>
                                </label>
                            </div>
                            <div class="flex items-center justify-between w-full">
                                <span class="font-medium text-primary">Schermo intero</span>
                                <label class="switch">
                                    <input type="checkbox" id="fullscreen-toggle" ${impostazioniState.isFullscreen ? 'checked' : ''}>
                                    <span class="switch-slider"></span>
                                </label>
                            </div>
                            <div class="flex items-center justify-between w-full">
                                <span class="font-medium text-primary">Collassa menu laterale</span>
                                <label class="switch">
                                    <input type="checkbox" id="sidebar-collapse-toggle" ${app.state.isSidebarCollapsed ? 'checked' : ''}>
                                    <span class="switch-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="p-4" style="border: 1px solid var(--border-primary); border-radius: var(--radius-md);">
                        <label class="font-medium text-primary mb-4" style="display: block;">Arrotondamento elementi</label>
                        <div class="flex gap-4">
                            <button type="button" data-radius="none" class="btn ${impostazioniState.borderRadius === 'none' ? 'btn-primary active' : 'btn-secondary'}">Nessuno</button>
                            <button type="button" data-radius="medium" class="btn ${impostazioniState.borderRadius === 'medium' ? 'btn-primary active' : 'btn-secondary'}">Medio</button>
                            <button type="button" data-radius="high" class="btn ${impostazioniState.borderRadius === 'high' ? 'btn-primary active' : 'btn-secondary'}">Alto</button>
                        </div>
                    </div>
                    <div class="p-4" style="border: 1px solid var(--border-primary); border-radius: var(--radius-md);">
                        <label class="font-medium text-primary mb-4" style="display: block;">Temi di colore</label>
                        <div class="flex flex-wrap" style="gap: var(--spacing-sm);" id="theme-color-picker">
                            ${THEME_COLORS.map(theme => `
                                <button type="button" 
                                        class="theme-color-swatch" 
                                        data-theme="${theme.id}" 
                                        title="${theme.name}" 
                                        style="background-color: ${theme.value}; 
                                               width: 2.25rem; 
                                               height: 2.25rem; 
                                               border-radius: 50%; 
                                               cursor: pointer; 
                                               border: 3px solid ${impostazioniState.theme === theme.id ? 'var(--color-primary)' : (theme.id === 'night' ? '#424242' : 'var(--bg-primary)')}; 
                                               box-shadow: 0 0 0 1px ${impostazioniState.theme === theme.id ? 'var(--color-primary)' : (theme.id === 'night' ? '#616161' : 'var(--border-secondary)')};
                                               transition: all 0.2s ease;">
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="impostazioni-section">
                    <h3 class="impostazioni-section-title">Gestione Dati</h3>
                    <div class="space-y-4">
                        <div class="p-4" style="background-color: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: var(--radius-md);">
                            <label class="font-medium text-primary mb-2" style="display: block;">
                                <i data-lucide="database" style="width: 1.25rem; height: 1.25rem; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></i>Backup e Ripristino
                            </label>
                            <p class="text-sm text-secondary mb-4">Esporta o importa i tuoi dati in formato JSON</p>
                            <div class="flex gap-4">
                                <button type="button" id="export-btn" class="btn btn-primary" style="flex-grow: 1;"><i data-lucide="download" class="mr-2"></i><span>Esporta</span></button>
                                <button type="button" id="import-btn" class="btn btn-secondary" style="flex-grow: 1;"><i data-lucide="upload" class="mr-2"></i><span>Importa</span></button>
                            </div>
                            <input type="file" id="import-file" accept=".json" style="display: none;">
                        </div>
                        <div class="p-4" style="background-color: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-md);">
                            <label class="font-medium mb-2" style="display: block; color: var(--color-success);">
                                <i data-lucide="printer" style="width: 1.25rem; height: 1.25rem; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></i>Stampa Giornata
                            </label>
                            <p class="text-sm text-secondary mb-4">Stampa i fogli di inizio e fine giornata</p>
                            <div class="flex gap-4">
                                <a href="../pdf/foglio_inizio.pdf" target="_blank" class="btn btn-success" style="flex-grow: 1;"><i data-lucide="sun" class="mr-2"></i><span>Inizio</span></a>
                                <a href="../pdf/foglio_fine.pdf" target="_blank" class="btn btn-secondary" style="flex-grow: 1;"><i data-lucide="moon" class="mr-2"></i><span>Fine</span></a>
                            </div>
                        </div>
                        <div class="p-4" style="background-color: rgba(220, 38, 38, 0.05); border: 1px solid rgba(220, 38, 38, 0.2); border-radius: var(--radius-md);">
                            <label class="font-medium mb-2" style="display: block; color: var(--color-danger);">
                                <i data-lucide="alert-triangle" style="width: 1.25rem; height: 1.25rem; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></i>Zona di pericolo
                            </label>
                            <button type="button" id="reset-data-btn" class="btn btn-danger w-full"><i data-lucide="trash-2"></i><span>Cancella tutti i dati</span></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button id="close-impostazioni-btn" class="btn btn-secondary">Chiudi</button>
        </div>
    `;
}
// Fine funzione getImpostazioniModalHTML

// === EVENT HANDLERS ===
// Inizio funzione handleImpostazioniClick
function handleImpostazioniClick(event) {
    const app = getApp();
    if (!app) {
        console.error('App non disponibile');
        return;
    }
    const target = event.target;
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;
    if (target.closest('#import-btn')) modalContent.querySelector('#import-file')?.click();
    if (target.closest('#export-btn')) exportData.call(app);
    if (target.closest('#reset-data-btn')) confirmReset.call(app);

    if (target.closest('#close-impostazioni-btn') || target.closest('#close-impostazioni-icon-btn')) {
        app.hideFormModal();
    }

    const radiusBtn = target.closest('[data-radius]');
    if (radiusBtn) {
        const newRadius = radiusBtn.dataset.radius;
        impostazioniState.borderRadius = newRadius;
        app.saveToStorage('borderRadius', newRadius);
        updateBorderRadius();
        modalContent.querySelectorAll('[data-radius]').forEach(btn => {
            const isActive = btn.dataset.radius === newRadius;
            btn.classList.toggle('btn-primary', isActive);
            btn.classList.toggle('active', isActive);
            btn.classList.toggle('btn-secondary', !isActive);
        });
    }

    const themeBtn = target.closest('[data-theme]');
    if (themeBtn) {
        const newTheme = themeBtn.dataset.theme;
        impostazioniState.theme = newTheme;
        app.saveToStorage('theme', newTheme);
        updateTheme(); // Applica data-theme (es. "ocean")

        // Se si sceglie un tema alternativo, si disattiva il dark mode di default
        if (app.state.isDarkMode) {
            app.toggleTheme(); // Forza isDarkMode = false e rimuove .theme-dark
        }
        document.getElementById('dark-mode-toggle').checked = false;

        // Aggiorna UI swatches
        modalContent.querySelectorAll('[data-theme]').forEach(btn => {
            const isSelected = btn.dataset.theme === newTheme;
            const themeId = btn.dataset.theme;
            let nonSelectedBorder = (themeId === 'night') ? '#424242' : 'var(--bg-primary)';
            let nonSelectedShadow = `0 0 0 1px ${themeId === 'night' ? '#616161' : 'var(--border-secondary)'}`;

            btn.style.borderColor = isSelected ? 'var(--color-primary)' : nonSelectedBorder;
            btn.style.boxShadow = isSelected ? `0 0 0 3px var(--color-primary)` : nonSelectedShadow;
        });
    }
}
// Fine funzione handleImpostazioniClick

// Inizio funzione handleImpostazioniChange
function handleImpostazioniChange(event) {
    const app = getApp();
    if (!app) {
        console.error('App non disponibile');
        return;
    }
    const target = event.target;
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;

    if (target.matches('#dark-mode-toggle')) {
        // 1. Resetta il tema di colore a 'default'
        impostazioniState.theme = 'default';
        app.saveToStorage('theme', 'default');
        updateTheme(); // <-- Chiama la NUOVA updateTheme(), che rimuove data-theme

        // 2. Deseleziona tutti gli swatch
        modalContent.querySelectorAll('[data-theme]').forEach(btn => {
            const themeId = btn.dataset.theme;
            btn.style.borderColor = (themeId === 'night') ? '#424242' : 'var(--bg-primary)';
            btn.style.boxShadow = `0 0 0 1px ${themeId === 'night' ? '#616161' : 'var(--border-secondary)'}`;
        });

        // 3. Esegui il toggle del tema light/dark di default
        app.toggleTheme(); // <-- Aggiunge/rimuove .theme-dark
    }

    if (target.matches('#fullscreen-toggle')) toggleFullscreen();
    if (target.matches('#sidebar-collapse-toggle')) app.toggleSidebarCollapse();
    if (target.matches('#import-file')) importData.call(app, event);
}
// Fine funzione handleImpostazioniChange

// === SETUP EVENT LISTENERS ===
// Inizio funzione setupImpostazioniEventListeners
function setupImpostazioniEventListeners(app) {
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;
    if (modalContent.dataset.listenersAttached) return;
    modalContent.dataset.listenersAttached = 'true';
    modalContent.addEventListener('click', handleImpostazioniClick);
    modalContent.addEventListener('change', handleImpostazioniChange);
}
// Fine funzione setupImpostazioniEventListeners

// === FUNZIONI TEMA E DISPLAY ===
// Inizio funzione updateBorderRadius
function updateBorderRadius() {
    const radius = impostazioniState.borderRadius || 'medium';
    document.documentElement.setAttribute('data-theme-radius', radius);
}
// Fine funzione updateBorderRadius

// Inizio funzione updateTheme
function updateTheme() {
    const theme = impostazioniState.theme || 'default';
    if (theme === 'default') {
        // Rimuovi l'attributo per usare :root e .theme-dark
        document.documentElement.removeAttribute('data-theme');
    } else {
        // Applica il tema alternativo
        document.documentElement.setAttribute('data-theme', theme);
    }
}
// Fine funzione updateTheme

// Inizio funzione toggleFullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(err => alert(`Errore schermo intero: ${err.message}`));
    else if (document.exitFullscreen) document.exitFullscreen();
}
// Fine funzione toggleFullscreen

// Inizio funzione updateFullscreenToggle
function updateFullscreenToggle() {
    const toggle = document.getElementById('fullscreen-toggle');
    if (toggle) toggle.checked = impostazioniState.isFullscreen;
}
// Fine funzione updateFullscreenToggle

// === FUNZIONI IMPORT/EXPORT ===
// Inizio funzione exportData
function exportData() {
    const app = getApp();
    const dataToExport = {
        clients: app.state.data.clients || [],
        turni: app.state.data.turni || [],
        registryEntries: app.state.data.registryEntries || [],
        priceHistory: app.state.data.priceHistory || [],
        competitorPrices: app.state.data.competitorPrices || [],
        previousYearStock: app.state.data.previousYearStock || {
            benzina: 0,
            gasolio: 0,
            dieselPlus: 0,
            hvolution: 0
        },
        contatti: app.state.data.contatti || [],
        etichette: app.state.data.etichette || [],
        stazioni: app.state.data.stazioni || [],
        accounts: app.state.data.accounts || [],
        spese: app.state.data.spese || [],
        speseEtichette: app.state.data.speseEtichette || [],
        homeTodos: app.loadFromStorage('homeTodos', [])
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mystation_backup_' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
    URL.revokeObjectURL(url);
    app.showNotification('Dati esportati con successo!');
}
// Fine funzione exportData

// Inizio funzione importData
function importData(event) {
    const app = getApp();
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.clients) app.state.data.clients = importedData.clients || [];
            if (importedData.turni) app.state.data.turni = importedData.turni || [];
            if (importedData.registryEntries) app.state.data.registryEntries = importedData.registryEntries || [];
            if (importedData.priceHistory) app.state.data.priceHistory = importedData.priceHistory || [];
            if (importedData.competitorPrices) app.state.data.competitorPrices = importedData.competitorPrices || [];
            if (importedData.previousYearStock) app.state.data.previousYearStock = importedData.previousYearStock || {
                benzina: 0,
                gasolio: 0,
                dieselPlus: 0,
                hvolution: 0
            };
            if (importedData.contatti) app.state.data.contatti = importedData.contatti || [];
            if (importedData.etichette) app.state.data.etichette = importedData.etichette || [];
            if (importedData.stazioni) app.state.data.stazioni = importedData.stazioni || [];
            if (importedData.accounts) app.state.data.accounts = importedData.accounts || [];
            if (importedData.spese) app.state.data.spese = importedData.spese || [];
            if (importedData.speseEtichette) app.state.data.speseEtichette = importedData.speseEtichette || [];
            if (importedData.homeTodos) {
                app.saveToStorage('homeTodos', importedData.homeTodos);
                if (window.homeState) window.homeState.todos = importedData.homeTodos;
            }
            app.saveToStorage('data', app.state.data);
            app.showNotification('Dati importati con successo!');
            app.hideFormModal();
            app.switchSection(app.state.currentSection);
        } catch (error) {
            console.error("Errore importazione:", error);
            alert('Errore importazione: file non valido.');
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}
// Fine funzione importData

// Inizio funzione confirmReset
function confirmReset() {
    const app = getApp();
    app.showConfirm('Sei sicuro di voler eliminare tutti i dati?<br><br>Azione irreversibile.', () => resetAllData());
}
// Fine funzione confirmReset

// Inizio funzione resetAllData
function resetAllData() {
    localStorage.clear();
    const app = getApp();
    app.showNotification('Dati eliminati. Ricaricamento...');
    setTimeout(() => window.location.reload(), 1500);
}
// Fine funzione resetAllData

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initImpostazioni = initImpostazioni;
    window.showImpostazioniModal = showImpostazioniModal;
    window.impostazioniState = impostazioniState;
}
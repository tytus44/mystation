// =============================================
// FILE: impostazioni.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Impostazioni (tema, import/export, reset).
// --- MODIFICATO per percorsi relativi ai file .pdf ---
// =============================================

// === STATO LOCALE DEL MODULO IMPOSTAZIONI ===
let impostazioniState = {
    borderRadius: null,
    isFullscreen: false
};

// === INIZIALIZZAZIONE MODULO IMPOSTAZIONI ===
function initImpostazioni() {
    console.log('⚙️ Inizializzazione modulo Impostazioni...');
    // Durante l'inizializzazione usiamo 'this' perché viene chiamata con .call(this)
    impostazioniState.borderRadius = this.loadFromStorage('borderRadius', 'medium');
    updateBorderRadius();
    
    document.addEventListener('fullscreenchange', () => {
        impostazioniState.isFullscreen = !!document.fullscreenElement;
        updateFullscreenToggle();
    });
    
    console.log('✅ Modulo Impostazioni inizializzato');
}

// === MODAL IMPOSTAZIONI ===
function showImpostazioniModal(app) {
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;
    
    modalContent.classList.add('modal-wide');
    modalContent.innerHTML = getImpostazioniModalHTML(app);
    
    setupImpostazioniEventListeners(app);
    app.refreshIcons();
    app.showFormModal();
}

function getImpostazioniModalHTML(app) {
    return `
        <div class="card-body">

            <div class="impostazioni-layout">

                <div class="impostazioni-section" style="gap: 1.5rem;">
                    <h3 class="impostazioni-section-title">Personalizzazione</h3>

                    <div class="p-4" style="border: 1px solid var(--border-primary); border-radius: var(--radius-md);">
                        <label class="font-medium text-primary mb-3" style="display: block;">
                            Aspetto
                        </label>

                        <div class="space-y-4">
                            <div class="flex items-center justify-between w-full">
                                <span class="font-medium text-primary">Tema scuro</span>
                                <label class="switch">
                                    <input type="checkbox" id="dark-mode-toggle" ${app.state.isDarkMode ? 'checked' : ''}>
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
                        <label class="font-medium text-primary mb-4" style="display: block;">
                            Arrotondamento elementi
                        </label>
                        <div class="flex gap-4">
                            <button type="button" data-radius="none" class="btn ${impostazioniState.borderRadius === 'none' ? 'btn-primary active' : 'btn-secondary'}">
                                Nessuno
                            </button>
                            <button type="button" data-radius="medium" class="btn ${impostazioniState.borderRadius === 'medium' ? 'btn-primary active' : 'btn-secondary'}">
                                Medio
                            </button>
                            <button type="button" data-radius="high" class="btn ${impostazioniState.borderRadius === 'high' ? 'btn-primary active' : 'btn-secondary'}">
                                Alto
                            </button>
                        </div>
                    </div>
                </div>

                <div class="impostazioni-section">
                    <h3 class="impostazioni-section-title">Gestione Dati</h3>

                    <div class="space-y-4">
                        <div class="p-4" style="background-color: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: var(--radius-md);">
                            <label class="font-medium text-primary mb-2" style="display: block;">
                                <i data-lucide="database" style="width: 1.25rem; height: 1.25rem; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></i>
                                Backup e Ripristino
                            </label>
                            <p class="text-sm text-secondary mb-4">Esporta o importa i tuoi dati in formato JSON</p>

                            <div class="flex gap-4">
                                <button type="button" id="export-btn" class="btn btn-primary" style="flex-grow: 1;">
                                    <i data-lucide="download" class="mr-2"></i>
                                    <span>Esporta</span>
                                </button>
                                <button type="button" id="import-btn" class="btn btn-secondary" style="flex-grow: 1;">
                                    <i data-lucide="upload" class="mr-2"></i>
                                    <span>Importa</span>
                                </button>
                            </div>

                            <input type="file" id="import-file" accept=".json" style="display: none;">
                        </div>

                        <div class="p-4" style="background-color: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-md);">
                            <label class="font-medium mb-2" style="display: block; color: var(--color-success);">
                                <i data-lucide="printer" style="width: 1.25rem; height: 1.25rem; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></i>
                                Stampa Giornata
                            </label>
                            <p class="text-sm text-secondary mb-4">Stampa i fogli di inizio e fine giornata</p>

                            <div class="flex gap-4">
                                <a href="../pdf/foglio_inizio.pdf" target="_blank" class="btn btn-success" style="flex-grow: 1;">
                                    <i data-lucide="sun" class="mr-2"></i>
                                    <span>Inizio</span>
                                </a>
                                <a href="../pdf/foglio_fine.pdf" target="_blank" class="btn btn-secondary" style="flex-grow: 1;">
                                    <i data-lucide="moon" class="mr-2"></i>
                                    <span>Fine</span>
                                </a>
                            </div>
                        </div>
                        <div class="p-4" style="background-color: rgba(220, 38, 38, 0.05); border: 1px solid rgba(220, 38, 38, 0.2); border-radius: var(--radius-md);">
                            <label class="font-medium mb-2" style="display: block; color: var(--color-danger);">
                                <i data-lucide="alert-triangle" style="width: 1.25rem; height: 1.25rem; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></i>
                                Zona di pericolo
                            </label>
                            <p class="text-sm text-secondary mb-4">Questa operazione eliminerà permanentemente tutti i dati salvati</p>
                            <button type="button" id="reset-data-btn" class="btn btn-danger w-full">
                                <i data-lucide="trash-2"></i>
                                <span>Cancella tutti i dati</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-actions" style="border-top: 1px solid var(--border-primary); padding-top: 1.5rem; margin-top: 1.5rem;">
                <button id="close-impostazioni-btn" class="btn btn-secondary">Chiudi</button>
            </div>
        </div>
    `;
}

// === EVENT HANDLERS ===
function handleImpostazioniClick(event) {
    const app = getApp();
    if (!app) {
        console.error('App non disponibile');
        return;
    }
    
    const target = event.target;
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;

    if (target.closest('#import-btn')) {
        modalContent.querySelector('#import-file')?.click();
    }
    if (target.closest('#export-btn')) {
        exportData.call(app);
    }
    if (target.closest('#reset-data-btn')) {
        confirmReset.call(app);
    }
    if (target.closest('#close-impostazioni-btn')) {
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
}

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
        if (target.checked !== app.state.isDarkMode) {
            app.toggleTheme();
        }
    }
    if (target.matches('#fullscreen-toggle')) {
        toggleFullscreen();
    }
    if (target.matches('#sidebar-collapse-toggle')) {
        app.toggleSidebarCollapse();
    }
    if (target.matches('#import-file')) {
        importData.call(app, event);
    }
}

// === SETUP EVENT LISTENERS ===
function setupImpostazioniEventListeners(app) {
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;

    // --- INIZIO MODIFICA (Risolve il bug del doppio click) ---
    // Usiamo un attributo "guardia" per assicurarci di aggiungere
    // i listener SOLO UNA VOLTA per ogni apertura del modale.
    if (modalContent.dataset.listenersAttached) {
        return; // Listener già collegati
    }
    modalContent.dataset.listenersAttached = 'true';
    // --- FINE MODIFICA ---

    // Rimuoviamo le vecchie chiamate a removeEventListener
    // modalContent.removeEventListener('click', handleImpostazioniClick);
    // modalContent.removeEventListener('change', handleImpostazioniChange);

    modalContent.addEventListener('click', handleImpostazioniClick);
    modalContent.addEventListener('change', handleImpostazioniChange);
}

// === FUNZIONI TEMA E DISPLAY ===

function updateBorderRadius() {
    const radius = impostazioniState.borderRadius || 'medium';
    document.documentElement.setAttribute('data-theme-radius', radius);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Errore nell'attivare la modalita a schermo intero: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function updateFullscreenToggle() {
    const toggle = document.getElementById('fullscreen-toggle');
    if (toggle) {
        toggle.checked = impostazioniState.isFullscreen;
    }
}

// === FUNZIONI IMPORT/EXPORT ===

function exportData() {
    const app = getApp();
    
    // Crea un oggetto con TUTTI i dati dell'applicazione
    const dataToExport = {
        // Dati principali dell'applicazione
        clients: app.state.data.clients || [],
        turni: app.state.data.turni || [],
        registryEntries: app.state.data.registryEntries || [],
        priceHistory: app.state.data.priceHistory || [],
        competitorPrices: app.state.data.competitorPrices || [],
        previousYearStock: app.state.data.previousYearStock || { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 },
        
        // ✅ DATI ANAGRAFICA (Rubrica contatti + etichette)
        contatti: app.state.data.contatti || [],
        etichette: app.state.data.etichette || [],
        
        // ✅ DATI STAZIONI ENI
        stazioni: app.state.data.stazioni || [],
        
        // ✅ DATI ACCOUNT PERSONALI
        accounts: app.state.data.accounts || [],
        
        // --- INIZIO MODIFICA (Aggiunta Spese) ---
        spese: app.state.data.spese || [],
        speseEtichette: app.state.data.speseEtichette || [],
        // --- FINE MODIFICA ---
        
        // Todo list della home (salvati separatamente in localStorage)
        homeTodos: app.loadFromStorage('homeTodos', [])
    };

    // Crea il file JSON
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

function importData(event) {
    const app = getApp();
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);

            // Importa TUTTI i dati
            if (importedData.clients) app.state.data.clients = importedData.clients || [];
            if (importedData.turni) app.state.data.turni = importedData.turni || [];
            if (importedData.registryEntries) app.state.data.registryEntries = importedData.registryEntries || [];
            if (importedData.priceHistory) app.state.data.priceHistory = importedData.priceHistory || [];
            if (importedData.competitorPrices) app.state.data.competitorPrices = importedData.competitorPrices || [];
            if (importedData.previousYearStock) app.state.data.previousYearStock = importedData.previousYearStock || { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 };
            
            // ✅ IMPORTA ANAGRAFICA (Rubrica contatti + etichette)
            if (importedData.contatti) app.state.data.contatti = importedData.contatti || [];
            if (importedData.etichette) app.state.data.etichette = importedData.etichette || [];
            
            // ✅ IMPORTA STAZIONI ENI
            if (importedData.stazioni) app.state.data.stazioni = importedData.stazioni || [];
            
            // ✅ IMPORTA ACCOUNT PERSONALI
            if (importedData.accounts) app.state.data.accounts = importedData.accounts || [];

            // --- INIZIO MODIFICA (Aggiunta Spese) ---
            if (importedData.spese) app.state.data.spese = importedData.spese || [];
            if (importedData.speseEtichette) app.state.data.speseEtichette = importedData.speseEtichette || [];
            // --- FINE MODIFICA ---

            // Importa todo list della home
            if (importedData.homeTodos) {
                app.saveToStorage('homeTodos', importedData.homeTodos);
                if (window.homeState) {
                    window.homeState.todos = importedData.homeTodos;
                }
            }

            // Salva tutto in localStorage
            app.saveToStorage('data', app.state.data);
            
            app.showNotification('Dati importati con successo!');
            app.hideFormModal();
            
            // Ricarica la sezione corrente per mostrare i nuovi dati
            app.switchSection(app.state.currentSection); 
            
        } catch (error) {
            console.error("Errore during l'importazione:", error);
            alert('Errore durante l\'importazione: file non valido o corrotto.');
        } finally {
            // Reset del file input
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}

function confirmReset() {
    const app = getApp();
    app.showConfirm(
        'Sei sicuro di voler eliminare tutti i dati?<br><br>Questa azione è irreversibile.',
        () => resetAllData()
    );
}

function resetAllData() {
    localStorage.clear();
    const app = getApp();
    app.showNotification('Tutti i dati sono stati eliminati. Ricaricamento in corso...');

    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initImpostazioni = initImpostazioni;
    window.showImpostazioniModal = showImpostazioniModal;
    window.impostazioniState = impostazioniState;
}
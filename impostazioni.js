// =============================================
// FILE: impostazioni.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della 
// sezione Impostazioni (tema, import/export, reset).
// =============================================

// === STATO LOCALE DEL MODULO IMPOSTAZIONI ===
let impostazioniState = {
    isFullscreen: false,
    isSidebarCollapsed: false
};

// === INIZIALIZZAZIONE MODULO IMPOSTAZIONI ===
// Inizio funzione initImpostazioni
function initImpostazioni() {
    console.log('Inizializzazione modulo Impostazioni...');
    impostazioniState.isSidebarCollapsed = this.loadFromStorage('isSidebarCollapsed', false);
    
    document.addEventListener('fullscreenchange', () => {
        impostazioniState.isFullscreen = !!document.fullscreenElement;
        updateFullscreenToggle();
    });
    
    console.log('Modulo Impostazioni inizializzato');
}
// Fine funzione initImpostazioni

// === HTML DEL MODALE IMPOSTAZIONI ===
// Inizio funzione getImpostazioniModalHTML
function getImpostazioniModalHTML() {
    const app = getApp();
    return `
        <div class="card-header">
            <h2 class="card-title">Impostazioni</h2>
        </div>
        <div class="card-body space-y-6">
            
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
                        <input type="checkbox" id="sidebar-collapse-toggle" ${impostazioniState.isSidebarCollapsed ? 'checked' : ''}>
                        <span class="switch-slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="border-t border-primary pt-6">
                
                <div class="grid grid-cols-2 gap-4">
                    <input type="file" id="import-file" accept=".json" class="hidden">
                    <button id="import-btn" class="btn btn-secondary w-full p-4 text-center">
                        <i data-lucide="upload" class="w-5 h-5 mr-2"></i> Importa Backup
                    </button>
                    <button id="export-btn" class="btn btn-secondary w-full p-4 text-center">
                        <i data-lucide="download" class="w-5 h-5 mr-2"></i> Esporta Backup
                    </button>
                </div>
            </div>
            
            <div class="card border-danger mt-6">
                <div class="card-body">
                    
                    <p class="text-sm text-danger mb-4">
                        Questa azione eliminerà permanentemente tutti i dati dell'applicazione. Non può essere annullata.
                    </p>
                    <button id="reset-data-btn" class="btn btn-danger">
                        <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i> Reset Tutti i Dati
                    </button>
                </div>
            </div>
            
            <div style="text-align: center; font-size: 0.875rem; color: var(--text-secondary); margin-top: 1.5rem;">
                <a href="https://github.com/tytus44/mystation" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); font-weight: 600; text-decoration: none;">MyStation</a>, programmato con ❤️ da NeRO.
            </div>
            
            <div class="modal-actions border-t border-primary pt-6 mt-6">
                <button id="close-impostazioni-btn" class="btn btn-secondary">Chiudi</button>
            </div>
        </div>
    `;
}
// Fine funzione getImpostazioniModalHTML

// === FUNZIONE PER MOSTRARE IL MODALE ===
// Inizio funzione showImpostazioniModal
function showImpostazioniModal() {
    const app = getApp();
    const modalContentEl = document.getElementById('form-modal-content');
    
    modalContentEl.innerHTML = getImpostazioniModalHTML();
    
    setupImpostazioniEventListeners();
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showImpostazioniModal

// === SETUP EVENT LISTENERS ===
// INIZIO MODIFICA: La logica dei listener è stata riscritta per maggiore robustezza
// Inizio funzione setupImpostazioniEventListeners
function setupImpostazioniEventListeners() {
    const app = getApp();
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;

    // Listener centralizzato per tutti i click all'interno del modale
    modalContent.addEventListener('click', (event) => {
        const target = event.target;
        
        // Gestione dei pulsanti principali
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
    });

    // Listener per gli input (toggle e file)
    modalContent.addEventListener('change', (event) => {
        const target = event.target;

        if (target.matches('#dark-mode-toggle')) {
            app.toggleTheme();
        }
        if (target.matches('#fullscreen-toggle')) {
            toggleFullscreen();
        }
        if (target.matches('#sidebar-collapse-toggle')) {
            toggleSidebarCollapse.call(app);
        }
        if (target.matches('#import-file')) {
            importData.call(app, event);
        }
    });
}
// Fine funzione setupImpostazioniEventListeners
// FINE MODIFICA

// === FUNZIONI TEMA E DISPLAY ===
// Inizio funzione toggleSidebarCollapse
function toggleSidebarCollapse() {
    impostazioniState.isSidebarCollapsed = !impostazioniState.isSidebarCollapsed;
    this.saveToStorage('isSidebarCollapsed', impostazioniState.isSidebarCollapsed);
    this.updateSidebarLayout();
}
// Fine funzione toggleSidebarCollapse

// Inizio funzione toggleFullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Errore nell'attivare la modalità a schermo intero: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}
// Fine funzione toggleFullscreen

// Inizio funzione updateFullscreenToggle
function updateFullscreenToggle() {
    const toggle = document.getElementById('fullscreen-toggle');
    if (toggle) {
        toggle.checked = impostazioniState.isFullscreen;
    }
}
// Fine funzione updateFullscreenToggle

// === FUNZIONI IMPORT/EXPORT ===

// INIZIO MODIFICA: Funzione di normalizzazione resa più completa per gestire tutte le casistiche
// Inizio funzione normalizeImportedData
function normalizeImportedData(data) {
    console.log('Normalizzazione dati importati...');
    let normalizedData = JSON.parse(JSON.stringify(data));

    // 1. Normalizza i turni usando la funzione dedicata da virtual.js
    if (normalizedData.turni && typeof window.normalizeTurniData === 'function') {
        normalizedData.turni = window.normalizeTurniData(normalizedData.turni);
    }

    // 2. Normalizza le transazioni dei clienti (rimuove la vecchia proprietà 'type')
    if (normalizedData.clients && Array.isArray(normalizedData.clients)) {
        normalizedData.clients.forEach(client => {
            if (client.transactions && Array.isArray(client.transactions)) {
                client.transactions.forEach(tx => {
                    if (tx.type) {
                        delete tx.type;
                    }
                });
            }
        });
    }
    
    // 3. Assicura che i campi opzionali esistano
    if (!normalizedData.contatti) normalizedData.contatti = [];
    if (!normalizedData.etichette) normalizedData.etichette = [];
    if (!normalizedData.previousYearStock) {
        normalizedData.previousYearStock = { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 };
    }

    console.log('Normalizzazione completata.');
    return normalizedData;
}
// Fine funzione normalizeImportedData
// FINE MODIFICA

// Inizio funzione importData
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);

            if (!importedData || !importedData.data || !importedData.version) {
                this.showNotification('File di backup non valido o corrotto.');
                return;
            }

            this.showConfirm(
                'Sei sicuro di voler importare questo file? Tutti i dati attuali verranno sovrascritti.',
                () => {
                    const normalizedData = normalizeImportedData(importedData.data);
                    this.state.data = normalizedData;
                    
                    if (importedData.data.homeTodos) {
                        this.saveToStorage('homeTodos', importedData.data.homeTodos);
                    }
                    
                    this.saveToStorage('data', this.state.data);
                    
                    this.showNotification('Dati importati con successo! Ricaricamento dell\'applicazione...');
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                }
            );

        } catch (error) {
            this.showNotification('Errore durante la lettura del file JSON.');
            console.error('Import error:', error);
        } finally {
            event.target.value = '';
        }
    };

    reader.readAsText(file);
}
// Fine funzione importData

// Inizio funzione exportData
function exportData() {
    const exportDate = this.formatDateForFilename();
    
    const homeTodos = this.loadFromStorage('homeTodos', []);

    const dataToExport = {
        exportDate: new Date().toISOString(),
        version: '4.1.0',
        framework: 'vanilla-js',
        data: {
            ...this.state.data,
            homeTodos: homeTodos
        }
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `mystation_backup_${exportDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showNotification('Dati esportati con successo');
}
// Fine funzione exportData

// === FUNZIONI RESET ===
// Inizio funzione confirmReset
function confirmReset() {
    this.showConfirm('Sei sicuro di voler eliminare TUTTI i dati dell\'applicazione? Questa azione non può essere annullata.', () => {
        resetAllData.call(this);
    });
}
// Fine funzione confirmReset

// Inizio funzione resetAllData
function resetAllData() {
    this.state.data = {
        clients: [],
        registryEntries: [],
        priceHistory: [],
        competitorPrices: [],
        turni: [],
        contatti: [],
        etichette: [],
        previousYearStock: { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 }
    };
    this.saveToStorage('data', this.state.data);
    
    const keysToRemove = ['isDarkMode', 'isSidebarCollapsed', 'currentSection', 'virtualFilterMode', 'registryTimeFilter', 'ordineCarburante', 'homeTodos'];
    keysToRemove.forEach(key => localStorage.removeItem(`mystation_${key}`));
    
    this.showNotification('Tutti i dati sono stati eliminati. Ricaricamento in corso...');
    
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}
// Fine funzione resetAllData

// Inizio funzione showCustomModal
function showCustomModal(contentHTML, modalClass = '') {
    const existingModal = document.getElementById('custom-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalElement = document.createElement('div');
    modalElement.id = 'custom-modal';
    modalElement.className = 'modal show';
    modalElement.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content ${modalClass}">
            ${contentHTML}
        </div>
    `;

    document.body.appendChild(modalElement);
    
    modalElement.addEventListener('click', (e) => {
        if (e.target.closest('.modal-close-btn')) {
            closeCustomModal();
        }
    });

    const app = getApp();
    if (app && app.refreshIcons) {
        setTimeout(() => app.refreshIcons(), 100);
    }
}
// Fine funzione showCustomModal

// Inizio funzione closeCustomModal
function closeCustomModal() {
    const modal = document.getElementById('custom-modal');
    if (modal) {
        modal.remove();
    }
}
// Fine funzione closeCustomModal


// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initImpostazioni = initImpostazioni;
    window.showImpostazioniModal = showImpostazioniModal;
    window.impostazioniState = impostazioniState;
}
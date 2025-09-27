// =============================================
// FILE: impostazioni.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della 
// sezione Impostazioni (tema, import/export, reset).
// --- MODIFICATO PER GESTIRE SOLO IMPORT DA JSON DI BACKUP ---
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
    // CORREZIONE: Durante l'init, si usa 'this' perché la variabile globale 'app' non è ancora pronta.
    impostazioniState.isSidebarCollapsed = this.loadFromStorage('isSidebarCollapsed', false);
    
    // Listener per cambiamenti fullscreen
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
                        <i data-lucide="upload" class="w-5 h-5 mr-2"></i> Importa Backup (JSON)
                    </button>
                    <button id="export-btn" class="btn btn-secondary w-full p-4 text-center">
                        <i data-lucide="download" class="w-5 h-5 mr-2"></i> Esporta Backup (JSON)
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
    modalContentEl.classList.add('modal-wide');

    // Aggiunto un pulsante di chiusura generico se necessario, o si affida al backdrop
    const closeButton = document.createElement('button');
    closeButton.innerHTML = `<i data-lucide="x"></i>`;
    closeButton.className = 'btn btn-secondary modal-close-btn'; // Assicurati che questa classe esista e sia stilizzata
    closeButton.style.position = 'absolute';
    closeButton.style.top = '1rem';
    closeButton.style.right = '1rem';
    closeButton.onclick = () => app.hideFormModal();
    // Non lo aggiungiamo più
    
    setupImpostazioniEventListeners();
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showImpostazioniModal

// === SETUP EVENT LISTENERS ===
// Inizio funzione setupImpostazioniEventListeners
function setupImpostazioniEventListeners() {
    const app = getApp();
    
    // MODIFICA: Aggiunto listener per il nuovo pulsante di chiusura
    const closeBtn = document.getElementById('close-impostazioni-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => app.hideFormModal());
    }

    // Toggle tema scuro
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            app.toggleTheme();
        });
    }
    
    // Toggle fullscreen
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    if (fullscreenToggle) {
        fullscreenToggle.addEventListener('change', () => {
            toggleFullscreen();
        });
    }

    // Toggle sidebar collapse
    const sidebarCollapseToggle = document.getElementById('sidebar-collapse-toggle');
    if (sidebarCollapseToggle) {
        sidebarCollapseToggle.addEventListener('change', () => {
            toggleSidebarCollapse.call(app);
        });
    }
    
    // Import dati
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => {
            importFile.click();
        });
        
        importFile.addEventListener('change', (event) => {
            importData.call(app, event);
        });
    }
    
    // Export dati
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportData.call(app);
        });
    }
    
    // Reset dati
    const resetBtn = document.getElementById('reset-data-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            confirmReset.call(app);
        });
    }
}
// Fine funzione setupImpostazioniEventListeners

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
// Inizio funzione importData
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);

            // Verifica che il file sia un backup valido creato da questa applicazione
            if (!importedData || !importedData.data || !importedData.version) {
                this.showNotification('File di backup non valido o corrotto.');
                return;
            }

            this.showConfirm(
                'Sei sicuro di voler importare questo file? Tutti i dati attuali verranno sovrascritti.',
                () => {
                    // Normalizza i dati dei turni per compatibilità
                    if (importedData.data.turni && typeof window.normalizeTurniData === 'function') {
                        importedData.data.turni = window.normalizeTurniData(importedData.data.turni);
                    }

                    // Sostituisci i dati attuali con quelli importati
                    this.state.data = importedData.data;
                    
                    // CORREZIONE: Importa anche note e to-do, se presenti
                    if (importedData.data.homeNotes) {
                        this.saveToStorage('homeNotes', importedData.data.homeNotes);
                    }
                    if (importedData.data.homeTodos) {
                        this.saveToStorage('homeTodos', importedData.data.homeTodos);
                    }
                    
                    this.saveToStorage('data', this.state.data);
                    
                    this.showNotification('Dati importati con successo! Ricaricamento dell\'applicazione...');
                    
                    // Ricarica l'applicazione per rendere effettive le modifiche
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                }
            );

        } catch (error) {
            this.showNotification('Errore durante la lettura del file JSON.');
            console.error('Import error:', error);
        } finally {
            event.target.value = ''; // Resetta l'input file
        }
    };

    reader.readAsText(file);
}
// Fine funzione importData

// Inizio funzione exportData
function exportData() {
    const exportDate = this.formatDateForFilename();
    
    // CORREZIONE: Carica note e to-do dal localStorage per includerli nel backup
    const homeNotes = this.loadFromStorage('homeNotes', []);
    const homeTodos = this.loadFromStorage('homeTodos', []);

    const dataToExport = {
        exportDate: new Date().toISOString(),
        version: '4.1.0', // Versione aggiornata
        framework: 'vanilla-js',
        data: {
            ...this.state.data,
            homeNotes: homeNotes,
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
    // Svuota i dati principali
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
    
    // Rimuovi altre chiavi di configurazione dal localStorage
    const keysToRemove = ['isDarkMode', 'isSidebarCollapsed', 'currentSection', 'virtualFilterMode', 'registryTimeFilter', 'ordineCarburante', 'homeNotes', 'homeTodos'];
    keysToRemove.forEach(key => localStorage.removeItem(`mystation_${key}`));
    
    this.showNotification('Tutti i dati sono stati eliminati. Ricaricamento in corso...');
    
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}
// Fine funzione resetAllData

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initImpostazioni = initImpostazioni;
    window.showImpostazioniModal = showImpostazioniModal;
    window.impostazioniState = impostazioniState;
}
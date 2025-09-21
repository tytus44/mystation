// =============================================
// FILE: impostazioni.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della 
// sezione Impostazioni (tema, import/export, reset).
// --- MODIFICATO PER USARE UN MODALE STANDARD ---
// =============================================

// === STATO LOCALE DEL MODULO IMPOSTAZIONI ===
let impostazioniState = {
    isFullscreen: false
};

// === INIZIALIZZAZIONE MODULO IMPOSTAZIONI ===
// Inizio funzione initImpostazioni
function initImpostazioni() {
    console.log('Inizializzazione modulo Impostazioni...');
    
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
            <button id="cancel-impostazioni-btn" class="btn btn-secondary modal-close-btn">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div class="card-body space-y-6">
            
            <div class="space-y-4">
                <h3 class="text-md font-medium text-primary">Aspetto e Display</h3>
                
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
            </div>
            
            <div class="border-t border-primary pt-6">
                <h3 class="text-md font-medium text-primary mb-4">Gestione Dati</h3>
                <div class="grid grid-cols-2 gap-4">
                    <input type="file" id="import-file" accept=".json" class="hidden">
                    <button id="import-btn" class="btn btn-secondary w-full p-4 text-center">
                        <i data-lucide="upload" class="w-5 h-5 mr-2"></i> Importa Dati (JSON)
                    </button>
                    <button id="export-btn" class="btn btn-secondary w-full p-4 text-center">
                        <i data-lucide="download" class="w-5 h-5 mr-2"></i> Esporta Dati (JSON)
                    </button>
                </div>
            </div>
            
            <div class="card border-danger mt-6">
                <div class="card-body">
                    <h3 class="font-semibold text-danger mb-2">Zona Pericolosa</h3>
                    <p class="text-sm text-danger mb-4">
                        Questa azione eliminerà permanentemente tutti i dati dell'applicazione. Non può essere annullata.
                    </p>
                    <button id="reset-data-btn" class="btn btn-danger">
                        <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i> Reset Tutti i Dati
                    </button>
                </div>
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

    setupImpostazioniEventListeners();
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showImpostazioniModal

// === SETUP EVENT LISTENERS ===
// Inizio funzione setupImpostazioniEventListeners
function setupImpostazioniEventListeners() {
    const app = getApp();
    
    // Pulsante chiusura modale
    const cancelBtn = document.getElementById('cancel-impostazioni-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => app.hideFormModal());
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
            
            if (importedData.data) {
                // Formato nuovo
                console.log('Importazione formato nuovo rilevata');
                
                if (importedData.data.turni && Array.isArray(importedData.data.turni)) {
                    console.log('Normalizzazione turni per formato nuovo...');
                    importedData.data.turni = window.normalizeTurniData(importedData.data.turni);
                    console.log('Normalizzati ' + importedData.data.turni.length + ' turni');
                }
                
                Object.assign(this.state.data, importedData.data);
            } else {
                // Formato legacy
                console.log('Importazione formato legacy rilevata');
                handleLegacyImport.call(this, importedData);
            }
            
            this.saveToStorage('data', this.state.data);
            
            this.showNotification('Dati importati con successo');
            event.target.value = ''; 
            
            this.hideFormModal();
            setTimeout(() => {
                const currentSection = this.state.currentSection;
                this.switchSection(currentSection);
            }, 500);
            
        } catch (error) {
            this.showNotification('Errore durante l\'importazione del file');
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file);
}
// Fine funzione importData

// Inizio funzione handleLegacyImport
function handleLegacyImport(importedData) {
    const merge = confirm('File legacy rilevato. Vuoi unire i dati con quelli esistenti? Annulla per sostituire.');
    
    const importSection = (sectionName, legacyName) => {
        if (importedData[legacyName] && Array.isArray(importedData[legacyName])) {
            let dataToImport = importedData[legacyName];
            
            if (sectionName === 'turni') {
                console.log('Applicando normalizzazione ai turni importati...');
                dataToImport = window.normalizeTurniData(dataToImport);
                console.log('Normalizzati ' + dataToImport.length + ' turni');
            }
            
            if (merge) {
                this.state.data[sectionName] = [...this.state.data[sectionName], ...dataToImport];
            } else {
                this.state.data[sectionName] = dataToImport;
            }
        }
    };
    
    importSection('clients', 'clients');
    importSection('registryEntries', 'registryEntries');
    importSection('priceHistory', 'priceHistory');
    importSection('competitorPrices', 'competitorPrices');
    importSection('turni', 'turni');
}
// Fine funzione handleLegacyImport

// Inizio funzione exportData
function exportData() {
    const exportDate = this.formatDateForFilename();
    const dataToExport = {
        exportDate: new Date().toISOString(),
        version: '4.0.0',
        framework: 'vanilla-js',
        data: this.state.data
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
        previousYearStock: {
            benzina: 0,
            gasolio: 0,
            dieselPlus: 0,
            hvolution: 0
        }
    };
    
    this.saveToStorage('data', this.state.data);
    
    localStorage.removeItem('virtualFilterMode');
    localStorage.removeItem('amministrazioneViewMode');
    localStorage.removeItem('adminFilters');
    localStorage.removeItem('registryViewMode');
    localStorage.removeItem('ordineCarburante');
    
    this.showNotification('Tutti i dati sono stati eliminati');
    
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}
// Fine funzione resetAllData

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initImpostazioni = initImpostazioni;
    window.showImpostazioniModal = showImpostazioniModal;
    window.impostazioniState = impostazioniState;
}
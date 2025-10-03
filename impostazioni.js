// =============================================
// FILE: impostazioni.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della 
// sezione Impostazioni (tema, import/export, reset).
// =============================================

// === STATO LOCALE DEL MODULO IMPOSTAZIONI ===
// INIZIO MODIFICA: Rimosso isSidebarCollapsed dallo stato locale
let impostazioniState = {
    isFullscreen: false,
    borderRadius: 'medium',
    colorTheme: 'default' 
};
// FINE MODIFICA

// === INIZIALIZZAZIONE MODULO IMPOSTAZIONI ===
// Inizio funzione initImpostazioni
function initImpostazioni() {
    console.log('Inizializzazione modulo Impostazioni...');
    const app = this;
    
    // INIZIO MODIFICA: Rimosso il caricamento dello stato del sidebar da questo modulo
    // FINE MODIFICA
    
    impostazioniState.borderRadius = app.loadFromStorage('borderRadius', 'medium');
    updateBorderRadius();
    
    impostazioniState.colorTheme = app.loadFromStorage('colorTheme', 'default');
    updateColorTheme();
    
    document.addEventListener('fullscreenchange', () => {
        impostazioniState.isFullscreen = !!document.fullscreenElement;
        updateFullscreenToggle();
    });
    
    console.log('Modulo Impostazioni inizializzato');
}
// Fine funzione initImpostazioni

// === HTML DEL MODALE IMPOSTAZIONI ===
// Inizio funzione getImpostazioniModalHTML
function getImpostazioniModalHTML(app) {
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
                        {/* INIZIO MODIFICA: Legge lo stato direttamente da app.state */}
                        <input type="checkbox" id="sidebar-collapse-toggle" ${app.state.isSidebarCollapsed ? 'checked' : ''}>
                        {/* FINE MODIFICA */}
                        <span class="switch-slider"></span>
                    </label>
                </div>

                <div class="flex items-center justify-between w-full">
                    <span class="font-medium text-primary">Arrotondamento</span>
                    <div class="btn-group">
                        <button class="btn btn-sm ${impostazioniState.borderRadius === 'none' ? 'btn-primary active' : 'btn-secondary'}" data-radius="none" title="Nessuno">
                            <i data-lucide="square"></i>
                        </button>
                        <button class="btn btn-sm ${impostazioniState.borderRadius === 'medium' ? 'btn-primary active' : 'btn-secondary'}" data-radius="medium" title="Medio">
                            <i data-lucide="rectangle-horizontal"></i>
                        </button>
                        <button class="btn btn-sm ${impostazioniState.borderRadius === 'high' ? 'btn-primary active' : 'btn-secondary'}" data-radius="high" title="Elevato">
                            <i data-lucide="circle"></i>
                        </button>
                    </div>
                </div>

                <div class="flex items-center justify-between w-full">
                    <span class="font-medium text-primary">Temi Extra</span>
                    <div class="color-theme-grid" style="display: flex; gap: 8px; align-items: center;">
                        <label class="color-theme-option" style="cursor: pointer;" title="Default">
                            <input type="radio" name="color-theme" value="default" ${impostazioniState.colorTheme === 'default' ? 'checked' : ''} style="display: none;">
                            <div class="color-theme-circle" style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: 2px solid ${impostazioniState.colorTheme === 'default' ? 'var(--color-primary)' : 'transparent'}; box-shadow: 0 2px 6px rgba(0,0,0,0.1); transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;">
                                ${impostazioniState.colorTheme === 'default' ? '<span style="color: white; font-size: 14px; font-weight: bold;">✓</span>' : ''}
                            </div>
                        </label>
                        
                        <label class="color-theme-option" style="cursor: pointer;" title="Viola">
                            <input type="radio" name="color-theme" value="viola" ${impostazioniState.colorTheme === 'viola' ? 'checked' : ''} style="display: none;">
                            <div class="color-theme-circle" style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border: 2px solid ${impostazioniState.colorTheme === 'viola' ? 'var(--color-primary)' : 'transparent'}; box-shadow: 0 2px 6px rgba(0,0,0,0.1); transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;">
                                ${impostazioniState.colorTheme === 'viola' ? '<span style="color: white; font-size: 14px; font-weight: bold;">✓</span>' : ''}
                            </div>
                        </label>
                        
                        <label class="color-theme-option" style="cursor: pointer;" title="Azzurro">
                            <input type="radio" name="color-theme" value="azzurro" ${impostazioniState.colorTheme === 'azzurro' ? 'checked' : ''} style="display: none;">
                            <div class="color-theme-circle" style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); border: 2px solid ${impostazioniState.colorTheme === 'azzurro' ? 'var(--color-primary)' : 'transparent'}; box-shadow: 0 2px 6px rgba(0,0,0,0.1); transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;">
                                ${impostazioniState.colorTheme === 'azzurro' ? '<span style="color: white; font-size: 14px; font-weight: bold;">✓</span>' : ''}
                            </div>
                        </label>
                        
                        <label class="color-theme-option" style="cursor: pointer;" title="Verde">
                            <input type="radio" name="color-theme" value="verde" ${impostazioniState.colorTheme === 'verde' ? 'checked' : ''} style="display: none;">
                            <div class="color-theme-circle" style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: 2px solid ${impostazioniState.colorTheme === 'verde' ? 'var(--color-primary)' : 'transparent'}; box-shadow: 0 2px 6px rgba(0,0,0,0.1); transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;">
                                ${impostazioniState.colorTheme === 'verde' ? '<span style="color: white; font-size: 14px; font-weight: bold;">✓</span>' : ''}
                            </div>
                        </label>
                        
                        <label class="color-theme-option" style="cursor: pointer;" title="Arancione">
                            <input type="radio" name="color-theme" value="arancione" ${impostazioniState.colorTheme === 'arancione' ? 'checked' : ''} style="display: none;">
                            <div class="color-theme-circle" style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border: 2px solid ${impostazioniState.colorTheme === 'arancione' ? 'var(--color-primary)' : 'transparent'}; box-shadow: 0 2px 6px rgba(0,0,0,0.1); transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;">
                                ${impostazioniState.colorTheme === 'arancione' ? '<span style="color: white; font-size: 14px; font-weight: bold;">✓</span>' : ''}
                            </div>
                        </label>
                        
                        <label class="color-theme-option" style="cursor: pointer;" title="Rosa">
                            <input type="radio" name="color-theme" value="rosa" ${impostazioniState.colorTheme === 'rosa' ? 'checked' : ''} style="display: none;">
                            <div class="color-theme-circle" style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); border: 2px solid ${impostazioniState.colorTheme === 'rosa' ? 'var(--color-primary)' : 'transparent'}; box-shadow: 0 2px 6px rgba(0,0,0,0.1); transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;">
                                ${impostazioniState.colorTheme === 'rosa' ? '<span style="color: white; font-size: 14px; font-weight: bold;">✓</span>' : ''}
                            </div>
                        </label>
                    </div>
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
                        ATTENZIONE! Tutti i dati saranno eliminati definitivamente!                    </p>
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
function showImpostazioniModal(app) {
    const modalContentEl = document.getElementById('form-modal-content');
    
    modalContentEl.innerHTML = getImpostazioniModalHTML(app);
    setupImpostazioniEventListeners(app);

    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showImpostazioniModal

// === SETUP EVENT LISTENERS ===
// Inizio funzione setupImpostazioniEventListeners
function setupImpostazioniEventListeners(app) {
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;

    modalContent.addEventListener('click', (event) => {
        const target = event.target;
        
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
    });

    modalContent.addEventListener('change', (event) => {
        const target = event.target;

        if (target.matches('#dark-mode-toggle')) {
            if (target.checked !== app.state.isDarkMode) {
                app.toggleTheme();
            }
        }
        if (target.matches('#fullscreen-toggle')) {
            toggleFullscreen();
        }
        // INIZIO MODIFICA: Chiama la funzione centralizzata in app.js
        if (target.matches('#sidebar-collapse-toggle')) {
            app.toggleSidebarCollapse();
        }
        // FINE MODIFICA
        if (target.matches('#import-file')) {
            importData.call(app, event);
        }
        
        // Gestione dei radio button per i temi colorati
        if (target.matches('input[name="color-theme"]')) {
            const newTheme = target.value;
            impostazioniState.colorTheme = newTheme;
            app.saveToStorage('colorTheme', newTheme);
            updateColorTheme();
            
            // Aggiorna visivamente i cerchi colorati
            modalContent.querySelectorAll('.color-theme-circle').forEach(circle => {
                const radio = circle.previousElementSibling || circle.parentElement.querySelector('input[type="radio"]');
                if (!radio) {
                    radio = circle.closest('label').querySelector('input[type="radio"]');
                }
                
                const isChecked = radio && radio.checked;
                circle.style.border = isChecked ? '2px solid var(--color-primary)' : '2px solid transparent';
                circle.innerHTML = isChecked ? '<span style="color: white; font-size: 14px; font-weight: bold;">✓</span>' : '';
            });
        }
    });
}
// Fine funzione setupImpostazioniEventListeners


// === FUNZIONI TEMA E DISPLAY ===

// Inizio funzione updateColorTheme
function updateColorTheme() {
    const theme = impostazioniState.colorTheme || 'default';
    document.documentElement.setAttribute('data-color-theme', theme);
    
    if (typeof updateChartsTheme === 'function') {
        updateChartsTheme();
    }
}
// Fine funzione updateColorTheme

// Inizio funzione updateBorderRadius
function updateBorderRadius() {
    const radius = impostazioniState.borderRadius || 'medium';
    document.documentElement.setAttribute('data-theme-radius', radius);
}
// Fine funzione updateBorderRadius

// INIZIO MODIFICA: Rimossa la funzione toggleSidebarCollapse da questo modulo
// FINE MODIFICA

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

// Inizio funzione normalizeImportedData
function normalizeImportedData(data) {
    console.log('Normalizzazione dati importati...');
    let normalizedData = JSON.parse(JSON.stringify(data));

    if (normalizedData.turni && typeof window.normalizeTurniData === 'function') {
        normalizedData.turni = window.normalizeTurniData(normalizedData.turni);
    }

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
    
    if (!normalizedData.contatti) normalizedData.contatti = [];
    if (!normalizedData.etichette) normalizedData.etichette = [];
    if (!normalizedData.previousYearStock) {
        normalizedData.previousYearStock = { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 };
    }

    console.log('Normalizzazione completata.');
    return normalizedData;
}
// Fine funzione normalizeImportedData

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
    
    const keysToRemove = ['isDarkMode', 'isSidebarCollapsed', 'currentSection', 'virtualFilterMode', 'registryTimeFilter', 'ordineCarburante', 'homeTodos', 'borderRadius', 'colorTheme'];
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
// =============================================
// FILE: impostazioni.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Impostazioni (tema, import/export, reset).
// =============================================

// === STATO LOCALE DEL MODULO IMPOSTAZIONI ===
// Inizio funzione impostazioniState
let impostazioniState = {
    isFullscreen: false,
    borderRadius: 'medium'
};
// Fine funzione impostazioniState

// === INIZIALIZZAZIONE MODULO IMPOSTAZIONI ===
// Inizio funzione initImpostazioni
function initImpostazioni() {
    console.log('Inizializzazione modulo Impostazioni...');
    const app = this;

    impostazioniState.borderRadius = app.loadFromStorage('borderRadius', 'medium');
    updateBorderRadius();

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

                        <div class="mt-6 p-4" style="background-color: rgba(220, 38, 38, 0.05); border: 1px solid rgba(220, 38, 38, 0.2); border-radius: var(--radius-md);">
                            <label class="font-medium text-danger mb-2" style="display: block;">
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
// Fine funzione getImpostazioniModalHTML

// === FUNZIONE PER MOSTRARE IL MODALE ===
// Inizio funzione showImpostazioniModal
function showImpostazioniModal(app) {
    const modalContentEl = document.getElementById('form-modal-content');

    // Aggiunge la classe modal-wide per rendere il modale piu largo
    modalContentEl.classList.add('modal-wide');

    modalContentEl.innerHTML = getImpostazioniModalHTML(app);
    setupImpostazioniEventListeners(app);

    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showImpostazioniModal

// Inizio funzione handleImpostazioniClick
function handleImpostazioniClick(event) {
    const app = getApp();
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
// Fine funzione handleImpostazioniClick

// Inizio funzione handleImpostazioniChange
function handleImpostazioniChange(event) {
    const app = getApp();
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
// Fine funzione handleImpostazioniChange

// === SETUP EVENT LISTENERS ===
// Inizio funzione setupImpostazioniEventListeners
function setupImpostazioniEventListeners(app) {
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;

    // Rimuove i listener precedenti per evitare duplicazioni che causano esportazioni multiple
    modalContent.removeEventListener('click', handleImpostazioniClick);
    modalContent.removeEventListener('change', handleImpostazioniChange);

    // Aggiunge i listener aggiornati
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

// Inizio funzione toggleFullscreen
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

// Inizio funzione exportData
function exportData() {
    // Crea una copia dei dati principali
    const dataToExport = { ...this.state.data
    };

    // Aggiunge la to-do list al backup
    const homeTodos = this.loadFromStorage('homeTodos', []);
    if (homeTodos) {
        dataToExport.homeTodos = homeTodos;
    }

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
    this.showNotification('Dati esportati con successo!');
}
// Fine funzione exportData

// Inizio funzione importData
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);

            if (importedData.clients) this.state.data.clients = importedData.clients || [];
            if (importedData.turni) this.state.data.turni = importedData.turni || [];
            if (importedData.registryEntries) this.state.data.registryEntries = importedData.registryEntries || [];
            if (importedData.priceHistory) this.state.data.priceHistory = importedData.priceHistory || [];
            if (importedData.competitorPrices) this.state.data.competitorPrices = importedData.competitorPrices || [];
            if (importedData.contatti) this.state.data.contatti = importedData.contatti || [];
            if (importedData.etichette) this.state.data.etichette = importedData.etichette || [];

            // Importa la To-Do List se presente
            if (importedData.homeTodos) {
                this.saveToStorage('homeTodos', importedData.homeTodos);
                // Aggiorna lo stato live se il modulo home è già stato caricato
                if (window.homeState) {
                    window.homeState.todos = importedData.homeTodos;
                }
            }

            this.saveToStorage('data', this.state.data);
            this.showNotification('Dati importati con successo!');
            this.hideFormModal();
            this.switchSection(this.state.currentSection); // Ricarica la vista corrente per riflettere i cambiamenti
        } catch (error) {
            console.error("Errore durante l'importazione:", error);
            alert('Errore durante l\'importazione: file non valido o corrotto.');
        }
    };
    reader.readAsText(file);
}
// Fine funzione importData

// Inizio funzione confirmReset
function confirmReset() {
    this.showConfirm(
        'Sei sicuro di voler eliminare tutti i dati?',
        'Questa azione è irreversibile. Tutti i clienti, turni, registri e impostazioni verranno eliminati.',
        () => resetAllData.call(this)
    );
}
// Fine funzione confirmReset

// Inizio funzione resetAllData
function resetAllData() {
    localStorage.clear();
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
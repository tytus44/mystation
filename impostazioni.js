// =============================================
// FILE: impostazioni.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della 
// sezione Impostazioni (tema, import/export, reset).
// =============================================

// === STATO LOCALE DEL MODULO IMPOSTAZIONI ===
let impostazioniState = {
    isFullscreen: false,
    borderRadius: 'medium',
    colorTheme: 'default' 
};

// === INIZIALIZZAZIONE MODULO IMPOSTAZIONI ===
// Inizio funzione initImpostazioni
function initImpostazioni() {
    console.log('Inizializzazione modulo Impostazioni...');
    const app = this;
    
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
        <div class="card-body">
            
            <!-- Grid a 2 colonne per il layout delle impostazioni -->
            <div class="impostazioni-layout">
                
                <!-- SEZIONE SINISTRA: Customizzazione -->
                <div class="impostazioni-section">
                    <h3 class="impostazioni-section-title">Personalizzazione</h3>
                    
                    <!-- Riquadro Switch -->
                    <div class="p-4" style="border: 1px solid var(--border-primary); border-radius: var(--radius-md);">
                        <label class="font-medium text-primary mb-3" style="display: block;">
                            Aspetto
                        </label>
                        
                        <div class="space-y-4">
                            <!-- Switch tema scuro -->
                            <div class="flex items-center justify-between w-full">
                                <span class="font-medium text-primary">Tema scuro</span>
                                <label class="switch">
                                    <input type="checkbox" id="dark-mode-toggle" ${app.state.isDarkMode ? 'checked' : ''}>
                                    <span class="switch-slider"></span>
                                </label>
                            </div>
                            
                            <!-- Switch fullscreen -->
                            <div class="flex items-center justify-between w-full">
                                <span class="font-medium text-primary">Schermo intero</span>
                                <label class="switch">
                                    <input type="checkbox" id="fullscreen-toggle" ${impostazioniState.isFullscreen ? 'checked' : ''}>
                                    <span class="switch-slider"></span>
                                </label>
                            </div>

                            <!-- Switch collassa sidebar -->
                            <div class="flex items-center justify-between w-full">
                                <span class="font-medium text-primary">Collassa menu laterale</span>
                                <label class="switch">
                                    <input type="checkbox" id="sidebar-collapse-toggle" ${app.state.isSidebarCollapsed ? 'checked' : ''}>
                                    <span class="switch-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Riquadro Arrotondamento elementi -->
                    <div class="p-4" style="border: 1px solid var(--border-primary); border-radius: var(--radius-md);">
                        <label class="font-medium text-primary mb-3" style="display: block;">
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
                    
                    <!-- Riquadro Temi colore -->
                    <div style="padding: 0.75rem; border: 1px solid var(--border-primary); border-radius: var(--radius-md);">
                        <label class="font-medium text-primary" style="display: block; margin-bottom: 0.5rem;">
                            Tema colore
                        </label>
                        <div class="color-theme-grid">
                            ${['default', 'viola', 'azzurro', 'verde', 'arancione', 'rosa'].map(theme => {
                                const isChecked = (impostazioniState.colorTheme || 'default') === theme;
                                const themeNames = {
                                    'default': 'Default',
                                    'viola': 'Viola',
                                    'azzurro': 'Azzurro',
                                    'verde': 'Verde',
                                    'arancione': 'Arancione',
                                    'rosa': 'Rosa'
                                };
                                return `
                                    <label class="color-theme-option">
                                        <input type="radio" name="color-theme" value="${theme}" ${isChecked ? 'checked' : ''} style="display: none;">
                                        <div class="color-theme-circle theme-${theme}" style="border: 2px solid ${isChecked ? 'var(--color-primary)' : 'transparent'};">
                                            ${isChecked ? '<span style="color: white; font-size: 12px; font-weight: bold;">✓</span>' : ''}
                                        </div>
                                        <span class="color-theme-label">${themeNames[theme]}</span>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- SEZIONE DESTRA: Opzioni file e reset -->
                <div class="impostazioni-section">
                    <h3 class="impostazioni-section-title">Gestione Dati</h3>
                    
                    <!-- Opzioni file -->
                    <div class="space-y-4">
                        <div class="p-4" style="background-color: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: var(--radius-md);">
                            <label class="font-medium text-primary mb-2" style="display: block;">
                                <i data-lucide="database" style="width: 1.25rem; height: 1.25rem; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></i>
                                Backup e Ripristino
                            </label>
                            <p class="text-sm text-secondary mb-4">Esporta o importa i tuoi dati in formato JSON</p>
                            
                            <div class="flex gap-4">
                                <button type="button" id="export-btn" class="btn btn-primary flex items-center gap-4">
                                    <i data-lucide="download"></i>
                                    <span>Esporta</span>
                                </button>
                                <button type="button" id="import-btn" class="btn btn-secondary flex items-center gap-4">
                                    <i data-lucide="upload"></i>
                                    <span>Importa</span>
                                </button>
                            </div>
                            
                            <input type="file" id="import-file" accept=".json" style="display: none;">
                        </div>
                        
                        <!-- Sezione Reset -->
                        <div class="mt-6 p-4" style="background-color: rgba(220, 38, 38, 0.05); border: 1px solid rgba(220, 38, 38, 0.2); border-radius: var(--radius-md);">
                            <label class="font-medium text-danger mb-2" style="display: block;">
                                <i data-lucide="alert-triangle" style="width: 1.25rem; height: 1.25rem; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></i>
                                Zona di pericolo
                            </label>
                            <p class="text-sm text-secondary mb-4">Questa operazione eliminera permanentemente tutti i dati salvati</p>
                            <button type="button" id="reset-data-btn" class="btn btn-danger w-full">
                                <i data-lucide="trash-2"></i>
                                <span>Cancella tutti i dati</span>
                            </button>
                        </div>
                        
                        <!-- Footer GitHub -->
                        <div class="mt-6 text-center">
                            <p class="text-sm text-secondary">
                                <a href="https://github.com/tytus44/mystation/" target="_blank" rel="noopener noreferrer" class="text-primary" style="text-decoration: none; font-weight: 500;">MyStation</a>
                                <span style="margin: 0 0.25rem;">programmato con</span>
                                <i data-lucide="heart" style="width: 1rem; height: 1rem; display: inline-block; vertical-align: middle; color: #dc2626; fill: #dc2626;"></i>
                                <span style="margin: 0 0.25rem;">da NeRO</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Pulsante chiudi -->
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

// INIZIO MODIFICA: Refactoring degli event handler per prevenire download multipli.
// Le funzioni di gestione degli eventi sono state estratte per consentirne la rimozione e prevenire la loro duplicazione ad ogni apertura del modale.

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
    
    if (target.matches('input[name="color-theme"]')) {
        const newTheme = target.value;
        impostazioniState.colorTheme = newTheme;
        app.saveToStorage('colorTheme', newTheme);
        updateColorTheme();
        
        modalContent.querySelectorAll('.color-theme-circle').forEach(circle => {
            const radio = circle.previousElementSibling || circle.parentElement.querySelector('input[type="radio"]');
            let radioElement = radio;
            
            if (!radioElement) {
                radioElement = circle.closest('label').querySelector('input[type="radio"]');
            }
            
            const isChecked = radioElement && radioElement.checked;
            circle.style.border = isChecked ? '2px solid var(--color-primary)' : '2px solid transparent';
            circle.innerHTML = isChecked ? '<span style="color: white; font-size: 12px; font-weight: bold;">✓</span>' : '';
        });
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
// FINE MODIFICA

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
    const dataStr = JSON.stringify(this.state.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
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
            if (importedData.registro) this.state.data.registro = importedData.registro || [];
            if (importedData.prezzi) this.state.data.prezzi = importedData.prezzi || [];
            if (importedData.contatti) this.state.data.contatti = importedData.contatti || [];
            if (importedData.etichette) this.state.data.etichette = importedData.etichette || [];
            
            this.saveToStorage('data', this.state.data);
            this.showNotification('Dati importati con successo!');
            this.hideFormModal();
            this.navigateTo(this.state.currentSection);
        } catch (error) {
            alert('Errore durante l\'importazione: file non valido');
        }
    };
    reader.readAsText(file);
}
// Fine funzione importData

// Inizio funzione confirmReset
function confirmReset() {
    this.showConfirmModal(
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

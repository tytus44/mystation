const THEME_COLORS = [];
let impostazioniState = {
    borderRadius: null,
    isFullscreen: !1,
    theme: 'default'
};

function initImpostazioni() {
    console.log('⚙️ Inizializzazione modulo Impostazioni...');
    impostazioniState.borderRadius = this.loadFromStorage('borderRadius', 'medium');
    impostazioniState.theme = this.loadFromStorage('theme', 'default');
    updateBorderRadius();
    updateTheme();
    document.addEventListener('fullscreenchange', () => {
        impostazioniState.isFullscreen = !!document.fullscreenElement
    });
    console.log('✅ Modulo Impostazioni inizializzato')
}

function showImpostazioniModal(app) {
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;
    modalContent.classList.add('modal-wide');
    modalContent.innerHTML = getImpostazioniModalHTML(app);
    setupImpostazioniEventListeners(app);
    app.refreshIcons();
    app.showFormModal()
}

function getImpostazioniModalHTML(app) {
    const isDefaultTheme = impostazioniState.theme === 'default';
    const isLightActive = isDefaultTheme && !app.state.isDarkMode;
    const isDarkActive = isDefaultTheme && app.state.isDarkMode;
    return `
        <div class="modal-header">
             <h2 class="card-title">Impostazioni</h2>
             <button type="button" id="close-impostazioni-icon-btn" class="modal-close-btn">
                <i data-lucide="x"></i>
             </button>
        </div>
        <div class="modal-body">
            <div class="impostazioni-layout">
                <div class="impostazioni-section">
                    <h3 class="impostazioni-section-title">Personalizzazione</h3>
                    
                    <div class="space-y-4">

                        <div class="p-4" style="border: 1px solid var(--border-primary); border-radius: var(--radius-md);">
                            <label class="font-medium text-primary mb-4" style="display: block;">Arrotondamento elementi</label>
                            <div class="flex gap-4">
                                <button type="button" data-radius="none" class="btn ${impostazioniState.borderRadius === 'none' ? 'btn-primary active' : 'btn-secondary'}">Nessuno</button>
                                <button type="button" data-radius="medium" class="btn ${impostazioniState.borderRadius === 'medium' ? 'btn-primary active' : 'btn-secondary'}">Medio</button>
                                <button type="button" data-radius="high" class="btn ${impostazioniState.borderRadius === 'high' ? 'btn-primary active' : 'btn-secondary'}">Alto</button>
                            </div>
                        </div>

                        <div class="p-4" style="border: 1px solid var(--border-primary); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 1.25rem;">
                            <div>
                                <label class="font-medium text-primary mb-4" style="display: block;">Tema</label>
                                <div class="btn-group w-full">
                                    <button type="button" data-theme-default="light" class="btn ${isLightActive ? 'btn-primary active' : 'btn-secondary'}">
                                        <i data-lucide="sun" class="mr-2"></i> Chiaro
                                    </button>
                                    <button type="button" data-theme-default="dark" class="btn ${isDarkActive ? 'btn-primary active' : 'btn-secondary'}">
                                        <i data-lucide="moon" class="mr-2"></i> Scuro
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        </div> </div>
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
                                <i data-lucide="log-out" style="width: 1.25rem; height: 1.25rem; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></i>Account login attivo
                             </label>
                             <button type="button" data-section="esci" class="btn btn-danger w-full"><i data-lucide="log-out"></i><span>Esci</span></button>
                        </div>
                        </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button id="close-impostazioni-btn" class="btn btn-secondary">Chiudi</button>
        </div>
    `
}

function handleImpostazioniClick(event) {
    const app = getApp();
    if (!app) {
        console.error('App non disponibile');
        return
    }
    const target = event.target;
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;
    
    // === FIX ===
    if (target.closest('#import-btn')) modalContent.querySelector('#import-file')?.click(); // Corretto: ? .click() -> ?.click()
    // === FINE FIX ===

    if (target.closest('#export-btn')) exportData.call(app);
        
    if (target.closest('#close-impostazioni-btn') || target.closest('#close-impostazioni-icon-btn')) {
        app.hideFormModal()
    }
    const esciBtn = target.closest('[data-section="esci"]');
    if (esciBtn) {
        app.hideFormModal();
        app.showConfirm('Sei sicuro di voler uscire e tornare al Login?', () => {
            if (typeof window.logout === 'function') {
                window.logout()
            } else {
                console.warn('Funzione window.logout() non trovata, reindirizzamento forzato.');
                window.location.href = '../index.html'
            }
        });
        return
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
            btn.classList.toggle('btn-secondary', !isActive)
        })
    }
    const themeDefaultBtn = target.closest('[data-theme-default]');
    if (themeDefaultBtn) {
        const newThemeMode = themeDefaultBtn.dataset.themeDefault;
        impostazioniState.theme = 'default';
        app.saveToStorage('theme', 'default');
        updateTheme();
        modalContent.querySelectorAll('[data-theme-default]').forEach(btn => {
            const isActive = btn.dataset.themeDefault === newThemeMode;
            btn.classList.toggle('btn-primary', isActive);
            btn.classList.toggle('active', isActive);
            btn.classList.toggle('btn-secondary', !isActive)
        });
        if (newThemeMode === 'dark' && !app.state.isDarkMode) {
            app.toggleTheme()
        } else if (newThemeMode === 'light' && app.state.isDarkMode) {
            app.toggleTheme()
        }
    }
}

function handleImpostazioniChange(event) {
    const app = getApp();
    if (!app) {
        console.error('App non disponibile');
        return
    }
    const target = event.target;
    if (target.matches('#import-file')) importData.call(app, event);
}

function setupImpostazioniEventListeners(app) {
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;
    if (modalContent.dataset.listenersAttached) return;
    modalContent.dataset.listenersAttached = 'true';
    modalContent.addEventListener('click', handleImpostazioniClick);
    modalContent.addEventListener('change', handleImpostazioniChange)
}

function updateBorderRadius() {
    const radius = impostazioniState.borderRadius || 'medium';
    document.documentElement.setAttribute('data-theme-radius', radius)
}

function updateTheme() {
    const theme = impostazioniState.theme || 'default';
    if (theme === 'default') {
        document.documentElement.removeAttribute('data-theme')
    } else {
        document.documentElement.removeAttribute('data-theme');
        impostazioniState.theme = 'default'
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(err => alert(`Errore schermo intero: ${err.message}`));
    else if (document.exitFullscreen) document.exitFullscreen();
}

function updateFullscreenToggle() {}

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
        spese: app.state.data.spese || [],
        speseEtichette: app.state.data.speseEtichette || [],
        todos: app.state.data.todos || [],
        appuntamenti: app.state.data.appuntamenti || []
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
    app.showNotification('Dati esportati con successo!')
}

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
            if (importedData.spese) app.state.data.spese = importedData.spese || [];
            if (importedData.speseEtichette) app.state.data.speseEtichette = importedData.speseEtichette || [];
            if (importedData.todos) app.state.data.todos = importedData.todos || [];
            if (importedData.appuntamenti) app.state.data.appuntamenti = importedData.appuntamenti || [];
            app.saveToStorage('data', app.state.data);
            if (typeof diagnosticaERiparaTurni === 'function' && (importedData.turni || importedData.iperself)) {
                console.log('Esecuzione diagnostica/normalizzazione sui dati turni importati...');
                diagnosticaERiparaTurni()
            }
            app.showNotification('Dati importati con successo!');
            app.hideFormModal();
            app.refreshCurrentSection()
        } catch (error) {
            console.error("Errore importazione:", error);
            alert('Errore importazione: file non valido.')
        } finally {
            event.target.value = ''
        }
    };
    reader.readAsText(file)
}

if (typeof window !== 'undefined') {
    window.initImpostazioni = initImpostazioni;
    window.showImpostazioniModal = showImpostazioniModal;
    window.impostazioniState = impostazioniState
}
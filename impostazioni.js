// =============================================
// FILE: impostazioni.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Impostazioni (tema, import/export, reset).
// =============================================

// === STATO LOCALE DEL MODULO IMPOSTAZIONI ===
let impostazioniState = {
    borderRadius: null,
    isFullscreen: false
};

// === INIZIALIZZAZIONE MODULO IMPOSTAZIONI ===
function initImpostazioni() {
    console.log('⚙️ Inizializzazione modulo Impostazioni...');
    // 'this' qui si riferisce all'istanza dell'app passata con .call(this) da app.js
    impostazioniState.borderRadius = this.loadFromStorage('borderRadius', 'medium');
    updateBorderRadius();

    document.addEventListener('fullscreenchange', () => {
        impostazioniState.isFullscreen = !!document.fullscreenElement;
        updateFullscreenToggle();
    });

    console.log('✅ Modulo Impostazioni inizializzato');
}

// === MODAL IMPOSTAZIONI ===
function showImpostazioniModal(app) { // Riceve l'istanza app
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;

    modalContent.classList.add('modal-wide');
    // Passiamo 'app' a getImpostazioniModalHTML se necessario (qui non serve)
    modalContent.innerHTML = getImpostazioniModalHTML(app);

    // Passiamo 'app' a setupImpostazioniEventListeners
    setupImpostazioniEventListeners(app);
    app.refreshIcons();
    app.showFormModal();
}

function getImpostazioniModalHTML(app) { // Riceve app
    // Nota: 'app.state.isDarkMode', 'app.state.isSidebarCollapsed' funzionano
    // se 'app' è l'istanza corretta.
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
// Nota: Questi handler ora assumono che 'this' sia l'istanza dell'app,
// perché verranno legati con .bind(app) o chiamati con .call(app)
function handleImpostazioniClick(event) {
    const app = this; // 'this' è l'istanza dell'app
    if (!app) {
        console.error('App instance (this) non disponibile in handleImpostazioniClick');
        return;
    }

    const target = event.target;
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;

    if (target.closest('#import-btn')) {
        modalContent.querySelector('#import-file')?.click();
    }
    if (target.closest('#export-btn')) {
        exportData.call(app); // Usa .call(app) per sicurezza
    }
    if (target.closest('#reset-data-btn')) {
        confirmReset.call(app); // Usa .call(app) per sicurezza
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

        // Aggiorna i bottoni nel modale
        modalContent.querySelectorAll('[data-radius]').forEach(btn => {
            const isActive = btn.dataset.radius === newRadius;
            btn.classList.toggle('btn-primary', isActive);
            btn.classList.toggle('active', isActive);
            btn.classList.toggle('btn-secondary', !isActive);
        });
    }
}

function handleImpostazioniChange(event) {
    const app = this; // 'this' è l'istanza dell'app
     if (!app) {
        console.error('App instance (this) non disponibile in handleImpostazioniChange');
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
        toggleFullscreen(); // Questa funzione non dipende da 'app'
    }
    if (target.matches('#sidebar-collapse-toggle')) {
        app.toggleSidebarCollapse();
    }
    if (target.matches('#import-file')) {
        importData.call(app, event); // Usa .call(app) per sicurezza
    }
}

// === SETUP EVENT LISTENERS ===
function setupImpostazioniEventListeners(app) { // Riceve 'app'
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;

    // Rimuovi eventuali listener precedenti per evitare duplicati
    // Potrebbe essere necessario memorizzare i riferimenti ai listener se questo non funziona
    // Ma proviamo prima così: leghiamo 'this' all'istanza 'app'
    const boundClickHandler = handleImpostazioniClick.bind(app);
    const boundChangeHandler = handleImpostazioniChange.bind(app);

    // Salva i riferimenti per poterli rimuovere dopo (opzionale ma buona pratica)
    modalContent._impostazioniClickHandler = boundClickHandler;
    modalContent._impostazioniChangeHandler = boundChangeHandler;

    modalContent.addEventListener('click', boundClickHandler);
    modalContent.addEventListener('change', boundChangeHandler);
}

// === FUNZIONI TEMA E DISPLAY ===

function updateBorderRadius() {
    const radius = impostazioniState.borderRadius || 'medium';
    document.documentElement.setAttribute('data-theme-radius', radius);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            // Potremmo usare app.showNotification se fosse disponibile qui
            console.error(`Errore schermo intero: ${err.message}`);
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

// Funzione exportData aggiornata per includere spese e speseEtichette
function exportData() {
    const app = this; // 'this' ora si riferisce all'istanza dell'app

    // Crea un oggetto con TUTTI i dati dell'applicazione
    const dataToExport = {
        // Dati principali dell'applicazione
        clients: app.state.data.clients || [],
        turni: app.state.data.turni || [],
        registryEntries: app.state.data.registryEntries || [],
        priceHistory: app.state.data.priceHistory || [],
        competitorPrices: app.state.data.competitorPrices || [],
        previousYearStock: app.state.data.previousYearStock || { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 },

        // DATI ANAGRAFICA (Rubrica contatti + etichette)
        contatti: app.state.data.contatti || [],
        etichette: app.state.data.etichette || [],

        // DATI STAZIONI ENI
        stazioni: app.state.data.stazioni || [],

        // DATI ACCOUNT PERSONALI
        accounts: app.state.data.accounts || [],

        // ✅ DATI SPESE AGGIUNTI QUI
        spese: app.state.data.spese || [],
        speseEtichette: app.state.data.speseEtichette || [],

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

// Funzione importData aggiornata per includere spese e speseEtichette
function importData(event) {
    const app = this; // 'this' ora si riferisce all'istanza dell'app
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);

            // Importa TUTTI i dati, controllando se esistono nel file importato
            // Usiamo '!== undefined' per distinguere tra una chiave mancante e una chiave con valore null/[]
            if (importedData.clients !== undefined) app.state.data.clients = importedData.clients || [];
            if (importedData.turni !== undefined) app.state.data.turni = importedData.turni || [];
            if (importedData.registryEntries !== undefined) app.state.data.registryEntries = importedData.registryEntries || [];
            if (importedData.priceHistory !== undefined) app.state.data.priceHistory = importedData.priceHistory || [];
            if (importedData.competitorPrices !== undefined) app.state.data.competitorPrices = importedData.competitorPrices || [];
            if (importedData.previousYearStock !== undefined) app.state.data.previousYearStock = importedData.previousYearStock || { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 };

            // IMPORTA ANAGRAFICA (Rubrica contatti + etichette)
            if (importedData.contatti !== undefined) app.state.data.contatti = importedData.contatti || [];
            if (importedData.etichette !== undefined) app.state.data.etichette = importedData.etichette || [];

            // IMPORTA STAZIONI ENI
            if (importedData.stazioni !== undefined) app.state.data.stazioni = importedData.stazioni || [];

            // IMPORTA ACCOUNT PERSONALI
            if (importedData.accounts !== undefined) app.state.data.accounts = importedData.accounts || [];

            // ✅ IMPORTA SPESE AGGIUNTO QUI
            if (importedData.spese !== undefined) app.state.data.spese = importedData.spese || [];
            if (importedData.speseEtichette !== undefined) app.state.data.speseEtichette = importedData.speseEtichette || [];

            // Importa todo list della home
            if (importedData.homeTodos !== undefined) {
                app.saveToStorage('homeTodos', importedData.homeTodos || []);
                // Aggiorna anche lo stato locale del modulo home se esiste
                if (typeof window.homeState !== 'undefined' && window.homeState) {
                    window.homeState.todos = importedData.homeTodos || [];
                }
            }

            // Salva tutto l'oggetto data aggiornato in localStorage
            app.saveToStorage('data', app.state.data);

            app.showNotification('Dati importati con successo!');
            app.hideFormModal();

            // Ricarica la sezione corrente per mostrare i nuovi dati
            // Passiamo 'true' per forzare il rendering completo della sezione
            const currentSection = app.state.currentSection || 'home';
            app.switchSection(currentSection, true);


        } catch (error) {
            console.error("Errore durante l'importazione:", error);
            app.showNotification('Errore durante l\'importazione: file non valido o corrotto.', 'error');
            // alert('Errore durante l\'importazione: file non valido o corrotto.'); // Rimuovi alert se showNotification è sufficiente
        } finally {
            // Reset del file input per permettere di ricaricare lo stesso file
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}

function confirmReset() {
    const app = this; // Usa 'this'
    app.showConfirm(
        'Sei sicuro di voler eliminare tutti i dati?<br><br>Questa azione è irreversibile.',
        () => resetAllData.call(app) // Usa .call(app) per passare il contesto corretto
    );
}

function resetAllData() {
    const app = this; // Usa 'this'
    localStorage.clear();
    app.showNotification('Tutti i dati sono stati eliminati. Ricaricamento in corso...');

    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
// Rendi disponibili globalmente le funzioni necessarie per essere chiamate da app.js
if (typeof window !== 'undefined') {
    window.initImpostazioni = initImpostazioni;
    window.showImpostazioniModal = showImpostazioniModal;
    // Non esportiamo impostazioniState perché è gestito internamente
}
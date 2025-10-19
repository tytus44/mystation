// =============================================
// FILE: impostazioni.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Impostazioni (tema, import/export, reset, Google Drive).
// =============================================

// ✅ INIZIO COSTANTI GOOGLE DRIVE
const CLIENT_ID = "35786706503-ca33v1uc30ppffbci9aiu5db3vunperh.apps.googleusercontent.com";
const API_KEY = "AIzaSyDSZmoTJFt2NqbiwbJNlAGvg9braxq_pvc"; // La tua Chiave API
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.file"; // Permesso per creare/leggere file creati dall'app
// ✅ FINE COSTANTI GOOGLE DRIVE

// === STATO LOCALE DEL MODULO IMPOSTAZIONI ===
let impostazioniState = {
    borderRadius: null,
    isFullscreen: false,

    // ✅ INIZIO STATO GOOGLE DRIVE
    gapiReady: false,       // Flag per sapere se GAPI (Drive/Picker) è pronto
    gisReady: false,        // Flag per sapere se GIS (Autenticazione) è pronto
    gdriveToken: null,      // Conterrà il token di accesso OAuth
    tokenClient: null,      // Il client di Google Identity Services per richiedere il token
    pendingGdriveAction: null // Azione ('save' o 'load') in attesa dopo l'autenticazione
    // ✅ FINE STATO GOOGLE DRIVE
};

// === INIZIALIZZAZIONE MODULO IMPOSTAZIONI ===
function initImpostazioni() {
    console.log('⚙️ Inizializzazione modulo Impostazioni...');
    const app = this; // Salva il contesto dell'app

    // Codice esistente per borderRadius e fullscreen
    impostazioniState.borderRadius = app.loadFromStorage('borderRadius', 'medium');
    updateBorderRadius();

    document.addEventListener('fullscreenchange', () => {
        impostazioniState.isFullscreen = !!document.fullscreenElement;
        updateFullscreenToggle();
    });

    // ✅ INIZIO MODIFICA: Avviamo il caricamento dei client Google
    // Queste funzioni globali (gapiLoaded, gisLoaded) sono definite in mystation.html
    // e vengono chiamate automaticamente quando le librerie Google sono caricate.
    window.gapiLoaded = () => {
        gapi.load('client:picker', () => gapiClientReady.call(app)); // Passa il contesto
    };
    window.gisLoaded = () => {
        gisClientReady.call(app); // Passa il contesto
    };
    // ✅ FINE MODIFICA

    console.log('✅ Modulo Impostazioni inizializzato');
}

// === MODAL IMPOSTAZIONI ===
function showImpostazioniModal(app) {
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;

    modalContent.classList.add('modal-wide');
    modalContent.innerHTML = getImpostazioniModalHTML(app);

    setupImpostazioniEventListeners(app); // Passa l'istanza dell'app
    app.refreshIcons();
    app.showFormModal();
}

function getImpostazioniModalHTML(app) {
    // Il return HTML con le sezioni "Personalizzazione", "Gestione Dati" (aggiornata) e "Zona di pericolo".
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
                            <p class="text-sm text-secondary mb-4">Salva o carica un backup completo dei dati.</p>

                            <div class="grid grid-cols-2 gap-4">
                                <button type="button" id="gdrive-save-btn" class="btn btn-primary" style="background-color: #0F9D58; border-color: #0B8043;">
                                    <i data-lucide="upload-cloud" class="mr-2"></i>
                                    <span>Salva su Drive</span>
                                </button>
                                <button type="button" id="gdrive-load-btn" class="btn btn-secondary">
                                    <i data-lucide="download-cloud" class="mr-2"></i>
                                    <span>Carica da Drive</span>
                                </button>
                            </div>

                            <div class="flex items-center gap-4 mt-4">
                                <div style="flex: 1; height: 1px; background: var(--border-primary);"></div>
                                <span class="text-xs text-secondary">Backup Locale</span>
                                <div style="flex: 1; height: 1px; background: var(--border-primary);"></div>
                            </div>

                            <div class="flex gap-4 mt-4">
                                <button type="button" id="export-btn" class="btn btn-secondary" style="flex-grow: 1;">
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
                                <i data-lucide="trash-2" class="mr-2"></i> <span>Cancella tutti i dati</span>
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
    const app = getApp(); // Ottieni l'istanza dell'app globale
    if (!app) {
        console.error('App non disponibile');
        return;
    }

    const target = event.target;
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;

    // Gestione pulsanti esistenti
    if (target.closest('#import-btn')) {
        modalContent.querySelector('#import-file')?.click();
    }
    if (target.closest('#export-btn')) {
        exportData.call(app); // Usa .call(app) per passare il contesto
    }
    if (target.closest('#reset-data-btn')) {
        confirmReset.call(app); // Usa .call(app)
    }
    if (target.closest('#close-impostazioni-btn')) {
        app.hideFormModal();
    }

    // Gestione pulsanti border radius
    const radiusBtn = target.closest('[data-radius]');
    if (radiusBtn) {
        const newRadius = radiusBtn.dataset.radius;
        impostazioniState.borderRadius = newRadius;
        app.saveToStorage('borderRadius', newRadius);
        updateBorderRadius();

        // Aggiorna stile bottoni radius
        modalContent.querySelectorAll('[data-radius]').forEach(btn => {
            const isActive = btn.dataset.radius === newRadius;
            btn.classList.toggle('btn-primary', isActive);
            btn.classList.toggle('active', isActive);
            btn.classList.toggle('btn-secondary', !isActive);
        });
    }

    // ✅ INIZIO MODIFICA: Aggiungi questi due listener per i pulsanti Drive
    if (target.closest('#gdrive-save-btn')) {
        impostazioniState.pendingGdriveAction = 'save';
        gdriveRequestAuth.call(app); // Usa .call(app)
    }
    if (target.closest('#gdrive-load-btn')) {
        impostazioniState.pendingGdriveAction = 'load';
        gdriveRequestAuth.call(app); // Usa .call(app)
    }
    // ✅ FINE MODIFICA
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

    // Gestione toggle esistenti
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
    // Gestione import file locale
    if (target.matches('#import-file')) {
        importData.call(app, event); // Usa .call(app)
    }
}

// === SETUP EVENT LISTENERS ===
function setupImpostazioniEventListeners(app) { // Ora accetta app come parametro
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;

    // Rimuovi listener precedenti
    modalContent.removeEventListener('click', handleImpostazioniClick);
    modalContent.removeEventListener('change', handleImpostazioniChange);

    // Aggiungi nuovi listener
    modalContent.addEventListener('click', handleImpostazioniClick);
    modalContent.addEventListener('change', handleImpostazioniChange);
}


// === FUNZIONI TEMA E DISPLAY === (Invariate)
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

// === FUNZIONI IMPORT/EXPORT === (Refattorizzate)

// ✅ FUNZIONE HELPER PER CREARE IL JSON
function getExportDataJson() {
    const app = this; // 'this' ora si riferisce all'istanza dell'app grazie a .call(app)

    // Logica per raccogliere TUTTI i dati
    const dataToExport = {
        clients: app.state.data.clients || [],
        turni: app.state.data.turni || [],
        registryEntries: app.state.data.registryEntries || [],
        priceHistory: app.state.data.priceHistory || [],
        competitorPrices: app.state.data.competitorPrices || [],
        previousYearStock: app.state.data.previousYearStock || { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 },
        contatti: app.state.data.contatti || [],
        etichette: app.state.data.etichette || [],
        stazioni: app.state.data.stazioni || [],
        accounts: app.state.data.accounts || [],
        homeTodos: app.loadFromStorage('homeTodos', [])
    };

    return JSON.stringify(dataToExport, null, 2); // Indentazione per leggibilità
}

// ✅ VECCHIA FUNZIONE exportData, ORA MODIFICATA per usare l'helper
function exportData() {
    const app = this; // 'this' è l'istanza dell'app

    // Chiama l'helper per ottenere la stringa JSON
    const dataStr = getExportDataJson.call(app); // Assicura il contesto corretto

    // Logica per scaricare il file localmente (invariata)
    const dataBlob = new Blob([dataStr], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mystation_backup_' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(link); // Necessario per Firefox
    link.click();
    document.body.removeChild(link); // Pulisce il DOM
    URL.revokeObjectURL(url);

    app.showNotification('Dati esportati con successo!');
}


// ✅ FUNZIONE HELPER PER PROCESSARE IL JSON IMPORTATO
function processImportedData(jsonText) {
    const app = this; // 'this' è l'istanza dell'app

    try {
        const importedData = JSON.parse(jsonText);

        // Logica per aggiornare lo stato dell'app (invariata)
        if (importedData.clients) app.state.data.clients = importedData.clients || [];
        if (importedData.turni) {
             // Assicura che i dati dei turni siano normalizzati
            app.state.data.turni = typeof normalizeTurniData === 'function'
                ? normalizeTurniData(importedData.turni)
                : (importedData.turni || []);
        }
        if (importedData.registryEntries) app.state.data.registryEntries = importedData.registryEntries || [];
        if (importedData.priceHistory) app.state.data.priceHistory = importedData.priceHistory || [];
        if (importedData.competitorPrices) app.state.data.competitorPrices = importedData.competitorPrices || [];
        if (importedData.previousYearStock) app.state.data.previousYearStock = importedData.previousYearStock || { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 };
        if (importedData.contatti) app.state.data.contatti = importedData.contatti || [];
        if (importedData.etichette) app.state.data.etichette = importedData.etichette || [];
        if (importedData.stazioni) app.state.data.stazioni = importedData.stazioni || [];
        if (importedData.accounts) app.state.data.accounts = importedData.accounts || [];

        if (importedData.homeTodos) {
            app.saveToStorage('homeTodos', importedData.homeTodos);
            // Aggiorna lo stato locale del modulo Home se esiste
            if (window.homeState) {
                window.homeState.todos = importedData.homeTodos;
            }
        }

        // Salva tutto e aggiorna l'UI
        app.saveToStorage('data', app.state.data);
        app.showNotification('Dati importati con successo!');
        app.hideFormModal();

        // Forza il re-render della sezione corrente
        app.switchSection(app.state.currentSection, true); // Usa true per forzare il render

        // Esegui la diagnostica sui turni importati
        if (typeof diagnosticaERiparaTurni === 'function') {
            setTimeout(() => diagnosticaERiparaTurni.call(app), 500); // Ritarda leggermente
        }


    } catch (error) {
        console.error("Errore durante l'importazione:", error);
        app.showNotification('Errore importazione: file non valido o corrotto.', 'error');
    }
}


// ✅ VECCHIA FUNZIONE importData, ORA MODIFICATA per usare l'helper
function importData(event) {
    const app = this; // 'this' è l'istanza dell'app
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        // Chiama l'helper con il testo del file letto
        processImportedData.call(app, e.target.result); // Passa il contesto
    };
    reader.readAsText(file);

    // Reset del file input per permettere di ricaricare lo stesso file
    event.target.value = '';
}


// === FUNZIONI RESET === (Invariate)
function confirmReset() {
    const app = getApp(); // Usa getApp() perché 'this' potrebbe non essere corretto qui
    app.showConfirm(
        'Sei sicuro di voler eliminare tutti i dati?<br><br>Questa azione è irreversibile.',
        () => resetAllData.call(app) // Usa .call(app) per la callback
    );
}

function resetAllData() {
    const app = this; // 'this' è l'istanza dell'app passata da confirmReset
    localStorage.clear();
    app.showNotification('Tutti i dati sono stati eliminati. Ricaricamento in corso...', 'warning');

    // Ricarica la pagina dopo un breve ritardo per mostrare la notifica
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS === (Invariati)
if (typeof window !== 'undefined') {
    window.initImpostazioni = initImpostazioni;
    window.showImpostazioniModal = showImpostazioniModal;
    window.impostazioniState = impostazioniState; // Esponi lo stato locale
}


// =============================================
// === ✅ INIZIO NUOVE FUNZIONI GOOGLE DRIVE ===
// =============================================

/**
 * Chiamato quando la libreria GAPI (Google API Client) è pronta.
 * Inizializza il client GAPI.
 */
function gapiClientReady() {
    const app = this; // 'this' è l'istanza dell'app
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    }).then(() => {
        impostazioniState.gapiReady = true;
        console.log('✅ GAPI client pronto.');
        // Prova a eseguire azione pendente se GIS è già pronto
        if (impostazioniState.gisReady && impostazioniState.pendingGdriveAction) {
            gdriveRequestAuth.call(app);
        }
    }).catch(err => {
        console.error("Errore inizializzazione GAPI client:", err);
        app.showNotification("Errore Google API (GAPI Client)", "error");
    });
}

/**
 * Chiamato quando la libreria GIS (Google Identity Services) è pronta.
 * Inizializza il client per la richiesta del token OAuth.
 */
function gisClientReady() {
    const app = this; // 'this' è l'istanza dell'app
    try {
        impostazioniState.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (tokenResponse) => handleAuthCallback.call(app, tokenResponse), // Passa contesto e token
        });
        impostazioniState.gisReady = true;
        console.log('✅ GIS client pronto.');
        // Prova a eseguire azione pendente se GAPI è già pronto
        if (impostazioniState.gapiReady && impostazioniState.pendingGdriveAction) {
            gdriveRequestAuth.call(app);
        }
    } catch (error) {
         console.error("Errore inizializzazione GIS client:", error);
         app.showNotification("Errore Google API (GIS Client)", "error");
    }
}

/**
 * Callback chiamata dopo che l'utente completa il popup di login Google.
 * @param {object} tokenResponse - La risposta dal server OAuth.
 */
function handleAuthCallback(tokenResponse) {
    const app = this; // 'this' è l'istanza dell'app
    if (tokenResponse.error) {
        console.error("Errore OAuth:", tokenResponse.error, tokenResponse.error_description);
        // Mostra un errore più specifico se disponibile
        const errorMsg = tokenResponse.error_description || "Autenticazione Google fallita.";
        app.showNotification(errorMsg, "error");
        impostazioniState.pendingGdriveAction = null; // Resetta l'azione
        return;
    }

    impostazioniState.gdriveToken = tokenResponse.access_token;
    gapi.client.setToken({ access_token: impostazioniState.gdriveToken });
    console.log('✅ Autenticazione Google riuscita, token ottenuto.');

    // Ora che siamo autenticati, eseguiamo l'azione che era in sospeso
    if (impostazioniState.pendingGdriveAction === 'save') {
        gdriveSave.call(app); // Passa contesto
    } else if (impostazioniState.pendingGdriveAction === 'load') {
        gdriveLoad.call(app); // Passa contesto
    }
    impostazioniState.pendingGdriveAction = null; // Resetta l'azione pendente
}

/**
 * Controlla se GAPI e GIS sono pronti. Se sì, avvia l'autenticazione o
 * esegue direttamente l'azione se già autenticati.
 */
function gdriveRequestAuth() {
    const app = this; // 'this' è l'istanza dell'app
    console.log('Tentativo azione Drive:', impostazioniState.pendingGdriveAction);

    if (!impostazioniState.gapiReady || !impostazioniState.gisReady) {
        app.showNotification("Servizi Google non ancora pronti. Riprova tra poco.", "warning");
        console.warn('GAPI o GIS non pronti:', { gapi: impostazioniState.gapiReady, gis: impostazioniState.gisReady });
        // Non resettare pendingGdriveAction qui, l'utente potrebbe riprovare
        return;
    }

    if (impostazioniState.gdriveToken) {
        console.log('Utente già autenticato, procedo con:', impostazioniState.pendingGdriveAction);
        // Assicura che il token sia impostato nel client GAPI
        gapi.client.setToken({ access_token: impostazioniState.gdriveToken });
        // Esegui subito l'azione
        if (impostazioniState.pendingGdriveAction === 'save') gdriveSave.call(app);
        else if (impostazioniState.pendingGdriveAction === 'load') gdriveLoad.call(app);
        impostazioniState.pendingGdriveAction = null; // Resetta dopo aver eseguito
    } else {
        // L'utente non è autenticato, mostra il popup di login
        console.log('Token non presente, richiesta autenticazione...');
        if (impostazioniState.tokenClient) {
            impostazioniState.tokenClient.requestAccessToken({ prompt: 'consent' }); // Forza il consenso per sicurezza
        } else {
            console.error("Token client non inizializzato!");
            app.showNotification("Errore: client di autenticazione non pronto.", "error");
        }
    }
}

/**
 * Salva il file di backup JSON su Google Drive.
 */
function gdriveSave() {
    const app = this; // 'this' è l'istanza dell'app
    app.showNotification('Salvataggio su Google Drive in corso...', 'warning');

    try {
        const dataString = getExportDataJson.call(app); // Ottiene il JSON da esportare
        const fileName = 'mystation_backup_' + new Date().toISOString().split('T')[0] + '.json';

        // Costruzione della richiesta multipart per l'upload
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        const metadata = { name: fileName, mimeType: 'application/json' };

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(metadata) + // Metadati del file (nome, tipo)
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            dataString + // Contenuto effettivo del file (il JSON)
            close_delim;

        // Esegue la richiesta di upload all'API di Drive v3
        const request = gapi.client.request({
            path: '/upload/drive/v3/files',
            method: 'POST',
            params: { uploadType: 'multipart' },
            headers: { 'Content-Type': 'multipart/related; boundary="' + boundary + '"' },
            body: multipartRequestBody
        });

        // Gestisce la risposta della richiesta
        request.execute(response => {
            if (response && response.id) {
                console.log('File salvato con ID:', response.id);
                app.showNotification('Backup salvato su Drive con successo!', 'success');
            } else {
                console.error("Errore salvataggio Drive:", response);
                const errorMsg = response?.result?.error?.message || 'Errore durante il salvataggio su Drive.';
                app.showNotification(errorMsg, 'error');
            }
        });

    } catch (error) {
        console.error("Errore in gdriveSave:", error);
        app.showNotification("Errore critico durante il salvataggio su Drive.", "error");
    }
}

/**
 * Mostra il "Google Picker" per permettere all'utente di scegliere un file JSON.
 */
function gdriveLoad() {
    const app = this; // 'this' è l'istanza dell'app
    try {
        if (!google || !google.picker) {
             throw new Error("Libreria Google Picker non caricata.");
        }

        const view = new google.picker.View(google.picker.ViewId.DOCS);
        // Filtra per mostrare solo file JSON o di testo semplice
        view.setMimeTypes("application/json,text/plain");

        // Costruisce il Picker
        const picker = new google.picker.PickerBuilder()
            .setAppId(CLIENT_ID.split('-')[0]) // L'App ID è la parte numerica iniziale del Client ID
            .setApiKey(API_KEY)
            .setOAuthToken(impostazioniState.gdriveToken) // Passa il token ottenuto
            .addView(view)
            .setLocale('it') // Imposta la lingua italiana
            .setTitle('Seleziona un file di backup (.json)')
            .setCallback((data) => pickerCallback.call(app, data)) // Funzione da chiamare dopo la selezione
            .build();

        picker.setVisible(true); // Mostra il Picker

    } catch (error) {
        console.error("Errore apertura Google Picker:", error);
        app.showNotification("Errore nell'aprire il selettore file di Drive.", "error");
    }
}

/**
 * Callback chiamata dopo che l'utente ha scelto un file dal Picker.
 * @param {object} data - I dati del file scelto (o azione annullata).
 */
function pickerCallback(data) {
    const app = this; // 'this' è l'istanza dell'app
    const action = data[google.picker.Response.ACTION];

    if (action === google.picker.Action.PICKED) {
        const file = data[google.picker.Response.DOCUMENTS][0];
        const fileId = file[google.picker.Document.ID];
        const fileName = file[google.picker.Document.NAME];
        console.log(`File selezionato: ${fileName} (ID: ${fileId})`);
        app.showNotification(`Caricamento di ${fileName} da Drive...`, 'warning');

        // Ora scarichiamo il contenuto del file usando l'ID
        gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media' // 'media' per ottenere il contenuto del file
        }).then(response => {
            console.log('Contenuto file scaricato.');
            // Il contenuto JSON è nella stringa 'response.body'
            // Usiamo la nostra funzione helper refattorizzata per processarlo!
            processImportedData.call(app, response.body);
        }).catch(err => {
            console.error("Errore download file da Drive:", err);
            const errorMsg = err.result?.error?.message || "Impossibile scaricare il file selezionato.";
            app.showNotification(errorMsg, "error");
        });
    } else if (action === google.picker.Action.CANCEL) {
        console.log('Selezione file annullata dall\'utente.');
        // Non mostrare notifiche se l'utente annulla volontariamente
    }
}

// =============================================
// === ✅ FINE NUOVE FUNZIONI GOOGLE DRIVE ===
// =============================================
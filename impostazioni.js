// =============================================
// FILE: impostazioni.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Impostazioni (tema, import/export, reset, Google Drive).
// =============================================

// ✅ INIZIO COSTANTI GOOGLE DRIVE
const CLIENT_ID = "35786706503-ca33v1uc30ppffbci9aiu5db3vunperh.apps.googleusercontent.com"; // Il tuo Client ID
const API_KEY = "AIzaSyDSZmoTJFt2NqbiwbJNlAGvg9braxq_pvc"; //
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

// ✅ Definisci i callback globalmente PRIMA di initImpostazioni
window.gapiLoaded = () => {
    // Abbiamo bisogno di assicurarci che 'this' si riferisca all'istanza dell'app più tardi
    const appInstance = getApp(); // Usa getApp() per ottenere l'istanza dell'app
    if (appInstance) {
        gapi.load('client:picker', () => gapiClientReady.call(appInstance));
    } else {
        console.error("Istanza dell'app non disponibile per gapiLoaded");
        // Opzionalmente, riprova più tardi o mostra un errore
        setTimeout(window.gapiLoaded, 100); // Riprova dopo 100ms
    }
};

window.gisLoaded = () => {
    // Abbiamo bisogno di assicurarci che 'this' si riferisca all'istanza dell'app più tardi
    const appInstance = getApp(); // Usa getApp() per ottenere l'istanza dell'app
    if (appInstance) {
        gisClientReady.call(appInstance);
    } else {
        console.error("Istanza dell'app non disponibile per gisLoaded");
         // Opzionalmente, riprova più tardi o mostra un errore
        setTimeout(window.gisLoaded, 100); // Riprova dopo 100ms
    }
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

    // NON PIÙ NECESSARIO QUI:
    // window.gapiLoaded = ...
    // window.gisLoaded = ...

    console.log('✅ Modulo Impostazioni inizializzato');
    // Nota: gapiLoaded/gisLoaded potrebbero essere eseguiti prima *o* dopo questo log ora
}

// === MODAL IMPOSTAZIONI === (Funzioni showImpostazioniModal e getImpostazioniModalHTML invariate rispetto alla versione precedente che ti ho dato)
function showImpostazioniModal(app) {
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;

    modalContent.classList.add('modal-wide');
    modalContent.innerHTML = getImpostazioniModalHTML(app);

    setupImpostazioniEventListeners(app); // Passa l'istanza dell'app
    checkGoogleServicesReady(); // <-- Aggiunto qui per controllare lo stato iniziale dei pulsanti
    app.refreshIcons();
    app.showFormModal();
}

function getImpostazioniModalHTML(app) {
    // (L'HTML del modale con i pulsanti Drive ecc. rimane invariato rispetto a prima)
    return `
        <div class="card-body">
            <div class="impostazioni-layout">
                <div class="impostazioni-section" style="gap: 1.5rem;">
                    <h3 class="impostazioni-section-title">Personalizzazione</h3>
                    <div class="p-4" style="border: 1px solid var(--border-primary); border-radius: var(--radius-md);">
                        <label class="font-medium text-primary mb-3" style="display: block;">Aspetto</label>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between w-full">
                                <span class="font-medium text-primary">Tema scuro</span>
                                <label class="switch"><input type="checkbox" id="dark-mode-toggle" ${app.state.isDarkMode ? 'checked' : ''}><span class="switch-slider"></span></label>
                            </div>
                            <div class="flex items-center justify-between w-full">
                                <span class="font-medium text-primary">Schermo intero</span>
                                <label class="switch"><input type="checkbox" id="fullscreen-toggle" ${impostazioniState.isFullscreen ? 'checked' : ''}><span class="switch-slider"></span></label>
                            </div>
                            <div class="flex items-center justify-between w-full">
                                <span class="font-medium text-primary">Collassa menu laterale</span>
                                <label class="switch"><input type="checkbox" id="sidebar-collapse-toggle" ${app.state.isSidebarCollapsed ? 'checked' : ''}><span class="switch-slider"></span></label>
                            </div>
                        </div>
                    </div>
                    <div class="p-4" style="border: 1px solid var(--border-primary); border-radius: var(--radius-md);">
                        <label class="font-medium text-primary mb-4" style="display: block;">Arrotondamento elementi</label>
                        <div class="flex gap-4">
                            <button type="button" data-radius="none" class="btn ${impostazioniState.borderRadius === 'none' ? 'btn-primary active' : 'btn-secondary'}">Nessuno</button>
                            <button type="button" data-radius="medium" class="btn ${impostazioniState.borderRadius === 'medium' ? 'btn-primary active' : 'btn-secondary'}">Medio</button>
                            <button type="button" data-radius="high" class="btn ${impostazioniState.borderRadius === 'high' ? 'btn-primary active' : 'btn-secondary'}">Alto</button>
                        </div>
                    </div>
                </div>
                <div class="impostazioni-section">
                    <h3 class="impostazioni-section-title">Gestione Dati</h3>
                    <div class="space-y-4">
                        <div class="p-4" style="background-color: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: var(--radius-md);">
                            <label class="font-medium text-primary mb-2" style="display: block;"><i data-lucide="database" style="width: 1.25rem; height: 1.25rem; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></i>Backup e Ripristino</label>
                            <p class="text-sm text-secondary mb-4">Salva o carica un backup completo dei dati.</p>
                            <div class="grid grid-cols-2 gap-4">
                                <button type="button" id="gdrive-save-btn" class="btn btn-primary" style="background-color: #0F9D58; border-color: #0B8043;" disabled><i data-lucide="upload-cloud" class="mr-2"></i><span>Salva su Drive</span></button>
                                <button type="button" id="gdrive-load-btn" class="btn btn-secondary" disabled><i data-lucide="download-cloud" class="mr-2"></i><span>Carica da Drive</span></button>
                            </div>
                            <div class="flex items-center gap-4 mt-4"><div style="flex: 1; height: 1px; background: var(--border-primary);"></div><span class="text-xs text-secondary">Backup Locale</span><div style="flex: 1; height: 1px; background: var(--border-primary);"></div></div>
                            <div class="flex gap-4 mt-4">
                                <button type="button" id="export-btn" class="btn btn-secondary" style="flex-grow: 1;"><i data-lucide="download" class="mr-2"></i><span>Esporta</span></button>
                                <button type="button" id="import-btn" class="btn btn-secondary" style="flex-grow: 1;"><i data-lucide="upload" class="mr-2"></i><span>Importa</span></button>
                            </div>
                            <input type="file" id="import-file" accept=".json" style="display: none;">
                        </div>
                        <div class="p-4" style="background-color: rgba(220, 38, 38, 0.05); border: 1px solid rgba(220, 38, 38, 0.2); border-radius: var(--radius-md);">
                            <label class="font-medium mb-2" style="display: block; color: var(--color-danger);"><i data-lucide="alert-triangle" style="width: 1.25rem; height: 1.25rem; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></i>Zona di pericolo</label>
                            <p class="text-sm text-secondary mb-4">Questa operazione eliminerà permanentemente tutti i dati salvati</p>
                            <button type="button" id="reset-data-btn" class="btn btn-danger w-full"><i data-lucide="trash-2" class="mr-2"></i> <span>Cancella tutti i dati</span></button>
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

// === EVENT HANDLERS === (Invariate rispetto a prima, eccetto per l'aggiunta di .call(app))
function handleImpostazioniClick(event) {
    const app = getApp();
    if (!app) return;
    const target = event.target;
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;

    if (target.closest('#import-btn')) modalContent.querySelector('#import-file')?.click();
    if (target.closest('#export-btn')) exportData.call(app);
    if (target.closest('#reset-data-btn')) confirmReset.call(app);
    if (target.closest('#close-impostazioni-btn')) app.hideFormModal();

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

    if (target.closest('#gdrive-save-btn')) {
        impostazioniState.pendingGdriveAction = 'save';
        gdriveRequestAuth.call(app);
    }
    if (target.closest('#gdrive-load-btn')) {
        impostazioniState.pendingGdriveAction = 'load';
        gdriveRequestAuth.call(app);
    }
}

function handleImpostazioniChange(event) {
    const app = getApp();
    if (!app) return;
    const target = event.target;
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;

    if (target.matches('#dark-mode-toggle')) if (target.checked !== app.state.isDarkMode) app.toggleTheme();
    if (target.matches('#fullscreen-toggle')) toggleFullscreen();
    if (target.matches('#sidebar-collapse-toggle')) app.toggleSidebarCollapse();
    if (target.matches('#import-file')) importData.call(app, event);
}

// === SETUP EVENT LISTENERS === (Invariato)
function setupImpostazioniEventListeners(app) {
    const modalContent = document.getElementById('form-modal-content');
    if (!modalContent) return;
    modalContent.removeEventListener('click', handleImpostazioniClick);
    modalContent.removeEventListener('change', handleImpostazioniChange);
    modalContent.addEventListener('click', handleImpostazioniClick);
    modalContent.addEventListener('change', handleImpostazioniChange);
}

// === FUNZIONI TEMA E DISPLAY === (Invariate)
function updateBorderRadius() { /*...*/ }
function toggleFullscreen() { /*...*/ }
function updateFullscreenToggle() { /*...*/ }

// === FUNZIONI IMPORT/EXPORT === (Invariate rispetto alla versione refattorizzata)
function getExportDataJson() { /*...*/ }
function exportData() { /*...*/ }
function processImportedData(jsonText) { /*...*/ }
function importData(event) { /*...*/ }

// === FUNZIONI RESET === (Invariate)
function confirmReset() { /*...*/ }
function resetAllData() { /*...*/ }

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS === (Invariato)
if (typeof window !== 'undefined') { /*...*/ }


// =============================================
// === ✅ INIZIO NUOVE FUNZIONI GOOGLE DRIVE ===
// =============================================

// ✅ NUOVA FUNZIONE per controllare e abilitare/disabilitare i pulsanti Drive
function checkGoogleServicesReady() {
    const ready = impostazioniState.gapiReady && impostazioniState.gisReady;
    const saveBtn = document.getElementById('gdrive-save-btn');
    const loadBtn = document.getElementById('gdrive-load-btn');

    if (saveBtn) {
        saveBtn.disabled = !ready;
        saveBtn.style.opacity = ready ? '1' : '0.6';
        saveBtn.title = ready ? '' : 'Servizi Google in caricamento...';
    }
    if (loadBtn) {
        loadBtn.disabled = !ready;
        loadBtn.style.opacity = ready ? '1' : '0.6';
        loadBtn.title = ready ? '' : 'Servizi Google in caricamento...';
    }
    return ready;
}


function gapiClientReady() {
    const app = this; // 'this' è l'istanza dell'app
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    }).then(() => {
        impostazioniState.gapiReady = true;
        console.log('✅ GAPI client pronto.');
        checkGoogleServicesReady(); // <-- Aggiorna stato pulsanti
        // Prova a eseguire azione pendente se GIS è già pronto
        if (impostazioniState.gisReady && impostazioniState.pendingGdriveAction) {
            gdriveRequestAuth.call(app);
        }
    }).catch(err => {
        console.error("Errore inizializzazione GAPI client:", err);
        app.showNotification("Errore Google API (GAPI Client)", "error");
        checkGoogleServicesReady(); // <-- Aggiorna stato pulsanti anche in caso di errore
    });
}

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
        checkGoogleServicesReady(); // <-- Aggiorna stato pulsanti
        // Prova a eseguire azione pendente se GAPI è già pronto
        if (impostazioniState.gapiReady && impostazioniState.pendingGdriveAction) {
            gdriveRequestAuth.call(app);
        }
    } catch (error) {
         console.error("Errore inizializzazione GIS client:", error);
         app.showNotification("Errore Google API (GIS Client)", "error");
         checkGoogleServicesReady(); // <-- Aggiorna stato pulsanti anche in caso di errore
    }
}

function handleAuthCallback(tokenResponse) {
    // (Funzione invariata)
    const app = this;
    if (tokenResponse.error) {
        console.error("Errore OAuth:", tokenResponse.error, tokenResponse.error_description);
        const errorMsg = tokenResponse.error_description || "Autenticazione Google fallita.";
        app.showNotification(errorMsg, "error");
        impostazioniState.pendingGdriveAction = null;
        return;
    }
    impostazioniState.gdriveToken = tokenResponse.access_token;
    gapi.client.setToken({ access_token: impostazioniState.gdriveToken });
    console.log('✅ Autenticazione Google riuscita, token ottenuto.');
    if (impostazioniState.pendingGdriveAction === 'save') gdriveSave.call(app);
    else if (impostazioniState.pendingGdriveAction === 'load') gdriveLoad.call(app);
    impostazioniState.pendingGdriveAction = null;
}

function gdriveRequestAuth() {
    const app = this;
    console.log('Tentativo azione Drive:', impostazioniState.pendingGdriveAction);

    // Usa la funzione di controllo
    if (!checkGoogleServicesReady()) {
        app.showNotification("Servizi Google non ancora pronti. Riprova tra poco.", "warning");
        console.warn('GAPI o GIS non pronti:', { gapi: impostazioniState.gapiReady, gis: impostazioniState.gisReady });
        return;
    }

    if (impostazioniState.gdriveToken) {
        // (Logica invariata)
        console.log('Utente già autenticato, procedo con:', impostazioniState.pendingGdriveAction);
        gapi.client.setToken({ access_token: impostazioniState.gdriveToken });
        if (impostazioniState.pendingGdriveAction === 'save') gdriveSave.call(app);
        else if (impostazioniState.pendingGdriveAction === 'load') gdriveLoad.call(app);
        impostazioniState.pendingGdriveAction = null;
    } else {
        // (Logica invariata)
        console.log('Token non presente, richiesta autenticazione...');
        if (impostazioniState.tokenClient) {
            impostazioniState.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            console.error("Token client non inizializzato!");
            app.showNotification("Errore: client di autenticazione non pronto.", "error");
        }
    }
}

function gdriveSave() {
    // (Funzione invariata)
    const app = this;
    app.showNotification('Salvataggio su Google Drive in corso...', 'warning');
    try {
        const dataString = getExportDataJson.call(app);
        const fileName = 'mystation_backup_' + new Date().toISOString().split('T')[0] + '.json';
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        const metadata = { name: fileName, mimeType: 'application/json' };
        const multipartRequestBody = delimiter + 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata) + delimiter + 'Content-Type: application/json\r\n\r\n' + dataString + close_delim;
        const request = gapi.client.request({ path: '/upload/drive/v3/files', method: 'POST', params: { uploadType: 'multipart' }, headers: { 'Content-Type': 'multipart/related; boundary="' + boundary + '"' }, body: multipartRequestBody });
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

function gdriveLoad() {
    // (Funzione invariata)
    const app = this;
    try {
        if (!google || !google.picker) throw new Error("Libreria Google Picker non caricata.");
        const view = new google.picker.View(google.picker.ViewId.DOCS);
        view.setMimeTypes("application/json,text/plain");
        const picker = new google.picker.PickerBuilder()
            .setAppId(CLIENT_ID.split('-')[0])
            .setApiKey(API_KEY)
            .setOAuthToken(impostazioniState.gdriveToken)
            .addView(view)
            .setLocale('it')
            .setTitle('Seleziona un file di backup (.json)')
            .setCallback((data) => pickerCallback.call(app, data))
            .build();
        picker.setVisible(true);
    } catch (error) {
        console.error("Errore apertura Google Picker:", error);
        app.showNotification("Errore nell'aprire il selettore file di Drive.", "error");
    }
}

function pickerCallback(data) {
    // (Funzione invariata)
    const app = this;
    const action = data[google.picker.Response.ACTION];
    if (action === google.picker.Action.PICKED) {
        const file = data[google.picker.Response.DOCUMENTS][0];
        const fileId = file[google.picker.Document.ID];
        const fileName = file[google.picker.Document.NAME];
        console.log(`File selezionato: ${fileName} (ID: ${fileId})`);
        app.showNotification(`Caricamento di ${fileName} da Drive...`, 'warning');
        gapi.client.drive.files.get({ fileId: fileId, alt: 'media' })
            .then(response => {
                console.log('Contenuto file scaricato.');
                processImportedData.call(app, response.body);
            })
            .catch(err => {
                console.error("Errore download file da Drive:", err);
                const errorMsg = err.result?.error?.message || "Impossibile scaricare il file selezionato.";
                app.showNotification(errorMsg, "error");
            });
    } else if (action === google.picker.Action.CANCEL) {
        console.log('Selezione file annullata dall\'utente.');
    }
}

// =============================================
// === ✅ FINE NUOVE FUNZIONI GOOGLE DRIVE ===
// =============================================

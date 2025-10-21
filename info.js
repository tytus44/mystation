// =============================================
// FILE: info.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Info (link, numeri utili, stazioni e account).
// =============================================

// === STATO LOCALE DEL MODULO INFO ===
let infoState = {
    searchQueryStazioni: '',
    searchQueryAccounts: '',
    stazioniCollapsed: false, // Stato per la sezione stazioni
    accountsCollapsed: false, // Stato per la sezione account
};

// === INIZIALIZZAZIONE MODULO INFO ===
function initInfo() {
    console.log('ℹ️ Inizializzazione modulo Info...');
    const app = this; // 'this' è l'istanza dell'app passata da app.js

    // Carica lo stato di collasso dal localStorage
    infoState.stazioniCollapsed = app.loadFromStorage('stazioniCollapsed', false);
    infoState.accountsCollapsed = app.loadFromStorage('accountsCollapsed', false);

    // Inizializza gli array nello stato dati se non esistono
    if (!app.state.data.stazioni) {
        app.state.data.stazioni = [];
    }
    if (!app.state.data.accounts) {
        app.state.data.accounts = [];
    }

    console.log('✅ Modulo Info inizializzato');
}

// === HTML DELLE CARD INFORMATIVE ===
function getInfoCardsHTML() {
    // Questa funzione non dipende dall'istanza 'app', può rimanere così
    return `
    <div class="grid grid-cols-3 gap-6">
        <div class="card info-card">
            <div class="card-header green">
                <i data-lucide="settings"></i>
                <h3 class="card-title">Gestione e Servizi</h3>
            </div>
            <div class="card-body">
                <ul class="info-links-list">
                    <li><a href="https://enivirtualstation.4ts.it/" target="_blank" rel="noopener noreferrer">Virtualstation <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://myenistation.eni.com/content/myenistation/it/ordini.html" target="_blank" rel="noopener noreferrer">Ordini Carburanti <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://myenistation.eni.com/content/myenistation/it/contabilita.html" target="_blank" rel="noopener noreferrer">Contabilità <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://diviseeni.audes.com/it/customer/account/login" target="_blank" rel="noopener noreferrer">Audes <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://cardsmanager.it/Accounting/Login" target="_blank" rel="noopener noreferrer">Fattura 1click <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://fatturazioneelettronica.aruba.it/" target="_blank" rel="noopener noreferrer">Fattura (Aruba) <i data-lucide="external-link"></i></a></li>
                </ul>
            </div>
        </div>

        <div class="card info-card">
            <div class="card-header yellow">
                <i data-lucide="landmark"></i>
                <h3 class="card-title">Collegamenti Utili</h3>
            </div>
            <div class="card-body">
                <ul class="info-links-list">
                    <li><a href="https://www.unicredit.it/it/privati.html" target="_blank" rel="noopener noreferrer">Unicredit <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://www.bccroma.it/" target="_blank" rel="noopener noreferrer">BCC Roma <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://business.nexi.it/" target="_blank" rel="noopener noreferrer">Nexi Business <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://iampe.adm.gov.it/sam/UI/Login?realm=/adm&locale=it&goto=https%3A%2F%2Fwww.adm.gov.it%2Fportale%2Fweb%2Fguest%2Flogin%3Fp_p_id%3D58%26p_p_lifecycle%3D0%26_58_redirect%3D%252Fportale%252F-%252Fcorrispettivi-distributori-carburanti" target="_blank" rel="noopener noreferrer">Agenzia Dogane <i data-lucide="external-link"></i></a></li>
                    <li><a href="http://gestori.cipreg.org/" target="_blank" rel="noopener noreferrer">Cipreg (gestori) <i data-lucide="external-link"></i></a></li>
                </ul>
                <div class="sidebar-divider" style="margin: 0.75rem 0;"></div>

            </div>
        </div>
        <div class="card info-card">
            <div class="card-header pink">
                <i data-lucide="phone"></i>
                <h3 class="card-title">Assistenza</h3>
            </div>
            <div class="card-body">
                <ul class="info-phone-list">
                    <li><span>Enilive Assistenza</span> <a href="tel:800797979">800 79 79 79</a></li>
                    <li><span>Portale Gestori</span> <a href="tel:800960970">800 960 970</a></li>
                    <li><span>POS Unicredit</span> <a href="tel:800900280">800 900 280</a></li>
                    <li><span>POS Enilive</span> <a href="tel:800999720">800 999 720</a></li>
                    <li><span>Deposito ENI</span> <a href="tel:0691820084">06 9182 0084</a></li>
                    <li><span>Fortech</span> <a href="tel:800216756">800 216 756</a></li>
                </ul>
            </div>
        </div>
        </div>
    `;
}

// === SETUP EVENT LISTENERS (SPOSTATO PRIMA DI RENDERINFOSECTION) ===
function setupInfoEventListeners(app) { // Riceve 'app' come argomento
    const container = document.getElementById('section-info');
    if (!container) return;

    // Rimuove i listener precedenti usando i riferimenti salvati
    if (container._infoClickHandler) {
        container.removeEventListener('click', container._infoClickHandler);
    }
    if (container._infoInputHandler) {
        container.removeEventListener('input', container._infoInputHandler);
    }
    if (container._infoChangeHandler) {
        container.removeEventListener('change', container._infoChangeHandler);
    }

    // Crea i listener "bound" legando 'this' all'istanza 'app'
    const boundClickHandler = handleInfoClick.bind(app);
    const boundInputHandler = handleInfoInput.bind(app);
    const boundChangeHandler = handleInfoChange.bind(app);

    // Salva i riferimenti per poterli rimuovere la prossima volta
    container._infoClickHandler = boundClickHandler;
    container._infoInputHandler = boundInputHandler;
    container._infoChangeHandler = boundChangeHandler;

    // Aggiunge i nuovi listener "bound"
    container.addEventListener('click', boundClickHandler);
    container.addEventListener('input', boundInputHandler);
    container.addEventListener('change', boundChangeHandler);
}

// Handler delegato per tutti i click nella sezione Info
function handleInfoClick(event) {
    const app = this; // 'this' è l'istanza dell'app grazie a .bind(app)
    if (!app) {
        console.error("Istanza App (this) non trovata in handleInfoClick");
        return;
    }
    const target = event.target;

    // Gestione sezioni collassabili
    const collapsibleHeader = target.closest('.collapsible-header');
    if (collapsibleHeader) {
        const sectionName = collapsibleHeader.dataset.sectionName;
        const sectionEl = collapsibleHeader.closest('.collapsible-section');
        if (!sectionEl) return;
        const isCollapsed = sectionEl.classList.toggle('collapsed');

        if (sectionName === 'stazioni') {
            infoState.stazioniCollapsed = isCollapsed;
            app.saveToStorage('stazioniCollapsed', isCollapsed);
        } else if (sectionName === 'accounts') {
            infoState.accountsCollapsed = isCollapsed;
            app.saveToStorage('accountsCollapsed', isCollapsed);
        }
        app.refreshIcons(); // Aggiorna icona chevron
        return;
    }

    // Gestione pulsanti Stazioni
    if (target.closest('#import-stazioni-btn')) {
        const fileInput = document.getElementById('import-stazioni-file');
        if (fileInput) fileInput.click();
    }
    if (target.closest('#print-stazioni-btn')) printStazioni.call(app);
    if (target.closest('#delete-stazioni-btn')) deleteStazioniList.call(app);

    // Gestione pulsanti Account
    if (target.closest('#new-account-btn')) openNewAccountModal.call(app);
    if (target.closest('#import-accounts-btn')) {
         const fileInput = document.getElementById('import-accounts-file');
         if (fileInput) fileInput.click();
    }
    if (target.closest('#export-accounts-btn')) exportAccountsToCSV.call(app);
    if (target.closest('#delete-accounts-btn')) deleteAccountsList.call(app);

    // Gestione click su card Account (usa onclick globale, vedi openAccountModal)
    // const accountCard = target.closest('.contatto-card[onclick]');
    // Non serve codice specifico qui se usi l'attributo onclick
}

// Handler delegato per gli input
function handleInfoInput(event) {
    const app = this; // 'this' è l'istanza dell'app
    if (!app) {
        console.error("Istanza App (this) non trovata in handleInfoInput");
        return;
    }
    if (event.target.id === 'info-search-stazioni-input') {
        infoState.searchQueryStazioni = event.target.value;
        renderStazioniTable.call(app);
    }
    if (event.target.id === 'info-search-accounts-input') {
        infoState.searchQueryAccounts = event.target.value;
        renderAccountsGrid.call(app);
    }
}

// Handler delegato per i change (es. upload file)
function handleInfoChange(event) {
    const app = this; // 'this' è l'istanza dell'app
    if (!app) {
        console.error("Istanza App (this) non trovata in handleInfoChange");
        return;
    }
    if (event.target.id === 'import-stazioni-file') importStazioniFromCSV.call(app, event);
    if (event.target.id === 'import-accounts-file') importAccountsFromCSV.call(app, event);
}


// === RENDER SEZIONE INFO (CHIAMA SETUP EVENT LISTENERS ALLA FINE) ===
function renderInfoSection(container) {
    console.log('🎨 Rendering sezione Info...');
    const app = this; // 'this' è l'istanza dell'app

    container.innerHTML = `
        <div class="space-y-6">
            ${getInfoCardsHTML()}

            <div class="card collapsible-section ${infoState.stazioniCollapsed ? 'collapsed' : ''}">
                 <div class="card-header collapsible-header" data-section-name="stazioni">
                    <h2 class="card-title">Impianti ENILIVE Roma</h2>
                    <button class="collapse-toggle"><i data-lucide="${infoState.stazioniCollapsed ? 'chevron-down' : 'chevron-up'}"></i></button>
                </div>
                <div class="card-body collapsible-content">
                    <div class="filters-bar" style="background: none; border: none; padding: 0; margin-bottom: 1.5rem;">
                        <div class="filter-group">
                            <div class="input-group">
                                <i data-lucide="search" class="input-group-icon"></i>
                                <input type="search" id="info-search-stazioni-input" class="form-control"
                                       placeholder="Cerca per PV, ragione sociale, indirizzo..."
                                       value="${infoState.searchQueryStazioni}" autocomplete="off">
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button id="import-stazioni-btn" class="btn btn-primary">
                                <i data-lucide="upload" class="w-4 h-4 mr-2"></i> Importa
                            </button>
                            <button id="print-stazioni-btn" class="btn btn-secondary">
                                <i data-lucide="printer" class="w-4 h-4 mr-2"></i> Stampa
                            </button>
                            <button id="delete-stazioni-btn" class="btn btn-danger">
                                <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i> Elimina Lista
                            </button>
                        </div>
                    </div>
                    <input type="file" id="import-stazioni-file" accept=".csv" style="display: none;">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th style="width: 10%;">PV</th>
                                    <th style="width: 35%;">Ragione Sociale</th>
                                    <th style="width: 40%;">Indirizzo</th>
                                    <th style="width: 15%;">Telefono</th>
                                </tr>
                            </thead>
                            <tbody id="stazioni-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="card collapsible-section ${infoState.accountsCollapsed ? 'collapsed' : ''}">
                <div class="card-header collapsible-header" data-section-name="accounts">
                    <h2 class="card-title">Gestione Account Personali</h2>
                     <button class="collapse-toggle"><i data-lucide="${infoState.accountsCollapsed ? 'chevron-down' : 'chevron-up'}"></i></button>
                </div>
                <div class="card-body collapsible-content">
                    <div class="filters-bar" style="background: none; border: none; padding: 0; margin-bottom: 1.5rem;">
                        <div class="filter-group">
                             <div class="input-group">
                                <i data-lucide="search" class="input-group-icon"></i>
                                <input type="search" id="info-search-accounts-input" class="form-control"
                                       placeholder="Cerca per nome account..."
                                       value="${infoState.searchQueryAccounts}" autocomplete="off">
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                             <button id="new-account-btn" class="btn btn-primary">
                                <i data-lucide="plus-circle" class="w-4 h-4 mr-2"></i> Aggiungi
                             </button>
                             <button id="import-accounts-btn" class="btn btn-secondary">
                                <i data-lucide="upload" class="w-4 h-4 mr-2"></i> Importa
                            </button>
                            <button id="export-accounts-btn" class="btn btn-secondary">
                                <i data-lucide="download" class="w-4 h-4 mr-2"></i> Esporta
                            </button>
                            <button id="delete-accounts-btn" class="btn btn-danger">
                                <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i> Elimina Lista
                            </button>
                        </div>
                        </div>
                    <input type="file" id="import-accounts-file" accept=".csv" style="display: none;">
                    <div id="accounts-grid" class="contatti-grid">
                        </div>
                </div>
            </div>
        </div>
    `;

    renderAccountsGrid.call(app); // Usa call per passare 'app' come 'this'
    renderStazioniTable.call(app); // Usa call per passare 'app' come 'this'
    setupInfoEventListeners(app); // Passa 'app' esplicitamente QUI!
    app.refreshIcons();
}

// --- FUNZIONI PER GESTIONE ACCOUNT ---
// (Le funzioni da openNewAccountModal in poi rimangono come nel blocco precedente)
// Assicurati che usino 'this' o '.call(app)' dove necessario,
// TRANNE openAccountModal che usa window.myStation.

function renderAccountsGrid() {
    const app = this; // Usa this
    const grid = document.getElementById('accounts-grid');
    if (!grid) return;

    const accounts = getFilteredAccounts.call(app); // Usa call

    accounts.sort((a, b) => a.name.localeCompare(b.name));

    if (accounts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i data-lucide="key-round"></i>
                <div class="empty-state-title">Nessun account trovato</div>
                <div class="empty-state-description">Aggiungi un nuovo account o importa un file CSV.</div>
            </div>`;
    } else {
        grid.innerHTML = accounts.map((account, index) => {
            const colors = getStatCardColorByIndex(index);
            const cardStyle = `background-color: ${colors.background}; border-color: ${colors.border};`;
            // Chiamiamo openAccountModal tramite attributo onclick, deve funzionare globalmente
            return `
                <div class="contatto-card" onclick="openAccountModal('${account.id}')" style="${cardStyle}">
                    <div class="contatto-card-header">
                        <div class="contatto-main-info">
                            <h3 class="contatto-name">${account.name}</h3>
                        </div>
                    </div>
                     <div class="contatto-user-icon" style="color: ${colors.border};">
                        <i data-lucide="key-round"></i>
                    </div>
                </div>
            `;
        }).join('');
    }
    app.refreshIcons();
}

function getFilteredAccounts() {
    const app = this; // Usa this
    let accounts = [...(app.state.data.accounts || [])];
    const query = infoState.searchQueryAccounts.toLowerCase().trim();

    if (query) {
        accounts = accounts.filter(acc =>
            (acc.name && acc.name.toLowerCase().includes(query)) ||
            (acc.content && acc.content.toLowerCase().includes(query))
        );
    }
    return accounts;
}

function openNewAccountModal() {
    const app = this; // Usa this

    const modalHTML = `
        <div class="modal-header">
            <h2>Nuovo Account</h2>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label class="form-label">Nome Account</label>
                <input type="text" id="account-name-input" class="form-control" style="max-width: 100%;" placeholder="Es. Account Google">
            </div>
            <div class="form-group">
                <label class="form-label">Contenuto (Username, Password, etc.)</label>
                <textarea id="account-content-textarea" class="form-control" style="max-width: 100%; height: 200px; min-height: 150px;" placeholder="username: example@email.com\npassword: P@ssw0rd!"></textarea>
            </div>
        </div>
        <div class="modal-actions">
            <button id="cancel-account-modal-btn" class="btn btn-secondary">Annulla</button>
            <button id="save-new-account-modal-btn" class="btn btn-success">Salva Account</button>
        </div>
    `;

    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = modalHTML;
    modalContentEl.classList.remove('modal-wide');
    modalContentEl.classList.add('modal-account');

    const saveBtn = document.getElementById('save-new-account-modal-btn');
    const cancelBtn = document.getElementById('cancel-account-modal-btn');

    if (saveBtn) saveBtn.onclick = () => saveNewAccountFromModal.call(app);
    if (cancelBtn) cancelBtn.onclick = () => app.hideFormModal();

    app.showFormModal();
    const nameInput = document.getElementById('account-name-input');
    if (nameInput) nameInput.focus();
}

function saveNewAccountFromModal() {
    const app = this; // Usa this
    const nameInput = document.getElementById('account-name-input');
    const contentInput = document.getElementById('account-content-textarea');

    if (!nameInput || !contentInput) return;

    const name = nameInput.value.trim();
    const content = contentInput.value.trim();

    if (!name) {
        return app.showNotification('Il nome dell\'account non può essere vuoto.', 'error');
    }

    const newAccount = {
        id: app.generateUniqueId('account'),
        name: name,
        content: content
    };

    app.state.data.accounts.push(newAccount);
    app.saveToStorage('data', app.state.data);
    app.showNotification('Account aggiunto con successo.');
    app.hideFormModal();
    renderAccountsGrid.call(app);
}

// Funzione globale chiamata da onclick="..."
function openAccountModal(accountId) {
    const app = window.myStation; // Usa globale qui!
    if (!app) {
        console.error("Istanza globale app (window.myStation) non trovata in openAccountModal");
        return;
    }
    const account = app.state.data.accounts.find(acc => acc.id === accountId);
    if (!account) return;

    const modalHTML = `
        <div class="modal-header">
            <h2>Dati Account: ${account.name}</h2>
        </div>
        <div class="modal-body">
            <input type="hidden" id="account-id-input" value="${account.id}">
            <div class="form-group">
                <label class="form-label">Nome Account</label>
                <input type="text" id="account-name-input" class="form-control" style="max-width: 100%;" value="${account.name}">
            </div>
            <div class="form-group">
                <label class="form-label">Contenuto</label>
                <textarea id="account-content-textarea" class="form-control" style="max-width: 100%; height: 200px; min-height: 150px;">${account.content}</textarea>
            </div>
        </div>
        <div class="modal-actions">
            <button id="delete-account-btn" class="btn btn-danger" style="margin-right: auto;">Elimina</button>
            <button id="cancel-account-modal-btn" class="btn btn-secondary">Annulla</button>
            <button id="save-account-modal-btn" class="btn btn-success">Salva</button>
        </div>
    `;

    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = modalHTML;
    modalContentEl.classList.remove('modal-wide');
    modalContentEl.classList.add('modal-account');

    const saveBtn = document.getElementById('save-account-modal-btn');
    const cancelBtn = document.getElementById('cancel-account-modal-btn');
    const deleteBtn = document.getElementById('delete-account-btn');

    if (saveBtn) saveBtn.onclick = () => saveAccountFromModal.call(app);
    if (cancelBtn) cancelBtn.onclick = () => app.hideFormModal();
    if (deleteBtn) deleteBtn.onclick = () => deleteAccountFromModal.call(app, accountId);

    app.showFormModal();
}

function saveAccountFromModal() {
    const app = this; // Usa this
    const idInput = document.getElementById('account-id-input');
    const nameInput = document.getElementById('account-name-input');
    const contentInput = document.getElementById('account-content-textarea');

    if (!idInput || !nameInput || !contentInput) return;

    const accountId = idInput.value;
    const newName = nameInput.value.trim();
    const newContent = contentInput.value.trim();

    if (!newName) {
        return app.showNotification('Il nome dell\'account non può essere vuoto.', 'error');
    }

    const accountIndex = app.state.data.accounts.findIndex(acc => acc.id === accountId);
    if (accountIndex !== -1) {
        app.state.data.accounts[accountIndex].name = newName;
        app.state.data.accounts[accountIndex].content = newContent;

        app.saveToStorage('data', app.state.data);
        app.showNotification('Account aggiornato con successo.');
        app.hideFormModal();
        renderAccountsGrid.call(app);
    } else {
         app.showNotification('Errore: account non trovato.', 'error');
         app.hideFormModal();
    }
}

function deleteAccountFromModal(accountId) {
    const app = this; // Usa this
    app.hideFormModal();

    setTimeout(() => {
        app.showConfirm(
            `Sei sicuro di voler eliminare questo account?<br><br>L'azione è irreversibile.`,
            () => {
                app.state.data.accounts = app.state.data.accounts.filter(acc => acc.id !== accountId);
                app.saveToStorage('data', app.state.data);
                app.showNotification("Account eliminato.");
                renderAccountsGrid.call(app);
            }
        );
    }, 500);
}

function importAccountsFromCSV(event) {
    const app = this; // Usa this
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target.result;
            const rows = [];
            let currentRow = '';
            let inQuotes = false;

            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                if (char === '"') {
                    if (inQuotes && text[i + 1] === '"') {
                        currentRow += '"'; i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if ((char === '\n' || char === '\r') && !inQuotes) {
                    if (currentRow.trim() || rows.length > 0) rows.push(currentRow);
                    currentRow = '';
                    if (char === '\r' && text[i + 1] === '\n') i++;
                } else {
                    currentRow += char;
                }
            }
            if (currentRow || rows.length > 0) rows.push(currentRow);

            if (rows.length > 0 && rows[0].trim().toLowerCase().startsWith('nome;contenuto')) {
                rows.shift();
            }

            const importedAccounts = [];
            rows.forEach((row, index) => {
                const delimiterIndex = row.indexOf(';');
                if (delimiterIndex !== -1) {
                    let name = row.substring(0, delimiterIndex).trim();
                    let content = row.substring(delimiterIndex + 1).trim();
                    if (name.startsWith('"') && name.endsWith('"')) name = name.substring(1, name.length - 1).replace(/""/g, '"');
                    if (content.startsWith('"') && content.endsWith('"')) content = content.substring(1, content.length - 1).replace(/""/g, '"');
                    if (name) importedAccounts.push({ id: app.generateUniqueId('account'), name: name, content: content });
                    else console.warn(`Riga ${index + 1} saltata: nome mancante.`);
                } else if (row.trim()) {
                    console.warn(`Riga ${index + 1} saltata: delimitatore ';' non trovato.`);
                }
            });

            if (importedAccounts.length === 0) return app.showNotification("Nessun account valido trovato nel CSV.", "warning");

            app.state.data.accounts = [...app.state.data.accounts, ...importedAccounts];
            app.saveToStorage('data', app.state.data);
            app.showNotification(`${importedAccounts.length} account importati.`);
            renderAccountsGrid.call(app);

        } catch (error) {
            console.error("Errore importazione CSV:", error);
            app.showNotification("Errore lettura file CSV.", "error");
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file, 'UTF-8');
}

function exportAccountsToCSV() {
    const app = this; // Usa this
    const accounts = getFilteredAccounts.call(app); // Usa call

    if (accounts.length === 0) return app.showNotification("Nessun account da esportare.");

    const headers = ['Nome', 'Contenuto'];
    const escapeCSV = (field) => {
        const str = (field === null || field === undefined) ? '' : String(field);
        if (str.includes('"') || str.includes(';') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvRows = [
        headers.map(escapeCSV).join(';'),
        ...accounts.map(acc => [acc.name, acc.content].map(escapeCSV).join(';'))
    ];
    const csvContent = csvRows.join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `elenco_account_${new Date().toISOString().slice(0, 10)}.csv`;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
         app.showNotification("Esportazione non supportata.", "error");
    }
    app.showNotification("Account esportati.");
}

function deleteAccountsList() {
    const app = this; // Usa this
    if (!app.state.data.accounts || app.state.data.accounts.length === 0) {
        return app.showNotification("Lista account già vuota.");
    }

    app.showConfirm(
        `Eliminare TUTTI gli account?<br><br>L'azione è irreversibile.`,
        () => {
            app.state.data.accounts = [];
            app.saveToStorage('data', app.state.data);
            renderAccountsGrid.call(app);
            app.showNotification("Lista account eliminata.");
        }
    );
}

// --- FUNZIONI PER GESTIONE STAZIONI ---

function renderStazioniTable() {
    const app = this; // Usa this
    const tbody = document.getElementById('stazioni-tbody');
    if (!tbody) return;

    const stazioni = getFilteredStazioni.call(app); // Usa call

    stazioni.sort((a, b) => (parseInt(a.pv, 10) || 0) - (parseInt(b.pv, 10) || 0));

    if (stazioni.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-12">
                    <div class="empty-state">
                        <i data-lucide="fuel"></i>
                        <div class="empty-state-title">Nessuna stazione trovata</div>
                        <div class="empty-state-description">Importa un file CSV.</div>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = stazioni.map(stazione => `
            <tr class="hover:bg-secondary">
                <td class="font-medium text-primary">${stazione.pv || '-'}</td>
                <td>${stazione.ragioneSociale || '-'}</td>
                <td>${stazione.indirizzo || '-'}</td>
                <td>${stazione.telefono || '-'}</td>
            </tr>
        `).join('');
    }
    app.refreshIcons();
}

function getFilteredStazioni() {
    const app = this; // Usa this
    let stazioni = [...(app.state.data.stazioni || [])];
    const query = infoState.searchQueryStazioni.toLowerCase().trim();

    if (query) {
        stazioni = stazioni.filter(s =>
            (s.pv && String(s.pv).toLowerCase().includes(query)) ||
            (s.ragioneSociale && s.ragioneSociale.toLowerCase().includes(query)) ||
            (s.indirizzo && s.indirizzo.toLowerCase().includes(query)) ||
            (s.telefono && String(s.telefono).toLowerCase().includes(query))
        );
    }
    return stazioni;
}

function importStazioniFromCSV(event) {
    const app = this; // Usa this
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target.result;
            const lines = text.trim().split(/\r?\n/);

            if (lines.length < 1) return app.showNotification("File CSV stazioni vuoto.", "warning");

            // Rimuovi header flessibile
            if (lines[0].toLowerCase().includes('pv') && lines[0].toLowerCase().includes('ragionesociale')) {
                 lines.shift();
            }
             if (lines.length === 0) return app.showNotification("File CSV stazioni contiene solo header.", "warning");


            const delimiter = lines[0].includes(';') ? ';' : ',';
            const importedStazioni = [];

            lines.forEach((row, index) => {
                if (!row.trim()) return;

                // Split CSV robusto (semplificato)
                const columns = [];
                let currentColumn = '';
                let inQuotes = false;
                for (let i = 0; i < row.length; i++) {
                     const char = row[i];
                     if (char === '"') {
                         if (inQuotes && row[i+1] === '"') { currentColumn += '"'; i++; }
                         else { inQuotes = !inQuotes; }
                     } else if (char === delimiter && !inQuotes) {
                         columns.push(currentColumn.trim()); currentColumn = '';
                     } else {
                         currentColumn += char;
                     }
                 }
                columns.push(currentColumn.trim());

                if (columns.length >= 2) {
                    const pv = columns[0] || '';
                    const ragioneSociale = columns[1] || '';
                    const indirizzo = columns[2] || '';
                    const telefono = columns[3] || '';

                    if (pv && ragioneSociale) importedStazioni.push({ pv, ragioneSociale, indirizzo, telefono });
                    else console.warn(`Riga ${index + 1} stazioni saltata: PV o Ragione Sociale mancante.`);
                } else {
                     console.warn(`Riga ${index + 1} stazioni saltata: colonne insufficienti.`);
                }
            });

            if (importedStazioni.length > 0) {
                app.state.data.stazioni = importedStazioni; // Sovrascrive
                app.saveToStorage('data', app.state.data);
                app.showNotification(`${importedStazioni.length} impianti importati.`);
                renderStazioniTable.call(app);
            } else {
                app.showNotification("Nessun dato stazione valido trovato nel CSV.", "warning");
            }

        } catch (error) {
            console.error("Errore importazione CSV Stazioni:", error);
            app.showNotification("Errore lettura file CSV stazioni.", "error");
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file, 'UTF-8');
}

function deleteStazioniList() {
    const app = this; // Usa this
    if (!app.state.data.stazioni || app.state.data.stazioni.length === 0) {
        return app.showNotification("Lista stazioni già vuota.");
    }
    app.showConfirm(
        `Eliminare l'elenco stazioni?<br><br>Azione irreversibile.`,
        () => {
            app.state.data.stazioni = [];
            app.saveToStorage('data', app.state.data);
            renderStazioniTable.call(app);
            app.showNotification("Elenco stazioni eliminato.");
        }
    );
}

function printStazioni() {
    const app = this; // Usa this
    const stazioni = getFilteredStazioni.call(app);

    if (stazioni.length === 0) return app.showNotification("Nessun impianto da stampare.");

    stazioni.sort((a, b) => (parseInt(a.pv, 10) || 0) - (parseInt(b.pv, 10) || 0));

    const dateElement = document.getElementById('print-info-date');
    if (dateElement) dateElement.textContent = `Elenco aggiornato al ${app.formatDateForFilename()}`;

    const printList = document.getElementById('print-info-list');
    if (!printList) return console.error("Elemento 'print-info-list' non trovato.");

    printList.innerHTML = stazioni.map(stazione => `
        <tr>
            <td>${stazione.pv || '-'}</td>
            <td>${stazione.ragioneSociale || '-'}</td>
            <td>${stazione.indirizzo || '-'}</td>
            <td>${stazione.telefono || '-'}</td>
        </tr>
    `).join('');

    document.querySelectorAll('.print-section').forEach(el => el.classList.add('hidden'));
    const printContentEl = document.getElementById('print-info-content');
    if (printContentEl) {
        printContentEl.classList.remove('hidden');
        requestAnimationFrame(() => { window.print(); });
    } else {
         console.error("Elemento 'print-info-content' non trovato.");
    }
}

// Funzione helper per colori
function getStatCardColorByIndex(index) {
    if (typeof STAT_CARD_COLORS !== 'undefined' && Array.isArray(STAT_CARD_COLORS) && STAT_CARD_COLORS.length > 0) {
        return STAT_CARD_COLORS[index % STAT_CARD_COLORS.length];
    }
    return { background: 'rgba(107, 114, 128, 0.1)', border: 'rgba(107, 114, 128, 0.4)' };
}

// === EXPORT GLOBALI ===
if (typeof window !== 'undefined') {
    window.initInfo = initInfo;
    window.renderInfoSection = renderInfoSection;
    // openAccountModal DEVE essere globale
    window.openAccountModal = openAccountModal;
}
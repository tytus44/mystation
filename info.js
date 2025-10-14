// =============================================
// FILE: info.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Info (link, numeri utili, stazioni e account).
// =============================================

// === STATO LOCALE DEL MODULO INFO ===
let infoState = {
    searchQueryStazioni: '',
    searchQueryAccounts: '', // Aggiunto per la ricerca account
};

// === INIZIALIZZAZIONE MODULO INFO ===
function initInfo() {
    console.log('ℹ️ Inizializzazione modulo Info...');
    const app = this;

    if (!app.state.data.stazioni) {
        app.state.data.stazioni = [];
    }
    // Aggiunge l'array 'accounts' allo stato globale se non esiste
    if (!app.state.data.accounts) {
        app.state.data.accounts = [];
    }

    console.log('✅ Modulo Info inizializzato');
}

// === HTML DELLE CARD INFORMATIVE ===
function getInfoCardsHTML() {
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
                <h3 class="card-title">Banche e Enti</h3>
            </div>
            <div class="card-body">
                <ul class="info-links-list">
                    <li><a href="https://www.unicredit.it/it/privati.html" target="_blank" rel="noopener noreferrer">Unicredit <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://www.bccroma.it/" target="_blank" rel="noopener noreferrer">BCC Roma <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://business.nexi.it/" target="_blank" rel="noopener noreferrer">Nexi Business <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://iampe.adm.gov.it/sam/UI/Login?realm=/adm&locale=it&goto=https%3A%2F%2Fwww.adm.gov.it%2Fportale%2Fweb%2Fguest%2Flogin%3Fp_p_id%3D58%26p_p_lifecycle%3D0%26_58_redirect%3D%252Fportale%252F-%252Fcorrispettivi-distributori-carburanti" target="_blank" rel="noopener noreferrer">Agenzia Dogane <i data-lucide="external-link"></i></a></li>
                    <li><a href="http://gestori.cipreg.org/" target="_blank" rel="noopener noreferrer">Cipreg (gestori) <i data-lucide="external-link"></i></a></li>
                </ul>
            </div>
        </div>
        <div class="card info-card">
            <div class="card-header pink">
                <i data-lucide="phone"></i>
                <h3 class="card-title">Numeri Utili</h3>
            </div>
            <div class="card-body">
                <ul class="info-phone-list">
                    <li><span>Enilive Assistenza</span> <a href="tel:800797979">800 79 79 79</a></li>
                    <li><span>Portale Gestori</span> <a href="tel:800960970">800 960 970</a></li>
                    <li><span>POS Unicredit</span> <a href="tel:800900280">800 900 280</a></li>
                    <li><span>POS Enilive</span> <a href="tel:800999720">800 999 720</a></li>
                    <li><span>Deposito ENI</span> <a href="tel:0691820084">06 9182 0084</a></li>
                    <li><span>ARETI (guasti)</span> <a href="tel:800130336">800 130 336</a></li>
                </ul>
            </div>
        </div>
    </div>
    `;
}

// === RENDER SEZIONE INFO (CON ORDINE INVERTITO) ===
function renderInfoSection(container) {
    console.log('🎨 Rendering sezione Info...');
    const app = this;

    container.innerHTML = `
        <div class="space-y-6">
            ${getInfoCardsHTML()}

            <div class="card">
                 <div class="card-header">
                    <h2 class="card-title">Impianti ENILIVE Roma</h2>
                </div>
                <div class="card-body">
                    <div class="filters-bar" style="background: none; border: none; padding: 0; margin-bottom: 1.5rem;">
                        <div class="filter-group">
                            <div class="input-group">
                                <i data-lucide="search" class="input-group-icon"></i>
                                <input type="search" id="info-search-stazioni-input" class="form-control" 
                                       placeholder="Cerca per denominazione o indirizzo..." 
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
                                    <th>Denominazione</th>
                                    <th>Indirizzo</th>
                                </tr>
                            </thead>
                            <tbody id="stazioni-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Gestione Account Personali</h2>
                </div>
                <div class="card-body">
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
                             <button id="import-accounts-btn" class="btn btn-primary">
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

    renderAccountsGrid.call(app);
    renderStazioniTable.call(app);
    setupInfoEventListeners.call(app);
    app.refreshIcons();
}

// --- NUOVE FUNZIONI PER GESTIONE ACCOUNT ---

function renderAccountsGrid() {
    const app = this;
    const grid = document.getElementById('accounts-grid');
    if (!grid) return;

    const accounts = getFilteredAccounts.call(app);
    
    accounts.sort((a, b) => a.name.localeCompare(b.name));

    if (accounts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i data-lucide="key-round"></i>
                <div class="empty-state-title">Nessun account trovato</div>
                <div class="empty-state-description">Importa un file CSV per iniziare.</div>
            </div>`;
    } else {
        grid.innerHTML = accounts.map((account, index) => {
            const colors = getStatCardColorByIndex(index);
            const cardStyle = `background-color: ${colors.background}; border-color: ${colors.border};`;
            
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
    const app = this;
    let accounts = [...(app.state.data.accounts || [])];
    const query = infoState.searchQueryAccounts.toLowerCase().trim();

    if (query) {
        accounts = accounts.filter(acc =>
            acc.name.toLowerCase().includes(query) ||
            acc.content.toLowerCase().includes(query)
        );
    }
    return accounts;
}

function openAccountModal(accountId) {
    const app = getApp();
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
    modalContentEl.classList.add('modal-account');

    document.getElementById('save-account-modal-btn').addEventListener('click', saveAccountFromModal);
    document.getElementById('cancel-account-modal-btn').addEventListener('click', () => app.hideFormModal());
    document.getElementById('delete-account-btn').addEventListener('click', () => deleteAccountFromModal(account.id));

    app.showFormModal();
}

function saveAccountFromModal() {
    const app = getApp();
    const accountId = document.getElementById('account-id-input').value;
    const newName = document.getElementById('account-name-input').value.trim();
    const newContent = document.getElementById('account-content-textarea').value.trim();

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
    }
}

function deleteAccountFromModal(accountId) {
    const app = getApp();
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
    }, 300);
}

function importAccountsFromCSV(event) {
    const app = this;
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
                        currentRow += '"';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                }
                if ((char === '\n' || char === '\r') && !inQuotes) {
                    if (currentRow.trim()) {
                        rows.push(currentRow);
                    }
                    currentRow = '';
                    if (char === '\r' && text[i + 1] === '\n') {
                        i++;
                    }
                } else {
                    currentRow += char;
                }
            }
            if (currentRow.trim()) {
                rows.push(currentRow);
            }

            if (rows.length > 0 && rows[0].toLowerCase().startsWith('nome;contenuto')) {
                rows.shift();
            }

            const importedAccounts = [];
            rows.forEach(row => {
                const delimiterIndex = row.indexOf(';');
                if (delimiterIndex !== -1) {
                    const name = row.substring(0, delimiterIndex).trim();
                    let content = row.substring(delimiterIndex + 1).trim();

                    if (content.startsWith('"') && content.endsWith('"')) {
                        content = content.substring(1, content.length - 1).replace(/""/g, '"');
                    }
                    
                    if (name) {
                        importedAccounts.push({
                            id: app.generateUniqueId('account'),
                            name: name,
                            content: content
                        });
                    }
                }
            });

            if (importedAccounts.length === 0) {
                 return app.showNotification("Nessun account valido trovato. Il formato deve essere NOME;\"CONTENUTO\"", "error");
            }

            app.state.data.accounts = [...app.state.data.accounts, ...importedAccounts];
            app.saveToStorage('data', app.state.data);
            app.showNotification(`${importedAccounts.length} account importati con successo.`);
            renderAccountsGrid.call(app);

        } catch (error) {
            console.error("Errore importazione CSV:", error);
            app.showNotification("Errore durante la lettura del file.", "error");
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file, 'UTF-8');
}


function exportAccountsToCSV() {
    const app = this;
    const accounts = getFilteredAccounts.call(app);

    if (accounts.length === 0) {
        return app.showNotification("Nessun account da esportare.");
    }

    const headers = ['Nome', 'Contenuto'];
    const rows = accounts.map(acc => [acc.name, acc.content]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(';'))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `elenco_account_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    
    app.showNotification("Elenco account esportato con successo.");
}


function deleteAccountsList() {
    const app = this;
    if (!app.state.data.accounts || app.state.data.accounts.length === 0) {
        return app.showNotification("La lista degli account è già vuota.");
    }

    app.showConfirm(
        `Sei sicuro di voler eliminare TUTTI gli account?<br><br>L'azione è irreversibile.`,
        () => {
            app.state.data.accounts = [];
            app.saveToStorage('data', app.state.data);
            renderAccountsGrid.call(app);
            app.showNotification("Elenco account eliminato con successo.");
        }
    );
}

// --- FUNZIONI ESISTENTI PER GESTIONE STAZIONI ---

function renderStazioniTable() {
    const app = this;
    const tbody = document.getElementById('stazioni-tbody');
    if (!tbody) return;

    const stazioni = getFilteredStazioni.call(app);

    if (stazioni.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-12">
                    <div class="empty-state">
                        <i data-lucide="fuel"></i>
                        <div class="empty-state-title">Nessuna stazione di servizio trovata</div>
                        <div class="empty-state-description">Importa un file CSV per iniziare.</div>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = stazioni.map(stazione => `
            <tr class="hover:bg-secondary">
                <td class="font-medium text-primary">${stazione.denominazione}</td>
                <td class="text-primary">${stazione.indirizzo}</td>
            </tr>
        `).join('');
    }

    app.refreshIcons();
}

function getFilteredStazioni() {
    const app = this;
    let stazioni = [...(app.state.data.stazioni || [])];
    const query = infoState.searchQueryStazioni.toLowerCase().trim();

    if (query) {
        stazioni = stazioni.filter(s =>
            s.denominazione.toLowerCase().includes(query) ||
            s.indirizzo.toLowerCase().includes(query)
        );
    }

    return stazioni;
}

function importStazioniFromCSV(event) {
    const app = this;
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target.result;
            const rows = text.split('\n').slice(1);
            const importedStazioni = [];
            
            rows.forEach(row => {
                const columns = row.split(';'); 
                let denominazione = columns[0] ? columns[0].trim().replace(/"/g, '') : '';
                let indirizzo = columns[1] ? columns[1].trim().replace(/"/g, '') : '';
                
                denominazione = normalizeString(denominazione);
                indirizzo = normalizeString(indirizzo);
                
                if (denominazione && indirizzo) {
                    importedStazioni.push({ denominazione, indirizzo });
                }
            });

            app.state.data.stazioni = importedStazioni;
            app.saveToStorage('data', app.state.data);
            app.showNotification(`${importedStazioni.length} stazioni importate con successo.`);
            renderStazioniTable.call(app);

        } catch (error) {
            console.error("Errore durante l'importazione CSV:", error);
            app.showNotification("Errore durante l'importazione del file.", "error");
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file, 'UTF-8');
}


function deleteStazioniList() {
    const app = this;

    if (!app.state.data.stazioni || app.state.data.stazioni.length === 0) {
        app.showNotification("La lista è già vuota.");
        return;
    }

    app.showConfirm(
        `Sei sicuro di voler eliminare l'intero elenco di stazioni?<br><br>L'azione è irreversibile.`,
        () => {
            app.state.data.stazioni = [];
            app.saveToStorage('data', app.state.data);
            renderStazioniTable.call(app);
            app.showNotification("Elenco stazioni eliminato con successo.");
        }
    );
}

function normalizeString(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

// === SETUP EVENT LISTENERS ===
function setupInfoEventListeners() {
    const app = this;
    
    const searchStazioniInput = document.getElementById('info-search-stazioni-input');
    if (searchStazioniInput) {
        searchStazioniInput.addEventListener('input', (e) => {
            infoState.searchQueryStazioni = e.target.value;
            renderStazioniTable.call(app);
        });
    }
    const importStazioniBtn = document.getElementById('import-stazioni-btn');
    const importStazioniFile = document.getElementById('import-stazioni-file');
    if (importStazioniBtn && importStazioniFile) {
        importStazioniBtn.addEventListener('click', () => importStazioniFile.click());
        importStazioniFile.addEventListener('change', (e) => importStazioniFromCSV.call(app, e));
    }
    const printStazioniBtn = document.getElementById('print-stazioni-btn');
    if(printStazioniBtn) printStazioniBtn.addEventListener('click', () => printStazioni.call(app));
    const deleteStazioniBtn = document.getElementById('delete-stazioni-btn');
    if(deleteStazioniBtn) deleteStazioniBtn.addEventListener('click', () => deleteStazioniList.call(app));

    const searchAccountsInput = document.getElementById('info-search-accounts-input');
    if (searchAccountsInput) {
        searchAccountsInput.addEventListener('input', (e) => {
            infoState.searchQueryAccounts = e.target.value;
            renderAccountsGrid.call(app);
        });
    }
    const importAccountsBtn = document.getElementById('import-accounts-btn');
    const importAccountsFile = document.getElementById('import-accounts-file');
    if (importAccountsBtn && importAccountsFile) {
        importAccountsBtn.addEventListener('click', () => importAccountsFile.click());
        importAccountsFile.addEventListener('change', (e) => importAccountsFromCSV.call(app, e));
    }
    const exportAccountsBtn = document.getElementById('export-accounts-btn');
    if(exportAccountsBtn) exportAccountsBtn.addEventListener('click', () => exportAccountsToCSV.call(app));
    const deleteAccountsBtn = document.getElementById('delete-accounts-btn');
    if(deleteAccountsBtn) deleteAccountsBtn.addEventListener('click', () => deleteAccountsList.call(app));
}

function getStatCardColorByIndex(index) {
    if (typeof STAT_CARD_COLORS !== 'undefined') {
        return STAT_CARD_COLORS[index % STAT_CARD_COLORS.length];
    }
    return { background: 'rgba(107, 114, 128, 0.18)', border: 'rgba(107, 114, 128, 0.65)' };
}

// === EXPORT GLOBALI ===
if (typeof window !== 'undefined') {
    window.initInfo = initInfo;
    window.renderInfoSection = renderInfoSection;
    window.infoState = infoState;
    window.openAccountModal = openAccountModal;
}
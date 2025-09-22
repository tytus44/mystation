// =============================================
// FILE: amministrazione.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Amministrazione (clienti, conti).
// --- MODIFICATO PER USARE TABELLA ESPANDIBILE ---
// =============================================

// === STATO LOCALE DEL MODULO AMMINISTRAZIONE ===
let amministrazioneState = {
    // View mode e filtri (persistenti)
    amministrazioneViewMode: null, // Ora sempre 'list'
    adminFilters: null,            // Caricato dal localStorage
    
    // Stato locale
    adminSort: { column: 'name', direction: 'asc' },
    newClientName: '',
    editingClient: null,
    editClientName: '',
    
    // NUOVO: Stato per riga espandibile
    expandedClientId: null, // ID del cliente attualmente espanso
    transactionForm: { description: 'Carburante', amount: null }
};

// === INIZIALIZZAZIONE MODULO AMMINISTRAZIONE ===
// Inizio funzione initAmministrazione
function initAmministrazione() {
    console.log('🛡️ Inizializzazione modulo Amministrazione...');
    
    // Carica stato persistente - SEMPRE 'list' ora
    amministrazioneState.amministrazioneViewMode = 'list';
    amministrazioneState.adminFilters = this.loadFromStorage('adminFilters', { search: '', filter: 'all' });
    
    console.log('✅ Modulo Amministrazione inizializzato');
}
// Fine funzione initAmministrazione

// === RENDER SEZIONE AMMINISTRAZIONE ===
// Inizio funzione renderAmministrazioneSection
function renderAmministrazioneSection(container) {
    console.log('🎨 Rendering sezione Amministrazione...');
    
    const app = this;
    
    // Renderizza sempre e solo la vista lista
    renderAmministrazioneListView.call(app, container);
    
    // Setup event listeners
    setupAmministrazioneEventListeners.call(app);
    
    // Refresh icone
    app.refreshIcons();
}
// Fine funzione renderAmministrazioneSection

// === RENDER VISTA LISTA CLIENTI ===
// Inizio funzione renderAmministrazioneListView
function renderAmministrazioneListView(container) {
    const app = this;
    
    container.innerHTML = `
        <div class="space-y-6">
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Clienti Attivi</div>
                        <div class="stat-value">${app.state.data.clients.length}</div>
                    </div>
                    <div class="stat-icon blue">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Totale Credito</div>
                        <div class="stat-value">${app.formatCurrency(totalCredit.call(app))}</div>
                    </div>
                    <div class="stat-icon green">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Totale Debito</div>
                        <div class="stat-value">${app.formatCurrency(totalDebit.call(app))}</div>
                    </div>
                    <div class="stat-icon red">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-down"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
                    </div>
                </div>
            </div>

            <div class="filters-bar no-print">
                <div class="filter-group">
                    <div class="input-group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-group-icon lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        <input type="search" id="client-search" placeholder="Cerca per nome..." 
                               class="form-control" value="${amministrazioneState.adminFilters.search}">
                    </div>
                </div>
                <div class="filter-group">
                    <div class="btn-group w-full">
                        <button class="btn ${amministrazioneState.adminFilters.filter === 'all' ? 'btn-primary active' : 'btn-secondary'}" 
                                data-filter-type="all">Tutti i clienti</button>
                        <button class="btn ${amministrazioneState.adminFilters.filter === 'credit' ? 'btn-primary active' : 'btn-secondary'}" 
                                data-filter-type="credit">Clienti a credito</button>
                        <button class="btn ${amministrazioneState.adminFilters.filter === 'debit' ? 'btn-primary active' : 'btn-secondary'}" 
                                data-filter-type="debit">Clienti a debito</button>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button id="new-client-btn" class="btn btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-circle"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg> Nuovo Cliente
                    </button>
                    <button id="print-clients-btn" class="btn btn-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg> Stampa Elenco
                    </button>
                </div>
            </div>

            <div class="card no-print">
                <div class="card-header">
                    <h2 class="card-title">Elenco Clienti</h2>
                </div>
                <div class="table-container">
                    <table class="table" id="clients-table">
                        <thead>
                            <tr>
                                <th><button data-sort="name">
                                    Cliente <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-down"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
                                </button></th>
                                <th><button data-sort="balance">
                                    Saldo <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-down"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
                                </button></th>
                                <th>Transazioni</th>
                                <th><button data-sort="lastTransactionDate">
                                    Ultima Operazione <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-down"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
                                </button></th>
                                <th class="text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody id="clients-tbody">
                            </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Render tabella clienti
    renderClientsTable.call(app);
}
// Fine funzione renderAmministrazioneListView

// Inizio funzione getAmministrazioneFormHTML
function getAmministrazioneFormHTML() {
    const isEdit = !!amministrazioneState.editingClient;
    const title = isEdit ? 'Modifica Cliente' : 'Nuovo Cliente';
    const clientName = isEdit ? amministrazioneState.editClientName : amministrazioneState.newClientName;

    return `
        <div class="card-header">
            <h2 class="card-title">${title}</h2>
            <button id="cancel-client-btn" class="btn btn-secondary modal-close-btn">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div class="card-body">
            <div class="form-group">
                <label class="form-label">Nome Cliente</label>
                <input type="text" id="client-name-input" class="form-control" 
                       placeholder="es. Mario Rossi" value="${clientName}" style="max-width: 100%;">
            </div>
            <div class="flex items-center justify-end space-x-4 mt-6">
                <button id="cancel-client-btn-bottom" class="btn btn-secondary">Annulla</button>
                <button id="save-client-btn" class="btn btn-primary">${isEdit ? 'Aggiorna' : 'Salva'} Cliente</button>
            </div>
        </div>
    `;
}
// Fine funzione getAmministrazioneFormHTML

// NUOVO: Inizio funzione getExpandedRowHTML
function getExpandedRowHTML(client) {
    const app = getApp();
    const transactions = client.transactions ? [...client.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
    
    return `
        <tr id="expanded-row-${client.id}" class="expanded-row" style="background-color: rgba(37, 99, 235, 0.05);">
            <td colspan="5" style="padding: 1rem 0.5rem;">
                <div class="expanded-content-frame" style="padding: 1.5rem;">
                    
                    <div class="space-y-4 mb-6">
                        <h4 class="text-lg font-medium text-primary">Nuova Transazione</h4>
                        <div class="grid grid-cols-12 gap-2 items-center">
                            <div class="col-span-3">
                                <input type="text" id="transaction-description-${client.id}" class="form-control" 
                                       placeholder="Descrizione (es. Carburante)" value="${amministrazioneState.transactionForm.description}">
                            </div>
                            <div class="col-span-1">
                                <input type="number" id="transaction-amount-${client.id}" step="0.01" class="form-control" 
                                       placeholder="€" value="${amministrazioneState.transactionForm.amount || ''}">
                            </div>
                            <div class="col-span-2">
                                <button class="btn btn-danger w-full" onclick="addTransactionInline('${client.id}', 'debit')">
                                    <i data-lucide="minus-circle"></i> Addebita
                                </button>
                            </div>
                            <div class="col-span-2">
                                <button class="btn btn-success w-full" onclick="addTransactionInline('${client.id}', 'credit')">
                                    <i data-lucide="plus-circle"></i> Accredita
                                </button>
                            </div>
                            <div class="col-span-2">
                                <button class="btn btn-info w-full" onclick="settleAccountInline('${client.id}')">
                                    <i data-lucide="receipt"></i> Salda
                                </button>
                            </div>
                            <div class="col-span-2">
                                <button class="btn btn-secondary w-full" onclick="printAccountInline('${client.id}')">
                                    <i data-lucide="printer"></i> Stampa
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <h4 class="text-lg font-medium text-primary">Estratto Conto</h4>
                            <div class="text-right">
                                <div class="text-sm text-secondary">Saldo Attuale:</div>
                                <span class="font-bold text-lg ${app.getBalanceClass(client.balance)}">${app.formatCurrency(client.balance)}</span>
                            </div>
                        </div>
                        
                        ${transactions.length > 0 ? 
                            `<div class="table-container" style="max-height: 400px; overflow-y: auto;">
                                <table class="table editable-table">
                                    <thead>
                                        <tr>
                                            <th style="width: 20%;">Data</th>
                                            <th style="width: 50%;">Descrizione</th>
                                            <th style="width: 20%;">Importo</th>
                                            <th style="width: 10%;">Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${transactions.map(tx => `
                                            <tr data-transaction-id="${tx.id}">
                                                <td>
                                                    <span class="editable-cell" data-field="date" data-client-id="${client.id}" data-tx-id="${tx.id}">
                                                        ${app.formatDate(tx.date)}
                                                    </span>
                                                    <input type="text" class="form-control edit-input hidden" value="${app.formatToItalianDate(tx.date)}" style="font-size: 0.75rem; padding: 0.25rem;">
                                                </td>
                                                <td>
                                                    <span class="editable-cell" data-field="description" data-client-id="${client.id}" data-tx-id="${tx.id}">
                                                        ${tx.description}
                                                    </span>
                                                    <input type="text" class="form-control edit-input hidden" value="${tx.description}" style="font-size: 0.75rem; padding: 0.25rem;">
                                                </td>
                                                <td>
                                                    <span class="editable-cell font-bold ${tx.amount > 0 ? 'text-success' : 'text-danger'}" data-field="amount" data-client-id="${client.id}" data-tx-id="${tx.id}">
                                                        ${formatTransactionAmount.call(app, tx.amount)}
                                                    </span>
                                                    <input type="number" step="0.01" class="form-control edit-input hidden" value="${tx.amount}" style="font-size: 0.75rem; padding: 0.25rem;">
                                                </td>
                                                <td class="text-right">
                                                    <div class="flex items-center justify-end space-x-1">
                                                        <button class="btn btn-success btn-xs edit-btn" onclick="toggleEditTransaction('${client.id}', '${tx.id}')" title="Modifica">
                                                            <i data-lucide="edit"></i>
                                                        </button>
                                                        <button class="btn btn-success btn-xs save-btn hidden" onclick="saveEditTransaction('${client.id}', '${tx.id}')" title="Salva">
                                                            <i data-lucide="check"></i>
                                                        </button>
                                                        <button class="btn btn-danger btn-xs" onclick="deleteTransactionInline('${client.id}', '${tx.id}')" title="Elimina">
                                                            <i data-lucide="trash-2"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>` : 
                            '<div class="p-4 text-center text-secondary border border-primary rounded-lg">Nessuna transazione.</div>'
                        }
                    </div>
                </div>
            </td>
        </tr>
    `;
}
// Fine funzione getExpandedRowHTML

// Inizio funzione setupAmministrazioneFormEventListeners
function setupAmministrazioneFormEventListeners() {
    const app = getApp();
    const saveBtn = document.getElementById('save-client-btn');
    const cancelBtn = document.getElementById('cancel-client-btn');
    const cancelBtnBottom = document.getElementById('cancel-client-btn-bottom');
    const nameInput = document.getElementById('client-name-input');

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (amministrazioneState.editingClient) {
                updateClient.call(app);
            } else {
                addNewClient.call(app);
            }
        });
    }

    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            if (amministrazioneState.editingClient) {
                amministrazioneState.editClientName = e.target.value;
            } else {
                amministrazioneState.newClientName = e.target.value;
            }
        });
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveBtn.click();
            }
        });
    }

    const close = () => app.hideFormModal();
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    if (cancelBtnBottom) cancelBtnBottom.addEventListener('click', close);
}
// Fine funzione setupAmministrazioneFormEventListeners

// === SETUP EVENT LISTENERS ===
// Inizio funzione setupAmministrazioneEventListeners
function setupAmministrazioneEventListeners() {
    const app = this;
    
    // Ricerca
    const searchInput = document.getElementById('client-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            amministrazioneState.adminFilters.search = e.target.value;
            app.saveToStorage('adminFilters', amministrazioneState.adminFilters);
            renderClientsTable.call(app);
        });
    }
    
    // Event listener per il nuovo button group
    const filterButtons = document.querySelectorAll('[data-filter-type]');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter-type');
            setAdminFilter.call(app, filter);
        });
    });
    
    // Pulsanti navigazione
    const newClientBtn = document.getElementById('new-client-btn');
    if (newClientBtn) {
        newClientBtn.addEventListener('click', () => {
            showCreateClient.call(app);
        });
    }
    
    const printClientsBtn = document.getElementById('print-clients-btn');
    if (printClientsBtn) {
        printClientsBtn.addEventListener('click', () => {
            printClientsList.call(app);
        });
    }
    
    // Sorting tabella
    const sortButtons = document.querySelectorAll('[data-sort]');
    sortButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const column = btn.getAttribute('data-sort');
            sortAdmin.call(app, column);
        });
    });
}
// Fine funzione setupAmministrazioneEventListeners

// === FUNZIONI NAVIGAZIONE / GESTIONE MODALI ===
// Inizio funzione showCreateClient
function showCreateClient() {
    const app = this;
    amministrazioneState.editingClient = null;
    amministrazioneState.newClientName = '';
    
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getAmministrazioneFormHTML();
    
    modalContentEl.classList.add('modal-wide');
    
    setupAmministrazioneFormEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
    document.getElementById('client-name-input')?.focus();
}
// Fine funzione showCreateClient

// Inizio funzione showEditClient
function showEditClient(client) {
    const app = this;
    amministrazioneState.editingClient = client;
    amministrazioneState.editClientName = client.name;
    
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getAmministrazioneFormHTML();

    modalContentEl.classList.add('modal-wide');
    
    setupAmministrazioneFormEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
    document.getElementById('client-name-input')?.focus();
}
// Fine funzione showEditClient

// NUOVO: Inizio funzione toggleClientExpansion
function toggleClientExpansion(clientId) {
    const app = getApp();
    const client = app.state.data.clients.find(c => c.id === clientId);
    if (!client) return;
    
    if (amministrazioneState.expandedClientId === clientId) {
        // Chiudi l'espansione
        amministrazioneState.expandedClientId = null;
    } else {
        // Apri l'espansione
        amministrazioneState.expandedClientId = clientId;
        // Reset form
        amministrazioneState.transactionForm = { description: 'Carburante', amount: null };
    }
    
    renderClientsTable.call(app);
}
// Fine funzione toggleClientExpansion

// === FUNZIONI ORDINAMENTO E FILTRI ===

// Inizio funzione setAdminFilter
function setAdminFilter(filter) {
    amministrazioneState.adminFilters.filter = filter;
    this.saveToStorage('adminFilters', amministrazioneState.adminFilters);
    
    const buttons = document.querySelectorAll('[data-filter-type]');
    buttons.forEach(btn => {
        const btnFilter = btn.getAttribute('data-filter-type');
        if (btnFilter === filter) {
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary', 'active');
        } else {
            btn.classList.remove('btn-primary', 'active');
            btn.classList.add('btn-secondary');
        }
    });
    
    renderClientsTable.call(this);
}
// Fine funzione setAdminFilter

// Inizio funzione sortAdmin
function sortAdmin(column) {
    if (amministrazioneState.adminSort.column === column) {
        amministrazioneState.adminSort.direction = amministrazioneState.adminSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        amministrazioneState.adminSort.column = column;
        amministrazioneState.adminSort.direction = 'asc';
    }
    
    renderClientsTable.call(this);
}
// Fine funzione sortAdmin

// Inizio funzione sortedClients
function sortedClients() {
    if (!Array.isArray(this.state.data.clients)) return [];
    
    let clients = [...this.state.data.clients].map(c => ({
        ...c,
        lastTransactionDate: Array.isArray(c.transactions) && c.transactions.length > 0 ?
            new Date(c.transactions.reduce((latest, current) =>
                new Date(current.date) > new Date(latest.date) ? current : latest
            ).date) : null
    }));
    
    if (amministrazioneState.adminFilters.search.trim()) {
        const query = amministrazioneState.adminFilters.search.toLowerCase();
        clients = clients.filter(c => c.name && c.name.toLowerCase().includes(query));
    }
    
    switch (amministrazioneState.adminFilters.filter) {
        case 'credit':
            clients = clients.filter(c => (c.balance || 0) > 0);
            break;
        case 'debit':
            clients = clients.filter(c => (c.balance || 0) < 0);
            break;
    }
    
    return clients.sort((a, b) => {
        const dir = amministrazioneState.adminSort.direction === 'asc' ? 1 : -1;
        switch (amministrazioneState.adminSort.column) {
            case 'name':
                return (a.name || '').localeCompare(b.name || '', 'it-IT') * dir;
            case 'balance':
                return ((a.balance || 0) - (b.balance || 0)) * dir;
            case 'lastTransactionDate':
                if (!a.lastTransactionDate) return 1 * dir;
                if (!b.lastTransactionDate) return -1 * dir;
                return (a.lastTransactionDate - b.lastTransactionDate) * dir;
            default:
                return 0;
        }
    });
}
// Fine funzione sortedClients

// === FUNZIONI STATISTICHE ===
// Inizio funzione totalCredit
function totalCredit() {
    if (!Array.isArray(this.state.data.clients)) return 0;
    return this.state.data.clients.reduce((sum, client) => {
        return sum + Math.max(0, client.balance || 0);
    }, 0);
}
// Fine funzione totalCredit

// Inizio funzione totalDebit
function totalDebit() {
    if (!Array.isArray(this.state.data.clients)) return 0;
    return this.state.data.clients.reduce((sum, client) => {
        return sum + Math.abs(Math.min(0, client.balance || 0));
    }, 0);
}
// Fine funzione totalDebit

// === OPERAZIONI CLIENTI ===
// Inizio funzione addNewClient
function addNewClient() {
    if (amministrazioneState.newClientName.trim() === '') {
        this.showNotification('Il nome del cliente non può essere vuoto.');
        return;
    }
    
    const newClient = {
        id: this.generateUniqueId('client'),
        name: amministrazioneState.newClientName.trim(),
        balance: 0,
        transactions: []
    };
    
    this.state.data.clients.push(newClient);
    this.saveToStorage('data', this.state.data);
    this.showNotification('Cliente aggiunto con successo!');
    this.hideFormModal();
    renderAmministrazioneSection.call(this, document.getElementById('section-amministrazione'));
}
// Fine funzione addNewClient

// Inizio funzione updateClient
function updateClient() {
    if (amministrazioneState.editClientName.trim() === '') {
        this.showNotification('Il nome del cliente non può essere vuoto.');
        return;
    }
    
    this.state.data.clients = this.state.data.clients.map(client => {
        if (client.id === amministrazioneState.editingClient.id) {
            return { ...client, name: amministrazioneState.editClientName.trim() };
        }
        return client;
    });
    
    this.saveToStorage('data', this.state.data);
    this.showNotification('Cliente aggiornato con successo!');
    this.hideFormModal();
    renderAmministrazioneSection.call(this, document.getElementById('section-amministrazione'));
}
// Fine funzione updateClient

// Inizio funzione deleteClient
function deleteClient(clientId) {
    const client = this.state.data.clients.find(c => c.id === clientId);
    if (!client) return;
    
    this.showConfirm(`Sei sicuro di voler eliminare il cliente "${client.name}"? Verranno eliminate anche tutte le sue transazioni.`, () => {
        // Chiudi espansione se era aperta per questo cliente
        if (amministrazioneState.expandedClientId === clientId) {
            amministrazioneState.expandedClientId = null;
        }
        
        this.state.data.clients = this.state.data.clients.filter(c => c.id !== clientId);
        this.saveToStorage('data', this.state.data);
        this.showNotification('Cliente eliminato.');
        
        renderAmministrazioneSection.call(this, document.getElementById('section-amministrazione'));
    });
}
// Fine funzione deleteClient

// === GESTIONE TRANSAZIONI INLINE ===
// NUOVO: Inizio funzione addTransactionInline
function addTransactionInline(clientId, type) {
    const app = getApp();
    const container = document.getElementById('section-amministrazione');
    const descInput = document.getElementById(`transaction-description-${clientId}`);
    const amountInput = document.getElementById(`transaction-amount-${clientId}`);
    
    const description = descInput?.value || 'Carburante';
    const amount = parseFloat(amountInput?.value);
    
    if (isNaN(amount) || amount <= 0) {
        app.showNotification('Inserire un importo valido.');
        return;
    }
    
    const finalAmount = type === 'credit' ? amount : -amount;
    const newTransaction = {
        id: app.generateUniqueId('tx'),
        date: new Date().toISOString(),
        description: description,
        amount: finalAmount
    };
    
    app.state.data.clients = app.state.data.clients.map(client => {
        if (client.id === clientId) {
            return {
                ...client,
                balance: client.balance + finalAmount,
                transactions: [...client.transactions, newTransaction]
            };
        }
        return client;
    });
    
    app.saveToStorage('data', app.state.data);
    
    // Reset form for next transaction
    amministrazioneState.transactionForm = { description: 'Carburante', amount: null };
    
    renderAmministrazioneSection.call(app, container);
}
// Fine funzione addTransactionInline

// NUOVO: Inizio funzione settleAccountInline
function settleAccountInline(clientId) {
    const app = getApp();
    const container = document.getElementById('section-amministrazione');
    const client = app.state.data.clients.find(c => c.id === clientId);
    if (!client || client.balance === 0) return;
    
    const balanceToSettle = client.balance;
    const newTransaction = {
        id: app.generateUniqueId('tx'),
        date: new Date().toISOString(),
        description: 'Saldo Conto',
        amount: -balanceToSettle
    };
    
    app.state.data.clients = app.state.data.clients.map(c => {
        if (c.id === clientId) {
            return {
                ...c,
                balance: 0,
                transactions: [...c.transactions, newTransaction]
            };
        }
        return c;
    });
    
    app.saveToStorage('data', app.state.data);
    renderAmministrazioneSection.call(app, container);
}
// Fine funzione settleAccountInline

// NUOVO: Inizio funzione deleteTransactionInline
function deleteTransactionInline(clientId, transactionId) {
    const app = getApp();
    const container = document.getElementById('section-amministrazione');
    
    app.state.data.clients = app.state.data.clients.map(client => {
        if (client.id === clientId) {
            const txIndex = client.transactions.findIndex(tx => tx.id === transactionId);
            if (txIndex === -1) return client;

            const amountToRevert = client.transactions[txIndex].amount;
            return {
                ...client,
                balance: client.balance - amountToRevert,
                transactions: client.transactions.filter(tx => tx.id !== transactionId)
            };
        }
        return client;
    });

    app.saveToStorage('data', app.state.data);
    renderAmministrazioneSection.call(app, container);
}
// Fine funzione deleteTransactionInline

// NUOVO: Inizio funzione printAccountInline - VERSIONE CORRETTA
function printAccountInline(clientId) {
    const app = getApp();
    const client = app.state.data.clients.find(c => c.id === clientId);
    if (!client) return;
    
    const transactions = client.transactions ? [...client.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
    
    document.getElementById('print-client-name').textContent = `Estratto Conto - ${client.name}`;
    
    if (transactions.length > 0) {
        const dateRange = `dal: ${app.formatDate(transactions[transactions.length - 1].date)} al: ${app.formatDate(transactions[0].date)}`;
        document.getElementById('print-date-range').textContent = `Periodo ${dateRange}`;
    }
    
    const transactionsTableBody = document.getElementById('print-transactions');
    
    // Organizza le transazioni in coppie per la stampa a 4 colonne: Descrizione, importo, Descrizione, importo
    const pairs = [];
    for (let i = 0; i < transactions.length; i += 2) {
        pairs.push({
            tx1: transactions[i],
            tx2: transactions[i + 1] || null
        });
    }
    
    // Genera le righe della tabella con il formato a 4 colonne
    transactionsTableBody.innerHTML = pairs.map(pair => {
        const tx1Amount = pair.tx1 ? formatTransactionAmount.call(app, pair.tx1.amount) : '';
        const tx2Amount = pair.tx2 ? formatTransactionAmount.call(app, pair.tx2.amount) : '';
        
        return `
            <tr>
                <td>${pair.tx1 ? pair.tx1.description : ''}</td>
                <td class="${pair.tx1 ? (pair.tx1.amount > 0 ? 'text-success' : 'text-danger') : ''}">${tx1Amount}</td>
                <td>${pair.tx2 ? pair.tx2.description : ''}</td>
                <td class="${pair.tx2 ? (pair.tx2.amount > 0 ? 'text-success' : 'text-danger') : ''}">${tx2Amount}</td>
            </tr>
        `;
    }).join('');
    
    document.getElementById('print-final-balance').textContent = app.formatCurrency(client.balance);
    
    // CORREZIONE: Usa le classi hidden invece di style.display
    document.getElementById('print-content').classList.remove('hidden');
    document.getElementById('print-clients-content').classList.add('hidden');
    document.getElementById('virtual-print-content').classList.add('hidden');
    
    setTimeout(() => {
        window.print();
        setTimeout(() => {
            // CORREZIONE: Ripristina lo stato hidden
            document.getElementById('print-content').classList.add('hidden');
        }, 100);
    }, 100);
}
// Fine funzione printAccountInline

// NUOVO: Inizio funzione toggleEditTransaction
function toggleEditTransaction(clientId, transactionId) {
    const app = getApp();
    const row = document.querySelector(`tr[data-transaction-id="${transactionId}"]`);
    if (!row) return;
    
    const editableCells = row.querySelectorAll('.editable-cell');
    const editInputs = row.querySelectorAll('.edit-input');
    const editBtn = row.querySelector('.edit-btn');
    const saveBtn = row.querySelector('.save-btn');
    
    const isEditing = editBtn.classList.contains('hidden');
    
    if (isEditing) {
        // Annulla editing
        editableCells.forEach(cell => cell.classList.remove('hidden'));
        editInputs.forEach(input => input.classList.add('hidden'));
        editBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
    } else {
        // Attiva editing
        editableCells.forEach(cell => cell.classList.add('hidden'));
        editInputs.forEach(input => input.classList.remove('hidden'));
        editBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        
        // Focus sul primo input
        const firstInput = editInputs[0];
        if (firstInput) firstInput.focus();
    }
    
    app.refreshIcons();
}
// Fine funzione toggleEditTransaction

// NUOVO: Inizio funzione saveEditTransaction
function saveEditTransaction(clientId, transactionId) {
    const app = getApp();
    const container = document.getElementById('section-amministrazione');
    const row = document.querySelector(`tr[data-transaction-id="${transactionId}"]`);
    if (!row) return;
    
    const editInputs = row.querySelectorAll('.edit-input');
    const [dateInput, descInput, amountInput] = editInputs;
    
    // Valida i dati
    const newDate = dateInput.value.trim();
    const newDescription = descInput.value.trim();
    const newAmount = parseFloat(amountInput.value);
    
    if (!newDate || !newDescription || isNaN(newAmount)) {
        app.showNotification('Tutti i campi sono obbligatori e l\'importo deve essere valido.');
        return;
    }
    
    if (!app.validateItalianDate(newDate)) {
        app.showNotification('Formato data non valido. Usa gg.mm.aaaa');
        return;
    }
    
    // Trova la transazione e il cliente
    const client = app.state.data.clients.find(c => c.id === clientId);
    if (!client) return;
    
    const transaction = client.transactions.find(tx => tx.id === transactionId);
    if (!transaction) return;
    
    // Calcola la differenza per aggiornare il saldo
    const oldAmount = transaction.amount;
    const amountDifference = newAmount - oldAmount;
    
    // Aggiorna la transazione
    const parsedDate = app.parseItalianDate(newDate);
    transaction.date = parsedDate.toISOString();
    transaction.description = newDescription;
    transaction.amount = newAmount;
    
    // Aggiorna il saldo del cliente
    app.state.data.clients = app.state.data.clients.map(c => {
        if (c.id === clientId) {
            return {
                ...c,
                balance: c.balance + amountDifference,
                transactions: c.transactions.map(tx => 
                    tx.id === transactionId ? transaction : tx
                )
            };
        }
        return c;
    });
    
    app.saveToStorage('data', app.state.data);
    app.showNotification('Transazione aggiornata con successo!');
    
    renderAmministrazioneSection.call(app, container);
}
// Fine funzione saveEditTransaction

// Inizio funzione formatTransactionAmount
function formatTransactionAmount(amount) {
    return amount > 0 ? '+' + this.formatCurrency(amount) : this.formatCurrency(amount);
}
// Fine funzione formatTransactionAmount

// === RENDER TABELLA CLIENTI ===
// Inizio funzione renderClientsTable
function renderClientsTable() {
    const tbody = document.getElementById('clients-tbody');
    if (!tbody) return;
    
    const app = this;
    const clients = sortedClients.call(app);
    
    if (clients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-12">
                    <div class="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <div class="empty-state-title">Nessun cliente trovato</div>
                        <div class="empty-state-description">Aggiungi un nuovo cliente per iniziare.</div>
                    </div>
                </td>
            </tr>
        `;
    } else {
        let tableHTML = '';
        
        clients.forEach(client => {
            const isExpanded = amministrazioneState.expandedClientId === client.id;
            
            // Riga principale del cliente
            tableHTML += `
                <tr class="hover:bg-secondary ${isExpanded ? 'expanded-client' : ''}">
                    <td class="font-medium text-primary">${client.name}</td>
                    <td>
                        <span class="font-bold ${app.getBalanceClass(client.balance)}">${app.formatCurrency(client.balance)}</span>
                    </td>
                    <td class="text-primary">${client.transactions.length}</td>
                    <td class="text-primary">${app.formatDate(client.lastTransactionDate)}</td>
                    <td class="text-right">
                        <div class="flex items-center justify-end space-x-2">
                            <button class="btn btn-info ${isExpanded ? 'btn-primary' : ''}" onclick="toggleClientExpansionById('${client.id}')" title="${isExpanded ? 'Chiudi conto' : 'Apri conto'}">
                                <i data-lucide="${isExpanded ? 'chevron-up' : 'eye'}"></i>
                            </button>
                            <button class="btn btn-success" onclick="showEditClientById('${client.id}')" title="Modifica cliente">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="btn btn-danger" onclick="deleteClientById('${client.id}')" title="Elimina cliente">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            
            // Riga espansa se attiva
            if (isExpanded) {
                tableHTML += getExpandedRowHTML(client);
            }
        });
        
        tbody.innerHTML = tableHTML;
    }
    
    // Refresh icone
    this.refreshIcons();
}
// Fine funzione renderClientsTable

// === FUNZIONI STAMPA - VERSIONI CORRETTE ===
// Inizio funzione printClientsList
function printClientsList() {
    const app = this;
    const clients = sortedClients.call(app);
    
    document.getElementById('print-clients-date').textContent = `Dati aggiornati al: ${app.formatDate(new Date().toISOString())}`;
    
    const clientsTableBody = document.getElementById('print-clients-list');
    const pairs = [];
    for (let i = 0; i < clients.length; i += 2) {
        pairs.push({
            client1: clients[i],
            client2: clients[i + 1] || null
        });
    }
    
    clientsTableBody.innerHTML = pairs.map(pair => `
        <tr>
            <td>${pair.client1.name}</td>
            <td class="${app.getBalanceClass(pair.client1.balance)}">${app.formatCurrency(pair.client1.balance)}</td>
            <td>${pair.client2 ? pair.client2.name : ''}</td>
            <td class="${pair.client2 ? app.getBalanceClass(pair.client2.balance) : ''}">${pair.client2 ? app.formatCurrency(pair.client2.balance) : ''}</td>
        </tr>
    `).join('');
    
    // CORREZIONE: Usa le classi hidden invece di style.display
    document.getElementById('print-clients-content').classList.remove('hidden');
    document.getElementById('print-content').classList.add('hidden');
    document.getElementById('virtual-print-content').classList.add('hidden');
    
    setTimeout(() => {
        window.print();
        setTimeout(() => {
            // CORREZIONE: Ripristina lo stato hidden
            document.getElementById('print-clients-content').classList.add('hidden');
        }, 100);
    }, 100);
}
// Fine funzione printClientsList

// Inizio funzione showSkeletonLoader
function showSkeletonLoader(container) {
    const skeletonHTML = `
        <div class="space-y-6">
            <div class="stats-grid">
                <div class="stat-card" style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="flex: 1;">
                        <div class="skeleton-loader" style="height: 1rem; width: 60%; margin-bottom: 0.75rem;"></div>
                        <div class="skeleton-loader" style="height: 2rem; width: 40%;"></div>
                    </div>
                    <div class="skeleton-loader" style="width: 4rem; height: 4rem; border-radius: 50%;"></div>
                </div>
                <div class="stat-card" style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="flex: 1;">
                        <div class="skeleton-loader" style="height: 1rem; width: 60%; margin-bottom: 0.75rem;"></div>
                        <div class="skeleton-loader" style="height: 2rem; width: 40%;"></div>
                    </div>
                    <div class="skeleton-loader" style="width: 4rem; height: 4rem; border-radius: 50%;"></div>
                </div>
                <div class="stat-card" style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="flex: 1;">
                        <div class="skeleton-loader" style="height: 1rem; width: 60%; margin-bottom: 0.75rem;"></div>
                        <div class="skeleton-loader" style="height: 2rem; width: 40%;"></div>
                    </div>
                    <div class="skeleton-loader" style="width: 4rem; height: 4rem; border-radius: 50%;"></div>
                </div>
            </div>

            <div class="filters-bar" style="justify-content: space-between;">
                 <div class="skeleton-loader" style="height: 2.5rem; width: 250px;"></div>
                 <div class="skeleton-loader" style="height: 2.5rem; width: 400px;"></div>
                 <div class="skeleton-loader" style="height: 2.5rem; width: 300px;"></div>
            </div>

            <div class="card">
                 <div class="card-header"><div class="skeleton-loader" style="height: 1.5rem; width: 200px;"></div></div>
                 <div class="p-6 space-y-2">
                    <div class="skeleton-loader" style="height: 2.5rem; width: 100%;"></div>
                    <div class="skeleton-loader" style="height: 2.5rem; width: 100%;"></div>
                    <div class="skeleton-loader" style="height: 2.5rem; width: 100%;"></div>
                    <div class="skeleton-loader" style="height: 2.5rem; width: 100%;"></div>
                    <div class="skeleton-loader" style="height: 2.5rem; width: 100%;"></div>
                 </div>
            </div>
        </div>
    `;
    container.innerHTML = skeletonHTML;
}
// Fine funzione showSkeletonLoader

// === FUNZIONI GLOBALI PER EVENTI ===
function toggleClientExpansionById(clientId) {
    const app = getApp();
    toggleClientExpansion.call(app, clientId);
}

function showEditClientById(clientId) {
    const app = getApp();
    const client = app.state.data.clients.find(c => c.id === clientId);
    if (client) {
        showEditClient.call(app, client);
    }
}

function deleteClientById(clientId) {
    const app = getApp();
    deleteClient.call(app, clientId);
}

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initAmministrazione = initAmministrazione;
    window.renderAmministrazioneSection = renderAmministrazioneSection;
    window.toggleClientExpansionById = toggleClientExpansionById;
    window.showEditClientById = showEditClientById;
    window.deleteClientById = deleteClientById;
    window.addTransactionInline = addTransactionInline;
    window.settleAccountInline = settleAccountInline;
    window.deleteTransactionInline = deleteTransactionInline;
    window.printAccountInline = printAccountInline;
    window.toggleEditTransaction = toggleEditTransaction;
    window.saveEditTransaction = saveEditTransaction;
    window.amministrazioneState = amministrazioneState;
}
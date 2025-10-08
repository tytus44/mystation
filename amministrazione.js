// =============================================
// FILE: amministrazione.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Amministrazione (clienti, conti).
// --- MODIFICATO PER USARE MODALE UNICO PER GESTIONE CLIENTE ---
// =============================================

// === STATO LOCALE DEL MODULO AMMINISTRAZIONE ===
// Inizio funzione amministrazioneState
let amministrazioneState = {
    // View mode e filtri (persistenti)
    amministrazioneViewMode: null, // Ora sempre 'list'
    adminFilters: null,            // Caricato dal localStorage
    
    // Stato locale
    adminSort: { column: 'name', direction: 'asc' },
    newClientName: '',
    
    transactionForm: { description: 'Carburante', amount: null }
};
// Fine funzione amministrazioneState

// === INIZIALIZZAZIONE MODULO AMMINISTRAZIONE ===
// Inizio funzione initAmministrazione
function initAmministrazione() {
    console.log('🛡️ Inizializzazione modulo Amministrazione...');
    
    // Carica stato persistente - SEMPRE 'list' ora
    amministrazioneState.amministrazioneViewMode = 'list';
    amministrazioneState.adminFilters = this.loadFromStorage('adminFilters', { search: '' });
    
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
                <div class="stat-card" style="background-color: #3b82f6; border-color: #2563eb;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: #ffffff;">Clienti Attivi</div>
                        <div class="stat-value" style="color: #ffffff;">${app.state.data.clients.length}</div>
                    </div>
                    <div class="stat-icon blue">
                        <i data-lucide="users"></i>
                    </div>
                    </div>
                <div class="stat-card" style="background-color: #10b981; border-color: #059669;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: #ffffff;">Totale Credito</div>
                        <div class="stat-value" style="color: #ffffff;">${app.formatCurrency(totalCredit.call(app))}</div>
                    </div>
                    <div class="stat-icon green">
                        <i data-lucide="trending-up"></i>
                    </div>
                    </div>
                <div class="stat-card" style="background-color: #FF204E; border-color: #DC1C44;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: #ffffff;">Totale Debito</div>
                        <div class="stat-value" style="color: #ffffff;">${app.formatCurrency(totalDebit.call(app))}</div>
                    </div>
                    <div class="stat-icon red">
                        <i data-lucide="trending-down"></i>
                    </div>
                    </div>
            </div>

            <div class="filters-bar">
                <div class="filter-group">

                    <div class="input-group">
                        <i data-lucide="search" class="input-group-icon"></i>
                        <input type="text" id="admin-search-input" class="form-control" placeholder="Nome cliente..." value="${amministrazioneState.adminFilters.search}" autocomplete="off" style="padding-right: 2.5rem;">
                        <button id="admin-clear-search-btn" class="${!amministrazioneState.adminFilters.search ? 'hidden' : ''}" style="position: absolute; right: 0; top: 0; height: 100%; padding: 0 0.75rem; background: none; border: none; cursor: pointer; color: var(--text-tertiary);">
                            <i data-lucide="x" style="width: 1rem; height: 1rem;"></i>
                        </button>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button id="new-client-btn" class="btn btn-primary">
                        <i data-lucide="user-plus" class="w-4 h-4 mr-2"></i> Nuovo Cliente
                    </button>
                    <button id="print-clients-btn" class="btn btn-secondary">
                        <i data-lucide="printer" class="w-4 h-4 mr-2"></i> Stampa Lista
                    </button>
                </div>
                </div>

            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>
                                <button data-sort="name">
                                    Nome <i data-lucide="${amministrazioneState.adminSort.column === 'name' ? (amministrazioneState.adminSort.direction === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down'}"></i>
                                </button>
                            </th>
                            <th>
                                <button data-sort="balance">
                                    Saldo <i data-lucide="${amministrazioneState.adminSort.column === 'balance' ? (amministrazioneState.adminSort.direction === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down'}"></i>
                                </button>
                            </th>
                            <th style="min-width: 150px;">
                                <button data-sort="lastTransactionDate">
                                    Ultima Operazione <i data-lucide="${amministrazioneState.adminSort.column === 'lastTransactionDate' ? (amministrazioneState.adminSort.direction === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down'}"></i>
                                </button>
                            </th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    <tbody id="clients-tbody"></tbody>
                </table>
            </div>
        </div>
    `;
    
    renderClientsTable.call(app);
    app.refreshIcons();
}
// Fine funzione renderAmministrazioneListView

// Inizio funzione getAmministrazioneFormHTML
function getAmministrazioneFormHTML() {
    const title = 'Nuovo Cliente';
    const clientName = amministrazioneState.newClientName;

    return `
        <div class="card-header">
            <h2 class="card-title">${title}</h2>
        </div>
        <div class="card-body">
            <div class="form-group">
                <label class="form-label">Nome Cliente</label>
                <input type="text" id="client-name-input" class="form-control" 
                       placeholder="es. Mario Rossi" value="${clientName}" style="max-width: 100%;" autocomplete="off">
            </div>
            <div class="flex items-center justify-end space-x-4 mt-6">
                <button id="cancel-client-btn-bottom" class="btn btn-secondary">Annulla</button>
                <button id="save-client-btn" class="btn btn-success">Salva Cliente</button>
            </div>
        </div>
    `;
}
// Fine funzione getAmministrazioneFormHTML

// Inizio funzione getClientModalHTML
function getClientModalHTML(client) {
    const app = getApp();
    const transactions = client.transactions ? [...client.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
    
    return `
        
        <div class="modal-header">
            <h2 class="card-title">${client.name}</h2>
        </div>

        <div class="modal-body">
            <div class="expanded-content-frame" style="padding: 1.5rem; border: none;">
                
                <div class="space-y-4 mb-6">
                    <h4 class="text-lg font-medium text-primary">Nuova Transazione</h4>
                    <div class="flex items-center gap-4 w-full expanded-row">
                        <input type="text" id="transaction-description-${client.id}" class="form-control" 
                               placeholder="Descrizione (es. Carburante)" value="${amministrazioneState.transactionForm.description}" autocomplete="off">
                        
                        <div class="flex items-center gap-4">
                            <input type="number" id="transaction-amount-${client.id}" step="0.01" class="form-control" 
                                   placeholder="€" value="${amministrazioneState.transactionForm.amount || ''}" autocomplete="off" style="width: 120px;">
                            
                            <div class="flex items-center space-x-2">
                                <button class="btn btn-danger" onclick="addTransactionInline('${client.id}', 'debit')" title="Addebita">
                                    <i data-lucide="circle-minus" style="margin-right: 0;"></i>
                                </button>
                                <button class="btn btn-warning" onclick="addTransactionInline('${client.id}', 'credit')" title="Acconto">
                                    <i data-lucide="circle-plus" style="margin-right: 0;"></i>
                                </button>
                                <button class="btn btn-success" onclick="settleAccountInline('${client.id}')" title="Salda Conto">
                                    <i data-lucide="euro" style="margin-right: 0;"></i>
                                </button>
                                <button class="btn btn-secondary" onclick="printAccountInline('${client.id}')" title="Stampa">
                                    <i data-lucide="printer" style="margin-right: 0;"></i>
                                </button>
                            </div>
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
                        `<div class="table-container" style="max-height: 220px; overflow-y: auto;">
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
                                                <input type="text" class="form-control edit-input hidden" value="${app.formatToItalianDate(tx.date)}" style="font-size: 0.75rem; padding: 0.25rem;" autocomplete="off">
                                            </td>
                                            <td>
                                                <span class="editable-cell" data-field="description" data-client-id="${client.id}" data-tx-id="${tx.id}">
                                                    ${tx.description}
                                                </span>
                                                <input type="text" class="form-control edit-input hidden" value="${tx.description}" style="font-size: 0.75rem; padding: 0.25rem;" autocomplete="off">
                                            </td>
                                            <td>
                                                <span class="editable-cell font-bold ${tx.amount > 0 ? 'text-success' : 'text-danger'}" data-field="amount" data-client-id="${client.id}" data-tx-id="${tx.id}">
                                                    ${formatTransactionAmount.call(app, tx.amount)}
                                                </span>
                                                <input type="number" step="0.01" class="form-control edit-input hidden" value="${tx.amount}" style="font-size: 0.75rem; padding: 0.25rem;" autocomplete="off">
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
            <div class="modal-actions">
                 <button class="btn btn-secondary" onclick="getApp().hideFormModal()">Chiudi</button>
            </div>
        </div>
    `;
}
// Fine funzione getClientModalHTML

// Inizio funzione setupAmministrazioneFormEventListeners
function setupAmministrazioneFormEventListeners() {
    const app = getApp();
    const saveBtn = document.getElementById('save-client-btn');
    const cancelBtnBottom = document.getElementById('cancel-client-btn-bottom');
    const nameInput = document.getElementById('client-name-input');

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            addNewClient.call(app);
        });
    }

    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            amministrazioneState.newClientName = e.target.value;
        });
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveBtn.click();
            }
        });
    }

    const close = () => app.hideFormModal();
    if (cancelBtnBottom) cancelBtnBottom.addEventListener('click', close);
}
// Fine funzione setupAmministrazioneFormEventListeners

// === SETUP EVENT LISTENERS ===
// Inizio funzione setupAmministrazioneEventListeners
function setupAmministrazioneEventListeners() {
    const app = this;
    
    // Ricerca
    const searchInput = document.getElementById('admin-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            amministrazioneState.adminFilters.search = e.target.value;
            app.saveToStorage('adminFilters', amministrazioneState.adminFilters);
            
            renderClientsTable.call(app);
            const clearBtn = document.getElementById('admin-clear-search-btn');
            if (clearBtn) {
                clearBtn.classList.toggle('hidden', !e.target.value);
            }
        });
    }
    
    // Pulsante di cancellazione della ricerca
    const clearSearchBtn = document.getElementById('admin-clear-search-btn');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            amministrazioneState.adminFilters.search = '';
            app.saveToStorage('adminFilters', amministrazioneState.adminFilters);
            
            if (searchInput) searchInput.value = '';
            clearSearchBtn.classList.add('hidden');
            renderClientsTable.call(app);
            searchInput?.focus();
        });
    }

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
    amministrazioneState.newClientName = '';
    
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getAmministrazioneFormHTML();
    
    setupAmministrazioneFormEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
    document.getElementById('client-name-input')?.focus();
}
// Fine funzione showCreateClient

// Inizio funzione showClientModal
function showClientModal(clientId) {
    const app = this;
    const client = app.state.data.clients.find(c => c.id === clientId);
    if (!client) return;

    // Reset del form transazione prima di aprire il modale
    amministrazioneState.transactionForm = { description: 'Carburante', amount: null };

    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getClientModalHTML(client);
    
    modalContentEl.classList.add('modal-wide');
    
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showClientModal

// === FUNZIONI ORDINAMENTO E FILTRI ===

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

// Inizio funzione deleteClient
function deleteClient(clientId) {
    const client = this.state.data.clients.find(c => c.id === clientId);
    if (!client) return;
    
    this.showConfirm(`Sei sicuro di voler eliminare il cliente "${client.name}"? Verranno eliminate anche tutte le sue transazioni.`, () => {
        this.state.data.clients = this.state.data.clients.filter(c => c.id !== clientId);
        this.saveToStorage('data', this.state.data);
        this.showNotification('Cliente eliminato.');
        
        renderAmministrazioneSection.call(this, document.getElementById('section-amministrazione'));
    });
}
// Fine funzione deleteClient

// === GESTIONE TRANSAZIONI INLINE (ORA NEL MODALE) ===
// Inizio funzione addTransactionInline
function addTransactionInline(clientId, type) {
    const app = getApp();
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
    
    amministrazioneState.transactionForm = { description: 'Carburante', amount: null };
    showClientModal.call(app, clientId); 
    renderClientsTable.call(app);
}
// Fine funzione addTransactionInline

// Inizio funzione settleAccountInline
function settleAccountInline(clientId) {
    const app = getApp();
    const client = app.state.data.clients.find(c => c.id === clientId);
    if (!client || client.balance === 0) return;

    app.showConfirm(
        `Sei sicuro di voler saldare il conto di "${client.name}"? Tutte le transazioni verranno eliminate definitivamente e il saldo sarà azzerato.`,
        () => {
            app.state.data.clients = app.state.data.clients.map(c => {
                if (c.id === clientId) {
                    return { ...c, balance: 0, transactions: [] };
                }
                return c;
            });

            app.saveToStorage('data', app.state.data);
            showClientModal.call(app, clientId);
            renderClientsTable.call(app);
            app.showNotification(`Conto di ${client.name} saldato con successo.`);
        }
    );
}
// Fine funzione settleAccountInline

// Inizio funzione deleteTransactionInline
function deleteTransactionInline(clientId, transactionId) {
    const app = getApp();
    
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
    showClientModal.call(app, clientId);
    renderClientsTable.call(app);
}
// Fine funzione deleteTransactionInline

// Inizio funzione printAccountInline
function printAccountInline(clientId) {
    const app = getApp();
    const client = app.state.data.clients.find(c => c.id === clientId);
    if (!client) return;

    const transactions = client.transactions ? [...client.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];

    document.getElementById('print-client-name').textContent = `Estratto Conto - ${client.name}`;

    if (transactions.length > 0) {
        const dateRange = `dal: ${app.formatDate(transactions[transactions.length - 1].date)} al: ${app.formatDate(transactions[0].date)}`;
        document.getElementById('print-date-range').textContent = `Periodo ${dateRange}`;
    } else {
        document.getElementById('print-date-range').textContent = `-`;
    }

    const transactionsTableBody = document.getElementById('print-transactions');
    const pairs = [];
    for (let i = 0; i < transactions.length; i += 2) {
        pairs.push({ tx1: transactions[i], tx2: transactions[i + 1] || null });
    }

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

    document.getElementById('print-content').classList.remove('hidden');
    document.getElementById('print-clients-content').classList.add('hidden');
    document.getElementById('virtual-print-content').classList.add('hidden');

    const originalTitle = document.title;
    const today = app.formatToItalianDate(new Date());
    const clientNameForFile = client.name.replace(/\s+/g, '_');
    document.title = `${clientNameForFile}_${today}`;

    setTimeout(() => {
        window.print();
        setTimeout(() => {
            document.getElementById('print-content').classList.add('hidden');
            document.title = originalTitle;
        }, 100);
    }, 100);
}
// Fine funzione printAccountInline

// Inizio funzione toggleEditTransaction
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
        editableCells.forEach(cell => cell.classList.remove('hidden'));
        editInputs.forEach(input => input.classList.add('hidden'));
        editBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
    } else {
        editableCells.forEach(cell => cell.classList.add('hidden'));
        editInputs.forEach(input => input.classList.remove('hidden'));
        editBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        const firstInput = editInputs[0];
        if (firstInput) firstInput.focus();
    }
    app.refreshIcons();
}
// Fine funzione toggleEditTransaction

// Inizio funzione saveEditTransaction
function saveEditTransaction(clientId, transactionId) {
    const app = getApp();
    const row = document.querySelector(`tr[data-transaction-id="${transactionId}"]`);
    if (!row) return;
    
    const editInputs = row.querySelectorAll('.edit-input');
    const [dateInput, descInput, amountInput] = editInputs;
    
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
    
    const client = app.state.data.clients.find(c => c.id === clientId);
    if (!client) return;
    const transaction = client.transactions.find(tx => tx.id === transactionId);
    if (!transaction) return;
    
    const oldAmount = transaction.amount;
    const amountDifference = newAmount - oldAmount;
    
    const parsedDate = app.parseItalianDate(newDate);
    transaction.date = parsedDate.toISOString();
    transaction.description = newDescription;
    transaction.amount = newAmount;
    
    app.state.data.clients = app.state.data.clients.map(c => {
        if (c.id === clientId) {
            return {
                ...c,
                balance: c.balance + amountDifference,
                transactions: c.transactions.map(tx => tx.id === transactionId ? transaction : tx)
            };
        }
        return c;
    });
    
    app.saveToStorage('data', app.state.data);
    app.showNotification('Transazione aggiornata con successo!');
    
    showClientModal.call(app, clientId);
    renderClientsTable.call(app);
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
                <td colspan="4" class="text-center py-12">
                    <div class="empty-state">
                        <i data-lucide="users"></i>
                        <div class="empty-state-title">Nessun cliente trovato</div>
                        <div class="empty-state-description">Aggiungi un nuovo cliente o modifica i filtri di ricerca.</div>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = clients.map(client => `
            <tr class="hover:bg-secondary">
                <td class="font-medium text-primary">${client.name}</td>
                <td class="font-bold ${app.getBalanceClass(client.balance)}">${app.formatCurrency(client.balance)}</td>
                <td class="text-primary">${app.formatDate(client.lastTransactionDate)}</td>
                <td class="text-right">
                    <div class="flex items-center justify-end space-x-2">
                        <button class="btn btn-info" onclick="showClientModalById('${client.id}')" title="Gestisci Cliente">
                            <i data-lucide="user-cog"></i>
                        </button>
                        <button class="btn btn-danger" onclick="deleteClientById('${client.id}')" title="Elimina cliente">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    this.refreshIcons();
}
// Fine funzione renderClientsTable

// === FUNZIONI STAMPA - VERSIONI CORRETTE ===
// Inizio funzione printClientsList
function printClientsList() {
    const app = this;
    // INIZIO MODIFICA: Ordinamento alfabetico e impostazione titolo/data come da richiesta
    const clients = [...app.state.data.clients].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'it-IT'));

    const printHeader = document.querySelector('#print-clients-content h1');
    if (printHeader) {
        printHeader.textContent = 'Lista Contabile Clienti';
    }
    
    document.getElementById('print-clients-date').textContent = `Dati aggiornati al: ${app.formatDate(new Date())}`;
    // FINE MODIFICA
    
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
    
    document.getElementById('print-clients-content').classList.remove('hidden');
    document.getElementById('print-content').classList.add('hidden');
    document.getElementById('virtual-print-content').classList.add('hidden');
    
    setTimeout(() => {
        window.print();
        setTimeout(() => {
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
function showClientModalById(clientId) {
    const app = getApp();
    showClientModal.call(app, clientId);
}

function deleteClientById(clientId) {
    const app = getApp();
    deleteClient.call(app, clientId);
}

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initAmministrazione = initAmministrazione;
    window.renderAmministrazioneSection = renderAmministrazioneSection;
    window.showClientModalById = showClientModalById;
    window.deleteClientById = deleteClientById;
    window.addTransactionInline = addTransactionInline;
    window.settleAccountInline = settleAccountInline;
    window.deleteTransactionInline = deleteTransactionInline;
    window.printAccountInline = printAccountInline;
    window.toggleEditTransaction = toggleEditTransaction;
    window.saveEditTransaction = saveEditTransaction;
    window.amministrazioneState = amministrazioneState;
}
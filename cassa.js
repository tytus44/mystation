// =============================================
// FILE: cassa.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Cassa (entrate, uscite, fondo cassa).
// --- MODIFICATO PER USARE FORM INLINE FISSO E UI MIGLIORATA ---
// =============================================

// === STATO LOCALE DEL MODULO CASSA ===
// Inizio funzione cassaState
let cassaState = {
    cassaSort: { column: 'date', direction: 'desc' },
    cassaChartInstance: null,
    operazioneForm: {
        date: '',
        type: 'entrata',
        category: 'accredito_cliente',
        description: '',
        amount: null,
        clientId: null
    }
};
// Fine funzione cassaState

// === INIZIALIZZAZIONE MODULO CASSA ===
// Inizio funzione initCassa
function initCassa() {
    console.log('🏦 Inizializzazione modulo Cassa...');
    if (!this.state.data.cassaEntries) {
        this.state.data.cassaEntries = [];
    }
    resetOperazioneForm.call(this);
    console.log('✅ Modulo Cassa inizializzato');
}
// Fine funzione initCassa

// === RENDER SEZIONE CASSA ===
// Inizio funzione renderCassaSection
function renderCassaSection(container) {
    const app = this;
    const stats = getCassaStats.call(app);

    container.innerHTML = `
        <div class="space-y-6">
            <div class="stats-grid">
                <div class="stat-card" style="background-color: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.3);">
                    <div class="stat-content">
                        <div class="stat-label">Totale Entrate</div>
                        <div class="stat-value text-success">${app.formatCurrency(stats.totalEntrate)}</div>
                    </div>
                    <div class="stat-icon green"><i data-lucide="arrow-down-left"></i></div>
                </div>
                <div class="stat-card" style="background-color: rgba(220, 38, 38, 0.05); border-color: rgba(220, 38, 38, 0.3);">
                    <div class="stat-content">
                        <div class="stat-label">Totale Uscite</div>
                        <div class="stat-value text-danger">${app.formatCurrency(stats.totalUscite)}</div>
                    </div>
                    <div class="stat-icon red"><i data-lucide="arrow-up-right"></i></div>
                </div>
                <div class="stat-card" style="padding: 0.75rem; background-color: rgba(37, 99, 235, 0.05); border-color: rgba(37, 99, 235, 0.3);">
                    <canvas id="cassaChart"></canvas>
                </div>
            </div>
    `;

    container.innerHTML += `
            <div class="filters-bar no-print">
                ${getInlineFormHTML(app)}
            </div>

            <div class="card no-print">
                <div class="card-header">
                    <h2 class="card-title">Movimenti di Cassa</h2>
                </div>
                <div class="table-container">
                    <table class="table" id="cassa-table">
                        <thead>
                            <tr>
                                <th><button data-sort="date">Data <i data-lucide="arrow-up-down"></i></button></th>
                                <th>Tipo</th>
                                <th>Categoria</th>
                                <th>Descrizione</th>
                                <th>Importo</th>
                                <th class="text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody id="cassa-tbody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    renderCassaTable.call(app);
    setupCassaEventListeners.call(app);
    setupInlineFormEventListeners.call(app);
    app.refreshIcons();

    setTimeout(() => initCassaChart.call(app), 50);
}
// Fine funzione renderCassaSection

// === FUNZIONI DI RENDER ===
// Inizio funzione renderCassaTable
function renderCassaTable() {
    const app = this;
    const tbody = document.getElementById('cassa-tbody');
    if (!tbody) return;

    const entries = getSortedCassaEntries.call(app);
    const categorie = getCategorie();

    if (entries.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-12"><div class="empty-state"><i data-lucide="folder-open"></i><div class="empty-state-title">Nessuna operazione registrata</div></div></td></tr>`;
    } else {
        tbody.innerHTML = entries.map(op => {
            const categoriaTesto = categorie[op.type]?.[op.category] || op.category.replace(/_/g, ' ');
            return `
                <tr class="hover:bg-secondary">
                    <td class="font-medium text-primary">${app.formatDate(op.date)}</td>
                    <td><span class="${op.type === 'entrata' ? 'text-success' : 'text-danger'}">${op.type.charAt(0).toUpperCase() + op.type.slice(1)}</span></td>
                    <td>${categoriaTesto}</td>
                    <td>${op.description || '-'}</td>
                    <td class="font-bold ${op.type === 'entrata' ? 'text-success' : 'text-danger'}">${app.formatCurrency(op.amount)}</td>
                    <td class="text-right">
                        <div class="flex items-center justify-end space-x-2">
                            <button class="btn btn-danger btn-sm" onclick="deleteOperazioneById('${op.id}')" title="Elimina operazione"><i data-lucide="trash-2"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    app.refreshIcons();
}
// Fine funzione renderCassaTable

// === GESTIONE FORM INLINE ===
// Inizio funzione getInlineFormHTML
function getInlineFormHTML(app) {
    const { type, category, clientId, date, amount, description } = cassaState.operazioneForm;
    const clients = app.state.data.clients || [];

    const categorie = getCategorie();
    const isClienteRelated = category === 'accredito_cliente' || category === 'addebito_cliente';
    
    return `
        <div class="w-full flex flex-wrap items-end gap-4">
            <div class="form-group mb-0" style="max-width: 140px;">
                <label class="form-label text-xs">Data</label>
                <input type="text" id="inline-op-date" class="form-control" value="${date}" autocomplete="off">
            </div>

            <div class="form-group mb-0">
                <label class="form-label text-xs">Tipo</label>
                <div class="btn-group">
                    <button class="btn ${type === 'entrata' ? 'btn-primary active' : 'btn-secondary'}" data-type="entrata">Entrata</button>
                    <button class="btn ${type === 'uscita' ? 'btn-primary active' : 'btn-secondary'}" data-type="uscita">Uscita</button>
                </div>
            </div>

            <div class="form-group mb-0">
                <label class="form-label text-xs">Categoria</label>
                <select id="inline-op-category" class="form-control">
                    ${Object.entries(categorie[type]).map(([key, value]) => `<option value="${key}" ${category === key ? 'selected' : ''}>${value}</option>`).join('')}
                </select>
            </div>
            <div class="form-group mb-0 ${isClienteRelated ? '' : 'hidden'}" id="inline-op-client-container">
                 <label class="form-label text-xs">Cliente</label>
                 <select id="inline-op-client" class="form-control">
                    <option value="">Seleziona...</option>
                    ${clients.map(c => `<option value="${c.id}" ${clientId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group mb-0" style="max-width: 120px;">
                <label class="form-label text-xs">Importo</label>
                <input type="number" step="0.01" id="inline-op-amount" class="form-control" value="${amount || ''}" placeholder="0.00" autocomplete="off">
            </div>
            <div class="form-group mb-0 flex-grow">
                <label class="form-label text-xs">Descrizione</label>
                <input type="text" id="inline-op-description" class="form-control" value="${description || ''}" placeholder="Opzionale" autocomplete="off" style="max-width: 100%;">
            </div>

            <div class="flex space-x-2">
                <button id="save-operazione-btn" class="btn btn-success" title="Salva" style="padding: 0.625rem;">
                    <i data-lucide="check" style="margin-right: 0;"></i>
                </button>
                <button id="cancel-operazione-btn" class="btn btn-secondary" title="Annulla" style="padding: 0.625rem;">
                    <i data-lucide="rotate-ccw" style="margin-right: 0;"></i>
                </button>
            </div>
        </div>
    `;
}
// Fine funzione getInlineFormHTML

// Inizio funzione initCassaChart
function initCassaChart() {
    const app = this;
    if (cassaState.cassaChartInstance) {
        cassaState.cassaChartInstance.destroy();
    }
    const ctx = document.getElementById('cassaChart');
    if (!ctx) return;

    const stats = getCassaStats.call(app);
    cassaState.cassaChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [''],
            datasets: [{
                label: 'Entrate',
                data: [stats.totalEntrate],
                backgroundColor: '#10b981',
                borderRadius: 5,
                barPercentage: 0.6
            }, {
                label: 'Uscite',
                data: [stats.totalUscite],
                backgroundColor: '#FF204E',
                borderRadius: 5,
                barPercentage: 0.6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    display: false
                },
                y: {
                    stacked: true,
                    display: false
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Rapporto Entrate / Uscite',
                    position: 'top',
                    align: 'start',
                    font: {
                        size: 14,
                        weight: '500'
                    },
                    color: document.body.classList.contains('theme-dark') ? '#d1d5db' : '#6b7280',
                    padding: {
                        top: 0,
                        bottom: 10
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${app.formatCurrency(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
}
// Fine funzione initCassaChart

// === EVENT LISTENERS ===
// Inizio funzione setupCassaEventListeners
function setupCassaEventListeners() {
    const app = this;
    const container = document.getElementById('section-cassa');
    if (!container) return;

    container.addEventListener('click', (e) => {
        const sortBtn = e.target.closest('[data-sort]');
        if (sortBtn) {
            sortCassa.call(app, sortBtn.dataset.sort);
        }
    });
}
// Fine funzione setupCassaEventListeners

// Inizio funzione setupInlineFormEventListeners
function setupInlineFormEventListeners() {
    const app = this;
    const container = document.getElementById('section-cassa');
    if (!container) return;
    
    container.querySelector('#save-operazione-btn')?.addEventListener('click', () => saveOperazione.call(app));
    
    container.querySelector('#cancel-operazione-btn')?.addEventListener('click', () => {
        resetOperazioneForm.call(app);
        renderCassaSection.call(app, container);
    });

    container.querySelectorAll('.btn-group [data-type]').forEach(button => {
        button.addEventListener('click', (e) => {
            const newType = e.currentTarget.dataset.type;
            if (cassaState.operazioneForm.type === newType) return;

            cassaState.operazioneForm.type = newType;
            cassaState.operazioneForm.category = Object.keys(getCategorie()[newType])[0];
            
            renderCassaSection.call(app, container);
        });
    });

    container.querySelector('#inline-op-category')?.addEventListener('change', (e) => {
        const newCategory = e.target.value;
        const clientContainer = document.getElementById('inline-op-client-container');
        const isClienteRelated = newCategory === 'accredito_cliente' || newCategory === 'addebito_cliente';
        clientContainer?.classList.toggle('hidden', !isClienteRelated);
    });
}
// Fine funzione setupInlineFormEventListeners


// === FUNZIONI DATI E STATO ===
// Inizio funzione getCassaStats
function getCassaStats() {
    const entries = this.state.data.cassaEntries || [];
    const stats = {
        totalEntrate: 0,
        totalUscite: 0,
        fondoCassa: 0
    };

    entries.forEach(op => {
        if (op.type === 'entrata') {
            stats.totalEntrate += op.amount;
        } else {
            stats.totalUscite += op.amount;
        }
    });

    stats.fondoCassa = stats.totalEntrate - stats.totalUscite;
    return stats;
}
// Fine funzione getCassaStats

// Inizio funzione getSortedCassaEntries
function getSortedCassaEntries() {
    const entries = [...(this.state.data.cassaEntries || [])];
    return entries.sort((a, b) => {
        const dir = cassaState.cassaSort.direction === 'asc' ? 1 : -1;
        if (cassaState.cassaSort.column === 'date') {
            return (new Date(b.date) - new Date(a.date)) * dir; 
        }
        return 0;
    });
}
// Fine funzione getSortedCassaEntries

// Inizio funzione sortCassa
function sortCassa(column) {
    if (cassaState.cassaSort.column === column) {
        cassaState.cassaSort.direction = cassaState.cassaSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        cassaState.cassaSort.column = column;
        cassaState.cassaSort.direction = 'desc';
    }
    renderCassaTable.call(this);
}
// Fine funzione sortCassa

// Inizio funzione resetOperazioneForm
function resetOperazioneForm() {
    cassaState.operazioneForm = {
        date: this.getTodayFormatted(),
        type: 'entrata',
        category: 'accredito_cliente',
        description: '',
        amount: null,
        clientId: null
    };
}
// Fine funzione resetOperazioneForm

// Inizio funzione saveOperazione
function saveOperazione() {
    const app = this;
    const date = document.getElementById('inline-op-date').value;
    const amount = parseFloat(document.getElementById('inline-op-amount').value);
    const type = cassaState.operazioneForm.type;
    const category = document.getElementById('inline-op-category').value;
    const description = document.getElementById('inline-op-description').value.trim();
    const clientSelect = document.getElementById('inline-op-client');
    const clientId = clientSelect ? clientSelect.value : null;

    if (!date || isNaN(amount) || amount <= 0) {
        return app.showNotification('Data e importo valido sono obbligatori.', 'error');
    }
    if (!app.validateItalianDate(date)) {
        return app.showNotification('Formato data non valido. Usa gg.mm.aaaa', 'error');
    }
    const isClienteRelated = category === 'accredito_cliente' || category === 'addebito_cliente';
    if (isClienteRelated && !clientId) {
        return app.showNotification('È obbligatorio selezionare un cliente per questa categoria.', 'error');
    }

    const operazioneData = {
        id: app.generateUniqueId('cassa'),
        date: app.parseItalianDate(date).toISOString(),
        type,
        category,
        description,
        amount,
        clientId: isClienteRelated ? clientId : null,
    };

    if (isClienteRelated) {
        const clientIndex = app.state.data.clients.findIndex(c => c.id === clientId);
        if (clientIndex !== -1) {
            const client = app.state.data.clients[clientIndex];
            const transactionAmount = type === 'entrata' ? amount : -amount;
            
            client.balance += transactionAmount;
            
            const categorie = getCategorie();
            const categoriaTesto = categorie[type]?.[category] || category.replace(/_/g, ' ');
            const transactionDescription = description || categoriaTesto;

            client.transactions.push({
                id: app.generateUniqueId('tx'),
                date: operazioneData.date,
                description: `[CASSA] ${transactionDescription}`,
                amount: transactionAmount
            });
            app.showNotification(`Conto di ${client.name} aggiornato.`);
        }
    }

    app.state.data.cassaEntries.push(operazioneData);
    app.saveToStorage('data', app.state.data);
    
    resetOperazioneForm.call(app);
    renderCassaSection.call(this, document.getElementById('section-cassa'));
    app.showNotification('Operazione di cassa salvata.');
}
// Fine funzione saveOperazione

// Inizio funzione deleteOperazioneById
function deleteOperazioneById(opId) {
    const app = getApp();
    const op = app.state.data.cassaEntries.find(o => o.id === opId);
    if (!op) return;

    app.showConfirm(`Sei sicuro di voler eliminare questa operazione? Se è collegata a un cliente, l'importo NON sarà stornato automaticamente dal suo conto.`, () => {
        app.state.data.cassaEntries = app.state.data.cassaEntries.filter(o => o.id !== opId);
        app.saveToStorage('data', app.state.data);
        renderCassaSection.call(app, document.getElementById('section-cassa'));
        app.showNotification('Operazione eliminata.');
    });
}
// Fine funzione deleteOperazioneById

// Inizio funzione getCategorie
function getCategorie() {
    // INIZIO MODIFICA: Aggiornamento delle categorie come richiesto
    return {
        entrata: {
            accredito_cliente: 'Accredito Cliente',
            lubrificante: 'Lubrificante',
            refrigerante: 'Refrigerante',
            spazzole: 'Spazzole',
            accessori: 'Accessori',
            bibite: 'Bibite',
            altro_incasso: 'Altro Incasso'
        },
        uscita: {
            addebito_cliente: 'Addebito Cliente',
            acquisto_e_spesa: 'Acquisto e Spesa',
            pagamento: 'Pagamento',
            altra_uscita: 'Altra Uscita'
        }
    };
    // FINE MODIFICA
}
// Fine funzione getCategorie

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initCassa = initCassa;
    window.renderCassaSection = renderCassaSection;
    window.cassaState = cassaState;
    window.deleteOperazioneById = deleteOperazioneById;
}
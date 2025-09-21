// =============================================
// FILE: registro.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della 
// sezione Registro di Carico.
// --- MODIFICATO PER USARE LO STANDARD A MODALI ---
// =============================================

// === STATO LOCALE DEL MODULO REGISTRO ===
let registroState = {
    // View mode (persistente)
    registryViewMode: null, // Non più usato per i form
    
    // Stato locale
    registrySort: { column: 'date', direction: 'desc' },
    registrySearchQuery: '',
    registryTimeFilter: 'none',
    editingRegistry: null,
    registryForm: { 
        date: '', 
        autistaName: '', 
        benzina: { carico: 0, differenza: 0 }, 
        gasolio: { carico: 0, differenza: 0 }, 
        dieselPlus: { carico: 0, differenza: 0 }, 
        hvolution: { carico: 0, differenza: 0 } 
    }
};

// === INIZIALIZZAZIONE MODULO REGISTRO ===
// Inizio funzione initRegistroDiCarico
function initRegistroDiCarico() {
    console.log('📋 Inizializzazione modulo Registro di Carico...');
    
    // Carica stato persistente
    registroState.registryViewMode = this.loadFromStorage('registryViewMode', 'list');
    
    // Inizializza form
    resetRegistryForm.call(this);
    
    console.log('✅ Modulo Registro di Carico inizializzato');
}
// Fine funzione initRegistroDiCarico

// === RENDER SEZIONE REGISTRO ===
// Inizio funzione renderRegistroSection
function renderRegistroSection(container) {
    console.log('🎨 Rendering sezione Registro di Carico...');
    
    const app = this;
    
    // La sezione ora renderizza sempre e solo la vista a lista
    renderRegistroListView.call(app, container);
    
    // Setup event listeners
    setupRegistroEventListeners.call(app);
    
    // Refresh icone
    app.refreshIcons();
}
// Fine funzione renderRegistroSection

// === RENDER VISTA LISTA ===
// Inizio funzione renderRegistroListView
function renderRegistroListView(container) {
    const app = this;
    const summary = getAnnualSummary.call(app);
    const stats = getRegistryStats.call(app);
    
    container.innerHTML = `
        <div class="space-y-6">
            
            <div class="card no-print">
                <div class="card-header">
                    <h2 class="card-title">Riepilogo totali ${new Date().getFullYear()}</h2>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Prodotto</th>
                                <th>Carico</th>
                                <th class="text-success">Differenza +</th>
                                <th class="text-danger">Differenza -</th>
                                <th>Anno Prec.</th>
                                <th>Contabile</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="font-medium text-primary">Benzina</td>
                                <td>${app.formatInteger(summary.benzina.carico)}</td>
                                <td class="text-success">${app.formatInteger(summary.benzina.diff_pos)}</td>
                                <td class="text-danger">${app.formatInteger(summary.benzina.diff_neg)}</td>
                                <td>
                                    <input type="number" id="prev-year-benzina" class="form-control w-24" 
                                           value="${app.state.data.previousYearStock.benzina}">
                                </td>
                                <td class="font-bold text-primary">${app.formatInteger(summary.benzina.carico + (app.state.data.previousYearStock.benzina || 0) + summary.benzina.diff_pos + summary.benzina.diff_neg)}</td>
                            </tr>
                            <tr>
                                <td class="font-medium text-primary">Gasolio</td>
                                <td>${app.formatInteger(summary.gasolio.carico)}</td>
                                <td class="text-success">${app.formatInteger(summary.gasolio.diff_pos)}</td>
                                <td class="text-danger">${app.formatInteger(summary.gasolio.diff_neg)}</td>
                                <td>
                                    <input type="number" id="prev-year-gasolio" class="form-control w-24" 
                                           value="${app.state.data.previousYearStock.gasolio}">
                                </td>
                                <td class="font-bold text-primary">${app.formatInteger(summary.gasolio.carico + (app.state.data.previousYearStock.gasolio || 0) + summary.gasolio.diff_pos + summary.gasolio.diff_neg)}</td>
                            </tr>
                            <tr>
                                <td class="font-medium text-primary">Diesel+</td>
                                <td>${app.formatInteger(summary.dieselPlus.carico)}</td>
                                <td class="text-success">${app.formatInteger(summary.dieselPlus.diff_pos)}</td>
                                <td class="text-danger">${app.formatInteger(summary.dieselPlus.diff_neg)}</td>
                                <td>
                                    <input type="number" id="prev-year-dieselPlus" class="form-control w-24" 
                                           value="${app.state.data.previousYearStock.dieselPlus}">
                                </td>
                                <td class="font-bold text-primary">${app.formatInteger(summary.dieselPlus.carico + (app.state.data.previousYearStock.dieselPlus || 0) + summary.dieselPlus.diff_pos + summary.dieselPlus.diff_neg)}</td>
                            </tr>
                            <tr>
                                <td class="font-medium text-primary">Hvolution</td>
                                <td>${app.formatInteger(summary.hvolution.carico)}</td>
                                <td class="text-success">${app.formatInteger(summary.hvolution.diff_pos)}</td>
                                <td class="text-danger">${app.formatInteger(summary.hvolution.diff_neg)}</td>
                                <td>
                                    <input type="number" id="prev-year-hvolution" class="form-control w-24" 
                                           value="${app.state.data.previousYearStock.hvolution}">
                                </td>
                                <td class="font-bold text-primary">${app.formatInteger(summary.hvolution.carico + (app.state.data.previousYearStock.hvolution || 0) + summary.hvolution.diff_pos + summary.hvolution.diff_neg)}</td>
                            </tr>
                        </tbody>
                        <tfoot class="font-bold text-primary bg-secondary">
                            <tr>
                                <td>Totale</td>
                                <td>${app.formatInteger(summary.benzina.carico + summary.gasolio.carico + summary.dieselPlus.carico + summary.hvolution.carico)}</td>
                                <td class="text-success">${app.formatInteger(summary.benzina.diff_pos + summary.gasolio.diff_pos + summary.dieselPlus.diff_pos + summary.hvolution.diff_pos)}</td>
                                <td class="text-danger">${app.formatInteger(summary.benzina.diff_neg + summary.gasolio.diff_neg + summary.dieselPlus.diff_neg + summary.hvolution.diff_neg)}</td>
                                <td>-</td>
                                <td>${app.formatInteger(
                                    (summary.benzina.carico + (app.state.data.previousYearStock.benzina || 0) + summary.benzina.diff_pos + summary.benzina.diff_neg) + 
                                    (summary.gasolio.carico + (app.state.data.previousYearStock.gasolio || 0) + summary.gasolio.diff_pos + summary.gasolio.diff_neg) + 
                                    (summary.dieselPlus.carico + (app.state.data.previousYearStock.dieselPlus || 0) + summary.dieselPlus.diff_pos + summary.dieselPlus.diff_neg) + 
                                    (summary.hvolution.carico + (app.state.data.previousYearStock.hvolution || 0) + summary.hvolution.diff_pos + summary.hvolution.diff_neg)
                                )}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div class="stats-grid no-print">
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Totale Litri Caricati</div>
                        <div class="stat-value">${app.formatInteger(stats.totalLiters)}</div>
                    </div>
                    <div class="stat-icon blue">
                        <i data-lucide="droplets"></i>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Prodotto Top</div>
                        <div class="stat-value">${stats.topProduct}</div>
                    </div>
                    <div class="stat-icon green">
                        <i data-lucide="droplet"></i>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Autista Top</div>
                        <div class="stat-value">${stats.topDriver}</div>
                    </div>
                    <div class="stat-icon purple">
                        <i data-lucide="user-check"></i>
                    </div>
                </div>
            </div>

            <div class="filters-bar no-print">
                <div class="filter-group">
                    <label class="form-label">Cerca Autista</label>
                    <div class="input-group">
                        <i data-lucide="search" class="input-group-icon"></i>
                        <input type="search" id="registry-search" placeholder="Cerca per autista..." 
                               class="form-control" value="${registroState.registrySearchQuery}">
                    </div>
                </div>
                <div class="filter-group">
                    <label class="form-label">Filtro Temporale</label>
                    <div class="btn-group w-full">
                        <button class="btn ${registroState.registryTimeFilter === 'none' ? 'btn-primary active' : 'btn-secondary'}" 
                                data-time-filter="none">Nessun Filtro</button>
                        <button class="btn ${registroState.registryTimeFilter === 'month' ? 'btn-primary active' : 'btn-secondary'}" 
                                data-time-filter="month">Ultimo Mese</button>
                        <button class="btn ${registroState.registryTimeFilter === 'quarter' ? 'btn-primary active' : 'btn-secondary'}" 
                                data-time-filter="quarter">Ultimo Trimestre</button>
                        <button class="btn ${registroState.registryTimeFilter === 'semester' ? 'btn-primary active' : 'btn-secondary'}" 
                                data-time-filter="semester">Ultimo Semestre</button>
                    </div>
                </div>
                <button id="new-carico-btn" class="btn btn-primary">
                    <i data-lucide="plus-circle"></i> Nuovo Carico
                </button>
            </div>

            <div class="card no-print">
                <div class="card-header">
                    <h2 class="card-title">Elenco Carichi</h2>
                </div>
                <div class="table-container">
                    <table class="table" id="registry-table">
                        <thead>
                            <tr>
                                <th><button class="flex items-center" data-sort="date">
                                    Data <i data-lucide="arrow-up-down" class="w-3 h-3 ml-1.5"></i>
                                </button></th>
                                <th><button class="flex items-center" data-sort="autistaName">
                                    Autista <i data-lucide="arrow-up-down" class="w-3 h-3 ml-1.5"></i>
                                </button></th>
                                <th>Benzina</th>
                                <th>Gasolio</th>
                                <th>Diesel+</th>
                                <th>Hvolution</th>
                                <th class="text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody id="registry-tbody">
                            </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Render tabella carichi
    renderRegistryTable.call(app);
}
// Fine funzione renderRegistroListView

// Inizio funzione getRegistroFormHTML
function getRegistroFormHTML() {
    const isEdit = !!registroState.editingRegistry;
    const title = isEdit ? 'Modifica Carico' : 'Nuovo Carico';
    const app = getApp(); // Per formattare i numeri

    // Funzione helper per creare un gruppo di input con pulsanti
    const createNumberInput = (product, field, step) => {
        const value = registroState.registryForm[product][field];
        return `
            <div class="number-input-group">
                <button type="button" class="number-input-btn" data-action="decrement" data-product="${product}" data-field="${field}" data-step="${step}">
                    <i data-lucide="minus"></i>
                </button>
                <input type="text" value="${app.formatInteger(value)}" readonly class="number-input-field" />
                <button type="button" class="number-input-btn" data-action="increment" data-product="${product}" data-field="${field}" data-step="${step}">
                    <i data-lucide="plus"></i>
                </button>
            </div>
        `;
    };

    return `
        <div class="card-header">
            <h2 class="card-title">${title}</h2>
            <button id="cancel-carico-btn" class="btn btn-secondary modal-close-btn">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div class="card-body">
            <div class="space-y-6">
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Data</label>
                        <div class="input-group">
                            <i data-lucide="calendar" class="input-group-icon"></i>
                            <input type="text" id="carico-date" class="form-control" 
                                   placeholder="gg.mm.aaaa" value="${registroState.registryForm.date}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nome Autista</label>
                        <input type="text" id="carico-autista" class="form-control" 
                               placeholder="Nome Cognome" value="${registroState.registryForm.autistaName}">
                    </div>
                </div>
                
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Prodotto</th>
                                <th class="text-center">Carico (Litri)</th>
                                <th class="text-center">Differenza (Litri)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="font-medium text-primary">Benzina</td>
                                <td>${createNumberInput('benzina', 'carico', 1000)}</td>
                                <td>${createNumberInput('benzina', 'differenza', 1)}</td>
                            </tr>
                            <tr>
                                <td class="font-medium text-primary">Gasolio</td>
                                <td>${createNumberInput('gasolio', 'carico', 1000)}</td>
                                <td>${createNumberInput('gasolio', 'differenza', 1)}</td>
                            </tr>
                            <tr>
                                <td class="font-medium text-primary">Diesel+</td>
                                <td>${createNumberInput('dieselPlus', 'carico', 1000)}</td>
                                <td>${createNumberInput('dieselPlus', 'differenza', 1)}</td>
                            </tr>
                            <tr>
                                <td class="font-medium text-primary">Hvolution</td>
                                <td>${createNumberInput('hvolution', 'carico', 1000)}</td>
                                <td>${createNumberInput('hvolution', 'differenza', 1)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="flex items-center justify-end space-x-4">
                    <button id="cancel-carico-btn-bottom" class="btn btn-secondary">Annulla</button>
                    <button id="save-carico-btn" class="btn btn-primary">Salva Carico</button>
                </div>
            </div>
        </div>
    `;
}
// Fine funzione getRegistroFormHTML

// === SETUP EVENT LISTENERS ===
// Inizio funzione setupRegistroEventListeners
function setupRegistroEventListeners() {
    const app = this;
    
    // Ricerca
    const searchInput = document.getElementById('registry-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            registroState.registrySearchQuery = e.target.value;
            renderRegistryTable.call(app);
        });
    }
    
    // Filtri temporali
    const timeFilterButtons = document.querySelectorAll('[data-time-filter]');
    timeFilterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-time-filter');
            setTimeFilter.call(app, filter);
        });
    });
    
    // Anno precedente inputs
    const prevYearInputs = ['benzina', 'gasolio', 'dieselPlus', 'hvolution'];
    prevYearInputs.forEach(product => {
        const input = document.getElementById(`prev-year-${product}`);
        if (input) {
            input.addEventListener('input', (e) => {
                app.state.data.previousYearStock[product] = parseFloat(e.target.value) || 0;
                app.saveToStorage('data', app.state.data);
                renderRegistroListView.call(app, document.getElementById('section-registro'));
            });
        }
    });
    
    // Pulsanti navigazione
    const newCaricoBtn = document.getElementById('new-carico-btn');
    if (newCaricoBtn) {
        newCaricoBtn.addEventListener('click', () => {
            showCreateCarico.call(app);
        });
    }
    
    // Sorting tabella
    const sortButtons = document.querySelectorAll('#registry-table [data-sort]');
    sortButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const column = btn.getAttribute('data-sort');
            sortRegistry.call(app, column);
        });
    });
}
// Fine funzione setupRegistroEventListeners

// Inizio funzione setupRegistroFormEventListeners
function setupRegistroFormEventListeners() {
    const app = getApp();
    const saveBtn = document.getElementById('save-carico-btn');
    const cancelBtn = document.getElementById('cancel-carico-btn');
    const cancelBtnBottom = document.getElementById('cancel-carico-btn-bottom');

    if (saveBtn) saveBtn.addEventListener('click', () => saveCarico.call(app));
    
    const close = () => app.hideFormModal();
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    if (cancelBtnBottom) cancelBtnBottom.addEventListener('click', close);

    // Listener per i campi di testo normali
    const textInputs = [
        { id: 'carico-date', path: 'date' },
        { id: 'carico-autista', path: 'autistaName' },
    ];
    textInputs.forEach(({ id, path }) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                updateRegistryFormValue(path, input.value);
            });
        }
    });

    // Listener per i nuovi pulsanti + e -
    const numberInputBtns = document.querySelectorAll('.number-input-btn');
    numberInputBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.currentTarget;
            const action = button.dataset.action;
            const product = button.dataset.product;
            const field = button.dataset.field;
            const step = parseInt(button.dataset.step, 10);

            if (!product || !field || isNaN(step)) return;

            let currentValue = registroState.registryForm[product][field];
            let newValue = action === 'increment' ? currentValue + step : currentValue - step;

            if (field === 'carico' && newValue < 0) {
                newValue = 0;
            }

            registroState.registryForm[product][field] = newValue;
            
            // Aggiorna il valore nel campo di testo readonly
            const inputField = button.parentElement.querySelector('.number-input-field');
            if (inputField) {
                inputField.value = app.formatInteger(newValue);
            }
        });
    });
}
// Fine funzione setupRegistroFormEventListeners

// === FUNZIONI NAVIGAZIONE / GESTIONE MODALI ===
// Inizio funzione showCreateCarico
function showCreateCarico() {
    const app = this;
    registroState.editingRegistry = null;
    resetRegistryForm.call(app);
    
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getRegistroFormHTML();
    
    modalContentEl.classList.add('modal-wide');
    
    setupRegistroFormEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showCreateCarico

// Inizio funzione showEditCarico
function showEditCarico(carico) {
    const app = this;
    registroState.editingRegistry = carico;
    
    registroState.registryForm = { 
        date: this.formatToItalianDate(carico.date), 
        autistaName: carico.autistaName || '', 
        benzina: { ...(carico.benzina || { carico: 0, differenza: 0 }) }, 
        gasolio: { ...(carico.gasolio || { carico: 0, differenza: 0 }) }, 
        dieselPlus: { ...(carico.dieselPlus || { carico: 0, differenza: 0 }) }, 
        hvolution: { ...(carico.hvolution || { carico: 0, differenza: 0 }) } 
    };
    
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getRegistroFormHTML();

    modalContentEl.classList.add('modal-wide');

    setupRegistroFormEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showEditCarico

// === FUNZIONI FILTRI E ORDINAMENTO ===
// Inizio funzione setTimeFilter
function setTimeFilter(filter) {
    registroState.registryTimeFilter = filter;
    
    // Ricarica l'intera vista per aggiornare sia le card che la tabella.
    renderRegistroListView.call(this, document.getElementById('section-registro'));

    // Ricollega gli event listener ai nuovi elementi creati.
    setupRegistroEventListeners.call(this);
}
// Fine funzione setTimeFilter

// Inizio funzione sortRegistry
function sortRegistry(column) {
    if (registroState.registrySort.column === column) {
        registroState.registrySort.direction = registroState.registrySort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        registroState.registrySort.column = column;
        registroState.registrySort.direction = 'asc';
    }
    
    renderRegistryTable.call(this);
}
// Fine funzione sortRegistry

// === FUNZIONI DATI ===
// Inizio funzione getFilteredRegistryEntries
function getFilteredRegistryEntries() {
    if (!Array.isArray(this.state.data.registryEntries)) return [];
    
    let filteredEntries = [...this.state.data.registryEntries];
    
    if (registroState.registryTimeFilter !== 'none') {
        const now = new Date();
        let startDate = new Date();
        switch(registroState.registryTimeFilter) {
            case 'month': startDate.setMonth(now.getMonth() - 1); break;
            case 'quarter': startDate.setMonth(now.getMonth() - 3); break;
            case 'semester': startDate.setMonth(now.getMonth() - 6); break;
        }
        filteredEntries = filteredEntries.filter(entry => new Date(entry.date) >= startDate);
    }
    
    if (registroState.registrySearchQuery.trim() !== '') {
        const query = registroState.registrySearchQuery.toLowerCase();
        filteredEntries = filteredEntries.filter(entry => 
            (entry.autistaName || '').toLowerCase().includes(query)
        );
    }
    
    return filteredEntries;
}
// Fine funzione getFilteredRegistryEntries

// Inizio funzione sortedRegistry
function sortedRegistry() {
    const filtered = getFilteredRegistryEntries.call(this);
    return filtered.sort((a, b) => {
        const dir = registroState.registrySort.direction === 'asc' ? 1 : -1;
        if (registroState.registrySort.column === 'date') {
            return (new Date(a.date) - new Date(b.date)) * dir;
        }
        if (registroState.registrySort.column === 'autistaName') {
            return (a.autistaName || '').localeCompare(b.autistaName || '', 'it-IT') * dir;
        }
        return 0;
    });
}
// Fine funzione sortedRegistry

// Inizio funzione getRegistryStats
function getRegistryStats() {
    const entries = getFilteredRegistryEntries.call(this);
    const stats = { totalLiters: 0, topProduct: 'N/D', topDriver: 'N/D' };
    
    if (entries.length === 0) return stats;

    const productTotals = { Benzina: 0, Gasolio: 0, 'Diesel+': 0, Hvolution: 0 };
    const driverCounts = {};

    entries.forEach(entry => {
        stats.totalLiters += (entry.benzina?.carico || 0) + (entry.gasolio?.carico || 0) + 
                            (entry.dieselPlus?.carico || 0) + (entry.hvolution?.carico || 0);
        
        productTotals.Benzina += entry.benzina?.carico || 0;
        productTotals.Gasolio += entry.gasolio?.carico || 0;
        productTotals['Diesel+'] += entry.dieselPlus?.carico || 0;
        productTotals.Hvolution += entry.hvolution?.carico || 0;
        
        if (entry.autistaName) {
            driverCounts[entry.autistaName] = (driverCounts[entry.autistaName] || 0) + 1;
        }
    });

    let maxLiters = -1;
    for (const product in productTotals) {
        if (productTotals[product] > maxLiters) {
            maxLiters = productTotals[product];
            stats.topProduct = product;
        }
    }
    if (maxLiters <= 0) stats.topProduct = 'N/D';

    let maxTrips = 0;
    for (const driver in driverCounts) {
        if (driverCounts[driver] > maxTrips) {
            maxTrips = driverCounts[driver];
            const nameParts = driver.split(' ');
            stats.topDriver = nameParts[0] || driver;
        }
    }
    
    return stats;
}
// Fine funzione getRegistryStats

// Inizio funzione getAnnualSummary
function getAnnualSummary() {
    const currentYear = new Date().getFullYear();
    const summary = {
        benzina: { carico: 0, diff_pos: 0, diff_neg: 0 },
        gasolio: { carico: 0, diff_pos: 0, diff_neg: 0 },
        dieselPlus: { carico: 0, diff_pos: 0, diff_neg: 0 },
        hvolution: { carico: 0, diff_pos: 0, diff_neg: 0 }
    };
    
    if (!Array.isArray(this.state.data.registryEntries)) return summary;
    
    const processProduct = (productData, summaryProduct) => {
        if (productData) {
            summaryProduct.carico += productData.carico || 0;
            const diff = productData.differenza || 0;
            if (diff > 0) { summaryProduct.diff_pos += diff; } 
            else { summaryProduct.diff_neg += diff; }
        }
    };
    
    this.state.data.registryEntries
        .filter(entry => new Date(entry.date).getFullYear() === currentYear)
        .forEach(entry => {
            processProduct(entry.benzina, summary.benzina);
            processProduct(entry.gasolio, summary.gasolio);
            processProduct(entry.dieselPlus, summary.dieselPlus);
            processProduct(entry.hvolution, summary.hvolution);
        });
    
    return summary;
}
// Fine funzione getAnnualSummary

// === FUNZIONI FORM ===
// Inizio funzione resetRegistryForm
function resetRegistryForm() {
    registroState.registryForm = {
        date: this.getTodayFormatted(),
        autistaName: '',
        benzina: { carico: 0, differenza: 0 },
        gasolio: { carico: 0, differenza: 0 },
        dieselPlus: { carico: 0, differenza: 0 },
        hvolution: { carico: 0, differenza: 0 }
    };
}
// Fine funzione resetRegistryForm

// Inizio funzione updateRegistryFormValue
function updateRegistryFormValue(path, value) {
    const keys = path.split('.');
    let current = registroState.registryForm;
    
    for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
    }
    
    const finalKey = keys[keys.length - 1];
    current[finalKey] = value === '' ? (finalKey === 'autistaName' || finalKey === 'date' ? '' : 0) : 
                        (finalKey === 'autistaName' || finalKey === 'date' ? value : parseFloat(value) || 0);
}
// Fine funzione updateRegistryFormValue

// Inizio funzione saveCarico
function saveCarico() {
    if (!registroState.registryForm.date || !registroState.registryForm.autistaName.trim()) {
        this.showNotification('Data e nome autista sono obbligatori');
        return;
    }
    
    if (!this.validateItalianDate(registroState.registryForm.date)) {
        this.showNotification('Formato data non valido. Usa gg.mm.aaaa');
        return;
    }
    
    const parsedDate = this.parseItalianDate(registroState.registryForm.date);
    const carico = {
        id: registroState.editingRegistry ? registroState.editingRegistry.id : this.generateUniqueId('carico'),
        date: parsedDate.toISOString(),
        autistaName: registroState.registryForm.autistaName.trim(),
        benzina: { 
            carico: parseFloat(registroState.registryForm.benzina.carico) || 0, 
            differenza: parseFloat(registroState.registryForm.benzina.differenza) || 0 
        },
        gasolio: { 
            carico: parseFloat(registroState.registryForm.gasolio.carico) || 0, 
            differenza: parseFloat(registroState.registryForm.gasolio.differenza) || 0 
        },
        dieselPlus: { 
            carico: parseFloat(registroState.registryForm.dieselPlus.carico) || 0, 
            differenza: parseFloat(registroState.registryForm.dieselPlus.differenza) || 0 
        },
        hvolution: { 
            carico: parseFloat(registroState.registryForm.hvolution.carico) || 0, 
            differenza: parseFloat(registroState.registryForm.hvolution.differenza) || 0 
        },
        createdAt: registroState.editingRegistry ? registroState.editingRegistry.createdAt : new Date().toISOString()
    };
    
    if (registroState.editingRegistry) {
        const index = this.state.data.registryEntries.findIndex(c => c.id === registroState.editingRegistry.id);
        if (index !== -1) this.state.data.registryEntries[index] = carico;
    } else {
        this.state.data.registryEntries.push(carico);
    }
    
    this.saveToStorage('data', this.state.data);
    this.hideFormModal();
    renderRegistroListView.call(this, document.getElementById('section-registro')); // Aggiorna l'intera vista per ricalcolare i totali
}
// Fine funzione saveCarico

// Inizio funzione deleteCarico
function deleteCarico(caricoId) {
    const carico = this.state.data.registryEntries.find(c => c.id === caricoId);
    if (!carico) return;
    
    this.showConfirm(`Sei sicuro di voler eliminare il carico del ${this.formatDate(carico.date)} di ${carico.autistaName}?`, () => {
        this.state.data.registryEntries = this.state.data.registryEntries.filter(c => c.id !== caricoId);
        this.saveToStorage('data', this.state.data);
        renderRegistroListView.call(this, document.getElementById('section-registro')); // Ricarica per aggiornare totali
    });
}
// Fine funzione deleteCarico

// === RENDER TABELLA REGISTRY ===
// Inizio funzione renderRegistryTable
function renderRegistryTable() {
    const tbody = document.getElementById('registry-tbody');
    if (!tbody) return;
    
    const app = this;
    const entries = sortedRegistry.call(app);
    
    if (entries.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-12">
                    <div class="empty-state">
                        <i data-lucide="truck"></i>
                        <div class="empty-state-title">Nessun carico trovato</div>
                        <div class="empty-state-description">Prova a modificare i filtri di ricerca.</div>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = entries.map(carico => `
            <tr class="hover:bg-secondary">
                <td class="font-medium text-primary">${app.formatDate(carico.date)}</td>
                <td class="text-primary">${carico.autistaName || '-'}</td>
                <td>${formatProductColumn(carico.benzina)}</td>
                <td>${formatProductColumn(carico.gasolio)}</td>
                <td>${formatProductColumn(carico.dieselPlus)}</td>
                <td>${formatProductColumn(carico.hvolution)}</td>
                <td class="text-right">
                    <div class="flex items-center justify-end space-x-2">
                        <button class="btn btn-warning btn-sm" onclick="editCaricoById('${carico.id}')" title="Modifica carico">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCaricoById('${carico.id}')" title="Elimina carico">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    this.refreshIcons();
}
// Fine funzione renderRegistryTable

// Inizio funzione formatProductColumn
function formatProductColumn(product) {
    if (!product) return '-';
    
    const carico = product.carico || 0;
    const differenza = product.differenza || 0;
    const diffClass = differenza >= 0 ? 'text-success' : 'text-danger';
    
    return `<div class="text-sm">
        <div>Carico: <span class="font-medium">${carico.toLocaleString('it-IT')} L</span></div>
        <div class="${diffClass}">Diff: ${differenza >= 0 ? '+' : ''}${differenza.toLocaleString('it-IT')} L</div>
    </div>`;
}
// Fine funzione formatProductColumn

// === FUNZIONI GLOBALI PER EVENTI ===
// Inizio funzione editCaricoById
function editCaricoById(caricoId) {
    const app = getApp();
    const carico = app.state.data.registryEntries.find(c => c.id === caricoId);
    if (carico) {
        showEditCarico.call(app, carico);
    }
}
// Fine funzione editCaricoById

// Inizio funzione deleteCaricoById
function deleteCaricoById(caricoId) {
    const app = getApp();
    deleteCarico.call(app, caricoId);
}
// Fine funzione deleteCaricoById

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initRegistroDiCarico = initRegistroDiCarico;
    window.renderRegistroSection = renderRegistroSection;
    window.editCaricoById = editCaricoById;
    window.deleteCaricoById = deleteCaricoById;
    window.registroState = registroState;
}
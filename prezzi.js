// =============================================
// FILE: prezzi.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della 
// sezione Gestione Prezzi (listini e concorrenza).
// --- RI-PROGETTATO CON LAYOUT A GRID E MODALI AGGIORNATI ---
// =============================================

// === STATO LOCALE DEL MODULO PREZZI ===
let prezziState = {
    // Stato locale
    priceSort: { column: 'date', direction: 'desc' },
    editingListino: null,
    listinoForm: { 
        date: '', 
        variazione: 'Entrambi', 
        benzina: '', 
        gasolio: '', 
        dieselPlus: '', 
        hvolution: '', 
        adblue: '' 
    },
    concorrenzaForm: { 
        date: '', 
        myoil: { benzina: '', gasolio: '' }, 
        esso: { benzina: '', gasolio: '' }, 
        q8: { benzina: '', gasolio: '' } 
    }
};

// === INIZIALIZZAZIONE MODULO PREZZI ===
// Inizio funzione initGestionePrezzi
function initGestionePrezzi() {
    console.log('💰 Inizializzazione modulo Gestione Prezzi...');
    
    // Inizializza form
    resetListinoForm.call(this);
    resetConcorrenzaForm.call(this);
    
    console.log('✅ Modulo Gestione Prezzi inizializzato');
}
// Fine funzione initGestionePrezzi

// === RENDER SEZIONE PREZZI ===
// Inizio funzione renderPrezziSection
function renderPrezziSection(container) {
    console.log('🎨 Rendering sezione Gestione Prezzi...');
    
    const app = this;
    
    // La sezione ora renderizza sempre e solo la vista a lista
    renderPrezziListView.call(app, container);
    
    // Setup event listeners
    setupPrezziEventListeners.call(app);
    
    // Refresh icone
    app.refreshIcons();
}
// Fine funzione renderPrezziSection

// === RENDER VISTA LISTA ===
// Inizio funzione renderPrezziListView
function renderPrezziListView(container) {
    const app = this;
    const latestPrices = latestAppliedPrices.call(app);
    
    container.innerHTML = `
        <div class="space-y-6">
            
            <div class="grid grid-cols-2 gap-6">
                
                <div class="grid grid-cols-2 gap-6">
                    <div class="stat-card">
                        <div class="stat-content">
                            <div class="stat-label">Benzina Iperself</div>
                            <div class="stat-value text-success">${app.formatCurrency(latestPrices.benzina, true)}</div>
                        </div>
                        <div class="stat-icon green"><i data-lucide="droplets"></i></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-content">
                            <div class="stat-label">Gasolio Iperself</div>
                            <div class="stat-value text-warning">${app.formatCurrency(latestPrices.gasolio, true)}</div>
                        </div>
                        <div class="stat-icon yellow"><i data-lucide="droplets"></i></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-content">
                            <div class="stat-label">Diesel+ Iperself</div>
                            <div class="stat-value text-danger">${app.formatCurrency(latestPrices.dieselPlus, true)}</div>
                        </div>
                        <div class="stat-icon red"><i data-lucide="droplets"></i></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-content">
                            <div class="stat-label">Hvolution Iperself</div>
                            <div class="stat-value text-info">${app.formatCurrency(latestPrices.hvolution, true)}</div>
                        </div>
                        <div class="stat-icon blue"><i data-lucide="droplets"></i></div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Prezzi Concorrenza</h3>
                        <button id="update-concorrenza-btn" class="btn btn-secondary btn-sm" title="Aggiorna">
                            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                        </button>
                    </div>
                    <div class="card-body" id="concorrenza-card-content">
                        </div>
                </div>

            </div>

            <div class="card no-print">
                <div class="card-header">
                    <h2 class="card-title">Storico Listini Prezzi</h2>
                    <button id="new-listino-btn" class="btn btn-primary">
                        <i data-lucide="plus-circle"></i> Nuovo Listino
                    </button>
                </div>
                <div class="table-container">
                    <table class="table" id="listini-table">
                        <thead>
                            <tr>
                                <th><button class="flex items-center" data-sort="date">Data <i data-lucide="arrow-up-down" class="w-3 h-3 ml-1.5"></i></button></th>
                                <th>Variazione</th>
                                <th>Benzina</th>
                                <th>Gasolio</th>
                                <th>Diesel+</th>
                                <th>Hvolution</th>
                                <th>AdBlue</th>
                                <th class="text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody id="listini-tbody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    renderListiniTable.call(app);
    renderConcorrenzaCard.call(app);
}
// Fine funzione renderPrezziListView

// Inizio funzione getListinoFormHTML
function getListinoFormHTML() {
    const isEdit = !!prezziState.editingListino;
    const title = isEdit ? 'Modifica Listino' : 'Nuovo Listino';
    
    return `
        <div class="card-header">
            <h2 class="card-title">${title}</h2>
            <button id="cancel-listino-btn" class="btn btn-secondary modal-close-btn"><i data-lucide="x"></i></button>
        </div>
        <div class="card-body">
            <div class="space-y-6">
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Data</label>
                        <div class="input-group">
                            <i data-lucide="calendar" class="input-group-icon"></i>
                            <input type="text" id="listino-date" class="form-control" placeholder="gg.mm.aaaa" value="${prezziState.listinoForm.date}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Variazione</label>
                        <div class="btn-group w-full">
                            <button class="btn ${prezziState.listinoForm.variazione === 'Aumento' ? 'btn-primary active' : 'btn-secondary'}" data-variazione="Aumento">Aumento</button>
                            <button class="btn ${prezziState.listinoForm.variazione === 'Diminuzione' ? 'btn-primary active' : 'btn-secondary'}" data-variazione="Diminuzione">Diminuzione</button>
                            <button class="btn ${prezziState.listinoForm.variazione === 'Entrambi' ? 'btn-primary active' : 'btn-secondary'}" data-variazione="Entrambi">Entrambi</button>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-5 gap-4">
                    <div class="product-box" style="background-color: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.3);">
                        <label class="form-label font-medium" style="color: var(--color-success);">Benzina</label>
                        <input type="number" step="0.001" id="listino-benzina" class="form-control" placeholder="1.000" value="${prezziState.listinoForm.benzina || ''}">
                    </div>
                     <div class="product-box" style="background-color: rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.3);">
                        <label class="form-label font-medium" style="color: var(--color-warning);">Gasolio</label>
                        <input type="number" step="0.001" id="listino-gasolio" class="form-control" placeholder="1.000" value="${prezziState.listinoForm.gasolio || ''}">
                    </div>
                     <div class="product-box" style="background-color: rgba(220, 38, 38, 0.05); border-color: rgba(220, 38, 38, 0.3);">
                        <label class="form-label font-medium" style="color: var(--color-danger);">Diesel+</label>
                        <input type="number" step="0.001" id="listino-dieselPlus" class="form-control" placeholder="1.000" value="${prezziState.listinoForm.dieselPlus || ''}">
                    </div>
                     <div class="product-box" style="background-color: rgba(6, 182, 212, 0.05); border-color: rgba(6, 182, 212, 0.3);">
                        <label class="form-label font-medium" style="color: var(--color-info);">Hvolution</label>
                        <input type="number" step="0.001" id="listino-hvolution" class="form-control" placeholder="1.000" value="${prezziState.listinoForm.hvolution || ''}">
                    </div>
                     <div class="product-box" style="background-color: rgba(107, 114, 128, 0.05); border-color: rgba(107, 114, 128, 0.3);">
                        <label class="form-label font-medium" style="color: var(--color-secondary);">AdBlue</label>
                        <input type="number" step="0.001" id="listino-adblue" class="form-control" placeholder="1.000" value="${prezziState.listinoForm.adblue || ''}">
                    </div>
                </div>

                <div class="flex items-center justify-end space-x-4">
                    <button id="cancel-listino-btn-bottom" class="btn btn-secondary">Annulla</button>
                    <button id="save-listino-btn" class="btn btn-primary">Salva Listino</button>
                </div>
            </div>
        </div>
    `;
}
// Fine funzione getListinoFormHTML

// Inizio funzione getConcorrenzaFormHTML
function getConcorrenzaFormHTML() {
    return `
        <div class="card-header">
            <h2 class="card-title">Aggiorna Prezzi Concorrenza</h2>
            <button id="cancel-concorrenza-btn" class="btn btn-secondary modal-close-btn"><i data-lucide="x"></i></button>
        </div>
        <div class="card-body">
            <div class="space-y-6">
                <div class="form-group max-w-sm">
                    <label class="form-label">Data</label>
                    <div class="input-group">
                        <i data-lucide="calendar" class="input-group-icon"></i>
                        <input type="text" id="concorrenza-date" class="form-control" placeholder="gg.mm.aaaa" value="${prezziState.concorrenzaForm.date}">
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-6">
                    <div class="product-box" style="background-color: rgba(139, 92, 246, 0.05); border-color: rgba(139, 92, 246, 0.3);">
                        <h4 class="product-title text-center" style="color: #8b5cf6;">MyOil</h4>
                        <div class="form-group"><label class="form-label text-xs">Benzina</label><input type="number" step="0.001" id="myoil-benzina" class="form-control" value="${prezziState.concorrenzaForm.myoil.benzina || ''}"></div>
                        <div class="form-group"><label class="form-label text-xs">Gasolio</label><input type="number" step="0.001" id="myoil-gasolio" class="form-control" value="${prezziState.concorrenzaForm.myoil.gasolio || ''}"></div>
                    </div>
                    <div class="product-box" style="background-color: rgba(220, 38, 38, 0.05); border-color: rgba(220, 38, 38, 0.3);">
                        <h4 class="product-title text-center" style="color: var(--color-danger);">Esso</h4>
                        <div class="form-group"><label class="form-label text-xs">Benzina</label><input type="number" step="0.001" id="esso-benzina" class="form-control" value="${prezziState.concorrenzaForm.esso.benzina || ''}"></div>
                        <div class="form-group"><label class="form-label text-xs">Gasolio</label><input type="number" step="0.001" id="esso-gasolio" class="form-control" value="${prezziState.concorrenzaForm.esso.gasolio || ''}"></div>
                    </div>
                    <div class="product-box" style="background-color: rgba(37, 99, 235, 0.05); border-color: rgba(37, 99, 235, 0.3);">
                        <h4 class="product-title text-center" style="color: var(--color-primary);">Q8</h4>
                        <div class="form-group"><label class="form-label text-xs">Benzina</label><input type="number" step="0.001" id="q8-benzina" class="form-control" value="${prezziState.concorrenzaForm.q8.benzina || ''}"></div>
                        <div class="form-group"><label class="form-label text-xs">Gasolio</label><input type="number" step="0.001" id="q8-gasolio" class="form-control" value="${prezziState.concorrenzaForm.q8.gasolio || ''}"></div>
                    </div>
                </div>
                <div class="flex items-center justify-end space-x-4">
                    <button id="cancel-concorrenza-btn-bottom" class="btn btn-secondary">Annulla</button>
                    <button id="save-concorrenza-btn" class="btn btn-primary">Salva Prezzi</button>
                </div>
            </div>
        </div>
    `;
}
// Fine funzione getConcorrenzaFormHTML

// === SETUP EVENT LISTENERS ===
// Inizio funzione setupPrezziEventListeners
function setupPrezziEventListeners() {
    const app = this;
    
    // Pulsanti per aprire i modali
    document.getElementById('new-listino-btn')?.addEventListener('click', () => showCreateListino.call(app));
    document.getElementById('update-concorrenza-btn')?.addEventListener('click', () => showUpdateConcorrenza.call(app));
    
    // Sorting tabella
    document.querySelectorAll('#listini-table [data-sort]').forEach(btn => {
        btn.addEventListener('click', () => sortPrices.call(app, btn.getAttribute('data-sort')));
    });
}
// Fine funzione setupPrezziEventListeners

// Inizio funzione setupListinoFormEventListeners
function setupListinoFormEventListeners() {
    const app = getApp();
    document.getElementById('save-listino-btn')?.addEventListener('click', () => saveListino.call(app));
    
    const close = () => app.hideFormModal();
    document.getElementById('cancel-listino-btn')?.addEventListener('click', close);
    document.getElementById('cancel-listino-btn-bottom')?.addEventListener('click', close);
    
    // Listener per i tab Variazione
    document.querySelectorAll('[data-variazione]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const newVariazione = e.currentTarget.dataset.variazione;
            prezziState.listinoForm.variazione = newVariazione;
            // Aggiorna UI
            document.querySelectorAll('[data-variazione]').forEach(b => {
                b.classList.toggle('btn-primary', b.dataset.variazione === newVariazione);
                b.classList.toggle('active', b.dataset.variazione === newVariazione);
                b.classList.toggle('btn-secondary', b.dataset.variazione !== newVariazione);
            });
        });
    });

    const listinoInputs = [
        { id: 'listino-date', path: 'date' },
        { id: 'listino-benzina', path: 'benzina' },
        { id: 'listino-gasolio', path: 'gasolio' },
        { id: 'listino-dieselPlus', path: 'dieselPlus' },
        { id: 'listino-hvolution', path: 'hvolution' },
        { id: 'listino-adblue', path: 'adblue' }
    ];
    
    listinoInputs.forEach(({ id, path }) => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', () => updateListinoFormValue(path, input.value));
    });
}
// Fine funzione setupListinoFormEventListeners

// Inizio funzione setupConcorrenzaFormEventListeners
function setupConcorrenzaFormEventListeners() {
    const app = getApp();
    document.getElementById('save-concorrenza-btn')?.addEventListener('click', () => saveConcorrenza.call(app));

    const close = () => app.hideFormModal();
    document.getElementById('cancel-concorrenza-btn')?.addEventListener('click', close);
    document.getElementById('cancel-concorrenza-btn-bottom')?.addEventListener('click', close);

    const concorrenzaInputs = [
        { id: 'concorrenza-date', path: 'date' },
        { id: 'myoil-benzina', path: 'myoil.benzina' }, { id: 'myoil-gasolio', path: 'myoil.gasolio' },
        { id: 'esso-benzina', path: 'esso.benzina' }, { id: 'esso-gasolio', path: 'esso.gasolio' },
        { id: 'q8-benzina', path: 'q8.benzina' }, { id: 'q8-gasolio', path: 'q8.gasolio' }
    ];
    
    concorrenzaInputs.forEach(({ id, path }) => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', () => updateConcorrenzaFormValue(path, input.value));
    });
}
// Fine funzione setupConcorrenzaFormEventListeners

// === FUNZIONI GESTIONE MODALI ===
// Inizio funzione showCreateListino
function showCreateListino() {
    const app = this;
    prezziState.editingListino = null;
    resetListinoForm.call(app);
    
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getListinoFormHTML();
    modalContentEl.classList.add('modal-wide');
    
    setupListinoFormEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showCreateListino

// Inizio funzione showEditListino
function showEditListino(listino) {
    const app = this;
    prezziState.editingListino = { ...listino };
    
    prezziState.listinoForm = { 
        date: app.formatToItalianDate(listino.date), 
        variazione: listino.variazione || 'Entrambi', 
        benzina: listino.benzina || '', gasolio: listino.gasolio || '', 
        dieselPlus: listino.dieselPlus || '', hvolution: listino.hvolution || '', 
        adblue: listino.adblue || '' 
    };
    
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getListinoFormHTML();
    modalContentEl.classList.add('modal-wide');

    setupListinoFormEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showEditListino

// Inizio funzione showUpdateConcorrenza
function showUpdateConcorrenza() {
    const app = this;
    resetConcorrenzaForm.call(app);

    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getConcorrenzaFormHTML();
    modalContentEl.classList.add('modal-wide');

    setupConcorrenzaFormEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showUpdateConcorrenza

// === FUNZIONI ORDINAMENTO ===
// Inizio funzione sortPrices
function sortPrices(column) {
    if (prezziState.priceSort.column === column) {
        prezziState.priceSort.direction = prezziState.priceSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        prezziState.priceSort.column = column;
        prezziState.priceSort.direction = 'asc';
    }
    renderListiniTable.call(this);
}
// Fine funzione sortPrices

// === FUNZIONI DATI ===
// Inizio funzione sortedPriceHistory
function sortedPriceHistory() {
    if (!Array.isArray(this.state.data.priceHistory)) return [];
    
    return [...this.state.data.priceHistory].sort((a, b) => {
        const dir = prezziState.priceSort.direction === 'asc' ? 1 : -1;
        return (new Date(a.date) - new Date(b.date)) * dir;
    });
}
// Fine funzione sortedPriceHistory

// Inizio funzione latestAppliedPrices
function latestAppliedPrices() {
    const prices = currentPrices.call(this);
    const surcharge = 0.005;
    return {
        benzina: (prices.benzina || 0) + surcharge,
        gasolio: (prices.gasolio || 0) + surcharge,
        dieselPlus: prices.dieselPlus ? prices.dieselPlus + surcharge : null,
        hvolution: prices.hvolution ? prices.hvolution + surcharge : null,
    };
}
// Fine funzione latestAppliedPrices

// Inizio funzione currentPrices
function currentPrices() {
    if (!Array.isArray(this.state.data.priceHistory) || this.state.data.priceHistory.length === 0) {
        return { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0, adblue: 0 };
    }
    return [...this.state.data.priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}
// Fine funzione currentPrices

// Inizio funzione competitorPrices
function competitorPrices() {
    if (!Array.isArray(this.state.data.competitorPrices) || this.state.data.competitorPrices.length === 0) {
        return { myoil: { benzina: 0, gasolio: 0 }, esso: { benzina: 0, gasolio: 0 }, q8: { benzina: 0, gasolio: 0 } };
    }
    const latest = [...this.state.data.competitorPrices].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return {
        myoil: latest.myoil || { benzina: 0, gasolio: 0 },
        esso: latest.esso || { benzina: 0, gasolio: 0 },
        q8: latest.q8 || { benzina: 0, gasolio: 0 }
    };
}
// Fine funzione competitorPrices

// === FUNZIONI FORM ===
// Inizio funzione resetListinoForm
function resetListinoForm() {
    prezziState.listinoForm = {
        date: this.getTodayFormatted(),
        variazione: 'Entrambi',
        benzina: '', gasolio: '', dieselPlus: '', hvolution: '', adblue: ''
    };
}
// Fine funzione resetListinoForm

// Inizio funzione resetConcorrenzaForm
function resetConcorrenzaForm() {
    prezziState.concorrenzaForm = {
        date: this.getTodayFormatted(),
        myoil: { benzina: '', gasolio: '' },
        esso: { benzina: '', gasolio: '' },
        q8: { benzina: '', gasolio: '' }
    };
}
// Fine funzione resetConcorrenzaForm

// Inizio funzione updateListinoFormValue
function updateListinoFormValue(path, value) {
    prezziState.listinoForm[path] = value;
}
// Fine funzione updateListinoFormValue

// Inizio funzione updateConcorrenzaFormValue
function updateConcorrenzaFormValue(path, value) {
    const keys = path.split('.');
    if (keys.length === 1) {
        prezziState.concorrenzaForm[keys[0]] = value;
    } else {
        prezziState.concorrenzaForm[keys[0]][keys[1]] = value;
    }
}
// Fine funzione updateConcorrenzaFormValue

// Inizio funzione saveListino
function saveListino() {
    if (!prezziState.listinoForm.date || !prezziState.listinoForm.benzina || !prezziState.listinoForm.gasolio) {
        return this.showNotification('Data, prezzo benzina e gasolio sono obbligatori');
    }
    if (!this.validateItalianDate(prezziState.listinoForm.date)) {
        return this.showNotification('Formato data non valido. Usa gg.mm.aaaa');
    }
    
    const parsedDate = this.parseItalianDate(prezziState.listinoForm.date);
    const listino = {
        id: prezziState.editingListino ? prezziState.editingListino.id : this.generateUniqueId('listino'),
        date: parsedDate.toISOString(),
        variazione: prezziState.listinoForm.variazione,
        benzina: parseFloat(prezziState.listinoForm.benzina) || 0,
        gasolio: parseFloat(prezziState.listinoForm.gasolio) || 0,
        dieselPlus: parseFloat(prezziState.listinoForm.dieselPlus) || null,
        hvolution: parseFloat(prezziState.listinoForm.hvolution) || null,
        adblue: parseFloat(prezziState.listinoForm.adblue) || null
    };
    
    if (prezziState.editingListino) {
        const index = this.state.data.priceHistory.findIndex(l => l.id === prezziState.editingListino.id);
        if (index !== -1) this.state.data.priceHistory[index] = listino;
    } else {
        this.state.data.priceHistory.push(listino);
    }
    
    this.saveToStorage('data', this.state.data);
    this.hideFormModal();
    renderPrezziListView.call(this, document.getElementById('section-prezzi'));
}
// Fine funzione saveListino

// Inizio funzione saveConcorrenza
function saveConcorrenza() {
    if (!prezziState.concorrenzaForm.date || !this.validateItalianDate(prezziState.concorrenzaForm.date)) {
        return this.showNotification('Data obbligatoria in formato gg.mm.aaaa');
    }
    
    const parsedDate = this.parseItalianDate(prezziState.concorrenzaForm.date);
    const concorrenza = {
        id: this.generateUniqueId('concorrenza'),
        date: parsedDate.toISOString(),
        myoil: { benzina: parseFloat(prezziState.concorrenzaForm.myoil.benzina) || null, gasolio: parseFloat(prezziState.concorrenzaForm.myoil.gasolio) || null },
        esso: { benzina: parseFloat(prezziState.concorrenzaForm.esso.benzina) || null, gasolio: parseFloat(prezziState.concorrenzaForm.esso.gasolio) || null },
        q8: { benzina: parseFloat(prezziState.concorrenzaForm.q8.benzina) || null, gasolio: parseFloat(prezziState.concorrenzaForm.q8.gasolio) || null }
    };
    
    this.state.data.competitorPrices.push(concorrenza);
    this.saveToStorage('data', this.state.data);
    this.hideFormModal();
    renderConcorrenzaCard.call(this);
}
// Fine funzione saveConcorrenza

// Inizio funzione deleteListino
function deleteListino(listinoId) {
    const listino = this.state.data.priceHistory.find(l => l.id === listinoId);
    if (!listino) return;
    
    this.showConfirm(`Sei sicuro di voler eliminare il listino del ${this.formatDate(listino.date)}?`, () => {
        this.state.data.priceHistory = this.state.data.priceHistory.filter(l => l.id !== listinoId);
        this.saveToStorage('data', this.state.data);
        renderPrezziListView.call(this, document.getElementById('section-prezzi'));
    });
}
// Fine funzione deleteListino

// === RENDER FUNZIONI SPECIFICHE ===
// Inizio funzione renderListiniTable
function renderListiniTable() {
    const tbody = document.getElementById('listini-tbody');
    if (!tbody) return;
    
    const app = this;
    const listini = sortedPriceHistory.call(app);
    
    if (listini.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-12"><div class="empty-state"><i data-lucide="euro"></i><div class="empty-state-title">Nessun listino trovato</div></div></td></tr>`;
    } else {
        tbody.innerHTML = listini.map(listino => `
            <tr class="hover:bg-secondary">
                <td class="font-medium text-primary">${app.formatDate(listino.date)}</td>
                <td class="text-primary">${listino.variazione || '-'}</td>
                <td class="font-bold text-success">${app.formatCurrency(listino.benzina, true)}</td>
                <td class="font-bold text-warning">${app.formatCurrency(listino.gasolio, true)}</td>
                <td class="font-bold text-danger">${listino.dieselPlus ? app.formatCurrency(listino.dieselPlus, true) : '-'}</td>
                <td class="font-bold text-info">${listino.hvolution ? app.formatCurrency(listino.hvolution, true) : '-'}</td>
                <td class="font-bold text-info">${listino.adblue ? app.formatCurrency(listino.adblue, true) : '-'}</td>
                <td class="text-right">
                    <div class="flex items-center justify-end space-x-2">
                        <button class="btn btn-warning btn-sm" onclick="editListinoById('${listino.id}')" title="Modifica listino"><i data-lucide="edit"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="deleteListinoById('${listino.id}')" title="Elimina listino"><i data-lucide="trash-2"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    this.refreshIcons();
}
// Fine funzione renderListiniTable

// Inizio funzione renderConcorrenzaCard
function renderConcorrenzaCard() {
    const app = this;
    const myPrices = latestAppliedPrices.call(app);
    const competitorPricesData = competitorPrices.call(app);
    const container = document.getElementById('concorrenza-card-content');
    if (!container) return;

    // Funzione locale per formattare la differenza di prezzo
    const formatDiff = (diff) => {
        const roundedDiff = Math.round(diff * 1000) / 1000;
        const colorClass = roundedDiff > 0 ? 'text-success' : roundedDiff < 0 ? 'text-danger' : 'text-secondary';
        const sign = roundedDiff > 0 ? '+' : '';
        const text = `${sign}${app.formatCurrency(roundedDiff, true).replace('€', '').trim()}`;
        return `<div class="font-bold ${colorClass}">${text}</div>`;
    };

    const diffs = {
        myoil: {
            benzina: (competitorPricesData.myoil?.benzina || 0) - (myPrices.benzina || 0),
            gasolio: (competitorPricesData.myoil?.gasolio || 0) - (myPrices.gasolio || 0)
        },
        q8: {
            benzina: (competitorPricesData.q8?.benzina || 0) - (myPrices.benzina || 0),
            gasolio: (competitorPricesData.q8?.gasolio || 0) - (myPrices.gasolio || 0)
        },
        esso: {
            benzina: (competitorPricesData.esso?.benzina || 0) - (myPrices.benzina || 0),
            gasolio: (competitorPricesData.esso?.gasolio || 0) - (myPrices.gasolio || 0)
        }
    };

    container.innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-3 gap-4 text-sm">
                <div class="product-box" style="background-color: rgba(139, 92, 246, 0.05); border-color: rgba(139, 92, 246, 0.3);">
                    <h4 class="font-semibold mb-2 text-center" style="color: #8b5cf6;">MyOil</h4>
                    <div class="space-y-1 mt-2">
                        <div class="flex justify-between p-1"><span>Benzina</span><span class="font-bold">${app.formatCurrency(competitorPricesData.myoil?.benzina || 0, true)}</span></div>
                        <div class="flex justify-between p-1"><span>Gasolio</span><span class="font-bold">${app.formatCurrency(competitorPricesData.myoil?.gasolio || 0, true)}</span></div>
                    </div>
                </div>
                <div class="product-box" style="background-color: rgba(37, 99, 235, 0.05); border-color: rgba(37, 99, 235, 0.3);">
                    <h4 class="font-semibold mb-2 text-center" style="color: var(--color-primary);">Q8</h4>
                    <div class="space-y-1 mt-2">
                        <div class="flex justify-between p-1"><span>Benzina</span><span class="font-bold">${app.formatCurrency(competitorPricesData.q8?.benzina || 0, true)}</span></div>
                        <div class="flex justify-between p-1"><span>Gasolio</span><span class="font-bold">${app.formatCurrency(competitorPricesData.q8?.gasolio || 0, true)}</span></div>
                    </div>
                </div>
                <div class="product-box" style="background-color: rgba(220, 38, 38, 0.05); border-color: rgba(220, 38, 38, 0.3);">
                    <h4 class="font-semibold mb-2 text-center" style="color: var(--color-danger);">Esso</h4>
                    <div class="space-y-1 mt-2">
                        <div class="flex justify-between p-1"><span>Benzina</span><span class="font-bold">${app.formatCurrency(competitorPricesData.esso?.benzina || 0, true)}</span></div>
                        <div class="flex justify-between p-1"><span>Gasolio</span><span class="font-bold">${app.formatCurrency(competitorPricesData.esso?.gasolio || 0, true)}</span></div>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-4 text-sm">
                <div class="product-box text-center p-2">
                    <div class="text-xs">Benzina</div>
                    ${formatDiff(diffs.myoil.benzina)}
                    <div class="text-xs mt-1">Gasolio</div>
                    ${formatDiff(diffs.myoil.gasolio)}
                </div>
                <div class="product-box text-center p-2">
                    <div class="text-xs">Benzina</div>
                    ${formatDiff(diffs.q8.benzina)}
                    <div class="text-xs mt-1">Gasolio</div>
                    ${formatDiff(diffs.q8.gasolio)}
                </div>
                <div class="product-box text-center p-2">
                    <div class="text-xs">Benzina</div>
                    ${formatDiff(diffs.esso.benzina)}
                    <div class="text-xs mt-1">Gasolio</div>
                    ${formatDiff(diffs.esso.gasolio)}
                </div>
            </div>
        </div>
    `;
}
// Fine funzione renderConcorrenzaCard


// === FUNZIONI GLOBALI PER EVENTI ONCLICK ===
// Inizio funzione editListinoById
function editListinoById(listinoId) {
    const app = getApp();
    const listino = app.state.data.priceHistory.find(l => l.id === listinoId);
    if (listino) {
        showEditListino.call(app, listino);
    }
}
// Fine funzione editListinoById

// Inizio funzione deleteListinoById
function deleteListinoById(listinoId) {
    const app = getApp();
    deleteListino.call(app, listinoId);
}
// Fine funzione deleteListinoById

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initGestionePrezzi = initGestionePrezzi;
    window.renderPrezziSection = renderPrezziSection;
    window.editListinoById = editListinoById;
    window.deleteListinoById = deleteListinoById;
    window.prezziState = prezziState;
}
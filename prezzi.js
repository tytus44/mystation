// =============================================
// FILE: prezzi.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Gestione Prezzi (listini e concorrenza).
// =============================================

// === STATO LOCALE DEL MODULO PREZZI ===
let prezziState = {
    // Stato locale
    priceSort: { column: 'date', direction: 'desc' },
    editingListino: null,
    listinoForm: {
        date: '',
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
    
    renderPrezziListView.call(app, container);
    setupPrezziEventListeners.call(app);
    app.refreshIcons();
}
// Fine funzione renderPrezziSection

// === RENDER VISTA LISTA ===
// Inizio funzione renderPrezziListView
function renderPrezziListView(container) {
    const app = this;
    const latestPrices = latestAppliedPrices.call(app);
    
    // INIZIO MODIFICA: Rimossa etichetta "Iperself" e aggiunto prezzo "Servito". Corretta sintassi commenti.
    const servitoSurcharge = 0.220; // (0.015 + 0.210) - 0.005
    const servedPrices = {
        benzina: latestPrices.benzina > 0 ? latestPrices.benzina + servitoSurcharge : 0,
        gasolio: latestPrices.gasolio > 0 ? latestPrices.gasolio + servitoSurcharge : 0,
        dieselPlus: latestPrices.dieselPlus > 0 ? latestPrices.dieselPlus + servitoSurcharge : 0,
        hvolution: latestPrices.hvolution > 0 ? latestPrices.hvolution + servitoSurcharge : 0,
    };
    
    container.innerHTML = `
        <div class="space-y-6">
            
            <div class="grid grid-cols-2 gap-6">
                
                <div class="grid grid-cols-2 gap-6">
                    <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                    <div class="stat-card" style="background-color: rgba(16, 185, 129, 0.18); border-color: rgba(16, 185, 129, 0.65);">
                        <div class="stat-content">
                            <div class="stat-label">Benzina</div>
                            <div class="stat-value text-success">${app.formatCurrency(latestPrices.benzina, true)}</div>
                            <div class="text-xs text-secondary" style="margin-top: 0.25rem;">Servito: ${app.formatCurrency(servedPrices.benzina, true)}</div>
                        </div>
                        <div class="stat-icon green"><i data-lucide="droplets"></i></div>
                    </div>
                    
                    <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                    <div class="stat-card" style="background-color: rgba(245, 158, 11, 0.18); border-color: rgba(245, 158, 11, 0.65);">
                        <div class="stat-content">
                            <div class="stat-label">Gasolio</div>
                            <div class="stat-value text-warning">${app.formatCurrency(latestPrices.gasolio, true)}</div>
                            <div class="text-xs text-secondary" style="margin-top: 0.25rem;">Servito: ${app.formatCurrency(servedPrices.gasolio, true)}</div>
                        </div>
                        <div class="stat-icon yellow"><i data-lucide="droplets"></i></div>
                    </div>

                    <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                    <div class="stat-card" style="background-color: rgba(255, 32, 78, 0.18); border-color: rgba(255, 32, 78, 0.65);">
                        <div class="stat-content">
                            <div class="stat-label">Diesel+</div>
                            <div class="stat-value text-danger">${app.formatCurrency(latestPrices.dieselPlus, true)}</div>
                            ${latestPrices.dieselPlus > 0 ? `<div class="text-xs text-secondary" style="margin-top: 0.25rem;">Servito: ${app.formatCurrency(servedPrices.dieselPlus, true)}</div>` : ''}
                        </div>
                        <div class="stat-icon red"><i data-lucide="droplets"></i></div>
                    </div>
                    
                    <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                    <!-- MODIFICA TONALITÀ: Ciano più scuro (8, 145, 178) per maggiore leggibilità -->
                    <!-- MODIFICA TESTO: Colore testo scurito per migliore contrasto -->
                    <!-- MODIFICA ICONA: Colore icona e sfondo circolare in ciano per coerenza -->
                    <div class="stat-card" style="background-color: rgba(8, 145, 178, 0.18); border-color: rgba(8, 145, 178, 0.65);">
                        <div class="stat-content">
                            <div class="stat-label">Hvolution</div>
            <div class="stat-value" style="color: rgb(8, 145, 178);">${app.formatCurrency(latestPrices.hvolution, true)}</div>
                            ${latestPrices.hvolution > 0 ? `<div class="text-xs text-secondary" style="margin-top: 0.25rem;">Servito: ${app.formatCurrency(servedPrices.hvolution, true)}</div>` : ''}
                        </div>
                        <div class="stat-icon" style="background-color: rgba(8, 145, 178, 0.25); color: rgb(8, 145, 178); border-color: rgb(8, 145, 178);"><i data-lucide="droplets"></i></div>
                    </div>
                    <!-- FINE MODIFICA COLORI -->
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
                        <i data-lucide="tag"></i> Nuovo Listino
                    </button>
                </div>
                <div class="table-container">
                    <table class="table" id="listini-table">
                        <thead>
                            <tr>
                                <th><button class="flex items-center" data-sort="date">Data <i data-lucide="arrow-up-down" class="w-3 h-3 ml-1.5"></i></button></th>
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
    // FINE MODIFICA
    
    renderListiniTable.call(app);
    renderConcorrenzaCard.call(app);
}
// Fine funzione renderPrezziListView

// Inizio funzione getListinoFormHTML
function getListinoFormHTML() {
    const app = getApp();
    const isEdit = !!prezziState.editingListino;
    const title = isEdit ? 'Modifica Listino' : 'Nuovo Listino';
    
    // Pre-compila con prezzi attuali se non è in modifica
    if (!isEdit) {
        const currentPricesData = currentPrices.call(app);
        prezziState.listinoForm.benzina = currentPricesData.benzina || '';
        prezziState.listinoForm.gasolio = currentPricesData.gasolio || '';
        prezziState.listinoForm.dieselPlus = currentPricesData.dieselPlus || '';
        prezziState.listinoForm.hvolution = currentPricesData.hvolution || '';
        prezziState.listinoForm.adblue = currentPricesData.adblue || '';
    }
    
    // INIZIO MODIFICA: Rimossa label "Data" e pre-compilati i prezzi attuali
    // MODIFICA LAYOUT: Modale più compatto con grid 3 colonne come concorrenza
    return `
        <div class="card-header">
            <h2 class="card-title">${title}</h2>
        </div>
        <div class="card-body" style="padding: 1rem;">
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div class="form-group" style="margin-bottom: 0;">
                    <input type="text" id="listino-date" class="form-control" placeholder="Data (gg.mm.aaaa)" value="${prezziState.listinoForm.date}" autocomplete="off">
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                    <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                    <div class="product-box" style="background-color: rgba(16, 185, 129, 0.18); border-color: rgba(16, 185, 129, 0.65); padding: 0.75rem;">
                        <label class="form-label font-medium" style="color: var(--color-success); margin-bottom: 0.5rem;">Benzina</label>
                        <input type="number" step="0.001" id="listino-benzina" class="form-control" placeholder="1.000" value="${prezziState.listinoForm.benzina}" autocomplete="off">
                    </div>
                    <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                    <div class="product-box" style="background-color: rgba(245, 158, 11, 0.18); border-color: rgba(245, 158, 11, 0.65); padding: 0.75rem;">
                        <label class="form-label font-medium" style="color: var(--color-warning); margin-bottom: 0.5rem;">Gasolio</label>
                        <input type="number" step="0.001" id="listino-gasolio" class="form-control" placeholder="1.000" value="${prezziState.listinoForm.gasolio}" autocomplete="off">
                    </div>
                    <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                    <div class="product-box" style="background-color: rgba(255, 32, 78, 0.18); border-color: rgba(255, 32, 78, 0.65); padding: 0.75rem;">
                        <label class="form-label font-medium" style="color: var(--color-danger); margin-bottom: 0.5rem;">Diesel+</label>
                        <input type="number" step="0.001" id="listino-dieselPlus" class="form-control" placeholder="1.000" value="${prezziState.listinoForm.dieselPlus}" autocomplete="off">
                    </div>
                    <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                    <!-- MODIFICA TONALITÀ: Ciano uniformato a (8, 145, 178) come nelle stat-card -->
                    <!-- MODIFICA TESTO: Colore label uguale all'icona della stat-card -->
                    <div class="product-box" style="background-color: rgba(8, 145, 178, 0.18); border-color: rgba(8, 145, 178, 0.65); padding: 0.75rem;">
                        <label class="form-label font-medium" style="color: rgb(8, 145, 178); margin-bottom: 0.5rem;">Hvolution</label>
                        <input type="number" step="0.001" id="listino-hvolution" class="form-control" placeholder="1.000" value="${prezziState.listinoForm.hvolution}" autocomplete="off">
                    </div>
                    <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                    <div class="product-box" style="background-color: rgba(107, 114, 128, 0.18); border-color: rgba(107, 114, 128, 0.65); padding: 0.75rem;">
                        <label class="form-label font-medium" style="color: var(--color-secondary); margin-bottom: 0.5rem;">AdBlue</label>
                        <input type="number" step="0.001" id="listino-adblue" class="form-control" placeholder="1.000" value="${prezziState.listinoForm.adblue}" autocomplete="off">
                    </div>
                    <!-- FINE MODIFICA COLORI -->
                </div>

                <div class="flex items-center justify-end space-x-4" style="margin-top: 0.5rem;">
                    <button id="cancel-listino-btn-bottom" class="btn btn-secondary">Annulla</button>
                    <button id="save-listino-btn" class="btn btn-primary">Salva Listino</button>
                </div>
            </div>
        </div>
    `;
    // FINE MODIFICA
}
// Fine funzione getListinoFormHTML

// Inizio funzione getConcorrenzaFormHTML
function getConcorrenzaFormHTML() {
    const app = getApp();
    
    // Pre-compila con prezzi concorrenza attuali
    const currentCompetitorPrices = competitorPrices.call(app);
    if (!prezziState.concorrenzaForm.myoil.benzina) {
        prezziState.concorrenzaForm.myoil.benzina = currentCompetitorPrices.myoil?.benzina || '';
        prezziState.concorrenzaForm.myoil.gasolio = currentCompetitorPrices.myoil?.gasolio || '';
        prezziState.concorrenzaForm.esso.benzina = currentCompetitorPrices.esso?.benzina || '';
        prezziState.concorrenzaForm.esso.gasolio = currentCompetitorPrices.esso?.gasolio || '';
        prezziState.concorrenzaForm.q8.benzina = currentCompetitorPrices.q8?.benzina || '';
        prezziState.concorrenzaForm.q8.gasolio = currentCompetitorPrices.q8?.gasolio || '';
    }
    
    // INIZIO MODIFICA: Rimossa label "Data" e pre-compilati i prezzi concorrenza attuali
    // MODIFICA LAYOUT: Gap ridotto per modale più compatto
    return `
        <div class="card-header">
            <h2 class="card-title">Aggiorna Prezzi Concorrenza</h2>
        </div>
        <div class="card-body">
            <div class="space-y-6">
                <div class="form-group max-w-sm">
                    <input type="text" id="concorrenza-date" class="form-control" placeholder="Data (gg.mm.aaaa)" value="${prezziState.concorrenzaForm.date}" autocomplete="off">
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                    <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                    <div class="product-box" style="background-color: rgba(139, 92, 246, 0.18); border-color: rgba(139, 92, 246, 0.65);">
                        <h4 class="product-title text-center" style="color: #8b5cf6">MyOil</h4>
                        <div class="form-group"><label class="form-label text-xs">Benzina</label><input type="number" step="0.001" id="myoil-benzina" class="form-control" value="${prezziState.concorrenzaForm.myoil.benzina}" autocomplete="off"></div>
                        <div class="form-group"><label class="form-label text-xs">Gasolio</label><input type="number" step="0.001" id="myoil-gasolio" class="form-control" value="${prezziState.concorrenzaForm.myoil.gasolio}" autocomplete="off"></div>
                    </div>

                    <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                    <div class="product-box" style="background-color: rgba(255, 32, 78, 0.18); border-color: rgba(255, 32, 78, 0.65);">
                        <h4 class="product-title text-center" style="color: var(--color-danger)">Esso</h4>
                        <div class="form-group"><label class="form-label text-xs">Benzina</label><input type="number" step="0.001" id="esso-benzina" class="form-control" value="${prezziState.concorrenzaForm.esso.benzina}" autocomplete="off"></div>
                        <div class="form-group"><label class="form-label text-xs">Gasolio</label><input type="number" step="0.001" id="esso-gasolio" class="form-control" value="${prezziState.concorrenzaForm.esso.gasolio}" autocomplete="off"></div>
                    </div>

                    <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                    <!-- MODIFICA Q8: Colore cambiato da blu a ciano Hvolution con testo uguale all'icona -->
                    <div class="product-box" style="background-color: rgba(8, 145, 178, 0.18); border-color: rgba(8, 145, 178, 0.65);">
                        <h4 class="product-title text-center" style="color: rgb(8, 145, 178)">Q8</h4>
                        <div class="form-group"><label class="form-label text-xs">Benzina</label><input type="number" step="0.001" id="q8-benzina" class="form-control" value="${prezziState.concorrenzaForm.q8.benzina}" autocomplete="off"></div>
                        <div class="form-group"><label class="form-label text-xs">Gasolio</label><input type="number" step="0.001" id="q8-gasolio" class="form-control" value="${prezziState.concorrenzaForm.q8.gasolio}" autocomplete="off"></div>
                    </div>
                    <!-- FINE MODIFICA COLORI -->
                </div>

                <div class="flex items-center justify-end space-x-4">
                    <button id="cancel-concorrenza-btn-bottom" class="btn btn-secondary">Annulla</button>
                    <button id="save-concorrenza-btn" class="btn btn-primary">Salva Prezzi</button>
                </div>
            </div>
        </div>
    `;
    // FINE MODIFICA
}
// Fine funzione getConcorrenzaFormHTML

// === SETUP EVENT LISTENERS ===
// Inizio funzione setupPrezziEventListeners
function setupPrezziEventListeners() {
    const app = this;
    
    // Pulsante Nuovo Listino
    const newListinoBtn = document.getElementById('new-listino-btn');
    if (newListinoBtn) {
        newListinoBtn.addEventListener('click', () => showCreateListino.call(app));
    }
    
    // Pulsante Aggiorna Concorrenza
    const updateConcorrenzaBtn = document.getElementById('update-concorrenza-btn');
    if (updateConcorrenzaBtn) {
        updateConcorrenzaBtn.addEventListener('click', () => showUpdateConcorrenza.call(app));
    }
    
    // Ordinamento tabella
    document.querySelectorAll('#listini-table th button[data-sort]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const column = e.currentTarget.getAttribute('data-sort');
            sortPrices.call(app, column);
        });
    });
}
// Fine funzione setupPrezziEventListeners

// Inizio funzione setupListinoFormEventListeners
function setupListinoFormEventListeners() {
    const app = this;
    
    // Input data
    const dateInput = document.getElementById('listino-date');
    if (dateInput) {
        dateInput.addEventListener('input', (e) => {
            prezziState.listinoForm.date = e.target.value;
        });
        dateInput.focus();
    }
    
    // Input prezzi prodotti
    ['benzina', 'gasolio', 'dieselPlus', 'hvolution', 'adblue'].forEach(product => {
        const input = document.getElementById(`listino-${product}`);
        if (input) {
            input.addEventListener('input', (e) => {
                prezziState.listinoForm[product] = e.target.value;
            });
        }
    });
    
    // Pulsante Salva
    const saveBtn = document.getElementById('save-listino-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => saveListino.call(app));
    }
    
    // Pulsanti Annulla
    const cancelBtnBottom = document.getElementById('cancel-listino-btn-bottom');
    if (cancelBtnBottom) {
        cancelBtnBottom.addEventListener('click', () => app.hideFormModal());
    }
}
// Fine funzione setupListinoFormEventListeners

// Inizio funzione setupConcorrenzaFormEventListeners
function setupConcorrenzaFormEventListeners() {
    const app = this;
    
    // Input data
    const dateInput = document.getElementById('concorrenza-date');
    if (dateInput) {
        dateInput.addEventListener('input', (e) => {
            prezziState.concorrenzaForm.date = e.target.value;
        });
        dateInput.focus();
    }
    
    // Input prezzi concorrenza
    const fields = [
        'myoil.benzina', 'myoil.gasolio',
        'esso.benzina', 'esso.gasolio',
        'q8.benzina', 'q8.gasolio'
    ];
    
    fields.forEach(path => {
        const id = path.replace('.', '-');
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', () => updateConcorrenzaFormValue(path, input.value));
    });
    
    // Pulsante Salva
    const saveBtn = document.getElementById('save-concorrenza-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => saveConcorrenza.call(app));
    }
    
    // Pulsanti Annulla
    const cancelBtnBottom = document.getElementById('cancel-concorrenza-btn-bottom');
    if (cancelBtnBottom) {
        cancelBtnBottom.addEventListener('click', () => app.hideFormModal());
    }
}
// Fine funzione setupConcorrenzaFormEventListeners

// Inizio funzione showCreateListino
function showCreateListino() {
    const app = this;
    prezziState.editingListino = null;
    // MODIFICA: Non resetta il form qui, lo fa getListinoFormHTML con i prezzi attuali
    prezziState.listinoForm.date = app.formatToItalianDate(new Date().toISOString());
    
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getListinoFormHTML();
    // MODIFICA: Rimosso modal-wide per modale più compatto
    modalContentEl.classList.remove('modal-wide');
    
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
        benzina: listino.benzina || '', 
        gasolio: listino.gasolio || '',
        dieselPlus: listino.dieselPlus || '', 
        hvolution: listino.hvolution || '',
        adblue: listino.adblue || ''
    };
    
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getListinoFormHTML();
    // MODIFICA: Rimosso modal-wide per modale più compatto
    modalContentEl.classList.remove('modal-wide');
    
    setupListinoFormEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showEditListino

// Inizio funzione showUpdateConcorrenza
function showUpdateConcorrenza() {
    const app = this;
    // MODIFICA: Non resetta il form qui, lo fa getConcorrenzaFormHTML con i prezzi concorrenza attuali
    prezziState.concorrenzaForm.date = app.formatToItalianDate(new Date().toISOString());
    
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getConcorrenzaFormHTML();
    // MODIFICA: Rimosso modal-wide per modale più compatto
    modalContentEl.classList.remove('modal-wide');
    
    setupConcorrenzaFormEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showUpdateConcorrenza

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
        dieselPlus: prices.dieselPlus ? (prices.dieselPlus + surcharge) : 0,
        hvolution: prices.hvolution ? (prices.hvolution + surcharge) : 0,
        adblue: prices.adblue ? (prices.adblue + surcharge) : 0
    };
}
// Fine funzione latestAppliedPrices

// Inizio funzione currentPrices
function currentPrices() {
    const listini = this.state.data.priceHistory;
    if (!listini || listini.length === 0) {
        return { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0, adblue: 0 };
    }
    const sorted = [...listini].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0];
}
// Fine funzione currentPrices

// Inizio funzione competitorPrices
function competitorPrices() {
    const concorrenza = this.state.data.competitorPrices;
    if (!concorrenza || concorrenza.length === 0) {
        return { myoil: { benzina: 0, gasolio: 0 }, esso: { benzina: 0, gasolio: 0 }, q8: { benzina: 0, gasolio: 0 } };
    }
    const sorted = [...concorrenza].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0];
}
// Fine funzione competitorPrices

// Inizio funzione resetListinoForm
function resetListinoForm() {
    prezziState.listinoForm = {
        date: this.formatToItalianDate(new Date().toISOString()),
        benzina: '',
        gasolio: '',
        dieselPlus: '',
        hvolution: '',
        adblue: ''
    };
}
// Fine funzione resetListinoForm

// Inizio funzione resetConcorrenzaForm
function resetConcorrenzaForm() {
    prezziState.concorrenzaForm = {
        date: this.formatToItalianDate(new Date().toISOString()),
        myoil: { benzina: '', gasolio: '' },
        esso: { benzina: '', gasolio: '' },
        q8: { benzina: '', gasolio: '' }
    };
}
// Fine funzione resetConcorrenzaForm

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
    const app = getApp();
    if (!prezziState.listinoForm.date || !prezziState.listinoForm.benzina || !prezziState.listinoForm.gasolio) {
        return app.showNotification('Data, prezzo benzina e gasolio sono obbligatori');
    }
    if (!app.validateItalianDate(prezziState.listinoForm.date)) {
        return app.showNotification('Formato data non valido. Usa gg.mm.aaaa');
    }
    const parsedDate = app.parseItalianDate(prezziState.listinoForm.date);
    const listino = {
        id: prezziState.editingListino ? prezziState.editingListino.id : app.generateUniqueId('listino'),
        date: parsedDate.toISOString(),
        benzina: parseFloat(prezziState.listinoForm.benzina) || 0,
        gasolio: parseFloat(prezziState.listinoForm.gasolio) || 0,
        dieselPlus: parseFloat(prezziState.listinoForm.dieselPlus) || null,
        hvolution: parseFloat(prezziState.listinoForm.hvolution) || null,
        adblue: parseFloat(prezziState.listinoForm.adblue) || null
    };
    if (prezziState.editingListino) {
        const index = app.state.data.priceHistory.findIndex(l => l.id === prezziState.editingListino.id);
        if (index !== -1) app.state.data.priceHistory[index] = listino;
    } else {
        app.state.data.priceHistory.push(listino);
    }
    app.saveToStorage('data', app.state.data);
    app.hideFormModal();
    renderPrezziListView.call(app, document.getElementById('section-prezzi'));
}
// Fine funzione saveListino

// Inizio funzione saveConcorrenza
function saveConcorrenza() {
    const app = getApp();
    if (!prezziState.concorrenzaForm.date || !app.validateItalianDate(prezziState.concorrenzaForm.date)) {
        return app.showNotification('Data obbligatoria in formato gg.mm.aaaa');
    }
    const parsedDate = app.parseItalianDate(prezziState.concorrenzaForm.date);
    const concorrenza = {
        id: app.generateUniqueId('concorrenza'),
        date: parsedDate.toISOString(),
        myoil: { benzina: parseFloat(prezziState.concorrenzaForm.myoil.benzina) || null, gasolio: parseFloat(prezziState.concorrenzaForm.myoil.gasolio) || null },
        esso: { benzina: parseFloat(prezziState.concorrenzaForm.esso.benzina) || null, gasolio: parseFloat(prezziState.concorrenzaForm.esso.gasolio) || null },
        q8: { benzina: parseFloat(prezziState.concorrenzaForm.q8.benzina) || null, gasolio: parseFloat(prezziState.concorrenzaForm.q8.gasolio) || null }
    };
    app.state.data.competitorPrices.push(concorrenza);
    app.saveToStorage('data', app.state.data);
    app.hideFormModal();
    renderConcorrenzaCard.call(app);
}
// Fine funzione saveConcorrenza

// Inizio funzione deleteListino
function deleteListino(listinoId) {
    const app = getApp();
    const listino = app.state.data.priceHistory.find(l => l.id === listinoId);
    if (!listino) return;
    app.showConfirm(`Sei sicuro di voler eliminare il listino del ${app.formatDate(listino.date)}?`, () => {
        app.state.data.priceHistory = app.state.data.priceHistory.filter(l => l.id !== listinoId);
        app.saveToStorage('data', app.state.data);
        renderPrezziListView.call(app, document.getElementById('section-prezzi'));
    });
}
// Fine funzione deleteListino

// Inizio funzione renderListiniTable
function renderListiniTable() {
    const tbody = document.getElementById('listini-tbody');
    if (!tbody) return;
    const app = this;
    const listini = sortedPriceHistory.call(app);
    if (listini.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-12"><div class="empty-state"><i data-lucide="euro"></i><div class="empty-state-title">Nessun listino trovato</div></div></td></tr>`;
    } else {
        tbody.innerHTML = listini.map(listino => `
            <tr class="hover:bg-secondary">
                <td class="font-medium text-primary">${app.formatDate(listino.date)}</td>
                <td class="font-bold text-success">${app.formatCurrency(listino.benzina, true)}</td>
                <td class="font-bold text-warning">${app.formatCurrency(listino.gasolio, true)}</td>
                <td class="font-bold text-danger">${listino.dieselPlus ? app.formatCurrency(listino.dieselPlus, true) : '-'}</td>
                <td class="font-bold text-info">${listino.hvolution ? app.formatCurrency(listino.hvolution, true) : '-'}</td>
                <td class="font-bold text-info">${listino.adblue ? app.formatCurrency(listino.adblue, true) : '-'}</td>
                <td class="text-right">
                    <div class="flex items-center justify-end space-x-2">
                        <button class="btn btn-success btn-sm" onclick="editListinoById('${listino.id}')" title="Modifica listino"><i data-lucide="edit"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="deleteListinoById('${listino.id}')" title="Elimina listino"><i data-lucide="trash-2"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    this.refreshIcons();
}
// Fine funzione renderListiniTable

// === RENDER CARD CONCORRENZA ===
// Inizio funzione renderConcorrenzaCard
function renderConcorrenzaCard() {
    const app = this;
    const myPrices = latestAppliedPrices.call(app);
    const competitorPricesData = competitorPrices.call(app);
    const container = document.getElementById('concorrenza-card-content');
    if (!container) return;
    const formatDiff = (diff) => {
        const roundedDiff = Math.round(diff * 1000) / 1000;
        const colorClass = roundedDiff < 0 ? 'text-success' : roundedDiff > 0 ? 'text-danger' : 'text-secondary';
        const sign = roundedDiff >= 0 ? '+' : '';
        const text = `${sign}${app.formatCurrency(roundedDiff, true)}`.replace('€', '').trim();
        return `<div class="font-bold ${colorClass}">${text}</div>`;
    };
    const diffs = {
        myoil: { benzina: (competitorPricesData.myoil?.benzina || 0) - (myPrices.benzina || 0), gasolio: (competitorPricesData.myoil?.gasolio || 0) - (myPrices.gasolio || 0) },
        q8: { benzina: (competitorPricesData.q8?.benzina || 0) - (myPrices.benzina || 0), gasolio: (competitorPricesData.q8?.gasolio || 0) - (myPrices.gasolio || 0) },
        esso: { benzina: (competitorPricesData.esso?.benzina || 0) - (myPrices.benzina || 0), gasolio: (competitorPricesData.esso?.gasolio || 0) - (myPrices.gasolio || 0) }
    };
    container.innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-3 gap-4 text-sm">
                <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                <div class="product-box" style="background-color: rgba(139, 92, 246, 0.18); border-color: rgba(139, 92, 246, 0.65);">
                    <h4 class="font-semibold mb-2 text-center" style="color: #8b5cf6">MyOil</h4>
                    <div class="space-y-1 mt-2">
                        <div class="flex justify-between p-1"><span>Benzina</span><span class="font-bold">${app.formatCurrency(competitorPricesData.myoil?.benzina || 0, true)}</span></div>
                        <div class="flex justify-between p-1"><span>Gasolio</span><span class="font-bold">${app.formatCurrency(competitorPricesData.myoil?.gasolio || 0, true)}</span></div>
                    </div>
                </div>
                <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                <div class="product-box" style="background-color: rgba(255, 32, 78, 0.18); border-color: rgba(255, 32, 78, 0.65);">
                    <h4 class="font-semibold mb-2 text-center" style="color: var(--color-danger)">Esso</h4>
                    <div class="space-y-1 mt-2">
                        <div class="flex justify-between p-1"><span>Benzina</span><span class="font-bold">${app.formatCurrency(competitorPricesData.esso?.benzina || 0, true)}</span></div>
                        <div class="flex justify-between p-1"><span>Gasolio</span><span class="font-bold">${app.formatCurrency(competitorPricesData.esso?.gasolio || 0, true)}</span></div>
                    </div>
                </div>
                <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                <!-- MODIFICA Q8: Colore cambiato da blu a ciano Hvolution con testo uguale all'icona -->
                <div class="product-box" style="background-color: rgba(8, 145, 178, 0.18); border-color: rgba(8, 145, 178, 0.65);">
                    <h4 class="font-semibold mb-2 text-center" style="color: rgb(8, 145, 178)">Q8</h4>
                    <div class="space-y-1 mt-2">
                        <div class="flex justify-between p-1"><span>Benzina</span><span class="font-bold">${app.formatCurrency(competitorPricesData.q8?.benzina || 0, true)}</span></div>
                        <div class="flex justify-between p-1"><span>Gasolio</span><span class="font-bold">${app.formatCurrency(competitorPricesData.q8?.gasolio || 0, true)}</span></div>
                    </div>
                </div>
                <!-- FINE MODIFICA COLORI -->
            </div>
            <div class="grid grid-cols-3 gap-4 text-sm">
                <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                <div class="product-box text-center p-2" style="background-color: rgba(139, 92, 246, 0.18); border-color: rgba(139, 92, 246, 0.65);">
                    <div class="text-xs">Benzina</div>${formatDiff(diffs.myoil.benzina)}<div class="text-xs mt-1">Gasolio</div>${formatDiff(diffs.myoil.gasolio)}
                </div>
                <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                <div class="product-box text-center p-2" style="background-color: rgba(255, 32, 78, 0.18); border-color: rgba(255, 32, 78, 0.65);">
                    <div class="text-xs">Benzina</div>${formatDiff(diffs.esso.benzina)}<div class="text-xs mt-1">Gasolio</div>${formatDiff(diffs.esso.gasolio)}
                </div>
                <!-- MODIFICA COLORI: Background da 0.05 a 0.18 e border da 0.3 a 0.65 -->
                <!-- MODIFICA Q8: Colore cambiato da blu a ciano Hvolution -->
                <div class="product-box text-center p-2" style="background-color: rgba(8, 145, 178, 0.18); border-color: rgba(8, 145, 178, 0.65);">
                    <div class="text-xs">Benzina</div>${formatDiff(diffs.q8.benzina)}<div class="text-xs mt-1">Gasolio</div>${formatDiff(diffs.q8.gasolio)}
                </div>
                <!-- FINE MODIFICA COLORI -->
            </div>
        </div>
    `;
}
// Fine funzione renderConcorrenzaCard

// Inizio funzione showSkeletonLoader
function showSkeletonLoader(container) {
    const skeletonHTML = `<div class="space-y-6"><div class="grid grid-cols-2 gap-6"><div class="grid grid-cols-2 gap-6"><div class="stat-card"><div class="skeleton-loader" style="height: 3.5rem; width: 100%"></div></div><div class="stat-card"><div class="skeleton-loader" style="height: 3.5rem; width: 100%"></div></div></div><div class="stat-card"><div class="skeleton-loader" style="height: 3.5rem; width: 100%"></div></div><div class="stat-card"><div class="skeleton-loader" style="height: 3.5rem; width: 100%"></div></div></div><div class="card"><div class="card-header"><div class="skeleton-loader" style="height: 1.5rem; width: 200px"></div></div><div class="p-6 space-y-2"><div class="skeleton-loader" style="height: 5rem; width: 100%"></div><div class="skeleton-loader" style="height: 3rem; width: 100%"></div></div></div><div class="card"><div class="card-header" style="justify-content: space-between; align-items: center;"><div class="skeleton-loader" style="height: 1.5rem; width: 250px"></div><div class="skeleton-loader" style="height: 2.5rem; width: 150px; border-radius: var(--radius-md)"></div></div><div class="p-6 space-y-2"><div class="skeleton-loader" style="height: 2.5rem; width: 100%"></div><div class="skeleton-loader" style="height: 2.5rem; width: 100%"></div><div class="skeleton-loader" style="height: 2.5rem; width: 100%"></div></div></div></div>`;
    container.innerHTML = skeletonHTML;
}
// Fine funzione showSkeletonLoader

// === FUNZIONI GLOBALI PER EVENTI ONCLICK ===
function editListinoById(listinoId) {
    const app = getApp();
    const listino = app.state.data.priceHistory.find(l => l.id === listinoId);
    if (listino) showEditListino.call(app, listino);
}
function deleteListinoById(listinoId) {
    const app = getApp();
    deleteListino.call(app, listinoId);
}

// EXPORT FUNCTIONS FOR GLOBAL ACCESS
if (typeof window !== 'undefined') {
    window.initGestionePrezzi = initGestionePrezzi;
    window.renderPrezziSection = renderPrezziSection;
    window.editListinoById = editListinoById;
    window.deleteListinoById = deleteListinoById;
    window.prezziState = prezziState;
}
// =============================================
// FILE: virtual.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione VirtualStation (turni, statistiche, grafici).
// --- RIFATTORIZZATO COMPLETAMENTE PER USARE I MODALI ---
// =============================================

// === STATO LOCALE DEL MODULO VIRTUAL ===
let virtualState = {
    // Il virtualViewMode non è più necessario qui, la vista è sempre 'list'
    virtualFilters: { mode: 'today' }, 
    virtualSort: { column: 'date', direction: 'desc' },
    editingTurno: null,
    turnoForm: { 
        date: '', 
        turno: 'Mattina', 
        iperself: { benzina: null, gasolio: null, dieselplus: null, hvolution: null },
        servito: { benzina: null, gasolio: null, dieselplus: null, hvolution: null, adblue: null }
    },
    chartsInitialized: false,
    updatingCharts: false,
    productsChartInstance: null,
    serviceChartInstance: null
};

// === INIZIALIZZAZIONE MODULO VIRTUAL ===
// Inizio funzione initVirtualStation
function initVirtualStation() {
    console.log('📺 Inizializzazione modulo VirtualStation...');
    // Durante l'init, usiamo 'this' perchè 'getApp()' non è ancora pronto.
    // 'this' è l'istanza dell'app passata da 'initializeModules'.
    virtualState.virtualFilters.mode = this.loadFromStorage('virtualFilterMode', 'today');
    resetTurnoForm.call(this); // Passiamo il contesto
    console.log('✅ Modulo VirtualStation inizializzato');
}
// Fine funzione initVirtualStation

// === RENDER SEZIONE VIRTUAL ===
// Ora questa funzione renderizza sempre e solo la vista principale (la lista).
// Inizio funzione renderVirtualSection
function renderVirtualSection(container) {
    console.log('🎨 Rendering sezione VirtualStation...');
    // *** CORREZIONE: Usiamo 'this' che è l'istanza MyStationApp passata da app.js ***
    const app = this;
    
    // *** CORREZIONE: Passiamo il contesto app alle funzioni ***
    renderVirtualListView.call(app, container);
    setupVirtualListViewEventListeners.call(app); // Collega solo gli eventi della lista.
    
    app.refreshIcons();
}
// Fine funzione renderVirtualSection

// === RENDER VISTA LISTA ===
// Questa funzione costruisce l'HTML della pagina principale.
// MODIFICA: Spostato pulsante "Nuovo Turno" dalla tabella alla sinistra del pulsante "Stampa Periodo"
// Inizio funzione renderVirtualListView
function renderVirtualListView(container) {
    // *** CORREZIONE: Usiamo 'this' invece di getApp() per coerenza ***
    const app = this;

    // CORREZIONE BUG GRAFICI: Distruggi le istanze dei grafici esistenti prima di ridisegnare l'HTML.
    // Questo previene che i grafici rimangano vuoti quando si rientra nella sezione.
    if (virtualState.productsChartInstance) {
        virtualState.productsChartInstance.destroy();
        virtualState.productsChartInstance = null;
    }
    if (virtualState.serviceChartInstance) {
        virtualState.serviceChartInstance.destroy();
        virtualState.serviceChartInstance = null;
    }
    virtualState.chartsInitialized = false; // Forza la re-inizializzazione

    const stats = virtualStats.call(app);
    
    container.innerHTML = `
        <div class="space-y-6">
            <div class="filters-bar no-print">
                <div class="filter-group"><div class="btn-group">
                    <button class="btn ${virtualState.virtualFilters.mode === 'today' ? 'btn-primary active' : 'btn-secondary'}" data-filter-mode="today">Oggi</button>
                    <button class="btn ${virtualState.virtualFilters.mode === 'month' ? 'btn-primary active' : 'btn-secondary'}" data-filter-mode="month">Ultimo Mese</button>
                    <button class="btn ${virtualState.virtualFilters.mode === 'quarter' ? 'btn-primary active' : 'btn-secondary'}" data-filter-mode="quarter">Ultimo Trimestre</button>
                    <button class="btn ${virtualState.virtualFilters.mode === 'semester' ? 'btn-primary active' : 'btn-secondary'}" data-filter-mode="semester">Ultimo Semestre</button>
                    <button class="btn ${virtualState.virtualFilters.mode === 'year' ? 'btn-primary active' : 'btn-secondary'}" data-filter-mode="year">Ultimo Anno</button>
                </div></div>
                <div style="display: flex; gap: 0.5rem;">
                    <button id="new-turno-btn" class="btn btn-primary">
                        <i data-lucide="plus-circle"></i> Nuovo Turno
                    </button>
                    <button id="print-virtual-btn" class="btn btn-secondary">
                        <i data-lucide="printer"></i> Stampa Periodo
                    </button>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Litri Venduti</div>
                        <div id="stat-litri" class="stat-value">${app.formatInteger(stats.totalLiters)}</div>
                    </div>
                    <div class="stat-icon blue"><i data-lucide="fuel"></i></div>
                </div>
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Fatturato Stimato</div>
                        <div id="stat-fatturato" class="stat-value">${app.formatCurrency(stats.revenue)}</div>
                    </div>
                    <div class="stat-icon green"><i data-lucide="euro"></i></div>
                </div>
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">% Servito</div>
                        <div id="stat-servito" class="stat-value">${stats.servitoPercentage}%</div>
                    </div>
                    <div class="stat-icon purple"><i data-lucide="user-check"></i></div>
                </div>
            </div>
            
            <div class="grid grid-cols-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Vendite per Prodotto</h3>
                    </div>
                    <div class="card-body">
                        <canvas id="productsChart" width="400" height="300"></canvas>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Iperself vs Servito</h3>
                    </div>
                    <div class="card-body">
                        <canvas id="serviceChart" width="400" height="300"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="card no-print">
                <div class="card-header" style="padding: 1rem 1.5rem;">
                <h2 class="card-title">Storico Turni</h2>
                </div>
                <div class="table-container"><table class="table" id="turni-table">
                    <thead><tr>
                        <th><button data-sort="date">Data <i data-lucide="arrow-up-down"></i></button></th>
                        <th>Turno</th><th>Benzina</th><th>Gasolio</th><th>Diesel+</th><th>Hvolution</th><th>AdBlue</th>
                        <th><button data-sort="total">Totale <i data-lucide="arrow-up-down"></i></button></th>
                        <th class="text-right">Azioni</th>
                    </tr></thead>
                    <tbody id="turni-tbody"></tbody>
                </table></div>
            </div>
        </div>
    `;
    
    // *** CORREZIONE: Passiamo il contesto alle funzioni ***
    renderTurniTable.call(app);
}
// Fine funzione renderVirtualListView

// === CORREZIONE: NUOVA FUNZIONE PER L'HTML DEL FORM SENZA COLONNA NOTE ===
// Questa funzione non renderizza nulla, ma restituisce solo la stringa HTML del form.
// Inizio funzione getVirtualFormHTML
function getVirtualFormHTML() {
    const isEdit = !!virtualState.editingTurno;
    const title = isEdit ? 'Modifica Turno' : 'Nuovo Turno';
    
    return `
        <div class="card-header">
            <h2 class="card-title">${title}</h2>
            <button id="cancel-turno-btn" class="btn btn-secondary modal-close-btn">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div class="card-body">
            <div class="grid grid-cols-12 gap-4 items-end mb-4">
                <div class="col-span-3">
                    <div class="form-group mb-0">
                        <label class="form-label">Data</label>
                        <div class="input-group">
                            <i data-lucide="calendar" class="input-group-icon"></i>
                            <input type="text" id="turno-date" class="form-control" placeholder="gg.mm.aaaa" value="${virtualState.turnoForm.date}">
                        </div>
                    </div>
                </div>
                <div class="col-span-9">
                    <div class="form-group mb-0">
                        <label class="form-label">Tipo Turno</label>
                        <div class="btn-group w-full" role="group">
                            <button type="button" id="tab-Notte" class="btn ${virtualState.turnoForm.turno === 'Notte' ? 'btn-primary' : 'btn-secondary'} turno-tab" data-turno="Notte">Notte</button>
                            <button type="button" id="tab-Mattina" class="btn ${virtualState.turnoForm.turno === 'Mattina' ? 'btn-primary' : 'btn-secondary'} turno-tab" data-turno="Mattina">Mattina</button>
                            <button type="button" id="tab-Pranzo" class="btn ${virtualState.turnoForm.turno === 'Pranzo' ? 'btn-primary' : 'btn-secondary'} turno-tab" data-turno="Pranzo">Pranzo</button>
                            <button type="button" id="tab-Pomeriggio" class="btn ${virtualState.turnoForm.turno === 'Pomeriggio' ? 'btn-primary' : 'btn-secondary'} turno-tab" data-turno="Pomeriggio">Pomeriggio</button>
                            <button type="button" id="tab-Weekend" class="btn ${virtualState.turnoForm.turno === 'Weekend' ? 'btn-primary' : 'btn-secondary'} turno-tab" data-turno="Weekend">Weekend</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th style="width: 25%;">Prodotto</th>
                            <th style="width: 37.5%;">Iperself (L)</th>
                            <th style="width: 37.5%;">Servito (L)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="font-medium text-primary">Gasolio</td>
                            <td>
                                <input type="number" id="iperself-gasolio" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.iperself.gasolio || ''}">
                            </td>
                            <td>
                                <input type="number" id="servito-gasolio" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.servito.gasolio || ''}">
                            </td>
                        </tr>
                        <tr>
                            <td class="font-medium text-primary">Diesel+</td>
                            <td>
                                <input type="number" id="iperself-dieselplus" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.iperself.dieselplus || ''}">
                            </td>
                            <td>
                                <input type="number" id="servito-dieselplus" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.servito.dieselplus || ''}">
                            </td>
                        </tr>
                        <tr>
                            <td class="font-medium text-primary">AdBlue</td>
                            <td></td>
                            <td>
                                <input type="number" id="servito-adblue" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.servito.adblue || ''}">
                            </td>
                        </tr>
                        <tr>
                            <td class="font-medium text-primary">Benzina</td>
                            <td>
                                <input type="number" id="iperself-benzina" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.iperself.benzina || ''}">
                            </td>
                            <td>
                                <input type="number" id="servito-benzina" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.servito.benzina || ''}">
                            </td>
                        </tr>
                        <tr>
                            <td class="font-medium text-primary">Hvolution</td>
                            <td>
                                <input type="number" id="iperself-hvolution" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.iperself.hvolution || ''}">
                            </td>
                            <td>
                                <input type="number" id="servito-hvolution" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.servito.hvolution || ''}">
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="flex justify-end space-x-4 mt-4">
                <button id="cancel-turno-btn-bottom" class="btn btn-secondary">Annulla</button>
                <button id="save-turno-btn" class="btn btn-primary">Salva Turno</button>
            </div>
        </div>
    `;
}
// Fine funzione getVirtualFormHTML

// === SETUP EVENT LISTENERS VISTA LISTA ===
// Inizio funzione setupVirtualListViewEventListeners
function setupVirtualListViewEventListeners() {
    // *** CORREZIONE: Usiamo 'this' per il contesto ***
    const app = this;
    
    document.querySelectorAll('[data-filter-mode]').forEach(btn => 
        btn.addEventListener('click', () => setFilterMode.call(app, btn.getAttribute('data-filter-mode')))
    );
    document.getElementById('new-turno-btn')?.addEventListener('click', () => showCreateTurno());
    document.getElementById('print-virtual-btn')?.addEventListener('click', () => printVirtualReport.call(app));
    document.querySelectorAll('#turni-table [data-sort]').forEach(btn => 
        btn.addEventListener('click', () => sortVirtual.call(app, btn.getAttribute('data-sort')))
    );
}
// Fine funzione setupVirtualListViewEventListeners

// Inizio funzione setupVirtualFormEventListeners
function setupVirtualFormEventListeners() {
    const app = getApp();
    document.getElementById('save-turno-btn')?.addEventListener('click', () => saveTurno());
    document.getElementById('cancel-turno-btn')?.addEventListener('click', () => app.hideFormModal());
    document.getElementById('cancel-turno-btn-bottom')?.addEventListener('click', () => app.hideFormModal());

    // Event listeners per i campi input
    const inputs = [
        { id: 'turno-date', path: 'date' },
        { id: 'iperself-benzina', path: 'iperself.benzina' }, { id: 'iperself-gasolio', path: 'iperself.gasolio' },
        { id: 'iperself-dieselplus', path: 'iperself.dieselplus' }, { id: 'iperself-hvolution', path: 'iperself.hvolution' },
        { id: 'servito-benzina', path: 'servito.benzina' }, { id: 'servito-gasolio', path: 'servito.gasolio' },
        { id: 'servito-dieselplus', path: 'servito.dieselplus' }, { id: 'servito-hvolution', path: 'servito.hvolution' },
        { id: 'servito-adblue', path: 'servito.adblue' }
    ];
    inputs.forEach(({ id, path }) => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', () => updateTurnoFormValue(path, input.value));
    });
    
    // NUOVO: Event listeners per i tab dei tipi di turno
    document.querySelectorAll('.turno-tab').forEach(tabButton => {
        tabButton.addEventListener('click', (e) => {
            e.preventDefault();
            const turnoType = tabButton.getAttribute('data-turno');
            
            // Aggiorna lo stato del form
            updateTurnoFormValue('turno', turnoType);
            
            // Aggiorna lo stile dei tab (rimuovi active da tutti e aggiungi al corrente)
            document.querySelectorAll('.turno-tab').forEach(tab => {
                tab.classList.remove('btn-primary');
                tab.classList.add('btn-secondary');
            });
            tabButton.classList.remove('btn-secondary');
            tabButton.classList.add('btn-primary');
        });
    });
}
// Fine funzione setupVirtualFormEventListeners

// === GESTIONE MODALE (LOGICA CENTRALE DELLA MODIFICA) ===
// Inizio funzione showCreateTurno
function showCreateTurno() {
    const app = getApp();
    virtualState.editingTurno = null;
    resetTurnoForm.call(app); // Passiamo il contesto per usare getTodayFormatted()
    
    document.getElementById('form-modal-content').innerHTML = getVirtualFormHTML();
    
    // NUOVO: Applica la classe CSS per modale largo
    const modalContent = document.querySelector('#form-modal .modal-content');
    if (modalContent) {
        modalContent.classList.add('modal-wide');
    }
    
    setupVirtualFormEventListeners();
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showCreateTurno

// Inizio funzione showEditTurno
function showEditTurno(turno) {
    const app = getApp();
    virtualState.editingTurno = turno;
    virtualState.turnoForm = { 
        date: app.formatToItalianDate(turno.date), 
        turno: turno.turno || 'Mattina', 
        iperself: { ...(turno.iperself || {}) }, 
        servito: { ...(turno.servito || {}) } 
    };
    
    document.getElementById('form-modal-content').innerHTML = getVirtualFormHTML();

    // NUOVO: Applica la classe CSS per modale largo
    const modalContent = document.querySelector('#form-modal .modal-content');
    if (modalContent) {
        modalContent.classList.add('modal-wide');
    }

    setupVirtualFormEventListeners();
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showEditTurno

// === AZIONI (SALVA, ELIMINA, ETC) ===
// Inizio funzione saveTurno
function saveTurno() {
    const app = getApp();
    if (!virtualState.turnoForm.date || !virtualState.turnoForm.turno) return app.showNotification('Data e tipo turno sono obbligatori');
    if (!app.validateItalianDate(virtualState.turnoForm.date)) return app.showNotification('Formato data non valido. Usa gg.mm.aaaa');
    
    const parsedDate = app.parseItalianDate(virtualState.turnoForm.date);
    const turno = {
        id: virtualState.editingTurno ? virtualState.editingTurno.id : app.generateUniqueId('turno'),
        date: parsedDate.toISOString(),
        turno: virtualState.turnoForm.turno,
        iperself: {
            benzina: parseFloat(virtualState.turnoForm.iperself.benzina) || 0,
            gasolio: parseFloat(virtualState.turnoForm.iperself.gasolio) || 0,
            dieselplus: parseFloat(virtualState.turnoForm.iperself.dieselplus) || 0,
            hvolution: parseFloat(virtualState.turnoForm.iperself.hvolution) || 0
        },
        servito: {
            benzina: parseFloat(virtualState.turnoForm.servito.benzina) || 0,
            gasolio: parseFloat(virtualState.turnoForm.servito.gasolio) || 0,
            dieselplus: parseFloat(virtualState.turnoForm.servito.dieselplus) || 0,
            hvolution: parseFloat(virtualState.turnoForm.servito.hvolution) || 0,
            adblue: parseFloat(virtualState.turnoForm.servito.adblue) || 0
        },
        createdAt: virtualState.editingTurno ? virtualState.editingTurno.createdAt : new Date().toISOString()
    };
    
    if (virtualState.editingTurno) {
        const index = app.state.data.turni.findIndex(t => t.id === virtualState.editingTurno.id);
        if (index !== -1) app.state.data.turni[index] = turno;
    } else {
        app.state.data.turni.push(turno);
    }
    
    app.saveToStorage('data', app.state.data);
    app.hideFormModal();
    app.showNotification('Turno salvato con successo!');
    
    // Ora aggiorniamo la lista senza ricaricare la pagina
    renderTurniTable.call(app);
    safeUpdateCharts.call(app);
}
// Fine funzione saveTurno

// Inizio funzione deleteTurno
function deleteTurno(turnoId) {
    const app = getApp();
    const turno = app.state.data.turni.find(t => t.id === turnoId);
    if (!turno) return;

    app.showConfirm(`Sei sicuro di voler eliminare il turno del ${app.formatDate(turno.date)} - ${turno.turno}?`, () => {
        app.state.data.turni = app.state.data.turni.filter(t => t.id !== turnoId);
        app.saveToStorage('data', app.state.data);
        renderTurniTable.call(app);
        safeUpdateCharts.call(app);
        app.showNotification('Turno eliminato.');
    });
}
// Fine funzione deleteTurno

// === FUNZIONI DATI E UTILITY ===
// Inizio funzione setFilterMode
function setFilterMode(mode) {
    const app = this;
    virtualState.virtualFilters.mode = mode;
    app.saveToStorage('virtualFilterMode', mode);
    updateFilterButtons(mode);
    renderTurniTable.call(app);
    renderVirtualStats.call(app);
    safeUpdateCharts.call(app);
}
// Fine funzione setFilterMode

// Inizio funzione renderVirtualStats
function renderVirtualStats() {
    const app = this;
    const stats = virtualStats.call(app);

    const litriEl = document.getElementById('stat-litri');
    const fatturatoEl = document.getElementById('stat-fatturato');
    const servitoEl = document.getElementById('stat-servito');

    if (litriEl) litriEl.textContent = app.formatInteger(stats.totalLiters);
    if (fatturatoEl) fatturatoEl.textContent = app.formatCurrency(stats.revenue);
    if (servitoEl) servitoEl.textContent = `${stats.servitoPercentage}%`;
}
// Fine funzione renderVirtualStats

// Inizio funzione updateFilterButtons
function updateFilterButtons(activeMode) {
    document.querySelectorAll('[data-filter-mode]').forEach(btn => {
        const isActive = btn.getAttribute('data-filter-mode') === activeMode;
        btn.classList.toggle('btn-primary', isActive);
        btn.classList.toggle('active', isActive);
        btn.classList.toggle('btn-secondary', !isActive);
    });
}
// Fine funzione updateFilterButtons

// Inizio funzione sortVirtual
function sortVirtual(column) {
    const app = this;
    if (virtualState.virtualSort.column === column) {
        virtualState.virtualSort.direction = virtualState.virtualSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        virtualState.virtualSort.column = column;
        virtualState.virtualSort.direction = 'asc';
    }
    renderTurniTable.call(app);
}
// Fine funzione sortVirtual

// Inizio funzione getFilteredTurniForPeriod
function getFilteredTurniForPeriod() {
    // *** CORREZIONE: Usiamo 'this' per il contesto ***
    const app = this;
    
    // CORREZIONE ERRORE: Controlli di sicurezza per evitare errori "Cannot read properties of undefined"
    if (!app || !app.state || !app.state.data || !Array.isArray(app.state.data.turni)) {
        console.warn('⚠️ Dati turni non disponibili');
        return [];
    }
    
    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    now.setHours(23, 59, 59, 999);

    switch (virtualState.virtualFilters.mode) {
        case 'today': break;
        case 'month': startDate.setMonth(startDate.getMonth() - 1); break;
        case 'quarter': startDate.setMonth(startDate.getMonth() - 3); break;
        case 'semester': startDate.setMonth(startDate.getMonth() - 6); break;
        case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
        default: return app.state.data.turni;
    }

    return app.state.data.turni.filter(turno => new Date(turno.date) >= startDate && new Date(turno.date) <= now);
}
// Fine funzione getFilteredTurniForPeriod

// Inizio funzione sortedTurni
function sortedTurni() {
    const app = this;
    const filtered = getFilteredTurniForPeriod.call(app);
    const turni = filtered.map(t => ({ ...t, total: getTurnoTotal(t) }));
    
    // CORREZIONE BUG ORDINAMENTO: Aggiunto ordinamento secondario per 'createdAt'
    // quando le date sono identiche, per mostrare i turni più recenti prima.
    return turni.sort((a, b) => {
        const dir = virtualState.virtualSort.direction === 'asc' ? 1 : -1;
        
        if (virtualState.virtualSort.column === 'date') {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            if (dateA.getTime() !== dateB.getTime()) {
                return (dateA - dateB) * dir;
            } else {
                // Se le date sono uguali, ordina per data di creazione (più recente prima)
                const createdAtA = new Date(a.createdAt || 0);
                const createdAtB = new Date(b.createdAt || 0);
                return createdAtB - createdAtA;
            }
        } else { // Ordinamento per 'total'
            return (a.total - b.total) * dir;
        }
    });
}
// Fine funzione sortedTurni

// Inizio funzione virtualStats
function virtualStats() {
    const app = this;
    const filteredTurni = getFilteredTurniForPeriod.call(this);
    if (filteredTurni.length === 0) return { totalLiters: 0, revenue: 0, servitoPercentage: 0 };

    const basePrices = currentPrices.call(this);
    let totalIperself = 0;
    let totalServito = 0;
    let revenue = 0;

    filteredTurni.forEach(turno => {
        const products = ['benzina', 'gasolio', 'dieselplus', 'hvolution', 'adblue'];
        products.forEach(product => {
            const iperselfL = parseFloat(turno.iperself?.[product]) || 0;
            const servitoL = parseFloat(turno.servito?.[product]) || 0;

            if (product !== 'adblue') {
                totalIperself += iperselfL;
            }
            totalServito += servitoL;

            const priceKey = product === 'dieselplus' ? 'dieselPlus' : product;
            const basePrice = basePrices[priceKey] || 0;

            if (basePrice > 0) {
                if (product === 'adblue') {
                    revenue += servitoL * basePrice;
                } else {
                    const maggiorazione_iperself = 0.005;
                    const maggiorazione_servito = 0.210;
                    const maggiorazione_base_servito = 0.015;

                    const prezzo_iperself = basePrice + maggiorazione_iperself;
                    const prezzo_servito = basePrice + maggiorazione_base_servito + maggiorazione_servito;

                    revenue += (iperselfL * prezzo_iperself) + (servitoL * prezzo_servito);
                }
            }
        });
    });

    const totalLiters = totalIperself + totalServito;
    const servitoPercentage = totalLiters > 0 ? Math.round((totalServito / totalLiters) * 100) : 0;
    
    return { totalLiters, revenue, servitoPercentage };
}
// Fine funzione virtualStats

// Inizio funzione currentPrices
function currentPrices() {
    const app = this;
    // CORREZIONE: Unificata la logica per recuperare l'ultimo listino prezzi valido.
    if (!Array.isArray(app.state.data.priceHistory) || app.state.data.priceHistory.length === 0) {
        return { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0, adblue: 0 };
    }
    return [...app.state.data.priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}
// Fine funzione currentPrices

// Inizio funzione resetTurnoForm
function resetTurnoForm() {
    // *** CORREZIONE: Usiamo 'this' per il contesto ***
    const app = this;
    virtualState.turnoForm = {
        date: app.getTodayFormatted(),
        turno: 'Mattina',
        iperself: { benzina: null, gasolio: null, dieselplus: null, hvolution: null },
        servito: { benzina: null, gasolio: null, dieselplus: null, hvolution: null, adblue: null }
    };
}
// Fine funzione resetTurnoForm

// Inizio funzione updateTurnoFormValue
function updateTurnoFormValue(path, value) {
    const keys = path.split('.');
    let current = virtualState.turnoForm;
    for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
    current[keys[keys.length - 1]] = value === '' ? null : value;
}
// Fine funzione updateTurnoFormValue

// Inizio funzione getTurnoTotal
function getTurnoTotal(turno) {
    const iperselfTotal = Object.values(turno.iperself || {}).reduce((a, b) => a + (b || 0), 0);
    const servitoTotal = Object.values(turno.servito || {}).reduce((a, b) => a + (b || 0), 0);
    return iperselfTotal + servitoTotal;
}
// Fine funzione getTurnoTotal

// Inizio funzione renderTurniTable
function renderTurniTable() {
    const tbody = document.getElementById('turni-tbody');
    if (!tbody) return;
    
    const app = this;
    
    // CORREZIONE ERRORE: Controlli di sicurezza per evitare errori "Cannot read properties of undefined"
    if (!app || !app.state || !app.state.data) {
        console.warn('⚠️ Dati app non disponibili per renderTurniTable');
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-12"><div class="empty-state"><i data-lucide="monitor-x"></i><div class="empty-state-title">Errore caricamento dati</div></div></td></tr>`;
        return;
    }
    
    const turni = sortedTurni.call(app);
    if (turni.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-12"><div class="empty-state"><i data-lucide="monitor-x"></i><div class="empty-state-title">Nessun turno trovato</div></div></td></tr>`;
    } else {
        tbody.innerHTML = turni.map(turno => `
            <tr class="hover:bg-secondary">
                <td class="font-medium text-primary">${app.formatDate(turno.date)}</td><td>${turno.turno}</td>
                <td>${formatProductColumn(turno, 'benzina')}</td><td>${formatProductColumn(turno, 'gasolio')}</td>
                <td>${formatProductColumn(turno, 'dieselplus')}</td><td>${formatProductColumn(turno, 'hvolution')}</td>
                <td><div class="text-xs">S: ${Math.round(turno.servito?.adblue || 0)} L</div></td>
                <td class="font-bold">${app.formatInteger(turno.total)} L</td>
                <td class="text-right"><div class="flex items-center justify-end space-x-2">
                    <button class="btn btn-warning" onclick="editTurnoById('${turno.id}')" title="Modifica turno"><i data-lucide="edit"></i></button>
                    <button class="btn btn-danger" onclick="deleteTurnoById('${turno.id}')" title="Elimina turno"><i data-lucide="trash-2"></i></button>
                </div></td>
            </tr>`).join('');
    }
    app.refreshIcons();
}
// Fine funzione renderTurniTable

// Inizio funzione formatProductColumn
function formatProductColumn(turno, product) {
    const iperself = Math.round(turno.iperself?.[product] || 0);
    const servito = Math.round(turno.servito?.[product] || 0);
    return `<div class="text-xs">I: ${iperself} L</div><div class="text-xs">S: ${servito} L</div>`;
}
// Fine funzione formatProductColumn

// === GRAFICI ===
// Inizio funzione initCharts
function initCharts() {
    const app = this;
    if (virtualState.chartsInitialized) return;
    
    try {
        initProductsChart.call(app);
        initServiceChart.call(app);
        virtualState.chartsInitialized = true;
        console.log('✅ Grafici Virtual inizializzati');
    } catch (error) {
        console.error('❌ Errore inizializzazione grafici Virtual:', error);
    }
}
// Fine funzione initCharts

// Inizio funzione initProductsChart
function initProductsChart() {
    const app = this;
    const ctx = document.getElementById('productsChart');
    if (!ctx) return;
    
    const chartData = getProductsChartData.call(app);
    
    virtualState.productsChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = Math.round(context.parsed);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} L (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}
// Fine funzione initProductsChart

// Inizio funzione initServiceChart
function initServiceChart() {
    const app = this;
    const ctx = document.getElementById('serviceChart');
    if (!ctx) return;
    
    const chartData = getServiceChartData.call(app);
    
    virtualState.serviceChartInstance = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return Math.round(value) + ' L';
                        }
                    }
                }
            }
        }
    });
}
// Fine funzione initServiceChart

// Inizio funzione getProductsChartData
function getProductsChartData() {
    const app = this;
    const filteredTurni = getFilteredTurniForPeriod.call(app);
    
    const totals = { benzina: 0, gasolio: 0, dieselplus: 0, hvolution: 0, adblue: 0 };
    
    filteredTurni.forEach(turno => {
        Object.keys(totals).forEach(product => {
            if (product === 'adblue') {
                totals[product] += parseFloat(turno.servito?.[product]) || 0;
            } else {
                totals[product] += (parseFloat(turno.iperself?.[product]) || 0) + (parseFloat(turno.servito?.[product]) || 0);
            }
        });
    });
    
    return {
        labels: ['Benzina', 'Gasolio', 'Diesel+', 'Hvolution', 'AdBlue'],
        datasets: [{
            data: Object.values(totals),
            backgroundColor: [
                '#10b981', // Verde per Benzina
                '#f59e0b', // Giallo per Gasolio
                '#dc2626', // Rosso per Diesel+
                '#06b6d4', // Ciano per Hvolution
                '#6b7280'  // Grigio per AdBlue
            ],
            borderWidth: 2,
            borderColor: document.body.classList.contains('theme-dark') ? '#111827' : '#ffffff'
        }]
    };
}
// Fine funzione getProductsChartData

// Inizio funzione getServiceChartData
function getServiceChartData() {
    const app = this;
    const filteredTurni = getFilteredTurniForPeriod.call(app);
    
    const iperself = { benzina: 0, gasolio: 0, dieselplus: 0, hvolution: 0 };
    const servito = { benzina: 0, gasolio: 0, dieselplus: 0, hvolution: 0, adblue: 0 };
    
    filteredTurni.forEach(turno => {
        Object.keys(iperself).forEach(product => {
            iperself[product] += parseFloat(turno.iperself?.[product]) || 0;
        });
        Object.keys(servito).forEach(product => {
            servito[product] += parseFloat(turno.servito?.[product]) || 0;
        });
    });
    
    return {
        labels: ['Benzina', 'Gasolio', 'Diesel+', 'Hvolution', 'AdBlue'],
        datasets: [
            {
                label: 'Iperself',
                data: [iperself.benzina, iperself.gasolio, iperself.dieselplus, iperself.hvolution, 0],
                backgroundColor: '#3b82f6'
            },
            {
                label: 'Servito',
                data: [servito.benzina, servito.gasolio, servito.dieselplus, servito.hvolution, servito.adblue],
                backgroundColor: '#22c55e'
            }
        ]
    };
}
// Fine funzione getServiceChartData

// Inizio funzione safeUpdateCharts
function safeUpdateCharts() {
    const app = this;
    if (virtualState.updatingCharts || !virtualState.chartsInitialized) return;
    
    virtualState.updatingCharts = true;
    
    try {
        if (virtualState.productsChartInstance) {
            virtualState.productsChartInstance.data = getProductsChartData.call(app);
            virtualState.productsChartInstance.update('none');
        }
        
        if (virtualState.serviceChartInstance) {
            virtualState.serviceChartInstance.data = getServiceChartData.call(app);
            virtualState.serviceChartInstance.update('none');
        }
    } catch (error) {
        console.error('Errore aggiornamento grafici:', error);
    } finally {
        virtualState.updatingCharts = false;
    }
}
// Fine funzione safeUpdateCharts

// Inizio funzione updateChartsTheme
function updateChartsTheme() {
    const isDark = document.body.classList.contains('theme-dark');
    const textColor = isDark ? '#f9fafb' : '#111827';
    const gridColor = isDark ? '#374151' : '#e5e7eb';
    const borderColor = isDark ? '#111827' : '#ffffff';
    
    const updateOptions = {
        plugins: {
            legend: { labels: { color: textColor } }
        },
        scales: {
            x: { 
                ticks: { color: textColor },
                grid: { color: gridColor }
            },
            y: { 
                ticks: { color: textColor },
                grid: { color: gridColor }
            }
        }
    };
    
    if (virtualState.productsChartInstance) {
        Object.assign(virtualState.productsChartInstance.options.plugins, updateOptions.plugins);
        virtualState.productsChartInstance.data.datasets[0].borderColor = borderColor;
        virtualState.productsChartInstance.update('none');
    }
    
    if (virtualState.serviceChartInstance) {
        Object.assign(virtualState.serviceChartInstance.options, updateOptions);
        virtualState.serviceChartInstance.update('none');
    }
}
// Fine funzione updateChartsTheme

// === STAMPA VIRTUAL - VERSIONE CORRETTA ===
// Inizio funzione printVirtualReport
function printVirtualReport() {
    const app = this;
    const mode = virtualState.virtualFilters.mode;
    const periodName = {
        today: 'Oggi',
        month: 'Ultimo Mese',
        quarter: 'Ultimo Trimestre', 
        semester: 'Ultimo Semestre',
        year: 'Ultimo Anno'
    }[mode] || 'Periodo Selezionato';
    
    document.getElementById('print-virtual-period').textContent = `Periodo: ${periodName} - ${app.formatDate(new Date())}`;
    
    const stats = virtualStats.call(app);
    const statsContainer = document.getElementById('print-virtual-stats');
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-content">
                <div class="stat-label">Litri Venduti</div>
                <div class="stat-value">${app.formatInteger(stats.totalLiters)}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-content">
                <div class="stat-label">Fatturato Stimato</div>
                <div class="stat-value">${app.formatCurrency(stats.revenue)}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-content">
                <div class="stat-label">% Servito</div>
                <div class="stat-value">${stats.servitoPercentage}%</div>
            </div>
        </div>
    `;
    
    const chartsContainer = document.getElementById('print-virtual-charts');
    chartsContainer.innerHTML = ''; // Pulisci contenuto precedente
    
    try {
        // Grafico Vendite per Prodotto
        const productsCanvas = document.getElementById('productsChart');
        if (productsCanvas) {
            const productsImgData = productsCanvas.toDataURL('image/png');
            const productsDiv = document.createElement('div');
            productsDiv.innerHTML = `
                <h3>Vendite per Prodotto</h3>
                <img src="${productsImgData}" alt="Grafico Vendite per Prodotto" style="max-width: 100%; height: auto;">
            `;
            chartsContainer.appendChild(productsDiv);
        }
        
        // Grafico Iperself vs Servito
        const serviceCanvas = document.getElementById('serviceChart');
        if (serviceCanvas) {
            const serviceImgData = serviceCanvas.toDataURL('image/png');
            const serviceDiv = document.createElement('div');
            serviceDiv.innerHTML = `
                <h3>Iperself vs Servito</h3>
                <img src="${serviceImgData}" alt="Grafico Iperself vs Servito" style="max-width: 100%; height: auto;">
            `;
            chartsContainer.appendChild(serviceDiv);
        }
    } catch (error) {
        console.warn('Errore nella conversione grafici per stampa:', error);
        chartsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <p>Grafici non disponibili per la stampa</p>
                <p style="font-size: 0.9em;">I grafici sono visibili solo nella versione digitale</p>
            </div>
        `;
    }
    
    // CORREZIONE: Usa solo le classi hidden, rimuovi le classi extra non standard
    document.getElementById('virtual-print-content').classList.remove('hidden');
    document.getElementById('print-content').classList.add('hidden');
    document.getElementById('print-clients-content').classList.add('hidden');
    
    // Avvia la stampa
    setTimeout(() => {
        window.print();
        
        // Cleanup dopo la stampa
        setTimeout(() => {
            // CORREZIONE: Ripristina lo stato hidden
            document.getElementById('virtual-print-content').classList.add('hidden');
        }, 1000);
    }, 100);
}
// Fine funzione printVirtualReport

// === GESTIONE APERTURA SEZIONE ===
// Inizio funzione onVirtualSectionOpen
function onVirtualSectionOpen() {
    const app = getApp();
    
    // CORREZIONE: Controllo che i dati siano effettivamente caricati prima di inizializzare
    if (!app || !app.state || !app.state.data || !Array.isArray(app.state.data.turni)) {
        console.log('🔄 Dati non ancora caricati, posticipando inizializzazione grafici...');
        
        // Ritenta dopo che i dati sono stati caricati
        setTimeout(() => {
            const appRetry = getApp();
            if (appRetry && appRetry.state && appRetry.state.data && Array.isArray(appRetry.state.data.turni)) {
                console.log('✅ Dati caricati, inizializzando grafici...');
                onVirtualSectionOpen();
            }
        }, 500);
        return;
    }
    
    if (!virtualState.chartsInitialized) {
        setTimeout(() => { 
            initCharts.call(app); 
            setTimeout(() => safeUpdateCharts.call(app), 200); 
        }, 100);
    } else {
        safeUpdateCharts.call(app);
    }
}
// Fine funzione onVirtualSectionOpen

// =============================================
// INIZIO NUOVE FUNZIONI PER NORMALIZZAZIONE BACKUP
// Risolve il problema "dieselPlus" vs "dieselplus"
// =============================================

/**
 * Normalizza i dati dei turni dal backup JSON
 * Converte "dieselPlus" in "dieselplus" per compatibilità 
 * @param {Array} turni - Array dei turni dal backup
 * @returns {Array} - Array dei turni normalizzati
 */
// Inizio funzione normalizeTurniData
function normalizeTurniData(turni) {
    console.log('🔧 Normalizzazione dati turni dal backup...');
    
    if (!Array.isArray(turni)) {
        console.warn('⚠️ Dati turni non validi - non è un array');
        return [];
    }
    
    return turni.map(turno => {
        // Clona l'oggetto turno per non modificare l'originale
        const normalizedTurno = { ...turno };
        
        // Normalizza la sezione iperself
        if (normalizedTurno.iperself && normalizedTurno.iperself.dieselPlus !== undefined) {
            normalizedTurno.iperself.dieselplus = normalizedTurno.iperself.dieselPlus;
            delete normalizedTurno.iperself.dieselPlus;
            console.log(`✅ Normalizzato iperself.dieselPlus per turno ${turno.id}`);
        }
        
        // Normalizza la sezione servito
        if (normalizedTurno.servito && normalizedTurno.servito.dieselPlus !== undefined) {
            normalizedTurno.servito.dieselplus = normalizedTurno.servito.dieselPlus;
            delete normalizedTurno.servito.dieselPlus;
            console.log(`✅ Normalizzato servito.dieselPlus per turno ${turno.id}`);
        }
        
        return normalizedTurno;
    });
}
// Fine funzione normalizeTurniData

/**
 * Diagnostica e ripara i turni presenti nel localStorage
 * Esegue la normalizzazione dei turni già presenti nell'applicazione
 */
// Inizio funzione diagnosticaERiparaTurni
function diagnosticaERiparaTurni() {
    console.log('🔍 Inizio diagnostica turni esistenti...');
    
    const app = getApp();
    if (!app || !app.state.data.turni) {
        console.log('❌ Nessun dato turni trovato');
        return false;
    }
    
    const turniOriginali = app.state.data.turni.length;
    console.log(`📊 Trovati ${turniOriginali} turni da analizzare`);
    
    // Conta i turni che necessitano normalizzazione
    let turniDaNormalizzare = 0;
    app.state.data.turni.forEach(turno => {
        if ((turno.iperself && turno.iperself.dieselPlus !== undefined) ||
            (turno.servito && turno.servito.dieselPlus !== undefined)) {
            turniDaNormalizzare++;
        }
    });
    
    if (turniDaNormalizzare === 0) {
        console.log('✅ Tutti i turni sono già normalizzati');
        return true;
    }
    
    console.log(`🔧 Trovati ${turniDaNormalizzare} turni da normalizzare`);
    
    // Applica la normalizzazione
    app.state.data.turni = normalizeTurniData(app.state.data.turni);
    
    // Salva i dati corretti
    app.saveToStorage('data', app.state.data);
    
    console.log(`✅ Normalizzazione completata! ${turniDaNormalizzare} turni corretti`);
    
    // Aggiorna la visualizzazione se siamo nella sezione virtual
    if (app.state.currentSection === 'virtual') {
        renderTurniTable.call(app);
        safeUpdateCharts.call(app);
    }
    
    return true;
}
// Fine funzione diagnosticaERiparaTurni

// =============================================
// FINE NUOVE FUNZIONI PER NORMALIZZAZIONE BACKUP
// =============================================

// === ESPORTAZIONI GLOBALI ===
if (typeof window !== 'undefined') {
    window.initVirtualStation = initVirtualStation;
    window.renderVirtualSection = renderVirtualSection;
    window.onVirtualSectionOpen = onVirtualSectionOpen;
    window.updateChartsTheme = updateChartsTheme;
    window.editTurnoById = (id) => { const turno = getApp().state.data.turni.find(t => t.id === id); if (turno) showEditTurno(turno); };
    window.deleteTurnoById = deleteTurno;
    window.virtualState = virtualState;
    
    // NUOVE ESPORTAZIONI PER LE FUNZIONI DI NORMALIZZAZIONE
    window.normalizeTurniData = normalizeTurniData;
    window.diagnosticaERiparaTurni = diagnosticaERiparaTurni;
}
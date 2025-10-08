// =============================================
// FILE: virtual.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione VirtualStation (turni, statistiche, grafici).
// =============================================

// === STATO LOCALE DEL MODULO VIRTUAL ===
let virtualState = {
    virtualFilters: { mode: 'today' }, 
    virtualSort: { column: 'date', direction: 'desc' },
    editingTurno: null,
    turnoForm: { 
        date: '', 
        turno: 'Mattina', 
        prepay: { benzina: null, gasolio: null, dieselplus: null, hvolution: null },
        servito: { benzina: null, gasolio: null, dieselplus: null, hvolution: null, adblue: null }
    },
    chartsInitialized: false,
    updatingCharts: false,
    productsChartInstance: null,
    serviceChartInstance: null,
    monthlyTrendChartInstance: null,
    trendChartTab: 'generale',
    chartDrilldown: {
        active: false,
        product: null
    }
};

// === INIZIALIZZAZIONE MODULO VIRTUAL ===
// Inizio funzione initVirtualStation
function initVirtualStation() {
    console.log('[VIRTUAL] Inizializzazione modulo VirtualStation...');
    virtualState.virtualFilters.mode = this.loadFromStorage('virtualFilterMode', 'today');
    resetTurnoForm.call(this);
    console.log('[VIRTUAL] Modulo VirtualStation inizializzato');
}
// Fine funzione initVirtualStation

// === RENDER SEZIONE VIRTUAL ===
// Inizio funzione renderVirtualSection
function renderVirtualSection(container) {
    console.log('[VIRTUAL] Rendering sezione VirtualStation...');
    const app = this;
    renderVirtualListView.call(app, container);
    setupVirtualListViewEventListeners.call(app);
    app.refreshIcons();
}
// Fine funzione renderVirtualSection

// Inizio funzione generateProductsChartLegend
function generateProductsChartLegend(chart) {
    const legendContainer = document.getElementById('products-chart-legend');
    if (!legendContainer) return;

    const { labels, datasets } = chart.data;
    if (!datasets.length || !datasets[0].data) {
        legendContainer.innerHTML = '';
        return;
    }

    const data = datasets[0].data;
    const colors = datasets[0].backgroundColor;
    const app = getApp();

    let html = '<div style="display: flex; flex-direction: column; gap: 0.5rem;">';

    html += `
        <div style="display: grid; grid-template-columns: 20px 1fr 80px; align-items: center; gap: 0.75rem; font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-primary);">
            <div></div>
            <div>Prodotto</div>
            <div style="text-align: right;">Litri</div>
        </div>
    `;

    labels.forEach((label, index) => {
        const value = data[index];
        const color = colors[index];
        
        const swatchStyle = `background: ${color}; width: 14px; height: 14px; border-radius: 4px;`;

        html += `
            <div style="display: grid; grid-template-columns: 20px 1fr 80px; align-items: center; gap: 0.75rem; font-size: 0.875rem;">
                <div style="display: flex; align-items: center; justify-content: center;"><div style="${swatchStyle}"></div></div>
                <div style="color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${label}</div>
                <div style="font-weight: 600; color: var(--text-primary); text-align: right;">${app.formatInteger(value)}</div>
            </div>
        `;
    });

    html += '</div>';
    legendContainer.innerHTML = html;
}
// Fine funzione generateProductsChartLegend

// === RENDER VISTA LISTA ===
// Inizio funzione renderVirtualListView
function renderVirtualListView(container) {
    const app = this;

    if (virtualState.productsChartInstance) virtualState.productsChartInstance.destroy();
    if (virtualState.serviceChartInstance) virtualState.serviceChartInstance.destroy();
    if (virtualState.monthlyTrendChartInstance) virtualState.monthlyTrendChartInstance.destroy();
    
    virtualState.productsChartInstance = null;
    virtualState.serviceChartInstance = null;
    virtualState.monthlyTrendChartInstance = null;
    virtualState.chartsInitialized = false;
    virtualState.chartDrilldown.active = false;

    const stats = virtualStats.call(app);
    
    container.innerHTML = `
        <div class="space-y-6">
            <div class="stats-grid">
                <div class="stat-card" style="background-color: #3b82f6; border-color: #2563eb;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: #ffffff;">Litri Venduti</div>
                        <div id="stat-litri" class="stat-value" style="color: #ffffff;">${app.formatInteger(stats.totalLiters)}</div>
                    </div>
                    <div class="stat-icon blue"><i data-lucide="fuel"></i></div>
                </div>
                <div class="stat-card" style="background-color: #10b981; border-color: #059669;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: #ffffff;">Fatturato Stimato</div>
                        <div id="stat-fatturato" class="stat-value" style="color: #ffffff;">${app.formatCurrency(stats.revenue)}</div>
                    </div>
                    <div class="stat-icon green"><i data-lucide="euro"></i></div>
                </div>
                <div class="stat-card" style="background-color: #8b5cf6; border-color: #7c3aed;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: #ffffff;">% Servito</div>
                        <div id="stat-servito" class="stat-value" style="color: #ffffff;">${stats.servitoPercentage}%</div>
                    </div>
                    <div class="stat-icon purple"><i data-lucide="user-check"></i></div>
                </div>
            </div>
            <div class="filters-bar no-print">
                <div class="filter-group"><div class="btn-group">
                    <button class="btn ${virtualState.virtualFilters.mode === 'today' ? 'btn-primary active' : 'btn-secondary'}" data-filter-mode="today">Oggi</button>
                    <button class="btn ${virtualState.virtualFilters.mode === 'month' ? 'btn-primary active' : 'btn-secondary'}" data-filter-mode="month">Mese</button>
                    <button class="btn ${virtualState.virtualFilters.mode === 'quarter' ? 'btn-primary active' : 'btn-secondary'}" data-filter-mode="quarter">Trimestre</button>
                    <button class="btn ${virtualState.virtualFilters.mode === 'semester' ? 'btn-primary active' : 'btn-secondary'}" data-filter-mode="semester">Semestre</button>
                    <button class="btn ${virtualState.virtualFilters.mode === 'year' ? 'btn-primary active' : 'btn-secondary'}" data-filter-mode="year">Anno</button>
                </div></div>
                <div class="flex items-center space-x-2">
                    <button id="new-turno-btn" class="btn btn-primary"><i data-lucide="monitor-dot"></i> Turno</button>
                    <button id="new-mese-btn" class="btn btn-primary"><i data-lucide="calendar"></i> Mese</button>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-6">
                <div class="card">
                    <div class="card-header">
                        <h3 id="products-chart-title" class="card-title">Vendite per Prodotto</h3>
                        <div class="flex items-center space-x-2">
                            <button id="chart-back-btn" class="btn btn-secondary btn-sm hidden" title="Indietro"><i data-lucide="arrow-left" class="w-4 h-4 mr-1"></i> Indietro</button>
                            <button id="export-products-chart-btn" class="btn btn-primary"><i data-lucide="image"></i> Salva Immagine</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div style="display: grid; grid-template-columns: 1fr 280px; align-items: center; gap: 1.5rem;">
                            <div id="products-chart-legend"></div>
                            <div style="position: relative; width: 280px; height: 280px;">
                                <canvas id="productsChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card"><div class="card-header"><h3 class="card-title">Prepay vs Servito</h3><button id="export-service-chart-btn" class="btn btn-primary"><i data-lucide="image"></i> Salva Immagine</button></div><div class="card-body"><canvas id="serviceChart" height="300"></canvas></div></div>
            </div>
            <div class="card"><div class="card-header"><div class="btn-group"><button class="btn ${virtualState.trendChartTab === 'generale' ? 'btn-primary active' : 'btn-secondary'}" data-trend-tab="generale">Generale</button><button class="btn ${virtualState.trendChartTab === 'benzina' ? 'btn-primary active' : 'btn-secondary'}" data-trend-tab="benzina">Benzina</button><button class="btn ${virtualState.trendChartTab === 'gasolio' ? 'btn-primary active' : 'btn-secondary'}" data-trend-tab="gasolio">Gasolio</button><button class="btn ${virtualState.trendChartTab === 'dieselplus' ? 'btn-primary active' : 'btn-secondary'}" data-trend-tab="dieselplus">Diesel+</button><button class="btn ${virtualState.trendChartTab === 'hvolution' ? 'btn-primary active' : 'btn-secondary'}" data-trend-tab="hvolution">Hvolution</button></div><button id="export-trend-chart-btn" class="btn btn-primary"><i data-lucide="image"></i> Salva Immagine</button></div><div class="card-body"><canvas id="monthlyTrendChart" height="120"></canvas></div></div>
            <div class="card no-print"><div class="card-header" style="padding: 1rem 1.5rem;"><h2 class="card-title">Storico Turni</h2></div><div class="table-container"><table class="table" id="turni-table"><thead><tr><th><button data-sort="date">Data <i data-lucide="arrow-up-down"></i></button></th><th>Turno</th><th>Benzina</th><th>Gasolio</th><th>Diesel+</th><th>Hvolution</th><th>AdBlue</th><th><button data-sort="total">Totale <i data-lucide="arrow-up-down"></i></button></th><th class="text-right">Azioni</th></tr></thead><tbody id="turni-tbody"></tbody></table></div></div>
        </div>
    `;
    renderTurniTable.call(app);
}
// Fine funzione renderVirtualListView

// Inizio funzione getVirtualFormHTML
function getVirtualFormHTML() {
    const isEdit = !!virtualState.editingTurno;
    const title = isEdit ? 'Modifica Turno' : 'Nuovo Turno';
    return `
        <div class="card-header"><h2 class="card-title">${title}</h2></div>
        <div class="card-body">
            <div class="grid grid-cols-12 gap-4 items-end mb-4">
                <div class="col-span-3"><div class="form-group mb-0"><label class="form-label">Data</label><div class="input-group"><i data-lucide="calendar" class="input-group-icon"></i><input type="text" id="turno-date" class="form-control" placeholder="gg.mm.aaaa" value="${virtualState.turnoForm.date}" autocomplete="off"></div></div></div>
                <div class="col-span-9"><div class="form-group mb-0"><label class="form-label">Tipo Turno</label><div class="btn-group w-full" role="group"><button type="button" id="tab-Notte" class="btn ${virtualState.turnoForm.turno === 'Notte' ? 'btn-primary' : 'btn-secondary'} turno-tab" data-turno="Notte">Notte</button><button type="button" id="tab-Mattina" class="btn ${virtualState.turnoForm.turno === 'Mattina' ? 'btn-primary' : 'btn-secondary'} turno-tab" data-turno="Mattina">Mattina</button><button type="button" id="tab-Pausa" class="btn ${virtualState.turnoForm.turno === 'Pausa' ? 'btn-primary' : 'btn-secondary'} turno-tab" data-turno="Pausa">Pausa</button><button type="button" id="tab-Pomeriggio" class="btn ${virtualState.turnoForm.turno === 'Pomeriggio' ? 'btn-primary' : 'btn-secondary'} turno-tab" data-turno="Pomeriggio">Pomeriggio</button><button type="button" id="tab-Weekend" class="btn ${virtualState.turnoForm.turno === 'Weekend' ? 'btn-primary' : 'btn-secondary'} turno-tab" data-turno="Weekend">Weekend</button></div></div></div>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead><tr><th style="width: 25%;">Prodotto</th><th style="width: 37.5%;">Prepay (L)</th><th style="width: 37.5%;">Servito (L)</th></tr></thead>
                    <tbody>
                        <tr><td class="font-medium text-primary">Gasolio</td><td><input type="number" id="prepay-gasolio" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.prepay.gasolio || ''}" autocomplete="off"></td><td><input type="number" id="servito-gasolio" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.servito.gasolio || ''}" autocomplete="off"></td></tr>
                        <tr><td class="font-medium text-primary">Diesel+</td><td><input type="number" id="prepay-dieselplus" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.prepay.dieselplus || ''}" autocomplete="off"></td><td><input type="number" id="servito-dieselplus" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.servito.dieselplus || ''}" autocomplete="off"></td></tr>
                        <tr><td class="font-medium text-primary">AdBlue</td><td></td><td><input type="number" id="servito-adblue" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.servito.adblue || ''}" autocomplete="off"></td></tr>
                        <tr><td class="font-medium text-primary">Benzina</td><td><input type="number" id="prepay-benzina" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.prepay.benzina || ''}" autocomplete="off"></td><td><input type="number" id="servito-benzina" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.servito.benzina || ''}" autocomplete="off"></td></tr>
                        <tr><td class="font-medium text-primary">Hvolution</td><td><input type="number" id="prepay-hvolution" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.prepay.hvolution || ''}" autocomplete="off"></td><td><input type="number" id="servito-hvolution" class="form-control" step="0.01" placeholder="0.00" value="${virtualState.turnoForm.servito.hvolution || ''}" autocomplete="off"></td></tr>
                    </tbody>
                </table>
            </div>
            <div class="flex justify-end space-x-4 mt-4"><button id="cancel-turno-btn-bottom" class="btn btn-secondary">Annulla</button><button id="save-turno-btn" class="btn btn-success">Salva Turno</button></div>
        </div>
    `;
}
// Fine funzione getVirtualFormHTML

// Inizio funzione getMeseFormHTML
function getMeseFormHTML(turno = null) {
    const isEdit = !!turno;
    const title = isEdit ? 'Modifica Riepilogo Mensile' : 'Nuovo Riepilogo Mensile';
    const app = getApp();
    let dateValue = app.getTodayFormatted();
    if (isEdit) {
        dateValue = app.formatToItalianDate(turno.date);
    }
    
    const fdt = isEdit ? turno.fdt || {} : {};
    const prepay = isEdit ? turno.prepay || {} : {};
    const servito = isEdit ? turno.servito || {} : {};

    return `
        <div class="card-header"><h2 class="card-title">${title}</h2></div>
        <div class="card-body">
            <div class="grid grid-cols-12 gap-4 items-end mb-4">
                <div class="col-span-3">
                    <div class="form-group mb-0">
                        <label class="form-label">Data di Riferimento</label>
                        <div class="input-group">
                            <i data-lucide="calendar" class="input-group-icon"></i>
                            <input type="text" id="mese-data-input" class="form-control" placeholder="gg.mm.aaaa" value="${dateValue}" ${isEdit ? 'readonly' : ''} autocomplete="off">
                        </div>
                    </div>
                </div>
            </div>
            <div class="table-container mt-4">
                <table class="table">
                    <thead><tr>
                        <th style="width: 25%;">Prodotto</th>
                        <th style="width: 25%;">FaiDaTe</th>
                        <th style="width: 25%;">Servito</th>
                        <th style="width: 25%;">Prepay</th>
                    </tr></thead>
                    <tbody>
                        <tr><td class="font-medium text-primary">Gasolio</td>
                            <td><input type="number" id="fdt-gasolio" class="form-control" step="0.01" placeholder="0" value="${fdt.gasolio || ''}" autocomplete="off"></td>
                            <td><input type="number" id="servito-gasolio-mese" class="form-control" step="0.01" placeholder="0" value="${servito.gasolio || ''}" autocomplete="off"></td>
                            <td><input type="number" id="prepay-gasolio-mese" class="form-control" step="0.01" placeholder="0" value="${prepay.gasolio || ''}" autocomplete="off"></td>
                        </tr>
                        <tr><td class="font-medium text-primary">Diesel+</td>
                            <td><input type="number" id="fdt-dieselplus" class="form-control" step="0.01" placeholder="0" value="${fdt.dieselplus || ''}" autocomplete="off"></td>
                            <td><input type="number" id="servito-dieselplus-mese" class="form-control" step="0.01" placeholder="0" value="${servito.dieselplus || ''}" autocomplete="off"></td>
                            <td><input type="number" id="prepay-dieselplus-mese" class="form-control" step="0.01" placeholder="0" value="${prepay.dieselplus || ''}" autocomplete="off"></td>
                        </tr>
                        <tr><td class="font-medium text-primary">AdBlue</td>
                            <td></td>
                            <td><input type="number" id="servito-adblue-mese" class="form-control" step="0.01" placeholder="0" value="${servito.adblue || ''}" autocomplete="off"></td>
                            <td></td>
                        </tr>
                        <tr><td class="font-medium text-primary">Benzina</td>
                            <td><input type="number" id="fdt-benzina" class="form-control" step="0.01" placeholder="0" value="${fdt.benzina || ''}" autocomplete="off"></td>
                            <td><input type="number" id="servito-benzina-mese" class="form-control" step="0.01" placeholder="0" value="${servito.benzina || ''}" autocomplete="off"></td>
                            <td><input type="number" id="prepay-benzina-mese" class="form-control" step="0.01" placeholder="0" value="${prepay.benzina || ''}" autocomplete="off"></td>
                        </tr>
                        <tr><td class="font-medium text-primary">Hvolution</td>
                            <td><input type="number" id="fdt-hvolution" class="form-control" step="0.01" placeholder="0" value="${fdt.hvolution || ''}" autocomplete="off"></td>
                            <td><input type="number" id="servito-hvolution-mese" class="form-control" step="0.01" placeholder="0" value="${servito.hvolution || ''}" autocomplete="off"></td>
                            <td><input type="number" id="prepay-hvolution-mese" class="form-control" step="0.01" placeholder="0" value="${prepay.hvolution || ''}" autocomplete="off"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="flex justify-end space-x-4 mt-4">
                <button id="cancel-mese-btn" class="btn btn-secondary">Annulla</button>
                <button id="save-mese-btn" class="btn btn-primary">Salva Riepilogo</button>
            </div>
        </div>
    `;
}
// Fine funzione getMeseFormHTML

// === SETUP EVENT LISTENERS VISTA LISTA ===
// Inizio funzione setupVirtualListViewEventListeners
function setupVirtualListViewEventListeners() {
    const app = this;
    document.querySelectorAll('[data-filter-mode]').forEach(btn => btn.addEventListener('click', () => setFilterMode.call(app, btn.getAttribute('data-filter-mode'))));
    document.getElementById('new-turno-btn')?.addEventListener('click', () => showCreateTurno());
    document.getElementById('new-mese-btn')?.addEventListener('click', () => showCreateMeseModal());
    document.querySelectorAll('#turni-table [data-sort]').forEach(btn => btn.addEventListener('click', () => sortVirtual.call(app, btn.getAttribute('data-sort'))));
    document.querySelectorAll('[data-trend-tab]').forEach(btn => btn.addEventListener('click', () => setTrendChartTab.call(app, btn.dataset.trendTab)));
    document.getElementById('export-products-chart-btn')?.addEventListener('click', () => exportChart('productsChart', 'vendite_prodotti.png'));
    document.getElementById('export-service-chart-btn')?.addEventListener('click', () => exportChart('serviceChart', 'servito_vs_prepay.png'));
    document.getElementById('export-trend-chart-btn')?.addEventListener('click', () => exportChart('monthlyTrendChart', 'andamento_mensile.png'));
    document.getElementById('chart-back-btn')?.addEventListener('click', () => handleChartDrilldown.call(app, null));
}
// Fine funzione setupVirtualListViewEventListeners

// Inizio funzione setupVirtualFormEventListeners
function setupVirtualFormEventListeners() {
    const app = getApp();
    document.getElementById('save-turno-btn')?.addEventListener('click', () => saveTurno());
    document.getElementById('cancel-turno-btn-bottom')?.addEventListener('click', () => app.hideFormModal());

    const inputs = [
        { id: 'turno-date', path: 'date' },
        { id: 'prepay-benzina', path: 'prepay.benzina' }, { id: 'prepay-gasolio', path: 'prepay.gasolio' },
        { id: 'prepay-dieselplus', path: 'prepay.dieselplus' }, { id: 'prepay-hvolution', path: 'prepay.hvolution' },
        { id: 'servito-benzina', path: 'servito.benzina' }, { id: 'servito-gasolio', path: 'servito.gasolio' },
        { id: 'servito-dieselplus', path: 'servito.dieselplus' }, { id: 'servito-hvolution', path: 'servito.hvolution' },
        { id: 'servito-adblue', path: 'servito.adblue' }
    ];
    inputs.forEach(({ id, path }) => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', () => updateTurnoFormValue(path, input.value));
    });
    
    document.querySelectorAll('.turno-tab').forEach(tabButton => {
        tabButton.addEventListener('click', (e) => {
            e.preventDefault();
            const turnoType = tabButton.getAttribute('data-turno');
            updateTurnoFormValue('turno', turnoType);
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

// Inizio funzione setupMeseFormEventListeners
function setupMeseFormEventListeners() {
    const app = getApp();
    document.getElementById('save-mese-btn')?.addEventListener('click', () => saveMese());
    document.getElementById('cancel-mese-btn')?.addEventListener('click', () => app.hideFormModal());
}
// Fine funzione setupMeseFormEventListeners

// Inizio funzione showCreateTurno
function showCreateTurno() {
    const app = getApp();
    virtualState.editingTurno = null;
    resetTurnoForm.call(app);
    document.getElementById('form-modal-content').innerHTML = getVirtualFormHTML();
    const modalContent = document.querySelector('#form-modal-content');
    if (modalContent) modalContent.classList.add('modal-wide');
    setupVirtualFormEventListeners();
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showCreateTurno

// Inizio funzione showCreateMeseModal
function showCreateMeseModal() {
    const app = getApp();
    virtualState.editingTurno = null;
    document.getElementById('form-modal-content').innerHTML = getMeseFormHTML();
    const modalContent = document.querySelector('#form-modal-content');
    if (modalContent) modalContent.classList.add('modal-wide');
    setupMeseFormEventListeners();
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showCreateMeseModal

// Inizio funzione showEditTurno
function showEditTurno(turno) {
    const app = getApp();
    virtualState.editingTurno = turno;
    virtualState.turnoForm = { 
        date: app.formatToItalianDate(turno.date), 
        turno: turno.turno || 'Mattina', 
        prepay: { ...(turno.prepay || {}) }, 
        servito: { ...(turno.servito || {}) } 
    };
    document.getElementById('form-modal-content').innerHTML = getVirtualFormHTML();
    const modalContent = document.querySelector('#form-modal-content');
    if (modalContent) modalContent.classList.add('modal-wide');
    setupVirtualFormEventListeners();
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showEditTurno

// Inizio funzione showEditMeseModal
function showEditMeseModal(turno) {
    const app = getApp();
    virtualState.editingTurno = turno;
    document.getElementById('form-modal-content').innerHTML = getMeseFormHTML(turno);
    const modalContent = document.querySelector('#form-modal-content');
    if (modalContent) modalContent.classList.add('modal-wide');
    setupMeseFormEventListeners();
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showEditMeseModal

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
        prepay: {
            benzina: parseFloat(virtualState.turnoForm.prepay.benzina) || 0,
            gasolio: parseFloat(virtualState.turnoForm.prepay.gasolio) || 0,
            dieselplus: parseFloat(virtualState.turnoForm.prepay.dieselplus) || 0,
            hvolution: parseFloat(virtualState.turnoForm.prepay.hvolution) || 0
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
    
    renderTurniTable.call(app);
    updateVirtualStats.call(app);
    safeUpdateCharts.call(app);
}
// Fine funzione saveTurno

// Inizio funzione saveMese
function saveMese() {
    const app = getApp();
    const isEdit = !!virtualState.editingTurno;
    const dateInput = document.getElementById('mese-data-input').value;

    if (!dateInput || !app.validateItalianDate(dateInput)) {
        return app.showNotification('Formato data non valido. Usa gg.mm.aaaa.');
    }

    const parsedDate = app.parseItalianDate(dateInput);
    const year = parsedDate.getFullYear();
    const month = parsedDate.getMonth() + 1;
    const lastDayOfMonth = new Date(year, month, 0);

    const turnoData = {
        date: lastDayOfMonth.toISOString(),
        turno: 'Riepilogo Mensile',
        fdt: {
            benzina: parseFloat(document.getElementById('fdt-benzina').value) || 0,
            gasolio: parseFloat(document.getElementById('fdt-gasolio').value) || 0,
            dieselplus: parseFloat(document.getElementById('fdt-dieselplus').value) || 0,
            hvolution: parseFloat(document.getElementById('fdt-hvolution').value) || 0,
        },
        prepay: {
            benzina: parseFloat(document.getElementById('prepay-benzina-mese').value) || 0,
            gasolio: parseFloat(document.getElementById('prepay-gasolio-mese').value) || 0,
            dieselplus: parseFloat(document.getElementById('prepay-dieselplus-mese').value) || 0,
            hvolution: parseFloat(document.getElementById('prepay-hvolution-mese').value) || 0,
        },
        servito: {
            benzina: parseFloat(document.getElementById('servito-benzina-mese').value) || 0,
            gasolio: parseFloat(document.getElementById('servito-gasolio-mese').value) || 0,
            dieselplus: parseFloat(document.getElementById('servito-dieselplus-mese').value) || 0,
            hvolution: parseFloat(document.getElementById('servito-hvolution-mese').value) || 0,
            adblue: parseFloat(document.getElementById('servito-adblue-mese').value) || 0,
        }
    };

    const saveAction = () => {
        if (isEdit) {
            const updatedTurno = { ...virtualState.editingTurno, ...turnoData };
            const index = app.state.data.turni.findIndex(t => t.id === updatedTurno.id);
            if (index > -1) {
                app.state.data.turni[index] = updatedTurno;
            }
            app.showNotification('Riepilogo mensile aggiornato con successo!');
        } else {
            const newTurno = {
                id: `riepilogo_${year}-${String(month).padStart(2, '0')}`,
                ...turnoData,
                createdAt: new Date().toISOString()
            };
            const existingIndex = app.state.data.turni.findIndex(t => t.id === newTurno.id);
            if (existingIndex > -1) {
                app.state.data.turni[existingIndex] = newTurno;
            } else {
                app.state.data.turni.push(newTurno);
            }
            app.showNotification('Riepilogo mensile salvato con successo!');
        }
        
        app.saveToStorage('data', app.state.data);
        app.hideFormModal();
        virtualState.editingTurno = null;
        renderTurniTable.call(app);
        updateVirtualStats.call(app);
        safeUpdateCharts.call(app);
    };
    
    const newId = `riepilogo_${year}-${String(month).padStart(2, '0')}`;
    const existingTurno = app.state.data.turni.find(t => t.id === newId);

    if (!isEdit && existingTurno) {
        app.showConfirm('Un riepilogo per questo mese esiste già. Vuoi sovrascriverlo?', saveAction);
    } else {
        saveAction();
    }
}
// Fine funzione saveMese

// Inizio funzione deleteTurno
function deleteTurno(turnoId) {
    const app = getApp();
    const turno = app.state.data.turni.find(t => t.id === turnoId);
    if (!turno) return;

    app.showConfirm(`Sei sicuro di voler eliminare la riga del ${app.formatDate(turno.date)} - ${turno.turno}?`, () => {
        app.state.data.turni = app.state.data.turni.filter(t => t.id !== turnoId);
        app.saveToStorage('data', app.state.data);
        renderTurniTable.call(app);
        updateVirtualStats.call(app);
        safeUpdateCharts.call(app);
        app.showNotification('Riga eliminata.');
    });
}
// Fine funzione deleteTurno

// Inizio funzione setFilterMode
function setFilterMode(mode) {
    const app = this;
    virtualState.virtualFilters.mode = mode;
    app.saveToStorage('virtualFilterMode', mode);
    updateFilterButtons(mode);
    renderTurniTable.call(app);
    updateVirtualStats.call(app);
    safeUpdateCharts.call(app);
}
// Fine funzione setFilterMode

// Inizio funzione updateVirtualStats
function updateVirtualStats() {
    const app = this;
    const stats = virtualStats.call(app);

    const litriEl = document.getElementById('stat-litri');
    const fatturatoEl = document.getElementById('stat-fatturato');
    const servitoEl = document.getElementById('stat-servito');

    if (litriEl) {
        litriEl.textContent = app.formatInteger(stats.totalLiters);
    }
    if (fatturatoEl) {
        fatturatoEl.textContent = app.formatCurrency(stats.revenue);
    }
    if (servitoEl) {
        servitoEl.textContent = `${stats.servitoPercentage}%`;
    }
}
// Fine funzione updateVirtualStats

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

// Inizio funzione setTrendChartTab
function setTrendChartTab(tab) {
    const app = this;
    virtualState.trendChartTab = tab;
    document.querySelectorAll('[data-trend-tab]').forEach(btn => {
        const isActive = btn.dataset.trendTab === tab;
        btn.classList.toggle('btn-primary', isActive);
        btn.classList.toggle('active', isActive);
        btn.classList.toggle('btn-secondary', !isActive);
    });
    safeUpdateCharts.call(app);
}
// Fine funzione setTrendChartTab

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
    const app = this;
    if (!app || !app.state || !app.state.data || !Array.isArray(app.state.data.turni)) {
        console.warn('[VIRTUAL] Dati turni non disponibili');
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
    const turni = filtered.map(t => ({ ...t, total: getTurnoTotal.call(app, t) }));
    return turni.sort((a, b) => {
        const dir = virtualState.virtualSort.direction === 'asc' ? 1 : -1;
        if (virtualState.virtualSort.column === 'date') {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() !== dateB.getTime()) return (dateA - dateB) * dir;
            const createdAtA = new Date(a.createdAt || 0);
            const createdAtB = new Date(b.createdAt || 0);
            return createdAtB - createdAtA;
        } else {
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
    let totalFdtPrepay = 0;
    let totalServito = 0;
    let revenue = 0;
    const prezzo_prepay_base = 0.005;
    const prezzo_servito_base = 0.015;
    const maggiorazione_servito = 0.210;

    filteredTurni.forEach(turno => {
        const products = ['benzina', 'gasolio', 'dieselplus', 'hvolution', 'adblue'];
        products.forEach(product => {
            const priceKey = product === 'dieselplus' ? 'dieselPlus' : product;
            const basePrice = basePrices[priceKey] || 0;
            const prezzo_prepay = basePrice + prezzo_prepay_base;
            const prezzo_servito = basePrice + prezzo_servito_base + maggiorazione_servito;
            let fdtL = 0, prepayL = 0, servitoL = 0;

            if (turno.turno === 'Riepilogo Mensile') {
                fdtL = parseFloat(turno.fdt?.[product]) || 0;
                prepayL = parseFloat(turno.prepay?.[product]) || 0;
                servitoL = parseFloat(turno.servito?.[product]) || 0;
            } else {
                prepayL = parseFloat(turno.prepay?.[product]) || 0;
                servitoL = parseFloat(turno.servito?.[product]) || 0;
            }
            totalFdtPrepay += fdtL + prepayL;
            totalServito += servitoL;
            if (basePrice > 0) {
                if (product === 'adblue') revenue += servitoL * basePrice;
                else revenue += ((fdtL + prepayL) * prezzo_prepay) + (servitoL * prezzo_servito);
            }
        });
    });
    const totalLiters = totalFdtPrepay + totalServito;
    const servitoPercentage = totalLiters > 0 ? Math.round((totalServito / totalLiters) * 100) : 0;
    return { totalLiters, revenue, servitoPercentage };
}
// Fine funzione virtualStats

// Inizio funzione currentPrices
function currentPrices() {
    const app = this;
    if (!Array.isArray(app.state.data.priceHistory) || app.state.data.priceHistory.length === 0) {
        return { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0, adblue: 0 };
    }
    return [...app.state.data.priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}
// Fine funzione currentPrices

// Inizio funzione resetTurnoForm
function resetTurnoForm() {
    const app = this;
    virtualState.turnoForm = {
        date: app.getTodayFormatted(),
        turno: 'Mattina',
        prepay: { benzina: null, gasolio: null, dieselplus: null, hvolution: null },
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
    if (turno.turno === 'Riepilogo Mensile') {
        const fdtTotal = Object.values(turno.fdt || {}).reduce((a, b) => a + (b || 0), 0);
        const prepayTotal = Object.values(turno.prepay || {}).reduce((a, b) => a + (b || 0), 0);
        const servitoTotal = Object.values(turno.servito || {}).reduce((a, b) => a + (b || 0), 0);
        return fdtTotal + prepayTotal + servitoTotal;
    }
    const prepayTotal = Object.values(turno.prepay || {}).reduce((a, b) => a + (b || 0), 0);
    const servitoTotal = Object.values(turno.servito || {}).reduce((a, b) => a + (b || 0), 0);
    return prepayTotal + servitoTotal;
}
// Fine funzione getTurnoTotal

// Inizio funzione renderTurniTable
function renderTurniTable() {
    const tbody = document.getElementById('turni-tbody');
    if (!tbody) return;
    const app = this;
    if (!app || !app.state || !app.state.data) {
        console.warn('[VIRTUAL] Dati app non disponibili per renderTurniTable');
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-12"><div class="empty-state"><i data-lucide="monitor-x"></i><div class="empty-state-title">Errore caricamento dati</div></div></td></tr>`;
        return;
    }
    const turni = sortedTurni.call(app);
    if (turni.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-12"><div class="empty-state"><i data-lucide="monitor-x"></i><div class="empty-state-title">Nessun turno trovato</div></div></td></tr>`;
    } else {
        tbody.innerHTML = turni.map(turno => {
            const isRiepilogo = turno.turno === 'Riepilogo Mensile';
            let actionsHTML = '';
            if (isRiepilogo) {
                actionsHTML = `<div class="flex items-center justify-end space-x-2"><button class="btn btn-success" onclick="editTurnoById('${turno.id}')" title="Modifica riepilogo"><i data-lucide="edit"></i></button><button class="btn btn-danger" onclick="deleteTurnoById('${turno.id}')" title="Elimina riepilogo"><i data-lucide="trash-2"></i></button></div>`;
            } else {
                actionsHTML = `<div class="flex items-center justify-end space-x-2"><button class="btn btn-success" onclick="editTurnoById('${turno.id}')" title="Modifica turno"><i data-lucide="edit"></i></button><button class="btn btn-danger" onclick="deleteTurnoById('${turno.id}')" title="Elimina turno"><i data-lucide="trash-2"></i></button></div>`;
            }
            return `<tr class="hover:bg-secondary"><td class="font-medium text-primary">${app.formatDate(turno.date)}</td><td>${turno.turno}</td><td>${formatVirtualProductColumn.call(app, turno, 'benzina')}</td><td>${formatVirtualProductColumn.call(app, turno, 'gasolio')}</td><td>${formatVirtualProductColumn.call(app, turno, 'dieselplus')}</td><td>${formatVirtualProductColumn.call(app, turno, 'hvolution')}</td><td>${formatVirtualProductColumn.call(app, turno, 'adblue')}</td><td class="font-bold">${app.formatInteger(turno.total)}</td><td class="text-right">${actionsHTML}</td></tr>`;
        }).join('');
    }
    app.refreshIcons();
}
// Fine funzione renderTurniTable

// Inizio funzione formatVirtualProductColumn
function formatVirtualProductColumn(turno, product) {
    const app = this;
    if (turno.turno === 'Riepilogo Mensile') {
        const fdt = Math.round(turno.fdt?.[product] || 0);
        const serv = Math.round(turno.servito?.[product] || 0);
        const pay = Math.round(turno.prepay?.[product] || 0);
        if (product === 'adblue') return `<div class="text-xs">SERV: ${app.formatInteger(serv)}</div>`;
        return `<div class="text-xs">FDT: ${app.formatInteger(fdt)}</div><div class="text-xs">SERV: ${app.formatInteger(serv)}</div><div class="text-xs">PAY: ${app.formatInteger(pay)}</div>`;
    }

    const servito = Math.round(turno.servito?.[product] || 0);
    const prepay = Math.round(turno.prepay?.[product] || 0);

    if (product === 'adblue') {
        return servito > 0 ? `<div class="text-xs">SERV: ${app.formatInteger(servito)}</div>` : '-';
    }

    const parts = [];
    if (prepay > 0) {
        parts.push(`<div class="text-xs">PAY: ${app.formatInteger(prepay)}</div>`);
    }
    if (servito > 0) {
        parts.push(`<div class="text-xs">SERV: ${app.formatInteger(servito)}</div>`);
    }

    return parts.length > 0 ? parts.join('') : '-';
}
// Fine funzione formatVirtualProductColumn

// Inizio funzione initCharts
function initCharts() {
    const app = this;
    if (virtualState.chartsInitialized) return;
    try {
        initProductsChart.call(app);
        initServiceChart.call(app);
        initMonthlyTrendChart.call(app);
        virtualState.chartsInitialized = true;
        console.log('[VIRTUAL] Grafici Virtual inizializzati');
    } catch (error) {
        console.error('[VIRTUAL] Errore inizializzazione grafici Virtual:', error);
    }
}
// Fine funzione initCharts

// Inizio funzione initProductsChart
function initProductsChart() {
    const app = this;
    const ctx = document.getElementById('productsChart')?.getContext('2d');
    if (!ctx) return;

    // Plugin per disegnare il testo al centro del grafico a ciambella
    const centerTextPlugin = {
        id: 'centerText',
        beforeDatasetsDraw(chart) {
            if (chart.config.options.plugins.centerText?.display) {
                const chartCtx = chart.ctx;
                const { top, left, width, height } = chart.chartArea;
                const centerX = left + width / 2;
                const centerY = top + height / 2;
                const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);

                chartCtx.save();
                chartCtx.textAlign = 'center';
                chartCtx.textBaseline = 'middle';

                // Testo principale (Totale Litri)
                const mainTextColor = app.state.isDarkMode ? '#f9fafb' : '#111827';
                chartCtx.font = `bold ${total > 99999 ? '2.5rem' : '3rem'} sans-serif`;
                chartCtx.fillStyle = mainTextColor;
                chartCtx.fillText(app.formatInteger(total), centerX, centerY - 10);
                
                // Sottotitolo
                const subTextColor = app.state.isDarkMode ? '#9ca3af' : '#6b7280';
                chartCtx.font = 'normal 1rem sans-serif';
                chartCtx.fillStyle = subTextColor;
                chartCtx.fillText('Litri totali', centerX, centerY + 25);

                chartCtx.restore();
            }
        }
    };

    const chartData = getProductsChartData.call(app);
    
    virtualState.productsChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        plugins: [centerTextPlugin],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '80%',
            onClick: (event, elements) => {
                if (elements.length > 0 && !virtualState.chartDrilldown.active) {
                    const clickedIndex = elements[0].index;
                    const product = chartData.labels[clickedIndex];
                    handleChartDrilldown.call(app, product);
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = Math.round(context.parsed);
                            return `${label}: ${app.formatInteger(value)} L`;
                        }
                    }
                },
                centerText: { display: true }
            }
        }
    });

    generateProductsChartLegend(virtualState.productsChartInstance);
}
// Fine funzione initProductsChart

// Inizio funzione initServiceChart
function initServiceChart() {
    const app = this;
    const ctx = document.getElementById('serviceChart')?.getContext('2d');
    if (!ctx) return;

    const chartData = getServiceChartData.call(app);

chartData.datasets[0].backgroundColor = '#FF204E';
chartData.datasets[1].backgroundColor = '#2563eb';
    
    chartData.datasets[0].borderRadius = 0;
    chartData.datasets[1].borderRadius = { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 };

    virtualState.serviceChartInstance = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
            },
            scales: { 
                x: {
                    stacked: true,
                },
                y: { 
                    stacked: true,
                    beginAtZero: true, 
                    ticks: { 
                        callback: function(value) { return Math.round(value) + ' L'; } 
                    } 
                } 
            }
        }
    });
}
// Fine funzione initServiceChart

// Inizio funzione initMonthlyTrendChart
function initMonthlyTrendChart() {
    const app = this;
    const ctx = document.getElementById('monthlyTrendChart')?.getContext('2d');
    if (!ctx) return;
    const chartData = getMonthlyTrendChartData.call(app);

    const initialColor = chartData.datasets[0].borderColor;
    const gradient = ctx.createLinearGradient(0, 0, 0, 120);
    gradient.addColorStop(0, `${initialColor}80`);
    gradient.addColorStop(1, `${initialColor}00`);

    chartData.datasets[0].backgroundColor = gradient;

    virtualState.monthlyTrendChartInstance = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: { line: { tension: 0.4, borderWidth: 3 }, point: { radius: 4, hoverRadius: 6 } },
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: function(context) { return `Litri venduti: ${app.formatInteger(context.parsed.y)}`; } } }
            },
            scales: { y: { beginAtZero: true, ticks: { callback: function(value) { return app.formatInteger(value) + ' L'; } } } }
        }
    });
}
// Fine funzione initMonthlyTrendChart

// Inizio funzione getProductsChartData
function getProductsChartData() {
    const app = this;
    const filteredTurni = getFilteredTurniForPeriod.call(app);

    const ctx = document.getElementById('productsChart')?.getContext('2d');
    const cardBg = document.body.classList.contains('theme-dark') ? '#1f2937' : '#ffffff';

    if (virtualState.chartDrilldown.active && virtualState.chartDrilldown.product) {
        const productKey = virtualState.chartDrilldown.product.toLowerCase().replace('+', 'plus');
        const breakdown = getProductBreakdown.call(app, productKey);
        
        const drilldownColors = ['#EB2A5D', '#2563eb'];

        return {
            labels: [`Prepay`, `Servito`],
            datasets: [{ 
                data: [breakdown.prepay, breakdown.servito], 
                backgroundColor: drilldownColors, 
                borderRadius: 8,
                borderWidth: 4,
                borderColor: cardBg
            }]
        };
    }

    const totals = { benzina: 0, gasolio: 0, dieselplus: 0, hvolution: 0, adblue: 0 };
    filteredTurni.forEach(turno => {
        Object.keys(totals).forEach(product => {
            if (turno.turno === 'Riepilogo Mensile') {
                totals[product] += (parseFloat(turno.fdt?.[product]) || 0) + (parseFloat(turno.prepay?.[product]) || 0) + (parseFloat(turno.servito?.[product]) || 0);
            } else {
                if (product === 'adblue') totals[product] += parseFloat(turno.servito?.[product]) || 0;
                else totals[product] += (parseFloat(turno.prepay?.[product]) || 0) + (parseFloat(turno.servito?.[product]) || 0);
            }
        });
    });

    const colors = ['#22c55e', '#f97316', '#FF204E', '#06b6d4', '#6b7280'];

    return {
        labels: ['Benzina', 'Gasolio', 'Diesel+', 'Hvolution', 'AdBlue'],
        datasets: [{ 
            data: Object.values(totals), 
            backgroundColor: colors,
            borderRadius: 8,
            borderWidth: 4,
            borderColor: cardBg
        }]
    };
}
// Fine funzione getProductsChartData

// Inizio funzione getServiceChartData
function getServiceChartData() {
    const app = this;
    const filteredTurni = getFilteredTurniForPeriod.call(app);

    const prepayTotals = { benzina: 0, gasolio: 0, dieselplus: 0, hvolution: 0, adblue: 0 };
    const servitoTotals = { benzina: 0, gasolio: 0, dieselplus: 0, hvolution: 0, adblue: 0 };

    const products = ['benzina', 'gasolio', 'dieselplus', 'hvolution', 'adblue'];

    for (const turno of filteredTurni) {
        for (const product of products) {
            
            servitoTotals[product] += parseFloat(turno.servito?.[product]) || 0;

            let prepayValue = 0;
            if (product !== 'adblue') {
                if (turno.turno === 'Riepilogo Mensile') {
                    prepayValue = (parseFloat(turno.fdt?.[product]) || 0) + (parseFloat(turno.prepay?.[product]) || 0);
                } else {
                    prepayValue = parseFloat(turno.prepay?.[product]) || 0;
                }
            }
            prepayTotals[product] += prepayValue;
        }
    }

    return {
        labels: ['Benzina', 'Gasolio', 'Diesel+', 'Hvolution', 'AdBlue'],
        datasets: [
            { label: 'Prepay/FaiDaTe', data: Object.values(prepayTotals) },
            { label: 'Servito', data: Object.values(servitoTotals) }
        ]
    };
}
// Fine funzione getServiceChartData

// Inizio funzione getMonthlyTrendChartData
function getMonthlyTrendChartData() {
    const app = getApp();
    const tab = virtualState.trendChartTab;
    const currentYear = new Date().getFullYear();
    const labels = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
    const data = Array(12).fill(0);
    const yearTurni = app.state.data.turni.filter(t => new Date(t.date).getFullYear() === currentYear);

    yearTurni.forEach(turno => {
        const monthIndex = new Date(turno.date).getMonth();
        let totalLiters = 0;
        if (tab === 'generale') {
            totalLiters = getTurnoTotal.call(app, turno);
        } else {
            if (turno.turno === 'Riepilogo Mensile') {
                 totalLiters = (parseFloat(turno.fdt?.[tab]) || 0) + (parseFloat(turno.prepay?.[tab]) || 0) + (parseFloat(turno.servito?.[tab]) || 0);
            } else {
                 totalLiters = (parseFloat(turno.prepay?.[tab]) || 0) + (parseFloat(turno.servito?.[tab]) || 0);
            }
        }
        data[monthIndex] += totalLiters;
    });
    const productColors = { generale: '#3b82f6', benzina: '#22c55e', gasolio: '#f97316', dieselplus: '#FF204E', hvolution: '#06b6d4' };
    const selectedColor = productColors[tab] || '#3b82f6';
    return {
        labels: labels,
        datasets: [{ label: `Litri Totali Venduti (${tab})`, data: data, borderColor: selectedColor, fill: true }]
    };
}
// Fine funzione getMonthlyTrendChartData

// Inizio funzione safeUpdateCharts
function safeUpdateCharts() {
    const app = this;
    if (virtualState.updatingCharts || !virtualState.chartsInitialized) return;
    virtualState.updatingCharts = true;
    try {
        if (virtualState.productsChartInstance) {
            const chart = virtualState.productsChartInstance;
            chart.data = getProductsChartData.call(app);
            chart.update('none');
            generateProductsChartLegend(chart);
        }
        if (virtualState.serviceChartInstance) {
            const chart = virtualState.serviceChartInstance;
            const chartData = getServiceChartData.call(app);
            
            chartData.datasets[0].backgroundColor = '#FF204E';
            chartData.datasets[0].borderRadius = 0;
            chartData.datasets[1].backgroundColor = '#2563eb';
            chartData.datasets[1].borderRadius = { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 };
            
            chart.data = chartData;
            chart.update('none');
        }
        if (virtualState.monthlyTrendChartInstance) {
            const chart = virtualState.monthlyTrendChartInstance;
            const chartData = getMonthlyTrendChartData.call(app);
            
            const newColor = chartData.datasets[0].borderColor;
            const gradient = chart.ctx.createLinearGradient(0, 0, 0, chart.height);
            gradient.addColorStop(0, `${newColor}80`);
            gradient.addColorStop(1, `${newColor}00`);

            chartData.datasets[0].backgroundColor = gradient;
            chart.data = chartData;
            chart.update('none');
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
    const cardBg = isDark ? '#1f2937' : '#ffffff';
    
    const updateOptions = {
        plugins: { legend: { labels: { color: textColor } } },
        scales: { x: { ticks: { color: textColor }, grid: { color: gridColor } }, y: { ticks: { color: textColor }, grid: { color: gridColor } } }
    };

    if (virtualState.productsChartInstance) {
        virtualState.productsChartInstance.data.datasets[0].borderColor = cardBg;
        virtualState.productsChartInstance.update('none');
        generateProductsChartLegend(virtualState.productsChartInstance);
    }
    if (virtualState.serviceChartInstance) {
        Object.assign(virtualState.serviceChartInstance.options, updateOptions);
        safeUpdateCharts.call(this);
    }
    if (virtualState.monthlyTrendChartInstance) {
        Object.assign(virtualState.monthlyTrendChartInstance.options, updateOptions);
        safeUpdateCharts.call(this);
    }
}
// Fine funzione updateChartsTheme

// Inizio funzione handleChartDrilldown
function handleChartDrilldown(product) {
    const app = this;
    const titleEl = document.getElementById('products-chart-title');
    const backBtn = document.getElementById('chart-back-btn');
    if (product) {
        virtualState.chartDrilldown.active = true;
        virtualState.chartDrilldown.product = product;
        if (titleEl) titleEl.textContent = `Dettaglio ${product}`;
        if (backBtn) backBtn.classList.remove('hidden');
    } else {
        virtualState.chartDrilldown.active = false;
        virtualState.chartDrilldown.product = null;
        if (titleEl) titleEl.textContent = 'Vendite per Prodotto';
        if (backBtn) backBtn.classList.add('hidden');
    }
    safeUpdateCharts.call(app);
    app.refreshIcons();
}
// Fine funzione handleChartDrilldown

// Inizio funzione getProductBreakdown
function getProductBreakdown(productKey) {
    const app = this;
    const filteredTurni = getFilteredTurniForPeriod.call(app);
    const breakdown = { prepay: 0, servito: 0 };
    const key = productKey.toLowerCase() === 'diesel+' ? 'dieselplus' : productKey;
    filteredTurni.forEach(turno => {
        if (turno.turno === 'Riepilogo Mensile') {
            breakdown.prepay += (parseFloat(turno.fdt?.[key]) || 0) + (parseFloat(turno.prepay?.[key]) || 0);
            breakdown.servito += parseFloat(turno.servito?.[key]) || 0;
        } else {
            breakdown.prepay += parseFloat(turno.prepay?.[key]) || 0;
            breakdown.servito += parseFloat(turno.servito?.[key]) || 0;
        }
    });
    return breakdown;
}
// Fine funzione getProductBreakdown

// Inizio funzione exportChart
function exportChart(canvasId, filename) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas con ID '${canvasId}' non trovato.`);
        return;
    }
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = filename;
    link.click();
}
// Fine funzione exportChart

// Inizio funzione onVirtualSectionOpen
function onVirtualSectionOpen() {
    const app = getApp();
    if (!app || !app.state || !app.state.data || !Array.isArray(app.state.data.turni)) {
        console.log('[VIRTUAL] Dati non ancora caricati, posticipando inizializzazione grafici...');
        setTimeout(() => {
            const appRetry = getApp();
            if (appRetry && appRetry.state && appRetry.state.data && Array.isArray(appRetry.state.data.turni)) {
                console.log('[VIRTUAL] Dati caricati, inizializzando grafici...');
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

// Inizio funzione normalizeTurniData
function normalizeTurniData(turni) {
    console.log('[VIRTUAL] Normalizzazione dati turni dal backup...');
    if (!Array.isArray(turni)) {
        console.warn('[VIRTUAL] Dati turni non validi - non e un array');
        return [];
    }
    return turni.map(turno => {
        const normalizedTurno = { ...turno };
        if (normalizedTurno.iperself !== undefined) {
            normalizedTurno.prepay = normalizedTurno.iperself;
            delete normalizedTurno.iperself;
        }
        if (normalizedTurno.prepay && normalizedTurno.prepay.dieselPlus !== undefined) {
            normalizedTurno.prepay.dieselplus = normalizedTurno.prepay.dieselPlus;
            delete normalizedTurno.prepay.dieselPlus;
        }
        if (normalizedTurno.servito && normalizedTurno.servito.dieselPlus !== undefined) {
            normalizedTurno.servito.dieselplus = normalizedTurno.servito.dieselPlus;
            delete normalizedTurno.servito.dieselPlus;
        }
        if (normalizedTurno.turno === 'Riepilogo Mensile') {
            if (normalizedTurno.fdt === undefined) normalizedTurno.fdt = {};
            if (normalizedTurno.prepay === undefined) normalizedTurno.prepay = {};
            if (normalizedTurno.servito === undefined) normalizedTurno.servito = {};
        }
        return normalizedTurno;
    });
}
// Fine funzione normalizeTurniData

// Inizio funzione diagnosticaERiparaTurni
function diagnosticaERiparaTurni() {
    console.log('[VIRTUAL] Inizio diagnostica turni esistenti...');
    const app = getApp();
    if (!app || !app.state.data.turni) {
        console.log('[VIRTUAL] Nessun dato turni trovato');
        return false;
    }
    const turniOriginali = app.state.data.turni;
    const turniNormalizzati = normalizeTurniData(turniOriginali);
    if (JSON.stringify(turniOriginali) === JSON.stringify(turniNormalizzati)) {
        console.log('[VIRTUAL] Tutti i turni sono gia normalizzati');
        return true;
    }
    console.log('[VIRTUAL] Trovati turni da normalizzare. Procedo con la correzione...');
    app.state.data.turni = turniNormalizzati;
    app.saveToStorage('data', app.state.data);
    console.log('[VIRTUAL] Normalizzazione completata!');
    if (app.state.currentSection === 'virtual') {
        renderTurniTable.call(app);
        safeUpdateCharts.call(app);
    }
    return true;
}
// Fine funzione diagnosticaERiparaTurni

// Inizio funzione showSkeletonLoader
function showSkeletonLoader(container) {
    const skeletonHTML = `<div class="space-y-6"><div class="filters-bar" style="justify-content: space-between;"><div class="skeleton-loader" style="height: 2.5rem; width: 420px;"></div><div class="skeleton-loader" style="height: 2.5rem; width: 280px;"></div></div><div class="stats-grid"><div class="stat-card" style="display: flex; align-items: center; justify-content: space-between;"><div style="flex: 1;"><div class="skeleton-loader" style="height: 1rem; width: 60%; margin-bottom: 0.75rem;"></div><div class="skeleton-loader" style="height: 2rem; width: 40%;"></div></div><div class="skeleton-loader" style="width: 4rem; height: 4rem; border-radius: 50%;"></div></div><div class="stat-card" style="display: flex; align-items: center; justify-content: space-between;"><div style="flex: 1;"><div class="skeleton-loader" style="height: 1rem; width: 60%; margin-bottom: 0.75rem;"></div><div class="skeleton-loader" style="height: 2rem; width: 40%;"></div></div><div class="skeleton-loader" style="width: 4rem; height: 4rem; border-radius: 50%;"></div></div><div class="stat-card" style="display: flex; align-items: center; justify-content: space-between;"><div style="flex: 1;"><div class="skeleton-loader" style="height: 1rem; width: 60%; margin-bottom: 0.75rem;"></div><div class="skeleton-loader" style="height: 2rem; width: 40%;"></div></div><div class="skeleton-loader" style="width: 4rem; height: 4rem; border-radius: 50%;"></div></div></div><div class="grid grid-cols-2 gap-6"><div class="card"><div class="card-body"><div class="skeleton-loader" style="height: 300px; width: 100%;"></div></div></div><div class="card"><div class="card-body"><div class="skeleton-loader" style="height: 300px; width: 100%;"></div></div></div></div><div class="card"><div class="card-header"><div class="skeleton-loader" style="height: 1.5rem; width: 200px;"></div></div><div class="p-6 space-y-2"><div class="skeleton-loader" style="height: 2.5rem; width: 100%;"></div><div class="skeleton-loader" style="height: 2.5rem; width: 100%;"></div><div class="skeleton-loader" style="height: 2.5rem; width: 100%;"></div><div class="skeleton-loader" style="height: 2.5rem; width: 100%;"></div></div></div></div>`;
    container.innerHTML = skeletonHTML;
}
// Fine funzione showSkeletonLoader

// Inizio funzione editTurnoByIdRouter
function editTurnoByIdRouter(id) {
    const app = getApp();
    const turno = app.state.data.turni.find(t => t.id === id);
    if (!turno) return;

    if (turno.turno === 'Riepilogo Mensile') {
        showEditMeseModal(turno);
    } else {
        showEditTurno(turno);
    }
}
// Fine funzione editTurnoByIdRouter

// === ESPORTAZIONI GLOBALI ===
if (typeof window !== 'undefined') {
    window.initVirtualStation = initVirtualStation;
    window.renderVirtualSection = renderVirtualSection;
    window.onVirtualSectionOpen = onVirtualSectionOpen;
    window.updateChartsTheme = updateChartsTheme;
    window.editTurnoById = editTurnoByIdRouter;
    window.deleteTurnoById = deleteTurno;
    window.virtualState = virtualState;
    window.normalizeTurniData = normalizeTurniData;
    window.diagnosticaERiparaTurni = diagnosticaERiparaTurni;
}
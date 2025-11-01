// =============================================
// FILE: spese.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Spese.
// =============================================

// === COSTANTI ===
const SPESE_LABEL_COLORS = [{
    name: 'Rosso',
    value: '#ef4444'
}, {
    name: 'Blu',
    value: '#3b82f6'
}, {
    name: 'Verde',
    value: '#10b981'
}, {
    name: 'Lilla',
    value: '#8b5cf6'
}, {
    name: 'Giallo',
    value: '#f59e0b'
}, {
    name: 'Grigio',
    value: '#6b7280'
}];

// === STATO LOCALE DEL MODULO SPESE ===
let speseState = {
    filters: {
        query: '',
        month: 'all',
        year: 'all',
        labelId: 'all'
    },
    sort: {
        column: 'date',
        direction: 'desc'
    },
    editingSpesa: null,
    spesaForm: {
        id: null,
        date: '',
        description: '',
        amount: '',
        fornitore: '',
        labelId: ''
    },
    editingLabel: null,
    labelForm: {
        id: null,
        name: '',
        color: SPESE_LABEL_COLORS[0].value
    },
    speseCollapsed: false,
};

// === INIZIALIZZAZIONE MODULO SPESE ===
// Inizio funzione initSpese
function initSpese() {
    console.log('💸 Inizializzazione modulo Spese...');
    const app = this;
    if (!app.state.data.speseEtichette || app.state.data.speseEtichette.length === 0) {
        app.state.data.speseEtichette = [{
            id: 'default',
            name: 'Generale',
            color: '#6b7280'
        }, {
            id: 'carburante',
            name: 'Carburante',
            color: '#ef4444'
        }, {
            id: 'manutenzione',
            name: 'Manutenzione',
            color: '#f59e0b'
        }, {
            id: 'tasse',
            name: 'Tasse e Imposte',
            color: '#3b82f6'
        }, ];
    }
    speseState.filters.month = (new Date().getMonth() + 1).toString();
    speseState.filters.year = new Date().getFullYear().toString();
    speseState.speseCollapsed = app.loadFromStorage('speseCollapsed', false);
    resetSpesaForm.call(app);
    console.log('✅ Modulo Spese inizializzato');
}
// Fine funzione initSpese

// === FUNZIONI DI RENDER ===
// Inizio funzione renderSpeseSection
function renderSpeseSection(container) {
    const app = this;
    renderSpeseListView.call(app, container);
    setupSpeseEventListeners.call(app);
    app.refreshIcons();
}
// Fine funzione renderSpeseSection

// Inizio funzione renderSpeseListView
function renderSpeseListView(container) {
    const app = this;
    const stats = getSpeseStats.call(app);
    container.innerHTML = `
        <div class="space-y-6">
            <div class="stats-grid">
                <div class="stat-card" style="background-color: #FF204E; border-color: #DC1C44;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: #ffffff;">Totale Spese (Filtrato)</div>
                        <div class="stat-value" style="color: #ffffff;">${app.formatCurrency(stats.total)}</div>
                    </div>
                    <div class="stat-icon red"><i data-lucide="trending-down"></i></div>
                </div>
                <div class="stat-card" style="background-color: #f59e0b; border-color: #d97706;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: #ffffff;">Numero Transazioni</div>
                        <div class="stat-value" style="color: #ffffff;">${stats.count}</div>
                    </div>
                    <div class="stat-icon yellow"><i data-lucide="list"></i></div>
                </div>
                <div class="stat-card" style="background-color: #3b82f6; border-color: #2563eb;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: #ffffff;">Media Transazione</div>
                        <div class="stat-value" style="color: #ffffff;">${app.formatCurrency(stats.average)}</div>
                    </div>
                    <div class="stat-icon blue"><i data-lucide="scale"></i></div>
                </div>
            </div>

            <div class="filters-bar">
                <div class="filter-group">
                    <div class="input-group">
                        <i data-lucide="search" class="input-group-icon"></i>
                        <input type="search" id="spese-search-input" class="form-control" style="max-width: 300px;" placeholder="Cerca per descrizione o fornitore..." value="${speseState.filters.query}" autocomplete="off">
                    </div>
                </div>
                <div class="filter-group flex-grow flex items-end gap-4">
                    <select id="spese-month-filter" class="form-control" style="width: 150px;">${getMonthOptions(speseState.filters.month)}</select>
                    <select id="spese-year-filter" class="form-control" style="width: 120px;">${getYearOptions(app, speseState.filters.year)}</select>
                    <select id="spese-label-filter" class="form-control" style="width: 200px;">${getLabelOptions(app, speseState.filters.labelId)}</select>
                </div>
                <button id="new-spesa-btn" class="btn btn-primary"><i data-lucide="plus"></i> Nuova Spesa</button>
            </div>

            <div class="card collapsible-section ${speseState.speseCollapsed ? 'collapsed' : ''}">
                <div class="card-header collapsible-header" data-section-name="spese">
                    <h2 class="card-title">Elenco Spese</h2>
                    <button class="collapse-toggle"><i data-lucide="chevron-up"></i></button>
                </div>
                <div class="card-body collapsible-content">
                    <div class="table-container">
                        <table class="table" id="spese-table">
                            <thead>
                                <tr>
                                    <th><button data-sort="date">Data <i data-lucide="arrow-up-down"></i></button></th>
                                    <th><button data-sort="description">Descrizione <i data-lucide="arrow-up-down"></i></button></th>
                                    <th><button data-sort="fornitore">Fornitore <i data-lucide="arrow-up-down"></i></button></th>
                                    <th>Etichetta</th>
                                    <th><button data-sort="amount">Importo <i data-lucide="arrow-up-down"></i></button></th>
                                    <th class="text-right">Azioni</th>
                                </tr>
                            </thead>
                            <tbody id="spese-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    renderSpeseTable.call(app);
}
// Fine funzione renderSpeseListView

// Inizio funzione getSpesaFormHTML
function getSpesaFormHTML(app) {
    const isEdit = !!speseState.editingSpesa;
    const title = isEdit ? 'Modifica Spesa' : 'Nuova Spesa';
    const form = speseState.spesaForm;
    return `
        <div class="modal-header">
            <h2 class="card-title">${title}</h2>
            <button type="button" id="close-spesa-icon-btn" class="modal-close-btn">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Data</label>
                        <input type="text" id="spesa-date" class="form-control" placeholder="gg.mm.aaaa" value="${form.date}" autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Importo (€)</label>
                        <input type="number" id="spesa-amount" class="form-control" placeholder="0.00" value="${form.amount || ''}" autocomplete="off">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Descrizione</label>
                    <input type="text" id="spesa-description" class="form-control" style="max-width: none;" value="${form.description}" autocomplete="off">
                </div>
                <div class="form-group">
                    <label class="form-label">Fornitore (opzionale)</label>
                    <input type="text" id="spesa-fornitore" class="form-control" style="max-width: none;" value="${form.fornitore || ''}" autocomplete="off">
                </div>
                <div class="form-group">
                    <label class="form-label">Etichetta</label>
                    <div class="flex gap-2">
                        <select id="spesa-labelId" class="form-control" style="max-width: none; flex-grow: 1;">
                            ${getLabelOptions(app, form.labelId, false)}
                        </select>
                        <button id="manage-labels-btn" class="btn btn-secondary" title="Gestisci Etichette"><i data-lucide="tags" class="m-0"></i></button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button id="cancel-spesa-btn-bottom" class="btn btn-secondary">Annulla</button>
            <button id="save-spesa-btn" class="btn btn-success">Salva Spesa</button>
        </div>
    `;
}
// Fine funzione getSpesaFormHTML

// Inizio funzione getLabelManagerHTML
function getLabelManagerHTML(app) {
    const etichette = app.state.data.speseEtichette || [];
    if (!SPESE_LABEL_COLORS.find(c => c.value === speseState.labelForm.color)) {
        speseState.labelForm.color = SPESE_LABEL_COLORS[0].value;
    }
    return `
        <div class="modal-header">
            <h2 class="card-title">Gestisci Etichette Spese</h2>
            <button type="button" id="close-labels-btn" class="modal-close-btn">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="space-y-4">
                <div class="grid grid-cols-12 gap-2">
                    <div class="col-span-9">
                        <input type="text" id="label-name" class="form-control" style="max-width: none;" placeholder="Nome etichetta" value="${speseState.labelForm.name}">
                    </div>
                    <div class="col-span-3">
                        <button id="save-label-btn" class="btn btn-primary w-full">${speseState.editingLabel ? 'Salva' : 'Aggiungi'}</button>
                    </div>
                </div>
                <div class="form-group mb-0">
                    <label class="form-label">Colore</label>
                    <div class="flex" style="gap: var(--spacing-sm);" id="label-color-picker">
                        ${SPESE_LABEL_COLORS.map(color => `
                            <button type="button" 
                                    class="label-color-swatch" 
                                    data-color="${color.value}" 
                                    title="${color.name}" 
                                    style="background-color: ${color.value}; 
                                           width: 2.25rem; 
                                           height: 2.25rem; 
                                           border-radius: 50%; 
                                           cursor: pointer; 
                                           border: 3px solid ${speseState.labelForm.color === color.value ? 'var(--color-primary)' : 'var(--bg-primary)'}; 
                                           box-shadow: 0 0 0 1px ${speseState.labelForm.color === color.value ? 'var(--color-primary)' : 'var(--border-secondary)'};
                                           transition: all 0.2s ease;">
                            </button>
                        `).join('')}
                        <input type="hidden" id="label-color-value" value="${speseState.labelForm.color}">
                    </div>
                </div>
                <div class="table-container" style="max-height: 300px; overflow-y: auto;">
                    <table class="table">
                        <thead><tr><th>Nome</th><th class="text-right">Azioni</th></tr></thead>
                        <tbody>
                            ${etichette.map(label => `
                                <tr data-label-id="${label.id}">
                                    <td>
                                        <span class="etichetta-badge" style="background-color: ${label.color}33; color: ${label.color}; border-color: ${label.color}80;">
                                            ${label.name}
                                        </span>
                                    </td>
                                    <td class="text-right">
                                        <button class="btn btn-success btn-sm" onclick="editLabel('${label.id}')" title="Modifica"><i data-lucide="edit"></i></button>
                                        ${label.id !== 'default' ? `<button class="btn btn-danger btn-sm" onclick="deleteLabel('${label.id}')" title="Elimina"><i data-lucide="trash-2"></i></button>` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}
// Fine funzione getLabelManagerHTML

// === FUNZIONI HELPERS PER IL RENDER ===
// Inizio funzione getMonthOptions
function getMonthOptions(selectedMonth) {
    const months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    let options = '<option value="all">Tutti i mesi</option>';
    months.forEach((month, index) => {
        const monthValue = (index + 1).toString();
        options += `<option value="${monthValue}" ${selectedMonth === monthValue ? 'selected' : ''}>${month}</option>`;
    });
    return options;
}
// Fine funzione getMonthOptions

// Inizio funzione getYearOptions
function getYearOptions(app, selectedYear) {
    const years = [...new Set(app.state.data.spese.map(s => new Date(s.date).getFullYear()))];
    const currentYear = new Date().getFullYear();
    if (!years.includes(currentYear)) years.push(currentYear);
    years.sort((a, b) => b - a);
    let options = '<option value="all">Tutti gli anni</option>';
    years.forEach(year => {
        const yearValue = year.toString();
        options += `<option value="${yearValue}" ${selectedYear === yearValue ? 'selected' : ''}>${year}</option>`;
    });
    return options;
}
// Fine funzione getYearOptions

// Inizio funzione getLabelOptions
function getLabelOptions(app, selectedLabelId, includeAll = true) {
    const etichette = app.state.data.speseEtichette || [];
    let options = includeAll ? '<option value="all">Tutte le etichette</option>' : '';
    etichette.forEach(label => {
        options += `<option value="${label.id}" ${selectedLabelId === label.id ? 'selected' : ''}>${label.name}</option>`;
    });
    return options;
}
// Fine funzione getLabelOptions

// === FUNZIONI EVENT LISTENER ===
// Inizio funzione handleSpeseClick
function handleSpeseClick(event) {
    const app = getApp();
    const target = event.target;
    const collapsibleHeader = target.closest('.collapsible-header[data-section-name="spese"]');
    if (collapsibleHeader) {
        const sectionEl = collapsibleHeader.closest('.collapsible-section');
        const isCollapsed = sectionEl.classList.toggle('collapsed');
        speseState.speseCollapsed = isCollapsed;
        app.saveToStorage('speseCollapsed', isCollapsed);
        return;
    }
    if (target.closest('#new-spesa-btn')) showCreateSpesa.call(app);
    const sortBtn = target.closest('#spese-table [data-sort]');
    if (sortBtn) sortSpese.call(app, sortBtn.dataset.sort);
}
// Fine funzione handleSpeseClick

// Inizio funzione handleSpeseChange
function handleSpeseChange(event) {
    const app = getApp();
    const id = event.target.id;
    if (id === 'spese-month-filter') speseState.filters.month = event.target.value;
    else if (id === 'spese-year-filter') speseState.filters.year = event.target.value;
    else if (id === 'spese-label-filter') speseState.filters.labelId = event.target.value;
    else return;
    refreshSpeseView.call(app);
}
// Fine funzione handleSpeseChange

// Inizio funzione handleSpeseInput
function handleSpeseInput(event) {
    const app = getApp();
    if (event.target.id === 'spese-search-input') {
        speseState.filters.query = event.target.value;
        refreshSpeseView.call(app);
    }
}
// Fine funzione handleSpeseInput

// Inizio funzione setupSpeseEventListeners
function setupSpeseEventListeners() {
    const container = document.getElementById('section-spese');
    if (!container) return;
    container.removeEventListener('click', handleSpeseClick);
    container.removeEventListener('change', handleSpeseChange);
    container.removeEventListener('input', handleSpeseInput);
    container.addEventListener('click', handleSpeseClick);
    container.addEventListener('change', handleSpeseChange);
    container.addEventListener('input', handleSpeseInput);
}
// Fine funzione setupSpeseEventListeners

// Inizio funzione setupSpesaFormEventListeners
function setupSpesaFormEventListeners() {
    const app = getApp();
    const saveBtn = document.getElementById('save-spesa-btn');
    const cancelBtnBottom = document.getElementById('cancel-spesa-btn-bottom');
    const cancelBtnIcon = document.getElementById('close-spesa-icon-btn');
    const manageLabelsBtn = document.getElementById('manage-labels-btn');

    if (saveBtn) saveBtn.addEventListener('click', () => saveSpesa.call(app));
    const close = () => app.hideFormModal();
    if (cancelBtnBottom) cancelBtnBottom.addEventListener('click', close);
    if (cancelBtnIcon) cancelBtnIcon.addEventListener('click', close);
    if (manageLabelsBtn) manageLabelsBtn.addEventListener('click', () => showLabelManager.call(app));

    const formIds = ['spesa-date', 'spesa-description', 'spesa-amount', 'spesa-fornitore', 'spesa-labelId'];
    formIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                const key = id.split('-')[1];
                speseState.spesaForm[key] = e.target.value;
            });
        }
    });
}
// Fine funzione setupSpesaFormEventListeners

// Inizio funzione setupLabelManagerEventListeners
function setupLabelManagerEventListeners() {
    const app = getApp();
    const saveBtn = document.getElementById('save-label-btn');
    const closeBtn = document.getElementById('close-labels-btn');
    const nameInput = document.getElementById('label-name');
    const colorPicker = document.getElementById('label-color-picker');

    if (saveBtn) saveBtn.addEventListener('click', () => saveLabel.call(app));
    if (closeBtn) closeBtn.addEventListener('click', () => showCreateSpesa.call(app, speseState.editingSpesa));

    if (nameInput) nameInput.addEventListener('input', (e) => speseState.labelForm.name = e.target.value);

    if (colorPicker) {
        colorPicker.addEventListener('click', (e) => {
            const swatch = e.target.closest('.label-color-swatch');
            if (!swatch) return;
            const newColor = swatch.dataset.color;
            speseState.labelForm.color = newColor;
            document.getElementById('label-color-value').value = newColor;
            document.querySelectorAll('#label-color-picker .label-color-swatch').forEach(btn => {
                const isSelected = btn.dataset.color === newColor;
                btn.style.borderColor = isSelected ? 'var(--color-primary)' : 'var(--bg-primary)';
                btn.style.boxShadow = `0 0 0 1px ${isSelected ? 'var(--color-primary)' : 'var(--border-secondary)'}`;
            });
        });
    }
}
// Fine funzione setupLabelManagerEventListeners

// === FUNZIONI MODALI ===
// Inizio funzione showCreateSpesa
function showCreateSpesa(spesa = null) {
    const app = this;
    if (spesa) {
        speseState.editingSpesa = spesa;
        speseState.spesaForm = { ...spesa,
            date: app.formatToItalianDate(spesa.date),
            amount: spesa.amount.toString()
        };
    } else {
        resetSpesaForm.call(app);
    }
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getSpesaFormHTML(app);
    modalContentEl.classList.add('modal-todo');
    setupSpesaFormEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showCreateSpesa

// Inizio funzione showLabelManager
function showLabelManager() {
    const app = this;
    speseState.editingLabel = null;
    speseState.labelForm = {
        id: null,
        name: '',
        color: SPESE_LABEL_COLORS[0].value
    };
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getLabelManagerHTML(app);
    modalContentEl.classList.add('modal-todo');
    setupLabelManagerEventListeners.call(app);
    app.refreshIcons();
}
// Fine funzione showLabelManager

// === FUNZIONI DATI (SPESE) ===
// Inizio funzione resetSpesaForm
function resetSpesaForm() {
    const app = this;
    speseState.spesaForm = {
        id: null,
        date: app.getTodayFormatted(),
        description: '',
        amount: '',
        fornitore: '',
        labelId: 'default'
    };
    speseState.editingSpesa = null;
}
// Fine funzione resetSpesaForm

// Inizio funzione saveSpesa
function saveSpesa() {
    const app = this;
    const form = speseState.spesaForm;
    if (!form.date || !form.description || !form.amount) {
        return app.showNotification('Data, Descrizione e Importo sono obbligatori', 'error');
    }
    if (!app.validateItalianDate(form.date)) {
        return app.showNotification('Formato data non valido. Usa gg.mm.aaaa', 'error');
    }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
        return app.showNotification('Importo non valido', 'error');
    }

    const spesaData = {
        date: app.parseItalianDate(form.date).toISOString(),
        description: form.description,
        amount: amount,
        fornitore: form.fornitore,
        labelId: form.labelId || 'default'
    };

    if (speseState.editingSpesa) {
        const index = app.state.data.spese.findIndex(s => s.id === speseState.editingSpesa.id);
        if (index !== -1) {
            app.state.data.spese[index] = { ...speseState.editingSpesa,
                ...spesaData
            };
            app.showNotification('Spesa aggiornata');
        }
    } else {
        const newSpesa = {
            id: app.generateUniqueId('spesa'),
            ...spesaData
        };
        app.state.data.spese.push(newSpesa);
        app.showNotification('Spesa aggiunta');
    }
    app.saveToStorage('data', app.state.data);
    app.hideFormModal();
    renderSpeseListView.call(app, document.getElementById('section-spese'));
}
// Fine funzione saveSpesa

// Inizio funzione deleteSpesa
function deleteSpesa(spesaId) {
    const app = getApp();
    const spesa = app.state.data.spese.find(s => s.id === spesaId);
    if (!spesa) return;
    app.showConfirm(`Sei sicuro di voler eliminare la spesa:<br>"${spesa.description}"?`, () => {
        app.state.data.spese = app.state.data.spese.filter(s => s.id !== spesaId);
        app.saveToStorage('data', app.state.data);
        app.showNotification('Spesa eliminata');
        refreshSpeseView.call(app);
    });
}
// Fine funzione deleteSpesa

// === FUNZIONI DATI (ETICHETTE) ===
// Inizio funzione saveLabel
function saveLabel() {
    const app = getApp();
    const {
        name
    } = speseState.labelForm;
    const color = document.getElementById('label-color-value').value;
    if (!name.trim()) return app.showNotification('Il nome etichetta è obbligatorio', 'error');
    if (speseState.editingLabel) {
        const index = app.state.data.speseEtichette.findIndex(l => l.id === speseState.editingLabel.id);
        if (index !== -1) {
            app.state.data.speseEtichette[index] = { ...app.state.data.speseEtichette[index],
                name,
                color
            };
            app.showNotification('Etichetta aggiornata');
        }
    } else {
        const newLabel = {
            id: app.generateUniqueId('label'),
            name,
            color
        };
        app.state.data.speseEtichette.push(newLabel);
        app.showNotification('Etichetta aggiunta');
    }
    app.saveToStorage('data', app.state.data);
    showLabelManager.call(app);
    app.refreshIcons();
}
// Fine funzione saveLabel

// Inizio funzione editLabel
function editLabel(labelId) {
    const app = getApp();
    const label = app.state.data.speseEtichette.find(l => l.id === labelId);
    if (!label) return;
    speseState.editingLabel = label;
    speseState.labelForm = { ...label
    };
    document.getElementById('label-name').value = label.name;

    const colorValueInput = document.getElementById('label-color-value');
    if (colorValueInput) colorValueInput.value = label.color;

    document.querySelectorAll('#label-color-picker .label-color-swatch').forEach(btn => {
        const isSelected = btn.dataset.color === label.color;
        btn.style.borderColor = isSelected ? 'var(--color-primary)' : 'var(--bg-primary)';
        btn.style.boxShadow = `0 0 0 1px ${isSelected ? 'var(--color-primary)' : 'var(--border-secondary)'}`;
    });

    document.getElementById('save-label-btn').textContent = 'Salva';
}
// Fine funzione editLabel

// Inizio funzione deleteLabel
function deleteLabel(labelId) {
    const app = getApp();
    if (labelId === 'default') return app.showNotification('Impossibile eliminare l\'etichetta predefinita', 'error');
    const speseAssociate = app.state.data.spese.filter(s => s.labelId === labelId).length;
    if (speseAssociate > 0) {
        return app.showConfirm(`Ci sono ${speseAssociate} spese associate a questa etichetta. Spostarle in "Generale" prima di eliminare?`, () => {
            app.state.data.spese = app.state.data.spese.map(s => {
                if (s.labelId === labelId) return { ...s,
                    labelId: 'default'
                };
                return s;
            });
            app.state.data.speseEtichette = app.state.data.speseEtichette.filter(l => l.id !== labelId);
            app.saveToStorage('data', app.state.data);
            app.showNotification('Etichetta eliminata e spese spostate');
            showLabelManager.call(app);
            app.refreshIcons();
        });
    } else {
        app.showConfirm('Sei sicuro di voler eliminare questa etichetta?', () => {
            app.state.data.speseEtichette = app.state.data.speseEtichette.filter(l => l.id !== labelId);
            app.saveToStorage('data', app.state.data);
            app.showNotification('Etichetta eliminata');
            showLabelManager.call(app);
            app.refreshIcons();
        });
    }
}
// Fine funzione deleteLabel

// === FUNZIONI FILTRI E ORDINAMENTO ===
// Inizio funzione getFilteredAndSortedSpese
function getFilteredAndSortedSpese() {
    const app = this;
    let spese = [...(app.state.data.spese || [])];
    const {
        query,
        month,
        year,
        labelId
    } = speseState.filters;

    if (query) {
        const lowerQuery = query.toLowerCase();
        spese = spese.filter(s => (s.description?.toLowerCase() || '').includes(lowerQuery) || (s.fornitore?.toLowerCase() || '').includes(lowerQuery));
    }
    if (month !== 'all') {
        spese = spese.filter(s => (new Date(s.date).getMonth() + 1).toString() === month);
    }
    if (year !== 'all') {
        spese = spese.filter(s => new Date(s.date).getFullYear().toString() === year);
    }
    if (labelId !== 'all') {
        spese = spese.filter(s => s.labelId === labelId);
    }

    spese.sort((a, b) => {
        const dir = speseState.sort.direction === 'asc' ? 1 : -1;
        switch (speseState.sort.column) {
            case 'date':
                return (new Date(a.date) - new Date(b.date)) * dir;
            case 'description':
                return (a.description || '').localeCompare(b.description || '') * dir;
            case 'fornitore':
                return (a.fornitore || '').localeCompare(b.fornitore || '') * dir;
            case 'amount':
                return (a.amount - b.amount) * dir;
            default:
                return 0;
        }
    });
    return spese;
}
// Fine funzione getFilteredAndSortedSpese

// Inizio funzione sortSpese
function sortSpese(column) {
    const app = this;
    if (speseState.sort.column === column) {
        speseState.sort.direction = speseState.sort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        speseState.sort.column = column;
        speseState.sort.direction = 'asc';
    }
    renderSpeseTable.call(app);
}
// Fine funzione sortSpese

// === FUNZIONI STATISTICHE ===
// Inizio funzione getSpeseStats
function getSpeseStats() {
    const spese = getFilteredAndSortedSpese.call(this);
    const total = spese.reduce((sum, s) => sum + s.amount, 0);
    const count = spese.length;
    const average = count > 0 ? total / count : 0;
    return {
        total,
        count,
        average
    };
}
// Fine funzione getSpeseStats

// === FUNZIONI RENDER TABELLA E STATS ===
// Inizio funzione refreshSpeseView
function refreshSpeseView() {
    renderSpeseTable.call(this);
    const stats = getSpeseStats.call(this);
    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = this.formatCurrency(stats.total);
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = stats.count;
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = this.formatCurrency(stats.average);
}
// Fine funzione refreshSpeseView

// Inizio funzione renderSpeseTable
function renderSpeseTable() {
    const app = this;
    const tbody = document.getElementById('spese-tbody');
    if (!tbody) return;
    const spese = getFilteredAndSortedSpese.call(app);
    const etichette = app.state.data.speseEtichette.reduce((acc, label) => {
        acc[label.id] = label;
        return acc;
    }, {});

    if (spese.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-12">
            <div class="empty-state">
                <i data-lucide="receipt"></i>
                <div class="empty-state-title">Nessuna spesa trovata</div>
                <div class="empty-state-description">Aggiungi una nuova spesa o modifica i filtri.</div>
            </div>
        </td></tr>`;
    } else {
        tbody.innerHTML = spese.map(spesa => {
            const label = etichette[spesa.labelId] || etichette['default'];
            const labelColor = label?.color || '#6b7280';
            return `
                <tr class="hover:bg-secondary">
                    <td class="font-medium text-primary">${app.formatDate(spesa.date)}</td>
                    <td class="text-primary">${spesa.description}</td>
                    <td class="text-secondary">${spesa.fornitore || '-'}</td>
                    <td>
                        <span class="etichetta-badge" style="background-color: ${labelColor}33; color: ${labelColor}; border: 1px solid ${labelColor}80;">
                            ${label?.name || 'Generale'}
                        </span>
                    </td>
                    <td class="font-bold text-danger">${app.formatCurrency(spesa.amount)}</td>
                    <td class="text-right">
                        <div class="flex items-center justify-end space-x-2">
                            <button class="btn btn-success btn-sm" onclick="editSpesaById('${spesa.id}')" title="Modifica spesa"><i data-lucide="edit"></i></button>
                            <button class="btn btn-danger btn-sm" onclick="deleteSpesaById('${spesa.id}')" title="Elimina spesa"><i data-lucide="trash-2"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    app.refreshIcons();
}
// Fine funzione renderSpeseTable

// === FUNZIONI GLOBALI PER EVENTI ===
// Inizio funzione editSpesaById
function editSpesaById(spesaId) {
    const app = getApp();
    const spesa = app.state.data.spese.find(s => s.id === spesaId);
    if (spesa) showCreateSpesa.call(app, spesa);
}
// Fine funzione editSpesaById

// Inizio funzione deleteSpesaById
function deleteSpesaById(spesaId) {
    const app = getApp();
    deleteSpesa.call(app, spesaId);
}
// Fine funzione deleteSpesaById

// Inizio funzione editLabel
function editLabel(labelId) {
    const app = getApp();
    const label = app.state.data.speseEtichette.find(l => l.id === labelId);
    if (!label) return;
    speseState.editingLabel = label;
    speseState.labelForm = { ...label
    };

    document.getElementById('label-name').value = label.name;
    document.getElementById('label-color-value').value = label.color;

    document.querySelectorAll('#label-color-picker .label-color-swatch').forEach(btn => {
        const isSelected = btn.dataset.color === label.color;
        btn.style.borderColor = isSelected ? 'var(--color-primary)' : 'var(--bg-primary)';
        btn.style.boxShadow = `0 0 0 1px ${isSelected ? 'var(--color-primary)' : 'var(--border-secondary)'}`;
    });

    document.getElementById('save-label-btn').textContent = 'Salva';
}
// Fine funzione editLabel

// Inizio funzione deleteLabel
function deleteLabel(labelId) {
    const app = getApp();
    if (labelId === 'default') return app.showNotification('Impossibile eliminare l\'etichetta predefinita', 'error');
    const speseAssociate = app.state.data.spese.filter(s => s.labelId === labelId).length;
    if (speseAssociate > 0) {
        return app.showConfirm(`Ci sono ${speseAssociate} spese associate a questa etichetta. Spostarle in "Generale" prima di eliminare?`, () => {
            app.state.data.spese = app.state.data.spese.map(s => {
                if (s.labelId === labelId) return { ...s,
                    labelId: 'default'
                };
                return s;
            });
            app.state.data.speseEtichette = app.state.data.speseEtichette.filter(l => l.id !== labelId);
            app.saveToStorage('data', app.state.data);
            app.showNotification('Etichetta eliminata e spese spostate');
            showLabelManager.call(app);
            app.refreshIcons();
        });
    } else {
        app.showConfirm('Sei sicuro di voler eliminare questa etichetta?', () => {
            app.state.data.speseEtichette = app.state.data.speseEtichette.filter(l => l.id !== labelId);
            app.saveToStorage('data', app.state.data);
            app.showNotification('Etichetta eliminata');
            showLabelManager.call(app);
            app.refreshIcons();
        });
    }
}
// Fine funzione deleteLabel

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initSpese = initSpese;
    window.renderSpeseSection = renderSpeseSection;
    window.editSpesaById = editSpesaById;
    window.deleteSpesaById = deleteSpesaById;
    window.editLabel = editLabel;
    window.deleteLabel = deleteLabel;
    window.speseState = speseState;
}
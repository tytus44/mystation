// =============================================
// FILE: spese.js (Vanilla JavaScript Version)
// DESCrizione: Modulo per la gestione della
// sezione Spese (registrazione, etichette, report).
// =============================================

// === STATO LOCALE DEL MODULO SPESE ===
let speseState = {
    filters: {
        month: (new Date().getMonth() + 1).toString(),
        year: new Date().getFullYear().toString(),
        tagId: 'all'
    },
    sort: { column: 'date', direction: 'desc' },
    expenseForm: {
        id: null,
        date: '',
        description: '',
        amount: null,
        paymentMethod: 'carta',
        tagId: ''
    },
    tagForm: {
        id: null,
        name: '',
        color: '#6b7280'
    },
    editingTagId: null,
    speseCollapsed: false // Stato per collassare la tabella spese
};

// === COSTANTI ===
const PAYMENT_METHODS = {
    'carta': 'Carta di Credito',
    'contanti': 'Contanti',
    'bonifico': 'Bonifico',
    'addebito': 'Addebito C/C'
};

const TAG_COLORS = [
    '#3b82f6', '#10b981', '#FF204E', '#f59e0b', '#8b5cf6', '#06b6d4', '#6b7280',
    '#ec4899', '#14b8a6', '#d946ef'
];

// === INIZIALIZZAZIONE MODULO SPESE ===
function initSpese() {
    console.log('💸 Inizializzazione modulo Spese...');
    const app = this;
    
    speseState.filters = app.loadFromStorage('speseFilters', {
        month: (new Date().getMonth() + 1).toString(),
        year: new Date().getFullYear().toString(),
        tagId: 'all'
    });
    
    speseState.speseCollapsed = app.loadFromStorage('speseCollapsed', false); // Carica stato collasso
    
    resetExpenseForm.call(app);
    
    console.log('✅ Modulo Spese inizializzato');
}

// === RENDER SEZIONE SPESE ===
function renderSpeseSection(container) {
    console.log('🎨 Rendering sezione Spese...');
    const app = this;
    
    const stats = calculateStats.call(app); // Calcola le statistiche aggiornate
    
    container.innerHTML = `
        <div class="space-y-6">
            
            <div id="spese-stats-container" class="stats-grid"> 
                ${getSpeseStatsHTML(app, stats)} 
            </div>

            <div class="filters-bar">
                <div class="filter-group">
                    <label class="form-label">Mese</label>
                    <select id="spese-filter-month" class="form-control" style="max-width: 150px;">
                        ${getMonthOptions(speseState.filters.month)}
                    </select>
                </div>
                <div class="filter-group">
                    <label class="form-label">Anno</label>
                    <select id="spese-filter-year" class="form-control" style="max-width: 120px;">
                        ${getYearOptions(app, speseState.filters.year)}
                    </select>
                </div>
                <div class="filter-group">
                    <label class="form-label">Etichetta</label>
                    <select id="spese-filter-tag" class="form-control" style="max-width: 200px;">
                        ${getTagOptions(app, speseState.filters.tagId, true)}
                    </select>
                </div>
                <div class="flex items-center space-x-2" style="margin-left: auto;">
                    <button id="manage-tags-btn" class="btn btn-secondary">
                        <i data-lucide="tags" class="w-4 h-4 mr-2"></i> Gestisci Etichette
                    </button>
                    <button id="new-spesa-btn" class="btn btn-primary">
                        <i data-lucide="plus" class="w-4 h-4 mr-2"></i> Nuova Spesa
                    </button>
                </div>
            </div>

            <div class="card collapsible-section ${speseState.speseCollapsed ? 'collapsed' : ''}">
                <div class="card-header collapsible-header" data-section-name="spese">
                    <h2 class="card-title">Elenco Spese</h2>
                    <button class="collapse-toggle"><i data-lucide="chevron-up"></i></button> 
                </div>
                <div class="card-body collapsible-content" style="padding: 0;">
                    <div class="table-container" style="border: none; border-radius: 0;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>
                                        <button data-sort="date">
                                            Data <i data-lucide="${speseState.sort.column === 'date' ? (speseState.sort.direction === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down'}"></i>
                                        </button>
                                    </th>
                                    <th>Descrizione</th>
                                    <th>Etichetta</th>
                                    <th>
                                        <button data-sort="amount">
                                            Importo <i data-lucide="${speseState.sort.column === 'amount' ? (speseState.sort.direction === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down'}"></i>
                                        </button>
                                    </th>
                                    <th>Pagamento</th>
                                    <th>Azioni</th>
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
    setupSpeseEventListeners.call(app);
    app.refreshIcons();
}


function getSpeseStatsHTML(app, stats) {
    // Genera HTML per riepilogo per etichetta
    const totalByTagHTML = Object.entries(stats.totalByTag)
        .sort(([, a], [, b]) => b.total - a.total)
        .map(([tagId, data]) => `
            <div class="flex justify-between items-center text-sm py-1">
                <div class="flex items-center" style="gap: 0.75rem;"> 
                    <span style="width: 10px; height: 10px; background-color: ${data.color}; border-radius: 50%;"></span>
                    <span class="font-medium">${data.name}</span>
                </div>
                <span class="font-bold">${app.formatCurrency(data.total)}</span>
            </div>
        `).join('');

    // Genera HTML per riepilogo per modalità
    const totalByPaymentHTML = Object.entries(stats.totalByPaymentMethod)
        .sort(([, a], [, b]) => b.total - a.total) // Ordina per totale decrescente
        .map(([key, data]) => `
            <div class="flex justify-between items-center text-sm py-1">
                <span class="font-medium">${data.name}</span>
                <span class="font-bold">${app.formatCurrency(data.total)}</span>
            </div>
        `).join('');

    // Ritorna l'HTML per tutte e tre le card della griglia
    return `
        <div class="stat-card" style="background-color: #3b82f6; border-color: #2563eb;">
            <div class="stat-content">
                <div class="stat-label" style="color: #ffffff;">Totale Spese (Periodo)</div>
                <div class="stat-value" style="color: #ffffff;">${app.formatCurrency(stats.totalPeriod)}</div>
            </div>
            <div class="stat-icon blue">
                <i data-lucide="trending-down"></i>
            </div>
        </div>

        <div class="card"> 
            <div class="card-header"><h3 class="card-title">Riepilogo per Etichetta</h3></div>
            <div class="card-body" style="padding: 1rem 1.5rem; max-height: 150px; overflow-y: auto;"> 
                ${totalByTagHTML || '<p class="text-secondary text-sm">Nessuna spesa nel periodo.</p>'}
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h3 class="card-title">Riepilogo per Modalità</h3></div>
            <div class="card-body" style="padding: 1rem 1.5rem; max-height: 150px; overflow-y: auto;"> 
                ${totalByPaymentHTML || '<p class="text-secondary text-sm">Nessuna spesa nel periodo.</p>'}
            </div>
        </div>
    `;
}

// === FUNZIONI TABELLA E FILTRI ===

function renderSpeseTable() {
    const app = this;
    const tbody = document.getElementById('spese-tbody');
    if (!tbody) return;

    const expenses = getFilteredAndSortedExpenses.call(app);
    const tagsMap = getTagsMap.call(app);

    if (expenses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-12">
                    <div class="empty-state">
                        <i data-lucide="receipt"></i>
                        <div class="empty-state-title">Nessuna spesa trovata</div>
                        <div class="empty-state-description">Aggiungi una nuova spesa o modifica i filtri.</div>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = expenses.map(spesa => {
            const tag = tagsMap[spesa.tagId];
            const tagHTML = tag 
                ? `<span class="etichetta-badge" style="background-color: ${tag.color}20; color: ${tag.color}; border: 1px solid ${tag.color}80;">${tag.name}</span>`
                : '<span class="text-secondary">-</span>';
            
            return `
                <tr class="hover:bg-secondary">
                    <td class="font-medium text-primary">${app.formatDate(spesa.date)}</td>
                    <td>${spesa.description}</td>
                    <td>${tagHTML}</td>
                    <td class="font-bold text-danger">${app.formatCurrency(spesa.amount)}</td>
                    <td>${PAYMENT_METHODS[spesa.paymentMethod] || spesa.paymentMethod}</td>
                    <td class="text-right">
                        <div class="flex items-center justify-end space-x-2">
                            <button class="btn btn-success btn-sm" onclick="editSpesaById('${spesa.id}')" title="Modifica">
                                <i data-lucide="edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteSpesaById('${spesa.id}')" title="Elimina">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    app.refreshIcons();
}

function getFilteredAndSortedExpenses() {
    const app = this;
    let expenses = [...(app.state.data.spese || [])];
    
    // Filtra per mese e anno
    if (speseState.filters.month !== 'all') {
        expenses = expenses.filter(s => (new Date(s.date).getMonth() + 1).toString() === speseState.filters.month);
    }
    if (speseState.filters.year !== 'all') {
        expenses = expenses.filter(s => new Date(s.date).getFullYear().toString() === speseState.filters.year);
    }
    
    // Filtra per etichetta
    if (speseState.filters.tagId !== 'all') {
        expenses = expenses.filter(s => s.tagId === speseState.filters.tagId);
    }

    // Ordina
    expenses.sort((a, b) => {
        const dir = speseState.sort.direction === 'asc' ? 1 : -1;
        if (speseState.sort.column === 'date') {
            return (new Date(a.date) - new Date(b.date)) * dir;
        }
        if (speseState.sort.column === 'amount') {
            return (a.amount - b.amount) * dir;
        }
        return 0;
    });
    
    return expenses;
}

function calculateStats() {
    const app = this;
    const expenses = getFilteredAndSortedExpenses.call(app);
    const tagsMap = getTagsMap.call(app); // Usa .call(this) o assicurati sia definita correttamente

    const stats = {
        totalPeriod: 0,
        totalByTag: {},
        totalByPaymentMethod: {} // Inizializza l'oggetto
    };

    expenses.forEach(spesa => {
        stats.totalPeriod += spesa.amount;
        
        // Calcolo per Etichetta
        const tagId = spesa.tagId || 'none';
        const tag = tagsMap[tagId] || { name: 'Senza Etichetta', color: '#6b7280' };
        if (!stats.totalByTag[tagId]) {
            stats.totalByTag[tagId] = { name: tag.name, color: tag.color, total: 0 };
        }
        stats.totalByTag[tagId].total += spesa.amount;

        // Calcolo per Metodo di Pagamento
        const paymentMethodKey = spesa.paymentMethod;
        const paymentMethodName = PAYMENT_METHODS[paymentMethodKey] || paymentMethodKey; 
        if (!stats.totalByPaymentMethod[paymentMethodKey]) {
            stats.totalByPaymentMethod[paymentMethodKey] = { name: paymentMethodName, total: 0 };
        }
        stats.totalByPaymentMethod[paymentMethodKey].total += spesa.amount;
    });

    return stats;
}


// === EVENT LISTENERS ===

function setupSpeseEventListeners() {
    const container = document.getElementById('section-spese');
    if (!container) return;

    container.removeEventListener('click', handleSpeseClick);
    container.removeEventListener('change', handleSpeseChange);
    
    container.addEventListener('click', handleSpeseClick);
    container.addEventListener('change', handleSpeseChange);
}

function handleSpeseClick(event) {
    const app = getApp();
    const target = event.target;

    // Gestione collasso tabella
    const collapsibleHeader = target.closest('.collapsible-header[data-section-name="spese"]');
    if (collapsibleHeader) {
        const sectionEl = collapsibleHeader.closest('.collapsible-section');
        const isCollapsed = sectionEl.classList.toggle('collapsed');
        speseState.speseCollapsed = isCollapsed;
        app.saveToStorage('speseCollapsed', isCollapsed);
        app.refreshIcons(); // Aggiorna l'icona chevron
        return; // Interrompi qui se è stato cliccato l'header
    }

    // Gestione altri bottoni
    if (target.closest('#new-spesa-btn')) {
        showSpesaModal.call(app);
    }
    if (target.closest('#manage-tags-btn')) {
        showTagModal.call(app);
    }
    
    const sortBtn = target.closest('[data-sort]');
    if (sortBtn) {
        sortSpese.call(app, sortBtn.dataset.sort);
    }
}

function handleSpeseChange(event) {
    const app = getApp();
    const target = event.target;
    let filtersChanged = false;
    
    if (target.id === 'spese-filter-month') {
        speseState.filters.month = target.value;
        filtersChanged = true;
    }
    if (target.id === 'spese-filter-year') {
        speseState.filters.year = target.value;
        filtersChanged = true;
    }
    if (target.id === 'spese-filter-tag') {
        speseState.filters.tagId = target.value;
        filtersChanged = true;
    }

    if (filtersChanged) {
        app.saveToStorage('speseFilters', speseState.filters);
        // Rirenderizza statistiche e tabella
        const stats = calculateStats.call(app);
        document.getElementById('spese-stats-container').innerHTML = getSpeseStatsHTML(app, stats);
        renderSpeseTable.call(app);
        app.refreshIcons();
    }
}

function sortSpese(column) {
    const app = getApp();
    if (speseState.sort.column === column) {
        speseState.sort.direction = speseState.sort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        speseState.sort.column = column;
        speseState.sort.direction = 'desc';
    }
    
    // Aggiorna icone header tabella
    document.querySelectorAll('#spese-tbody th button[data-sort]').forEach(btn => {
        const icon = btn.querySelector('i');
        if(!icon) return; // Aggiunto controllo se l'icona esiste
        if (btn.dataset.sort === speseState.sort.column) {
            icon.setAttribute('data-lucide', speseState.sort.direction === 'asc' ? 'chevron-up' : 'chevron-down');
        } else {
            icon.setAttribute('data-lucide', 'chevrons-up-down');
        }
    });
    
    renderSpeseTable.call(app);
    app.refreshIcons();
}

// === MODALE SPESA (Aggiungi/Modifica) ===

function resetExpenseForm() {
    const app = this;
    speseState.expenseForm = {
        id: null,
        date: app.getTodayFormatted(),
        description: '',
        amount: null,
        paymentMethod: 'carta',
        tagId: ''
    };
}

function showSpesaModal(spesa = null) {
    const app = this;
    
    if (spesa) {
        speseState.expenseForm = {
            id: spesa.id,
            date: app.formatToItalianDate(spesa.date),
            description: spesa.description,
            amount: spesa.amount,
            paymentMethod: spesa.paymentMethod,
            tagId: spesa.tagId
        };
    } else {
        resetExpenseForm.call(app);
    }

    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getSpesaFormHTML.call(app);
    
    modalContentEl.classList.remove('modal-wide');
    
    setupSpesaFormEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
    document.getElementById('spesa-description')?.focus();
}

function getSpesaFormHTML() {
    const app = this;
    const form = speseState.expenseForm;
    const isEditing = !!form.id;

    const paymentOptions = Object.entries(PAYMENT_METHODS).map(([key, value]) => 
        `<option value="${key}" ${form.paymentMethod === key ? 'selected' : ''}>${value}</option>`
    ).join('');
    
    const tagOptions = getTagOptions(app, form.tagId, true, 'Nessuna Etichetta');

    return `
        <div class="card-header">
            <h2 class="card-title">${isEditing ? 'Modifica Spesa' : 'Nuova Spesa'}</h2>
        </div>
        <div class="card-body">
            <div class="space-y-4">
                <div class="form-group">
                    <label class="form-label">Descrizione</label>
                    <input type="text" id="spesa-description" class="form-control" style="max-width: 100%;" 
                           value="${form.description}" placeholder="es. Cancelleria, Bolletta, etc.">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Importo (€)</label>
                        <input type="number" id="spesa-amount" class="form-control" style="max-width: 100%;" 
                               step="0.01" placeholder="0.00" value="${form.amount || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Data</label>
                        <input type="text" id="spesa-date" class="form-control" style="max-width: 100%;" 
                               value="${form.date}" placeholder="gg.mm.aaaa">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Metodo Pagamento</label>
                        <select id="spesa-paymentMethod" class="form-control" style="max-width: 100%;">
                            ${paymentOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Etichetta</label>
                        <select id="spesa-tagId" class="form-control" style="max-width: 100%;">
                            ${tagOptions}
                        </select>
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-end space-x-4 mt-6">
                <button id="cancel-spesa-btn" class="btn btn-secondary">Annulla</button>
                <button id="save-spesa-btn" class="btn btn-success">Salva Spesa</button>
            </div>
        </div>
    `;
}

function setupSpesaFormEventListeners() {
    const app = getApp();
    document.getElementById('save-spesa-btn').addEventListener('click', () => saveSpesa.call(app));
    document.getElementById('cancel-spesa-btn').addEventListener('click', () => app.hideFormModal());
}

function saveSpesa() {
    const app = this;
    const description = document.getElementById('spesa-description').value.trim();
    const amount = parseFloat(document.getElementById('spesa-amount').value);
    const date = document.getElementById('spesa-date').value.trim();
    
    if (!description || isNaN(amount) || amount <= 0 || !date) {
        return app.showNotification('Descrizione, importo e data sono obbligatori.', 'error');
    }
    if (!app.validateItalianDate(date)) {
        return app.showNotification('Formato data non valido. Usa gg.mm.aaaa', 'error');
    }
    
    const parsedDate = app.parseItalianDate(date).toISOString();
    
    const spesaData = {
        date: parsedDate,
        description: description,
        amount: amount,
        paymentMethod: document.getElementById('spesa-paymentMethod').value,
        tagId: document.getElementById('spesa-tagId').value || null
    };

    if (speseState.expenseForm.id) {
        // Modifica
        const index = app.state.data.spese.findIndex(s => s.id === speseState.expenseForm.id);
        if (index !== -1) {
            app.state.data.spese[index] = { ...app.state.data.spese[index], ...spesaData };
            app.showNotification('Spesa aggiornata');
        }
    } else {
        // Nuovo
        const newSpesa = {
            id: app.generateUniqueId('spesa'),
            ...spesaData
        };
        app.state.data.spese.push(newSpesa);
        app.showNotification('Spesa aggiunta');
    }

    app.saveToStorage('data', app.state.data);
    app.hideFormModal();
    renderSpeseSection.call(app, document.getElementById('section-spese'));
}

function deleteSpesa(spesaId) {
    const app = this;
    const spesa = app.state.data.spese.find(s => s.id === spesaId);
    if (!spesa) return;

    app.showConfirm(
        `Sei sicuro di voler eliminare la spesa?<br>"${spesa.description}" - ${app.formatCurrency(spesa.amount)}`,
        () => {
            app.state.data.spese = app.state.data.spese.filter(s => s.id !== spesaId);
            app.saveToStorage('data', app.state.data);
            app.showNotification('Spesa eliminata');
            renderSpeseSection.call(app, document.getElementById('section-spese'));
        }
    );
}

// === MODALE ETICHETTE (Gestione) ===

function showTagModal() {
    const app = this;
    speseState.editingTagId = null;
    resetTagForm();
    
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getTagManagerHTML.call(app);
    
    modalContentEl.classList.remove('modal-wide');
    modalContentEl.classList.add('modal-todo'); // Riusa stile modale todo
    
    setupTagManagerEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
}

function getTagManagerHTML() {
    const app = this;
    const tags = app.state.data.speseEtichette || [];
    const form = speseState.tagForm;
    const isEditing = !!speseState.editingTagId;

    const colorOptions = TAG_COLORS.map(color => 
        `<label class="color-radio" style="margin: 0;" title="${color}">
            <input type="radio" name="tag-color" value="${color}" ${form.color === color ? 'checked' : ''}>
            <span style="background-color: ${color}; width: 28px; height: 28px;"></span>
        </label>`
    ).join('');

    const tagsList = tags.map(tag => `
        <div class="todo-item" style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem;">
            <div class="flex items-center" style="gap: 0.75rem;"> 
                <span style="width: 14px; height: 14px; background-color: ${tag.color}; border-radius: 50%;"></span>
                <span class_="font-medium">${tag.name}</span>
            </div>
            <div class="flex items-center space-x-1">
                <button class="btn btn-success btn-xs" onclick="editSpeseTag('${tag.id}')" title="Modifica">
                    <i data-lucide="edit"></i>
                </button>
                <button class="btn btn-danger btn-xs" onclick="deleteSpeseTag('${tag.id}')" title="Elimina">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
    `).join('');

    return `
        <div class="card-header"><h2 class="card-title">Gestisci Etichette Spese</h2></div>
        <div class="card-body">
            <div class="space-y-4">
                <div class="p-4" style="border: 1px solid var(--border-primary); border-radius: var(--radius-md);">
                    <h4 class="font-medium text-primary mb-3">${isEditing ? 'Modifica Etichetta' : 'Nuova Etichetta'}</h4>
                    <div class="form-group">
                        <label class="form-label">Nome</label>
                        <input type="text" id="tag-name-input" class="form-control" style="max-width: 100%;" 
                               value="${form.name}" placeholder="es. Utenze, Manutenzione...">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Colore</label>
                        <div class="color-picker-group" style="flex-wrap: wrap; gap: 0.75rem;">
                            ${colorOptions}
                        </div>
                    </div>
                    <div class="flex items-center justify-end space-x-2 mt-4">
                        ${isEditing ? `<button id="cancel-edit-tag-btn" class="btn btn-secondary">Annulla</button>` : ''}
                        <button id="save-tag-btn" class="btn btn-success">${isEditing ? 'Salva Modifiche' : 'Aggiungi'}</button>
                    </div>
                </div>
                
                <div class="space-y-2" style="max-height: 250px; overflow-y: auto; padding-right: 0.5rem;">
                    ${tagsList || '<p class="text-secondary text-sm text-center">Nessuna etichetta creata.</p>'}
                </div>
            </div>
            <div class="flex justify-end space-x-4 mt-6">
                <button id="close-tag-modal-btn" class="btn btn-secondary">Chiudi</button>
            </div>
        </div>
    `;
}

function setupTagManagerEventListeners() {
    const app = getApp();
    document.getElementById('save-tag-btn').addEventListener('click', () => saveSpeseTag.call(app));
    document.getElementById('close-tag-modal-btn').addEventListener('click', () => app.hideFormModal());
    
    const cancelBtn = document.getElementById('cancel-edit-tag-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            speseState.editingTagId = null;
            resetTagForm();
            refreshTagModal.call(app);
        });
    }
}

function saveSpeseTag() {
    const app = this;
    const name = document.getElementById('tag-name-input').value.trim();
    const colorRadio = document.querySelector('input[name="tag-color"]:checked');
    
    if (!name || !colorRadio) {
        return app.showNotification('Nome e colore sono obbligatori.', 'error');
    }
    
    const color = colorRadio.value;

    if (speseState.editingTagId) {
        // Modifica
        const index = app.state.data.speseEtichette.findIndex(t => t.id === speseState.editingTagId);
        if (index !== -1) {
            app.state.data.speseEtichette[index] = { id: speseState.editingTagId, name, color };
            app.showNotification('Etichetta aggiornata');
        }
    } else {
        // Nuovo
        const newTag = {
            id: app.generateUniqueId('tag'),
            name,
            color
        };
        app.state.data.speseEtichette.push(newTag);
        app.showNotification('Etichetta aggiunta');
    }
    
    app.saveToStorage('data', app.state.data);
    speseState.editingTagId = null;
    resetTagForm();
    refreshTagModal.call(app); // Ricarica solo il contenuto del modale
}

function editSpeseTag(tagId) {
    const app = getApp();
    const tag = app.state.data.speseEtichette.find(t => t.id === tagId);
    if (tag) {
        speseState.editingTagId = tag.id;
        speseState.tagForm = { ...tag };
        refreshTagModal.call(app);
        document.getElementById('tag-name-input').focus();
    }
}

function deleteSpeseTag(tagId) {
    const app = getApp();
    const tag = app.state.data.speseEtichette.find(t => t.id === tagId);
    if (!tag) return;

    // Controlla se l'etichetta è usata
    const isUsed = app.state.data.spese.some(s => s.tagId === tagId);
    const message = isUsed
        ? `Sei sicuro di voler eliminare l'etichetta "${tag.name}"?<br><br>È usata in alcune spese e verrà rimossa anche da esse.`
        : `Sei sicuro di voler eliminare l'etichetta "${tag.name}"?`;

    app.showConfirm(message, () => {
        // 1. Rimuovi l'etichetta
        app.state.data.speseEtichette = app.state.data.speseEtichette.filter(t => t.id !== tagId);
        
        // 2. Se era usata, rimuovi il tagId dalle spese
        if (isUsed) {
            app.state.data.spese = app.state.data.spese.map(s => {
                if (s.tagId === tagId) {
                    return { ...s, tagId: null };
                }
                return s;
            });
        }
        
        app.saveToStorage('data', app.state.data);
        app.showNotification('Etichetta eliminata');
        
        // Se stavo modificando questa, resetta il form
        if (speseState.editingTagId === tagId) {
            speseState.editingTagId = null;
            resetTagForm();
        }
        
        refreshTagModal.call(app);
    });
}

function refreshTagModal() {
    const app = this;
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getTagManagerHTML.call(app);
    setupTagManagerEventListeners.call(app);
    app.refreshIcons();
}

function resetTagForm() {
    speseState.tagForm = {
        id: null,
        name: '',
        color: TAG_COLORS[0]
    };
}


// === FUNZIONI HELPER ===

function getMonthOptions(selectedMonth) {
    const months = [
        "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
        "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];
    let options = '<option value="all">Tutti i Mesi</option>';
    months.forEach((month, index) => {
        const monthValue = (index + 1).toString();
        options += `<option value="${monthValue}" ${selectedMonth === monthValue ? 'selected' : ''}>${month}</option>`;
    });
    return options;
}

function getYearOptions(app, selectedYear) {
    const years = new Set(app.state.data.spese.map(s => new Date(s.date).getFullYear()));
    years.add(new Date().getFullYear());
    
    const sortedYears = [...years].sort((a, b) => b - a);
    
    let options = '<option value="all">Tutti gli Anni</option>';
    sortedYears.forEach(year => {
        const yearValue = year.toString();
        options += `<option value="${yearValue}" ${selectedYear === yearValue ? 'selected' : ''}>${year}</option>`;
    });
    return options;
}

function getTagOptions(app, selectedTagId, includeAll = false, noneText = 'Nessuna Etichetta') {
    const tags = app.state.data.speseEtichette.sort((a, b) => a.name.localeCompare(b.name));
    
    let options = includeAll ? '<option value="all">Tutte le Etichette</option>' : '';
    options += `<option value="">${noneText}</option>`;
    
    tags.forEach(tag => {
        options += `<option value="${tag.id}" ${selectedTagId === tag.id ? 'selected' : ''}>${tag.name}</option>`;
    });
    return options;
}

function getTagsMap() { // Rimosso 'app' come argomento
    const app = this; // Ottiene 'app' dal contesto 'this'
    return (app.state.data.speseEtichette || []).reduce((map, tag) => {
        map[tag.id] = tag;
        return map;
    }, {});
}


// === FUNZIONI GLOBALI PER EVENTI ===
function editSpesaById(spesaId) {
    const app = getApp();
    const spesa = app.state.data.spese.find(s => s.id === spesaId);
    if (spesa) {
        showSpesaModal.call(app, spesa);
    }
}

function deleteSpesaById(spesaId) {
    const app = getApp();
    deleteSpesa.call(app, spesaId);
}

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initSpese = initSpese;
    window.renderSpeseSection = renderSpeseSection;
    window.editSpesaById = editSpesaById;
    window.deleteSpesaById = deleteSpesaById;
    window.editSpeseTag = editSpeseTag;
    window.deleteSpeseTag = deleteSpeseTag;
    window.speseState = speseState;
}
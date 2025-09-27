// =============================================
// FILE: anagrafica.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Anagrafica (contatti, import/export).
// --- UNIFICATA LA CLASSE DEL PULSANTE DI CHIUSURA MODALE ---
// =============================================

// === STATO LOCALE DEL MODULO ANAGRAFICA ===
let anagraficaState = {
    // Filtri e Ordinamento
    searchQuery: '',
    sort: { column: 'cognome', direction: 'asc' },

    // Form
    contattoForm: {
        nome: '', cognome: '', azienda: '',
        telefono1: '', telefono2: '', email: '',
        note: ''
    },
    editingContatto: null,
    
    // Selezione Multipla
    selectedContatti: [],
    isSelectAllChecked: false,
};

// === INIZIALIZZAZIONE MODULO ANAGRAFICA ===
// Inizio funzione initAnagrafica
function initAnagrafica() {
    console.log('📖 Inizializzazione modulo Anagrafica...');
    const app = this;

    if (!app.state.data.contatti) app.state.data.contatti = [];

    resetContattoForm();
    console.log('✅ Modulo Anagrafica inizializzato');
}
// Fine funzione initAnagrafica

// === FUNZIONI DI RENDER ===

// Inizio funzione renderAnagraficaSection
function renderAnagraficaSection(container) {
    const app = this;
    
    container.innerHTML = `
        <div class="space-y-6">
            ${getAnagraficaHeaderHTML(app)}
            <div id="bulk-actions-container">
                ${getBulkActionsHTML()}
            </div>
            <div class="card">
                <div id="contatti-cards-container" class="cards-container">
                    </div>
            </div>
        </div>
    `;

    renderContattiGrid.call(this);
    setupAnagraficaEventListeners.call(this);
    
    app.refreshIcons();
}
// Fine funzione renderAnagraficaSection

// Inizio funzione renderContattiGrid
function renderContattiGrid() {
    const app = this;
    const container = document.getElementById('contatti-cards-container');
    if (!container) return;

    const contatti = getFilteredAndSortedContatti.call(this);
    container.innerHTML = getContattiCardsHTML(app, contatti);
    updateBulkActions.call(this);
    
    app.refreshIcons();
}
// Fine funzione renderContattiGrid

// Inizio funzione getAnagraficaHeaderHTML
function getAnagraficaHeaderHTML(app) {
    return `
        <div class="filters-bar">
            <div class="filter-group">
                <label class="form-label">Cerca</label>
                <div class="input-group">
                    <i data-lucide="search" class="input-group-icon"></i>
                    <input type="search" id="anagrafica-search" class="form-control" 
                           placeholder="Nome, cognome, note..." value="${anagraficaState.searchQuery}" style="max-width: 100%;" autocomplete="off">
                </div>
            </div>
            <div class="filter-group">
                <label class="form-label">Ordina per</label>
                <select id="anagrafica-sort" class="form-control" style="max-width: 100%;">
                    <option value="cognome">Cognome</option>
                    <option value="nome">Nome</option>
                    <option value="azienda">Azienda</option>
                </select>
            </div>
            <div class="flex space-x-2">
                <button id="export-contatti-btn" class="btn btn-secondary">
                    <i data-lucide="download" class="w-4 h-4 mr-2"></i> Esporta
                </button>
                <button id="new-contatto-btn" class="btn btn-primary">
                    <i data-lucide="user-plus" class="w-4 h-4 mr-2"></i> Nuovo Contatto
                </button>
            </div>
        </div>
    `;
}
// Fine funzione getAnagraficaHeaderHTML

// Inizio funzione getBulkActionsHTML
function getBulkActionsHTML() {
    const count = anagraficaState.selectedContatti.length;
    if (count === 0) return '';
    return `
        <div class="bulk-actions-bar">
            <div class="flex items-center space-x-4">
                <span>${count} contatti selezionati</span>
            </div>
            <button id="bulk-delete-btn" class="btn btn-danger btn-sm">
                <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i> Elimina Selezionati
            </button>
        </div>
    `;
}
// Fine funzione getBulkActionsHTML

// Inizio funzione generateHslColorFromString
function generateHslColorFromString(str) {
    const isDarkMode = document.body.classList.contains('theme-dark');
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    const h = Math.abs(hash % 360);
    
    if (isDarkMode) {
        // Colori tenui per il tema scuro: bassa saturazione, bassa luminosità
        const s = 30;
        const l_bg = 20;
        const l_border = 30;
        return {
            background: `hsl(${h}, ${s}%, ${l_bg}%)`,
            border: `hsl(${h}, ${s}%, ${l_border}%)`
        };
    } else {
        // Colori pastello per il tema chiaro: alta saturazione, alta luminosità
        const s = 80;
        const l_bg = 95;
        const l_border = 85;
        return {
            background: `hsl(${h}, ${s}%, ${l_bg}%)`,
            border: `hsl(${h}, ${s}%, ${l_border}%)`
        };
    }
}
// Fine funzione generateHslColorFromString

// Inizio funzione getContattiCardsHTML
function getContattiCardsHTML(app, contatti) {
    if (contatti.length === 0) {
        return `
            <div class="empty-state p-12">
                <i data-lucide="users"></i>
                <div class="empty-state-title">Nessun contatto trovato</div>
                <div class="empty-state-description">Aggiungi un nuovo contatto o cambia il filtro.</div>
            </div>`;
    }

    return `
        <div class="select-all-container">
            <label class="checkbox-container">
                <input type="checkbox" id="select-all-contatti" ${anagraficaState.isSelectAllChecked ? 'checked' : ''}>
                <span class="checkmark"></span>
                Seleziona tutti i contatti visualizzati
            </label>
        </div>
        <div class="contatti-grid">
            ${contatti.map((c) => {
                const isSelected = anagraficaState.selectedContatti.includes(c.id);
                const iniziali = `${(c.nome || '').charAt(0)}${(c.cognome || '').charAt(0)}`.toUpperCase();
                
                const contattiInfo = [];
                if (c.telefono1) contattiInfo.push(`<i data-lucide="phone" class="w-4 h-4"></i> ${c.telefono1}`);
                if (c.telefono2) contattiInfo.push(`<i data-lucide="phone" class="w-4 h-4"></i> ${c.telefono2}`);
                if (c.email) contattiInfo.push(`<i data-lucide="mail" class="w-4 h-4"></i> ${c.email}`);
                
                const contactColors = generateHslColorFromString(c.id);
                const cardStyle = `background-color: ${contactColors.background}; border-color: ${contactColors.border};`;
                
                return `
                    <div class="contatto-card ${isSelected ? 'selected' : ''}" data-contatto-id="${c.id}" style="${cardStyle}">
                        <div class="contatto-card-header">
                            <label class="checkbox-container" onclick="event.stopPropagation()">
                                <input type="checkbox" class="contatto-checkbox" data-id="${c.id}" ${isSelected ? 'checked' : ''}>
                                <span class="checkmark"></span>
                            </label>
                            <div class="contatto-avatar">
                                ${iniziali || '?'}
                            </div>
                            <div class="contatto-main-info">
                                <h3 class="contatto-name">${c.cognome} ${c.nome}</h3>
                                ${c.azienda ? `<p class="contatto-company">${c.azienda}</p>` : ''}
                            </div>
                            <div class="contatto-actions">
                                <button class="btn-icon edit-contatto-btn" data-id="${c.id}" title="Modifica">
                                    <i data-lucide="edit-2"></i>
                                </button>
                                <button class="btn-icon delete-contatto-btn" data-id="${c.id}" title="Elimina">
                                    <i data-lucide="trash-2"></i>
                                </button>
                            </div>
                        </div>
                        ${contattiInfo.length > 0 ? `
                            <div class="contatto-card-body">
                                <div class="contatti-info">
                                    ${contattiInfo.map(info => `<div class="contatto-info-item">${info}</div>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${c.note ? `
                            <div class="contatto-card-footer">
                                <div class="contatto-note">
                                    <i data-lucide="file-text" class="w-4 h-4"></i>
                                    <span>${c.note}</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}
// Fine funzione getContattiCardsHTML

// === FUNZIONI DI UTILITÀ ===

// Inizio funzione getFilteredAndSortedContatti
function getFilteredAndSortedContatti() {
    const app = this;
    let contatti = [...(app.state.data.contatti || [])];

    if (anagraficaState.searchQuery) {
        const query = anagraficaState.searchQuery.toLowerCase();
        contatti = contatti.filter(c => 
            (c.nome?.toLowerCase() || '').includes(query) ||
            (c.cognome?.toLowerCase() || '').includes(query) ||
            (c.azienda?.toLowerCase() || '').includes(query) ||
            (c.telefono1?.toLowerCase() || '').includes(query) ||
            (c.telefono2?.toLowerCase() || '').includes(query) ||
            (c.email?.toLowerCase() || '').includes(query) ||
            (c.note?.toLowerCase() || '').includes(query)
        );
    }

    const { column, direction } = anagraficaState.sort;
    contatti.sort((a, b) => {
        const aVal = (a[column] || '').toString().toLowerCase();
        const bVal = (b[column] || '').toString().toLowerCase();
        const comparison = aVal.localeCompare(bVal);
        return direction === 'asc' ? comparison : -comparison;
    });

    return contatti;
}
// Fine funzione getFilteredAndSortedContatti

// === EVENT LISTENERS ===

// Inizio funzione setupAnagraficaEventListeners
function setupAnagraficaEventListeners() {
    const app = this;
    const container = document.getElementById('section-anagrafica');
    if (!container) return;

    // Listener unico per azioni multiple (Event Delegation)
    container.addEventListener('click', (e) => {
        const newContattoBtn = e.target.closest('#new-contatto-btn');
        const exportBtn = e.target.closest('#export-contatti-btn');
        const editBtn = e.target.closest('.edit-contatto-btn');
        const deleteBtn = e.target.closest('.delete-contatto-btn');
        const bulkDeleteBtn = e.target.closest('#bulk-delete-btn');

        if (newContattoBtn) openContattoModal.call(app);
        if (exportBtn) exportAnagraficaToCSV.call(app);
        if (editBtn) editContatto.call(app, editBtn.dataset.id);
        if (deleteBtn) deleteContatto.call(app, deleteBtn.dataset.id);
        
        if (bulkDeleteBtn) {
            if (anagraficaState.selectedContatti.length === 0) return;
            app.showConfirm(`Sei sicuro di voler eliminare ${anagraficaState.selectedContatti.length} contatti selezionati?`, () => {
                app.state.data.contatti = app.state.data.contatti.filter(c => !anagraficaState.selectedContatti.includes(c.id));
                anagraficaState.selectedContatti = [];
                anagraficaState.isSelectAllChecked = false;
                app.saveToStorage('data', app.state.data);
                renderContattiGrid.call(app);
                app.showNotification('Contatti eliminati con successo');
            });
        }
    });

    // Listener per input e select
    container.addEventListener('input', (e) => {
        if (e.target.id === 'anagrafica-search') {
            anagraficaState.searchQuery = e.target.value;
            renderContattiGrid.call(app);
        }
    });
    
    container.addEventListener('change', (e) => {
        if (e.target.id === 'anagrafica-sort') {
            anagraficaState.sort.column = e.target.value;
            renderContattiGrid.call(app);
        } else if (e.target.id === 'select-all-contatti') {
            handleSelectAll.call(app, e.target.checked);
        } else if (e.target.classList.contains('contatto-checkbox')) {
            handleSelectContatto.call(app, e.target.dataset.id, e.target.checked);
        }
    });
}
// Fine funzione setupAnagraficaEventListeners

// Inizio funzione handleSelectAll
function handleSelectAll(isChecked) {
    anagraficaState.isSelectAllChecked = isChecked;
    const contattiVisibiliIds = getFilteredAndSortedContatti.call(this).map(c => c.id);

    if (isChecked) {
        anagraficaState.selectedContatti = [...new Set([...anagraficaState.selectedContatti, ...contattiVisibiliIds])];
    } else {
        anagraficaState.selectedContatti = anagraficaState.selectedContatti.filter(id => !contattiVisibiliIds.includes(id));
    }
    
    updateBulkActions.call(this);
    updateCardSelections();
}
// Fine funzione handleSelectAll

// Inizio funzione handleSelectContatto
function handleSelectContatto(contattoId, isChecked) {
    if (isChecked) {
        if (!anagraficaState.selectedContatti.includes(contattoId)) {
            anagraficaState.selectedContatti.push(contattoId);
        }
    } else {
        anagraficaState.selectedContatti = anagraficaState.selectedContatti.filter(id => id !== contattoId);
    }
    anagraficaState.isSelectAllChecked = false; // Deseleziona il "select all" generale se si deseleziona manualmente un elemento
    
    updateBulkActions.call(this);
    updateCardSelections();
}
// Fine funzione handleSelectContatto

// Inizio funzione updateBulkActions
function updateBulkActions() {
    const container = document.getElementById('bulk-actions-container');
    if (container) {
        container.innerHTML = getBulkActionsHTML();
    }
}
// Fine funzione updateBulkActions

// Inizio funzione updateCardSelections
function updateCardSelections() {
    document.querySelectorAll('.contatto-card').forEach(card => {
        const contattoId = card.dataset.contattoId;
        const isSelected = anagraficaState.selectedContatti.includes(contattoId);
        card.classList.toggle('selected', isSelected);
        
        const checkbox = card.querySelector('.contatto-checkbox');
        if (checkbox) checkbox.checked = isSelected;
    });
    
    const selectAllCheckbox = document.getElementById('select-all-contatti');
    if (selectAllCheckbox) {
        const allVisibleCards = document.querySelectorAll('.contatto-card');
        if (allVisibleCards.length > 0) {
            const allVisibleSelected = Array.from(allVisibleCards).every(card => anagraficaState.selectedContatti.includes(card.dataset.contattoId));
            selectAllCheckbox.checked = allVisibleSelected;
        } else {
            selectAllCheckbox.checked = false;
        }
    }
}
// Fine funzione updateCardSelections

// === GESTIONE FORM CONTATTO ===

// Inizio funzione resetContattoForm
function resetContattoForm() {
    anagraficaState.contattoForm = {
        nome: '', cognome: '', azienda: '',
        telefono1: '', telefono2: '', email: '',
        note: ''
    };
    anagraficaState.editingContatto = null;
}
// Fine funzione resetContattoForm

// Inizio funzione openContattoModal
function openContattoModal(contatto = null) {
    const app = this;
    const isEditing = !!contatto;
    
    if (isEditing) {
        anagraficaState.editingContatto = contatto;
        Object.assign(anagraficaState.contattoForm, contatto);
    } else {
        resetContattoForm();
    }

    const modalHTML = `
        <div class="modal-header">
            <h2>${isEditing ? 'Modifica Contatto' : 'Nuovo Contatto'}</h2>
        </div>
        <div class="modal-body">
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Nome *</label>
                    <input type="text" id="contatto-nome" class="form-control" value="${anagraficaState.contattoForm.nome}" required autocomplete="off">
                </div>
                <div class="form-group">
                    <label class="form-label">Cognome *</label>
                    <input type="text" id="contatto-cognome" class="form-control" value="${anagraficaState.contattoForm.cognome}" required autocomplete="off">
                </div>
                <div class="form-group">
                    <label class="form-label">Azienda</label>
                    <input type="text" id="contatto-azienda" class="form-control" value="${anagraficaState.contattoForm.azienda}" autocomplete="off">
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" id="contatto-email" class="form-control" value="${anagraficaState.contattoForm.email}" autocomplete="off">
                </div>
                <div class="form-group">
                    <label class="form-label">Telefono 1</label>
                    <input type="tel" id="contatto-telefono1" class="form-control" value="${anagraficaState.contattoForm.telefono1}" autocomplete="off">
                </div>
                <div class="form-group">
                    <label class="form-label">Telefono 2</label>
                    <input type="tel" id="contatto-telefono2" class="form-control" value="${anagraficaState.contattoForm.telefono2}" autocomplete="off">
                </div>
                <div class="form-group span-2">
                    <label class="form-label">Note</label>
                    <input type="text" id="contatto-note" class="form-control" value="${anagraficaState.contattoForm.note}" autocomplete="off" spellcheck="false" style="max-width: 100%;">
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="closeCustomModal()">Annulla</button>
                <button type="button" id="save-contatto-btn" class="btn btn-primary">
                    ${isEditing ? 'Aggiorna' : 'Salva'}
                </button>
            </div>
        </div>
    `;

    showCustomModal(modalHTML, 'modal-wide');
    setupContattoFormListeners.call(this);
}
// Fine funzione openContattoModal

// Inizio funzione setupContattoFormListeners
function setupContattoFormListeners() {
    const app = this;

    const inputs = {
        nome: document.getElementById('contatto-nome'),
        cognome: document.getElementById('contatto-cognome'),
        azienda: document.getElementById('contatto-azienda'),
        telefono1: document.getElementById('contatto-telefono1'),
        telefono2: document.getElementById('contatto-telefono2'),
        email: document.getElementById('contatto-email'),
        note: document.getElementById('contatto-note')
    };

    Object.entries(inputs).forEach(([key, input]) => {
        if (input) {
            input.addEventListener('input', () => {
                anagraficaState.contattoForm[key] = input.value;
            });
        }
    });

    document.getElementById('save-contatto-btn')?.addEventListener('click', () => {
        saveContatto.call(this);
    });
}
// Fine funzione setupContattoFormListeners

// Inizio funzione saveContatto
function saveContatto() {
    const app = this;
    const form = anagraficaState.contattoForm;

    if (!form.nome.trim() || !form.cognome.trim()) {
        return app.showNotification('Nome e cognome sono obbligatori', 'error');
    }

    const contattoData = {
        nome: form.nome.trim(),
        cognome: form.cognome.trim(),
        azienda: form.azienda.trim(),
        telefono1: form.telefono1.trim(),
        telefono2: form.telefono2.trim(),
        email: form.email.trim(),
        note: form.note.trim(),
    };

    if (anagraficaState.editingContatto) {
        const index = app.state.data.contatti.findIndex(c => c.id === anagraficaState.editingContatto.id);
        if (index !== -1) {
            app.state.data.contatti[index] = { ...app.state.data.contatti[index], ...contattoData };
        }
        app.showNotification('Contatto aggiornato con successo');
    } else {
        const nuovoContatto = {
            id: app.generateUniqueId('contatto'),
            ...contattoData
        };
        app.state.data.contatti.push(nuovoContatto);
        app.showNotification('Contatto aggiunto con successo');
    }

    app.saveToStorage('data', app.state.data);
    closeCustomModal();
    resetContattoForm();
    renderContattiGrid.call(this);
}
// Fine funzione saveContatto

// Inizio funzione editContatto
function editContatto(contattoId) {
    const app = this;
    const contatto = app.state.data.contatti.find(c => c.id === contattoId);
    if (contatto) {
        openContattoModal.call(this, contatto);
    }
}
// Fine funzione editContatto

// Inizio funzione deleteContatto
function deleteContatto(contattoId) {
    const app = this;
    const contatto = app.state.data.contatti.find(c => c.id === contattoId);
    
    if (contatto) {
        app.showConfirm(`Sei sicuro di voler eliminare il contatto "${contatto.cognome} ${contatto.nome}"?`, () => {
            app.state.data.contatti = app.state.data.contatti.filter(c => c.id !== contattoId);
            app.saveToStorage('data', app.state.data);
            app.showNotification('Contatto eliminato con successo');
            
            anagraficaState.selectedContatti = anagraficaState.selectedContatti.filter(id => id !== contattoId);
            
            renderContattiGrid.call(this);
        });
    }
}
// Fine funzione deleteContatto

// === FUNZIONI DI UTILITÀ GLOBALI ===

// Inizio funzione showCustomModal
function showCustomModal(contentHTML, modalClass = '') {
    const existingModal = document.getElementById('custom-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalElement = document.createElement('div');
    modalElement.id = 'custom-modal';
    modalElement.className = 'modal show';
    modalElement.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content ${modalClass}">
            ${contentHTML}
        </div>
    `;

    document.body.appendChild(modalElement);

    modalElement.addEventListener('click', (e) => {
        if (e.target === modalElement || e.target.classList.contains('modal-backdrop') || e.target.closest('.modal-close-btn')) {
            closeCustomModal();
        }
    });

    const app = getApp();
    if (app && app.refreshIcons) {
        setTimeout(() => app.refreshIcons(), 100);
    }
}
// Fine funzione showCustomModal

// Inizio funzione closeCustomModal
function closeCustomModal() {
    const modal = document.getElementById('custom-modal');
    if (modal) {
        modal.remove();
    }
}
// Fine funzione closeCustomModal

// === FUNZIONI EXPORT ===

// Inizio funzione exportAnagraficaToCSV
function exportAnagraficaToCSV() {
    const app = getApp();
    const contatti = app.state.data.contatti;
    
    if (contatti.length === 0) {
        return app.showNotification("Nessun contatto da esportare.");
    }

    const headers = ['Cognome', 'Nome', 'Azienda', 'Telefono 1', 'Telefono 2', 'Email', 'Note'];
    const rows = contatti.map(c => {
        return [
            c.cognome, c.nome, c.azienda,
            c.telefono1, c.telefono2, c.email,
            c.note
        ];
    });

    const csvContent = [headers, ...rows].map(row => 
        row.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `anagrafica_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    
    app.showNotification("Anagrafica esportata con successo");
}
// Fine funzione exportAnagraficaToCSV
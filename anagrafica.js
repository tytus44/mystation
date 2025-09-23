// =============================================
// FILE: anagrafica.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Anagrafica (contatti, etichette, import/export).
// --- LAYOUT A COLONNA SINGOLA E FILTRO DROPDOWN ---
// =============================================

// === STATO LOCALE DEL MODULO ANAGRAFICA ===
let anagraficaState = {
    // Filtri e Ordinamento
    activeEtichettaId: 'all', // 'all' o l'ID di un'etichetta
    searchQuery: '',
    sort: { column: 'cognome', direction: 'asc' },

    // Form
    contattoForm: {
        nome: '', cognome: '', azienda: '',
        telefono1: '', telefono2: '', email: '',
        note: '', etichettaId: null
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
    if (!app.state.data.etichette) app.state.data.etichette = [];

    resetContattoForm();
    console.log('✅ Modulo Anagrafica inizializzato');
}
// Fine funzione initAnagrafica

// === FUNZIONI DI RENDER ===

// Inizio funzione renderAnagraficaSection
function renderAnagraficaSection(container) {
    const app = this;
    const contatti = getFilteredAndSortedContatti.call(app);

    container.innerHTML = `
        <div class="space-y-6">
            ${getAnagraficaHeaderHTML(app)}
            <div id="bulk-actions-container">
                ${getBulkActionsHTML()}
            </div>
            <div class="card">
                <div id="contatti-table-container" class="table-container">
                    ${getContattiTableHTML(app, contatti)}
                </div>
            </div>
        </div>
    `;

    setupAnagraficaEventListeners.call(app);
    app.refreshIcons();
}
// Fine funzione renderAnagraficaSection

// Inizio funzione getAnagraficaHeaderHTML
function getAnagraficaHeaderHTML(app) {
    const etichette = app.state.data.etichette || [];

    return `
        <div class="filters-bar">
            <div class="filter-group">
                <label class="form-label">Cerca</label>
                <div class="input-group">
                    <i data-lucide="search" class="input-group-icon"></i>
                    <input type="search" id="anagrafica-search" class="form-control" 
                           placeholder="Nome, cognome, note..." value="${anagraficaState.searchQuery}" style="max-width: 100%;">
                </div>
            </div>
            <div class="filter-group">
                <label class="form-label">Filtra per Etichetta</label>
                <select id="anagrafica-etichetta-filter" class="form-control" style="max-width: 100%;">
                    <option value="all">Tutte le etichette</option>
                    ${etichette.map(e => `<option value="${e.id}" ${anagraficaState.activeEtichettaId === e.id ? 'selected' : ''}>${e.nome}</option>`).join('')}
                </select>
            </div>
            <div class="flex space-x-2">
                <button id="import-contatti-btn" class="btn btn-secondary">
                    <i data-lucide="upload" class="w-4 h-4 mr-2"></i> Importa
                </button>
                <button id="export-contatti-btn" class="btn btn-secondary">
                    <i data-lucide="download" class="w-4 h-4 mr-2"></i> Esporta
                </button>
                <button id="new-contatto-btn" class="btn btn-primary">
                    <i data-lucide="plus-circle" class="w-4 h-4 mr-2"></i> Nuovo Contatto
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
            <span>${count} contatti selezionati</span>
            <button id="bulk-delete-btn" class="btn btn-danger btn-sm">
                <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i> Elimina Selezionati
            </button>
        </div>
    `;
}
// Fine funzione getBulkActionsHTML

// Inizio funzione getContattiTableHTML
function getContattiTableHTML(app, contatti) {
    const etichette = app.state.data.etichette || [];

    if (contatti.length === 0) {
        return `
            <div class="empty-state p-12">
                <i data-lucide="users"></i>
                <div class="empty-state-title">Nessun contatto trovato</div>
                <div class="empty-state-description">Aggiungi un nuovo contatto o cambia il filtro.</div>
            </div>`;
    }

    return `
        <table class="table" id="contatti-table">
            <thead>
                <tr>
                    <th class="p-4 w-4">
                        <input type="checkbox" id="select-all-contatti" ${anagraficaState.isSelectAllChecked ? 'checked' : ''}>
                    </th>
                    <th><button data-sort="cognome">Cognome <i data-lucide="arrow-up-down"></i></button></th>
                    <th><button data-sort="nome">Nome <i data-lucide="arrow-up-down"></i></button></th>
                    <th><button data-sort="azienda">Azienda <i data-lucide="arrow-up-down"></i></button></th>
                    <th>Contatti</th>
                    <th>Etichetta</th>
                    <th class="text-right">Azioni</th>
                </tr>
            </thead>
            <tbody>
                ${contatti.map(c => {
                    const etichetta = etichette.find(e => e.id === c.etichettaId);
                    return `
                        <tr class="${anagraficaState.selectedContatti.includes(c.id) ? 'selected' : ''}">
                            <td class="p-4 w-4"><input type="checkbox" class="select-contatto" data-id="${c.id}" ${anagraficaState.selectedContatti.includes(c.id) ? 'checked' : ''}></td>
                            <td class="font-medium text-primary">${c.cognome || '-'}</td>
                            <td class="text-primary">${c.nome || '-'}</td>
                            <td>${c.azienda || '-'}</td>
                            <td>
                                <div class="text-xs space-y-1">
                                    ${c.telefono1 ? `<div><i data-lucide="phone" class="w-3 h-3 inline-block mr-1"></i> ${c.telefono1}</div>` : ''}
                                    ${c.email ? `<div><i data-lucide="mail" class="w-3 h-3 inline-block mr-1"></i> ${c.email}</div>` : ''}
                                </div>
                            </td>
                            <td>
                                ${etichetta ? `<span class="etichetta-badge" style="background-color: ${etichetta.colore}33; color: ${etichetta.colore};">${etichetta.nome}</span>` : '-'}
                            </td>
                            <td class="text-right">
                                <div class="flex items-center justify-end space-x-2">
                                    <button class="btn btn-success btn-sm" onclick="showContattoModal('${c.id}')"><i data-lucide="edit"></i></button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteContattoById('${c.id}')"><i data-lucide="trash-2"></i></button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}
// Fine funzione getContattiTableHTML

// Inizio funzione getContattoModalHTML
function getContattoModalHTML() {
    const app = getApp();
    const etichette = app.state.data.etichette || [];
    const form = anagraficaState.contattoForm;
    const isEdit = !!anagraficaState.editingContatto;
    const title = isEdit ? 'Modifica Contatto' : 'Nuovo Contatto';

    return `
        <div class="card-header">
            <h2 class="card-title">${title}</h2>
            <button id="cancel-contatto-btn" class="btn btn-secondary modal-close-btn"><i data-lucide="x"></i></button>
        </div>
        <div class="card-body">
            <div class="grid grid-cols-2 gap-4">
                <div class="form-group"><label class="form-label">Cognome</label><input type="text" id="contatto-cognome" class="form-control" style="max-width:100%" value="${form.cognome || ''}"></div>
                <div class="form-group"><label class="form-label">Nome</label><input type="text" id="contatto-nome" class="form-control" style="max-width:100%" value="${form.nome || ''}"></div>
                <div class="form-group"><label class="form-label">Azienda</label><input type="text" id="contatto-azienda" class="form-control" style="max-width:100%" value="${form.azienda || ''}"></div>
                <div class="form-group"><label class="form-label">Etichetta</label>
                    <select id="contatto-etichettaId" class="form-control" style="max-width:100%">
                        <option value="">(Nessuna)</option>
                        ${etichette.map(e => `<option value="${e.id}" ${form.etichettaId === e.id ? 'selected' : ''}>${e.nome}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group"><label class="form-label">Telefono 1</label><input type="tel" id="contatto-telefono1" class="form-control" style="max-width:100%" value="${form.telefono1 || ''}"></div>
                <div class="form-group"><label class="form-label">Telefono 2</label><input type="tel" id="contatto-telefono2" class="form-control" style="max-width:100%" value="${form.telefono2 || ''}"></div>
                <div class="form-group"><label class="form-label">Email</label><input type="email" id="contatto-email" class="form-control" style="max-width:100%" value="${form.email || ''}"></div>
                <div class="form-group"><label class="form-label">Note</label><input type="text" id="contatto-note" class="form-control" style="max-width:100%" value="${form.note || ''}"></div>
            </div>
            <div class="flex justify-end space-x-4 mt-6">
                <button id="cancel-contatto-btn-bottom" class="btn btn-secondary">Annulla</button>
                <button id="save-contatto-btn" class="btn btn-primary">${isEdit ? 'Salva Modifiche' : 'Crea Contatto'}</button>
            </div>
        </div>
    `;
}
// Fine funzione getContattoModalHTML

// === GESTIONE EVENTI ===

// Inizio funzione setupAnagraficaEventListeners
function setupAnagraficaEventListeners() {
    const app = getApp();
    
    document.getElementById('anagrafica-etichetta-filter')?.addEventListener('change', (e) => {
        filterByEtichetta.call(app, e.target.value);
    });

    document.getElementById('anagrafica-search')?.addEventListener('input', (e) => {
        anagraficaState.searchQuery = e.target.value;
        rerenderContattiList.call(app);
    });

    document.getElementById('new-contatto-btn')?.addEventListener('click', () => showContattoModal.call(app));
    document.getElementById('import-contatti-btn')?.addEventListener('click', () => showImportModal.call(app));
    document.getElementById('export-contatti-btn')?.addEventListener('click', () => exportAnagraficaToCSV.call(app));

    document.querySelectorAll('#contatti-table [data-sort]').forEach(btn => {
        btn.addEventListener('click', () => {
            sortAnagrafica.call(app, btn.dataset.sort);
        });
    });

    document.getElementById('select-all-contatti')?.addEventListener('change', (e) => toggleSelectAll.call(app, e.target.checked));
    document.querySelectorAll('.select-contatto').forEach(el => {
        el.addEventListener('change', () => updateSelectedContatti.call(app));
    });
    document.getElementById('bulk-delete-btn')?.addEventListener('click', () => bulkDeleteContatti.call(app));
}
// Fine funzione setupAnagraficaEventListeners


// === FUNZIONI DI LOGICA ===

// Inizio funzione rerenderAnagraficaView
function rerenderAnagraficaView() {
    const app = this;
    const container = document.getElementById('section-anagrafica');
    if(container) {
        renderAnagraficaSection.call(app, container);
    }
}
// Fine funzione rerenderAnagraficaView

// Inizio funzione rerenderContattiList
function rerenderContattiList() {
    const app = this;
    const contatti = getFilteredAndSortedContatti.call(app);
    const tableContainer = document.getElementById('contatti-table-container');
    const bulkContainer = document.getElementById('bulk-actions-container');

    if (tableContainer) {
        tableContainer.innerHTML = getContattiTableHTML(app, contatti);
    }
    if (bulkContainer) {
        bulkContainer.innerHTML = getBulkActionsHTML();
    }

    document.querySelectorAll('#contatti-table [data-sort]').forEach(btn => btn.addEventListener('click', () => sortAnagrafica.call(app, btn.dataset.sort)));
    document.getElementById('select-all-contatti')?.addEventListener('change', (e) => toggleSelectAll.call(app, e.target.checked));
    document.querySelectorAll('.select-contatto').forEach(el => el.addEventListener('change', () => updateSelectedContatti.call(app)));
    document.getElementById('bulk-delete-btn')?.addEventListener('click', () => bulkDeleteContatti.call(app));
    app.refreshIcons();
}
// Fine funzione rerenderContattiList

// Inizio funzione getFilteredAndSortedContatti
function getFilteredAndSortedContatti() {
    const app = this;
    let contatti = [...(app.state.data.contatti || [])];

    if (anagraficaState.activeEtichettaId !== 'all') {
        contatti = contatti.filter(c => c.etichettaId === anagraficaState.activeEtichettaId);
    }

    if (anagraficaState.searchQuery) {
        const query = anagraficaState.searchQuery.toLowerCase();
        contatti = contatti.filter(c => 
            (c.nome || '').toLowerCase().includes(query) ||
            (c.cognome || '').toLowerCase().includes(query) ||
            (c.note || '').toLowerCase().includes(query)
        );
    }
    
    contatti.sort((a, b) => {
        const col = anagraficaState.sort.column;
        const dir = anagraficaState.sort.direction === 'asc' ? 1 : -1;
        const valA = (a[col] || '').toLowerCase();
        const valB = (b[col] || '').toLowerCase();
        return valA.localeCompare(valB, 'it-IT') * dir;
    });

    return contatti;
}
// Fine funzione getFilteredAndSortedContatti

// Inizio funzione sortAnagrafica
function sortAnagrafica(column) {
    const app = this;
    if (anagraficaState.sort.column === column) {
        anagraficaState.sort.direction = anagraficaState.sort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        anagraficaState.sort.column = column;
        anagraficaState.sort.direction = 'asc';
    }
    rerenderContattiList.call(app);
}
// Fine funzione sortAnagrafica

// Inizio funzione filterByEtichetta
function filterByEtichetta(etichettaId) {
    const app = this;
    anagraficaState.activeEtichettaId = etichettaId;
    anagraficaState.selectedContatti = [];
    anagraficaState.isSelectAllChecked = false;
    rerenderContattiList.call(app);
}
// Fine funzione filterByEtichetta

// === GESTIONE MODALI E FORM ===

// Inizio funzione resetContattoForm
function resetContattoForm() {
    anagraficaState.contattoForm = {
        nome: '', cognome: '', azienda: '',
        telefono1: '', telefono2: '', email: '',
        note: '', etichettaId: null
    };
    anagraficaState.editingContatto = null;
}
// Fine funzione resetContattoForm

// Inizio funzione showContattoModal
function showContattoModal(contattoId = null) {
    const app = getApp();
    resetContattoForm();

    if (contattoId) {
        const contatto = app.state.data.contatti.find(c => c.id === contattoId);
        if (contatto) {
            anagraficaState.editingContatto = contatto;
            anagraficaState.contattoForm = { ...contatto };
        }
    }

    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getContattoModalHTML();
    modalContentEl.classList.add('modal-wide');
    
    document.getElementById('save-contatto-btn')?.addEventListener('click', () => saveContatto());
    document.getElementById('cancel-contatto-btn')?.addEventListener('click', () => app.hideFormModal());
    document.getElementById('cancel-contatto-btn-bottom')?.addEventListener('click', () => app.hideFormModal());

    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showContattoModal

// Inizio funzione saveContatto
function saveContatto() {
    const app = getApp();
    const form = {};
    const fields = ['cognome', 'nome', 'azienda', 'etichettaId', 'telefono1', 'telefono2', 'email', 'note'];
    fields.forEach(f => {
        const el = document.getElementById(`contatto-${f}`);
        if (el) form[f] = el.value.trim();
    });
    
    if (form.etichettaId === "") form.etichettaId = null;

    if (!form.nome && !form.cognome) {
        return app.showNotification('Almeno il nome o il cognome sono richiesti.');
    }

    if (anagraficaState.editingContatto) {
        const index = app.state.data.contatti.findIndex(c => c.id === anagraficaState.editingContatto.id);
        if (index > -1) {
            app.state.data.contatti[index] = { ...app.state.data.contatti[index], ...form };
        }
    } else {
        const newContatto = { ...form, id: app.generateUniqueId('contatto'), createdAt: new Date().toISOString() };
        app.state.data.contatti.push(newContatto);
    }
    
    app.saveToStorage('data', app.state.data);
    app.hideFormModal();
    rerenderAnagraficaView.call(app);
    app.showNotification('Contatto salvato con successo.');
}
// Fine funzione saveContatto

// Inizio funzione deleteContattoById
function deleteContattoById(contattoId) {
    const app = getApp();
    const contatto = app.state.data.contatti.find(c => c.id === contattoId);
    if (!contatto) return;
    
    const fullName = [contatto.nome, contatto.cognome].filter(Boolean).join(' ');
    app.showConfirm(`Sei sicuro di voler eliminare il contatto "${fullName}"?`, () => {
        app.state.data.contatti = app.state.data.contatti.filter(c => c.id !== contattoId);
        app.saveToStorage('data', app.state.data);
        rerenderAnagraficaView.call(app);
        app.showNotification('Contatto eliminato.');
    });
}
// Fine funzione deleteContattoById

// === FUNZIONI SELEZIONE MULTIPLA ===

// Inizio funzione toggleSelectAll
function toggleSelectAll(isChecked) {
    anagraficaState.isSelectAllChecked = isChecked;
    const contattiVisibili = getFilteredAndSortedContatti.call(getApp());
    if (isChecked) {
        anagraficaState.selectedContatti = contattiVisibili.map(c => c.id);
    } else {
        anagraficaState.selectedContatti = [];
    }
    rerenderContattiList.call(getApp());
}
// Fine funzione toggleSelectAll

// Inizio funzione updateSelectedContatti
function updateSelectedContatti() {
    anagraficaState.selectedContatti = [];
    document.querySelectorAll('.select-contatto:checked').forEach(el => {
        anagraficaState.selectedContatti.push(el.dataset.id);
    });
    const contattiVisibili = getFilteredAndSortedContatti.call(getApp());
    anagraficaState.isSelectAllChecked = contattiVisibili.length > 0 && anagraficaState.selectedContatti.length === contattiVisibili.length;
    rerenderContattiList.call(getApp());
}
// Fine funzione updateSelectedContatti

// Inizio funzione bulkDeleteContatti
function bulkDeleteContatti() {
    const app = getApp();
    const count = anagraficaState.selectedContatti.length;
    if (count === 0) return;

    app.showConfirm(`Sei sicuro di voler eliminare ${count} contatti selezionati?`, () => {
        app.state.data.contatti = app.state.data.contatti.filter(c => !anagraficaState.selectedContatti.includes(c.id));
        anagraficaState.selectedContatti = [];
        anagraficaState.isSelectAllChecked = false;
        app.saveToStorage('data', app.state.data);
        rerenderAnagraficaView.call(app);
        app.showNotification(`${count} contatti eliminati.`);
    });
}
// Fine funzione bulkDeleteContatti


// === FUNZIONI DI IMPORT/EXPORT ===

// Inizio funzione showImportModal
function showImportModal() {
    const app = getApp();
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = `
        <div class="card-header">
            <h2 class="card-title">Importa Contatti da CSV</h2>
            <button id="cancel-import-btn" class="btn btn-secondary modal-close-btn"><i data-lucide="x"></i></button>
        </div>
        <div class="card-body">
            <p class="text-secondary mb-4">Seleziona un file CSV. Il nome del file (es. "Autisti.csv") verrà usato come etichetta per tutti i contatti importati.</p>
            <input type="file" id="csv-file-input" accept=".csv" class="form-control" style="max-width: 100%; height: auto; padding: 0.5rem;">
            <div class="flex justify-end mt-6">
                <button id="start-import-btn" class="btn btn-primary">Avvia Importazione</button>
            </div>
        </div>
    `;
    modalContentEl.classList.add('modal-wide');

    document.getElementById('cancel-import-btn')?.addEventListener('click', () => app.hideFormModal());
    document.getElementById('start-import-btn')?.addEventListener('click', handleFileImport);

    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showImportModal

// Inizio funzione handleFileImport
function handleFileImport() {
    const app = getApp();
    const fileInput = document.getElementById('csv-file-input');
    const file = fileInput.files[0];

    if (!file) {
        return app.showNotification("Per favore, seleziona un file.");
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const csvText = event.target.result;
        try {
            const contattiDaImportare = parseCSV(csvText);
            if (contattiDaImportare.length === 0) {
                return app.showNotification("Il file CSV è vuoto o non valido.");
            }

            const nomeFile = file.name.split('.').slice(0, -1).join('.');
            const nomeEtichetta = nomeFile.charAt(0).toUpperCase() + nomeFile.slice(1);
            const etichetta = getOrCreateEtichetta(nomeEtichetta);

            const nuoviContatti = contattiDaImportare.map(c => ({
                ...mapCSVRowToContatto(c),
                id: app.generateUniqueId('contatto'),
                etichettaId: etichetta.id,
                createdAt: new Date().toISOString()
            }));

            app.state.data.contatti.push(...nuoviContatti);
            app.saveToStorage('data', app.state.data);
            app.hideFormModal();
            rerenderAnagraficaView.call(app);
            app.showNotification(`${nuoviContatti.length} contatti importati con l'etichetta "${nomeEtichetta}".`);

        } catch (error) {
            console.error("Errore durante l'importazione:", error);
            app.showNotification("Errore nel formato del file CSV.");
        }
    };
    reader.readAsText(file);
}
// Fine funzione handleFileImport

// Inizio funzione getOrCreateEtichetta
function getOrCreateEtichetta(nomeEtichetta) {
    const app = getApp();
    const etichette = app.state.data.etichette;
    let etichettaEsistente = etichette.find(e => e.nome.toLowerCase() === nomeEtichetta.toLowerCase());

    if (etichettaEsistente) {
        return etichettaEsistente;
    }

    const colori = ['#2563eb', '#10b981', '#f59e0b', '#dc2626', '#8b5cf6', '#06b6d4'];
    const coloreNuovo = colori[etichette.length % colori.length];
    
    const nuovaEtichetta = {
        id: app.generateUniqueId('etichetta'),
        nome: nomeEtichetta,
        colore: coloreNuovo
    };
    etichette.push(nuovaEtichetta);
    return nuovaEtichetta;
}
// Fine funzione getOrCreateEtichetta

// Inizio funzione parseCSV
function parseCSV(text) {
    const lines = text.split(/\r\n|\n/);
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const values = lines[i].split(',').map(v => v.trim());
        const entry = {};
        headers.forEach((header, index) => {
            entry[header] = values[index];
        });
        data.push(entry);
    }
    return data;
}
// Fine funzione parseCSV

// Inizio funzione mapCSVRowToContatto
function mapCSVRowToContatto(row) {
    const getVal = (r, keys) => keys.reduce((acc, key) => acc || r[key], undefined) || '';
    
    return {
        cognome: getVal(row, ['Cognome', 'Last Name']),
        nome: getVal(row, ['Nome', 'First Name']),
        azienda: getVal(row, ['Azienda', 'Organization', 'Organization Name']),
        telefono1: getVal(row, ['Telefono 1', 'Phone 1 - Value']),
        telefono2: getVal(row, ['Telefono 2', 'Phone 2 - Value']),
        email: getVal(row, ['Email', 'E-mail 1 - Value']),
        note: getVal(row, ['Note', 'Notes'])
    };
}
// Fine funzione mapCSVRowToContatto

// Inizio funzione exportAnagraficaToCSV
function exportAnagraficaToCSV() {
    const app = getApp();
    const contatti = app.state.data.contatti;
    const etichette = app.state.data.etichette;
    
    if (contatti.length === 0) {
        return app.showNotification("Nessun contatto da esportare.");
    }

    const headers = ['Cognome', 'Nome', 'Azienda', 'Telefono 1', 'Telefono 2', 'Email', 'Note', 'Etichetta'];
    const rows = contatti.map(c => {
        const etichetta = etichette.find(e => e.id === c.etichettaId);
        const row = [
            c.cognome, c.nome, c.azienda,
            c.telefono1, c.telefono2, c.email,
            c.note, etichetta ? etichetta.nome : ''
        ];
        return row.map(val => `"${(val || '').replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rubrica_mystation_${app.formatDateForFilename()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// Fine funzione exportAnagraficaToCSV

// === FUNZIONI GLOBALI ===
if (typeof window !== 'undefined') {
    window.initAnagrafica = initAnagrafica;
    window.renderAnagraficaSection = renderAnagraficaSection;
    window.showContattoModal = showContattoModal;
    window.deleteContattoById = deleteContattoById;
}
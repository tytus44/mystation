// =============================================
// FILE: anagrafica.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Anagrafica (contatti, import/export).
// =============================================

// === STATO LOCALE DEL MODULO ANAGRAFICA ===
let anagraficaState = {
    // Filtri e Ordinamento
    searchQuery: '',
    
    // Form
    contattoForm: {
        nome: '', cognome: '', azienda: '',
        telefono1: '', email: '',
        note: ''
    },
    editingContatto: null,
};

// === ARRAY COLORI STAT-CARD ===
// Array contenente i colori delle stat-card da applicare alle cards dei contatti
const STAT_CARD_COLORS = [
    { background: 'rgba(37, 99, 235, 0.18)', border: 'rgba(37, 99, 235, 0.65)' },      // Blu (Primary)
    { background: 'rgba(16, 185, 129, 0.18)', border: 'rgba(16, 185, 129, 0.65)' },    // Verde (Success)
    { background: 'rgba(255, 32, 78, 0.18)', border: 'rgba(255, 32, 78, 0.65)' },      // Rosso (Danger)
    { background: 'rgba(245, 158, 11, 0.18)', border: 'rgba(245, 158, 11, 0.65)' },    // Giallo (Warning)
    { background: 'rgba(139, 92, 246, 0.18)', border: 'rgba(139, 92, 246, 0.65)' },    // Viola (Purple)
    { background: 'rgba(8, 145, 178, 0.18)', border: 'rgba(8, 145, 178, 0.65)' },      // Ciano (Info)
    { background: 'rgba(107, 114, 128, 0.18)', border: 'rgba(107, 114, 128, 0.65)' }   // Grigio
];

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

    setupCardEventListeners.call(this);
    
    app.refreshIcons();
}
// Fine funzione renderContattiGrid

// Inizio funzione getAnagraficaHeaderHTML
function getAnagraficaHeaderHTML(app) {
    return `
        <div class="filters-bar">
            <div class="filter-group">
                <div class="input-group">
                    <i data-lucide="search" class="input-group-icon"></i>
                    <input type="search" id="anagrafica-search" class="form-control" 
                           placeholder="Nome, cognome, note..." value="${anagraficaState.searchQuery}" autocomplete="off">
                </div>
            </div>
            <div class="flex space-x-2">
                <button id="new-contatto-btn" class="btn btn-primary">
                    <i data-lucide="user-plus" class="w-4 h-4 mr-2"></i> Nuovo Contatto
                </button>
                <button id="import-contatti-btn" class="btn btn-secondary" title="Importa">
                    <i data-lucide="upload" class="w-4 h-4"></i>
                </button>
                <button id="export-contatti-btn" class="btn btn-secondary" title="Esporta">
                    <i data-lucide="download" class="w-4 h-4"></i>
                </button>
                <button id="print-anagrafica-btn" class="btn btn-secondary" title="Stampa">
                    <i data-lucide="printer" class="w-4 h-4"></i>
                </button>
                <button id="delete-rubrica-btn" class="btn btn-danger" title="Elimina Rubrica">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
        <input type="file" id="import-anagrafica-file" accept=".csv" style="display: none;">
    `;
}
// Fine funzione getAnagraficaHeaderHTML

// Inizio funzione getStatCardColorByIndex
// Restituisce il colore della stat-card basato sull'indice del contatto
function getStatCardColorByIndex(index) {
    const colorIndex = index % STAT_CARD_COLORS.length;
    return STAT_CARD_COLORS[colorIndex];
}
// Fine funzione getStatCardColorByIndex

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
        <div class="contatti-grid">
            ${contatti.map((c, index) => {
                const contattiInfo = [];
                if (c.telefono1) contattiInfo.push(`<i data-lucide="phone" class="w-4 h-4"></i> ${c.telefono1}`);
                if (c.email) contattiInfo.push(`<i data-lucide="mail" class="w-4 h-4"></i> ${c.email}`);
                
                // Ottengo il colore della stat-card basato sull'indice
                const contactColors = getStatCardColorByIndex(index);
                const cardStyle = `background-color: ${contactColors.background}; border-color: ${contactColors.border};`;
                
                return `
                    <div class="contatto-card" data-contatto-id="${c.id}" style="${cardStyle}">
                        <div class="contatto-card-header">
                            <div class="contatto-main-info">
                                <h3 class="contatto-name">${c.cognome} ${c.nome}</h3>
                                ${c.azienda ? `<p class="contatto-company">${c.azienda}</p>` : ''}
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
                        <div class="contatto-user-icon" style="color: ${contactColors.border};">
                            <i data-lucide="circle-user"></i>
                        </div>
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

    contatti.sort((a, b) => {
        const cognomeA = a.cognome?.toLowerCase() || '';
        const cognomeB = b.cognome?.toLowerCase() || '';
        const nomeA = a.nome?.toLowerCase() || '';
        const nomeB = b.nome?.toLowerCase() || '';
        if (cognomeA < cognomeB) return -1;
        if (cognomeA > cognomeB) return 1;
        if (nomeA < nomeB) return -1;
        if (nomeA > nomeB) return 1;
        return 0;
    });

    return contatti;
}
// Fine funzione getFilteredAndSortedContatti

// === EVENT LISTENERS ===

// Inizio funzione handleAnagraficaClick
function handleAnagraficaClick(event) {
    const app = getApp();
    const target = event.target;
    
    const newContattoBtn = target.closest('#new-contatto-btn');
    const importBtn = target.closest('#import-contatti-btn');
    const exportBtn = target.closest('#export-contatti-btn');
    const printBtn = target.closest('#print-anagrafica-btn');
    const deleteRubricaBtn = target.closest('#delete-rubrica-btn');
    
    if (newContattoBtn) openContattoModal.call(app);
    if (importBtn) document.getElementById('import-anagrafica-file')?.click();
    if (exportBtn) exportAnagraficaToCSV.call(app);
    if (printBtn) printAnagrafica.call(app);
    if (deleteRubricaBtn) deleteRubrica.call(app);
}
// Fine funzione handleAnagraficaClick

// Inizio funzione handleAnagraficaChange
function handleAnagraficaChange(event) {
    const app = getApp();
    if (event.target.id === 'import-anagrafica-file') {
        importAnagraficaFromCSV.call(app, event);
    }
}
// Fine funzione handleAnagraficaChange

// Inizio funzione handleAnagraficaInput
function handleAnagraficaInput(event) {
    const app = getApp();
    if (event.target.id === 'anagrafica-search') {
        anagraficaState.searchQuery = event.target.value;
        renderContattiGrid.call(app);
    }
}
// Fine funzione handleAnagraficaInput

// Inizio funzione setupAnagraficaEventListeners
function setupAnagraficaEventListeners() {
    const app = this;
    const container = document.getElementById('section-anagrafica');
    if (!container) return;

    // Rimuove i listener precedenti per evitare duplicazioni
    container.removeEventListener('click', handleAnagraficaClick);
    container.removeEventListener('change', handleAnagraficaChange);
    container.removeEventListener('input', handleAnagraficaInput);

    // Aggiunge i listener aggiornati
    container.addEventListener('click', handleAnagraficaClick);
    container.addEventListener('change', handleAnagraficaChange);
    container.addEventListener('input', handleAnagraficaInput);
}
// Fine funzione setupAnagraficaEventListeners

// Inizio funzione setupCardEventListeners
function setupCardEventListeners() {
    const app = this;
    const cards = document.querySelectorAll('.contatto-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const contattoId = card.dataset.contattoId;
            editContatto.call(app, contattoId);
        });
    });
}
// Fine funzione setupCardEventListeners

// === GESTIONE FORM CONTATTO ===

// Inizio funzione resetContattoForm
function resetContattoForm() {
    anagraficaState.contattoForm = {
        nome: '', cognome: '', azienda: '',
        telefono1: '', email: '',
        note: ''
    };
    anagraficaState.editingContatto = null;
}
// Fine funzione resetContattoForm

// Inizio funzione openContattoModal
function openContattoModal(contatto = null) {
    const app = this;
    const isEditing = !!contatto;
    
    if (contatto) {
        anagraficaState.contattoForm = { ...contatto };
        anagraficaState.editingContatto = contatto.id;
    } else {
        resetContattoForm();
    }

    const modalHTML = `
        <div class="modal-header">
            <h2>${isEditing ? 'Modifica Contatto' : 'Nuovo Contatto'}</h2>
            <button id="close-contatto-modal-btn" class="modal-close-btn">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="form-label">Cognome</label>
                        <input type="text" id="contatto-cognome" class="form-control" value="${anagraficaState.contattoForm.cognome}">
                    </div>
                    <div>
                        <label class="form-label">Nome</label>
                        <input type="text" id="contatto-nome" class="form-control" value="${anagraficaState.contattoForm.nome}">
                    </div>
                </div>
                <div>
                    <label class="form-label">Azienda</label>
                    <input type="text" id="contatto-azienda" class="form-control" value="${anagraficaState.contattoForm.azienda}" style="width: 100%; max-width: none;">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="form-label">Telefono</label>
                        <input type="tel" id="contatto-telefono1" class="form-control" value="${anagraficaState.contattoForm.telefono1}">
                    </div>
                    <div>
                        <label class="form-label">Email</label>
                        <input type="email" id="contatto-email" class="form-control" value="${anagraficaState.contattoForm.email}">
                    </div>
                </div>
                <div>
                    <label class="form-label">Note</label>
                    <input type="text" id="contatto-note" class="form-control" value="${anagraficaState.contattoForm.note}" style="width: 100%; max-width: none;">
                </div>
            </div>
        </div>
        <div class="modal-actions" style="align-items: center;">
            ${isEditing ? `
                <button id="delete-contatto-modal-btn" class="btn btn-danger" style="margin-right: auto;">
                    <i data-lucide="trash-2" class="mr-2"></i>Elimina
                </button>
            ` : ''}
            <button id="cancel-contatto-modal-btn" class="btn btn-secondary">Annulla</button>
            <button id="save-contatto-modal-btn" class="btn btn-primary">${isEditing ? 'Salva' : 'Aggiungi'}</button>
        </div>
    `;

    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = modalHTML;
    
    modalContentEl.classList.add('modal-lg'); 

    document.getElementById('save-contatto-modal-btn').addEventListener('click', () => saveContattoFromModal.call(app));
    document.getElementById('close-contatto-modal-btn').addEventListener('click', () => app.hideFormModal());
    document.getElementById('cancel-contatto-modal-btn').addEventListener('click', () => app.hideFormModal());

    if (isEditing) {
        document.getElementById('delete-contatto-modal-btn').addEventListener('click', () => {
            deleteContatto.call(app, anagraficaState.editingContatto);
        });
    }

    app.showFormModal();
    app.refreshIcons();
}
// Fine funzione openContattoModal

// Inizio funzione saveContattoFromModal
function saveContattoFromModal() {
    const app = this;
    
    const cognome = document.getElementById('contatto-cognome')?.value.trim() || '';
    const nome = document.getElementById('contatto-nome')?.value.trim() || '';
    const azienda = document.getElementById('contatto-azienda')?.value.trim() || '';
    const telefono1 = document.getElementById('contatto-telefono1')?.value.trim() || '';
    const email = document.getElementById('contatto-email')?.value.trim() || '';
    const note = document.getElementById('contatto-note')?.value.trim() || '';

    if (!cognome && !nome) {
        app.showNotification('Compila almeno il cognome o il nome', 'error');
        return;
    }

    const contattoData = {
        cognome, nome, azienda,
        telefono1, email, note
    };

    if (anagraficaState.editingContatto) {
        const index = app.state.data.contatti.findIndex(c => c.id === anagraficaState.editingContatto);
        if (index !== -1) {
            app.state.data.contatti[index] = { ...app.state.data.contatti[index], ...contattoData };
        }
        app.showNotification('Contatto aggiornato');
    } else {
        const newContatto = {
            id: app.generateUniqueId('contatto'),
            ...contattoData
        };
        app.state.data.contatti.push(newContatto);
        app.showNotification('Contatto aggiunto');
    }

    app.saveToStorage('data', app.state.data);
    renderContattiGrid.call(app);
    app.hideFormModal();
}
// Fine funzione saveContattoFromModal

// Inizio funzione editContatto
function editContatto(contattoId) {
    const app = this;
    const contatto = app.state.data.contatti.find(c => c.id === contattoId);
    if (contatto) {
        openContattoModal.call(app, contatto);
    }
}
// Fine funzione editContatto

// Inizio funzione deleteContatto
function deleteContatto(contattoId) {
    const app = this;
    // INIZIO MODIFICA: Corretta la chiamata a showConfirm con due parametri
    app.showConfirm(
        'Sei sicuro di voler eliminare questo contatto? L\'azione è irreversibile.',
        () => {
            app.state.data.contatti = app.state.data.contatti.filter(c => c.id !== contattoId);
            app.saveToStorage('data', app.state.data);
            renderContattiGrid.call(app);
            app.showNotification('Contatto eliminato');
            app.hideFormModal(); // Chiude il modale dopo la conferma
        }
    );
    // FINE MODIFICA
}
// Fine funzione deleteContatto

// === ELIMINA RUBRICA ===

// Inizio funzione deleteRubrica
function deleteRubrica() {
    const app = this;
    
    if (app.state.data.contatti.length === 0) {
        return app.showNotification('La rubrica è già vuota', 'error');
    }
    
    // INIZIO MODIFICA: Corretta la chiamata a showConfirm con due parametri
    app.showConfirm(
        `Sei sicuro di voler eliminare TUTTI i ${app.state.data.contatti.length} contatti? L'azione è irreversibile.`,
        () => {
            app.state.data.contatti = [];
            app.saveToStorage('data', app.state.data);
            app.showNotification('Rubrica eliminata con successo');
            renderContattiGrid.call(this);
        }
    );
    // FINE MODIFICA
}
// Fine funzione deleteRubrica

// === FUNZIONI EXPORT E STAMPA ===

// Inizio funzione exportAnagraficaToCSV
function exportAnagraficaToCSV() {
    const app = getApp();
    const contatti = app.state.data.contatti;
    
    if (contatti.length === 0) {
        return app.showNotification("Nessun contatto da esportare.");
    }

    const headers = ['Cognome', 'Nome', 'Azienda', 'Telefono', 'Email', 'Note'];
    const rows = contatti.map(c => {
        return [
            c.cognome, c.nome, c.azienda,
            c.telefono1, c.email,
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

// Inizio funzione importAnagraficaFromCSV
function importAnagraficaFromCSV(event) {
    const app = this;
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const csvText = e.target.result;
            const lines = csvText.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                return app.showNotification('Il file CSV è vuoto o non valido.', 'error');
            }

            // Salta l'intestazione (prima riga)
            const dataLines = lines.slice(1);
            let importedCount = 0;

            dataLines.forEach(line => {
                // Parse CSV tenendo conto dei campi tra virgolette
                const fields = [];
                let current = '';
                let inQuotes = false;
                
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    
                    if (char === '"') {
                        if (inQuotes && line[i + 1] === '"') {
                            current += '"';
                            i++;
                        } else {
                            inQuotes = !inQuotes;
                        }
                    } else if (char === ',' && !inQuotes) {
                        fields.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                fields.push(current.trim());

                // Verifica che ci siano almeno cognome o nome
                const cognome = fields[0] || '';
                const nome = fields[1] || '';
                
                if (cognome || nome) {
                    const nuovoContatto = {
                        id: app.generateUniqueId('contatto'),
                        cognome: cognome,
                        nome: nome,
                        azienda: fields[2] || '',
                        telefono1: fields[3] || '',
                        email: fields[4] || '',
                        note: fields[5] || ''
                    };
                    
                    app.state.data.contatti.push(nuovoContatto);
                    importedCount++;
                }
            });

            if (importedCount > 0) {
                app.saveToStorage('data', app.state.data);
                app.showNotification(`${importedCount} contatti importati con successo!`);
                renderContattiGrid.call(this);
            } else {
                app.showNotification('Nessun contatto valido trovato nel file.', 'error');
            }

            // Reset input file
            event.target.value = '';
            
        } catch (error) {
            console.error('Errore import CSV:', error);
            app.showNotification('Errore durante l\'importazione del file CSV.', 'error');
        }
    };
    
    reader.readAsText(file);
}
// Fine funzione importAnagraficaFromCSV

// Inizio funzione printAnagrafica
function printAnagrafica() {
    const app = getApp();
    const contatti = getFilteredAndSortedContatti.call(app);

    if (contatti.length === 0) {
        return app.showNotification("Nessun contatto da stampare.");
    }

    const dateElement = document.getElementById('print-anagrafica-date');
    if (dateElement) {
        dateElement.textContent = `Elenco del ${app.formatDateForFilename()}`;
    }
    
    const printList = document.getElementById('print-anagrafica-list');
    
    if (!printList) {
        console.error("Elemento 'print-anagrafica-list' non trovato nel DOM.");
        return;
    }
    
    let html = '';
    for (let i = 0; i < contatti.length; i += 3) {
        const c1 = contatti[i];
        const c2 = contatti[i + 1];
        const c3 = contatti[i + 2];
        
        html += `
            <tr>
                <td>${c1 ? `${c1.cognome} ${c1.nome}`.trim() : ''}</td>
                <td>${c1 ? c1.telefono1 || '' : ''}</td>
                <td>${c2 ? `${c2.cognome} ${c2.nome}`.trim() : ''}</td>
                <td>${c2 ? c2.telefono1 || '' : ''}</td>
                <td>${c3 ? `${c3.cognome} ${c3.nome}`.trim() : ''}</td>
                <td>${c3 ? c3.telefono1 || '' : ''}</td>
            </tr>
        `;
    }
    printList.innerHTML = html;

    document.getElementById('print-content').classList.add('hidden');
    document.getElementById('print-clients-content').classList.add('hidden');
    document.getElementById('virtual-print-content').classList.add('hidden');
    
    const printContentEl = document.getElementById('print-anagrafica-content');
    printContentEl.classList.remove('hidden');

    setTimeout(() => {
        window.print();
        setTimeout(() => {
            printContentEl.classList.add('hidden');
        }, 100);
    }, 100);
}
// Fine funzione printAnagrafica
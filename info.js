// =============================================
// FILE: info.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Info (elenco stazioni di servizio).
// =============================================

// === STATO LOCALE DEL MODULO INFO ===
// Inizio funzione infoState
let infoState = {
    searchQuery: '',
};
// Fine funzione infoState

// === INIZIALIZZAZIONE MODULO INFO ===
// Inizio funzione initInfo
function initInfo() {
    console.log('ℹ️ Inizializzazione modulo Info...');
    const app = this;

    // Aggiunge l'array 'stazioni' allo stato globale se non esiste
    if (!app.state.data.stazioni) {
        app.state.data.stazioni = [];
    }

    console.log('✅ Modulo Info inizializzato');
}
// Fine funzione initInfo

// Inizio funzione getInfoCardsHTML
function getInfoCardsHTML() {
    return `
    <div class="grid grid-cols-3 gap-6">
        <div class="card info-card">
            <div class="card-header green">
                <i data-lucide="settings"></i>
                <h3 class="card-title">Gestione e Servizi</h3>
            </div>
            <div class="card-body">
                <ul class="info-links-list">
                    <li><a href="https://enivirtualstation.4ts.it/" target="_blank" rel="noopener noreferrer">Virtualstation <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://myenistation.eni.com/content/myenistation/it/ordini.html" target="_blank" rel="noopener noreferrer">Ordini Carburanti <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://myenistation.eni.com/content/myenistation/it/contabilita.html" target="_blank" rel="noopener noreferrer">Contabilità <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://diviseeni.audes.com/it/customer/account/login" target="_blank" rel="noopener noreferrer">Audes <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://cardsmanager.it/Accounting/Login" target="_blank" rel="noopener noreferrer">Fattura 1click <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://fatturazioneelettronica.aruba.it/" target="_blank" rel="noopener noreferrer">Fattura (Aruba) <i data-lucide="external-link"></i></a></li>
                </ul>
            </div>
        </div>
        <div class="card info-card">
            <div class="card-header yellow">
                <i data-lucide="landmark"></i>
                <h3 class="card-title">Banche e Enti</h3>
            </div>
            <div class="card-body">
                <ul class="info-links-list">
                    <li><a href="https://www.unicredit.it/it/privati.html" target="_blank" rel="noopener noreferrer">Unicredit <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://www.bccroma.it/" target="_blank" rel="noopener noreferrer">BCC Roma <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://business.nexi.it/" target="_blank" rel="noopener noreferrer">Nexi Business <i data-lucide="external-link"></i></a></li>
                    <li><a href="https://iampe.adm.gov.it/sam/UI/Login?realm=/adm&locale=it&goto=https%3A%2F%2Fwww.adm.gov.it%2Fportale%2Fweb%2Fguest%2Flogin%3Fp_p_id%3D58%26p_p_lifecycle%3D0%26_58_redirect%3D%252Fportale%252F-%252Fcorrispettivi-distributori-carburanti" target="_blank" rel="noopener noreferrer">Agenzia Dogane <i data-lucide="external-link"></i></a></li>
                    <li><a href="http://gestori.cipreg.org/" target="_blank" rel="noopener noreferrer">Cipreg (gestori) <i data-lucide="external-link"></i></a></li>
                </ul>
            </div>
        </div>
        <div class="card info-card">
            <div class="card-header pink">
                <i data-lucide="phone"></i>
                <h3 class="card-title">Numeri Utili</h3>
            </div>
            <div class="card-body">
                <ul class="info-phone-list">
                    <li><span>Enilive Assistenza</span> <a href="tel:800797979">800 79 79 79</a></li>
                    <li><span>Portale Gestori</span> <a href="tel:800960970">800 960 970</a></li>
                    <li><span>POS Unicredit</span> <a href="tel:800900280">800 900 280</a></li>
                    <li><span>POS Enilive</span> <a href="tel:800999720">800 999 720</a></li>
                    <li><span>Deposito ENI</span> <a href="tel:0691820084">06 9182 0084</a></li>
                    <li><span>ARETI (guasti)</span> <a href="tel:800130336">800 130 336</a></li>
                </ul>
            </div>
        </div>
    </div>
    `;
}
// Fine funzione getInfoCardsHTML

// === RENDER SEZIONE INFO ===
// Inizio funzione renderInfoSection
function renderInfoSection(container) {
    console.log('🎨 Rendering sezione Info...');
    const app = this;

    container.innerHTML = `
        <div class="space-y-6">
            ${getInfoCardsHTML()}
            <div class="filters-bar">
                <div class="filter-group">
                    <div class="input-group">
                        <i data-lucide="search" class="input-group-icon"></i>
                        <input type="search" id="info-search-input" class="form-control" 
                               placeholder="Cerca per denominazione o indirizzo..." 
                               value="${infoState.searchQuery}" autocomplete="off">
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button id="import-stazioni-btn" class="btn btn-primary">
                        <i data-lucide="upload" class="w-4 h-4 mr-2"></i> Importa
                    </button>
                    <button id="export-stazioni-btn" class="btn btn-secondary">
                        <i data-lucide="download" class="w-4 h-4 mr-2"></i> Esporta
                    </button>
                    <button id="print-stazioni-btn" class="btn btn-secondary">
                        <i data-lucide="printer" class="w-4 h-4 mr-2"></i> Stampa
                    </button>
                    <button id="delete-stazioni-btn" class="btn btn-danger">
                        <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i> Elimina Lista
                    </button>
                </div>
            </div>
            <input type="file" id="import-stazioni-file" accept=".csv" style="display: none;">

            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Denominazione</th>
                            <th>Indirizzo</th>
                        </tr>
                    </thead>
                    <tbody id="stazioni-tbody"></tbody>
                </table>
            </div>
        </div>
    `;

    renderStazioniTable.call(app);
    setupInfoEventListeners.call(app);
    app.refreshIcons();
}
// Fine funzione renderInfoSection

// === RENDER TABELLA STAZIONI ===
// Inizio funzione renderStazioniTable
function renderStazioniTable() {
    const app = this;
    const tbody = document.getElementById('stazioni-tbody');
    if (!tbody) return;

    const stazioni = getFilteredStazioni.call(app);

    if (stazioni.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-12">
                    <div class="empty-state">
                        <i data-lucide="fuel"></i>
                        <div class="empty-state-title">Nessuna stazione di servizio trovata</div>
                        <div class="empty-state-description">Importa un file CSV per iniziare.</div>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = stazioni.map(stazione => `
            <tr class="hover:bg-secondary">
                <td class="font-medium text-primary">${stazione.denominazione}</td>
                <td class="text-primary">${stazione.indirizzo}</td>
            </tr>
        `).join('');
    }

    app.refreshIcons();
}
// Fine funzione renderStazioniTable

// === FILTRA STAZIONI ===
// Inizio funzione getFilteredStazioni
function getFilteredStazioni() {
    const app = this;
    let stazioni = [...(app.state.data.stazioni || [])];
    const query = infoState.searchQuery.toLowerCase().trim();

    if (query) {
        stazioni = stazioni.filter(s =>
            s.denominazione.toLowerCase().includes(query) ||
            s.indirizzo.toLowerCase().includes(query)
        );
    }

    return stazioni;
}
// Fine funzione getFilteredStazioni

// === SETUP EVENT LISTENERS ===
// Inizio funzione setupInfoEventListeners
function setupInfoEventListeners() {
    const app = this;
    
    // Ricerca
    const searchInput = document.getElementById('info-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            infoState.searchQuery = e.target.value;
            renderStazioniTable.call(app);
        });
    }

    // Bottoni
    const importBtn = document.getElementById('import-stazioni-btn');
    const importFile = document.getElementById('import-stazioni-file');
    const exportBtn = document.getElementById('export-stazioni-btn');
    const printBtn = document.getElementById('print-stazioni-btn');
    const deleteBtn = document.getElementById('delete-stazioni-btn');

    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', (e) => importStazioniFromCSV.call(app, e));
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => exportStazioniToCSV.call(app));
    }

    if (printBtn) {
        printBtn.addEventListener('click', () => printStazioni.call(app));
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => deleteStazioniList.call(app));
    }
}
// Fine funzione setupInfoEventListeners

// Inizio funzione normalizeString
function normalizeString(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}
// Fine funzione normalizeString

// === FUNZIONI IMPORT/EXPORT/STAMPA ===
// Inizio funzione importStazioniFromCSV
function importStazioniFromCSV(event) {
    const app = this;
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target.result;
            const rows = text.split('\n').slice(1);
            const importedStazioni = [];
            
            rows.forEach(row => {
                const columns = row.split(';'); 
                let denominazione = columns[0] ? columns[0].trim().replace(/"/g, '') : '';
                let indirizzo = columns[1] ? columns[1].trim().replace(/"/g, '') : '';
                
                denominazione = normalizeString(denominazione);
                indirizzo = normalizeString(indirizzo);
                
                if (denominazione && indirizzo) {
                    importedStazioni.push({ denominazione, indirizzo });
                }
            });

            app.state.data.stazioni = importedStazioni;
            app.saveToStorage('data', app.state.data);
            app.showNotification(`${importedStazioni.length} stazioni importate con successo.`);
            renderStazioniTable.call(app);

        } catch (error) {
            console.error("Errore durante l'importazione CSV:", error);
            app.showNotification("Errore durante l'importazione del file.", "error");
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file, 'UTF-8');
}
// Fine funzione importStazioniFromCSV

// Inizio funzione exportStazioniToCSV
function exportStazioniToCSV() {
    const app = this;
    const stazioni = getFilteredStazioni.call(app);

    if (stazioni.length === 0) {
        return app.showNotification("Nessun dato da esportare.");
    }

    const headers = ['Denominazione', 'Indirizzo'];
    const rows = stazioni.map(s => [s.denominazione, s.indirizzo]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(';'))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `elenco_stazioni_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    
    app.showNotification("Elenco esportato con successo.");
}
// Fine funzione exportStazioniToCSV

// Inizio funzione printStazioni
function printStazioni() {
    const app = this;
    const stazioni = getFilteredStazioni.call(app);

    if (stazioni.length === 0) {
        return app.showNotification("Nessun dato da stampare.");
    }

    const dateEl = document.getElementById('print-info-date');
    if (dateEl) {
        dateEl.textContent = `Elenco aggiornato al ${app.formatDateForFilename()}`;
    }

    const listEl = document.getElementById('print-info-list');
    if (listEl) {
        listEl.innerHTML = stazioni.map(s => `
            <tr>
                <td>${s.denominazione}</td>
                <td>${s.indirizzo}</td>
            </tr>
        `).join('');
    }

    document.getElementById('print-content').classList.add('hidden');
    document.getElementById('print-clients-content').classList.add('hidden');
    document.getElementById('virtual-print-content').classList.add('hidden');
    document.getElementById('print-anagrafica-content').classList.add('hidden');
    
    const printContentEl = document.getElementById('print-info-content');
    printContentEl.classList.remove('hidden');

    setTimeout(() => {
        window.print();
        setTimeout(() => {
            printContentEl.classList.add('hidden');
        }, 100);
    }, 100);
}
// Fine funzione printStazioni

// Inizio funzione deleteStazioniList
function deleteStazioniList() {
    const app = this;

    if (!app.state.data.stazioni || app.state.data.stazioni.length === 0) {
        app.showNotification("La lista è già vuota.");
        return;
    }

    app.showConfirm(
        `Sei sicuro di voler eliminare l'intero elenco di stazioni?<br><br>L'azione è irreversibile.`,
        () => {
            app.state.data.stazioni = [];
            app.saveToStorage('data', app.state.data);
            renderStazioniTable.call(app);
            app.showNotification("Elenco stazioni eliminato con successo.");
        }
    );
}
// Fine funzione deleteStazioniList

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
// Inizio funzione window exports
if (typeof window !== 'undefined') {
    window.initInfo = initInfo;
    window.renderInfoSection = renderInfoSection;
    window.infoState = infoState;
}
// Fine funzione window exports
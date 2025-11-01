// =============================================
// FILE: info.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Info (link, numeri utili, stazioni).
// =============================================

// === STATO LOCALE DEL MODULO INFO ===
let infoState = {
    searchQueryStazioni: '',
    stazioniCollapsed: false, // Stato per la sezione stazioni
};

// === INIZIALIZZAZIONE MODULO INFO ===
function initInfo() {
    console.log('ℹ️ Inizializzazione modulo Info...');
    const app = this; // 'this' è l'istanza dell'app passata da app.js

    // Carica lo stato di collasso dal localStorage
    infoState.stazioniCollapsed = app.loadFromStorage('stazioniCollapsed', false);

    // Inizializza gli array nello stato dati se non esistono
    if (!app.state.data.stazioni) {
        app.state.data.stazioni = [];
    }

    console.log('✅ Modulo Info inizializzato');
}

// === HTML DELLE CARD INFORMATIVE ===
function getInfoCardsHTML() {
    return `
    <div class="grid grid-cols-3 gap-6">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Gestione e Servizi</h3>
            </div>
            <div class="card-body">
                <ul class="info-list">
                    <li><a href="https://enivirtualstation.4ts.it/" target="_blank" rel="noopener noreferrer" class="info-link">
                        <span class="link-text">Virtualstation</span><i data-lucide="external-link"></i>
                    </a></li>
                    <li><a href="https://myenistation.eni.com/content/myenistation/it/ordini.html" target="_blank" rel="noopener noreferrer" class="info-link">
                        <span class="link-text">Ordini Carburanti</span><i data-lucide="external-link"></i>
                    </a></li>
                    <li><a href="https://myenistation.eni.com/content/myenistation/it/contabilita.html" target="_blank" rel="noopener noreferrer" class="info-link">
                        <span class="link-text">Contabilità</span><i data-lucide="external-link"></i>
                    </a></li>
                    <li><a href="https://diviseeni.audes.com/it/customer/account/login" target="_blank" rel="noopener noreferrer" class="info-link">
                        <span class="link-text">Audes</span><i data-lucide="external-link"></i>
                    </a></li>
                    <li><a href="https://cardsmanager.it/Accounting/Login" target="_blank" rel="noopener noreferrer" class="info-link">
                        <span class="link-text">Fattura 1click</span><i data-lucide="external-link"></i>
                    </a></li>
                    <li><a href="https://fatturazioneelettronica.aruba.it/" target="_blank" rel="noopener noreferrer" class="info-link">
                        <span class="link-text">Fattura (Aruba)</span><i data-lucide="external-link"></i>
                    </a></li>
                </ul>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Collegamenti Utili</h3>
            </div>
            <div class="card-body">
                <ul class="info-list">
                    <li><a href="https://www.unicredit.it/it/privati.html" target="_blank" rel="noopener noreferrer" class="info-link">
                        <span class="link-text">Unicredit</span><i data-lucide="external-link"></i>
                    </a></li>
                    <li><a href="https://www.bccroma.it/" target="_blank" rel="noopener noreferrer" class="info-link">
                        <span class="link-text">BCC Roma</span><i data-lucide="external-link"></i>
                    </a></li>
                    <li><a href="https://business.nexi.it/" target="_blank" rel="noopener noreferrer" class="info-link">
                        <span class="link-text">Nexi Business</span><i data-lucide="external-link"></i>
                    </a></li>
                    <li><a href="https://iampe.adm.gov.it/sam/UI/Login?realm=/adm&locale=it&goto=https%3A%2F%2Fwww.adm.gov.it%2Fportale%2Fweb%2Fguest%2Flogin%3Fp_p_id%3D58%26p_p_lifecycle%3D0%26_58_redirect%3D%252Fportale%252F-%252Fcorrispettivi-distributori-carburanti" target="_blank" rel="noopener noreferrer" class="info-link">
                        <span class="link-text">Agenzia Dogane</span><i data-lucide="external-link"></i>
                    </a></li>
                    <li><a href="http://gestori.cipreg.org/" target="_blank" rel="noopener noreferrer" class="info-link">
                        <span class="link-text">Cipreg (gestori)</span><i data-lucide="external-link"></i>
                    </a></li>
                </ul>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Assistenza</h3>
            </div>
            <div class="card-body">
                <ul class="info-list">
                    <li class="info-item"><span class="item-label">Enilive Assistenza</span> <a href="tel:800797979" class="item-value">800 79 79 79</a></li>
                    <li class="info-item"><span class="item-label">Portale Gestori</span> <a href="tel:800960970" class="item-value">800 960 970</a></li>
                    <li class="info-item"><span class="item-label">POS Unicredit</span> <a href="tel:800900280" class="item-value">800 900 280</a></li>
                    <li class="info-item"><span class="item-label">POS Enilive</span> <a href="tel:800999720" class="item-value">800 999 720</a></li>
                    <li class="info-item"><span class="item-label">Deposito ENI</span> <a href="tel:0691820084" class="item-value">06 9182 0084</a></li>
                    <li class="info-item"><span class="item-label">Fortech</span> <a href="tel:800216756" class="item-value">800 216 756</a></li>
                </ul>
            </div>
        </div>
        </div>
    `;
}

// === SETUP EVENT LISTENERS ===
function setupInfoEventListeners(app) { // Riceve 'app' come argomento
    const container = document.getElementById('section-info');
    if (!container) return;

    if (container._infoClickHandler) {
        container.removeEventListener('click', container._infoClickHandler);
    }
    if (container._infoInputHandler) {
        container.removeEventListener('input', container._infoInputHandler);
    }
    if (container._infoChangeHandler) {
        container.removeEventListener('change', container._infoChangeHandler);
    }

    const boundClickHandler = handleInfoClick.bind(app);
    const boundInputHandler = handleInfoInput.bind(app);
    const boundChangeHandler = handleInfoChange.bind(app);

    container._infoClickHandler = boundClickHandler;
    container._infoInputHandler = boundInputHandler;
    container._infoChangeHandler = boundChangeHandler;

    container.addEventListener('click', boundClickHandler);
    container.addEventListener('input', boundInputHandler);
    container.addEventListener('change', boundChangeHandler);
}

// Handler delegato per tutti i click nella sezione Info
function handleInfoClick(event) {
    const app = this; // 'this' è l'istanza dell'app grazie a .bind(app)
    if (!app) {
        console.error("Istanza App (this) non trovata in handleInfoClick");
        return;
    }
    const target = event.target;

    // Gestione sezioni collassabili
    const collapsibleHeader = target.closest('.collapsible-header');
    if (collapsibleHeader) {
        const sectionName = collapsibleHeader.dataset.sectionName;
        const sectionEl = collapsibleHeader.closest('.collapsible-section');
        if (!sectionEl) return;
        const isCollapsed = sectionEl.classList.toggle('collapsed');

        if (sectionName === 'stazioni') {
            infoState.stazioniCollapsed = isCollapsed;
            app.saveToStorage('stazioniCollapsed', isCollapsed);
        }
        app.refreshIcons(); // Aggiorna icona chevron
        return;
    }

    // Gestione pulsanti Stazioni
    if (target.closest('#import-stazioni-btn')) {
        const fileInput = document.getElementById('import-stazioni-file');
        if (fileInput) fileInput.click();
    }
    if (target.closest('#print-stazioni-btn')) printStazioni.call(app);
    if (target.closest('#delete-stazioni-btn')) deleteStazioniList.call(app);
}

// Handler delegato per gli input
function handleInfoInput(event) {
    const app = this; // 'this' è l'istanza dell'app
    if (!app) {
        console.error("Istanza App (this) non trovata in handleInfoInput");
        return;
    }
    if (event.target.id === 'info-search-stazioni-input') {
        infoState.searchQueryStazioni = event.target.value;
        renderStazioniTable.call(app);
    }
}

// Handler delegato per i change (es. upload file)
function handleInfoChange(event) {
    const app = this; // 'this' è l'istanza dell'app
    if (!app) {
        console.error("Istanza App (this) non trovata in handleInfoChange");
        return;
    }
    if (event.target.id === 'import-stazioni-file') importStazioniFromCSV.call(app, event);
}


// === RENDER SEZIONE INFO (CHIAMA SETUP EVENT LISTENERS ALLA FINE) ===
function renderInfoSection(container) {
    console.log('🎨 Rendering sezione Info...');
    const app = this; // 'this' è l'istanza dell'app

    container.innerHTML = `
        <div class="space-y-6">
            ${getInfoCardsHTML()}

            <div class="card collapsible-section ${infoState.stazioniCollapsed ? 'collapsed' : ''}">
                 <div class="card-header collapsible-header" data-section-name="stazioni">
                    <h2 class="card-title">Impianti ENILIVE Roma</h2>
                    <button class="collapse-toggle"><i data-lucide="${infoState.stazioniCollapsed ? 'chevron-down' : 'chevron-up'}"></i></button>
                </div>
                <div class="card-body collapsible-content">
                    <div class="filters-bar" style="background: none; border: none; padding: 0; margin-bottom: 1.5rem;">
                        <div class="filter-group">
                            <div class="input-group">
                                <i data-lucide="search" class="input-group-icon"></i>
                                <input type="search" id="info-search-stazioni-input" class="form-control"
                                       placeholder="Cerca impianto..."
                                       value="${infoState.searchQueryStazioni}" autocomplete="off">
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button id="import-stazioni-btn" class="btn btn-primary">
                                <i data-lucide="upload" class="w-4 h-4 mr-2"></i> Importa
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
                                    <th style="width: 10%;">PV</th>
                                    <th style="width: 35%;">Ragione Sociale</th>
                                    <th style="width: 40%;">Indirizzo</th>
                                    <th style="width: 15%;">Telefono</th>
                                </tr>
                            </thead>
                            <tbody id="stazioni-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    renderStazioniTable.call(app); // Usa call per passare 'app' come 'this'
    setupInfoEventListeners(app); // Passa 'app' esplicitamente QUI!
    app.refreshIcons();
}

// --- FUNZIONI PER GESTIONE STAZIONI ---

function renderStazioniTable() {
    const app = this; // Usa this
    const tbody = document.getElementById('stazioni-tbody');
    if (!tbody) return;

    const stazioni = getFilteredStazioni.call(app); // Usa call

    stazioni.sort((a, b) => (parseInt(a.pv, 10) || 0) - (parseInt(b.pv, 10) || 0));

    if (stazioni.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-12">
                    <div class="empty-state">
                        <i data-lucide="fuel"></i>
                        <div class="empty-state-title">Nessuna stazione trovata</div>
                        <div class="empty-state-description">Importa un file CSV.</div>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = stazioni.map(stazione => `
            <tr class="hover:bg-secondary">
                <td class="font-medium text-primary">${stazione.pv || '-'}</td>
                <td>${stazione.ragioneSociale || '-'}</td>
                <td>${stazione.indirizzo || '-'}</td>
                <td>${stazione.telefono || '-'}</td>
            </tr>
        `).join('');
    }
    app.refreshIcons();
}

function getFilteredStazioni() {
    const app = this; // Usa this
    let stazioni = [...(app.state.data.stazioni || [])];
    const query = infoState.searchQueryStazioni.toLowerCase().trim();

    if (query) {
        stazioni = stazioni.filter(s =>
            (s.pv && String(s.pv).toLowerCase().includes(query)) ||
            (s.ragioneSociale && s.ragioneSociale.toLowerCase().includes(query)) ||
            (s.indirizzo && s.indirizzo.toLowerCase().includes(query)) ||
            (s.telefono && String(s.telefono).toLowerCase().includes(query))
        );
    }
    return stazioni;
}

function importStazioniFromCSV(event) {
    const app = this; // Usa this
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target.result;
            const lines = text.trim().split(/\r?\n/);

            if (lines.length < 1) return app.showNotification("File CSV stazioni vuoto.", "warning");

            // Rimuovi header flessibile
            if (lines[0].toLowerCase().includes('pv') && lines[0].toLowerCase().includes('ragionesociale')) {
                lines.shift();
            }
            if (lines.length === 0) return app.showNotification("File CSV stazioni contiene solo header.", "warning");


            const delimiter = lines[0].includes(';') ? ';' : ',';
            const importedStazioni = [];

            lines.forEach((row, index) => {
                if (!row.trim()) return;

                // Split CSV robusto (semplificato)
                const columns = [];
                let currentColumn = '';
                let inQuotes = false;
                for (let i = 0; i < row.length; i++) {
                    const char = row[i];
                    if (char === '"') {
                        if (inQuotes && row[i + 1] === '"') {
                            currentColumn += '"';
                            i++;
                        } else {
                            inQuotes = !inQuotes;
                        }
                    } else if (char === delimiter && !inQuotes) {
                        columns.push(currentColumn.trim());
                        currentColumn = '';
                    } else {
                        currentColumn += char;
                    }
                }
                columns.push(currentColumn.trim());

                if (columns.length >= 2) {
                    const pv = columns[0] || '';
                    const ragioneSociale = columns[1] || '';
                    const indirizzo = columns[2] || '';
                    const telefono = columns[3] || '';

                    if (pv && ragioneSociale) importedStazioni.push({
                        pv,
                        ragioneSociale,
                        indirizzo,
                        telefono
                    });
                    else console.warn(`Riga ${index + 1} stazioni saltata: PV o Ragione Sociale mancante.`);
                } else {
                    console.warn(`Riga ${index + 1} stazioni saltata: colonne insufficienti.`);
                }
            });

            if (importedStazioni.length > 0) {
                app.state.data.stazioni = importedStazioni; // Sovrascrive
                app.saveToStorage('data', app.state.data);
                app.showNotification(`${importedStazioni.length} impianti importati.`);
                renderStazioniTable.call(app);
            } else {
                app.showNotification("Nessun dato stazione valido trovato nel CSV.", "warning");
            }

        } catch (error) {
            console.error("Errore importazione CSV Stazioni:", error);
            app.showNotification("Errore lettura file CSV stazioni.", "error");
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file, 'UTF-8');
}

function deleteStazioniList() {
    const app = this; // Usa this
    if (!app.state.data.stazioni || app.state.data.stazioni.length === 0) {
        return app.showNotification("Lista stazioni già vuota.");
    }
    app.showConfirm(
        `Eliminare l'elenco stazioni?<br><br>Azione irreversibile.`,
        () => {
            app.state.data.stazioni = [];
            app.saveToStorage('data', app.state.data);
            renderStazioniTable.call(app);
            app.showNotification("Elenco stazioni eliminato.");
        }
    );
}

function printStazioni() {
    const app = this; // Usa this
    const stazioni = getFilteredStazioni.call(app);

    if (stazioni.length === 0) return app.showNotification("Nessun impianto da stampare.");

    stazioni.sort((a, b) => (parseInt(a.pv, 10) || 0) - (parseInt(b.pv, 10) || 0));

    const dateElement = document.getElementById('print-info-date');
    if (dateElement) dateElement.textContent = `Elenco aggiornato al ${app.formatDateForFilename()}`;

    const printList = document.getElementById('print-info-list');
    if (!printList) return console.error("Elemento 'print-info-list' non trovato.");

    printList.innerHTML = stazioni.map(stazione => `
        <tr>
            <td>${stazione.pv || '-'}</td>
            <td>${stazione.ragioneSociale || '-'}</td>
            <td>${stazione.indirizzo || '-'}</td>
            <td>${stazione.telefono || '-'}</td>
        </tr>
    `).join('');

    document.querySelectorAll('.print-section').forEach(el => el.classList.add('hidden'));
    const printContentEl = document.getElementById('print-info-content');
    if (printContentEl) {
        printContentEl.classList.remove('hidden');
        requestAnimationFrame(() => {
            window.print();
        });
    } else {
        console.error("Elemento 'print-info-content' non trovato.");
    }
}

// === EXPORT GLOBALI ===
if (typeof window !== 'undefined') {
    window.initInfo = initInfo;
    window.renderInfoSection = renderInfoSection;
}
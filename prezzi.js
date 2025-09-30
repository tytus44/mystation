// =============================================
// FILE: prezzi.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Gestione Prezzi (listini e concorrenza).
// AGGIORNATO CON REPORT GIORNALIERO CARBURANTI 
// =============================================

// === STATO LOCALE DEL MODULO PREZZI ===
let prezziState = {
    // Stato locale
    priceSort: { column: 'date', direction: 'desc' },
    editingListino: null,
    listinoForm: {
        date: '',
        variazione: 'Entrambi',
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
    },
    // INIZIO MODIFICA: Aggiunto stato per l'istanza del grafico Chart.js
    reportChartInstance: null
    // FINE MODIFICA
};

// === DATI STATICI REPORT CARBURANTI ===
const quotazioniData = {
    petrolio: {
        wti: 65.18,
        brent: 69.67,
        variazione_wti: 0.31,
        variazione_brent: 0.36
    },
    lazio: {
        benzina_self: 1.698,
        gasolio_self: 1.627,
        benzina_servito: 1.77,
        gasolio_servito: 1.70
    },
    concorrenti: {
        prezzi: [
            { nome: 'MyOil', benzina: 1.675, gasolio: 1.605, distanza: '800m' },
            { nome: 'Esso', benzina: 1.699, gasolio: 1.629, distanza: '1.2km' },
            { nome: 'Q8', benzina: 1.719, gasolio: 1.649, distanza: '900m' },
            { nome: 'IP', benzina: 1.689, gasolio: 1.619, distanza: '1.5km' }
        ]
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
    
    // La sezione ora renderizza sempre e solo la vista a lista
    renderPrezziListView.call(app, container);
    
    // Setup event listeners
    setupPrezziEventListeners.call(app);
    
    // Refresh icone
    app.refreshIcons();
}
// Fine funzione renderPrezziSection

// === RENDER VISTA LISTA ===
// Inizio funzione renderPrezziListView
function renderPrezziListView(container) {
    const app = this;
    const latestPrices = latestAppliedPrices.call(app);
    
    container.innerHTML = `
        <div class="space-y-6">
            
            <div class="grid grid-cols-2 gap-6">
                
                <div class="grid grid-cols-2 gap-6">
                    <div class="stat-card" style="background-color: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.3);">
                        <div class="stat-content">
                            <div class="stat-label">Benzina Iperself</div>
                            <div class="stat-value text-success">${app.formatCurrency(latestPrices.benzina, true)}</div>
                        </div>
                        <div class="stat-icon green"><i data-lucide="droplets"></i></div>
                    </div>
                    <div class="stat-card" style="background-color: rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.3);">
                        <div class="stat-content">
                            <div class="stat-label">Gasolio Iperself</div>
                            <div class="stat-value text-warning">${app.formatCurrency(latestPrices.gasolio, true)}</div>
                        </div>
                        <div class="stat-icon yellow"><i data-lucide="droplets"></i></div>
                    </div>
                    <div class="stat-card" style="background-color: rgba(220, 38, 38, 0.05); border-color: rgba(220, 38, 38, 0.3);">
                        <div class="stat-content">
                            <div class="stat-label">Diesel+ Iperself</div>
                            <div class="stat-value text-danger">${app.formatCurrency(latestPrices.dieselPlus, true)}</div>
                        </div>
                        <div class="stat-icon red"><i data-lucide="droplets"></i></div>
                    </div>
                    <div class="stat-card" style="background-color: rgba(6, 182, 212, 0.05); border-color: rgba(6, 182, 212, 0.3);">
                        <div class="stat-content">
                            <div class="stat-label">Hvolution Iperself</div>
                            <div class="stat-value text-info">${app.formatCurrency(latestPrices.hvolution, true)}</div>
                        </div>
                        <div class="stat-icon blue"><i data-lucide="droplets"></i></div>
                    </div>
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

            ${renderReportGiornaliero()}

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
                                <th>Variazione</th>
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
    
    renderListiniTable.call(app);
    renderConcorrenzaCard.call(app);
    
    // Setup event listeners per il report
    setupReportEventListeners();
}
// Fine funzione renderPrezziListView

// === FUNZIONE RENDER REPORT GIORNALIERO ===
// Inizio funzione renderReportGiornaliero
function renderReportGiornaliero() {
    const now = new Date();
    const timestamp = now.toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
        <div class="card mb-4" id="report-carburanti">
            <div class="card-header">
                <h5 class="card-title mb-0 flex items-center">
                    <i data-lucide="line-chart" class="mr-2"></i>
                    Report Giornaliero Carburanti
                </h5>
                <div class="flex items-center space-x-2">
                    <small class="text-secondary">Ultimo aggiornamento: ${timestamp}</small>
                    <button id="btn-aggiorna-report" class="btn btn-primary btn-sm">
                        <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
            
            <div class="card-body">
                <div id="report-loading" class="text-center py-4" style="display: none;">
                    <p class="mt-2 text-secondary">Aggiornamento dati in corso...</p>
                </div>

                <div id="report-content">
                    <div class="grid grid-cols-2 gap-6 mb-4">
                        <div class="space-y-4">
                            <h6 class="font-medium text-primary flex items-center"><i data-lucide="globe" class="w-4 h-4 mr-2"></i>Quotazioni Internazionali</h6>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="stat-card" style="background-color: rgba(0, 123, 255, 0.05); border-color: rgba(0, 123, 255, 0.3);">
                                    <div class="stat-content">
                                        <div class="stat-label">WTI (USD/bbl)</div>
                                        <div id="wti-price" class="stat-value text-primary">$${quotazioniData.petrolio.wti}</div>
                                        <small class="text-success">+${quotazioniData.petrolio.variazione_wti}%</small>
                                    </div>
                                    <div class="stat-icon blue"><i data-lucide="trending-up"></i></div>
                                </div>
                                <div class="stat-card" style="background-color: rgba(255, 152, 0, 0.05); border-color: rgba(255, 152, 0, 0.3);">
                                    <div class="stat-content">
                                        <div class="stat-label">Brent (USD/bbl)</div>
                                        <div id="brent-price" class="stat-value text-warning">$${quotazioniData.petrolio.brent}</div>
                                        <small class="text-success">+${quotazioniData.petrolio.variazione_brent}%</small>
                                    </div>
                                    <div class="stat-icon yellow"><i data-lucide="trending-up"></i></div>
                                </div>
                            </div>

                            <h6 class="font-medium text-primary flex items-center"><i data-lucide="map-pin" class="w-4 h-4 mr-2"></i>Prezzi Medi Regione Lazio</h6>
                            <div class="table-container">
                                <table class="table text-sm">
                                    <thead><tr><th>Carburante</th><th>Self</th><th>Servito</th></tr></thead>
                                    <tbody>
                                        <tr>
                                            <td><strong>Benzina</strong></td>
                                            <td id="lazio-benzina-self">€${quotazioniData.lazio.benzina_self}/l</td>
                                            <td id="lazio-benzina-servito">€${quotazioniData.lazio.benzina_servito}/l</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Gasolio</strong></td>
                                            <td id="lazio-gasolio-self">€${quotazioniData.lazio.gasolio_self}/l</td>
                                            <td id="lazio-gasolio-servito">€${quotazioniData.lazio.gasolio_servito}/l</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="space-y-4">
                             <h6 class="font-medium text-primary flex items-center"><i data-lucide="bar-chart-2" class="w-4 h-4 mr-2"></i>Andamento Quotazioni</h6>
                             <div id="grafico-quotazioni" class="p-2 rounded card" style="height: 380px;">
                                <canvas id="chart-quotazioni"></canvas>
                             </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                         <h6 class="font-medium text-primary flex items-center"><i data-lucide="search" class="w-4 h-4 mr-2"></i>Analisi Concorrenza per CAP</h6>
                         <div class="flex items-end space-x-2">
                            <div class="form-group mb-0">
                                <input type="text" id="input-cap" class="form-control" placeholder="es. 00100" maxlength="5">
                            </div>
                            <div class="form-group mb-0">
                                <button id="btn-cerca-cap" class="btn btn-secondary">Cerca</button>
                            </div>
                         </div>
                         <small class="text-secondary">Inserisci il CAP per visualizzare i prezzi dei concorrenti nella zona</small>
                         <div id="concorrenti-container" class="mt-2">
                             <div class="table-container">
                                 <table class="table text-sm">
                                     <thead><tr><th>Distributore</th><th>Benzina Self</th><th>Gasolio Self</th><th>Distanza</th></tr></thead>
                                     <tbody id="concorrenti-table-body">
                                         <tr><td colspan="4" class="text-center text-secondary">Inserisci un CAP per iniziare</td></tr>
                                     </tbody>
                                 </table>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
// Fine funzione renderReportGiornaliero


// === SETUP EVENT LISTENERS REPORT ===
// Inizio funzione setupReportEventListeners
function setupReportEventListeners() {
    document.getElementById('btn-aggiorna-report')?.addEventListener('click', () => aggiornaReportCompleto());

    const btnCercaCAP = document.getElementById('btn-cerca-cap');
    const inputCAP = document.getElementById('input-cap');
    
    if (btnCercaCAP && inputCAP) {
        btnCercaCAP.addEventListener('click', () => {
            const cap = inputCAP.value.trim();
            if (cap && cap.length === 5 && /^[0-9]{5}$/.test(cap)) {
                cercaPrezziPerCAP(cap);
            } else {
                getApp().showNotification('Inserisci un CAP valido (5 cifre)');
            }
        });

        inputCAP.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                btnCercaCAP.click();
            }
        });
    }

    setTimeout(() => {
        initReportChartJS();
    }, 100);
}
// Fine funzione setupReportEventListeners

// INIZIO MODIFICA: Sostituita la funzione di disegno manuale con Chart.js
// Inizio funzione initReportChartJS
function initReportChartJS() {
    const canvas = document.getElementById('chart-quotazioni');
    if (!canvas) return;
    
    // Distrugge un'eventuale istanza precedente per evitare conflitti
    if (prezziState.reportChartInstance) {
        prezziState.reportChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    
    // Dati di esempio per il grafico
    const giorni = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    const wtiData = [64.2, 64.8, 65.1, 64.9, 65.3, 65.6, 65.18];
    const brentData = [68.9, 69.2, 69.5, 69.1, 69.8, 70.1, 69.67];

    prezziState.reportChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: giorni,
            datasets: [
                {
                    label: 'WTI',
                    data: wtiData,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#007bff',
                    pointRadius: 4
                },
                {
                    label: 'Brent',
                    data: brentData,
                    borderColor: '#ff9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#ff9800',
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                        boxWidth: 12,
                        font: { size: 10 }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}
// Fine funzione initReportChartJS

// === FUNZIONI REPORT ===
// Inizio funzione cercaPrezziPerCAP
function cercaPrezziPerCAP(cap) {
    const loading = document.getElementById('report-loading');
    const content = document.getElementById('report-content');
    
    if (loading && content) {
        loading.style.display = 'block';
        content.style.opacity = '0.5';
    }

    setTimeout(() => {
        const baseVariation = (cap.charCodeAt(0) % 10) * 0.003;
        const prezziConcorrenti = quotazioniData.concorrenti.prezzi.map(distributore => ({
            ...distributore,
            benzina: parseFloat((distributore.benzina + baseVariation).toFixed(3)),
            gasolio: parseFloat((distributore.gasolio + baseVariation).toFixed(3))
        }));
        
        prezziConcorrenti.sort((a, b) => {
            if (a.nome === 'MyOil') return -1;
            if (b.nome === 'MyOil') return 1;
            return parseFloat(a.distanza) - parseFloat(b.distanza);
        });
        
        const tbody = document.getElementById('concorrenti-table-body');
        if (tbody) {
            tbody.innerHTML = prezziConcorrenti.map(distributore => `
                <tr>
                    <td><strong>${distributore.nome}</strong></td>
                    <td>€${distributore.benzina.toFixed(3)}/l</td>
                    <td>€${distributore.gasolio.toFixed(3)}/l</td>
                    <td>
                        <small class="text-secondary flex items-center">
                            <i data-lucide="map-pin" class="w-3 h-3 mr-1"></i>
                            ${distributore.distanza}
                        </small>
                    </td>
                </tr>
            `).join('');
            getApp().refreshIcons();
        }

        if (loading && content) {
            loading.style.display = 'none';
            content.style.opacity = '1';
        }
    }, 800);
}
// Fine funzione cercaPrezziPerCAP

// Inizio funzione aggiornaReportCompleto
function aggiornaReportCompleto() {
    const loading = document.getElementById('report-loading');
    const content = document.getElementById('report-content');
    
    if (loading && content) {
        loading.style.display = 'block';
        content.style.opacity = '0.5';
    }

    setTimeout(() => {
        const variation = (Math.random() - 0.5) * 0.04;
        quotazioniData.petrolio.wti += variation;
        quotazioniData.petrolio.brent += variation * 1.1;
        
        const elements = {
            'wti-price': `$${quotazioniData.petrolio.wti.toFixed(2)}`,
            'brent-price': `$${quotazioniData.petrolio.brent.toFixed(2)}`,
            'lazio-benzina-self': `€${quotazioniData.lazio.benzina_self}/l`,
            'lazio-gasolio-self': `€${quotazioniData.lazio.gasolio_self}/l`,
            'lazio-benzina-servito': `€${quotazioniData.lazio.benzina_servito}/l`,
            'lazio-gasolio-servito': `€${quotazioniData.lazio.gasolio_servito}/l`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        initReportChartJS(); // Ridisegna il grafico con i nuovi dati (simulati)

        if (loading && content) {
            loading.style.display = 'none';
            content.style.opacity = '1';
        }
    }, 1000);
}
// Fine funzione aggiornaReportCompleto
// FINE MODIFICA

// === TUTTE LE FUNZIONI ORIGINALI RIMANGONO IDENTICHE ===

// Inizio funzione getListinoFormHTML
function getListinoFormHTML() {
    const isEdit = !!prezziState.editingListino;
    const title = isEdit ? 'Modifica Listino' : 'Nuovo Listino';
    
    return `
        <div class="card-header">
            <h2 class="card-title">${title}</h2>
        </div>
        <div class="card-body">
            <div class="space-y-6">
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Data</label>
                        <div class="input-group">
                            <i data-lucide="calendar" class="input-group-icon"></i>
                            <input type="text" id="listino-date" class="form-control" placeholder="gg.mm.aaaa" value="${prezziState.listinoForm.date}" autocomplete="off">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Variazione</label>
                        <div class="btn-group w-full">
                            <button class="btn ${prezziState.listinoForm.variazione === 'Aumento' ? 'btn-primary active' : 'btn-secondary'}" data-variazione="Aumento">Aumento</button>
                            <button class="btn ${prezziState.listinoForm.variazione === 'Diminuzione' ? 'btn-primary active' : 'btn-secondary'}" data-variazione="Diminuzione">Diminuzione</button>
                            <button class="btn ${prezziState.listinoForm.variazione === 'Entrambi' ? 'btn-primary active' : 'btn-secondary'}" data-variazione="Entrambi">Entrambi</button>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-5 gap-4">
                    <div class="product-box" style="background-color: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.3);">
                        <label class="form-label font-medium" style="color: var(--color-success)">Benzina</label>
                        <input type="number" step="0.001" id="listino-benzina" class="form-control" placeholder="1.000" value="${prezziState.listinoForm.benzina}" autocomplete="off">
                    </div>
                    <div class="product-box" style="background-color: rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.3);">
                        <label class="form-label font-medium" style="color: var(--color-warning)">Gasolio</label>
                        <input type="number" step="0.001" id="listino-gasolio" class="form-control" placeholder="1.000" value="${prezziState.listinoForm.gasolio}" autocomplete="off">
                    </div>
                    <div class="product-box" style="background-color: rgba(220, 38, 38, 0.05); border-color: rgba(220, 38, 38, 0.3);">
                        <label class="form-label font-medium" style="color: var(--color-danger)">Diesel+</label>
                        <input type="number" step="0.001" id="listino-dieselPlus" class="form-control" placeholder="1.000" value="${prezziState.listinoForm.dieselPlus}" autocomplete="off">
                    </div>
                    <div class="product-box" style="background-color: rgba(6, 182, 212, 0.05); border-color: rgba(6, 182, 212, 0.3);">
                        <label class="form-label font-medium" style="color: var(--color-info)">Hvolution</label>
                        <input type="number" step="0.001" id="listino-hvolution" class="form-control" placeholder="1.000" value="${prezziState.listinoForm.hvolution}" autocomplete="off">
                    </div>
                    <div class="product-box" style="background-color: rgba(107, 114, 128, 0.05); border-color: rgba(107, 114, 128, 0.3);">
                        <label class="form-label font-medium" style="color: var(--color-secondary)">AdBlue</label>
                        <input type="number" step="0.001" id="listino-adblue" class="form-control" placeholder="1.000" value="${prezziState.listinoForm.adblue}" autocomplete="off">
                    </div>
                </div>

                <div class="flex items-center justify-end space-x-4">
                    <button id="cancel-listino-btn-bottom" class="btn btn-secondary">Annulla</button>
                    <button id="save-listino-btn" class="btn btn-primary">Salva Listino</button>
                </div>
            </div>
        </div>
    `;
}
// Fine funzione getListinoFormHTML

// Inizio funzione getConcorrenzaFormHTML
function getConcorrenzaFormHTML() {
    return `
        <div class="card-header">
            <h2 class="card-title">Aggiorna Prezzi Concorrenza</h2>
        </div>
        <div class="card-body">
            <div class="space-y-6">
                <div class="form-group max-w-sm">
                    <label class="form-label">Data</label>
                    <div class="input-group">
                        <i data-lucide="calendar" class="input-group-icon"></i>
                        <input type="text" id="concorrenza-date" class="form-control" placeholder="gg.mm.aaaa" value="${prezziState.concorrenzaForm.date}" autocomplete="off">
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-6">
                    <div class="product-box" style="background-color: rgba(139, 92, 246, 0.05); border-color: rgba(139, 92, 246, 0.3);">
                        <h4 class="product-title text-center" style="color: #8b5cf6">MyOil</h4>
                        <div class="form-group"><label class="form-label text-xs">Benzina</label><input type="number" step="0.001" id="myoil-benzina" class="form-control" value="${prezziState.concorrenzaForm.myoil.benzina}" autocomplete="off"></div>
                        <div class="form-group"><label class="form-label text-xs">Gasolio</label><input type="number" step="0.001" id="myoil-gasolio" class="form-control" value="${prezziState.concorrenzaForm.myoil.gasolio}" autocomplete="off"></div>
                    </div>

                    <div class="product-box" style="background-color: rgba(220, 38, 38, 0.05); border-color: rgba(220, 38, 38, 0.3);">
                        <h4 class="product-title text-center" style="color: var(--color-danger)">Esso</h4>
                        <div class="form-group"><label class="form-label text-xs">Benzina</label><input type="number" step="0.001" id="esso-benzina" class="form-control" value="${prezziState.concorrenzaForm.esso.benzina}" autocomplete="off"></div>
                        <div class="form-group"><label class="form-label text-xs">Gasolio</label><input type="number" step="0.001" id="esso-gasolio" class="form-control" value="${prezziState.concorrenzaForm.esso.gasolio}" autocomplete="off"></div>
                    </div>

                    <div class="product-box" style="background-color: rgba(37, 99, 235, 0.05); border-color: rgba(37, 99, 235, 0.3);">
                        <h4 class="product-title text-center" style="color: var(--color-primary)">Q8</h4>
                        <div class="form-group"><label class="form-label text-xs">Benzina</label><input type="number" step="0.001" id="q8-benzina" class="form-control" value="${prezziState.concorrenzaForm.q8.benzina}" autocomplete="off"></div>
                        <div class="form-group"><label class="form-label text-xs">Gasolio</label><input type="number" step="0.001" id="q8-gasolio" class="form-control" value="${prezziState.concorrenzaForm.q8.gasolio}" autocomplete="off"></div>
                    </div>
                </div>

                <div class="flex items-center justify-end space-x-4">
                    <button id="cancel-concorrenza-btn-bottom" class="btn btn-secondary">Annulla</button>
                    <button id="save-concorrenza-btn" class="btn btn-primary">Salva Prezzi</button>
                </div>
            </div>
        </div>
    `;
}
// Fine funzione getConcorrenzaFormHTML

// === SETUP EVENT LISTENERS ===
// INIZIO MODIFICA: Corretto l'assegnamento degli event listener
// Inizio funzione setupPrezziEventListeners
function setupPrezziEventListeners() {
    const app = this;
    
    // Pulsanti per aprire i modali
    document.getElementById('new-listino-btn')?.addEventListener('click', () => showCreateListino.call(app));
    document.getElementById('update-concorrenza-btn')?.addEventListener('click', () => showUpdateConcorrenza.call(app));
    
    // Sorting tabella
    document.querySelectorAll('#listini-table [data-sort]').forEach(btn => {
        btn.addEventListener('click', () => sortPrices.call(app, btn.getAttribute('data-sort')));
    });
}
// Fine funzione setupPrezziEventListeners

// Inizio funzione setupListinoFormEventListeners
function setupListinoFormEventListeners() {
    const app = getApp();
    
    document.getElementById('save-listino-btn')?.addEventListener('click', () => saveListino.call(app));
    const close = () => app.hideFormModal();
    document.getElementById('cancel-listino-btn-bottom')?.addEventListener('click', close);

    // Listener per i tab Variazione
    document.querySelectorAll('[data-variazione]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const newVariazione = e.currentTarget.dataset.variazione;
            prezziState.listinoForm.variazione = newVariazione;
            
            // Aggiorna UI
            document.querySelectorAll('[data-variazione]').forEach(b => {
                b.classList.toggle('btn-primary', b.dataset.variazione === newVariazione);
                b.classList.toggle('active', b.dataset.variazione === newVariazione);  
                b.classList.toggle('btn-secondary', b.dataset.variazione !== newVariazione);
            });
        });
    });

    const listinoInputs = [
        { id: 'listino-date', path: 'date' },
        { id: 'listino-benzina', path: 'benzina' },
        { id: 'listino-gasolio', path: 'gasolio' },
        { id: 'listino-dieselPlus', path: 'dieselPlus' },
        { id: 'listino-hvolution', path: 'hvolution' },
        { id: 'listino-adblue', path: 'adblue' }
    ];
    
    listinoInputs.forEach(({ id, path }) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => updateListinoFormValue(path, input.value));
        }
    });
}
// Fine funzione setupListinoFormEventListeners

// Inizio funzione setupConcorrenzaFormEventListeners
function setupConcorrenzaFormEventListeners() {
    const app = getApp();
    
    document.getElementById('save-concorrenza-btn')?.addEventListener('click', () => saveConcorrenza.call(app));
    const close = () => app.hideFormModal();
    document.getElementById('cancel-concorrenza-btn-bottom')?.addEventListener('click', close);

    const concorrenzaInputs = [
        { id: 'concorrenza-date', path: 'date' },
        { id: 'myoil-benzina', path: 'myoil.benzina' },
        { id: 'myoil-gasolio', path: 'myoil.gasolio' },
        { id: 'esso-benzina', path: 'esso.benzina' },
        { id: 'esso-gasolio', path: 'esso.gasolio' },
        { id: 'q8-benzina', path: 'q8.benzina' },
        { id: 'q8-gasolio', path: 'q8.gasolio' }
    ];

    concorrenzaInputs.forEach(({ id, path }) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => updateConcorrenzaFormValue(path, input.value));
        }
    });
}
// Fine funzione setupConcorrenzaFormEventListeners
// FINE MODIFICA

// === FUNZIONI GESTIONE MODALI ===
// Inizio funzione showCreateListino
function showCreateListino() {
    const app = this;
    prezziState.editingListino = null;
    resetListinoForm.call(app);
    
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getListinoFormHTML();
    modalContentEl.classList.add('modal-wide');
    
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
        variazione: listino.variazione || 'Entrambi',
        benzina: listino.benzina || '',
        gasolio: listino.gasolio || '',
        dieselPlus: listino.dieselPlus || '',
        hvolution: listino.hvolution || '',
        adblue: listino.adblue || ''
    };
    
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getListinoFormHTML();
    modalContentEl.classList.add('modal-wide');
    
    setupListinoFormEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showEditListino

// Inizio funzione showUpdateConcorrenza
function showUpdateConcorrenza() {
    const app = this;
    resetConcorrenzaForm.call(app);
    
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getConcorrenzaFormHTML();
    modalContentEl.classList.add('modal-wide');
    
    setupConcorrenzaFormEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showUpdateConcorrenza

// === FUNZIONI ORDINAMENTO ===
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

// === FUNZIONI DATI ===
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
        dieselPlus: prices.dieselPlus ? prices.dieselPlus + surcharge : null,
        hvolution: prices.hvolution ? prices.hvolution + surcharge : null,
    };
}
// Fine funzione latestAppliedPrices

// Inizio funzione currentPrices
function currentPrices() {
    if (!Array.isArray(this.state.data.priceHistory) || this.state.data.priceHistory.length === 0) {
        return { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0, adblue: 0 };
    }
    
    return { ...this.state.data.priceHistory.sort((a, b) => new Date(b.date) - new Date(a.date))[0] };
}
// Fine funzione currentPrices

// Inizio funzione competitorPrices
function competitorPrices() {
    if (!Array.isArray(this.state.data.competitorPrices) || this.state.data.competitorPrices.length === 0) {
        return {
            myoil: { benzina: 0, gasolio: 0 },
            esso: { benzina: 0, gasolio: 0 },
            q8: { benzina: 0, gasolio: 0 }
        };
    }
    
    const latest = { ...this.state.data.competitorPrices.sort((a, b) => new Date(b.date) - new Date(a.date))[0] };
    
    return {
        myoil: latest.myoil || { benzina: 0, gasolio: 0 },
        esso: latest.esso || { benzina: 0, gasolio: 0 },
        q8: latest.q8 || { benzina: 0, gasolio: 0 }
    };
}
// Fine funzione competitorPrices

// === FUNZIONI FORM ===
// Inizio funzione resetListinoForm
function resetListinoForm() {
    const latest = currentPrices.call(this);
    prezziState.listinoForm = {
        date: this.getTodayFormatted(),
        variazione: 'Entrambi',
        benzina: latest.benzina || '',
        gasolio: latest.gasolio || '',
        dieselPlus: latest.dieselPlus || '',
        hvolution: latest.hvolution || '',
        adblue: latest.adblue || ''
    };
}
// Fine funzione resetListinoForm

// Inizio funzione resetConcorrenzaForm
function resetConcorrenzaForm() {
    const latest = competitorPrices.call(this);
    prezziState.concorrenzaForm = {
        date: this.getTodayFormatted(),
        myoil: {
            benzina: latest.myoil.benzina || '',
            gasolio: latest.myoil.gasolio || ''
        },
        esso: {
            benzina: latest.esso.benzina || '',
            gasolio: latest.esso.gasolio || ''
        },
        q8: {
            benzina: latest.q8.benzina || '',
            gasolio: latest.q8.gasolio || ''
        }
    };
}
// Fine funzione resetConcorrenzaForm

// Inizio funzione updateListinoFormValue
function updateListinoFormValue(path, value) {
    prezziState.listinoForm[path] = value;
}
// Fine funzione updateListinoFormValue

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

// === SALVATAGGIO DATI ===
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
        variazione: prezziState.listinoForm.variazione,
        benzina: parseFloat(prezziState.listinoForm.benzina) || 0,
        gasolio: parseFloat(prezziState.listinoForm.gasolio) || 0,
        dieselPlus: parseFloat(prezziState.listinoForm.dieselPlus) || null,
        hvolution: parseFloat(prezziState.listinoForm.hvolution) || null,
        adblue: parseFloat(prezziState.listinoForm.adblue) || null
    };
    
    if (prezziState.editingListino) {
        const index = app.state.data.priceHistory.findIndex(l => l.id === prezziState.editingListino.id);
        if (index !== -1) {
            app.state.data.priceHistory[index] = listino;
        }
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
        myoil: {
            benzina: parseFloat(prezziState.concorrenzaForm.myoil.benzina) || null,
            gasolio: parseFloat(prezziState.concorrenzaForm.myoil.gasolio) || null
        },
        esso: {
            benzina: parseFloat(prezziState.concorrenzaForm.esso.benzina) || null,
            gasolio: parseFloat(prezziState.concorrenzaForm.esso.gasolio) || null
        },
        q8: {
            benzina: parseFloat(prezziState.concorrenzaForm.q8.benzina) || null,
            gasolio: parseFloat(prezziState.concorrenzaForm.q8.gasolio) || null
        }
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

// === RENDER FUNZIONI SPECIFICHE ===
// Inizio funzione renderListiniTable
function renderListiniTable() {
    const tbody = document.getElementById('listini-tbody');
    if (!tbody) return;
    
    const app = this;
    const listini = sortedPriceHistory.call(app);
    
    if (listini.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-12"><div class="empty-state"><i data-lucide="euro"></i><div class="empty-state-title">Nessun listino trovato</div></div></td></tr>`;
    } else {
        tbody.innerHTML = listini.map(listino => `
            <tr class="hover:bg-secondary">
                <td class="font-medium text-primary">${app.formatDate(listino.date)}</td>
                <td class="text-primary">${listino.variazione || '-'}</td>
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

// Inizio funzione renderConcorrenzaCard
function renderConcorrenzaCard() {
    const app = this;
    const myPrices = latestAppliedPrices.call(app);
    const competitorPricesData = competitorPrices.call(app);
    const container = document.getElementById('concorrenza-card-content');
    if (!container) return;

    // Funzione locale per formattare la differenza di prezzo
    const formatDiff = (diff) => {
        const roundedDiff = Math.round(diff * 1000) / 1000;
        const colorClass = roundedDiff < 0 ? 'text-success' : roundedDiff > 0 ? 'text-danger' : 'text-secondary';
        const sign = roundedDiff >= 0 ? '+' : '';
        const text = `${sign}${app.formatCurrency(roundedDiff, true)}`.replace('€', '').trim();
        return `<div class="font-bold ${colorClass}">${text}</div>`;
    };

    const diffs = {
        myoil: {
            benzina: (competitorPricesData.myoil?.benzina || 0) - (myPrices.benzina || 0),
            gasolio: (competitorPricesData.myoil?.gasolio || 0) - (myPrices.gasolio || 0)
        },
        q8: {
            benzina: (competitorPricesData.q8?.benzina || 0) - (myPrices.benzina || 0),
            gasolio: (competitorPricesData.q8?.gasolio || 0) - (myPrices.gasolio || 0)
        },
        esso: {
            benzina: (competitorPricesData.esso?.benzina || 0) - (myPrices.benzina || 0),
            gasolio: (competitorPricesData.esso?.gasolio || 0) - (myPrices.gasolio || 0)
        }
    };

    // Inizio Modifica: Corretto ordine colonne
    container.innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-3 gap-4 text-sm">
                <div class="product-box" style="background-color: rgba(139, 92, 246, 0.05); border-color: rgba(139, 92, 246, 0.3);">
                    <h4 class="font-semibold mb-2 text-center" style="color: #8b5cf6">MyOil</h4>
                    <div class="space-y-1 mt-2">
                        <div class="flex justify-between p-1"><span>Benzina</span><span class="font-bold">${app.formatCurrency(competitorPricesData.myoil?.benzina || 0, true)}</span></div>
                        <div class="flex justify-between p-1"><span>Gasolio</span><span class="font-bold">${app.formatCurrency(competitorPricesData.myoil?.gasolio || 0, true)}</span></div>
                    </div>
                </div>

                <div class="product-box" style="background-color: rgba(220, 38, 38, 0.05); border-color: rgba(220, 38, 38, 0.3);">
                    <h4 class="font-semibold mb-2 text-center" style="color: var(--color-danger)">Esso</h4>
                    <div class="space-y-1 mt-2">
                        <div class="flex justify-between p-1"><span>Benzina</span><span class="font-bold">${app.formatCurrency(competitorPricesData.esso?.benzina || 0, true)}</span></div>
                        <div class="flex justify-between p-1"><span>Gasolio</span><span class="font-bold">${app.formatCurrency(competitorPricesData.esso?.gasolio || 0, true)}</span></div>
                    </div>
                </div>

                <div class="product-box" style="background-color: rgba(37, 99, 235, 0.05); border-color: rgba(37, 99, 235, 0.3);">
                    <h4 class="font-semibold mb-2 text-center" style="color: var(--color-primary)">Q8</h4>
                    <div class="space-y-1 mt-2">
                        <div class="flex justify-between p-1"><span>Benzina</span><span class="font-bold">${app.formatCurrency(competitorPricesData.q8?.benzina || 0, true)}</span></div>
                        <div class="flex justify-between p-1"><span>Gasolio</span><span class="font-bold">${app.formatCurrency(competitorPricesData.q8?.gasolio || 0, true)}</span></div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-4 text-sm">
                <div class="product-box text-center p-2" style="background-color: rgba(139, 92, 246, 0.05); border-color: rgba(139, 92, 246, 0.3);">
                    <div class="text-xs">Benzina</div>
                    ${formatDiff(diffs.myoil.benzina)}
                    <div class="text-xs mt-1">Gasolio</div>
                    ${formatDiff(diffs.myoil.gasolio)}
                </div>

                <div class="product-box text-center p-2" style="background-color: rgba(220, 38, 38, 0.05); border-color: rgba(220, 38, 38, 0.3);">
                    <div class="text-xs">Benzina</div>
                    ${formatDiff(diffs.esso.benzina)}
                    <div class="text-xs mt-1">Gasolio</div>
                    ${formatDiff(diffs.esso.gasolio)}
                </div>

                <div class="product-box text-center p-2" style="background-color: rgba(37, 99, 235, 0.05); border-color: rgba(37, 99, 235, 0.3);">
                    <div class="text-xs">Benzina</div>
                    ${formatDiff(diffs.q8.benzina)}
                    <div class="text-xs mt-1">Gasolio</div>
                    ${formatDiff(diffs.q8.gasolio)}
                </div>
            </div>
        </div>
    `;
    // Fine Modifica
}
// Fine funzione renderConcorrenzaCard

// Inizio funzione showSkeletonLoader
function showSkeletonLoader(container) {
    const skeletonHTML = `
        <div class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
                <div class="grid grid-cols-2 gap-6">
                    <div class="stat-card"><div class="skeleton-loader" style="height: 3.5rem; width: 100%"></div></div>
                    <div class="stat-card"><div class="skeleton-loader" style="height: 3.5rem; width: 100%"></div></div>
                </div>
                <div class="stat-card"><div class="skeleton-loader" style="height: 3.5rem; width: 100%"></div></div>
                <div class="stat-card"><div class="skeleton-loader" style="height: 3.5rem; width: 100%"></div></div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <div class="skeleton-loader" style="height: 1.5rem; width: 200px"></div>
                </div>
                <div class="p-6 space-y-2">
                    <div class="skeleton-loader" style="height: 5rem; width: 100%"></div>
                    <div class="skeleton-loader" style="height: 3rem; width: 100%"></div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header" style="justify-content: space-between; align-items: center;">
                    <div class="skeleton-loader" style="height: 1.5rem; width: 250px"></div>
                    <div class="skeleton-loader" style="height: 2.5rem; width: 150px; border-radius: var(--radius-md)"></div>
                </div>
                <div class="p-6 space-y-2">
                    <div class="skeleton-loader" style="height: 2.5rem; width: 100%"></div>
                    <div class="skeleton-loader" style="height: 2.5rem; width: 100%"></div>
                    <div class="skeleton-loader" style="height: 2.5rem; width: 100%"></div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = skeletonHTML;
}
// Fine funzione showSkeletonLoader

// === FUNZIONI GLOBALI PER EVENTI ONCLICK ===
// Inizio funzione editListinoById
function editListinoById(listinoId) {
    const app = getApp();
    const listino = app.state.data.priceHistory.find(l => l.id === listinoId);
    if (listino) {
        showEditListino.call(app, listino);
    }
}
// Fine funzione editListinoById

// Inizio funzione deleteListinoById
function deleteListinoById(listinoId) {
    const app = getApp();
    deleteListino.call(app, listinoId);
}
// Fine funzione deleteListinoById

// EXPORT FUNCTIONS FOR GLOBAL ACCESS
if (typeof window !== 'undefined') {
    window.initGestionePrezzi = initGestionePrezzi;
    window.renderPrezziSection = renderPrezziSection;
    window.editListinoById = editListinoById;
    window.deleteListinoById = deleteListinoById;
    window.prezziState = prezziState;
}
// =============================================
// FILE: utilities.js
// DESCRIZIONE: Modulo per la gestione dei componenti
//              IVA Calc, Banconote Counter, Ordine Carburante
//              nella sezione Home.
// =============================================

// === STATO LOCALE DEL MODULO UTILITIES ===
let utilitiesState = {
    activeTab: 'iva', // Tab attiva ('iva', 'banconote', 'carburante')
    ivaCalculator: {
        importoLordo: null,
        risultati: { imponibile: 0, iva: 0 }
    },
    banconoteCounter: {
        // Quantità per ogni taglio
        500: null, 200: null, 100: null, 50: null, 20: null, 10: null,
        total: 0, // Totale euro
        count: 0  // Totale numero banconote
    },
    ordineCarburante: {
        // Litri per prodotto
        benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0
    }
};

// === INIZIALIZZAZIONE MODULO UTILITIES ===
function initUtilitiesModule() {
    console.log('🛠️ Inizializzazione modulo Utilities...');
    const app = this; // 'this' si riferisce all'istanza App

    // Carica stato salvato per Ordine Carburante (gli altri si resettano)
    utilitiesState.ordineCarburante = app.loadFromStorage('ordineCarburante', { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 });

    // Determina tab attiva iniziale (potrebbe essere salvata in futuro)
    utilitiesState.activeTab = 'iva';

    console.log('✅ Modulo Utilities inizializzato');
}

// === RENDER COMPONENTE UTILITIES ===
function renderUtilitiesComponent(container) {
    console.log('🛠️ Rendering componente Utilities...');
    const app = this; // 'this' si riferisce all'istanza App

    // HTML di base della card con i tab
    container.innerHTML = `
        <div class="card-header">
            <div class="utilities-tab-group btn-group w-full">
                <button class="btn ${utilitiesState.activeTab === 'iva' ? 'btn-primary active' : 'btn-secondary'}" data-tab="iva">Calcola IVA</button>
                <button class="btn ${utilitiesState.activeTab === 'banconote' ? 'btn-primary active' : 'btn-secondary'}" data-tab="banconote">Conta Banconote</button>
                <button class="btn ${utilitiesState.activeTab === 'carburante' ? 'btn-primary active' : 'btn-secondary'}" data-tab="carburante">Ordine Carburante</button>
            </div>
        </div>
        <div class="card-body">
            <div id="iva-calculator-content" class="utilities-content-section ${utilitiesState.activeTab === 'iva' ? '' : 'hidden'}">
                ${getIvaCalculatorHTML(app)}
            </div>
            <div id="banconote-counter-content" class="utilities-content-section ${utilitiesState.activeTab === 'banconote' ? '' : 'hidden'}">
                ${getBanconoteCounterHTML(app)}
            </div>
            <div id="carburante-container" class="utilities-content-section ${utilitiesState.activeTab === 'carburante' ? '' : 'hidden'}">
                ${getOrdineCarburanteHTML(app)}
            </div>
        </div>
    `;

    // Aggiungi event listeners specifici
    setupUtilitiesEventListeners.call(app, container);

    // Aggiorna icone se presenti (es. +/- bottoni)
    app.refreshIcons();
}

// === FUNZIONI PER GENERARE HTML INTERNO ===

function getIvaCalculatorHTML(app) {
    const ivaState = utilitiesState.ivaCalculator;
    return `
        <div class="space-y-4">
            <div class="form-group">
                <label class="form-label" for="iva-importo">Importo Lordo (€)</label>
                <input type="number" id="iva-importo" step="0.01" placeholder="0,00" class="form-control text-lg"
                       value="${ivaState.importoLordo || ''}" style="max-width: 100%;" autocomplete="off">
            </div>
            <div id="iva-risultati" class="space-y-2">
                 <div class="product-box iva-box-lordo">
                    <div class="flex justify-between items-center">
                        <span class="font-medium">Totale Lordo</span>
                        <span id="iva-lordo-val" class="text-lg font-bold">${app.formatCurrency(ivaState.importoLordo || 0)}</span>
                    </div>
                </div>
                 <div class="product-box iva-box-imponibile">
                    <div class="flex justify-between items-center">
                        <span class="font-medium">Imponibile</span>
                        <span id="iva-imponibile-val" class="text-lg font-bold">${app.formatCurrency(ivaState.risultati.imponibile)}</span>
                    </div>
                </div>
                <div class="product-box iva-box-iva">
                    <div class="flex justify-between items-center">
                        <span class="font-medium">IVA (22%)</span>
                        <span id="iva-iva-val" class="text-lg font-bold">${app.formatCurrency(ivaState.risultati.iva)}</span>
                    </div>
                </div>
            </div>
        </div>`;
}

function getBanconoteCounterHTML(app) {
    const counterState = utilitiesState.banconoteCounter;
    const tagli = [500, 200, 100, 50, 20, 10];
    const inputsHTML = tagli.map(taglio => {
        const quantita = counterState[taglio] || 0;
        const subtotale = quantita * taglio;
        return `
            <div class="banconote-row">
                <div class="banconote-taglio">
                    <span class="text-lg font-medium text-primary">€ ${taglio}</span>
                </div>
                <div class="banconote-input-wrapper">
                    <div class="number-input-group">
                        <button type="button" class="number-input-btn" data-action="decrement-banconota" data-taglio="${taglio}" aria-label="Diminuisci quantità banconote da ${taglio}">
                            <i data-lucide="minus"></i>
                        </button>
                        <input type="text" id="banconota-quantita-${taglio}" value="${app.formatInteger(quantita)}" readonly
                               class="number-input-field" aria-label="Quantità banconote da ${taglio}">
                        <button type="button" class="number-input-btn" data-action="increment-banconota" data-taglio="${taglio}" aria-label="Aumenta quantità banconote da ${taglio}">
                            <i data-lucide="plus"></i>
                        </button>
                    </div>
                </div>
                <div class="banconote-subtotale">
                    <span id="banconote-subtotal-${taglio}" class="text-base font-bold text-success">${app.formatCurrency(subtotale)}</span>
                </div>
            </div>`;
    }).join('');

    return `
        <div class="space-y-3" id="banconote-inputs-container">
            ${inputsHTML}
        </div>
        <div class="banconote-total-box">
            <div class="flex">
                <div class="banconote-taglio"><span class="text-lg font-bold text-primary">TOTALE</span></div>
                <div class="banconote-input-wrapper text-center"><span id="banconote-count" class="text-lg font-bold text-primary">${app.formatInteger(counterState.count || 0)}</span>pz</div>
                <div class="banconote-subtotale"><span id="banconote-total" class="text-xl font-bold text-success">${app.formatCurrency(counterState.total)}</span></div>
            </div>
        </div>`;
}

function getOrdineCarburanteHTML(app) {
    const ordineState = utilitiesState.ordineCarburante;
    const prodotti = [
        { key: 'benzina', name: 'Benzina', colorClass: 'text-green' },
        { key: 'gasolio', name: 'Gasolio', colorClass: 'text-yellow' },
        { key: 'dieselPlus', name: 'Diesel+', colorClass: 'text-red' },
        { key: 'hvolution', name: 'Hvolution', colorClass: 'text-blue' }
    ];
    // Ottieni i prezzi più recenti DALLO STATO GLOBALE DELL'APP
    const prezzi = getLatestPrices.call(app); // Usa .call(app) per passare il contesto corretto

    const rowsHTML = prodotti.map(p => {
        const quantita = ordineState[p.key] || 0;
        const prezzoUnitario = prezzi[p.key] || 0; // Usa il nome chiave corretto (dieselPlus)
        const importo = quantita * prezzoUnitario;
        return `
            <div class="carburante-row">
                <div class="carburante-product-info">
                    <span class="font-medium ${p.colorClass}">${p.name}</span>
                    <div class="text-secondary">${app.formatCurrency(prezzoUnitario, true)}/L</div>
                </div>
                <div class="carburante-input-wrapper">
                    <div class="number-input-group">
                        <button type="button" class="number-input-btn" data-action="decrement-carburante" data-product="${p.key}" aria-label="Diminuisci litri ${p.name}">
                            <i data-lucide="minus"></i>
                        </button>
                        <input type="text" id="carburante-quantita-${p.key}" value="${app.formatInteger(quantita)}" readonly
                               class="number-input-field" aria-label="Litri ${p.name}">
                        <button type="button" class="number-input-btn" data-action="increment-carburante" data-product="${p.key}" aria-label="Aumenta litri ${p.name}">
                            <i data-lucide="plus"></i>
                        </button>
                    </div>
                </div>
                <div class="carburante-importo ${p.colorClass}">
                    <span id="carburante-importo-${p.key}" class="font-bold">${app.formatCurrency(importo)}</span>
                </div>
            </div>`;
    }).join('');

    const totaleLitri = getTotaleLitri.call(app); // Usa .call(app)
    const totaleImporto = getTotaleImporto.call(app); // Usa .call(app)

    return `
        <div class="space-y-0"> ${rowsHTML}
        </div>
        <div class="carburante-total-box">
            <div class="flex">
                <div>
                    <div class="text-secondary">Prodotti:</div>
                    <div class="text-xl font-bold text-primary">Totale</div>
                </div>
                 <div>
                     <div class="text-secondary text-right">Litri:</div>
                     <div id="carburante-totale-litri" class="text-xl font-bold text-primary text-right">${app.formatInteger(totaleLitri)}</div>
                 </div>
                 <div>
                     <div class="text-secondary text-right">Importo:</div>
                     <div id="carburante-totale-importo" class="text-xl font-bold text-success text-right">${app.formatCurrency(totaleImporto)}</div>
                 </div>
            </div>
        </div>`;
}

// === SETUP EVENT LISTENERS UTILITIES ===
function setupUtilitiesEventListeners(container) {
    const app = this; // 'this' si riferisce all'istanza App

    // Listener per i bottoni Tab
    container.querySelectorAll('.utilities-tab-group .btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveHomeCardTab.call(app, btn.dataset.tab); // Passa app context
        });
    });

    // Listener IVA Calculator
    const ivaInput = container.querySelector('#iva-importo');
    if (ivaInput) {
        ivaInput.addEventListener('input', (e) => {
            // Aggiorna lo stato INTERNO del modulo
            utilitiesState.ivaCalculator.importoLordo = parseFloat(e.target.value) || null;
            // Chiama la funzione di calcolo INTERNA al modulo
            calcolaIva.call(app); // Passa app context se serve formattazione
        });
    }

    // Listener Banconote Counter (Event Delegation)
    const banconoteContainer = container.querySelector('#banconote-counter-content');
    if (banconoteContainer) {
        banconoteContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.number-input-btn[data-action][data-taglio]');
            if (btn) {
                const action = btn.dataset.action;
                const taglio = btn.dataset.taglio;
                if (action === 'increment-banconota') {
                    incrementBanconota.call(app, taglio); // Passa app context
                } else if (action === 'decrement-banconota') {
                    decrementBanconota.call(app, taglio); // Passa app context
                }
            }
        });
    }

    // Listener Ordine Carburante (Event Delegation)
    const carburanteContainer = container.querySelector('#carburante-container');
    if (carburanteContainer) {
        carburanteContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.number-input-btn[data-action][data-product]');
            if (btn) {
                const action = btn.dataset.action;
                const product = btn.dataset.product;
                if (action === 'increment-carburante') {
                    incrementCarburante.call(app, product); // Passa app context
                } else if (action === 'decrement-carburante') {
                    decrementCarburante.call(app, product); // Passa app context
                }
            }
        });
    }
}

// === LOGICA SPECIFICA DEI COMPONENTI ===

// --- Tabs ---
function setActiveHomeCardTab(tab) {
    const app = this; // Assicurati di avere il contesto dell'app
    if (!['iva', 'banconote', 'carburante'].includes(tab)) return;

    utilitiesState.activeTab = tab;

    // Aggiorna stato bottoni tab
    const container = document.getElementById('utilities-card-placeholder'); // Trova il contenitore principale
    if (container) {
         container.querySelectorAll('.utilities-tab-group .btn[data-tab]').forEach(btn => {
            const isActive = btn.dataset.tab === tab;
            btn.classList.toggle('btn-primary', isActive);
            btn.classList.toggle('active', isActive);
            btn.classList.toggle('btn-secondary', !isActive);
        });

        // Mostra/Nascondi contenuto tab
        container.querySelector('#iva-calculator-content')?.classList.toggle('hidden', tab !== 'iva');
        container.querySelector('#banconote-counter-content')?.classList.toggle('hidden', tab !== 'banconote');
        container.querySelector('#carburante-container')?.classList.toggle('hidden', tab !== 'carburante');
    }

    // Potresti voler salvare la tab attiva nel localStorage qui
    // app.saveToStorage('activeUtilityTab', tab);
}

// --- IVA Calculator ---
function calcolaIva() {
    const app = this; // Contesto app per formattazione
    const lordo = utilitiesState.ivaCalculator.importoLordo;
    const risultati = utilitiesState.ivaCalculator.risultati;

    if (lordo === null || isNaN(lordo) || lordo <= 0) {
        risultati.imponibile = 0;
        risultati.iva = 0;
    } else {
        const aliquota = 0.22; // 22%
        // imponibile = lordo / 1.22
        risultati.imponibile = lordo / (1 + aliquota);
        // iva = lordo - imponibile
        risultati.iva = lordo - risultati.imponibile;
    }
    updateIvaDisplay.call(app); // Aggiorna UI
}

function updateIvaDisplay() {
    const app = this; // Contesto app per formattazione
    const lordoEl = document.getElementById('iva-lordo-val');
    const imponibileEl = document.getElementById('iva-imponibile-val');
    const ivaEl = document.getElementById('iva-iva-val');

    if (lordoEl) lordoEl.textContent = app.formatCurrency(utilitiesState.ivaCalculator.importoLordo || 0);
    if (imponibileEl) imponibileEl.textContent = app.formatCurrency(utilitiesState.ivaCalculator.risultati.imponibile);
    if (ivaEl) ivaEl.textContent = app.formatCurrency(utilitiesState.ivaCalculator.risultati.iva);
}

// --- Banconote Counter ---
function calcolaTotaleBanconote() {
    const app = this; // Contesto app per formattazione
    const counter = utilitiesState.banconoteCounter;
    const tagli = [500, 200, 100, 50, 20, 10];
    let totale = 0;
    let numeroBanconote = 0;

    tagli.forEach(taglio => {
        const quantita = counter[taglio] || 0; // Usa 0 se null/undefined
        const subtotale = quantita * taglio;
        totale += subtotale;
        numeroBanconote += quantita;

        // Aggiorna subtotale UI (se esiste)
        const subtotaleEl = document.getElementById(`banconote-subtotal-${taglio}`);
        if (subtotaleEl) {
            subtotaleEl.textContent = app.formatCurrency(subtotale);
        }
    });

    // Aggiorna stato interno
    counter.total = totale;
    counter.count = numeroBanconote;

    // Aggiorna totale UI (se esiste)
    const totaleEl = document.getElementById('banconote-total');
    if (totaleEl) {
        totaleEl.textContent = this.formatCurrency(totale);
    }
    const countEl = document.getElementById('banconote-count');
    if (countEl) {
        countEl.textContent = this.formatInteger(numeroBanconote);
    }
}

function incrementBanconota(taglio) {
    const taglioNum = parseInt(taglio, 10);
    let quantita = utilitiesState.banconoteCounter[taglioNum] || 0;
    quantita++;
    utilitiesState.banconoteCounter[taglioNum] = quantita;
    updateBanconotaInputUI.call(this, taglioNum, quantita); // 'this' è app
}

function decrementBanconota(taglio) {
    const taglioNum = parseInt(taglio, 10);
    let quantita = utilitiesState.banconoteCounter[taglioNum] || 0;
    if (quantita > 0) {
        quantita--;
        utilitiesState.banconoteCounter[taglioNum] = quantita > 0 ? quantita : null; // Usa null se zero
        updateBanconotaInputUI.call(this, taglioNum, quantita); // 'this' è app
    }
}

function updateBanconotaInputUI(taglio, quantita) {
    const app = this; // Contesto app per formattazione
    const quantitaInput = document.getElementById(`banconota-quantita-${taglio}`);
    if (quantitaInput) {
        quantitaInput.value = app.formatInteger(quantita); // Mostra 0 se quantità è 0
    }
    // Ricalcola e aggiorna totali
    calcolaTotaleBanconote.call(app);
}

// --- Ordine Carburante ---
function incrementCarburante(prodotto) {
    if (utilitiesState.ordineCarburante.hasOwnProperty(prodotto)) {
        utilitiesState.ordineCarburante[prodotto] += 1000;
        this.saveToStorage('ordineCarburante', utilitiesState.ordineCarburante); // Salva nello storage globale
        updateOrdineCarburanteUI.call(this, prodotto); // 'this' è app
    }
}

function decrementCarburante(prodotto) {
    if (utilitiesState.ordineCarburante.hasOwnProperty(prodotto) && utilitiesState.ordineCarburante[prodotto] >= 1000) {
        utilitiesState.ordineCarburante[prodotto] -= 1000;
        this.saveToStorage('ordineCarburante', utilitiesState.ordineCarburante); // Salva nello storage globale
        updateOrdineCarburanteUI.call(this, prodotto); // 'this' è app
    }
}

function updateOrdineCarburanteUI(prodotto) {
    const app = this; // Contesto app
    const quantita = utilitiesState.ordineCarburante[prodotto];
    const importo = calcolaImportoCarburante.call(app, prodotto); // Calcola importo aggiornato

    const quantitaEl = document.getElementById(`carburante-quantita-${prodotto}`);
    const importoEl = document.getElementById(`carburante-importo-${prodotto}`);

    if (quantitaEl) quantitaEl.value = app.formatInteger(quantita);
    if (importoEl) importoEl.textContent = app.formatCurrency(importo);

    // Aggiorna totali generali
    const totaleLitri = getTotaleLitri.call(app);
    const totaleImporto = getTotaleImporto.call(app);
    const totaleLitriEl = document.getElementById('carburante-totale-litri');
    const totaleImportoEl = document.getElementById('carburante-totale-importo');

    if (totaleLitriEl) totaleLitriEl.textContent = app.formatInteger(totaleLitri);
    if (totaleImportoEl) totaleImportoEl.textContent = app.formatCurrency(totaleImporto);
}

// Funzione helper per ottenere i prezzi (necessita accesso allo stato globale)
function getLatestPrices() {
    const app = this; // Assicurati che 'this' sia l'istanza app
    if (!app || !app.state || !app.state.data || !Array.isArray(app.state.data.priceHistory) || app.state.data.priceHistory.length === 0) {
        // Ritorna prezzi zero se non disponibili
        return { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0, adblue: 0 };
    }
    // Ordina per data decrescente e prendi il primo
    return [...app.state.data.priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}

function calcolaImportoCarburante(prodotto) {
    const app = this; // Contesto app
    const litri = utilitiesState.ordineCarburante[prodotto] || 0;
    const prezzi = getLatestPrices.call(app); // Ottieni prezzi aggiornati
    const prezzoUnitario = prezzi[prodotto] || 0;
    return litri * prezzoUnitario;
}

function getTotaleLitri() {
    // Somma i valori dello stato locale
    return Object.values(utilitiesState.ordineCarburante).reduce((total, litri) => total + (litri || 0), 0);
}

function getTotaleImporto() {
    const app = this; // Contesto app
    const prodotti = ['benzina', 'gasolio', 'dieselPlus', 'hvolution'];
    // Ricalcola importi basati sui prezzi correnti
    return prodotti.reduce((total, prodotto) => total + calcolaImportoCarburante.call(app, prodotto), 0);
}


// === ESPORTAZIONE FUNZIONI PRINCIPALI ===
if (typeof window !== 'undefined') {
    window.initUtilitiesModule = initUtilitiesModule;
    window.renderUtilitiesComponent = renderUtilitiesComponent;
    // Le altre funzioni sono interne o chiamate tramite event listener
}
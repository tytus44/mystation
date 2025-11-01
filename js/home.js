// =============================================
// FILE: home.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Home / Dashboard (Calendario, Eventi, Calcolatrici).
// =============================================

// === STATO LOCALE DEL MODULO HOME ===
let homeState = {
    ivaCalculator: {
        importoLordo: null,
        importoImponibile: null,
        risultati: {
            lordo: 0,
            imponibile: 0,
            iva: 0
        }
    },
    banconoteCounter: {
        200: null,
        100: null,
        50: null,
        20: null,
        10: null,
        total: 0,
        count: 0
    },
    calendar: {
        currentDate: new Date(),
        monthYear: '',
        days: [],
        selectedDate: null
    },
    ordineCarburante: null,
    calculator: {
        display: '0',
        equation: '',
        firstOperand: null,
        waitingForSecondOperand: false,
        operator: null
    },
    todos: [],
    appuntamenti: [], // NUOVO: Array per gli appuntamenti
    editingEvent: null, // NUOVO: Per modifiche (sia todo che appuntamenti)
    eventModal: { // NUOVO: Stato per il modale unificato
        type: 'appuntamento', // 'appuntamento' o 'todo'
        date: '',
        oraInizio: '09:00',
        durata: '30',
        descrizione: '',
        priorita: 'standard'
    }
};

// === INIZIALIZZAZIONE MODULO HOME ===
// Inizio funzione initHome
function initHome() {
    console.log('🏠 Inizializzazione modulo Home...');
    const app = this;
    homeState.ordineCarburante = app.loadFromStorage('ordineCarburante', {
        benzina: 0,
        gasolio: 0,
        dieselPlus: 0,
        hvolution: 0
    });
    // Carica entrambi dallo stato 'data'
    homeState.todos = app.state.data.todos || [];
    homeState.appuntamenti = app.state.data.appuntamenti || [];

    const today = new Date();
    homeState.calendar.selectedDate = app.formatDateToISO(today);
    initCalendar.call(app);
    console.log('✅ Modulo Home inizializzato');
}
// Fine funzione initHome

// === RENDER SEZIONE HOME ===
// Inizio funzione renderHomeSection
function renderHomeSection(container) {
    console.log('🎨 Rendering sezione Home...');
    const app = this;
    const stats = getHomeDashboardStats.call(app);
    const colors = {
        benzina: '#10b981',
        gasolio: '#f59e0b',
        dieselplus: '#dc2626',
        hvolution: '#06b6d4',
        adblue: '#6b7280'
    };

    // --- INIZIO CORREZIONE ---
    // Definizioni mancanti reinserite
    const initialLordo = homeState.ivaCalculator.importoLordo !== null ? homeState.ivaCalculator.importoLordo.toFixed(2) : '';
    const initialImponibile = homeState.ivaCalculator.importoImponibile !== null ? homeState.ivaCalculator.importoImponibile.toFixed(2) : '';
    // --- FINE CORREZIONE ---

    container.innerHTML = `
        <div class="space-y-6">

            <div class="grid grid-cols-3 gap-6">
                <div class="stat-card" style="background-color: #3b82f6; border-color: #2563eb;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: #ffffff;">Litri venduti oggi</div>
                        <div class="stat-value" style="color: #ffffff;">${app.formatInteger(stats.totalLitersToday)}</div>
                        <div class="text-sm mt-1 flex space-x-2 items-center flex-wrap" style="color: rgba(255, 255, 255, 0.9);">
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.benzina};"></div><span>${app.formatInteger(stats.productLiters.benzina)}</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.gasolio};"></div><span>${app.formatInteger(stats.productLiters.gasolio)}</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.dieselplus};"></div><span>${app.formatInteger(stats.productLiters.dieselplus)}</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.hvolution};"></div><span>${app.formatInteger(stats.productLiters.hvolution)}</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.adblue};"></div><span>${app.formatInteger(stats.productLiters.adblue)}</span>
                        </div>
                    </div>
                    <div class="stat-icon blue"><i data-lucide="fuel"></i></div>
                </div>
                <div class="stat-card" style="background-color: #8b5cf6; border-color: #7c3aed;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: #ffffff;">% Servito Oggi</div>
                        <div class="stat-value" style="color: #ffffff;">${stats.overallServitoPercentage}%</div>
                        <div class="text-sm mt-1 flex space-x-2 items-center flex-wrap" style="color: rgba(255, 255, 255, 0.9);">
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.benzina};"></div><span>${stats.productServitoPercentages.benzina}%</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.gasolio};"></div><span>${stats.productServitoPercentages.gasolio}%</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.dieselplus};"></div><span>${stats.productServitoPercentages.dieselplus}%</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.hvolution};"></div><span>${stats.productServitoPercentages.hvolution}%</span>
                        </div>
                    </div>
                    <div class="stat-icon purple"><i data-lucide="user-check"></i></div>
                </div>
                <div class="stat-card" style="background-color: #10b981; border-color: #059669;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: #ffffff;">Fatturato giornaliero</div>
                        <div class="stat-value" style="color: #ffffff;">${app.formatCurrency(stats.totalRevenueToday)}</div>
                        <div class="text-sm mt-1" style="color: rgba(255, 255, 255, 0.9);">Margine stimato: <strong style="color: #ffffff;">${app.formatCurrency(stats.totalMarginToday)}</strong></div>
                    </div>
                    <div class="stat-icon green"><i data-lucide="euro"></i></div>
                </div>
            </div>

            <div class="card">
                <div class="grid grid-cols-12 gap-6">
                    <div class="col-span-6">
                        <div class="card-header" style="border-bottom: none; padding-bottom: 0;">
                            <div class="flex items-center justify-between w-full">
                                <span id="calendar-month-year" class="calendar-title" style="font-size: 1.1rem; font-weight: 600;"></span>
                                <div class="flex items-center space-x-2">
                                    <button id="calendar-prev" class="calendar-nav-btn"><i data-lucide="chevron-left"></i></button>
                                    <button id="calendar-next" class="calendar-nav-btn"><i data-lucide="chevron-right"></i></button>
                                    <button id="calendar-today-btn" class="btn btn-secondary btn-sm"><i data-lucide="calendar-check"></i> Oggi</button>
                                </div>
                            </div>
                        </div>
                        <div class="card-body" style="padding-top: 0.5rem;">
                            <div id="calendar-container" class="calendar-grid">
                                <div class="calendar-day-header">Lun</div><div class="calendar-day-header">Mar</div><div class="calendar-day-header">Mer</div>
                                <div class="calendar-day-header">Gio</div><div class="calendar-day-header">Ven</div><div class="calendar-day-header">Sab</div>
                                <div class="calendar-day-header sunday">Dom</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-span-6" style="border-left: 1px solid var(--border-primary);">
                        <div class="card-header" style="border-bottom: none;">
                            <div class="flex items-center justify-between w-full">
                                <h3 id="event-list-title" class="card-title" style="font-size: 1.1rem;">Eventi</h3>
                                <button id="add-event-btn" class="btn btn-primary btn-sm"><i data-lucide="plus"></i> Aggiungi</button>
                            </div>
                        </div>
                        <div class="card-body" style="padding-top: 0.5rem; max-height: 400px; overflow-y: auto;">
                            <div id="event-list-container" class="space-y-3">
                                </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-6">

                <div class="card">
                    <div class="card-body calculator">
                        <div id="calculator-display-container" class="calculator-display" style="min-height: 50px; height: 50px; justify-content: space-around; padding: 5px 15px;">
                            <div class="equation" style="height: 15px; font-size: 0.75rem;">${homeState.calculator.equation}</div>
                            <div class="result" style="font-size: 1.5rem; font-weight: 700;">${homeState.calculator.display}</div>
                        </div>
                        <div id="calc-buttons" class="calculator-buttons">
                            <button class="calc-btn function" data-value="C">C</button><button class="calc-btn function" data-value="±">±</button>
                            <button class="calc-btn function" data-value="%">%</button><button class="calc-btn operator" data-value="/">÷</button>
                            <button class="calc-btn number" data-value="7">7</button><button class="calc-btn number" data-value="8">8</button>
                            <button class="calc-btn number" data-value="9">9</button><button class="calc-btn operator" data-value="*">×</button>
                            <button class="calc-btn number" data-value="4">4</button><button class="calc-btn number" data-value="5">5</button>
                            <button class="calc-btn number" data-value="6">6</button><button class="calc-btn operator" data-value="-">−</button>
                            <button class="calc-btn number" data-value="1">1</button><button class="calc-btn number" data-value="2">2</button>
                            <button class="calc-btn number" data-value="3">3</button><button class="calc-btn operator" data-value="+">+</button>
                            <button class="calc-btn number zero" data-value="0">0</button><button class="calc-btn number" data-value=".">.</button>
                            <button class="calc-btn operator equal" data-value="=">=</button>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header"><h3 class="card-title">Conta Banconote</h3></div>
                    <div class="card-body">
                        <div id="banconote-counter-content" class="space-y-4">
                            <div class="space-y-4" id="banconote-inputs-container"></div>
                            <div class="product-box mt-4 p-3 rounded-lg">
                                <div class="grid grid-cols-3 items-center">
                                    <div class="text-left"><span class="font-medium text-primary">TOTALE</span></div>
                                    <div class="text-center"><span id="banconote-count" class="text-lg font-bold text-primary">${app.formatInteger(homeState.banconoteCounter.count || 0)}</span></div>
                                    <div class="text-right"><span id="banconote-total" class="text-lg font-bold text-success">${app.formatCurrency(homeState.banconoteCounter.total)}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="card">
                    <div class="card-header"><h3 class="card-title">Ordine Carburante</h3></div>
                    <div class="card-body">
                         <div id="carburante-container" class="space-y-4"></div>
                    </div>
                </div>


                <div class="card">
                    <div class="card-header"><h3 class="card-title">Calcola IVA</h3></div>
                    <div class="card-body">
                        <div id="iva-calculator-content">
                             <div class="space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="form-group mb-0">
                                        <label class="form-label">Importo Lordo (€)</label>
                                        <input type="number" id="iva-importo-lordo" step="0.01" placeholder="0.00" class="form-control text-md" value="${initialLordo}" style="max-width: 100%;" autocomplete="off">
                                    </div>
                                    <div class="form-group mb-0">
                                        <label class="form-label">Imponibile / Netto (€)</label>
                                        <input type="number" id="iva-importo-imponibile" step="0.01" placeholder="0.00" class="form-control text-md" value="${initialImponibile}" style="max-width: 100%;" autocomplete="off">
                                    </div>
                                </div>
                                <div id="iva-risultati" class="space-y-4 pt-4">
                                    <div class="product-box p-3">
                                        <div class="flex justify-between items-center">
                                            <span class="font-medium" style="color: var(--color-secondary);">Totale Lordo</span>
                                            <span id="iva-lordo-display" class="text-md font-bold" style="color: var(--color-secondary);">${app.formatCurrency(homeState.ivaCalculator.risultati.lordo)}</span>
                                        </div>
                                    </div>
                                    <div class="product-box p-3">
                                        <div class="flex justify-between items-center">
                                            <span class="font-medium" style="color: var(--color-primary);">Imponibile</span>
                                            <span id="iva-imponibile-display" class="text-md font-bold" style="color: var(--color-primary);">${app.formatCurrency(homeState.ivaCalculator.risultati.imponibile)}</span>
                                        </div>
                                    </div>
                                    <div class="product-box p-3">
                                        <div class="flex justify-between items-center">
                                            <span class="font-medium" style="color: var(--color-warning);">IVA (22%)</span>
                                            <span id="iva-iva-display" class="text-md font-bold text-warning">${app.formatCurrency(homeState.ivaCalculator.risultati.iva)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    `;

    setupHomeEventListeners.call(app);
    renderCalendar.call(app);
    renderEventiDelGiorno.call(app, homeState.calendar.selectedDate);
    renderOrdineCarburante.call(app);
    renderBanconoteInputs.call(app);
    app.refreshIcons();
    updateIvaDisplay.call(app);
}
// Fine funzione renderHomeSection

// === SETUP EVENT LISTENERS HOME ===
// Inizio funzione setupHomeEventListeners
function setupHomeEventListeners() {
    const app = this;

    document.getElementById('iva-importo-lordo')?.addEventListener('input', handleLordoInput.bind(app));
    document.getElementById('iva-importo-imponibile')?.addEventListener('input', handleImponibileInput.bind(app));

    document.getElementById('calendar-prev')?.addEventListener('click', () => changeMonth.call(app, -1));
    document.getElementById('calendar-next')?.addEventListener('click', () => changeMonth.call(app, 1));
    document.getElementById('calendar-today-btn')?.addEventListener('click', () => {
        homeState.calendar.currentDate = new Date();
        homeState.calendar.selectedDate = app.formatDateToISO(new Date());
        renderCalendar.call(app);
        renderEventiDelGiorno.call(app, homeState.calendar.selectedDate);
    });
    document.getElementById('calendar-container')?.addEventListener('click', (e) => {
        const dayEl = e.target.closest('.calendar-day:not(.empty)');
        if (dayEl) {
            homeState.calendar.selectedDate = dayEl.dataset.date;
            renderCalendarDays();
            renderEventiDelGiorno.call(app, dayEl.dataset.date);
        }
    });

    document.getElementById('add-event-btn')?.addEventListener('click', () => {
        showEventFormModal.call(app, homeState.calendar.selectedDate);
    });

    document.getElementById('calc-buttons')?.addEventListener('click', (e) => {
        if (e.target.matches('button')) handleCalculatorInput.call(app, e.target.dataset.value);
    });

document.getElementById('event-list-container')?.addEventListener('click', (e) => {
        const eventEl = e.target.closest('[data-event-id]');
        if (!eventEl) return;
        
        const eventId = eventEl.dataset.eventId;
        const eventType = eventEl.dataset.eventType;
        
        const deleteBtn = e.target.closest('.delete-event-btn');
        
        if (deleteBtn) {
            // CORREZIONE: Impedisce al click di aprire la card genitore
            e.stopPropagation(); 
            
            // Si assicura che il contesto (this, che è app) sia passato alla funzione
            if (eventType === 'todo') {
                deleteTodo.call(app, eventId);
            } else {
                deleteAppuntamento.call(app, eventId);
            }
        } else {
            showEditEventModal.call(app, eventId, eventType);
        }
    });
}
// Fine funzione setupHomeEventListeners

// === FUNZIONI CALCOLATORE IVA E CONTA BANCONOTE ===

// Inizio funzione handleLordoInput
function handleLordoInput(e) {
    const lordoValue = parseFloat(e.target.value) || null;
    homeState.ivaCalculator.importoLordo = lordoValue;
    homeState.ivaCalculator.importoImponibile = null;
    calcolaDaLordo.call(this, lordoValue);
}
// Fine funzione handleLordoInput

// Inizio funzione handleImponibileInput
function handleImponibileInput(e) {
    const imponibileValue = parseFloat(e.target.value) || null;
    homeState.ivaCalculator.importoImponibile = imponibileValue;
    homeState.ivaCalculator.importoLordo = null;
    calcolaDaNetto.call(this, imponibileValue);
}
// Fine funzione handleImponibileInput

// Inizio funzione calcolaDaLordo
function calcolaDaLordo(lordo) {
    if (lordo === null || isNaN(lordo) || lordo <= 0) {
        homeState.ivaCalculator.risultati = {
            lordo: 0,
            imponibile: 0,
            iva: 0
        };
    } else {
        const aliquota = 22 / 100;
        const imponibile = lordo / (1 + aliquota);
        const iva = lordo - imponibile;
        homeState.ivaCalculator.risultati = {
            lordo: lordo,
            imponibile: imponibile,
            iva: iva
        };
    }
    updateIvaDisplay.call(this);
}
// Fine funzione calcolaDaLordo

// Inizio funzione calcolaDaNetto
function calcolaDaNetto(imponibile) {
    if (imponibile === null || isNaN(imponibile) || imponibile <= 0) {
        homeState.ivaCalculator.risultati = {
            lordo: 0,
            imponibile: 0,
            iva: 0
        };
    } else {
        const aliquota = 22 / 100;
        const iva = imponibile * aliquota;
        const lordo = imponibile + iva;
        homeState.ivaCalculator.risultati = {
            lordo: lordo,
            imponibile: imponibile,
            iva: iva
        };
    }
    updateIvaDisplay.call(this);
}
// Fine funzione calcolaDaNetto

// Inizio funzione updateIvaDisplay
function updateIvaDisplay() {
    const lordoDisplayEl = document.getElementById('iva-lordo-display');
    const imponibileDisplayEl = document.getElementById('iva-imponibile-display');
    const ivaDisplayEl = document.getElementById('iva-iva-display');
    const lordoInputEl = document.getElementById('iva-importo-lordo');
    const imponibileInputEl = document.getElementById('iva-importo-imponibile');

    const {
        lordo,
        imponibile,
        iva
    } = homeState.ivaCalculator.risultati;

    if (lordoDisplayEl) lordoDisplayEl.textContent = this.formatCurrency(lordo);
    if (imponibileDisplayEl) imponibileDisplayEl.textContent = this.formatCurrency(imponibile);
    if (ivaDisplayEl) ivaDisplayEl.textContent = this.formatCurrency(iva);

    if (lordo === 0 && imponibile === 0) {
        if (lordoInputEl && document.activeElement !== lordoInputEl) lordoInputEl.value = '';
        if (imponibileInputEl && document.activeElement !== imponibileInputEl) imponibileInputEl.value = '';
    } else {
        if (homeState.ivaCalculator.importoLordo !== null && imponibileInputEl && document.activeElement !== imponibileInputEl) {
            imponibileInputEl.value = imponibile > 0 ? imponibile.toFixed(2) : '';
        } else if (homeState.ivaCalculator.importoImponibile !== null && lordoInputEl && document.activeElement !== lordoInputEl) {
            lordoInputEl.value = lordo > 0 ? lordo.toFixed(2) : '';
        }
    }
}
// Fine funzione updateIvaDisplay

// Inizio funzione calcolaTotaleBanconote
function calcolaTotaleBanconote() {
    const app = this;
    const counter = homeState.banconoteCounter;
    const tagli = [200, 100, 50, 20, 10];
    let totale = 0;
    let numeroBanconote = 0;
    tagli.forEach(taglio => {
        const quantita = parseInt(counter[taglio], 10) || 0;
        const subtotale = quantita * taglio;
        totale += subtotale;
        numeroBanconote += quantita;
        const subtotaleEl = document.getElementById(`banconote-subtotal-${taglio}`);
        if (subtotaleEl) subtotaleEl.textContent = app.formatCurrency(subtotale);
    });
    homeState.banconoteCounter.total = totale;
    homeState.banconoteCounter.count = numeroBanconote;
    const totaleEl = document.getElementById('banconote-total');
    if (totaleEl) totaleEl.textContent = this.formatCurrency(totale);
    const countEl = document.getElementById('banconote-count');
    if (countEl) countEl.textContent = this.formatInteger(numeroBanconote);
}
// Fine funzione calcolaTotaleBanconote

// Inizio funzione renderBanconoteInputs
function renderBanconoteInputs() {
    const app = this;
    const container = document.getElementById('banconote-inputs-container');
    if (!container) return;
    const tagli = [200, 100, 50, 20, 10];
    container.innerHTML = tagli.map(taglio => {
        const quantita = homeState.banconoteCounter[taglio] || 0;
        const subtotale = quantita * taglio;
        return `
            <div class="grid grid-cols-3 items-center p-3 rounded-lg">
                <div class="text-left"><span class="font-medium text-primary">€ ${taglio}</span></div>
                <div class="form-group mb-0">
                    <div class="number-input-group" style="height: 2.5rem;">
                        <button type="button" class="number-input-btn" data-action="decrement-banconota" data-taglio="${taglio}"><i data-lucide="minus"></i></button>
                        <input type="text" id="banconota-quantita-${taglio}" value="${app.formatInteger(quantita)}" readonly class="number-input-field" />
                        <button type="button" class="number-input-btn" data-action="increment-banconota" data-taglio="${taglio}"><i data-lucide="plus"></i></button>
                    </div>
                </div>
                <div class="text-right"><span id="banconote-subtotal-${taglio}" class="font-medium text-primary">${app.formatCurrency(subtotale)}</span></div>
            </div>
        `;
    }).join('');
    container.querySelectorAll('[data-action="increment-banconota"]').forEach(btn => btn.addEventListener('click', () => incrementBanconota.call(app, btn.dataset.taglio)));
    container.querySelectorAll('[data-action="decrement-banconota"]').forEach(btn => btn.addEventListener('click', () => decrementBanconota.call(app, btn.dataset.taglio)));
    app.refreshIcons();
}
// Fine funzione renderBanconoteInputs

// Inizio funzione incrementBanconota
function incrementBanconota(taglio) {
    const taglioNum = parseInt(taglio, 10);
    let quantita = homeState.banconoteCounter[taglioNum] || 0;
    quantita++;
    homeState.banconoteCounter[taglioNum] = quantita;
    updateBanconotaInput.call(this, taglioNum, quantita);
}
// Fine funzione incrementBanconota

// Inizio funzione decrementBanconota
function decrementBanconota(taglio) {
    const taglioNum = parseInt(taglio, 10);
    let quantita = homeState.banconoteCounter[taglioNum] || 0;
    if (quantita > 0) quantita--;
    homeState.banconoteCounter[taglioNum] = quantita > 0 ? quantita : null;
    updateBanconotaInput.call(this, taglioNum, quantita);
}
// Fine funzione decrementBanconota

// Inizio funzione updateBanconotaInput
function updateBanconotaInput(taglio, quantita) {
    const app = this;
    const quantitaInput = document.getElementById(`banconota-quantita-${taglio}`);
    if (quantitaInput) quantitaInput.value = app.formatInteger(quantita);
    calcolaTotaleBanconote.call(app);
}
// Fine funzione updateBanconotaInput

// === FUNZIONI CALENDARIO ===
// Inizio funzione initCalendar
function initCalendar() {
    renderCalendar.call(this);
}
// Fine funzione initCalendar

// Inizio funzione renderCalendar
function renderCalendar() {
    const app = this;
    const date = homeState.calendar.currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    homeState.calendar.monthYear = `${monthNames[month]} ${year}`;
    const monthYearEl = document.getElementById('calendar-month-year');
    if (monthYearEl) monthYearEl.textContent = homeState.calendar.monthYear;
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const firstDayIndex = (firstDayOfMonth + 6) % 7;
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    let daysArray = [];
    for (let i = 0; i < firstDayIndex; i++) daysArray.push({
        value: '',
        isToday: false,
        isHoliday: false,
        isSunday: false,
        events: [],
        date: null
    });

    const oggiString = app.formatDateToISO(new Date());

    for (let i = 1; i <= lastDateOfMonth; i++) {
        const dataCorrente = new Date(year, month, i);
        const dateString = app.formatDateToISO(dataCorrente);
        const isToday = dateString === oggiString;
        const isSunday = isDomenica(dataCorrente);
        const isHoliday = isFestivaItaliana.call(this, dataCorrente);
        
        const todosForDay = homeState.todos.filter(todo => todo.dueDate === dateString);
        const appuntamentiForDay = homeState.appuntamenti.filter(app => app.date === dateString);
        
        daysArray.push({
            value: i,
            isToday,
            isHoliday,
            isSunday,
            events: [...todosForDay, ...appuntamentiForDay],
            date: dateString
        });
    }
    homeState.calendar.days = daysArray;
    renderCalendarDays();
}
// Fine funzione renderCalendar

// Inizio funzione renderCalendarDays
function renderCalendarDays() {
    const container = document.getElementById('calendar-container');
    if (!container) return;
    container.querySelectorAll('.calendar-day').forEach(el => el.remove());
    homeState.calendar.days.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        const dayNumber = document.createElement('span');
        dayNumber.textContent = day.value;
        dayEl.appendChild(dayNumber);
        if (day.date) dayEl.dataset.date = day.date;
        if (day.isToday) dayEl.classList.add('today');
        if (day.isHoliday) dayEl.classList.add('holiday');
        if (day.isSunday) dayEl.classList.add('sunday');
        if (day.date === homeState.calendar.selectedDate) dayEl.classList.add('selected');
        if (!day.value) dayEl.classList.add('empty');
        if (day.events && day.events.length > 0) {
            dayEl.classList.add('has-todo');
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'todo-dots-container';
            
            const importanceOrder = { 'appuntamento': 1, 'urgent': 2, 'priority': 3, 'standard': 4 };
            const sortedEvents = [...day.events].sort((a, b) => 
                (importanceOrder[a.type || a.priorita] || 4) - (importanceOrder[b.type || b.priorita] || 4)
            );
            
            const colorToDotClass = { 'appuntamento': 'dot-4', 'urgent': 'dot-1', 'priority': 'dot-2', 'standard': 'dot-3' };
            
            sortedEvents.slice(0, 3).forEach(event => {
                const dot = document.createElement('span');
                const eventKey = event.type === 'appuntamento' ? 'appuntamento' : event.priorita;
                const dotClass = colorToDotClass[eventKey] || 'dot-3';
                dot.className = `todo-dot ${dotClass}`;
                if (event.completed) dot.classList.add('completed');
                dotsContainer.appendChild(dot);
            });
            dayEl.appendChild(dotsContainer);
        }
        container.appendChild(dayEl);
    });
}
// Fine funzione renderCalendarDays

// Inizio funzione changeMonth
function changeMonth(offset) {
    const newDate = new Date(homeState.calendar.currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    homeState.calendar.currentDate = newDate;
    renderCalendar.call(this);
}
// Fine funzione changeMonth

// === FUNZIONI FESTIVITÀ ITALIANE ===
// Inizio funzione calcolaPasqua
function calcolaPasqua(anno) {
    const a = anno % 19,
        b = Math.floor(anno / 100),
        c = anno % 100,
        d = Math.floor(b / 4),
        e = b % 4,
        f = Math.floor((b + 8) / 25),
        g = Math.floor((b - f + 1) / 3),
        h = (19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4),
        k = c % 4,
        l = (32 + 2 * e + 2 * i - h - k) % 7,
        m = Math.floor((a + 11 * h + 22 * l) / 451),
        mese = Math.floor((h + l - 7 * m + 114) / 31),
        giorno = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(anno, mese - 1, giorno);
}
// Fine funzione calcolaPasqua

// Inizio funzione isFestivaItaliana
function isFestivaItaliana(data) {
    const giorno = data.getDate(),
        mese = data.getMonth() + 1,
        anno = data.getFullYear();
    const festivitaFisse = [{
        giorno: 1,
        mese: 1
    }, {
        giorno: 6,
        mese: 1
    }, {
        giorno: 25,
        mese: 4
    }, {
        giorno: 1,
        mese: 5
    }, {
        giorno: 2,
        mese: 6
    }, {
        giorno: 15,
        mese: 8
    }, {
        giorno: 1,
        mese: 11
    }, {
        giorno: 8,
        mese: 12
    }, {
        giorno: 25,
        mese: 12
    }, {
        giorno: 26,
        mese: 12
    }];
    if (festivitaFisse.some(f => f.giorno === giorno && f.mese === mese)) return true;
    const pasqua = calcolaPasqua(anno);
    const lunediDellAngelo = new Date(pasqua);
    lunediDellAngelo.setDate(pasqua.getDate() + 1);
    const dataCorrente = new Date(anno, mese - 1, giorno);
    return dataCorrente.getTime() === pasqua.getTime() || dataCorrente.getTime() === lunediDellAngelo.getTime();
}
// Fine funzione isFestivaItaliana

// Inizio funzione isDomenica
function isDomenica(data) {
    return data.getDay() === 0;
}
// Fine funzione isDomenica

// === FUNZIONI ORDINE CARBURANTE ===
// Inizio funzione renderOrdineCarburante
function renderOrdineCarburante() {
    const container = document.getElementById('carburante-container');
    if (!container) return;
    const app = this;
    const prodotti = [{
        key: 'benzina',
        name: 'Benzina',
        color: 'green',
        textColorClass: 'text-success'
    }, {
        key: 'gasolio',
        name: 'Gasolio',
        color: 'yellow',
        textColorClass: 'text-warning'
    }, {
        key: 'dieselPlus',
        name: 'Diesel+',
        color: 'red',
        textColorClass: 'text-danger'
    }, {
        key: 'hvolution',
        name: 'Hvolution',
        color: 'blue',
        textColorClass: 'text-info'
    }];
    const prezzi = getLatestPrices.call(app);
    let html = prodotti.map(p => {
        const quantita = homeState.ordineCarburante[p.key] || 0;
        const importo = quantita * (prezzi[p.key] || 0);
        return `
            <div class="grid grid-cols-3 items-center p-3 rounded-lg">
                <div class="text-left">
                    <span class="font-medium ${p.textColorClass}">${p.name}</span>
                    <div class="text-sm text-secondary">${app.formatCurrency(prezzi[p.key] || 0, true)}/L</div>
                </div>
                <div class="form-group mb-0">
                    <div class="number-input-group" style="height: 2.5rem;">
                        <button type="button" class="number-input-btn" data-action="decrement" data-product="${p.key}"><i data-lucide="minus"></i></button>
                        <input type="text" id="carburante-quantita-${p.key}" value="${app.formatInteger(quantita)}" readonly class="number-input-field" />
                        <button type="button" class="number-input-btn" data-action="increment" data-product="${p.key}"><i data-lucide="plus"></i></button>
                    </div>
                </div>
                <div class="text-right">
                    <span id="carburante-importo-${p.key}" class="font-bold text-${p.color}">${app.formatCurrency(importo)}</span>
                </div>
            </div>`;
    }).join('');
    const totaleLitri = getTotaleLitri.call(app),
        totaleImporto = getTotaleImporto.call(app);
    html += `
        <div class="product-box mt-4 p-4">
            <div class="grid grid-cols-3 items-center">
                <div class="text-left"><span class="text-lg font-bold text-primary">Totale</span></div>
                <div class="text-center"><span id="carburante-totale-litri" class="text-lg font-bold text-primary">${app.formatInteger(totaleLitri)}</span></div>
                <div class="text-right"><span id="carburante-totale-importo" class="text-lg font-bold text-success">${app.formatCurrency(totaleImporto)}</span></div>
            </div>
        </div>`;
    container.innerHTML = html;
    setupCarburanteEventListeners.call(app);
    app.refreshIcons();
}
// Fine funzione renderOrdineCarburante

// Inizio funzione setupCarburanteEventListeners
function setupCarburanteEventListeners() {
    const app = this;
    document.querySelectorAll('#carburante-container [data-action][data-product]').forEach(btn => btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action'),
            product = btn.getAttribute('data-product');
        if (action === 'increment') incrementCarburante.call(app, product);
        else if (action === 'decrement') decrementCarburante.call(app, product);
    }));
}
// Fine funzione setupCarburanteEventListeners

// Inizio funzione incrementCarburante
function incrementCarburante(prodotto) {
    homeState.ordineCarburante[prodotto] = (homeState.ordineCarburante[prodotto] || 0) + 1000;
    this.saveToStorage('ordineCarburante', homeState.ordineCarburante);
    updateOrdineCarburanteUI.call(this, prodotto);
}
// Fine funzione incrementCarburante

// Inizio funzione decrementCarburante
function decrementCarburante(prodotto) {
    let currentQuantity = homeState.ordineCarburante[prodotto] || 0;
    if (currentQuantity >= 1000) {
        homeState.ordineCarburante[prodotto] = currentQuantity - 1000;
        this.saveToStorage('ordineCarburante', homeState.ordineCarburante);
        updateOrdineCarburanteUI.call(this, prodotto);
    }
}
// Fine funzione decrementCarburante

// Inizio funzione updateOrdineCarburanteUI
function updateOrdineCarburanteUI(prodotto) {
    const app = this;
    const quantita = homeState.ordineCarburante[prodotto] || 0;
    const importo = calcolaImportoCarburante.call(app, prodotto);
    const quantitaEl = document.getElementById(`carburante-quantita-${prodotto}`);
    const importoEl = document.getElementById(`carburante-importo-${prodotto}`);
    if (quantitaEl) quantitaEl.value = app.formatInteger(quantita);
    if (importoEl) importoEl.textContent = app.formatCurrency(importo);
    const totaleLitri = getTotaleLitri.call(app),
        totaleImporto = getTotaleImporto.call(app);
    const totaleLitriEl = document.getElementById('carburante-totale-litri');
    const totaleImportoEl = document.getElementById('carburante-totale-importo');
    if (totaleLitriEl) totaleLitriEl.textContent = app.formatInteger(totaleLitri);
    if (totaleImportoEl) totaleImportoEl.textContent = app.formatCurrency(totaleImporto);
}
// Fine funzione updateOrdineCarburanteUI

// Inizio funzione getLatestPrices
function getLatestPrices() {
    if (!Array.isArray(this.state.data.priceHistory) || this.state.data.priceHistory.length === 0) return {
        benzina: 0,
        gasolio: 0,
        dieselPlus: 0,
        hvolution: 0,
        adblue: 0
    };
    return [...this.state.data.priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}
// Fine funzione getLatestPrices

// Inizio funzione calcolaImportoCarburante
function calcolaImportoCarburante(prodotto) {
    const litri = homeState.ordineCarburante[prodotto] || 0;
    const prezzi = getLatestPrices.call(this);
    const prezzo = prezzi[prodotto] || 0;
    return litri * prezzo;
}
// Fine funzione calcolaImportoCarburante

// Inizio funzione getTotaleLitri
function getTotaleLitri() {
    return Object.values(homeState.ordineCarburante).reduce((total, litri) => total + (litri || 0), 0);
}
// Fine funzione getTotaleLitri

// Inizio funzione getTotaleImporto
function getTotaleImporto() {
    const prodotti = ['benzina', 'gasolio', 'dieselPlus', 'hvolution'];
    return prodotti.reduce((total, prodotto) => total + calcolaImportoCarburante.call(this, prodotto), 0);
}
// Fine funzione getTotaleImporto

// === FUNZIONI STATISTICHE HOME ===
// Inizio funzione getHomeDashboardStats
function getHomeDashboardStats() {
    const app = this;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayTurni = (app.state.data.turni || []).filter(t => new Date(t.date) >= today && new Date(t.date) < tomorrow);
    const shiftCount = todayTurni.length;
    const shiftNames = todayTurni.map(t => t.turno).join(', ');
    const prices = getLatestPrices.call(this);
    let totalIperself = 0,
        totalServito = 0,
        totalRevenue = 0,
        totalMarginToday = 0;
    const margineFdtPay = 0.035 + 0.005,
        margineServito = 0.065 + 0.015,
        margineAdblue = 0.40;
    const productTotals = {
        benzina: {
            servito: 0,
            iperself: 0
        },
        gasolio: {
            servito: 0,
            iperself: 0
        },
        dieselplus: {
            servito: 0,
            iperself: 0
        },
        hvolution: {
            servito: 0,
            iperself: 0
        },
        adblue: {
            servito: 0,
            iperself: 0
        }
    };
    todayTurni.forEach(turno => {
        const isRiepilogo = turno.turno === 'Riepilogo Mensile';
        for (const product in productTotals) {
            let fdtL = 0,
                prepayL = 0,
                servitoL = 0;
            if (isRiepilogo) {
                fdtL = parseFloat(turno.fdt?.[product]) || 0;
                prepayL = parseFloat(turno.prepay?.[product]) || 0;
                servitoL = parseFloat(turno.servito?.[product]) || 0;
            } else {
                prepayL = parseFloat(turno.prepay?.[product]) || 0;
                servitoL = parseFloat(turno.servito?.[product]) || 0;
            }
            const iperselfL = fdtL + prepayL;
            productTotals[product].iperself += iperselfL;
            productTotals[product].servito += servitoL;
            totalIperself += iperselfL;
            totalServito += servitoL;
            const priceKey = product === 'dieselplus' ? 'dieselPlus' : product;
            const basePrice = prices[priceKey] || 0;
            if (basePrice > 0) {
                if (product === 'adblue') totalRevenue += servitoL * basePrice;
                else {
                    const prezzo_iperself = basePrice + 0.005,
                        prezzo_servito = basePrice + 0.015 + 0.210;
                    totalRevenue += (iperselfL * prezzo_iperself) + (servitoL * prezzo_servito);
                }
            }
            if (product === 'adblue') totalMarginToday += servitoL * margineAdblue;
            else {
                totalMarginToday += iperselfL * margineFdtPay;
                totalMarginToday += servitoL * margineServito;
            }
        }
    });
    const totalLitersToday = totalIperself + totalServito;
    const overallServitoPercentage = totalLitersToday > 0 ? Math.round((totalServito / totalLitersToday) * 100) : 0;
    const productLiters = {},
        productServitoPercentages = {};
    for (const product in productTotals) {
        const pTotal = productTotals[product].servito + productTotals[product].iperself;
        productLiters[product] = pTotal;
        productServitoPercentages[product] = pTotal > 0 ? Math.round((productTotals[product].servito / pTotal) * 100) : 0;
    }
    return {
        totalLitersToday,
        overallServitoPercentage,
        productServitoPercentages,
        totalRevenueToday: totalRevenue,
        shiftCount,
        shiftNames,
        productLiters,
        totalMarginToday
    };
}
// Fine funzione getHomeDashboardStats

// === FUNZIONI CALCOLATRICE ===
// Inizio funzione handleCalculatorInput
function handleCalculatorInput(value) {
    const app = this;
    const isNumber = !isNaN(parseFloat(value));
    const isOperator = ['+', '-', '*', '/'].includes(value);
    const calc = homeState.calculator;
    if (value === 'C') {
        resetCalculator.call(app);
        return;
    }
    if (value === '±') {
        if (calc.display !== '0') calc.display = String(parseFloat(calc.display) * -1);
    } else if (value === '%') calc.display = String(parseFloat(calc.display) / 100);
    else if (isNumber) {
        if (calc.waitingForSecondOperand) {
            calc.display = value;
            calc.waitingForSecondOperand = false;
        } else calc.display = calc.display === '0' ? value : calc.display + value;
    } else if (value === '.') {
        if (!calc.display.includes('.')) calc.display += '.';
    } else if (isOperator) handleOperator.call(app, value);
    else if (value === '=') performCalculation.call(app);
    updateCalculatorDisplay.call(app);
}
// Fine funzione handleCalculatorInput

// Inizio funzione handleOperator
function handleOperator(nextOperator) {
    const calc = homeState.calculator;
    const inputValue = parseFloat(calc.display);
    if (calc.operator && calc.waitingForSecondOperand) {
        calc.operator = nextOperator;
        calc.equation = `${calc.firstOperand} ${nextOperator}`;
        return;
    }
    if (calc.firstOperand === null && !isNaN(inputValue)) calc.firstOperand = inputValue;
    else if (calc.operator) {
        const result = performCalculation.call(this, true);
        calc.firstOperand = result;
    }
    calc.waitingForSecondOperand = true;
    calc.operator = nextOperator;
    calc.equation = `${calc.firstOperand} ${nextOperator}`;
}
// Fine funzione handleOperator

// Inizio funzione performCalculation
function performCalculation(isChained = false) {
    const calc = homeState.calculator;
    if (calc.firstOperand == null || calc.operator == null) return;
    const secondOperand = parseFloat(calc.display);
    const calculations = {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => a / b
    };
    const result = calculations[calc.operator](calc.firstOperand, secondOperand);
    if (!isChained) calc.equation = `${calc.firstOperand} ${calc.operator} ${secondOperand} =`;
    calc.display = String(parseFloat(result.toPrecision(12)));
    calc.firstOperand = result;
    if (!isChained) {
        calc.operator = null;
        calc.waitingForSecondOperand = true;
    }
    return result;
}
// Fine funzione performCalculation

// Inizio funzione resetCalculator
function resetCalculator() {
    homeState.calculator = {
        display: '0',
        equation: '',
        firstOperand: null,
        waitingForSecondOperand: false,
        operator: null
    };
    updateCalculatorDisplay.call(this);
}
// Fine funzione resetCalculator

// Inizio funzione updateCalculatorDisplay
function updateCalculatorDisplay() {
    const container = document.getElementById('calculator-display-container');
    if (container) {
        container.querySelector('.result').textContent = homeState.calculator.display;
        container.querySelector('.equation').textContent = homeState.calculator.equation;
    }
}
// Fine funzione updateCalculatorDisplay

// === FUNZIONI EVENTI (TO-DO E APPUNTAMENTI) ===

// Inizio funzione renderEventiDelGiorno
function renderEventiDelGiorno(dateString) {
    const app = this;
    const container = document.getElementById('event-list-container');
    const titleEl = document.getElementById('event-list-title');
    if (!container || !titleEl) return;

    const formattedDate = app.formatToItalianDate(dateString);
    titleEl.textContent = `Eventi del ${formattedDate}`;

    const todos = homeState.todos.filter(t => t.dueDate === dateString);
    const appuntamenti = homeState.appuntamenti.filter(a => a.date === dateString);
    
    const eventi = [
        ...appuntamenti.map(a => ({...a, type: 'appuntamento'})),
        ...todos.map(t => ({...t, type: 'todo'}))
    ];

    eventi.sort((a, b) => {
        if (a.type === 'appuntamento' && b.type === 'todo') return -1;
        if (a.type === 'todo' && b.type === 'appuntamento') return 1;
        if (a.type === 'appuntamento') return a.oraInizio.localeCompare(b.oraInizio);
        
        const priorityOrder = { 'urgent': 1, 'priority': 2, 'standard': 3 };
        return (priorityOrder[a.priorita] || 3) - (priorityOrder[b.priorita] || 3);
    });

    if (eventi.length === 0) {
        container.innerHTML = `<div class="empty-state" style="padding: 2rem 0;">
            <i data-lucide="calendar-check"></i>
            <div class="empty-state-title" style="font-size: 1rem;">Nessun evento</div>
            <div class="empty-state-description" style="font-size: 0.875rem;">Aggiungi un appuntamento o un to-do per questo giorno.</div>
        </div>`;
    } else {
        container.innerHTML = eventi.map(evento => {
            if (evento.type === 'appuntamento') {
                return `
                    <div class="evento-card appuntamento" data-event-id="${evento.id}" data-event-type="appuntamento">
                        <div class="evento-orario">
                            <i data-lucide="clock"></i>
                            <span>${evento.oraInizio}</span>
                            <span class="evento-durata">(${evento.durata} min)</span>
                        </div>
                        <div class="evento-descrizione">${evento.descrizione}</div>
                        <button class="delete-event-btn"><i data-lucide="x"></i></button>
                    </div>
                `;
            } else { // type === 'todo'
                const prioritaTesto = {urgent: 'Urgente', priority: 'Priorità', standard: 'Normale'};
                return `
                    <div class="evento-card todo ${evento.priorita || 'standard'}" data-event-id="${evento.id}" data-event-type="todo">
                        <div class="evento-orario">
                            <i data-lucide="check-circle"></i>
                            <span>To-do</span>
                            <span class="evento-durata">(${prioritaTesto[evento.priorita] || 'Standard'})</span>
                        </div>
                        <div class="evento-descrizione">${evento.text}</div>
                        <button class="delete-event-btn"><i data-lucide="x"></i></button>
                    </div>
                `;
            }
        }).join('');
    }
    app.refreshIcons();
}
// Fine funzione renderEventiDelGiorno

// Inizio funzione showEventFormModal
function showEventFormModal(dateString, eventId = null, eventType = null) {
    const app = getApp();
    homeState.editingEvent = null;

    if (eventId && eventType) {
        // Modal in modalità Modifica
        homeState.editingEvent = { id: eventId, type: eventType };
        const store = eventType === 'todo' ? homeState.todos : homeState.appuntamenti;
        const evento = store.find(e => e.id === eventId);
        
        homeState.eventModal = {
            type: eventType,
            date: eventType === 'todo' ? evento.dueDate : evento.date,
            oraInizio: evento.oraInizio || '09:00',
            durata: evento.durata || '30',
            descrizione: evento.descrizione || evento.text,
            priorita: evento.priorita || 'standard'
        };
    } else {
        // Modal in modalità Nuovo
        homeState.eventModal = {
            type: 'appuntamento',
            date: dateString,
            oraInizio: '09:00',
            durata: '30',
            descrizione: '',
            priorita: 'standard'
        };
    }

    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = getEventFormModalHTML(app);
    modalContentEl.classList.add('modal-todo'); // Usa lo stile stretto
    
    updateEventFormVisibility(); // Mostra/nascondi campi specifici
    setupEventFormEventListeners.call(app);
    
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showEventFormModal

// Inizio funzione getEventFormModalHTML
function getEventFormModalHTML(app) {
    const { type, date, oraInizio, durata, descrizione, priorita } = homeState.eventModal;
    const isEdit = !!homeState.editingEvent;
    const title = isEdit ? 'Modifica Evento' : 'Nuovo Evento';
    
    // Logica per gestire la compatibilità dei valori vecchi e nuovi della durata
    const is30min = durata == '30' || durata == '30 min';
    const is1ora = durata == '60' || durata == '1 ora';
    const is2ore = durata == '120' || durata == '2 ore';
    const is3ore = durata == '180' || durata == '3 ore';
    const isGiorno = durata == 'Giorno';

    return `
        <div class="modal-header">
            <h2 class="card-title">${title}</h2>
            <button type="button" id="close-event-icon-btn" class="modal-close-btn">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="space-y-4">
                <div class="btn-group w-full">
                    <button id="event-type-appuntamento" class="btn ${type === 'appuntamento' ? 'btn-primary' : 'btn-secondary'}">
                        <i data-lucide="clock"></i> Appuntamento
                    </button>
                    <button id="event-type-todo" class="btn ${type === 'todo' ? 'btn-primary' : 'btn-secondary'}">
                        <i data-lucide="check-circle"></i> To-do
                    </button>
                </div>

                <div class="form-group">
                    <label class="form-label">Data</label>
                    <input type="text" id="event-date" class="form-control" style="max-width: 150px;" value="${app.formatToItalianDate(date)}" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label">Descrizione</label>
                    <input type="text" id="event-descrizione" class="form-control" style="max-width: none;" value="${descrizione}" autocomplete="off">
                </div>

                <div id="appuntamento-fields" class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Orario</label>
                        <input type="text" id="event-ora-inizio" class="form-control" style="max-width: 150px;" value="${oraInizio}" placeholder="Es. 09:00">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Durata</label>
                        <select id="event-durata" class="form-control" style="max-width: 150px;">
                            <option value="30 min" ${is30min ? 'selected' : ''}>30 minuti</option>
                            <option value="1 ora" ${is1ora ? 'selected' : ''}>1 ora</option>
                            <option value="2 ore" ${is2ore ? 'selected' : ''}>2 ore</option>
                            <option value="3 ore" ${is3ore ? 'selected' : ''}>3 ore</option>
                            <option value="Giorno" ${isGiorno ? 'selected' : ''}>Tutto il giorno</option>
                        </select>
                    </div>
                </div>

                <div id="todo-fields" class="form-group">
                    <label class="form-label">Priorità</label>
                    <div class="color-picker-group" style="flex-direction: row; gap: 1rem;">
                        <div class="flex items-center">
                            <label class="color-radio standard" title="Standard"><input type="radio" name="event-priorita" value="standard" ${priorita === 'standard' ? 'checked' : ''}><span></span></label>
                            <span class="text-secondary" style="margin-left: 0.5rem;">Standard</span>
                        </div>
                        <div class="flex items-center">
                            <label class="color-radio priority" title="Priorità"><input type="radio" name="event-priorita" value="priority" ${priorita === 'priority' ? 'checked' : ''}><span></span></label>
                            <span class="text-secondary" style="margin-left: 0.5rem;">Priorità</span>
                        </div>
                        <div class="flex items-center">
                            <label class="color-radio urgent" title="Urgente"><input type="radio" name="event-priorita" value="urgent" ${priorita === 'urgent' ? 'checked' : ''}><span></span></label>
                            <span class="text-secondary" style="margin-left: 0.5rem;">Urgente</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        <div class="modal-footer">
            <button id="cancel-event-btn" class="btn btn-secondary">Annulla</button>
            <button id="save-event-btn" class="btn btn-success">Salva</button>
        </div>
    `;
}
// Fine funzione getEventFormModalHTML

// Inizio funzione setupEventFormEventListeners
function setupEventFormEventListeners() {
    const app = this;
    const close = () => app.hideFormModal();
    document.getElementById('cancel-event-btn')?.addEventListener('click', close);
    document.getElementById('close-event-icon-btn')?.addEventListener('click', close);
    document.getElementById('save-event-btn')?.addEventListener('click', () => saveEvent.call(app));

    document.getElementById('event-type-appuntamento')?.addEventListener('click', () => switchEventModalType('appuntamento'));
    document.getElementById('event-type-todo')?.addEventListener('click', () => switchEventModalType('todo'));
}
// Fine funzione setupEventFormEventListeners

// Inizio funzione switchEventModalType
function switchEventModalType(type) {
    homeState.eventModal.type = type;
    document.getElementById('event-type-appuntamento').classList.toggle('btn-primary', type === 'appuntamento');
    document.getElementById('event-type-appuntamento').classList.toggle('btn-secondary', type !== 'appuntamento');
    document.getElementById('event-type-todo').classList.toggle('btn-primary', type === 'todo');
    document.getElementById('event-type-todo').classList.toggle('btn-secondary', type !== 'todo');
    updateEventFormVisibility();
}
// Fine funzione switchEventModalType

// Inizio funzione updateEventFormVisibility
function updateEventFormVisibility() {
    const type = homeState.eventModal.type;
    document.getElementById('appuntamento-fields').style.display = type === 'appuntamento' ? 'grid' : 'none';
    document.getElementById('todo-fields').style.display = type === 'todo' ? 'block' : 'none';
}
// Fine funzione updateEventFormVisibility

// Inizio funzione showEditEventModal
function showEditEventModal(eventId, eventType) {
    const app = this;
    homeState.editingEvent = { id: eventId, type: eventType };
    
    const store = eventType === 'todo' ? homeState.todos : homeState.appuntamenti;
    const evento = store.find(e => e.id === eventId);
    if (!evento) return;

    homeState.eventModal = {
        type: eventType,
        date: eventType === 'todo' ? evento.dueDate : evento.date,
        oraInizio: evento.oraInizio || '09:00',
        durata: evento.durata || '30',
        descrizione: evento.descrizione || evento.text,
        priorita: evento.priorita || 'standard'
    };
    
    showEventFormModal.call(app, null, eventId, eventType);
}
// Fine funzione showEditEventModal

// Inizio funzione saveEvent
function saveEvent() {
    const app = this;
    const type = homeState.eventModal.type;
    const date = homeState.eventModal.date; // ISO date
    const descrizione = document.getElementById('event-descrizione').value.trim();

    if (!descrizione) {
        return app.showNotification('La descrizione è obbligatoria', 'error');
    }
    
    if (type === 'appuntamento') {
        const appuntamento = {
            id: homeState.editingEvent?.id || app.generateUniqueId('app'),
            date: date,
            descrizione: descrizione,
            oraInizio: document.getElementById('event-ora-inizio').value,
            durata: document.getElementById('event-durata').value,
            type: 'appuntamento'
        };
        
        if (homeState.editingEvent) {
            homeState.appuntamenti = homeState.appuntamenti.map(a => a.id === appuntamento.id ? appuntamento : a);
        } else {
            homeState.appuntamenti.push(appuntamento);
        }
        app.state.data.appuntamenti = homeState.appuntamenti;
        app.showNotification('Appuntamento salvato');

    } else { // type === 'todo'
        const todo = {
            id: homeState.editingEvent?.id || app.generateUniqueId('todo'),
            text: descrizione,
            dueDate: date,
            completed: homeState.editingEvent ? homeState.todos.find(t=>t.id === homeState.editingEvent.id).completed : false,
            priorita: document.querySelector('input[name="event-priorita"]:checked').value,
            type: 'todo'
        };
        
        if (homeState.editingEvent) {
            homeState.todos = homeState.todos.map(t => t.id === todo.id ? todo : t);
        } else {
            homeState.todos.push(todo);
        }
        app.state.data.todos = homeState.todos;
        app.showNotification('To-do salvato');
    }

    app.saveToStorage('data', app.state.data);
    app.hideFormModal();
    renderCalendar.call(app);
    renderEventiDelGiorno.call(app, date);
    homeState.editingEvent = null;
}
// Fine funzione saveEvent

// Inizio funzione deleteTodo
function deleteTodo(todoId) {
    const app = this;
    const todo = homeState.todos.find(t => t.id === todoId);
    if (!todo) return;
    
    // Si assicura che app.showConfirm venga chiamato correttamente nel contesto corretto
    app.showConfirm(`Sei sicuro di voler eliminare l'attività?<br>"${todo.text}"?`, () => {
        homeState.todos = homeState.todos.filter(t => t.id !== todoId);
        app.state.data.todos = homeState.todos;
        app.saveToStorage('data', app.state.data);
        renderCalendar.call(app);
        renderEventiDelGiorno.call(app, homeState.calendar.selectedDate);
        app.showNotification("Attività eliminata.");
    });
}
// Fine funzione deleteTodo

// Inizio funzione deleteAppuntamento
function deleteAppuntamento(appuntamentoId) {
    const app = this;
    const appuntamento = homeState.appuntamenti.find(a => a.id === appuntamentoId);
    if (!appuntamento) return;
    
    // Si assicura che app.showConfirm venga chiamato correttamente nel contesto corretto
    app.showConfirm(`Sei sicuro di voler eliminare l'appuntamento?<br>"${appuntamento.descrizione}"?`, () => {
        homeState.appuntamenti = homeState.appuntamenti.filter(a => a.id !== appuntamentoId);
        app.state.data.appuntamenti = homeState.appuntamenti;
        app.saveToStorage('data', app.state.data);
        renderCalendar.call(app);
        renderEventiDelGiorno.call(app, homeState.calendar.selectedDate);
        app.showNotification("Appuntamento eliminato.");
    });
}
// Fine funzione deleteAppuntamento

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initHome = initHome;
    window.renderHomeSection = renderHomeSection;
    window.homeState = homeState;
}
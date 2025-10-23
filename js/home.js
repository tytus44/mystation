// =============================================
// FILE: home.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Home / Dashboard con layout ottimizzato.
// --- MODIFICATO per unire card IVA/Banconote/Ordine ---
// --- MODIFICATO per spinner e subtotali in Conta Banconote ---
// =============================================

// === STATO LOCALE DEL MODULO HOME ===
let homeState = {

    // Calcolatore IVA
    ivaCalculator: {
        importoLordo: null,
        risultati: {
            imponibile: 0,
            iva: 0,
        }
    },

    // Conta Banconote
    banconoteCounter: {
        500: null,
        200: null,
        100: null,
        50: null,
        20: null,
        10: null,
        total: 0,
        count: 0
    },

    // Scheda attiva per la card Calcolatore/Contatore/Ordine
    activeHomeCardTab: 'iva',

    // Calendario
    calendar: {
        currentDate: new Date(),
        monthYear: '',
        days: [],
        selectedDate: null // Data selezionata in formato YYYY-MM-DD
    },

    // Ordine carburante (persistente)
    ordineCarburante: null,

    // Calcolatrice
    calculator: {
        display: '0',
        equation: '',
        firstOperand: null,
        waitingForSecondOperand: false,
        operator: null
    },
    todos: [],  // Sarà caricato dal localStorage
    editingTodo: null // Stato per il To-Do in modifica
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

    homeState.todos = app.loadFromStorage('homeTodos', []);

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    homeState.calendar.selectedDate = `${year}-${month}-${day}`;

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

    container.innerHTML = `
        <div class="space-y-6">
            <div class="grid grid-cols-3 gap-6">
                <div class="stat-card" style="background-color: #3b82f6; border-color: #2563eb;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: #ffffff;">Litri venduti oggi</div>
                        <div class="stat-value" style="color: #ffffff;">${app.formatInteger(stats.totalLitersToday)}</div>
                        <div class="text-xs mt-1 flex space-x-2 items-center flex-wrap" style="color: rgba(255, 255, 255, 0.9);">
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.benzina};"></div>
                            <span>${app.formatInteger(stats.productLiters.benzina)}</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.gasolio};"></div>
                            <span>${app.formatInteger(stats.productLiters.gasolio)}</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.dieselplus};"></div>
                            <span>${app.formatInteger(stats.productLiters.dieselplus)}</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.hvolution};"></div>
                            <span>${app.formatInteger(stats.productLiters.hvolution)}</span>
                             <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.adblue};"></div>
                            <span>${app.formatInteger(stats.productLiters.adblue)}</span>
                        </div>
                    </div>
                    <div class="stat-icon blue"><i data-lucide="fuel"></i></div>
                </div>
                <div class="stat-card" style="background-color: #8b5cf6; border-color: #7c3aed;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: #ffffff;">% Servito Oggi</div>
                        <div class="stat-value" style="color: #ffffff;">${stats.overallServitoPercentage}%</div>
                        <div class="text-xs mt-1 flex space-x-2 items-center flex-wrap" style="color: rgba(255, 255, 255, 0.9);">
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.benzina};"></div>
                            <span>${stats.productServitoPercentages.benzina}%</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.gasolio};"></div>
                            <span>${stats.productServitoPercentages.gasolio}%</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.dieselplus};"></div>
                            <span>${stats.productServitoPercentages.dieselplus}%</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.hvolution};"></div>
                            <span>${stats.productServitoPercentages.hvolution}%</span>
                        </div>
                    </div>
                    <div class="stat-icon purple"><i data-lucide="user-check"></i></div>
                </div>
                <div class="stat-card" style="background-color: #10b981; border-color: #059669;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: #ffffff;">Fatturato giornaliero</div>
                        <div class="stat-value" style="color: #ffffff;">${app.formatCurrency(stats.totalRevenueToday)}</div>
                        <div class="text-xs mt-1" style="color: rgba(255, 255, 255, 0.9);">Margine stimato: <strong style="color: #ffffff;">${app.formatCurrency(stats.totalMarginToday)}</strong></div>
                    </div>
                    <div class="stat-icon green"><i data-lucide="euro"></i></div>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-6">
                <div class="card">
                    <div class="card-header">
                        <div class="flex items-center justify-between w-full">
                            <h3 class="card-title">Calendario</h3>
                            <div class="flex items-center space-x-2">
                                <button id="calendar-prev" class="calendar-nav-btn"><i data-lucide="chevron-left"></i></button>
                                <span id="calendar-month-year" class="calendar-title"></span>
                                <button id="calendar-next" class="calendar-nav-btn"><i data-lucide="chevron-right"></i></button>
                                <button id="calendar-today-btn" class="btn btn-primary ml-4"><i data-lucide="calendar"></i>Oggi</button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="calendar-container" class="calendar-grid">
                            <div class="calendar-day-header">Lun</div>
                            <div class="calendar-day-header">Mar</div>
                            <div class="calendar-day-header">Mer</div>
                            <div class="calendar-day-header">Gio</div>
                            <div class="calendar-day-header">Ven</div>
                            <div class="calendar-day-header">Sab</div>
                            <div class="calendar-day-header sunday">Dom</div>
                        </div>
                    </div>
                </div>
                <div class="card" id="todos-card">
                    <div class="card-header"><h3 class="card-title">To-Do List</h3></div>
                    <div class="card-body"><div id="todo-list" class="todo-list"></div></div>
                </div>
            </div>

<div class="grid grid-cols-2 gap-6">

                <div class="card">
                    <div class="card-header">
                        <div class="btn-group w-full">
                            <button class="btn ${homeState.activeHomeCardTab === 'iva' ? 'btn-primary active' : 'btn-secondary'}" data-tab="iva">Calcola IVA</button>
                            <button class="btn ${homeState.activeHomeCardTab === 'banconote' ? 'btn-primary active' : 'btn-secondary'}" data-tab="banconote">Conta Banconote</button>
                            <button class="btn ${homeState.activeHomeCardTab === 'carburante' ? 'btn-primary active' : 'btn-secondary'}" data-tab="carburante">Ordine Carburante</button>
                        </div>
                    </div>
                    <div class="card-body">

                        <div id="iva-calculator-content" class="${homeState.activeHomeCardTab === 'iva' ? '' : 'hidden'}">
                            <div class="space-y-4">
                                <div class="form-group">
                                    <label class="form-label">Importo Lordo (€)</label>
                                    <input type="number" id="iva-importo" step="0.01" placeholder="0.00" class="form-control text-lg" value="${homeState.ivaCalculator.importoLordo || ''}" style="max-width: 100%;" autocomplete="off">
                                </div>
                                <div id="iva-risultati" class="space-y-4">
                                    <div class="product-box p-3" style="background-color: rgba(107, 114, 128, 0.05); border-color: rgba(107, 114, 128, 0.3);">
                                        <div class="flex justify-between items-center">
                                            <span class="font-medium" style="color: var(--color-secondary);">Totale Lordo</span>
                                            <span id="iva-lordo" class="text-lg font-bold" style="color: var(--color-secondary);">${app.formatCurrency(homeState.ivaCalculator.importoLordo || 0)}</span>
                                        </div>
                                    </div>
                                    <div class="product-box p-3" style="background-color: rgba(37, 99, 235, 0.05); border-color: rgba(37, 99, 235, 0.3);">
                                        <div class="flex justify-between items-center">
                                            <span class="font-medium" style="color: var(--color-primary);">Imponibile</span>
                                            <span id="iva-imponibile" class="text-lg font-bold" style="color: var(--color-primary);">${app.formatCurrency(homeState.ivaCalculator.risultati.imponibile)}</span>
                                        </div>
                                    </div>
                                    <div class="product-box p-3" style="background-color: rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.3);">
                                        <div class="flex justify-between items-center">
                                            <span class="font-medium" style="color: var(--color-warning);">IVA (22%)</span>
                                            <span id="iva-iva" class="text-lg font-bold text-warning">${app.formatCurrency(homeState.ivaCalculator.risultati.iva)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="banconote-counter-content" class="space-y-4 ${homeState.activeHomeCardTab === 'banconote' ? '' : 'hidden'}">
                            <div class="space-y-3" id="banconote-inputs-container">
                                {/* I campi verranno generati da renderBanconoteInputs() */}
                            </div>

                            <div class="product-box mt-4 p-3 rounded-lg" style="background-color: rgba(37, 99, 235, 0.05); border-color: rgba(37, 99, 235, 0.3);">
                                <div class="flex items-center justify-between">
                                    <div style="width: 100px; text-align: center;">
                                        <span class="text-lg font-bold text-primary">TOTALE</span>
                                    </div>
                                    <div style="width: 200px; text-align: center;">
                                        <span id="banconote-count" class="text-lg font-bold text-primary">${app.formatInteger(homeState.banconoteCounter.count || 0)}</span>
                                    </div>
                                    <div style="width: 150px; text-align: center;"> 
                                        <span id="banconote-total" class="text-xl font-bold text-success">${app.formatCurrency(homeState.banconoteCounter.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="carburante-container" class="space-y-4 ${homeState.activeHomeCardTab === 'carburante' ? '' : 'hidden'}">
                            {/* Questo contenuto viene riempito dalla funzione renderOrdineCarburante() */}
                        </div>

                    </div>
                </div>

                <div class="card">
                    <div class="card-body calculator">
                        <div id="calculator-display-container" class="calculator-display">
                            <div class="equation">${homeState.calculator.equation}</div>
                            <div class="result">${homeState.calculator.display}</div>
                        </div>
                        <div id="calc-buttons" class="calculator-buttons">
                            <button class="calc-btn function" data-value="C">C</button>
                            <button class="calc-btn function" data-value="±">±</button>
                            <button class="calc-btn function" data-value="%">%</button>
                            <button class="calc-btn operator" data-value="/">÷</button>
                            <button class="calc-btn number" data-value="7">7</button>
                            <button class="calc-btn number" data-value="8">8</button>
                            <button class="calc-btn number" data-value="9">9</button>
                            <button class="calc-btn operator" data-value="*">×</button>
                            <button class="calc-btn number" data-value="4">4</button>
                            <button class="calc-btn number" data-value="5">5</button>
                            <button class="calc-btn number" data-value="6">6</button>
                            <button class="calc-btn operator" data-value="-">−</button>
                            <button class="calc-btn number" data-value="1">1</button>
                            <button class="calc-btn number" data-value="2">2</button>
                            <button class="calc-btn number" data-value="3">3</button>
                            <button class="calc-btn operator" data-value="+">+</button>
                            <button class="calc-btn number zero" data-value="0">0</button>
                            <button class="calc-btn number" data-value=".">.</button>
                            <button class="calc-btn operator equal" data-value="=">=</button>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    `;

    setupHomeEventListeners.call(app);

    renderCalendar.call(app);
    renderTodos.call(app);
    renderOrdineCarburante.call(app);

    renderBanconoteInputs.call(app);

    app.refreshIcons();
}
// Fine funzione renderHomeSection

// === SETUP EVENT LISTENERS HOME ===
// Inizio funzione setupHomeEventListeners
function setupHomeEventListeners() {
    const app = this;

    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => setActiveHomeCardTab(btn.dataset.tab));
    });

    document.getElementById('iva-importo')?.addEventListener('input', (e) => {
        homeState.ivaCalculator.importoLordo = parseFloat(e.target.value) || null;
        calcolaIva.call(app);
    });

    // Listener per banconote Rimosso, viene gestito dinamicamente

    document.getElementById('calendar-prev')?.addEventListener('click', () => changeMonth.call(app, -1));
    document.getElementById('calendar-next')?.addEventListener('click', () => changeMonth.call(app, 1));
	document.getElementById('calendar-today-btn')?.addEventListener('click', () => {
		homeState.calendar.currentDate = new Date();
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, '0');
		const day = String(today.getDate()).padStart(2, '0');
		homeState.calendar.selectedDate = `${year}-${month}-${day}`;
		renderCalendar.call(app);
	});

    document.getElementById('calendar-container')?.addEventListener('click', (e) => {
        const dayEl = e.target.closest('.calendar-day:not(.empty)');
        if (dayEl) {
            homeState.calendar.selectedDate = dayEl.dataset.date;
            renderCalendarDays();
            showAddTodoModal.call(app, dayEl.dataset.date);
        }
    });

    document.getElementById('calc-buttons')?.addEventListener('click', (e) => {
        if (e.target.matches('button')) {
            handleCalculatorInput.call(app, e.target.dataset.value);
        }
    });

document.getElementById('todo-list')?.addEventListener('click', (e) => {
    const todoItem = e.target.closest('.todo-item');
    if (!todoItem) return;

    const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            deleteTodo.call(app, deleteBtn.dataset.todoId);
            return;
        }

        const todoId = todoItem.dataset.todoId;
        const todoToEdit = homeState.todos.find(t => t.id === todoId);
        if (todoToEdit) {
            showEditTodoModal.call(app, todoToEdit);
        }
    });
}
// Fine funzione setupHomeEventListeners

// === FUNZIONI CALCOLATORE IVA E CONTA BANCONOTE ===
// Inizio funzione setActiveHomeCardTab
function setActiveHomeCardTab(tab) {
    homeState.activeHomeCardTab = tab;

    document.querySelectorAll('[data-tab]').forEach(btn => {
        const isActive = btn.dataset.tab === tab;
        btn.classList.toggle('btn-primary', isActive);
        btn.classList.toggle('active', isActive);
        btn.classList.toggle('btn-secondary', !isActive);
    });

    document.getElementById('iva-calculator-content').classList.toggle('hidden', tab !== 'iva');
    document.getElementById('banconote-counter-content').classList.toggle('hidden', tab !== 'banconote');
    // Aggiunta questa riga per il nuovo tab
    document.getElementById('carburante-container').classList.toggle('hidden', tab !== 'carburante');
}
// Fine funzione setActiveHomeCardTab

// Inizio funzione calcolaIva
function calcolaIva() {
    const lordo = homeState.ivaCalculator.importoLordo;
    if (lordo === null || isNaN(lordo) || lordo <= 0) {
        homeState.ivaCalculator.risultati = { imponibile: 0, iva: 0 };
    } else {
        const aliquota = 22 / 100;
        const imponibile = lordo / (1 + aliquota);
        homeState.ivaCalculator.risultati.imponibile = imponibile;
        homeState.ivaCalculator.risultati.iva = lordo - imponibile;
    }
    updateIvaDisplay.call(this);
}
// Fine funzione calcolaIva

// Inizio funzione updateIvaDisplay
function updateIvaDisplay() {
    const lordoEl = document.getElementById('iva-lordo');
    const imponibileEl = document.getElementById('iva-imponibile');
    const ivaEl = document.getElementById('iva-iva');

    if (lordoEl) {
        lordoEl.textContent = this.formatCurrency(homeState.ivaCalculator.importoLordo || 0);
    }
    if (imponibileEl) {
        imponibileEl.textContent = this.formatCurrency(homeState.ivaCalculator.risultati.imponibile);
    }
    if (ivaEl) {
        ivaEl.textContent = this.formatCurrency(homeState.ivaCalculator.risultati.iva);
    }
}
// Fine funzione updateIvaDisplay

// INIZIO MODIFICA: Aggiornata la funzione per calcolare e mostrare anche i subtotali
// Inizio funzione calcolaTotaleBanconote
function calcolaTotaleBanconote() {
    const app = this;
    const counter = homeState.banconoteCounter;
    const tagli = [500, 200, 100, 50, 20, 10];

    let totale = 0;
    let numeroBanconote = 0;

    tagli.forEach(taglio => {
        const quantita = parseInt(counter[taglio], 10) || 0;
        const subtotale = quantita * taglio;

        totale += subtotale;
        numeroBanconote += quantita;

        // Aggiorna il subtotale nell'interfaccia
        const subtotaleEl = document.getElementById(`banconote-subtotal-${taglio}`);
        if (subtotaleEl) {
            subtotaleEl.textContent = app.formatCurrency(subtotale);
        }
    });

    homeState.banconoteCounter.total = totale;
    homeState.banconoteCounter.count = numeroBanconote;

    // Aggiorna l'interfaccia dei totali
    const totaleEl = document.getElementById('banconote-total');
    if (totaleEl) {
        totaleEl.textContent = this.formatCurrency(totale);
    }

    const countEl = document.getElementById('banconote-count');
    if (countEl) {
        countEl.textContent = this.formatInteger(numeroBanconote);
    }
}
// Fine funzione calcolaTotaleBanconote
// FINE MODIFICA

// NUOVE FUNZIONI AGGIUNTE PER GLI SPINNER BANCONOTE

// Inizio funzione renderBanconoteInputs
function renderBanconoteInputs() {
    const app = this; // Usa 'this'
    const container = document.getElementById('banconote-inputs-container');
    if (!container) return;

    const tagli = [500, 200, 100, 50, 20, 10];

    container.innerHTML = tagli.map(taglio => {
        const quantita = homeState.banconoteCounter[taglio] || 0;
        const subtotale = quantita * taglio;

        return `
            <div class="flex items-center justify-between p-3 rounded-lg" style="border: 1px solid var(--border-primary); background-color: var(--bg-secondary);">
                
                <div style="width: 100px; text-align: center;">
                    <span class="text-lg font-medium text-primary">€ ${taglio}</span>
                </div>
                
                <div style="width: 200px;">
                    <div class="number-input-group">
                        <button type="button" class="number-input-btn" data-action="decrement-banconota" data-taglio="${taglio}">
                            <i data-lucide="minus"></i>
                        </button>
                        <input type="text" id="banconota-quantita-${taglio}" value="${app.formatInteger(quantita)}" readonly class="number-input-field" />
                        <button type="button" class="number-input-btn" data-action="increment-banconota" data-taglio="${taglio}">
                            <i data-lucide="plus"></i>
                        </button>
                    </div>
                </div>

                <div style="width: 150px; text-align: center;">
                    <span id="banconote-subtotal-${taglio}" class="text-lg font-bold text-success">
                        ${app.formatCurrency(subtotale)}
                    </span>
                </div>
                
            </div>
        `;
    }).join('');

    // Listener (invariati)
    container.querySelectorAll('[data-action="increment-banconota"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const taglio = btn.dataset.taglio;
            incrementBanconota.call(app, taglio);
        });
    });

    container.querySelectorAll('[data-action="decrement-banconota"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const taglio = btn.dataset.taglio;
            decrementBanconota.call(app, taglio);
        });
    });

    app.refreshIcons();
}
// Fine funzione renderBanconoteInputs

// Inizio funzione incrementBanconota
function incrementBanconota(taglio) {
    // const app = this; // Non necessario se si usa 'this' direttamente
    const taglioNum = parseInt(taglio, 10);
    let quantita = homeState.banconoteCounter[taglioNum] || 0;
    quantita++;
    homeState.banconoteCounter[taglioNum] = quantita;

    updateBanconotaInput.call(this, taglioNum, quantita); // Usa .call(this)
}
// Fine funzione incrementBanconota

// Inizio funzione decrementBanconota
function decrementBanconota(taglio) {
    // const app = this; // Non necessario
    const taglioNum = parseInt(taglio, 10);
    let quantita = homeState.banconoteCounter[taglioNum] || 0;
    if (quantita > 0) {
        quantita--;
    }

    homeState.banconoteCounter[taglioNum] = quantita > 0 ? quantita : null;

    updateBanconotaInput.call(this, taglioNum, quantita); // Usa .call(this)
}
// Fine funzione decrementBanconota

// Inizio funzione updateBanconotaInput
function updateBanconotaInput(taglio, quantita) {
    const app = this; // Qui 'this' è corretto perché la funzione è chiamata con .call(this)
    const quantitaInput = document.getElementById(`banconota-quantita-${taglio}`);
    if (quantitaInput) {
        quantitaInput.value = app.formatInteger(quantita);
    }

    calcolaTotaleBanconote.call(app); // Passa il contesto anche qui
}
// Fine funzione updateBanconotaInput

// FINE NUOVE FUNZIONI

// === FUNZIONI CALENDARIO ===
// ... (codice calendario invariato) ...
// Inizio funzione initCalendar
function initCalendar() {
    renderCalendar.call(this);
}
// Fine funzione initCalendar

// Inizio funzione renderCalendar
function renderCalendar() {
    const date = homeState.calendar.currentDate;
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed (Gennaio = 0)

    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                       'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    homeState.calendar.monthYear = `${monthNames[month]} ${year}`;

    const monthYearEl = document.getElementById('calendar-month-year');
    if (monthYearEl) {
        monthYearEl.textContent = homeState.calendar.monthYear;
    }

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const firstDayIndex = (firstDayOfMonth + 6) % 7;
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

    let daysArray = [];
    for (let i = 0; i < firstDayIndex; i++) {
        daysArray.push({ value: '', isToday: false, isHoliday: false, isSunday: false, todos: [], date: null });
    }

    const oggi = new Date();
    const oggiYear = oggi.getFullYear();
    const oggiMonth = String(oggi.getMonth() + 1).padStart(2, '0');
    const oggiDay = String(oggi.getDate()).padStart(2, '0');
    const oggiString = `${oggiYear}-${oggiMonth}-${oggiDay}`;

    for (let i = 1; i <= lastDateOfMonth; i++) {
        const monthString = String(month + 1).padStart(2, '0');
        const dayString = String(i).padStart(2, '0');
        const dateString = `${year}-${monthString}-${dayString}`;

        const dataCorrente = new Date(year, month, i); // Usata solo per i check festivi/domenica
        const isToday = dateString === oggiString;
        const isSunday = isDomenica(dataCorrente);
        const isHoliday = isFestivaItaliana.call(this, dataCorrente);

        const todosForDay = homeState.todos.filter(todo => todo.dueDate === dateString);

        daysArray.push({ value: i, isToday, isHoliday, isSunday, todos: todosForDay, date: dateString });
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

        if (day.todos && day.todos.length > 0) {
            dayEl.classList.add('has-todo');
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'todo-dots-container';

            const importanceOrder = { 'urgent': 1, 'priority': 2, 'standard': 3 };
            const sortedTodos = [...day.todos].sort((a, b) => {
                return (importanceOrder[a.color] || 3) - (importanceOrder[b.color] || 3);
            });

            const colorToDotClass = {
                'urgent': 'dot-1',
                'priority': 'dot-2',
                'standard': 'dot-3'
            };

            sortedTodos.slice(0, 3).forEach(todo => {
                const dot = document.createElement('span');
                const dotClass = colorToDotClass[todo.color] || 'dot-3';

                dot.className = `todo-dot ${dotClass}`;

                if (todo.completed) {
                    dot.classList.add('completed');
                }
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
    const a = anno % 19, b = Math.floor(anno / 100), c = anno % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mese = Math.floor((h + l - 7 * m + 114) / 31), giorno = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(anno, mese - 1, giorno);
}
// Fine funzione calcolaPasqua

// Inizio funzione isFestivaItaliana
function isFestivaItaliana(data) {
    const giorno = data.getDate(), mese = data.getMonth() + 1, anno = data.getFullYear();
    const festivitaFisse = [{ giorno: 1, mese: 1 },{ giorno: 6, mese: 1 },{ giorno: 25, mese: 4 },{ giorno: 1, mese: 5 },{ giorno: 2, mese: 6 },{ giorno: 15, mese: 8 },{ giorno: 1, mese: 11 },{ giorno: 8, mese: 12 },{ giorno: 25, mese: 12 },{ giorno: 26, mese: 12 }];
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
    const prodotti = [{ key: 'benzina', name: 'Benzina', color: 'green', textColorClass: 'text-success' },{ key: 'gasolio', name: 'Gasolio', color: 'yellow', textColorClass: 'text-warning' },{ key: 'dieselPlus', name: 'Diesel+', color: 'red', textColorClass: 'text-danger' },{ key: 'hvolution', name: 'Hvolution', color: 'blue', textColorClass: 'text-info' }];
    const prezzi = getLatestPrices.call(app);
    let html = prodotti.map(p => {
        const quantita = homeState.ordineCarburante[p.key];
        const importo = quantita * (prezzi[p.key] || 0);
        return `<div class="flex items-center justify-between p-3 rounded-lg"><div style="width: 125px;"><span class="text-sm font-medium ${p.textColorClass}">${p.name}</span><div class="text-xs text-secondary">${app.formatCurrency(prezzi[p.key] || 0, true)}/L</div></div><div style="width: 200px;"><div class="number-input-group"><button type="button" class="number-input-btn" data-action="decrement" data-product="${p.key}"><i data-lucide="minus"></i></button><input type="text" id="carburante-quantita-${p.key}" value="${app.formatInteger(quantita)}" readonly class="number-input-field" /><button type="button" class="number-input-btn" data-action="increment" data-product="${p.key}"><i data-lucide="plus"></i></button></div></div><div class="text-right" style="width: 125px;"><span id="carburante-importo-${p.key}" class="text-sm font-bold text-${p.color}">${app.formatCurrency(importo)}</span></div></div>`;
    }).join('');
    const totaleLitri = getTotaleLitri.call(app), totaleImporto = getTotaleImporto.call(app);
    html += `<div class="product-box mt-4 p-4"><div class="flex items-end justify-between"><div><div class="text-sm text-secondary">Prodotti:</div><div class="text-xl font-bold text-primary">Totale</div></div><div><div class="text-sm text-secondary text-right">Litri:</div><div id="carburante-totale-litri" class="text-xl font-bold text-primary text-right">${app.formatInteger(totaleLitri)}</div></div><div><div class="text-sm text-secondary text-right">Importo:</div><div id="carburante-totale-importo" class="text-xl font-bold text-success text-right">${app.formatCurrency(totaleImporto)}</div></div></div></div>`;
    container.innerHTML = html;
    setupCarburanteEventListeners.call(app);
    app.refreshIcons();
}
// Fine funzione renderOrdineCarburante

// Inizio funzione setupCarburanteEventListeners
function setupCarburanteEventListeners() {
    const app = this;
    document.querySelectorAll('#carburante-container [data-action][data-product]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action'), product = btn.getAttribute('data-product');
            if (action === 'increment') incrementCarburante.call(app, product);
            else if (action === 'decrement') decrementCarburante.call(app, product);
        });
    });
}
// Fine funzione setupCarburanteEventListeners

// Inizio funzione incrementCarburante
function incrementCarburante(prodotto) {
    homeState.ordineCarburante[prodotto] += 1000;
    this.saveToStorage('ordineCarburante', homeState.ordineCarburante);
    updateOrdineCarburanteUI.call(this, prodotto);
}
// Fine funzione incrementCarburante

// Inizio funzione decrementCarburante
function decrementCarburante(prodotto) {
    if (homeState.ordineCarburante[prodotto] >= 1000) {
        homeState.ordineCarburante[prodotto] -= 1000;
        this.saveToStorage('ordineCarburante', homeState.ordineCarburante);
        updateOrdineCarburanteUI.call(this, prodotto);
    }
}
// Fine funzione decrementCarburante

// Inizio funzione updateOrdineCarburanteUI
function updateOrdineCarburanteUI(prodotto) {
    const app = this;
    const quantita = homeState.ordineCarburante[prodotto];
    const importo = calcolaImportoCarburante.call(app, prodotto);
    const quantitaEl = document.getElementById(`carburante-quantita-${prodotto}`);
    const importoEl = document.getElementById(`carburante-importo-${prodotto}`);
    if (quantitaEl) quantitaEl.value = app.formatInteger(quantita);
    if (importoEl) importoEl.textContent = app.formatCurrency(importo);
    const totaleLitri = getTotaleLitri.call(app), totaleImporto = getTotaleImporto.call(app);
    const totaleLitriEl = document.getElementById('carburante-totale-litri');
    const totaleImportoEl = document.getElementById('carburante-totale-importo');
    if (totaleLitriEl) totaleLitriEl.textContent = app.formatInteger(totaleLitri);
    if (totaleImportoEl) totaleImportoEl.textContent = app.formatCurrency(totaleImporto);
}
// Fine funzione updateOrdineCarburanteUI

// Inizio funzione getLatestPrices
function getLatestPrices() {
    if (!Array.isArray(this.state.data.priceHistory) || this.state.data.priceHistory.length === 0) {
        return { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0, adblue: 0 };
    }
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
    return Object.values(homeState.ordineCarburante).reduce((total, litri) => total + litri, 0);
}
// Fine funzione getTotaleLitri

// Inizio funzione getTotaleImporto
function getTotaleImporto() {
    const prodotti = ['benzina', 'gasolio', 'dieselPlus', 'hvolution'];
    return prodotti.reduce((total, prodotto) => {
        return total + calcolaImportoCarburante.call(this, prodotto);
    }, 0);
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

    const todayTurni = (app.state.data.turni || []).filter(t => {
        const turnoDate = new Date(t.date);
        return turnoDate >= today && turnoDate < tomorrow;
    });

    const shiftCount = todayTurni.length;
    const shiftNames = todayTurni.map(t => t.turno).join(', ');
    const prices = getLatestPrices.call(this);

    let totalIperself = 0;
    let totalServito = 0;
    let totalRevenue = 0;
    let totalMarginToday = 0;
    const margineFdtPay = 0.035 + 0.005;
    const margineServito = 0.065 + 0.015;
    const margineAdblue = 0.40;

    const productTotals = { benzina: { servito: 0, iperself: 0 }, gasolio: { servito: 0, iperself: 0 }, dieselplus: { servito: 0, iperself: 0 }, hvolution: { servito: 0, iperself: 0 }, adblue: { servito: 0, iperself: 0 }};

    todayTurni.forEach(turno => {
        const isRiepilogo = turno.turno === 'Riepilogo Mensile';

        for (const product in productTotals) {
            let fdtL = 0;
            let prepayL = 0;
            let servitoL = 0;

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
                if (product === 'adblue') {
                    totalRevenue += servitoL * basePrice;
                } else {
                    const prezzo_iperself = basePrice + 0.005;
                    const prezzo_servito = basePrice + 0.015 + 0.210;
                    totalRevenue += (iperselfL * prezzo_iperself) + (servitoL * prezzo_servito);
                }
            }

            if (product === 'adblue') {
                totalMarginToday += servitoL * margineAdblue;
            } else {
                totalMarginToday += iperselfL * margineFdtPay;
                totalMarginToday += servitoL * margineServito;
            }
        }
    });

    const totalLitersToday = totalIperself + totalServito;
    const overallServitoPercentage = totalLitersToday > 0 ? Math.round((totalServito / totalLitersToday) * 100) : 0;
    const productLiters = {};
    const productServitoPercentages = {};

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

    if (value === 'C') { resetCalculator.call(app); return; }

    if (value === '±') {
        if (calc.display !== '0') {
            calc.display = String(parseFloat(calc.display) * -1);
        }
    } else if (value === '%') {
        calc.display = String(parseFloat(calc.display) / 100);
    } else if (isNumber) {
        if (calc.waitingForSecondOperand) {
            calc.display = value;
            calc.waitingForSecondOperand = false;
        } else {
            calc.display = calc.display === '0' ? value : calc.display + value;
        }
    } else if (value === '.') {
        if (!calc.display.includes('.')) {
            calc.display += '.';
        }
    } else if (isOperator) {
        handleOperator.call(app, value);
    } else if (value === '=') {
        performCalculation.call(app);
    }
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

    if (calc.firstOperand === null && !isNaN(inputValue)) {
        calc.firstOperand = inputValue;
    } else if (calc.operator) {
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
        '+': (a, b) => a + b, '-': (a, b) => a - b,
        '*': (a, b) => a * b, '/': (a, b) => a / b
    };
    const result = calculations[calc.operator](calc.firstOperand, secondOperand);

    if (!isChained) {
        calc.equation = `${calc.firstOperand} ${calc.operator} ${secondOperand} =`;
    }

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
    homeState.calculator = { display: '0', equation: '', firstOperand: null, waitingForSecondOperand: false, operator: null };
    updateCalculatorDisplay.call(this);
}
// Fine funzione resetCalculator
// Inizio funzione updateCalculatorDisplay
function updateCalculatorDisplay() {
    const container = document.getElementById('calculator-display-container');
    if(container) {
        container.querySelector('.result').textContent = homeState.calculator.display;
        container.querySelector('.equation').textContent = homeState.calculator.equation;
    }
}
// Fine funzione updateCalculatorDisplay

// === FUNZIONI TO-DO ===
// Inizio funzione renderTodos
function renderTodos() {
    const app = this;
    const todoList = document.getElementById('todo-list');

    if (todoList) {
        const sortedTodos = [...homeState.todos].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        todoList.innerHTML = `
            ${sortedTodos.map(todo => `
<div class="todo-item ${todo.completed ? 'completed' : ''} color-${todo.color || 'standard'}" data-todo-id="${todo.id}" style="cursor: pointer;">
    <div class="flex-grow">
                        <span>${todo.text}</span>
                        ${todo.dueDate ? `<div class="text-xs text-secondary">Scadenza: ${app.formatDate(todo.dueDate)}</div>` : ''}
                    </div>
                    <button class="delete-btn ml-auto" data-todo-id="${todo.id}"><i data-lucide="x" class="w-4 h-4"></i></button>
                </div>
            `).join('')}
            ${homeState.todos.length === 0 ? '<p class="text-secondary text-sm">Nessuna attività. Clicca un giorno sul calendario per aggiungerne una!</p>' : ''}
        `;
    }

    app.refreshIcons();
}
// Fine funzione renderTodos

// Inizio funzione showAddTodoModal
function showAddTodoModal(dateString) {
    const app = getApp();
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = `
        <div class="card-header"><h2 class="card-title">Nuova Attività</h2></div>
        <div class="card-body">
            <div class="form-group">
                <label class="form-label">Descrizione attività</label>
                <input type="text" id="todo-text" class="form-control" style="max-width: 100%;" autocomplete="off">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                    <label class="form-label">Scadenza</label>
                    <input type="text" class="form-control" style="max-width: 120px;" value="${app.formatToItalianDate(dateString)}" readonly>
                    <input type="hidden" id="todo-due-date-iso" value="${dateString}">
                </div>
                <div class="form-group">
                    <label class="form-label">Importanza</label>
                    <div class="color-picker-group" style="flex-direction: row; gap: 1rem;">
                        <div class="flex items-center">
                            <label class="color-radio standard" title="Standard">
                                <input type="radio" name="todo-color" value="standard" checked><span></span>
                            </label>
                            <span class="text-sm text-secondary" style="margin-left: 0.5rem;">Standard</span>
                        </div>
                        <div class="flex items-center">
                            <label class="color-radio priority" title="Priorità">
                                <input type="radio" name="todo-color" value="priority"><span></span>
                            </label>
                            <span class="text-sm text-secondary" style="margin-left: 0.5rem;">Priorità</span>
                        </div>
                        <div class="flex items-center">
                            <label class="color-radio urgent" title="Urgente">
                                <input type="radio" name="todo-color" value="urgent"><span></span>
                            </label>
                            <span class="text-sm text-secondary" style="margin-left: 0.5rem;">Urgente</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end space-x-4 mt-6"><button id="cancel-todo-btn-bottom" class="btn btn-secondary">Annulla</button><button id="save-todo-btn" class="btn btn-primary">Salva Attività</button></div>
        </div>`;
    modalContentEl.classList.add('modal-todo');
    setupTodoModalEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showAddTodoModal

// Inizio funzione showEditTodoModal
function showEditTodoModal(todo) {
    const app = getApp();
    homeState.editingTodo = todo;
    const modalContentEl = document.getElementById('form-modal-content');

    const currentColor = todo.color || 'standard';

    modalContentEl.innerHTML = `
        <div class="card-header"><h2 class="card-title">Modifica Attività</h2></div>
        <div class="card-body">
            <div class="form-group">
                <label class="form-label">Descrizione attività</label>
                <input type="text" id="edit-todo-text" class="form-control" style="max-width: 100%;" value="${todo.text}" autocomplete="off">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                    <label class="form-label">Scadenza</label>
                    <input type="text" id="edit-todo-due-date-display" class="form-control" style="max-width: 120px;" value="${app.formatToItalianDate(todo.dueDate)}" placeholder="gg.mm.aaaa" autocomplete="off">
                </div>
                <div class="form-group">
                    <label class="form-label">Importanza</label>
                    <div class="color-picker-group" style="flex-direction: row; gap: 1rem;">
                        <div class="flex items-center">
                            <label class="color-radio standard" title="Standard">
                                <input type="radio" name="todo-color" value="standard" ${currentColor === 'standard' ? 'checked' : ''}><span></span>
                            </label>
                            <span class="text-sm text-secondary" style="margin-left: 0.5rem;">Standard</span>
                        </div>
                        <div class="flex items-center">
                            <label class="color-radio priority" title="Priorità">
                                <input type="radio" name="todo-color" value="priority" ${currentColor === 'priority' ? 'checked' : ''}><span></span>
                            </label>
                            <span class="text-sm text-secondary" style="margin-left: 0.5rem;">Priorità</span>
                        </div>
                        <div class="flex items-center">
                            <label class="color-radio urgent" title="Urgente">
                                <input type="radio" name="todo-color" value="urgent" ${currentColor === 'urgent' ? 'checked' : ''}><span></span>
                            </label>
                            <span class="text-sm text-secondary" style="margin-left: 0.5rem;">Urgente</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end space-x-4 mt-6"><button id="cancel-edit-todo-btn-bottom" class="btn btn-secondary">Annulla</button><button id="update-todo-btn" class="btn btn-primary">Aggiorna Attività</button></div>
        </div>`;

    modalContentEl.classList.add('modal-todo');
    setupEditTodoModalEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showEditTodoModal

// Inizio funzione setupTodoModalEventListeners
function setupTodoModalEventListeners() {
    const app = this;
    document.getElementById('save-todo-btn')?.addEventListener('click', () => saveTodo.call(app));
    const close = () => app.hideFormModal();
    document.getElementById('cancel-todo-btn-bottom')?.addEventListener('click', close);
}
// Fine funzione setupTodoModalEventListeners

// Inizio funzione setupEditTodoModalEventListeners
function setupEditTodoModalEventListeners() {
    const app = this;
    document.getElementById('update-todo-btn')?.addEventListener('click', () => updateTodo.call(app));
    const close = () => {
        homeState.editingTodo = null;
        app.hideFormModal();
    };
    document.getElementById('cancel-edit-todo-btn-bottom')?.addEventListener('click', close);
}
// Fine funzione setupEditTodoModalEventListeners

// Inizio funzione saveTodo
function saveTodo() {
    const app = this;
    const text = document.getElementById('todo-text').value.trim();
    const dueDate = document.getElementById('todo-due-date-iso').value;
    const color = document.querySelector('input[name="todo-color"]:checked').value;

    if (!text || !dueDate) {
        app.showNotification('Descrizione e data sono obbligatorie.');
        return;
    }
    if (homeState.todos.length >= 5) {
        app.showNotification('Puoi aggiungere un massimo di 5 attività.');
        app.hideFormModal();
        return;
    }
    const newTodo = { id: app.generateUniqueId('todo'), text, dueDate, completed: false, color: color };
    homeState.todos.push(newTodo);
    app.saveToStorage('homeTodos', homeState.todos);
    app.hideFormModal();

    renderCalendar.call(app);
    renderTodos.call(app);
}
// Fine funzione saveTodo

// Inizio funzione updateTodo
function updateTodo() {
    const app = this;
    const text = document.getElementById('edit-todo-text').value.trim();
    const dateString = document.getElementById('edit-todo-due-date-display').value;
    const color = document.querySelector('input[name="todo-color"]:checked').value;

    if (!text || !dateString) {
        app.showNotification('Descrizione e data sono obbligatorie.');
        return;
    }

    if (!app.validateItalianDate(dateString)) {
        app.showNotification('Formato data non valido. Usa gg.mm.aaaa');
        return;
    }

    const dueDate = app.parseItalianDate(dateString).toISOString().split('T')[0];
    const todoId = homeState.editingTodo.id;
    homeState.todos = homeState.todos.map(todo =>
        todo.id === todoId ? { ...todo, text, dueDate, color } : todo
    );

    app.saveToStorage('homeTodos', homeState.todos);
    app.hideFormModal();
    homeState.editingTodo = null;

    renderCalendar.call(app);
    renderTodos.call(app);
}
// Fine funzione updateTodo

// Inizio funzione deleteTodo
function deleteTodo(todoId) {
    const app = this;
    const todo = homeState.todos.find(t => t.id === todoId);
    if (!todo) return;

    app.showConfirm(`Sei sicuro di voler eliminare l'attività?<br>"${todo.text}"?`, () => {
        homeState.todos = homeState.todos.filter(t => t.id !== todoId);
        app.saveToStorage('homeTodos', homeState.todos);
        renderCalendar.call(app);
        renderTodos.call(app);
        app.showNotification("Attività eliminata.");
    });
}
// Fine funzione deleteTodo

// Inizio funzione toggleTodo
function toggleTodo(todoId) {
    const app = this;
    homeState.todos = homeState.todos.map(todo =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );
    app.saveToStorage('homeTodos', homeState.todos);
    renderCalendar.call(app);
    renderTodos.call(app);
}
// Fine funzione toggleTodo

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initHome = initHome;
    window.renderHomeSection = renderHomeSection;
    window.homeState = homeState;
}
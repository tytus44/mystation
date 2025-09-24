// =============================================
// FILE: home.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Home / Dashboard con layout ottimizzato.
// Convertito da Alpine.js a vanilla JavaScript
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
        total: 0
    },

    // Scheda attiva per la card Calcolatore/Contatore
    activeHomeCardTab: 'iva',
    
    // Calendario
    calendar: {
        currentDate: new Date(),
        monthYear: '',
        days: []
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
    notes: [], // Sarà caricato dal localStorage
    todos: []  // Sarà caricato dal localStorage
};

// === INIZIALIZZAZIONE MODULO HOME ===
// Inizio funzione initHome
function initHome() {
    console.log('🏠 Inizializzazione modulo Home...');
    const app = this;
    
    // Carica stato ordine carburante
    homeState.ordineCarburante = app.loadFromStorage('ordineCarburante', {
        benzina: 0,
        gasolio: 0,
        dieselPlus: 0,
        hvolution: 0
    });

    // Carica note e to-do dal localStorage
    homeState.notes = app.loadFromStorage('homeNotes', []);
    homeState.todos = app.loadFromStorage('homeTodos', []);
    
    // Inizializza calendario
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

    const turniText = stats.shiftCount > 0 ? `(${stats.shiftNames})` : '';
    
    container.innerHTML = `
        <div class="space-y-6">

            <div class="grid grid-cols-3 gap-6">
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Litri venduti oggi</div>
                        <div class="stat-value">${app.formatInteger(stats.totalLitersToday)}</div>
                        <div class="text-xs text-secondary mt-1 flex space-x-2 items-center flex-wrap">
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
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">% Servito Oggi</div>
                        <div class="stat-value">${stats.overallServitoPercentage}%</div>
                        <div class="text-xs text-secondary mt-1 flex space-x-2 items-center flex-wrap">
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
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Fatturato giornaliero</div>
                        <div class="stat-value">${app.formatCurrency(stats.totalRevenueToday)}</div>
                        <div class="text-xs text-secondary mt-1">${stats.shiftCount} turni ${turniText}</div>
                    </div>
                    <div class="stat-icon green"><i data-lucide="euro"></i></div>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-6">
                
                <div class="card">
                    <div class="card-header">
                        <div class="btn-group w-full">
                            <button class="btn ${homeState.activeHomeCardTab === 'iva' ? 'btn-primary active' : 'btn-secondary'}" data-tab="iva">Calcola IVA</button>
                            <button class="btn ${homeState.activeHomeCardTab === 'banconote' ? 'btn-primary active' : 'btn-secondary'}" data-tab="banconote">Conta Banconote</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="iva-calculator-content" class="${homeState.activeHomeCardTab === 'iva' ? '' : 'hidden'}">
                            <div class="space-y-4">
                                <div class="form-group">
                                    <label class="form-label">Importo Lordo (€)</label>
                                    <input type="number" id="iva-importo" step="0.01" placeholder="0.00" class="form-control text-lg" value="${homeState.ivaCalculator.importoLordo || ''}" style="max-width: 100%;">
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
                        <div id="banconote-counter-content" class="${homeState.activeHomeCardTab === 'banconote' ? '' : 'hidden'}">
                            <div class="space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="form-group mb-0">
                                        <label class="form-label">€ 500</label>
                                        <input type="number" data-taglio="500" class="form-control banconote-input" style="max-width: 100%;" value="${homeState.banconoteCounter[500] || ''}" placeholder="0">
                                    </div>
                                    <div class="form-group mb-0">
                                        <label class="form-label">€ 200</label>
                                        <input type="number" data-taglio="200" class="form-control banconote-input" style="max-width: 100%;" value="${homeState.banconoteCounter[200] || ''}" placeholder="0">
                                    </div>
                                    <div class="form-group mb-0">
                                        <label class="form-label">€ 100</label>
                                        <input type="number" data-taglio="100" class="form-control banconote-input" style="max-width: 100%;" value="${homeState.banconoteCounter[100] || ''}" placeholder="0">
                                    </div>
                                    <div class="form-group mb-0">
                                        <label class="form-label">€ 50</label>
                                        <input type="number" data-taglio="50" class="form-control banconote-input" style="max-width: 100%;" value="${homeState.banconoteCounter[50] || ''}" placeholder="0">
                                    </div>
                                    <div class="form-group mb-0">
                                        <label class="form-label">€ 20</label>
                                        <input type="number" data-taglio="20" class="form-control banconote-input" style="max-width: 100%;" value="${homeState.banconoteCounter[20] || ''}" placeholder="0">
                                    </div>
                                    <div class="form-group mb-0">
                                        <label class="form-label">€ 10</label>
                                        <input type="number" data-taglio="10" class="form-control banconote-input" style="max-width: 100%;" value="${homeState.banconoteCounter[10] || ''}" placeholder="0">
                                    </div>
                                </div>
                                <div class="product-box p-4">
                                    <div class="flex justify-between items-center">
                                        <span class="font-medium text-lg text-primary">Totale Banconote</span>
                                        <span id="banconote-total" class="text-xl font-bold text-success">${app.formatCurrency(homeState.banconoteCounter.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div class="flex items-center justify-between w-full">
                            <h3 class="card-title">Calendario</h3>
                            <div class="flex items-center space-x-2">
                                <button id="calendar-prev" class="calendar-nav-btn">
                                    <i data-lucide="chevron-left"></i>
                                </button>
                                <span id="calendar-month-year" class="calendar-title"></span>
                                <button id="calendar-next" class="calendar-nav-btn">
                                    <i data-lucide="chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body p-0">
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
                    <div class="p-4 pt-2">
                        <div id="calendar-today-display-box" class="product-box p-3 text-center" style="background-color: rgba(37, 99, 235, 0.05); border-color: rgba(37, 99, 235, 0.3);">
                            </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Calcolo Ordine Carburante</h3>
                    </div>
                    <div class="card-body space-y-4" id="carburante-container">
                        </div>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-6">
                
                <div class="card" id="notes-card">
                    <div class="card-header">
                        <h3 class="card-title">Note Rapide</h3>
                        <button id="add-note-btn" class="btn btn-secondary">
                            <i data-lucide="notebook-pen" class="w-4 h-4 mr-2"></i>Aggiungi
                        </button>
                    </div>
                    <div class="card-body">
                        <div id="notes-grid" class="notes-grid"></div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-body calculator">
                        <div id="calculator-display-container" class="calculator-display">
                            <div class="equation">${homeState.calculator.equation}</div>
                            <div class="result">${homeState.calculator.display}</div>
                        </div>
                        <div id="calc-buttons" class="calculator-grid">
                            <button class="calc-btn function" data-value="C">C</button>
                            <button class="calc-btn function" data-value="±">±</button>
                            <button class="calc-btn function" data-value="%">%</button>
                            <button class="calc-btn operator" data-value="/">÷</button>
                            <button class="calc-btn" data-value="7">7</button>
                            <button class="calc-btn" data-value="8">8</button>
                            <button class="calc-btn" data-value="9">9</button>
                            <button class="calc-btn operator" data-value="*">×</button>
                            <button class="calc-btn" data-value="4">4</button>
                            <button class="calc-btn" data-value="5">5</button>
                            <button class="calc-btn" data-value="6">6</button>
                            <button class="calc-btn operator" data-value="-">-</button>
                            <button class="calc-btn" data-value="1">1</button>
                            <button class="calc-btn" data-value="2">2</button>
                            <button class="calc-btn" data-value="3">3</button>
                            <button class="calc-btn operator" data-value="+">+</button>
                            <button class="calc-btn" data-value="0">0</button>
                            <button class="calc-btn" data-value=".">.</button>
                            <button class="calc-btn operator equal" data-value="=">=</button>
                        </div>
                    </div>
                </div>

                <div class="card" id="todos-card">
                    <div class="card-header">
                        <h3 class="card-title">To-Do List</h3>
                        <button id="add-todo-btn" class="btn btn-secondary">
                            <i data-lucide="square-check-big" class="w-4 h-4 mr-2"></i>Aggiungi
                        </button>
                    </div>
                    <div class="card-body">
                        <div id="todo-list" class="todo-list"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Setup event listeners
    setupHomeEventListeners.call(app);
    
    // Render componenti dinamici
    renderCalendar.call(app);
    renderTodayDisplay.call(app);
    renderOrdineCarburante.call(app);
    // CORREZIONE: Chiamata alla nuova funzione di rendering per note e to-do
    renderNotesAndTodos.call(app); 
    
    // Refresh icone
    app.refreshIcons();
}
// Fine funzione renderHomeSection

// === SETUP EVENT LISTENERS HOME ===
// Inizio funzione setupHomeEventListeners
function setupHomeEventListeners() {
    const app = this;
    
    // Listener per le schede IVA/Banconote
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => setActiveHomeCardTab(btn.dataset.tab));
    });
    
    // Calcolatore IVA
    document.getElementById('iva-importo')?.addEventListener('input', (e) => {
        homeState.ivaCalculator.importoLordo = parseFloat(e.target.value) || null;
        calcolaIva.call(app);
    });

    // Conta Banconote
    document.querySelectorAll('.banconote-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const taglio = e.target.dataset.taglio;
            homeState.banconoteCounter[taglio] = parseInt(e.target.value, 10) || null;
            calcolaTotaleBanconote.call(app);
        });
    });

    // Calendario navigation
    document.getElementById('calendar-prev')?.addEventListener('click', () => changeMonth.call(app, -1));
    document.getElementById('calendar-next')?.addEventListener('click', () => changeMonth.call(app, 1));

    // Calcolatrice
    document.getElementById('calc-buttons')?.addEventListener('click', (e) => {
        if (e.target.matches('button')) {
            handleCalculatorInput.call(app, e.target.dataset.value);
        }
    });

    // Note
    document.getElementById('add-note-btn')?.addEventListener('click', () => showAddNoteModal.call(app));
    document.getElementById('notes-grid')?.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const noteItem = e.target.closest('.note-item');

        if (deleteBtn) {
            e.stopPropagation();
            deleteNote.call(app, deleteBtn.dataset.noteId);
        } else if (noteItem) {
            showNoteModalById(noteItem.dataset.noteId);
        }
    });

    // To-Do
    document.getElementById('add-todo-btn')?.addEventListener('click', () => showAddTodoModal.call(app));
    document.getElementById('todo-list')?.addEventListener('click', (e) => {
        if (e.target.matches('input[type="checkbox"]')) {
            toggleTodo.call(app, e.target.dataset.todoId);
        }
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            deleteTodo.call(app, deleteBtn.dataset.todoId);
        }
    });
}
// Fine funzione setupHomeEventListeners

// === FUNZIONI CALCOLATORE IVA E CONTA BANCONOTE ===
// Inizio funzione setActiveHomeCardTab
function setActiveHomeCardTab(tab) {
    homeState.activeHomeCardTab = tab;

    // Aggiorna stile pulsanti
    document.querySelectorAll('[data-tab]').forEach(btn => {
        const isActive = btn.dataset.tab === tab;
        btn.classList.toggle('btn-primary', isActive);
        btn.classList.toggle('active', isActive);
        btn.classList.toggle('btn-secondary', !isActive);
    });

    // Mostra/nascondi contenuto
    document.getElementById('iva-calculator-content').classList.toggle('hidden', tab !== 'iva');
    document.getElementById('banconote-counter-content').classList.toggle('hidden', tab !== 'banconote');
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

// Inizio funzione calcolaTotaleBanconote
function calcolaTotaleBanconote() {
    const counter = homeState.banconoteCounter;
    const totale = (counter[500] || 0) * 500 +
                   (counter[200] || 0) * 200 +
                   (counter[100] || 0) * 100 +
                   (counter[50] || 0) * 50 +
                   (counter[20] || 0) * 20 +
                   (counter[10] || 0) * 10;
    homeState.banconoteCounter.total = totale;

    const totaleEl = document.getElementById('banconote-total');
    if (totaleEl) {
        totaleEl.textContent = this.formatCurrency(totale);
    }
}
// Fine funzione calcolaTotaleBanconote

// === FUNZIONI CALENDARIO ===
// Inizio funzione initCalendar
function initCalendar() {
    renderCalendar.call(this);
}
// Fine funzione initCalendar

// Inizio funzione renderCalendar
function renderCalendar() {
    const date = homeState.calendar.currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    
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
        daysArray.push({ value: '', isToday: false, isHoliday: false, isSunday: false });
    }
    
    const oggi = new Date();
    const oggiItalia = new Date(oggi.toLocaleString("en-US", {timeZone: "Europe/Rome"}));
    
    for (let i = 1; i <= lastDateOfMonth; i++) {
        const dataCorrente = new Date(year, month, i);
        const isToday = i === oggiItalia.getDate() && month === oggiItalia.getMonth() && year === oggiItalia.getFullYear();
        const isSunday = isDomenica(dataCorrente);
        const isHoliday = isFestivaItaliana.call(this, dataCorrente);
        daysArray.push({ value: i, isToday: isToday, isHoliday: isHoliday, isSunday: isSunday });
    }
    
    homeState.calendar.days = daysArray;
    renderCalendarDays();
}
// Fine funzione renderCalendar

// Inizio funzione renderCalendarDays
function renderCalendarDays() {
    const container = document.getElementById('calendar-container');
    if (!container) return;
    
    const dayElements = container.querySelectorAll('.calendar-day');
    dayElements.forEach(el => el.remove());
    
    homeState.calendar.days.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day.value;
        if (day.isToday) dayEl.classList.add('today');
        if (day.isHoliday) dayEl.classList.add('holiday');
        if (day.isSunday) dayEl.classList.add('sunday');
        if (!day.value) dayEl.classList.add('empty');
        container.appendChild(dayEl);
    });
}
// Fine funzione renderCalendarDays

// Inizio funzione renderTodayDisplay
function renderTodayDisplay() {
    const today = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const formattedDate = today.toLocaleDateString('it-IT', options);
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    const container = document.getElementById('calendar-today-display-box');
    if (container) {
        container.innerHTML = `<span class="font-medium text-primary">${capitalizedDate}</span>`;
    }
}
// Fine funzione renderTodayDisplay

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
    const todayTurni = app.state.data.turni.filter(t => new Date(t.date) >= today && new Date(t.date) < tomorrow);
    const shiftCount = todayTurni.length;
    const shiftNames = todayTurni.map(t => t.turno).join(', ');
    const prices = getLatestPrices.call(this);
    let totalIperself = 0, totalServito = 0, totalRevenue = 0;
    const productTotals = { benzina: { servito: 0, iperself: 0 }, gasolio: { servito: 0, iperself: 0 }, dieselplus: { servito: 0, iperself: 0 }, hvolution: { servito: 0, iperself: 0 }, adblue: { servito: 0, iperself: 0 }};
    todayTurni.forEach(turno => {
        for (const product in productTotals) {
            const iperselfL = parseFloat(turno.iperself?.[product]) || 0;
            const servitoL = parseFloat(turno.servito?.[product]) || 0;
            productTotals[product].iperself += iperselfL;
            productTotals[product].servito += servitoL;
            if (product !== 'adblue') totalIperself += iperselfL;
            totalServito += servitoL;
            const priceKey = product === 'dieselplus' ? 'dieselPlus' : product;
            const basePrice = prices[priceKey] || 0;
            if (basePrice > 0) {
                if (product === 'adblue') totalRevenue += servitoL * basePrice;
                else {
                    const prezzo_iperself = basePrice + 0.005;
                    const prezzo_servito = basePrice + 0.015 + 0.210;
                    totalRevenue += (iperselfL * prezzo_iperself) + (servitoL * prezzo_servito);
                }
            }
        }
    });
    const totalLitersToday = totalIperself + totalServito;
    const overallServitoPercentage = totalLitersToday > 0 ? Math.round((totalServito / totalLitersToday) * 100) : 0;
    const productLiters = {}, productServitoPercentages = {};
    for (const product in productTotals) {
        const pTotal = productTotals[product].servito + productTotals[product].iperself;
        productLiters[product] = pTotal;
        productServitoPercentages[product] = pTotal > 0 ? Math.round((productTotals[product].servito / pTotal) * 100) : 0;
    }
    return { totalLitersToday, overallServitoPercentage, productServitoPercentages, totalRevenueToday: totalRevenue, shiftCount, shiftNames, productLiters };
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
    calc.firstOperand = result; // Per calcoli concatenati
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

// === FUNZIONI NOTE E TO-DO ===
// CORREZIONE: Nuova funzione per renderizzare solo le card note e to-do
// Inizio funzione renderNotesAndTodos
function renderNotesAndTodos() {
    const app = this;
    const notesGrid = document.getElementById('notes-grid');
    const todoList = document.getElementById('todo-list');
    const addNoteBtn = document.getElementById('add-note-btn');
    const addTodoBtn = document.getElementById('add-todo-btn');

    // Render Notes
    if (notesGrid) {
        notesGrid.innerHTML = `
            ${homeState.notes.map(note => `
                <div class="note-item note-${note.color}" data-note-id="${note.id}">
                    <div class="note-title">${note.title}</div>
                    <button class="delete-btn" data-note-id="${note.id}"><i data-lucide="x" class="w-4 h-4"></i></button>
                </div>
            `).join('')}
            ${homeState.notes.length === 0 ? '<p class="text-secondary text-sm">Nessuna nota. Aggiungine una!</p>' : ''}
        `;
    }
    if(addNoteBtn) addNoteBtn.disabled = homeState.notes.length >= 5;

    // Render To-Dos
    if (todoList) {
        todoList.innerHTML = `
            ${homeState.todos.map(todo => `
                <div class="todo-item ${todo.completed ? 'completed' : ''}">
                    <input type="checkbox" data-todo-id="${todo.id}" ${todo.completed ? 'checked' : ''}>
                    <span>${todo.text}</span>
                    <button class="delete-btn ml-auto" data-todo-id="${todo.id}"><i data-lucide="x" class="w-4 h-4"></i></button>
                </div>
            `).join('')}
            ${homeState.todos.length === 0 ? '<p class="text-secondary text-sm">Nessuna attività. Aggiungine una!</p>' : ''}
        `;
    }
    if(addTodoBtn) addTodoBtn.disabled = homeState.todos.length >= 5;

    app.refreshIcons();
}
// Fine funzione renderNotesAndTodos

// Inizio funzione showAddNoteModal
function showAddNoteModal() {
    const app = getApp();
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = `
        <div class="card-header"><h2 class="card-title">Nuova Nota</h2><button id="cancel-note-btn" class="btn btn-secondary modal-close-btn"><i data-lucide="x"></i></button></div>
        <div class="card-body">
            <div class="form-group"><label class="form-label">Titolo</label><input type="text" id="note-title" class="form-control" style="max-width: 100%;"></div>
            <div class="form-group"><label class="form-label">Testo nota</label><textarea id="note-text" class="form-control form-textarea" style="max-width: 100%;"></textarea></div>
            <div class="form-group"><label class="form-label">Colore</label><div id="note-color-selector" class="note-color-selector">
                <div class="note-color-option note-yellow selected" data-color="yellow"></div><div class="note-color-option note-green" data-color="green"></div>
                <div class="note-color-option note-blue" data-color="blue"></div><div class="note-color-option note-pink" data-color="pink"></div>
            </div></div>
            <div class="flex justify-end space-x-4 mt-6"><button id="cancel-note-btn-bottom" class="btn btn-secondary">Annulla</button><button id="save-note-btn" class="btn btn-primary">Salva Nota</button></div>
        </div>`;
    modalContentEl.classList.add('modal-wide');
    setupNoteModalEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showAddNoteModal
// Inizio funzione setupNoteModalEventListeners
function setupNoteModalEventListeners() {
    const app = this;
    document.getElementById('save-note-btn')?.addEventListener('click', () => saveNote.call(app));
    const close = () => app.hideFormModal();
    document.getElementById('cancel-note-btn')?.addEventListener('click', close);
    document.getElementById('cancel-note-btn-bottom')?.addEventListener('click', close);
    document.getElementById('note-color-selector')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('note-color-option')) {
            document.querySelectorAll('.note-color-option').forEach(el => el.classList.remove('selected'));
            e.target.classList.add('selected');
        }
    });
}
// Fine funzione setupNoteModalEventListeners
// Inizio funzione saveNote
function saveNote() {
    const title = document.getElementById('note-title').value.trim();
    const text = document.getElementById('note-text').value.trim();
    if (!title) { this.showNotification('Il titolo della nota non può essere vuoto.'); return; }
    if (homeState.notes.length >= 5) { this.showNotification('Puoi aggiungere un massimo di 5 note.'); this.hideFormModal(); return; }
    const color = document.querySelector('.note-color-option.selected').dataset.color;
    const newNote = { id: this.generateUniqueId('note'), title, text, color };
    homeState.notes.push(newNote);
    this.saveToStorage('homeNotes', homeState.notes);
    this.hideFormModal();
    // CORREZIONE: Chiama il rendering selettivo
    renderNotesAndTodos.call(this);
}
// Fine funzione saveNote
// Inizio funzione deleteNote
function deleteNote(noteId) {
    homeState.notes = homeState.notes.filter(note => note.id !== noteId);
    this.saveToStorage('homeNotes', homeState.notes);
    // CORREZIONE: Chiama il rendering selettivo
    renderNotesAndTodos.call(this);
}
// Fine funzione deleteNote

// Inizio funzione showNoteModal
function showNoteModal(noteId) {
    const app = getApp();
    const note = homeState.notes.find(n => n.id === noteId);
    if (!note) return;

    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = `
        <div class="card-header">
            <h2 class="card-title">${note.title}</h2>
            <button id="close-note-view-btn" class="btn btn-secondary modal-close-btn"><i data-lucide="x"></i></button>
        </div>
        <div class="card-body note-content-view">
            ${note.text.replace(/\n/g, '<br>')}
        </div>
    `;
    modalContentEl.classList.add('modal-wide');
    
    document.getElementById('close-note-view-btn')?.addEventListener('click', () => app.hideFormModal());
    
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showNoteModal

// Inizio funzione showAddTodoModal
function showAddTodoModal() {
    const app = getApp();
    const modalContentEl = document.getElementById('form-modal-content');
    modalContentEl.innerHTML = `
        <div class="card-header"><h2 class="card-title">Nuova Attività</h2><button id="cancel-todo-btn" class="btn btn-secondary modal-close-btn"><i data-lucide="x"></i></button></div>
        <div class="card-body">
            <div class="form-group"><label class="form-label">Descrizione attività</label><input type="text" id="todo-text" class="form-control" style="max-width: 100%;"></div>
            <div class="flex justify-end space-x-4 mt-6"><button id="cancel-todo-btn-bottom" class="btn btn-secondary">Annulla</button><button id="save-todo-btn" class="btn btn-primary">Salva Attività</button></div>
        </div>`;
    modalContentEl.classList.remove('modal-wide');
    setupTodoModalEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
}
// Fine funzione showAddTodoModal
// Inizio funzione setupTodoModalEventListeners
function setupTodoModalEventListeners() {
    const app = this;
    document.getElementById('save-todo-btn')?.addEventListener('click', () => saveTodo.call(app));
    const close = () => app.hideFormModal();
    document.getElementById('cancel-todo-btn')?.addEventListener('click', close);
    document.getElementById('cancel-todo-btn-bottom')?.addEventListener('click', close);
}
// Fine funzione setupTodoModalEventListeners
// Inizio funzione saveTodo
function saveTodo() {
    const text = document.getElementById('todo-text').value.trim();
    if (!text) { this.showNotification('La descrizione non può essere vuota.'); return; }
    if (homeState.todos.length >= 5) { this.showNotification('Puoi aggiungere un massimo di 5 attività.'); this.hideFormModal(); return; }
    const newTodo = { id: this.generateUniqueId('todo'), text, completed: false };
    homeState.todos.push(newTodo);
    this.saveToStorage('homeTodos', homeState.todos);
    this.hideFormModal();
    // CORREZIONE: Chiama il rendering selettivo
    renderNotesAndTodos.call(this);
}
// Fine funzione saveTodo
// Inizio funzione deleteTodo
function deleteTodo(todoId) {
    homeState.todos = homeState.todos.filter(todo => todo.id !== todoId);
    this.saveToStorage('homeTodos', homeState.todos);
    // CORREZIONE: Chiama il rendering selettivo
    renderNotesAndTodos.call(this);
}
// Fine funzione deleteTodo
// Inizio funzione toggleTodo
function toggleTodo(todoId) {
    homeState.todos = homeState.todos.map(todo => 
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );
    this.saveToStorage('homeTodos', homeState.todos);
    // CORREZIONE: Chiama il rendering selettivo
    renderNotesAndTodos.call(this);
}
// Fine funzione toggleTodo

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initHome = initHome;
    window.renderHomeSection = renderHomeSection;
    window.homeState = homeState;
    window.showNoteModalById = (id) => showNoteModal(id);
}
// =============================================
// FILE: calendar.js
// DESCRIZIONE: Modulo per la gestione del Calendario
//              nella sezione Home.
// =============================================

// === STATO LOCALE DEL MODULO CALENDARIO ===
let calendarState = {
    currentDate: new Date(), // Data usata per la navigazione mese/anno
    selectedDate: null,      // Data selezionata (formato YYYY-MM-DD)
    monthYear: '',           // Stringa Mese Anno per il titolo
    days: []                 // Array dei giorni del mese visualizzato
};

// === INIZIALIZZAZIONE MODULO CALENDARIO ===
function initCalendarModule() {
    console.log('🗓️ Inizializzazione modulo Calendario...');
    const app = this; // 'this' si riferisce all'istanza App
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    // Imposta la data selezionata iniziale ad oggi
    calendarState.selectedDate = `${year}-${month}-${day}`;
    // Imposta la data corrente per la navigazione ad oggi
    calendarState.currentDate = new Date(); // Reset per sicurezza
    console.log('✅ Modulo Calendario inizializzato');
}

// === RENDER COMPONENTE CALENDARIO ===
function renderCalendarComponent(container) {
    console.log('🗓️ Rendering componente Calendario...');
    const app = this; // 'this' si riferisce all'istanza App

    // HTML di base del calendario (senza i giorni, verranno aggiunti da renderCalendarDays)
    container.innerHTML = `
        <div class="card-header">
            <div class="flex items-center justify-between w-full">
                <h3 class="card-title">Calendario</h3>
                <div class="flex items-center space-x-2">
                    <button id="calendar-prev" class="calendar-nav-btn" aria-label="Mese precedente">
                        <i data-lucide="chevron-left"></i>
                    </button>
                    <span id="calendar-month-year" class="calendar-title"></span>
                    <button id="calendar-next" class="calendar-nav-btn" aria-label="Mese successivo">
                        <i data-lucide="chevron-right"></i>
                    </button>
                    <button id="calendar-today-btn" class="btn btn-primary ml-4">
                        <i data-lucide="calendar-check-2" class="mr-2"></i>Oggi
                    </button>
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
    `;

    // Aggiungi event listeners specifici del calendario
    setupCalendarEventListeners.call(app, container);

    // Renderizza il calendario iniziale
    updateCalendarView.call(app);

    // Aggiorna le icone Lucide
    app.refreshIcons();
}

// === SETUP EVENT LISTENERS CALENDARIO ===
function setupCalendarEventListeners(container) {
    const app = this; // 'this' si riferisce all'istanza App

    container.querySelector('#calendar-prev')?.addEventListener('click', () => changeMonth.call(app, -1));
    container.querySelector('#calendar-next')?.addEventListener('click', () => changeMonth.call(app, 1));
    container.querySelector('#calendar-today-btn')?.addEventListener('click', () => goToToday.call(app));

    // Event delegation per i click sui giorni
    const gridContainer = container.querySelector('#calendar-container');
    gridContainer?.addEventListener('click', (e) => {
        const dayEl = e.target.closest('.calendar-day:not(.empty)');
        if (dayEl && dayEl.dataset.date) {
            calendarState.selectedDate = dayEl.dataset.date;
            renderCalendarDays.call(app); // Aggiorna solo i giorni per evidenziare la selezione

            // --- INTERAZIONE CON TODO ---
            // Chiama la funzione globale (definita in home.js o app.js) per aprire il modal
            if (typeof showAddTodoModal === 'function') {
                showAddTodoModal.call(app, dayEl.dataset.date);
            } else {
                console.warn("Funzione 'showAddTodoModal' non trovata. Impossibile aggiungere ToDo.");
            }
            // --------------------------
        }
    });
}

// === LOGICA CALENDARIO ===

// Aggiorna la vista completa del calendario (titolo + giorni)
function updateCalendarView() {
    const app = this; // 'this' si riferisce all'istanza App
    const date = calendarState.currentDate;
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11

    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    calendarState.monthYear = `${monthNames[month]} ${year}`;

    // Aggiorna titolo
    const monthYearEl = document.getElementById('calendar-month-year');
    if (monthYearEl) {
        monthYearEl.textContent = calendarState.monthYear;
    }

    // Calcola i giorni da visualizzare
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Dom, 1=Lun,...
    const firstDayIndex = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // 0=Lun, 1=Mar,..., 6=Dom
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

    let daysArray = [];

    // Giorni vuoti all'inizio
    for (let i = 0; i < firstDayIndex; i++) {
        daysArray.push({ value: '', isToday: false, isHoliday: false, isSunday: false, todos: [], date: null });
    }

    // Giorni del mese
    const today = new Date(); today.setHours(0,0,0,0); // Normalizza l'ora per confronti

    // Accedi ai todos dallo stato globale dell'app
    const allTodos = app.state.data.todos || [];

    for (let i = 1; i <= lastDateOfMonth; i++) {
        const currentDateObj = new Date(year, month, i); currentDateObj.setHours(0,0,0,0);
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        const isToday = currentDateObj.getTime() === today.getTime();
        const isSunday = currentDateObj.getDay() === 0;
        const isHoliday = isFestivaItaliana(currentDateObj); // Funzione helper sotto
        const todosForDay = allTodos.filter(todo => todo.dueDate === dateString);

        daysArray.push({
            value: i,
            isToday,
            isHoliday,
            isSunday,
            todos: todosForDay,
            date: dateString
        });
    }
    calendarState.days = daysArray;

    // Renderizza solo i giorni
    renderCalendarDays.call(app);
}

// Renderizza solo la griglia dei giorni
function renderCalendarDays() {
    const app = this; // 'this' si riferisce all'istanza App
    const container = document.getElementById('calendar-container');
    if (!container) return;

    // Rimuovi solo i giorni vecchi, non gli header
    container.querySelectorAll('.calendar-day').forEach(el => el.remove());

    calendarState.days.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';

        const dayNumber = document.createElement('span'); // Span per il numero
        dayNumber.textContent = day.value;
        dayEl.appendChild(dayNumber);

        if (day.date) {
            dayEl.dataset.date = day.date; // Formato YYYY-MM-DD
        }

        if (day.isToday) dayEl.classList.add('today');
        if (day.isHoliday) dayEl.classList.add('holiday');
        if (day.isSunday) dayEl.classList.add('sunday');
        if (day.date === calendarState.selectedDate) dayEl.classList.add('selected');
        if (!day.value) dayEl.classList.add('empty');

        // Aggiungi puntini ToDo se presenti
        if (day.todos && day.todos.length > 0) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'todo-dots-container';

            // Ordina per importanza (Urgente > Priorità > Standard)
            const importanceOrder = { 'urgent': 1, 'priority': 2, 'standard': 3 };
            const sortedTodos = [...day.todos].sort((a, b) =>
                (importanceOrder[a.color || 'standard'] || 3) - (importanceOrder[b.color || 'standard'] || 3)
            );

            // Mappa colore a classe CSS
            const colorToDotClass = {
                'urgent': 'dot-urgent',
                'priority': 'dot-priority',
                'standard': 'dot-standard'
            };

            // Mostra max 3 puntini
            sortedTodos.slice(0, 3).forEach(todo => {
                const dot = document.createElement('span');
                const dotClass = colorToDotClass[todo.color || 'standard'] || 'dot-unknown';
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

// Cambia mese visualizzato
function changeMonth(offset) {
    const newDate = new Date(calendarState.currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    newDate.setDate(1); // Vai sempre al primo del mese per evitare problemi
    calendarState.currentDate = newDate;
    updateCalendarView.call(this); // 'this' è l'istanza app
}

// Torna al mese/giorno corrente
function goToToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    calendarState.selectedDate = `${year}-${month}-${day}`; // Seleziona oggi
    calendarState.currentDate = new Date(); // Naviga al mese corrente
    updateCalendarView.call(this); // 'this' è l'istanza app
}

// === FUNZIONI HELPER PER FESTIVITÀ ===

// Calcola data Pasqua (algoritmo di Gauss)
function calcolaPasqua(anno) {
    const a = anno % 19;
    const b = Math.floor(anno / 100);
    const c = anno % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mese = Math.floor((h + l - 7 * m + 114) / 31); // 3 = Marzo, 4 = Aprile
    const giorno = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(anno, mese - 1, giorno); // Mese è 0-indexed in Date
}

// Controlla se una data è festiva in Italia
function isFestivaItaliana(data) {
    const giorno = data.getDate();
    const mese = data.getMonth() + 1; // 1-12
    const anno = data.getFullYear();

    // Festività fisse
    const festivitaFisse = [
        { giorno: 1, mese: 1 },   // Capodanno
        { giorno: 6, mese: 1 },   // Epifania
        { giorno: 25, mese: 4 },  // Liberazione
        { giorno: 1, mese: 5 },   // Festa Lavoratori
        { giorno: 2, mese: 6 },   // Festa Repubblica
        { giorno: 15, mese: 8 },  // Ferragosto
        { giorno: 1, mese: 11 },  // Ognissanti
        { giorno: 8, mese: 12 },  // Immacolata
        { giorno: 25, mese: 12 }, // Natale
        { giorno: 26, mese: 12 }  // S. Stefano
    ];

    if (festivitaFisse.some(f => f.giorno === giorno && f.mese === mese)) {
        return true;
    }

    // Festività mobili (Pasqua e Lunedì dell'Angelo)
    const pasqua = calcolaPasqua(anno);
    const lunediDellAngelo = new Date(pasqua);
    lunediDellAngelo.setDate(pasqua.getDate() + 1);

    // Normalizza l'ora per il confronto
    const dataCorrente = new Date(anno, mese - 1, giorno);
    pasqua.setHours(0,0,0,0);
    lunediDellAngelo.setHours(0,0,0,0);
    dataCorrente.setHours(0,0,0,0);


    return dataCorrente.getTime() === pasqua.getTime() || dataCorrente.getTime() === lunediDellAngelo.getTime();
}

// === ESPORTAZIONE FUNZIONI PRINCIPALI ===
// Queste funzioni verranno chiamate da home.js
if (typeof window !== 'undefined') {
    window.initCalendarModule = initCalendarModule;
    window.renderCalendarComponent = renderCalendarComponent;
    window.updateCalendarView = updateCalendarView; // Esponi anche questa se serve refresh da fuori (es. dopo aggiunta todo)
}
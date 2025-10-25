// ========================
// DATEPICKER COMPONENT
// ========================
class DSDatepicker extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentDate = new Date(); // Data per la navigazione del calendario
        this.selectedDate = null; // Data effettivamente selezionata
        this._boundOutsideClickListener = this._handleOutsideClick.bind(this); // Per rimuovere il listener
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        if (this.getAttribute('value')) {
            // Imposta la data iniziale se fornita tramite attributo 'value'
            const initialValue = this.getAttribute('value');
            const dateParts = initialValue.split('-');
            if (dateParts.length === 3) {
                 const year = parseInt(dateParts[0], 10);
                 const month = parseInt(dateParts[1], 10) - 1; // Mese è 0-indexed
                 const day = parseInt(dateParts[2], 10);
                 if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                     const date = new Date(year, month, day);
                     if (!isNaN(date.getTime())) { // Verifica se la data è valida
                         this.currentDate = new Date(date); // Naviga al mese iniziale
                         this.setDate(date, false); // Imposta la data senza notificare subito
                     } else {
                         console.warn(`DSDatepicker: Valore iniziale "${initialValue}" non valido.`);
                     }
                 } else {
                     console.warn(`DSDatepicker: Valore iniziale "${initialValue}" non valido.`);
                 }
            } else {
                 console.warn(`DSDatepicker: Formato valore iniziale "${initialValue}" non valido (richiesto YYYY-MM-DD).`);
            }
        }
        // Renderizza il calendario iniziale dopo aver impostato la data
        this.renderCalendar();
    }

     disconnectedCallback() {
        // Rimuovi il listener globale quando il componente viene rimosso dal DOM
        document.removeEventListener('click', this._boundOutsideClickListener);
    }

    render() {
        const placeholder = this.getAttribute('placeholder') || 'Seleziona una data';
        // Non usiamo più getAttribute('value') qui, leggiamo _selectedDate o placeholder
        const displayValue = this.selectedDate ? this.formatDate(this.selectedDate) : '';
        const required = this.hasAttribute('required');
        const disabled = this.hasAttribute('disabled');

        this.shadowRoot.innerHTML = `
            <style>
                /* Incolla qui il contenuto di datepicker.css */
                * { box-sizing: border-box; }
                :host { display: inline-block; width: 100%; }
                .wrapper { position: relative; width: 100%; }
                .input { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid var(--border-primary); border-radius: var(--radius-md); background-color: var(--bg-primary); color: var(--text-primary); font-family: 'Poppins', sans-serif; font-size: 1rem; cursor: pointer; transition: border-color var(--animation-duration-fast) var(--animation-timing), box-shadow var(--animation-duration-fast) var(--animation-timing); }
                .input::placeholder { color: var(--text-tertiary); opacity: 1; } /* Mostra sempre il placeholder se non c'è valore */
                .input:hover:not(:disabled) { border-color: var(--border-focus); }
                .input:focus { outline: none; border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
                .input:disabled { opacity: 0.5; cursor: not-allowed; }
                .calendar { position: absolute; top: calc(100% + 0.5rem); left: 0; background-color: var(--bg-primary); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); padding: 1rem; z-index: 1000; min-width: 320px; display: none; opacity: 0; transform: translateY(-10px); transition: all var(--animation-duration-fast) var(--animation-timing); }
                .calendar.open { display: block; opacity: 1; transform: translateY(0); }
                .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .nav-btn { background-color: var(--bg-tertiary); border: 1px solid var(--border-primary); border-radius: var(--radius-sm); width: 2rem; height: 2rem; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: all var(--animation-duration-fast) var(--animation-timing); color: var(--text-secondary); font-weight: 600; }
                .nav-btn:hover:not(:disabled) { background-color: var(--color-primary); color: var(--text-inverse); border-color: var(--color-primary); }
                .nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .title { font-weight: 600; text-align: center; min-width: 150px; color: var(--text-primary); font-size: 1rem; }
                .weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; margin-bottom: 0.5rem; }
                .weekday { text-align: center; font-weight: 600; font-size: 0.75rem; color: var(--text-tertiary); padding: 0.5rem 0; text-transform: uppercase; letter-spacing: 0.5px; }
                .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; }
                .day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border: 1px solid transparent; border-radius: var(--radius-sm); cursor: pointer; transition: all var(--animation-duration-fast) var(--animation-timing); font-size: 0.875rem; color: var(--text-primary); font-weight: 500; }
                .day:hover:not(.empty):not(.disabled):not(.today):not(.selected) { background-color: var(--bg-tertiary); border-color: var(--border-focus); }
                .day.empty { cursor: default; color: transparent; background-color: transparent; border-color: transparent; }
                .day.today { background-color: rgba(37, 99, 235, 0.15); color: var(--color-primary); font-weight: 700; border-color: rgba(37, 99, 235, 0.5); }
                .day.selected { background-color: var(--color-primary); color: var(--text-inverse); font-weight: 700; border-color: var(--color-primary); }
                .day.disabled { color: var(--text-tertiary); cursor: not-allowed; opacity: 0.6; }
                .day.disabled:hover { background-color: transparent; border-color: transparent; }
            </style>
            <div class="wrapper">
                <input
                    type="text"
                    class="input"
                    placeholder="${placeholder}"
                    readonly
                    value="${displayValue}"
                    ${required ? 'required' : ''}
                    ${disabled ? 'disabled' : ''}
                >
                <div class="calendar">
                    <div class="header">
                        <button class="nav-btn prev-month" type="button" tabindex="-1">‹</button>
                        <div class="title"></div>
                        <button class="nav-btn next-month" type="button" tabindex="-1">›</button>
                    </div>
                    <div class="weekdays">
                        <div class="weekday">L</div><div class="weekday">M</div><div class="weekday">M</div>
                        <div class="weekday">G</div><div class="weekday">V</div><div class="weekday">S</div>
                        <div class="weekday">D</div>
                    </div>
                    <div class="days"></div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const input = this.shadowRoot.querySelector('.input');
        const calendar = this.shadowRoot.querySelector('.calendar');
        const prevBtn = this.shadowRoot.querySelector('.prev-month');
        const nextBtn = this.shadowRoot.querySelector('.next-month');

        input.addEventListener('click', (e) => {
            e.stopPropagation(); // Impedisce la chiusura immediata dal listener document
            if (!this.hasAttribute('disabled')) {
                this._toggleCalendar();
            }
        });

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.previousMonth();
         });
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.nextMonth();
        });

        // Aggiungi listener per chiudere cliccando fuori
        document.addEventListener('click', this._boundOutsideClickListener);

        // Aggiungi listener per i giorni (usando event delegation)
        const daysContainer = this.shadowRoot.querySelector('.days');
        daysContainer.addEventListener('click', (e) => {
             e.stopPropagation();
             const dayElement = e.target.closest('.day:not(.empty):not(.disabled)');
             if (dayElement) {
                 const day = parseInt(dayElement.textContent, 10);
                 if (!isNaN(day)) {
                     const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
                     this.setDate(date);
                 }
             }
         });
    }

     _handleOutsideClick(e) {
        if (!this.contains(e.target)) {
            this._closeCalendar();
        }
    }

    _toggleCalendar() {
        const calendar = this.shadowRoot.querySelector('.calendar');
        const isOpen = calendar.classList.toggle('open');
        if (isOpen) {
            this.dispatchEvent(new CustomEvent('open', { bubbles: true, composed: true }));
        } else {
            this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
        }
    }

     _closeCalendar() {
        const calendar = this.shadowRoot.querySelector('.calendar');
        if (calendar.classList.contains('open')) {
            calendar.classList.remove('open');
            this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
        }
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        // getDay() ritorna 0 per Domenica, 1 per Lunedì, ...
        // Calcoliamo l'indice corretto per una settimana che inizia di Lunedì (0 = Lunedì)
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const firstDayIndex = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // 0=Lun, 1=Mar,..., 6=Dom
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date(); today.setHours(0,0,0,0); // Normalizza l'ora per confronti

        const minDate = this.hasAttribute('min') ? new Date(this.getAttribute('min')) : null;
        if (minDate && !isNaN(minDate.getTime())) minDate.setHours(0,0,0,0); else minDate = null;

        const maxDate = this.hasAttribute('max') ? new Date(this.getAttribute('max')) : null;
        if (maxDate && !isNaN(maxDate.getTime())) maxDate.setHours(0,0,0,0); else maxDate = null;

        const title = this.shadowRoot.querySelector('.title');
        const daysContainer = this.shadowRoot.querySelector('.days');
        const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                       'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

        title.textContent = `${months[month]} ${year}`;
        daysContainer.innerHTML = '';

        // Spazi vuoti all'inizio del mese
        for (let i = 0; i < firstDayIndex; i++) {
            const day = document.createElement('div');
            day.className = 'day empty';
            daysContainer.appendChild(day);
        }

        // Giorni del mese
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'day';
            day.textContent = i;

            const currentDayDate = new Date(year, month, i);
            currentDayDate.setHours(0,0,0,0); // Normalizza

            // Controllo min/max
            let isDisabled = false;
            if ((minDate && currentDayDate < minDate) || (maxDate && currentDayDate > maxDate)) {
                 isDisabled = true;
                 day.classList.add('disabled');
            }

            if (currentDayDate.getTime() === today.getTime()) {
                day.classList.add('today');
            }

            if (this.selectedDate && currentDayDate.getTime() === this.selectedDate.getTime()) {
                day.classList.add('selected');
            }

            daysContainer.appendChild(day);
        }

        // Abilita/Disabilita bottoni navigazione se min/max è impostato
        const prevBtn = this.shadowRoot.querySelector('.prev-month');
        const nextBtn = this.shadowRoot.querySelector('.next-month');
        if (minDate) {
             const prevMonthLastDay = new Date(year, month, 0);
             prevBtn.disabled = prevMonthLastDay < minDate;
        } else {
             prevBtn.disabled = false;
        }
        if (maxDate) {
             const nextMonthFirstDay = new Date(year, month + 1, 1);
             nextBtn.disabled = nextMonthFirstDay > maxDate;
        } else {
             nextBtn.disabled = false;
        }
    }

    setDate(date, notify = true) {
        if (!date || isNaN(date.getTime())) return;
        date.setHours(0,0,0,0); // Normalizza

        const minDate = this.hasAttribute('min') ? new Date(this.getAttribute('min')) : null;
        if (minDate && !isNaN(minDate.getTime())) minDate.setHours(0,0,0,0); else minDate = null;
        const maxDate = this.hasAttribute('max') ? new Date(this.getAttribute('max')) : null;
        if (maxDate && !isNaN(maxDate.getTime())) maxDate.setHours(0,0,0,0); else maxDate = null;

        // Non selezionare se fuori range
        if ((minDate && date < minDate) || (maxDate && date > maxDate)) {
             return;
        }

        this.selectedDate = date;
        const input = this.shadowRoot.querySelector('.input');
        const value = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        input.value = this.formatDate(date); // Formato leggibile per display
        this.setAttribute('value', value); // Aggiorna attributo HTML
        this._closeCalendar(); // Chiudi calendario dopo selezione
        this.renderCalendar(); // Ridisegna per mostrare la selezione

        if (notify) {
            const event = new CustomEvent('change', {
                detail: {
                    value: value, // YYYY-MM-DD
                    date: date // Oggetto Date JavaScript
                 },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        }
    }

     // Formato visualizzato nell'input
    formatDate(date) {
        if (!date || isNaN(date.getTime())) return '';
        // Esempio: "Lun 25 Ott 2025"
        // return date.toLocaleDateString('it-IT', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
        // Usiamo un formato più standard italiano gg.mm.aaaa
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

     // Getter/Setter per la proprietà value
    get value() {
        return this.getAttribute('value');
    }

    set value(newValue) {
        if (newValue) {
            const dateParts = newValue.split('-');
            if (dateParts.length === 3) {
                 const year = parseInt(dateParts[0], 10);
                 const month = parseInt(dateParts[1], 10) - 1;
                 const day = parseInt(dateParts[2], 10);
                 if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                     const date = new Date(year, month, day);
                     if (!isNaN(date.getTime())) {
                         this.currentDate = new Date(date); // Aggiorna anche la vista calendario
                         this.setDate(date, false); // Imposta senza notificare
                         this.renderCalendar(); // Ridisegna
                         return;
                     }
                 }
            }
            console.warn(`DSDatepicker: Tentativo di impostare un valore non valido "${newValue}". Formato richiesto YYYY-MM-DD.`);
        } else {
             // Se impostato a null o stringa vuota, resetta
             this.selectedDate = null;
             const input = this.shadowRoot.querySelector('.input');
             if (input) input.value = '';
             this.removeAttribute('value');
             this.renderCalendar();
        }
    }
}

customElements.define('ds-datepicker', DSDatepicker);
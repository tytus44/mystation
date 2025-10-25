// ========================
// DROPDOWN COMPONENT
// ========================
class DSDropdown extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isOpen = false;
        this.selectedValue = null;
        this.selectedText = '';
        this._boundOutsideClickListener = this._handleOutsideClick.bind(this);
    }

    connectedCallback() {
        this._upgradeProperty('placeholder');
        this._upgradeProperty('disabled');

        this.render();
        this.setupEventListeners();
        this._initializeSelection(); // Imposta selezione iniziale se presente
    }

    disconnectedCallback() {
        document.removeEventListener('click', this._boundOutsideClickListener);
    }

     // Permette di impostare proprietà JS prima che connectedCallback venga chiamato
    _upgradeProperty(prop) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    render() {
        // Usa la proprietà interna _placeholder, che tiene conto del valore impostato via JS
        const placeholder = this._placeholder || this.getAttribute('placeholder') || 'Seleziona';
        const disabled = this.disabled || this.hasAttribute('disabled');
        // Mostra testo selezionato o placeholder
        const buttonText = this.selectedText || placeholder;

        this.shadowRoot.innerHTML = `
            <style>
                /* Incolla qui il contenuto di dropdown.css (prima parte) */
                 * { box-sizing: border-box; }
                :host { display: inline-block; width: 100%; }
                .wrapper { position: relative; width: 100%; }
                .button { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid var(--border-primary); border-radius: var(--radius-md); background-color: var(--bg-primary); color: var(--text-primary); font-family: 'Poppins', sans-serif; font-size: 1rem; cursor: pointer; transition: all var(--animation-duration-fast) var(--animation-timing); display: flex; align-items: center; justify-content: space-between; font-weight: 500; text-align: left; }
                .button .text { flex-grow: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } /* Gestisce testo lungo */
                .button:hover:not(:disabled) { border-color: var(--border-focus); background-color: var(--bg-tertiary); }
                .button:focus { outline: none; } /* Rimuoviamo outline standard */
                .button:focus-visible { /* Stile focus solo per navigazione da tastiera */ border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
                .button.open { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); } /* Stato aperto */
                .button:disabled { opacity: 0.5; cursor: not-allowed; }
                .arrow { display: inline-block; width: 5px; height: 5px; border-right: 2px solid currentColor; border-bottom: 2px solid currentColor; transform: rotate(45deg); transition: transform 0.3s ease; margin-left: 0.5rem; flex-shrink: 0; }
                .button.open .arrow { transform: rotate(-135deg); }
                .menu { position: absolute; top: calc(100% + 0.5rem); left: 0; right: 0; background-color: var(--bg-primary); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); z-index: 1000; display: none; opacity: 0; transform: translateY(-10px); transition: all var(--animation-duration-fast) var(--animation-timing); }
                .menu.open { display: block; opacity: 1; transform: translateY(0); }
                .menu-wrapper { max-height: 250px; overflow-y: auto; padding: 0.5rem 0; /* Aggiunto padding */ }
                .menu-wrapper::-webkit-scrollbar { width: 6px; }
                .menu-wrapper::-webkit-scrollbar-track { background: transparent; }
                .menu-wrapper::-webkit-scrollbar-thumb { background-color: var(--border-secondary); border-radius: 3px; }
                .menu-wrapper::-webkit-scrollbar-thumb:hover { background-color: var(--color-primary); }

                /* Stili per ds-option (saranno nello ::slotted context) */
                 ::slotted(ds-option) {
                     display: block; /* Assicura che occupi tutta la larghezza */
                 }
            </style>
            <div class="wrapper">
                <button class="button" type="button" aria-haspopup="listbox" ${disabled ? 'disabled aria-disabled="true"' : ''}>
                    <span class="text">${buttonText}</span>
                    <span class="arrow" aria-hidden="true"></span>
                </button>
                <div class="menu" role="listbox">
                    <div class="menu-wrapper">
                        <slot></slot> </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const button = this.shadowRoot.querySelector('.button');
        const menuWrapper = this.shadowRoot.querySelector('.menu-wrapper');

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        document.addEventListener('click', this._boundOutsideClickListener);

        // Ascolta eventi 'option-selected' che "risalgono" dallo slot
        menuWrapper.addEventListener('option-selected', (e) => {
            this.selectOption(e.detail.value, e.detail.text);
        });

        // Gestione tastiera per accessibilità
        this.addEventListener('keydown', this._handleKeyDown.bind(this));
    }

    _initializeSelection() {
        const selectedOption = this.querySelector('ds-option[selected]');
        if (selectedOption) {
            this.selectOption(selectedOption.getAttribute('value'), selectedOption.textContent, false);
        } else {
            // Se non c'è selezione, aggiorna il testo del bottone col placeholder
            this.updateButtonText();
        }
    }

    _handleOutsideClick(e) {
        if (!this.contains(e.target)) {
            this.close();
        }
    }

     _handleKeyDown(e) {
         if (this.disabled) return;

         switch (e.key) {
             case 'Enter':
             case ' ': // Space apre/chiude
                 e.preventDefault();
                 this.toggle();
                 break;
             case 'Escape':
                 if (this.isOpen) {
                     e.preventDefault();
                     this.close();
                     this.shadowRoot.querySelector('.button').focus(); // Rimetti focus sul bottone
                 }
                 break;
             case 'ArrowDown':
             case 'ArrowUp':
                 e.preventDefault();
                 if (!this.isOpen) {
                     this.open();
                 }
                 this._navigateOptions(e.key === 'ArrowDown' ? 1 : -1);
                 break;
         }
     }

     _navigateOptions(direction) {
         const options = Array.from(this.querySelectorAll('ds-option'));
         if (options.length === 0) return;

         const currentFocused = this.querySelector('ds-option[focused]');
         let currentIndex = -1;
         if (currentFocused) {
             currentIndex = options.indexOf(currentFocused);
             currentFocused.removeAttribute('focused'); // Rimuovi focus precedente
         }

         let nextIndex = (currentIndex + direction + options.length) % options.length;

         const nextOption = options[nextIndex];
         nextOption.setAttribute('focused', ''); // Aggiungi focus al nuovo
         nextOption.focus(); // Metti focus effettivo sull'elemento interno
     }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    open() {
        if (this.disabled) return;
        this.isOpen = true;
        const button = this.shadowRoot.querySelector('.button');
        const menu = this.shadowRoot.querySelector('.menu');
        button.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        menu.classList.add('open');
        this.dispatchEvent(new CustomEvent('open', { bubbles: true, composed: true }));

        // Focus sulla prima opzione o sulla selezionata
        const selected = this.querySelector('ds-option[selected]') || this.querySelector('ds-option');
        if (selected) {
             // Rimuovi focus da altre eventuali opzioni
             this.querySelectorAll('ds-option[focused]').forEach(opt => opt.removeAttribute('focused'));
             selected.setAttribute('focused', '');
             selected.focus(); // Metti focus effettivo
        }
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        const button = this.shadowRoot.querySelector('.button');
        const menu = this.shadowRoot.querySelector('.menu');
        button.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
        // Rimuovi focus dalle opzioni
        this.querySelectorAll('ds-option[focused]').forEach(opt => opt.removeAttribute('focused'));
        this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
    }

    selectOption(value, text, notify = true) {
        if (this.selectedValue !== value) {
            this.selectedValue = value;
            this.selectedText = text;

            // Aggiorna stato `selected` nelle ds-option
            this.querySelectorAll('ds-option').forEach(option => {
                if (option.getAttribute('value') === value) {
                    option.setAttribute('selected', '');
                    option.setAttribute('aria-selected', 'true');
                } else {
                    option.removeAttribute('selected');
                    option.setAttribute('aria-selected', 'false');
                }
            });

            this.updateButtonText(); // Aggiorna testo bottone

            if (notify) {
                const event = new CustomEvent('change', {
                    detail: { value, text },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(event);
            }
        }
        this.close(); // Chiudi sempre dopo la selezione
        this.shadowRoot.querySelector('.button').focus(); // Rimetti focus sul bottone
    }

    updateButtonText() {
        const buttonTextElement = this.shadowRoot.querySelector('.button .text');
        const placeholder = this._placeholder || this.getAttribute('placeholder') || 'Seleziona';
        if (buttonTextElement) {
            buttonTextElement.textContent = this.selectedText || placeholder;
            // Aggiungi classe se placeholder è visibile per eventuale styling
            buttonTextElement.classList.toggle('is-placeholder', !this.selectedText);
        }
    }

    // Getters/Setters per proprietà JS
    get value() {
        return this.selectedValue;
    }

    set value(newValue) {
        const option = this.querySelector(`ds-option[value="${newValue}"]`);
        if (option) {
            this.selectOption(newValue, option.textContent, false); // Imposta senza notificare
        } else {
            // Se il valore non esiste, resetta la selezione
            this.selectedValue = null;
            this.selectedText = '';
            this.querySelectorAll('ds-option[selected]').forEach(o => o.removeAttribute('selected'));
            this.updateButtonText();
            console.warn(`DSDropdown: Valore "${newValue}" non trovato tra le opzioni.`);
        }
    }

    get placeholder() {
        return this._placeholder || this.getAttribute('placeholder') || 'Seleziona';
    }

    set placeholder(newPlaceholder) {
        this._placeholder = newPlaceholder;
        this.updateButtonText(); // Aggiorna il testo se non c'è selezione
    }

     get disabled() {
        return this.hasAttribute('disabled');
    }

    set disabled(isDisabled) {
        const button = this.shadowRoot.querySelector('.button');
        if (isDisabled) {
            this.setAttribute('disabled', '');
            if (button) button.setAttribute('disabled', 'true');
            if (button) button.setAttribute('aria-disabled', 'true');
            this.close(); // Chiudi se aperto
        } else {
            this.removeAttribute('disabled');
            if (button) button.removeAttribute('disabled');
            if (button) button.removeAttribute('aria-disabled');
        }
    }
}

// ========================
// OPTION COMPONENT
// ========================
class DSOption extends HTMLElement {
    static observedAttributes = ['selected', 'disabled'];

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._internals = this.attachInternals(); // Per gestione focus
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.setAttribute('role', 'option');
        this.setAttribute('aria-selected', this.hasAttribute('selected') ? 'true' : 'false');
        if (!this.hasAttribute('tabindex')) {
             this.setAttribute('tabindex', '-1'); // Rende l'elemento non focalizzabile di default con Tab, ma programmaticamente
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'selected') {
            this.setAttribute('aria-selected', newValue !== null ? 'true' : 'false');
            this.render(); // Rirenderizza per applicare stile selected
        }
         if (name === 'disabled') {
             this.setAttribute('aria-disabled', newValue !== null ? 'true' : 'false');
             this.render();
         }
    }

    render() {
        const text = this.textContent;
        const selected = this.hasAttribute('selected');
        const disabled = this.hasAttribute('disabled');

        this.shadowRoot.innerHTML = `
            <style>
                /* Incolla qui il contenuto di dropdown.css (seconda parte - :host, button) */
                :host { display: block; }
                button { width: 100%; padding: 0.75rem 1rem; cursor: pointer; transition: all var(--animation-duration-fast) var(--animation-timing); border: none; background-color: transparent; font-family: 'Poppins', sans-serif; font-size: 1rem; color: var(--text-primary); text-align: left; font-weight: 500; }
                button:hover:not(:disabled) { background-color: var(--bg-tertiary); color: var(--color-primary); }
                button:focus { outline: none; } /* Rimosso outline standard */
                :host([focused]) button { /* Stile quando navigato con tastiera */ background-color: var(--bg-tertiary); color: var(--color-primary); }
                :host([selected]) button { background-color: rgba(37, 99, 235, 0.1); color: var(--color-primary); font-weight: 700; }
                button:disabled { color: var(--text-tertiary); cursor: not-allowed; opacity: 0.6; }
                button:disabled:hover { background-color: transparent; }
            </style>
            <button type="button" ${disabled ? 'disabled' : ''}>${text}</button>
        `;
    }

    setupEventListeners() {
        const button = this.shadowRoot.querySelector('button');

        // Click sull'opzione
        button.addEventListener('click', (e) => {
             e.stopPropagation(); // Impedisce che il click risalga al document
             if (this.hasAttribute('disabled')) return;
             // Emetti un evento personalizzato che il dropdown può catturare
             this.dispatchEvent(new CustomEvent('option-selected', {
                 detail: {
                     value: this.getAttribute('value'),
                     text: this.textContent
                 },
                 bubbles: true, // Permette all'evento di risalire
                 composed: true // Permette all'evento di attraversare lo Shadow DOM boundary
             }));
        });

         // Gestione focus per accessibilità da tastiera
        this.addEventListener('focus', () => {
             // Quando l'elemento custom ds-option prende focus, mettilo sul bottone interno
             button.focus({ preventScroll: true }); // preventScroll è utile in liste lunghe
        });

         // Quando il bottone interno prende focus, assicurati che l'host abbia l'attributo 'focused'
        button.addEventListener('focus', () => {
             this.closest('ds-dropdown')?.querySelectorAll('ds-option[focused]').forEach(opt => opt.removeAttribute('focused'));
             this.setAttribute('focused', '');
        });

         // Gestione Enter/Space sull'opzione focalizzata
        button.addEventListener('keydown', (e) => {
             if (e.key === 'Enter' || e.key === ' ') {
                 e.preventDefault();
                 e.stopPropagation();
                 if (this.hasAttribute('disabled')) return;
                 this.dispatchEvent(new CustomEvent('option-selected', {
                     detail: { value: this.getAttribute('value'), text: this.textContent },
                     bubbles: true, composed: true
                 }));
             }
        });
    }

     // Metodo focus personalizzato per delegare al bottone interno
    focus(options) {
        const button = this.shadowRoot.querySelector('button');
        if (button) {
             button.focus(options);
        }
    }
}

// Registra i componenti
customElements.define('ds-dropdown', DSDropdown);
customElements.define('ds-option', DSOption);
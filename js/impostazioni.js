/* ==========================================================================
   MODULO: Impostazioni (js/impostazioni.js) - Logica PIN a 4 cifre
   ========================================================================== */
(function() {
    'use strict';

    const SettingsModule = {
        init() { },

        render() {
            const container = document.getElementById('impostazioni-container');
            if (!container) return;

            if (!document.getElementById('impostazioni-layout')) {
                container.innerHTML = this.getLayoutHTML();
                lucide.createIcons();
                this.attachListeners();
            }
            // Ripristina e inizializza Drag & Drop
            this.restoreLayout();
            this.initDragAndDrop();

            this.updateThemeUI(localStorage.getItem('color-theme') || 'light');
            this.updatePinUI(); // Aggiorna l'UI del PIN
        },

        initDragAndDrop() {
            const save = () => this.saveLayout();
            ['settings-col-1', 'settings-col-2'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    new Sortable(el, {
                        group: 'shared-settings', // Permette lo scambio tra colonne
                        animation: 150,
                        ghostClass: 'sortable-ghost',
                        handle: '.card-header', // Trascina dall'intestazione
                        onSort: save
                    });
                }
            });
        },

        saveLayout() {
            const getIds = (cid) => Array.from(document.getElementById(cid)?.children || []).map(el => el.id).filter(id => id);
            const layout = {
                col1: getIds('settings-col-1'),
                col2: getIds('settings-col-2')
            };
            localStorage.setItem('mystation_settings_layout', JSON.stringify(layout));
        },

        restoreLayout() {
            const saved = localStorage.getItem('mystation_settings_layout');
            if (!saved) return;
            try {
                const layout = JSON.parse(saved);
                const restore = (cid, ids) => {
                    const container = document.getElementById(cid);
                    if (!container || !ids) return;
                    ids.forEach(id => {
                        const el = document.getElementById(id);
                        if (el) container.appendChild(el);
                    });
                };
                restore('settings-col-1', layout.col1);
                restore('settings-col-2', layout.col2);
            } catch (e) { console.error("Errore ripristino layout impostazioni:", e); }
        },

        updateThemeUI(activeTheme) {
            // Rimuovi la classe 'attiva' (bordo) da tutti i pulsanti
            document.querySelectorAll('.theme-swatch').forEach(el => {
                el.classList.remove('ring-2');
                el.style.borderColor = ''; // Resetta il colore del bordo
            });

            // Aggiungi la classe 'attiva' solo a quello selezionato
            let themeToSelect = activeTheme || 'light';
            const activeEl = document.querySelector(`.theme-swatch[data-theme="${themeToSelect}"]`);
            if (activeEl) {
                activeEl.classList.add('ring-2');
                // Applica il colore del bordo in base al tema per forzare la visibilità
                let ringColor = '#3b82f6'; // Default (primary-500)
                if (themeToSelect === 'notte') ringColor = '#60a5fa';
                if (themeToSelect === 'indigo') ringColor = '#3f51b5';
                if (themeToSelect === 'pink') ringColor = '#e91e63';
                if (themeToSelect === 'cyan') ringColor = '#00bcd4';
                if (themeToSelect === 'yellow') ringColor = '#fdd835';
                if (themeToSelect === 'dark') ringColor = '#60a5fa'; 
                
                activeEl.style.borderColor = ringColor;
            }
        },

        // --- FUNZIONI PIN MODIFICATE ---
        
        /**
         * Aggiorna il testo del pulsante PIN (Imposta/Rimuovi)
         */
        updatePinUI() {
            const pinStatus = document.getElementById('pin-status');
            const currentPinWrapper = document.getElementById('pin-current-wrapper');
            if (!pinStatus || !currentPinWrapper) return;
            
            if (App.state.pin) {
                pinStatus.textContent = "PIN impostato. Inserisci il PIN attuale per modificarlo o rimuoverlo.";
                pinStatus.className = "text-sm text-green-600 dark:text-green-400";
                currentPinWrapper.classList.remove('hidden'); // Mostra campo PIN attuale
            } else {
                pinStatus.textContent = "Nessun PIN impostato. L'app è sbloccata all'avvio. Compila i campi per crearne uno.";
                pinStatus.className = "text-sm text-gray-500 dark:text-gray-400";
                currentPinWrapper.classList.add('hidden'); // Nasconde campo PIN attuale
            }
        },
        
        /**
         * Legge i 4 campi input di un gruppo e restituisce il PIN
         */
        getPinFromInputs(groupName) {
            const inputs = document.querySelectorAll(`[data-pin-group="${groupName}"] .pin-input`);
            let pin = '';
            inputs.forEach(input => pin += input.value);
            return pin;
        },

        /**
         * Pulisce i campi input di un gruppo
         */
        clearPinInputs(groupName) {
            document.querySelectorAll(`[data-pin-group="${groupName}"] .pin-input`).forEach(input => {
                input.value = '';
            });
        },

        /**
         * Salva il nuovo PIN dopo aver verificato quello attuale
         */
        savePin() {
            const currentPin = this.getPinFromInputs('current');
            const newPin = this.getPinFromInputs('new');
            const confirmPin = this.getPinFromInputs('confirm');

            // 1. Verifica PIN attuale (se esiste)
            if (App.state.pin && App.state.pin !== currentPin) {
                App.showToast('PIN attuale non corretto.', 'error');
                return;
            }

            // 2. Caso Rimozione PIN
            if (!newPin && !confirmPin) {
                App.setPin(null); // Passa null per rimuovere
                this.updatePinUI();
                this.clearPinInputs('current');
                return;
            }

            // 3. Verifica corrispondenza
            if (newPin !== confirmPin) {
                App.showToast('I nuovi PIN non corrispondono.', 'error');
                return;
            }
            
            // 4. VALIDAZIONE: Esattamente 4 cifre numeriche
            const isNumeric = /^\d{4}$/.test(newPin); // Regex per 4 cifre esatte
            
            if (!isNumeric) {
                 App.showToast('Il PIN deve essere di 4 cifre numeriche.', 'error');
                 return;
            }

            // 5. Successo (Impostazione o Modifica)
            App.setPin(newPin);
            this.clearPinInputs('current');
            this.clearPinInputs('new');
            this.clearPinInputs('confirm');
            this.updatePinUI();
        },
        
        /**
         * Chiede conferma per il Logout
         */
        confirmLogout() {
             App.showModal(
                'Esci dall\'account', 
                `<p class="text-gray-500 dark:text-gray-400">Vuoi davvero uscire? L'applicazione verrà bloccata e sarà necessario inserire il PIN per il prossimo accesso.</p>`, 
                // CORREZIONE: Aggiunto 'gap-4' al div wrapper
                `<div class="flex justify-end gap-4 w-full">
                     <button onclick="App.closeModal()" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Annulla</button>
                     <button id="btn-confirm-logout" class="py-2.5 px-5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800">Sì, esci</button>
                 </div>`,
                'max-w-md'
             );
             
             document.getElementById('btn-confirm-logout').onclick = () => {
                 App.closeModal();
                 App.lockApp();
             };
        },
        
        // --- FINE FUNZIONI PIN ---

        getLayoutHTML() {
            const pinInputHTML = `
                <input type="password" inputmode="numeric" maxlength="1" class="pin-square-small pin-input bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <input type="password" inputmode="numeric" maxlength="1" class="pin-square-small pin-input bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <input type="password" inputmode="numeric" maxlength="1" class="pin-square-small pin-input bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <input type="password" inputmode="numeric" maxlength="1" class="pin-square-small pin-input bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            `;
            
            return `
                <div id="impostazioni-layout" class="flex flex-col gap-6 animate-fade-in">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Impostazioni</h2>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        <div id="settings-col-1" class="flex flex-col gap-6 h-full">
                            
                            <div id="card-theme" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card">
                                <div class="flex items-center mb-4 card-header cursor-move">
                                    <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mr-3">
                                        <i data-lucide="palette" class="w-6 h-6 text-yellow-600 dark:text-yellow-500"></i>
                                    </div>
                                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Seleziona Tema</h3>
                                </div>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Scegli l'aspetto dell'interfaccia.</p>
                                
                                <div class="flex flex-wrap gap-4">
                                    
                                    <button id="btn-theme-light" class="text-gray-900 dark:text-gray-400 hover:text-primary-700 dark:hover:text-white group focus:outline-none">
                                        <div data-theme="light" class="theme-swatch w-16 h-10 rounded-lg flex overflow-hidden border-2 border-gray-300 dark:border-gray-600 group-hover:border-primary-500 dark:group-hover:border-primary-400 transition-all">
                                            <div class="w-1/2 h-full bg-gray-200"></div>
                                            <div class="w-1/2 h-full" style="background-color: #2563eb;"></div>
                                        </div>
                                        <span class="text-sm font-medium mt-2 block text-center">Chiaro</span>
                                    </button>
                                    
                                    <button id="btn-theme-dark" class="text-gray-900 dark:text-gray-400 hover:text-primary-700 dark:hover:text-white group focus:outline-none">
                                        <div data-theme="dark" class="theme-swatch w-16 h-10 rounded-lg flex overflow-hidden border-2 border-gray-300 dark:border-gray-600 group-hover:border-primary-500 dark:group-hover:border-primary-400 transition-all">
                                            <div class="w-1/2 h-full bg-gray-700"></div>
                                            <div class="w-1/2 h-full" style="background-color: #2563eb;"></div>
                                        </div>
                                        <span class="text-sm font-medium mt-2 block text-center">Scuro</span>
                                    </button>
                                    
                                    <button id="btn-theme-notte" class="text-gray-900 dark:text-gray-400 hover:text-primary-700 dark:hover:text-white group focus:outline-none">
                                        <div data-theme="notte" class="theme-swatch w-16 h-10 rounded-lg flex overflow-hidden border-2 border-gray-300 dark:border-gray-600 group-hover:border-primary-500 dark:group-hover:border-primary-400 transition-all">
                                            <div class="w-1/2 h-full" style="background-color: #1e1e1e;"></div>
                                            <div class="w-1/2 h-full" style="background-color: #9ca3af;"></div>
                                        </div>
                                        <span class="text-sm font-medium mt-2 block text-center">Night</span>
                                    </button>
                                    
                                    <button id="btn-theme-indigo" class="text-gray-900 dark:text-gray-400 hover:text-primary-700 dark:hover:text-white group focus:outline-none">
                                        <div data-theme="indigo" class="theme-swatch w-16 h-10 rounded-lg flex overflow-hidden border-2 border-gray-300 dark:border-gray-600 group-hover:border-primary-500 dark:group-hover:border-primary-400 transition-all">
                                            <div class="w-1/2 h-full" style="background-color: #c5cae9;"></div>
                                            <div class="w-1/2 h-full" style="background-color: #3f51b5;"></div>
                                        </div>
                                        <span class="text-sm font-medium mt-2 block text-center">Indigo</span>
                                    </button>

                                    <button id="btn-theme-pink" class="text-gray-900 dark:text-gray-400 hover:text-primary-700 dark:hover:text-white group focus:outline-none">
                                        <div data-theme="pink" class="theme-swatch w-16 h-10 rounded-lg flex overflow-hidden border-2 border-gray-300 dark:border-gray-600 group-hover:border-primary-500 dark:group-hover:border-primary-400 transition-all">
                                            <div class="w-1/2 h-full" style="background-color: #f8bbd0;"></div>
                                            <div class="w-1/2 h-full" style="background-color: #e91e63;"></div>
                                        </div>
                                        <span class="text-sm font-medium mt-2 block text-center">Pink</span>
                                    </button>

                                    <button id="btn-theme-cyan" class="text-gray-900 dark:text-gray-400 hover:text-primary-700 dark:hover:text-white group focus:outline-none">
                                        <div data-theme="cyan" class="theme-swatch w-16 h-10 rounded-lg flex overflow-hidden border-2 border-gray-300 dark:border-gray-600 group-hover:border-primary-500 dark:group-hover:border-primary-400 transition-all">
                                            <div class="w-1/2 h-full" style="background-color: #b2ebf2;"></div>
                                            <div class="w-1/2 h-full" style="background-color: #00bcd4;"></div>
                                        </div>
                                        <span class="text-sm font-medium mt-2 block text-center">Cyan</span>
                                    </button>

                                    <button id="btn-theme-yellow" class="text-gray-900 dark:text-gray-400 hover:text-primary-700 dark:hover:text-white group focus:outline-none">
                                        <div data-theme="yellow" class="theme-swatch w-16 h-10 rounded-lg flex overflow-hidden border-2 border-gray-300 dark:border-gray-600 group-hover:border-primary-500 dark:group-hover:border-primary-400 transition-all">
                                            <div class="w-1/2 h-full" style="background-color: #fff9c4;"></div>
                                            <div class="w-1/2 h-full" style="background-color: #fdd835;"></div>
                                        </div>
                                        <span class="text-sm font-medium mt-2 block text-center">Yellow</span>
                                    </button>
                                    
                                </div>
                            </div>
                            
                            <div id="card-pin" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card">
                                <div class="flex items-center mb-4 card-header cursor-move">
                                    <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-3">
                                        <i data-lucide="lock" class="w-6 h-6 text-blue-600 dark:text-blue-500"></i>
                                    </div>
                                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Sicurezza e PIN</h3>
                                </div>
                                <p id="pin-status" class="text-sm text-gray-500 dark:text-gray-400 mb-6">Caricamento stato PIN...</p>
                                
                                <div id="pin-current-wrapper" class="mb-4 hidden">
                                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">PIN Attuale (4 cifre)</label>
                                    <div class="flex items-center gap-2">
                                        <div class="flex gap-2" data-pin-group="current">
                                            ${pinInputHTML}
                                        </div>
                                        <button type="button" class="btn-toggle-pin p-2 text-gray-500 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" data-target="current">
                                            <i data-lucide="eye" class="w-5 h-5"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="grid grid-cols-1 gap-4">
                                    <div>
                                        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nuovo PIN (4 cifre)</label>
                                        <div class="flex items-center gap-2">
                                            <div class="flex gap-2" data-pin-group="new">
                                                ${pinInputHTML}
                                            </div>
                                            <button type="button" class="btn-toggle-pin p-2 text-gray-500 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" data-target="new">
                                                <i data-lucide="eye" class="w-5 h-5"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Conferma PIN</label>
                                        <div class="flex items-center gap-2">
                                            <div class="flex gap-2" data-pin-group="confirm">
                                                ${pinInputHTML}
                                            </div>
                                            <button type="button" class="btn-toggle-pin p-2 text-gray-500 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" data-target="confirm">
                                                <i data-lucide="eye" class="w-5 h-5"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex flex-wrap gap-4 mt-5">
                                    <button id="btn-save-pin" class="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                        Salva PIN
                                    </button>
                                    <button id="btn-logout" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex items-center" title="Blocca applicazione">
                                        <i data-lucide="log-out" class="w-4 h-4 sm:mr-2"></i>
                                        <span class="hidden sm:inline">Esci</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div id="card-backup" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card">
                                <div class="flex items-center mb-4 card-header cursor-move">
                                    <div class="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mr-3">
                                        <i data-lucide="database" class="w-6 h-6 text-primary-600 dark:text-primary-500"></i>
                                    </div>
                                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Backup e Ripristino</h3>
                                </div>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Esporta i tuoi dati per sicurezza o importali su un altro dispositivo.</p>
                                <div class="flex flex-wrap gap-4">
                                    <button id="btn-settings-export" class="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" title="Esporta Backup">
                                        <i data-lucide="download" class="w-4 h-4 sm:mr-2"></i>
                                        <span class="hidden sm:inline">Esporta Backup</span>
                                    </button>
                                    <button id="btn-settings-import" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex items-center" title="Importa Backup">
                                        <i data-lucide="upload" class="w-4 h-4 sm:mr-2"></i>
                                        <span class="hidden sm:inline">Importa Backup</span>
                                    </button>
                                </div>
                            </div>

                        </div>

                        <div id="settings-col-2" class="flex flex-col gap-6 h-full">
                            
                            <div id="card-forms" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card">
                                <div class="flex items-center mb-4 card-header cursor-move">
                                    <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mr-3">
                                        <i data-lucide="file-text" class="w-6 h-6 text-green-600 dark:text-green-500"></i>
                                    </div>
                                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Modulistica Giornaliera</h3>
                                </div>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Stampa i fogli per la gestione manuale dei turni.</p>
                                <div class="flex flex-wrap gap-4">
                                    <a href="pdf/inizio.pdf" target="_blank" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex items-center no-underline" title="Foglio Inizio Giornata">
                                        <i data-lucide="sun" class="w-4 h-4 sm:mr-2"></i>
                                        <span class="hidden sm:inline">Inizio Giornata</span>
                                    </a>
                                    <a href="pdf/fine.pdf" target="_blank" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex items-center no-underline" title="Foglio Fine Giornata">
                                        <i data-lucide="moon" class="w-4 h-4 sm:mr-2"></i>
                                        <span class="hidden sm:inline">Fine Giornata</span>
                                    </a>
                                </div>
                            </div>
                            
                            <div id="card-danger" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card">
                                <div class="flex items-center mb-4 card-header cursor-move">
                                    <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-full mr-3">
                                        <i data-lucide="alert-triangle" class="w-6 h-6 text-red-600 dark:text-red-500"></i>
                                    </div>
                                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Zona Pericolo</h3>
                                </div>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    L'azione in questa sezione è <strong>irreversibile</strong>. Assicurati di avere un backup dei tuoi dati prima di procedere.
                                </p>
                                <div class="flex flex-wrap gap-4">
                                    <button id="btn-clear-data" class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 flex items-center" title="Elimina TUTTI i dati">
                                        <i data-lucide="trash-2" class="w-4 h-4 sm:mr-2"></i>
                                        <span class="hidden sm:inline">Elimina Dati</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        },

        confirmClearData() {
            const html = `
                <div class="text-center p-6 flex flex-col items-center">
                    <i data-lucide="alert-circle" class="w-16 h-16 text-red-600 mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Sei assolutamente sicuro?</h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-6">
                        Questa azione eliminerà <b>TUTTI</b> i dati salvati nel browser (prezzi, registri, anagrafiche, spese, turni).<br>
                        Questa azione <b>NON</b> eliminerà il tuo PIN.
                    </p>
                </div>`;
            const footer = `
                <div class="flex justify-center gap-4 w-full">
                    <button onclick="App.closeModal()" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Annulla</button>
                    <button id="btn-confirm-clear" class="py-2.5 px-5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800">Sì, elimina dati</button>
                </div>`;
            
            App.showModal('', html, footer, 'max-w-md');
            document.getElementById('btn-confirm-clear').onclick = () => App.clearData();
        },

        /**
         * Helper per la logica di auto-avanzamento dei campi PIN
         */
        setupPinInputs(groupName) {
            const inputs = document.querySelectorAll(`[data-pin-group="${groupName}"] .pin-input`);
            
            inputs.forEach((input, index) => {
                input.oninput = () => {
                    input.value = input.value.replace(/[^0-9]/g, '');
                };
                
                input.onkeydown = (e) => {
                    if (e.key >= '0' && e.key <= '9' && input.value.length === 0) {
                        e.preventDefault();
                        input.value = e.key;
                        if (index < inputs.length - 1) {
                            inputs[index + 1].focus();
                        }
                    } else if (e.key === 'Backspace') {
                        e.preventDefault();
                        input.value = '';
                        if (index > 0) {
                            inputs[index - 1].focus();
                        }
                    } else if (e.key.includes('Arrow')) {
                        e.preventDefault();
                        if (e.key === 'ArrowRight' && index < inputs.length - 1) {
                            inputs[index + 1].focus();
                        } else if (e.key === 'ArrowLeft' && index > 0) {
                            inputs[index - 1].focus();
                        }
                    } else if (e.key.length === 1 && input.value.length > 0) {
                        e.preventDefault();
                        input.value = e.key;
                        if (index < inputs.length - 1) {
                            inputs[index + 1].focus();
                        }
                    } else if (e.key !== 'Tab' && e.key.length === 1) {
                        e.preventDefault();
                    }
                };
            });
        },

        /**
         * Helper per mostrare/nascondere il PIN
         */
        togglePinVisibility(targetGroup) {
            const inputs = document.querySelectorAll(`[data-pin-group="${targetGroup}"] .pin-input`);
            const icon = document.querySelector(`.btn-toggle-pin[data-target="${targetGroup}"] i`);
            
            inputs.forEach(input => {
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.setAttribute('data-lucide', 'eye-off');
                } else {
                    input.type = 'password';
                    icon.setAttribute('data-lucide', 'eye');
                }
            });
            lucide.createIcons();
        },

        attachListeners() {
            document.getElementById('btn-settings-export').onclick = () => {
                App.exportData();
                App.showToast('Backup esportato con successo!', 'success');
            };
            
            document.getElementById('btn-settings-import').onclick = () => document.getElementById('import-file-input').click();
            document.getElementById('btn-clear-data').onclick = () => this.confirmClearData();

            // --- NUOVI LISTENER PER PIN E LOGOUT ---
            document.getElementById('btn-save-pin').onclick = () => this.savePin();
            document.getElementById('btn-logout').onclick = () => this.confirmLogout();
            
            // Setup logica input PIN
            this.setupPinInputs('current');
            this.setupPinInputs('new');
            this.setupPinInputs('confirm');
            
            // Setup bottoni "occhio"
            document.querySelectorAll('.btn-toggle-pin').forEach(btn => {
                btn.onclick = () => this.togglePinVisibility(btn.dataset.target);
            });
            
            // Listeners per i temi (AGGIORNATI)
            document.getElementById('btn-theme-light').onclick = () => App.setTheme('light');
            document.getElementById('btn-theme-dark').onclick = () => App.setTheme('dark');
            document.getElementById('btn-theme-notte').onclick = () => App.setTheme('notte');
            document.getElementById('btn-theme-indigo').onclick = () => App.setTheme('indigo');
            document.getElementById('btn-theme-pink').onclick = () => App.setTheme('pink');
            document.getElementById('btn-theme-cyan').onclick = () => App.setTheme('cyan');
            document.getElementById('btn-theme-yellow').onclick = () => App.setTheme('yellow');
        }
    };

    if(window.App) App.registerModule('impostazioni', SettingsModule); 
    else document.addEventListener('app:ready', () => App.registerModule('impostazioni', SettingsModule));
})();
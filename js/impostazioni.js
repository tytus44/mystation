/* ==========================================================================
   MODULO: Impostazioni (js/impostazioni.js) - EOS Clean Layout
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
                        group: 'shared-settings',
                        animation: 150,
                        ghostClass: 'sortable-ghost',
                        handle: '.card-header',
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
            // Rimuovi bordi attivi precedenti
            document.querySelectorAll('.theme-card').forEach(el => {
                el.classList.remove('ring-2', 'ring-primary-500', 'border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20');
                el.classList.add('border-gray-200', 'dark:border-gray-700');
            });

            let themeToSelect = activeTheme === 'dark' ? 'dark' : 'light';
            const activeBtn = document.getElementById(`btn-theme-${themeToSelect}`);
            
            if (activeBtn) {
                const card = activeBtn.closest('.theme-card');
                if(card) {
                    card.classList.remove('border-gray-200', 'dark:border-gray-700');
                    card.classList.add('ring-2', 'ring-primary-500', 'border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20');
                }
            }
        },

        // --- FUNZIONI PIN ---
        
        updatePinUI() {
            const pinStatus = document.getElementById('pin-status');
            const currentPinWrapper = document.getElementById('pin-current-wrapper');
            if (!pinStatus || !currentPinWrapper) return;
            
            if (App.state.pin) {
                pinStatus.innerHTML = `<div class="flex items-center text-green-600 dark:text-green-400 font-medium"><i data-lucide="check-circle" class="w-4 h-4 mr-2"></i> PIN attivo</div><div class="text-sm text-gray-500 mt-1">Inserisci il PIN attuale per modificarlo.</div>`;
                currentPinWrapper.classList.remove('hidden'); 
            } else {
                pinStatus.innerHTML = `<div class="flex items-center text-gray-500 dark:text-gray-400"><i data-lucide="unlock" class="w-4 h-4 mr-2"></i> Nessun PIN impostato</div><div class="text-sm text-gray-500 mt-1">L'app è sbloccata. Crea un PIN per proteggerla.</div>`;
                currentPinWrapper.classList.add('hidden');
            }
            lucide.createIcons();
        },
        
        getPinFromInputs(groupName) {
            const inputs = document.querySelectorAll(`[data-pin-group="${groupName}"] .pin-input`);
            let pin = '';
            inputs.forEach(input => pin += input.value);
            return pin;
        },

        clearPinInputs(groupName) {
            document.querySelectorAll(`[data-pin-group="${groupName}"] .pin-input`).forEach(input => {
                input.value = '';
            });
        },

        savePin() {
            const currentPin = this.getPinFromInputs('current');
            const newPin = this.getPinFromInputs('new');
            const confirmPin = this.getPinFromInputs('confirm');

            if (App.state.pin && App.state.pin !== currentPin) {
                App.showToast('PIN attuale non corretto.', 'error');
                return;
            }

            if (!newPin && !confirmPin) {
                App.setPin(null); 
                this.updatePinUI();
                this.clearPinInputs('current');
                return;
            }

            if (newPin !== confirmPin) {
                App.showToast('I nuovi PIN non corrispondono.', 'error');
                return;
            }
            
            const isNumeric = /^\d{4}$/.test(newPin);
            
            if (!isNumeric) {
                 App.showToast('Il PIN deve essere di 4 cifre numeriche.', 'error');
                 return;
            }

            App.setPin(newPin);
            this.clearPinInputs('current');
            this.clearPinInputs('new');
            this.clearPinInputs('confirm');
            this.updatePinUI();
        },
        
        confirmLogout() {
             App.showModal(
                'Esci dall\'account', 
                `<p class="text-gray-500 dark:text-gray-400">Vuoi davvero uscire? L'applicazione verrà bloccata e sarà necessario inserire il PIN per il prossimo accesso.</p>`, 
                `<div class="flex justify-end gap-3 w-full">
                     <button onclick="App.closeModal()" class="py-2.5 px-5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Annulla</button>
                     <button id="btn-confirm-logout" class="py-2.5 px-5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-md shadow-red-600/20">Sì, esci</button>
                 </div>`,
                'max-w-md'
             );
             
             document.getElementById('btn-confirm-logout').onclick = () => {
                 App.closeModal();
                 App.lockApp();
             };
        },

        getLayoutHTML() {
            const pinInputHTML = `
                <input type="password" inputmode="numeric" maxlength="1" class="pin-square-small pin-input bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all">
                <input type="password" inputmode="numeric" maxlength="1" class="pin-square-small pin-input bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all">
                <input type="password" inputmode="numeric" maxlength="1" class="pin-square-small pin-input bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all">
                <input type="password" inputmode="numeric" maxlength="1" class="pin-square-small pin-input bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all">
            `;
            
            return `
                <div id="impostazioni-layout" class="flex flex-col gap-8 animate-fade-in pb-10">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Impostazioni</h2>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div id="settings-col-1" class="flex flex-col gap-8 h-full">
                            
                            <div id="card-theme" class="bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                <div class="flex items-center px-6 py-5 border-b border-gray-100 dark:border-gray-700 card-header cursor-move">
                                    <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mr-4 text-primary-600 dark:text-primary-400">
                                        <i data-lucide="palette" class="w-5 h-5"></i>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Aspetto</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Personalizza l'interfaccia</p>
                                    </div>
                                </div>
                                
                                <div class="p-6 grid grid-cols-2 gap-4">
                                    <button id="btn-theme-light" class="theme-card group relative flex flex-col items-center p-4 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                                        <div class="w-full aspect-video bg-gray-100 rounded-lg mb-3 border border-gray-200 overflow-hidden flex flex-col shadow-sm">
                                             <div class="h-3 bg-white border-b border-gray-200 w-full"></div>
                                             <div class="flex flex-1">
                                                <div class="w-1/4 bg-gray-50 border-r border-gray-200 h-full"></div>
                                                <div class="flex-1 bg-white h-full"></div>
                                             </div>
                                        </div>
                                        <span class="font-medium text-gray-900 dark:text-white">Modalità Chiara</span>
                                    </button>
                                    
                                    <button id="btn-theme-dark" class="theme-card group relative flex flex-col items-center p-4 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                                        <div class="w-full aspect-video bg-gray-800 rounded-lg mb-3 border border-gray-700 overflow-hidden flex flex-col shadow-sm">
                                             <div class="h-3 bg-gray-900 border-b border-gray-700 w-full"></div>
                                             <div class="flex flex-1">
                                                <div class="w-1/4 bg-gray-800 border-r border-gray-700 h-full"></div>
                                                <div class="flex-1 bg-gray-900 h-full"></div>
                                             </div>
                                        </div>
                                        <span class="font-medium text-gray-900 dark:text-white">Modalità Scura</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div id="card-pin" class="bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                <div class="flex items-center px-6 py-5 border-b border-gray-100 dark:border-gray-700 card-header cursor-move">
                                    <div class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg mr-4 text-purple-600 dark:text-purple-400">
                                        <i data-lucide="shield-check" class="w-5 h-5"></i>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Sicurezza</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Gestione accesso e PIN</p>
                                    </div>
                                </div>
                                
                                <div class="p-6 space-y-6">
                                    <div id="pin-status" class="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                                        </div>
                                    
                                    <div id="pin-current-wrapper" class="hidden">
                                        <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">PIN Attuale</label>
                                        <div class="flex items-center gap-3">
                                            <div class="flex gap-2" data-pin-group="current">
                                                ${pinInputHTML}
                                            </div>
                                            <button type="button" class="btn-toggle-pin p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition-colors" data-target="current">
                                                <i data-lucide="eye" class="w-5 h-5"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="grid grid-cols-1 gap-6">
                                        <div>
                                            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nuovo PIN (4 cifre)</label>
                                            <div class="flex items-center gap-3">
                                                <div class="flex gap-2" data-pin-group="new">
                                                    ${pinInputHTML}
                                                </div>
                                                <button type="button" class="btn-toggle-pin p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition-colors" data-target="new">
                                                    <i data-lucide="eye" class="w-5 h-5"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Conferma PIN</label>
                                            <div class="flex items-center gap-3">
                                                <div class="flex gap-2" data-pin-group="confirm">
                                                    ${pinInputHTML}
                                                </div>
                                                <button type="button" class="btn-toggle-pin p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition-colors" data-target="confirm">
                                                    <i data-lucide="eye" class="w-5 h-5"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="flex flex-wrap gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <button id="btn-save-pin" class="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-100 font-semibold rounded-lg text-sm px-5 py-2.5 flex items-center shadow-lg shadow-primary-600/20 transition-all">
                                            Salva PIN
                                        </button>
                                        <button id="btn-logout" class="ml-auto py-2.5 px-5 text-sm font-medium text-red-600 bg-red-50 rounded-lg border border-transparent hover:bg-red-100 focus:z-10 focus:ring-4 focus:ring-red-50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 flex items-center transition-all" title="Blocca applicazione">
                                            <i data-lucide="log-out" class="w-4 h-4 sm:mr-2"></i>
                                            <span class="hidden sm:inline">Esci</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="settings-col-2" class="flex flex-col gap-8 h-full">
                            
                            <div id="card-backup" class="bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                <div class="flex items-center px-6 py-5 border-b border-gray-100 dark:border-gray-700 card-header cursor-move">
                                    <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg mr-4 text-green-600 dark:text-green-400">
                                        <i data-lucide="database" class="w-5 h-5"></i>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Dati e Backup</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Esporta o importa i tuoi dati</p>
                                    </div>
                                </div>
                                <div class="p-6 flex flex-wrap gap-4">
                                    <button id="btn-settings-export" class="flex-1 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-3 flex items-center justify-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition-all">
                                        <i data-lucide="download" class="w-4 h-4 mr-2 text-gray-500"></i>
                                        Esporta Backup
                                    </button>
                                    <button id="btn-settings-import" class="flex-1 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-3 flex items-center justify-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition-all">
                                        <i data-lucide="upload" class="w-4 h-4 mr-2 text-gray-500"></i>
                                        Importa Backup
                                    </button>
                                </div>
                            </div>
                            
                            <div id="card-forms" class="bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                <div class="flex items-center px-6 py-5 border-b border-gray-100 dark:border-gray-700 card-header cursor-move">
                                    <div class="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg mr-4 text-orange-600 dark:text-orange-400">
                                        <i data-lucide="file-text" class="w-5 h-5"></i>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Modulistica</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Download fogli cartacei</p>
                                    </div>
                                </div>
                                <div class="p-6 flex flex-wrap gap-4">
                                    <a href="pdf/inizio.pdf" target="_blank" class="flex-1 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-3 flex items-center justify-center no-underline dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition-all">
                                        <i data-lucide="sun" class="w-4 h-4 mr-2 text-orange-500"></i>
                                        Inizio Giornata
                                    </a>
                                    <a href="pdf/fine.pdf" target="_blank" class="flex-1 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-3 flex items-center justify-center no-underline dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition-all">
                                        <i data-lucide="moon" class="w-4 h-4 mr-2 text-blue-500"></i>
                                        Fine Giornata
                                    </a>
                                </div>
                            </div>
                            
                            <div id="card-danger" class="bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                <div class="flex items-center px-6 py-5 border-b border-gray-100 dark:border-gray-700 card-header cursor-move">
                                    <div class="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg mr-4 text-red-600 dark:text-red-400">
                                        <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Zona Pericolo</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Reset totale applicazione</p>
                                    </div>
                                </div>
                                <div class="p-6">
                                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                                        L'azione è <strong>irreversibile</strong>. Elimina tutti i dati salvati nel browser (prezzi, anagrafica, ecc.).
                                    </p>
                                    <button id="btn-clear-data" class="w-full text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 focus:ring-4 focus:ring-red-100 font-medium rounded-lg text-sm px-5 py-3 flex items-center justify-center dark:bg-red-900/20 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900/30 transition-all">
                                        <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i>
                                        Elimina Tutti i Dati
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
                    <div class="p-4 bg-red-50 rounded-full mb-4 dark:bg-red-900/30">
                        <i data-lucide="alert-circle" class="w-12 h-12 text-red-600 dark:text-red-500"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Sei assolutamente sicuro?</h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-6 text-center leading-relaxed">
                        Questa azione eliminerà <b>TUTTI</b> i dati locali salvati.<br>
                        Non potrai recuperare nulla se non hai un backup.
                    </p>
                </div>`;
            const footer = `
                <div class="flex justify-center gap-3 w-full">
                    <button onclick="App.closeModal()" class="py-2.5 px-5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Annulla</button>
                    <button id="btn-confirm-clear" class="py-2.5 px-5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-600/20">Sì, elimina dati</button>
                </div>`;
            
            App.showModal('', html, footer, 'max-w-md');
            document.getElementById('btn-confirm-clear').onclick = () => App.clearData();
        },

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

            document.getElementById('btn-save-pin').onclick = () => this.savePin();
            document.getElementById('btn-logout').onclick = () => this.confirmLogout();
            
            this.setupPinInputs('current');
            this.setupPinInputs('new');
            this.setupPinInputs('confirm');
            
            document.querySelectorAll('.btn-toggle-pin').forEach(btn => {
                btn.onclick = () => this.togglePinVisibility(btn.dataset.target);
            });
            
            document.getElementById('btn-theme-light').onclick = () => App.setTheme('light');
            document.getElementById('btn-theme-dark').onclick = () => App.setTheme('dark');
        }
    };

    if(window.App) App.registerModule('impostazioni', SettingsModule); 
    else document.addEventListener('app:ready', () => App.registerModule('impostazioni', SettingsModule));
})();
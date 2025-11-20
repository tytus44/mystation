/* ==========================================================================
   MODULO: Impostazioni (js/impostazioni.js) - Fix Missing confirmClearData
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
            this.restoreLayout();
            this.initDragAndDrop();

            this.updateThemeUI(localStorage.getItem('color-theme') || 'light');
            this.updatePinUI(); 
        },

        initDragAndDrop() {
            const save = () => this.saveLayout();
            ['settings-col-1', 'settings-col-2'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    new Sortable(el, { group: 'shared-settings', animation: 150, ghostClass: 'sortable-ghost', handle: '.card-header', onSort: save });
                }
            });
        },

        saveLayout() {
            const getIds = (cid) => Array.from(document.getElementById(cid)?.children || []).map(el => el.id).filter(id => id);
            const layout = { col1: getIds('settings-col-1'), col2: getIds('settings-col-2') };
            localStorage.setItem('Pylon.Pro_settings_layout', JSON.stringify(layout));
        },

        restoreLayout() {
            const saved = localStorage.getItem('Pylon.Pro_settings_layout');
            if (!saved) return;
            try {
                const layout = JSON.parse(saved);
                const restore = (cid, ids) => {
                    const container = document.getElementById(cid);
                    if (!container || !ids) return;
                    ids.forEach(id => { const el = document.getElementById(id); if (el) container.appendChild(el); });
                };
                restore('settings-col-1', layout.col1);
                restore('settings-col-2', layout.col2);
            } catch (e) { console.error("Errore ripristino layout impostazioni:", e); }
        },

        updateThemeUI(activeTheme) {
            document.querySelectorAll('.theme-card').forEach(el => {
                el.classList.remove('ring-2', 'ring-[#0066cc]', 'border-[#0066cc]', 'bg-blue-50', 'dark:bg-blue-900/20');
                el.classList.add('border-gray-200', 'dark:border-gray-700');
            });

            let themeToSelect = activeTheme === 'dark' ? 'dark' : 'light';
            const activeBtn = document.getElementById(`btn-theme-${themeToSelect}`);
            
            if (activeBtn) {
                const card = activeBtn.closest('.theme-card');
                if(card) {
                    card.classList.remove('border-gray-200', 'dark:border-gray-700');
                    card.classList.add('ring-2', 'ring-[#0066cc]', 'border-[#0066cc]', 'bg-blue-50', 'dark:bg-blue-900/20');
                }
            }
        },
        
        updatePinUI() {
            const pinStatus = document.getElementById('pin-status');
            const currentPinWrapper = document.getElementById('pin-current-wrapper');
            if (!pinStatus || !currentPinWrapper) return;
            
            if (App.state.pin) {
                pinStatus.innerHTML = `<div class="flex items-center text-green-600 dark:text-green-400 font-semibold"><i data-lucide="check-circle" class="w-5 h-5 mr-2"></i> PIN attivo</div><div class="text-sm text-gray-500 mt-1">Inserisci il PIN attuale per modificarlo.</div>`;
                currentPinWrapper.classList.remove('hidden'); 
            } else {
                pinStatus.innerHTML = `<div class="flex items-center text-gray-500 dark:text-gray-400"><i data-lucide="unlock" class="w-5 h-5 mr-2"></i> Nessun PIN impostato</div><div class="text-sm text-gray-500 mt-1">L'app è sbloccata. Crea un PIN per proteggerla.</div>`;
                currentPinWrapper.classList.add('hidden');
            }
            lucide.createIcons();
        },
        
        getPinFromInputs(groupName) {
            const inputs = document.querySelectorAll(`[data-pin-group="${groupName}"] .pin-input`);
            let pin = ''; inputs.forEach(input => pin += input.value); return pin;
        },

        clearPinInputs(groupName) {
            document.querySelectorAll(`[data-pin-group="${groupName}"] .pin-input`).forEach(input => { input.value = ''; });
        },

        savePin() {
            const currentPin = this.getPinFromInputs('current');
            const newPin = this.getPinFromInputs('new');
            const confirmPin = this.getPinFromInputs('confirm');

            if (App.state.pin && App.state.pin !== currentPin) return App.showToast('PIN attuale non corretto.', 'error');
            if (!newPin && !confirmPin) { App.setPin(null); this.updatePinUI(); this.clearPinInputs('current'); return; }
            if (newPin !== confirmPin) return App.showToast('I nuovi PIN non corrispondono.', 'error');
            if (!/^\d{4}$/.test(newPin)) return App.showToast('Il PIN deve essere di 4 cifre numeriche.', 'error');

            App.setPin(newPin);
            this.clearPinInputs('current'); this.clearPinInputs('new'); this.clearPinInputs('confirm');
            this.updatePinUI();
        },
        
        confirmLogout() {
             App.showModal('Esci dall\'account', `<p class="text-gray-600 dark:text-gray-300">Vuoi davvero uscire? L'applicazione verrà bloccata.</p>`, `<div class="flex justify-end gap-3 w-full"><button onclick="App.closeModal()" class="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition-none">Annulla</button><button id="btn-confirm-logout" class="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 shadow-sm transition-none">Sì, esci</button></div>`, 'max-w-md');
             document.getElementById('btn-confirm-logout').onclick = () => { App.closeModal(); App.lockApp(); };
        },

        getLayoutHTML() {
            const pinInputHTML = `
                <input type="password" inputmode="numeric" maxlength="1" class="pin-square-small pin-input bg-gray-50 border border-gray-300 text-gray-900 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all">
                <input type="password" inputmode="numeric" maxlength="1" class="pin-square-small pin-input bg-gray-50 border border-gray-300 text-gray-900 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all">
                <input type="password" inputmode="numeric" maxlength="1" class="pin-square-small pin-input bg-gray-50 border border-gray-300 text-gray-900 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all">
                <input type="password" inputmode="numeric" maxlength="1" class="pin-square-small pin-input bg-gray-50 border border-gray-300 text-gray-900 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all">
            `;
            
            return `
                <div id="impostazioni-layout" class="flex flex-col gap-8 animate-fade-in pb-10">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Impostazioni</h2>
                    </div>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div id="settings-col-1" class="flex flex-col gap-8 h-full">
                            <div id="card-theme" class="bg-white border border-gray-200 rounded-lg shadow-none dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                <div class="flex items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700 card-header cursor-move">
                                    <div class="flex items-center justify-center w-10 h-10 bg-[#0066cc] text-white rounded-full shadow-sm mr-4">
                                        <i data-lucide="palette" class="w-5 h-5"></i>
                                    </div>
                                    <div><h3 class="text-lg font-bold text-gray-900 dark:text-white">Aspetto</h3><p class="text-sm text-gray-500 dark:text-gray-400">Personalizza l'interfaccia</p></div>
                                </div>
                                <div class="p-6 grid grid-cols-2 gap-4">
                                    <button id="btn-theme-light" class="theme-card group relative flex flex-col items-center p-4 border rounded-lg transition-none duration-200">
                                        <div class="w-full aspect-video rounded-md mb-3 border overflow-hidden flex flex-col shadow-sm" style="background-color: #f3f4f6; border-color: #e5e7eb;">
                                             <div class="h-3 w-full border-b" style="background-color: #ffffff; border-color: #e5e7eb;"></div>
                                             <div class="flex flex-1">
                                                <div class="w-1/4 h-full border-r" style="background-color: #f9fafb; border-color: #e5e7eb;"></div>
                                                <div class="flex-1 h-full" style="background-color: #ffffff;"></div>
                                             </div>
                                        </div>
                                        <span class="font-medium text-gray-900 dark:text-white">Chiaro</span>
                                    </button>
                                    <button id="btn-theme-dark" class="theme-card group relative flex flex-col items-center p-4 border rounded-lg transition-none duration-200">
                                        <div class="w-full aspect-video rounded-md mb-3 border overflow-hidden flex flex-col shadow-sm" style="background-color: #1f2937; border-color: #374151;">
                                             <div class="h-3 w-full border-b" style="background-color: #111827; border-color: #374151;"></div>
                                             <div class="flex flex-1">
                                                <div class="w-1/4 h-full border-r" style="background-color: #1f2937; border-color: #374151;"></div>
                                                <div class="flex-1 h-full" style="background-color: #111827;"></div>
                                             </div>
                                        </div>
                                        <span class="font-medium text-gray-900 dark:text-white">Scuro</span>
                                    </button>
                                </div>
                            </div>
                            <div id="card-pin" class="bg-white border border-gray-200 rounded-lg shadow-none dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                <div class="flex items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700 card-header cursor-move">
                                    <div class="flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-full shadow-sm mr-4">
                                        <i data-lucide="shield-check" class="w-5 h-5"></i>
                                    </div>
                                    <div><h3 class="text-lg font-bold text-gray-900 dark:text-white">Sicurezza</h3><p class="text-sm text-gray-500 dark:text-gray-400">Gestione accesso e PIN</p></div>
                                </div>
                                <div class="p-6 space-y-6">
                                    <div id="pin-status" class="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-md border border-gray-100 dark:border-gray-700"></div>
                                    <div id="pin-current-wrapper" class="hidden"><label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">PIN Attuale</label><div class="flex items-center gap-3"><div class="flex gap-2" data-pin-group="current">${pinInputHTML}</div><button type="button" class="btn-toggle-pin p-2.5 text-gray-400 hover:text-gray-600 rounded-md dark:hover:text-white" data-target="current"><i data-lucide="eye" class="w-5 h-5"></i></button></div></div>
                                    <div class="grid grid-cols-1 gap-6">
                                        <div><label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nuovo PIN</label><div class="flex items-center gap-3"><div class="flex gap-2" data-pin-group="new">${pinInputHTML}</div><button type="button" class="btn-toggle-pin p-2.5 text-gray-400 hover:text-gray-600 rounded-md dark:hover:text-white" data-target="new"><i data-lucide="eye" class="w-5 h-5"></i></button></div></div>
                                        <div><label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Conferma PIN</label><div class="flex items-center gap-3"><div class="flex gap-2" data-pin-group="confirm">${pinInputHTML}</div><button type="button" class="btn-toggle-pin p-2.5 text-gray-400 hover:text-gray-600 rounded-md dark:hover:text-white" data-target="confirm"><i data-lucide="eye" class="w-5 h-5"></i></button></div></div>
                                    </div>
                                    <div class="flex flex-wrap gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <button id="btn-save-pin" class="text-white bg-[#0066cc] hover:bg-[#0052a3] px-5 py-2.5 rounded-md font-semibold shadow-sm transition-all">Salva PIN</button>
                                        <button id="btn-logout" class="ml-auto px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center shadow-sm transition-all" title="Blocca applicazione"><i data-lucide="log-out" class="w-4 h-4 sm:mr-2"></i> Esci</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="settings-col-2" class="flex flex-col gap-8 h-full">
                            
                            <div id="card-forms" class="bg-white border border-gray-200 rounded-lg shadow-none dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                <div class="flex items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700 card-header cursor-move">
                                    <div class="flex items-center justify-center w-10 h-10 bg-orange-500 text-white rounded-full shadow-sm mr-4">
                                        <i data-lucide="file-text" class="w-5 h-5"></i>
                                    </div>
                                    <div><h3 class="text-lg font-bold text-gray-900 dark:text-white">Modulistica</h3><p class="text-sm text-gray-500 dark:text-gray-400">Download fogli cartacei</p></div>
                                </div>
                                <div class="p-6 flex flex-wrap gap-4">
                                    <a href="pdf/inizio.pdf" target="_blank" class="flex-1 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium rounded-md text-sm px-5 py-3 flex items-center justify-center no-underline transition-all dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"><i data-lucide="sun" class="w-4 h-4 mr-2 text-orange-500"></i> Inizio Giornata</a>
                                    <a href="pdf/fine.pdf" target="_blank" class="flex-1 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium rounded-md text-sm px-5 py-3 flex items-center justify-center no-underline transition-all dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"><i data-lucide="moon" class="w-4 h-4 mr-2 text-blue-500"></i> Fine Giornata</a>
                                </div>
                            </div>

                            <div id="card-backup" class="bg-white border border-gray-200 rounded-lg shadow-none dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                <div class="flex items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700 card-header cursor-move">
                                    <div class="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full shadow-sm mr-4">
                                        <i data-lucide="database" class="w-5 h-5"></i>
                                    </div>
                                    <div><h3 class="text-lg font-bold text-gray-900 dark:text-white">Dati e Backup</h3><p class="text-sm text-gray-500 dark:text-gray-400">Esporta o importa i tuoi dati</p></div>
                                </div>
                                <div class="p-6 flex flex-wrap gap-4">
                                    <button id="btn-settings-export" class="flex-1 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium rounded-md text-sm px-5 py-3 flex items-center justify-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition-all"><i data-lucide="download" class="w-4 h-4 mr-2 text-gray-500"></i> Esporta Backup</button>
                                    <button id="btn-settings-import" class="flex-1 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium rounded-md text-sm px-5 py-3 flex items-center justify-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition-all"><i data-lucide="upload" class="w-4 h-4 mr-2 text-gray-500"></i> Importa Backup</button>
                                </div>
                            </div>
                            
                            <div id="card-danger" class="bg-white border border-gray-200 rounded-lg shadow-none dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                <div class="flex items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700 card-header cursor-move">
                                    <div class="flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-full shadow-sm mr-4">
                                        <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                                    </div>
                                    <div><h3 class="text-lg font-bold text-gray-900 dark:text-white">Zona Pericolo</h3><p class="text-sm text-gray-500 dark:text-gray-400">Reset totale applicazione</p></div>
                                </div>
                                <div class="p-6">
                                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">L'azione è <strong>irreversibile</strong>. Elimina tutti i dati salvati nel browser.</p>
                                    <button id="btn-clear-data" class="w-full text-white bg-red-600 border border-transparent hover:bg-red-700 font-medium rounded-md text-sm px-5 py-3 flex items-center justify-center shadow-sm transition-all"><i data-lucide="trash-2" class="w-4 h-4 mr-2"></i> Elimina Tutti i Dati</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        },
        
        // FIX: REINSERITO confirmClearData
        confirmClearData() {
            const html = `<div class="text-center p-6 flex flex-col items-center"><div class="p-3 bg-red-50 dark:bg-red-900/30 rounded-full mb-4"><i data-lucide="alert-triangle" class="w-10 h-10 text-red-600 dark:text-red-500"></i></div><h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Sei sicuro?</h3><p class="text-gray-500 dark:text-gray-400 mb-6">Questa azione eliminerà <b>TUTTI</b> i dati locali.</p></div>`;
            const footer = `<div class="flex justify-center gap-3 w-full"><button onclick="App.closeModal()" class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 transition-all">Annulla</button><button id="btn-confirm-clear" class="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 shadow-sm transition-all">Sì, elimina dati</button></div>`;
            App.showModal('', html, footer, 'max-w-md');
            document.getElementById('btn-confirm-clear').onclick = () => App.clearData();
        },

        setupPinInputs(groupName) {
            const inputs = document.querySelectorAll(`[data-pin-group="${groupName}"] .pin-input`);
            inputs.forEach((input, index) => {
                input.oninput = () => { input.value = input.value.replace(/[^0-9]/g, ''); };
                input.onkeydown = (e) => { if (e.key >= '0' && e.key <= '9' && input.value.length === 0) { e.preventDefault(); input.value = e.key; if (index < inputs.length - 1) inputs[index + 1].focus(); } else if (e.key === 'Backspace') { e.preventDefault(); input.value = ''; if (index > 0) inputs[index - 1].focus(); } else if (e.key.includes('Arrow')) { e.preventDefault(); if (e.key === 'ArrowRight' && index < inputs.length - 1) inputs[index + 1].focus(); else if (e.key === 'ArrowLeft' && index > 0) inputs[index - 1].focus(); } else if (e.key.length === 1 && input.value.length > 0) { e.preventDefault(); input.value = e.key; if (index < inputs.length - 1) inputs[index + 1].focus(); } else if (e.key !== 'Tab' && e.key.length === 1) { e.preventDefault(); } };
            });
        },

        togglePinVisibility(targetGroup) {
            const inputs = document.querySelectorAll(`[data-pin-group="${targetGroup}"] .pin-input`);
            const icon = document.querySelector(`.btn-toggle-pin[data-target="${targetGroup}"] i`);
            inputs.forEach(input => { if (input.type === 'password') { input.type = 'text'; icon.setAttribute('data-lucide', 'eye-off'); } else { input.type = 'password'; icon.setAttribute('data-lucide', 'eye'); } });
            lucide.createIcons();
        },

        attachListeners() {
            document.getElementById('btn-settings-export').onclick = () => { App.exportData(); App.showToast('Backup esportato!', 'success'); };
            document.getElementById('btn-settings-import').onclick = () => document.getElementById('import-file-input').click();
            document.getElementById('btn-clear-data').onclick = () => this.confirmClearData();
            document.getElementById('btn-save-pin').onclick = () => this.savePin();
            document.getElementById('btn-logout').onclick = () => this.confirmLogout();
            this.setupPinInputs('current'); this.setupPinInputs('new'); this.setupPinInputs('confirm');
            document.querySelectorAll('.btn-toggle-pin').forEach(btn => { btn.onclick = () => this.togglePinVisibility(btn.dataset.target); });
            document.getElementById('btn-theme-light').onclick = () => App.setTheme('light');
            document.getElementById('btn-theme-dark').onclick = () => App.setTheme('dark');
        }
    };

    if(window.App) App.registerModule('impostazioni', SettingsModule); 
    else document.addEventListener('app:ready', () => App.registerModule('impostazioni', SettingsModule));
})();

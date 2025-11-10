/* ==========================================================================
   MODULO: Impostazioni (js/impostazioni.js) - Drag & Drop
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

        getLayoutHTML() {
            return `
                <div id="impostazioni-layout" class="flex flex-col gap-6 animate-fade-in">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Impostazioni</h2>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        <div id="settings-col-1" class="flex flex-col gap-6 h-full">
                            <div id="card-backup" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card">
                                <div class="flex items-center mb-4 card-header cursor-move">
                                    <div class="p-2 bg-primary-100 rounded-lg dark:bg-primary-900/30 mr-3">
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

                            <div id="card-forms" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card">
                                <div class="flex items-center mb-4 card-header cursor-move">
                                    <div class="p-2 bg-green-100 rounded-lg dark:bg-green-900/30 mr-3">
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
                        </div>

                        <div id="settings-col-2" class="flex flex-col gap-6 h-full">
                            <div id="card-danger" class="p-6 border border-red-200 rounded-lg shadow-sm bg-red-50 dark:bg-red-900/10 dark:border-red-900/50 draggable-card">
                                <div class="flex items-center mb-4 card-header cursor-move">
                                    <i data-lucide="alert-triangle" class="w-6 h-6 text-red-600 dark:text-red-500 mr-3"></i>
                                    <h3 class="text-xl font-bold text-red-700 dark:text-red-500">Zona Pericolo</h3>
                                </div>
                                <p class="text-sm text-red-600 dark:text-red-400 mb-6">
                                    Le azioni in questa sezione sono <strong>irreversibili</strong>. Assicurati di avere un backup dei tuoi dati prima di procedere con qualsiasi operazione di cancellazione.
                                </p>
                                <button id="btn-clear-data" class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 flex items-center justify-center sm:w-auto w-full" title="Elimina TUTTI i dati">
                                    <i data-lucide="trash-2" class="w-4 h-4 sm:mr-2"></i>
                                    <span class="hidden sm:inline">Elimina TUTTI i dati</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
            
            lucide.createIcons();
            this.attachListeners();
        },

        confirmClearData() {
            const html = `
                <div class="text-center p-6 flex flex-col items-center">
                    <i data-lucide="alert-circle" class="w-16 h-16 text-red-600 mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Sei assolutamente sicuro?</h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-6">
                        Questa azione eliminerà <b>TUTTI</b> i dati salvati nel browser (prezzi, registri, anagrafiche, spese, turni).<br>
                        Non potrai tornare indietro una volta confermato.
                    </p>
                </div>`;
            const footer = `
                <div class="flex justify-center gap-4 w-full">
                    <button onclick="App.closeModal()" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Annulla</button>
                    <button id="btn-confirm-clear" class="py-2.5 px-5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800">Sì, elimina tutto</button>
                </div>`;
            
            App.showModal('', html, footer, 'max-w-md');
            document.getElementById('btn-confirm-clear').onclick = () => App.clearData();
        },

        attachListeners() {
            document.getElementById('btn-settings-export').onclick = () => {
                App.exportData();
                App.showToast('Backup esportato con successo!', 'success');
            };
            
            document.getElementById('btn-settings-import').onclick = () => document.getElementById('import-file-input').click();
            document.getElementById('btn-clear-data').onclick = () => this.confirmClearData();
        }
    };

    if(window.App) App.registerModule('impostazioni', SettingsModule); 
    else document.addEventListener('app:ready', () => App.registerModule('impostazioni', SettingsModule));
})();
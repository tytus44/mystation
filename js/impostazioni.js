/* ==========================================================================
   MODULO: Impostazioni (js/impostazioni.js) - Toast Notifications
   ========================================================================== */
(function() {
    'use strict';

    const SettingsModule = {
        init() { },

        render() {
            const container = document.getElementById('impostazioni-container');
            if (!container) return;

            container.innerHTML = `
                <div class="flex flex-col gap-6 animate-fade-in">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Impostazioni</h2>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="space-y-6">
                            <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                <div class="flex items-center mb-4">
                                    <div class="p-2 bg-primary-100 rounded-lg dark:bg-primary-900/30 mr-3">
                                        <i data-lucide="database" class="w-6 h-6 text-primary-600 dark:text-primary-500"></i>
                                    </div>
                                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Backup e Ripristino</h3>
                                </div>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Esporta i tuoi dati per sicurezza o importali su un altro dispositivo.</p>
                                <div class="flex flex-wrap gap-4">
                                    <button id="btn-settings-export" class="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                        <i data-lucide="download" class="w-4 h-4 mr-2"></i> Esporta Backup
                                    </button>
                                    <button id="btn-settings-import" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex items-center">
                                        <i data-lucide="upload" class="w-4 h-4 mr-2"></i> Importa Backup
                                    </button>
                                </div>
                            </div>

                            <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                <div class="flex items-center mb-4">
                                    <div class="p-2 bg-green-100 rounded-lg dark:bg-green-900/30 mr-3">
                                        <i data-lucide="file-text" class="w-6 h-6 text-green-600 dark:text-green-500"></i>
                                    </div>
                                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Modulistica Giornaliera</h3>
                                </div>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Stampa i fogli per la gestione manuale dei turni.</p>
                                <div class="flex flex-wrap gap-4">
                                    <a href="pdf/inizio.pdf" target="_blank" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex items-center no-underline">
                                        <i data-lucide="sun" class="w-4 h-4 mr-2"></i> Foglio Inizio Giornata
                                    </a>
                                    <a href="pdf/fine.pdf" target="_blank" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex items-center no-underline">
                                        <i data-lucide="moon" class="w-4 h-4 mr-2"></i> Foglio Fine Giornata
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div class="p-6 border border-red-200 rounded-lg shadow-sm bg-red-50 dark:bg-red-900/10 dark:border-red-900/50 h-full">
                                <div class="flex items-center mb-4">
                                    <i data-lucide="alert-triangle" class="w-6 h-6 text-red-600 dark:text-red-500 mr-3"></i>
                                    <h3 class="text-xl font-bold text-red-700 dark:text-red-500">Zona Pericolo</h3>
                                </div>
                                <p class="text-sm text-red-600 dark:text-red-400 mb-6">
                                    Le azioni in questa sezione sono <strong>irreversibili</strong>. Assicurati di avere un backup dei tuoi dati prima di procedere con qualsiasi operazione di cancellazione.
                                </p>
                                <button id="btn-clear-data" class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 flex items-center w-full justify-center sm:w-auto">
                                    <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i> Elimina TUTTI i dati
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="toast-success" class="hidden fixed top-5 right-5 z-[100] flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
                    <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                        <i data-lucide="check" class="w-5 h-5"></i>
                    </div>
                    <div class="ms-3 text-sm font-normal" id="toast-success-message">Backup importato con successo!</div>
                    <button type="button" class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-success" aria-label="Close">
                        <span class="sr-only">Close</span>
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                    </button>
                </div>

                <div id="toast-error" class="hidden fixed top-5 right-5 z-[100] flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
                    <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </div>
                    <div class="ms-3 text-sm font-normal" id="toast-error-message">Errore durante l'importazione</div>
                    <button type="button" class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-error" aria-label="Close">
                        <span class="sr-only">Close</span>
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                    </button>
                </div>`;
            
            lucide.createIcons();
            this.attachListeners();
        },

        showToast(type, message) {
            const toastId = type === 'success' ? 'toast-success' : 'toast-error';
            const messageId = type === 'success' ? 'toast-success-message' : 'toast-error-message';
            const toast = document.getElementById(toastId);
            const messageEl = document.getElementById(messageId);
            
            if (toast && messageEl) {
                messageEl.textContent = message;
                toast.classList.remove('hidden');
                lucide.createIcons();
                
                setTimeout(() => {
                    toast.classList.add('hidden');
                }, 5000);
            }
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
                this.showToast('success', 'Backup esportato con successo!');
            };
            
            document.getElementById('btn-settings-import').onclick = () => document.getElementById('import-file-input').click();
            document.getElementById('btn-clear-data').onclick = () => this.confirmClearData();
        }
    };

    if(window.App) App.registerModule('impostazioni', SettingsModule); 
    else document.addEventListener('app:ready', () => App.registerModule('impostazioni', SettingsModule));
})();
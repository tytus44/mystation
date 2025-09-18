// =============================================
// FILE: registro.js
// DESCRIZIONE: Modulo per la gestione della 
// sezione Registro di Carico.
// =============================================

function registroDiCaricoModule() {
    return {
        // === STATO ===
        registryViewMode: Alpine.$persist('list'), // 'list' | 'create-carico' | 'edit-carico'
        registrySort: { column: 'date', direction: 'desc' },
        registrySearchQuery: '',
        registryTimeFilter: 'none', // 'none' | 'month' | 'quarter' | 'semester'
        editingRegistry: null,
        registryForm: { 
            date: '', 
            autistaName: '', 
            benzina: { carico: 0, differenza: 0 }, 
            gasolio: { carico: 0, differenza: 0 }, 
            dieselPlus: { carico: 0, differenza: 0 }, 
            hvolution: { carico: 0, differenza: 0 } 
        },
        
        // === INIZIALIZZAZIONE SPECIFICA ===
        initRegistroDiCarico() { 
            this.resetRegistryForm(); 
            // Inizializza il campo per le giacenze dell'anno precedente se non esiste
            if (typeof this.data.previousYearStock === 'undefined') {
                this.data.previousYearStock = { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 };
            }
        },
        
        // === TEMPLATE HTML ===
        registroTemplate: `<div class="max-w-7xl mx-auto space-y-6">
            <div x-show="registryViewMode === 'list'" class="view-transition">
                
                <div x-data="{ summary: getAnnualSummary() }" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6 no-print">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Riepilogo totali <span x-text="new Date().getFullYear()"></span></h2>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" class="px-6 py-3">Prodotto</th>
                                    <th scope="col" class="px-6 py-3">Carico</th>
                                    <th scope="col" class="px-6 py-3 text-green-500">Differenza +</th>
                                    <th scope="col" class="px-6 py-3 text-red-500">Differenza -</th>
                                    <th scope="col" class="px-6 py-3">Anno Prec.</th>
                                    <th scope="col" class="px-6 py-3">Contabile</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">Benzina</td>
                                    <td class="px-6 py-4" x-text="formatInteger(summary.benzina.carico)"></td>
                                    <td class="px-6 py-4 text-green-600 dark:text-green-400" x-text="formatInteger(summary.benzina.diff_pos)"></td>
                                    <td class="px-6 py-4 text-red-600 dark:text-red-400" x-text="formatInteger(summary.benzina.diff_neg)"></td>
                                    <td class="px-6 py-4">
                                        <input type="number" x-model.number="data.previousYearStock.benzina" @input.debounce.500ms="$forceUpdate()" class="w-24 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                                    </td>
                                    <td class="px-6 py-4 font-bold text-gray-900 dark:text-white" x-text="formatInteger(summary.benzina.carico + (data.previousYearStock.benzina || 0) + summary.benzina.diff_pos + summary.benzina.diff_neg)"></td>
                                </tr>
                                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">Gasolio</td>
                                    <td class="px-6 py-4" x-text="formatInteger(summary.gasolio.carico)"></td>
                                    <td class="px-6 py-4 text-green-600 dark:text-green-400" x-text="formatInteger(summary.gasolio.diff_pos)"></td>
                                    <td class="px-6 py-4 text-red-600 dark:text-red-400" x-text="formatInteger(summary.gasolio.diff_neg)"></td>
                                    <td class="px-6 py-4">
                                        <input type="number" x-model.number="data.previousYearStock.gasolio" @input.debounce.500ms="$forceUpdate()" class="w-24 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                                    </td>
                                    <td class="px-6 py-4 font-bold text-gray-900 dark:text-white" x-text="formatInteger(summary.gasolio.carico + (data.previousYearStock.gasolio || 0) + summary.gasolio.diff_pos + summary.gasolio.diff_neg)"></td>
                                </tr>
                                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">Diesel+</td>
                                    <td class="px-6 py-4" x-text="formatInteger(summary.dieselPlus.carico)"></td>
                                    <td class="px-6 py-4 text-green-600 dark:text-green-400" x-text="formatInteger(summary.dieselPlus.diff_pos)"></td>
                                    <td class="px-6 py-4 text-red-600 dark:text-red-400" x-text="formatInteger(summary.dieselPlus.diff_neg)"></td>
                                    <td class="px-6 py-4">
                                        <input type="number" x-model.number="data.previousYearStock.dieselPlus" @input.debounce.500ms="$forceUpdate()" class="w-24 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                                    </td>
                                    <td class="px-6 py-4 font-bold text-gray-900 dark:text-white" x-text="formatInteger(summary.dieselPlus.carico + (data.previousYearStock.dieselPlus || 0) + summary.dieselPlus.diff_pos + summary.dieselPlus.diff_neg)"></td>
                                </tr>
                                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">Hvolution</td>
                                    <td class="px-6 py-4" x-text="formatInteger(summary.hvolution.carico)"></td>
                                    <td class="px-6 py-4 text-green-600 dark:text-green-400" x-text="formatInteger(summary.hvolution.diff_pos)"></td>
                                    <td class="px-6 py-4 text-red-600 dark:text-red-400" x-text="formatInteger(summary.hvolution.diff_neg)"></td>
                                    <td class="px-6 py-4">
                                        <input type="number" x-model.number="data.previousYearStock.hvolution" @input.debounce.500ms="$forceUpdate()" class="w-24 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                                    </td>
                                    <td class="px-6 py-4 font-bold text-gray-900 dark:text-white" x-text="formatInteger(summary.hvolution.carico + (data.previousYearStock.hvolution || 0) + summary.hvolution.diff_pos + summary.hvolution.diff_neg)"></td>
                                </tr>
                            </tbody>
                            <tfoot class="font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <td class="px-6 py-4">Totale</td>
                                    <td class="px-6 py-4" x-text="formatInteger(summary.benzina.carico + summary.gasolio.carico + summary.dieselPlus.carico + summary.hvolution.carico)"></td>
                                    <td class="px-6 py-4 text-green-600 dark:text-green-400" x-text="formatInteger(summary.benzina.diff_pos + summary.gasolio.diff_pos + summary.dieselPlus.diff_pos + summary.hvolution.diff_pos)"></td>
                                    <td class="px-6 py-4 text-red-600 dark:text-red-400" x-text="formatInteger(summary.benzina.diff_neg + summary.gasolio.diff_neg + summary.dieselPlus.diff_neg + summary.hvolution.diff_neg)"></td>
                                    <td class="px-6 py-4">-</td>
                                    <td class="px-6 py-4" x-text="formatInteger((summary.benzina.carico + (data.previousYearStock.benzina || 0) + summary.benzina.diff_pos + summary.benzina.diff_neg) + (summary.gasolio.carico + (data.previousYearStock.gasolio || 0) + summary.gasolio.diff_pos + summary.gasolio.diff_neg) + (summary.dieselPlus.carico + (data.previousYearStock.dieselPlus || 0) + summary.dieselPlus.diff_pos + summary.dieselPlus.diff_neg) + (summary.hvolution.carico + (data.previousYearStock.hvolution || 0) + summary.hvolution.diff_pos + summary.hvolution.diff_neg))"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div x-data="{ stats: getRegistryStats() }" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 no-print">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Totale Litri Caricati</p>
                                <p x-text="formatInteger(stats.totalLiters)" class="text-4xl font-bold text-blue-600 dark:text-blue-400"></p>
                            </div>
                            <div class="bg-blue-100 dark:bg-blue-900 p-3 rounded-full ml-6">
                                <i data-lucide="droplets" class="w-8 h-8 text-blue-600 dark:text-blue-300"></i>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                             <div>
                                <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Prodotto Top</p>
                                <p x-text="stats.topProduct" class="text-4xl font-bold text-green-600 dark:text-green-400"></p>
                            </div>
                            <div class="bg-green-100 dark:bg-green-900 p-3 rounded-full ml-6">
                                <i data-lucide="droplet" class="w-8 h-8 text-green-600 dark:text-green-300"></i>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Autista Top</p>
                                <p x-text="stats.topDriver" class="text-4xl font-bold text-purple-600 dark:text-purple-400"></p>
                            </div>
                            <div class="bg-purple-100 dark:bg-purple-900 p-3 rounded-full ml-6">
                                <i data-lucide="user-check" class="w-8 h-8 text-purple-600 dark:text-purple-300"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 no-print">
                    <div class="flex flex-col md:flex-row items-center gap-4">
                        <div class="w-full md:w-1/3">
                            <label for="registry-search" class="sr-only">Cerca Autista</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <i data-lucide="search" class="w-4 h-4 text-gray-400"></i>
                                </div>
                                <input type="search" id="registry-search" x-model.debounce.300ms="registrySearchQuery" placeholder="Cerca per autista..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500">
                            </div>
                        </div>
                        <div class="w-full md:w-2/3">
                             <div class="inline-flex rounded-md shadow-sm w-full" role="group">
                                <button @click="registryTimeFilter = 'none'" :class="registryTimeFilter === 'none' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'" type="button" class="flex-1 px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-500 dark:border-gray-600">Nessun Filtro</button>
                                <button @click="registryTimeFilter = 'month'" :class="registryTimeFilter === 'month' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'" type="button" class="flex-1 px-4 py-2 text-sm font-medium border-t border-b border-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-500 dark:border-gray-600">Ultimo Mese</button>
                                <button @click="registryTimeFilter = 'quarter'" :class="registryTimeFilter === 'quarter' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'" type="button" class="flex-1 px-4 py-2 text-sm font-medium border-t border-b border-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-500 dark:border-gray-600">Ultimo Trimestre</button>
                                <button @click="registryTimeFilter = 'semester'" :class="registryTimeFilter === 'semester' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'" type="button" class="flex-1 px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-lg focus:z-10 focus:ring-2 focus:ring-blue-500 dark:border-gray-600">Ultimo Semestre</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden no-print">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Elenco Carichi</h2>
                        <button @click="showCreateCarico()" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center">
                            <i data-lucide="plus-circle" class="w-5 h-5 mr-2"></i>Nuovo Carico
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" class="px-6 py-3"><button @click="sortRegistry('date')" class="flex items-center">Data <i data-lucide="arrow-up-down" class="w-3 h-3 ml-1.5"></i></button></th>
                                    <th scope="col" class="px-6 py-3"><button @click="sortRegistry('autistaName')" class="flex items-center">Autista <i data-lucide="arrow-up-down" class="w-3 h-3 ml-1.5"></i></button></th>
                                    <th scope="col" class="px-6 py-3">Benzina</th>
                                    <th scope="col" class="px-6 py-3">Gasolio</th>
                                    <th scope="col" class="px-6 py-3">Diesel+</th>
                                    <th scope="col" class="px-6 py-3">Hvolution</th>
                                    <th scope="col" class="px-6 py-3 text-right">Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template x-for="carico in sortedRegistry()" :key="carico.id">
                                    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td class="px-6 py-4 font-medium text-gray-900 dark:text-white" x-text="formatDate(carico.date)"></td>
                                        <td class="px-6 py-4 text-gray-900 dark:text-white" x-text="carico.autistaName || '-'"></td>
                                        <td class="px-6 py-4" x-html="formatProductColumn(carico.benzina)"></td>
                                        <td class="px-6 py-4" x-html="formatProductColumn(carico.gasolio)"></td>
                                        <td class="px-6 py-4" x-html="formatProductColumn(carico.dieselPlus)"></td>
                                        <td class="px-6 py-4" x-html="formatProductColumn(carico.hvolution)"></td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex items-center justify-end space-x-2">
                                                <button @click="showEditCarico(carico)" class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 p-1" title="Modifica carico"><i data-lucide="edit" class="w-4 h-4"></i></button>
                                                <button @click="deleteCarico(carico.id)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1" title="Elimina carico"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                                <tr x-show="sortedRegistry().length === 0">
                                    <td colspan="7" class="text-center py-12">
                                        <div class="text-gray-500 dark:text-gray-400">
                                            <i data-lucide="truck" class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"></i>
                                            <p class="text-lg">Nessun carico trovato</p>
                                            <p class="text-sm">Prova a modificare i filtri di ricerca.</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div x-show="registryViewMode === 'create-carico' || registryViewMode === 'edit-carico'" class="view-transition">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-white" x-text="registryViewMode === 'edit-carico' ? 'Modifica Carico' : 'Nuovo Carico'"></h2>
                        <button @click="backToRegistryList()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><i data-lucide="x" class="w-6 h-6"></i></button>
                    </div>
                    <div class="p-6">
                        <div class="space-y-6">
                           <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="relative">
                                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data</label>
                                    <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none top-6"><svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z"/><path d="M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/></svg></div>
                                    <input datepicker datepicker-autohide datepicker-format="dd.mm.yyyy" type="text" x-model="registryForm.date" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="gg.mm.aaaa">
                                </div>
                                <div>
                                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome Autista</label>
                                    <input type="text" x-model="registryForm.autistaName" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" placeholder="Nome Cognome">
                                </div>
                            </div>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div class="p-4 border rounded-lg space-y-3 dark:border-gray-600"><h4 class="font-semibold dark:text-white">Benzina</h4><div><label class="block text-xs mb-1 dark:text-gray-300">Carico (Litri)</label><input type="number" x-model.number="registryForm.benzina.carico" class="w-full p-2 text-sm rounded-lg bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white"></div><div><label class="block text-xs mb-1 dark:text-gray-300">Differenza (Litri)</label><input type="number" x-model.number="registryForm.benzina.differenza" class="w-full p-2 text-sm rounded-lg bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white"></div></div>
                                <div class="p-4 border rounded-lg space-y-3 dark:border-gray-600"><h4 class="font-semibold dark:text-white">Gasolio</h4><div><label class="block text-xs mb-1 dark:text-gray-300">Carico (Litri)</label><input type="number" x-model.number="registryForm.gasolio.carico" class="w-full p-2 text-sm rounded-lg bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white"></div><div><label class="block text-xs mb-1 dark:text-gray-300">Differenza (Litri)</label><input type="number" x-model.number="registryForm.gasolio.differenza" class="w-full p-2 text-sm rounded-lg bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white"></div></div>
                                <div class="p-4 border rounded-lg space-y-3 dark:border-gray-600"><h4 class="font-semibold dark:text-white">Diesel+</h4><div><label class="block text-xs mb-1 dark:text-gray-300">Carico (Litri)</label><input type="number" x-model.number="registryForm.dieselPlus.carico" class="w-full p-2 text-sm rounded-lg bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white"></div><div><label class="block text-xs mb-1 dark:text-gray-300">Differenza (Litri)</label><input type="number" x-model.number="registryForm.dieselPlus.differenza" class="w-full p-2 text-sm rounded-lg bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white"></div></div>
                                <div class="p-4 border rounded-lg space-y-3 dark:border-gray-600"><h4 class="font-semibold dark:text-white">Hvolution</h4><div><label class="block text-xs mb-1 dark:text-gray-300">Carico (Litri)</label><input type="number" x-model.number="registryForm.hvolution.carico" class="w-full p-2 text-sm rounded-lg bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white"></div><div><label class="block text-xs mb-1 dark:text-gray-300">Differenza (Litri)</label><input type="number" x-model.number="registryForm.hvolution.differenza" class="w-full p-2 text-sm rounded-lg bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white"></div></div>
                            </div>
                            <div class="flex items-center justify-start space-x-3">
                                <button @click="saveCarico()" class="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5">Salva Carico</button>
                                <button @click="backToRegistryList()" class="text-gray-500 bg-white hover:bg-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:hover:bg-gray-700">Annulla</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
        
        // === METODI ===
        
        // Navigazione
        showCreateCarico() {
            this.registryViewMode = 'create-carico';
            this.editingRegistry = null;
            this.resetRegistryForm();
            this.refreshIcons();
        },
        
        showEditCarico(carico) {
            this.registryViewMode = 'edit-carico';
            this.editingRegistry = carico;
            this.registryForm = { 
                date: this.formatToItalianDate(carico.date), 
                autistaName: carico.autistaName || '', 
                benzina: { ...(carico.benzina || { carico: 0, differenza: 0 }) }, 
                gasolio: { ...(carico.gasolio || { carico: 0, differenza: 0 }) }, 
                dieselPlus: { ...(carico.dieselPlus || { carico: 0, differenza: 0 }) }, 
                hvolution: { ...(carico.hvolution || { carico: 0, differenza: 0 }) } 
            };
            this.refreshIcons();
        },
        
        backToRegistryList() {
            this.registryViewMode = 'list';
            this.editingRegistry = null;
        },

        // Ordinamento e Filtro
        sortRegistry(column) { 
            if (this.registrySort.column === column) { 
                this.registrySort.direction = this.registrySort.direction === 'asc' ? 'desc' : 'asc'; 
            } else { 
                this.registrySort.column = column; 
                this.registrySort.direction = 'asc'; 
            } 
        },
        
        getFilteredRegistryEntries() {
            if (!Array.isArray(this.data.registryEntries)) return [];
            let filteredEntries = [...this.data.registryEntries];
            if (this.registryTimeFilter !== 'none') {
                const now = new Date();
                let startDate = new Date();
                switch(this.registryTimeFilter) {
                    case 'month': startDate.setMonth(now.getMonth() - 1); break;
                    case 'quarter': startDate.setMonth(now.getMonth() - 3); break;
                    case 'semester': startDate.setMonth(now.getMonth() - 6); break;
                }
                filteredEntries = filteredEntries.filter(entry => new Date(entry.date) >= startDate);
            }
            if (this.registrySearchQuery.trim() !== '') {
                const query = this.registrySearchQuery.toLowerCase();
                filteredEntries = filteredEntries.filter(entry => 
                    (entry.autistaName || '').toLowerCase().includes(query)
                );
            }
            return filteredEntries;
        },

        sortedRegistry() { 
            const filtered = this.getFilteredRegistryEntries();
            return filtered.sort((a, b) => { 
                const dir = this.registrySort.direction === 'asc' ? 1 : -1; 
                if (this.registrySort.column === 'date') { 
                    return (new Date(a.date) - new Date(b.date)) * dir; 
                } 
                if (this.registrySort.column === 'autistaName') { 
                    return (a.autistaName || '').localeCompare(b.autistaName || '', 'it-IT') * dir; 
                } 
                return 0; 
            }); 
        },

        // Statistiche
        getRegistryStats() {
            const entries = this.getFilteredRegistryEntries();
            const stats = { totalLiters: 0, topProduct: 'N/D', topDriver: 'N/D' };
            if (entries.length === 0) return stats;

            const productTotals = { Benzina: 0, Gasolio: 0, 'Diesel+': 0, Hvolution: 0 };
            const driverCounts = {};

            entries.forEach(entry => {
                stats.totalLiters += (entry.benzina?.carico || 0) + (entry.gasolio?.carico || 0) + (entry.dieselPlus?.carico || 0) + (entry.hvolution?.carico || 0);
                productTotals.Benzina += entry.benzina?.carico || 0;
                productTotals.Gasolio += entry.gasolio?.carico || 0;
                productTotals['Diesel+'] += entry.dieselPlus?.carico || 0;
                productTotals.Hvolution += entry.hvolution?.carico || 0;
                if (entry.autistaName) {
                    driverCounts[entry.autistaName] = (driverCounts[entry.autistaName] || 0) + 1;
                }
            });

            let maxLiters = -1;
            for (const product in productTotals) {
                if (productTotals[product] > maxLiters) {
                    maxLiters = productTotals[product];
                    stats.topProduct = product;
                }
            }
            if (maxLiters <= 0) stats.topProduct = 'N/D';

            let maxTrips = 0;
            for (const driver in driverCounts) {
                if (driverCounts[driver] > maxTrips) {
                    maxTrips = driverCounts[driver];
                    const nameParts = driver.split(' ');
                    stats.topDriver = nameParts[0] || driver;
                }
            }
            if (maxTrips === 0) stats.topDriver = 'N/D';

            return stats;
        },

        getAnnualSummary() { 
            const currentYear = new Date().getFullYear(); 
            const summary = { 
                benzina: { carico: 0, diff_pos: 0, diff_neg: 0 }, 
                gasolio: { carico: 0, diff_pos: 0, diff_neg: 0 }, 
                dieselPlus: { carico: 0, diff_pos: 0, diff_neg: 0 }, 
                hvolution: { carico: 0, diff_pos: 0, diff_neg: 0 } 
            }; 
            if (!Array.isArray(this.data.registryEntries)) return summary; 
            const processProduct = (productData, summaryProduct) => { 
                if (productData) { 
                    summaryProduct.carico += productData.carico || 0; 
                    const diff = productData.differenza || 0; 
                    if (diff > 0) { summaryProduct.diff_pos += diff; } else { summaryProduct.diff_neg += diff; } 
                } 
            }; 
            this.data.registryEntries
                .filter(entry => new Date(entry.date).getFullYear() === currentYear)
                .forEach(entry => { 
                    processProduct(entry.benzina, summary.benzina); 
                    processProduct(entry.gasolio, summary.gasolio); 
                    processProduct(entry.dieselPlus, summary.dieselPlus); 
                    processProduct(entry.hvolution, summary.hvolution); 
                }); 
            return summary; 
        },

        // Operazioni CRUD
        resetRegistryForm() { 
            this.registryForm = { 
                date: this.getTodayFormatted(), 
                autistaName: '', 
                benzina: { carico: 0, differenza: 0 }, 
                gasolio: { carico: 0, differenza: 0 }, 
                dieselPlus: { carico: 0, differenza: 0 }, 
                hvolution: { carico: 0, differenza: 0 } 
            }; 
        },
        
        saveCarico() { 
            if (!this.registryForm.date || !this.registryForm.autistaName.trim()) { 
                this.showNotification('Data e nome autista sono obbligatori'); 
                return; 
            } 
            if (!this.validateItalianDate(this.registryForm.date)) { 
                this.showNotification('Formato data non valido. Usa gg.mm.aaaa'); 
                return; 
            } 
            
            const parsedDate = this.parseItalianDate(this.registryForm.date); 
            const carico = { 
                id: this.editingRegistry ? this.editingRegistry.id : this.generateUniqueId('carico'), 
                date: parsedDate.toISOString(), 
                autistaName: this.registryForm.autistaName.trim(), 
                benzina: { carico: parseFloat(this.registryForm.benzina.carico) || 0, differenza: parseFloat(this.registryForm.benzina.differenza) || 0 }, 
                gasolio: { carico: parseFloat(this.registryForm.gasolio.carico) || 0, differenza: parseFloat(this.registryForm.gasolio.differenza) || 0 }, 
                dieselPlus: { carico: parseFloat(this.registryForm.dieselPlus.carico) || 0, differenza: parseFloat(this.registryForm.dieselPlus.differenza) || 0 }, 
                hvolution: { carico: parseFloat(this.registryForm.hvolution.carico) || 0, differenza: parseFloat(this.registryForm.hvolution.differenza) || 0 }, 
                createdAt: this.editingRegistry ? this.editingRegistry.createdAt : new Date().toISOString() 
            }; 
            
            if (this.editingRegistry) { 
                const index = this.data.registryEntries.findIndex(c => c.id === this.editingRegistry.id); 
                if (index !== -1) this.data.registryEntries[index] = carico; 
            } else { 
                this.data.registryEntries.push(carico); 
            } 
            
            this.backToRegistryList();
            this.refreshIcons();
        },
        
        deleteCarico(caricoId) { 
            const carico = this.data.registryEntries.find(c => c.id === caricoId); 
            if (!carico) return; 
            this.showConfirm(`Sei sicuro di voler eliminare il carico del ${this.formatDate(carico.date)} di ${carico.autistaName}?`, () => { 
                this.data.registryEntries = this.data.registryEntries.filter(c => c.id !== caricoId); 
                this.refreshIcons();
            }); 
        },
        
        // Formattazione
        formatProductColumn(product) { 
            if (!product || (product.carico === 0 && product.differenza === 0)) return '-'; 
            const carico = product.carico || 0; 
            const differenza = product.differenza || 0; 
            const diffClass = differenza >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'; 
            return `<div class="text-sm"><div>Carico: <span class="font-medium">${this.formatInteger(carico)} L</span></div><div class="${diffClass}">Diff: ${differenza >= 0 ? '+' : ''}${this.formatInteger(differenza)} L</div></div>`; 
        }
    };
}
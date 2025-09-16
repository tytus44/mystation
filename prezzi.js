// =============================================
// FILE: prezzi.js
// DESCRIZIONE: Modulo per la gestione della 
// sezione Gestione Prezzi (listini e concorrenza).
// =============================================

function gestionePrezziModule() {
    return {
        prezziViewMode: Alpine.$persist('list'), // 'list' | 'create-listino' | 'edit-listino' | 'update-concorrenza'
        priceTab: Alpine.$persist('listini'),
        priceSort: { column: 'date', direction: 'desc' },
        editingListino: null,
        listinoForm: { 
            date: '', 
            variazione: 'Entrambi', 
            benzina: '', 
            gasolio: '', 
            dieselPlus: '', 
            hvolution: '', 
            adblue: '' 
        },
        concorrenzaForm: { 
            date: '', 
            myoil: { benzina: '', gasolio: '' }, 
            esso: { benzina: '', gasolio: '' }, 
            q8: { benzina: '', gasolio: '' } 
        },
        
        prezziTemplate: `<div class="max-w-7xl mx-auto space-y-6">
            
            <div x-show="prezziViewMode === 'list'" class="view-transition">
                <div class="border-b border-gray-200 dark:border-gray-700 mb-6 no-print">
                    <nav class="-mb-px flex space-x-8">
                        <button @click="priceTab = 'listini'" :class="priceTab === 'listini' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'" class="py-2 px-1 border-b-2 font-medium text-sm">
                            Listini Prezzi
                        </button>
                        <button @click="priceTab = 'concorrenza'" :class="priceTab === 'concorrenza' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'" class="py-2 px-1 border-b-2 font-medium text-sm">
                            Prezzi Concorrenza
                        </button>
                    </nav>
                </div>

                <div x-show="priceTab === 'listini'">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 no-print">
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Benzina Iperself</p>
                                <p x-text="formatCurrency(latestAppliedPrices().benzina, true)" class="text-2xl font-bold text-green-600 dark:text-green-400">€ 0,000</p>
                            </div>
                            <div class="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                                <i data-lucide="droplets" class="w-6 h-6 text-green-600 dark:text-green-400"></i>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Gasolio Iperself</p>
                                <p x-text="formatCurrency(latestAppliedPrices().gasolio, true)" class="text-2xl font-bold text-yellow-500 dark:text-yellow-400">€ 0,000</p>
                            </div>
                            <div class="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
                                <i data-lucide="droplets" class="w-6 h-6 text-yellow-500 dark:text-yellow-400"></i>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Diesel+ Iperself</p>
                                <p x-text="formatCurrency(latestAppliedPrices().dieselPlus, true)" class="text-2xl font-bold text-red-600 dark:text-red-400">€ 0,000</p>
                            </div>
                            <div class="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                                <i data-lucide="droplets" class="w-6 h-6 text-red-600 dark:text-red-400"></i>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Hvolution Iperself</p>
                                <p x-text="formatCurrency(latestAppliedPrices().hvolution, true)" class="text-2xl font-bold text-blue-600 dark:text-blue-400">€ 0,000</p>
                            </div>
                            <div class="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                                <i data-lucide="droplets" class="w-6 h-6 text-blue-600 dark:text-blue-400"></i>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden no-print">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Storico Listini Prezzi</h2>
                            <button @click="showCreateListino()" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center">
                                <i data-lucide="plus-circle" class="w-5 h-5 mr-2"></i> Nuovo Listino
                            </button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3">
                                            <button @click="sortPrices('date')" class="flex items-center">
                                                Data <i data-lucide="arrow-up-down" class="w-3 h-3 ml-1.5"></i>
                                            </button>
                                        </th>
                                        <th scope="col" class="px-6 py-3">Variazione</th>
                                        <th scope="col" class="px-6 py-3">Benzina</th>
                                        <th scope="col" class="px-6 py-3">Gasolio</th>
                                        <th scope="col" class="px-6 py-3">Diesel+</th>
                                        <th scope="col" class="px-6 py-3">Hvolution</th>
                                        <th scope="col" class="px-6 py-3">AdBlue</th>
                                        <th scope="col" class="px-6 py-3 text-right">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template x-for="listino in sortedPriceHistory()" :key="listino.id">
                                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white" x-text="formatDate(listino.date)"></td>
                                            <td class="px-6 py-4 text-gray-900 dark:text-white" x-text="listino.variazione || '-'"></td>
                                            <td class="px-6 py-4 font-bold text-green-600 dark:text-green-400" x-text="formatCurrency(listino.benzina, true)"></td>
                                            <td class="px-6 py-4 font-bold text-yellow-500 dark:text-yellow-400" x-text="formatCurrency(listino.gasolio, true)"></td>
                                            <td class="px-6 py-4 font-bold text-red-600 dark:text-red-400" x-text="listino.dieselPlus ? formatCurrency(listino.dieselPlus, true) : '-'"></td>
                                            <td class="px-6 py-4 font-bold text-blue-600 dark:text-blue-400" x-text="listino.hvolution ? formatCurrency(listino.hvolution, true) : '-'"></td>
                                            <td class="px-6 py-4 font-bold text-cyan-600 dark:text-cyan-400" x-text="listino.adblue ? formatCurrency(listino.adblue, true) : '-'"></td>
                                            <td class="px-6 py-4 text-right">
                                                <div class="flex items-center justify-end space-x-2">
                                                    <button @click="showEditListino(listino)" class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 p-1" title="Modifica listino">
                                                        <i data-lucide="edit" class="w-4 h-4"></i>
                                                    </button>
                                                    <button @click="deleteListino(listino.id)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1" title="Elimina listino">
                                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </template>
                                    <tr x-show="sortedPriceHistory().length === 0">
                                        <td colspan="8" class="text-center py-12">
                                            <div class="text-gray-500 dark:text-gray-400">
                                                <i data-lucide="euro" class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"></i>
                                                <p class="text-lg">Nessun listino trovato</p>
                                                <p class="text-sm">Aggiungi un nuovo listino per iniziare.</p>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div x-show="priceTab === 'concorrenza'" class="no-print">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confronto Benzina</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center p-3 bg-green-50 dark:bg-gray-700 rounded-lg">
                                    <span class="font-medium text-green-900 dark:text-green-300">MyStation</span>
                                    <span x-text="formatCurrency(currentPrices().benzina || 0, true)" class="font-bold text-green-600 dark:text-green-400">€ 0,000</span>
                                </div>
                                <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span class="font-medium text-gray-900 dark:text-gray-200">MyOil</span>
                                    <span x-text="formatCurrency(competitorPrices().myoil?.benzina || 0, true)" class="font-bold text-gray-900 dark:text-gray-200">€ 0,000</span>
                                </div>
                                <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span class="font-medium text-gray-900 dark:text-gray-200">Esso</span>
                                    <span x-text="formatCurrency(competitorPrices().esso?.benzina || 0, true)" class="font-bold text-gray-900 dark:text-gray-200">€ 0,000</span>
                                </div>
                                <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span class="font-medium text-gray-900 dark:text-gray-200">Q8</span>
                                    <span x-text="formatCurrency(competitorPrices().q8?.benzina || 0, true)" class="font-bold text-gray-900 dark:text-gray-200">€ 0,000</span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confronto Gasolio</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center p-3 bg-yellow-50 dark:bg-gray-700 rounded-lg">
                                    <span class="font-medium text-yellow-400 dark:text-yellow-400">MyStation</span>
                                    <span x-text="formatCurrency(currentPrices().gasolio || 0, true)" class="font-bold text-yellow-500 dark:text-yellow-400">€ 0,000</span>
                                </div>
                                <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span class="font-medium text-gray-900 dark:text-gray-200">MyOil</span>
                                    <span x-text="formatCurrency(competitorPrices().myoil?.gasolio || 0, true)" class="font-bold text-gray-900 dark:text-gray-200">€ 0,000</span>
                                </div>
                                <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span class="font-medium text-gray-900 dark:text-gray-200">Esso</span>
                                    <span x-text="formatCurrency(competitorPrices().esso?.gasolio || 0, true)" class="font-bold text-gray-900 dark:text-gray-200">€ 0,000</span>
                                </div>
                                <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span class="font-medium text-gray-900 dark:text-gray-200">Q8</span>
                                    <span x-text="formatCurrency(competitorPrices().q8?.gasolio || 0, true)" class="font-bold text-gray-900 dark:text-gray-200">€ 0,000</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end">
                        <button @click="showUpdateConcorrenza()" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center">
                            <i data-lucide="refresh-cw" class="w-4 h-4 mr-2"></i> Aggiorna Prezzi Concorrenza
                        </button>
                    </div>
                </div>
            </div>

            <div x-show="prezziViewMode === 'create-listino' || prezziViewMode === 'edit-listino'" class="view-transition">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-white" x-text="prezziViewMode === 'edit-listino' ? 'Modifica Listino' : 'Nuovo Listino'"></h2>
                        <button @click="backToPrezziList()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </div>
                    <div class="p-6">
                        <div class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                                <div class="relative">
                                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data</label>
                                    <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none top-6">
                                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z"/>
                                            <path d="M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                                        </svg>
                                    </div>
                                    <input datepicker datepicker-autohide datepicker-format="dd.mm.yyyy" type="text" x-model="listinoForm.date" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="gg.mm.aaaa">
                                </div>
                                <div>
                                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Variazione</label>
                                    <select x-model="listinoForm.variazione" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        <option>Aumento</option><option>Diminuzione</option><option>Entrambi</option>
                                    </select>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl">
                                <div>
                                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Benzina (€)</label>
                                    <input type="number" step="0.001" x-model.number="listinoForm.benzina" class="w-full p-2.5 text-sm rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="1.000">
                                </div>
                                <div>
                                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Gasolio (€)</label>
                                    <input type="number" step="0.001" x-model.number="listinoForm.gasolio" class="w-full p-2.5 text-sm rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="1.000">
                                </div>
                                <div>
                                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Diesel+ (€)</label>
                                    <input type="number" step="0.001" x-model.number="listinoForm.dieselPlus" class="w-full p-2.5 text-sm rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="1.000">
                                </div>
                                <div>
                                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Hvolution (€)</label>
                                    <input type="number" step="0.001" x-model.number="listinoForm.hvolution" class="w-full p-2.5 text-sm rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="1.000">
                                </div>
                                <div>
                                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">AdBlue (€)</label>
                                    <input type="number" step="0.001" x-model.number="listinoForm.adblue" class="w-full p-2.5 text-sm rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="1.000">
                                </div>
                            </div>

                            <div class="flex items-center justify-start space-x-3">
                                <button @click="saveListino()" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">
                                    Salva Listino
                                </button>
                                <button @click="backToPrezziList()" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
                                    Annulla
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div x-show="prezziViewMode === 'update-concorrenza'" class="view-transition">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Aggiorna Prezzi Concorrenza</h2>
                        <button @click="backToPrezziList()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </div>
                    <div class="p-6">
                        <div class="space-y-6">
                            <div class="relative max-w-sm">
                                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data</label>
                                <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none top-6">
                                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z"/>
                                        <path d="M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                                    </svg>
                                </div>
                                <input datepicker datepicker-autohide datepicker-format="dd.mm.yyyy" type="text" x-model="concorrenzaForm.date" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="gg.mm.aaaa">
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                                <div class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-3">
                                    <h4 class="font-medium text-gray-900 dark:text-white">MyOil</h4>
                                    <div>
                                        <label class="block text-xs text-gray-700 dark:text-gray-300 mb-1">Benzina</label>
                                        <input type="number" step="0.001" x-model.number="concorrenzaForm.myoil.benzina" class="w-full p-2 text-sm rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-700 dark:text-gray-300 mb-1">Gasolio</label>
                                        <input type="number" step="0.001" x-model.number="concorrenzaForm.myoil.gasolio" class="w-full p-2 text-sm rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white">
                                    </div>
                                </div>

                                <div class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-3">
                                    <h4 class="font-medium text-gray-900 dark:text-white">Esso</h4>
                                    <div>
                                        <label class="block text-xs text-gray-700 dark:text-gray-300 mb-1">Benzina</label>
                                        <input type="number" step="0.001" x-model.number="concorrenzaForm.esso.benzina" class="w-full p-2 text-sm rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-700 dark:text-gray-300 mb-1">Gasolio</label>
                                        <input type="number" step="0.001" x-model.number="concorrenzaForm.esso.gasolio" class="w-full p-2 text-sm rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white">
                                    </div>
                                </div>

                                <div class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-3">
                                    <h4 class="font-medium text-gray-900 dark:text-white">Q8</h4>
                                    <div>
                                        <label class="block text-xs text-gray-700 dark:text-gray-300 mb-1">Benzina</label>
                                        <input type="number" step="0.001" x-model.number="concorrenzaForm.q8.benzina" class="w-full p-2 text-sm rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-700 dark:text-gray-300 mb-1">Gasolio</label>
                                        <input type="number" step="0.001" x-model.number="concorrenzaForm.q8.gasolio" class="w-full p-2 text-sm rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white">
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center justify-start space-x-3">
                                <button @click="saveConcorrenza()" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">
                                    Salva Prezzi
                                </button>
                                <button @click="backToPrezziList()" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
                                    Annulla
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
        
        initGestionePrezzi() { 
            this.resetListinoForm(); 
            this.resetConcorrenzaForm(); 
        },
        
        // === NAVIGATION METHODS ===
        showCreateListino() {
            this.prezziViewMode = 'create-listino';
            this.editingListino = null;
            this.resetListinoForm();
            this.refreshIcons();
        },
        
        showEditListino(listino) {
            this.prezziViewMode = 'edit-listino';
            this.editingListino = { ...listino };
            this.listinoForm = { 
                date: this.formatToItalianDate(listino.date), 
                variazione: listino.variazione || 'Entrambi', 
                benzina: listino.benzina || '', 
                gasolio: listino.gasolio || '', 
                dieselPlus: listino.dieselPlus || '', 
                hvolution: listino.hvolution || '', 
                adblue: listino.adblue || '' 
            };
            this.refreshIcons();
        },
        
        showUpdateConcorrenza() {
            this.prezziViewMode = 'update-concorrenza';
            this.resetConcorrenzaForm();
            this.refreshIcons();
        },
        
        backToPrezziList() {
            this.prezziViewMode = 'list';
            this.editingListino = null;
        },

        // === SORT & FILTER ===
        sortPrices(column) { 
            if (this.priceSort.column === column) { 
                this.priceSort.direction = this.priceSort.direction === 'asc' ? 'desc' : 'asc'; 
            } else { 
                this.priceSort.column = column; 
                this.priceSort.direction = 'asc'; 
            } 
        },
        
        sortedPriceHistory() { 
            if (!Array.isArray(this.data.priceHistory)) return []; 
            return [...this.data.priceHistory].sort((a, b) => { 
                const dir = this.priceSort.direction === 'asc' ? 1 : -1; 
                return (new Date(a.date) - new Date(b.date)) * dir; 
            }); 
        },

        // === DATA PROCESSING ===
        latestAppliedPrices() { 
            const prices = this.currentPrices(); 
            const surcharge = 0.005; 
            return { 
                benzina: (prices.benzina || 0) + surcharge, 
                gasolio: (prices.gasolio || 0) + surcharge, 
                dieselPlus: prices.dieselPlus ? prices.dieselPlus + surcharge : null, 
                hvolution: prices.hvolution ? prices.hvolution + surcharge : null, 
            }; 
        },
        
        currentPrices() { 
            if (!Array.isArray(this.data.priceHistory) || this.data.priceHistory.length === 0) { 
                return { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0, adblue: 0 }; 
            } 
            return [...this.data.priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date))[0]; 
        },
        
        competitorPrices() { 
            if (!Array.isArray(this.data.competitorPrices) || this.data.competitorPrices.length === 0) { 
                return { 
                    myoil: { benzina: 0, gasolio: 0 }, 
                    esso: { benzina: 0, gasolio: 0 }, 
                    q8: { benzina: 0, gasolio: 0 } 
                }; 
            } 
            const latest = [...this.data.competitorPrices].sort((a, b) => new Date(b.date) - new Date(a.date))[0]; 
            return { 
                myoil: latest.myoil || { benzina: 0, gasolio: 0 }, 
                esso: latest.esso || { benzina: 0, gasolio: 0 }, 
                q8: latest.q8 || { benzina: 0, gasolio: 0 } 
            }; 
        },

        // === LISTINO OPERATIONS ===
        resetListinoForm() { 
            this.listinoForm = { 
                date: this.getTodayFormatted(), 
                variazione: 'Entrambi', 
                benzina: '', 
                gasolio: '', 
                dieselPlus: '', 
                hvolution: '', 
                adblue: '' 
            }; 
        },
        
        saveListino() { 
            if (!this.listinoForm.date || !this.listinoForm.benzina || !this.listinoForm.gasolio) { 
                this.showNotification('Data, prezzo benzina e gasolio sono obbligatori'); 
                return; 
            } 
            if (!this.validateItalianDate(this.listinoForm.date)) { 
                this.showNotification('Formato data non valido. Usa gg.mm.aaaa'); 
                return; 
            } 
            
            const parsedDate = this.parseItalianDate(this.listinoForm.date); 
            const listino = { 
                id: this.editingListino ? this.editingListino.id : this.generateUniqueId('listino'), 
                date: parsedDate.toISOString(), 
                variazione: this.listinoForm.variazione, 
                benzina: parseFloat(this.listinoForm.benzina) || 0, 
                gasolio: parseFloat(this.listinoForm.gasolio) || 0, 
                dieselPlus: parseFloat(this.listinoForm.dieselPlus) || null, 
                hvolution: parseFloat(this.listinoForm.hvolution) || null, 
                adblue: parseFloat(this.listinoForm.adblue) || null 
            }; 
            
            if (this.editingListino) { 
                const index = this.data.priceHistory.findIndex(l => l.id === this.editingListino.id); 
                if (index !== -1) this.data.priceHistory[index] = listino; 
            } else { 
                this.data.priceHistory.push(listino); 
            } 
            
            this.backToPrezziList();
            // AGGIUNTA: Reinizializza le icone
            this.refreshIcons();
        },
        
        deleteListino(listinoId) { 
            const listino = this.data.priceHistory.find(l => l.id === listinoId); 
            if (!listino) return; 
            this.showConfirm(`Sei sicuro di voler eliminare il listino del ${this.formatDate(listino.date)}?`, () => { 
                this.data.priceHistory = this.data.priceHistory.filter(l => l.id !== listinoId); 
                // AGGIUNTA: Reinizializza le icone
                this.refreshIcons();
            }); 
        },

        // === CONCORRENZA OPERATIONS ===
        resetConcorrenzaForm() { 
            this.concorrenzaForm = { 
                date: this.getTodayFormatted(), 
                myoil: { benzina: '', gasolio: '' }, 
                esso: { benzina: '', gasolio: '' }, 
                q8: { benzina: '', gasolio: '' } 
            }; 
        },
        
        saveConcorrenza() { 
            if (!this.concorrenzaForm.date || !this.validateItalianDate(this.concorrenzaForm.date)) { 
                this.showNotification('Data obbligatoria in formato gg.mm.aaaa'); 
                return; 
            } 
            
            const parsedDate = this.parseItalianDate(this.concorrenzaForm.date); 
            const concorrenza = { 
                id: this.generateUniqueId('concorrenza'), 
                date: parsedDate.toISOString(), 
                myoil: { 
                    benzina: parseFloat(this.concorrenzaForm.myoil.benzina) || null, 
                    gasolio: parseFloat(this.concorrenzaForm.myoil.gasolio) || null 
                }, 
                esso: { 
                    benzina: parseFloat(this.concorrenzaForm.esso.benzina) || null, 
                    gasolio: parseFloat(this.concorrenzaForm.esso.gasolio) || null 
                }, 
                q8: { 
                    benzina: parseFloat(this.concorrenzaForm.q8.benzina) || null, 
                    gasolio: parseFloat(this.concorrenzaForm.q8.gasolio) || null 
                } 
            }; 
            
            this.data.competitorPrices.push(concorrenza); 
            this.backToPrezziList();
            // AGGIUNTA: Reinizializza le icone
            this.refreshIcons();
        }
    };
}
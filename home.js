// =============================================
// FILE: home.js (versione Alpine.js)
// DESCRIZIONE: Modulo per la gestione della
// sezione Home / Dashboard.
// CORREZIONI: UTF-8 corretti e dark mode migliorato
// =============================================

function homeModule() {
    return {
        // === STATO ===
        todos: Alpine.$persist([]),
        newTodoText: '',
        calcolatrice: { display: '0', operandoPrecedente: null, operatore: null, aspettaNuovoOperando: false, ultimaOperazione: null },
        calculatorTab: Alpine.$persist('calculator'),
        ivaCalculator: { importoLordo: null, aliquota: 22, risultati: { imponibile: 0, iva: 0 } },
        calendar: { currentDate: new Date(), monthYear: '', days: [] },
        ordineCarburante: Alpine.$persist({ benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 }),
        notes: Alpine.$persist(''),
        activeEditorTool: null,
        quickTransaction: { amount: null, selectedClientId: '', description: 'Carburante' },

        // === TEMPLATE HTML ===
        homeTemplate: `
            <div class="max-w-7xl mx-auto space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div @click="switchSection('registro')" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-blue-50 dark:hover:bg-gray-700 group">
                        <div class="flex items-center justify-between mb-3">
                            <div class="bg-blue-100 dark:bg-blue-900 p-3 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors"><i data-lucide="clipboard-list" class="w-6 h-6 text-blue-600 dark:text-blue-400"></i></div>
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity"><i data-lucide="arrow-right" class="w-4 h-4 text-blue-600 dark:text-blue-400"></i></div>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Registri Carico</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" x-text="data.registryEntries?.length || 0"></p>
                            <div class="text-xs text-gray-400 dark:text-gray-500 mt-1 group-hover:text-blue-500 transition-colors" x-html="getUltimoCarico()"></div>
                        </div>
                    </div>
                    <div @click="switchSection('virtual')" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-green-50 dark:hover:bg-gray-700 group">
                        <div class="flex items-center justify-between mb-3">
                            <div class="bg-green-100 dark:bg-green-900 p-3 rounded-full group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors"><i data-lucide="euro" class="w-6 h-6 text-green-600 dark:text-green-400"></i></div>
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity"><i data-lucide="arrow-right" class="w-4 h-4 text-green-600 dark:text-green-400"></i></div>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Fatturato Oggi</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors" x-text="formatCurrency(getFatturatoOggi().totale)"></p>
                            <div class="text-xs text-gray-400 dark:text-gray-500 mt-1 space-y-0.5 group-hover:text-green-500 transition-colors">
                                <div>Imponibile: <span x-text="formatCurrency(getFatturatoOggi().imponibile)"></span></div>
                                <div>IVA: <span x-text="formatCurrency(getFatturatoOggi().iva)"></span></div>
                            </div>
                        </div>
                    </div>
                    <div @click="switchSection('amministrazione')" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-purple-50 dark:hover:bg-gray-700 group">
                        <div class="flex items-center justify-between mb-3">
                            <div class="bg-purple-100 dark:bg-purple-900 p-3 rounded-full group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors"><i data-lucide="credit-card" class="w-6 h-6 text-purple-600 dark:text-purple-400"></i></div>
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity"><i data-lucide="arrow-right" class="w-4 h-4 text-purple-600 dark:text-purple-400"></i></div>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Ultime Transazioni</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors" x-text="getTotalTransactions()"></p>
                            <div class="text-xs text-gray-400 dark:text-gray-500 mt-1 space-y-0.5 group-hover:text-purple-500 transition-colors" x-html="getUltimeTransazioni()"></div>
                        </div>
                    </div>
                    <div @click="switchSection('virtual')" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-yellow-50 dark:hover:bg-gray-700 group">
                        <div class="flex items-center justify-between mb-3">
                            <div class="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800 transition-colors"><i data-lucide="droplets" class="w-6 h-6 text-yellow-600 dark:text-yellow-400"></i></div>
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity"><i data-lucide="arrow-right" class="w-4 h-4 text-yellow-600 dark:text-yellow-400"></i></div>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">Litri Venduti Oggi</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-yellow-700 dark:group-hover:text-yellow-300 transition-colors" x-text="formatInteger(getLitriVenduti().totale)"></p>
                            <div class="text-xs text-gray-400 dark:text-gray-500 mt-1 space-y-0.5 group-hover:text-yellow-500 transition-colors">
                                <div>Benzina: <span x-text="formatInteger(getLitriVenduti().benzina)"></span>L</div>
                                <div>Gasolio: <span x-text="formatInteger(getLitriVenduti().gasolio)"></span>L</div>
                                <div>Diesel+: <span x-text="formatInteger(getLitriVenduti().dieselPlus)"></span>L</div>
                                <div>Hvolution: <span x-text="formatInteger(getLitriVenduti().hvolution)"></span>L</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div class="flex items-center"><i data-lucide="zap" class="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2"></i><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Transazione Rapida</h3></div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Registra velocemente un addebito per un cliente</p>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Importo (€)</label><div class="relative"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span class="text-gray-500 dark:text-gray-400">€</span></div><input type="number" x-model.number="quickTransaction.amount" step="0.01" placeholder="0.00" class="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"></div></div>
                            <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cliente</label><select x-model="quickTransaction.selectedClientId" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"><option value="">Seleziona cliente...</option><template x-for="client in data.clients || []" :key="client.id"><option :value="client.id" x-text="client.name"></option></template></select></div>
                            <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrizione</label><input type="text" x-model="quickTransaction.description" placeholder="Descrizione transazione" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"></div>
                            <div><button @click="addQuickTransaction()" :disabled="!quickTransaction.amount || !quickTransaction.selectedClientId" :class="(!quickTransaction.amount || !quickTransaction.selectedClientId) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'" class="w-full bg-red-600 text-white py-2.5 px-4 rounded-lg font-medium flex items-center justify-center"><i data-lucide="minus-circle" class="w-4 h-4 mr-2"></i> Addebita</button></div>
                        </div>
                        <div class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div class="flex items-start">
                                <i data-lucide="info" class="w-4 h-4 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0"></i>
                                <div class="text-sm text-red-700 dark:text-red-300">
                                    <p class="font-medium">Nota:</p><p>La transazione verrà registrata come <strong>addebito</strong> (importo negativo) sul conto del cliente selezionato.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="space-y-6">
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div class="p-4 border-b border-gray-200 dark:border-gray-700"><div class="flex items-center justify-between"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Calendario</h3><div class="flex items-center space-x-2"><button @click="changeMonth(-1)" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><i data-lucide="chevron-left" class="w-4 h-4 text-gray-600 dark:text-gray-400"></i></button><span x-text="calendar.monthYear" class="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[100px] text-center"></span><button @click="changeMonth(1)" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><i data-lucide="chevron-right" class="w-4 h-4 text-gray-600 dark:text-gray-400"></i></button></div></div></div>
                            <div class="p-4"><div class="grid grid-cols-7 gap-1 text-center"><div class="text-xs font-medium text-gray-500 dark:text-gray-400 p-2">Lun</div><div class="text-xs font-medium text-gray-500 dark:text-gray-400 p-2">Mar</div><div class="text-xs font-medium text-gray-500 dark:text-gray-400 p-2">Mer</div><div class="text-xs font-medium text-gray-500 dark:text-gray-400 p-2">Gio</div><div class="text-xs font-medium text-gray-500 dark:text-gray-400 p-2">Ven</div><div class="text-xs font-medium text-gray-500 dark:text-gray-400 p-2">Sab</div><div class="text-xs font-medium text-red-500 dark:text-red-400 p-2 font-semibold">Dom</div><template x-for="day in calendar.days"><div class="p-2 text-xs cursor-pointer rounded aspect-square flex items-center justify-center" :class="{ 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-bold': day.isToday, 'hover:bg-gray-100 dark:hover:bg-gray-700': day.value && !day.isToday && !day.isHoliday && !day.isSunday, 'text-gray-900 dark:text-gray-100': day.value && !day.isHoliday && !day.isSunday, 'text-red-600 dark:text-red-400 font-semibold': day.isHoliday || day.isSunday, 'hover:bg-red-50 dark:hover:bg-red-900/20': (day.isHoliday || day.isSunday) && day.value && !day.isToday }" x-text="day.value"></div></template></div></div>
                        </div>

                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div class="border-b border-gray-200 dark:border-gray-700"><nav class="-mb-px flex"><button @click="calculatorTab = 'calculator'" :class="calculatorTab === 'calculator' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'" class="w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors"><i data-lucide="calculator" class="w-4 h-4 inline mr-2"></i> Calcolatrice</button><button @click="calculatorTab = 'iva'" :class="calculatorTab === 'iva' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'" class="w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors"><i data-lucide="percent" class="w-4 h-4 inline mr-2"></i> IVA</button></nav></div>
                            <div x-show="calculatorTab === 'calculator'" class="p-4">
                                <div class="mb-4"><input type="text" :value="calcolatrice.display" readonly class="w-full text-right text-2xl font-mono font-bold bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"></div>
                                <div class="grid grid-cols-4 gap-2">
                                    <button @click="clearEntry()" class="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded text-sm">CE</button>
                                    <button @click="clearCalcolatrice()" class="bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 text-red-800 dark:text-red-200 font-semibold py-3 px-4 rounded text-sm">C</button>
                                    <button @click="backspace()" class="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded text-sm">←</button>
                                    <button @click="inputOperatore('/')" class="bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 font-semibold py-3 px-4 rounded text-sm">÷</button>
                                    <button @click="inputNumero(7)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">7</button>
                                    <button @click="inputNumero(8)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">8</button>
                                    <button @click="inputNumero(9)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">9</button>
                                    <button @click="inputOperatore('*')" class="bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 font-semibold py-3 px-4 rounded text-sm">×</button>
                                    <button @click="inputNumero(4)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">4</button>
                                    <button @click="inputNumero(5)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">5</button>
                                    <button @click="inputNumero(6)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">6</button>
                                    <button @click="inputOperatore('-')" class="bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 font-semibold py-3 px-4 rounded text-sm">-</button>
                                    <button @click="inputNumero(1)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">1</button>
                                    <button @click="inputNumero(2)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">2</button>
                                    <button @click="inputNumero(3)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">3</button>
                                    <button @click="inputOperatore('+')" class="bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 font-semibold py-3 px-4 rounded text-sm">+</button>
                                    <button @click="inputNumero(0)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded col-span-2">0</button>
                                    <button @click="inputPunto()" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">.</button>
                                    <button @click="calcolaRisultato()" class="bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700 text-green-800 dark:text-green-200 font-semibold py-3 px-4 rounded text-sm">=</button>
                                </div>
                            </div>
                            <div x-show="calculatorTab === 'iva'" class="p-4 space-y-4">
                                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Importo Lordo (€)</label><input type="number" x-model.number="ivaCalculator.importoLordo" step="0.01" placeholder="0.00" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"></div>
                                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aliquota IVA (%)</label><select x-model.number="ivaCalculator.aliquota" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"><option value="4">4%</option><option value="5">5%</option><option value="10">10%</option><option value="22">22%</option></select></div>
                                <button @click="calcolaIva()" class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center"><i data-lucide="calculator" class="w-4 h-4 mr-2"></i> Calcola IVA</button>
                                <div class="space-y-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"><div class="flex justify-between"><span class="text-sm text-gray-600 dark:text-gray-400">Imponibile:</span><span x-text="formatCurrency(ivaCalculator.risultati.imponibile)" class="text-sm font-medium text-gray-900 dark:text-gray-100"></span></div><div class="flex justify-between"><span class="text-sm text-gray-600 dark:text-gray-400">IVA:</span><span x-text="formatCurrency(ivaCalculator.risultati.iva)" class="text-sm font-medium text-gray-900 dark:text-gray-100"></span></div><hr class="border-gray-300 dark:border-gray-600"><div class="flex justify-between"><span class="text-sm font-semibold text-gray-900 dark:text-gray-100">Totale Lordo:</span><span x-text="formatCurrency((ivaCalculator.risultati.imponibile || 0) + (ivaCalculator.risultati.iva || 0))" class="text-sm font-bold text-blue-600 dark:text-blue-400"></span></div></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-6">
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div class="p-4 border-b border-gray-200 dark:border-gray-700"><div class="flex items-center justify-between"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Note</h3><button @click="clearNotes()" class="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"><i data-lucide="eraser" class="w-4 h-4"></i></button></div></div>
                            <div class="p-4">
                                <div class="flex items-center space-x-1 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                                    <button @click="formatText('bold')" :class="activeEditorTool === 'bold' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'" class="p-2 rounded text-sm font-bold text-gray-700 dark:text-gray-300" title="Grassetto"><i data-lucide="bold" class="w-4 h-4"></i></button>
                                    <button @click="formatText('italic')" :class="activeEditorTool === 'italic' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'" class="p-2 rounded text-sm italic text-gray-700 dark:text-gray-300" title="Corsivo"><i data-lucide="italic" class="w-4 h-4"></i></button>
                                    <button @click="formatText('underline')" :class="activeEditorTool === 'underline' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'" class="p-2 rounded text-sm underline text-gray-700 dark:text-gray-300" title="Sottolineato"><i data-lucide="underline" class="w-4 h-4"></i></button>
                                    <div class="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                                    <button @click="formatText('insertUnorderedList')" :class="activeEditorTool === 'insertUnorderedList' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'" class="p-2 rounded text-sm text-gray-700 dark:text-gray-300" title="Elenco puntato"><i data-lucide="list" class="w-4 h-4"></i></button>
                                    <button @click="formatText('insertOrderedList')" :class="activeEditorTool === 'insertOrderedList' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'" class="p-2 rounded text-sm text-gray-700 dark:text-gray-300" title="Elenco numerato"><i data-lucide="list-ordered" class="w-4 h-4"></i></button>
                                    <div class="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                                    <button @click="formatText('strikeThrough')" :class="activeEditorTool === 'strikeThrough' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'" class="p-2 rounded text-sm text-gray-700 dark:text-gray-300" title="Barrato"><i data-lucide="strikethrough" class="w-4 h-4"></i></button>
                                </div>
                                <div x-ref="notesEditor" @input="notes = $event.target.innerHTML" @focus="$refs.notesEditor.innerHTML = notes" contenteditable="true" class="w-full min-h-[150px] max-h-64 overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm" :placeholder="notes === '' ? 'Scrivi le tue note qui...' : ''" x-html="notes"></div>
                                <div class="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400"><span>Usa la toolbar per formattare il testo</span><span x-text="getNotesLength() + ' caratteri'"></span></div>
                            </div>
                        </div>

                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div class="p-4 border-b border-gray-200 dark:border-gray-700"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Todo List</h3></div>
                            <div class="p-4">
                                <div class="flex mb-4">
                                    <input type="text" x-model="newTodoText" @keydown.enter="addTodo()" placeholder="Aggiungi una nuova attività..." class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm">
                                    <button @click="addTodo()" class="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"><i data-lucide="plus" class="w-4 h-4"></i></button>
                                </div>
                                <div class="space-y-2 max-h-96 overflow-y-auto">
                                    <template x-if="todos.length === 0"><p class="text-gray-500 dark:text-gray-400 text-sm">Nessuna attività</p></template>
                                    <template x-for="todo in todos" :key="todo.id">
                                        <div class="flex items-center p-2 rounded border" :class="todo.completed ? 'bg-gray-50 dark:bg-gray-900/50' : 'bg-white dark:bg-gray-800'" class="border-gray-200 dark:border-gray-700">
                                            <input type="checkbox" @change="toggleTodo(todo.id)" :checked="todo.completed" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mr-3">
                                            <span class="flex-1 text-sm" :class="todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'" x-text="todo.text"></span>
                                            <button @click="deleteTodo(todo.id)" class="ml-2 p-1 text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div class="space-y-6">
                       <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div class="p-4 border-b border-gray-200 dark:border-gray-700"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Calcolo Ordine Carburante</h3></div>
                            <div class="p-4 space-y-4"><div class="flex items-center justify-between p-3 bg-green-50 dark:bg-gray-900 rounded-lg"><i data-lucide="droplet" class="w-8 h-8 text-green-600 dark:text-green-400"></i><div class="relative flex items-center"><button @click="decrementCarburante('benzina')" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-s-lg p-3 h-11"><i data-lucide="minus" class="w-3 h-3 text-gray-900 dark:text-white"></i></button><input type="text" :value="formatInteger(ordineCarburante.benzina)" readonly class="bg-gray-50 dark:bg-gray-700 border-y border-gray-300 dark:border-gray-600 h-11 text-center text-sm w-16 dark:text-white"><button @click="incrementCarburante('benzina')" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-e-lg p-3 h-11"><i data-lucide="plus" class="w-3 h-3 text-gray-900 dark:text-white"></i></button></div><div class="w-20 text-right"><span x-text="formatCurrency(calcolaImportoCarburante('benzina'))" class="text-sm font-bold text-green-400"></span></div></div><div class="flex items-center justify-between p-3 bg-yellow-50 dark:bg-gray-900 rounded-lg"><i data-lucide="droplet" class="w-8 h-8 text-yellow-500 dark:text-yellow-400"></i><div class="relative flex items-center"><button @click="decrementCarburante('gasolio')" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-s-lg p-3 h-11"><i data-lucide="minus" class="w-3 h-3 text-gray-900 dark:text-white"></i></button><input type="text" :value="formatInteger(ordineCarburante.gasolio)" readonly class="bg-gray-50 dark:bg-gray-700 border-y border-gray-300 dark:border-gray-600 h-11 text-center text-sm w-16 dark:text-white"><button @click="incrementCarburante('gasolio')" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-e-lg p-3 h-11"><i data-lucide="plus" class="w-3 h-3 text-gray-900 dark:text-white"></i></button></div><div class="w-20 text-right"><span x-text="formatCurrency(calcolaImportoCarburante('gasolio'))" class="text-sm font-bold text-yellow-400"></span></div></div><div class="flex items-center justify-between p-3 bg-red-50 dark:bg-gray-900 rounded-lg"><i data-lucide="droplet" class="w-8 h-8 text-red-600 dark:text-red-400"></i><div class="relative flex items-center"><button @click="decrementCarburante('dieselPlus')" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-s-lg p-3 h-11"><i data-lucide="minus" class="w-3 h-3 text-gray-900 dark:text-white"></i></button><input type="text" :value="formatInteger(ordineCarburante.dieselPlus)" readonly class="bg-gray-50 dark:bg-gray-700 border-y border-gray-300 dark:border-gray-600 h-11 text-center text-sm w-16 dark:text-white"><button @click="incrementCarburante('dieselPlus')" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-e-lg p-3 h-11"><i data-lucide="plus" class="w-3 h-3 text-gray-900 dark:text-white"></i></button></div><div class="w-20 text-right"><span x-text="formatCurrency(calcolaImportoCarburante('dieselPlus'))" class="text-sm font-bold text-red-600 dark:text-red-400"></span></div></div><div class="flex items-center justify-between p-3 bg-blue-50 dark:bg-gray-900 rounded-lg"><i data-lucide="droplet" class="w-8 h-8 text-blue-600 dark:text-blue-400"></i><div class="relative flex items-center"><button @click="decrementCarburante('hvolution')" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-s-lg p-3 h-11"><i data-lucide="minus" class="w-3 h-3 text-gray-900 dark:text-white"></i></button><input type="text" :value="formatInteger(ordineCarburante.hvolution)" readonly class="bg-gray-50 dark:bg-gray-700 border-y border-gray-300 dark:border-gray-600 h-11 text-center text-sm w-14 dark:text-white"><button @click="incrementCarburante('hvolution')" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-e-lg p-3 h-11"><i data-lucide="plus" class="w-3 h-3 text-gray-900 dark:text-white"></i></button></div><div class="w-20 text-right"><span x-text="formatCurrency(calcolaImportoCarburante('hvolution'))" class="text-sm font-bold text-blue-600 dark:text-blue-400"></span></div></div><div class="border-t border-gray-200 dark:border-gray-600 pt-4"><div class="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"><span class="text-lg font-bold text-gray-900 dark:text-gray-100">Totale</span><div class="flex items-center space-x-4"><div class="text-right"><div class="text-sm text-gray-600 dark:text-gray-400">Litri:</div><span x-text="formatInteger(getTotaleLitri())" class="text-lg font-bold text-gray-900 dark:text-gray-100"></span></div><div class="text-right"><div class="text-sm text-gray-600 dark:text-gray-400">Importo:</div><span x-text="formatCurrency(getTotaleImporto())" class="text-lg font-bold text-blue-600 dark:text-blue-400"></span></div></div></div></div><div class="flex space-x-2 pt-4"><button @click="resetOrdineCarburante()" class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 text-sm">Reset</button><button @click="stampaOrdineCarburante()" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm">Stampa</button></div></div>
                        </div>
                    </div>
                </div>
            </div>
        `,

        // === METODI ===
        initHome() {
            this.renderCalendar();
            this.$watch('calendar.currentDate', () => this.renderCalendar());
            this.quickTransaction = { amount: null, selectedClientId: '', description: 'Carburante' };
        },
        
        addQuickTransaction() {
            if (!this.quickTransaction.amount || this.quickTransaction.amount <= 0) { 
                this.showNotification('Inserire un importo valido.'); 
                return; 
            }
            if (!this.quickTransaction.selectedClientId) { 
                this.showNotification('Selezionare un cliente.'); 
                return; 
            }
            
            const clientIndex = this.data.clients.findIndex(c => c.id === this.quickTransaction.selectedClientId);
            if (clientIndex === -1) { 
                this.showNotification('Cliente non trovato.'); 
                return; 
            }
            
            const cliente = this.data.clients[clientIndex];
            const nuovaTransazione = { 
                id: this.generateUniqueId('quick_tx'), 
                date: new Date().toISOString(), 
                description: this.quickTransaction.description || 'Carburante', 
                amount: -Math.abs(this.quickTransaction.amount) 
            };
            
            const clienteAggiornato = { 
                ...cliente, 
                balance: cliente.balance - Math.abs(this.quickTransaction.amount), 
                transactions: [...cliente.transactions, nuovaTransazione] 
            };
            
            this.data.clients[clientIndex] = clienteAggiornato;
            this.showNotification(`Addebito di ${this.formatCurrency(this.quickTransaction.amount)} registrato per ${cliente.name}`);
            this.quickTransaction = { amount: null, selectedClientId: '', description: 'Carburante' };
            this.refreshIcons();
        },

        getUltimoCarico() {
            if (!this.data.registryEntries || this.data.registryEntries.length === 0) return "Nessun carico";
            const ultimoCarico = [...this.data.registryEntries].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            const dataFormatted = this.formatDate(ultimoCarico.date);
            const prodotti = [];
            ['benzina', 'gasolio', 'dieselPlus', 'hvolution'].forEach(p => { 
                if (ultimoCarico[p]?.carico > 0) prodotti.push(`${p.charAt(0).toUpperCase() + p.slice(1)}: ${this.formatInteger(ultimoCarico[p].carico)}L`); 
            });
            return `${dataFormatted}<br>${prodotti.join('<br>') || 'Nessun prodotto'}`;
        },

        getFatturatoOggi() {
            if (!Array.isArray(this.data.turni)) { 
                return { totale: 0, imponibile: 0, iva: 0 }; 
            }
            const oggi = new Date();
            oggi.setHours(0, 0, 0, 0);
            const turniOggi = this.data.turni.filter(turno => new Date(turno.date) >= oggi);
            const prezziCorrente = this.currentPrices();
            let totaleImponibile = 0;
            
            turniOggi.forEach(turno => {
                const products = ['benzina', 'gasolio', 'dieselPlus', 'hvolution', 'adblue'];
                products.forEach(product => {
                    const iperselfLiters = this.getProductValue(turno.iperself, product) || 0;
                    const servitoLiters = this.getProductValue(turno.servito, product) || 0;
                    const basePrice = prezziCorrente[product] || 0;
                    if (basePrice > 0) {
                        if (product === 'adblue') {
                            totaleImponibile += servitoLiters * basePrice;
                        } else {
                            const iperselfPrice = basePrice + 0.005;
                            const servitoPrice = basePrice + 0.210 + 0.015;
                            totaleImponibile += (iperselfLiters * iperselfPrice) + (servitoLiters * servitoPrice);
                        }
                    }
                });
            });
            
            const iva = totaleImponibile * 0.22;
            const totale = totaleImponibile + iva;
            return { totale, imponibile: totaleImponibile, iva };
        },

        getTotalTransactions() { 
            return this.data.clients?.reduce((total, client) => total + (client.transactions?.length || 0), 0) || 0; 
        },

        getUltimeTransazioni() {
            if (!this.data.clients) return "Nessuna transazione";
            const tutteTransazioni = this.data.clients.flatMap(c => c.transactions?.map(tx => ({ ...tx, clienteName: c.name })) || []);
            return tutteTransazioni.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4).map(tx => `<div>${tx.clienteName}: <span class="${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}">${this.formatCurrency(tx.amount)}</span></div>`).join('');
        },

        getLitriVenduti() {
            const res = { totale: 0, benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 };
            if (!this.data.turni) return res;
            const oggi = new Date(); 
            oggi.setHours(0, 0, 0, 0);
            this.data.turni.filter(t => new Date(t.date) >= oggi).forEach(turno => {
                Object.keys(res).forEach(p => {
                    if (p !== 'totale') {
                        const litri = (this.getProductValue(turno.iperself, p) || 0) + (this.getProductValue(turno.servito, p) || 0);
                        res[p] += litri;
                        res.totale += litri;
                    }
                });
            });
            return res;
        },

        currentPrices() {
            if (!this.data.priceHistory || this.data.priceHistory.length === 0) return {};
            return [...this.data.priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        },

        getProductValue(data, prod) {
            if (!data) return 0;
            if (prod === 'dieselPlus') return parseFloat(data.dieselPlus || data.dieselplus || 0);
            return parseFloat(data[prod] || 0);
        },

        formatText(cmd) { 
            document.execCommand(cmd, false, null); 
            this.notes = this.$refs.notesEditor.innerHTML; 
            this.$refs.notesEditor.focus(); 
        },

        clearNotes() { 
            this.showConfirm('Cancellare tutte le note?', () => { 
                this.notes = ''; 
                this.$refs.notesEditor.innerHTML = ''; 
                this.showNotification('Note cancellate'); 
            }); 
        },

        getNotesLength() { 
            const div = document.createElement('div'); 
            div.innerHTML = this.notes; 
            return div.textContent?.length || 0; 
        },

        addTodo() { 
            if (this.newTodoText.trim() === '') return; 
            this.todos.unshift({ 
                id: `todo_${Date.now()}`, 
                text: this.newTodoText.trim(), 
                completed: false 
            }); 
            this.newTodoText = ''; 
            this.showNotification('Attività aggiunta'); 
        },

        toggleTodo(id) { 
            const todo = this.todos.find(t => t.id === id); 
            if (todo) todo.completed = !todo.completed; 
        },

        deleteTodo(id) { 
            this.todos = this.todos.filter(t => t.id !== id); 
            this.showNotification('Attività eliminata'); 
        },

        calcolaIva() { 
            const lordo = parseFloat(this.ivaCalculator.importoLordo); 
            if (isNaN(lordo) || lordo <= 0) { 
                this.showNotification('Importo non valido.'); 
                return; 
            } 
            const aliquota = this.ivaCalculator.aliquota / 100; 
            this.ivaCalculator.risultati.imponibile = lordo / (1 + aliquota); 
            this.ivaCalculator.risultati.iva = lordo - this.ivaCalculator.risultati.imponibile; 
        },

        calcolaPasqua(anno) { 
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
            const mese = Math.floor((h + l - 7 * m + 114) / 31);
            const giorno = ((h + l - 7 * m + 114) % 31) + 1; 
            return new Date(anno, mese - 1, giorno); 
        },

        isFestivaItaliana(data) { 
            const g = data.getDate();
            const m = data.getMonth() + 1;
            const a = data.getFullYear(); 
            if ([{ g: 1, m: 1 }, { g: 6, m: 1 }, { g: 25, m: 4 }, { g: 1, m: 5 }, { g: 2, m: 6 }, { g: 15, m: 8 }, { g: 1, m: 11 }, { g: 8, m: 12 }, { g: 25, m: 12 }, { g: 26, m: 12 }].some(f => f.g === g && f.m === m)) return true; 
            const p = this.calcolaPasqua(a);
            const l = new Date(p); 
            l.setDate(p.getDate() + 1); 
            const d = new Date(a, m - 1, g); 
            return d.getTime() === p.getTime() || d.getTime() === l.getTime(); 
        },

        isDomenica(data) { 
            return data.getDay() === 0; 
        },

        renderCalendar() {
            const date = this.calendar.currentDate;
            const year = date.getFullYear();
            const month = date.getMonth();
            this.calendar.monthYear = `${['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'][month]} ${year}`;
            const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
            const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
            let days = Array(firstDayIndex).fill({ value: '' });
            const oggi = new Date();
            
            for (let i = 1; i <= lastDateOfMonth; i++) {
                const d = new Date(year, month, i);
                days.push({ 
                    value: i, 
                    isToday: i === oggi.getDate() && month === oggi.getMonth() && year === oggi.getFullYear(), 
                    isHoliday: this.isFestivaItaliana(d), 
                    isSunday: this.isDomenica(d) 
                });
            }
            this.calendar.days = days;
        },

        changeMonth(offset) { 
            this.calendar.currentDate = new Date(this.calendar.currentDate.setMonth(this.calendar.currentDate.getMonth() + offset)); 
        },

        inputNumero(n) { 
            if (this.calcolatrice.aspettaNuovoOperando) { 
                this.calcolatrice.display = String(n); 
                this.calcolatrice.aspettaNuovoOperando = false; 
            } else { 
                this.calcolatrice.display = this.calcolatrice.display === '0' ? String(n) : this.calcolatrice.display + n; 
            } 
        },

        inputPunto() { 
            if (this.calcolatrice.display.indexOf('.') === -1) this.calcolatrice.display += '.'; 
        },

        inputOperatore(op) { 
            const val = parseFloat(this.calcolatrice.display); 
            if (this.calcolatrice.operandoPrecedente === null) { 
                this.calcolatrice.operandoPrecedente = val; 
            } else if (this.calcolatrice.operatore) { 
                const res = this.eseguiCalcolo(); 
                this.calcolatrice.display = String(res); 
                this.calcolatrice.operandoPrecedente = res; 
            } 
            this.calcolatrice.aspettaNuovoOperando = true; 
            this.calcolatrice.operatore = op; 
        },

        eseguiCalcolo() { 
            const prec = this.calcolatrice.operandoPrecedente;
            const curr = parseFloat(this.calcolatrice.display); 
            if (prec === null || !this.calcolatrice.operatore) return curr; 
            switch (this.calcolatrice.operatore) { 
                case '+': return prec + curr; 
                case '-': return prec - curr; 
                case '*': return prec * curr; 
                case '/': return curr !== 0 ? prec / curr : 0; 
                default: return curr; 
            } 
        },

        calcolaRisultato() { 
            if (this.calcolatrice.operatore && !this.calcolatrice.aspettaNuovoOperando) { 
                const res = this.eseguiCalcolo(); 
                this.calcolatrice.display = String(res); 
                this.calcolatrice.operandoPrecedente = null; 
                this.calcolatrice.operatore = null; 
                this.calcolatrice.aspettaNuovoOperando = true; 
            } 
        },

        clearCalcolatrice() { 
            this.calcolatrice = { display: '0', operandoPrecedente: null, operatore: null, aspettaNuovoOperando: false }; 
        },

        clearEntry() { 
            this.calcolatrice.display = '0'; 
        },

        backspace() { 
            this.calcolatrice.display = this.calcolatrice.display.length > 1 ? this.calcolatrice.display.slice(0, -1) : '0'; 
        },

        incrementCarburante(p) { 
            this.ordineCarburante[p] += 1000; 
        },

        decrementCarburante(p) { 
            if (this.ordineCarburante[p] >= 1000) this.ordineCarburante[p] -= 1000; 
        },

        getPrezzoApplicato(p) { 
            return this.currentPrices()[p] || 0; 
        },

        calcolaImportoCarburante(p) { 
            return (this.ordineCarburante[p] || 0) * this.getPrezzoApplicato(p); 
        },

        getTotaleLitri() { 
            return Object.values(this.ordineCarburante).reduce((t, l) => t + l, 0); 
        },

        getTotaleImporto() { 
            return Object.keys(this.ordineCarburante).reduce((t, p) => t + this.calcolaImportoCarburante(p), 0); 
        },

        resetOrdineCarburante() { 
            this.ordineCarburante = { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 }; 
            this.showNotification('Ordine resettato.'); 
        },

        stampaOrdineCarburante() {
            const totLitri = this.getTotaleLitri();
            if (totLitri === 0) { 
                this.showNotification('Nessun prodotto selezionato.'); 
                return; 
            }
            
            const data = this.getTodayFormatted();
            let content = `<div style="font-family: Arial, sans-serif; padding: 20px;"><h1 style="text-align: center;">ORDINE CARBURANTE</h1><p style="text-align: center;">Data: ${data}</p><table style="width: 100%; border-collapse: collapse;"><thead><tr style="background-color: #f5f5f5;"><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Prodotto</th><th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Litri</th><th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Prezzo/L</th><th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Importo</th></tr></thead><tbody>`;
            
            ['benzina', 'gasolio', 'dieselPlus', 'hvolution'].forEach(p => {
                const litri = this.ordineCarburante[p];
                if (litri > 0) {
                    const prezzo = this.getPrezzoApplicato(p);
                    const importo = litri * prezzo;
                    content += `<tr><td style="border: 1px solid #ddd; padding: 8px;">${p.charAt(0).toUpperCase() + p.slice(1)}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatInteger(litri)}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatCurrency(prezzo, true)}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatCurrency(importo)}</td></tr>`;
                }
            });
            
            content += `</tbody><tfoot><tr style="background-color: #f0f0f0; font-weight: bold;"><td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;">TOTALE</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatCurrency(this.getTotaleImporto())}</td></tr></tfoot></table></div>`;
            
            const win = window.open('', '_blank');
            win.document.write(`<html><head><title>Ordine Carburante</title></head><body>${content}</body></html>`);
            win.document.close();
            win.print();
        }
    };
}
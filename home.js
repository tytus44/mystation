// =============================================
// FILE: home.js (versione Alpine.js)
// DESCRIZIONE: Modulo per la gestione della
// sezione Home / Dashboard con layout 3 colonne.
// =============================================

function homeModule() {
    return {
        // === STATO DELLA TODO LIST (PERSISTENTE) ===
        todos: Alpine.$persist([]),
        newTodoText: '',

        // === STATO DELLA CALCOLATRICE ===
        calcolatrice: {
            display: '0',
            operandoPrecedente: null,
            operatore: null,
            aspettaNuovoOperando: false,
            ultimaOperazione: null
        },

        // === STATO DEL CALCOLATORE IVA ===
        ivaCalculator: {
            importoLordo: null,
            aliquota: 22,
            risultati: {
                imponibile: 0,
                iva: 0,
            }
        },

        // === STATO DEL CALENDARIO ===
        calendar: {
            currentDate: new Date(),
            monthYear: '',
            days: []
        },

        // === NUOVO: STATO CALCOLO ORDINE CARBURANTE ===
        ordineCarburante: Alpine.$persist({
            benzina: 0,
            gasolio: 0,
            dieselPlus: 0,
            hvolution: 0
        }),

        // === TEMPLATE HTML PER LA SEZIONE HOME ===
        homeTemplate: `
            <div class="max-w-7xl mx-auto space-y-6">
                <!-- Azioni Rapide - Cards Selezionabili -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Card Registri Carico -->
                    <div @click="switchSection('registro')" 
                         class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-between cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-blue-50 dark:hover:bg-gray-700 group">
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Registri Carico</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" x-text="data.registryEntries.length"></p>
                            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 group-hover:text-blue-500 transition-colors">Clicca per gestire</p>
                        </div>
                        <div class="bg-blue-100 dark:bg-blue-900 p-3 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors relative">
                            <i data-lucide="clipboard-list" class="w-6 h-6 text-blue-600 dark:text-blue-400"></i>
                            <i data-lucide="arrow-right" class="w-4 h-4 text-blue-600 dark:text-blue-400 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                    </div>

                    <!-- Card Clienti Attivi -->
                    <div @click="switchSection('amministrazione')" 
                         class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-between cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-green-50 dark:hover:bg-gray-700 group">
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Clienti Attivi</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors" x-text="data.clients.length"></p>
                            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 group-hover:text-green-500 transition-colors">Clicca per gestire</p>
                        </div>
                        <div class="bg-green-100 dark:bg-green-900 p-3 rounded-full group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors relative">
                            <i data-lucide="users" class="w-6 h-6 text-green-600 dark:text-green-400"></i>
                            <i data-lucide="arrow-right" class="w-4 h-4 text-green-600 dark:text-green-400 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                    </div>

                    <!-- Card Turni Virtuali -->
                    <div @click="switchSection('virtual')" 
                         class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-between cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-purple-50 dark:hover:bg-gray-700 group">
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Turni Virtuali</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors" x-text="data.turni.length"></p>
                            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 group-hover:text-purple-500 transition-colors">Clicca per gestire</p>
                        </div>
                        <div class="bg-purple-100 dark:bg-purple-900 p-3 rounded-full group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors relative">
                            <i data-lucide="activity" class="w-6 h-6 text-purple-600 dark:text-purple-400"></i>
                            <i data-lucide="arrow-right" class="w-4 h-4 text-purple-600 dark:text-purple-400 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                    </div>

                    <!-- Card Listini Prezzi -->
                    <div @click="switchSection('prezzi')" 
                         class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-between cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-yellow-50 dark:hover:bg-gray-700 group">
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">Listini Prezzi</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-yellow-700 dark:group-hover:text-yellow-300 transition-colors" x-text="data.priceHistory.length"></p>
                            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 group-hover:text-yellow-500 transition-colors">Clicca per gestire</p>
                        </div>
                        <div class="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800 transition-colors relative">
                            <i data-lucide="euro" class="w-6 h-6 text-yellow-600 dark:text-yellow-400"></i>
                            <i data-lucide="arrow-right" class="w-4 h-4 text-yellow-600 dark:text-yellow-400 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                    </div>
                </div>

                <!-- LAYOUT A 3 COLONNE -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <!-- COLONNA 1: CALENDARIO + TODO LIST -->
                    <div class="space-y-6">
                        <!-- Calendario -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Calendario</h3>
                                    <div class="flex items-center space-x-2">
                                        <button @click="changeMonth(-1)" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <i data-lucide="chevron-left" class="w-4 h-4 text-gray-600 dark:text-gray-400"></i>
                                        </button>
                                        <span x-text="calendar.monthYear" class="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[100px] text-center"></span>
                                        <button @click="changeMonth(1)" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <i data-lucide="chevron-right" class="w-4 h-4 text-gray-600 dark:text-gray-400"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="p-4">
                                <div class="grid grid-cols-7 gap-1 text-center">
                                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 p-2">Lun</div>
                                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 p-2">Mar</div>
                                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 p-2">Mer</div>
                                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 p-2">Gio</div>
                                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 p-2">Ven</div>
                                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 p-2">Sab</div>
                                    <div class="text-xs font-medium text-red-500 dark:text-red-400 p-2 font-semibold">Dom</div>
                                    <template x-for="day in calendar.days">
                                        <div class="p-2 text-xs cursor-pointer rounded aspect-square flex items-center justify-center" 
                                             :class="{ 
                                                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-bold': day.isToday,
                                                'hover:bg-gray-100 dark:hover:bg-gray-700': day.value && !day.isToday && !day.isHoliday && !day.isSunday,
                                                'text-gray-900 dark:text-gray-100': day.value && !day.isHoliday && !day.isSunday,
                                                'text-red-600 dark:text-red-400 font-semibold': day.isHoliday || day.isSunday,
                                                'hover:bg-red-50 dark:hover:bg-red-900/20': (day.isHoliday || day.isSunday) && day.value && !day.isToday
                                             }" 
                                             x-text="day.value">
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <!-- Todo List -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Todo List</h3>
                            </div>
                            <div class="p-4">
                                <div class="flex mb-4">
                                    <input type="text" x-model="newTodoText" @keydown.enter="addTodo()" 
                                           placeholder="Aggiungi una nuova attività..." 
                                           class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm">
                                    <button @click="addTodo()" 
                                            class="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <i data-lucide="plus" class="w-4 h-4"></i>
                                    </button>
                                </div>
                                <div class="space-y-2 max-h-64 overflow-y-auto">
                                    <template x-if="todos.length === 0">
                                        <p class="text-gray-500 dark:text-gray-400 text-sm">Nessuna attività</p>
                                    </template>
                                    <template x-for="todo in todos" :key="todo.id">
                                        <div class="flex items-center p-2 rounded border" 
                                             :class="todo.completed ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'" 
                                             class="border-gray-200 dark:border-gray-600">
                                            <input type="checkbox" @change="toggleTodo(todo.id)" :checked="todo.completed" 
                                                   class="mr-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                                            <span class="flex-1 text-sm" 
                                                  :class="todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'" 
                                                  x-text="todo.text"></span>
                                            <button @click="deleteTodo(todo.id)" 
                                                    class="ml-2 p-1 text-red-500 hover:text-red-700 focus:outline-none">
                                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                                            </button>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- COLONNA 2: CALCOLATRICE + CALCOLATORE IVA -->
                    <div class="space-y-6">
                        <!-- Calcolatrice -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Calcolatrice</h3>
                            </div>
                            <div class="p-4">
                                <!-- Display -->
                                <div class="mb-4">
                                    <input type="text" :value="calcolatrice.display" readonly
                                           class="w-full text-right text-2xl font-mono font-bold bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white">
                                </div>
                                
                                <!-- Pulsanti -->
                                <div class="grid grid-cols-4 gap-2">
                                    <!-- Riga 1: CE, C, ←, ÷ -->
                                    <button @click="clearEntry()" class="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded text-sm">CE</button>
                                    <button @click="clearCalcolatrice()" class="bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 text-red-800 dark:text-red-200 font-semibold py-3 px-4 rounded text-sm">C</button>
                                    <button @click="backspace()" class="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded text-sm">←</button>
                                    <button @click="inputOperatore('/')" class="bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 font-semibold py-3 px-4 rounded text-sm">÷</button>
                                    
                                    <!-- Riga 2: 7, 8, 9, × -->
                                    <button @click="inputNumero(7)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">7</button>
                                    <button @click="inputNumero(8)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">8</button>
                                    <button @click="inputNumero(9)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">9</button>
                                    <button @click="inputOperatore('*')" class="bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 font-semibold py-3 px-4 rounded text-sm">×</button>
                                    
                                    <!-- Riga 3: 4, 5, 6, - -->
                                    <button @click="inputNumero(4)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">4</button>
                                    <button @click="inputNumero(5)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">5</button>
                                    <button @click="inputNumero(6)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">6</button>
                                    <button @click="inputOperatore('-')" class="bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 font-semibold py-3 px-4 rounded text-sm">-</button>
                                    
                                    <!-- Riga 4: 1, 2, 3, + -->
                                    <button @click="inputNumero(1)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">1</button>
                                    <button @click="inputNumero(2)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">2</button>
                                    <button @click="inputNumero(3)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">3</button>
                                    <button @click="inputOperatore('+')" class="bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 font-semibold py-3 px-4 rounded text-sm">+</button>
                                    
                                    <!-- Riga 5: 0, 0, ., = -->
                                    <button @click="inputNumero(0)" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded col-span-2">0</button>
                                    <button @click="inputPunto()" class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded">.</button>
                                    <button @click="calcolaRisultato()" class="bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700 text-green-800 dark:text-green-200 font-semibold py-3 px-4 rounded text-sm">=</button>
                                </div>
                            </div>
                        </div>

                        <!-- Calcolatore IVA -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Calcolatore IVA</h3>
                            </div>
                            <div class="p-4 space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Importo Lordo (€)</label>
                                    <input type="number" x-model.number="ivaCalculator.importoLordo" step="0.01" placeholder="0.00" 
                                           class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aliquota IVA (%)</label>
                                    <select x-model.number="ivaCalculator.aliquota" 
                                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white">
                                        <option value="4">4%</option>
                                        <option value="5">5%</option>
                                        <option value="10">10%</option>
                                        <option value="22">22%</option>
                                    </select>
                                </div>
                                <button @click="calcolaIva()" 
                                        class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                                    Calcola
                                </button>
                                <div class="space-y-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-600 dark:text-gray-400">Imponibile:</span>
                                        <span x-text="formatCurrency(ivaCalculator.risultati.imponibile)" 
                                              class="text-sm font-medium text-gray-900 dark:text-gray-100"></span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-600 dark:text-gray-400">IVA:</span>
                                        <span x-text="formatCurrency(ivaCalculator.risultati.iva)" 
                                              class="text-sm font-medium text-gray-900 dark:text-gray-100"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- COLONNA 3: CALCOLO ORDINE CARBURANTE -->
                    <div class="space-y-6">
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Calcolo Ordine Carburante</h3>
                            </div>
                            <div class="p-4 space-y-4">
                                <!-- Benzina -->
                                <div class="flex items-center justify-between p-3 bg-green-50 dark:bg-gray-700 rounded-lg">
                                    <div class="flex-1">
                                        <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Benzina</span>
                                        <div class="text-xs text-gray-500 dark:text-gray-400" x-text="formatCurrency(getPrezzoApplicato('benzina'), true) + '/L'"></div>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <div class="relative flex items-center">
                                            <button type="button" @click="decrementCarburante('benzina')" 
                                                    class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                                                <i data-lucide="minus" class="w-3 h-3 text-gray-900 dark:text-white"></i>
                                            </button>
                                            <input type="text" :value="formatInteger(ordineCarburante.benzina)" readonly
                                                   class="bg-gray-50 border-x-0 border-gray-300 h-11 font-medium text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-20 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                                            <button type="button" @click="incrementCarburante('benzina')" 
                                                    class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                                                <i data-lucide="plus" class="w-3 h-3 text-gray-900 dark:text-white"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="w-20 text-right">
                                        <span x-text="formatCurrency(calcolaImportoCarburante('benzina'))" 
                                              class="text-sm font-bold text-green-400 dark:text-green-400"></span>
                                    </div>
                                </div>

                                <!-- Gasolio -->
                                <div class="flex items-center justify-between p-3 bg-yellow-50 dark:bg-gray-700 rounded-lg">
                                    <div class="flex-1">
                                        <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Gasolio</span>
                                        <div class="text-xs text-gray-500 dark:text-gray-400" x-text="formatCurrency(getPrezzoApplicato('gasolio'), true) + '/L'"></div>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <div class="relative flex items-center">
                                            <button type="button" @click="decrementCarburante('gasolio')" 
                                                    class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                                                <i data-lucide="minus" class="w-3 h-3 text-gray-900 dark:text-white"></i>
                                            </button>
                                            <input type="text" :value="formatInteger(ordineCarburante.gasolio)" readonly
                                                   class="bg-gray-50 border-x-0 border-gray-300 h-11 font-medium text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-20 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                                            <button type="button" @click="incrementCarburante('gasolio')" 
                                                    class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                                                <i data-lucide="plus" class="w-3 h-3 text-gray-900 dark:text-white"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="w-20 text-right">
                                        <span x-text="formatCurrency(calcolaImportoCarburante('gasolio'))" 
                                              class="text-sm font-bold text-yellow-400 dark:text-yellow-400"></span>
                                    </div>
                                </div>

                                <!-- Diesel+ -->
                                <div class="flex items-center justify-between p-3 bg-red-50 dark:bg-gray-700 rounded-lg">
                                    <div class="flex-1">
                                        <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Diesel+</span>
                                        <div class="text-xs text-gray-500 dark:text-gray-400" x-text="formatCurrency(getPrezzoApplicato('dieselPlus'), true) + '/L'"></div>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <div class="relative flex items-center">
                                            <button type="button" @click="decrementCarburante('dieselPlus')" 
                                                    class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                                                <i data-lucide="minus" class="w-3 h-3 text-gray-900 dark:text-white"></i>
                                            </button>
                                            <input type="text" :value="formatInteger(ordineCarburante.dieselPlus)" readonly
                                                   class="bg-gray-50 border-x-0 border-gray-300 h-11 font-medium text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-20 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                                            <button type="button" @click="incrementCarburante('dieselPlus')" 
                                                    class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                                                <i data-lucide="plus" class="w-3 h-3 text-gray-900 dark:text-white"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="w-20 text-right">
                                        <span x-text="formatCurrency(calcolaImportoCarburante('dieselPlus'))" 
                                              class="text-sm font-bold text-red-600 dark:text-red-400"></span>
                                    </div>
                                </div>

                                <!-- Hvolution -->
                                <div class="flex items-center justify-between p-3 bg-blue-50 dark:bg-gray-700 rounded-lg">
                                    <div class="flex-1">
                                        <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Hvolution</span>
                                        <div class="text-xs text-gray-500 dark:text-gray-400" x-text="formatCurrency(getPrezzoApplicato('hvolution'), true) + '/L'"></div>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <div class="relative flex items-center">
                                            <button type="button" @click="decrementCarburante('hvolution')" 
                                                    class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                                                <i data-lucide="minus" class="w-3 h-3 text-gray-900 dark:text-white"></i>
                                            </button>
                                            <input type="text" :value="formatInteger(ordineCarburante.hvolution)" readonly
                                                   class="bg-gray-50 border-x-0 border-gray-300 h-11 font-medium text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-20 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                                            <button type="button" @click="incrementCarburante('hvolution')" 
                                                    class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                                                <i data-lucide="plus" class="w-3 h-3 text-gray-900 dark:text-white"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="w-20 text-right">
                                        <span x-text="formatCurrency(calcolaImportoCarburante('hvolution'))" 
                                              class="text-sm font-bold text-blue-600 dark:text-blue-400"></span>
                                    </div>
                                </div>

                                <!-- Totale -->
                                <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
                                    <div class="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
                                        <div class="flex-1">
                                            <span class="text-lg font-bold text-gray-900 dark:text-gray-100">Totale</span>
                                        </div>
                                        <div class="flex items-center space-x-4">
                                            <div class="text-right">
                                                <div class="text-sm text-gray-600 dark:text-gray-400">Litri:</div>
                                                <span x-text="formatInteger(getTotaleLitri())" 
                                                      class="text-lg font-bold text-gray-900 dark:text-gray-100"></span>
                                            </div>
                                            <div class="text-right">
                                                <div class="text-sm text-gray-600 dark:text-gray-400">Importo:</div>
                                                <span x-text="formatCurrency(getTotaleImporto())" 
                                                      class="text-lg font-bold text-blue-600 dark:text-blue-400"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Pulsanti azioni -->
                                <div class="flex space-x-2 pt-4">
                                    <button @click="resetOrdineCarburante()" 
                                            class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm">
                                        Reset
                                    </button>
                                    <button @click="stampaOrdineCarburante()" 
                                            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                                        Stampa
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,

        // === INIZIALIZZAZIONE SPECIFICA PER LA SEZIONE HOME ===
        initHome() {
            this.renderCalendar();
            this.$watch('calendar.currentDate', () => this.renderCalendar());
        },

        // === METODI PER LA TODO LIST ===
        addTodo() {
            if (this.newTodoText.trim() === '') return;
            this.todos.unshift({
                id: `todo_${Date.now()}`,
                text: this.newTodoText.trim(),
                completed: false
            });
            this.newTodoText = '';
            this.showNotification('Attività aggiunta!');
            this.refreshIcons();
        },

        toggleTodo(todoId) {
            const todo = this.todos.find(t => t.id === todoId);
            if (todo) {
                todo.completed = !todo.completed;
                this.refreshIcons();
            }
        },

        deleteTodo(todoId) {
            this.todos = this.todos.filter(t => t.id !== todoId);
            this.showNotification('Attività eliminata.');
            this.refreshIcons();
        },

        // === METODI PER IL CALCOLATORE IVA ===
        calcolaIva() {
            const lordo = parseFloat(this.ivaCalculator.importoLordo);
            if (isNaN(lordo) || lordo <= 0) {
                this.showNotification('Inserire un importo lordo valido.');
                return;
            }
            const aliquota = this.ivaCalculator.aliquota / 100;
            const imponibile = lordo / (1 + aliquota);
            this.ivaCalculator.risultati.imponibile = imponibile;
            this.ivaCalculator.risultati.iva = lordo - imponibile;
        },

        // === METODI PER IL CALENDARIO ===
        
        // Calcola la data di Pasqua per un determinato anno (algoritmo di Gauss)
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

        // Verifica se una data è una festività italiana
        isFestivaItaliana(data) {
            const giorno = data.getDate();
            const mese = data.getMonth() + 1; // JavaScript usa 0-11 per i mesi
            const anno = data.getFullYear();
            
            // Festività fisse
            const festivitaFisse = [
                { giorno: 1, mese: 1 },   // Capodanno
                { giorno: 6, mese: 1 },   // Epifania
                { giorno: 25, mese: 4 },  // Festa della Liberazione
                { giorno: 1, mese: 5 },   // Festa del Lavoro
                { giorno: 2, mese: 6 },   // Festa della Repubblica
                { giorno: 15, mese: 8 },  // Ferragosto
                { giorno: 1, mese: 11 },  // Ognissanti
                { giorno: 8, mese: 12 },  // Immacolata Concezione
                { giorno: 25, mese: 12 }, // Natale
                { giorno: 26, mese: 12 }  // Santo Stefano
            ];
            
            // Controllo festività fisse
            const isFestivaFissa = festivitaFisse.some(festiva => 
                festiva.giorno === giorno && festiva.mese === mese
            );
            
            if (isFestivaFissa) return true;
            
            // Festività mobili (Pasqua e Lunedì dell'Angelo)
            const pasqua = this.calcolaPasqua(anno);
            const lunediDellAngelo = new Date(pasqua);
            lunediDellAngelo.setDate(pasqua.getDate() + 1);
            
            // Confronto le date
            const dataCorrente = new Date(anno, mese - 1, giorno);
            return (dataCorrente.getTime() === pasqua.getTime() || 
                    dataCorrente.getTime() === lunediDellAngelo.getTime());
        },

        // Verifica se una data è domenica
        isDomenica(data) {
            return data.getDay() === 0; // 0 = domenica
        },

        renderCalendar() {
            const date = this.calendar.currentDate;
            const year = date.getFullYear();
            const month = date.getMonth();
            
            const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                               'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
            this.calendar.monthYear = `${monthNames[month]} ${year}`;

            // Calcola il primo giorno del mese e aggiusta per iniziare da lunedì
            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const firstDayIndex = (firstDayOfMonth + 6) % 7; // Converte per iniziare da lunedì (0=Lun, 6=Dom)
            const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
            
            let daysArray = [];
            
            // Celle vuote per i giorni prima del primo del mese
            for (let i = 0; i < firstDayIndex; i++) {
                daysArray.push({ 
                    value: '', 
                    isToday: false, 
                    isHoliday: false, 
                    isSunday: false 
                });
            }
            
            // Data di oggi in fuso orario italiano
            const oggi = new Date();
            const oggiItalia = new Date(oggi.toLocaleString("en-US", {timeZone: "Europe/Rome"}));
            
            // Giorni del mese
            for (let i = 1; i <= lastDateOfMonth; i++) {
                const dataCorrente = new Date(year, month, i);
                
                // Verifica se è oggi (considerando fuso orario italiano)
                const isToday = i === oggiItalia.getDate() && 
                               month === oggiItalia.getMonth() && 
                               year === oggiItalia.getFullYear();
                
                // Verifica se è domenica
                const isSunday = this.isDomenica(dataCorrente);
                
                // Verifica se è festività italiana
                const isHoliday = this.isFestivaItaliana(dataCorrente);
                
                daysArray.push({ 
                    value: i, 
                    isToday: isToday,
                    isHoliday: isHoliday,
                    isSunday: isSunday
                });
            }
            
            this.calendar.days = daysArray;
        },

        changeMonth(offset) {
            const newDate = new Date(this.calendar.currentDate);
            newDate.setMonth(newDate.getMonth() + offset);
            this.calendar.currentDate = newDate;
            // Il calendario si aggiorna automaticamente tramite il watcher in initHome()
        },

        // === METODI PER LA CALCOLATRICE ===
        
        // Gestisce l'input dei numeri
        inputNumero(numero) {
            if (this.calcolatrice.aspettaNuovoOperando) {
                this.calcolatrice.display = numero.toString();
                this.calcolatrice.aspettaNuovoOperando = false;
            } else {
                this.calcolatrice.display = this.calcolatrice.display === '0' ? 
                    numero.toString() : this.calcolatrice.display + numero;
            }
        },

        // Gestisce l'input del punto decimale
        inputPunto() {
            if (this.calcolatrice.aspettaNuovoOperando) {
                this.calcolatrice.display = '0.';
                this.calcolatrice.aspettaNuovoOperando = false;
            } else if (this.calcolatrice.display.indexOf('.') === -1) {
                this.calcolatrice.display += '.';
            }
        },

        // Gestisce gli operatori (+, -, *, /)
        inputOperatore(operatore) {
            const inputValue = parseFloat(this.calcolatrice.display);

            if (this.calcolatrice.operandoPrecedente === null) {
                this.calcolatrice.operandoPrecedente = inputValue;
            } else if (this.calcolatrice.operatore) {
                const risultato = this.eseguiCalcolo();
                this.calcolatrice.display = String(risultato);
                this.calcolatrice.operandoPrecedente = risultato;
            }

            this.calcolatrice.aspettaNuovoOperando = true;
            this.calcolatrice.operatore = operatore;
        },

        // Esegue il calcolo
        eseguiCalcolo() {
            const precedente = this.calcolatrice.operandoPrecedente;
            const corrente = parseFloat(this.calcolatrice.display);
            
            if (precedente === null || this.calcolatrice.operatore === null) {
                return corrente;
            }

            switch (this.calcolatrice.operatore) {
                case '+': return precedente + corrente;
                case '-': return precedente - corrente;
                case '*': return precedente * corrente;
                case '/': return corrente !== 0 ? precedente / corrente : 0;
                default: return corrente;
            }
        },

        // Gestisce il pulsante uguale
        calcolaRisultato() {
            if (this.calcolatrice.operatore && !this.calcolatrice.aspettaNuovoOperando) {
                const risultato = this.eseguiCalcolo();
                this.calcolatrice.ultimaOperazione = {
                    operando1: this.calcolatrice.operandoPrecedente,
                    operatore: this.calcolatrice.operatore,
                    operando2: parseFloat(this.calcolatrice.display)
                };
                this.calcolatrice.display = String(risultato);
                this.calcolatrice.operandoPrecedente = null;
                this.calcolatrice.operatore = null;
                this.calcolatrice.aspettaNuovoOperando = true;
            }
        },

        // Reset completo (C)
        clearCalcolatrice() {
            this.calcolatrice.display = '0';
            this.calcolatrice.operandoPrecedente = null;
            this.calcolatrice.operatore = null;
            this.calcolatrice.aspettaNuovoOperando = false;
            this.calcolatrice.ultimaOperazione = null;
        },

        // Clear entry (CE) - cancella solo l'input corrente
        clearEntry() {
            this.calcolatrice.display = '0';
            this.calcolatrice.aspettaNuovoOperando = false;
        },

        // Backspace - rimuove l'ultimo carattere
        backspace() {
            if (this.calcolatrice.display.length > 1) {
                this.calcolatrice.display = this.calcolatrice.display.slice(0, -1);
            } else {
                this.calcolatrice.display = '0';
            }
        },

        // === METODI PER LE AZIONI RAPIDE ===
        
        // Navigazione rapida con feedback utente
        azioneRapida(sezione, nomeSezione) {
            this.switchSection(sezione);
            this.showNotification(`Navigazione rapida: ${nomeSezione}`);
        },

        // === NUOVI METODI PER IL CALCOLO ORDINE CARBURANTE ===
        
        // Incrementa la quantità di un carburante (step 1000L)
        incrementCarburante(prodotto) {
            this.ordineCarburante[prodotto] += 1000;
            this.refreshIcons();
        },

        // Decrementa la quantità di un carburante (step 1000L, minimo 0)
        decrementCarburante(prodotto) {
            if (this.ordineCarburante[prodotto] >= 1000) {
                this.ordineCarburante[prodotto] -= 1000;
                this.refreshIcons();
            }
        },

        // Ottiene il prezzo applicato per un prodotto dai listini prezzi
        getPrezzoApplicato(prodotto) {
            if (!Array.isArray(this.data.priceHistory) || this.data.priceHistory.length === 0) {
                return 0;
            }
            
            // Prende l'ultimo listino prezzi (più recente)
            const ultimoListino = [...this.data.priceHistory]
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            
            return ultimoListino[prodotto] || 0;
        },

        // Calcola l'importo per un singolo carburante (litri * prezzo)
        calcolaImportoCarburante(prodotto) {
            const litri = this.ordineCarburante[prodotto] || 0;
            const prezzo = this.getPrezzoApplicato(prodotto);
            return litri * prezzo;
        },

        // Calcola il totale dei litri di tutti i carburanti
        getTotaleLitri() {
            return Object.values(this.ordineCarburante).reduce((total, litri) => total + litri, 0);
        },

        // Calcola il totale dell'importo di tutti i carburanti
        getTotaleImporto() {
            const prodotti = ['benzina', 'gasolio', 'dieselPlus', 'hvolution'];
            return prodotti.reduce((total, prodotto) => {
                return total + this.calcolaImportoCarburante(prodotto);
            }, 0);
        },

        // Reset di tutti i valori dell'ordine carburante
        resetOrdineCarburante() {
            this.ordineCarburante = {
                benzina: 0,
                gasolio: 0,
                dieselPlus: 0,
                hvolution: 0
            };
            this.showNotification('Ordine carburante resettato.');
        },

        // Stampa dell'ordine carburante
        stampaOrdineCarburante() {
            const totLitri = this.getTotaleLitri();
            const totImporto = this.getTotaleImporto();
            
            if (totLitri === 0) {
                this.showNotification('Nessun prodotto selezionato per la stampa.');
                return;
            }

            // Creare contenuto per la stampa
            const dataOrdine = this.getTodayFormatted();
            let contenutoStampa = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="text-align: center; margin-bottom: 30px;">ORDINE CARBURANTE</h1>
                    <p style="text-align: center; margin-bottom: 30px;">Data: ${dataOrdine}</p>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <thead>
                            <tr style="background-color: #f5f5f5;">
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Prodotto</th>
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Quantità (L)</th>
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Prezzo/L</th>
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Importo</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            const prodotti = [
                { key: 'benzina', nome: 'Benzina' },
                { key: 'gasolio', nome: 'Gasolio' },
                { key: 'dieselPlus', nome: 'Diesel+' },
                { key: 'hvolution', nome: 'Hvolution' }
            ];

            prodotti.forEach(prodotto => {
                const litri = this.ordineCarburante[prodotto.key];
                if (litri > 0) {
                    const prezzo = this.getPrezzoApplicato(prodotto.key);
                    const importo = this.calcolaImportoCarburante(prodotto.key);
                    contenutoStampa += `
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;">${prodotto.nome}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatInteger(litri)}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatCurrency(prezzo, true)}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatCurrency(importo)}</td>
                        </tr>
                    `;
                }
            });

            contenutoStampa += `
                        </tbody>
                        <tfoot>
                            <tr style="background-color: #f0f0f0; font-weight: bold;">
                                <td style="border: 1px solid #ddd; padding: 12px;">TOTALE</td>
                                <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${this.formatInteger(totLitri)}</td>
                                <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">-</td>
                                <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${this.formatCurrency(totImporto)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `;

            // Aprire finestra di stampa
            const finestraStampa = window.open('', '_blank');
            finestraStampa.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Ordine Carburante - ${dataOrdine}</title>
                    <style>
                        @media print {
                            body { margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${contenutoStampa}
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() { window.close(); }, 1000);
                        }
                    </script>
                </body>
                </html>
            `);
            finestraStampa.document.close();
            
            this.showNotification('Ordine inviato alla stampante.');
        }
    };
}
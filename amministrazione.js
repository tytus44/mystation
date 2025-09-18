// =============================================
// FILE: amministrazione.js (versione Alpine.js) - VERSIONE CORRETTA
// DESCRIZIONE: Modulo per la gestione della
// sezione Amministrazione (clienti, conti).
// CORREZIONI: UTF-8 e funzione "Salda Conto"
// =============================================

function amministrazioneModule() {
    return {
        amministrazioneViewMode: Alpine.$persist('list'), // 'list' | 'create-client' | 'edit-client' | 'client-account'
        adminFilters: Alpine.$persist({ search: '', filter: 'all' }),
        adminSort: { column: 'name', direction: 'asc' },
        newClientName: '',
        editingClient: null,
        editClientName: '',
        currentClient: {}, 
        transactionForm: { description: 'Carburante', amount: 0 },
        
        initAmministrazione() {},
        
        // === NAVIGATION METHODS ===
        showCreateClient() {
            this.amministrazioneViewMode = 'create-client';
            this.newClientName = '';
        },
        
        showEditClient(client) {
            this.amministrazioneViewMode = 'edit-client';
            this.editingClient = client;
            this.editClientName = client.name;
        },
        
        showClientAccount(client) {
            this.amministrazioneViewMode = 'client-account';
            this.currentClient = JSON.parse(JSON.stringify(client));
            this.refreshIcons();
        },
        
        backToClientsList() {
            this.amministrazioneViewMode = 'list';
            this.currentClient = {};
            this.newClientName = '';
            this.editingClient = null;
            this.editClientName = '';
        },

        // === SORT & FILTER ===
        sortAdmin(column) { 
            if (this.adminSort.column === column) { 
                this.adminSort.direction = this.adminSort.direction === 'asc' ? 'desc' : 'asc'; 
            } else { 
                this.adminSort.column = column; 
                this.adminSort.direction = 'asc'; 
            } 
        },
        
        sortedClients() {
            if (!Array.isArray(this.data.clients)) return [];
            let clients = [...this.data.clients].map(c => ({ 
                ...c, 
                lastTransactionDate: Array.isArray(c.transactions) && c.transactions.length > 0 ? 
                    new Date(c.transactions.reduce((latest, current) => 
                        new Date(current.date) > new Date(latest.date) ? current : latest
                    ).date) : null 
            }));
            
            if (this.adminFilters.search.trim()) { 
                const query = this.adminFilters.search.toLowerCase(); 
                clients = clients.filter(c => c.name && c.name.toLowerCase().includes(query)); 
            }
            
            switch (this.adminFilters.filter) { 
                case 'credit': clients = clients.filter(c => (c.balance || 0) > 0); break; 
                case 'debit': clients = clients.filter(c => (c.balance || 0) < 0); break; 
            }
            
            return clients.sort((a, b) => { 
                const dir = this.adminSort.direction === 'asc' ? 1 : -1; 
                switch (this.adminSort.column) { 
                    case 'name': return (a.name || '').localeCompare(b.name || '', 'it-IT') * dir; 
                    case 'balance': return ((a.balance || 0) - (b.balance || 0)) * dir; 
                    case 'lastTransactionDate': 
                        if (!a.lastTransactionDate) return 1 * dir; 
                        if (!b.lastTransactionDate) return -1 * dir; 
                        return (a.lastTransactionDate - b.lastTransactionDate) * dir; 
                    default: return 0; 
                } 
            });
        },
        
        getPairedSortedClients() {
            const clients = this.sortedClients();
            const pairs = [];
            for (let i = 0; i < clients.length; i += 2) {
                pairs.push({
                    client1: clients[i],
                    client2: clients[i + 1] || null 
                });
            }
            return pairs;
        },

        // === STATS ===
        totalCredit() { 
            if (!Array.isArray(this.data.clients)) return 0; 
            return this.data.clients.reduce((sum, client) => {
                return sum + Math.max(0, client.balance || 0); 
            }, 0); 
        },
        
        totalDebit() { 
            if (!Array.isArray(this.data.clients)) return 0; 
            return this.data.clients.reduce((sum, client) => { 
                return sum + Math.abs(Math.min(0, client.balance || 0)); 
            }, 0); 
        },

        // === CLIENT OPERATIONS ===
        addNewClient() { 
            if (this.newClientName.trim() === '') { 
                this.showNotification('Il nome del cliente non può essere vuoto.'); 
                return; 
            } 
            const newClient = { 
                id: this.generateUniqueId('client'), 
                name: this.newClientName.trim(), 
                balance: 0, 
                transactions: [] 
            }; 
            this.data.clients = [...this.data.clients, newClient];
            this.showNotification('Cliente aggiunto con successo!'); 
            this.backToClientsList();
            this.refreshIcons();
        },
        
        updateClient() {
            if (this.editClientName.trim() === '') { 
                this.showNotification('Il nome del cliente non può essere vuoto.'); 
                return; 
            }
            
            this.data.clients = this.data.clients.map(client => {
                if (client.id === this.editingClient.id) {
                    return { ...client, name: this.editClientName.trim() };
                }
                return client;
            });

            this.showNotification('Cliente aggiornato con successo!');
            this.backToClientsList();
            this.refreshIcons();
        },
        
        deleteClient(clientId) { 
            const client = this.data.clients.find(c => c.id === clientId); 
            if (!client) return; 
            this.showConfirm(`Sei sicuro di voler eliminare il cliente "${client.name}"? Verranno eliminate anche tutte le sue transazioni.`, () => { 
                this.data.clients = this.data.clients.filter(c => c.id !== clientId); 
                this.showNotification('Cliente eliminato.'); 
                this.refreshIcons();
            }); 
        },

        // === TRANSACTIONS ===
        currentClientTransactions() { 
            if (!this.currentClient || !Array.isArray(this.currentClient.transactions)) return []; 
            return [...this.currentClient.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)); 
        },
        
        addTransaction(type) { 
            const amount = parseFloat(this.transactionForm.amount); 
            if (isNaN(amount) || amount <= 0) { 
                this.showNotification('Inserire un importo valido.'); 
                return; 
            } 
            
            const finalAmount = type === 'credit' ? amount : -amount; 
            const newTransaction = { 
                id: this.generateUniqueId('tx'), 
                date: new Date().toISOString(), 
                description: this.transactionForm.description || 'N/A', 
                amount: finalAmount 
            }; 
            
            let clientToUpdate = null;
            this.data.clients = this.data.clients.map(client => {
                if (client.id === this.currentClient.id) {
                    const updatedClient = {
                        ...client,
                        balance: client.balance + finalAmount,
                        transactions: [...client.transactions, newTransaction]
                    };
                    clientToUpdate = updatedClient;
                    return updatedClient;
                }
                return client;
            });
            
            if(clientToUpdate) this.showClientAccount(clientToUpdate); 
            this.transactionForm = { description: 'Carburante', amount: 0 }; 
            this.refreshIcons();
        },
        
        // 🔧 CORREZIONE: Funzione "Salda Conto" - Azzera tutto invece di aggiungere transazione
        settleAccount() { 
            const clientIndex = this.data.clients.findIndex(c => c.id === this.currentClient.id); 
            if (clientIndex === -1 || this.data.clients[clientIndex].balance === 0) return; 
            
            // 🔯 Mostra conferma con il saldo corrente
            const currentBalance = this.data.clients[clientIndex].balance;
            const balanceText = this.formatCurrency(Math.abs(currentBalance));
            const balanceType = currentBalance > 0 ? 'credito' : 'debito';
            
            this.showConfirm(
                `Sei sicuro di voler saldare il conto? Verranno eliminate tutte le transazioni e azzerato il saldo di ${balanceText} in ${balanceType}.`, 
                () => {
                    // 🔧 NUOVO COMPORTAMENTO: Azzera tutto senza aggiungere transazioni
                    let clientToUpdate = null;
                    this.data.clients = this.data.clients.map(client => {
                        if (client.id === this.currentClient.id) {
                            const updatedClient = {
                                ...client,
                                balance: 0,           // ✅ Azzera il saldo
                                transactions: []     // ✅ Rimuove tutte le transazioni
                            };
                            clientToUpdate = updatedClient;
                            return updatedClient;
                        }
                        return client;
                    });
                    
                    if(clientToUpdate) this.showClientAccount(clientToUpdate); 
                    this.showNotification('Conto saldato! Tutte le transazioni sono state eliminate.');
                    this.refreshIcons();
                }
            );
        },
        
        deleteTransaction(transactionId) { 
            let clientToUpdate = null;
            this.data.clients = this.data.clients.map(client => {
                if (client.id === this.currentClient.id) {
                    const txIndex = client.transactions.findIndex(tx => tx.id === transactionId);
                    if (txIndex === -1) return client;

                    const amountToRevert = client.transactions[txIndex].amount;
                    const updatedClient = {
                        ...client,
                        balance: client.balance - amountToRevert,
                        transactions: client.transactions.filter(tx => tx.id !== transactionId)
                    };
                    clientToUpdate = updatedClient;
                    return updatedClient;
                }
                return client;
            });

            if(clientToUpdate) this.showClientAccount(clientToUpdate);
            this.refreshIcons();
        },
        
        formatTransactionAmount(amount) { 
            return amount > 0 ? '+' + this.formatCurrency(amount) : this.formatCurrency(amount); 
        },

        // === PRINT ===
        printAccount() { 
            document.getElementById('print-content').style.display = 'block';
            document.getElementById('print-clients-content').style.display = 'none';
            this.$nextTick(() => {
                window.print();
                setTimeout(() => {
                    document.getElementById('print-content').style.display = 'none';
                }, 100);
            });
        },
        
        printClientsList() { 
            document.getElementById('print-clients-content').style.display = 'block';
            document.getElementById('print-content').style.display = 'none';
            this.$nextTick(() => {
                window.print();
                setTimeout(() => {
                    document.getElementById('print-clients-content').style.display = 'none';
                }, 100);
            });
        },

        // Template HTML
        amministrazioneTemplate: `
            <div class="max-w-7xl mx-auto space-y-6">
                <div x-show="amministrazioneViewMode === 'list'" class="view-transition">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 no-print">
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Clienti Attivi</p>
                                    <p x-text="data.clients.length" class="text-4xl font-bold text-blue-600 dark:text-blue-400">0</p>
                                </div>
                                <div class="bg-blue-100 dark:bg-blue-900 p-3 rounded-full ml-6">
                                    <i data-lucide="users" class="w-8 h-8 text-blue-600 dark:text-blue-300"></i>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Totale Credito</p>
                                    <p x-text="formatCurrency(totalCredit())" class="text-4xl font-bold text-green-600 dark:text-green-400">€ 0,00</p>
                                </div>
                                <div class="bg-green-100 dark:bg-green-900 p-3 rounded-full ml-6">
                                    <i data-lucide="trending-up" class="w-8 h-8 text-green-600 dark:text-green-300"></i>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Totale Debito</p>
                                    <p x-text="formatCurrency(totalDebit())" class="text-4xl font-bold text-red-600 dark:text-red-400">€ 0,00</p>
                                </div>
                                <div class="bg-red-100 dark:bg-red-900 p-3 rounded-full ml-6">
                                    <i data-lucide="trending-down" class="w-8 h-8 text-red-600 dark:text-red-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 no-print">
                        <div class="flex flex-wrap items-end gap-4">
                            <div class="flex-1 min-w-64 max-w-sm">
                                <label for="client-search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cerca Cliente</label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <i data-lucide="search" class="w-4 h-4 text-gray-400"></i>
                                    </div>
                                    <input type="search" id="client-search" x-model="adminFilters.search" placeholder="Cerca per nome..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filtra per</label>
                                <button id="filterDropdownButton" data-dropdown-toggle="filterDropdown" class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" type="button">
                                    <span x-text="getFilterLabel(adminFilters.filter)"></span>
                                    <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                                    </svg>
                                </button>
                                <div id="filterDropdown" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                                    <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
                                        <li><a href="#" @click.prevent="adminFilters.filter = 'all'" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Tutti i clienti</a></li>
                                        <li><a href="#" @click.prevent="adminFilters.filter = 'credit'" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Clienti a credito</a></li>
                                        <li><a href="#" @click.prevent="adminFilters.filter = 'debit'" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Clienti a debito</a></li>
                                    </ul>
                                </div>
                            </div>
                            <button @click="showCreateClient()" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center">
                                <i data-lucide="plus-circle" class="w-5 h-5 mr-2"></i>Nuovo Cliente
                            </button>
                            <button @click="printClientsList" class="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700">
                                <i data-lucide="printer" class="w-5 h-5 mr-2"></i>Stampa Elenco
                            </button>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden no-print">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Elenco Clienti</h2>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3">
                                            <button @click="sortAdmin('name')" class="flex items-center">Cliente <i data-lucide="arrow-up-down" class="w-3 h-3 ml-1.5"></i></button>
                                        </th>
                                        <th scope="col" class="px-6 py-3">
                                            <button @click="sortAdmin('balance')" class="flex items-center">Saldo <i data-lucide="arrow-up-down" class="w-3 h-3 ml-1.5"></i></button>
                                        </th>
                                        <th scope="col" class="px-6 py-3">Transazioni</th>
                                        <th scope="col" class="px-6 py-3">
                                            <button @click="sortAdmin('lastTransactionDate')" class="flex items-center">Ultima Operazione <i data-lucide="arrow-up-down" class="w-3 h-3 ml-1.5"></i></button>
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-right">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template x-for="client in sortedClients()" :key="client.id">
                                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white" x-text="client.name"></td>
                                            <td class="px-6 py-4">
                                                <span :class="getBalanceClass(client.balance)" class="font-bold" x-text="formatCurrency(client.balance)"></span>
                                            </td>
                                            <td class="px-6 py-4 text-gray-900 dark:text-white" x-text="client.transactions.length"></td>
                                            <td class="px-6 py-4 text-gray-900 dark:text-white" x-text="formatDate(client.lastTransactionDate)"></td>
                                            <td class="px-6 py-4 text-right">
                                                <div class="flex items-center justify-end space-x-2">
                                                    <button @click="showClientAccount(client)" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1" title="Apri conto"><i data-lucide="eye" class="w-4 h-4"></i></button>
                                                    <button @click="showEditClient(client)" class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 p-1" title="Modifica cliente"><i data-lucide="edit" class="w-4 h-4"></i></button>
                                                    <button @click="deleteClient(client.id)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1" title="Elimina cliente"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    </template>
                                    <tr x-show="sortedClients().length === 0">
                                        <td colspan="5" class="text-center py-12">
                                            <div class="text-gray-500 dark:text-gray-400">
                                                <i data-lucide="users" class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"></i>
                                                <p class="text-lg">Nessun cliente trovato</p>
                                                <p class="text-sm">Aggiungi un nuovo cliente per iniziare.</p>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div x-show="amministrazioneViewMode === 'create-client'" class="view-transition">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Aggiungi Nuovo Cliente</h2>
                            <button @click="backToClientsList()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><i data-lucide="x" class="w-6 h-6"></i></button>
                        </div>
                        <div class="p-6">
                            <div class="max-w-md">
                                <label for="new-client-name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome Cliente</label>
                                <input type="text" x-model="newClientName" @keydown.enter="addNewClient()" id="new-client-name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="es. Mario Rossi" required>
                            </div>
                            <div class="flex items-center justify-start mt-6 space-x-3">
                                <button @click="addNewClient()" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">Salva Cliente</button>
                                <button @click="backToClientsList()" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">Annulla</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div x-show="amministrazioneViewMode === 'edit-client'" class="view-transition">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Modifica Cliente</h2>
                            <button @click="backToClientsList()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><i data-lucide="x" class="w-6 h-6"></i></button>
                        </div>
                        <div class="p-6">
                            <div class="max-w-md">
                                <label for="edit-client-name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome Cliente</label>
                                <input type="text" x-model="editClientName" @keydown.enter="updateClient()" id="edit-client-name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="es. Mario Rossi" required>
                            </div>
                            <div class="flex items-center justify-start mt-6 space-x-3">
                                <button @click="updateClient()" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">Aggiorna Cliente</button>
                                <button @click="backToClientsList()" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">Annulla</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div x-show="amministrazioneViewMode === 'client-account'" class="view-transition">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white" x-text="'Conto Cliente: ' + (currentClient.name || '')"></h2>
                            <button @click="backToClientsList()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><i data-lucide="x" class="w-6 h-6"></i></button>
                        </div>
                        <div class="p-6">
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div class="space-y-4">
                                    <h4 class="text-lg font-medium text-gray-900 dark:text-white">Nuova Transazione</h4>
                                    <div class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-3">
                                        <input type="text" x-model="transactionForm.description" placeholder="Descrizione (es. Carburante)" class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                                        <div class="flex items-center">
                                            <span class="text-lg mr-2 text-gray-900 dark:text-white">€</span>
                                            <input type="number" x-model.number="transactionForm.amount" step="0.01" class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="0.00">
                                        </div>
                                        <div class="flex gap-2">
                                            <button type="button" @click="addTransaction('debit')" class="w-full text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Addebita</button>
                                            <button type="button" @click="addTransaction('credit')" class="w-full text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Accredita</button>
                                        </div>
                                    </div>
                                    <div class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                        <button @click="settleAccount()" 
                                                :disabled="!currentClient.transactions || currentClient.transactions.length === 0"
                                                :class="(!currentClient.transactions || currentClient.transactions.length === 0) ? 'opacity-50 cursor-not-allowed' : ''"
                                                class="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                            🔧 Salda Conto (Azzera Tutto)
                                        </button>
                                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Elimina tutte le transazioni e azzera il saldo</p>
                                    </div>
                                </div>

                                <div class="space-y-4">
                                    <div class="flex justify-between items-center">
                                        <h4 class="text-lg font-medium text-gray-900 dark:text-white">Estratto Conto</h4>
                                        <button @click="printAccount()" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><i data-lucide="printer"></i></button>
                                    </div>
                                    <div class="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                        <ul class="divide-y divide-gray-200 dark:divide-gray-600">
                                            <template x-for="tx in currentClientTransactions()" :key="tx.id">
                                                <li class="p-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <div>
                                                        <p class="font-medium text-gray-900 dark:text-white" x-text="tx.description"></p>
                                                        <p class="text-sm text-gray-500 dark:text-gray-400" x-text="formatDate(tx.date)"></p>
                                                    </div>
                                                    <div class="text-right">
                                                        <span :class="tx.amount > 0 ? 'text-green-600' : 'text-red-600'" class="font-bold" x-text="formatTransactionAmount(tx.amount)"></span>
                                                        <button @click="deleteTransaction(tx.id)" class="ml-2 text-gray-400 hover:text-red-600 text-xs">&times;</button>
                                                    </div>
                                                </li>
                                            </template>
                                            <li x-show="!currentClient.transactions || currentClient.transactions.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">Nessuna transazione.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    };
}
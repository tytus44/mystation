/* ==========================================================================
   MODULO: Amministrazione (js/amministrazione.js) - Responsive Buttons
   ========================================================================== */
(function() {
    'use strict';

    const AdminModule = {
        localState: {
            sort: { column: 'name', direction: 'asc' },
            searchQuery: '',
            currentView: 'list',
            editingClientId: null
        },

        init() {
            if (!App.state.data.clients) App.state.data.clients = [];
            this.localState.currentView = localStorage.getItem('admin_view_mode') || 'list';
        },

        render() {
            const container = document.getElementById('amministrazione-container');
            if (!container) return;

            if (!document.getElementById('admin-layout')) {
                container.innerHTML = this.getLayoutHTML();
                lucide.createIcons();
                this.attachListeners();
            }
            this.updateView();
        },

        updateView() {
            this.renderStats();
            this.updateViewButtons();
            if (this.localState.currentView === 'list') this.renderTable();
            else this.renderGrid();
        },

        getLayoutHTML() {
            return `
                <div id="admin-layout" class="flex flex-col gap-6 animate-fade-in">
                    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Amministrazione</h2>
                        <div class="flex flex-wrap items-center gap-3">
                            <div class="relative">
                                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"><i data-lucide="search" class="w-4 h-4 text-gray-500 dark:text-gray-400"></i></div>
                                <input type="search" id="admin-search" class="block w-full p-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Cerca cliente..." value="${this.localState.searchQuery}">
                            </div>
                            <div class="inline-flex rounded-md shadow-sm" role="group">
                                <button type="button" class="px-4 py-2 text-sm font-medium border border-gray-200 rounded-s-lg hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 view-btn" data-view="list" title="Vista Elenco"><i data-lucide="list" class="w-4 h-4"></i></button>
                                <button type="button" class="px-4 py-2 text-sm font-medium border border-l-0 border-gray-200 rounded-e-lg hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 view-btn" data-view="grid" title="Vista Griglia"><i data-lucide="layout-grid" class="w-4 h-4"></i></button>
                            </div>
                            <button id="btn-new-client" class="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center" title="Nuovo Cliente">
                                <i data-lucide="user-plus" class="size-4 sm:mr-2"></i>
                                <span class="hidden sm:inline">Nuovo Cliente</span>
                            </button>
                            <button id="btn-print-list" class="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700" title="Stampa Lista">
                                <i data-lucide="printer" class="size-4 sm:mr-2"></i>
                                <span class="hidden sm:inline">Stampa Lista</span>
                            </button>
                        </div>
                    </div>
                    <div id="admin-stats" class="grid grid-cols-1 sm:grid-cols-3 gap-4"></div>
                    <div id="admin-content-area"></div>
                </div>`;
        },

        renderStats() {
            const clients = App.state.data.clients;
            const totalCredit = clients.reduce((sum, c) => sum + Math.max(0, c.balance || 0), 0);
            const totalDebit = clients.reduce((sum, c) => sum + Math.min(0, c.balance || 0), 0);
            document.getElementById('admin-stats').innerHTML = `
                ${this.renderStatCard('Clienti Attivi', clients.length, 'bg-blue-500', 'users')}
                ${this.renderStatCard('Totale Credito', App.formatCurrency(totalCredit).replace('€',''), 'bg-green-500', 'trending-up')}
                ${this.renderStatCard('Totale Debito', App.formatCurrency(Math.abs(totalDebit)).replace('€',''), 'bg-red-500', 'trending-down')}
            `;
            lucide.createIcons();
        },
        renderStatCard(t, v, bg, i) { return `<div class="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800"><div class="flex-1 min-w-0"><p class="text-sm font-medium text-gray-500 dark:text-gray-400">${t}</p><h3 class="text-xl font-bold text-gray-900 dark:text-white truncate">${v}</h3></div><div class="inline-flex items-center justify-center w-10 h-10 ${bg} text-white rounded-lg flex-shrink-0 ml-2"><i data-lucide="${i}" class="w-5 h-5"></i></div></div>`; },

        updateViewButtons() {
            document.querySelectorAll('.view-btn').forEach(btn => {
                const isActive = btn.dataset.view === this.localState.currentView;
                btn.className = `px-4 py-2 text-sm font-medium border ${btn.dataset.view === 'list' ? 'rounded-s-lg' : 'border-l-0 rounded-e-lg'} ${isActive ? 'z-10 text-primary-600 bg-gray-100 dark:bg-gray-700 dark:text-white' : 'text-gray-900 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'} border-gray-200 dark:border-gray-700 view-btn`;
            });
        },

        renderTable() {
            const clients = this.getFilteredClients();
            const content = document.getElementById('admin-content-area');
            if (!clients.length) { content.innerHTML = '<div class="p-8 text-center text-gray-500 dark:text-gray-400 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">Nessun cliente trovato.</div>'; return; }
            
            content.innerHTML = `
                <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr><th class="px-4 py-3">Nome Cliente</th><th class="px-4 py-3">Saldo Attuale</th><th class="px-4 py-3">Ultima Operazione</th><th class="px-4 py-3 text-right">Azioni</th></tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                ${clients.map(c => {
                                    const balClass = c.balance > 0 ? 'text-green-600 dark:text-green-500' : (c.balance < 0 ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white');
                                    const lastTx = this.getLastTransaction(c);
                                    return `<tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"><td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${c.name}</td><td class="px-4 py-3 font-bold ${balClass}">${App.formatCurrency(c.balance)}</td><td class="px-4 py-3">${lastTx ? App.formatDate(lastTx.date) : '-'}</td><td class="px-4 py-3 text-right"><button class="font-medium text-primary-600 dark:text-primary-500 hover:underline btn-manage-client" data-id="${c.id}">Gestisci</button></td></tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>`;
            this.attachDynamicListeners();
        },

        renderGrid() {
            const clients = this.getFilteredClients();
            const content = document.getElementById('admin-content-area');
            if (!clients.length) { content.innerHTML = '<div class="p-8 text-center text-gray-500 dark:text-gray-400 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">Nessun cliente trovato.</div>'; return; }
            
            content.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">${clients.map(c => {
                const balClass = c.balance > 0 ? 'text-green-600 dark:text-green-500' : (c.balance < 0 ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white');
                const lastTx = this.getLastTransaction(c);
                return `<div class="p-5 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col cursor-pointer hover:shadow-md transition-shadow btn-manage-client h-full" data-id="${c.id}"><div class="flex-1"><h3 class="text-lg font-bold text-gray-900 dark:text-white truncate mb-2">${c.name}</h3><p class="text-sm text-gray-500 dark:text-gray-400 flex items-center"><i data-lucide="calendar" class="w-4 h-4 mr-1"></i> ${lastTx ? 'Ult. op: ' + App.formatDate(lastTx.date) : 'Nessuna operazione'}</p></div><div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center"><span class="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo:</span><span class="text-xl font-bold ${balClass}">${App.formatCurrency(c.balance)}</span></div></div>`;
            }).join('')}</div>`;
            lucide.createIcons();
            this.attachDynamicListeners();
        },

        getFilteredClients() {
            let clients = [...App.state.data.clients];
            const q = this.localState.searchQuery.toLowerCase();
            if(q) clients = clients.filter(c => c.name.toLowerCase().includes(q));
            return clients.sort((a,b) => a.name.localeCompare(b.name));
        },
        getLastTransaction(c) { if (!c.transactions?.length) return null; return [...c.transactions].sort((a, b) => new Date(b.date) - new Date(a.date))[0]; },

        openClientModal(id=null) {
            if(!id) {
                const form = `<form id="form-client"><div class="mb-4"><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome Cliente</label><input type="text" name="name" id="client-name-input" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required></div></form>`;
                App.showModal('Nuovo Cliente', form, '<button id="btn-save-client" class="text-white bg-primary-700 hover:bg-primary-800 font-medium rounded-lg text-sm px-5 py-2.5">Salva</button>', 'max-w-md');
                document.getElementById('btn-save-client').onclick = () => this.saveNewClient();
                setTimeout(() => document.getElementById('client-name-input')?.focus(), 50);
            } else {
                this.localState.editingClientId = id;
                this.renderClientModal(id);
            }
        },
        saveNewClient() {
            const fd = new FormData(document.getElementById('form-client'));
            if(!fd.get('name').trim()) return alert('Inserire il nome.');
            App.state.data.clients.push({ id: App.generateId('cl'), name: fd.get('name').trim(), balance: 0, transactions: [] });
            App.saveToStorage(); App.closeModal(); this.updateView();
        },
        renderClientModal(id) {
            const c = App.state.data.clients.find(x=>x.id===id); if(!c) return;
            const balClass = c.balance > 0 ? 'text-green-600 dark:text-green-500' : (c.balance < 0 ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white');
            const txs = [...c.transactions].sort((a,b)=>new Date(b.date)-new Date(a.date));
            
            const body = `
                <div class="space-y-6">
                    <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div><span class="text-sm text-gray-500 dark:text-gray-400 block">Saldo Attuale</span><span class="text-2xl font-bold ${balClass}">${App.formatCurrency(c.balance)}</span></div>
                        <div class="flex flex-wrap gap-2">
                            <button class="btn-quick-tx px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700" data-type="debit">Addebito (-)</button>
                            <button class="btn-quick-tx px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700" data-type="credit">Acconto (+)</button>
                            <button id="btn-settle" class="px-3 py-2 text-xs font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600"><i data-lucide="check-circle" class="w-4 h-4 inline mr-1"></i> Salda</button>
                            <button id="btn-print-stmt" class="px-3 py-2 text-xs font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600"><i data-lucide="printer" class="w-4 h-4"></i></button>
                        </div>
                    </div>
                    <div id="tx-form" class="hidden p-4 border border-gray-200 rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800">
                        <h5 class="mb-3 text-sm font-bold text-gray-900 dark:text-white" id="tx-form-title">Nuova Transazione</h5>
                        <div class="flex flex-col sm:flex-row gap-3">
                            <input type="text" id="tx-desc" class="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Descrizione">
                            <input type="number" id="tx-amount" step="0.01" class="sm:w-32 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="€ 0.00">
                            <button id="btn-confirm-tx" class="px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">Conferma</button>
                        </div>
                    </div>
                    <div class="overflow-hidden border border-gray-200 rounded-lg dark:border-gray-700">
                        <div class="max-h-[300px] overflow-y-auto">
                            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400 relative">
                                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 shadow-sm">
                                    <tr><th class="px-4 py-3">Data</th><th class="px-4 py-3">Descrizione</th><th class="px-4 py-3 text-right">Importo</th><th class="px-4 py-3 w-10"></th></tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                    ${txs.length ? txs.map(t => `<tr><td class="px-4 py-3 whitespace-nowrap">${App.formatDate(t.date)}</td><td class="px-4 py-3 truncate max-w-[150px]" title="${t.description}">${t.description}</td><td class="px-4 py-3 text-right font-medium ${t.amount>0?'text-green-600 dark:text-green-500':'text-red-600 dark:text-red-500'}">${App.formatCurrency(t.amount).replace('€','')}</td><td class="px-4 py-3 text-right"><button class="text-gray-400 hover:text-red-600 dark:hover:text-red-500 btn-del-tx" data-txid="${t.id}"><i data-lucide="trash-2" class="w-4 h-4"></i></button></td></tr>`).join('') : '<tr><td colspan="4" class="p-6 text-center text-gray-500 dark:text-gray-400">Nessuna transazione registrata.</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>`;
            
            const delBtn = `<button id="btn-delete-client-modal" class="text-red-600 hover:text-white border border-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-auto">Elimina Cliente</button>`;
            App.showModal(c.name, body, `${delBtn}<button class="px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600" onclick="App.closeModal()">Chiudi</button>`);
            
            let currentTxType = 'debit';
            document.querySelectorAll('.btn-quick-tx').forEach(b => b.onclick = () => {
                currentTxType = b.dataset.type;
                document.getElementById('tx-form-title').textContent = currentTxType === 'debit' ? 'Nuovo Addebito' : 'Nuovo Acconto';
                document.getElementById('tx-desc').value = currentTxType === 'debit' ? 'Carburante' : 'Acconto';
                document.getElementById('tx-form').classList.remove('hidden');
                document.getElementById('tx-amount').focus();
            });
            document.getElementById('btn-confirm-tx').onclick = () => {
                const amt = parseFloat(document.getElementById('tx-amount').value);
                if(!amt || amt <= 0) return alert('Inserire un importo valido');
                const finalAmt = currentTxType === 'debit' ? -amt : amt;
                c.transactions.push({ id: App.generateId('tx'), date: new Date().toISOString(), description: document.getElementById('tx-desc').value.trim(), amount: finalAmt });
                c.balance += finalAmt;
                App.saveToStorage(); this.renderClientModal(id); this.updateView();
            };
            document.querySelectorAll('.btn-del-tx').forEach(b => b.onclick = () => this.deleteTransaction(c, b.dataset.txid));
            document.getElementById('btn-settle').onclick = () => this.settleAccount(c);
            document.getElementById('btn-print-stmt').onclick = () => this.printStatement(c);
            document.getElementById('btn-delete-client-modal').onclick = () => this.deleteClient(c.id);
        },

        showDeleteModal(title, message, onConfirm) {
            const body = `
                <div class="text-center p-6 flex flex-col items-center">
                    <i data-lucide="alert-triangle" class="w-16 h-16 text-red-600 mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${title}</h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-6">${message}</p>
                </div>`;
            const footer = `
                <div class="flex justify-center gap-4 w-full">
                    <button id="btn-cancel-delete" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600">Annulla</button>
                    <button id="btn-confirm-delete" class="py-2.5 px-5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-800">Elimina</button>
                </div>`;
            
            App.showModal('', body, footer, 'max-w-md');
            document.getElementById('btn-cancel-delete').onclick = () => {
                 if(this.localState.editingClientId) this.renderClientModal(this.localState.editingClientId);
                 else App.closeModal();
            };
            document.getElementById('btn-confirm-delete').onclick = onConfirm;
        },

        deleteClient(id) {
            const c = App.state.data.clients.find(x=>x.id===id);
            this.showDeleteModal('Eliminare cliente?', `Stai per eliminare <b>${c.name}</b>. L'azione è irreversibile.`, () => {
                App.state.data.clients = App.state.data.clients.filter(x=>x.id!==id);
                App.saveToStorage(); App.closeModal(); this.localState.editingClientId = null; this.updateView();
            });
        },
        deleteTransaction(client, txId) {
            this.showDeleteModal('Eliminare transazione?', 'Questa azione è irreversibile.', () => {
                const tx = client.transactions.find(t=>t.id===txId);
                client.balance -= tx.amount;
                client.transactions = client.transactions.filter(t=>t.id!==txId);
                App.saveToStorage(); this.renderClientModal(client.id); this.updateView();
            });
        },
        settleAccount(client) {
             if(client.balance === 0) return alert('Il saldo è già zero.');
             this.showDeleteModal('Saldare conto?', `Vuoi azzerare il saldo di <b>${client.name}</b> e archiviare le transazioni?`, () => {
                 client.balance = 0; client.transactions = [];
                 App.saveToStorage(); this.renderClientModal(client.id); this.updateView();
             });
        },

        printStatement(client) {
            const w = window.open('', '_blank');
            w.document.write(`<html><head><title>Estratto Conto - ${client.name}</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#f2f2f2}.text-right{text-align:right}.text-red{color:#dc2626}.text-green{color:#16a34a}</style></head><body><h2>Estratto Conto: ${client.name}</h2><p>Data: ${new Date().toLocaleDateString('it-IT')}</p><table><thead><tr><th>Data</th><th>Descrizione</th><th class="text-right">Importo</th></tr></thead><tbody>${client.transactions.map(t => `<tr><td>${new Date(t.date).toLocaleDateString('it-IT')}</td><td>${t.description}</td><td class="text-right ${t.amount<0?'text-red':'text-green'}">${new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(t.amount)}</td></tr>`).join('')}</tbody><tfoot><tr><th colspan="2" class="text-right">Saldo Finale:</th><th class="text-right">${new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(client.balance)}</th></tr></tfoot></table></body></html>`);
            w.document.close(); w.print();
        },

        attachListeners() {
            document.getElementById('admin-search').oninput = (e) => { this.localState.searchQuery = e.target.value; this.updateView(); };
            document.querySelectorAll('.view-btn').forEach(b => b.onclick = () => { this.localState.currentView = b.dataset.view; localStorage.setItem('admin_view_mode', b.dataset.view); this.updateView(); });
            document.getElementById('btn-new-client').onclick = () => this.openClientModal();
        },
        attachDynamicListeners() {
            document.querySelectorAll('.btn-manage-client').forEach(b => b.onclick = () => this.openClientModal(b.dataset.id));
        }
    };

    if(window.App) App.registerModule('amministrazione', AdminModule); 
    else document.addEventListener('app:ready', () => App.registerModule('amministrazione', AdminModule));
})();
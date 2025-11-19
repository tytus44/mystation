/* ==========================================================================
   MODULO: Amministrazione (js/amministrazione.js) - Solid Circular Icons
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
            this.restoreLayout();
            this.initDragAndDrop();
        },

        updateView() {
            this.renderStats();
            this.updateViewButtons();
            if (this.localState.currentView === 'list') this.renderTable();
            else this.renderGrid();
        },

        initDragAndDrop() {
            const save = () => this.saveLayout();
            const sections = document.getElementById('admin-sections');
            if (sections) {
                new Sortable(sections, { animation: 150, handle: '.section-handle', ghostClass: 'sortable-ghost', onSort: save });
            }
            const stats = document.getElementById('admin-stats');
            if (stats) {
                new Sortable(stats, { animation: 150, ghostClass: 'sortable-ghost', handle: '.draggable-card', onSort: save });
            }
        },

        saveLayout() {
            const sections = Array.from(document.getElementById('admin-sections')?.children || []).map(el => el.id).filter(id => id);
            const stats = Array.from(document.getElementById('admin-stats')?.children || []).map(el => el.id).filter(id => id);
            const layout = { sections, stats };
            localStorage.setItem('mystation_admin_layout_v2', JSON.stringify(layout));
        },

        restoreLayout() {
            const saved = localStorage.getItem('mystation_admin_layout_v2');
            if (!saved) return;
            try {
                const layout = JSON.parse(saved);
                const secContainer = document.getElementById('admin-sections');
                if (secContainer && layout.sections) {
                    layout.sections.forEach(id => { const el = document.getElementById(id); if (el) secContainer.appendChild(el); });
                }
                const statsContainer = document.getElementById('admin-stats');
                if (statsContainer && layout.stats) {
                    if (statsContainer.children.length === 0) this.renderStats(true);
                    layout.stats.forEach(id => { const el = document.getElementById(id); if (el) statsContainer.appendChild(el); });
                }
            } catch (e) { console.error("Errore ripristino layout admin:", e); }
        },

        getLayoutHTML() {
            return `
                <div id="admin-layout" class="flex flex-col gap-6 animate-fade-in">
                    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Amministrazione</h2>
                        <div class="flex flex-wrap items-center gap-3">
                            <div class="relative">
                                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"><i data-lucide="search" class="w-4 h-4 text-gray-500 dark:text-gray-400"></i></div>
                                <input type="search" id="admin-search" class="block w-full ps-10 text-sm text-gray-900 border border-gray-300 rounded-md bg-white focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Cerca cliente..." value="${this.localState.searchQuery}">
                            </div>
                            <div class="inline-flex rounded-md shadow-sm" role="group">
                                <button type="button" class="px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-s-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 view-btn" data-view="list" title="Vista Elenco"><i data-lucide="list" class="w-4 h-4"></i></button>
                                <button type="button" class="px-4 py-2.5 text-sm font-medium border border-l-0 border-gray-200 rounded-e-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 view-btn" data-view="grid" title="Vista Griglia"><i data-lucide="layout-grid" class="w-4 h-4"></i></button>
                            </div>
                            <button id="btn-new-client" class="text-white bg-primary-600 hover:bg-primary-700 font-semibold rounded-md text-sm px-4 py-2.5 flex items-center shadow-sm transition-all" title="Nuovo Cliente">
                                <i data-lucide="user-plus" class="size-4 sm:mr-2"></i>
                                <span class="hidden sm:inline">Nuovo Cliente</span>
                            </button>
                            <button id="btn-print-list" class="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium rounded-md text-sm px-4 py-2.5 flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition-all" title="Stampa Lista">
                                <i data-lucide="printer" class="size-4 sm:mr-2"></i>
                                <span class="hidden sm:inline">Stampa Lista</span>
                            </button>
                        </div>
                    </div>

                    <div id="admin-sections" class="flex flex-col gap-6">
                        <div id="sec-stats" class="group">
                            <div id="admin-stats" class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start"></div>
                        </div>
                        <div id="card-clients" class="bg-white border border-gray-200 rounded-lg shadow-none dark:bg-gray-800 dark:border-gray-700 overflow-hidden draggable-card group">
                            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 card-header cursor-move section-handle hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight" id="admin-view-title">Gestione Clienti</h3>
                                <i data-lucide="grip-horizontal" class="w-5 h-5 text-gray-400"></i>
                            </div>
                            <div class="p-6" id="admin-content-area"></div>
                        </div>
                    </div>
                </div>`;
        },

        renderStats(forceRender = false) {
            const clients = App.state.data.clients;
            const totalCredit = clients.reduce((sum, c) => sum + Math.max(0, c.balance || 0), 0);
            const totalDebit = clients.reduce((sum, c) => sum + Math.min(0, c.balance || 0), 0);
            const container = document.getElementById('admin-stats');
            if (!container) return;

            if (!forceRender && document.getElementById('val-stat-clients')) {
                 document.getElementById('val-stat-clients').textContent = clients.length;
                 document.getElementById('val-stat-credit').textContent = App.formatCurrency(totalCredit).replace('€','');
                 document.getElementById('val-stat-debit').textContent = App.formatCurrency(Math.abs(totalDebit)).replace('€','');
            } else {
                // FIX: Icone circolari e colori pieni
                container.innerHTML = `
                    ${this.renderStatCard('stat-clients', 'Clienti Attivi', 'val-stat-clients', clients.length, 'bg-blue-600', 'users')}
                    ${this.renderStatCard('stat-credit', 'Totale Credito', 'val-stat-credit', App.formatCurrency(totalCredit).replace('€',''), 'bg-green-600', 'trending-up')}
                    ${this.renderStatCard('stat-debit', 'Totale Debito', 'val-stat-debit', App.formatCurrency(Math.abs(totalDebit)).replace('€',''), 'bg-red-600', 'trending-down')}
                `;
                lucide.createIcons();
            }
        },

        renderStatCard(id, title, valId, value, iconBg, iconName) {
            return `
                <div id="${id}" class="bg-white border border-gray-200 rounded-lg shadow-none dark:bg-gray-800 dark:border-gray-700 draggable-card cursor-move overflow-hidden hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 card-header">
                        <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-300">${title}</h3>
                        <div class="flex items-center justify-center w-10 h-10 rounded-full ${iconBg} text-white shadow-sm">
                            <i data-lucide="${iconName}" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight" id="${valId}">${value}</div>
                    </div>
                </div>`;
        },

        updateViewButtons() {
            document.querySelectorAll('.view-btn').forEach(btn => {
                const isActive = btn.dataset.view === this.localState.currentView;
                btn.className = `px-4 py-2.5 text-sm font-medium border ${btn.dataset.view === 'list' ? 'rounded-s-md' : 'border-l-0 rounded-e-md'} ${isActive ? 'z-10 text-white bg-primary-600 border-primary-600' : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'} border-gray-300 dark:border-gray-600 view-btn transition-all`;
            });
            const titleEl = document.getElementById('admin-view-title');
            if(titleEl) titleEl.textContent = this.localState.currentView === 'list' ? 'Elenco Clienti' : 'Griglia Clienti';
        },

        renderTable() {
            const clients = this.getFilteredClients();
            const content = document.getElementById('admin-content-area');
            if (!content) return;
            if (!clients.length) { content.innerHTML = '<div class="text-center text-gray-500 dark:text-gray-400 py-8">Nessun cliente trovato.</div>'; return; }
            
            content.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr><th class="px-4 py-3">Nome Cliente</th><th class="px-4 py-3">Saldo Attuale</th><th class="px-4 py-3">Ultima Operazione</th><th class="px-4 py-3 text-right">Azioni</th></tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            ${clients.map(c => {
                                const balClass = c.balance > 0 ? 'text-green-600 dark:text-green-400 font-bold' : (c.balance < 0 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-900 dark:text-white');
                                const lastTx = this.getLastTransaction(c);
                                return `<tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"><td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${c.name}</td><td class="px-4 py-3 ${balClass}">${App.formatCurrency(c.balance)}</td><td class="px-4 py-3">${lastTx ? App.formatDate(lastTx.date) : '-'}</td><td class="px-4 py-3 text-right"><button class="font-medium text-primary-600 dark:text-primary-400 hover:underline btn-manage-client" data-id="${c.id}">Gestisci</button></td></tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>`;
            this.attachDynamicListeners();
        },

        renderGrid() {
            const clients = this.getFilteredClients();
            const content = document.getElementById('admin-content-area');
            if (!content) return;
            if (!clients.length) { content.innerHTML = '<div class="text-center text-gray-500 dark:text-gray-400 py-8">Nessun cliente trovato.</div>'; return; }
            
            content.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">${clients.map(c => {
                const balClass = c.balance > 0 ? 'text-green-600 dark:text-green-400' : (c.balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white');
                const lastTx = this.getLastTransaction(c);
                
                return `
                <div class="bg-white border border-gray-200 rounded-lg shadow-none dark:bg-gray-800 dark:border-gray-700 flex flex-col cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors btn-manage-client overflow-hidden" data-id="${c.id}">
                    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                        <h3 class="text-base font-bold text-gray-900 dark:text-white truncate" title="${c.name}">${c.name}</h3>
                        <i data-lucide="user" class="w-5 h-5 text-gray-400"></i>
                    </div>
                    <div class="p-5 space-y-4">
                        <div class="flex justify-between items-center">
                             <span class="text-sm text-gray-500 dark:text-gray-400">Saldo:</span>
                             <span class="text-xl font-bold ${balClass}">${App.formatCurrency(c.balance)}</span>
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center">
                            <i data-lucide="calendar" class="w-3 h-3 mr-2"></i> 
                            ${lastTx ? 'Ult. op: ' + App.formatDate(lastTx.date) : 'Nessuna operazione'}
                        </div>
                    </div>
                </div>`;
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
                const form = `<form id="form-client"><div class="mb-4"><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome Cliente</label><input type="text" name="name" id="client-name-input" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required></div></form>`;
                App.showModal('Nuovo Cliente', form, '<button id="btn-save-client" class="text-white bg-primary-600 hover:bg-primary-700 font-semibold rounded-md text-sm px-5 py-2.5 transition-all shadow-sm">Salva</button>', 'max-w-md');
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
            const balClass = c.balance > 0 ? 'text-green-600 dark:text-green-400' : (c.balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white');
            const txs = [...c.transactions].sort((a,b)=>new Date(b.date)-new Date(a.date));
            
            const body = `
                <div class="space-y-6">
                    <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4 border border-gray-200 dark:border-gray-600">
                        <div><span class="text-sm text-gray-500 dark:text-gray-400 block">Saldo Attuale</span><span class="text-2xl font-bold ${balClass}">${App.formatCurrency(c.balance)}</span></div>
                        <div class="flex flex-wrap gap-2">
                            <button class="btn-quick-tx px-3 py-2 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 shadow-sm transition-all" data-type="debit">Addebito (-)</button>
                            <button class="btn-quick-tx px-3 py-2 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 shadow-sm transition-all" data-type="credit">Acconto (+)</button>
                            <button id="btn-settle" class="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 transition-all"><i data-lucide="check-circle" class="w-3 h-3 inline mr-1"></i> Salda</button>
                            <button id="btn-print-stmt" class="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 transition-all"><i data-lucide="printer" class="w-3 h-3"></i></button>
                        </div>
                    </div>
                    <div id="tx-form" class="hidden p-4 border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                        <h5 class="mb-3 text-sm font-bold text-gray-900 dark:text-white" id="tx-form-title">Nuova Transazione</h5>
                        <div class="flex flex-col sm:flex-row gap-3">
                            <input type="text" id="tx-desc" class="flex-1 bg-white border border-gray-300 text-gray-900 text-sm rounded-md p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Descrizione">
                            <input type="number" id="tx-amount" step="0.01" class="sm:w-32 bg-white border border-gray-300 text-gray-900 text-sm rounded-md p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="€ 0.00">
                            <button id="btn-confirm-tx" class="px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 shadow-sm transition-all">Conferma</button>
                        </div>
                    </div>
                    <div class="overflow-hidden border border-gray-200 rounded-lg dark:border-gray-700">
                        <div class="max-h-[300px] overflow-y-auto">
                            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400 relative">
                                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 shadow-sm">
                                    <tr><th class="px-4 py-3">Data</th><th class="px-4 py-3">Descrizione</th><th class="px-4 py-3 text-right">Importo</th><th class="px-4 py-3 w-10"></th></tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                    ${txs.length ? txs.map(t => `<tr><td class="px-4 py-3 whitespace-nowrap">${App.formatDate(t.date)}</td><td class="px-4 py-3 truncate max-w-[150px]" title="${t.description}">${t.description}</td><td class="px-4 py-3 text-right font-medium ${t.amount>0?'text-green-600 dark:text-green-400':'text-red-600 dark:text-red-400'}">${App.formatCurrency(t.amount).replace('€','')}</td><td class="px-4 py-3 text-right"><button class="text-gray-400 hover:text-red-600 dark:hover:text-red-500 btn-del-tx" data-txid="${t.id}"><i data-lucide="trash-2" class="w-4 h-4"></i></button></td></tr>`).join('') : '<tr><td colspan="4" class="p-6 text-center text-gray-500 dark:text-gray-400">Nessuna transazione registrata.</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>`;
            
            const delBtn = `<button id="btn-delete-client-modal" class="text-red-600 hover:text-white border border-red-600 hover:bg-red-600 font-medium rounded-md text-sm px-5 py-2.5 text-center mr-auto transition-all">Elimina Cliente</button>`;
            App.showModal(c.name, body, `${delBtn}<button class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 transition-all" onclick="App.closeModal()">Chiudi</button>`);
            
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
            lucide.createIcons();
        },

        showDeleteModal(title, message, onConfirm) {
            const body = `
                <div class="text-center p-6 flex flex-col items-center">
                    <div class="p-3 bg-red-50 dark:bg-red-900/30 rounded-full mb-4"><i data-lucide="alert-triangle" class="w-10 h-10 text-red-600 dark:text-red-500"></i></div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">${title}</h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-6">${message}</p>
                </div>`;
            const footer = `
                <div class="flex justify-center gap-4 w-full">
                    <button id="btn-cancel-delete" class="py-2.5 px-5 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 transition-all">Annulla</button>
                    <button id="btn-confirm-delete" class="py-2.5 px-5 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 shadow-sm transition-all">Elimina</button>
                </div>`;
            
            App.showModal('', body, footer, 'max-w-md');
            document.getElementById('btn-cancel-delete').onclick = () => {
                 if(this.localState.editingClientId) this.renderClientModal(this.localState.editingClientId);
                 else App.closeModal();
            };
            document.getElementById('btn-confirm-delete').onclick = onConfirm;
            lucide.createIcons();
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
        
        printList() {
            const clients = this.getFilteredClients();
            const w = window.open('', '_blank');
            
            let rows = '';
            for (let i = 0; i < clients.length; i += 2) {
                const c1 = clients[i];
                const c2 = clients[i+1]; 
                const renderCell = (c) => {
                    if (!c) return '<td></td><td></td>';
                    const colorClass = c.balance > 0 ? 'text-green' : (c.balance < 0 ? 'text-red' : '');
                    return `<td class="name-cell">${c.name}</td><td class="text-right ${colorClass}">${App.formatCurrency(c.balance)}</td>`;
                };
                rows += `<tr>${renderCell(c1)}<td class="separator"></td>${renderCell(c2)}</tr>`;
            }

            w.document.write(`<html><head><title>Lista Clienti</title><style>body{font-family:sans-serif;padding:10px;font-size:12px}h2{margin-bottom:5px;text-align:center;font-size:16px}p{text-align:center;margin-top:0;color:#666;font-size:10px}table{width:100%;border-collapse:collapse;margin-top:10px}th{background-color:#f2f2f2;padding:6px;text-align:left;border-bottom:2px solid #ccc;font-size:11px}td{border-bottom:1px solid #eee;padding:6px;vertical-align:top}.text-right{text-align:right;white-space:nowrap}.text-red{color:#dc2626}.text-green{color:#16a34a}.name-cell{font-weight:bold;color:#333;width:35%}.separator{width:2%;border:none;background:#fff}@media print{@page{margin:0.5cm}}</style></head><body><h2>Lista Clienti</h2><p>Generato il: ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}</p><table><thead><tr><th>Cliente</th><th class="text-right">Saldo</th><th class="separator"></th><th>Cliente</th><th class="text-right">Saldo</th></tr></thead><tbody>${rows}</tbody></table><script>window.onload=function(){window.print();window.close();}</script></body></html>`);
            w.document.close();
        },

        attachListeners() {
            document.getElementById('admin-search').oninput = (e) => { this.localState.searchQuery = e.target.value; this.updateView(); };
            document.querySelectorAll('.view-btn').forEach(b => b.onclick = () => { this.localState.currentView = b.dataset.view; localStorage.setItem('admin_view_mode', b.dataset.view); this.updateView(); });
            document.getElementById('btn-new-client').onclick = () => this.openClientModal();
            document.getElementById('btn-print-list').onclick = () => this.printList();
        },
        attachDynamicListeners() {
            document.querySelectorAll('.btn-manage-client').forEach(b => b.onclick = () => this.openClientModal(b.dataset.id));
        }
    };

    if(window.App) App.registerModule('amministrazione', AdminModule); 
    else document.addEventListener('app:ready', () => App.registerModule('amministrazione', AdminModule));
})();
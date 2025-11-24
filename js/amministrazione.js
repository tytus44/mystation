/* INIZIO MODULO AMMINISTRAZIONE */
const AmministrazioneModule = {
    ITEMS_PER_PAGE: 10,
    currentPage: 1,
    currentFilter: '',
    editingClientId: null,
    sort: { column: 'name', direction: 'asc' },

    init: function() {
        this.currentPage = 1;
        this.render();
        this.setupModalListeners();
    },

    render: function() {
        const container = document.getElementById('amministrazione-content');
        if (!container) return;

        const clients = this.getFilteredClients();
        const stats = this.calculateStats(clients);

        const clearBtnHTML = this.currentFilter ? 
            `<button id="btn-clear-search" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); border: none; background: transparent; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; justify-content: center;">
                <i data-lucide="x" style="width: 16px; height: 16px;"></i>
            </button>` : '';

        container.innerHTML = `
            <div class="toolbar-container">
                <div class="toolbar-group">
                    <input type="file" id="import-admin-input" style="display: none;" accept=".json">
                    <button id="btn-admin-import" class="action-btn">Importa</button>
                    <button id="btn-admin-export" class="action-btn">Esporta</button>
                </div>
                
                <div class="toolbar-group" style="flex-grow: 1; max-width: 400px;">
                    <div style="position: relative; width: 100%;">
                        <input type="text" id="search-client" class="nav-link" placeholder="Cerca cliente..." 
                               style="width: 100%; border: 1px solid var(--border-color); padding-left: 35px; padding-right: 35px; border-radius: var(--radius-pill);"
                               value="${this.currentFilter}">
                        <i data-lucide="search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; color: var(--text-secondary);"></i>
                        ${clearBtnHTML}
                    </div>
                </div>

                <div class="toolbar-group">
                    <button id="btn-print-list" class="action-btn">Stampa Lista</button>
                    <button id="btn-new-client" class="action-btn">Nuovo Cliente</button>
                </div>
            </div>

            <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); margin-bottom: 24px;">
                <div class="card">
                    <div class="card-header"><span class="card-title">Totale Crediti</span><i data-lucide="trending-up"></i></div>
                    <div class="card-body">
                        <h2 style="color: var(--col-benzina); font-size: 2rem; font-weight: 700;">${stats.totalCredit.toLocaleString('it-IT', {style:'currency', currency:'EUR'})}</h2>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Somma dei saldi positivi</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title">Totale Debiti</span><i data-lucide="trending-down"></i></div>
                    <div class="card-body">
                        <h2 style="color: var(--col-dieselplus); font-size: 2rem; font-weight: 700;">${stats.totalDebit.toLocaleString('it-IT', {style:'currency', currency:'EUR'})}</h2>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Somma dei saldi negativi</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title">Clienti Attivi</span><i data-lucide="users"></i></div>
                    <div class="card-body">
                        <h2 style="color: var(--primary-color); font-size: 2rem; font-weight: 700;">${stats.clientCount}</h2>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Anagrafiche registrate</p>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><span class="card-title">Gestione Clienti</span><i data-lucide="list"></i></div>
                <div class="card-body">
                    <div style="overflow-x: auto;">${this.renderTable(clients)}</div>
                    ${this.renderPagination(clients.length)}
                </div>
            </div>
        `;

        lucide.createIcons();
        this.attachMainListeners();
    },

    // --- DATI & CALCOLI ---
    getClients: function() { try { return JSON.parse(localStorage.getItem('polaris_clients') || '[]'); } catch (e) { return []; } },
    getLastTransaction: function(client) { if (!client.transactions || client.transactions.length === 0) return null; return [...client.transactions].sort((a, b) => new Date(b.date) - new Date(a.date))[0]; },
    getFilteredClients: function() {
        let clients = this.getClients(); const q = this.currentFilter.toLowerCase();
        if (q) clients = clients.filter(c => c.name.toLowerCase().includes(q));
        const { column, direction } = this.sort; const dir = direction === 'asc' ? 1 : -1;
        clients.sort((a, b) => {
            let valA, valB;
            switch(column) {
                case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); return valA.localeCompare(valB) * dir;
                case 'balance': valA = a.balance; valB = b.balance; return (valA - valB) * dir;
                case 'lastDate': const txA = this.getLastTransaction(a); const txB = this.getLastTransaction(b); valA = txA ? new Date(txA.date).getTime() : 0; valB = txB ? new Date(txB.date).getTime() : 0; return (valA - valB) * dir;
                default: return 0;
            }
        });
        return clients;
    },
    calculateStats: function(clients) { let credit = 0, debit = 0; clients.forEach(c => { if (c.balance > 0) credit += c.balance; else debit += c.balance; }); return { totalCredit: credit, totalDebit: Math.abs(debit), clientCount: clients.length }; },
    handleSort: function(col) { if (this.sort.column === col) { this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc'; } else { this.sort.column = col; this.sort.direction = 'asc'; } this.render(); },

    // --- TABELLA ---
    renderTable: function(clients) {
        if (clients.length === 0) return '<p class="placeholder-message">Nessun cliente trovato.</p>';
        const start = (this.currentPage - 1) * this.ITEMS_PER_PAGE; const end = start + this.ITEMS_PER_PAGE; const pageItems = clients.slice(start, end);
        const th = (label, col, align = 'left') => {
            const isActive = this.sort.column === col; const icon = isActive ? (this.sort.direction === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down'; const color = isActive ? 'var(--text-main)' : 'var(--text-secondary)';
            return `<th style="text-align:${align}; cursor:pointer; white-space:nowrap;" onclick="AmministrazioneModule.handleSort('${col}')"><div style="display:inline-flex; align-items:center; gap:5px; color:${color};">${label} <i data-lucide="${icon}" style="width:14px;"></i></div></th>`;
        };
        let html = `<table class="table-prices"><thead><tr>${th('CLIENTE', 'name', 'left')}${th('SALDO', 'balance', 'right')}${th('DATA OP.', 'lastDate', 'right')}<th style="text-align:right; color:var(--text-secondary);">IMPORTO OP.</th><th style="text-align:right; color:var(--text-secondary);">AZIONI</th></tr></thead><tbody>`;
        pageItems.forEach(c => {
            const balClass = c.balance > 0 ? 'text-success' : (c.balance < 0 ? 'text-danger' : '');
            const lastTx = this.getLastTransaction(c); const lastDate = lastTx ? new Date(lastTx.date).toLocaleDateString() : '-';
            let lastAmount = '-';
            if (lastTx) { const amtClass = lastTx.amount > 0 ? 'text-success' : 'text-danger'; lastAmount = `<span class="${amtClass}">${lastTx.amount.toLocaleString('it-IT', {style:'currency', currency:'EUR'})}</span>`; }
            html += `<tr style="border-bottom: 1px dashed var(--border-color);"><td style="padding: 12px; font-weight: 600; color: var(--text-main);">${c.name}</td><td style="padding: 12px; text-align:right; font-weight:bold;" class="${balClass}">${c.balance.toLocaleString('it-IT', {style:'currency', currency:'EUR'})}</td><td style="padding: 12px; text-align:right; color: var(--text-secondary);">${lastDate}</td><td style="padding: 12px; text-align:right; font-weight:500;">${lastAmount}</td><td style="padding: 12px; text-align: right;"><button class="icon-btn btn-edit" onclick="AmministrazioneModule.openClientModal('${c.id}')" title="Gestisci"><i data-lucide="pencil" style="width:16px;"></i></button></td></tr>`;
        });
        html += '</tbody></table>';
        return html;
    },
    renderPagination: function(totalItems) { if (totalItems <= this.ITEMS_PER_PAGE) return ''; return `<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid var(--border-color);"><span style="font-size: 0.9rem; color: var(--text-secondary);">Pagina ${this.currentPage} di ${Math.ceil(totalItems / this.ITEMS_PER_PAGE)}</span><div style="display: flex; gap: 10px;"><button id="btn-prev" class="icon-btn"><i data-lucide="chevron-left"></i></button><button id="btn-next" class="icon-btn"><i data-lucide="chevron-right"></i></button></div></div>`; },

    // --- MODALE CLIENTE ---
    openClientModal: function(idToEdit = null) {
        this.editingClientId = idToEdit;
        
        if (!idToEdit) {
            // NUOVO CLIENTE
            const bodyHTML = `<form id="form-client"><div style="margin-bottom: 20px;"><label>Nome Cliente</label><input type="text" id="inp-name" class="nav-link" placeholder="Inserisci nome..." style="width:100%; border:1px solid var(--border-color); border-radius:var(--radius-input);"></div></form>`;
            const footerHTML = `<div class="btn-group"><button type="button" id="btn-cancel-client" class="action-btn btn-cancel">ANNULLA</button><button type="button" id="btn-save-client" class="action-btn btn-save">SALVA</button></div>`;
            this.openModal('Nuovo Cliente', bodyHTML, footerHTML, '450px');
            setTimeout(() => { document.getElementById('btn-save-client').addEventListener('click', () => this.saveNewClient()); document.getElementById('btn-cancel-client').addEventListener('click', () => this.closeModal()); document.getElementById('inp-name').focus(); }, 0);
        } else {
            // GESTIONE CLIENTE
            const client = this.getClients().find(c => c.id === idToEdit);
            if (!client) return;

            const balClass = client.balance > 0 ? 'text-success' : (client.balance < 0 ? 'text-danger' : '');
            const txs = (client.transactions || []).sort((a, b) => new Date(b.date) - new Date(a.date));

            const bodyHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding:15px; background-color:var(--primary-light-bg); border-radius:var(--radius-input);">
                    <div>
                        <span style="font-size:0.85rem; color:var(--text-secondary); display:block;">Saldo Attuale</span>
                        <span style="font-size:1.5rem; font-weight:700;" class="${balClass}">
                            ${client.balance.toLocaleString('it-IT', {style:'currency', currency:'EUR'})}
                        </span>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="action-btn" onclick="AmministrazioneModule.printStatement('${client.id}')" title="Stampa Estratto" style="width:42px; padding:0; justify-content:center;">
                            <i data-lucide="printer" style="width:18px;"></i>
                        </button>
                        
                        <button class="action-btn" onclick="AmministrazioneModule.confirmSaldo('${client.id}')" title="Chiudi Conto" style="padding: 0 15px;">
                            SALDO
                        </button>
                        
                        <button class="action-btn btn-delete" onclick="AmministrazioneModule.deleteClient('${client.id}')" title="Elimina Cliente" style="width:42px; padding:0; justify-content:center;">
                            <i data-lucide="trash-2" style="width:18px;"></i>
                        </button>
                    </div>
                </div>

                <div style="border:1px solid var(--border-color); border-radius:var(--radius-input); padding:15px; margin-bottom:20px; background-color: var(--bg-app);">
                    <h4 style="margin-bottom:10px; font-size:0.9rem; color:var(--text-main); font-weight:600;">Nuova Transazione</h4>
                    <div style="display:grid; grid-template-columns: 1fr 150px auto; gap:10px; align-items:center;">
                        <input type="text" id="tx-desc" class="nav-link" placeholder="Descrizione" style="border:1px solid var(--border-color); border-radius:var(--radius-input); background:var(--bg-card);">
                        <input type="number" step="0.01" id="tx-amount" class="nav-link" placeholder="€ 0.00" style="border:1px solid var(--border-color); border-radius:var(--radius-input); background:var(--bg-card);">
                        <button id="btn-add-tx" class="action-btn btn-save" style="height: 100%;">AGGIUNGI</button>
                    </div>
                    
                    <div style="display:flex; gap:10px; margin-top:10px; font-size:0.8rem;">
                        <button class="action-btn" style="padding:5px 15px; height:32px; font-size:0.8rem;" 
                                onclick="document.getElementById('tx-desc').value='Carburante'; document.getElementById('tx-amount').focus();">
                            Carburante
                        </button>
                        <button class="action-btn" style="padding:5px 15px; height:32px; font-size:0.8rem;" 
                                onclick="document.getElementById('tx-desc').value='Acconto'; document.getElementById('tx-amount').focus();">
                            Acconto
                        </button>
                    </div>
                </div>

                <div style="max-height:180px; overflow-y:auto; border-top:1px solid var(--border-color);">
                    <table class="table-prices">
                        <thead style="position:sticky; top:0; background:var(--bg-card); z-index:10;"><tr><th>Data</th><th>Descrizione</th><th style="text-align:right;">Importo</th><th style="text-align:right;">Azioni</th></tr></thead>
                        <tbody>${txs.length ? txs.map(t => `<tr><td style="font-size:0.85rem;">${new Date(t.date).toLocaleDateString()}</td><td style="font-size:0.85rem;">${t.description}</td><td style="text-align:right; font-weight:bold; font-size:0.85rem;" class="${t.amount > 0 ? 'text-success' : 'text-danger'}">${t.amount.toLocaleString('it-IT', {style:'currency', currency:'EUR'})}</td><td style="text-align:right;"><button class="icon-btn btn-edit" onclick="AmministrazioneModule.editTransaction('${client.id}', '${t.id}')" title="Modifica" style="width:28px; height:28px;"><i data-lucide="pencil" style="width:14px;"></i></button><button class="icon-btn btn-delete" onclick="AmministrazioneModule.deleteTransaction('${client.id}', '${t.id}')" title="Elimina" style="width:28px; height:28px;"><i data-lucide="trash-2" style="width:14px;"></i></button></td></tr>`).join('') : '<tr><td colspan="4" style="text-align:center; color:var(--text-secondary); padding:20px;">Nessuna transazione registrata.</td></tr>'}</tbody></table>
                </div>
            `;

            const footerHTML = `<button type="button" id="btn-close-modal" class="action-btn btn-cancel" style="background:var(--bg-app); color:var(--text-main); border:1px solid var(--border-color); box-shadow:none;">CHIUDI</button>`;

            this.openModal(client.name, bodyHTML, footerHTML, '800px');

            setTimeout(() => {
                document.getElementById('btn-add-tx').addEventListener('click', () => this.addTransaction(client.id));
                document.getElementById('btn-close-modal').addEventListener('click', () => this.closeModal());
            }, 0);
        }
    },

    // --- MODALE CONFERMA SALDO ---
    confirmSaldo: function(clientId) {
        const client = this.getClients().find(c => c.id === clientId);
        if (!client) return;
        const bodyHTML = `<div style="text-align:center; padding:10px;"><i data-lucide="alert-circle" style="width:48px; height:48px; color:var(--col-destructive); margin-bottom:10px;"></i><p style="color:var(--text-main); margin-bottom:5px; font-weight:600;">Vuoi saldare il conto di <strong>${client.name}</strong>?</p><p style="font-size:0.9rem; color:var(--text-secondary);">Questa operazione cancellerà tutto lo storico transazioni.</p></div>`;
        // CORREZIONE: Rimossa btn-secondary dal tasto Stampa
        const footerHTML = `<div class="btn-group"><button id="btn-cancel-saldo" class="action-btn btn-cancel" style="background:var(--bg-app); color:var(--text-main); border:1px solid var(--border-color); box-shadow:none;">ANNULLA</button><button id="btn-print-saldo" class="action-btn">STAMPA</button><button id="btn-confirm-saldo" class="action-btn btn-delete">AZZERA TUTTO</button></div>`;
        this.openModal('Conferma Saldo', bodyHTML, footerHTML, '450px');
        setTimeout(() => { document.getElementById('btn-cancel-saldo').onclick = () => this.openClientModal(clientId); document.getElementById('btn-print-saldo').onclick = () => this.printStatement(clientId); document.getElementById('btn-confirm-saldo').onclick = () => this.executeSaldo(clientId); }, 0);
    },
    executeSaldo: function(clientId) { const clients = this.getClients(); const idx = clients.findIndex(c => c.id === clientId); if (idx !== -1) { clients[idx].balance = 0; clients[idx].transactions = []; localStorage.setItem('polaris_clients', JSON.stringify(clients)); showNotification("Conto saldato e storico azzerato.", 'success'); this.openClientModal(clientId); this.render(); } },

    // --- AZIONI ---
    saveNewClient: function() { const name = document.getElementById('inp-name').value.trim(); if (!name) { showNotification("Inserisci un nome", 'error'); return; } const clients = this.getClients(); clients.push({ id: Date.now().toString(), name: name, balance: 0, transactions: [] }); localStorage.setItem('polaris_clients', JSON.stringify(clients)); this.closeModal(); showNotification("Cliente creato", 'success'); this.render(); },
    addTransaction: function(clientId) { const desc = document.getElementById('tx-desc').value.trim(); const amountStr = document.getElementById('tx-amount').value; const amount = parseFloat(amountStr); if (!desc || isNaN(amount) || amount === 0) { showNotification("Dati non validi", 'error'); return; } const clients = this.getClients(); const clientIdx = clients.findIndex(c => c.id === clientId); if (clientIdx === -1) return; let finalAmount = amount; if (desc.toLowerCase().includes('carburante') && amount > 0) finalAmount = -amount; const tx = { id: Date.now().toString(), date: new Date().toISOString(), description: desc, amount: finalAmount }; clients[clientIdx].transactions.push(tx); clients[clientIdx].balance += finalAmount; localStorage.setItem('polaris_clients', JSON.stringify(clients)); this.openClientModal(clientId); this.render(); },
    editTransaction: function(clientId, txId) { const clients = this.getClients(); const cIdx = clients.findIndex(c => c.id === clientId); if (cIdx === -1) return; const tx = clients[cIdx].transactions.find(t => t.id === txId); if (!tx) return; clients[cIdx].balance -= tx.amount; clients[cIdx].transactions = clients[cIdx].transactions.filter(t => t.id !== txId); localStorage.setItem('polaris_clients', JSON.stringify(clients)); this.openClientModal(clientId); setTimeout(() => { document.getElementById('tx-desc').value = tx.description; document.getElementById('tx-amount').value = Math.abs(tx.amount); document.getElementById('tx-amount').focus(); }, 100); },
    deleteTransaction: function(clientId, txId) { if(!confirm("Eliminare transazione?")) return; const clients = this.getClients(); const cIdx = clients.findIndex(c => c.id === clientId); if (cIdx === -1) return; const txIdx = clients[cIdx].transactions.findIndex(t => t.id === txId); if (txIdx !== -1) { clients[cIdx].balance -= clients[cIdx].transactions[txIdx].amount; clients[cIdx].transactions.splice(txIdx, 1); localStorage.setItem('polaris_clients', JSON.stringify(clients)); this.openClientModal(clientId); this.render(); } },
    deleteClient: function(id) { if(!confirm("Eliminare INTERO cliente e storico?")) return; const clients = this.getClients().filter(c => c.id !== id); localStorage.setItem('polaris_clients', JSON.stringify(clients)); showNotification("Cliente eliminato", 'info'); this.closeModal(); this.render(); },
    printStatement: function(id) { const client = this.getClients().find(c => c.id === id); if (!client) return; const w = window.open('', '_blank'); w.document.write(`<html><head><title>Estratto Conto</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#f2f2f2}.text-right{text-align:right}</style></head><body><h2>Estratto Conto: ${client.name}</h2><p>Data: ${new Date().toLocaleDateString()}</p><table><thead><tr><th>Data</th><th>Descrizione</th><th class="text-right">Importo</th></tr></thead><tbody>${client.transactions.map(t=>`<tr><td>${new Date(t.date).toLocaleDateString()}</td><td>${t.description}</td><td class="text-right">${t.amount.toLocaleString('it-IT',{style:'currency',currency:'EUR'})}</td></tr>`).join('')}</tbody><tfoot><tr><th colspan="2" class="text-right">SALDO FINALE</th><th class="text-right">${client.balance.toLocaleString('it-IT',{style:'currency',currency:'EUR'})}</th></tr></tfoot></table><script>window.print();</script></body></html>`); w.document.close(); },
    printList: function() { const clients = this.getFilteredClients(); const w = window.open('', '_blank'); let rows = ''; for(let i=0; i<clients.length; i+=2) { const c1 = clients[i]; const c2 = clients[i+1]; const cell1 = c1 ? `<td>${c1.name}</td><td class="text-right">${c1.balance.toLocaleString('it-IT', {style:'currency', currency:'EUR'})}</td>` : `<td></td><td></td>`; const cell2 = c2 ? `<td>${c2.name}</td><td class="text-right">${c2.balance.toLocaleString('it-IT', {style:'currency', currency:'EUR'})}</td>` : `<td></td><td></td>`; rows += `<tr>${cell1}${cell2}</tr>`; } w.document.write(`<html><head><title>Lista Clienti</title><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet"><style>body{font-family:'Montserrat',sans-serif;font-size:10pt;padding:20px}h2{text-align:center;margin-bottom:5px;text-transform:uppercase}p{text-align:center;margin-top:0;margin-bottom:20px;font-size:9pt;color:#666}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;font-size:9pt;vertical-align:middle}th{background-color:#f0f0f0;font-weight:600;text-align:left}.text-right{text-align:right}td:nth-child(1),td:nth-child(3){width:35%}td:nth-child(2),td:nth-child(4){width:15%;font-weight:bold}@media print{@page{margin:1cm}}</style></head><body><h2>Riepilogo Clienti a credito</h2><p>Data: ${new Date().toLocaleDateString('it-IT')}</p><table><thead><tr><th>Cliente</th><th class="text-right">Saldo</th><th>Cliente</th><th class="text-right">Saldo</th></tr></thead><tbody>${rows}</tbody></table><script>window.onload=function(){window.print();window.close();}</script></body></html>`); w.document.close(); },
    attachMainListeners: function() { document.getElementById('search-client').addEventListener('input', (e) => { this.currentFilter = e.target.value; this.currentPage = 1; this.render(); const inp = document.getElementById('search-client'); inp.focus(); const val=inp.value; inp.value=''; inp.value=val; }); const btnClear = document.getElementById('btn-clear-search'); if(btnClear) btnClear.addEventListener('click', () => { this.currentFilter = ''; this.currentPage = 1; this.render(); document.getElementById('search-client').focus(); }); document.getElementById('btn-new-client').addEventListener('click', () => this.openClientModal()); document.getElementById('btn-print-list').addEventListener('click', () => this.printList()); const fi = document.getElementById('import-admin-input'); document.getElementById('btn-admin-import').addEventListener('click', () => fi.click()); fi.addEventListener('change', (e) => this.importData(e)); document.getElementById('btn-admin-export').addEventListener('click', () => this.exportData()); const btnPrev=document.getElementById('btn-prev'), btnNext=document.getElementById('btn-next'); if(btnPrev) btnPrev.addEventListener('click', () => { if(this.currentPage>1) {this.currentPage--; this.render();} }); if(btnNext) btnNext.addEventListener('click', () => { if(this.currentPage*this.ITEMS_PER_PAGE < this.getFilteredClients().length) {this.currentPage++; this.render();} }); },
    exportData: function() { try { const data = this.getClients(); const a = document.createElement('a'); a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data)); a.download = "polaris_clienti.json"; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { showNotification("Errore Export", 'error'); } },
    importData: function(e) { const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = (ev) => { try { const j = JSON.parse(ev.target.result); const data = Array.isArray(j) ? j : (j.clients || []); if(confirm(`Trovati ${data.length} clienti. Sovrascrivere?`)) { localStorage.setItem('polaris_clients', JSON.stringify(data)); showNotification("Importazione riuscita", 'success'); this.render(); } } catch(err) { showNotification("File non valido", 'error'); } }; r.readAsText(f); },
    setupModalListeners: function() { const cb = document.getElementById('modal-close'); if(cb) cb.addEventListener('click', () => this.closeModal()); },
    openModal: function(title, bodyHTML, footerHTML, maxWidth='800px') { const m = document.getElementById('modal-overlay'); const mb = document.querySelector('.modal-box'); const bdy = document.getElementById('modal-body'); document.getElementById('modal-title').innerText = title; bdy.innerHTML = bodyHTML; mb.style.maxWidth = maxWidth; const of = mb.querySelector('.modal-footer'); if(of) of.remove(); if(footerHTML) { const f = document.createElement('div'); f.className = 'modal-footer'; f.innerHTML = footerHTML; mb.appendChild(f); } m.classList.remove('hidden'); lucide.createIcons(); },
    closeModal: function() { document.getElementById('modal-overlay').classList.add('hidden'); this.editingClientId = null; }
};
/* FINE MODULO AMMINISTRAZIONE */
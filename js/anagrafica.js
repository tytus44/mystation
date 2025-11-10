/* ==========================================================================
   MODULO: Anagrafica (js/anagrafica.js) - Max 3 Columns
   ========================================================================== */
(function() {
    'use strict';

    const AnagraficaModule = {
        localState: {
            searchQuery: '',
            editingId: null
        },

        init() {
            if (!App.state.data.contatti) App.state.data.contatti = [];
        },

        render() {
            const container = document.getElementById('anagrafica-container');
            if (!container) return;

            if (!document.getElementById('anagrafica-layout')) {
                container.innerHTML = this.getLayoutHTML();
                lucide.createIcons();
                this.attachListeners();
            }
            this.updateView();
        },

        updateView() {
            this.renderGrid();
        },

        getLayoutHTML() {
            return `
                <div id="anagrafica-layout" class="flex flex-col gap-6 animate-fade-in">
                    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Anagrafica</h2>
                        <div class="flex flex-wrap items-center gap-3">
                            <div class="relative">
                                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"><i data-lucide="search" class="w-4 h-4 text-gray-500 dark:text-gray-400"></i></div>
                                <input type="search" id="anag-search" class="block w-full p-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Cerca contatto..." value="${this.localState.searchQuery}">
                            </div>
                            <div class="flex gap-2">
                                <button id="btn-new-contatto" class="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center"><i data-lucide="user-plus" class="size-4 mr-2"></i> Nuovo</button>
                                <button id="btn-import-csv" class="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-3 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700" title="Importa CSV"><i data-lucide="upload" class="size-4"></i></button>
                                <button id="btn-export-csv" class="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-3 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700" title="Esporta CSV"><i data-lucide="download" class="size-4"></i></button>
                                <button id="btn-print-anag" class="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-3 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700" title="Stampa"><i data-lucide="printer" class="size-4"></i></button>
                                <button id="btn-del-all-contatti" class="text-red-600 bg-white border border-red-200 hover:bg-red-50 font-medium rounded-lg text-sm px-3 py-2.5 dark:bg-gray-800 dark:text-red-500 dark:border-red-900 dark:hover:bg-gray-700" title="Elimina Tutto"><i data-lucide="trash-2" class="size-4"></i></button>
                            </div>
                        </div>
                    </div>
                    <div id="anagrafica-grid-area"></div>
                </div>`;
        },

        renderGrid() {
            const contatti = this.getFilteredContatti();
            const content = document.getElementById('anagrafica-grid-area');
            if (!contatti.length) { content.innerHTML = '<div class="p-8 text-center text-gray-500 dark:text-gray-400 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">Nessun contatto trovato.</div>'; return; }
            
            // MODIFICA: Rimossa xl:grid-cols-4 per limitare a massimo 3 colonne
            content.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${contatti.map(c => `
                <div class="p-5 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col cursor-pointer hover:shadow-md transition-shadow btn-edit-contatto h-full relative group" data-id="${c.id}">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg">${(c.cognome?.[0]||c.nome?.[0]||'?').toUpperCase()}</div>
                            <div>
                                <h3 class="text-base font-bold text-gray-900 dark:text-white leading-tight line-clamp-1" title="${c.cognome} ${c.nome}">${c.cognome} ${c.nome}</h3>
                                ${c.azienda ? `<p class="text-xs text-gray-500 dark:text-gray-400 truncate" title="${c.azienda}">${c.azienda}</p>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300 flex-1">
                        ${c.telefono1 ? `<div class="flex items-center gap-2"><i data-lucide="phone" class="size-4 text-gray-400"></i> <span>${c.telefono1}</span></div>` : ''}
                        ${c.email ? `<div class="flex items-center gap-2"><i data-lucide="mail" class="size-4 text-gray-400"></i> <span class="truncate" title="${c.email}">${c.email}</span></div>` : ''}
                    </div>
                    ${c.note ? `<div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 line-clamp-2" title="${c.note}">${c.note}</div>` : ''}
                </div>`).join('')}</div>`;
            lucide.createIcons();
            document.querySelectorAll('.btn-edit-contatto').forEach(b => b.onclick = () => this.openContattoModal(b.dataset.id));
        },

        getFilteredContatti() {
            let c = [...App.state.data.contatti];
            const q = this.localState.searchQuery.toLowerCase();
            if(q) c = c.filter(x => (x.nome||'').toLowerCase().includes(q) || (x.cognome||'').toLowerCase().includes(q) || (x.azienda||'').toLowerCase().includes(q));
            return c.sort((a,b) => (a.cognome||'').localeCompare(b.cognome||''));
        },

        // --- MODALS ---
        openContattoModal(id=null) {
            this.localState.editingId = id;
            const c = id ? App.state.data.contatti.find(x=>x.id===id) : null;
            const cls = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
            
            const form = `
                <form id="form-contatto" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome</label><input type="text" name="nome" value="${c?.nome||''}" class="${cls}"></div>
                        <div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cognome</label><input type="text" name="cognome" value="${c?.cognome||''}" class="${cls}"></div>
                    </div>
                    <div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Azienda</label><input type="text" name="azienda" value="${c?.azienda||''}" class="${cls}"></div>
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Telefono</label><input type="tel" name="telefono1" value="${c?.telefono1||''}" class="${cls}"></div>
                        <div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label><input type="email" name="email" value="${c?.email||''}" class="${cls}"></div>
                    </div>
                    <div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Note</label><textarea name="note" rows="3" class="${cls}">${c?.note||''}</textarea></div>
                </form>`;

            const delBtn = id ? `<button id="btn-del-contatto" class="text-red-600 hover:text-white border border-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-2.5 mr-auto">Elimina</button>` : '';
            App.showModal(id?'Modifica Contatto':'Nuovo Contatto', form, `${delBtn}<button id="btn-save-contatto" class="text-white bg-primary-700 hover:bg-primary-800 font-medium rounded-lg text-sm px-5 py-2.5 ml-auto">Salva</button>`);

            document.getElementById('btn-save-contatto').onclick = () => this.saveContatto();
            if(id) document.getElementById('btn-del-contatto').onclick = () => this.deleteContatto(id);
        },
        saveContatto() {
            const fd = new FormData(document.getElementById('form-contatto'));
            if(!fd.get('nome') && !fd.get('cognome') && !fd.get('azienda')) return alert('Inserire almeno un nome, cognome o azienda.');
            const item = { id: this.localState.editingId||App.generateId('ct'), nome:fd.get('nome').trim(), cognome:fd.get('cognome').trim(), azienda:fd.get('azienda').trim(), telefono1:fd.get('telefono1').trim(), email:fd.get('email').trim(), note:fd.get('note').trim() };
            if(this.localState.editingId) { const idx = App.state.data.contatti.findIndex(x=>x.id===this.localState.editingId); if(idx!==-1) App.state.data.contatti[idx]=item; }
            else App.state.data.contatti.push(item);
            App.saveToStorage(); App.closeModal(); this.updateView();
        },
        deleteContatto(id) { if(confirm('Eliminare contatto?')) { App.state.data.contatti = App.state.data.contatti.filter(c=>c.id!==id); App.saveToStorage(); App.closeModal(); this.updateView(); } },
        deleteAll() { if(confirm('SEI SICURO? Questa azione eliminerà TUTTI i contatti.')) { App.state.data.contatti = []; App.saveToStorage(); this.updateView(); } },

        // --- IMPORT/EXPORT/PRINT ---
        exportCSV() {
            const c = App.state.data.contatti; if(!c.length) return alert('Nessun contatto.');
            const csv = ['Nome,Cognome,Azienda,Telefono,Email,Note', ...c.map(x => `"${x.nome}","${x.cognome}","${x.azienda}","${x.telefono1}","${x.email}","${x.note}"`)].join('\n');
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'})); a.download = `contatti_${new Date().toISOString().slice(0,10)}.csv`; a.click();
        },
        importCSV(e) {
            const f = e.target.files[0]; if(!f) return;
            const r = new FileReader(); r.onload = (ev) => {
                const lines = ev.target.result.split('\n').slice(1).filter(l=>l.trim());
                lines.forEach(l => {
                    const [nome,cognome,azienda,telefono1,email,note] = l.split(',').map(s => s.replace(/^"|"$/g, '').trim());
                    if(nome||cognome||azienda) App.state.data.contatti.push({ id:App.generateId('ct'), nome, cognome, azienda, telefono1, email, note });
                });
                App.saveToStorage(); this.updateView(); alert(`${lines.length} contatti importati.`);
            }; r.readAsText(f); e.target.value = '';
        },
        printList() {
            const w = window.open('','_blank'); w.document.write(`<html><head><title>Rubrica</title><style>body{font-family:sans-serif}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#f2f2f2}</style></head><body><h2>Rubrica Contatti</h2><table><thead><tr><th>Nome</th><th>Azienda</th><th>Telefono</th><th>Email</th></tr></thead><tbody>${this.getFilteredContatti().map(c=>`<tr><td>${c.cognome} ${c.nome}</td><td>${c.azienda}</td><td>${c.telefono1}</td><td>${c.email}</td></tr>`).join('')}</tbody></table></body></html>`); w.document.close(); w.print();
        },

        attachListeners() {
            document.getElementById('anag-search').oninput = (e) => { this.localState.searchQuery = e.target.value; this.updateView(); };
            document.getElementById('btn-new-contatto').onclick = () => this.openContattoModal();
            document.getElementById('btn-del-all-contatti').onclick = () => this.deleteAll();
            document.getElementById('btn-export-csv').onclick = () => this.exportCSV();
            document.getElementById('btn-print-anag').onclick = () => this.printList();
            document.getElementById('btn-import-csv').onclick = () => document.getElementById('import-anagrafica-input').click();
            document.getElementById('import-anagrafica-input').onchange = (e) => this.importCSV(e);
        }
    };

    if(window.App) App.registerModule('anagrafica', AnagraficaModule); 
    else document.addEventListener('app:ready', () => App.registerModule('anagrafica', AnagraficaModule));
})();
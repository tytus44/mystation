/* ==========================================================================
   MODULO: Informazioni (js/informazioni.js) - Icon-only Buttons for Table
   ========================================================================== */
(function() {
    'use strict';

    const InfoModule = {
        localState: {
            searchQuery: '',
            currentPage: 1,
            itemsPerPage: 10
        },

        init() {
            if (!App.state.data.stazioni) App.state.data.stazioni = [];
        },

        render() {
            const container = document.getElementById('informazioni-container');
            if (!container) return;

            if (!document.getElementById('info-layout')) {
                container.innerHTML = this.getLayoutHTML();
                lucide.createIcons();
                this.attachListeners();
            }
            this.updateView();
            this.restoreLayout();
            this.initDragAndDrop();
        },

        updateView() {
            this.renderTable();
        },

        initDragAndDrop() {
            const save = () => this.saveLayout();
            const sections = document.getElementById('info-sections');
            if (sections) {
                new Sortable(sections, { animation: 150, handle: '.section-handle', ghostClass: 'sortable-ghost', onSort: save });
            }
            const links = document.getElementById('info-links-grid');
            if (links) {
                new Sortable(links, { animation: 150, handle: '.card-handle', ghostClass: 'sortable-ghost', onSort: save });
            }
        },

        saveLayout() {
            try {
                const getIds = (cid) => Array.from(document.getElementById(cid)?.children || []).map(el => el.id).filter(id => id);
                const layout = { sections: getIds('info-sections'), links: getIds('info-links-grid') };
                localStorage.setItem('mystation_info_layout_v1', JSON.stringify(layout));
            } catch (e) { console.warn('Salvataggio layout info bloccato:', e); }
        },

        restoreLayout() {
            try {
                const saved = localStorage.getItem('mystation_info_layout_v1');
                if (!saved) return;
                const layout = JSON.parse(saved);
                const restore = (cid, ids) => {
                    const container = document.getElementById(cid);
                    if (!container || !ids) return;
                    ids.forEach(id => { const el = document.getElementById(id); if (el) container.appendChild(el); });
                };
                restore('info-sections', layout.sections);
                restore('info-links-grid', layout.links);
            } catch (e) { console.warn("Errore ripristino layout info:", e); }
        },

        getLayoutHTML() {
            return `
                <div id="info-layout" class="flex flex-col gap-6 animate-fade-in">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Informazioni Utili</h2>
                    </div>

                    <div id="info-sections" class="flex flex-col gap-8">
                        
                        <div id="sec-links" class="group">
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3 cursor-move section-handle inline-flex items-center hover:text-primary-600 transition-colors" title="Sposta intera sezione">
                                <i data-lucide="link-2" class="w-5 h-5 mr-2"></i> Collegamenti Rapidi
                            </h3>
                            <div id="info-links-grid" class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                <div id="card-gestione" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card">
                                    <div class="flex items-center mb-4 card-handle cursor-move">
                                        <div class="p-2 bg-blue-100 rounded-lg dark:bg-blue-900 mr-3"><i data-lucide="briefcase" class="w-6 h-6 text-blue-600 dark:text-blue-300"></i></div>
                                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Gestione e Servizi</h3>
                                    </div>
                                    <ul class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                        <li><a href="https://enivirtualstation.4ts.it/" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Virtualstation</a></li>
                                        <li><a href="https://myenistation.eni.com/content/myenistation/it/ordini.html" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Ordini Carburanti</a></li>
                                        <li><a href="https://myenistation.eni.com/content/myenistation/it/contabilita.html" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Contabilità</a></li>
                                        <li><a href="https://diviseeni.audes.com/it/customer/account/login" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Audes</a></li>
                                        <li><a href="https://cardsmanager.it/Accounting/Login" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Fattura 1click</a></li>
                                        <li><a href="https://fatturazioneelettronica.aruba.it/" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Fattura (Aruba)</a></li>
                                    </ul>
                                </div>
                                <div id="card-collegamenti" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card">
                                    <div class="flex items-center mb-4 card-handle cursor-move">
                                        <div class="p-2 bg-green-100 rounded-lg dark:bg-green-900 mr-3"><i data-lucide="link" class="w-6 h-6 text-green-600 dark:text-green-300"></i></div>
                                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Collegamenti Utili</h3>
                                    </div>
                                    <ul class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                        <li><a href="https://www.unicredit.it/it/privati.html" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Unicredit</a></li>
                                        <li><a href="https://www.bccroma.it/" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> BCC Roma</a></li>
                                        <li><a href="https://business.nexi.it/" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Nexi Business</a></li>
                                        <li><a href="https://iampe.adm.gov.it/" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Agenzia Dogane</a></li>
                                        <li><a href="http://gestori.cipreg.org/" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Cipreg (Gestori)</a></li>
                                    </ul>
                                </div>
                                <div id="card-assistenza" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card">
                                    <div class="flex items-center mb-4 card-handle cursor-move">
                                        <div class="p-2 bg-red-100 rounded-lg dark:bg-red-900 mr-3"><i data-lucide="phone-call" class="w-6 h-6 text-red-600 dark:text-red-300"></i></div>
                                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Assistenza</h3>
                                    </div>
                                    <ul class="space-y-3 text-sm">
                                        <li class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Enilive Assistenza</span><a href="tel:800797979" class="font-medium text-primary-600 dark:text-primary-500 hover:underline">800 79 79 79</a></li>
                                        <li class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Portale Gestori</span><a href="tel:800960970" class="font-medium text-primary-600 dark:text-primary-500 hover:underline">800 960 970</a></li>
                                        <li class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">POS Unicredit</span><a href="tel:800900280" class="font-medium text-primary-600 dark:text-primary-500 hover:underline">800 900 280</a></li>
                                        <li class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">POS Enilive</span><a href="tel:800999720" class="font-medium text-primary-600 dark:text-primary-500 hover:underline">800 999 720</a></li>
                                        <li class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Deposito ENI</span><a href="tel:0691820084" class="font-medium text-primary-600 dark:text-primary-500 hover:underline">06 9182 0084</a></li>
                                        <li class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Fortech</span><a href="tel:800216756" class="font-medium text-primary-600 dark:text-primary-500 hover:underline">800 216 756</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div id="sec-table" class="group">
                            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4 section-handle cursor-move">
                                    <div class="flex items-center hover:text-primary-600 transition-colors" title="Sposta intera sezione">
                                        <i data-lucide="map-pin" class="w-5 h-5 mr-2"></i>
                                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Impianti ENILIVE Roma</h3>
                                    </div>
                                    <div class="flex flex-wrap items-center gap-3 no-drag" onmousedown="event.stopPropagation()">
                                        <div class="relative">
                                            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"><i data-lucide="search" class="w-4 h-4 text-gray-500 dark:text-gray-400"></i></div>
                                            <input type="search" id="stazioni-search" class="block w-full p-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Cerca impianto..." value="${this.localState.searchQuery}">
                                        </div>
                                        <div class="flex gap-2">
                                            <button id="btn-import-stazioni" class="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-3 py-2.5 flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700" title="Importa CSV"><i data-lucide="upload" class="size-4"></i></button>
                                            <button id="btn-export-stazioni" class="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-3 py-2.5 flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700" title="Esporta CSV"><i data-lucide="download" class="size-4"></i></button>
                                            <button id="btn-print-stazioni" class="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-3 py-2.5 flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700" title="Stampa"><i data-lucide="printer" class="size-4"></i></button>
                                            <button id="btn-del-all-stazioni" class="text-red-600 bg-white border border-red-200 hover:bg-red-50 font-medium rounded-lg text-sm px-3 py-2.5 flex items-center dark:bg-gray-800 dark:text-red-500 dark:border-red-900 dark:hover:bg-gray-700" title="Elimina Tutto"><i data-lucide="trash-2" class="size-4"></i></button>
                                        </div>
                                    </div>
                                </div>
                                <div class="overflow-x-auto">
                                    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr><th class="px-4 py-3">PV</th><th class="px-4 py-3">Ragione Sociale</th><th class="px-4 py-3">Indirizzo</th><th class="px-4 py-3">Telefono</th></tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700" id="stazioni-tbody"></tbody>
                                    </table>
                                </div>
                                <div id="stazioni-pagination"></div>
                            </div>
                        </div>

                    </div>
                </div>`;
        },

        renderTable() {
            const tbody = document.getElementById('stazioni-tbody');
            if (!tbody) return;
            
            const allStazioni = this.getFilteredStazioni();
            const totalPages = Math.ceil(allStazioni.length / this.localState.itemsPerPage);

            if (this.localState.currentPage > totalPages && totalPages > 0) this.localState.currentPage = totalPages;
            if (this.localState.currentPage < 1) this.localState.currentPage = 1;

            const start = (this.localState.currentPage - 1) * this.localState.itemsPerPage;
            const pageStazioni = allStazioni.slice(start, start + this.localState.itemsPerPage);

            this.renderPaginationControls(totalPages);

            if (!pageStazioni.length) {
                tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">Nessun impianto trovato. Importa un file CSV.</td></tr>';
            } else {
                tbody.innerHTML = pageStazioni.map(s => `
                    <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${s.pv || '-'}</td>
                        <td class="px-4 py-3">${s.ragioneSociale || '-'}</td>
                        <td class="px-4 py-3">${s.indirizzo || '-'}</td>
                        <td class="px-4 py-3">${s.telefono || '-'}</td>
                    </tr>`).join('');
            }
        },

        renderPaginationControls(totalPages) {
            const container = document.getElementById('stazioni-pagination');
            if (!container) return;
            if (totalPages <= 1) { container.innerHTML = ''; return; }
            
            const curr = this.localState.currentPage;
            // MODIFICA: Pulsanti paginazione solo icona
            container.innerHTML = `
                <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span class="text-sm font-normal text-gray-500 dark:text-gray-400">Pagina <span class="font-semibold text-gray-900 dark:text-white">${curr}</span> di <span class="font-semibold text-gray-900 dark:text-white">${totalPages}</span></span>
                    <div class="inline-flex rounded-md shadow-sm">
                        <button id="staz-prev-page" class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50" ${curr===1?'disabled':''} title="Pagina precedente"><i data-lucide="chevron-left" class="w-4 h-4"></i></button>
                        <button id="staz-next-page" class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-primary-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50" ${curr===totalPages?'disabled':''} title="Pagina successiva"><i data-lucide="chevron-right" class="w-4 h-4"></i></button>
                    </div>
                </div>`;
            
            document.getElementById('staz-prev-page')?.addEventListener('click', () => { this.localState.currentPage--; this.renderTable(); });
            document.getElementById('staz-next-page')?.addEventListener('click', () => { this.localState.currentPage++; this.renderTable(); });
            lucide.createIcons();
        },

        getFilteredStazioni() {
            let s = [...App.state.data.stazioni];
            const q = this.localState.searchQuery.toLowerCase();
            if (q) s = s.filter(x => (x.pv||'').toLowerCase().includes(q) || (x.ragioneSociale||'').toLowerCase().includes(q) || (x.indirizzo||'').toLowerCase().includes(q));
            return s.sort((a, b) => (parseInt(a.pv)||0) - (parseInt(b.pv)||0));
        },

        importCSV(e) {
            const f = e.target.files[0]; if (!f) return;
            const r = new FileReader();
            r.onload = (ev) => {
                const lines = ev.target.result.trim().split(/\r?\n/);
                if (lines.length < 1) return alert("File vuoto.");
                if (lines[0].toLowerCase().includes('pv')) lines.shift();
                const delim = lines[0].includes(';') ? ';' : ',';
                const imported = [];
                lines.forEach(l => {
                    if (!l.trim()) return;
                    const cols = []; let cur = ''; let inQ = false;
                    for (let i = 0; i < l.length; i++) {
                        if (l[i] === '"') { if (inQ && l[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
                        else if (l[i] === delim && !inQ) { cols.push(cur.trim()); cur = ''; }
                        else cur += l[i];
                    }
                    cols.push(cur.trim());
                    if (cols.length >= 2) imported.push({ pv: cols[0], ragioneSociale: cols[1], indirizzo: cols[2]||'', telefono: cols[3]||'' });
                });
                if (imported.length) { App.state.data.stazioni = imported; App.saveToStorage(); this.renderTable(); alert(`${imported.length} impianti importati.`); }
                else alert("Nessun dato valido trovato.");
            };
            r.readAsText(f); e.target.value = '';
        },

        exportCSV() {
            const stazioni = App.state.data.stazioni;
            if (!stazioni || stazioni.length === 0) return alert("Nessun impianto da esportare.");
            const csv = ['PV,Ragione Sociale,Indirizzo,Telefono', ...stazioni.map(s => `"${s.pv||''}","${s.ragioneSociale||''}","${s.indirizzo||''}","${s.telefono||''}"`)].join('\n');
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'})); a.download = `impianti_eni_roma_${new Date().toISOString().slice(0,10)}.csv`; a.click();
        },

        deleteAll() {
            if (confirm('Eliminare tutti gli impianti dalla lista?')) {
                App.state.data.stazioni = []; App.saveToStorage(); this.renderTable();
            }
        },

        printList() {
            const w = window.open('', '_blank');
            w.document.write(`<html><head><title>Impianti ENILIVE Roma</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#f2f2f2}</style></head><body><h2>Impianti ENILIVE Roma</h2><table><thead><tr><th>PV</th><th>Ragione Sociale</th><th>Indirizzo</th><th>Telefono</th></tr></thead><tbody>${this.getFilteredStazioni().map(s => `<tr><td>${s.pv}</td><td>${s.ragioneSociale}</td><td>${s.indirizzo}</td><td>${s.telefono}</td></tr>`).join('')}</tbody></table></body></html>`);
            w.document.close(); w.print();
        },

        attachListeners() {
            document.getElementById('stazioni-search').oninput = (e) => { this.localState.searchQuery = e.target.value; this.localState.currentPage = 1; this.renderTable(); };
            document.getElementById('btn-import-stazioni').onclick = () => document.getElementById('import-stazioni-input').click();
            document.getElementById('btn-export-stazioni').onclick = () => this.exportCSV();
            document.getElementById('btn-print-stazioni').onclick = () => this.printList();
            document.getElementById('btn-del-all-stazioni').onclick = () => this.deleteAll();
            
            let fileInput = document.getElementById('import-stazioni-input');
            if (!fileInput) {
                fileInput = document.createElement('input');
                fileInput.type = 'file'; fileInput.id = 'import-stazioni-input'; fileInput.accept = '.csv'; fileInput.className = 'hidden';
                document.body.appendChild(fileInput);
            }
            fileInput.onchange = (e) => this.importCSV(e);
        }
    };

    if(window.App) App.registerModule('informazioni', InfoModule); 
    else document.addEventListener('app:ready', () => App.registerModule('informazioni', InfoModule));
})();
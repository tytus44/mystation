/* ==========================================================================
   MODULO: Registro di Carico (js/registro.js) - Button Color Fix
   ========================================================================== */
(function() {
    'use strict';

    const RegistroModule = {
        localState: {
            sort: { column: 'date', direction: 'desc' },
            searchQuery: '',
            currentPage: 1,
            itemsPerPage: 10,
            editingId: null
        },

        init() {
            if (!App.state.data.registryEntries) App.state.data.registryEntries = [];
            if (!App.state.data.previousYearStock) App.state.data.previousYearStock = { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 };
        },

        render() {
            const container = document.getElementById('registro-container');
            if (!container) return;

            if (!document.getElementById('registro-layout')) {
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
            this.renderSummary();
            this.renderTable();
        },

        initDragAndDrop() {
            const save = () => this.saveLayout();
            const stats = document.getElementById('reg-stats-container');
            if (stats) {
                new Sortable(stats, { animation: 150, ghostClass: 'sortable-ghost', onSort: save });
            }
            const mainGrid = document.getElementById('reg-main-grid');
            if (mainGrid) {
                new Sortable(mainGrid, { animation: 150, handle: '.card-header', ghostClass: 'sortable-ghost', onSort: save });
            }
        },

        saveLayout() {
            try {
                const getIds = (cid) => Array.from(document.getElementById(cid)?.children || []).map(el => el.id).filter(id => id);
                const layout = {
                    stats: getIds('reg-stats-container'),
                    main: getIds('reg-main-grid')
                };
                localStorage.setItem('Pylon.Pro_registro_layout_v2', JSON.stringify(layout));
            } catch (e) { console.warn('Salvataggio layout registro bloccato:', e); }
        },

        restoreLayout() {
            try {
                const saved = localStorage.getItem('Pylon.Pro_registro_layout_v2');
                if (!saved) return;
                const layout = JSON.parse(saved);
                const restore = (cid, ids) => {
                    const container = document.getElementById(cid);
                    if (!container || !ids) return;
                    if (cid === 'reg-stats-container' && container.children.length === 0) this.renderStats(true);
                    ids.forEach(id => { const el = document.getElementById(id); if (el) container.appendChild(el); });
                };
                restore('reg-stats-container', layout.stats);
                restore('reg-main-grid', layout.main);
            } catch (e) { console.warn("Errore ripristino layout registro:", e); }
        },

        getLayoutHTML() {
            return `
                <div id="registro-layout" class="flex flex-col gap-6 animate-fade-in">
                    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Registro di Carico</h2>
                        <div class="flex flex-wrap items-center gap-3">
                            <div class="relative">
                                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"><i data-lucide="search" class="w-4 h-4 text-gray-500 dark:text-gray-400"></i></div>
                                <input type="search" id="reg-search" class="block w-full ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Cerca autista..." value="${this.localState.searchQuery}">
                            </div>
                            <button id="btn-new-carico" class="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center" title="Nuovo Carico">
                                <i data-lucide="truck" class="size-4 sm:mr-2"></i>
                                <span class="hidden sm:inline">Nuovo Carico</span>
                            </button>
                        </div>
                    </div>

                    <div id="reg-stats-container" class="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start"></div>

                    <div id="reg-main-grid" class="flex flex-col gap-6">
                        
                        <div id="reg-card-summary" class="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-header cursor-move">
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Riepilogo ${new Date().getFullYear()}</h3>
                            </div>
                            <div class="p-6 overflow-x-auto">
                                <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr><th class="px-4 py-3">Prodotto</th><th class="px-4 py-3">Carico</th><th class="px-4 py-3 text-green-600 dark:text-green-500">Diff (+)</th><th class="px-4 py-3 text-red-600 dark:text-red-500">Diff (-)</th><th class="px-4 py-3">Anno Prec.</th><th class="px-4 py-3">Chiusura</th></tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700" id="reg-summary-tbody"></tbody>
                                    <tfoot class="font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50" id="reg-summary-tfoot"></tfoot>
                                </table>
                            </div>
                        </div>

                        <div id="reg-card-list" class="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-header cursor-move">
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Elenco Carichi</h3>
                            </div>
                            <div class="p-6">
                                <div class="overflow-x-auto">
                                    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400" id="reg-table-head"></thead>
                                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700" id="registry-tbody"></tbody>
                                    </table>
                                </div>
                                <div id="reg-pagination"></div>
                            </div>
                        </div>

                    </div>
                </div>`;
        },

        renderStats(forceRender = false) {
            const stats = this.getStats();
            const container = document.getElementById('reg-stats-container');
            if (!container) return;

            if (!forceRender && document.getElementById('val-total-liters')) {
                document.getElementById('val-total-liters').textContent = App.formatInt(stats.totalLiters);
                document.getElementById('val-top-prod').textContent = stats.topProduct;
                document.getElementById('val-top-driver').textContent = stats.topDriver;
            } else {
                container.innerHTML = `
                    ${this.renderStatCard('stat-total-liters', 'Totale Litri', 'val-total-liters', App.formatInt(stats.totalLiters), 'bg-purple-600', 'droplets')}
                    ${this.renderStatCard('stat-top-prod', 'Top Prodotto', 'val-top-prod', stats.topProduct, 'bg-green-600', 'tag')}
                    ${this.renderStatCard('stat-top-driver', 'Top Autista', 'val-top-driver', stats.topDriver, 'bg-rose-600', 'user')}
                `;
                lucide.createIcons();
            }
        },

        renderStatCard(id, title, valId, value, iconBg, iconName) {
            return `
                <div id="${id}" class="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card cursor-move overflow-hidden">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-header">
                        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">${title}</h3>
                        <div class="flex items-center justify-center w-10 h-10 ${iconBg} text-white rounded-full shadow-sm">
                            <i data-lucide="${iconName}" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="text-2xl font-bold text-gray-900 dark:text-white" id="${valId}">${value}</div>
                    </div>
                </div>`;
        },

        renderSummary() {
            const s = this.getAnnualSummary();
            const tbody = document.getElementById('reg-summary-tbody');
            const tfoot = document.getElementById('reg-summary-tfoot');
            if(!tbody || !tfoot) return;

            tbody.innerHTML = `
                ${this.renderSummaryRow('Benzina', 'benzina', s.benzina)}
                ${this.renderSummaryRow('Gasolio', 'gasolio', s.gasolio)}
                ${this.renderSummaryRow('Diesel+', 'dieselPlus', s.dieselPlus)}
                ${this.renderSummaryRow('Hvolution', 'hvolution', s.hvolution)}
            `;
            tfoot.innerHTML = `<tr><td class="px-4 py-3">Totale</td><td class="px-4 py-3">${App.formatInt(s.total.carico)}</td><td class="px-4 py-3 text-green-600">${App.formatInt(s.total.pos)}</td><td class="px-4 py-3 text-red-600">${App.formatInt(s.total.neg)}</td><td class="px-4 py-3">-</td><td class="px-4 py-3">${App.formatInt(s.total.chiusura)}</td></tr>`;
            
            document.querySelectorAll('.prev-year-input').forEach(i => i.onchange = (e) => {
                App.state.data.previousYearStock[e.target.dataset.key] = parseFloat(e.target.value)||0;
                App.saveToStorage(); this.renderSummary();
            });
        },
        renderSummaryRow(label, key, data) {
            const prev = App.state.data.previousYearStock[key] || 0;
            const chiusura = (data.carico || 0) + prev + (data.diff_pos || 0) + (data.diff_neg || 0);
            const inputClass = "prev-year-input w-24 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white";
            return `<tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"><td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${label}</td><td class="px-4 py-3">${App.formatInt(data.carico)}</td><td class="px-4 py-3 text-green-600 dark:text-green-400">${App.formatInt(data.diff_pos)}</td><td class="px-4 py-3 text-red-600 dark:text-red-400">${App.formatInt(data.diff_neg)}</td><td class="px-4 py-3"><input type="number" class="${inputClass}" data-key="${key}" value="${prev}"></td><td class="px-4 py-3 font-bold">${App.formatInt(chiusura)}</td></tr>`;
        },

        renderTable() {
            const thead = document.getElementById('reg-table-head');
            const tbody = document.getElementById('registry-tbody');
            if (!tbody || !thead) return;

            const th = (label, col) => {
                const isActive = this.localState.sort.column === col;
                const dir = this.localState.sort.direction;
                const icon = isActive ? (dir === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down';
                const color = isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400';
                return `<th class="px-4 py-3 cursor-pointer select-none sortable-th hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" data-col="${col}"><div class="flex items-center gap-1">${label}<i data-lucide="${icon}" class="w-4 h-4 ${color}"></i></div></th>`;
            };
            thead.innerHTML = `<tr>
                ${th('Data', 'date')}
                ${th('Autista', 'autistaName')}
                ${th('Benzina', 'benzina')}
                ${th('Gasolio', 'gasolio')}
                ${th('Diesel+', 'dieselPlus')}
                ${th('Hvol', 'hvolution')}
                <th class="px-4 py-3 text-right">Azioni</th>
            </tr>`;

            const allEntries = this.getFilteredEntries();
            const totalPages = Math.ceil(allEntries.length / this.localState.itemsPerPage);
            if (this.localState.currentPage > totalPages && totalPages > 0) this.localState.currentPage = totalPages;
            if (this.localState.currentPage < 1) this.localState.currentPage = 1;
            const start = (this.localState.currentPage - 1) * this.localState.itemsPerPage;
            const pageEntries = allEntries.slice(start, start + this.localState.itemsPerPage);
            this.renderPaginationControls(totalPages);

            if (!pageEntries.length) {
                tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">Nessun carico trovato.</td></tr>';
            } else {
                tbody.innerHTML = pageEntries.map(c => `
                    <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <th class="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">${App.formatDate(c.date)}</th>
                        <td class="px-4 py-3 text-gray-900 dark:text-white">${c.autistaName||'-'}</td>
                        <td class="px-4 py-3">${this.fmtCell(c.benzina)}</td>
                        <td class="px-4 py-3">${this.fmtCell(c.gasolio)}</td>
                        <td class="px-4 py-3">${this.fmtCell(c.dieselPlus)}</td>
                        <td class="px-4 py-3">${this.fmtCell(c.hvolution)}</td>
                        <td class="px-4 py-3 text-right"><button class="font-medium text-primary-600 dark:text-primary-500 hover:underline btn-edit-reg" data-id="${c.id}">Modifica</button></td>
                    </tr>`).join('');
            }
            this.attachDynamicListeners();
            lucide.createIcons();
        },
        renderPaginationControls(totalPages) {
            const container = document.getElementById('reg-pagination');
            if (!container) return;
            if (totalPages <= 1) { container.innerHTML = ''; return; }
            const curr = this.localState.currentPage;
            container.innerHTML = `
                <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span class="text-sm font-normal text-gray-500 dark:text-gray-400">Pagina <span class="font-semibold text-gray-900 dark:text-white">${curr}</span> di <span class="font-semibold text-gray-900 dark:text-white">${totalPages}</span></span>
                    <div class="inline-flex rounded-md shadow-sm">
                        <button id="reg-prev-page" class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50" ${curr===1?'disabled':''}><i data-lucide="chevron-left" class="w-4 h-4"></i></button>
                        <button id="reg-next-page" class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-primary-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50" ${curr===totalPages?'disabled':''}><i data-lucide="chevron-right" class="w-4 h-4"></i></button>
                    </div>
                </div>`;
            document.getElementById('reg-prev-page')?.addEventListener('click', () => { this.localState.currentPage--; this.renderTable(); });
            document.getElementById('reg-next-page')?.addEventListener('click', () => { this.localState.currentPage++; this.renderTable(); });
            lucide.createIcons();
        },
        fmtCell(p) {
            if(!p || (!p.carico && !p.differenza)) return '-';
            const diff = p.differenza || 0;
            const diffHtml = diff !== 0 ? `<span class="${diff>0?'text-green-600 dark:text-green-400':'text-red-600 dark:text-red-400'} text-xs ml-1">(${diff>0?'+':''}${App.formatInt(diff)})</span>` : '';
            return `<div><span class="font-medium">${App.formatInt(p.carico)}</span>${diffHtml}</div>`;
        },

        getFilteredEntries() {
            let entries = [...App.state.data.registryEntries];
            const q = this.localState.searchQuery.toLowerCase();
            if(q) entries = entries.filter(e => (e.autistaName||'').toLowerCase().includes(q));
            const { column, direction } = this.localState.sort;
            const dir = direction === 'asc' ? 1 : -1;
            return entries.sort((a,b) => {
                let va = a[column], vb = b[column];
                if(['benzina','gasolio','dieselPlus','hvolution'].includes(column)) { va = va?.carico || 0; vb = vb?.carico || 0; }
                if (column === 'date') return (new Date(va) - new Date(vb)) * dir;
                if (typeof va === 'string') va = va.toLowerCase();
                if (typeof vb === 'string') vb = vb.toLowerCase();
                if (va < vb) return -1 * dir;
                if (va > vb) return 1 * dir;
                return 0;
            });
        },
        getAnnualSummary() {
            const y = new Date().getFullYear();
            const s = { benzina:{carico:0,diff_pos:0,diff_neg:0}, gasolio:{carico:0,diff_pos:0,diff_neg:0}, dieselPlus:{carico:0,diff_pos:0,diff_neg:0}, hvolution:{carico:0,diff_pos:0,diff_neg:0}, total:{carico:0,pos:0,neg:0,chiusura:0} };
            App.state.data.registryEntries.filter(e => new Date(e.date).getFullYear()===y).forEach(e => {
                ['benzina','gasolio','dieselPlus','hvolution'].forEach(k => {
                    if(e[k]) { s[k].carico += e[k].carico||0; const d = e[k].differenza||0; if(d>0) s[k].diff_pos += d; else s[k].diff_neg += d; }
                });
            });
            ['benzina','gasolio','dieselPlus','hvolution'].forEach(k => {
                s.total.carico += s[k].carico; s.total.pos += s[k].diff_pos; s.total.neg += s[k].diff_neg;
                s.total.chiusura += s[k].carico + (App.state.data.previousYearStock[k]||0) + s[k].diff_pos + s[k].diff_neg;
            });
            return s;
        },
        getStats() {
            const entries = this.getFilteredEntries();
            let total = 0; const prod = {}, driv = {};
            entries.forEach(e => {
                ['benzina','gasolio','dieselPlus','hvolution'].forEach(k => { total += e[k]?.carico||0; prod[k] = (prod[k]||0) + (e[k]?.carico||0); });
                if(e.autistaName) driv[e.autistaName] = (driv[e.autistaName]||0)+1;
            });
            const topP = Object.keys(prod).reduce((a,b)=>prod[a]>prod[b]?a:b, 'N/D');
            const topD = Object.keys(driv).reduce((a,b)=>driv[a]>driv[b]?a:b, 'N/D');
            return { totalLiters: total, topProduct: topP==='dieselPlus'?'Diesel+':this.capitalize(topP), topDriver: topD };
        },
        capitalize(s) { return s && s[0].toUpperCase() + s.slice(1); },

        openCaricoModal(id=null) {
            this.localState.editingId = id;
            const c = id ? App.state.data.registryEntries.find(x=>x.id===id) : null;
            const dISO = c ? c.date.split('T')[0] : new Date().toISOString().split('T')[0];
            const cls = "h-11 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
            const numInput = (p, f) => `<div class="flex items-center justify-center"><button type="button" class="flex-shrink-0 flex items-center justify-center h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-s-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 focus:outline-none btn-dec" data-t="${p}_${f}"><i data-lucide="minus" class="size-5 text-gray-900 dark:text-white"></i></button><input type="number" id="${p}_${f}" value="${c?.[p]?.[f]||0}" class="flex-shrink-0 h-10 ${f==='carico'?'w-16':'w-14'} bg-gray-50 border-y border-x-0 border-gray-300 dark:border-gray-600 text-center text-gray-900 text-sm focus:ring-primary-500 focus:border-primary-500 block dark:bg-gray-800 dark:text-white" required><button type="button" class="flex-shrink-0 flex items-center justify-center h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-e-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 focus:outline-none btn-inc" data-t="${p}_${f}"><i data-lucide="plus" class="size-5 text-gray-900 dark:text-white"></i></button></div>`;
            const form = `<form id="form-carico" class="space-y-6"><div class="grid grid-cols-2 gap-4"><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data Operazione</label><input type="date" name="date" value="${dISO}" class="${cls}" required></div><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Autista</label><input type="text" name="autista" value="${c?.autistaName||''}" class="${cls}" placeholder="Cognome Nome" required></div></div><div class="space-y-4"><div class="grid grid-cols-3 gap-4 items-center text-sm font-medium text-gray-500 dark:text-gray-400 text-center"><div class="text-left">Prodotto</div><div>Carico</div><div>Differenza</div></div>${['Benzina','Gasolio','DieselPlus','Hvolution'].map(p => { const k = p==='DieselPlus'?'dieselPlus':p.toLowerCase(); return `<div class="grid grid-cols-3 gap-4 items-center"><div class="text-gray-900 dark:text-white font-medium">${p}</div><div>${numInput(k,'carico')}</div><div>${numInput(k,'differenza')}</div></div>`; }).join('')}</div></form>`;
            const deleteBtn = id ? `<button id="btn-delete-carico" class="text-red-600 hover:text-white border border-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-auto">Elimina</button>` : '';
            // FIX: bg-primary-600
            App.showModal(id?'Modifica Carico':'Nuovo Carico', form, `${deleteBtn}<button id="btn-save-carico" class="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-sm px-5 py-2.5 ml-auto">Salva Carico</button>`, 'max-w-lg');
            document.getElementById('btn-save-carico').onclick = () => this.saveCarico();
            if(id) document.getElementById('btn-delete-carico').onclick = () => this.deleteCarico(id);
            lucide.createIcons();
            document.querySelectorAll('.btn-dec').forEach(b => b.onclick = () => { const i = document.getElementById(b.dataset.t); const isDiff = b.dataset.t.includes('differenza'); let val = parseInt(i.value||0) - (isDiff ? 1 : 1000); if (!isDiff) val = Math.max(0, val); i.value = val; });
            document.querySelectorAll('.btn-inc').forEach(b => b.onclick = () => { const i = document.getElementById(b.dataset.t); i.value = parseInt(i.value||0) + (b.dataset.t.includes('differenza') ? 1 : 1000); });
        },
        saveCarico() {
            const fd = new FormData(document.getElementById('form-carico'));
            const date = new Date(fd.get('date')).toISOString();
            const item = {
                id: this.localState.editingId || App.generateId('car'), date, autistaName: fd.get('autista'),
                benzina: {carico:parseFloat(document.getElementById('benzina_carico').value)||0, differenza:parseFloat(document.getElementById('benzina_differenza').value)||0},
                gasolio: {carico:parseFloat(document.getElementById('gasolio_carico').value)||0, differenza:parseFloat(document.getElementById('gasolio_differenza').value)||0},
                dieselPlus: {carico:parseFloat(document.getElementById('dieselPlus_carico').value)||0, differenza:parseFloat(document.getElementById('dieselPlus_differenza').value)||0},
                hvolution: {carico:parseFloat(document.getElementById('hvolution_carico').value)||0, differenza:parseFloat(document.getElementById('hvolution_differenza').value)||0}
            };
            if(this.localState.editingId) { const idx = App.state.data.registryEntries.findIndex(x=>x.id===this.localState.editingId); if(idx!==-1) App.state.data.registryEntries[idx]=item; }
            else App.state.data.registryEntries.push(item);
            App.saveToStorage(); App.closeModal(); this.render();
        },
        deleteCarico(id) {
            App.showModal('', `<div class="text-center p-6 flex flex-col items-center"><i data-lucide="alert-triangle" class="w-16 h-16 text-red-600 mb-4"></i><h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Eliminare carico?</h3><p class="text-gray-500 dark:text-gray-400 mb-6">Questa azione è irreversibile.</p></div>`, `<div class="flex justify-center gap-4 w-full"><button onclick="App.closeModal()" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600">Annulla</button><button id="btn-confirm-del-car" class="py-2.5 px-5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-800">Elimina</button></div>`, 'max-w-md');
            document.getElementById('btn-confirm-del-car').onclick = () => { App.state.data.registryEntries = App.state.data.registryEntries.filter(e=>e.id!==id); App.saveToStorage(); App.closeModal(); this.render(); };
        },

        attachListeners() {
            document.getElementById('reg-search').oninput = (e) => { this.localState.searchQuery = e.target.value; this.localState.currentPage = 1; this.render(); };
            document.getElementById('btn-new-carico').onclick = () => this.openCaricoModal();
        },
        attachDynamicListeners() {
            document.querySelectorAll('.btn-edit-reg').forEach(b => b.onclick = () => this.openCaricoModal(b.dataset.id));
            document.querySelectorAll('.sortable-th').forEach(th => { th.onclick = () => { const col = th.dataset.col; if (this.localState.sort.column === col) { this.localState.sort.direction = this.localState.sort.direction === 'asc' ? 'desc' : 'asc'; } else { this.localState.sort.column = col; this.localState.sort.direction = 'desc'; } this.renderTable(); }; });
        }
    };

    if(window.App) App.registerModule('registro', RegistroModule); 
    else document.addEventListener('app:ready', () => App.registerModule('registro', RegistroModule));
})();
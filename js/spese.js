/* ==========================================================================
   MODULO: Gestione Spese (js/spese.js) - EOS Icon Sizes
   ========================================================================== */
(function() {
    'use strict';

    const LABEL_COLORS = [
        { name: 'Rosso', value: '#ef4444' }, { name: 'Verde', value: '#22c55e' }, { name: 'Blu', value: '#3b82f6' }, { name: 'Giallo', value: '#eab308' }, { name: 'Viola', value: '#a855f7' }
    ];

    const SpeseModule = {
        localState: {
            filters: { query: '', month: (new Date().getMonth() + 1).toString(), year: new Date().getFullYear().toString(), labelId: 'all' },
            editingSpesaId: null,
            newLabelColor: LABEL_COLORS[0].value
        },

        init() {
            if (!App.state.data.spese) App.state.data.spese = [];
            if (!App.state.data.speseEtichette || !Array.isArray(App.state.data.speseEtichette) || App.state.data.speseEtichette.length === 0) {
                App.state.data.speseEtichette = [
                    { id: 'default', name: 'Generale', color: '#6b7280' },
                    { id: 'carburante', name: 'Carburante', color: '#ef4444' },
                    { id: 'manutenzione', name: 'Manutenzione', color: '#eab308' }
                ];
            } else if (!App.state.data.speseEtichette.find(l => l.id === 'default')) {
                 App.state.data.speseEtichette.unshift({ id: 'default', name: 'Generale', color: '#6b7280' });
            }
        },

        render() {
            const container = document.getElementById('spese-container');
            if (!container) return;
            if (!document.getElementById('spese-layout')) { container.innerHTML = this.getLayoutHTML(); lucide.createIcons(); this.attachListeners(); }
            this.updateView();
            this.restoreLayout();
            this.initDragAndDrop();
        },

        updateView() { this.updateFilterDropdowns(); this.renderStats(); this.renderTable(); },

        initDragAndDrop() {
            const save = () => this.saveLayout();
            const sections = document.getElementById('spese-sections');
            if (sections) {
                new Sortable(sections, { animation: 150, handle: '.section-handle', ghostClass: 'sortable-ghost', onSort: save });
            }
            const stats = document.getElementById('spese-stats-grid');
            if (stats) {
                new Sortable(stats, { animation: 150, ghostClass: 'sortable-ghost', onSort: save });
            }
        },

        saveLayout() {
            try {
                const getIds = (cid) => Array.from(document.getElementById(cid)?.children || []).map(el => el.id).filter(id => id);
                const layout = {
                    sections: getIds('spese-sections'),
                    stats: getIds('spese-stats-grid')
                };
                localStorage.setItem('mystation_spese_layout_v1', JSON.stringify(layout));
            } catch (e) { console.warn('Salvataggio layout spese bloccato:', e); }
        },

        restoreLayout() {
            try {
                const saved = localStorage.getItem('mystation_spese_layout_v1');
                if (!saved) return;
                const layout = JSON.parse(saved);
                const restore = (cid, ids) => {
                    const container = document.getElementById(cid);
                    if (!container || !ids) return;
                    if (cid === 'spese-stats-grid' && container.children.length === 0) this.renderStats(true);
                    ids.forEach(id => { const el = document.getElementById(id); if (el) container.appendChild(el); });
                };
                restore('spese-sections', layout.sections);
                restore('spese-stats-grid', layout.stats);
            } catch (e) { console.warn("Errore ripristino layout spese:", e); }
        },

        getLayoutHTML() {
            return `
                <div id="spese-layout" class="flex flex-col gap-6 animate-fade-in">
                    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Gestione Spese</h2>
                        <div class="flex flex-wrap items-center gap-3">
                            <div class="relative"><div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"><i data-lucide="search" class="w-4 h-4 text-gray-500 dark:text-gray-400"></i></div><input type="search" id="spese-search" class="block w-full p-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Cerca spesa..."></div>
                            <div class="flex gap-2">${this.renderDropdown('filter-month', 'Tutti i mesi')}${this.renderDropdown('filter-year', 'Tutti gli anni')}${this.renderDropdown('filter-label', 'Tutte')}</div>
                            <button id="btn-new-spesa" class="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center" title="Nuova Spesa">
                                <i data-lucide="plus" class="size-4 sm:mr-2"></i>
                                <span class="hidden sm:inline">Nuova Spesa</span>
                            </button>
                        </div>
                    </div>

                    <div id="spese-sections" class="flex flex-col gap-6">
                        <div id="sec-spese-stats" class="group">
                            <div id="spese-stats-grid" class="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start"></div>
                        </div>
                        <div id="sec-spese-table" class="group">
                            <div class="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                <div class="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-header cursor-move section-handle hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" title="Sposta sezione">
                                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Elenco Movimenti</h3>
                                </div>
                                <div class="p-6" id="spese-table-container"></div>
                            </div>
                        </div>
                    </div>
                </div>`;
        },

        renderDropdown(id, defaultText) { return `<div class="relative"><button id="${id}-btn" data-dropdown-toggle="${id}-dropdown" class="flex items-center justify-between w-full p-2.5 text-sm font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-primary-800" type="button"><span id="${id}-text" class="truncate mr-2">${defaultText}</span><svg class="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/></svg></button><div id="${id}-dropdown" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 max-h-64 overflow-y-auto"><ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="${id}-btn" id="${id}-list"></ul></div></div>`; },
        updateFilterDropdowns() {
            const months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
            const years = [...new Set(App.state.data.spese.map(s => new Date(s.date).getFullYear()))].sort((a,b)=>b-a);
            if (!years.includes(new Date().getFullYear())) years.unshift(new Date().getFullYear());
            this.populateDropdown('filter-month', [{ val: 'all', text: 'Tutti i mesi' }, ...months.map((m,i) => ({ val: (i+1).toString(), text: m }))], this.localState.filters.month);
            this.populateDropdown('filter-year', [{ val: 'all', text: 'Tutti gli anni' }, ...years.map(y => ({ val: y.toString(), text: y.toString() }))], this.localState.filters.year);
            this.populateDropdown('filter-label', [{ val: 'all', text: 'Tutte' }, ...App.state.data.speseEtichette.map(l => ({ val: l.id, text: l.name }))], this.localState.filters.labelId);
        },
        populateDropdown(id, options, currentVal) {
            const list = document.getElementById(`${id}-list`); const btnText = document.getElementById(`${id}-text`); if (!list || !btnText) return;
            list.innerHTML = options.map(o => `<li><a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${id}-opt" data-val="${o.val}">${o.text}</a></li>`).join('');
            const selected = options.find(o => o.val === currentVal); if (selected) btnText.textContent = selected.text;
            list.querySelectorAll(`.${id}-opt`).forEach(opt => { opt.onclick = (e) => { e.preventDefault(); const val = e.target.dataset.val; if (id === 'filter-month') this.localState.filters.month = val; if (id === 'filter-year') this.localState.filters.year = val; if (id === 'filter-label') this.localState.filters.labelId = val; this.updateView(); const d = document.getElementById(`${id}-dropdown`); if(d && typeof Flowbite !== 'undefined') { const di = Flowbite.instances.getInstance('Dropdown', d.id); if(di) di.hide(); else d.classList.add('hidden'); } }; });
        },

        renderStats(forceRender = false) {
            const spese = this.getFilteredSpese();
            const total = spese.reduce((sum, s) => sum + s.amount, 0);
            const max = spese.reduce((max, s) => Math.max(max, s.amount), 0);
            const container = document.getElementById('spese-stats-grid');
            if (!container) return;

            if (!forceRender && document.getElementById('stat-total')) {
                document.getElementById('val-total').textContent = App.formatCurrency(total);
                document.getElementById('val-count').textContent = spese.length;
                document.getElementById('val-max').textContent = App.formatCurrency(max);
            } else {
                container.innerHTML = `
                    ${this.renderStatCard('stat-total', 'Totale (Filtrato)', 'val-total', App.formatCurrency(total), 'bg-red-600', 'trending-down')}
                    ${this.renderStatCard('stat-count', 'Numero Transazioni', 'val-count', spese.length, 'bg-orange-500', 'list')}
                    ${this.renderStatCard('stat-max', 'Spesa più alta', 'val-max', App.formatCurrency(max), 'bg-purple-600', 'trending-up')}
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

        renderTable() {
            const spese = this.getFilteredSpese();
            const content = document.getElementById('spese-table-container');
            if (!content) return;
            if (!spese.length) { content.innerHTML = '<div class="text-center text-gray-500 dark:text-gray-400 py-8">Nessuna spesa trovata.</div>'; return; }
            const labels = App.state.data.speseEtichette.reduce((acc, l) => { acc[l.id] = l; return acc; }, {});
            content.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"><tr><th class="px-4 py-3">Data</th><th class="px-4 py-3">Descrizione</th><th class="px-4 py-3">Fornitore</th><th class="px-4 py-3">Etichetta</th><th class="px-4 py-3">Importo</th><th class="px-4 py-3 text-right">Azioni</th></tr></thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            ${spese.map(s => { 
                                const l = labels[s.labelId] || labels['default'] || { name: 'Non trovata', color: '#9ca3af' }; 
                                const badgeStyle = `background-color: ${l.color}20; color: ${l.color}; border: 1px solid ${l.color}60;`; 
                                return `<tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"><td class="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-white">${App.formatDate(s.date)}</td><td class="px-4 py-3">${s.description}</td><td class="px-4 py-3">${s.fornitore || '-'}</td><td class="px-4 py-3"><span class="text-xs font-medium px-2.5 py-0.5 rounded" style="${badgeStyle}">${l.name}</span></td><td class="px-4 py-3 font-bold text-red-600 dark:text-red-500">${App.formatCurrency(s.amount).replace('€','')}</td><td class="px-4 py-3 text-right"><button class="btn-edit-spesa font-medium text-primary-600 dark:text-primary-500 hover:underline" data-id="${s.id}">Modifica</button></td></tr>`; 
                            }).join('')}
                        </tbody>
                    </table>
                </div>`;
            this.attachDynamicListeners();
        },
        getFilteredSpese() {
            let spese = [...App.state.data.spese];
            const { query, month, year, labelId } = this.localState.filters;
            if (query) { const q = query.toLowerCase(); spese = spese.filter(s => s.description.toLowerCase().includes(q) || (s.fornitore||'').toLowerCase().includes(q)); }
            if (month !== 'all') spese = spese.filter(s => (new Date(s.date).getMonth() + 1) == month);
            if (year !== 'all') spese = spese.filter(s => new Date(s.date).getFullYear() == year);
            if (labelId !== 'all') spese = spese.filter(s => s.labelId === labelId);
            return spese.sort((a,b) => new Date(b.date) - new Date(a.date));
        },

        openSpesaModal(id=null) {
            this.localState.editingSpesaId = id;
            const s = id ? App.state.data.spese.find(x=>x.id===id) : null;
            const dISO = s ? s.date.split('T')[0] : new Date().toISOString().split('T')[0];
            const cls = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
            let curLabelId = s?.labelId;
            let labelObj = App.state.data.speseEtichette.find(l => l.id === curLabelId);
            if (!labelObj) { labelObj = App.state.data.speseEtichette.find(l => l.id === 'default') || App.state.data.speseEtichette[0]; curLabelId = labelObj ? labelObj.id : ''; }
            const curLabelName = labelObj ? labelObj.name : 'Seleziona...';
            const form = `<form id="form-spesa" class="space-y-4"><div class="grid grid-cols-2 gap-4"><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data</label><input type="date" name="date" value="${dISO}" class="${cls}" required></div><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Importo (€)</label><input type="number" step="0.01" name="amount" value="${s?.amount||''}" class="${cls}" placeholder="0.00" required></div></div><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descrizione</label><input type="text" name="description" value="${s?.description||''}" class="${cls}" required></div><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fornitore (opzionale)</label><input type="text" name="fornitore" value="${s?.fornitore||''}" class="${cls}"></div><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Etichetta</label><div class="flex gap-2"><div class="relative flex-1">${this.renderDropdown('spesa-label', curLabelName)}<input type="hidden" name="labelId" id="spesa-label-input" value="${curLabelId}"></div><button type="button" id="btn-manage-labels" class="px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 flex items-center" title="Gestisci Etichette"><i data-lucide="tags" class="w-5 h-5 sm:mr-2"></i><span class="hidden sm:inline">Gestisci etichette</span></button></div></div></form>`;
            const deleteBtn = id ? `<button id="btn-delete-spesa" class="text-red-600 hover:text-white border border-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-auto">Elimina</button>` : '';
            App.showModal(id?'Modifica Spesa':'Nuova Spesa', form, `${deleteBtn}<button id="btn-save-spesa" class="text-white bg-primary-700 hover:bg-primary-800 font-medium rounded-lg text-sm px-5 py-2.5">Salva</button>`, 'max-w-md');
            lucide.createIcons(); initFlowbite(); 
            this.populateDropdown('spesa-label', App.state.data.speseEtichette.map(l => ({ val: l.id, text: l.name })), curLabelId);
            document.querySelectorAll('.spesa-label-opt').forEach(opt => { opt.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('spesa-label-input').value = e.target.dataset.val; document.getElementById('spesa-label-text').textContent = e.target.textContent; const d = document.getElementById('spesa-label-dropdown'); if(d && typeof Flowbite !== 'undefined') { const di = Flowbite.instances.getInstance('Dropdown', d.id); if(di) di.hide(); else d.classList.add('hidden'); } }); });
            document.getElementById('btn-save-spesa').onclick = () => this.saveSpesa();
            if(id) document.getElementById('btn-delete-spesa').onclick = () => this.deleteSpesa(id);
            document.getElementById('btn-manage-labels').onclick = () => this.openLabelsModal();
        },
        saveSpesa() {
            const fd = new FormData(document.getElementById('form-spesa'));
            if(!fd.get('description') || !fd.get('amount')) return alert('Compila i campi obbligatori');
            const item = { id: this.localState.editingSpesaId||App.generateId('sp'), date: new Date(fd.get('date')).toISOString(), description: fd.get('description'), amount: parseFloat(fd.get('amount')), fornitore: fd.get('fornitore'), labelId: document.getElementById('spesa-label-input').value || 'default' };
            if(this.localState.editingSpesaId) { const idx = App.state.data.spese.findIndex(x=>x.id===this.localState.editingSpesaId); if(idx!==-1) App.state.data.spese[idx]=item; } else App.state.data.spese.push(item);
            App.saveToStorage(); App.closeModal(); this.render();
        },

        showDeleteModal(title, message, onConfirm) {
            const body = `<div class="text-center p-6 flex flex-col items-center"><i data-lucide="alert-triangle" class="w-16 h-16 text-red-600 mb-4"></i><h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${title}</h3><p class="text-gray-500 dark:text-gray-400 mb-6">${message}</p></div>`;
            const footer = `<div class="flex justify-center gap-4 w-full"><button id="btn-cancel-del" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600">Annulla</button><button id="btn-confirm-del" class="py-2.5 px-5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-800">Elimina</button></div>`;
            App.showModal('', body, footer, 'max-w-md');
            document.getElementById('btn-cancel-del').onclick = () => { if(this.localState.editingSpesaId) this.openSpesaModal(this.localState.editingSpesaId); else if(document.getElementById('new-label-name')) this.openLabelsModal(); else App.closeModal(); };
            document.getElementById('btn-confirm-del').onclick = onConfirm;
        },
        deleteSpesa(id) {
            this.showDeleteModal('Eliminare spesa?', 'Questa azione è irreversibile.', () => {
                App.state.data.spese = App.state.data.spese.filter(s=>s.id!==id); App.saveToStorage(); App.closeModal(); this.render();
            });
        },
        deleteLabel(id) {
            const count = App.state.data.spese.filter(s=>s.labelId===id).length;
            const msg = count > 0 ? `Ci sono ${count} spese associate. Verranno spostate in "Generale".` : 'Sei sicuro di voler eliminare questa etichetta?';
            this.showDeleteModal('Eliminare etichetta?', msg, () => {
                App.state.data.spese.forEach(s => { if(s.labelId===id) s.labelId='default'; });
                App.state.data.speseEtichette = App.state.data.speseEtichette.filter(l=>l.id!==id);
                App.saveToStorage(); this.openLabelsModal(); this.render();
            });
        },

        openLabelsModal() {
            const labels = App.state.data.speseEtichette;
            this.localState.newLabelColor = LABEL_COLORS[0].value; 
            const colorButtons = LABEL_COLORS.map(c => `<button type="button" class="w-8 h-8 rounded-full border-2 transition-all color-swatch" style="background-color: ${c.value}; border-color: ${c.value === this.localState.newLabelColor ? 'var(--color-primary-600)' : 'transparent'}" data-color="${c.value}" title="${c.name}"></button>`).join('');
            const body = `<div class="space-y-4"><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nuova Etichetta</label><div class="flex gap-2 mb-2"><input type="text" id="new-label-name" class="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Nome etichetta"><button id="btn-add-label" class="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700">Aggiungi</button></div><div class="flex gap-2" id="color-swatches">${colorButtons}</div></div><div class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg dark:border-gray-700"><table class="w-full text-sm text-left text-gray-500 dark:text-gray-400"><tbody>${labels.map(l => `<tr class="border-b last:border-0 dark:border-gray-700"><td class="px-4 py-3"><span class="w-3 h-3 inline-block rounded-full mr-2" style="background-color: ${l.color}"></span> ${l.name}</td><td class="px-4 py-3 text-right">${l.id!=='default' ? `<button class="text-red-600 hover:underline btn-del-label" data-id="${l.id}">Elimina</button>` : '<span class="text-xs text-gray-400">Default</span>'}</td></tr>`).join('')}</tbody></table></div></div>`;
            App.showModal('Gestisci Etichette', body, '<button class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600" onclick="App.closeModal()">Chiudi</button>', 'max-w-md');
            document.querySelectorAll('.color-swatch').forEach(btn => { btn.onclick = () => { this.localState.newLabelColor = btn.dataset.color; document.querySelectorAll('.color-swatch').forEach(b => b.style.borderColor = 'transparent'); btn.style.borderColor = '#2563eb'; }; });
            document.getElementById('btn-add-label').onclick = () => { const name = document.getElementById('new-label-name').value.trim(); if(name) { App.state.data.speseEtichette.push({ id: App.generateId('lbl'), name, color: this.localState.newLabelColor }); App.saveToStorage(); this.openLabelsModal(); this.updateView(); } };
            document.querySelectorAll('.btn-del-label').forEach(b => b.onclick = () => this.deleteLabel(b.dataset.id));
        },

        attachListeners() {
            document.getElementById('spese-search').oninput = (e) => { this.localState.filters.query = e.target.value; this.updateView(); };
            document.getElementById('btn-new-spesa').onclick = () => this.openSpesaModal();
            initFlowbite();
        },
        attachDynamicListeners() {
            document.querySelectorAll('.btn-edit-spesa').forEach(b => b.onclick = () => this.openSpesaModal(b.dataset.id));
        }
    };

    if(window.App) App.registerModule('spese', SpeseModule); else document.addEventListener('app:ready', () => App.registerModule('spese', SpeseModule));
})();
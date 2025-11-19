/* ==========================================================================
   MODULO: Gestione Prezzi (js/prezzi.js) - No Hover Fix
   ========================================================================== */
(function() {
    'use strict';
    const PrezziModule = {
        localState: { 
            editingId: null, 
            currentPage: 1, 
            itemsPerPage: 5,
            chart: null
        },
        surcharges: { self: 0.005, served: 0.220 },

        setupPriceInputs(groupName) {
            const inputs = document.querySelectorAll(`[data-price-group="${groupName}"] .price-square`);
            
            inputs.forEach((input, index) => {
                input.oninput = () => { input.value = input.value.replace(/[^0-9]/g, ''); };
                input.onkeydown = (e) => { if (e.key >= '0' && e.key <= '9' && input.value.length === 0) { e.preventDefault(); input.value = e.key; if (index < inputs.length - 1) inputs[index + 1].focus(); } else if (e.key === 'Backspace') { e.preventDefault(); input.value = ''; if (index > 0) inputs[index - 1].focus(); } else if (e.key.includes('Arrow')) { e.preventDefault(); if (e.key === 'ArrowRight' && index < inputs.length - 1) inputs[index + 1].focus(); else if (e.key === 'ArrowLeft' && index > 0) inputs[index - 1].focus(); } else if (e.key.length === 1 && input.value.length > 0) { e.preventDefault(); input.value = e.key; if (index < inputs.length - 1) inputs[index + 1].focus(); } else if (e.key !== 'Tab' && e.key.length === 1) { e.preventDefault(); } };
            });
        },

        getPriceFromInputs(groupName) {
            const inputs = document.querySelectorAll(`[data-price-group="${groupName}"] .price-square`);
            let pin = ''; inputs.forEach(input => pin += input.value);
            if (pin.length < 4) return null;
            const floatVal = parseFloat(pin[0] + '.' + pin.substring(1));
            return isNaN(floatVal) ? 0 : floatVal;
        },

        setPriceToInputs(groupName, price) {
            const inputs = document.querySelectorAll(`[data-price-group="${groupName}"] .price-square`);
            if (!inputs.length) return;
            let str = '0000';
            if (price && typeof price === 'number') { const fixedPrice = price.toFixed(3); str = fixedPrice.replace('.', ''); if (str.length > 4) str = str.substring(0, 4); } 
            else if (price === 0) { str = '0000'; } else { str = ''; }
            inputs.forEach((input, index) => { input.value = str[index] || ''; });
        },

        init() { },
        render() {
            const container = document.getElementById('prezzi-container'); if (!container) return;
            const p = this.getComputedPrices();
            const all = [...App.state.data.priceHistory].sort((a,b)=>new Date(b.date)-new Date(a.date));
            const totalPages = Math.ceil(all.length / this.localState.itemsPerPage);
            if (this.localState.currentPage > totalPages && totalPages > 0) this.localState.currentPage = totalPages;
            if (this.localState.currentPage < 1) this.localState.currentPage = 1;
            
            container.innerHTML = `
                <div class="flex flex-col gap-6 animate-fade-in">
                    <div class="flex justify-between items-center"><h2 class="text-2xl font-bold text-gray-800 dark:text-white">Gestione Prezzi Carburante</h2></div>
                    
                    <div id="prezzi-stats-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
                        ${this.renderStatCard('stat-benzina', 'Benzina', p.benzina, 'bg-green-500', 'droplets')}
                        ${this.renderStatCard('stat-gasolio', 'Gasolio', p.gasolio, 'bg-orange-500', 'droplets')}
                        ${this.renderStatCard('stat-dieselplus', 'Diesel+', p.dieselPlus, 'bg-rose-600', 'droplets')}
                        ${this.renderStatCard('stat-hvo', 'Hvolution', p.hvolution, 'bg-cyan-500', 'droplets')}
                        ${this.renderStatCard('stat-adblue', 'AdBlue', p.adblue, 'bg-blue-500', 'droplets')}
                    </div>

                    <div id="prezzi-main-grid" class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        
                        <div id="card-grafico" class="lg:col-span-3 flex flex-col bg-white border border-gray-200 shadow-none rounded-lg dark:bg-gray-800 dark:border-gray-700 draggable-card">
                            <div class="px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 card-header cursor-move">
                                <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200">Andamento Prezzi (Anno Corrente)</h3>
                            </div>
                            <div class="p-6 h-96"><canvas id="prezzi-chart-canvas"></canvas></div>
                        </div>
                        
                        <div id="card-storico" class="lg:col-span-2 flex flex-col bg-white border border-gray-200 shadow-none rounded-lg dark:bg-gray-800 dark:border-gray-700 draggable-card">
                            <div class="px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 card-header cursor-move">
                                <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200">Storico Listini Base</h3>
                                <button id="btn-new-listino" class="py-2 px-3 inline-flex items-center text-sm font-semibold rounded-lg border border-transparent bg-primary-600 text-white hover:bg-primary-700 transition-colors" title="Nuovo Listino">
                                    <i data-lucide="plus" class="size-4 sm:mr-2"></i>
                                    <span class="hidden sm:inline">Nuovo</span>
                                </button>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead class="bg-gray-50 dark:bg-gray-700"><tr><th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Data</th><th class="px-6 py-3 text-start text-xs font-medium text-green-600 uppercase">Benzina</th><th class="px-6 py-3 text-start text-xs font-medium text-orange-600 uppercase">Gasolio</th><th class="px-6 py-3 text-start text-xs font-medium text-rose-600 uppercase">Diesel+</th><th class="px-6 py-3 text-start text-xs font-medium text-cyan-600 uppercase">Hvol</th><th class="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">Azioni</th></tr></thead>
                                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700" id="listini-tbody">${this.renderListiniRows(all)}</tbody>
                                </table>
                            </div>
                            ${this.renderPagination(totalPages)}
                        </div>

                        <div id="card-concorrenza" class="lg:col-span-1 flex flex-col bg-white border border-gray-200 shadow-none rounded-lg dark:bg-gray-800 dark:border-gray-700 draggable-card">
                            <div class="px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 card-header cursor-move">
                                <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200">Concorrenza</h3>
                                <button id="btn-upd-concorrenza" class="py-2 px-3 inline-flex items-center text-sm font-semibold rounded-lg border border-transparent bg-primary-600 text-white hover:bg-primary-700 transition-colors" title="Aggiorna Concorrenza">
                                    <i data-lucide="refresh-cw" class="size-4 sm:mr-2"></i>
                                </button>
                            </div>
                            <div class="p-6">${this.renderConcorrenzaBody(p)}</div>
                        </div>

                    </div>
                </div>`;
            
            lucide.createIcons();
            this.renderChart();
            this.attachListeners();
            this.restoreLayout();
            this.initDragAndDrop();
        },

        initDragAndDrop() {
            const save = () => this.saveLayout();
            const stats = document.getElementById('prezzi-stats-container');
            if (stats) {
                new Sortable(stats, {
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    onSort: save
                });
            }
            const mainGrid = document.getElementById('prezzi-main-grid');
            if (mainGrid) {
                new Sortable(mainGrid, {
                    animation: 150,
                    handle: '.card-header',
                    ghostClass: 'sortable-ghost',
                    onSort: save
                });
            }
        },

        saveLayout() {
            try {
                const getIds = (cid) => Array.from(document.getElementById(cid)?.children || []).map(el => el.id).filter(id => id);
                const layout = {
                    stats: getIds('prezzi-stats-container'),
                    main: getIds('prezzi-main-grid')
                };
                localStorage.setItem('mystation_prezzi_layout_v1', JSON.stringify(layout));
            } catch (e) { console.warn('Salvataggio layout prezzi bloccato:', e); }
        },

        restoreLayout() {
            try {
                const saved = localStorage.getItem('mystation_prezzi_layout_v1');
                if (!saved) return;
                const layout = JSON.parse(saved);
                const restore = (cid, ids) => {
                    const container = document.getElementById(cid);
                    if (!container || !ids) return;
                    ids.forEach(id => { const el = document.getElementById(id); if (el) container.appendChild(el); });
                };
                restore('prezzi-stats-container', layout.stats);
                restore('prezzi-main-grid', layout.main);
            } catch (e) { console.warn("Errore ripristino layout prezzi:", e); }
        },

        getComputedPrices() {
            const h = App.state.data.priceHistory;
            const l = h.length ? [...h].sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
            const comp = (bp) => (!bp ? { listino:0, self:0, served:0 } : { listino:bp, self:bp+this.surcharges.self, served:bp+this.surcharges.self+this.surcharges.served });
            const compFlat = (bp) => (!bp ? { listino:0, self:0, served:0 } : { listino:bp, self:bp, served:bp });
            return { date: l?.date||null, benzina: comp(l?.benzina), gasolio: comp(l?.gasolio), dieselPlus: comp(l?.dieselPlus), hvolution: comp(l?.hvolution), adblue: compFlat(l?.adblue) };
        },

        renderStatCard(id, t, p, bg, i) {
            const showServed = p.self > 0 && p.served !== p.self;
            const priceToShow = (t === 'AdBlue') ? p.listino : p.self;
            // EOS Style: solid circular icon
            return `<div id="${id}" class="p-4 ${bg} rounded-lg text-white shadow-none flex justify-between items-center draggable-card cursor-move">
                <div><h4 class="text-sm font-medium opacity-90">${t}</h4><p class="text-2xl font-bold mt-1">${App.formatPrice(priceToShow)}</p>${showServed?`<p class="text-xs opacity-80 mt-1">Servito: ${App.formatPrice(p.served)}</p>`:''}</div>
                <div class="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full"><i data-lucide="${i}" class="w-5 h-5"></i></div>
            </div>`;
        },

        renderListiniRows(all) {
            if(!all.length) return '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Nessun dato.</td></tr>';
            const start = (this.localState.currentPage - 1) * this.localState.itemsPerPage;
            return all.slice(start, start + this.localState.itemsPerPage).map(i => `
                <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-gray-200">${App.formatDate(i.date)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-200">${App.formatPrice(i.benzina)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-200">${App.formatPrice(i.gasolio)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-200">${App.formatPrice(i.dieselPlus)||'-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-200">${App.formatPrice(i.hvolution)||'-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium"><button class="btn-edit-listino text-primary-600 hover:underline dark:text-primary-500" data-id="${i.id}">Modifica</button></td>
                </tr>`).join('');
        },

        renderPagination(totalPages) {
            if (totalPages <= 1) return '';
            const curr = this.localState.currentPage;
            return `<div class="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-100 dark:border-gray-700"><div class="text-sm text-gray-600 dark:text-gray-400">Pagina <span class="font-semibold text-gray-900 dark:text-white">${curr}</span> di <span class="font-semibold text-gray-900 dark:text-white">${totalPages}</span></div><div class="inline-flex rounded-md shadow-sm"><button id="p-prev-page" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-50 hover:text-primary-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50" ${curr===1?'disabled':''}><i data-lucide="chevron-left" class="w-4 h-4 mr-2"></i> Prec</button><button id="p-next-page" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-l-0 border-gray-200 rounded-e-lg hover:bg-gray-50 hover:text-primary-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50" ${curr===totalPages?'disabled':''}>Succ <i data-lucide="chevron-right" class="w-4 h-4 ml-2"></i></button></div></div>`;
        },

        renderConcorrenzaBody(my) {
            const h = App.state.data.competitorPrices;
            const l = h.length ? [...h].sort((a,b)=>new Date(b.date)-new Date(a.date))[0] : {};
            const diff = (cp, mp) => { if(!cp || !mp) return '-'; const d = cp - mp; const c = d>0?'text-green-600':(d<0?'text-red-600':'text-gray-500'); return `<span class="${c} ml-1 font-medium">(${d>0?'+':''}${d.toFixed(3)})</span>`; };
            const row = (n, d) => `<div class="py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"><h4 class="font-bold text-gray-800 dark:text-white mb-2">${n}</h4><div class="flex justify-between text-sm mb-1"><span class="text-gray-500 dark:text-gray-400">Benzina:</span><div><span class="dark:text-gray-200">${App.formatPrice(d?.benzina)}</span> ${diff(d?.benzina, my.benzina.self)}</div></div><div class="flex justify-between text-sm"><span class="text-gray-500 dark:text-gray-400">Gasolio:</span><div><span class="dark:text-gray-200">${App.formatPrice(d?.gasolio)}</span> ${diff(d?.gasolio, my.gasolio.self)}</div></div></div>`;
            return `<p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Ultimo agg.: ${App.formatDate(l.date)}</p>${row('MyOil',l.myoil)}${row('Esso',l.esso)}${row('Q8',l.q8)}${l.notes?`<p class="text-sm italic text-gray-500 dark:text-gray-400 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">${l.notes}</p>`:''}`;
        },

        renderChart() {
            const ctx = document.getElementById('prezzi-chart-canvas')?.getContext('2d');
            if (!ctx) return;
            
            const isDark = document.documentElement.classList.contains('dark');
            const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            const tickColor = isDark ? '#9ca3af' : '#4b5563';
            
            const currentYear = new Date().getFullYear();
            const labels = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
            
            const monthlySums = { benzina: Array(12).fill(0), gasolio: Array(12).fill(0), dieselPlus: Array(12).fill(0), hvolution: Array(12).fill(0) };
            const monthlyCounts = { benzina: Array(12).fill(0), gasolio: Array(12).fill(0), dieselPlus: Array(12).fill(0), hvolution: Array(12).fill(0) };

            const yearHistory = App.state.data.priceHistory.filter(p => new Date(p.date).getFullYear() === currentYear);

            yearHistory.forEach(p => {
                const month = new Date(p.date).getMonth();
                if (p.benzina !== null) { monthlySums.benzina[month] += parseFloat(p.benzina); monthlyCounts.benzina[month]++; }
                if (p.gasolio !== null) { monthlySums.gasolio[month] += parseFloat(p.gasolio); monthlyCounts.gasolio[month]++; }
                if (p.dieselPlus !== null) { monthlySums.dieselPlus[month] += parseFloat(p.dieselPlus); monthlyCounts.dieselPlus[month]++; }
                if (p.hvolution !== null) { monthlySums.hvolution[month] += parseFloat(p.hvolution); monthlyCounts.hvolution[month]++; }
            });
            
            const calculateAverage = (sums, counts) => sums.map((sum, i) => (counts[i] > 0 ? parseFloat((sum / counts[i]).toFixed(3)) : null));
            
            const datasets = [
                { label: 'Benzina', data: calculateAverage(monthlySums.benzina, monthlyCounts.benzina), borderColor: '#22c55e', backgroundColor: '#22c55e', borderWidth: 2, pointRadius: 3, tension: 0.1, fill: false },
                { label: 'Gasolio', data: calculateAverage(monthlySums.gasolio, monthlyCounts.gasolio), borderColor: '#f97316', backgroundColor: '#f97316', borderWidth: 2, pointRadius: 3, tension: 0.1, fill: false },
                { label: 'Diesel+', data: calculateAverage(monthlySums.dieselPlus, monthlyCounts.dieselPlus), borderColor: '#e11d48', backgroundColor: '#e11d48', borderWidth: 2, pointRadius: 3, tension: 0.1, fill: false },
                { label: 'Hvolution', data: calculateAverage(monthlySums.hvolution, monthlyCounts.hvolution), borderColor: '#06b6d4', backgroundColor: '#06b6d4', borderWidth: 3, borderDash: [5, 5], pointRadius: 5, tension: 0.1, fill: false }
            ];

            if (this.localState.chart) this.localState.chart.destroy();
            this.localState.chart = new Chart(ctx, {
                type: 'line',
                data: { labels, datasets },
                options: { 
                    responsive: true, maintainAspectRatio: false, 
                    plugins: { legend: { display: true, labels: { color: tickColor } }, tooltip: { mode: 'index', intersect: false } },
                    scales: { y: { beginAtZero: false, ticks: { color: tickColor }, grid: { color: gridColor } }, x: { ticks: { color: tickColor }, grid: { color: gridColor } } },
                    elements: { line: { tension: 0.4 }, point: { radius: 4, hitRadius: 10, hoverRadius: 6 } }
                }
            });
        },
        
        openListinoModal(id=null) {
            this.localState.editingId = id;
            const i = id ? App.state.data.priceHistory.find(x=>x.id===id) : null;
            const h = App.state.data.priceHistory;
            const latest = h.length ? [...h].sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
            const d = new Date().toISOString().split('T')[0];
            const cls = "h-11 py-3 px-4 block w-full border-gray-300 rounded-lg text-sm focus:border-primary-500 focus:ring-primary-500 shadow-sm text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white";
            
            const priceInputHTML = (groupName) => {
                return `
                <div class="price-input-group" data-price-group="${groupName}">
                    <input type="text" inputmode="numeric" maxlength="1" class="price-square bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <input type="text" inputmode="numeric" maxlength="1" class="price-square bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <input type="text" inputmode="numeric" maxlength="1" class="price-square bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <input type="text" inputmode="numeric" maxlength="1" class="price-square bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                </div>`;
            };
            
            const notesVal = i ? (i.notes || '') : '';
            const form = `<form id="form-listino" class="space-y-4"><div class="grid grid-cols-2 gap-4"><div><label class="block text-sm font-medium mb-2 dark:text-white">Data Listino</label><input type="date" name="date" value="${i?i.date.split('T')[0]:d}" class="${cls}" required></div><div><label class="block text-sm font-medium mb-2 dark:text-white">Annotazioni</label><input type="text" name="notes" value="${notesVal}" class="${cls}" placeholder="Opzionale..."></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5"><div><label class="block text-sm font-medium mb-2 text-green-600 dark:text-green-500">Benzina *</label>${priceInputHTML('benzina')}</div><div><label class="block text-sm font-medium mb-2 text-orange-600 dark:text-orange-500">Gasolio *</label>${priceInputHTML('gasolio')}</div><div><label class="block text-sm font-medium mb-2 text-rose-600 dark:text-rose-500">Diesel+ *</label>${priceInputHTML('dieselPlus')}</div><div><label class="block text-sm font-medium mb-2 text-cyan-600 dark:text-cyan-500">Hvolution *</label>${priceInputHTML('hvolution')}</div><div><label class="block text-sm font-medium mb-2 text-blue-600 dark:text-blue-500">AdBlue (€/L)</label>${priceInputHTML('adblue')}</div></div></form>`;
            
            App.showModal(id?'Modifica Listino':'Nuovo Listino Base', form, '<button id="btn-save-listino" class="py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold">Salva</button>', 'max-w-xl');
            
            const item = i || latest;
            this.setPriceToInputs('benzina', item?.benzina);
            this.setPriceToInputs('gasolio', item?.gasolio);
            this.setPriceToInputs('dieselPlus', item?.dieselPlus);
            this.setPriceToInputs('hvolution', item?.hvolution);
            this.setPriceToInputs('adblue', item?.adblue);
            this.setupPriceInputs('benzina'); this.setupPriceInputs('gasolio'); this.setupPriceInputs('dieselPlus'); this.setupPriceInputs('hvolution'); this.setupPriceInputs('adblue');
            document.getElementById('btn-save-listino').onclick = () => this.saveListino();
        },

        saveListino() {
            const f = document.getElementById('form-listino');
            const fd = new FormData(f);
            const benzina = this.getPriceFromInputs('benzina');
            const gasolio = this.getPriceFromInputs('gasolio');
            const dieselPlus = this.getPriceFromInputs('dieselPlus');
            const hvolution = this.getPriceFromInputs('hvolution');
            const adblue = this.getPriceFromInputs('adblue');

            if (benzina === null || gasolio === null || dieselPlus === null || hvolution === null) {
                 App.showToast('Compilare tutti i prezzi carburante (4 cifre). AdBlue è opzionale.', 'error');
                 return;
            }

            const n = { 
                id: this.localState.editingId||App.generateId('list'), 
                date: new Date(fd.get('date')).toISOString(), 
                notes: fd.get('notes') || null,
                benzina: benzina,
                gasolio: gasolio,
                dieselPlus: dieselPlus,
                hvolution: hvolution,
                adblue: adblue
            };
            
            if(this.localState.editingId) { const idx = App.state.data.priceHistory.findIndex(x=>x.id===this.localState.editingId); if(idx!==-1) App.state.data.priceHistory[idx]=n; } else { App.state.data.priceHistory.push(n); }
            App.saveToStorage(); App.closeModal(); this.render();
        },
        
        openConcorrenzaModal() {
            const h = App.state.data.competitorPrices;
            const l = h.length ? [...h].sort((a,b)=>new Date(b.date)-new Date(a.date))[0] : {};
            const d = new Date().toISOString().split('T')[0];
            const cls = "h-11 px-4 block w-full border-gray-300 rounded-lg text-sm focus:border-primary-500 focus:ring-primary-500 shadow-sm text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white";
            const priceInputHTML = (groupName) => { return `<div class="price-input-group" data-price-group="${groupName}"><input type="text" inputmode="numeric" maxlength="1" class="price-square bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"><input type="text" inputmode="numeric" maxlength="1" class="price-square bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"><input type="text" inputmode="numeric" maxlength="1" class="price-square bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"><input type="text" inputmode="numeric" maxlength="1" class="price-square bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></div>`; };
            const form = `<form id="form-concorrenza" class="space-y-6"><div class="grid grid-cols-2 gap-4"><div><label class="block text-sm font-medium mb-2 dark:text-white">Data Rilevazione</label><input type="date" name="date" value="${d}" class="${cls}" required></div><div><label class="block text-sm font-medium mb-2 dark:text-white">Annotazioni</label><input type="text" name="notes" class="${cls}" placeholder="..."></div></div><div class="grid gap-6 items-center" style="grid-template-columns: 80px 1fr 1fr;"><div></div><label class="text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Benzina</label><label class="text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Gasolio</label><div class="font-bold text-gray-800 dark:text-white text-sm">MyOil</div>${priceInputHTML('myoil_benzina')}${priceInputHTML('myoil_gasolio')}<div class="font-bold text-gray-800 dark:text-white text-sm">Esso</div>${priceInputHTML('esso_benzina')}${priceInputHTML('esso_gasolio')}<div class="font-bold text-gray-800 dark:text-white text-sm">Q8</div>${priceInputHTML('q8_benzina')}${priceInputHTML('q8_gasolio')}</div></form>`;
            App.showModal('Aggiorna Concorrenza', form, '<button id="btn-save-concorrenza" class="py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold">Salva</button>', 'max-w-2xl');
            this.setPriceToInputs('myoil_benzina', l.myoil?.benzina); this.setPriceToInputs('myoil_gasolio', l.myoil?.gasolio);
            this.setPriceToInputs('esso_benzina', l.esso?.benzina); this.setPriceToInputs('esso_gasolio', l.esso?.gasolio);
            this.setPriceToInputs('q8_benzina', l.q8?.benzina); this.setPriceToInputs('q8_gasolio', l.q8?.gasolio);
            this.setupPriceInputs('myoil_benzina'); this.setupPriceInputs('myoil_gasolio');
            this.setupPriceInputs('esso_benzina'); this.setupPriceInputs('esso_gasolio');
            this.setupPriceInputs('q8_benzina'); this.setupPriceInputs('q8_gasolio');
            document.getElementById('btn-save-concorrenza').onclick = () => this.saveConcorrenza();
        },

        saveConcorrenza() {
            const fd = new FormData(document.getElementById('form-concorrenza'));
            const myoil_b = this.getPriceFromInputs('myoil_benzina'); const myoil_g = this.getPriceFromInputs('myoil_gasolio');
            const esso_b = this.getPriceFromInputs('esso_benzina'); const esso_g = this.getPriceFromInputs('esso_gasolio');
            const q8_b = this.getPriceFromInputs('q8_benzina'); const q8_g = this.getPriceFromInputs('q8_gasolio');

            App.state.data.competitorPrices.push({ 
                id: App.generateId('comp'), 
                date: new Date(fd.get('date')).toISOString(), 
                notes: fd.get('notes')||'', 
                myoil:{benzina:myoil_b||0, gasolio:myoil_g||0}, 
                esso:{benzina:esso_b||0, gasolio:esso_g||0}, 
                q8:{benzina:q8_b||0, gasolio:q8_g||0}
            });
            App.saveToStorage(); App.closeModal(); this.render();
        },
        
        attachListeners() {
            document.getElementById('btn-new-listino').onclick = () => this.openListinoModal();
            document.getElementById('btn-upd-concorrenza').onclick = () => this.openConcorrenzaModal();
            document.querySelectorAll('.btn-edit-listino').forEach(b => b.onclick = () => this.openListinoModal(b.dataset.id));
            const p = document.getElementById('p-prev-page'); if(p) p.onclick = () => { this.localState.currentPage--; this.render(); };
            const n = document.getElementById('p-next-page'); if(n) n.onclick = () => { this.localState.currentPage++; this.render(); };
        }
    };
    if(window.App) App.registerModule('prezzi', PrezziModule); else document.addEventListener('app:ready', () => App.registerModule('prezzi', PrezziModule));
})();
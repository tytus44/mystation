/* ==========================================================================
   MODULO: VirtualStation (js/virtualstation.js) - Chart Animations Fixed (Online)
   ========================================================================== */
(function() {
    'use strict';

    const VirtualModule = {
        localState: {
            filterMode: 'today',
            currentPage: 1,
            itemsPerPage: 5,
            editingId: null,
            chartInstances: { p: null, s: null, t: null }, // Inizializzato esplicitamente
            datepicker: null
        },

        init() {
            try {
                this.localState.filterMode = localStorage.getItem('virtual_filter_mode') || 'today';
                if (this.localState.filterMode === 'month') {
                    this.localState.filterMode = 'today';
                    localStorage.setItem('virtual_filter_mode', 'today');
                }
            } catch (e) { console.warn('Storage blocked:', e); }
            if (!App.state.data.turni) App.state.data.turni = [];
        },

        render() {
            const container = document.getElementById('virtual-container');
            if (!container) return;

            if (!document.getElementById('virtual-layout')) {
                container.innerHTML = this.getLayoutHTML();
                lucide.createIcons();
                if (typeof initFlowbite === 'function') initFlowbite();
                this.attachListeners();
            }
            this.updateView();
            this.restoreLayout();
            this.initDragAndDrop();
        },

        updateView() {
            VirtualModule.updateStats();
            VirtualModule.updateFilterLabel();
            VirtualModule.renderTable();
            VirtualModule.updateCharts();
        },

        initDragAndDrop() {
            const save = () => VirtualModule.saveLayout();
            const mainSections = document.getElementById('virtual-sections-container');
            if (mainSections) {
                new Sortable(mainSections, { animation: 150, handle: '.section-handle', ghostClass: 'sortable-ghost', onSort: save });
            }
            const stats = document.getElementById('v-stats-container');
            if (stats) {
                new Sortable(stats, { animation: 150, ghostClass: 'sortable-ghost', onSort: save });
            }
            const charts = document.getElementById('v-charts-container');
            if (charts) {
                new Sortable(charts, { animation: 150, handle: '.card-header', ghostClass: 'sortable-ghost', onSort: save });
            }
        },

        saveLayout() {
            try {
                const getIds = (cid) => Array.from(document.getElementById(cid)?.children || []).map(el => el.id).filter(id => id);
                const layout = {
                    sections: getIds('virtual-sections-container'),
                    stats: getIds('v-stats-container'),
                    charts: getIds('v-charts-container')
                };
                localStorage.setItem('Polaris_virtual_layout_v4', JSON.stringify(layout));
            } catch (e) { console.warn('Salvataggio layout bloccato:', e); }
        },

        restoreLayout() {
            try {
                const saved = localStorage.getItem('Polaris_virtual_layout_v4');
                if (!saved) return;
                const layout = JSON.parse(saved);
                const restore = (cid, ids) => {
                    const container = document.getElementById(cid);
                    if (!container || !ids) return;
                    ids.forEach(id => { const el = document.getElementById(id); if (el) container.appendChild(el); });
                };
                restore('virtual-sections-container', layout.sections);
                restore('v-stats-container', layout.stats);
                restore('v-charts-container', layout.charts);
            } catch (e) { console.warn("Errore ripristino layout virtual:", e); }
        },

        getLayoutHTML() {
            const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
            const monthLinks = months.map((monthName, index) => {
                return `<li><a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white btn-filter-opt" data-mode="month-${index}">${monthName}</a></li>`;
            }).join('');

            return `
                <div id="virtual-layout" class="flex flex-col gap-6 animate-fade-in">
                    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Virtualstation</h2>
                        <div class="flex flex-wrap items-center gap-3">
                            <button id="dropdownFilterButton" data-dropdown-toggle="dropdownFilter" class="text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700" type="button">
                                <i data-lucide="calendar" class="w-4 h-4 sm:mr-2 text-gray-500 dark:text-gray-400"></i>
                                <span id="filter-label" class="hidden sm:inline">Oggi</span>
                                <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/></svg>
                            </button>
                            <div id="dropdownFilter" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                                <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownFilterButton">
                                    <li><a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white btn-filter-opt" data-mode="today">Oggi</a></li>
                                    ${monthLinks}
                                    <li><a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white btn-filter-opt" data-mode="year">Anno ${new Date().getFullYear()}</a></li>
                                </ul>
                            </div>
                            <button id="btn-new-turno" class="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center" title="Nuovo Turno">
                                <i data-lucide="monitor-dot" class="size-4 sm:mr-2"></i>
                                <span class="hidden sm:inline">Nuovo Turno</span>
                            </button>
                        </div>
                    </div>

                    <div id="virtual-sections-container" class="flex flex-col gap-8">
                        <div id="sec-stats" class="group">
                            <div id="v-stats-container" class="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start"></div>
                        </div>
                        <div id="sec-charts" class="group">
                            <div id="v-charts-container" class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                                <div id="v-card-service" class="bg-white border border-gray-200 rounded-lg shadow-none dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-header cursor-move">
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Modalità di Servizio</h3>
                                    </div>
                                    <div class="p-6 h-80"><canvas id="v-service-chart"></canvas></div>
                                </div>
                                <div id="v-card-products" class="bg-white border border-gray-200 rounded-lg shadow-none dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-header cursor-move">
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Vendite per Prodotto</h3>
                                    </div>
                                    <div class="p-6 h-80"><canvas id="v-products-chart"></canvas></div>
                                </div>
                                <div id="v-card-trend" class="bg-white border border-gray-200 rounded-lg shadow-none dark:bg-gray-800 dark:border-gray-700 lg:col-span-1 draggable-card overflow-hidden">
                                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-header cursor-move">
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Andamento Anno</h3>
                                    </div>
                                    <div class="p-6 h-80"><canvas id="v-trend-chart"></canvas></div>
                                </div>
                            </div>
                        </div>
                        <div id="sec-table" class="group">
                             <div class="bg-white border border-gray-200 rounded-lg shadow-none dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                                 <div class="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 section-handle cursor-move transition-colors" title="Sposta sezione">
                                    <i data-lucide="history" class="w-5 h-5 mr-2 text-gray-900 dark:text-white"></i>
                                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Storico Turni</h3>
                                 </div>
                                 <div class="p-6">
                                     <div class="overflow-x-auto"><table class="w-full text-sm text-left text-gray-500 dark:text-gray-400"><thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"><tr><th class="px-4 py-3">Data</th><th class="px-4 py-3">Turno</th><th class="px-4 py-3">Benzina</th><th class="px-4 py-3">Gasolio</th><th class="px-4 py-3">Diesel+</th><th class="px-4 py-3">Hvol</th><th class="px-4 py-3">Totale</th><th class="px-4 py-3 text-right">Azioni</th></tr></thead><tbody class="divide-y divide-gray-200 dark:divide-gray-700" id="v-table-body"></tbody></table></div>
                                     <div id="v-pagination"></div>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        },

        updateStats() {
            const stats = VirtualModule.calculateStats();
            const c = document.getElementById('v-stats-container');
            if(c && c.children.length === 0) {
                c.innerHTML = `
                    ${VirtualModule.renderStatCard('stat-liters', 'Litri Venduti', App.formatCurrency(stats.liters).replace('€','').trim(), 'bg-cyan-600', 'fuel')}
                    ${VirtualModule.renderStatCard('stat-revenue', 'Fatturato Stimato', App.formatCurrency(stats.revenue), 'bg-green-600', 'euro')}
                    ${VirtualModule.renderStatCard('stat-served', '% Servito', stats.servitoPerc + '%', 'bg-purple-600', 'user-check')}
                `;
                lucide.createIcons();
            } else if (c) {
                if(document.getElementById('val-stat-liters')) document.getElementById('val-stat-liters').textContent = App.formatCurrency(stats.liters).replace('€','').trim();
                if(document.getElementById('val-stat-revenue')) document.getElementById('val-stat-revenue').textContent = App.formatCurrency(stats.revenue);
                if(document.getElementById('val-stat-served')) document.getElementById('val-stat-served').textContent = stats.servitoPerc + '%';
            }
        },
        renderStatCard(id, title, value, iconBg, iconName) {
            return `
                <div id="${id}" class="bg-white border border-gray-200 rounded-lg shadow-none dark:bg-gray-800 dark:border-gray-700 draggable-card cursor-move overflow-hidden">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-header">
                        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">${title}</h3>
                        <div class="flex items-center justify-center w-10 h-10 ${iconBg} text-white rounded-full shadow-sm">
                            <i data-lucide="${iconName}" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="text-2xl font-bold text-gray-900 dark:text-white" id="val-${id}">${value}</div>
                    </div>
                </div>`;
        },
        
        updateFilterLabel() {
            const mode = this.localState.filterMode;
            let label = 'Oggi';
            const year = new Date().getFullYear();
            if (mode === 'year') {
                label = `Anno ${year}`;
            } else if (mode.startsWith('month-')) {
                const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
                const monthIndex = parseInt(mode.split('-')[1], 10);
                label = months[monthIndex];
            }
            document.getElementById('filter-label').textContent = label;
        },

        renderTable() {
            const tbody = document.getElementById('v-table-body');
            const pagination = document.getElementById('v-pagination');
            if (!tbody || !pagination) return;
            const all = VirtualModule.getFilteredTurni();
            const totalPages = Math.ceil(all.length / this.localState.itemsPerPage);
            if (this.localState.currentPage > totalPages && totalPages > 0) this.localState.currentPage = totalPages;
            if (this.localState.currentPage < 1) this.localState.currentPage = 1;
            const start = (this.localState.currentPage - 1) * this.localState.itemsPerPage;
            const pageItems = all.slice(start, start + this.localState.itemsPerPage);
            if (!pageItems.length) tbody.innerHTML = '<tr><td colspan="8" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">Nessun turno trovato.</td></tr>';
            else {
                tbody.innerHTML = pageItems.map(t => {
                    const total = VirtualModule.getTurnoTotalLitri(t);
                    const isRiep = t.turno === 'Riepilogo Mensile';
                    return `<tr class="border-b dark:border-gray-700 ${isRiep ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}"><th class="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">${App.formatDate(t.date)}</th><td class="px-4 py-3">${t.turno}</td><td class="px-4 py-3">${VirtualModule.fmtProd(t, 'benzina')}</td><td class="px-4 py-3">${VirtualModule.fmtProd(t, 'gasolio')}</td><td class="px-4 py-3">${VirtualModule.fmtProd(t, 'dieselplus')}</td><td class="px-4 py-3">${VirtualModule.fmtProd(t, 'hvolution')}</td><td class="px-4 py-3 font-semibold">${App.formatNumber(total)}</td><td class="px-4 py-3 text-right"><button class="btn-edit-turno font-medium text-primary-600 dark:text-primary-500 hover:underline" data-id="${t.id}">Modifica</button></td></tr>`;
                }).join('');
            }
            if (totalPages > 1) {
                const curr = this.localState.currentPage;
                pagination.innerHTML = `<div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700"><span class="text-sm font-normal text-gray-500 dark:text-gray-400">Pagina <span class="font-semibold text-gray-900 dark:text-white">${curr}</span> di <span class="font-semibold text-gray-900 dark:text-white">${totalPages}</span></span><ul class="inline-flex items-center -space-x-px"><li><button id="v-prev-page" class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" ${curr===1?'disabled':''}><i data-lucide="chevron-left" class="w-4 h-4 mr-1"></i> Prec</button></li><li><button id="v-next-page" class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-primary-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" ${curr===totalPages?'disabled':''}>Succ <i data-lucide="chevron-right" class="w-4 h-4 ml-1"></i></button></li></ul></div>`;
                document.getElementById('v-prev-page')?.addEventListener('click', () => { this.localState.currentPage--; VirtualModule.renderTable(); });
                document.getElementById('v-next-page')?.addEventListener('click', () => { this.localState.currentPage++; VirtualModule.renderTable(); });
                lucide.createIcons();
            } else pagination.innerHTML = '';
            document.querySelectorAll('.btn-edit-turno').forEach(b => b.onclick = () => VirtualModule.openTurnoModal(b.dataset.id));
        },

        fmtProd(t, p) { const tot = (parseFloat(t.prepay?.[p])||0) + (parseFloat(t.servito?.[p])||0) + (parseFloat(t.fdt?.[p])||0); return tot > 0 ? App.formatNumber(tot) : '-'; },
        
        getFilteredTurni() {
            const mode = this.localState.filterMode; 
            const now = new Date(); 
            const start = new Date(); 
            start.setHours(0,0,0,0);
            const allTurni = App.state.data.turni.sort((a,b) => new Date(b.date) - new Date(a.date));

            if (mode === 'today') {
                return allTurni.filter(t => { const d = new Date(t.date); return d >= start && d <= now; });
            }
            const currentYear = now.getFullYear();
            if (mode === 'year') {
                start.setMonth(0, 1); 
                return allTurni.filter(t => new Date(t.date).getFullYear() === currentYear);
            }
            if (mode.startsWith('month-')) {
                const monthIndex = parseInt(mode.split('-')[1], 10);
                return allTurni.filter(t => {
                    const d = new Date(t.date);
                    return d.getFullYear() === currentYear && d.getMonth() === monthIndex;
                });
            }
            return allTurni.filter(t => { const d = new Date(t.date); return d >= start && d <= now; });
        },

        getTurnoTotalLitri(t) { return this.sumObj(t.prepay) + this.sumObj(t.servito) + this.sumObj(t.fdt); },
        sumObj(o) { return Object.values(o||{}).reduce((a,b)=>a+(parseFloat(b)||0),0); },
        
        calculateStats() {
            const turni = VirtualModule.getFilteredTurni(); 
            const prices = VirtualModule.getLatestPrices();
            let liters=0, rev=0, serv=0;
            const mFdt=0.04, mServ=0.08, mAdblue=0.40, surSelf=0.005, surServ=0.220; 
            turni.forEach(t => {
                ['benzina','gasolio','dieselplus','hvolution','adblue'].forEach(k => {
                    const pp = parseFloat(t.prepay?.[k])||0;
                    const sv = parseFloat(t.servito?.[k])||0;
                    const fd = parseFloat(t.fdt?.[k])||0; 
                    const totLitriProdotto = pp + sv + fd;
                    liters += totLitriProdotto;
                    serv += sv; 
                    const pKey = k==='dieselplus'?'dieselPlus':k;
                    const bp = prices[pKey]||0;
                    if(bp > 0) { 
                        if(k === 'adblue') { 
                            rev += (sv * bp); 
                        } else { 
                            rev += (pp * (bp + surSelf)) + (sv * (bp + surSelf + surServ)) + (fd * (bp + surSelf)); 
                        } 
                    }
                });
            });
            return { liters, revenue: rev, servitoPerc: liters > 0 ? Math.round((serv / liters) * 100) : 0 };
        },
        getLatestPrices() { if(!App.state.data.priceHistory?.length) return {}; return [...App.state.data.priceHistory].sort((a,b)=>new Date(b.date)-new Date(a.date))[0]; },
        capitalize(s) { return s && s[0].toUpperCase() + s.slice(1); },
        
        updateCharts() {
            const ctxP = document.getElementById('v-products-chart')?.getContext('2d');
            const ctxS = document.getElementById('v-service-chart')?.getContext('2d');
            const ctxT = document.getElementById('v-trend-chart')?.getContext('2d');

            // 1. Pulizia istanze precedenti
            const keys = ['p', 's', 't'];
            keys.forEach(k => {
                if (VirtualModule.localState.chartInstances[k]) {
                    VirtualModule.localState.chartInstances[k].destroy();
                    VirtualModule.localState.chartInstances[k] = null;
                }
            });

            if (!ctxP || !ctxS || !ctxT) return; 

            const turni = VirtualModule.getFilteredTurni();
            const pData = [0,0,0,0,0]; let fdt=0, prepay=0, servito=0;
            turni.forEach(t => {
                pData[0] += VirtualModule.getProdTotal(t,'benzina');
                pData[1] += VirtualModule.getProdTotal(t,'gasolio');
                pData[2] += VirtualModule.getProdTotal(t,'dieselplus');
                pData[3] += VirtualModule.getProdTotal(t,'hvolution');
                pData[4] += VirtualModule.getProdTotal(t,'adblue');
                fdt += VirtualModule.sumObj(t.fdt); 
                prepay += VirtualModule.sumObj(t.prepay); 
                servito += VirtualModule.sumObj(t.servito);
            });
            const pLabels = ['Benzina', 'Gasolio', 'Diesel+', 'Hvolution', 'AdBlue'];

            const currentYear = new Date().getFullYear(); 
            const monthlyData = Array(12).fill(0);
            App.state.data.turni.filter(t => new Date(t.date).getFullYear() === currentYear).forEach(t => { 
                monthlyData[new Date(t.date).getMonth()] += VirtualModule.getTurnoTotalLitri(t); 
            });
            const lineGradient = ctxT.createLinearGradient(0, 0, 0, 300); 
            lineGradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)'); 
            lineGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

            // 2. Uso di requestAnimationFrame + Delay 
            requestAnimationFrame(() => {
                setTimeout(() => {
                    if (!document.getElementById('v-products-chart')) return;

                    VirtualModule.localState.chartInstances.p = new Chart(ctxP, { 
                        type: 'doughnut', 
                        data: { labels: pLabels, datasets: [{ data: pData, backgroundColor: ['#22c55e','#f97316','#e11d48','#06b6d4','#3b82f6'], borderWidth: 0 }] }, 
                        options: { 
                            responsive: true, 
                            maintainAspectRatio: false, 
                            // FIX: Delay per aspettare CSS fade-in
                            animation: { animateScale: true, animateRotate: true, delay: 300 },
                            plugins: { legend: { display: false } } 
                        } 
                    });
                    VirtualModule.localState.chartInstances.s = new Chart(ctxS, { 
                        type: 'bar', 
                        data: { labels: ['Totale'], datasets: [ { label: 'FaiDaTe', data: [fdt], backgroundColor: 'rgba(225, 29, 72, 0.6)', borderColor: '#e11d48', borderWidth: 1 }, { label: 'Servito', data: [servito], backgroundColor: 'rgba(34, 197, 94, 0.6)', borderColor: '#22c55e', borderWidth: 1 }, { label: 'Prepay', data: [prepay], backgroundColor: 'rgba(6, 182, 212, 0.6)', borderColor: '#06b6d4', borderWidth: 1 } ] }, 
                        options: { 
                            responsive: true, 
                            maintainAspectRatio: false, 
                            // FIX: Delay
                            animation: { duration: 1000, easing: 'easeOutQuart', delay: 300 },
                            plugins: { legend: { display: false } }, 
                            scales: { x: { stacked: false }, y: { beginAtZero: true } } 
                        } 
                    });
                    VirtualModule.localState.chartInstances.t = new Chart(ctxT, { 
                        type: 'line', 
                        data: { labels: ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'], datasets: [{ label: 'Litri', data: monthlyData, borderColor: '#10b981', tension: 0.3, fill: true, backgroundColor: lineGradient }] }, 
                        options: { 
                            responsive: true, 
                            maintainAspectRatio: false, 
                            // FIX: Delay
                            animation: { duration: 1000, easing: 'easeOutQuart', delay: 300 },
                            plugins: { legend: { display: false } }, 
                            scales: { y: { beginAtZero: true } } 
                        } 
                    });
                }, 50);
            });
        },
        getProdTotal(t, p) { return (parseFloat(t.prepay?.[p])||0) + (parseFloat(t.servito?.[p])||0) + (parseFloat(t.fdt?.[p])||0); },

        updateModalFields(turno) {
            const ppInputs = document.querySelectorAll('#form-turno .pp-input');
            const svInputs = document.querySelectorAll('#form-turno .sv-input');
            const fdInputs = document.querySelectorAll('#form-turno .fd-input');
            ppInputs.forEach(i => i.disabled = true); svInputs.forEach(i => i.disabled = true); fdInputs.forEach(i => i.disabled = true);
            if (['Notte', 'Pausa', 'Weekend'].includes(turno)) { ppInputs.forEach(i => i.disabled = false); } 
            else if (['Mattina', 'Pomeriggio'].includes(turno)) { svInputs.forEach(i => i.disabled = false); fdInputs.forEach(i => i.disabled = false); } 
            else if (turno === 'Riepilogo Mensile') { ppInputs.forEach(i => i.disabled = false); svInputs.forEach(i => i.disabled = false); fdInputs.forEach(i => i.disabled = false); }
        },

        openTurnoModal(id=null) {
            this.localState.editingId = id;
            const t = id ? App.state.data.turni.find(x=>x.id===id) : null;
            const dISO = t ? t.date.split('T')[0] : new Date().toISOString().split('T')[0];
            const cls = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
            const turnoOpts = ['Mattina','Pomeriggio','Notte','Pausa','Weekend','Riepilogo Mensile'];
            const curTurno = t?.turno || 'Mattina';
            const dropdownHtml = `<div class="relative"><button id="turnoDropdownBtn" data-dropdown-toggle="turnoDropdown" class="${cls} flex justify-between items-center w-full" type="button"><span id="selectedTurno">${curTurno}</span><svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/></svg></button><div id="turnoDropdown" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-full absolute dark:bg-gray-700"><ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="turnoDropdownBtn">${turnoOpts.map(o => `<li><a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white turno-opt" data-val="${o}">${o}</a></li>`).join('')}</ul></div></div><input type="hidden" name="turno" id="turnoInput" value="${curTurno}">`;
            const products = [{label: 'Gasolio', key: 'gasolio'}, {label: 'Diesel+', key: 'dieselplus'}, {label: 'AdBlue', key: 'adblue'}, {label: 'Benzina', key: 'benzina'}, {label: 'Hvolution', key: 'hvolution'}];
            const form = `<form id="form-turno" class="space-y-4"><div class="grid grid-cols-2 gap-4"><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data</label><input type="date" name="date" value="${dISO}" class="${cls} ps-10" required></div><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Turno</label>${dropdownHtml}</div></div><div class="space-y-4"><h4 class="font-medium text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Erogato (Litri)</h4><div class="grid grid-cols-4 gap-4 items-center text-sm font-medium text-gray-500 dark:text-gray-400 text-center"><div class="text-left">Prodotto</div><div>FaiDaTe</div><div>Servito</div><div>Prepay</div></div>${products.map(p => { const k = p.key; const isAdBlue = (k === 'adblue'); const ppInput = isAdBlue ? `<div></div>` : `<input type="number" step="1" name="pp_${k}" value="${t?.prepay?.[k]||''}" class="${cls} pp-input" placeholder="0">`; const svInput = `<input type="number" step="1" name="sv_${k}" value="${t?.servito?.[k]||''}" class="${cls} sv-input" placeholder="0">`; const fdInput = isAdBlue ? `<div></div>` : `<input type="number" step="1" name="fd_${k}" value="${t?.fdt?.[k]||''}" class="${cls} fd-input" placeholder="0">`; return `<div class="grid grid-cols-4 gap-4 items-center"><div class="text-gray-900 dark:text-white">${p.label}</div>${fdInput}${svInput}${ppInput}</div>`; }).join('')}</div></form>`;
            
            const deleteBtn = id ? `<button id="btn-delete-turno" class="text-white bg-red-600 hover:bg-red-700 font-medium rounded-md text-sm px-5 py-2.5 text-center mr-auto shadow-sm transition-all">Elimina</button>` : '';
            
            App.showModal(id?'Modifica Turno':'Nuovo Turno', form, `${deleteBtn}<button id="btn-save-turno" class="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-md text-sm px-5 py-2.5 ml-auto shadow-sm transition-all">Salva Turno</button>`);
            
            initFlowbite(); 
            VirtualModule.updateModalFields(curTurno);
            document.querySelectorAll('.turno-opt').forEach(o => o.onclick = (e) => { 
                e.preventDefault(); 
                const val = o.dataset.val; 
                document.getElementById('selectedTurno').textContent = val; 
                document.getElementById('turnoInput').value = val; 
                document.getElementById('turnoDropdown').classList.add('hidden'); 
                VirtualModule.updateModalFields(val); 
            });
            document.getElementById('btn-save-turno').onclick = () => this.saveTurno();
            if(id) document.getElementById('btn-delete-turno').onclick = () => this.deleteTurno(id);
        },
        saveTurno() {
            const fd = new FormData(document.getElementById('form-turno'));
            const isoDate = new Date(fd.get('date')).toISOString();
            const prepay={}, servito={}, fdt={};
            ['benzina','gasolio','dieselplus','hvolution','adblue'].forEach(k => { if(fd.get(`pp_${k}`)) prepay[k]=parseFloat(fd.get(`pp_${k}`)); if(fd.get(`sv_${k}`)) servito[k]=parseFloat(fd.get(`sv_${k}`)); if(fd.get(`fd_${k}`)) fdt[k]=parseFloat(fd.get(`fd_${k}`)); });
            const newItem = { id: this.localState.editingId || App.generateId('turno'), date: isoDate, turno: document.getElementById('turnoInput').value, prepay, servito, fdt };
            if(this.localState.editingId) { const idx = App.state.data.turni.findIndex(x=>x.id===this.localState.editingId); if(idx!==-1) App.state.data.turni[idx]=newItem; } 
            else App.state.data.turni.push(newItem);
            App.saveToStorage(); App.closeModal(); this.render();
        },
        deleteTurno(id) {
            const t = App.state.data.turni.find(x=>x.id===id);
            App.showModal('', `<div class="text-center p-6 flex flex-col items-center"><i data-lucide="alert-triangle" class="w-16 h-16 text-red-600 mb-4"></i><h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Eliminare questo turno?</h3><p class="text-gray-500 dark:text-gray-400 mb-6">Stai per eliminare il turno del <b>${App.formatDate(t?.date)} (${t?.turno})</b>.<br>Questa azione non può essere annullata.</p></div>`, `<div class="flex justify-center gap-4 w-full"><button onclick="App.closeModal()" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-md border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600">Annulla</button><button id="btn-confirm-delete" class="py-2.5 px-5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 shadow-sm transition-all">Elimina</button></div>`, 'max-w-md');
            setTimeout(() => { document.getElementById('btn-confirm-delete').onclick = () => { App.state.data.turni = App.state.data.turni.filter(t => t.id !== id); App.saveToStorage(); App.closeModal(); this.render(); }; }, 50);
        },
        attachListeners() {
            document.querySelectorAll('.btn-filter-opt').forEach(b => b.onclick = (e) => { 
                e.preventDefault(); 
                this.localState.filterMode = b.dataset.mode; 
                try { localStorage.setItem('virtual_filter_mode', b.dataset.mode); } catch(e){} 
                
                const d = document.getElementById('dropdownFilter');
                if(d) d.classList.add('hidden');

                this.render(); 
            });
            document.getElementById('btn-new-turno').onclick = () => this.openTurnoModal();
            document.querySelectorAll('.btn-edit-turno').forEach(b => b.onclick = () => this.openTurnoModal(b.dataset.id));
        }
    };
    if(window.App) App.registerModule('virtualstation', VirtualModule); else document.addEventListener('app:ready', () => App.registerModule('virtualstation', VirtualModule));
})();
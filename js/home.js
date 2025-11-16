/* ==========================================================================
   MODULO: Home Dashboard (js/home.js) - Meteo Card 2-Col Span
   ========================================================================== */
(function() {
    'use strict';
    const HomeModule = {
        localState: { 
            timeInterval: null,
            litersChart: null 
        },
        init() { },
        render() {
            const container = document.getElementById('home-container'); if (!container) return;
            if (!document.getElementById('home-layout')) { container.innerHTML = this.getLayoutHTML(); lucide.createIcons(); }
            this.updateView();
            this.restoreLayout();
            this.initDragAndDrop();
            if (!this.localState.timeInterval) this.localState.timeInterval = setInterval(() => this.updateClock(), 1000);
        },
        updateView() { 
            this.updateClock(); 
            this.renderStats(); 
            this.renderActivitiesAndOrders();
            this.renderLitersChart();
        },
        
        initDragAndDrop() {
            const save = () => this.saveLayout();
            const statsContainer = document.getElementById('home-stats-container');
            if (statsContainer) {
                new Sortable(statsContainer, { animation: 150, ghostClass: 'sortable-ghost', handle: '.draggable-card', onSort: save });
            }
            // Zona 1: Card principali
            ['home-col-1', 'home-col-2', 'home-col-3'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    new Sortable(el, { group: 'shared-home', animation: 150, ghostClass: 'sortable-ghost', handle: '.card-header', onSort: save });
                }
            });
            // Zona 2: Widget inferiori
            const bottomGrid = document.getElementById('home-bottom-grid');
            if (bottomGrid) {
                 new Sortable(bottomGrid, { animation: 150, ghostClass: 'sortable-ghost', handle: '.card-header', onSort: save });
            }
        },

        saveLayout() {
            try {
                const getIds = (cid) => Array.from(document.getElementById(cid)?.children || []).map(el => el.id).filter(id => id);
                const layout = { 
                    stats: getIds('home-stats-container'), 
                    col1: getIds('home-col-1'), 
                    col2: getIds('home-col-2'), 
                    col3: getIds('home-col-3'),
                    bottom: getIds('home-bottom-grid') // Salva ordine widget
                };
                localStorage.setItem('mystation_home_layout_v12', JSON.stringify(layout));
            } catch(e) { console.warn('Salvataggio layout home bloccato', e); }
        },

        restoreLayout() {
            try {
                const saved = localStorage.getItem('mystation_home_layout_v12');
                if (!saved) return;
                const layout = JSON.parse(saved);
                const restoreContainer = (containerId, itemIds) => {
                    const container = document.getElementById(containerId);
                    if (!container || !Array.isArray(itemIds)) return;
                    itemIds.forEach(id => { const el = document.getElementById(id); if (el) container.appendChild(el); });
                };
                restoreContainer('home-stats-container', layout.stats);
                restoreContainer('home-col-1', layout.col1);
                restoreContainer('home-col-2', layout.col2);
                restoreContainer('home-col-3', layout.col3);
                restoreContainer('home-bottom-grid', layout.bottom); // Ripristina ordine widget
            } catch (e) { console.warn("Errore nel ripristino del layout:", e); }
        },

        updateClock() {
            const now = new Date();
            const timeEl = document.getElementById('live-time');
            const dateEl = document.getElementById('live-date');
            if (timeEl) timeEl.textContent = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            if (dateEl) dateEl.textContent = this.capitalize(now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }));
        },

        getLayoutHTML() {
            return `
                <div id="home-layout" class="flex flex-col gap-6 animate-fade-in">
                    
                    <div id="home-banner" class="w-full h-64 rounded-lg shadow-sm overflow-hidden relative p-6 flex flex-col md:flex-row justify-between items-start">
                        
                        <div>
<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Dashboard</h1>
<p class="text-gray-700 dark:text-gray-200">Benvenuto in MyStation</p>
                        </div>
                        
                        <div class="mt-4 md:mt-0 text-right">
<div id="live-time" class="text-3xl font-bold text-gray-900 dark:text-white">--:--</div>
<div id="live-date" class="text-sm font-medium text-gray-600 dark:text-gray-300">---</div>
                        </div>
                        
                    </div>
                    <div id="home-stats-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start min-h-[100px]"></div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        <div id="home-col-1" class="flex flex-col gap-6 min-h-[200px]">
                            <div id="card-erogato" class="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-header cursor-move">
                                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Erogato Oggi</h3>
                                    <div class="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full"><i data-lucide="fuel" class="w-5 h-5"></i></div>
                                </div>
                                <div class="p-6 h-80 relative">
                                    <canvas id="home-liters-chart"></canvas>
                                </div>
                            </div>
                        </div>
                        <div id="home-col-2" class="flex flex-col gap-6 min-h-[200px]">
                            <div id="card-turni" class="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-header cursor-move">
                                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Turni di oggi</h3>
                                    <div class="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full"><i data-lucide="list-checks" class="w-5 h-5"></i></div>
                                </div>
                                <div id="todays-shifts-info" class="p-6"></div>
                            </div>
                            <div id="card-consegne" class="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-header cursor-move">
                                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Consegne Carburante</h3>
                                    <div class="flex items-center justify-center w-10 h-10 bg-cyan-600 text-white rounded-full"><i data-lucide="truck" class="w-5 h-5"></i></div>
                                </div>
                                <div id="home-fuel-orders" class="p-6"></div>
                            </div>
                        </div>
                        <div id="home-col-3" class="flex flex-col gap-6 min-h-[200px]">
                            <div id="card-attivita" class="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 min-h-[300px] flex flex-col draggable-card overflow-hidden">
                                <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-header cursor-move">
                                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Attività di Oggi</h3>
                                    <button id="btn-go-apps" class="p-2 text-gray-500 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 dark:text-gray-400" title="Vai ad Applicazioni"><i data-lucide="external-link" class="w-5 h-5"></i></button>
                                </div>
                                <div id="home-activities-list" class="flex-1 overflow-y-auto space-y-3 p-6"></div>
                            </div>
                        </div>
                    </div>

                    <div id="home-bottom-grid" class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        </div>
                    </div>`;
        },
        renderStats() {
            const s = this.getTodayStats();
            const c1 = document.getElementById('home-stats-container');
            
            const renderStatHTML = (id, title, iconBg, iconName, valueId, value, footerHTML) => `
                <div id="${id}" class="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card cursor-move overflow-hidden">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-header">
                        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">${title}</h3>
                        <div class="flex items-center justify-center w-8 h-8 ${iconBg} text-white rounded-full">
                            <i data-lucide="${iconName}" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1" id="${valueId}">${value}</div>
                        ${footerHTML}
                    </div>
                </div>`;

            if (c1 && c1.children.length === 0) {
                const taxable = s.revenue / 1.22; const vat = s.revenue - taxable;
                c1.innerHTML = `
                    ${renderStatHTML('stat-revenue', 'Fatturato Oggi', 'bg-green-600', 'euro', 'val-revenue', App.formatCurrency(s.revenue), `<div class="flex justify-between text-xs text-gray-500 dark:text-gray-400"><span id="val-taxable">Imp: ${App.formatCurrency(taxable)}</span><span id="val-vat">IVA: ${App.formatCurrency(vat)}</span></div>`)}
                    ${renderStatHTML('stat-margin', 'Margine Stimato', 'bg-yellow-500', 'trending-up', 'val-margin', App.formatCurrency(s.margin), `<p class="text-xs text-gray-500 mt-1">Stima predefinita</p>`)}
                    ${renderStatHTML('stat-liters', 'Totale Litri', 'bg-blue-600', 'droplet', 'val-liters', App.formatNumber(s.totalLiters), `<p class="text-xs text-gray-500 mt-1">Erogati oggi</p>`)}
                    ${renderStatHTML('stat-served', '% Servito', 'bg-purple-600', 'user-check', 'val-served', s.servitoPerc + '%', `<div class="w-full bg-gray-200 rounded-full h-1.5 mt-2 dark:bg-gray-700"><div id="bar-served" class="bg-purple-600 h-1.5 rounded-full" style="width: ${s.servitoPerc}%"></div></div>`)}
                `;
            } else if (document.getElementById('val-revenue')) {
                const taxable = s.revenue / 1.22; const vat = s.revenue - taxable;
                document.getElementById('val-revenue').textContent = App.formatCurrency(s.revenue);
                document.getElementById('val-taxable').textContent = `Imp: ${App.formatCurrency(taxable)}`;
                document.getElementById('val-vat').textContent = `IVA: ${App.formatCurrency(vat)}`;
                document.getElementById('val-margin').textContent = App.formatCurrency(s.margin);
                document.getElementById('val-liters').textContent = App.formatNumber(s.totalLiters);
                document.getElementById('val-served').textContent = `${s.servitoPerc}%`;
                document.getElementById('bar-served').style.width = `${s.servitoPerc}%`;
            }
            
            const c3 = document.getElementById('todays-shifts-info');
            if(c3) c3.innerHTML = s.todayShifts.length ? `<div class="flex flex-col gap-3"><div><div class="text-lg font-bold text-gray-900 dark:text-white mb-1">${s.todayShifts.map(t=>t.turno).join(', ')}</div><div class="text-sm text-gray-500 dark:text-gray-400">Turni chiusi: <span class="font-semibold">${s.todayShifts.length}</span></div></div><div class="mt-2 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center"><span class="text-sm text-gray-600 dark:text-gray-300">Totale Erogato Oggi:</span><span class="font-bold text-primary-600 dark:text-primary-500">${App.formatNumber(s.totalLiters)} L</span></div></div>` : `<p class="text-gray-500 dark:text-gray-400 flex items-center"><i data-lucide="info" class="w-4 h-4 mr-2"></i> Nessun turno chiuso oggi.</p>`;
            lucide.createIcons();
        },

        renderLitersChart() {
            const s = this.getTodayStats();
            const ctx = document.getElementById('home-liters-chart')?.getContext('2d');
            if (!ctx) return;
            const prods = [
                {k:'benzina',l:'Benzina',c:'rgba(34, 197, 94, 0.8)'}, {k:'gasolio',l:'Gasolio',c:'rgba(249, 115, 22, 0.8)'}, {k:'dieselplus',l:'Diesel+',c:'rgba(225, 29, 72, 0.8)'},
                {k:'hvolution',l:'Hvolution',c:'rgba(6, 182, 212, 0.8)'}, {k:'adblue',l:'AdBlue',c:'rgba(59, 130, 246, 0.8)'}
            ];
            const chartData = prods.map(p => s.products[p.k] || 0); const chartLabels = prods.map(p => p.l); const chartColors = prods.map(p => p.c);

            const isDark = document.documentElement.classList.contains('dark');
            const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            const tickColor = isDark ? '#9ca3af' : '#4b5563';

            if (this.localState.litersChart) this.localState.litersChart.destroy();
            this.localState.litersChart = new Chart(ctx, {
                type: 'bar',
                data: { labels: chartLabels, datasets: [{ label: 'Litri Erogati', data: chartData, backgroundColor: chartColors, borderColor: chartColors.map(c => c.replace('0.8', '1')), borderWidth: 1 }] },
                options: {
                    indexAxis: 'y', responsive: true, maintainAspectRatio: false, 
                    plugins: { 
                        legend: { display: false }, 
                        tooltip: { enabled: true } 
                    },
                    scales: { 
                        x: { 
                            display: true, 
                            stacked: true,
                            grid: { 
                                display: true, 
                                color: gridColor 
                            },
                            ticks: { 
                                color: tickColor 
                            }
                        }, 
                        y: { 
                            display: true, 
                            stacked: true, 
                            grid: { 
                                display: true, 
                                color: gridColor 
                            }, 
                            ticks: { color: tickColor } 
                        } 
                    }
                }
            });
        },

        renderActivitiesAndOrders() {
            const todayISO = App.toLocalISOString(new Date());
            const acts = [...(App.state.data.appuntamenti||[]).filter(a => a.date === todayISO).map(a => ({...a, type:'app'})), ...(App.state.data.todos||[]).filter(t => t.dueDate === todayISO).map(t => ({...t, type:'todo'}))].sort((a,b) => (a.oraInizio||'').localeCompare(b.oraInizio||''));
            const actList = document.getElementById('home-activities-list');
            if(actList) {
                if(!acts.length) actList.innerHTML = '<div class="flex flex-col items-center justify-center h-full pb-4 text-gray-400 dark:text-gray-500"><i data-lucide="clipboard-list" class="w-10 h-10 mb-2 opacity-50"></i><p class="text-sm">Nessuna attività oggi</p></div>';
                else actList.innerHTML = acts.map(e => {
                    let borderClass = 'border-gray-200 dark:border-gray-700', bgClass = 'bg-white dark:bg-gray-700/50', iconColor = 'text-gray-500', labelColor = 'text-gray-700 dark:text-gray-300', labelText = 'Standard';
                    if (e.type === 'app') { borderClass = 'border-blue-200 dark:border-blue-800'; bgClass = 'bg-blue-50 dark:bg-blue-900/20'; iconColor = 'text-blue-600 dark:text-blue-400'; labelColor = 'text-blue-700 dark:text-blue-300'; labelText = e.oraInizio; }
                    else if (e.priorita === 'urgent') { borderClass = 'border-red-200 dark:border-red-800'; bgClass = 'bg-red-50 dark:bg-red-900/20'; iconColor = 'text-red-600 dark:text-red-400'; labelColor = 'text-red-700 dark:text-red-300'; labelText = 'Urgente'; }
                    else if (e.priorita === 'priority') { borderClass = 'border-yellow-200 dark:border-yellow-800'; bgClass = 'bg-yellow-50 dark:bg-yellow-900/20'; iconColor = 'text-yellow-600 dark:text-yellow-400'; labelColor = 'text-yellow-700 dark:text-yellow-300'; labelText = 'Importante'; }
                    else { borderClass = 'border-green-200 dark:border-green-800'; bgClass = 'bg-green-50 dark:bg-green-900/20'; iconColor = 'text-green-600 dark:text-green-400'; labelColor = 'text-green-700 dark:text-green-300'; labelText = 'Standard'; }
                    return `<div class="p-3 border ${borderClass} ${bgClass} rounded-lg flex justify-between items-center cursor-pointer hover:shadow-sm transition-shadow home-event-item" data-id="${e.id}" data-type="${e.type}"><div class="flex items-center gap-3 overflow-hidden"><i data-lucide="${e.type==='app'?'clock':'check-circle'}" class="size-5 flex-shrink-0 ${iconColor}"></i><div class="truncate"><div class="text-xs font-semibold ${labelColor}">${labelText}</div><div class="text-sm font-medium text-gray-900 dark:text-white truncate">${e.type==='app'?e.descrizione:e.text}</div></div></div></div>`;
                }).join('');
            }
            
            const orders = (App.state.data.fuelOrders||[]).filter(o => o.date === todayISO).sort((a,b) => new Date(b.date) - new Date(a.date));
            
            const ordList = document.getElementById('home-fuel-orders');
            if(ordList) {
                if(!orders.length) ordList.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400 flex items-center"><i data-lucide="info" class="w-4 h-4 mr-2"></i> Nessun ordine in arrivo.</p>';
                else ordList.innerHTML = '<div class="space-y-4 max-h-[250px] overflow-y-auto pr-1">' + orders.map(o => {
                    const totalL = Object.values(o.products).reduce((a,b)=>a+b,0);
                    const pMap = { benzina: 'Bz', gasolio: 'Gs', dieselplus: 'D+', hvolution: 'Hvo' };
                    const details = Object.entries(o.products).filter(([k,v]) => v > 0).map(([k,v]) => `${pMap[k]||k}: ${App.formatNumber(v)}`).join(', ');
                    
                    return `
                        <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400">${App.formatDate(o.date)}</div>
                                    <div class="text-base font-bold text-gray-900 dark:text-white">${App.formatNumber(totalL)} Litri Totali</div>
                                </div>
                                <div class="flex gap-2">
                                    ${o.status === 'pending' ? `<button class="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-md btn-delete-order" data-id="${o.id}" title="Cancella ordine"><i data-lucide="trash-2" class="size-4"></i></button>` : ''}
                                </div>
                            </div>
                            <div class="text-sm text-gray-600 dark:text-gray-300 pt-3 border-t border-gray-100 dark:border-gray-700">
                                ${details || 'Nessun dettaglio'}
                            </div>
                        </div>`;
                }).join('') + '</div>';
            }
            lucide.createIcons();
            document.querySelectorAll('.home-event-item').forEach(b => b.onclick = () => {
                if(window.App && App.modules && App.modules.applicazioni && typeof App.modules.applicazioni.openEventModal === 'function') {
                     App.modules.applicazioni.openEventModal(b.dataset.id, b.dataset.type);
                }
            });
            document.getElementById('btn-go-apps').onclick = () => window.location.hash = '#applicazioni';
            document.querySelectorAll('.btn-delete-order').forEach(b => b.onclick = () => this.deleteOrder(b.dataset.id));
        },

        deleteOrder(id) {
            const o = App.state.data.fuelOrders.find(x => x.id === id); if (!o) return;
            App.showModal('', `<div class="text-center p-6"><i data-lucide="alert-triangle" class="w-16 h-16 text-red-600 mb-4 mx-auto"></i><h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Cancellare Ordine?</h3><p class="text-gray-500 dark:text-gray-400 mb-6">Eliminare l'ordine del <b>${App.formatDate(o.date)}</b>?</p></div>`, `<div class="flex justify-center gap-4 w-full"><button onclick="App.closeModal()" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600">Annulla</button><button id="btn-confirm-del-ord" class="py-2.5 px-5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Elimina</button></div>`, 'max-w-md');
            setTimeout(() => { document.getElementById('btn-confirm-del-ord').onclick = () => { App.state.data.fuelOrders = App.state.data.fuelOrders.filter(x=>x.id!==id); App.saveToStorage(); App.closeModal(); this.renderActivitiesAndOrders(); App.showToast('Ordine cancellato', 'success'); }; }, 50);
        },
        
        getTodayStats() {
            const today=new Date(); today.setHours(0,0,0,0); const tmr=new Date(today); tmr.setDate(tmr.getDate()+1);
            const turniOggi = (App.state.data.turni||[]).filter(t => { const d=new Date(t.date); return d>=today && d<tmr && t.turno!=='Riepilogo Mensile'; }).sort((a,b)=>new Date(a.date)-new Date(b.date));
            const prices = this.getLatestPrices();
            let lit=0, rev=0, marg=0, serv=0; const prods={benzina:0,gasolio:0,dieselplus:0,hvolution:0,adblue:0};
            const mFdt=0.04, mServ=0.08, mAdblue=0.40, surSelf=0.005, surServ=0.220;
            
            turniOggi.forEach(t => {
                ['benzina','gasolio','dieselplus','hvolution','adblue'].forEach(k => {
                    const pp = parseFloat(t.prepay?.[k])||0;
                    const sv = parseFloat(t.servito?.[k])||0;
                    const fd = parseFloat(t.fdt?.[k])||0; 
                    const tot = pp + sv + fd; 
                    
                    prods[k]+=tot; lit+=tot; serv+=sv;
                    const pKey = k==='dieselplus'?'dieselPlus':k, bp = prices[pKey]||0;
                    if(bp>0) { 
                        if(k==='adblue') { 
                            rev+=sv*bp; 
                            marg+=sv*mAdblue; 
                        } else { 
                            rev += (pp * (bp + surSelf)) + (sv * (bp + surSelf + surServ)) + (fd * (bp + surSelf));
                            marg += (pp * mFdt) + (sv * mServ) + (fd * mFdt); 
                        } 
                    }
                });
            });
            return { revenue:rev, margin:marg, totalLiters:lit, servitoPerc: lit>0?Math.round((serv/lit)*100):0, products:prods, todayShifts:turniOggi };
        },
        getLatestPrices() { if(!App.state.data.priceHistory?.length) return {}; return [...App.state.data.priceHistory].sort((a,b)=>new Date(b.date)-new Date(a.date))[0]; },
        capitalize(s) { return s && s[0].toUpperCase() + s.slice(1); }
    };
    if(window.App) App.registerModule('home', HomeModule); else document.addEventListener('app:ready', () => App.registerModule('home', HomeModule));
})();
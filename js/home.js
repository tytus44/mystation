/* ==========================================================================
   MODULO: Home Dashboard (js/home.js) - Drag and Drop Persistence
   ========================================================================== */
(function() {
    'use strict';
    const HomeModule = {
        localState: { timeInterval: null },
        init() { },
        render() {
            const container = document.getElementById('home-container'); if (!container) return;
            if (!document.getElementById('home-layout')) { container.innerHTML = this.getLayoutHTML(); lucide.createIcons(); }
            this.updateView();
            // Prima ripristiniamo il layout salvato, poi inizializziamo il drag & drop
            this.restoreLayout();
            this.initDragAndDrop();
            if (!this.localState.timeInterval) this.localState.timeInterval = setInterval(() => this.updateClock(), 1000);
        },
        updateView() { this.updateClock(); this.renderStats(); this.renderActivitiesAndOrders(); },
        
        initDragAndDrop() {
            const save = () => this.saveLayout();
            // Statistiche orizzontali
            const statsContainer = document.getElementById('home-stats-container');
            if (statsContainer) new Sortable(statsContainer, { animation: 150, ghostClass: 'sortable-ghost', handle: '.draggable-card', onSort: save });

            // 3 Colonne principali (condividono lo stesso gruppo per spostamenti tra colonne)
            ['home-col-1', 'home-col-2', 'home-col-3'].forEach(id => {
                const el = document.getElementById(id);
                if (el) new Sortable(el, { group: 'shared-home', animation: 150, ghostClass: 'sortable-ghost', handle: '.card-header', onSort: save });
            });
        },

        saveLayout() {
            const getIds = (cid) => Array.from(document.getElementById(cid)?.children || []).map(el => el.id).filter(id => id);
            const layout = {
                stats: getIds('home-stats-container'),
                c1: getIds('home-col-1'),
                c2: getIds('home-col-2'),
                c3: getIds('home-col-3')
            };
            localStorage.setItem('mystation_home_layout', JSON.stringify(layout));
        },

        restoreLayout() {
            const saved = localStorage.getItem('mystation_home_layout');
            if (!saved) return;
            try {
                const layout = JSON.parse(saved);
                const moveCards = (containerId, cardIds) => {
                    const container = document.getElementById(containerId);
                    if (!container || !cardIds) return;
                    cardIds.forEach(id => {
                        const card = document.getElementById(id);
                        if (card) container.appendChild(card); // Sposta l'elemento esistente
                    });
                };
                moveCards('home-stats-container', layout.stats);
                moveCards('home-col-1', layout.c1);
                moveCards('home-col-2', layout.c2);
                moveCards('home-col-3', layout.c3);
            } catch (e) { console.error("Errore ripristino layout home:", e); }
        },

        updateClock() {
            const now = new Date();
            document.getElementById('live-time').textContent = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            document.getElementById('live-date').textContent = this.capitalize(now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }));
        },
        getLayoutHTML() {
            return `
                <div id="home-layout" class="flex flex-col gap-6 animate-fade-in">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div><h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Dashboard</h1><p class="text-gray-500 dark:text-gray-400">Benvenuto in MyStation Admin V11</p></div>
                        <div class="mt-4 md:mt-0 text-right"><div id="live-time" class="text-3xl font-bold text-primary-600 dark:text-primary-500">--:--</div><div id="live-date" class="text-sm font-medium text-gray-500 dark:text-gray-400">---</div></div>
                    </div>
                    
                    <div id="home-stats-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                         </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        <div id="home-col-1" class="flex flex-col gap-6 h-full">
                            <div id="card-erogato" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card">
                                <div class="flex items-center justify-between mb-4 card-header cursor-move"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Erogato Oggi</h3><span class="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900 dark:text-blue-300"><i data-lucide="fuel" class="w-5 h-5"></i></span></div>
                                <div id="home-liters-breakdown" class="space-y-4"></div>
                            </div>
                        </div>
                        <div id="home-col-2" class="flex flex-col gap-6 h-full">
                            <div id="card-turni" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card">
                                <div class="flex items-center justify-between mb-4 card-header cursor-move"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Turni di oggi</h3><span class="p-2 bg-green-100 text-green-600 rounded-lg dark:bg-green-900 dark:text-green-300"><i data-lucide="list-checks" class="w-5 h-5"></i></span></div>
                                <div id="todays-shifts-info"></div>
                            </div>
                            <div id="card-consegne" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card">
                                <div class="flex items-center justify-between mb-4 card-header cursor-move"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Consegne Carburante</h3><span class="p-2 bg-cyan-100 text-cyan-600 rounded-lg dark:bg-cyan-900 dark:text-cyan-300"><i data-lucide="truck" class="w-5 h-5"></i></span></div>
                                <div id="home-fuel-orders"></div>
                            </div>
                        </div>
                        <div id="home-col-3" class="flex flex-col gap-6 h-full">
                            <div id="card-attivita" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 h-full min-h-[300px] flex flex-col draggable-card">
                                <div class="flex items-center justify-between mb-4 card-header cursor-move">
                                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Attività di Oggi</h3>
                                    <button id="btn-go-apps" class="p-2 text-gray-500 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 dark:text-gray-400" title="Vai ad Applicazioni"><i data-lucide="external-link" class="w-5 h-5"></i></button>
                                </div>
                                <div id="home-activities-list" class="flex-1 overflow-y-auto space-y-3 pr-1"></div>
                            </div>
                        </div>
                    </div>
                </div>`;
        },
        renderStats() {
            const s = this.getTodayStats();
            const c1 = document.getElementById('home-stats-container');
            // Nota: se c1 ha già figli (perché ripristinati dal layout), non sovrascriviamo brutalmente, 
            // ma aggiorniamo i valori se esistono, altrimenti li creiamo la prima volta.
            // Per semplicità qui rigeneriamo e poi restoreLayout() li rimetterà a posto se chiamato dopo, 
            // ma per efficienza meglio generare una volta sola.
            // Dato che render() chiama restoreLayout() DOPO getLayoutHTML(), la prima volta è ok.
            // Se renderStats viene richiamato, deve aggiornare i valori esistenti.
            
            if(c1 && c1.children.length === 0) {
                const taxable = s.revenue / 1.22; const vat = s.revenue - taxable;
                c1.innerHTML = `
                    <div id="stat-revenue" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card cursor-move"><div class="flex justify-between mb-2"><h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Fatturato Oggi</h3><span class="p-2 bg-green-100 text-green-600 rounded-lg dark:bg-green-900 dark:text-green-300"><i data-lucide="euro" class="w-5 h-5"></i></span></div><div class="text-2xl font-bold text-gray-900 dark:text-white mb-1" id="val-revenue">${App.formatCurrency(s.revenue)}</div><div class="flex justify-between text-xs text-gray-500 dark:text-gray-400"><span id="val-taxable">Imp: ${App.formatCurrency(taxable)}</span><span id="val-vat">IVA: ${App.formatCurrency(vat)}</span></div></div>
                    <div id="stat-margin" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card cursor-move"><div class="flex justify-between mb-2"><h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Margine Stimato</h3><span class="p-2 bg-yellow-100 text-yellow-600 rounded-lg dark:bg-yellow-900 dark:text-yellow-300"><i data-lucide="trending-up" class="w-5 h-5"></i></span></div><div class="text-2xl font-bold text-gray-900 dark:text-white" id="val-margin">${App.formatCurrency(s.margin)}</div><p class="text-xs text-gray-500 mt-1">Stima predefinita</p></div>
                    <div id="stat-liters" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card cursor-move"><div class="flex justify-between mb-2"><h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Totale Litri</h3><span class="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900 dark:text-blue-300"><i data-lucide="droplet" class="w-5 h-5"></i></span></div><div class="text-2xl font-bold text-gray-900 dark:text-white" id="val-liters">${App.formatNumber(s.totalLiters)}</div><p class="text-xs text-gray-500 mt-1">Erogati oggi</p></div>
                    <div id="stat-served" class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card cursor-move"><div class="flex justify-between mb-2"><h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">% Servito</h3><span class="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900 dark:text-purple-300"><i data-lucide="user-check" class="w-5 h-5"></i></span></div><div class="text-2xl font-bold text-gray-900 dark:text-white" id="val-served">${s.servitoPerc}%</div><div class="w-full bg-gray-200 rounded-full h-1.5 mt-2 dark:bg-gray-700"><div id="bar-served" class="bg-purple-600 h-1.5 rounded-full" style="width: ${s.servitoPerc}%"></div></div></div>`;
            } else {
                // Aggiorna solo i valori se le card esistono già (per non rompere il drag & drop durante l'update)
                const taxable = s.revenue / 1.22; const vat = s.revenue - taxable;
                if(document.getElementById('val-revenue')) document.getElementById('val-revenue').textContent = App.formatCurrency(s.revenue);
                if(document.getElementById('val-taxable')) document.getElementById('val-taxable').textContent = `Imp: ${App.formatCurrency(taxable)}`;
                if(document.getElementById('val-vat')) document.getElementById('val-vat').textContent = `IVA: ${App.formatCurrency(vat)}`;
                if(document.getElementById('val-margin')) document.getElementById('val-margin').textContent = App.formatCurrency(s.margin);
                if(document.getElementById('val-liters')) document.getElementById('val-liters').textContent = App.formatNumber(s.totalLiters);
                if(document.getElementById('val-served')) document.getElementById('val-served').textContent = `${s.servitoPerc}%`;
                if(document.getElementById('bar-served')) document.getElementById('bar-served').style.width = `${s.servitoPerc}%`;
            }
            
            const c2 = document.getElementById('home-liters-breakdown');
            if(c2) {
                const prods = [{k:'benzina',l:'Benzina',c:'bg-green-500'},{k:'gasolio',l:'Gasolio',c:'bg-orange-500'},{k:'dieselplus',l:'Diesel+',c:'bg-red-600'},{k:'hvolution',l:'Hvolution',c:'bg-cyan-500'},{k:'adblue',l:'AdBlue',c:'bg-blue-600'}];
                c2.innerHTML = prods.map(p => { const l=s.products[p.k]||0; const perc=s.totalLiters>0?Math.round((l/s.totalLiters)*100):0; return `<div><div class="flex justify-between items-center mb-1"><span class="text-sm font-medium text-gray-700 dark:text-gray-300">${p.l}</span><span class="text-sm font-bold text-gray-900 dark:text-white">${App.formatNumber(l)} L <span class="text-xs font-normal text-gray-500 ml-1">(${perc}%)</span></span></div><div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700"><div class="${p.c} h-2 rounded-full" style="width: ${perc}%"></div></div></div>`; }).join('');
            }
            const c3 = document.getElementById('todays-shifts-info');
            if(c3) c3.innerHTML = s.todayShifts.length ? `<div class="flex flex-col gap-3"><div><div class="text-lg font-bold text-gray-900 dark:text-white mb-1">${s.todayShifts.map(t=>t.turno).join(', ')}</div><div class="text-sm text-gray-500 dark:text-gray-400">Turni chiusi: <span class="font-semibold">${s.todayShifts.length}</span></div></div><div class="mt-2 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center"><span class="text-sm text-gray-600 dark:text-gray-300">Totale Erogato Oggi:</span><span class="font-bold text-primary-600 dark:text-primary-500">${App.formatNumber(s.totalLiters)} L</span></div></div>` : `<p class="text-gray-500 dark:text-gray-400 flex items-center"><i data-lucide="info" class="w-4 h-4 mr-2"></i> Nessun turno chiuso oggi.</p>`;
            lucide.createIcons();
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
            const orders = (App.state.data.fuelOrders||[]).filter(o => o.date === todayISO || o.status === 'pending').sort((a,b) => new Date(b.date) - new Date(a.date));
            const ordList = document.getElementById('home-fuel-orders');
            if(ordList) {
                if(!orders.length) ordList.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400 flex items-center"><i data-lucide="info" class="w-4 h-4 mr-2"></i> Nessun ordine in arrivo.</p>';
                else ordList.innerHTML = '<div class="space-y-2 max-h-[250px] overflow-y-auto pr-1">' + orders.map(o => {
                    const totalL = Object.values(o.products).reduce((a,b)=>a+b,0);
                    const pMap = { benzina: 'Bz', gasolio: 'Gs', dieselplus: 'D+', hvolution: 'Hvo' };
                    const details = Object.entries(o.products).filter(([k,v]) => v > 0).map(([k,v]) => `${pMap[k]||k}: ${App.formatNumber(v)}`).join(', ');
                    return `<div class="p-3 border border-cyan-100 bg-cyan-50 dark:bg-cyan-900/20 dark:border-cyan-800 rounded-lg"><div class="flex justify-between items-start mb-2"><div><div class="text-xs font-semibold text-cyan-700 dark:text-cyan-300">${App.formatDate(o.date)}</div><div class="text-sm font-bold text-gray-900 dark:text-white">${App.formatNumber(totalL)} Litri Totali</div></div><div class="flex gap-2">${o.status === 'pending' ? `<button class="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md btn-delete-order" data-id="${o.id}" title="Cancella ordine"><i data-lucide="trash-2" class="size-4"></i></button>` : ''}<button class="px-2 py-1 text-xs font-medium rounded-full ${o.status==='pending'?'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer btn-toggle-order':'bg-green-100 text-green-800'}" data-id="${o.id}">${o.status==='pending'?'In attesa':'Consegnato'}</button></div></div><div class="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-cyan-200 dark:border-cyan-800/50">${details || 'Nessun dettaglio'}</div></div>`;
                }).join('') + '</div>';
            }
            lucide.createIcons();
            document.querySelectorAll('.home-event-item').forEach(b => b.onclick = () => { if(window.App.modules.applicazioni?.openEventModal) window.App.modules.applicazioni.openEventModal(b.dataset.id, b.dataset.type); });
            document.getElementById('btn-go-apps').onclick = () => window.location.hash = '#applicazioni';
            document.querySelectorAll('.btn-toggle-order').forEach(b => b.onclick = () => this.confirmOrderDelivery(b.dataset.id));
            document.querySelectorAll('.btn-delete-order').forEach(b => b.onclick = () => this.deleteOrder(b.dataset.id));
        },
        confirmOrderDelivery(id) {
            const o = App.state.data.fuelOrders.find(x => x.id === id); if (!o || o.status !== 'pending') return;
            App.showModal('', `<div class="text-center p-6"><i data-lucide="truck" class="w-16 h-16 text-cyan-600 mb-4 mx-auto"></i><h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Conferma Consegna</h3><p class="text-gray-500 dark:text-gray-400 mb-6">Confermi che l'ordine del <b>${App.formatDate(o.date)}</b> è stato consegnato?</p></div>`, `<div class="flex justify-center gap-4 w-full"><button onclick="App.closeModal()" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600">Annulla</button><button id="btn-confirm-delivery" class="py-2.5 px-5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Conferma</button></div>`, 'max-w-md');
            setTimeout(() => { document.getElementById('btn-confirm-delivery').onclick = () => { o.status = 'delivered'; App.saveToStorage(); App.closeModal(); this.renderActivitiesAndOrders(); App.showToast('Ordine consegnato!', 'success'); }; }, 50);
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
                    const pp = parseFloat(t.prepay?.[k])||0, sv = parseFloat(t.servito?.[k])||0, tot = pp+sv;
                    prods[k]+=tot; lit+=tot; serv+=sv;
                    const pKey = k==='dieselplus'?'dieselPlus':k, bp = prices[pKey]||0;
                    if(bp>0) { if(k==='adblue') { rev+=sv*bp; marg+=sv*mAdblue; } else { rev+=(pp*(bp+surSelf))+(sv*(bp+surSelf+surServ)); marg+=(pp*mFdt)+(sv*mServ); } }
                });
            });
            return { revenue:rev, margin:marg, totalLiters:lit, servitoPerc: lit>0?Math.round((serv/lit)*100):0, products:prods, todayShifts:turniOggi };
        },
        getLatestPrices() { if(!App.state.data.priceHistory?.length) return {}; return [...App.state.data.priceHistory].sort((a,b)=>new Date(b.date)-new Date(a.date))[0]; },
        capitalize(s) { return s && s[0].toUpperCase() + s.slice(1); }
    };
    if(window.App) App.registerModule('home', HomeModule); else document.addEventListener('app:ready', () => App.registerModule('home', HomeModule));
})();

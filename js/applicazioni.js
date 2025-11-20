/* ==========================================================================
   MODULO: Applicazioni (js/applicazioni.js) - Scorporo IVA Redesign
   ========================================================================== */
(function() {
    'use strict';

    const AppsModule = {
        localState: {
            currentDate: new Date(),
            selectedDateISO: App.toLocalISOString(new Date()),
            iva: { lordo: null, netto: null },
            banconote: { 500:0, 200:0, 100:0, 50:0, 20:0, 10:0, 5:0 },
            fuelOrder: { date: App.toLocalISOString(new Date()), benzina:0, gasolio:0, dieselplus:0, hvolution:0 },
            editingEventId: null,
            eventModal: { type: 'app', date: '', time: '09:00', desc: '', duration: '30 min', priority: 'standard' },
            calculatorInput: '',
            radioStations: [],
            currentStation: null,
            audioPlayer: null
        },

        init() {
            if(!App.state.data.todos) App.state.data.todos = [];
            if(!App.state.data.appuntamenti) App.state.data.appuntamenti = [];
            if(!App.state.data.fuelOrders) App.state.data.fuelOrders = [];
        },

        render() {
            const container = document.getElementById('applicazioni-container');
            if (!container) return;
            
            if (!document.getElementById('apps-layout')) {
                container.innerHTML = this.getLayoutHTML();
                lucide.createIcons();
                this.attachListeners();
            }
            this.updateView();
            this.restoreLayout();
            this.initDragAndDrop();
        },

        updateView() {
            this.renderCalendar();
            this.renderEventsList();
            this.updateFuelTotal();
            this.updateBanconoteTotal();
            this.loadNotes();
            this.initRadio();
        },

        initDragAndDrop() {
            const save = () => this.saveLayout();
            const topGrid = document.getElementById('apps-top-grid');
            if (topGrid && !topGrid._sortable) {
                topGrid._sortable = new Sortable(topGrid, { animation: 150, ghostClass: 'sortable-ghost', handle: '.card-header', onSort: save });
            }
            ['apps-col-1', 'apps-col-2', 'apps-col-3'].forEach(id => {
                const el = document.getElementById(id);
                if (el && !el._sortable) {
                    el._sortable = new Sortable(el, { group: 'shared-apps-bottom', animation: 150, ghostClass: 'sortable-ghost', handle: '.card-header', onSort: save });
                }
            });
        },

        saveLayout() {
            try {
                const getIds = (cid) => Array.from(document.getElementById(cid)?.children || []).map(el => el.id).filter(id => id);
                const layout = { 
                    top: getIds('apps-top-grid'), 
                    col1: getIds('apps-col-1'), 
                    col2: getIds('apps-col-2'), 
                    col3: getIds('apps-col-3')
                };
                localStorage.setItem('Pylon.Pro_apps_layout_v1', JSON.stringify(layout));
            } catch (e) { console.warn('Salvataggio layout app bloccato:', e); }
        },

        restoreLayout() {
            try {
                const saved = localStorage.getItem('Pylon.Pro_apps_layout_v1');
                if (!saved) return;
                const layout = JSON.parse(saved);
                const restore = (cid, ids) => {
                    const container = document.getElementById(cid);
                    if (!container || !Array.isArray(ids)) return;
                    ids.forEach(id => { const el = document.getElementById(id); if (el) container.appendChild(el); });
                };
                restore('apps-top-grid', layout.top);
                restore('apps-col-1', layout.col1);
                restore('apps-col-2', layout.col2);
                restore('apps-col-3', layout.col3);
            } catch (e) { console.error("Errore ripristino layout app:", e); }
        },

        getLayoutHTML() {
            const fuelProducts = [ { key: 'benzina', label: 'Benzina' }, { key: 'gasolio', label: 'Gasolio' }, { key: 'dieselplus', label: 'Diesel+' }, { key: 'hvolution', label: 'Hvo' } ];
            
            const simpleCardStart = (id, title, icon, iconBg) => `
                <div id="${id}" class="bg-white border border-gray-200 rounded-lg shadow-none dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-header cursor-move">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${title}</h3>
                        <div class="flex items-center justify-center w-10 h-10 ${iconBg} text-white rounded-full shadow-sm">
                            <i data-lucide="${icon}" class="size-5"></i>
                        </div>
                    </div>
                    <div class="p-6">`;
            
            const simpleCardEnd = `</div></div>`;
            const radioEqStyles = `<style>.radio-eq-anim { display: none; width: 16px; height: 16px; margin-left: 8px; } .radio-eq-anim span { display: inline-block; width: 2px; height: 100%; background-color: #10b981; margin-left: 1px; animation: radio-bounce 1s infinite ease-in-out; } .dark .radio-eq-anim span { background-color: #34d399; } .radio-eq-anim span:nth-child(2) { animation-delay: -0.8s; } .radio-eq-anim span:nth-child(3) { animation-delay: -0.6s; } .radio-eq-anim span:nth-child(4) { animation-delay: -0.4s; } @keyframes radio-bounce { 0%, 40%, 100% { transform: scaleY(0.4); } 20% { transform: scaleY(1.0); } }</style>`;

            return `
                ${radioEqStyles}
                <div id="apps-layout" class="flex flex-col gap-6 animate-fade-in">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Applicazioni & Utility</h2>
                    </div>
                    <div id="apps-top-grid" class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        <div id="app-card-calendar" class="bg-white border border-gray-200 rounded-lg shadow-none dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-header cursor-move">
                                <div class="flex items-center">
                                    <div class="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full shadow-sm mr-3"><i data-lucide="calendar" class="size-5"></i></div>
                                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Calendario</h3>
                                </div>
                                <div class="flex gap-2">
                                    <button id="cal-prev" class="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:bg-gray-700"><i data-lucide="chevron-left" class="size-5"></i></button>
                                    <button id="cal-today" class="px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 dark:bg-gray-700 dark:text-primary-400">Oggi</button>
                                    <button id="cal-next" class="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:bg-gray-700"><i data-lucide="chevron-right" class="size-5"></i></button>
                                </div>
                            </div>
                            <div class="p-6">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center mb-4" id="cal-month-year"></h3>
                                <div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                    <div>Lun</div><div>Mar</div><div>Mer</div><div>Gio</div><div>Ven</div><div>Sab</div><div>Dom</div>
                                </div>
                                <div id="cal-grid" class="grid grid-cols-7 gap-1"></div>
                            </div>
                        </div>

                        <div id="app-card-events" class="bg-white border border-gray-200 rounded-lg shadow-none dark:bg-gray-800 dark:border-gray-700 flex flex-col draggable-card overflow-hidden">
                            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-header cursor-move">
                                <div class="flex items-center">
                                    <div class="flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-full shadow-sm mr-3"><i data-lucide="list-todo" class="size-5"></i></div>
                                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Eventi</h3>
                                </div>
                                <button id="btn-add-event" class="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-md text-sm px-3 py-2 flex items-center transition-all shadow-sm" title="Nuovo Evento">
                                    <i data-lucide="plus" class="size-4 sm:mr-1.5"></i><span class="hidden sm:inline">Nuovo</span>
                                </button>
                            </div>
                            <div class="p-6 flex-1 flex flex-col">
                                <h4 class="text-md font-medium text-gray-700 dark:text-gray-300 mb-3" id="event-list-title">Seleziona una data</h4>
                                <div id="event-list" class="space-y-3 flex-1 overflow-y-auto pr-2 max-h-[400px]"></div>
                            </div>
                        </div>
                    </div>

                    <div id="apps-bottom-grid-container" class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        <div id="apps-col-1" class="flex flex-col gap-6 min-h-[200px]">
                            ${simpleCardStart('app-card-fuel', 'Ordine Carburante', 'truck', 'bg-cyan-600')}
                                <div class="mb-5">
                                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data Consegna</label>
                                    <input type="date" id="fuel-order-date" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-md block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value="${this.localState.fuelOrder.date}">
                                </div>
                                <div class="space-y-4" id="fuel-order-form">
                                    ${fuelProducts.map(p => `
                                        <div class="flex items-center justify-between gap-4">
                                            <label class="text-sm font-medium text-gray-900 dark:text-white w-24">${p.label}</label>
                                            <div class="flex items-center join-group">
                                                <button class="flex items-center justify-center h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-s-imp border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 focus:outline-none btn-fuel-dec join-item" data-p="${p.key}"><i data-lucide="minus" class="size-5 text-gray-900 dark:text-white"></i></button>
                                                <input type="text" readonly class="h-10 w-24 text-center bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-600 text-gray-900 text-sm dark:text-white rounded-none-imp join-item -ml-px" id="fuel-${p.key}" value="0">
                                                <button class="flex items-center justify-center h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-e-imp border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 focus:outline-none btn-fuel-inc join-item -ml-px" data-p="${p.key}"><i data-lucide="plus" class="size-5 text-gray-900 dark:text-white"></i></button>
                                            </div>
                                        </div>`).join('')}
                                </div>
                                <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div class="flex justify-between items-center mb-4"><span class="text-sm font-medium text-gray-500 dark:text-gray-400">Totale Stimato:</span><span id="fuel-order-total" class="text-lg font-bold text-gray-900 dark:text-white">€ 0,00</span></div>
                                    <button id="btn-save-order" class="w-full text-white bg-green-600 hover:bg-green-700 font-medium rounded-md text-sm px-5 py-2.5 text-center flex items-center justify-center transition-all shadow-sm" title="Salva Ordine"><i data-lucide="save" class="size-4 sm:mr-2"></i><span class="hidden sm:inline">Salva Ordine</span></button>
                                </div>
                            ${simpleCardEnd} 
                            
                            ${simpleCardStart('app-card-iva', 'Scorporo IVA (22%)', 'percent', 'bg-orange-500')}
                                <div class="mb-6">
                                    <label class="block mb-2 text-xs font-medium text-gray-500 uppercase">Importo Lordo</label>
                                    <input type="number" id="iva-lordo" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-md block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="0.00">
                                </div>
                                <div class="space-y-3">
                                    <div class="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex justify-between items-center">
                                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Imponibile:</span>
                                        <span id="iva-imponibile" class="text-xl font-bold text-gray-900 dark:text-white">€ 0,00</span>
                                    </div>
                                    <div class="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex justify-between items-center">
                                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Valore IVA:</span>
                                        <span id="iva-value" class="text-xl font-bold text-primary-600 dark:text-primary-400">€ 0,00</span>
                                    </div>
                                </div>
                            ${simpleCardEnd} 
                        </div>

                        <div id="apps-col-2" class="flex flex-col gap-6 min-h-[200px]">
                            ${simpleCardStart('app-card-calculator', 'Calcolatrice', 'calculator', 'bg-indigo-600')}
                                <div class="mb-4"><input type="text" id="calc-display" readonly class="w-full bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-lg text-right text-2xl font-bold p-4 text-gray-900 dark:text-white" value="0"></div>
                                <div id="calc-buttons" class="grid grid-cols-4 gap-2">
                                    <button class="calc-btn p-3 bg-red-200 dark:bg-red-800 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-red-300 dark:hover:bg-red-700" data-val="C">C</button>
                                    <button class="calc-btn p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600" data-val="/">/</button>
                                    <button class="calc-btn p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600" data-val="*">*</button>
                                    <button class="calc-btn p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600" data-val="-">-</button>
                                    <button class="calc-btn p-3 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500" data-val="7">7</button>
                                    <button class="calc-btn p-3 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500" data-val="8">8</button>
                                    <button class="calc-btn p-3 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500" data-val="9">9</button>
                                    <button class="calc-btn p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 row-span-2" data-val="+">+</button>
                                    <button class="calc-btn p-3 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500" data-val="4">4</button>
                                    <button class="calc-btn p-3 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500" data-val="5">5</button>
                                    <button class="calc-btn p-3 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500" data-val="6">6</button>
                                    <button class="calc-btn p-3 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500" data-val="1">1</button>
                                    <button class="calc-btn p-3 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500" data-val="2">2</button>
                                    <button class="calc-btn p-3 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500" data-val="3">3</button>
                                    <button class="calc-btn p-3 bg-primary-600 text-white rounded-lg text-lg font-medium hover:bg-primary-700 row-span-2" data-val="=">=</button>
                                    <button class="calc-btn p-3 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 col-span-2" data-val="0">0</button>
                                    <button class="calc-btn p-3 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500" data-val=".">.</button>
                                </div>
                            ${simpleCardEnd} 
                            ${simpleCardStart('app-card-radio', 'Radio Stream', 'radio', 'bg-pink-600')}
                                <div class="flex items-center gap-4 mb-4">
                                    <button id="radio-toggle-play" class="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors"><i data-lucide="play" class="size-6"></i></button>
                                    <div class="overflow-hidden"><div class="text-xs text-gray-500 dark:text-gray-400">In Riproduzione:</div><div id="radio-now-playing" class="text-sm font-medium text-gray-900 dark:text-white truncate">Nessuna radio</div></div>
                                </div>
                                <audio id="radio-player" preload="none"></audio>
                                <div><input type="text" id="radio-search-input" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-md block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Cerca stazione..."></div>
                                <div id="radio-station-list" class="mt-4 h-64 overflow-y-auto space-y-2 pr-2"></div>
                            ${simpleCardEnd}
                        </div>
                        
                        <div id="apps-col-3" class="flex flex-col gap-6 min-h-[200px]">
                            ${simpleCardStart('app-card-money', 'Conta Banconote', 'banknote', 'bg-green-600')}
                                <div class="space-y-3 mb-6" id="banconote-list">
                                    ${[500,200,100,50,20,10,5].map(t => `
                                        <div class="flex items-center justify-between gap-2">
                                            <span class="text-sm font-medium w-12 text-gray-900 dark:text-white">€ ${t}</span>
                                            <div class="flex items-center join-group">
                                                <button class="flex items-center justify-center h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-s-imp border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 focus:outline-none btn-money-dec join-item" data-t="${t}"><i data-lucide="minus" class="size-5 text-gray-900 dark:text-white"></i></button>
                                                <input type="text" readonly class="w-16 h-10 text-center bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-600 text-sm text-gray-900 dark:text-white rounded-none-imp join-item -ml-px" id="money-q-${t}" value="0">
                                                <button class="flex items-center justify-center h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-e-imp border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 focus:outline-none btn-money-inc join-item -ml-px" data-t="${t}"><i data-lucide="plus" class="size-5 text-gray-900 dark:text-white"></i></button>
                                            </div>
                                            <span class="text-sm font-bold w-20 text-right text-gray-900 dark:text-white" id="money-tot-${t}">€ 0</span>
                                        </div>`).join('')}
                                </div>
                                <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div class="flex justify-between items-center mb-2"><span class="text-sm font-medium text-gray-500 dark:text-gray-400">Totale Pezzi:</span><span id="money-count-total" class="text-base font-semibold text-gray-900 dark:text-white">0</span></div>
                                    <div class="flex justify-between items-center"><span class="text-lg font-bold text-gray-900 dark:text-white">Totale Valore</span><span id="money-grand-total" class="text-xl font-bold text-green-600 dark:text-green-500">€ 0,00</span></div>
                                </div>
                            ${simpleCardEnd} 
                            ${simpleCardStart('app-card-notes', 'Note Rapide', 'clipboard-list', 'bg-yellow-500')}
                                <textarea id="app-notes-textarea" class="w-full h-64 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm focus:ring-primary-500 focus:border-primary-500" placeholder="Scrivi qui le tue note..."></textarea>
                            ${simpleCardEnd} 
                        </div>
                    </div> 
                </div>`;
        },

        renderCalendar() {
            const grid = document.getElementById('cal-grid');
            const title = document.getElementById('cal-month-year');
            if (!grid || !title) return;
            const y = this.localState.currentDate.getFullYear(), m = this.localState.currentDate.getMonth();
            title.textContent = this.capitalize(new Date(y, m).toLocaleString('it-IT', { month: 'long', year: 'numeric' }));
            const firstDay = (new Date(y, m, 1).getDay() + 6) % 7;
            const daysInMonth = new Date(y, m + 1, 0).getDate();
            const todayISO = App.toLocalISOString(new Date());

            let html = '';
            for (let i = 0; i < firstDay; i++) html += '<div class="h-10"></div>';
            for (let i = 1; i <= daysInMonth; i++) {
                const dStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                const isSel = dStr === this.localState.selectedDateISO;
                const isToday = dStr === todayISO;
                const apps = App.state.data.appuntamenti.filter(a => a.date === dStr).map(() => 'app');
                const todos = App.state.data.todos.filter(t => t.dueDate === dStr).map(t => t.priorita);
                const dots = [...apps, ...todos].sort((a, b) => { const o = { 'urgent': 0, 'priority': 1, 'app': 2, 'standard': 3 }; return (o[a] ?? 3) - (o[b] ?? 3); }).slice(0, 3);

                html += `<button class="h-10 rounded-lg flex flex-col items-center justify-center relative border ${isSel ? 'border-primary-600 bg-primary-600 text-white font-bold' : (isToday ? 'border-primary-600 text-primary-600 font-bold' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white')}" data-date="${dStr}"><span>${i}</span><div class="calendar-dots">${dots.map(t => `<span class="cal-dot dot-${t}"></span>`).join('')}</div></button>`;
            }
            grid.innerHTML = html;
            grid.querySelectorAll('button[data-date]').forEach(b => b.onclick = () => { this.localState.selectedDateISO = b.dataset.date; this.renderCalendar(); this.renderEventsList(); });
        },

        renderEventsList() {
            const list = document.getElementById('event-list');
            const title = document.getElementById('event-list-title');
            if (!list || !title) return;
            const selDate = this.localState.selectedDateISO;
            title.textContent = `Eventi del ${App.formatDate(selDate)}`;
            const apps = App.state.data.appuntamenti.filter(a => a.date === selDate).map(a => ({ ...a, type: 'app' }));
            const todos = App.state.data.todos.filter(t => t.dueDate === selDate).map(t => ({ ...t, type: 'todo' }));
            const events = [...apps, ...todos].sort((a, b) => (a.oraInizio || '').localeCompare(b.oraInizio || ''));

            if (!events.length) { list.innerHTML = '<div class="text-center py-8 text-gray-500 dark:text-gray-400 flex flex-col items-center"><i data-lucide="calendar-x" class="size-8 mb-2 opacity-50"></i><p>Nessun evento.</p></div>'; } 
            else {
                list.innerHTML = events.map(e => {
                    let bc = 'border-gray-200 dark:border-gray-700', bg = 'bg-white dark:bg-gray-700', ic = 'text-gray-500 dark:text-gray-400', lc = 'text-gray-700 dark:text-gray-300', lbl = 'Standard';
                    if (e.type === 'app') { bc = 'border-blue-200 dark:border-blue-800'; bg = 'bg-blue-50 dark:bg-blue-900/20'; ic = 'text-blue-600 dark:text-blue-400'; lc = 'text-blue-700 dark:text-blue-300'; lbl = e.oraInizio; }
                    else if (e.priorita === 'urgent') { bc = 'border-red-200 dark:border-red-800'; bg = 'bg-red-50 dark:bg-red-900/20'; ic = 'text-red-600 dark:text-red-400'; lc = 'text-red-700 dark:text-red-300'; lbl = 'Urgente'; }
                    else if (e.priorita === 'priority') { bc = 'border-yellow-200 dark:border-yellow-800'; bg = 'bg-yellow-50 dark:bg-yellow-900/20'; ic = 'text-yellow-600 dark:text-yellow-400'; lc = 'text-yellow-700 dark:text-yellow-300'; lbl = 'Importante'; }
                    else { bc = 'border-green-200 dark:border-green-800'; bg = 'bg-green-50 dark:bg-green-900/20'; ic = 'text-green-600 dark:text-green-400'; lc = 'text-green-700 dark:text-green-300'; }
                    return `<div class="p-3 border ${bc} ${bg} rounded-lg flex justify-between items-center cursor-pointer hover:shadow-none transition-none btn-edit-event" data-id="${e.id}" data-type="${e.type}"><div class="flex items-center gap-3 overflow-hidden"><i data-lucide="${e.type === 'app' ? 'clock' : 'check-circle'}" class="size-5 flex-shrink-0 ${ic}"></i><div class="overflow-hidden"><div class="text-xs font-semibold ${lc}">${lbl}</div><div class="text-sm font-medium text-gray-900 dark:text-white truncate">${e.type === 'app' ? e.descrizione : e.text}</div></div></div></div>`;
                }).join('');
            }
            lucide.createIcons();
            list.querySelectorAll('.btn-edit-event').forEach(b => b.onclick = () => this.openEventModal(b.dataset.id, b.dataset.type));
        },

        openEventModal(id=null, type='app') {
            this.localState.editingEventId = id;
            const d = this.localState.selectedDateISO;
            let evt = null; if(id) evt = (type==='app' ? App.state.data.appuntamenti : App.state.data.todos).find(e=>e.id===id);
            const modalType = type || (evt?.type === 'app' ? 'app' : 'todo');
            const isApp = modalType === 'app';
            const renderDropdown = (eid, label, opts, sel) => `<div class="relative"><button id="${eid}Btn" data-dropdown-toggle="${eid}Drop" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 flex justify-between items-center dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="button"><span id="${eid}Sel">${opts.find(o=>o.v===sel)?.t||label}</span><svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/></svg></button><div id="${eid}Drop" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-full absolute dark:bg-gray-700"><ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="${eid}Btn">${opts.map(o=>`<li><a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${eid}-opt" data-v="${o.v}">${o.t}</a></li>`).join('')}</ul></div><input type="hidden" id="${eid}Inp" value="${sel}"></div>`;
            const typeOpts = [{v:'app',t:'Appuntamento'},{v:'todo',t:'To-Do'}];
            const durOpts = [{v:'30 min',t:'30 minuti'},{v:'1 ora',t:'1 ora'},{v:'2 ore',t:'2 ore'}];
            const prioOpts = [{v:'standard',t:'Standard'},{v:'priority',t:'Importante'},{v:'urgent',t:'Urgente'}];
            const form = `<form id="form-event" class="space-y-4"><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo Evento</label>${renderDropdown('evType','Tipo',typeOpts,modalType)}</div><div class="grid grid-cols-2 gap-4"><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data</label><input type="date" name="date" value="${evt?(evt.date||evt.dueDate):d}" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-md block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required></div><div id="time-fld" class="${isApp?'':'hidden'}"><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Ora</label><input type="time" name="time" value="${evt?.oraInizio||'09:00'}" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-md block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></div></div><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descrizione</label><input type="text" name="desc" value="${evt?(evt.descrizione||evt.text):''}" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-md block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required></div><div id="app-ext" class="${isApp?'':'hidden'}"><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Durata</label>${renderDropdown('evDur','Durata',durOpts,evt?.durata||'30 min')}</div><div id="todo-ext" class="${!isApp?'':'hidden'}"><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Priorità</label>${renderDropdown('evPrio','Priorità',prioOpts,evt?.priorita||'standard')}</div></form>`;
            
            const delBtn = id ? `<button id="btn-del-event" class="text-white bg-red-600 hover:bg-red-700 font-semibold rounded-md text-sm px-5 py-2.5 mr-auto shadow-sm transition-all">Elimina</button>` : '';
            
            App.showModal(id?'Modifica Evento':'Nuovo Evento', form, `${delBtn}<button id="btn-save-event" class="text-white bg-primary-600 hover:bg-primary-700 font-semibold rounded-md text-sm px-5 py-2.5 ml-auto shadow-sm transition-all">Salva</button>`, 'max-w-md');
            initFlowbite();
            ['evType','evDur','evPrio'].forEach(id => { document.querySelectorAll(`.${id}-opt`).forEach(o => o.onclick = (e) => { e.preventDefault(); document.getElementById(`${id}Sel`).textContent = o.textContent; document.getElementById(`${id}Inp`).value = o.dataset.v; document.getElementById(`${id}Drop`).classList.add('hidden'); if(id==='evType') { const isA = o.dataset.v==='app'; document.getElementById('time-fld').style.display=isA?'block':'none'; document.getElementById('app-ext').style.display=isA?'block':'none'; document.getElementById('todo-ext').style.display=!isA?'block':'none'; } }); });
            document.getElementById('btn-save-event').onclick = () => this.saveEvent();
            if(id) document.getElementById('btn-del-event').onclick = () => this.deleteEvent(id, modalType);
        },
        saveEvent() {
            const fd = new FormData(document.getElementById('form-event')); const type = document.getElementById('evTypeInp').value;
            if(!fd.get('desc').trim()) return alert('Descrizione obbligatoria');
            if(type==='app') {
                const item = { id: this.localState.editingEventId||App.generateId('app'), date: fd.get('date'), oraInizio: fd.get('time'), descrizione: fd.get('desc').trim(), durata: document.getElementById('evDurInp').value };
                if(this.localState.editingEventId) { const idx = App.state.data.appuntamenti.findIndex(x=>x.id===item.id); if(idx!==-1) App.state.data.appuntamenti[idx]=item; } else App.state.data.appuntamenti.push(item);
            } else {
                const item = { id: this.localState.editingEventId||App.generateId('todo'), dueDate: fd.get('date'), text: fd.get('desc').trim(), priorita: document.getElementById('evPrioInp').value, completed:false };
                if(this.localState.editingEventId) { const idx = App.state.data.todos.findIndex(x=>x.id===item.id); if(idx!==-1) App.state.data.todos[idx]=item; } else App.state.data.todos.push(item);
            }
            App.saveToStorage(); App.closeModal(); this.renderCalendar(); this.renderEventsList();
        },
        deleteEvent(id, type) {
            const body = `<div class="text-center p-6 flex flex-col items-center"><i data-lucide="alert-triangle" class="w-16 h-16 text-red-600 mb-4"></i><h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Eliminare evento?</h3><p class="text-gray-500 dark:text-gray-400 mb-6">Questa azione è irreversibile.</p></div>`;
            const footer = `<div class="flex justify-center gap-4 w-full"><button onclick="App.closeModal()" class="py-2.5 px-5 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 transition-all">Annulla</button><button id="btn-confirm-del-evt" class="py-2.5 px-5 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 shadow-sm transition-all">Elimina</button></div>`;
            App.showModal('', body, footer, 'max-w-md');
            document.getElementById('btn-confirm-del-evt').onclick = () => {
                if(type==='app') App.state.data.appuntamenti = App.state.data.appuntamenti.filter(e=>e.id!==id); else App.state.data.todos = App.state.data.todos.filter(e=>e.id!==id);
                App.saveToStorage(); App.closeModal(); this.renderCalendar(); this.renderEventsList();
            };
        },

        capitalize(s) { return s && s[0].toUpperCase() + s.slice(1); },
        updateIva(source) {
            const l = parseFloat(document.getElementById('iva-lordo').value);
            let netto = 0, iva = 0;
            if (source==='lordo' && !isNaN(l)) { netto = l / 1.22; iva = l - netto; }
            document.getElementById('iva-imponibile').textContent = App.formatCurrency(netto);
            document.getElementById('iva-value').textContent = App.formatCurrency(iva);
        },
        updateBanconote(t, inc) {
            this.localState.banconote[t] = Math.max(0, this.localState.banconote[t] + (inc ? 1 : -1));
            document.getElementById(`money-q-${t}`).value = this.localState.banconote[t];
            document.getElementById(`money-tot-${t}`).textContent = App.formatCurrency(this.localState.banconote[t] * parseInt(t)).replace('€','').trim();
            this.updateBanconoteTotal();
        },
        updateBanconoteTotal() {
            const count = Object.values(this.localState.banconote).reduce((a,b)=>a+b,0);
            const grand = Object.entries(this.localState.banconote).reduce((sum,[k,v])=>sum+(v*parseInt(k)),0);
            document.getElementById('money-count-total').textContent = count;
            document.getElementById('money-grand-total').textContent = App.formatCurrency(grand);
        },
        updateFuelOrder(p, inc) { this.localState.fuelOrder[p] = Math.max(0, this.localState.fuelOrder[p] + (inc ? 1000 : -1000)); document.getElementById(`fuel-${p}`).value = this.localState.fuelOrder[p]; this.updateFuelTotal(); },
        updateFuelTotal() { const prices = this.getLatestPrices(); let total = 0; ['benzina','gasolio','dieselplus','hvolution'].forEach(p => { total += (this.localState.fuelOrder[p]||0) * (prices[p==='dieselplus'?'dieselPlus':p]||0); }); document.getElementById('fuel-order-total').textContent = App.formatCurrency(total); },
        getLatestPrices() { if(!App.state.data.priceHistory?.length) return {}; return [...App.state.data.priceHistory].sort((a,b)=>new Date(b.date)-new Date(a.date))[0]; },
        
        saveFuelOrder() {
            const d = document.getElementById('fuel-order-date').value; if (!d) return alert('Seleziona data');
            const p = {...this.localState.fuelOrder}; delete p.date; if(Object.values(p).every(v => v === 0)) return alert('Inserire quantità.');
            App.state.data.fuelOrders.push({ id: App.generateId('ord'), date: d, products: p, status: 'pending' }); 
            const pMap = { benzina: 'Bz', gasolio: 'Gs', dieselplus: 'D+', hvolution: 'Hvo' };
            const details = Object.entries(p).filter(([k,v]) => v > 0).map(([k,v]) => `${pMap[k]||k}: ${App.formatNumber(v)}`).join(', ');
            const totalL = Object.values(p).reduce((a,b)=>a+b,0);
            const todoText = `Consegna Carburante (${App.formatNumber(totalL)} L): ${details}`;
            App.state.data.todos.push({ id: App.generateId('todo'), dueDate: d, text: todoText, priorita: 'urgent', completed: false });
            App.saveToStorage(); App.showToast('Ordine salvato e aggiunto al calendario!', 'success');
            this.localState.fuelOrder = { date: App.toLocalISOString(new Date()), benzina:0, gasolio:0, dieselplus:0, hvolution:0 }; 
            this.render();
        },

        handleCalculatorInput(value) {
            const display = document.getElementById('calc-display');
            let current = this.localState.calculatorInput || '';
            try {
                if (value === 'C') { current = ''; } else if (value === '=') {
                    if (current) { let safeCalc = String(current).replace(/[^-()\d/*+.]/g, ''); if (safeCalc) { let result = new Function('return ' + safeCalc)(); current = String(result); } else { current = '0'; } }
                } else {
                    if (current === '' && ['/', '*', '+', '.'].includes(value)) {} 
                    else if (['/', '*', '+', '-'].includes(current.slice(-1)) && ['/', '*', '+', '-'].includes(value)) { current = current.slice(0, -1) + value; } 
                    else if (value === '.' && current.split(/[-/*+]/).pop().includes('.')) {}
                    else { current += value; }
                }
                display.value = current || '0'; this.localState.calculatorInput = current;
            } catch (e) { display.value = 'Errore'; this.localState.calculatorInput = ''; }
        },

        saveNotes() { try { const notes = document.getElementById('app-notes-textarea').value; localStorage.setItem('Pylon.Pro_apps_notes_v1', notes); } catch (e) { console.warn('Salvataggio note bloccato:', e); } },
        loadNotes() { try { const notes = localStorage.getItem('Pylon.Pro_apps_notes_v1'); const textarea = document.getElementById('app-notes-textarea'); if (textarea && notes) { textarea.value = notes; } } catch (e) { console.warn('Caricamento note fallito:', e); } },

        initRadio() {
            if (!this.localState.audioPlayer) {
                this.localState.audioPlayer = document.getElementById('radio-player');
                const toggleBtn = document.getElementById('radio-toggle-play'); 
                this.localState.audioPlayer.onplay = () => { if (toggleBtn) toggleBtn.innerHTML = '<i data-lucide="pause" class="size-6"></i>'; lucide.createIcons(); this.renderRadioList(); };
                this.localState.audioPlayer.onpause = () => { if (toggleBtn) toggleBtn.innerHTML = '<i data-lucide="play" class="size-6"></i>'; lucide.createIcons(); this.renderRadioList(); };
            }
            if (this.localState.radioStations.length === 0) { this.fetchRadioStations(); } else { this.renderRadioList(); }
        },

        fetchRadioStations() {
            const list = document.getElementById('radio-station-list');
            if(list) list.innerHTML = `<div class="text-sm text-gray-500 dark:text-gray-400">Caricamento stazioni...</div>`;
            fetch('https://de1.api.radio-browser.info/json/stations/search?countrycode=IT&codec=MP3&limit=50&order=votes&reverse=true')
                .then(response => response.json())
                .then(data => { this.localState.radioStations = data.filter(s => s.url_resolved); this.renderRadioList(); })
                .catch(error => { console.error("Errore fetch radio:", error); if(list) list.innerHTML = `<div class="text-sm text-red-500">Errore nel caricare le stazioni.</div>`; });
        },

        renderRadioList() {
            const list = document.getElementById('radio-station-list');
            if (!list) return;
            const searchTerm = document.getElementById('radio-search-input').value.toLowerCase();
            const stations = this.localState.radioStations.filter(s => s.name.toLowerCase().includes(searchTerm));
            if (stations.length === 0) { list.innerHTML = `<div class="text-sm text-gray-500 dark:text-gray-400">Nessuna stazione trovata.</div>`; return; }
            list.innerHTML = stations.map(station => {
                const isCurrent = this.localState.currentStation?.url === station.url_resolved;
                const isPlaying = isCurrent && !this.localState.audioPlayer.paused;
                const icon = isPlaying ? 'pause-circle' : 'play-circle';
                const eqDisplay = isPlaying ? 'inline-flex' : 'none';
                return `<div class="p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700"><span class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">${station.name}</span><div class="flex items-center flex-shrink-0"><button class="btn-play-station p-1.5 text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg" data-url="${station.url_resolved}" data-name="${station.name}"><i data-lucide="${icon}" class="size-5"></i></button><div class="radio-eq-anim items-baseline" style="display: ${eqDisplay};"><span></span><span></span><span></span><span></span></div></div></div>`;
            }).join('');
            lucide.createIcons();
            list.querySelectorAll('.btn-play-station').forEach(btn => { btn.onclick = () => { this.playRadioStation(btn.dataset.url, btn.dataset.name); }; });
        },

        playRadioStation(url, name) {
            const player = this.localState.audioPlayer;
            if (player.src === url) { if (player.paused) player.play(); else player.pause(); } 
            else { player.src = url; player.play(); document.getElementById('radio-now-playing').textContent = name; this.localState.currentStation = { url, name }; }
            this.renderRadioList();
        },

        togglePlayPauseRadio() { const player = this.localState.audioPlayer; if (player.paused) { if (player.src) player.play(); } else { player.pause(); } },

        attachListeners() {
            document.getElementById('cal-prev').onclick = () => { this.localState.currentDate.setMonth(this.localState.currentDate.getMonth()-1); this.renderCalendar(); };
            document.getElementById('cal-next').onclick = () => { this.localState.currentDate.setMonth(this.localState.currentDate.getMonth()+1); this.renderCalendar(); };
            document.getElementById('cal-today').onclick = () => { this.localState.currentDate = new Date(); this.localState.selectedDateISO = App.toLocalISOString(new Date()); this.renderCalendar(); this.renderEventsList(); };
            document.getElementById('btn-add-event').onclick = () => this.openEventModal();
            document.getElementById('iva-lordo').oninput = () => this.updateIva('lordo');
            document.querySelectorAll('.btn-money-inc').forEach(b => b.onclick = () => this.updateBanconote(b.dataset.t, true));
            document.querySelectorAll('.btn-money-dec').forEach(b => b.onclick = () => this.updateBanconote(b.dataset.t, false));
            document.querySelectorAll('.btn-fuel-inc').forEach(b => b.onclick = () => this.updateFuelOrder(b.dataset.p, true));
            document.querySelectorAll('.btn-fuel-dec').forEach(b => b.onclick = () => this.updateFuelOrder(b.dataset.p, false));
            document.getElementById('btn-save-order').onclick = () => this.saveFuelOrder();
            document.getElementById('fuel-order-date').onchange = (e) => this.localState.fuelOrder.date = e.target.value;
            document.querySelectorAll('#calc-buttons .calc-btn').forEach(b => { b.onclick = () => this.handleCalculatorInput(b.dataset.val); });
            const notesTextarea = document.getElementById('app-notes-textarea'); if(notesTextarea) notesTextarea.onkeyup = () => this.saveNotes();
            const radioSearch = document.getElementById('radio-search-input'); const radioToggle = document.getElementById('radio-toggle-play');
            if(radioSearch) radioSearch.oninput = () => this.renderRadioList();
            if(radioToggle) radioToggle.onclick = () => this.togglePlayPauseRadio();
        }
    };
    if(window.App) App.registerModule('applicazioni', AppsModule); else document.addEventListener('app:ready', () => App.registerModule('applicazioni', AppsModule));
})();
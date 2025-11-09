/* ==========================================================================
   MODULO: Applicazioni (js/applicazioni.js) - Correct 50/50 Row 1 Layout
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
            editingEventId: null
        },

        init() {
            if(!App.state.data.todos) App.state.data.todos = [];
            if(!App.state.data.appuntamenti) App.state.data.appuntamenti = [];
            if(!App.state.data.fuelOrders) App.state.data.fuelOrders = [];
        },

        render() {
            const container = document.getElementById('applicazioni-container'); if (!container) return;
            if (!document.getElementById('apps-layout')) {
                container.innerHTML = this.getLayoutHTML();
                lucide.createIcons();
                this.attachListeners();
            }
            this.updateView();
        },

        updateView() {
            this.renderCalendar();
            this.renderEventsList();
            this.updateFuelTotal();
            this.updateBanconoteTotal();
        },

getLayoutHTML() {
            return `
                <div id="apps-layout" class="flex flex-col gap-6 animate-fade-in">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Applicazioni & Utility</h2>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                            <div class="flex items-center justify-between mb-6">
                                ${this.renderHeader('Calendario', 'calendar', 'bg-blue-600')}
                                <div class="flex gap-2">
                                    <button id="cal-prev" class="p-2 text-gray-500 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-700"><i data-lucide="chevron-left" class="size-5"></i></button>
                                    <button id="cal-today" class="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 dark:bg-gray-700 dark:text-primary-400">Oggi</button>
                                    <button id="cal-next" class="p-2 text-gray-500 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-700"><i data-lucide="chevron-right" class="size-5"></i></button>
                                </div>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center mb-4" id="cal-month-year"></h3>
                            <div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                <div>Lun</div><div>Mar</div><div>Mer</div><div>Gio</div><div>Ven</div><div>Sab</div><div>Dom</div>
                            </div>
                            <div id="cal-grid" class="grid grid-cols-7 gap-1"></div>
                        </div>

                        <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col">
                            <div class="flex items-center justify-between mb-6">
                                ${this.renderHeader('Eventi', 'list-todo', 'bg-purple-600')}
                                <button id="btn-add-event" class="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-sm px-4 py-2 flex items-center"><i data-lucide="plus" class="size-4 mr-1"></i> Nuovo</button>
                            </div>
                            <h4 class="text-md font-medium text-gray-700 dark:text-gray-300 mb-3" id="event-list-title">Seleziona una data</h4>
                            <div id="event-list" class="space-y-3 flex-1 overflow-y-auto pr-2 max-h-[400px]"></div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                            ${this.renderHeader('Ordine Carburante', 'truck', 'bg-cyan-600')}
                            <div class="mb-5">
                                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data Consegna</label>
                                <input type="date" id="fuel-order-date" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value="${this.localState.fuelOrder.date}">
                            </div>
                            <div class="space-y-4" id="fuel-order-form">
                                ${['Benzina','Gasolio','DieselPlus','Hvolution'].map(p => `
                                    <div class="flex items-center justify-between gap-4">
                                        <label class="text-sm font-medium text-gray-900 dark:text-white w-24">${p}</label>
                                        <div class="flex items-center">
                                            <button class="flex items-center justify-center h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-s-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 focus:outline-none btn-fuel-dec" data-p="${p.toLowerCase()}">
                                                <i data-lucide="minus" class="size-5 text-gray-500 dark:text-gray-400"></i>
                                            </button>
                                            <input type="text" readonly class="h-10 w-24 text-center bg-gray-50 border-y border-gray-300 dark:bg-gray-800 dark:border-gray-600 text-gray-900 text-sm dark:text-white" id="fuel-${p.toLowerCase()}" value="0">
                                            <button class="flex items-center justify-center h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-e-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 focus:outline-none btn-fuel-inc" data-p="${p.toLowerCase()}">
                                                <i data-lucide="plus" class="size-5 text-gray-500 dark:text-gray-400"></i>
                                            </button>
                                        </div>
                                    </div>`).join('')}
                            </div>
                            <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div class="flex justify-between items-center mb-4">
                                    <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Totale Stimato:</span>
                                    <span id="fuel-order-total" class="text-lg font-bold text-gray-900 dark:text-white">€ 0,00</span>
                                </div>
                                <button id="btn-save-order" class="w-full text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center"><i data-lucide="save" class="size-4 mr-2"></i> Salva Ordine</button>
                            </div>
                        </div>

                        <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                            ${this.renderHeader('Calcolo IVA (22%)', 'percent', 'bg-orange-500')}
                            <div class="space-y-4 mb-6">
                                <div><label class="block mb-2 text-xs font-medium text-gray-500 uppercase">Importo Lordo</label><input type="number" id="iva-lordo" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="0.00"></div>
                                <div><label class="block mb-2 text-xs font-medium text-gray-500 uppercase">Imponibile (Netto)</label><input type="number" id="iva-netto" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="0.00"></div>
                            </div>
                            <div class="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex justify-between items-center">
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Valore IVA:</span>
                                <span id="iva-value" class="text-xl font-bold text-primary-600 dark:text-primary-400">€ 0,00</span>
                            </div>
                        </div>

                        <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                            ${this.renderHeader('Conta Banconote', 'banknote', 'bg-green-600')}
                            <div class="space-y-3 mb-6" id="banconote-list">
                                ${[500,200,100,50,20,10,5].map(t => `
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="text-sm font-medium w-12 text-gray-900 dark:text-white">€ ${t}</span>
                                        <div class="flex items-center">
                                            <button class="flex items-center justify-center h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-s-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 focus:outline-none btn-money-dec" data-t="${t}">
                                                <i data-lucide="minus" class="size-5 text-gray-500 dark:text-gray-400"></i>
                                            </button>
                                            <input type="text" readonly class="w-16 h-10 text-center bg-gray-50 border-y border-gray-300 dark:bg-gray-800 dark:border-gray-600 text-sm text-gray-900 dark:text-white" id="money-q-${t}" value="0">
                                            <button class="flex items-center justify-center h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-e-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 focus:outline-none btn-money-inc" data-t="${t}">
                                                <i data-lucide="plus" class="size-5 text-gray-500 dark:text-gray-400"></i>
                                            </button>
                                        </div>
                                        <span class="text-sm font-bold w-20 text-right text-gray-900 dark:text-white" id="money-tot-${t}">€ 0</span>
                                    </div>`).join('')}
                            </div>
                            <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Totale Pezzi:</span>
                                    <span id="money-count-total" class="text-base font-semibold text-gray-900 dark:text-white">0</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-lg font-bold text-gray-900 dark:text-white">Totale Valore</span>
                                    <span id="money-grand-total" class="text-xl font-bold text-green-600 dark:text-green-500">€ 0,00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        },
        renderHeader(title, icon, bgClass) {
            return `
                <div class="flex items-center mb-4">
                    <div class="inline-flex items-center justify-center w-10 h-10 ${bgClass} text-white rounded-lg flex-shrink-0 mr-3">
                        <i data-lucide="${icon}" class="size-5"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">${title}</h3>
                </div>`;
        },

        // --- CALENDAR & EVENTS ---
        renderCalendar() {
            const grid = document.getElementById('cal-grid'); const title = document.getElementById('cal-month-year'); if (!grid || !title) return;
            const y = this.localState.currentDate.getFullYear(), m = this.localState.currentDate.getMonth();
            title.textContent = this.capitalize(new Date(y, m).toLocaleString('it-IT', { month: 'long', year: 'numeric' }));
            const firstDay = (new Date(y, m, 1).getDay() + 6) % 7; const daysInMonth = new Date(y, m + 1, 0).getDate();
            const todayISO = App.toLocalISOString(new Date());
            let html = ''; for (let i = 0; i < firstDay; i++) html += '<div class="h-10"></div>';
            for (let i = 1; i <= daysInMonth; i++) {
                const dStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                const isSel = dStr === this.localState.selectedDateISO;
                const isToday = dStr === todayISO;
                const apps = App.state.data.appuntamenti.filter(a=>a.date===dStr).map(()=>'app');
                const todos = App.state.data.todos.filter(t=>t.dueDate===dStr).map(t=>t.priorita);
                const dots = [...apps, ...todos].sort((a,b)=>{ const o={'urgent':0,'priority':1,'app':2,'standard':3}; return (o[a]??3)-(o[b]??3); }).slice(0,3);
                html += `<button class="h-10 rounded-lg flex flex-col items-center justify-center relative border ${isSel ? 'border-primary-600 bg-primary-600 text-white font-bold' : (isToday ? 'border-primary-600 text-primary-600 font-bold' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white')}" data-date="${dStr}"><span>${i}</span><div class="calendar-dots">${dots.map(t=>`<span class="cal-dot dot-${t}"></span>`).join('')}</div></button>`;
            }
            grid.innerHTML = html;
            grid.querySelectorAll('button[data-date]').forEach(b => b.onclick = () => { this.localState.selectedDateISO = b.dataset.date; this.renderCalendar(); this.renderEventsList(); });
        },
        renderEventsList() {
            const list = document.getElementById('event-list'); const title = document.getElementById('event-list-title'); if (!list || !title) return;
            const selDate = this.localState.selectedDateISO;
            title.textContent = `Eventi del ${App.formatDate(selDate)}`;
            const apps = App.state.data.appuntamenti.filter(a => a.date === selDate).map(a => ({...a, type:'app'}));
            const todos = App.state.data.todos.filter(t => t.dueDate === selDate).map(t => ({...t, type:'todo'}));
            const events = [...apps, ...todos].sort((a,b) => (a.oraInizio||'').localeCompare(b.oraInizio||''));
            if (!events.length) list.innerHTML = '<div class="text-center py-8 text-gray-500 dark:text-gray-400 flex flex-col items-center"><i data-lucide="calendar-x" class="size-8 mb-2 opacity-50"></i><p>Nessun evento.</p></div>';
            else list.innerHTML = events.map(e => {
                let bc='border-gray-200 dark:border-gray-700', bg='bg-white dark:bg-gray-700', ic='text-gray-500 dark:text-gray-400', lc='text-gray-700 dark:text-gray-300', lbl='Standard';
                if(e.type==='app') { bc='border-blue-200 dark:border-blue-800'; bg='bg-blue-50 dark:bg-blue-900/20'; ic='text-blue-600 dark:text-blue-400'; lc='text-blue-700 dark:text-blue-300'; lbl=e.oraInizio; }
                else if(e.priorita==='urgent') { bc='border-red-200 dark:border-red-800'; bg='bg-red-50 dark:bg-red-900/20'; ic='text-red-600 dark:text-red-400'; lc='text-red-700 dark:text-red-300'; lbl='Urgente'; }
                else if(e.priorita==='priority') { bc='border-yellow-200 dark:border-yellow-800'; bg='bg-yellow-50 dark:bg-yellow-900/20'; ic='text-yellow-600 dark:text-yellow-400'; lc='text-yellow-700 dark:text-yellow-300'; lbl='Importante'; }
                else { bc='border-green-200 dark:border-green-800'; bg='bg-green-50 dark:bg-green-900/20'; ic='text-green-600 dark:text-green-400'; lc='text-green-700 dark:text-green-300'; }
                return `<div class="p-3 border ${bc} ${bg} rounded-lg flex justify-between items-center cursor-pointer hover:shadow-sm transition-shadow btn-edit-event" data-id="${e.id}" data-type="${e.type}"><div class="flex items-center gap-3 overflow-hidden"><i data-lucide="${e.type==='app'?'clock':'check-circle'}" class="size-5 flex-shrink-0 ${ic}"></i><div class="truncate"><div class="text-xs font-semibold ${lc}">${lbl}</div><div class="text-sm font-medium text-gray-900 dark:text-white truncate">${e.type==='app'?e.descrizione:e.text}</div></div></div></div>`;
            }).join('');
            lucide.createIcons();
            list.querySelectorAll('.btn-edit-event').forEach(b => b.onclick = () => this.openEventModal(b.dataset.id, b.dataset.type));
        },

        // --- EVENT MODAL ---
        openEventModal(id=null, type='app') {
            this.localState.editingEventId = id;
            const d = this.localState.selectedDateISO;
            let evt = null; if(id) evt = (type==='app' ? App.state.data.appuntamenti : App.state.data.todos).find(e=>e.id===id);
            const modalType = type || (evt?.type === 'app' ? 'app' : 'todo');
            const isApp = modalType === 'app';
            const renderDropdown = (eid, label, opts, sel) => `<div class="relative"><button id="${eid}Btn" data-dropdown-toggle="${eid}Drop" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 flex justify-between items-center dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="button"><span id="${eid}Sel">${opts.find(o=>o.v===sel)?.t||label}</span><svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/></svg></button><div id="${eid}Drop" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-full absolute dark:bg-gray-700"><ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="${eid}Btn">${opts.map(o=>`<li><a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${eid}-opt" data-v="${o.v}">${o.t}</a></li>`).join('')}</ul></div><input type="hidden" id="${eid}Inp" value="${sel}"></div>`;
            const typeOpts = [{v:'app',t:'Appuntamento'},{v:'todo',t:'To-Do'}];
            const durOpts = [{v:'30 min',t:'30 minuti'},{v:'1 ora',t:'1 ora'},{v:'2 ore',t:'2 ore'}];
            const prioOpts = [{v:'standard',t:'Standard'},{v:'priority',t:'Importante'},{v:'urgent',t:'Urgente'}];
            const form = `<form id="form-event" class="space-y-4"><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo Evento</label>${renderDropdown('evType','Tipo',typeOpts,modalType)}</div><div class="grid grid-cols-2 gap-4"><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data</label><input type="date" name="date" value="${evt?(evt.date||evt.dueDate):d}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required></div><div id="time-fld" class="${isApp?'':'hidden'}"><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Ora</label><input type="time" name="time" value="${evt?.oraInizio||'09:00'}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></div></div><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descrizione</label><input type="text" name="desc" value="${evt?(evt.descrizione||evt.text):''}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required></div><div id="app-ext" class="${isApp?'':'hidden'}"><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Durata</label>${renderDropdown('evDur','Durata',durOpts,evt?.durata||'30 min')}</div><div id="todo-ext" class="${!isApp?'':'hidden'}"><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Priorità</label>${renderDropdown('evPrio','Priorità',prioOpts,evt?.priorita||'standard')}</div></form>`;
            const delBtn = id ? `<button id="btn-del-event" class="text-red-600 hover:text-white border border-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-2.5 mr-auto">Elimina</button>` : '';
            App.showModal(id?'Modifica Evento':'Nuovo Evento', form, `${delBtn}<button id="btn-save-event" class="text-white bg-primary-700 hover:bg-primary-800 font-medium rounded-lg text-sm px-5 py-2.5 ml-auto">Salva</button>`, 'max-w-md');
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
            const footer = `<div class="flex justify-center gap-4 w-full"><button onclick="App.closeModal()" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600">Annulla</button><button id="btn-confirm-del-evt" class="py-2.5 px-5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-800">Elimina</button></div>`;
            App.showModal('', body, footer, 'max-w-md');
            document.getElementById('btn-confirm-del-evt').onclick = () => {
                if(type==='app') App.state.data.appuntamenti = App.state.data.appuntamenti.filter(e=>e.id!==id); else App.state.data.todos = App.state.data.todos.filter(e=>e.id!==id);
                App.saveToStorage(); App.closeModal(); this.renderCalendar(); this.renderEventsList();
            };
        },

        // --- UTILITIES ---
        capitalize(s) { return s && s[0].toUpperCase() + s.slice(1); },
        updateIva(source) {
            const l = parseFloat(document.getElementById('iva-lordo').value), n = parseFloat(document.getElementById('iva-netto').value);
            let val = 0; if(source==='lordo' && !isNaN(l)) { val = l - (l / 1.22); document.getElementById('iva-netto').value = (l - val).toFixed(2); }
            else if(source==='netto' && !isNaN(n)) { val = n * 0.22; document.getElementById('iva-lordo').value = (n + val).toFixed(2); }
            document.getElementById('iva-value').textContent = App.formatCurrency(val);
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
            App.state.data.fuelOrders.push({ id: App.generateId('ord'), date: d, products: p, status: 'pending' }); App.saveToStorage(); alert('Ordine salvato!');
            this.localState.fuelOrder = { date: new Date().toISOString().split('T')[0], benzina:0, gasolio:0, dieselplus:0, hvolution:0 }; this.render();
        },
        attachListeners() {
            document.getElementById('cal-prev').onclick = () => { this.localState.currentDate.setMonth(this.localState.currentDate.getMonth()-1); this.renderCalendar(); };
            document.getElementById('cal-next').onclick = () => { this.localState.currentDate.setMonth(this.localState.currentDate.getMonth()+1); this.renderCalendar(); };
            document.getElementById('cal-today').onclick = () => { this.localState.currentDate = new Date(); this.localState.selectedDateISO = App.toLocalISOString(new Date()); this.renderCalendar(); this.renderEventsList(); };
            document.getElementById('btn-add-event').onclick = () => this.openEventModal();
            document.getElementById('iva-lordo').oninput = () => this.updateIva('lordo'); document.getElementById('iva-netto').oninput = () => this.updateIva('netto');
            document.querySelectorAll('.btn-money-inc').forEach(b => b.onclick = () => this.updateBanconote(b.dataset.t, true));
            document.querySelectorAll('.btn-money-dec').forEach(b => b.onclick = () => this.updateBanconote(b.dataset.t, false));
            document.querySelectorAll('.btn-fuel-inc').forEach(b => b.onclick = () => this.updateFuelOrder(b.dataset.p, true));
            document.querySelectorAll('.btn-fuel-dec').forEach(b => b.onclick = () => this.updateFuelOrder(b.dataset.p, false));
            document.getElementById('btn-save-order').onclick = () => this.saveFuelOrder();
            document.getElementById('fuel-order-date').onchange = (e) => this.localState.fuelOrder.date = e.target.value;
        }
    };
    if(window.App) App.registerModule('applicazioni', AppsModule); else document.addEventListener('app:ready', () => App.registerModule('applicazioni', AppsModule));
})();
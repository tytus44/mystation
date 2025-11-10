/* ==========================================================================
   MODULO: VirtualStation (js/virtualstation.js) - Responsive Buttons
   ========================================================================== */
(function() {
    'use strict';

    const VirtualModule = {
        localState: {
            filterMode: 'today',
            currentPage: 1,
            itemsPerPage: 5,
            editingId: null,
            chartInstances: {},
            datepicker: null
        },

        init() {
            this.localState.filterMode = localStorage.getItem('virtual_filter_mode') || 'today';
            if (!App.state.data.turni) App.state.data.turni = [];
        },

        render() {
            const container = document.getElementById('virtual-container');
            if (!container) return;

            if (!document.getElementById('virtual-layout')) {
                container.innerHTML = this.getLayoutHTML();
                lucide.createIcons();
                initFlowbite();
                this.attachListeners();
                setTimeout(() => this.initCharts(), 50);
            }
            this.updateView();
        },

        updateView() {
            this.updateStats();
            this.updateFilterLabel();
            this.renderTable();
            this.updateCharts();
        },

        getLayoutHTML() {
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
                                    <li><a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white btn-filter-opt" data-mode="month" id="filter-month-opt">Mese</a></li>
                                    <li><a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white btn-filter-opt" data-mode="year" id="filter-year-opt">Anno</a></li>
                                </ul>
                            </div>
                            <button id="btn-new-turno" class="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center" title="Nuovo Turno">
                                <i data-lucide="monitor-dot" class="size-4 sm:mr-2"></i>
                                <span class="hidden sm:inline">Nuovo Turno</span>
                            </button>
                        </div>
                    </div>
                    <div id="v-stats-container" class="grid grid-cols-1 sm:grid-cols-3 gap-4"></div>
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"><h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Modalità di Servizio</h3><div class="h-64"><canvas id="v-service-chart"></canvas></div></div>
                        <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"><h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vendite per Prodotto</h3><div class="h-64"><canvas id="v-products-chart"></canvas></div></div>
                        <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 lg:col-span-1"><h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Andamento Anno</h3><div class="h-64"><canvas id="v-trend-chart"></canvas></div></div>
                    </div>
                    <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                         <div class="mb-4"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Storico Turni</h3></div>
                         <div class="overflow-x-auto"><table class="w-full text-sm text-left text-gray-500 dark:text-gray-400"><thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"><tr><th class="px-4 py-3">Data</th><th class="px-4 py-3">Turno</th><th class="px-4 py-3">Benzina</th><th class="px-4 py-3">Gasolio</th><th class="px-4 py-3">Diesel+</th><th class="px-4 py-3">Hvol</th><th class="px-4 py-3">Totale</th><th class="px-4 py-3 text-right">Azioni</th></tr></thead><tbody class="divide-y divide-gray-200 dark:divide-gray-700" id="v-table-body"></tbody></table></div>
                         <div id="v-pagination"></div>
                    </div>
                </div>`;
        },

        updateStats() {
            const stats = this.calculateStats();
            const c = document.getElementById('v-stats-container');
            if(c) {
                c.innerHTML = `
                    ${this.renderStatCard('Litri Venduti', App.formatCurrency(stats.liters).replace('€','').trim(), 'bg-cyan-500', 'fuel')}
                    ${this.renderStatCard('Fatturato Stimato', App.formatCurrency(stats.revenue), 'bg-green-500', 'euro')}
                    ${this.renderStatCard('% Servito', stats.servitoPerc + '%', 'bg-purple-500', 'user-check')}
                `;
                lucide.createIcons();
            }
        },
        updateFilterLabel() {
            const today = new Date();
            const month = today.toLocaleString('it-IT', { month: 'long' });
            const year = today.getFullYear();
            document.getElementById('filter-month-opt').textContent = this.capitalize(month);
            document.getElementById('filter-year-opt').textContent = year;
            let label = 'Oggi';
            if (this.localState.filterMode === 'month') label = this.capitalize(month);
            if (this.localState.filterMode === 'year') label = year;
            document.getElementById('filter-label').textContent = label;
        },
        renderTable() {
            const tbody = document.getElementById('v-table-body');
            const pagination = document.getElementById('v-pagination');
            if (!tbody || !pagination) return;

            const all = this.getFilteredTurni();
            const totalPages = Math.ceil(all.length / this.localState.itemsPerPage);
            if (this.localState.currentPage > totalPages && totalPages > 0) this.localState.currentPage = totalPages;
            if (this.localState.currentPage < 1) this.localState.currentPage = 1;
            const start = (this.localState.currentPage - 1) * this.localState.itemsPerPage;
            const pageItems = all.slice(start, start + this.localState.itemsPerPage);

            if (!pageItems.length) tbody.innerHTML = '<tr><td colspan="8" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">Nessun turno trovato.</td></tr>';
            else {
                tbody.innerHTML = pageItems.map(t => {
                    const total = this.getTurnoTotal(t);
                    const isRiep = t.turno === 'Riepilogo Mensile';
                    return `<tr class="border-b dark:border-gray-700 ${isRiep ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}"><th class="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">${App.formatDate(t.date)}</th><td class="px-4 py-3">${t.turno}</td><td class="px-4 py-3">${this.fmtProd(t, 'benzina')}</td><td class="px-4 py-3">${this.fmtProd(t, 'gasolio')}</td><td class="px-4 py-3">${this.fmtProd(t, 'dieselplus')}</td><td class="px-4 py-3">${this.fmtProd(t, 'hvolution')}</td><td class="px-4 py-3 font-semibold">${App.formatCurrency(total).replace('€','')}</td><td class="px-4 py-3 text-right"><button class="btn-edit-turno font-medium text-primary-600 dark:text-primary-500 hover:underline" data-id="${t.id}">Modifica</button></td></tr>`;
                }).join('');
            }
            if (totalPages > 1) {
                const curr = this.localState.currentPage;
                pagination.innerHTML = `<div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700"><span class="text-sm font-normal text-gray-500 dark:text-gray-400">Pagina <span class="font-semibold text-gray-900 dark:text-white">${curr}</span> di <span class="font-semibold text-gray-900 dark:text-white">${totalPages}</span></span><ul class="inline-flex items-center -space-x-px"><li><button id="v-prev-page" class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" ${curr===1?'disabled':''}><i data-lucide="chevron-left" class="w-4 h-4 mr-1"></i> Prec</button></li><li><button id="v-next-page" class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-primary-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" ${curr===totalPages?'disabled':''}>Succ <i data-lucide="chevron-right" class="w-4 h-4 ml-1"></i></button></li></ul></div>`;
                document.getElementById('v-prev-page')?.addEventListener('click', () => { this.localState.currentPage--; this.renderTable(); });
                document.getElementById('v-next-page')?.addEventListener('click', () => { this.localState.currentPage++; this.renderTable(); });
                lucide.createIcons();
            } else pagination.innerHTML = '';
            document.querySelectorAll('.btn-edit-turno').forEach(b => b.onclick = () => this.openTurnoModal(b.dataset.id));
        },

        renderStatCard(t, v, bg, i) { return `<div class="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800"><div class="flex-1 min-w-0"><p class="text-sm font-medium text-gray-500 dark:text-gray-400">${t}</p><h3 class="text-2xl font-bold text-gray-900 dark:text-white">${v}</h3></div><div class="inline-flex items-center justify-center w-12 h-12 ${bg} text-white rounded-lg"><i data-lucide="${i}" class="w-6 h-6"></i></div></div>`; },
        fmtProd(t, p) { const tot = (parseFloat(t.prepay?.[p])||0) + (parseFloat(t.servito?.[p])||0) + (parseFloat(t.fdt?.[p])||0); return tot > 0 ? App.formatCurrency(tot).replace('€','').trim() : '-'; },
        getFilteredTurni() {
            const mode = this.localState.filterMode; const now = new Date(); const start = new Date(); start.setHours(0,0,0,0);
            if (mode === 'month') start.setDate(1); else if (mode === 'year') start.setMonth(0, 1);
            return App.state.data.turni.filter(t => { const d = new Date(t.date); return mode === 'today' ? d >= start && d <= now : d >= start; }).sort((a,b) => new Date(b.date) - new Date(a.date));
        },
        getTurnoTotal(t) { return this.sumObj(t.prepay) + this.sumObj(t.servito) + this.sumObj(t.fdt); },
        sumObj(o) { return Object.values(o||{}).reduce((a,b)=>a+(parseFloat(b)||0),0); },
        calculateStats() {
            const turni = this.getFilteredTurni(); let liters=0, rev=0, serv=0;
            turni.forEach(t => { liters += this.getTurnoTotal(t); serv += this.sumObj(t.servito); rev += this.getTurnoTotal(t) * 1.75; });
            return { liters, revenue: rev, servitoPerc: liters>0 ? Math.round((serv/liters)*100) : 0 };
        },
        capitalize(s) { return s && s[0].toUpperCase() + s.slice(1); },

        initCharts() {
            const ctxP = document.getElementById('v-products-chart')?.getContext('2d');
            const ctxS = document.getElementById('v-service-chart')?.getContext('2d');
            const ctxT = document.getElementById('v-trend-chart')?.getContext('2d');
            if (!ctxP || !ctxS || !ctxT) return;
            if(!this.localState.chartInstances.p) {
                this.localState.chartInstances.p = new Chart(ctxP, { type: 'doughnut', data: { labels: [], datasets: [{ data: [], backgroundColor: ['#22c55e','#f97316','#e11d48','#06b6d4','#3b82f6'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 10 } } } } });
            }
            if(!this.localState.chartInstances.s) {
                this.localState.chartInstances.s = new Chart(ctxS, { type: 'bar', data: { labels: ['Totale'], datasets: [] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { stacked: false }, y: { beginAtZero: true } } } });
            }
            if(!this.localState.chartInstances.t) {
                this.localState.chartInstances.t = new Chart(ctxT, { type: 'line', data: { labels: ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'], datasets: [] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } });
            }
            this.updateCharts();
        },

        updateCharts() {
            if(!this.localState.chartInstances.p) return;
            const turni = this.getFilteredTurni();
            const pData = [0,0,0,0,0]; let fdt=0, prepay=0, servito=0;
            turni.forEach(t => {
                pData[0] += this.getProdTotal(t,'benzina'); pData[1] += this.getProdTotal(t,'gasolio');
                pData[2] += this.getProdTotal(t,'dieselplus'); pData[3] += this.getProdTotal(t,'hvolution');
                pData[4] += this.getProdTotal(t,'adblue');
                fdt += this.sumObj(t.fdt); prepay += this.sumObj(t.prepay); servito += this.sumObj(t.servito);
            });
            this.localState.chartInstances.p.data.labels = ['Bz','Gs','D+','Hv','AdB']; this.localState.chartInstances.p.data.datasets[0].data = pData; this.localState.chartInstances.p.update();
            this.localState.chartInstances.s.data.datasets = [ { label: 'FaiDaTe', data: [fdt], backgroundColor: 'rgba(225, 29, 72, 0.6)', borderColor: '#e11d48', borderWidth: 1 }, { label: 'Prepay', data: [prepay], backgroundColor: 'rgba(6, 182, 212, 0.6)', borderColor: '#06b6d4', borderWidth: 1 }, { label: 'Servito', data: [servito], backgroundColor: 'rgba(34, 197, 94, 0.6)', borderColor: '#22c55e', borderWidth: 1 } ]; this.localState.chartInstances.s.update();
            const currentYear = new Date().getFullYear(); const monthlyData = Array(12).fill(0);
            App.state.data.turni.filter(t => new Date(t.date).getFullYear() === currentYear).forEach(t => { monthlyData[new Date(t.date).getMonth()] += this.getTurnoTotal(t); });
            const chartT = this.localState.chartInstances.t; const gradient = chartT.ctx.createLinearGradient(0, 0, 0, 300); gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)'); gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
            chartT.data.datasets = [{ label: 'Litri', data: monthlyData, borderColor: '#10b981', tension: 0.3, fill: true, backgroundColor: gradient }]; chartT.update();
        },
        getProdTotal(t, p) { return (parseFloat(t.prepay?.[p])||0) + (parseFloat(t.servito?.[p])||0) + (parseFloat(t.fdt?.[p])||0); },

        openTurnoModal(id=null) {
            this.localState.editingId = id;
            const t = id ? App.state.data.turni.find(x=>x.id===id) : null;
            const dISO = t ? t.date.split('T')[0] : new Date().toISOString().split('T')[0];
            const cls = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
            const turnoOpts = ['Mattina','Pomeriggio','Notte','Pausa','Weekend','Riepilogo Mensile'];
            const curTurno = t?.turno || 'Mattina';
            const isRiep = curTurno === 'Riepilogo Mensile';
            const dropdownHtml = `<div class="relative"><button id="turnoDropdownBtn" data-dropdown-toggle="turnoDropdown" class="${cls} flex justify-between items-center w-full" type="button"><span id="selectedTurno">${curTurno}</span><svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/></svg></button><div id="turnoDropdown" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-full absolute dark:bg-gray-700"><ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="turnoDropdownBtn">${turnoOpts.map(o => `<li><a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white turno-opt" data-val="${o}">${o}</a></li>`).join('')}</ul></div></div><input type="hidden" name="turno" id="turnoInput" value="${curTurno}">`;
            const form = `<form id="form-turno" class="space-y-4"><div class="grid grid-cols-2 gap-4"><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data</label><input type="date" name="date" value="${dISO}" class="${cls} ps-10" required></div><div><label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Turno</label>${dropdownHtml}</div></div><div class="space-y-4"><h4 class="font-medium text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Erogato (Litri)</h4><div class="grid grid-cols-4 gap-4 items-center text-sm font-medium text-gray-500 dark:text-gray-400 text-center"><div class="text-left">Prodotto</div><div>Prepay</div><div>Servito</div><div>FaiDaTe</div></div>${['Benzina','Gasolio','DieselPlus','Hvolution'].map(p => { const k = p.toLowerCase(); return `<div class="grid grid-cols-4 gap-4 items-center"><div class="text-gray-900 dark:text-white">${p}</div><input type="number" step="1" name="pp_${k}" value="${t?.prepay?.[k]||''}" class="${cls}" placeholder="0"><input type="number" step="1" name="sv_${k}" value="${t?.servito?.[k]||''}" class="${cls}" placeholder="0"><input type="number" step="1" name="fd_${k}" value="${t?.fdt?.[k]||''}" class="${cls} fdt-input" placeholder="0" ${!isRiep?'disabled':''}></div>`; }).join('')}<div class="grid grid-cols-4 gap-4 items-center"><div class="text-gray-900 dark:text-white">AdBlue</div><div></div><input type="number" step="1" name="sv_adblue" value="${t?.servito?.adblue||''}" class="${cls}" placeholder="0"><div></div></div></div></form>`;
            
            const deleteBtn = id ? `<button id="btn-delete-turno" class="text-red-600 hover:text-white border border-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-auto">Elimina</button>` : '';
            App.showModal(id?'Modifica Turno':'Nuovo Turno', form, `${deleteBtn}<button id="btn-save-turno" class="text-white bg-primary-700 hover:bg-primary-800 font-medium rounded-lg text-sm px-5 py-2.5 ml-auto">Salva Turno</button>`);
            
            initFlowbite(); 
            document.querySelectorAll('.turno-opt').forEach(o => o.onclick = (e) => { 
                e.preventDefault(); const val = o.dataset.val; document.getElementById('selectedTurno').textContent = val; document.getElementById('turnoInput').value = val; document.getElementById('turnoDropdown').classList.add('hidden'); 
                const isRiep = val === 'Riepilogo Mensile'; document.querySelectorAll('.fdt-input').forEach(inp => inp.disabled = !isRiep);
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
            const body = `
                <div class="text-center p-6 flex flex-col items-center">
                    <i data-lucide="alert-triangle" class="w-16 h-16 text-red-600 mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Eliminare questo turno?</h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-6">
                        Stai per eliminare il turno del <b>${App.formatDate(t?.date)} (${t?.turno})</b>.<br>
                        Questa azione non può essere annullata.
                    </p>
                </div>`;
            const footer = `
                <div class="flex justify-center gap-4 w-full">
                    <button onclick="App.closeModal()" class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Annulla</button>
                    <button id="btn-confirm-delete" class="py-2.5 px-5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800">Elimina</button>
                </div>`;
            
            App.showModal('', body, footer, 'max-w-md');
            
            setTimeout(() => {
                 document.getElementById('btn-confirm-delete').onclick = () => {
                     App.state.data.turni = App.state.data.turni.filter(t => t.id !== id);
                     App.saveToStorage();
                     App.closeModal();
                     this.render();
                 };
            }, 50);
        },

        attachListeners() {
            document.querySelectorAll('.btn-filter-opt').forEach(b => b.onclick = (e) => { e.preventDefault(); this.localState.filterMode = b.dataset.mode; localStorage.setItem('virtual_filter_mode', b.dataset.mode); this.render(); });
            document.getElementById('btn-new-turno').onclick = () => this.openTurnoModal();
            document.querySelectorAll('.btn-edit-turno').forEach(b => b.onclick = () => this.openTurnoModal(b.dataset.id));
        }
    };
    if(window.App) App.registerModule('virtualstation', VirtualModule); else document.addEventListener('app:ready', () => App.registerModule('virtualstation', VirtualModule));
})();
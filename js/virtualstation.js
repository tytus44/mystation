/* INIZIO MODULO VIRTUAL STATION */
const VirtualStationModule = {
    ITEMS_PER_PAGE: 10,
    chartInstances: {},
    currentPage: 1,
    currentFilter: 'month',
    editingId: null,

    products: [
        { id: 'gasolio', label: 'Gasolio', color: 'var(--col-gasolio)' },
        { id: 'dieselplus', label: 'Diesel+', color: 'var(--col-dieselplus)' },
        { id: 'adblue', label: 'AdBlue', color: 'var(--col-adblue)' },
        { id: 'benzina', label: 'Benzina', color: 'var(--col-benzina)' },
        { id: 'hvolution', label: 'Hvolution', color: 'var(--col-hvolution)' }
    ],

    init: function() {
        this.currentPage = 1;
        this.currentFilter = `month-${new Date().getMonth()}`;
        this.render();
        this.setupModalListeners();
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-content.show').forEach(d => d.classList.remove('show'));
            }
            if (!e.target.closest('.datepicker-container')) {
                document.querySelectorAll('.datepicker-wrapper.show').forEach(d => d.classList.remove('show'));
            }
        });
    },

    render: function() {
        const container = document.getElementById('virtualstation-content');
        if (!container) return;
        const turni = this.getFilteredTurni();
        const stats = this.calculateStats(turni);
        const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
        let monthBtnLabel = "Mese";
        if (this.currentFilter.startsWith('month-')) {
            const idx = parseInt(this.currentFilter.split('-')[1]);
            monthBtnLabel = months[idx];
        }

        container.innerHTML = `
            <div class="toolbar-container"><div class="toolbar-group"><input type="file" id="import-vs-input" style="display: none;" accept=".json"><button id="btn-vs-import" class="action-btn">Importa</button><button id="btn-vs-export" class="action-btn">Esporta</button></div><div class="toolbar-group"><button class="action-btn ${this.currentFilter === 'today' ? 'active' : ''}" onclick="VirtualStationModule.setFilter('today')">Oggi</button><div class="dropdown" id="month-dropdown-container"><button class="action-btn ${this.currentFilter.startsWith('month-') ? 'active' : ''}" onclick="document.getElementById('month-dropdown').classList.toggle('show'); event.stopPropagation();">${monthBtnLabel} <i data-lucide="chevron-down" style="width:16px; margin-left:5px;"></i></button><div id="month-dropdown" class="dropdown-content">${months.map((m, i) => `<div class="dropdown-item ${this.currentFilter === `month-${i}` ? 'active' : ''}" onclick="VirtualStationModule.setFilter('month-${i}')">${m}</div>`).join('')}</div></div><button class="action-btn ${this.currentFilter === 'year' ? 'active' : ''}" onclick="VirtualStationModule.setFilter('year')">Anno</button></div><div class="toolbar-group"><button id="btn-new-turno" class="action-btn">Nuovo Turno</button></div></div>
            <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); margin-bottom: 24px;"><div class="card"><div class="card-header"><span class="card-title">Litri Venduti</span><i data-lucide="droplets"></i></div><div class="card-body"><h2 style="color: var(--primary-color); font-size: 2rem; font-weight: 700;">${stats.liters.toLocaleString('it-IT')} L</h2><p style="color: var(--text-secondary); font-size: 0.9rem;">Nel periodo selezionato</p></div></div><div class="card"><div class="card-header"><span class="card-title">Fatturato Stimato</span><i data-lucide="euro"></i></div><div class="card-body"><h2 style="color: var(--col-gasolio); font-size: 2rem; font-weight: 700;">€ ${stats.revenue.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2><p style="color: var(--text-secondary); font-size: 0.9rem;">Calcolato su storico prezzi</p></div></div><div class="card"><div class="card-header"><span class="card-title">% Servito</span><i data-lucide="user-check"></i></div><div class="card-body"><h2 style="color: var(--col-hvolution); font-size: 2rem; font-weight: 700;">${stats.servitoPerc}%</h2><p style="color: var(--text-secondary); font-size: 0.9rem;">Incidenza sul totale</p></div></div></div>
            <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); margin-bottom: 24px;"><div class="card"><div class="card-header"><span class="card-title">Modalità Servizio</span><i data-lucide="pie-chart"></i></div><div class="card-body" style="height: 300px;"><canvas id="chartMode"></canvas></div></div><div class="card"><div class="card-header"><span class="card-title">Vendite per Prodotto</span><i data-lucide="bar-chart-2"></i></div><div class="card-body" style="height: 300px;"><canvas id="chartProducts"></canvas></div></div><div class="card"><div class="card-header"><span class="card-title">Andamento Anno</span><i data-lucide="trending-up"></i></div><div class="card-body" style="height: 300px;"><canvas id="chartTrend"></canvas></div></div></div>
            <div class="card"><div class="card-header"><span class="card-title">Storico Turni</span><i data-lucide="history"></i></div><div class="card-body"><div style="overflow-x: auto;">${this.renderTable(turni)}</div>${this.renderPagination(turni.length)}</div></div>
        `;
        lucide.createIcons();
        this.renderCharts(turni);
        this.attachMainListeners();
    },

    // --- MODALE DELETE ---
    deleteTurno: function(id) {
        const bodyHTML = `<div style="text-align:center; padding:10px;"><i data-lucide="trash-2" style="width:48px; height:48px; color:var(--col-destructive); margin-bottom:10px;"></i><p style="font-weight:600; color:var(--text-main);">Eliminare questo turno?</p></div>`;
        const footerHTML = `<div class="btn-group"><button id="btn-cancel-del" class="action-btn btn-cancel">ANNULLA</button><button id="btn-confirm-del" class="action-btn btn-delete">ELIMINA</button></div>`;
        this.openModal('Conferma', bodyHTML, footerHTML, '400px');
        setTimeout(() => {
            document.getElementById('btn-cancel-del').onclick = () => this.closeModal();
            document.getElementById('btn-confirm-del').onclick = () => {
                const all = this.getTurni().filter(t => t.id !== id);
                localStorage.setItem('polaris_turni', JSON.stringify(all));
                window.showNotification("Turno eliminato", 'info');
                this.closeModal();
                this.render();
            };
        }, 0);
    },

    importData: function(e) {
        const f = e.target.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target.result);
                const bodyHTML = `<div style="text-align:center; padding:10px;"><i data-lucide="alert-triangle" style="width:48px; height:48px; color:var(--col-destructive); margin-bottom:10px;"></i><p style="font-weight:600; color:var(--text-main);">Sovrascrivere i dati esistenti?</p></div>`;
                const footerHTML = `<div class="btn-group"><button id="btn-cancel-imp" class="action-btn btn-cancel">ANNULLA</button><button id="btn-confirm-imp" class="action-btn btn-delete">IMPORTA</button></div>`;
                this.openModal('Importazione', bodyHTML, footerHTML, '400px');
                setTimeout(() => {
                    document.getElementById('btn-cancel-imp').onclick = () => {
                        this.closeModal();
                        e.target.value = '';
                    };
                    document.getElementById('btn-confirm-imp').onclick = () => {
                        const data = Array.isArray(json) ? json : (json.turni || []);
                        localStorage.setItem('polaris_turni', JSON.stringify(data));
                        window.showNotification("Importazione riuscita", 'success');
                        this.closeModal();
                        this.render();
                        e.target.value = '';
                    };
                }, 0);
            } catch (err) {
                window.showNotification("File non valido", 'error');
            }
        };
        r.readAsText(f);
    },

    openTurnoModal: function(idToEdit = null) {
        this.editingId = idToEdit;
        let title = idToEdit ? "Modifica Turno" : "Nuovo Turno";
        let btnText = idToEdit ? "AGGIORNA" : "SALVA";
        let ex = idToEdit ? this.getTurni().find(t => t.id === idToEdit) : null;
        let dateVal = ex ? ex.date.split('T')[0] : new Date().toISOString().split('T')[0];
        let turnoVal = ex ? ex.turno : 'Notte';
        const turniOptions = ['Notte', 'Mattina', 'Pausa', 'Pomeriggio', 'Weekend', 'Riepilogo Mensile'];

        // Creazione HTML Prodotti con Logica AdBlue Esclusiva
        const productsHTML = this.products.map(p => {
            const isAdBlue = p.id === 'adblue';

            // Campo Fai Da Te: Vuoto se AdBlue, altrimenti input
            const fdtHtml = isAdBlue ?
                `<div style="background:var(--bg-app); border-radius:var(--radius-input); opacity:0.3;"></div>` :
                `<input type="number" step="1" class="price-square inp-fdt" data-prod="${p.id}" placeholder="0" style="width: 100%; height: 40px; font-size: 1rem;">`;

            // Campo Servito: Sempre presente
            const servHtml = `<input type="number" step="1" class="price-square inp-servito" data-prod="${p.id}" placeholder="0" style="width: 100%; height: 40px; font-size: 1rem;">`;

            // Campo Iperself: Vuoto se AdBlue, altrimenti input
            const prepayHtml = isAdBlue ?
                `<div style="background:var(--bg-app); border-radius:var(--radius-input); opacity:0.3;"></div>` :
                `<input type="number" step="1" class="price-square inp-prepay" data-prod="${p.id}" placeholder="0" style="width: 100%; height: 40px; font-size: 1rem;">`;

            return `
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px; align-items: center;">
                <div style="font-weight: 600; color: ${p.color};">${p.label}</div>
                ${fdtHtml}
                ${servHtml}
                ${prepayHtml}
            </div>`;
        }).join('');

        const bodyHTML = `
            <form id="form-turno">
                <div class="price-input-grid" style="margin-bottom: 20px;">
                    <div>
                        <label>Data</label>
                        <div class="datepicker-container" style="position: relative;">
                            <input type="date" id="inp-date" value="${dateVal}" class="nav-link no-icon" style="position:absolute; opacity:0; pointer-events:none;">
                            <button type="button" id="date-trigger" class="dropdown-trigger" onclick="VirtualStationModule.toggleDatepicker(event)">
                                <span id="date-display">${this.formatDateIT(dateVal)}</span>
                                <i data-lucide="calendar" style="width:16px;"></i>
                            </button>
                            <div id="custom-datepicker" class="datepicker-wrapper"></div>
                        </div>
                    </div>
                    <div>
                        <label>Turno</label>
                        <div class="dropdown dropdown-full-width" style="width:100%;">
                            <input type="hidden" id="inp-turno-val" value="${turnoVal}">
                            <button type="button" class="dropdown-trigger" onclick="document.getElementById('turno-list').classList.toggle('show'); event.stopPropagation();">
                                <span id="inp-turno-text">${turnoVal}</span>
                                <i data-lucide="chevron-down" style="width:16px;"></i>
                            </button>
                            <div id="turno-list" class="dropdown-content">
                                ${turniOptions.map(opt => `<div class="dropdown-item" onclick="VirtualStationModule.selectTurno('${opt}')">${opt}</div>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="inputs-container">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px; text-align: center; font-size: 0.8rem; color: var(--text-secondary); font-weight: 600;">
                        <div style="text-align: left;">PRODOTTO</div>
                        <div>FAI DA TE</div>
                        <div>SERVITO</div>
                        <div>IPERSELF</div>
                    </div>
                    ${productsHTML}
                </div>
            </form>`;

        const footerHTML = `<div class="btn-group"><button type="button" id="btn-cancel-turno" class="action-btn btn-cancel">ANNULLA</button><button type="button" id="btn-save-turno" class="action-btn btn-save">${btnText}</button></div>`;
        this.openModal(title, bodyHTML, footerHTML, '600px');
        const selTurno = document.getElementById('inp-turno-val');
        this.updateInputState(turnoVal);

        // Popolamento dati (Con controllo esistenza elemento)
        if (ex) {
            this.products.forEach(p => {
                const pid = p.id;
                // Nota: In inputsHTML alcuni input potrebbero non esistere (AdBlue Fdt/Prepay)
                const inpPrepay = document.querySelector(`.inp-prepay[data-prod="${pid}"]`);
                const inpServito = document.querySelector(`.inp-servito[data-prod="${pid}"]`);
                const inpFdt = document.querySelector(`.inp-fdt[data-prod="${pid}"]`);

                if (inpPrepay) inpPrepay.value = ex.prepay?.[pid] || '';
                if (inpServito) inpServito.value = ex.servito?.[pid] || '';
                if (inpFdt) inpFdt.value = ex.fdt?.[pid] || '';
            });
        }

        setTimeout(() => {
            document.getElementById('btn-save-turno').addEventListener('click', () => this.saveTurno());
            document.getElementById('btn-cancel-turno').addEventListener('click', () => this.closeModal());
        }, 0);
    },

    toggleDatepicker: function(e) {
        e.stopPropagation();
        const wrapper = document.getElementById('custom-datepicker');
        if (wrapper.classList.contains('show')) {
            wrapper.classList.remove('show');
            return;
        }
        document.querySelectorAll('.show').forEach(el => el.classList.remove('show'));
        wrapper.classList.add('show');
        const curDate = new Date(document.getElementById('inp-date').value);
        this.renderCalendar(curDate.getFullYear(), curDate.getMonth());
    },

    renderCalendar: function(year, month) {
        const w = document.getElementById('custom-datepicker');
        const ms = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
        const ds = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
        const fd = new Date(year, month, 1).getDay();
        const afd = fd === 0 ? 6 : fd - 1;
        const dim = new Date(year, month + 1, 0).getDate();
        let html = `<div class="datepicker-header"><button type="button" class="datepicker-nav" onclick="VirtualStationModule.changeMonth(${month-1}, ${year}); event.stopPropagation();"><i data-lucide="chevron-left" style="width:16px;"></i></button><div class="datepicker-title">${ms[month]} ${year}</div><button type="button" class="datepicker-nav" onclick="VirtualStationModule.changeMonth(${month+1}, ${year}); event.stopPropagation();"><i data-lucide="chevron-right" style="width:16px;"></i></button></div><div class="datepicker-grid">${ds.map(d=>`<div class="datepicker-day-label">${d}</div>`).join('')}`;
        for (let i = 0; i < afd; i++) html += `<div class="datepicker-day empty"></div>`;
        const sd = new Date(document.getElementById('inp-date').value);
        const today = new Date();
        for (let i = 1; i <= dim; i++) {
            let cls = 'datepicker-day';
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) cls += ' today';
            if (i === sd.getDate() && month === sd.getMonth() && year === sd.getFullYear()) cls += ' selected';
            html += `<div class="${cls}" onclick="VirtualStationModule.selectDate(${year},${month},${i}); event.stopPropagation();">${i}</div>`;
        }
        html += '</div>';
        w.innerHTML = html;
        lucide.createIcons();
    },

    changeMonth: function(m, y) {
        if (m < 0) {
            m = 11;
            y--;
        } else if (m > 11) {
            m = 0;
            y++;
        }
        this.renderCalendar(y, m);
    },

    selectDate: function(y, m, d) {
        const fmt = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        document.getElementById('inp-date').value = fmt;
        document.getElementById('date-display').innerText = this.formatDateIT(fmt);
        document.getElementById('custom-datepicker').classList.remove('show');
    },

    formatDateIT: function(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    },

    selectTurno: function(val) {
        document.getElementById('inp-turno-val').value = val;
        document.getElementById('inp-turno-text').innerText = val;
        document.getElementById('turno-list').classList.remove('show');
        this.updateInputState(val);
    },

    updateInputState: function(turnoType) {
        const inputsPrepay = document.querySelectorAll('.inp-prepay');
        const inputsServito = document.querySelectorAll('.inp-servito');
        const inputsFdt = document.querySelectorAll('.inp-fdt');

        [...inputsPrepay, ...inputsServito, ...inputsFdt].forEach(i => {
            i.disabled = false;
            i.style.opacity = '1';
            i.style.backgroundColor = 'var(--bg-app)';
        });

        if (turnoType === 'Notte' || turnoType === 'Pausa' || turnoType === 'Weekend') {
            [...inputsServito, ...inputsFdt].forEach(i => {
                i.disabled = true;
                i.style.opacity = '0.5';
                i.style.backgroundColor = 'var(--border-color)';
                i.value = '';
            });
        } else if (turnoType === 'Mattina' || turnoType === 'Pomeriggio') {
            inputsPrepay.forEach(i => {
                i.disabled = true;
                i.style.opacity = '0.5';
                i.style.backgroundColor = 'var(--border-color)';
                i.value = '';
            });
        }
    },

    saveTurno: function() {
        const date = document.getElementById('inp-date').value;
        const turno = document.getElementById('inp-turno-val').value;
        if (!date) {
            showNotification("Inserisci una data", 'error');
            return;
        }

        const prepay = {},
            servito = {},
            fdt = {};
        
        this.products.forEach(p => {
            const pid = p.id;
            // Selettori sicuri: se l'input non esiste (es. AdBlue Fdt/Prepay), restituisce null
            const inpPrepay = document.querySelector(`.inp-prepay[data-prod="${pid}"]`);
            const inpServito = document.querySelector(`.inp-servito[data-prod="${pid}"]`);
            const inpFdt = document.querySelector(`.inp-fdt[data-prod="${pid}"]`);

            // Se l'input esiste leggo il valore, altrimenti 0
            prepay[pid] = inpPrepay ? (parseFloat(inpPrepay.value) || 0) : 0;
            servito[pid] = inpServito ? (parseFloat(inpServito.value) || 0) : 0;
            fdt[pid] = inpFdt ? (parseFloat(inpFdt.value) || 0) : 0;
        });

        const allTurni = this.getTurni();
        const newEntry = {
            id: this.editingId || Date.now().toString(),
            date: new Date(date).toISOString(),
            turno: turno,
            prepay,
            servito,
            fdt
        };

        if (this.editingId) {
            const idx = allTurni.findIndex(t => t.id === this.editingId);
            if (idx !== -1) allTurni[idx] = newEntry;
            showNotification("Turno aggiornato", 'success');
        } else {
            allTurni.push(newEntry);
            showNotification("Turno salvato", 'success');
        }

        localStorage.setItem('polaris_turni', JSON.stringify(allTurni));
        this.closeModal();
        this.render();
    },

    attachMainListeners: function() {
        document.getElementById('btn-new-turno').addEventListener('click', () => this.openTurnoModal());
        document.getElementById('btn-vs-export').addEventListener('click', () => this.exportData());
        const fileInp = document.getElementById('import-vs-input');
        document.getElementById('btn-vs-import').addEventListener('click', () => fileInp.click());
        fileInp.addEventListener('change', (e) => this.importData(e));
        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');
        if (btnPrev) btnPrev.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.render();
            }
        });
        if (btnNext) btnNext.addEventListener('click', () => {
            const tot = this.getFilteredTurni().length;
            if (this.currentPage * this.ITEMS_PER_PAGE < tot) {
                this.currentPage++;
                this.render();
            }
        });
    },

    exportData: function() {
        try {
            const data = this.getTurni();
            const a = document.createElement('a');
            a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
            a.download = "polaris_virtualstation.json";
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            showNotification("Errore Export", 'error');
        }
    },

    getTurni: function() {
        try {
            return JSON.parse(localStorage.getItem('polaris_turni') || '[]');
        } catch (e) {
            return [];
        }
    },

    getFilteredTurni: function() {
        const all = this.getTurni();
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

        return all.filter(t => {
            const d = new Date(t.date);
            const dTime = d.getTime();
            if (this.currentFilter === 'today') return dTime >= startOfDay;
            if (this.currentFilter === 'year') return dTime >= startOfYear;
            if (this.currentFilter.startsWith('month-')) {
                const mIdx = parseInt(this.currentFilter.split('-')[1]);
                return d.getFullYear() === now.getFullYear() && d.getMonth() === mIdx;
            }
            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    setFilter: function(filter) {
        this.currentFilter = filter;
        this.currentPage = 1;
        this.render();
    },

    calculateStats: function(turni) {
        let liters = 0,
            revenue = 0,
            servitoLiters = 0;
        const priceHistory = JSON.parse(localStorage.getItem('polaris_price_history') || '[]');
        priceHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        const SUR_SELF = 0.005,
            SUR_SERV = 0.225;

        turni.forEach(t => {
            const tDate = new Date(t.date);
            const pObj = priceHistory.find(p => new Date(p.date) <= tDate) || priceHistory[priceHistory.length - 1];
            const prices = pObj ? pObj.prices : {
                benzina: { base: 0 },
                gasolio: { base: 0 },
                dieselplus: { base: 0 },
                hvo: { base: 0 },
                adblue: { base: 0 }
            };

            this.products.forEach(p => {
                const k = p.id;
                const pp = parseFloat(t.prepay?.[k] || 0);
                const sv = parseFloat(t.servito?.[k] || 0);
                const fd = parseFloat(t.fdt?.[k] || 0);
                const tot = pp + sv + fd;

                liters += tot;
                servitoLiters += sv;

                const base = parseFloat(prices[k]?.base || 0);
                if (base > 0) {
                    if (k === 'adblue') revenue += tot * base;
                    else {
                        revenue += (pp + fd) * (base + SUR_SELF);
                        revenue += sv * (base + SUR_SERV);
                    }
                }
            });
        });

        return {
            liters: Math.round(liters),
            revenue,
            servitoPerc: liters > 0 ? ((servitoLiters / liters) * 100).toFixed(1) : 0
        };
    },

    renderTable: function(turni) {
        if (turni.length === 0) return '<p class="placeholder-message">Nessun turno trovato per il periodo.</p>';
        const start = (this.currentPage - 1) * this.ITEMS_PER_PAGE;
        const end = start + this.ITEMS_PER_PAGE;
        const pageItems = turni.slice(start, end);

        let html = `<table class="table-prices"><thead><tr><th>Data</th><th>Turno</th><th class="text-gasolio">Gasolio</th><th class="text-dieselplus">Diesel+</th><th class="text-adblue">AdBlue</th><th class="text-benzina">Benzina</th><th class="text-hvolution">HVO</th><th>Totale L.</th><th>Azioni</th></tr></thead><tbody>`;

        pageItems.forEach(t => {
            const d = new Date(t.date).toLocaleDateString();
            const sum = (k) => (parseFloat(t.prepay?.[k] || 0) + parseFloat(t.servito?.[k] || 0) + parseFloat(t.fdt?.[k] || 0));
            const bz = sum('benzina'),
                gs = sum('gasolio'),
                dp = sum('dieselplus'),
                hv = sum('hvolution'),
                ad = sum('adblue');
            const tot = bz + gs + dp + hv + ad;

            html += `
            <tr style="border-bottom: 1px dashed var(--border-color);">
                <td style="padding: 12px; font-weight:500;">${d}</td>
                <td style="padding: 12px;">${t.turno}</td>
                <td style="padding: 12px;">${Math.round(gs)}</td>
                <td style="padding: 12px;">${Math.round(dp)}</td>
                <td style="padding: 12px;">${Math.round(ad)}</td>
                <td style="padding: 12px;">${Math.round(bz)}</td>
                <td style="padding: 12px;">${Math.round(hv)}</td>
                <td style="padding: 12px; font-weight:bold;">${Math.round(tot)}</td>
                <td style="padding: 12px; text-align: right;">
                    <button class="icon-btn btn-edit" onclick="VirtualStationModule.openTurnoModal('${t.id}')" title="Modifica"><i data-lucide="pencil" style="width:16px;"></i></button>
                    <button class="icon-btn btn-delete" onclick="VirtualStationModule.deleteTurno('${t.id}')" title="Elimina"><i data-lucide="trash-2" style="width:16px;"></i></button>
                </td>
            </tr>`;
        });

        html += '</tbody></table>';
        return html;
    },

    renderPagination: function(totalItems) {
        if (totalItems <= this.ITEMS_PER_PAGE) return '';
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid var(--border-color);">
                <span style="font-size: 0.9rem; color: var(--text-secondary);">Pagina ${this.currentPage} di ${Math.ceil(totalItems / this.ITEMS_PER_PAGE)}</span>
                <div style="display: flex; gap: 10px;">
                    <button id="btn-prev" class="icon-btn"><i data-lucide="chevron-left"></i></button>
                    <button id="btn-next" class="icon-btn"><i data-lucide="chevron-right"></i></button>
                </div>
            </div>`;
    },

    renderCharts: function(turni) {
        const ctxMode = document.getElementById('chartMode');
        if (ctxMode) {
            let iperself = 0,
                servito = 0,
                fdt = 0,
                prepay = 0;
            turni.forEach(t => {
                this.products.forEach(p => {
                    prepay += parseFloat(t.prepay?.[p.id] || 0);
                    servito += parseFloat(t.servito?.[p.id] || 0);
                    fdt += parseFloat(t.fdt?.[p.id] || 0);
                });
            });
            iperself = prepay;

            new Chart(ctxMode, {
                type: 'doughnut',
                data: {
                    labels: ['Iperself', 'Servito', 'Fai Da Te'],
                    datasets: [{
                        data: [iperself, servito, fdt],
                        backgroundColor: ['#6AD2FF', '#4318FF', '#b1e426'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 40,
                                boxHeight: 12,
                                useBorderRadius: true,
                                borderRadius: 20
                            }
                        }
                    }
                }
            });
        }

        const ctxProd = document.getElementById('chartProducts');
        if (ctxProd) {
            const data = this.products.map(p => turni.reduce((acc, t) => acc + (parseFloat(t.prepay?.[p.id] || 0) + parseFloat(t.servito?.[p.id] || 0) + parseFloat(t.fdt?.[p.id] || 0)), 0));
            const bgColors = ['rgba(255, 104, 0, 0.6)', 'rgba(255, 0, 56, 0.6)', 'rgba(72, 31, 255, 0.6)', 'rgba(34, 197, 94, 0.6)', 'rgba(0, 203, 237, 0.6)'];

            new Chart(ctxProd, {
                type: 'bar',
                data: {
                    labels: this.products.map(p => p.label),
                    datasets: [{
                        label: 'Litri',
                        data: data,
                        backgroundColor: bgColors,
                        borderWidth: 0,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                borderDash: [5, 5]
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        const ctxTrend = document.getElementById('chartTrend');
        if (ctxTrend) {
            const currentYear = new Date().getFullYear();
            const monthly = Array(12).fill(0);
            const allTurni = this.getTurni().filter(t => new Date(t.date).getFullYear() === currentYear);

            allTurni.forEach(t => {
                const m = new Date(t.date).getMonth();
                let tot = 0;
                this.products.forEach(p => {
                    tot += (parseFloat(t.prepay?.[p.id] || 0) + parseFloat(t.servito?.[p.id] || 0) + parseFloat(t.fdt?.[p.id] || 0));
                });
                monthly[m] += tot;
            });

            new Chart(ctxTrend, {
                type: 'line',
                data: {
                    labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
                    datasets: [{
                        label: 'Vendite Mensili',
                        data: monthly,
                        borderColor: '#4318FF',
                        backgroundColor: 'rgba(67, 24, 255, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 40,
                                boxHeight: 12,
                                useBorderRadius: true,
                                borderRadius: 20
                            }
                        }
                    },
                    scales: {
                        y: {
                            grid: {
                                borderDash: [5, 5]
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    },

    setupModalListeners: function() {
        const cb = document.getElementById('modal-close');
        if (cb) cb.addEventListener('click', () => this.closeModal());
    },

    openModal: function(title, bodyHTML, footerHTML, maxWidth = '600px') {
        const modal = document.getElementById('modal-overlay');
        const modalBox = document.querySelector('.modal-box');
        const modalBody = document.getElementById('modal-body');
        document.getElementById('modal-title').innerText = title;
        modalBody.innerHTML = bodyHTML;
        modalBox.style.maxWidth = maxWidth;

        const oldF = modalBox.querySelector('.modal-footer');
        if (oldF) oldF.remove();

        if (footerHTML) {
            const f = document.createElement('div');
            f.className = 'modal-footer';
            f.innerHTML = footerHTML;
            modalBox.appendChild(f);
        }
        modal.classList.remove('hidden');
        lucide.createIcons();
    },

    closeModal: function() {
        document.getElementById('modal-overlay').classList.add('hidden');
        this.editingId = null;
    }
};
/* FINE MODULO VIRTUAL STATION */
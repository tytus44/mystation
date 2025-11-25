/* INIZIO MODULO REGISTRO CARICO */
const CaricoModule = {
    ITEMS_PER_PAGE: 10,
    currentPage: 1,
    editingId: null,

    products: [
        { id: 'benzina', label: 'Benzina', color: 'var(--col-benzina)' },
        { id: 'gasolio', label: 'Gasolio', color: 'var(--col-gasolio)' },
        { id: 'dieselplus', label: 'Diesel+', color: 'var(--col-dieselplus)' },
        { id: 'hvolution', label: 'Hvolution', color: 'var(--col-hvolution)' }
    ],

    init: function() {
        this.currentPage = 1;
        this.render();
        this.setupModalListeners();

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.datepicker-container')) {
                document.querySelectorAll('.datepicker-wrapper.show').forEach(d => d.classList.remove('show'));
            }
        });
    },

    render: function() {
        const container = document.getElementById('carico-content');
        if (!container) return;

        const entries = this.getEntries();
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));

        const summary = this.calculateAnnualSummary(entries);
        const stats = this.calculateTopStats(entries);

        container.innerHTML = `
            <div class="toolbar-container">
                <div class="toolbar-group">
                    <input type="file" id="import-carico-input" style="display: none;" accept=".json">
                    <button id="btn-carico-import" class="action-btn">Importa</button>
                    <button id="btn-carico-export" class="action-btn">Esporta</button>
                </div>
                <div class="toolbar-group">
                    <button id="btn-new-carico" class="action-btn">Nuovo Carico</button>
                </div>
            </div>

            <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); margin-bottom: 24px;">
                <div class="card">
                    <div class="card-header"><span class="card-title">Totale Litri ${new Date().getFullYear()}</span><i data-lucide="droplets"></i></div>
                    <div class="card-body">
                        <h2 style="color: var(--primary-color); font-size: 2rem; font-weight: 700;">${stats.totalLiters.toLocaleString('it-IT')}</h2>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Litri scaricati anno corrente</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title">Top Prodotto</span><i data-lucide="fuel"></i></div>
                    <div class="card-body">
                        <h2 style="color: ${stats.topProductColor}; font-size: 2rem; font-weight: 700;">${stats.topProduct}</h2>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Prodotto più scaricato</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title">Autista Top</span><i data-lucide="user"></i></div>
                    <div class="card-body">
                        <h2 style="color: var(--text-main); font-size: 1.8rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${stats.topDriver}</h2>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Autista più frequente</p>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header"><span class="card-title">Dettaglio Annuale</span><i data-lucide="bar-chart-3"></i></div>
                <div class="card-body">
                    <div style="overflow-x: auto;">
                        <table class="table-prices">
                            <thead><tr><th>Prodotto</th><th>Carico Tot.</th><th class="text-success">Diff (+)</th><th class="text-danger">Diff (-)</th><th>Giacenza Anno Prec.</th><th>Chiusura Contabile</th></tr></thead>
                            <tbody>${this.renderSummaryRows(summary)}</tbody>
                            <tfoot><tr style="font-weight: 700; background-color: var(--bg-app);"><td style="padding: 12px;">TOTALE</td><td style="padding: 12px;">${summary.total.carico.toLocaleString()}</td><td style="padding: 12px;" class="text-success">${summary.total.pos.toLocaleString()}</td><td style="padding: 12px;" class="text-danger">${summary.total.neg.toLocaleString()}</td><td style="padding: 12px;">-</td><td style="padding: 12px;">${summary.total.chiusura.toLocaleString()}</td></tr></tfoot>
                        </table>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><span class="card-title">Registro Carichi</span><i data-lucide="truck"></i></div>
                <div class="card-body">
                    <div style="overflow-x: auto;">${this.renderTable(entries)}</div>
                    ${this.renderPagination(entries.length)}
                </div>
            </div>
        `;

        lucide.createIcons();
        this.attachMainListeners();
        
        document.querySelectorAll('.inp-prev-year').forEach(input => {
            input.addEventListener('change', (e) => this.updatePrevYearStock(e.target.dataset.prod, e.target.value));
        });
    },

    // --- MODALE INSERIMENTO (CON STEPPER) ---
    openModalCarico: function(idToEdit = null) {
        this.editingId = idToEdit;
        let title = idToEdit ? "Modifica Carico" : "Nuovo Carico";
        let btnText = idToEdit ? "AGGIORNA" : "SALVA";

        let ex = idToEdit ? this.getEntries().find(e => e.id === idToEdit) : null;
        let dateVal = ex ? ex.date.split('T')[0] : new Date().toISOString().split('T')[0];
        let driverVal = ex ? ex.driver : '';

        const bodyHTML = `
            <form id="form-carico">
                <div class="price-input-grid" style="margin-bottom: 20px;">
                    <div>
                        <label>Data Carico</label>
                        <div class="datepicker-container" style="position: relative;">
                            <input type="date" id="inp-date" value="${dateVal}" class="nav-link no-icon" style="position:absolute; opacity:0; pointer-events:none;">
                            <button type="button" id="date-trigger" class="dropdown-trigger" onclick="CaricoModule.toggleDatepicker(event)">
                                <span id="date-display">${this.formatDateIT(dateVal)}</span>
                                <i data-lucide="calendar" style="width:16px;"></i>
                            </button>
                            <div id="custom-datepicker" class="datepicker-wrapper"></div>
                        </div>
                    </div>
                    <div>
                        <label>Autista</label>
                        <input type="text" id="inp-driver" class="nav-link" placeholder="Nome Autista" style="width:100%; border:1px solid var(--border-color); border-radius:var(--radius-input);" value="${driverVal}">
                    </div>
                </div>

                <div id="inputs-container">
                    <div style="display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 15px; margin-bottom: 10px; text-align: center; font-size: 0.8rem; color: var(--text-secondary); font-weight: 600;">
                        <div style="text-align: left;">PRODOTTO</div>
                        <div>QUANTITÀ (Step 1000)</div>
                        <div>DIFF (+/-)</div>
                    </div>
                    
                    ${this.products.map(p => `
                        <div class="input-row" data-prod="${p.id}" style="display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 15px; margin-bottom: 15px; align-items: center;">
                            <div style="font-weight: 600; color: ${p.color};">${p.label}</div>
                            
                            <div class="input-stepper">
                                <button type="button" class="step-btn minus" data-target="qty" data-step="1000"><i data-lucide="minus" style="width:14px;"></i></button>
                                <input type="number" class="stepper-input inp-qty" placeholder="0">
                                <button type="button" class="step-btn plus" data-target="qty" data-step="1000"><i data-lucide="plus" style="width:14px;"></i></button>
                            </div>
                            
                            <div class="input-stepper">
                                <button type="button" class="step-btn minus" data-target="diff" data-step="1"><i data-lucide="minus" style="width:14px;"></i></button>
                                <input type="number" class="stepper-input inp-diff" placeholder="0">
                                <button type="button" class="step-btn plus" data-target="diff" data-step="1"><i data-lucide="plus" style="width:14px;"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </form>
        `;

        const footerHTML = `
            <div class="btn-group">
                <button type="button" id="btn-cancel-carico" class="action-btn btn-cancel">ANNULLA</button>
                <button type="button" id="btn-save-carico" class="action-btn btn-save">${btnText}</button>
            </div>
        `;

        this.openModal(title, bodyHTML, footerHTML);

        if (ex) {
            const form = document.getElementById('form-carico');
            this.products.forEach(p => {
                const pid = p.id;
                const row = form.querySelector(`.input-row[data-prod="${pid}"]`);
                if(row) {
                    const data = ex[pid] || { carico: 0, diff: 0 };
                    row.querySelector('.inp-qty').value = data.carico !== 0 ? data.carico : '';
                    row.querySelector('.inp-diff').value = data.diff !== 0 ? data.diff : '';
                }
            });
        }

        // Attiva i listener per i pulsanti +/- e salvataggio
        setTimeout(() => {
            this.setupStepperListeners();
            document.getElementById('btn-save-carico').addEventListener('click', () => this.saveEntry());
            document.getElementById('btn-cancel-carico').addEventListener('click', () => this.closeModal());
        }, 0);
    },

    // NUOVA FUNZIONE: Gestisce la logica dei pulsanti +/-
    setupStepperListeners: function() {
        const buttons = document.querySelectorAll('.step-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Trova l'input fratello
                const wrapper = btn.closest('.input-stepper');
                const input = wrapper.querySelector('input');
                
                // Leggi step e direzione
                const step = parseInt(btn.dataset.step);
                const isPlus = btn.classList.contains('plus');
                
                let currentVal = parseFloat(input.value) || 0;
                
                if (isPlus) {
                    currentVal += step;
                } else {
                    currentVal -= step;
                }
                
                input.value = currentVal;
            });
        });
    },

    // --- DATI E CALCOLI ---
    normalizeEntry: function(e) {
        const normalizeProd = (p) => {
            const data = p || { carico: 0, diff: 0 };
            return {
                carico: parseFloat(data.carico) || 0,
                diff: parseFloat(data.diff !== undefined ? data.diff : (data.differenza || 0))
            };
        };
        return {
            id: e.id || Date.now().toString(),
            date: e.date,
            driver: e.driver || e.autistaName || '',
            benzina: normalizeProd(e.benzina),
            gasolio: normalizeProd(e.gasolio),
            dieselplus: normalizeProd(e.dieselplus || e.dieselPlus),
            hvolution: normalizeProd(e.hvolution)
        };
    },

    getEntries: function() {
        try { 
            const raw = JSON.parse(localStorage.getItem('polaris_registro_carico') || '[]'); 
            return raw.map(e => this.normalizeEntry(e));
        } catch (e) { return []; }
    },
    getPrevStock: function() { try { return JSON.parse(localStorage.getItem('polaris_registro_stock_prev') || '{}'); } catch (e) { return {}; } },

    calculateTopStats: function(entries) {
        const currentYear = new Date().getFullYear();
        const yearEntries = entries.filter(e => new Date(e.date).getFullYear() === currentYear);
        let totalLiters = 0;
        const prodCounts = {}; 
        const driverCounts = {};
        yearEntries.forEach(e => {
            if (e.driver) driverCounts[e.driver] = (driverCounts[e.driver] || 0) + 1;
            this.products.forEach(p => {
                const pid = p.id;
                const qty = e[pid]?.carico || 0;
                totalLiters += qty;
                if (qty > 0) prodCounts[pid] = (prodCounts[pid] || 0) + qty;
            });
        });
        const topDriver = Object.keys(driverCounts).reduce((a, b) => driverCounts[a] > driverCounts[b] ? a : b, 'N/D');
        const topProdId = Object.keys(prodCounts).reduce((a, b) => prodCounts[a] > prodCounts[b] ? a : b, null);
        let topProductLabel = 'N/D';
        let topProductColor = 'var(--text-main)';
        if (topProdId) {
            const prodObj = this.products.find(p => p.id === topProdId);
            if (prodObj) { topProductLabel = prodObj.label; topProductColor = prodObj.color; }
        }
        return { totalLiters, topProduct: topProductLabel, topProductColor, topDriver };
    },
    calculateAnnualSummary: function(entries) {
        const currentYear = new Date().getFullYear();
        const summary = {
            benzina: { carico: 0, pos: 0, neg: 0 },
            gasolio: { carico: 0, pos: 0, neg: 0 },
            dieselplus: { carico: 0, pos: 0, neg: 0 },
            hvolution: { carico: 0, pos: 0, neg: 0 },
            total: { carico: 0, pos: 0, neg: 0, chiusura: 0 }
        };
        const prevStock = this.getPrevStock();
        const yearEntries = entries.filter(e => new Date(e.date).getFullYear() === currentYear);
        yearEntries.forEach(e => {
            this.products.forEach(p => {
                const pid = p.id;
                const item = e[pid];
                const carico = parseFloat(item?.carico || 0);
                const diff = parseFloat(item?.diff || 0);
                summary[pid].carico += carico;
                if (diff > 0) summary[pid].pos += diff; else summary[pid].neg += diff;
            });
        });
        this.products.forEach(p => {
            const pid = p.id;
            const s = summary[pid];
            s.chiusura = s.carico + s.pos + s.neg + (parseFloat(prevStock[pid]) || 0);
            summary.total.carico += s.carico; summary.total.pos += s.pos; summary.total.neg += s.neg; summary.total.chiusura += s.chiusura;
        });
        return summary;
    },
    updatePrevYearStock: function(prod, value) {
        const stock = this.getPrevStock();
        stock[prod] = parseFloat(value) || 0;
        localStorage.setItem('polaris_registro_stock_prev', JSON.stringify(stock));
        this.render();
    },

    // --- TABELLE ---
    renderSummaryRows: function(summary) {
        const prevStock = this.getPrevStock();
        return this.products.map(p => {
            const pid = p.id;
            const s = summary[pid];
            const stockVal = prevStock[pid] || 0;
            return `<tr style="border-bottom: 1px dashed var(--border-color);"><td style="padding: 12px; font-weight: 600; color: ${p.color};">${p.label}</td><td style="padding: 12px;">${s.carico.toLocaleString()}</td><td style="padding: 12px;" class="text-success">${s.pos > 0 ? '+' + s.pos : '-'}</td><td style="padding: 12px;" class="text-danger">${s.neg < 0 ? s.neg : '-'}</td><td style="padding: 12px;"><input type="number" class="nav-link inp-prev-year" data-prod="${pid}" value="${stockVal}" style="width: 100px; border: 1px solid var(--border-color); padding: 5px; border-radius: 8px;" placeholder="0"></td><td style="padding: 12px; font-weight: bold;">${s.chiusura.toLocaleString()}</td></tr>`;
        }).join('');
    },
    renderTable: function(entries) {
        if (entries.length === 0) return '<p class="placeholder-message">Nessun carico registrato.</p>';
        const start = (this.currentPage - 1) * this.ITEMS_PER_PAGE;
        const end = start + this.ITEMS_PER_PAGE;
        const pageItems = entries.slice(start, end);
        const fmtCell = (obj) => {
            const c = parseFloat(obj?.carico || 0);
            const d = parseFloat(obj?.diff || 0);
            if (c === 0 && d === 0) return '-';
            let diffHtml = '';
            if (d !== 0) {
                const colorClass = d > 0 ? 'text-success' : 'text-danger';
                const sign = d > 0 ? '+' : '';
                diffHtml = `<span class="${colorClass}" style="font-size: 0.85em; margin-left: 5px;">(${sign}${d})</span>`;
            }
            return `<div style="display:flex; align-items:center;"><span>${c}</span>${diffHtml}</div>`;
        };
        let html = `<table class="table-prices"><thead><tr><th>Data</th><th>Autista</th><th class="text-benzina">Benzina</th><th class="text-gasolio">Gasolio</th><th class="text-dieselplus">Diesel+</th><th class="text-hvolution">Hvolution</th><th>Azioni</th></tr></thead><tbody>`;
        pageItems.forEach(e => {
            const d = new Date(e.date).toLocaleDateString();
            html += `<tr style="border-bottom: 1px dashed var(--border-color);"><td style="padding: 12px; font-weight: 500;">${d}</td><td style="padding: 12px; color: var(--text-secondary); font-size: 0.9em;">${e.driver || '-'}</td><td style="padding: 12px;">${fmtCell(e.benzina)}</td><td style="padding: 12px;">${fmtCell(e.gasolio)}</td><td style="padding: 12px;">${fmtCell(e.dieselplus)}</td><td style="padding: 12px;">${fmtCell(e.hvolution)}</td><td style="padding: 12px; text-align: right;"><button class="icon-btn btn-edit" onclick="CaricoModule.openModalCarico('${e.id}')" title="Modifica"><i data-lucide="pencil" style="width:16px;"></i></button><button class="icon-btn btn-delete" onclick="CaricoModule.deleteEntry('${e.id}')" title="Elimina"><i data-lucide="trash-2" style="width:16px;"></i></button></td></tr>`;
        });
        html += '</tbody></table>';
        return html;
    },
    renderPagination: function(totalItems) {
        if (totalItems <= this.ITEMS_PER_PAGE) return '';
        return `<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid var(--border-color);"><span style="font-size: 0.9rem; color: var(--text-secondary);">Pagina ${this.currentPage} di ${Math.ceil(totalItems / this.ITEMS_PER_PAGE)}</span><div style="display: flex; gap: 10px;"><button id="btn-prev" class="icon-btn"><i data-lucide="chevron-left"></i></button><button id="btn-next" class="icon-btn"><i data-lucide="chevron-right"></i></button></div></div>`;
    },

    // --- SALVATAGGIO & ELIMINAZIONE ---
    saveEntry: function() {
        const date = document.getElementById('inp-date').value;
        const driver = document.getElementById('inp-driver').value;
        if (!date) { showNotification("Data obbligatoria", 'error'); return; }
        const entryData = { id: this.editingId || Date.now().toString(), date: new Date(date).toISOString(), driver: driver };
        let hasData = false;
        const form = document.getElementById('form-carico');
        this.products.forEach(p => {
            const pid = p.id;
            const row = form.querySelector(`.input-row[data-prod="${pid}"]`);
            const qty = parseFloat(row.querySelector('.inp-qty').value) || 0;
            const diff = parseFloat(row.querySelector('.inp-diff').value) || 0;
            entryData[pid] = { carico: qty, diff: diff };
            if (qty !== 0 || diff !== 0) hasData = true;
        });
        if (!hasData) { showNotification("Inserisci almeno un valore", 'error'); return; }
        const entries = this.getEntries();
        if (this.editingId) { const idx = entries.findIndex(e => e.id === this.editingId); if (idx !== -1) entries[idx] = entryData; showNotification("Carico aggiornato", 'success'); } 
        else { entries.push(entryData); showNotification("Carico salvato", 'success'); }
        localStorage.setItem('polaris_registro_carico', JSON.stringify(entries));
        this.closeModal(); this.render();
    },
    deleteEntry: function(id) { if (!confirm("Eliminare questo carico?")) return; const entries = this.getEntries().filter(e => e.id !== id); localStorage.setItem('polaris_registro_carico', JSON.stringify(entries)); showNotification("Carico eliminato", 'info'); this.render(); },

    // --- UTILS & LISTENERS ---
    attachMainListeners: function() {
        document.getElementById('btn-new-carico').addEventListener('click', () => this.openModalCarico());
        document.getElementById('btn-carico-export').addEventListener('click', () => this.exportData());
        const fi = document.getElementById('import-carico-input');
        document.getElementById('btn-carico-import').addEventListener('click', () => fi.click());
        fi.addEventListener('change', (e) => this.importData(e));
        const btnPrev = document.getElementById('btn-prev'); const btnNext = document.getElementById('btn-next');
        if (btnPrev) btnPrev.addEventListener('click', () => { if (this.currentPage > 1) { this.currentPage--; this.render(); } });
        if (btnNext) btnNext.addEventListener('click', () => { const tot = this.getEntries().length; if (this.currentPage * this.ITEMS_PER_PAGE < tot) { this.currentPage++; this.render(); } });
    },
    exportData: function() { try { const data = { entries: this.getEntries(), prevStock: this.getPrevStock() }; const a = document.createElement('a'); a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2)); a.download = "polaris_carico.json"; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { showNotification("Errore Export", 'error'); } },
    importData: function(e) { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => { try { const json = JSON.parse(ev.target.result); const entries = json.entries || (Array.isArray(json) ? json : (json.registryEntries || [])).map(ent => this.normalizeEntry(ent)); const stock = json.prevStock || (json.previousYearStock || {}); if (confirm(`Trovati ${entries.length} carichi. Sovrascrivere?`)) { localStorage.setItem('polaris_registro_carico', JSON.stringify(entries)); localStorage.setItem('polaris_registro_stock_prev', JSON.stringify(stock)); showNotification("Importazione riuscita", 'success'); this.render(); } } catch (err) { console.error(err); showNotification("File non valido", 'error'); } }; r.readAsText(f); },
    
    // --- DATEPICKER ---
    toggleDatepicker: function(e) { e.stopPropagation(); const w = document.getElementById('custom-datepicker'); if (w.classList.contains('show')) { w.classList.remove('show'); return; } document.querySelectorAll('.show').forEach(el => el.classList.remove('show')); w.classList.add('show'); const curDate = new Date(document.getElementById('inp-date').value); this.renderCalendar(curDate.getFullYear(), curDate.getMonth()); },
    renderCalendar: function(y, m) { const w = document.getElementById('custom-datepicker'); const ms = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']; const ds = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom']; const fd = new Date(y, m, 1).getDay(); const afd = fd === 0 ? 6 : fd - 1; const dim = new Date(y, m+1, 0).getDate(); let html = `<div class="datepicker-header"><button type="button" class="datepicker-nav" onclick="CaricoModule.changeMonth(${m-1}, ${y}); event.stopPropagation();"><i data-lucide="chevron-left" style="width:16px;"></i></button><div class="datepicker-title">${ms[m]} ${y}</div><button type="button" class="datepicker-nav" onclick="CaricoModule.changeMonth(${m+1}, ${y}); event.stopPropagation();"><i data-lucide="chevron-right" style="width:16px;"></i></button></div><div class="datepicker-grid">${ds.map(d=>`<div class="datepicker-day-label">${d}</div>`).join('')}`; for(let i=0; i<afd; i++) html+=`<div class="datepicker-day empty"></div>`; const sd = new Date(document.getElementById('inp-date').value); const today = new Date(); for(let i=1; i<=dim; i++) { let cls = 'datepicker-day'; if(i===today.getDate() && m===today.getMonth() && y===today.getFullYear()) cls+=' today'; if(i===sd.getDate() && m===sd.getMonth() && y===sd.getFullYear()) cls+=' selected'; html+=`<div class="${cls}" onclick="CaricoModule.selectDate(${y},${m},${i}); event.stopPropagation();">${i}</div>`; } html+='</div>'; w.innerHTML = html; lucide.createIcons(); },
    changeMonth: function(m, y) { if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; } this.renderCalendar(y, m); },
    selectDate: function(y,m,d) { const fmt=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; document.getElementById('inp-date').value = fmt; document.getElementById('date-display').innerText = this.formatDateIT(fmt); document.getElementById('custom-datepicker').classList.remove('show'); },
    formatDateIT: function(iso) { if(!iso) return ''; const d=new Date(iso); return d.toLocaleDateString('it-IT',{day:'2-digit',month:'long',year:'numeric'}); },

    setupModalListeners: function() { const cb = document.getElementById('modal-close'); if (cb) cb.addEventListener('click', () => this.closeModal()); },
    openModal: function(title, bodyHTML, footerHTML) { const m = document.getElementById('modal-overlay'); const mb = document.querySelector('.modal-box'); const bdy = document.getElementById('modal-body'); document.getElementById('modal-title').innerText = title; bdy.innerHTML = bodyHTML; const of = mb.querySelector('.modal-footer'); if (of) of.remove(); if (footerHTML) { const f = document.createElement('div'); f.className = 'modal-footer'; f.innerHTML = footerHTML; mb.appendChild(f); } m.classList.remove('hidden'); lucide.createIcons(); },
    closeModal: function() { document.getElementById('modal-overlay').classList.add('hidden'); this.editingId = null; }
};
/* FINE MODULO REGISTRO CARICO */

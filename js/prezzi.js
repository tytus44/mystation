/* INIZIO MODULO PREZZI */
const PrezziModule = {
    // Configurazioni
    SURCHARGE_SELF: 0.005,
    SURCHARGE_SERVED: 0.220,
    ITEMS_PER_PAGE: 10,
    
    // Stato interno
    chartInstance: null,
    currentPage: 1,
    editingId: null,

    init: function() {
        this.currentPage = 1;
        this.render();
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.datepicker-container')) {
                const w = document.getElementById('custom-datepicker-prezzi');
                if (w && w.classList.contains('show')) w.classList.remove('show');
            }
        });
    },

    // 1. RENDER DASHBOARD
    render: function() {
        const container = document.getElementById('prezzi-content');
        if (!container) return;

        const currentPrice = this.getLastPrice();
        const competitors = this.getCompetitors();
        const history = this.getPriceHistory().sort((a, b) => new Date(b.date) - new Date(a.date));

        // Date per i footer
        const listinoDate = currentPrice ? new Date(currentPrice.date).toLocaleDateString() : '-';
        const compDate = competitors ? new Date(competitors.date).toLocaleDateString() : '-';

        container.innerHTML = `
            <div class="toolbar-container">
                <div class="toolbar-group">
                    <input type="file" id="import-file-input" style="display: none;" accept=".json">
                    <button id="btn-import" class="action-btn">Importa</button>
                    <button id="btn-export" class="action-btn">Esporta</button>
                </div>
                <div class="toolbar-group">
                    <button id="btn-open-listino" class="action-btn">Nuovo Listino</button>
                    <button id="btn-open-competitor" class="action-btn">Concorrenza</button>
                </div>
            </div>

            <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); margin-bottom: 24px;">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Listino in Vigore</span>
                        <i data-lucide="tag"></i>
                    </div>
                    <div class="card-body">
                        ${this.renderCurrentPricesTable(currentPrice)}
                        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 10px; text-align: right;">
                            Ultimo listino: ${listinoDate}
                        </p>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Concorrenza</span>
                        <i data-lucide="crosshair"></i>
                    </div>
                    <div class="card-body">
                        ${this.renderCompetitorTable(competitors, currentPrice)}
                        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 10px; text-align: right;">
                            Ultima rilevazione: ${compDate}
                        </p>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header">
                    <span class="card-title">Andamento Prezzi Mensile (${new Date().getFullYear()})</span>
                    <i data-lucide="trending-up"></i>
                </div>
                <div class="card-body">
                    <div style="height: 350px; position: relative; width: 100%;">
                        <canvas id="prezziChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">Storico Listini</span>
                    <i data-lucide="history"></i>
                </div>
                
                <div class="card-body">
                    <div style="overflow-x: auto;">
                        ${this.renderHistoryTable(history)}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid var(--border-color);">
                        <span style="font-size: 0.9rem; color: var(--text-secondary);">
                            Pagina ${this.currentPage} di ${Math.max(1, Math.ceil(history.length / this.ITEMS_PER_PAGE))}
                        </span>
                        <div style="display: flex; gap: 10px;">
                            <button id="btn-prev-page" class="icon-btn" ${this.currentPage === 1 ? 'disabled style="opacity:0.5;"' : ''}>
                                <i data-lucide="chevron-left"></i>
                            </button>
                            <button id="btn-next-page" class="icon-btn" ${this.currentPage * this.ITEMS_PER_PAGE >= history.length ? 'disabled style="opacity:0.5;"' : ''}>
                                <i data-lucide="chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();
        this.renderChart();

        document.getElementById('btn-open-listino').addEventListener('click', () => this.openNewListinoModal());
        document.getElementById('btn-open-competitor').addEventListener('click', () => this.openCompetitorModal());
        document.getElementById('btn-export').addEventListener('click', () => this.exportData());
        
        const fileInput = document.getElementById('import-file-input');
        document.getElementById('btn-import').addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.importData(e));

        const historyTable = document.querySelector('.table-prices tbody');
        if(historyTable) {
            historyTable.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if(!btn) return;
                const id = btn.dataset.id;
                if(btn.classList.contains('btn-edit')) this.openNewListinoModal(id);
                else if(btn.classList.contains('btn-delete')) this.deleteListino(id);
            });
        }

        const btnPrev = document.getElementById('btn-prev-page');
        const btnNext = document.getElementById('btn-next-page');
        if(btnPrev) btnPrev.addEventListener('click', () => { if (this.currentPage > 1) { this.currentPage--; this.render(); } });
        if(btnNext) btnNext.addEventListener('click', () => { if (this.currentPage * this.ITEMS_PER_PAGE < history.length) { this.currentPage++; this.render(); } });
    },

    // --- HELPER TABELLE ---

    renderCurrentPricesTable: function(data) {
        if (!data) return '<p class="placeholder-message">Nessun listino inserito.</p>';
        
        const row = (lbl, val, cssClass) => `
            <div style="display:flex; justify-content:space-between; padding: 8px 0; border-bottom: 1px dashed var(--border-color);">
                <span class="${cssClass}" style="font-weight:600;">${lbl}</span>
                <span style="font-weight:500; color:var(--text-main);">${val} €</span>
            </div>`;
            
        return `
            <div style="padding: 10px 0;">
                <h4 style="margin-bottom:10px; color:var(--text-secondary); font-size:0.75rem; text-transform:uppercase; letter-spacing:1px;">Self Service</h4>
                ${row('Benzina', data.prices.benzina.self, 'text-benzina')}
                ${row('Gasolio', data.prices.gasolio.self, 'text-gasolio')}
                ${row('Diesel+', data.prices.dieselplus.self, 'text-dieselplus')}
                ${row('Hvolution', data.prices.hvo.self, 'text-hvolution')}
                
                <h4 style="margin-top:25px; margin-bottom:10px; color:var(--text-secondary); font-size:0.75rem; text-transform:uppercase; letter-spacing:1px;">Servito</h4>
                ${row('Benzina', data.prices.benzina.served, 'text-benzina')}
                ${row('Gasolio', data.prices.gasolio.served, 'text-gasolio')}
                ${row('Diesel+', data.prices.dieselplus.served, 'text-dieselplus')}
                ${row('Hvolution', data.prices.hvo.served, 'text-hvolution')}
                ${row('AdBlue', data.prices.adblue.served, 'text-adblue')}
            </div>`;
    },

    renderCompetitorTable: function(compData, myData) {
        if (!compData) return '<p class="placeholder-message">Nessuna rilevazione.</p>';
        if (!myData) return '<p class="placeholder-message">Inserisci prima il tuo listino.</p>';

        const myBz = parseFloat(myData.prices.benzina.self);
        const myDs = parseFloat(myData.prices.gasolio.self);
        const myHvo = parseFloat(myData.prices.hvo.self);

        const rowComp = (lbl, val, myVal, cssClass) => {
            if(val === 0) return `<div style="padding:8px 0; font-size:0.9em; color:var(--text-secondary);">${lbl}: N.D.</div>`;
            const diff = (val - myVal).toFixed(3);
            const diffClass = diff > 0 ? 'diff-pos' : (diff < 0 ? 'diff-neg' : 'diff-neutral');
            const sign = diff > 0 ? '+' : '';

            return `
                <div style="display:flex; justify-content:space-between; padding: 8px 0; border-bottom: 1px dashed var(--border-color);">
                    <span class="${cssClass}" style="font-weight:600;">${lbl}</span>
                    <div>
                        <span style="font-weight:500; color:var(--text-main); margin-right:5px;">${val.toFixed(3)} €</span>
                        <span class="${diffClass}">(${sign}${diff})</span>
                    </div>
                </div>`;
        };

        const myOilBlock = `
            <div style="margin-bottom: 25px;">
                <h4 style="margin-bottom:10px; color:var(--text-main); font-size:0.95rem; font-weight:700;">MyOil</h4>
                ${rowComp('Benzina', compData.myoil.bz, myBz, 'text-benzina')}
                ${rowComp('Gasolio', compData.myoil.ds, myDs, 'text-gasolio')}
                ${rowComp('HVO', compData.myoil.ds, myHvo, 'text-hvolution')}
            </div>
        `;

        const block = (name, bz, ds) => `
            <div style="margin-bottom: 25px;">
                <h4 style="margin-bottom:10px; color:var(--text-main); font-size:0.95rem; font-weight:700;">${name}</h4>
                ${rowComp('Benzina', bz, myBz, 'text-benzina')}
                ${rowComp('Gasolio', ds, myDs, 'text-gasolio')}
            </div>`;

        return `
            <div style="padding: 10px 0;">
               ${myOilBlock}
               ${block('Esso', compData.esso.bz, compData.esso.ds)}
               ${block('Q8', compData.q8.bz, compData.q8.ds)}
            </div>`;
    },

    renderHistoryTable: function(history) {
        if (!history || history.length === 0) return '<p class="placeholder-message">Nessun dato storico presente.</p>';

        const start = (this.currentPage - 1) * this.ITEMS_PER_PAGE;
        const end = start + this.ITEMS_PER_PAGE;
        const pageItems = history.slice(start, end);

        let html = `
            <table class="table-prices" style="width:100%; text-align:left; font-size: 0.9rem;">
                <thead>
                    <tr style="color: var(--text-secondary); border-bottom: 1px solid var(--border-color);">
                        <th style="padding: 12px;">Data</th>
                        <th style="padding: 12px;" class="text-benzina">Benzina</th>
                        <th style="padding: 12px;" class="text-gasolio">Gasolio</th>
                        <th style="padding: 12px;" class="text-dieselplus">Diesel+</th>
                        <th style="padding: 12px;" class="text-hvolution">Hvolution</th>
                        <th style="padding: 12px;" class="text-adblue">AdBlue</th>
                        <th style="padding: 12px; text-align: right;">Azioni</th>
                    </tr>
                </thead>
                <tbody>
        `;

        pageItems.forEach(item => {
            const d = new Date(item.date).toLocaleDateString() + ' ' + new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const getVal = (prod) => item.prices[prod]?.self || '-';

            html += `
                <tr style="border-bottom: 1px dashed var(--border-color);">
                    <td style="padding: 12px; font-weight:500;">${d}</td>
                    <td style="padding: 12px;">${getVal('benzina')}</td>
                    <td style="padding: 12px;">${getVal('gasolio')}</td>
                    <td style="padding: 12px;">${getVal('dieselplus')}</td>
                    <td style="padding: 12px;">${getVal('hvo')}</td>
                    <td style="padding: 12px;">${getVal('adblue')}</td>
                    <td style="padding: 12px; text-align: right;">
                        <button class="icon-btn btn-edit" data-id="${item.id}" title="Modifica">
                            <i data-lucide="pencil" style="width:16px;"></i>
                        </button>
                        <button class="icon-btn btn-delete" data-id="${item.id}" title="Elimina">
                            <i data-lucide="trash-2" style="width:16px;"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        return html;
    },

    // --- GRAFICO ---
    renderChart: function() {
        const ctx = document.getElementById('prezziChart');
        if (!ctx) return;
        const fullHistory = this.getPriceHistory();
        const currentYear = new Date().getFullYear();
        const monthlyData = { benzina: Array(12).fill(0), gasolio: Array(12).fill(0), dieselplus: Array(12).fill(0) };
        const monthlyCounts = { benzina: Array(12).fill(0), gasolio: Array(12).fill(0), dieselplus: Array(12).fill(0) };
        
        fullHistory.forEach(h => {
            const date = new Date(h.date);
            if (date.getFullYear() === currentYear) {
                const m = date.getMonth();
                if(h.prices.benzina?.self) { monthlyData.benzina[m] += parseFloat(h.prices.benzina.self); monthlyCounts.benzina[m]++; }
                if(h.prices.gasolio?.self) { monthlyData.gasolio[m] += parseFloat(h.prices.gasolio.self); monthlyCounts.gasolio[m]++; }
                if(h.prices.dieselplus?.self) { monthlyData.dieselplus[m] += parseFloat(h.prices.dieselplus.self); monthlyCounts.dieselplus[m]++; }
            }
        });
        
        const calcAvg = (sum, count) => sum.map((s, i) => count[i] > 0 ? (s / count[i]).toFixed(3) : null);
        
        const colBz = '#22c55e'; const colGs = '#ff6800'; const colDp = '#ff0038';
        if (this.chartInstance) this.chartInstance.destroy();
        const isDark = document.body.classList.contains('dark-mode');
        const colorText = isDark ? '#8F9BBA' : '#A3AED0';
        const colorGrid = isDark ? '#1B254B' : '#E0E5F2';

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
                datasets: [
                    { 
                        label: 'Benzina', 
                        data: calcAvg(monthlyData.benzina, monthlyCounts.benzina), 
                        borderColor: colBz, 
                        backgroundColor: colBz, 
                        tension: 0, 
                        pointRadius: 4, 
                        borderWidth: 3, 
                        fill: false 
                    },
                    { 
                        label: 'Gasolio', 
                        data: calcAvg(monthlyData.gasolio, monthlyCounts.gasolio), 
                        borderColor: colGs, 
                        backgroundColor: colGs, 
                        tension: 0, 
                        pointRadius: 4, 
                        borderWidth: 3, 
                        fill: false 
                    },
                    { 
                        label: 'Diesel+', 
                        data: calcAvg(monthlyData.dieselplus, monthlyCounts.dieselplus), 
                        borderColor: colDp, 
                        backgroundColor: colDp, 
                        tension: 0, 
                        pointRadius: 4, 
                        borderWidth: 3, 
                        fill: false 
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'top', 
                        labels: { 
                            color: isDark ? '#fff' : '#2B3674', 
                            font: { family: 'Montserrat' },
                            usePointStyle: true, 
                            boxWidth: 40, 
                            boxHeight: 12, 
                            useBorderRadius: true, 
                            borderRadius: 20
                        } 
                    },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    y: { ticks: { color: colorText }, grid: { color: colorGrid, borderDash: [5, 5] } },
                    x: { ticks: { color: colorText }, grid: { display: false } }
                }
            }
        });
    },

    // --- MODALI ---

    openNewListinoModal: function(idToEdit = null) {
        this.editingId = idToEdit;
        let title = idToEdit ? "Modifica Listino" : "Nuovo Listino Prezzi";
        let btnText = idToEdit ? "AGGIORNA" : "SALVA";
        let ex = idToEdit ? this.getPriceHistory().find(h => h.id === idToEdit) : null;
        
        let dateVal = ex ? ex.date.split('T')[0] : new Date().toISOString().split('T')[0];
        let notesVal = ex ? (ex.notes || '') : '';

        const bodyHTML = `
            <form id="form-prezzi">
                <div class="price-input-grid" style="margin-bottom: 20px; align-items: end;">
                    <div>
                        <label>Data Listino</label>
                        <div class="datepicker-container" style="position: relative;">
                            <input type="date" id="inp-date-listino" value="${dateVal}" class="form-input no-icon" style="position:absolute; opacity:0; pointer-events:none;">
                            <button type="button" id="date-trigger-listino" class="dropdown-trigger" onclick="PrezziModule.toggleDatepicker(event)" style="height: 46px; display: flex; align-items: center;">
                                <span id="date-display-listino">${this.formatDateIT(dateVal)}</span>
                                <i data-lucide="calendar" style="width:16px;"></i>
                            </button>
                            <div id="custom-datepicker-prezzi" class="datepicker-wrapper"></div>
                        </div>
                    </div>
                    <div>
                        <label>Annotazioni</label>
                        <input type="text" id="inp-notes" class="form-input" value="${notesVal}" placeholder="Es. Aumento accise..." style="height: 46px;">
                    </div>
                </div>

                <p class="modal-desc" style="margin-bottom:15px;">Inserisci prezzo base (4 cifre).</p>
                
                <div class="price-input-grid" style="margin-bottom: 20px;">
                    ${this.generateInputHTML('Benzina', 'benzina', 'var(--col-benzina)')}
                    ${this.generateInputHTML('Diesel+', 'dieselplus', 'var(--col-dieselplus)')}
                </div>

                <div class="price-input-grid" style="margin-bottom: 20px;">
                    ${this.generateInputHTML('Gasolio', 'gasolio', 'var(--col-gasolio)')}
                    ${this.generateInputHTML('HVO', 'hvo', 'var(--col-hvolution)')}
                </div>
                
                <div style="margin-top: 20px;">
                    ${this.generateInputHTML('AdBlue', 'adblue', 'var(--col-adblue)')}
                </div>
            </form>
        `;

        const footerHTML = `
            <div class="btn-group">
                <button type="button" id="btn-cancel-modal" class="action-btn btn-cancel">ANNULLA</button>
                <button type="button" id="btn-save-prices" class="action-btn btn-save">${btnText}</button>
            </div>
        `;
        
        window.openModal(title, bodyHTML, footerHTML, '550px');
        this.attachInputListeners();
        
        if (ex) {
            this.fillInputSquares('benzina', ex.prices.benzina.base);
            this.fillInputSquares('gasolio', ex.prices.gasolio.base);
            this.fillInputSquares('dieselplus', ex.prices.dieselplus.base);
            this.fillInputSquares('hvo', ex.prices.hvo.base);
            this.fillInputSquares('adblue', ex.prices.adblue.base);
        }

        setTimeout(() => {
            document.getElementById('btn-save-prices').addEventListener('click', () => this.saveListino());
            document.getElementById('btn-cancel-modal').addEventListener('click', () => window.closeModal());
        }, 0);
    },

    openCompetitorModal: function() {
        const lastComp = this.getCompetitors();
        
        const bodyHTML = `
            <form id="form-competitor">
                <div class="modal-divider">
                    <h4 class="modal-section-title">MyOil</h4>
                    <div class="price-input-grid">
                        ${this.generateInputHTML('Benzina', 'myoil_bz', 'var(--col-benzina)')}
                        ${this.generateInputHTML('Gasolio', 'myoil_ds', 'var(--col-gasolio)')}
                    </div>
                </div>
                <div class="modal-divider">
                    <h4 class="modal-section-title">Esso</h4>
                    <div class="price-input-grid">
                        ${this.generateInputHTML('Benzina', 'esso_bz', 'var(--col-benzina)')}
                        ${this.generateInputHTML('Gasolio', 'esso_ds', 'var(--col-gasolio)')}
                    </div>
                </div>
                <div>
                    <h4 class="modal-section-title">Q8</h4>
                    <div class="price-input-grid">
                        ${this.generateInputHTML('Benzina', 'q8_bz', 'var(--col-benzina)')}
                        ${this.generateInputHTML('Gasolio', 'q8_ds', 'var(--col-gasolio)')}
                    </div>
                </div>
            </form>
        `;

        const footerHTML = `
            <div class="btn-group">
                <button type="button" id="btn-cancel-comp" class="action-btn btn-cancel">ANNULLA</button>
                <button type="button" id="btn-save-competitor" class="action-btn btn-save">AGGIORNA</button>
            </div>
        `;

        window.openModal('Rilevazione Concorrenza', bodyHTML, footerHTML, '600px');
        this.attachInputListeners();
        
        if (lastComp) {
            this.fillInputSquares('myoil_bz', lastComp.myoil.bz);
            this.fillInputSquares('myoil_ds', lastComp.myoil.ds);
            this.fillInputSquares('esso_bz', lastComp.esso.bz);
            this.fillInputSquares('esso_ds', lastComp.esso.ds);
            this.fillInputSquares('q8_bz', lastComp.q8.bz);
            this.fillInputSquares('q8_ds', lastComp.q8.ds);
        }
        
        setTimeout(() => {
            document.getElementById('btn-save-competitor').addEventListener('click', () => this.saveCompetitor());
            document.getElementById('btn-cancel-comp').addEventListener('click', () => window.closeModal());
        }, 0);
    },

    // --- HELPER GENERICI ---
    
    generateInputHTML: function(label, id, color) { return `<div style="margin-bottom:5px;"><label style="color:${color}; font-weight:600; font-size:0.8rem; display:block; margin-bottom:8px; text-transform:uppercase;">${label}</label><div class="price-group" data-product="${id}"><input type="text" maxlength="1" class="price-square" inputmode="numeric"><input type="text" maxlength="1" class="price-square" inputmode="numeric"><input type="text" maxlength="1" class="price-square" inputmode="numeric"><input type="text" maxlength="1" class="price-square" inputmode="numeric"></div></div>`; },
    readPriceFromGroup: function(id) { const inputs = document.querySelectorAll(`[data-product="${id}"] input`); let s = ""; inputs.forEach(i => s += i.value); return s.length < 4 ? 0 : parseFloat(s[0] + '.' + s.substring(1)); },
    fillInputSquares: function(id, val) { if(!val) return; let s = val.toFixed(3).replace('.',''); document.querySelectorAll(`[data-product="${id}"] input`).forEach((inp, i) => { if(s[i]) inp.value = s[i]; }); },
    attachInputListeners: function() { document.querySelectorAll('.price-square').forEach((sq, i, all) => { sq.addEventListener('input', e => { e.target.value = e.target.value.replace(/[^0-9]/g,''); if(e.target.value.length===1 && all[i+1] && all[i+1].parentElement===sq.parentElement) all[i+1].focus(); }); sq.addEventListener('keydown', e => { if(e.key==='Backspace' && e.target.value==='' && all[i-1] && all[i-1].parentElement===sq.parentElement) all[i-1].focus(); }); sq.addEventListener('focus', e => e.target.select()); }); },
    
    saveListino: function() {
        try {
            const dateInp = document.getElementById('inp-date-listino').value;
            const notesInp = document.getElementById('inp-notes').value.trim();

            if (!dateInp) { showNotification("Inserisci una data valida!", 'error'); return; }

            const products = ['benzina', 'gasolio', 'dieselplus', 'hvo', 'adblue'];
            const pricesObj = {};
            let isValid = true;
            products.forEach(prod => {
                const base = this.readPriceFromGroup(prod);
                if (base === 0) isValid = false;
                let self = base + (prod === 'adblue' ? 0 : this.SURCHARGE_SELF);
                let served = self + (prod === 'adblue' ? 0 : this.SURCHARGE_SERVED);
                pricesObj[prod] = { base: base, self: self.toFixed(3), served: served.toFixed(3) };
            });
            
            if (!isValid) { showNotification("Compila tutti i campi!", 'error'); return; }
            
            const history = this.getPriceHistory();
            const isoDate = new Date(dateInp).toISOString();

            if (this.editingId) {
                const idx = history.findIndex(h => h.id === this.editingId);
                if (idx !== -1) {
                    history[idx].prices = pricesObj;
                    history[idx].date = isoDate;
                    history[idx].notes = notesInp;
                }
                showNotification("Listino aggiornato!", 'success');
            } else {
                history.push({ id: Date.now().toString(), date: isoDate, notes: notesInp, prices: pricesObj });
                showNotification("Nuovo listino salvato!", 'success');
            }
            localStorage.setItem('polaris_price_history', JSON.stringify(history));
            
            const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
            if(sorted.length > 0) localStorage.setItem('polaris_last_prices', JSON.stringify(sorted[0]));
            
            window.closeModal(); 
            this.render();
        } catch(e) { console.error(e); showNotification("Errore salvataggio.", 'error'); }
    },
    
    saveCompetitor: function() {
        try {
            const data = { date: new Date().toISOString(), myoil: { bz: this.readPriceFromGroup('myoil_bz'), ds: this.readPriceFromGroup('myoil_ds') }, esso: { bz: this.readPriceFromGroup('esso_bz'), ds: this.readPriceFromGroup('esso_ds') }, q8: { bz: this.readPriceFromGroup('q8_bz'), ds: this.readPriceFromGroup('q8_ds') } };
            localStorage.setItem('polaris_competitors', JSON.stringify(data));
            const h = JSON.parse(localStorage.getItem('polaris_competitors_history') || '[]'); h.push(data);
            localStorage.setItem('polaris_competitors_history', JSON.stringify(h));
            showNotification("Concorrenza aggiornata!", 'success');
            window.closeModal(); this.render();
        } catch(e) { console.error(e); showNotification("Errore salvataggio.", 'error'); }
    },
    
    deleteListino: function(id) {
        if (!confirm("Eliminare questo listino?")) return;
        try {
            let history = this.getPriceHistory().filter(h => h.id !== id);
            localStorage.setItem('polaris_price_history', JSON.stringify(history));
            const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
            if(sorted.length > 0) localStorage.setItem('polaris_last_prices', JSON.stringify(sorted[0]));
            else localStorage.removeItem('polaris_last_prices');
            showNotification("Listino eliminato.", 'info');
            this.render();
        } catch (e) { showNotification("Errore eliminazione.", 'error'); }
    },
    
    exportData: function() {
        try {
            const d = { priceHistory: this.getPriceHistory(), competitorPrices: JSON.parse(localStorage.getItem('polaris_competitors_history') || '[]'), currentCompetitor: this.getCompetitors(), lastPrice: this.getLastPrice() };
            const a = document.createElement('a'); a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(d, null, 2)); a.download = "polaris_prezzi.json"; document.body.appendChild(a); a.click(); a.remove();
        } catch (e) { console.error(e); }
    },
    
    importData: function(e) {
        const f = e.target.files[0]; if(!f) return;
        const r = new FileReader(); r.onload = (ev) => {
            try { const j = JSON.parse(ev.target.result);
                if(j.priceHistory) { const m = j.priceHistory.map(x => this.normalizePriceEntry(x)); localStorage.setItem('polaris_price_history', JSON.stringify(m)); if(m.length) localStorage.setItem('polaris_last_prices', JSON.stringify(m.sort((a,b)=>new Date(b.date)-new Date(a.date))[0])); }
                if(j.competitorPrices) { const c = j.competitorPrices.map(x => this.normalizeCompetitorEntry(x)); localStorage.setItem('polaris_competitors_history', JSON.stringify(c)); if(c.length) localStorage.setItem('polaris_competitors', JSON.stringify(c.sort((a,b)=>new Date(b.date)-new Date(a.date))[0])); }
                showNotification("Importazione completata!", 'success');
                this.currentPage=1; this.render();
            } catch(err){console.error(err); showNotification("Errore file JSON", 'error');}
        }; r.readAsText(f);
    },
    
    getLastPrice: function() { try { const d = localStorage.getItem('polaris_last_prices'); return d ? JSON.parse(d) : null; } catch (e) { return null; } },
    getPriceHistory: function() { try { const d = localStorage.getItem('polaris_price_history'); return d ? JSON.parse(d) : []; } catch (e) { return []; } },
    getCompetitors: function() { try { const d = localStorage.getItem('polaris_competitors'); return d ? JSON.parse(d) : null; } catch (e) { return null; } },
    normalizePriceEntry: function(e) { if(e.prices) return e; return { id: e.id||Date.now().toString(), date: e.date, prices: { benzina: this.calculateMargins(e.benzina), gasolio: this.calculateMargins(e.gasolio), dieselplus: this.calculateMargins(e.dieselPlus), hvo: this.calculateMargins(e.hvolution), adblue: this.calculateMargins(e.adblue, true) } }; },
    normalizeCompetitorEntry: function(e) { if(e.myoil && e.myoil.bz!==undefined) return e; return { date: e.date, notes:e.notes||'', myoil:{bz:e.myoil?.benzina||0, ds:e.myoil?.gasolio||0}, esso:{bz:e.esso?.benzina||0, ds:e.esso?.gasolio||0}, q8:{bz:e.q8?.benzina||0, ds:e.q8?.gasolio||0} }; },
    calculateMargins: function(b, f=false) { const v=parseFloat(b)||0; if(f) return {base:v, self:v.toFixed(3), served:v.toFixed(3)}; return {base:v, self:(v+this.SURCHARGE_SELF).toFixed(3), served:(v+this.SURCHARGE_SELF+this.SURCHARGE_SERVED).toFixed(3)}; },

    // --- DATEPICKER LOGIC ---
    toggleDatepicker: function(e) {
        e.stopPropagation();
        const w = document.getElementById('custom-datepicker-prezzi');
        if (w.classList.contains('show')) { w.classList.remove('show'); return; }
        document.querySelectorAll('.show').forEach(el => el.classList.remove('show'));
        w.classList.add('show');
        const curDate = new Date(document.getElementById('inp-date-listino').value);
        this.renderCalendar(curDate.getFullYear(), curDate.getMonth());
    },

    renderCalendar: function(y, m) {
        const w = document.getElementById('custom-datepicker-prezzi');
        const ms = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
        const ds = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
        const fd = new Date(y, m, 1).getDay();
        const afd = fd === 0 ? 6 : fd - 1;
        const dim = new Date(y, m+1, 0).getDate();
        
        let html = `
            <div class="datepicker-header">
                <button type="button" class="datepicker-nav" onclick="PrezziModule.changeMonth(${m-1}, ${y}); event.stopPropagation();"><i data-lucide="chevron-left" style="width:16px;"></i></button>
                <div class="datepicker-title">${ms[m]} ${y}</div>
                <button type="button" class="datepicker-nav" onclick="PrezziModule.changeMonth(${m+1}, ${y}); event.stopPropagation();"><i data-lucide="chevron-right" style="width:16px;"></i></button>
            </div>
            <div class="datepicker-grid">
                ${ds.map(d=>`<div class="datepicker-day-label">${d}</div>`).join('')}
        `;
        
        for(let i=0; i<afd; i++) html+=`<div class="datepicker-day empty"></div>`;
        
        const sd = new Date(document.getElementById('inp-date-listino').value);
        const today = new Date();
        
        for(let i=1; i<=dim; i++) {
            let cls = 'datepicker-day';
            if(i===today.getDate() && m===today.getMonth() && y===today.getFullYear()) cls+=' today';
            if(i===sd.getDate() && m===sd.getMonth() && y===sd.getFullYear()) cls+=' selected';
            html+=`<div class="${cls}" onclick="PrezziModule.selectDate(${y},${m},${i}); event.stopPropagation();">${i}</div>`;
        }
        
        html+='</div>';
        w.innerHTML = html;
        lucide.createIcons();
    },

    changeMonth: function(m, y) {
        if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; }
        this.renderCalendar(y, m);
    },

    selectDate: function(y, m, d) {
        const fmt=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        document.getElementById('inp-date-listino').value = fmt;
        document.getElementById('date-display-listino').innerText = this.formatDateIT(fmt);
        document.getElementById('custom-datepicker-prezzi').classList.remove('show');
    },

    formatDateIT: function(iso) {
        if(!iso) return '';
        const d=new Date(iso);
        return d.toLocaleDateString('it-IT',{day:'2-digit',month:'long',year:'numeric'});
    }
};
/* FINE MODULO PREZZI */
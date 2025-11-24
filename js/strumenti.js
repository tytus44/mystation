/* INIZIO MODULO STRUMENTI */
const StrumentiModule = {
    currentApp: null,
    products: [
        { id: 'benzina', label: 'Benzina', cssClass: 'text-benzina' },
        { id: 'gasolio', label: 'Gasolio', cssClass: 'text-gasolio' },
        { id: 'dieselplus', label: 'Diesel+', cssClass: 'text-dieselplus' },
        { id: 'hvolution', label: 'Hvo', cssClass: 'text-hvolution' }
    ],

    init: function() { },

    openMainModal: function() {
        this.currentApp = null;
        const bodyHTML = this.getMenuHTML();
        window.openModal('Strumenti', bodyHTML, '', '600px');
    },

    getMenuHTML: function() {
        return `
            <div class="app-grid">
                <div class="app-card" onclick="StrumentiModule.loadApp('fuel')">
                    <div class="app-icon bg-blue-100 text-blue-600"><i data-lucide="fuel"></i></div>
                    <div class="app-title">Ordine Carburanti</div>
                    <div class="app-desc">Calcolo importo ordine</div>
                </div>
                <div class="app-card" onclick="StrumentiModule.loadApp('cash')">
                    <div class="app-icon bg-green-100 text-green-600"><i data-lucide="banknote"></i></div>
                    <div class="app-title">Conta Banconote</div>
                    <div class="app-desc">Distinta Versamento</div>
                </div>
                <div class="app-card" onclick="StrumentiModule.loadApp('vat')">
                    <div class="app-icon bg-purple-100 text-purple-600"><i data-lucide="percent"></i></div>
                    <div class="app-title">Scorporo IVA</div>
                    <div class="app-desc">Per corrispettivi</div>
                </div>
            </div>
        `;
    },

    loadApp: function(appName) {
        this.currentApp = appName;
        let title='', content='', footer='', width='600px';

        // Footer Standard con MENU
        const btnMenu = `<button class="action-btn" onclick="StrumentiModule.openMainModal()"><i data-lucide="arrow-left"></i> MENU</button>`;

        switch(appName) {
            case 'fuel':
                title = 'Nuovo Ordine Carburante';
                content = this.getFuelOrderHTML();
                width = '500px';
                footer = btnMenu;
                break;
            case 'cash':
                title = 'Versamento Banconote';
                content = this.getCashCounterHTML();
                width = '450px';
                footer = btnMenu;
                break;
            case 'vat':
                title = 'Calcolatrice IVA';
                content = this.getVatCalculatorHTML();
                footer = btnMenu;
                break;
        }

        window.openModal(title, content, footer, width);
        lucide.createIcons();

        if(appName === 'cash') this.attachCashListeners();
        if(appName === 'vat') this.attachVatListeners();
        if(appName === 'fuel') this.attachFuelListeners();
    },

    // --- 1. ORDINE CARBURANTI ---
    getFuelOrderHTML: function() {
        let rows = this.products.map(p => `
            <div class="fuel-row">
                <span class="fuel-label ${p.cssClass}">${p.label}</span>
                <div class="input-stepper stepper-container-fuel">
                    <button type="button" class="step-btn minus" data-target="ord-${p.id}" data-step="1000"><i data-lucide="minus" style="width:16px;"></i></button>
                    <input type="number" id="ord-${p.id}" class="stepper-input fuel-input" data-prod="${p.id}" placeholder="0">
                    <button type="button" class="step-btn plus" data-target="ord-${p.id}" data-step="1000"><i data-lucide="plus" style="width:16px;"></i></button>
                </div>
            </div>
        `).join('');

        return `
            <div style="padding: 10px 0;">
                <div style="margin-bottom: 30px;">${rows}</div>
                <div style="border-top: 1px solid var(--border-color); margin-bottom: 20px;"></div>
                <div class="fuel-row">
                    <span style="color:var(--text-secondary); font-size:1rem;">Totale Stimato:</span>
                    <span id="fuel-total-euro" style="font-size:1.5rem; font-weight:700; color:var(--text-main);">0,00 €</span>
                </div>
            </div>
        `;
    },

    attachFuelListeners: function() {
        let prices = { benzina:0, gasolio:0, dieselplus:0, hvolution:0 };
        try {
            const lastP = JSON.parse(localStorage.getItem('polaris_last_prices'));
            if(lastP && lastP.prices) {
                prices.benzina = parseFloat(lastP.prices.benzina?.base || 0);
                prices.gasolio = parseFloat(lastP.prices.gasolio?.base || 0);
                prices.dieselplus = parseFloat(lastP.prices.dieselplus?.base || 0);
                prices.hvolution = parseFloat(lastP.prices.hvo?.base || 0);
            }
        } catch(e) {}

        const updateEst = () => {
            let total = 0;
            document.querySelectorAll('.fuel-input').forEach(inp => {
                const qty = parseFloat(inp.value) || 0;
                const prod = inp.dataset.prod;
                total += qty * (prices[prod] || 0);
            });
            document.getElementById('fuel-total-euro').innerText = total.toLocaleString('it-IT', {style:'currency', currency:'EUR'});
        };

        this.setupStepper(updateEst);
        document.querySelectorAll('.fuel-input').forEach(i => i.addEventListener('input', updateEst));
    },

    // --- 2. CONTA BANCONOTE (FIX ALTEZZA) ---
    getCashCounterHTML: function() {
        const bills = [500, 200, 100, 50, 20];
        let rows = bills.map(b => `
            <div class="cash-row">
                <div class="cash-label">€ ${b}</div>
                <div class="input-stepper stepper-container-cash">
                    <button type="button" class="step-btn minus" data-target="bill-${b}" data-step="1"><i data-lucide="minus" style="width:12px;"></i></button>
                    <input type="number" id="bill-${b}" class="stepper-input bill-input" data-val="${b}" placeholder="0">
                    <button type="button" class="step-btn plus" data-target="bill-${b}" data-step="1"><i data-lucide="plus" style="width:12px;"></i></button>
                </div>
                <div class="cash-total" id="sum-${b}">€ 0</div>
            </div>
        `).join('');
        
        return `
            <div style="padding: 10px 0;">
                <div style="margin-bottom: 20px;">${rows}</div>
                
                <div class="card" style="padding: 15px; text-align: center; border: 1px solid var(--border-color); background-color: var(--bg-app); box-shadow: none;">
                    <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 5px;">
                        Totale Versamento
                    </span>
                    <div id="cash-total" style="font-size: 2rem; font-weight: 700; color: var(--col-benzina); line-height: 1;">
                        € 0
                    </div>
                </div>
            </div>
        `;
    },

    attachCashListeners: function() {
        const updateCash = () => {
            let totalVal = 0;
            document.querySelectorAll('.bill-input').forEach(inp => {
                const val = parseInt(inp.dataset.val);
                const count = parseInt(inp.value) || 0;
                const sub = val * count;
                document.getElementById(`sum-${val}`).innerText = '€ ' + sub.toLocaleString('it-IT');
                totalVal += sub;
            });
            document.getElementById('cash-total').innerText = '€ ' + totalVal.toLocaleString('it-IT');
        };
        document.querySelectorAll('.bill-input').forEach(i => i.addEventListener('input', updateCash));
        this.setupStepper(updateCash);
    },

    // --- 3. SCORPORO IVA ---
    getVatCalculatorHTML: function() {
        return `
            <div style="text-align:center; padding:20px;">
                <label style="margin-bottom:10px; display:block; color:var(--text-secondary); font-weight:600;">Importo Totale (Lordo)</label>
                <div style="display:inline-block; position:relative; width:100%; max-width:240px;">
                    <input type="number" id="vat-input" class="price-square" style="width:100%; height:70px; font-size:2.2rem; padding:0 20px; border-color:var(--primary-color);" placeholder="0,00">
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top:40px;">
                    <div style="background:var(--bg-app); padding:20px; border-radius:var(--radius-card); border:1px solid var(--border-color);">
                        <span style="display:block; font-size:0.85rem; color:var(--text-secondary); text-transform:uppercase;">Imponibile</span>
                        <span id="vat-net" style="font-size:1.6rem; font-weight:700; color:var(--text-main);">€ 0,00</span>
                    </div>
                    <div style="background:rgba(236, 72, 153, 0.08); padding:20px; border-radius:var(--radius-card); border:1px solid rgba(236, 72, 153, 0.2);">
                        <span style="display:block; font-size:0.85rem; color:#ec4899; text-transform:uppercase;">IVA (22%)</span>
                        <span id="vat-val" style="font-size:1.6rem; font-weight:700; color:#ec4899;">€ 0,00</span>
                    </div>
                </div>
            </div>
        `;
    },

    attachVatListeners: function() {
        document.getElementById('vat-input').addEventListener('input', (e) => {
            const val = parseFloat(e.target.value) || 0;
            const net = val / 1.22;
            const vat = val - net;
            document.getElementById('vat-net').innerText = net.toLocaleString('it-IT', {style:'currency', currency:'EUR'});
            document.getElementById('vat-val').innerText = vat.toLocaleString('it-IT', {style:'currency', currency:'EUR'});
        });
    },

    setupStepper: function(callback) {
        document.querySelectorAll('.step-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => {
                const targetId = newBtn.dataset.target;
                const step = parseInt(newBtn.dataset.step);
                const input = document.getElementById(targetId);
                const isPlus = newBtn.classList.contains('plus');
                if(input) {
                    let val = parseFloat(input.value) || 0;
                    if (isPlus) val += step; else val = Math.max(0, val - step);
                    input.value = val;
                    input.dispatchEvent(new Event('input'));
                    if(typeof callback === 'function') callback();
                }
            });
        });
    }
};
/* FINE MODULO STRUMENTI */

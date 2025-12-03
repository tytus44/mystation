/* INIZIO MODULO STRUMENTI */
const StrumentiModule = {
    products: [
        { id: 'benzina', label: 'Benzina', cssClass: 'text-benzina' },
        { id: 'gasolio', label: 'Gasolio', cssClass: 'text-gasolio' },
        { id: 'dieselplus', label: 'Diesel+', cssClass: 'text-dieselplus' },
        { id: 'hvolution', label: 'Hvo', cssClass: 'text-hvolution' }
    ],

    init: function() {
        this.render();
    },

    render: function() {
        const container = document.getElementById('strumenti-content');
        if (!container) return;

        // Struttura a griglia con le 3 card visibili direttamente
        container.innerHTML = `
            <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px; align-items: start;">
                
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Ordine Carburanti</span>
                        <i data-lucide="fuel"></i>
                    </div>
                    <div class="card-body">
                        ${this.getFuelContent()}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Conta Banconote</span>
                        <i data-lucide="banknote"></i>
                    </div>
                    <div class="card-body">
                        ${this.getCashContent()}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Scorporo IVA</span>
                        <i data-lucide="percent"></i>
                    </div>
                    <div class="card-body">
                        ${this.getVatContent()}
                    </div>
                </div>

            </div>
        `;
        
        lucide.createIcons();
        
        this.attachFuelListeners();
        this.attachCashListeners();
        this.attachVatListeners();
    },

    // --- CONTENUTO HTML DELLE CARD ---

    getFuelContent: function() {
        let rows = this.products.map(p => `
            <div class="fuel-row" style="margin-bottom: 12px;">
                <span class="fuel-label ${p.cssClass}" style="font-size: 0.95rem;">${p.label}</span>
                <div class="input-stepper stepper-container-fuel" style="width: 140px; height: 40px;">
                    <button type="button" class="step-btn minus" data-target="ord-${p.id}" data-step="1000"><i data-lucide="minus" style="width:14px;"></i></button>
                    <input type="number" id="ord-${p.id}" class="stepper-input fuel-input" data-prod="${p.id}" placeholder="0" style="font-size: 0.9rem;">
                    <button type="button" class="step-btn plus" data-target="ord-${p.id}" data-step="1000"><i data-lucide="plus" style="width:14px;"></i></button>
                </div>
            </div>
        `).join('');

        return `
            <div>
                <div style="margin-bottom: 20px;">${rows}</div>
                <div style="border-top: 1px solid var(--border-color); margin-bottom: 15px;"></div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color:var(--text-secondary); font-size:0.9rem; font-weight: 500;">Totale Stimato</span>
                    <span id="fuel-total-euro" style="font-size:1.4rem; font-weight:700; color:var(--text-main);">0,00 €</span>
                </div>
            </div>
        `;
    },

    getCashContent: function() {
        const bills = [500, 200, 100, 50, 20, 10];
        
        // MODIFICA: Grid layout con 3 colonne uguali (1fr 1fr 1fr)
        let rows = bills.map(b => `
            <div class="cash-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; align-items: center; padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px dashed var(--border-color);">
                
                <div class="cash-label" style="font-size: 1rem; font-weight: 600; text-align: left;">€ ${b}</div>
                
                <div style="display: flex; justify-content: center;">
                    <div class="input-stepper stepper-container-cash" style="width: 100%; max-width: 110px; height: 36px;">
                        <button type="button" class="step-btn minus" data-target="bill-${b}" data-step="1"><i data-lucide="minus" style="width:12px;"></i></button>
                        <input type="number" id="bill-${b}" class="stepper-input bill-input" data-val="${b}" placeholder="0" style="font-size: 0.9rem;">
                        <button type="button" class="step-btn plus" data-target="bill-${b}" data-step="1"><i data-lucide="plus" style="width:12px;"></i></button>
                    </div>
                </div>

                <div class="cash-total" id="sum-${b}" style="font-size: 1rem; font-weight: 700; text-align: right;">0</div>
            </div>
        `).join('');
        
        return `
            <div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px; font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">
                    <div style="text-align: left;">Taglio</div>
                    <div style="text-align: center;">Quantità</div>
                    <div style="text-align: right;">Valore</div>
                </div>

                <div style="margin-bottom: 20px;">${rows}</div>
                
                <div style="padding: 15px; text-align: center; border: 1px solid var(--col-benzina); background-color: rgba(34, 197, 94, 0.05); border-radius: var(--radius-input);">
                    <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 5px; letter-spacing: 0.5px;">
                        TOTALE VERSAMENTO
                    </span>
                    <div id="cash-total" style="font-size: 1.8rem; font-weight: 700; color: var(--col-benzina); line-height: 1;">
                        € 0
                    </div>
                </div>
            </div>
        `;
    },

    getVatContent: function() {
        return `
            <div style="text-align:center; padding: 10px 0;">
                <label style="margin-bottom:10px; display:block; color:var(--text-secondary); font-weight:600; font-size: 0.9rem;">Importo Totale (Lordo)</label>
                <div style="display:inline-block; position:relative; width:100%;">
                    <input type="number" id="vat-input" class="price-square" style="width:100%; height:60px; font-size:1.8rem; padding:0 15px; border-color:var(--primary-color); text-align: center; border-radius: 12px;" placeholder="0,00">
                </div>
                
                <div style="margin-top: 30px; display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background-color: var(--bg-app); border-radius: 12px; border: 1px solid var(--border-color);">
                        <span style="font-size:0.85rem; color:var(--text-secondary); text-transform:uppercase; font-weight: 600;">Imponibile</span>
                        <span id="vat-net" style="font-size:1.2rem; font-weight:700; color:var(--text-main);">€ 0,00</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background-color: rgba(236, 72, 153, 0.08); border-radius: 12px; border: 1px solid rgba(236, 72, 153, 0.2);">
                        <span style="font-size:0.85rem; color:#ec4899; text-transform:uppercase; font-weight: 600;">IVA (22%)</span>
                        <span id="vat-val" style="font-size:1.2rem; font-weight:700; color:#ec4899;">€ 0,00</span>
                    </div>
                </div>
            </div>
        `;
    },

    // --- LOGICA FUNZIONALE ---

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
            const el = document.getElementById('fuel-total-euro');
            if(el) el.innerText = total.toLocaleString('it-IT', {style:'currency', currency:'EUR'});
        };

        this.setupStepper(updateEst);
        document.querySelectorAll('.fuel-input').forEach(i => i.addEventListener('input', updateEst));
    },

    attachCashListeners: function() {
        const updateCash = () => {
            let totalVal = 0;
            document.querySelectorAll('.bill-input').forEach(inp => {
                const val = parseInt(inp.dataset.val);
                const count = parseInt(inp.value) || 0;
                const sub = val * count;
                const sumEl = document.getElementById(`sum-${val}`);
                if(sumEl) sumEl.innerText = sub > 0 ? sub.toLocaleString('it-IT') : '0';
                totalVal += sub;
            });
            const totEl = document.getElementById('cash-total');
            if(totEl) totEl.innerText = '€ ' + totalVal.toLocaleString('it-IT');
        };
        
        this.setupStepper(updateCash);
        document.querySelectorAll('.bill-input').forEach(i => i.addEventListener('input', updateCash));
    },

    attachVatListeners: function() {
        const inp = document.getElementById('vat-input');
        if(inp) {
            inp.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) || 0;
                const net = val / 1.22;
                const vat = val - net;
                document.getElementById('vat-net').innerText = net.toLocaleString('it-IT', {style:'currency', currency:'EUR'});
                document.getElementById('vat-val').innerText = vat.toLocaleString('it-IT', {style:'currency', currency:'EUR'});
            });
        }
    }
};
/* FINE MODULO STRUMENTI */
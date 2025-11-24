/* INIZIO CONFIGURAZIONE E VARIABILI GLOBALI */
const mainContent = document.getElementById('main-content');
/* FINE CONFIGURAZIONE E VARIABILI GLOBALI */

/* INIZIO INIZIALIZZAZIONE */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initFullscreen();
    initNavigation();
    initHeaderActions();
    initGlobalModal(); // Gestione chiusura modale

    lucide.createIcons();
    loadSection('home');
});

/* INIZIO LOGICA NAVIGAZIONE */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            const sectionName = e.target.getAttribute('data-section');
            loadSection(sectionName);
        });
    });
}

function loadSection(sectionName) {
    let contentHTML = '';
    let postRenderAction = null;

    switch(sectionName) {
        case 'home':
            contentHTML = `<div id="home-content"></div>`;
            postRenderAction = () => { if (typeof HomeModule !== 'undefined') HomeModule.init(); };
            break;
        case 'virtualstation':
            contentHTML = `<div id="virtualstation-content"></div>`;
            postRenderAction = () => { if (typeof VirtualStationModule !== 'undefined') VirtualStationModule.init(); };
            break;
        case 'carico':
            contentHTML = `<div id="carico-content"></div>`;
            postRenderAction = () => { if (typeof CaricoModule !== 'undefined') CaricoModule.init(); };
            break;
        case 'prezzi':
            contentHTML = `<div id="prezzi-content"></div>`;
            postRenderAction = () => { if (typeof PrezziModule !== 'undefined') PrezziModule.init(); };
            break;
        case 'amministrazione':
            contentHTML = `<div id="amministrazione-content"></div>`;
            postRenderAction = () => { if (typeof AmministrazioneModule !== 'undefined') AmministrazioneModule.init(); };
            break;
        default:
            contentHTML = `<h2>Sezione non trovata</h2>`;
    }

    mainContent.innerHTML = contentHTML;
    lucide.createIcons();
    if (postRenderAction) setTimeout(postRenderAction, 50);
}

/* INIZIO LOGICA HEADER */
function initHeaderActions() {
    const btnSettings = document.getElementById('btn-settings-trigger');
    const dropdown = document.getElementById('settings-dropdown');
    const importInput = document.getElementById('input-general-import');

    if(btnSettings && dropdown) {
        btnSettings.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
            btnSettings.classList.toggle('active');
        });
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
            btnSettings.classList.remove('active');
        });
    }

    const btnApps = document.getElementById('btn-apps');
    if(btnApps) {
        btnApps.addEventListener('click', () => {
            if(typeof StrumentiModule !== 'undefined') StrumentiModule.openMainModal();
            else { console.warn("Modulo Strumenti non caricato."); window.showNotification("Modulo Strumenti non trovato", "error"); }
        });
    }

    const btnExport = document.getElementById('action-export');
    if(btnExport) btnExport.addEventListener('click', exportGeneralBackup);
    
    const btnImport = document.getElementById('action-import');
    if(btnImport && importInput) {
        btnImport.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', importGeneralBackup);
    }
    
    const btnPrint = document.getElementById('action-print-report');
    if(btnPrint) btnPrint.addEventListener('click', printDailyReport);
}

/* LOGICA BACKUP GENERALE */
function exportGeneralBackup() {
    try {
        const backup = {
            meta: { version: '1.0', date: new Date().toISOString() },
            data: {
                turni: JSON.parse(localStorage.getItem('polaris_turni') || '[]'),
                clients: JSON.parse(localStorage.getItem('polaris_clients') || '[]'),
                carico: JSON.parse(localStorage.getItem('polaris_registro_carico') || '[]'),
                stockPrev: JSON.parse(localStorage.getItem('polaris_registro_stock_prev') || '{}'),
                priceHistory: JSON.parse(localStorage.getItem('polaris_price_history') || '[]'),
                lastPrices: JSON.parse(localStorage.getItem('polaris_last_prices') || 'null'),
                competitors: JSON.parse(localStorage.getItem('polaris_competitors') || 'null'),
                theme: localStorage.getItem('polaris_theme')
            }
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
        const a = document.createElement('a');
        a.setAttribute("href", dataStr); a.setAttribute("download", "polaris_backup.json");
        document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { showNotification('Errore durante il backup', 'error'); }
}

function importGeneralBackup(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const json = JSON.parse(ev.target.result);
            if (!json.data) throw new Error("Formato non valido");

            // Modale di conferma custom per il ripristino
            const bodyHTML = `
                <div style="text-align:center; padding:20px;">
                    <i data-lucide="alert-triangle" style="width:48px; height:48px; color:var(--col-destructive); margin-bottom:15px;"></i>
                    <h3 style="font-size:1.2rem; font-weight:700; color:var(--text-main); margin-bottom:10px;">Sovrascrivere tutti i dati?</h3>
                    <p style="color:var(--text-secondary); font-size:0.95rem; line-height:1.5;">L'azione è irreversibile.</p>
                </div>
            `;
            const footerHTML = `<div class="btn-group"><button id="btn-cancel-imp" class="action-btn btn-cancel">ANNULLA</button><button id="btn-confirm-imp" class="action-btn btn-delete">RIPRISTINA</button></div>`;
            
            window.openModal('Importazione', bodyHTML, footerHTML, '450px');

            setTimeout(() => {
                document.getElementById('btn-cancel-imp').onclick = window.closeModal;
                document.getElementById('btn-confirm-imp').onclick = () => {
                    const d = json.data;
                    if(d.turni) localStorage.setItem('polaris_turni', JSON.stringify(d.turni));
                    if(d.clients) localStorage.setItem('polaris_clients', JSON.stringify(d.clients));
                    if(d.carico) localStorage.setItem('polaris_registro_carico', JSON.stringify(d.carico));
                    if(d.stockPrev) localStorage.setItem('polaris_registro_stock_prev', JSON.stringify(d.stockPrev));
                    if(d.priceHistory) localStorage.setItem('polaris_price_history', JSON.stringify(d.priceHistory));
                    if(d.lastPrices) localStorage.setItem('polaris_last_prices', JSON.stringify(d.lastPrices));
                    if(d.competitors) localStorage.setItem('polaris_competitors', JSON.stringify(d.competitors));
                    if(d.theme) localStorage.setItem('polaris_theme', d.theme);
                    
                    window.closeModal();
                    // Usiamo un alert nativo rapido o la nuova modale (qui modale)
                    // Ma dato che ricarichiamo subito, meglio reload diretto
                    location.reload();
                };
            }, 0);

        } catch (err) { showNotification('File non valido', 'error'); }
    };
    reader.readAsText(file);
    e.target.value = ''; 
}

/* LOGICA REPORT */
function printDailyReport() {
    const today = new Date(); today.setHours(0,0,0,0);
    const todayStr = today.toLocaleDateString('it-IT');
    const allTurni = JSON.parse(localStorage.getItem('polaris_turni') || '[]');
    const turni = allTurni.filter(t => { const d = new Date(t.date); d.setHours(0,0,0,0); return d.getTime() === today.getTime() && t.turno !== 'Riepilogo Mensile'; });

    if (turni.length === 0) { showNotification('Nessun turno registrato per oggi.', 'error'); return; }

    const priceHistory = JSON.parse(localStorage.getItem('polaris_price_history') || '[]');
    priceHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    const priceObj = priceHistory.find(p => new Date(p.date) <= new Date()) || priceHistory[0];
    const prices = priceObj ? priceObj.prices : { benzina: {base:0}, gasolio: {base:0}, dieselplus: {base:0}, hvo: {base:0}, adblue: {base:0} };

    const products = ['benzina', 'gasolio', 'dieselplus', 'hvolution', 'adblue'];
    let totals = { benzina: 0, gasolio: 0, dieselplus: 0, hvolution: 0, adblue: 0 };
    let totalLiters = 0, totalServito = 0, revenue = 0;
    const SUR_SELF = 0.005, SUR_SERV = 0.225;

    turni.forEach(t => {
        products.forEach(k => {
            const pp = parseFloat(t.prepay?.[k] || 0);
            const sv = parseFloat(t.servito?.[k] || 0);
            const fd = parseFloat(t.fdt?.[k] || 0);
            const tot = pp + sv + fd;
            totals[k] += tot; totalLiters += tot; totalServito += sv;
            const base = parseFloat(prices[k]?.base || 0);
            if (base > 0) {
                if (k === 'adblue') revenue += tot * base;
                else { revenue += (pp + fd) * (base + SUR_SELF); revenue += sv * (base + SUR_SERV); }
            }
        });
    });

    const servitoPerc = totalLiters > 0 ? ((totalServito / totalLiters) * 100).toFixed(1) : '0.0';
    const imponibile = revenue / 1.22;
    const iva = revenue - imponibile;
    const turniChiusi = turni.map(t => t.turno).join(', ');
    const fmtMoney = (v) => v.toLocaleString('it-IT', {style:'currency', currency:'EUR'});
    const fmtNum = (v) => Math.round(v).toLocaleString('it-IT');

    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Report - ${todayStr}</title><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap" rel="stylesheet"><style>body{font-family:'Montserrat',sans-serif;padding:40px;max-width:210mm;margin:0 auto;color:#333}h1{text-align:center;text-transform:uppercase;border-bottom:2px solid #333;padding-bottom:20px;margin-bottom:30px}.header-info{margin-bottom:30px;font-size:1rem;line-height:1.6;display:flex;justify-content:space-between}.section-title{font-weight:700;font-size:1.2rem;margin-top:30px;margin-bottom:10px;border-bottom:1px solid #ccc}table{width:100%;border-collapse:collapse;margin-bottom:20px}th,td{padding:8px;text-align:left;border-bottom:1px solid #eee}th{background-color:#f9f9f9;font-weight:600}.text-right{text-align:right}.total-row{font-weight:700;font-size:1.1rem;background-color:#f0f0f0}.financial-box{margin-top:40px;padding:20px;border:2px solid #333;border-radius:8px;page-break-inside:avoid}.fin-row{display:flex;justify-content:space-between;margin-bottom:8px;font-size:1rem}.fin-total{font-size:1.4rem;font-weight:700;border-top:2px dashed #ccc;padding-top:15px;margin-top:15px}.bold{font-weight:700}@media print{body{padding:0;margin:2cm}.financial-box{border:2px solid #000}}</style></head><body><h1>Report Giornaliero</h1><div class="header-info"><div><strong>Data:</strong> ${todayStr}</div><div><strong>Turni Chiusi:</strong> ${turniChiusi}</div></div><div class="section-title">Dettaglio Vendite (Litri)</div><table><thead><tr><th>Prodotto</th><th class="text-right">Quantità</th></tr></thead><tbody><tr><td>Benzina</td><td class="text-right">${fmtNum(totals.benzina)}</td></tr><tr><td>Gasolio</td><td class="text-right">${fmtNum(totals.gasolio)}</td></tr><tr><td>Diesel+</td><td class="text-right">${fmtNum(totals.dieselplus)}</td></tr><tr><td>Hvolution</td><td class="text-right">${fmtNum(totals.hvolution)}</td></tr><tr><td>AdBlue</td><td class="text-right">${fmtNum(totals.adblue)}</td></tr></tbody><tfoot><tr class="total-row"><td>TOTALE EROGATO</td><td class="text-right">${fmtNum(totalLiters)} L</td></tr></tfoot></table><p style="text-align:right;">Incidenza Servito: <strong>${servitoPerc}%</strong></p><div class="financial-box"><div class="fin-row"><span>Imponibile (Netto)</span><span class="bold">${fmtMoney(imponibile)}</span></div><div class="fin-row"><span>IVA (22%)</span><span class="bold">${fmtMoney(iva)}</span></div><div class="fin-row fin-total"><span>TOTALE FATTURATO</span><span>${fmtMoney(revenue)}</span></div></div><script>window.onload=function(){window.print();}</script></body></html>`);
    w.document.close();
}

/* INIZIO LOGICA TEMA */
function initTheme() {
    const btnTheme = document.getElementById('btn-theme');
    const body = document.body;
    const updateIcon = (isDark) => { btnTheme.innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>'; lucide.createIcons(); };
    try { const s = localStorage.getItem('polaris_theme'); if(s==='dark'){body.classList.add('dark-mode'); updateIcon(true);}else{updateIcon(false);} } catch(e){updateIcon(false);}
    btnTheme.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        updateIcon(isDark);
        try{localStorage.setItem('polaris_theme', isDark?'dark':'light');}catch(e){}
        if(typeof PrezziModule!=='undefined' && document.getElementById('prezziChart')) PrezziModule.renderChart();
        if(typeof VirtualStationModule!=='undefined' && document.getElementById('chartTrend')) VirtualStationModule.renderCharts(VirtualStationModule.getFilteredTurni());
        if(typeof HomeModule!=='undefined' && document.getElementById('home-content')) HomeModule.render();
    });
}

/* INIZIO LOGICA FULLSCREEN */
function initFullscreen() {
    const btn = document.getElementById('btn-fullscreen');
    btn.addEventListener('click', () => {
        if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch(e=>console.error(e)); btn.innerHTML='<i data-lucide="minimize"></i>'; }
        else { if(document.exitFullscreen) document.exitFullscreen(); btn.innerHTML='<i data-lucide="maximize"></i>'; }
        setTimeout(()=>lucide.createIcons(),100);
    });
}

/* --- SISTEMA MODALE GLOBALE --- */
function initGlobalModal() {
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.addEventListener('click', window.closeModal);
}

window.openModal = function(title, bodyHTML, footerHTML = '', maxWidth = '600px') {
    const modal = document.getElementById('modal-overlay');
    const modalBox = document.querySelector('.modal-box');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalBox || !modalBody) return;

    document.getElementById('modal-title').innerText = title;
    modalBody.innerHTML = bodyHTML;
    modalBox.style.maxWidth = maxWidth;

    const oldFooter = modalBox.querySelector('.modal-footer');
    if (oldFooter) oldFooter.remove();

    if (footerHTML) {
        const footerContainer = document.createElement('div');
        footerContainer.className = 'modal-footer';
        footerContainer.innerHTML = footerHTML;
        modalBox.appendChild(footerContainer);
    }

    modal.classList.remove('hidden');
    lucide.createIcons();
};

window.closeModal = function() {
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.classList.add('hidden');
};

/* MODIFICA: SISTEMA NOTIFICHE A MODALE (Non più Toast) */
window.showNotification = function(message, type = 'info') {
    let title = 'Avviso';
    let iconColor = 'var(--primary-color)';
    let iconName = 'info';
    
    if (type === 'success') {
        title = 'Successo';
        iconColor = '#10b981'; // Verde
        iconName = 'check-circle';
    } else if (type === 'error') {
        title = 'Errore';
        iconColor = '#ef4444'; // Rosso
        iconName = 'alert-circle';
    }

    const bodyHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; border-radius: 50%; background-color: ${iconColor}15; margin-bottom: 15px;">
                <i data-lucide="${iconName}" style="width: 32px; height: 32px; color: ${iconColor};"></i>
            </div>
            <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px;">${title}</h3>
            <p style="color: var(--text-secondary); font-size: 1rem; line-height: 1.5;">${message}</p>
        </div>
    `;

    // Footer semplice con OK
    const footerHTML = `
        <button class="action-btn" style="width: 100%; justify-content: center;" onclick="window.closeModal()">OK</button>
    `;

    // Apre modale piccola
    window.openModal('', bodyHTML, footerHTML, '400px');
};
/* FINE APPLICAZIONE */
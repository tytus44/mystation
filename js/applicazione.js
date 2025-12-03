/* INIZIO CONFIGURAZIONE E VARIABILI GLOBALI */
const mainContent = document.getElementById('main-content');

/* INIZIO INIZIALIZZAZIONE */
document.addEventListener('DOMContentLoaded', () => {
    console.log("--> Applicazione: Avvio (Strumenti come Sezione)...");
    
    initTheme();
    initFullscreen();
    initSidebars(); 
    initNavigation();
    initHeaderActions(); 
    initGlobalModal();
    initGlobalSearch(); 

    // INIZIALIZZAZIONE AGENDA
    if (typeof window.AgendaModule !== 'undefined') {
        window.AgendaModule.init();
    }

    // INIZIALIZZAZIONE CLOUD
    if (typeof CloudModule !== 'undefined') {
        CloudModule.init();
    } else {
        console.warn("Modulo Cloud non trovato");
    }

    lucide.createIcons();
    loadSection('home');
});

/* --- RICERCA GLOBALE --- */
function initGlobalSearch() {
    const input = document.getElementById('global-search-input');
    const btnClear = document.getElementById('global-search-clear');

    if (!input) return;

    input.addEventListener('input', (e) => {
        const term = e.target.value.trim().toLowerCase();
        if (term.length > 0) btnClear.classList.remove('hidden');
        else btnClear.classList.add('hidden');

        if (term.length > 2) {
            performSearch(term);
        } else if (term.length === 0) {
            loadSection('home');
        }
    });

    if (btnClear) {
        btnClear.addEventListener('click', () => {
            input.value = '';
            input.focus();
            btnClear.classList.add('hidden');
            loadSection('home'); 
        });
    }
}

function performSearch(term) {
    const clients = JSON.parse(localStorage.getItem('polaris_clients') || '[]');
    const foundClients = clients.filter(c => c.name.toLowerCase().includes(term));

    const cargo = JSON.parse(localStorage.getItem('polaris_registro_carico') || '[]');
    const productKeys = ['benzina', 'gasolio', 'dieselplus', 'hvolution', 'adblue'];

    const foundCargo = cargo.filter(c => {
        const driver = (c.driver || '').toLowerCase();
        if (driver.includes(term)) return true;
        return productKeys.some(key => {
            return key.includes(term) && (c[key]?.carico > 0);
        });
    });

    foundCargo.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderSearchResults(term, foundClients, foundCargo);
}

function renderSearchResults(term, clients, cargo) {
    loadSection('search');
    const container = document.getElementById('search-content');
    if (!container) return;

    let html = `
        <div style="margin-bottom: 20px;">
            <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-main);">Risultati ricerca: "${term}"</h2>
        </div>
        <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;">
    `;

    html += `<div class="card"><div class="card-header"><span class="card-title">Clienti (${clients.length})</span><i data-lucide="users"></i></div><div class="card-body">`;
    if (clients.length > 0) {
        html += `<ul style="list-style:none; max-height: 400px; overflow-y: auto; padding-right: 5px;">`;
        clients.forEach(c => {
            html += `<li style="padding: 10px; border-bottom: 1px dashed var(--border-color); display: flex; justify-content: space-between; align-items: center;"><span style="font-weight: 600; color: var(--text-main);">${c.name}</span><button class="icon-btn icon-btn-sm" onclick="AmministrazioneModule.openClientModal('${c.id}')"><i data-lucide="arrow-right"></i></button></li>`;
        });
        html += `</ul>`;
    } else {
        html += `<p style="color: var(--text-secondary);">Nessun cliente trovato.</p>`;
    }
    html += `</div></div>`;

    html += `<div class="card"><div class="card-header"><span class="card-title">Carico / Autisti (${cargo.length})</span><i data-lucide="truck"></i></div><div class="card-body">`;
    if (cargo.length > 0) {
        html += `<ul style="list-style:none; max-height: 400px; overflow-y: auto; padding-right: 5px;">`;
        cargo.forEach(c => {
            const d = new Date(c.date).toLocaleDateString();
            const loadedProds = ['benzina', 'gasolio', 'dieselplus', 'hvolution', 'adblue'].filter(k => c[k]?.carico > 0).map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(', ');
            html += `<li style="padding: 10px; border-bottom: 1px dashed var(--border-color); display: flex; justify-content: space-between; align-items: center;"><div><span style="font-weight: 600; display: block; color: var(--text-main);">${c.driver || 'Sconosciuto'}</span><span style="font-size: 0.8rem; color: var(--text-secondary); margin-right: 8px;">${d}</span><span style="font-size: 0.75rem; color: var(--primary-color); font-weight: 500;">${loadedProds}</span></div><button class="icon-btn icon-btn-sm" onclick="CaricoModule.openModalCarico('${c.id}')"><i data-lucide="arrow-right"></i></button></li>`;
        });
        html += `</ul>`;
    } else {
        html += `<p style="color: var(--text-secondary);">Nessun carico trovato.</p>`;
    }
    html += `</div></div></div>`;
    
    container.innerHTML = html;
    lucide.createIcons();
}

/* --- LOGICA SIDEBARS --- */
function initSidebars() {
    const overlay = document.getElementById('sidebar-overlay');
    const leftSidebar = document.getElementById('sidebar-left');
    const rightSidebar = document.getElementById('sidebar-right');
    const btnLeft = document.getElementById('left-sidebar-trigger'); 
    const btnRight = document.getElementById('btn-toggle-right-sidebar');
    const btnMobileMenu = document.getElementById('mobile-menu-trigger');

    function closeAllSidebars() {
        leftSidebar.classList.remove('open');
        rightSidebar.classList.remove('open');
        overlay.classList.remove('active');
    }

    if(btnLeft) {
        btnLeft.addEventListener('click', (e) => {
            e.stopPropagation();
            rightSidebar.classList.remove('open');
            leftSidebar.classList.toggle('open');
            if(leftSidebar.classList.contains('open')) overlay.classList.add('active'); else overlay.classList.remove('active');
        });
    }
    if(btnMobileMenu) {
        btnMobileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            rightSidebar.classList.remove('open');
            leftSidebar.classList.toggle('open');
            if(leftSidebar.classList.contains('open')) overlay.classList.add('active'); else overlay.classList.remove('active');
        });
    }
    if(btnRight) {
        btnRight.addEventListener('click', (e) => {
            e.stopPropagation();
            leftSidebar.classList.remove('open');
            rightSidebar.classList.toggle('open');
            if(rightSidebar.classList.contains('open')) overlay.classList.add('active'); else overlay.classList.remove('active');
        });
    }
    overlay.addEventListener('click', closeAllSidebars);
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', () => { if(link.hasAttribute('data-section')) closeAllSidebars(); });
    });
}

/* INIZIO LOGICA NAVIGAZIONE */
function initNavigation() {
    const allNavLinks = document.querySelectorAll('.sidebar-link[data-section], .nav-link[data-section]');
    allNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            allNavLinks.forEach(l => l.classList.remove('active'));
            const btn = e.currentTarget;
            const sectionName = btn.getAttribute('data-section');
            const linksToActivate = document.querySelectorAll(`[data-section="${sectionName}"]`);
            linksToActivate.forEach(l => l.classList.add('active'));
            loadSection(sectionName);
        });
    });
    
    // MODIFICA: Il pulsante "btn-sidebar-strumenti" non esiste più come ID, ora è gestito dal loop sopra
}

function loadSection(sectionName) {
    let contentHTML = '';
    let postRenderAction = null;

    if (sectionName !== 'search') {
        const inp = document.getElementById('global-search-input');
        if (inp) inp.value = '';
        const clr = document.getElementById('global-search-clear');
        if (clr) clr.classList.add('hidden');
    }

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
        case 'strumenti': // NUOVO CASE
            contentHTML = `<div id="strumenti-content"></div>`;
            postRenderAction = () => { if (typeof StrumentiModule !== 'undefined') StrumentiModule.init(); };
            break;
        case 'search': 
            contentHTML = `<div id="search-content"></div>`;
            break;
        default:
            console.warn("Sezione non trovata:", sectionName);
            contentHTML = `<div style="padding: 20px; text-align: center;"><h2>Sezione in costruzione</h2></div>`;
    }

    mainContent.innerHTML = contentHTML;
    lucide.createIcons();
    if (postRenderAction) setTimeout(postRenderAction, 50);
}

function initHeaderActions() {
    const btnAgenda = document.getElementById('btn-agenda');
    if(btnAgenda) {
        const newAgenda = btnAgenda.cloneNode(true);
        btnAgenda.parentNode.replaceChild(newAgenda, btnAgenda);
        newAgenda.addEventListener('click', () => { if(typeof AgendaModule !== 'undefined') AgendaModule.openMainModal(); });
    }
    const bindAction = (id, callback) => {
        const el = document.getElementById(id);
        if(el) {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            newEl.addEventListener('click', (e) => { callback(e); });
        }
    };
    bindAction('action-sync-now', () => { if(typeof CloudModule !== 'undefined') CloudModule.syncData(true); });
    bindAction('action-print-report', printDailyReport);
    bindAction('action-export', exportGeneralBackup);
    
    const importTrigger = document.getElementById('action-import');
    const importInput = document.getElementById('input-general-import');
    if(importTrigger && importInput) {
        const newTrig = importTrigger.cloneNode(true);
        importTrigger.parentNode.replaceChild(newTrig, importTrigger);
        newTrig.addEventListener('click', () => importInput.click());
        importInput.removeEventListener('change', importGeneralBackup);
        importInput.addEventListener('change', importGeneralBackup);
    }
    const btnLogin = document.getElementById('btn-cloud-login');
    if(btnLogin) {
        const newLogin = btnLogin.cloneNode(true);
        btnLogin.parentNode.replaceChild(newLogin, btnLogin);
        newLogin.addEventListener('click', () => { if(typeof CloudModule !== 'undefined') CloudModule.loginWithGoogle(); });
    }
    const btnLogout = document.getElementById('action-logout');
    if(btnLogout) {
        const newLogout = btnLogout.cloneNode(true);
        btnLogout.parentNode.replaceChild(newLogout, btnLogout);
        newLogout.addEventListener('click', () => { if(typeof CloudModule !== 'undefined') CloudModule.logout(); });
    }
}

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
                agenda: JSON.parse(localStorage.getItem('polaris_agenda') || '[]'),
                theme: localStorage.getItem('polaris_theme')
            }
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
        const a = document.createElement('a'); a.setAttribute("href", dataStr); a.setAttribute("download", "polaris_backup.json");
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
            const bodyHTML = `<div style="text-align:center; padding:20px;"><i data-lucide="alert-triangle" style="width:48px; height:48px; color:var(--col-destructive); margin-bottom:15px;"></i><h3 style="font-size:1.2rem; font-weight:700; color:var(--text-main); margin-bottom:10px;">Sovrascrivere tutti i dati?</h3><p style="color:var(--text-secondary); font-size:0.95rem; line-height:1.5;">L'azione è irreversibile e sostituirà i dati locali.</p></div>`;
            const footerHTML = `<div class="btn-group"><button id="btn-cancel-imp" class="action-btn btn-cancel">ANNULLA</button><button id="btn-confirm-imp" class="action-btn btn-delete">RIPRISTINA</button></div>`;
            window.openModal('Ripristino Backup', bodyHTML, footerHTML, '450px');
            setTimeout(() => {
                document.getElementById('btn-cancel-imp').onclick = window.closeModal;
                document.getElementById('btn-confirm-imp').onclick = async () => {
                    const d = json.data;
                    if(d.turni) localStorage.setItem('polaris_turni', JSON.stringify(d.turni));
                    if(d.clients) localStorage.setItem('polaris_clients', JSON.stringify(d.clients));
                    if(d.carico) localStorage.setItem('polaris_registro_carico', JSON.stringify(d.carico));
                    if(d.stockPrev) localStorage.setItem('polaris_registro_stock_prev', JSON.stringify(d.stockPrev));
                    if(d.priceHistory) localStorage.setItem('polaris_price_history', JSON.stringify(d.priceHistory));
                    if(d.lastPrices) localStorage.setItem('polaris_last_prices', JSON.stringify(d.lastPrices));
                    if(d.competitors) localStorage.setItem('polaris_competitors', JSON.stringify(d.competitors));
                    if(d.agenda) localStorage.setItem('polaris_agenda', JSON.stringify(d.agenda));
                    if(d.theme) localStorage.setItem('polaris_theme', d.theme);
                    localStorage.setItem('polaris_last_sync', Date.now());
                    if (typeof CloudModule !== 'undefined' && CloudModule.user) {
                        try { await CloudModule.pushDataToCloud(); } catch (err) { console.error("Errore upload cloud post-import", err); }
                    }
                    window.closeModal(); location.reload();
                };
            }, 0);
        } catch (err) { window.showNotification('File non valido', 'error'); }
    };
    reader.readAsText(file); e.target.value = ''; 
}

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
            const pp = parseFloat(t.prepay?.[k] || 0); const sv = parseFloat(t.servito?.[k] || 0); const fd = parseFloat(t.fdt?.[k] || 0);
            const tot = pp + sv + fd; totals[k] += tot; totalLiters += tot; totalServito += sv;
            const base = parseFloat(prices[k]?.base || 0);
            if (base > 0) { if (k === 'adblue') revenue += tot * base; else { revenue += (pp + fd) * (base + SUR_SELF); revenue += sv * (base + SUR_SERV); } }
        });
    });
    const servitoPerc = totalLiters > 0 ? ((totalServito / totalLiters) * 100).toFixed(1) : '0.0';
    const imponibile = revenue / 1.22; const iva = revenue - imponibile;
    const turniChiusi = turni.map(t => t.turno).join(', ');
    const fmtMoney = (v) => v.toLocaleString('it-IT', {style:'currency', currency:'EUR'});
    const fmtNum = (v) => Math.round(v).toLocaleString('it-IT');
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Report - ${todayStr}</title><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap" rel="stylesheet"><style>body{font-family:'Montserrat',sans-serif;padding:40px;max-width:210mm;margin:0 auto;color:#333}h1{text-align:center;text-transform:uppercase;border-bottom:2px solid #333;padding-bottom:20px;margin-bottom:30px}.header-info{margin-bottom:30px;font-size:1rem;line-height:1.6;display:flex;justify-content:space-between}.section-title{font-weight:700;font-size:1.2rem;margin-top:30px;margin-bottom:10px;border-bottom:1px solid #ccc}table{width:100%;border-collapse:collapse;margin-bottom:20px}th,td{padding:8px;text-align:left;border-bottom:1px solid #eee}th{background-color:#f9f9f9;font-weight:600}.text-right{text-align:right}.total-row{font-weight:700;font-size:1.1rem;background-color:#f0f0f0}.financial-box{margin-top:40px;padding:20px;border:2px solid #333;border-radius:8px;page-break-inside:avoid}.fin-row{display:flex;justify-content:space-between;margin-bottom:8px;font-size:1rem}.fin-total{font-size:1.4rem;font-weight:700;border-top:2px dashed #ccc;padding-top:15px;margin-top:15px}.bold{font-weight:700}@media print{body{padding:0;margin:2cm}.financial-box{border:2px solid #000}}</style></head><body><h1>Report Giornaliero</h1><div class="header-info"><div><strong>Data:</strong> ${todayStr}</div><div><strong>Turni Chiusi:</strong> ${turniChiusi}</div></div><div class="section-title">Dettaglio Vendite (Litri)</div><table><thead><tr><th>Prodotto</th><th class="text-right">Quantità</th></tr></thead><tbody><tr><td>Benzina</td><td class="text-right">${fmtNum(totals.benzina)}</td></tr><tr><td>Gasolio</td><td class="text-right">${fmtNum(totals.gasolio)}</td></tr><tr><td>Diesel+</td><td class="text-right">${fmtNum(totals.dieselplus)}</td></tr><tr><td>Hvolution</td><td class="text-right">${fmtNum(totals.hvolution)}</td></tr><tr><td>AdBlue</td><td class="text-right">${fmtNum(totals.adblue)}</td></tr></tbody><tfoot><tr class="total-row"><td>TOTALE EROGATO</td><td class="text-right">${fmtNum(totalLiters)} L</td></tr></tfoot></table><p style="text-align:right;">Incidenza Servito: <strong>${servitoPerc}%</strong></p><div class="financial-box"><div class="fin-row"><span>Imponibile (Netto)</span><span class="bold">${fmtMoney(imponibile)}</span></div><div class="fin-row"><span>IVA (22%)</span><span class="bold">${fmtMoney(iva)}</span></div><div class="fin-row fin-total"><span>TOTALE FATTURATO</span><span>${fmtMoney(revenue)}</span></div></div><script>window.onload=function(){window.print();}</script></body></html>`);
    w.document.close();
}

function initTheme() {
    const btnTheme = document.getElementById('btn-theme');
    const body = document.body;
    try { const s = localStorage.getItem('polaris_theme'); if(s === 'dark') body.classList.add('dark-mode'); } catch(e){}
    if(btnTheme) {
        const newBtn = btnTheme.cloneNode(true);
        btnTheme.parentNode.replaceChild(newBtn, btnTheme);
        newBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            try{ localStorage.setItem('polaris_theme', isDark ? 'dark' : 'light'); } catch(e){}
            if(typeof PrezziModule!=='undefined' && document.getElementById('prezziChart')) PrezziModule.renderChart();
            if(typeof VirtualStationModule!=='undefined' && document.getElementById('chartTrend')) VirtualStationModule.renderCharts(VirtualStationModule.getFilteredTurni());
            if(typeof HomeModule!=='undefined' && document.getElementById('home-content')) HomeModule.render();
        });
    }
}

function initFullscreen() {
    const btn = document.getElementById('btn-fullscreen');
    if(btn) {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch(e=>console.error(e)); } else { if(document.exitFullscreen) document.exitFullscreen(); }
        });
    }
}

function initGlobalModal() {
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
        const newBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newBtn, closeBtn);
        newBtn.addEventListener('click', window.closeModal);
    }
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

window.showNotification = function(message, type = 'info') {
    let title = 'Avviso'; let iconColor = 'var(--primary-color)'; let iconName = 'info';
    if (type === 'success') { title = 'Successo'; iconColor = '#10b981'; iconName = 'check-circle'; } else if (type === 'error') { title = 'Errore'; iconColor = '#ef4444'; iconName = 'alert-circle'; }
    const bodyHTML = `<div style="text-align: center; padding: 20px;"><div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; border-radius: 50%; background-color: ${iconColor}15; margin-bottom: 15px;"><i data-lucide="${iconName}" style="width: 32px; height: 32px; color: ${iconColor};"></i></div><h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px;">${title}</h3><p style="color: var(--text-secondary); font-size: 1rem; line-height: 1.5;">${message}</p></div>`;
    const footerHTML = `<button class="action-btn" style="width: 100%; justify-content: center;" onclick="window.closeModal()">OK</button>`;
    window.openModal('', bodyHTML, footerHTML, '400px');
};
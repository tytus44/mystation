// =============================================
// FILE: home.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Home / Dashboard con layout ottimizzato.
// Convertito da Alpine.js a vanilla JavaScript
// =============================================

// === STATO LOCALE DEL MODULO HOME ===
let homeState = {
    // Calcolatore IVA
    ivaCalculator: {
        importoLordo: null,
        risultati: {
            imponibile: 0,
            iva: 0,
        }
    },
    
    // Calendario
    calendar: {
        currentDate: new Date(),
        monthYear: '',
        days: []
    },
    
    // Ordine carburante (persistente)
    ordineCarburante: null // Sarà caricato dal localStorage
};

// === INIZIALIZZAZIONE MODULO HOME ===
// Inizio funzione initHome
function initHome() {
    console.log('🏠 Inizializzazione modulo Home...');
    
    // Carica stato ordine carburante
    homeState.ordineCarburante = this.loadFromStorage('ordineCarburante', {
        benzina: 0,
        gasolio: 0,
        dieselPlus: 0,
        hvolution: 0
    });
    
    // Inizializza calendario
    initCalendar.call(this);
    
    console.log('✅ Modulo Home inizializzato');
}
// Fine funzione initHome

// === RENDER SEZIONE HOME ===
// Inizio funzione renderHomeSection
function renderHomeSection(container) {
    console.log('🎨 Rendering sezione Home...');
    
    const app = this;
    const stats = getHomeDashboardStats.call(app);

    const colors = {
        benzina: '#10b981',
        gasolio: '#f59e0b',
        dieselplus: '#dc2626',
        hvolution: '#06b6d4',
        adblue: '#6b7280'
    };

    const turniText = stats.shiftCount > 0 ? `(${stats.shiftNames})` : '';
    
    container.innerHTML = `
        <div class="space-y-6">

            <div class="grid grid-cols-3 gap-6">
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Litri venduti oggi</div>
                        <div class="stat-value">${app.formatInteger(stats.totalLitersToday)}</div>
                        <div class="text-xs text-secondary mt-1 flex space-x-2 items-center flex-wrap">
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.benzina};"></div>
                            <span>${app.formatInteger(stats.productLiters.benzina)}</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.gasolio};"></div>
                            <span>${app.formatInteger(stats.productLiters.gasolio)}</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.dieselplus};"></div>
                            <span>${app.formatInteger(stats.productLiters.dieselplus)}</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.hvolution};"></div>
                            <span>${app.formatInteger(stats.productLiters.hvolution)}</span>
                             <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.adblue};"></div>
                            <span>${app.formatInteger(stats.productLiters.adblue)}</span>
                        </div>
                    </div>
                    <div class="stat-icon blue"><i data-lucide="fuel"></i></div>
                </div>
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">% Servito Oggi</div>
                        <div class="stat-value">${stats.overallServitoPercentage}%</div>
                        <div class="text-xs text-secondary mt-1 flex space-x-2 items-center flex-wrap">
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.benzina};"></div>
                            <span>${stats.productServitoPercentages.benzina}%</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.gasolio};"></div>
                            <span>${stats.productServitoPercentages.gasolio}%</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.dieselplus};"></div>
                            <span>${stats.productServitoPercentages.dieselplus}%</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.hvolution};"></div>
                            <span>${stats.productServitoPercentages.hvolution}%</span>
                        </div>
                    </div>
                    <div class="stat-icon purple"><i data-lucide="user-check"></i></div>
                </div>
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Fatturato giornaliero</div>
                        <div class="stat-value">${app.formatCurrency(stats.totalRevenueToday)}</div>
                        <div class="text-xs text-secondary mt-1">${stats.shiftCount} turni aperti ${turniText}</div>
                    </div>
                    <div class="stat-icon green"><i data-lucide="euro"></i></div>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-6">
                
                <div class="card">
                    <div class="card-header">
                        <div class="flex items-center justify-between w-full">
                            <h3 class="card-title">Calendario</h3>
                            <div class="flex items-center space-x-2">
                                <button id="calendar-prev" class="calendar-nav-btn">
                                    <i data-lucide="chevron-left"></i>
                                </button>
                                <span id="calendar-month-year" class="calendar-title"></span>
                                <button id="calendar-next" class="calendar-nav-btn">
                                    <i data-lucide="chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div id="calendar-container" class="calendar-grid">
                            <div class="calendar-day-header">Lun</div>
                            <div class="calendar-day-header">Mar</div>
                            <div class="calendar-day-header">Mer</div>
                            <div class="calendar-day-header">Gio</div>
                            <div class="calendar-day-header">Ven</div>
                            <div class="calendar-day-header">Sab</div>
                            <div class="calendar-day-header sunday">Dom</div>
                            </div>
                    </div>
                    <div class="p-4 pt-2">
                        <div id="calendar-today-display-box" class="product-box p-3 text-center" style="background-color: rgba(37, 99, 235, 0.05); border-color: rgba(37, 99, 235, 0.3);">
                            </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Calcolatore IVA (22%)</h3>
                    </div>
                    <div class="card-body space-y-4">
                        <div class="form-group">
                            <label class="form-label">Importo Lordo (€)</label>
                            <input type="number" id="iva-importo" step="0.01" placeholder="0.00" 
                                   class="form-control text-lg" value="${homeState.ivaCalculator.importoLordo || ''}">
                        </div>
                        <button id="calcola-iva-btn" class="btn btn-success w-full text-lg font-medium">
                            Calcola
                        </button>
                        <div id="iva-risultati" class="space-y-4">
                            <div class="product-box p-3" style="background-color: rgba(6, 182, 212, 0.05); border-color: rgba(6, 182, 212, 0.3);">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium" style="color: var(--color-info);">Importo Lordo</span>
                                    <span id="iva-lordo" class="text-lg font-bold" style="color: var(--color-info);">${app.formatCurrency(homeState.ivaCalculator.importoLordo || 0)}</span>
                                </div>
                            </div>
                            <div class="product-box p-3" style="background-color: rgba(37, 99, 235, 0.05); border-color: rgba(37, 99, 235, 0.3);">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium" style="color: var(--color-primary);">Imponibile</span>
                                    <span id="iva-imponibile" class="text-lg font-bold" style="color: var(--color-primary);">${app.formatCurrency(homeState.ivaCalculator.risultati.imponibile)}</span>
                                </div>
                            </div>
                            <div class="product-box p-3" style="background-color: rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.3);">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium" style="color: var(--color-warning);">IVA</span>
                                    <span id="iva-iva" class="text-lg font-bold text-warning">${app.formatCurrency(homeState.ivaCalculator.risultati.iva)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Calcolo Ordine Carburante</h3>
                    </div>
                    <div class="card-body space-y-4" id="carburante-container">
                        </div>
                </div>
            </div>
        </div>
    `;
    
    // Setup event listeners
    setupHomeEventListeners.call(app);
    
    // Render componenti dinamici
    renderCalendar.call(app);
    renderTodayDisplay.call(app);
    renderOrdineCarburante.call(app);
    
    // Refresh icone
    app.refreshIcons();
}
// Fine funzione renderHomeSection

// === SETUP EVENT LISTENERS HOME ===
// Inizio funzione setupHomeEventListeners
function setupHomeEventListeners() {
    const app = this;
    
    // Calendario navigation
    const prevBtn = document.getElementById('calendar-prev');
    const nextBtn = document.getElementById('calendar-next');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            changeMonth.call(app, -1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            changeMonth.call(app, 1);
        });
    }
    
    // Calcolatore IVA
    const calcolaIvaBtn = document.getElementById('calcola-iva-btn');
    if (calcolaIvaBtn) {
        calcolaIvaBtn.addEventListener('click', () => {
            calcolaIva.call(app);
        });
    }
    
    // Auto-calcolo IVA quando cambiano i valori
    const ivaImporto = document.getElementById('iva-importo');
    
    if (ivaImporto) {
        ivaImporto.addEventListener('input', () => {
            homeState.ivaCalculator.importoLordo = parseFloat(ivaImporto.value) || null;
            updateIvaDisplay.call(app);
        });
    }
}
// Fine funzione setupHomeEventListeners

// === FUNZIONI CALCOLATORE IVA ===
// Inizio funzione calcolaIva
function calcolaIva() {
    const lordo = parseFloat(homeState.ivaCalculator.importoLordo);
    if (isNaN(lordo) || lordo <= 0) {
        this.showNotification('Inserire un importo lordo valido.');
        return;
    }
    
    const aliquota = 22 / 100; // IVA fissa al 22%
    const imponibile = lordo / (1 + aliquota);
    
    homeState.ivaCalculator.risultati.imponibile = imponibile;
    homeState.ivaCalculator.risultati.iva = lordo - imponibile;
    
    updateIvaDisplay.call(this);
}
// Fine funzione calcolaIva

// Inizio funzione updateIvaDisplay
function updateIvaDisplay() {
    const lordoEl = document.getElementById('iva-lordo');
    const imponibileEl = document.getElementById('iva-imponibile');
    const ivaEl = document.getElementById('iva-iva');
    
    if (lordoEl) {
        lordoEl.textContent = this.formatCurrency(homeState.ivaCalculator.importoLordo || 0);
    }
    if (imponibileEl) {
        imponibileEl.textContent = this.formatCurrency(homeState.ivaCalculator.risultati.imponibile);
    }
    if (ivaEl) {
        ivaEl.textContent = this.formatCurrency(homeState.ivaCalculator.risultati.iva);
    }
}
// Fine funzione updateIvaDisplay

// === FUNZIONI CALENDARIO ===
// Inizio funzione initCalendar
function initCalendar() {
    renderCalendar.call(this);
}
// Fine funzione initCalendar

// Inizio funzione renderCalendar
function renderCalendar() {
    const date = homeState.calendar.currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                       'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    homeState.calendar.monthYear = `${monthNames[month]} ${year}`;

    // Aggiorna titolo
    const monthYearEl = document.getElementById('calendar-month-year');
    if (monthYearEl) {
        monthYearEl.textContent = homeState.calendar.monthYear;
    }

    // Calcola giorni
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const firstDayIndex = (firstDayOfMonth + 6) % 7; // Converte per iniziare da lunedì
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    
    let daysArray = [];
    
    // Celle vuote per i giorni prima del primo del mese
    for (let i = 0; i < firstDayIndex; i++) {
        daysArray.push({ 
            value: '', 
            isToday: false, 
            isHoliday: false, 
            isSunday: false 
        });
    }
    
    // Data di oggi in fuso orario italiano
    const oggi = new Date();
    const oggiItalia = new Date(oggi.toLocaleString("en-US", {timeZone: "Europe/Rome"}));
    
    // Giorni del mese
    for (let i = 1; i <= lastDateOfMonth; i++) {
        const dataCorrente = new Date(year, month, i);
        
        const isToday = i === oggiItalia.getDate() && 
                       month === oggiItalia.getMonth() && 
                       year === oggiItalia.getFullYear();
        
        const isSunday = isDomenica(dataCorrente);
        const isHoliday = isFestivaItaliana.call(this, dataCorrente);
        
        daysArray.push({ 
            value: i, 
            isToday: isToday,
            isHoliday: isHoliday,
            isSunday: isSunday
        });
    }
    
    homeState.calendar.days = daysArray;
    renderCalendarDays();
}
// Fine funzione renderCalendar

// Inizio funzione renderCalendarDays
function renderCalendarDays() {
    const container = document.getElementById('calendar-container');
    if (!container) return;
    
    // Rimuovi solo i giorni, mantieni gli header
    const dayElements = container.querySelectorAll('.calendar-day');
    dayElements.forEach(el => el.remove());
    
    // Aggiungi i giorni
    homeState.calendar.days.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day.value;
        
        if (day.isToday) dayEl.classList.add('today');
        if (day.isHoliday) dayEl.classList.add('holiday');
        if (day.isSunday) dayEl.classList.add('sunday');
        if (!day.value) dayEl.classList.add('empty');
        
        container.appendChild(dayEl);
    });
}
// Fine funzione renderCalendarDays

// Inizio funzione renderTodayDisplay
function renderTodayDisplay() {
    const today = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const formattedDate = today.toLocaleDateString('it-IT', options);
    
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    const container = document.getElementById('calendar-today-display-box');
    if (container) {
        container.innerHTML = `<span class="font-medium text-primary">${capitalizedDate}</span>`;
    }
}
// Fine funzione renderTodayDisplay

// Inizio funzione changeMonth
function changeMonth(offset) {
    const newDate = new Date(homeState.calendar.currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    homeState.calendar.currentDate = newDate;
    renderCalendar.call(this);
}
// Fine funzione changeMonth

// === FUNZIONI FESTIVITÀ ITALIANE ===
// Inizio funzione calcolaPasqua
function calcolaPasqua(anno) {
    const a = anno % 19;
    const b = Math.floor(anno / 100);
    const c = anno % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mese = Math.floor((h + l - 7 * m + 114) / 31);
    const giorno = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(anno, mese - 1, giorno);
}
// Fine funzione calcolaPasqua

// Inizio funzione isFestivaItaliana
function isFestivaItaliana(data) {
    const giorno = data.getDate();
    const mese = data.getMonth() + 1;
    const anno = data.getFullYear();
    
    // Festività fisse
    const festivitaFisse = [
        { giorno: 1, mese: 1 },   // Capodanno
        { giorno: 6, mese: 1 },   // Epifania
        { giorno: 25, mese: 4 },  // Festa della Liberazione
        { giorno: 1, mese: 5 },   // Festa del Lavoro
        { giorno: 2, mese: 6 },   // Festa della Repubblica
        { giorno: 15, mese: 8 },  // Ferragosto
        { giorno: 1, mese: 11 },  // Ognissanti
        { giorno: 8, mese: 12 },  // Immacolata Concezione
        { giorno: 25, mese: 12 }, // Natale
        { giorno: 26, mese: 12 }  // Santo Stefano
    ];
    
    const isFestivaFissa = festivitaFisse.some(festiva => 
        festiva.giorno === giorno && festiva.mese === mese
    );
    
    if (isFestivaFissa) return true;
    
    // Festività mobili (Pasqua e Lunedì dell'Angelo)
    const pasqua = calcolaPasqua(anno);
    const lunediDellAngelo = new Date(pasqua);
    lunediDellAngelo.setDate(pasqua.getDate() + 1);
    
    const dataCorrente = new Date(anno, mese - 1, giorno);
    return (dataCorrente.getTime() === pasqua.getTime() || 
            dataCorrente.getTime() === lunediDellAngelo.getTime());
}
// Fine funzione isFestivaItaliana

// Inizio funzione isDomenica
function isDomenica(data) {
    return data.getDay() === 0; // 0 = domenica
}
// Fine funzione isDomenica

// === FUNZIONI ORDINE CARBURANTE ===
// Inizio funzione renderOrdineCarburante
function renderOrdineCarburante() {
    const container = document.getElementById('carburante-container');
    if (!container) return;
    
    const app = this;
    const prodotti = [
        { key: 'benzina', name: 'Benzina', color: 'green', textColorClass: 'text-success' },
        { key: 'gasolio', name: 'Gasolio', color: 'yellow', textColorClass: 'text-warning' },
        { key: 'dieselPlus', name: 'Diesel+', color: 'red', textColorClass: 'text-danger' },
        { key: 'hvolution', name: 'Hvolution', color: 'blue', textColorClass: 'text-info' }
    ];
    
    const prezzi = getLatestPrices.call(app);
    
    let html = '';
    
    prodotti.forEach(prodotto => {
        const prezzo = prezzi[prodotto.key] || 0;
        const quantita = homeState.ordineCarburante[prodotto.key];
        const importo = quantita * prezzo;
        
        html += `
            <div class="flex items-center justify-between p-3 bg-${prodotto.color}-50 rounded-lg">
                <div style="width: 125px;">
                    <span class="text-sm font-medium ${prodotto.textColorClass}">${prodotto.name}</span>
                    <div class="text-xs text-secondary">${app.formatCurrency(prezzo, true)}/L</div>
                </div>
                <div style="width: 200px;">
                    <div class="number-input-group">
                        <button type="button" class="number-input-btn" data-action="decrement" data-product="${prodotto.key}">
                            <i data-lucide="minus"></i>
                        </button>
                        <input type="text" id="carburante-quantita-${prodotto.key}" value="${app.formatInteger(quantita)}" readonly class="number-input-field" />
                        <button type="button" class="number-input-btn" data-action="increment" data-product="${prodotto.key}">
                            <i data-lucide="plus"></i>
                        </button>
                    </div>
                </div>
                <div class="text-right" style="width: 125px;">
                    <span id="carburante-importo-${prodotto.key}" class="text-sm font-bold text-${prodotto.color}">${app.formatCurrency(importo)}</span>
                </div>
            </div>
        `;
    });
    
    // Totale
    const totaleLitri = getTotaleLitri.call(app);
    const totaleImporto = getTotaleImporto.call(app);
    
    html += `
        <div class="product-box mt-4 p-4" style="background-color: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.3);">
            <div class="flex items-end justify-between">
                <div>
                    <div class="text-sm text-secondary">Prodotti:</div>
                    <div class="text-xl font-bold text-primary">Totale</div>
                </div>
                <div>
                    <div class="text-sm text-secondary text-right">Litri:</div>
                    <div id="carburante-totale-litri" class="text-xl font-bold text-primary text-right">${app.formatInteger(totaleLitri)}</div>
                </div>
                <div>
                    <div class="text-sm text-secondary text-right">Importo:</div>
                    <div id="carburante-totale-importo" class="text-xl font-bold text-success text-right">${app.formatCurrency(totaleImporto)}</div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Setup event listeners per i pulsanti
    setupCarburanteEventListeners.call(app);
    
    // Refresh icone
    app.refreshIcons();
}
// Fine funzione renderOrdineCarburante

// Inizio funzione setupCarburanteEventListeners
function setupCarburanteEventListeners() {
    const app = this;
    const buttons = document.querySelectorAll('[data-action][data-product]');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            const product = btn.getAttribute('data-product');
            
            if (action === 'increment') {
                incrementCarburante.call(app, product);
            } else if (action === 'decrement') {
                decrementCarburante.call(app, product);
            }
        });
    });
}
// Fine funzione setupCarburanteEventListeners

// Inizio funzione incrementCarburante
function incrementCarburante(prodotto) {
    homeState.ordineCarburante[prodotto] += 1000;
    this.saveToStorage('ordineCarburante', homeState.ordineCarburante);
    updateOrdineCarburanteUI.call(this, prodotto);
}
// Fine funzione incrementCarburante

// Inizio funzione decrementCarburante
function decrementCarburante(prodotto) {
    if (homeState.ordineCarburante[prodotto] >= 1000) {
        homeState.ordineCarburante[prodotto] -= 1000;
        this.saveToStorage('ordineCarburante', homeState.ordineCarburante);
        updateOrdineCarburanteUI.call(this, prodotto);
    }
}
// Fine funzione decrementCarburante

// Inizio funzione updateOrdineCarburanteUI
function updateOrdineCarburanteUI(prodotto) {
    const app = this;
    const quantita = homeState.ordineCarburante[prodotto];
    const importo = calcolaImportoCarburante.call(app, prodotto);

    // Aggiorna campi specifici del prodotto
    const quantitaEl = document.getElementById(`carburante-quantita-${prodotto}`);
    const importoEl = document.getElementById(`carburante-importo-${prodotto}`);
    if (quantitaEl) quantitaEl.value = app.formatInteger(quantita);
    if (importoEl) importoEl.textContent = app.formatCurrency(importo);

    // Aggiorna totali
    const totaleLitri = getTotaleLitri.call(app);
    const totaleImporto = getTotaleImporto.call(app);

    const totaleLitriEl = document.getElementById('carburante-totale-litri');
    const totaleImportoEl = document.getElementById('carburante-totale-importo');
    if (totaleLitriEl) totaleLitriEl.textContent = app.formatInteger(totaleLitri);
    if (totaleImportoEl) totaleImportoEl.textContent = app.formatCurrency(totaleImporto);
}
// Fine funzione updateOrdineCarburanteUI

// Inizio funzione getLatestPrices
function getLatestPrices() {
    if (!Array.isArray(this.state.data.priceHistory) || this.state.data.priceHistory.length === 0) {
        return { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0, adblue: 0 };
    }
    return [...this.state.data.priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}
// Fine funzione getLatestPrices

// Inizio funzione calcolaImportoCarburante
function calcolaImportoCarburante(prodotto) {
    const litri = homeState.ordineCarburante[prodotto] || 0;
    const prezzi = getLatestPrices.call(this);
    const prezzo = prezzi[prodotto] || 0;
    return litri * prezzo;
}
// Fine funzione calcolaImportoCarburante

// Inizio funzione getTotaleLitri
function getTotaleLitri() {
    return Object.values(homeState.ordineCarburante).reduce((total, litri) => total + litri, 0);
}
// Fine funzione getTotaleLitri

// Inizio funzione getTotaleImporto
function getTotaleImporto() {
    const prodotti = ['benzina', 'gasolio', 'dieselPlus', 'hvolution'];
    return prodotti.reduce((total, prodotto) => {
        return total + calcolaImportoCarburante.call(this, prodotto);
    }, 0);
}
// Fine funzione getTotaleImporto

// === FUNZIONI STATISTICHE HOME ===
// Inizio funzione getHomeDashboardStats
function getHomeDashboardStats() {
    const app = this;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTurni = app.state.data.turni.filter(t => {
        const turnoDate = new Date(t.date);
        return turnoDate >= today && turnoDate < tomorrow;
    });

    const shiftCount = todayTurni.length;
    const shiftNames = todayTurni.map(t => t.turno).join(', ');
    const prices = getLatestPrices.call(this);

    let totalIperself = 0;
    let totalServito = 0;
    let totalRevenue = 0;
    const productTotals = {
        benzina: { servito: 0, iperself: 0 },
        gasolio: { servito: 0, iperself: 0 },
        dieselplus: { servito: 0, iperself: 0 },
        hvolution: { servito: 0, iperself: 0 },
        adblue: { servito: 0, iperself: 0 }
    };

    todayTurni.forEach(turno => {
        for (const product in productTotals) {
            const iperselfL = parseFloat(turno.iperself?.[product]) || 0;
            const servitoL = parseFloat(turno.servito?.[product]) || 0;
            
            productTotals[product].iperself += iperselfL;
            productTotals[product].servito += servitoL;
            
            if (product !== 'adblue') {
                totalIperself += iperselfL;
            }
            totalServito += servitoL;
            
            const priceKey = product === 'dieselplus' ? 'dieselPlus' : product;
            const basePrice = prices[priceKey] || 0;

            if (basePrice > 0) {
                if (product === 'adblue') {
                    totalRevenue += servitoL * basePrice;
                } else {
                    const maggiorazione_iperself = 0.005;
                    const maggiorazione_servito = 0.210;
                    const maggiorazione_base_servito = 0.015;

                    const prezzo_iperself = basePrice + maggiorazione_iperself;
                    const prezzo_servito = basePrice + maggiorazione_base_servito + maggiorazione_servito;

                    totalRevenue += (iperselfL * prezzo_iperself) + (servitoL * prezzo_servito);
                }
            }
        }
    });

    const totalLitersToday = totalIperself + totalServito;
    const overallServitoPercentage = totalLitersToday > 0 ? Math.round((totalServito / totalLitersToday) * 100) : 0;
    
    const productLiters = {};
    const productServitoPercentages = {};
    for (const product in productTotals) {
        const pTotal = productTotals[product].servito + productTotals[product].iperself;
        productLiters[product] = pTotal;
        productServitoPercentages[product] = pTotal > 0 ? Math.round((productTotals[product].servito / pTotal) * 100) : 0;
    }

    return {
        totalLitersToday: totalLitersToday,
        overallServitoPercentage: overallServitoPercentage,
        productServitoPercentages: productServitoPercentages,
        totalRevenueToday: totalRevenue,
        shiftCount: shiftCount,
        shiftNames: shiftNames,
        productLiters: productLiters
    };
}
// Fine funzione getHomeDashboardStats

// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initHome = initHome;
    window.renderHomeSection = renderHomeSection;
    window.homeState = homeState;
}
// =============================================
// FILE: home.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Home / Dashboard (Layout Principale e Statistiche).
// (Componenti Calendario, Calcolatrice, ToDo, Utilities estratti)
// =============================================

// === STATO LOCALE DEL MODULO HOME ===
// Rimosse le chiavi: ivaCalculator, banconoteCounter, activeHomeCardTab, calendar, ordineCarburante, calculator, todos, editingTodo
let homeState = {
    // Eventuali stati specifici della home rimasti (se ce ne fossero)
};

// === INIZIALIZZAZIONE MODULO HOME ===
function initHome() {
    console.log('🏠 Inizializzazione modulo Home...');
    const app = this; // 'this' si riferisce all'istanza App

    // Inizializza i moduli estratti
    if (typeof initCalendarModule === 'function') {
        initCalendarModule.call(app);
    } else {
        console.warn("Modulo Calendario (initCalendarModule) non trovato.");
    }

    if (typeof initCalculatorModule === 'function') {
        initCalculatorModule.call(app);
    } else {
        console.warn("Modulo Calcolatrice (initCalculatorModule) non trovato.");
    }

    if (typeof initTodoModule === 'function') {
        initTodoModule.call(app);
    } else {
        console.warn("Modulo ToDo (initTodoModule) non trovato.");
    }

    if (typeof initUtilitiesModule === 'function') {
        initUtilitiesModule.call(app);
    } else {
        console.warn("Modulo Utilities (initUtilitiesModule) non trovato.");
    }

    console.log('✅ Modulo Home inizializzato');
}

// === RENDER SEZIONE HOME ===
function renderHomeSection(container) {
    console.log('🎨 Rendering sezione Home...');
    const app = this; // 'this' si riferisce all'istanza App
    const stats = getHomeDashboardStats.call(app); // Calcola le statistiche generali
    const colors = { benzina: '#10b981', gasolio: '#f59e0b', dieselplus: '#dc2626', hvolution: '#06b6d4', adblue: '#6b7280' };

    // Struttura HTML principale con placeholders per i componenti estratti
    container.innerHTML = `
        <div class="space-y-6">
            <div class="grid grid-cols-3 gap-6">
                <div class="stat-card" style="background-color: #3b82f6; border-color: #2563eb;">
                    <div class="stat-content">
                        <div style="color: #ffffff;">Litri venduti oggi</div>
                        <div class="stat-value" style="color: #ffffff;">${app.formatInteger(stats.totalLitersToday)}</div>
                        <div class="mt-1 flex space-x-2 items-center flex-wrap" style="color: rgba(255, 255, 255, 0.9); font-size: 0.8rem;">
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.benzina};"></div><span>${app.formatInteger(stats.productLiters.benzina)}</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.gasolio};"></div><span>${app.formatInteger(stats.productLiters.gasolio)}</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.dieselplus};"></div><span>${app.formatInteger(stats.productLiters.dieselplus)}</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.hvolution};"></div><span>${app.formatInteger(stats.productLiters.hvolution)}</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.adblue};"></div><span>${app.formatInteger(stats.productLiters.adblue)}</span>
                        </div>
                    </div>
                    <div class="stat-icon blue"><i data-lucide="fuel"></i></div>
                </div>
                <div class="stat-card" style="background-color: #8b5cf6; border-color: #7c3aed;">
                    <div class="stat-content">
                        <div style="color: #ffffff;">% Servito Oggi</div>
                        <div class="stat-value" style="color: #ffffff;">${stats.overallServitoPercentage}%</div>
                        <div class="mt-1 flex space-x-2 items-center flex-wrap" style="color: rgba(255, 255, 255, 0.9); font-size: 0.8rem;">
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.benzina};"></div><span>${stats.productServitoPercentages.benzina}%</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.gasolio};"></div><span>${stats.productServitoPercentages.gasolio}%</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.dieselplus};"></div><span>${stats.productServitoPercentages.dieselplus}%</span>
                            <div style="width:8px; height:8px; border-radius:50%; background-color:${colors.hvolution};"></div><span>${stats.productServitoPercentages.hvolution}%</span>
                        </div>
                    </div>
                    <div class="stat-icon purple"><i data-lucide="user-check"></i></div>
                </div>
                <div class="stat-card" style="background-color: #10b981; border-color: #059669;">
                    <div class="stat-content">
                        <div style="color: #ffffff;">Fatturato giornaliero</div>
                        <div class="stat-value" style="color: #ffffff;">${app.formatCurrency(stats.totalRevenueToday)}</div>
                        <div class="mt-1" style="color: rgba(255, 255, 255, 0.9);">Margine stimato: <strong style="color: #ffffff;">${app.formatCurrency(stats.totalMarginToday)}</strong></div>
                    </div>
                    <div class="stat-icon green"><i data-lucide="euro"></i></div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-6">
                <div class="card" id="calendar-card-placeholder">
                    </div>
                <div class="card" id="todo-card-placeholder">
                     </div>
            </div>

            <div class="grid grid-cols-2 gap-6">
                <div class="card" id="utilities-card-placeholder">
                     </div>
                 <div class="card" id="calculator-card-placeholder">
                    </div>
            </div>
        </div>
    `;

    // --- Chiamate per renderizzare i componenti estratti ---

    // Render Calendario
    const calendarPlaceholder = container.querySelector('#calendar-card-placeholder');
    if (calendarPlaceholder && typeof renderCalendarComponent === 'function') {
        renderCalendarComponent.call(app, calendarPlaceholder);
    } else {
        console.error("Placeholder Calendario non trovato o funzione render non disponibile.");
        if(calendarPlaceholder) calendarPlaceholder.innerHTML = '<p class="p-4 text-danger">Errore caricamento Calendario.</p>';
    }

    // Render ToDo List
    const todoPlaceholder = container.querySelector('#todo-card-placeholder');
    if (todoPlaceholder && typeof renderTodoComponent === 'function') {
        renderTodoComponent.call(app, todoPlaceholder);
    } else {
        console.error("Placeholder ToDo non trovato o funzione render non disponibile.");
         if(todoPlaceholder) todoPlaceholder.innerHTML = '<p class="p-4 text-danger">Errore caricamento ToDo List.</p>';
    }

    // Render Utilities (IVA, Banconote, Ordine)
    const utilitiesPlaceholder = container.querySelector('#utilities-card-placeholder');
    if (utilitiesPlaceholder && typeof renderUtilitiesComponent === 'function') {
        renderUtilitiesComponent.call(app, utilitiesPlaceholder);
    } else {
        console.error("Placeholder Utilities non trovato o funzione render non disponibile.");
         if(utilitiesPlaceholder) utilitiesPlaceholder.innerHTML = '<p class="p-4 text-danger">Errore caricamento Utilities.</p>';
    }

     // Render Calcolatrice
    const calculatorPlaceholder = container.querySelector('#calculator-card-placeholder');
    if (calculatorPlaceholder && typeof renderCalculatorComponent === 'function') {
        renderCalculatorComponent.call(app, calculatorPlaceholder);
    } else {
        console.error("Placeholder Calcolatrice non trovato o funzione render non disponibile.");
         if(calculatorPlaceholder) calculatorPlaceholder.innerHTML = '<p class="p-4 text-danger">Errore caricamento Calcolatrice.</p>';
    }

    // Aggiorna icone finali
    app.refreshIcons();
}


// === FUNZIONE HELPER PER OTTENERE PREZZI (Necessaria per le statistiche) ===
// NOTA: Questa funzione è duplicata in utilities.js. Sarebbe meglio averla in app.js
// o passarla come dipendenza ai moduli che la usano. Per ora la lasciamo qui.
function getLatestPrices() {
    const app = this; // Assicurati che 'this' sia l'istanza app
    if (!app || !app.state || !app.state.data || !Array.isArray(app.state.data.priceHistory) || app.state.data.priceHistory.length === 0) {
        // Ritorna prezzi zero se non disponibili
        return { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0, adblue: 0 };
    }
    // Ordina per data decrescente e prendi il primo (più recente)
    // Usiamo [... ] per creare una copia prima di sortare, per non modificare l'array originale
    return [...app.state.data.priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}


// === FUNZIONE PER CALCOLARE STATISTICHE HOME (Rimane qui) ===
function getHomeDashboardStats() {
    const app = this;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Inizio del giorno
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Inizio del giorno successivo

    // Filtra turni di oggi
    const todayTurni = (app.state.data.turni || []).filter(t => {
        const turnoDate = new Date(t.date);
        return turnoDate >= today && turnoDate < tomorrow && t.turno !== 'Riepilogo Mensile'; // Escludi riepiloghi
    });

    const shiftCount = todayTurni.length;
    const shiftNames = todayTurni.map(t => t.turno).join(', '); // Nomi turni (es. "Mattina, Pomeriggio")

    const prices = getLatestPrices.call(this); // Prezzi correnti
    let totalIperselfPrepay = 0; // Totale FDT + Prepay (ex Iperself)
    let totalServito = 0;
    let totalRevenueToday = 0;
    let totalMarginToday = 0;

    // Margini approssimativi per litro (potrebbero essere resi configurabili)
    const margineFdtPay = 0.035 + 0.005; // Margine FaiDaTe/Prepagato
    const margineServito = 0.065 + 0.015; // Margine Servito (base + extra)
    const margineAdblue = 0.40;          // Margine AdBlue (ipotetico)
    const maggiorazioneServitoPrezzo = 0.210; // Differenza prezzo Servito vs FDT/Pay

    // Totali per prodotto (differenziando FDT/Prepay da Servito)
    const productTotals = {
        benzina: { servito: 0, fdt_prepay: 0 },
        gasolio: { servito: 0, fdt_prepay: 0 },
        dieselplus: { servito: 0, fdt_prepay: 0 },
        hvolution: { servito: 0, fdt_prepay: 0 },
        adblue: { servito: 0, fdt_prepay: 0 } // AdBlue è solo servito
    };

    todayTurni.forEach(turno => {
        // Itera sui prodotti definiti in productTotals
        for (const product in productTotals) {
            // Estrai i valori dal turno, gestendo undefined/null con 0
            const prepayL = parseFloat(turno.prepay?.[product]) || 0;
            const servitoL = parseFloat(turno.servito?.[product]) || 0;

            // Aggiorna i totali per prodotto
            productTotals[product].fdt_prepay += prepayL; // 'fdt_prepay' include solo Prepay qui
            productTotals[product].servito += servitoL;

            // Aggiorna i totali generali
            totalIperselfPrepay += prepayL;
            totalServito += servitoL;

            // Calcola fatturato e margine
            const priceKey = product === 'dieselplus' ? 'dieselPlus' : product; // Chiave corretta per l'oggetto prezzi
            const basePrice = prices[priceKey] || 0;

            if (basePrice > 0) {
                if (product === 'adblue') {
                    // AdBlue ha solo prezzo servito (ipotizziamo sia il basePrice) e margine specifico
                    totalRevenueToday += servitoL * basePrice;
                    totalMarginToday += servitoL * margineAdblue;
                } else {
                    // Altri carburanti
                    const prezzoPrepay = basePrice + 0.005; // Prezzo Prepagato
                    const prezzoServito = basePrice + 0.015 + maggiorazioneServitoPrezzo; // Prezzo Servito

                    totalRevenueToday += (prepayL * prezzoPrepay) + (servitoL * prezzoServito);
                    totalMarginToday += (prepayL * margineFdtPay) + (servitoL * margineServito);
                }
            }
        }
    });

    const totalLitersToday = totalIperselfPrepay + totalServito;
    const overallServitoPercentage = totalLitersToday > 0 ? Math.round((totalServito / totalLitersToday) * 100) : 0;

    // Calcola litri totali e % servito per singolo prodotto
    const productLiters = {};
    const productServitoPercentages = {};
    for (const product in productTotals) {
        const pTotal = productTotals[product].servito + productTotals[product].fdt_prepay;
        productLiters[product] = pTotal;
        productServitoPercentages[product] = pTotal > 0 ? Math.round((productTotals[product].servito / pTotal) * 100) : 0;
    }

    return {
        totalLitersToday,
        overallServitoPercentage,
        productServitoPercentages, // Oggetto con % per prodotto
        totalRevenueToday,
        shiftCount,
        shiftNames,
        productLiters, // Oggetto con litri totali per prodotto
        totalMarginToday
    };
}


// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initHome = initHome;
    window.renderHomeSection = renderHomeSection;
    // Non esportiamo più homeState perché è vuoto o contiene solo dati interni
}
/**
 * STATISTICHE.JS
 * Calcola e visualizza le statistiche di vendita basate sui dati di VirtualStation.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Aggiunge il plugin per il calcolo delle settimane ISO
    dayjs.extend(window.dayjs_plugin_isoWeek);

    const PRODUCTS = [
        { id: 'benzina', name: 'Benzina', color: '#2ECC71' }, 
        { id: 'diesel', name: 'Diesel+', color: '#FB8500' }, 
        { id: 'gasolio', name: 'Gasolio', color: '#FFC300' },
        { id: 'hvolution', name: 'Hvolution', color: '#42BFDD' }, 
        { id: 'adblue', name: 'AdBlue', color: '#64748B' }
    ];
    const SERVITO_MARKUP = 0.210;
    const IPERSELF_EXTRA_MARKUP = 0.005;
    const SERVITO_EXTRA_MARKUP = 0.015;

    // Riferimenti DOM
    let productSalesChart, serviceModeChart, salesTrendChart;
    const productSalesCanvas = document.getElementById('product-sales-chart');
    const serviceModeCanvas = document.getElementById('service-mode-chart');
    const salesTrendCanvas = document.getElementById('sales-trend-chart');
    const totalRevenueEl = document.getElementById('stats-total-revenue');
    const totalLitersEl = document.getElementById('stats-total-liters');
    const servitoRatioEl = document.getElementById('stats-servito-ratio');
    const topProductEl = document.getElementById('stats-top-product');
    const topProductLabelEl = document.getElementById('stats-top-product-label');
    
    // Riferimenti DOM per i filtri nella toolbar
    const statsPeriodTabs = document.getElementById('stats-period-tabs');
    const statsValueFilter = document.getElementById('stats-value-filter');
    const importStatsBtn = document.getElementById('import-stats-btn');
    const exportStatsBtn = document.getElementById('export-stats-btn');
    const printStatsBtn = document.getElementById('print-stats-btn');

    // Stato globale
    let currentPeriod = 'giornata';
    let currentValue = null;
    let filteredTurns = [];

    // Funzioni di utilità 
    const formatCurrency = (num) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num || 0);
    const formatNumber = (num) => new Intl.NumberFormat('it-IT').format(num || 0);
    const parseItalianDate = (dateStr) => {
        const parts = dateStr.split('/');
        return dayjs(`${parts[2]}-${parts[1]}-${parts[0]}`);
    };

    // Funzione per filtrare i turni in base al periodo selezionato
    function filterTurnsByPeriod(allTurns, period, value) {
        const today = dayjs();
        let filtered = [];

        switch (period) {
            case 'giornata':
                // Turni del giorno corrente
                const todayStr = today.format('DD/MM/YYYY');
                filtered = allTurns.filter(turn => turn.date === todayStr);
                break;

            case 'settimana':
                // Dal lunedì al sabato della settimana selezionata
                const weekNum = value || today.isoWeek();
                const year = today.year();
                const startOfWeek = dayjs().year(year).isoWeek(weekNum).startOf('isoWeek');
                const endOfWeek = startOfWeek.add(5, 'day').endOf('day'); // Fino a sabato
                
                filtered = allTurns.filter(turn => {
                    const turnDate = parseItalianDate(turn.date);
                    return turnDate.isValid() && 
                           turnDate.isSameOrAfter(startOfWeek, 'day') && 
                           turnDate.isSameOrBefore(endOfWeek, 'day');
                });
                break;

            case 'mese':
                const month = value || today.month();
                const yearMonth = today.year();
                filtered = allTurns.filter(turn => {
                    const turnDate = parseItalianDate(turn.date);
                    return turnDate.isValid() && 
                           turnDate.month() === month && 
                           turnDate.year() === yearMonth;
                });
                break;

            case 'trimestre':
                const quarter = value || `Q${Math.floor(today.month() / 3) + 1}`;
                const qNum = parseInt(quarter.replace('Q', ''));
                const yearQ = today.year();
                const startMonth = (qNum - 1) * 3;
                const endMonth = startMonth + 2;
                
                filtered = allTurns.filter(turn => {
                    const turnDate = parseItalianDate(turn.date);
                    return turnDate.isValid() && 
                           turnDate.month() >= startMonth && 
                           turnDate.month() <= endMonth && 
                           turnDate.year() === yearQ;
                });
                break;

            case 'semestre':
                const semester = value || (today.month() < 6 ? 'S1' : 'S2');
                const yearS = today.year();
                const startMonthS = semester === 'S1' ? 0 : 6;
                const endMonthS = semester === 'S1' ? 5 : 11;
                
                filtered = allTurns.filter(turn => {
                    const turnDate = parseItalianDate(turn.date);
                    return turnDate.isValid() && 
                           turnDate.month() >= startMonthS && 
                           turnDate.month() <= endMonthS && 
                           turnDate.year() === yearS;
                });
                break;

            case 'anno':
                // Tutti i turni dell'anno corrente
                const currentYear = today.year();
                filtered = allTurns.filter(turn => {
                    const turnDate = parseItalianDate(turn.date);
                    return turnDate.isValid() && turnDate.year() === currentYear;
                });
                break;
        }

        return filtered;
    }

    // Calcola i totali per un singolo turno
    function calculateTurnTotals(turn, latestPriceEntry) {
        const totals = { 
            iperself: { liters: 0, amount: 0 }, 
            servito: { liters: 0, amount: 0 },
            products: {}
        };
        PRODUCTS.forEach(p => { totals.products[p.id] = { liters: 0, revenue: 0 }; });
        if (!latestPriceEntry || !latestPriceEntry.recommended) return totals;
        const { recommended, adblue: adbluePrice = 0 } = latestPriceEntry;
        const process = (source, target, mode) => {
            for (const productId in source) {
                const liters = source[productId] || 0;
                if (liters > 0) {
                    let price = 0;
                    if (mode === 'iperself') {
                        price = (recommended[productId] || 0) + IPERSELF_EXTRA_MARKUP;
                    } else {
                        price = (productId === 'adblue') ? adbluePrice : (recommended[productId] || 0) + SERVITO_MARKUP + SERVITO_EXTRA_MARKUP;
                    }
                    const amount = liters * price;
                    target.liters += liters;
                    target.amount += amount;
                    totals.products[productId].liters += liters;
                    totals.products[productId].revenue += amount;
                }
            }
        };
        process(turn.iperself, totals.iperself, 'iperself');
        process(turn.servito, totals.servito, 'servito');
        return totals;
    }

    // Calcola le statistiche basate sui turni filtrati
    function calculateStats(turnsToAnalyze) {
        const priceHistory = window.MemoriaStorage.loadPriceHistory();
        const latestPriceEntry = priceHistory.length > 0 ? priceHistory[0] : null;
        const globalStats = {
            totalRevenue: 0, totalLiters: 0, iperselfRevenue: 0, servitoRevenue: 0,
            iperselfLiters: 0, servitoLiters: 0, productSales: {}
        };
        PRODUCTS.forEach(p => { globalStats.productSales[p.id] = { name: p.name, liters: 0, revenue: 0 }; });
        
        turnsToAnalyze.forEach(turn => {
            const turnTotals = calculateTurnTotals(turn, latestPriceEntry);
            globalStats.iperselfLiters += turnTotals.iperself.liters;
            globalStats.servitoLiters += turnTotals.servito.liters;
            globalStats.iperselfRevenue += turnTotals.iperself.amount;
            globalStats.servitoRevenue += turnTotals.servito.amount;
            for (const productId in turnTotals.products) {
                globalStats.productSales[productId].liters += turnTotals.products[productId].liters;
                globalStats.productSales[productId].revenue += turnTotals.products[productId].revenue;
            }
        });
        globalStats.totalLiters = globalStats.iperselfLiters + globalStats.servitoLiters;
        globalStats.totalRevenue = globalStats.iperselfRevenue + globalStats.servitoRevenue;
        return globalStats;
    }

    // Rendering dei box di riepilogo
    function renderSummaryBoxes(stats) {
        if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(stats.totalRevenue);
        if (totalLitersEl) totalLitersEl.textContent = formatNumber(stats.totalLiters);
        
        // Terzo box: Solo percentuale servito
        if (servitoRatioEl && stats.totalLiters > 0) {
            const servitoRatio = (stats.servitoLiters / stats.totalLiters) * 100;
            servitoRatioEl.textContent = `${servitoRatio.toFixed(1)}%`;
        } else if (servitoRatioEl) {
            servitoRatioEl.textContent = "0%";
        }
        
        // Quarto box: Prodotto top con nome dinamico
        if (topProductEl && topProductLabelEl) {
            const topProduct = Object.values(stats.productSales)
                .filter(p => p.liters > 0)
                .reduce((max, current) => current.liters > max.liters ? current : max, { name: 'N/D', liters: 0 });
            
            if (topProduct.liters > 0) {
                topProductLabelEl.textContent = topProduct.name;
                topProductEl.textContent = formatNumber(topProduct.liters);
            } else {
                topProductLabelEl.textContent = "Prodotto Top";
                topProductEl.textContent = "0";
            }
        }
    }

    // Rendering dei grafici principali
    function renderTopCharts(stats) {
        // Grafico 1: Vendite per Prodotto
        if (productSalesCanvas) {
            const productData = Object.values(stats.productSales).filter(p => p.liters > 0);
            const chartData = {
                labels: productData.map(p => p.name),
                datasets: [{
                    label: 'Litri per Prodotto',
                    data: productData.map(p => p.liters),
                    backgroundColor: productData.map(p => PRODUCTS.find(prod => prod.name === p.name).color),
                }]
            };
            if (productSalesChart) productSalesChart.destroy();
            productSalesChart = new Chart(productSalesCanvas, { 
                type: 'bar', 
                data: chartData, 
                options: { 
                    responsive: true, 
                    plugins: { legend: { display: false } } 
                } 
            });
        }

        // Grafico 2: Modalità di Servizio
        if (serviceModeCanvas) {
            const chartData = {
                labels: ['Servito', 'Iperself'],
                datasets: [{
                    data: [stats.servitoLiters, stats.iperselfLiters],
                    backgroundColor: ['#ff3399', '#707ff5'],
                    borderWidth: 0
                }]
            };
            if (serviceModeChart) serviceModeChart.destroy();
            serviceModeChart = new Chart(serviceModeCanvas, { 
                type: 'pie', 
                data: chartData, 
                options: { 
                    responsive: true, 
                    plugins: { legend: { position: 'bottom' } } 
                } 
            });
        }
    }

    // Rendering del grafico andamento vendite
    function renderSalesTrendChart() {
        if (!salesTrendCanvas) return;

        // Raggruppa i dati in base al periodo
        let grouper;
        if (currentPeriod === 'giornata') {
            // Per giornata, mostra i turni come punti individuali
            grouper = (turn) => turn.shift || 'Turno';
        } else if (currentPeriod === 'settimana') {
            // Per settimana, raggruppa per giorno
            grouper = (turn) => parseItalianDate(turn.date).format('ddd DD/MM');
        } else if (currentPeriod === 'mese') {
            // Per mese, raggruppa per giorno
            grouper = (turn) => parseItalianDate(turn.date).format('DD');
        } else if (currentPeriod === 'trimestre' || currentPeriod === 'semestre') {
            // Per trimestre/semestre, raggruppa per mese
            grouper = (turn) => parseItalianDate(turn.date).format('MMM');
        } else if (currentPeriod === 'anno') {
            // Per anno, raggruppa per mese
            grouper = (turn) => parseItalianDate(turn.date).format('MMM');
        }

        const groupedData = {};
        const labelOrder = [];
        
        filteredTurns.forEach(turn => {
            const key = grouper(turn);
            if (!groupedData[key]) {
                groupedData[key] = {};
                PRODUCTS.forEach(p => groupedData[key][p.id] = 0);
                labelOrder.push({ key, date: parseItalianDate(turn.date), shift: turn.shift });
            }
            PRODUCTS.forEach(p => {
                groupedData[key][p.id] += (turn.iperself?.[p.id] || 0) + (turn.servito?.[p.id] || 0);
            });
        });

        // Ordina le etichette
        let sortedLabels;
        if (currentPeriod === 'giornata') {
            // Per giornata, mantieni l'ordine dei turni
            sortedLabels = labelOrder.map(item => item.key);
        } else {
            // Per altri periodi, ordina per data
            sortedLabels = labelOrder
                .sort((a, b) => a.date.valueOf() - b.date.valueOf())
                .map(item => item.key);
        }

        const datasets = PRODUCTS.map(product => ({
            label: product.name,
            data: sortedLabels.map(label => groupedData[label]?.[product.id] || 0),
            borderColor: product.color,
            backgroundColor: `${product.color}33`,
            fill: false,
            tension: 0.1
        }));

        if (salesTrendChart) salesTrendChart.destroy();
        salesTrendChart = new Chart(salesTrendCanvas, {
            type: 'line',
            data: { labels: sortedLabels, datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true, ticks: { callback: value => `${value} L` } } }
            }
        });
    }

    // Aggiorna il selettore dei valori in base al periodo
    function updateStatsValueFilter(period) {
        statsValueFilter.innerHTML = '';
        const allTurns = window.MemoriaStorage.loadTurns();
        const today = dayjs();
        
        let options = [];
        switch (period) {
            case 'giornata':
            case 'anno':
                // Nessuna selezione per giornata e anno
                statsValueFilter.disabled = true;
                statsValueFilter.style.display = 'none';
                break;
                
            case 'settimana':
                // Mostra le settimane disponibili dell'anno corrente
                statsValueFilter.disabled = false;
                statsValueFilter.style.display = 'block';
                const weeks = [...new Set(allTurns
                    .filter(t => parseItalianDate(t.date).year() === today.year())
                    .map(t => parseItalianDate(t.date).isoWeek()))]
                    .sort((a, b) => a - b);
                    
                if (weeks.length === 0) weeks.push(today.isoWeek());
                const currentWeek = today.isoWeek();
                
                weeks.forEach(w => {
                    const option = document.createElement('option');
                    option.value = w;
                    option.textContent = `Settimana ${w}`;
                    if (w === currentWeek) option.selected = true;
                    statsValueFilter.appendChild(option);
                });
                break;
                
            case 'mese':
                statsValueFilter.disabled = false;
                statsValueFilter.style.display = 'block';
                const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", 
                                  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
                const currentMonth = today.month();
                
                monthNames.forEach((m, i) => {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = m;
                    if (i === currentMonth) option.selected = true;
                    statsValueFilter.appendChild(option);
                });
                break;
                
            case 'trimestre':
                statsValueFilter.disabled = false;
                statsValueFilter.style.display = 'block';
                const quarters = ['1° Trimestre', '2° Trimestre', '3° Trimestre', '4° Trimestre'];
                const currentQuarter = Math.floor(today.month() / 3) + 1;
                
                quarters.forEach((q, i) => {
                    const option = document.createElement('option');
                    option.value = `Q${i + 1}`;
                    option.textContent = q;
                    if (i + 1 === currentQuarter) option.selected = true;
                    statsValueFilter.appendChild(option);
                });
                break;
                
            case 'semestre':
                statsValueFilter.disabled = false;
                statsValueFilter.style.display = 'block';
                const semesters = ['1° Semestre', '2° Semestre'];
                const currentSemester = today.month() < 6 ? 'S1' : 'S2';
                
                semesters.forEach((s, i) => {
                    const option = document.createElement('option');
                    option.value = `S${i + 1}`;
                    option.textContent = s;
                    if (`S${i + 1}` === currentSemester) option.selected = true;
                    statsValueFilter.appendChild(option);
                });
                break;
        }
        
        currentValue = (period === 'giornata' || period === 'anno') ? null : 
                      (period === 'settimana' ? today.isoWeek() : statsValueFilter.value);
    }

    // Aggiorna tutti i dati e grafici
    function updateAllStats() {
        const allTurns = window.MemoriaStorage.loadTurns();
        
        // Filtra i turni in base al periodo selezionato
        filteredTurns = filterTurnsByPeriod(allTurns, currentPeriod, currentValue);
        
        // Calcola le statistiche sui turni filtrati
        const stats = calculateStats(filteredTurns);
        
        // Aggiorna tutti i componenti della pagina
        renderSummaryBoxes(stats);
        renderTopCharts(stats);
        renderSalesTrendChart();
    }

    // Gestione import dati
    function importStats() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    // Verifica che sia un file di statistiche valido
                    if (!importedData.turni || !Array.isArray(importedData.turni)) {
                        throw new Error('Formato file non valido. Deve contenere un array di turni.');
                    }
                    
                    // Chiedi conferma all'utente
                    const msg = `Vuoi importare ${importedData.turni.length} turni dal file?\n` +
                               `Periodo: ${importedData.periodo || 'non specificato'}\n` +
                               `Data esportazione: ${importedData.dataEsportazione ? new Date(importedData.dataEsportazione).toLocaleDateString('it-IT') : 'non specificata'}`;
                    
                    if (confirm(msg)) {
                        // Importa i turni (aggiungi ai turni esistenti)
                        const existingTurns = window.MemoriaStorage.loadTurns();
                        const newTurns = [...existingTurns, ...importedData.turni];
                        
                        // Rimuovi eventuali duplicati basandosi sull'id
                        const uniqueTurns = Array.from(new Map(newTurns.map(t => [t.id, t])).values());
                        
                        // Salva i turni aggiornati
                        window.MemoriaStorage.saveTurns(uniqueTurns);
                        
                        // Aggiorna la visualizzazione
                        updateAllStats();
                        
                        const customAlertBox = document.getElementById('custom-alert-box');
                        if (customAlertBox) {
                            customAlertBox.textContent = `${importedData.turni.length} turni importati con successo`;
                            customAlertBox.classList.add('show');
                            setTimeout(() => customAlertBox.classList.remove('show'), 3000);
                        }
                    }
                } catch (error) {
                    const customAlertBox = document.getElementById('custom-alert-box');
                    if (customAlertBox) {
                        customAlertBox.textContent = 'Errore durante l\'importazione: ' + error.message;
                        customAlertBox.classList.add('show', 'danger');
                        setTimeout(() => {
                            customAlertBox.classList.remove('show', 'danger');
                        }, 3000);
                    }
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // Gestione export dati
    function exportStats() {
        const stats = calculateStats(filteredTurns);
        let periodoDisplay = currentPeriod;
        
        // Aggiungi informazioni sul valore selezionato per l'export
        if (currentPeriod === 'giornata') {
            periodoDisplay = `${currentPeriod}_${dayjs().format('DD-MM-YYYY')}`;
        } else if (currentPeriod === 'anno') {
            periodoDisplay = `${currentPeriod}_${dayjs().year()}`;
        } else if (currentValue) {
            periodoDisplay = `${currentPeriod}_${currentValue}`;
        }
        
        const exportData = {
            periodo: currentPeriod,
            valore: currentValue || (currentPeriod === 'anno' ? dayjs().year() : currentPeriod === 'giornata' ? dayjs().format('DD/MM/YYYY') : null),
            dataEsportazione: new Date().toISOString(),
            riepilogo: {
                fatturatoTotale: stats.totalRevenue,
                litriTotali: stats.totalLiters,
                litriIperself: stats.iperselfLiters,
                litriServito: stats.servitoLiters
            },
            venditePerProdotto: stats.productSales,
            turni: filteredTurns
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `statistiche_${periodoDisplay}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        const customAlertBox = document.getElementById('custom-alert-box');
        if (customAlertBox) {
            customAlertBox.textContent = 'Dati esportati con successo';
            customAlertBox.classList.add('show');
            setTimeout(() => customAlertBox.classList.remove('show'), 3000);
        }
    }

    // Gestione stampa report
    function printStats() {
        const stats = calculateStats(filteredTurns);
        const printWindow = window.open('', '_blank');
        
        let periodLabel = currentPeriod.charAt(0).toUpperCase() + currentPeriod.slice(1);
        if (currentValue && currentPeriod !== 'giornata' && currentPeriod !== 'anno') {
            if (currentPeriod === 'mese') {
                const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", 
                                  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
                periodLabel += `: ${monthNames[currentValue]}`;
            } else {
                periodLabel += `: ${statsValueFilter.options[statsValueFilter.selectedIndex]?.text || currentValue}`;
            }
        } else if (currentPeriod === 'giornata') {
            periodLabel += `: ${dayjs().format('DD/MM/YYYY')}`;
        } else if (currentPeriod === 'anno') {
            periodLabel += `: ${dayjs().year()}`;
        }
        
        printWindow.document.write(`<html><head><title>Report Statistiche - ${periodLabel}</title>
            <style>
                @media print { @page { size: portrait; } }
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { text-align: center; color: #333; }
                .summary { display: flex; justify-content: space-around; margin: 30px 0; }
                .summary-item { text-align: center; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
                .summary-label { font-size: 12px; color: #666; text-transform: uppercase; }
                .summary-value { font-size: 24px; font-weight: bold; color: #333; margin-top: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
            </style>
        </head><body>`);
        
        printWindow.document.write(`<h1>Report Statistiche - ${periodLabel}</h1>`);
        
        // Riepilogo
        printWindow.document.write('<div class="summary">');
        printWindow.document.write(`<div class="summary-item"><div class="summary-label">Fatturato</div><div class="summary-value">${formatCurrency(stats.totalRevenue)}</div></div>`);
        printWindow.document.write(`<div class="summary-item"><div class="summary-label">Litri Totali</div><div class="summary-value">${formatNumber(stats.totalLiters)}</div></div>`);
        const servitoRatio = stats.totalLiters > 0 ? (stats.servitoLiters / stats.totalLiters) * 100 : 0;
        printWindow.document.write(`<div class="summary-item"><div class="summary-label">Servito</div><div class="summary-value">${servitoRatio.toFixed(1)}%</div></div>`);
        
        // Prodotto top
        const topProduct = Object.values(stats.productSales)
            .filter(p => p.liters > 0)
            .reduce((max, current) => current.liters > max.liters ? current : max, { name: 'N/D', liters: 0 });
        printWindow.document.write(`<div class="summary-item"><div class="summary-label">${topProduct.name}</div><div class="summary-value">${formatNumber(topProduct.liters)}</div></div>`);
        printWindow.document.write('</div>');
        
        // Tabella vendite per prodotto
        printWindow.document.write('<h2>Vendite per Prodotto</h2>');
        printWindow.document.write('<table><thead><tr><th>Prodotto</th><th>Litri</th><th>Fatturato</th></tr></thead><tbody>');
        Object.values(stats.productSales).forEach(p => {
            if (p.liters > 0) {
                printWindow.document.write(`<tr><td>${p.name}</td><td>${formatNumber(p.liters)}</td><td>${formatCurrency(p.revenue)}</td></tr>`);
            }
        });
        printWindow.document.write('</tbody></table>');
        
        printWindow.document.write(`<div class="footer">Report generato il ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}</div>`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    // Funzione principale che inizializza la pagina
    window.initStatsPage = function() {
        // Setup dei filtri nella toolbar
        if (statsPeriodTabs && statsValueFilter) {
            statsPeriodTabs.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab-btn')) {
                    statsPeriodTabs.querySelector('.active')?.classList.remove('active');
                    e.target.classList.add('active');
                    currentPeriod = e.target.dataset.period;
                    updateStatsValueFilter(currentPeriod);
                    updateAllStats();
                }
            });
            
            statsValueFilter.addEventListener('change', () => {
                currentValue = currentPeriod === 'settimana' ? 
                              parseInt(statsValueFilter.value) : 
                              (currentPeriod === 'mese' ? parseInt(statsValueFilter.value) : statsValueFilter.value);
                updateAllStats();
            });
            
            // Event listeners per import, export e stampa
            if (importStatsBtn) importStatsBtn.addEventListener('click', importStats);
            if (exportStatsBtn) exportStatsBtn.addEventListener('click', exportStats);
            if (printStatsBtn) printStatsBtn.addEventListener('click', printStats);
            
            // Inizializzazione al primo caricamento
            currentPeriod = 'giornata';
            updateStatsValueFilter(currentPeriod);
            updateAllStats();
        }
    };
});
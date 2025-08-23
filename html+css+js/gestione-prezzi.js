/**
 * GESTIONE-PREZZI.JS
 * Gestione completa della sezione gestione prezzi con filtri periodo
 */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // COSTANTI E CONFIGURAZIONE
    // ============================================

    // Margini da aggiungere ai prezzi consigliati per ottenere i prezzi finali
    const SERVITO_MARKUP = 0.210;
    const IPERSELF_EXTRA_MARKUP = 0.005;
    const SERVITO_EXTRA_MARKUP = 0.015;

    // Lista di tutti i prodotti gestiti
    const ALL_PRODUCTS = [
        { id: 'benzina', name: 'Benzina' },
        { id: 'diesel', name: 'Diesel+' },
        { id: 'gasolio', name: 'Gasolio' },
        { id: 'hvolution', name: 'Hvolution' },
        { id: 'adblue', name: 'AdBlue' }
    ];
    
    // Prodotti da visualizzare nella tabella dello storico (escluso AdBlue)
    const HISTORY_TABLE_PRODUCTS = ALL_PRODUCTS.filter(p => p.id !== 'adblue');
    
    // Prodotti per il modal (senza AdBlue)
    const MODAL_PRODUCTS = ALL_PRODUCTS.filter(p => p.id !== 'adblue');

    // ============================================
    // RIFERIMENTI AGLI ELEMENTI DEL DOM
    // ============================================
    const newPriceListBtn = document.getElementById('new-price-list-btn');
    const priceModal = document.getElementById('new-price-modal');
    const closePriceModalBtn = document.getElementById('close-price-modal-btn');
    const savePriceBtn = document.getElementById('save-price-btn');
    const pricesGridDisplay = document.getElementById('prices-grid-display');
    const appliedPricesDate = document.getElementById('applied-prices-date');
    
    const importBtn = document.getElementById('import-prices-btn');
    const exportBtn = document.getElementById('export-prices-btn');
    const printBtn = document.getElementById('print-report-btn');
    const fileInput = document.getElementById('prices-file-input');
    
    const historyContainer = document.getElementById('price-history-container');
    const periodTabs = document.getElementById('period-tabs');
    const valueFilter = document.getElementById('price-history-value-filter');
    const printHistoryBtn = document.getElementById('print-history-btn');

    // ============================================
    // GESTIONE FILTRI PERIODO
    // ============================================
    
    // Aggiorna il selettore dei valori in base al periodo
    function updateHistoryValueFilter(period) {
        if (!valueFilter) return;
        const currentYear = new Date().getFullYear();
        valueFilter.innerHTML = '';

        if (period === 'anno') {
            const option = document.createElement('option');
            option.value = currentYear.toString();
            option.textContent = currentYear.toString();
            valueFilter.appendChild(option);
            valueFilter.disabled = true;
        } else {
            valueFilter.disabled = false;
            const months = [
                { value: '01', label: 'Gennaio' }, { value: '02', label: 'Febbraio' }, { value: '03', label: 'Marzo' },
                { value: '04', label: 'Aprile' }, { value: '05', label: 'Maggio' }, { value: '06', label: 'Giugno' },
                { value: '07', label: 'Luglio' }, { value: '08', label: 'Agosto' }, { value: '09', label: 'Settembre' },
                { value: '10', label: 'Ottobre' }, { value: '11', label: 'Novembre' }, { value: '12', label: 'Dicembre' }
            ];
            const quarters = [
                { value: 'Q1', label: '1° Trimestre' }, { value: 'Q2', label: '2° Trimestre' },
                { value: 'Q3', label: '3° Trimestre' }, { value: 'Q4', label: '4° Trimestre' }
            ];
            const semesters = [
                { value: 'S1', label: '1° Semestre' }, { value: 'S2', label: '2° Semestre' }
            ];
            
            let options;
            switch(period) {
                case 'mese': options = months; break;
                case 'trimestre': options = quarters; break;
                case 'semestre': options = semesters; break;
            }
            
            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label;
                valueFilter.appendChild(option);
            });
        }
    }
    
    // Filtra i dati dello storico in base al periodo e valore selezionato
    function getFilteredHistory() {
        if (!periodTabs || !valueFilter) return MemoriaStorage.loadPriceHistory();
        
        const activeTab = periodTabs.querySelector('.tab-btn.active');
        if (!activeTab) return MemoriaStorage.loadPriceHistory();

        const period = activeTab.dataset.period;
        const value = valueFilter.value;
        const allHistory = MemoriaStorage.loadPriceHistory();
        const currentYearString = new Date().getFullYear().toString();

        return allHistory.filter(entry => {
            if (!entry.date || typeof entry.date !== 'string') return false;
            const dateParts = entry.date.split('/');
            if (dateParts.length !== 3) return false;
            const month = dateParts[1];
            const year = dateParts[2];
            
            switch(period) {
                case 'anno': 
                    return year === value;
                case 'mese': 
                    return month === value && year === currentYearString;
                case 'trimestre': 
                    const monthNum = parseInt(month, 10);
                    const quarter = `Q${Math.ceil(monthNum / 3)}`;
                    return quarter === value && year === currentYearString;
                case 'semestre': 
                    const semester = parseInt(month, 10) <= 6 ? 'S1' : 'S2';
                    return semester === value && year === currentYearString;
                default: 
                    return true;
            }
        });
    }

    // ============================================
    // GESTIONE MODALE NUOVO LISTINO
    // ============================================

    // Apre il modale per inserire un nuovo listino prezzi
    const openPriceModal = () => {
        if (!priceModal) return;
        
        // Reset del form
        MODAL_PRODUCTS.forEach(p => {
            const input = document.getElementById(`price-${p.id}`);
            if (input) input.value = '';
        });
        
        const dateInput = document.getElementById('price-date');
        if (dateInput) {
            const today = new Date();
            const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
            dateInput.value = formattedDate;
        }
        
        // Reset modalità modifica
        delete priceModal.dataset.editingId;
        priceModal.querySelector('.modal-title').textContent = 'Nuovo Listino Prezzi';
        priceModal.style.display = 'flex';
    };

    // Chiude il modale
    const closePriceModal = () => {
        if (priceModal) {
            priceModal.style.display = 'none';
            delete priceModal.dataset.editingId;
        }
    };

    // Salva un nuovo listino prezzi
    const saveNewPriceEntry = () => {
        const date = document.getElementById('price-date')?.value;
        if (!date) {
            showAlert('Inserisci la data del listino.', 'danger');
            return;
        }

        const recommended = {};
        let hasValidPrice = false;

        MODAL_PRODUCTS.forEach(p => {
            const input = document.getElementById(`price-${p.id}`);
            const value = parseFloat(input?.value?.replace(',', '.')) || 0;
            recommended[p.id] = value;
            if (value > 0) hasValidPrice = true;
        });

        if (!hasValidPrice) {
            showAlert('Inserisci almeno un prezzo valido.', 'danger');
            return;
        }

        const entry = {
            id: priceModal.dataset.editingId ? parseInt(priceModal.dataset.editingId) : Date.now(),
            date: date,
            recommended: recommended,
            adblue: priceModal.dataset.editingId ? 
                    (MemoriaStorage.loadPriceHistory().find(e => e.id == priceModal.dataset.editingId)?.adblue || 0) : 0,
            timestamp: new Date().toISOString()
        };

        let history = MemoriaStorage.loadPriceHistory();
        
        if (priceModal.dataset.editingId) {
            // Modalità modifica
            const index = history.findIndex(e => e.id == priceModal.dataset.editingId);
            if (index !== -1) {
                history[index] = entry;
                showAlert('Listino aggiornato.', 'success');
            }
        } else {
            // Nuovo listino
            history.unshift(entry);
            showAlert('Nuovo listino salvato.', 'success');
        }

        MemoriaStorage.saveAllPriceHistory(history);
        loadCurrentPrices();
        updatePriceHistory();
        closePriceModal();
    };

    // Salva il prezzo AdBlue
    const saveAdbluePrice = (price) => {
        const history = MemoriaStorage.loadPriceHistory();
        if (history.length === 0) return;
        
        const latestEntry = history[0];
        latestEntry.adblue = price;
        
        MemoriaStorage.saveAllPriceHistory(history);
        showAlert('Prezzo AdBlue aggiornato.', 'success');
    };

    // ============================================
    // GESTIONE PREZZI CORRENTI
    // ============================================

    // Carica e visualizza i prezzi correnti
    const loadCurrentPrices = () => {
        if (!pricesGridDisplay || !appliedPricesDate) return;
        
        const history = MemoriaStorage.loadPriceHistory();
        const latestEntry = history.length > 0 ? history[0] : null;
        
        // Aggiorna la data applicata
        appliedPricesDate.textContent = latestEntry ? latestEntry.date : 'Nessun listino applicato';
        
        // Pulisce il container
        pricesGridDisplay.innerHTML = '';
        
        if (!latestEntry) {
            pricesGridDisplay.innerHTML = '<p class="no-prices-message">Nessun listino prezzi disponibile. Crea il primo listino.</p>';
            return;
        }

        // Crea la card unificata
        const unifiedCard = document.createElement('div');
        unifiedCard.className = 'price-unified-card';
        
        let cardHTML = '<div class="price-columns-container">';
        
        // Colonna Iperself
        cardHTML += '<div class="price-column-unified"><h3 class="price-column-title">Iperself</h3>';
        ALL_PRODUCTS.forEach(p => {
            if (p.id === 'adblue') {
                cardHTML += `<div class="price-item invisible-price" data-product="${p.id}"></div>`;
            } else {
                const recommendedPrice = latestEntry.recommended[p.id] || 0;
                if (recommendedPrice > 0) {
                    const iperPrice = recommendedPrice + IPERSELF_EXTRA_MARKUP;
                    cardHTML += `<div class="price-item" data-product="${p.id}"><span class="price-product-name">${p.name}</span><span class="price-value">€ ${iperPrice.toFixed(3)}</span></div>`;
                } else {
                    cardHTML += `<div class="price-item disabled-price" data-product="${p.id}"><span class="price-product-name">${p.name}</span><span class="price-value">-</span></div>`;
                }
            }
        });
        cardHTML += '</div>';
        
        // Colonna Servito
        cardHTML += '<div class="price-column-unified"><h3 class="price-column-title">Servito</h3>';
        ALL_PRODUCTS.forEach(p => {
            if (p.id === 'adblue') {
                const adbluePrice = latestEntry.adblue || 0;
                cardHTML += `<div class="price-item" data-product="${p.id}">
                    <span class="price-product-name">${p.name}</span>
                    <input type="text" 
                           class="adblue-editable-input" 
                           id="adblue-price-input"
                           value="${adbluePrice > 0 ? adbluePrice.toFixed(3) : ''}" 
                           placeholder="0.000"
                           title="Clicca per modificare il prezzo AdBlue">
                </div>`;
            } else {
                const recommendedPrice = latestEntry.recommended[p.id] || 0;
                if (recommendedPrice > 0) {
                    const servitoPrice = recommendedPrice + SERVITO_MARKUP + SERVITO_EXTRA_MARKUP;
                    cardHTML += `<div class="price-item" data-product="${p.id}"><span class="price-product-name">${p.name}</span><span class="price-value">€ ${servitoPrice.toFixed(3)}</span></div>`;
                } else {
                    cardHTML += `<div class="price-item disabled-price" data-product="${p.id}"><span class="price-product-name">${p.name}</span><span class="price-value">-</span></div>`;
                }
            }
        });
        cardHTML += '</div>';
        
        cardHTML += '</div>';
        unifiedCard.innerHTML = cardHTML;
        pricesGridDisplay.appendChild(unifiedCard);

        // Aggiunge event listener per l'input AdBlue
        const adblueInput = document.getElementById('adblue-price-input');
        if (adblueInput) {
            adblueInput.addEventListener('blur', (e) => {
                const newValue = parseFloat(e.target.value.replace(',', '.')) || 0;
                saveAdbluePrice(newValue);
                // Aggiorna la visualizzazione
                if (newValue > 0) {
                    e.target.value = newValue.toFixed(3);
                } else {
                    e.target.value = '';
                }
            });
            
            adblueInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.target.blur();
                }
            });
            
            // Seleziona tutto il testo quando riceve il focus
            adblueInput.addEventListener('focus', (e) => {
                e.target.select();
            });
        }
    };

    // ============================================
    // GESTIONE STORICO PREZZI
    // ============================================

    // Aggiorna la visualizzazione dello storico prezzi (ora con filtri)
    const updatePriceHistory = () => {
        if (!historyContainer) return;
        
        const filteredHistory = getFilteredHistory();
        historyContainer.innerHTML = '';
        
        if (filteredHistory.length === 0) {
            historyContainer.innerHTML = '<p class="no-history-message">Nessun dato nello storico per il periodo selezionato.</p>';
            return;
        }

        // Creazione tabella con header
        const table = document.createElement('table');
        table.className = 'history-table';
        
        // Header tabella
        let headerHTML = '<thead><tr><th>Data</th>';
        HISTORY_TABLE_PRODUCTS.forEach(p => {
            headerHTML += `<th>${p.name}</th>`;
        });
        headerHTML += '<th>Azioni</th></tr></thead>';
        
        // Body tabella
        let bodyHTML = '<tbody>';
        filteredHistory.forEach(entry => {
            bodyHTML += `<tr data-entry-id="${entry.id}">`;
            bodyHTML += `<td class="date-cell">${entry.date}</td>`;
            
            HISTORY_TABLE_PRODUCTS.forEach(p => {
                const price = entry.recommended[p.id] || 0;
                if (price > 0) {
                    bodyHTML += `<td class="price-cell">€ ${price.toFixed(3)}</td>`;
                } else {
                    bodyHTML += `<td class="price-cell disabled">-</td>`;
                }
            });
            
            bodyHTML += `<td class="actions-cell">
                <button class="action-btn edit-btn" onclick="editPriceEntry(${entry.id})" title="Modifica">
                    <i data-lucide="square-pen"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deletePriceEntry(${entry.id})" title="Elimina">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>`;
            bodyHTML += '</tr>';
        });
        bodyHTML += '</tbody>';
        
        table.innerHTML = headerHTML + bodyHTML;
        historyContainer.appendChild(table);
        
        // Reinizializza le icone Lucide
        if (window.lucide) {
            window.lucide.createIcons();
        }
    };

    // Modifica una voce esistente nello storico
    window.editPriceEntry = (entryId) => {
        const history = MemoriaStorage.loadPriceHistory();
        const entry = history.find(e => e.id == entryId);
        if (!entry) return;
        
        // Popola il modal con i dati esistenti
        document.getElementById('price-date').value = entry.date;
        MODAL_PRODUCTS.forEach(p => {
            const input = document.getElementById(`price-${p.id}`);
            if (input) {
                input.value = entry.recommended[p.id] || '';
            }
        });
        
        // Imposta modalità modifica
        priceModal.dataset.editingId = entryId;
        priceModal.querySelector('.modal-title').textContent = 'Modifica Listino Prezzi';
        priceModal.style.display = 'flex';
    };

    // Elimina una voce dallo storico
    window.deletePriceEntry = (entryId) => {
        if (!confirm('Sei sicuro di voler eliminare questa voce?')) return;
        
        const history = MemoriaStorage.loadPriceHistory();
        const filteredHistory = history.filter(e => e.id != entryId);
        MemoriaStorage.saveAllPriceHistory(filteredHistory);
        
        showAlert('Voce eliminata.', 'success');
        loadCurrentPrices();
        updatePriceHistory();
    };

    // ============================================
    // IMPORT/EXPORT
    // ============================================

    // Gestione importazione prezzi
    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedData) || importedData.length === 0) {
                    showAlert('File non valido o vuoto.', 'danger');
                    return;
                }

                // Validazione struttura dati
                const isValid = importedData.every(entry => 
                    entry.hasOwnProperty('id') && 
                    entry.hasOwnProperty('date') && 
                    entry.hasOwnProperty('recommended')
                );

                if (!isValid) {
                    showAlert('Struttura dati non valida.', 'danger');
                    return;
                }

                // Salva i dati importati
                MemoriaStorage.saveAllPriceHistory(importedData);
                loadCurrentPrices();
                updatePriceHistory();
                showAlert(`Importati ${importedData.length} listini.`, 'success');
                
            } catch (error) {
                showAlert('Errore durante l\'importazione del file.', 'danger');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    // Gestione esportazione prezzi
    const handleExport = () => {
        const history = MemoriaStorage.loadPriceHistory();
        if (history.length === 0) {
            showAlert('Nessun dato da esportare.', 'warning');
            return;
        }

        const dataStr = JSON.stringify(history, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `listini_prezzi_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showAlert('Dati esportati.', 'success');
    };

    // ============================================
    // STAMPA REPORT
    // ============================================

    // Stampa il report prezzi correnti
    const printCurrentPrices = () => {
        const history = MemoriaStorage.loadPriceHistory();
        const latestEntry = history.length > 0 ? history[0] : null;
        const competitionPrices = MemoriaStorage.loadCompetitionPrices();
        
        if (!latestEntry) {
            showAlert('Nessun listino da stampare.', 'warning');
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showAlert('Impossibile aprire la finestra di stampa.', 'danger');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="it">
            <head>
                <meta charset="UTF-8">
                <title>Report Prezzi - ${latestEntry.date}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #333; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .header h1 { font-size: 24px; margin-bottom: 5px; }
                    .header .date { font-size: 14px; color: #666; }
                    .price-section { margin-bottom: 30px; }
                    .price-section h2 { font-size: 16px; margin-bottom: 15px; color: #333; }
                    .price-card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
                    .price-columns { display: flex; }
                    .price-column { flex: 1; padding: 15px; }
                    .price-column:first-child { border-right: 1px solid #ddd; }
                    .price-column h3 { font-size: 14px; margin-bottom: 10px; text-align: center; background: #f5f5f5; padding: 5px; border-radius: 4px; }
                    .price-item { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0; }
                    .price-item:last-child { margin-bottom: 0; }
                    .price-product-name { font-weight: 500; }
                    .price-value { font-weight: bold; color: #2563eb; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Report Prezzi Carburanti</h1>
                    <div class="date">Data: ${latestEntry.date}</div>
                </div>
                
                <div class="price-section">
                    <h2>Prezzi Applicati</h2>
                    <div class="price-card">
                        <div class="price-columns">
                            <div class="price-column">
                                <h3>Iperself</h3>
        `);

        ALL_PRODUCTS.forEach(p => {
            if (p.id !== 'adblue') {
                const recommendedPrice = latestEntry.recommended[p.id] || 0;
                if (recommendedPrice > 0) {
                    const iperPrice = recommendedPrice + IPERSELF_EXTRA_MARKUP;
                    printWindow.document.write(`
                        <div class="price-item">
                            <span class="price-product-name">${p.name}</span>
                            <span class="price-value">€ ${iperPrice.toFixed(3)}</span>
                        </div>
                    `);
                } else {
                    printWindow.document.write(`
                        <div class="price-item">
                            <span class="price-product-name">${p.name}</span>
                            <span class="price-value">-</span>
                        </div>
                    `);
                }
            }
        });
        
        printWindow.document.write(`
                            </div>
                            <div class="price-column">
                                <h3>Servito</h3>
        `);

        ALL_PRODUCTS.forEach(p => {
            if (p.id === 'adblue') {
                const adbluePrice = latestEntry.adblue || 0;
                printWindow.document.write(`
                    <div class="price-item">
                        <span class="price-product-name">${p.name}</span>
                        <span class="price-value">${adbluePrice > 0 ? '€ ' + adbluePrice.toFixed(3) : '-'}</span>
                    </div>
                `);
            } else {
                const recommendedPrice = latestEntry.recommended[p.id] || 0;
                if (recommendedPrice > 0) {
                    const servitoPrice = recommendedPrice + SERVITO_MARKUP + SERVITO_EXTRA_MARKUP;
                    printWindow.document.write(`
                        <div class="price-item">
                            <span class="price-product-name">${p.name}</span>
                            <span class="price-value">€ ${servitoPrice.toFixed(3)}</span>
                        </div>
                    `);
                } else {
                    printWindow.document.write(`
                        <div class="price-item">
                            <span class="price-product-name">${p.name}</span>
                            <span class="price-value">-</span>
                        </div>
                    `);
                }
            }
        });
        
        printWindow.document.write(`
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
    };

    // ============================================
    // UTILITY
    // ============================================

    // Mostra messaggi di alert
    const showAlert = (message, type = 'info') => {
        // Implementazione semplificata - puoi personalizzare
        alert(message);
    };

    // ============================================
    // EVENT LISTENERS
    // ============================================

    // Eventi per il modale
    if (newPriceListBtn) {
        newPriceListBtn.addEventListener('click', openPriceModal);
    }
    
    if (closePriceModalBtn) {
        closePriceModalBtn.addEventListener('click', closePriceModal);
    }
    
    if (savePriceBtn) {
        savePriceBtn.addEventListener('click', saveNewPriceEntry);
    }

    // Eventi per import/export
    if (importBtn) {
        importBtn.addEventListener('click', () => fileInput?.click());
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', handleImport);
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
    
    if (printBtn) {
        printBtn.addEventListener('click', printCurrentPrices);
    }

    // Eventi per i filtri periodo
    if (periodTabs) {
        periodTabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                // Rimuovi active dalla tab corrente
                periodTabs.querySelector('.active')?.classList.remove('active');
                // Aggiungi active alla nuova tab
                e.target.classList.add('active');
                // Aggiorna il filtro valore
                updateHistoryValueFilter(e.target.dataset.period);
                // Aggiorna lo storico
                updatePriceHistory();
            }
        });
    }
    
    if (valueFilter) {
        valueFilter.addEventListener('change', () => {
            updatePriceHistory();
        });
    }

    // Chiusura modale cliccando fuori
    if (priceModal) {
        priceModal.addEventListener('click', (e) => {
            if (e.target === priceModal) {
                closePriceModal();
            }
        });
    }

    // ============================================
    // INIZIALIZZAZIONE
    // ============================================

    // Inizializza i filtri
    if (periodTabs && valueFilter) {
        const activeTab = periodTabs.querySelector('.tab-btn.active');
        if (activeTab) {
            updateHistoryValueFilter(activeTab.dataset.period);
        }
    }

    // Carica i dati all'avvio
    loadCurrentPrices();
    updatePriceHistory();
});
// File: virtualstation.js

document.addEventListener('DOMContentLoaded', () => {
    // Aggiunge il plugin per il calcolo delle settimane ISO
    if (window.dayjs && window.dayjs_plugin_isoWeek) {
        dayjs.extend(window.dayjs_plugin_isoWeek);
    }

    // Riferimenti DOM
    const newTurnBtn = document.getElementById('new-turn-btn');
    const newTurnModal = document.getElementById('new-turn-modal');
    const closeTurnModalBtn = document.getElementById('close-turn-modal-btn');
    const cancelTurnBtn = document.getElementById('cancel-turn-btn');
    const newTurnForm = document.getElementById('new-turn-form');

    // Riferimenti DOM per il modale di modifica
    const editTurnModal = document.getElementById('edit-turn-modal');
    const closeEditTurnModalBtn = document.getElementById('close-edit-turn-modal-btn');
    const cancelEditTurnBtn = document.getElementById('cancel-edit-turn-btn');
    const editTurnForm = document.getElementById('edit-turn-form');
    const deleteEditTurnBtn = document.getElementById('delete-edit-turn-btn');
    
    // Riferimenti DOM per lo storico
    const turnsHistoryContainer = document.getElementById('turns-history-container');
    const printTurnsTableBtn = document.getElementById('print-turns-table-btn');
    const editTableBtn = document.getElementById('edit-table-btn');
    const importBtn = document.getElementById('import-turns-btn');
    const exportBtn = document.getElementById('export-turns-btn');

    // Stato
    let allTurns = [];
    let isTableEditMode = false;

    // Costanti
    const SERVITO_MARKUP = 0.210;
    const IPERSELF_EXTRA_MARKUP = 0.005;
    const SERVITO_EXTRA_MARKUP = 0.015;
    const PRODUCTS = [
        { id: 'benzina', name: 'Benzina' }, { id: 'diesel', name: 'Diesel+' }, { id: 'gasolio', name: 'Gasolio' },
        { id: 'hvolution', name: 'Hvolution' }, { id: 'adblue', name: 'AdBlue' }
    ];

    // Funzioni Utility
    const showAlert = (message) => {
        const customAlertBox = document.getElementById('custom-alert-box');
        if (!customAlertBox) return;
        customAlertBox.textContent = message;
        customAlertBox.classList.add('show');
        setTimeout(() => customAlertBox.classList.remove('show'), 3000);
    };
    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
    const formatNumber = (num) => new Intl.NumberFormat('it-IT').format(num);
    const formatCurrency = (num) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
    
    // Gestione Dati
    function saveTurns() { if (window.MemoriaStorage) window.MemoriaStorage.saveTurns(allTurns); }
    function loadTurns() {
        allTurns = window.MemoriaStorage ? window.MemoriaStorage.loadTurns() : [];
        renderTurnsHistoryTable();
    }

    // Gestione Modali
    function openNewTurnModal() {
        if (!newTurnModal || !newTurnForm) return;    
        newTurnForm.reset();
        const now = new Date();
        document.getElementById('turn-date').value = now.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        document.getElementById('turn-time').value = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        newTurnModal.style.display = 'flex';
    }
    function closeNewTurnModal() { if (newTurnModal) newTurnModal.style.display = 'none'; }
    function openEditTurnModal(turnId) {
        const turn = allTurns.find(t => t.id === turnId);
        if (!turn || !editTurnModal || !editTurnForm) return;
        editTurnForm.reset();
        document.getElementById('edit-turn-id').value = turn.id;
        document.getElementById('edit-turn-shift').value = turn.shift;
        document.getElementById('edit-turn-date').value = turn.date;
        document.getElementById('edit-turn-time').value = turn.time;
        if(turn.iperself) for (const product in turn.iperself) { if(document.getElementById(`edit-turn-iperself-${product}`)) document.getElementById(`edit-turn-iperself-${product}`).value = turn.iperself[product]; }
        if(turn.servito) for (const product in turn.servito) { if(document.getElementById(`edit-turn-servito-${product}`)) document.getElementById(`edit-turn-servito-${product}`).value = turn.servito[product]; }
        editTurnModal.style.display = 'flex';
    }
    function closeEditTurnModal() { if (editTurnModal) editTurnModal.style.display = 'none'; }
    
    // Logica Calcolo Prezzi e Totali
    function calculateTurnTotals(turn, latestPriceEntry) {
        const totals = { iperself: { liters: 0, amount: 0, products: {} }, servito: { liters: 0, amount: 0, products: {} }, grandTotal: { liters: 0, amount: 0, products: {} } };
        if (!latestPriceEntry || !latestPriceEntry.recommended) return totals;
        const { recommended, adblue: adbluePrice = 0 } = latestPriceEntry;
        const process = (source, target, mode) => {
            for (const productId in source) {
                const liters = source[productId] || 0;
                if (liters > 0) {
                    let price = 0;
                    if (mode === 'iperself') price = (recommended[productId] || 0) + IPERSELF_EXTRA_MARKUP;
                    else {
                        if (productId === 'adblue') price = adbluePrice;
                        else price = (recommended[productId] || 0) + SERVITO_MARKUP + SERVITO_EXTRA_MARKUP;
                    }
                    const amount = liters * price;
                    target.liters += liters;
                    target.amount += amount;
                    target.products[productId] = { liters, amount };
                }
            }
        };
        process(turn.iperself, totals.iperself, 'iperself');
        process(turn.servito, totals.servito, 'servito');
        totals.grandTotal.liters = totals.iperself.liters + totals.servito.liters;
        totals.grandTotal.amount = totals.iperself.amount + totals.servito.amount;
        PRODUCTS.forEach(p => {
             totals.grandTotal.products[p.id] = {
                 liters: (totals.iperself.products[p.id]?.liters || 0) + (totals.servito.products[p.id]?.liters || 0),
                 amount: (totals.iperself.products[p.id]?.amount || 0) + (totals.servito.products[p.id]?.amount || 0)
             };
        });
        return totals;
    }

    // Logica Principale
    function getTurnDataFromForm(formElement) {
        const data = new FormData(formElement);
        const turnData = { iperself: {}, servito: {} };
        for(let [key, value] of data.entries()) {
            if (key.startsWith('iperself-')) turnData.iperself[key.replace('iperself-', '')] = parseFloat(value) || 0;
            else if (key.startsWith('servito-')) turnData.servito[key.replace('servito-', '')] = parseFloat(value) || 0;
            else turnData[key] = value.trim();
        }
        return turnData;
    }
    
    function saveNewTurn(event) {
        event.preventDefault();
        const newTurnData = getTurnDataFromForm(newTurnForm);
        if (!newTurnData.shift) return showAlert('Il campo "Turno" è obbligatorio.');
        allTurns.push({ ...newTurnData, id: generateId(), timestamp: new Date().toISOString() });
        saveTurns();
        renderTurnsHistoryTable();
        closeNewTurnModal();
        showAlert('Nuovo turno salvato con successo.');
    }
    
    function saveEditedTurn(event) {
        event.preventDefault();
        const editedData = getTurnDataFromForm(editTurnForm);
        if (!editedData.shift) return showAlert('Il campo "Turno" è obbligatorio.');
        const turnIndex = allTurns.findIndex(t => t.id === editedData.id);
        if (turnIndex === -1) return showAlert('Errore: turno non trovato.');
        allTurns[turnIndex] = { ...allTurns[turnIndex], ...editedData };
        saveTurns();
        renderTurnsHistoryTable();
        closeEditTurnModal();
        showAlert('Turno aggiornato con successo.');
    }

    function deleteTurn() {
        const turnId = document.getElementById('edit-turn-id').value;
        const turnIndex = allTurns.findIndex(t => t.id === turnId);
        if (turnIndex === -1) return showAlert('Errore: turno non trovato.');
        const turn = allTurns[turnIndex];
        if (confirm(`Sei sicuro di voler eliminare il turno "${turn.shift}" del ${turn.date}?`)) {
            allTurns.splice(turnIndex, 1);
            saveTurns();
            renderTurnsHistoryTable();
            closeEditTurnModal();
            showAlert('Turno eliminato con successo.');
        }
    }
    
    // Rendering tabella storico
    function renderTurnsHistoryTable() {
        if (!turnsHistoryContainer) return;
        turnsHistoryContainer.innerHTML = '';
        if (allTurns.length === 0) {
            turnsHistoryContainer.innerHTML = '<p class="no-data-message">Nessun turno registrato.</p>';
            return;
        }
        
        const titleElement = document.querySelector('#virtualstation-content .prices-title');
        if (titleElement) {
            const currentYear = new Date().getFullYear();
            titleElement.textContent = `Storico turni (${currentYear})`;
        }
        
        const priceHistory = window.MemoriaStorage ? window.MemoriaStorage.loadPriceHistory() : [];
        const latestPriceEntry = priceHistory.length > 0 ? priceHistory[0] : null;
        
        const productHeaders = PRODUCTS.map(p => `<th>${p.name}</th>`).join('');
        let tableHTML = `<table class="history-table">
            <thead>
                <tr>
                    <th>Data/Turno</th>
                    <th>Modalità</th>
                    ${productHeaders}
                    <th>LITRI</th>
                    <th>IMPORTO</th>
                </tr>
            </thead>
            <tbody>`;
        
        const sortedTurns = [...allTurns].sort((a, b) => {
            const parseItalianDate = (dateStr) => {
                if (!dateStr || typeof dateStr !== 'string') return new Date(0);
                const parts = dateStr.split('/');
                if (parts.length !== 3) return new Date(0);
                return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            };
            const dateA = parseItalianDate(a.date);
            const dateB = parseItalianDate(b.date);
            const dateDiff = dateB.getTime() - dateA.getTime();
            if (dateDiff !== 0) return dateDiff;
            const timeA = a.time || '00:00';
            const timeB = b.time || '00:00';
            return timeB.localeCompare(timeA);
        });
        
        sortedTurns.forEach(turn => {
            const totals = calculateTurnTotals(turn, latestPriceEntry);
            const renderProductCells = (productData, isTotal = false, turnData = null, mode = '') => PRODUCTS.map(p => {
                if (isTableEditMode && !isTotal && turnData) {
                    const value = turnData[mode]?.[p.id] || 0;
                    return `<td><input type="number" class="edit-input virtualstation-edit-input" data-turn-id="${turn.id}" data-mode="${mode}" data-product="${p.id}" value="${value}" min="0"></td>`;
                }
                const data = productData[p.id];
                return data && data.liters > 0 ? `<td>${formatNumber(data.liters)}</td>` : '<td>-</td>';
            }).join('');
            
            const dateTimeCell = isTableEditMode ? 
                `<td rowspan="3"><input type="text" class="edit-input virtualstation-edit-input" data-turn-id="${turn.id}" data-field="date" value="${turn.date}"><br><input type="text" class="edit-input virtualstation-edit-input" data-turn-id="${turn.id}" data-field="shift" value="${turn.shift}"></td>` :
                `<td rowspan="3">${turn.date}<br>${turn.shift}</td>`;
                
            tableHTML += `<tr>${dateTimeCell}<td class="mode-cell">Iperself</td>${renderProductCells(totals.iperself.products, false, turn, 'iperself')}<td>${formatNumber(totals.iperself.liters)}</td><td>${formatCurrency(totals.iperself.amount)}</td></tr>`;
            tableHTML += `<tr><td class="mode-cell">Servito</td>${renderProductCells(totals.servito.products, false, turn, 'servito')}<td>${formatNumber(totals.servito.liters)}</td><td>${formatCurrency(totals.servito.amount)}</td></tr>`;
            tableHTML += `<tr class="total-row"><td class="mode-cell">Totale</td>${renderProductCells(totals.grandTotal.products, true)}<td>${formatNumber(totals.grandTotal.liters)}</td><td>${formatCurrency(totals.grandTotal.amount)}</td></tr>`;
        });
        
        tableHTML += '</tbody></table>';
        turnsHistoryContainer.innerHTML = tableHTML;
        
        if (isTableEditMode) {
            turnsHistoryContainer.querySelectorAll('.edit-input').forEach(input => input.addEventListener('change', handleTableEdit));
        }
    }

    // Gestione Editing Tabella
    function toggleTableEditMode() {
        isTableEditMode = !isTableEditMode;
        if (editTableBtn) {
            editTableBtn.classList.toggle('active', isTableEditMode);
            editTableBtn.title = isTableEditMode ? 'Disattiva modalità modifica' : 'Attiva modalità modifica';
        }
        renderTurnsHistoryTable();
    }
    
    function handleTableEdit(e) {
        const input = e.target;
        const { turnId, field, mode, product } = input.dataset;
        const turn = allTurns.find(t => t.id === turnId);
        if (!turn) return;
        
        if (field) turn[field] = input.value;
        else if (mode && product && turn[mode]) turn[mode][product] = parseFloat(input.value) || 0;
        
        saveTurns();
        renderTurnsHistoryTable();
    }

    // Funzione di stampa
    function printTurnsTable() {
        if (allTurns.length === 0) return showAlert("Nessun dato da stampare.");
        const priceHistory = window.MemoriaStorage ? window.MemoriaStorage.loadPriceHistory() : [];
        const latestPriceEntry = priceHistory.length > 0 ? priceHistory[0] : null;
        const printWindow = window.open('', '_blank');
        let content = `<html><head><title>Stampa Storico Turni</title><style>
            @media print{@page{size:landscape}}body{font-family:Arial,sans-serif;font-size:10pt}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:5px;text-align:center;vertical-align:middle}th{background-color:#f2f2f2}.total-row td{background-color:#e9e9e9;font-weight:bold;border-bottom:2px solid #333}tbody{border-top:2px solid #333}td:nth-child(1),td:nth-child(2){text-align:left}.amount{color:#555;font-size:.8em}
        </style></head><body><h1>Storico Turni</h1><table><thead><tr><th>Data / Turno</th><th>Modalità</th>${PRODUCTS.map(p => `<th>${p.name}</th>`).join('')}<th>LITRI</th><th>IMPORTO</th></tr></thead>`;
        
        const sorted = [...allTurns].sort((a, b) => {
            const parseItalianDate = (dateStr) => {
                if (!dateStr || typeof dateStr !== 'string') return new Date(0);
                const parts = dateStr.split('/');
                if (parts.length !== 3) return new Date(0);
                return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            };
            const dateA = parseItalianDate(a.date);
            const dateB = parseItalianDate(b.date);
            const dateDiff = dateB.getTime() - dateA.getTime();
            if (dateDiff !== 0) return dateDiff;
            const timeA = a.time || '00:00';
            const timeB = b.time || '00:00';
            return timeB.localeCompare(timeA);
        });
        
        sorted.forEach(turn => {
            const totals = calculateTurnTotals(turn, latestPriceEntry);
            const renderCells = (data) => PRODUCTS.map(p => `<td>${data[p.id] ? formatNumber(data[p.id].liters) : '-'}</td>`).join('');
            content += `<tbody>
                <tr><td rowspan="3">${turn.date}<br>${turn.shift}</td><td>Iperself</td>${renderCells(totals.iperself.products)}<td>${formatNumber(totals.iperself.liters)}</td><td>${formatCurrency(totals.iperself.amount)}</td></tr>
                <tr><td>Servito</td>${renderCells(totals.servito.products)}<td>${formatNumber(totals.servito.liters)}</td><td>${formatCurrency(totals.servito.amount)}</td></tr>
                <tr class="total-row"><td>Totale</td>${renderCells(totals.grandTotal.products)}<td>${formatNumber(totals.grandTotal.liters)}</td><td>${formatCurrency(totals.grandTotal.amount)}</td></tr>
            </tbody>`;
        });
        
        content += '</table></body></html>';
        printWindow.document.write(content);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    }

    // Funzioni di Import/Export
    function exportTurns() {
        if (allTurns.length === 0) {
            showAlert("Nessun turno da esportare.");
            return;
        }
        
        const exportData = {
            version: "1.0",
            type: "MyStation_Turns",
            exportedAt: new Date().toISOString(),
            totalTurns: allTurns.length,
            data: allTurns
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `turni_virtualstation_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showAlert('Turni esportati con successo.');
    }

    function importTurns() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsedJson = JSON.parse(event.target.result);
                    
                    let importedTurns = [];
                    if (parsedJson && typeof parsedJson === 'object' && Array.isArray(parsedJson.data)) {
                        importedTurns = parsedJson.data;
                    } 
                    else if (Array.isArray(parsedJson)) {
                        importedTurns = parsedJson;
                    } 
                    else {
                        throw new Error('Formato del file JSON non valido.');
                    }
                    
                    if (importedTurns.length === 0) {
                        showAlert('Il file non contiene turni da importare.');
                        return;
                    }
                    
                    if (confirm(`Trovati ${importedTurns.length} turni da importare. Continuare?`)) {
                        const turnsToImport = importedTurns.filter(turn => turn.id && turn.shift);
                        
                        if (turnsToImport.length === 0) {
                            showAlert('Nessun turno valido trovato nel file.');
                            return;
                        }
                        
                        const existingIds = new Set(allTurns.map(t => t.id));
                        const newTurns = turnsToImport.filter(turn => !existingIds.has(turn.id));
                        
                        if (newTurns.length === 0) {
                            showAlert('Tutti i turni nel file sono già presenti.');
                            return;
                        }
                        
                        allTurns = [...allTurns, ...newTurns];
                        saveTurns();
                        renderTurnsHistoryTable();
                        
                        const duplicatesCount = turnsToImport.length - newTurns.length;
                        let message = `${newTurns.length} turni importati con successo.`;
                        if (duplicatesCount > 0) {
                            message += ` ${duplicatesCount} turni duplicati sono stati ignorati.`;
                        }
                        showAlert(message);
                    }
                } catch (error) {
                    showAlert('Errore durante l\'importazione: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // Inizializzazione e Event Listeners
    function init() {
        if (newTurnBtn) newTurnBtn.addEventListener('click', openNewTurnModal);
        if (closeTurnModalBtn) closeTurnModalBtn.addEventListener('click', closeNewTurnModal);
        if (cancelTurnBtn) cancelTurnBtn.addEventListener('click', closeNewTurnModal);
        if (newTurnForm) newTurnForm.addEventListener('submit', saveNewTurn);
        
        if (editTurnForm) editTurnForm.addEventListener('submit', saveEditedTurn);
        if (closeEditTurnModalBtn) closeEditTurnModalBtn.addEventListener('click', closeEditTurnModal);
        if (cancelEditTurnBtn) cancelEditTurnBtn.addEventListener('click', closeEditTurnModal);
        if (deleteEditTurnBtn) deleteEditTurnBtn.addEventListener('click', deleteTurn);

        if (printTurnsTableBtn) printTurnsTableBtn.addEventListener('click', printTurnsTable);
        if (editTableBtn) editTableBtn.addEventListener('click', toggleTableEditMode);

        if (importBtn) importBtn.addEventListener('click', importTurns);
        if (exportBtn) exportBtn.addEventListener('click', exportTurns);
        
        loadTurns();
    }

    init();
});
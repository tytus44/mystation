/**
 * REGISTRO.JS
 * Gestione completa del registro di carico con layout a tabella e filtri istantanei.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Riferimenti DOM aggiornati
    const registroTableContainer = document.getElementById('registro-table-container');
    const newLoadBtn = document.getElementById('new-load-btn');
    const newLoadModal = document.getElementById('new-load-modal');
    const summaryTableContainer = document.getElementById('summary-table-container');
    const exportRegistroBtn = document.getElementById('export-registro-btn');
    const printRegistroBtn = document.getElementById('print-registro-btn');
    const closeLoadModalBtn = document.getElementById('close-load-modal-btn');
    const saveLoadBtn = document.getElementById('save-load-btn');
    const customAlertBox = document.getElementById('custom-alert-box');
    const importRegistroBtn = document.getElementById('import-registro-btn');
    const registroFileInput = document.getElementById('registro-file-input');
    const resetYearBtn = document.getElementById('reset-year-btn');

    // Nuovi riferimenti per i filtri
    const registroPeriodTabs = document.getElementById('registro-period-tabs');
    const registroValueFilter = document.getElementById('registro-value-filter');
    const printRegistroTableBtn = document.getElementById('print-registro-table-btn');

    // Stato
    let allLoads = [];
    let filteredLoads = [];
    let rimanenzeState = { benzina: 0, gasolio: 0, diesel: 0, hvolution: 0 };
    const productKeys = ['benzina', 'gasolio', 'diesel', 'hvolution'];
    const productLabels = { benzina: 'Benzina', gasolio: 'Gasolio', diesel: 'Diesel+', hvolution: 'Hvolution' };

    // ============================================
    // FUNZIONI UTILITY
    // ============================================
    function showAlert(message) { if (!customAlertBox) return; customAlertBox.textContent = message; customAlertBox.classList.add('show'); setTimeout(() => customAlertBox.classList.remove('show'), 3000); }
    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
    const formatNumber = (num) => new Intl.NumberFormat('it-IT').format(num);
    const getTodayItalian = () => new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const parseItalianDate = (dateStr) => { if (!dateStr || !dateStr.includes('/')) return new Date().toISOString(); const parts = dateStr.split('/'); if (parts.length !== 3) return new Date().toISOString(); return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`; };

    // ============================================
    // GESTIONE DATI (LocalStorage)
    // ============================================
    function saveToLocalStorage() {
        if (window.MemoriaStorage) {
            window.MemoriaStorage.saveRegistro(allLoads);
            window.MemoriaStorage.saveRimanenze(rimanenzeState);
        }
    }

    function loadFromLocalStorage() {
        if (window.MemoriaStorage) {
            rimanenzeState = window.MemoriaStorage.loadRimanenze() || { benzina: 0, gasolio: 0, diesel: 0, hvolution: 0 };
            allLoads = window.MemoriaStorage.loadRegistro();
        }
        applyFilters();
    }
    
    // ============================================
    // RENDERING
    // ============================================
    function renderLoads(loads) {
        if (!registroTableContainer) return;
        registroTableContainer.innerHTML = '';

        if (loads.length === 0) {
            registroTableContainer.innerHTML = '<p class="no-data-message">Nessuna consegna trovata per i filtri selezionati.</p>';
            return;
        }

        loads.sort((a, b) => new Date(parseItalianDate(b.date)) - new Date(parseItalianDate(a.date)));
        
        let tableHTML = `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Autista</th>
                        <th>Benzina</th>
                        <th>Gasolio</th>
                        <th>Diesel+</th>
                        <th>Hvolution</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody>
        `;

        loads.forEach(load => {
            tableHTML += `
                <tr>
                    <td>${load.date}</td>
                    <td>${load.driver || 'N/D'}</td>
            `;
            productKeys.forEach(key => {
                const quantity = parseFloat(load[key] || 0);
                const diffKey = `diff${key.charAt(0).toUpperCase() + key.slice(1)}`;
                const diff = parseFloat(load[diffKey] || 0);
                const diffClass = diff > 0 ? 'diff-positive' : (diff < 0 ? 'diff-negative' : '');
                const diffSign = diff > 0 ? '+' : '';

                tableHTML += `
                    <td>
                        <div class="table-cell-value">${formatNumber(quantity)} L</div>
                        <div class="table-cell-subvalue ${diffClass}">${diffSign}${formatNumber(diff)}</div>
                    </td>
                `;
            });

            tableHTML += `
                    <td class="actions-cell">
                        <button class="action-btn edit-btn" data-id="${load.id}" title="Modifica"><i data-lucide="square-pen"></i></button>
                        <button class="action-btn delete-btn" data-id="${load.id}" title="Elimina"><i data-lucide="trash-2"></i></button>
                    </td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        registroTableContainer.innerHTML = tableHTML;

        lucide.createIcons();

        registroTableContainer.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', e => openNewLoadModal(e.currentTarget.dataset.id)));
        registroTableContainer.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', e => deleteLoad(e.currentTarget.dataset.id)));
    }
    
    function updateSummary(loads) {
        const summaryEl = document.getElementById('registro-summary');
        if (!summaryEl || !summaryTableContainer) return;

        let topDriver = { name: 'N/D', count: 0 };
        if (loads.length > 0) {
            const driverCounts = loads.reduce((acc, load) => { acc[load.driver] = (acc[load.driver] || 0) + 1; return acc; }, {});
            topDriver = Object.entries(driverCounts).reduce((top, [name, count]) => count > top.count ? { name, count } : top, { name: 'N/D', count: 0 });
        }

        const totals = loads.reduce((acc, load) => {
            productKeys.forEach(key => {
                const diffKey = `diff${key.charAt(0).toUpperCase() + key.slice(1)}`;
                acc.totals[key] += parseFloat(load[key] || 0);
                acc.diffs[key] += parseFloat(load[diffKey] || 0);
            });
            return acc;
        }, { totals: { benzina: 0, gasolio: 0, diesel: 0, hvolution: 0 }, diffs: { benzina: 0, gasolio: 0, diesel: 0, hvolution: 0 } });
        
        const productTotals = totals.totals;
        const productDiffs = totals.diffs;
        
        summaryEl.innerHTML = `
            <div class="summary-row">
                <div class="summary-card"><div class="summary-icon"><i data-lucide="truck"></i></div><div class="summary-content"><div class="summary-label">Consegne Effettuate</div><div class="summary-value">${loads.length}</div></div></div>
                <div class="summary-card"><div class="summary-icon"><i data-lucide="user-star"></i></div><div class="summary-content"><div class="summary-label">Top Autista</div><div class="summary-value" style="font-size: 18px;">${topDriver.name} (${topDriver.count})</div></div></div>
                <div class="summary-card"><div class="summary-icon"><i data-lucide="fuel"></i></div><div class="summary-content"><div class="summary-label">Totale Litri</div><div class="summary-value">${formatNumber(Object.values(productTotals).reduce((a, b) => a + b, 0))}</div></div></div>
            </div>
            <div class="summary-row">
                <div class="summary-card product-benzina"><div class="summary-icon"><i data-lucide="droplet"></i></div><div class="summary-content"><div class="summary-label">Totale Benzina</div><div class="summary-value">${formatNumber(productTotals.benzina)}</div></div></div>
                <div class="summary-card product-gasolio"><div class="summary-icon"><i data-lucide="droplet"></i></div><div class="summary-content"><div class="summary-label">Totale Gasolio</div><div class="summary-value">${formatNumber(productTotals.gasolio)}</div></div></div>
                <div class="summary-card product-diesel"><div class="summary-icon"><i data-lucide="droplet"></i></div><div class="summary-content"><div class="summary-label">Totale Diesel+</div><div class="summary-value">${formatNumber(productTotals.diesel)}</div></div></div>
                <div class="summary-card product-hvolution"><div class="summary-icon"><i data-lucide="droplet"></i></div><div class="summary-content"><div class="summary-label">Totale Hvolution</div><div class="summary-value">${formatNumber(productTotals.hvolution)}</div></div></div>
            </div>`;
        
        lucide.createIcons();

        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        
        let tableRowsHtml = '';
        productKeys.forEach(key => {
            const carico = productTotals[key];
            const differenza = productDiffs[key];
            const rimanenza = rimanenzeState[key] || 0;
            const contabile = carico + differenza + rimanenza;
            const diffClass = differenza > 0 ? 'diff-positive' : (differenza < 0 ? 'diff-negative' : '');
            const diffSign = differenza > 0 ? '+' : '';

            tableRowsHtml += `<tr>
                                <td>${productLabels[key]}</td>
                                <td class="carico-value">${formatNumber(carico)} L</td>
                                <td class="diff-value ${diffClass}">${diffSign}${formatNumber(differenza)}</td>
                                <td><input type="number" class="rimanenza-input" data-product="${key}" value="${rimanenza}"></td>
                                <td class="contabile-value" data-product="${key}">${formatNumber(contabile)}</td>
                              </tr>`;
        });
        
        const titleHTML = `<h3 class="summary-table-title">RIEPILOGO TOTALI (${currentYear})</h3>`;
        const tableHTML = `<table class="summary-table" id="totale-carburanti">
                                <thead>
                                    <tr>
                                        <th>Prodotto</th>
                                        <th>Carico</th>
                                        <th>Differenza</th>
                                        <th>Rimanenza (${previousYear})</th>
                                        <th>Contabile</th>
                                    </tr>
                                </thead>
                                <tbody>${tableRowsHtml}</tbody>
                           </table>`;
        summaryTableContainer.innerHTML = titleHTML + tableHTML;
    }

    function updateFilterValueOptions(period) {
        if (!registroValueFilter) return;
        const currentYear = new Date().getFullYear();
        registroValueFilter.innerHTML = '';

        if (period === 'anno') {
            const option = document.createElement('option');
            option.value = currentYear.toString();
            option.textContent = currentYear.toString();
            registroValueFilter.appendChild(option);
            registroValueFilter.disabled = true;
        } else {
            registroValueFilter.disabled = false;
            const months = [ { value: '01', label: 'Gennaio' }, { value: '02', label: 'Febbraio' }, { value: '03', label: 'Marzo' }, { value: '04', label: 'Aprile' }, { value: '05', label: 'Maggio' }, { value: '06', label: 'Giugno' }, { value: '07', label: 'Luglio' }, { value: '08', label: 'Agosto' }, { value: '09', label: 'Settembre' }, { value: '10', label: 'Ottobre' }, { value: '11', label: 'Novembre' }, { value: '12', label: 'Dicembre' } ];
            const quarters = [ { value: 'Q1', label: '1° Trimestre' }, { value: 'Q2', label: '2° Trimestre' }, { value: 'Q3', label: '3° Trimestre' }, { value: 'Q4', label: '4° Trimestre' }];
            const semesters = [ { value: 'S1', label: '1° Semestre' }, { value: 'S2', label: '2° Semestre' }];
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
                registroValueFilter.appendChild(option);
            });
        }
    }
    
    function applyFilters() {
        if (!registroPeriodTabs) return;
        const activeTab = registroPeriodTabs.querySelector('.tab-btn.active');
        if (!activeTab) return;

        const period = activeTab.dataset.period;
        const value = registroValueFilter.value;
        const currentYearString = new Date().getFullYear().toString();

        let loads = allLoads.filter(load => {
            if (!load.date || typeof load.date !== 'string') return false;
            const dateParts = load.date.split('/');
            if (dateParts.length !== 3) return false;
            const month = dateParts[1];
            const year = dateParts[2];
            
            switch(period) {
                case 'anno': return year === value;
                case 'mese': return month === value && year === currentYearString;
                case 'trimestre': const monthNum = parseInt(month, 10); const quarter = `Q${Math.ceil(monthNum / 3)}`; return quarter === value && year === currentYearString;
                case 'semestre': const semester = parseInt(month, 10) <= 6 ? 'S1' : 'S2'; return semester === value && year === currentYearString;
                default: return false;
            }
        });

        filteredLoads = loads;
        renderLoads(filteredLoads);
        updateSummary(filteredLoads);
    }
    
    function openNewLoadModal(loadId = null) { 
        if (!newLoadModal) return; 
        const form = newLoadModal.querySelector('.modal-content'); 
        const modalTitle = newLoadModal.querySelector('.modal-title');
        
        form.dataset.editId = ''; 
        
        if (loadId) { 
            const loadToEdit = allLoads.find(l => l.id === loadId); 
            if (loadToEdit) { 
                form.dataset.editId = loadId; 
                modalTitle.textContent = 'Modifica Consegna Carburante';
                
                document.getElementById('load-date').value = loadToEdit.date; 
                document.getElementById('load-driver').value = loadToEdit.driver; 
                productKeys.forEach(key => { 
                    const diffKey = `diff${key.charAt(0).toUpperCase() + key.slice(1)}`; 
                    document.getElementById(`load-${key}`).value = loadToEdit[key] || ''; 
                    document.getElementById(`load-diff-${key}`).value = loadToEdit[diffKey] || ''; 
                }); 
            } 
        } else { 
            modalTitle.textContent = 'Nuova Consegna';
            
            document.getElementById('load-date').value = getTodayItalian(); 
            document.getElementById('load-driver').value = ''; 
            productKeys.forEach(key => { 
                document.getElementById(`load-${key}`).value = ''; 
                document.getElementById(`load-diff-${key}`).value = ''; 
            }); 
        } 
        
        newLoadModal.style.display = 'flex';
    }
    
    function closeNewLoadModal() { if (newLoadModal) newLoadModal.style.display = 'none'; }
    
    function saveNewLoad() { const form = newLoadModal.querySelector('.modal-content'); const date = document.getElementById('load-date').value.trim(); const driver = document.getElementById('load-driver').value.trim(); if (!date || !driver) { showAlert('Data e Autista sono campi obbligatori.'); return; } const newLoad = { id: form.dataset.editId || generateId(), date, driver, timestamp: new Date().toISOString() }; let totalQuantity = 0; productKeys.forEach(key => { const diffKey = `diff${key.charAt(0).toUpperCase() + key.slice(1)}`; const quantity = parseFloat(document.getElementById(`load-${key}`).value) || 0; const diff = parseFloat(document.getElementById(`load-diff-${key}`).value) || 0; newLoad[key] = quantity; newLoad[diffKey] = diff; totalQuantity += quantity; }); if (totalQuantity === 0) { showAlert('Inserire la quantità per almeno un prodotto.'); return; } if (form.dataset.editId) { const index = allLoads.findIndex(l => l.id === form.dataset.editId); if (index > -1) allLoads[index] = newLoad; } else { allLoads.push(newLoad); } saveToLocalStorage(); applyFilters(); closeNewLoadModal(); showAlert('Consegna salvata con successo.'); }
    
    function deleteLoad(loadId) { if(confirm('Sei sicuro di voler eliminare questa consegna?')) { allLoads = allLoads.filter(load => load.id !== loadId); saveToLocalStorage(); applyFilters(); showAlert('Consegna eliminata.'); } }
    
    function importRegistro(file) { const reader = new FileReader(); reader.onload = (e) => { try { const data = JSON.parse(e.target.result); const importedLoads = data.history || (Array.isArray(data) ? data : []); if (importedLoads.length > 0) { const newLoads = importedLoads.map(load => ({...load, id: load.id || generateId() })); allLoads = [...allLoads, ...newLoads]; saveToLocalStorage(); applyFilters(); showAlert(`${newLoads.length} consegne importate.`); } else { showAlert('Nessun dato valido trovato nel file.'); } } catch (error) { showAlert('Errore nel leggere il file JSON.'); } }; reader.readAsText(file); }
    
    function resetYear() { const currentYear = new Date().getFullYear(); const loadsFromCurrentYear = allLoads.filter(load => { const dateParts = (load.date || '').split('/'); return dateParts.length === 3 && parseInt(dateParts[2]) === currentYear; }); if (loadsFromCurrentYear.length === 0) { showAlert(`Nessuna consegna da eliminare per l'anno ${currentYear}.`); return; } if (confirm(`Sei sicuro di voler eliminare tutte le ${loadsFromCurrentYear.length} consegne del ${currentYear}? L'azione non può essere annullata.`)) { allLoads = allLoads.filter(load => { const dateParts = (load.date || '').split('/'); return dateParts.length !== 3 || parseInt(dateParts[2]) !== currentYear; }); saveToLocalStorage(); applyFilters(); showAlert(`Tutte le consegne del ${currentYear} sono state eliminate.`); } }
    
    function exportRegistro() {
        if (allLoads.length === 0) { showAlert("Nessuna consegna da esportare."); return; }
        const dataStr = JSON.stringify(allLoads, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `registro_consegne_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showAlert("Registro esportato con successo.");
    }

    function printRegistro() {
        const summaryContent = document.getElementById('registro-summary').innerHTML;
        const summaryTableContent = document.getElementById('summary-table-container').innerHTML;
        if (!summaryContent || !summaryTableContent) {
            showAlert("Nessun riepilogo da stampare.");
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html><head><title>Riepilogo Registro Consegne</title>
            <link rel="stylesheet" href="stile.css">
            <style>
                body { background: white; color: black; padding: 20px; font-family: 'Fredoka', sans-serif; }
                .summary-card, .summary-table-container { box-shadow: none; border: 1px solid #ccc; }
                .summary-value, .text-primary { color: black !important; }
                .summary-label, .text-muted { color: #555 !important; }
                .rimanenza-input { border: none; background: transparent; } /* Stile per la stampa */
            </style>
        </head><body>`);
        printWindow.document.write('<h1>Riepilogo Registro Consegne</h1>');
        printWindow.document.write(summaryContent);
        printWindow.document.write(summaryTableContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    function printRegistroTable() {
        const tableContainer = document.getElementById('registro-table-container');
        const table = tableContainer.querySelector('table');
        if (!table) {
            showAlert("Nessuna tabella da stampare.", 'danger');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html><head><title>Stampa Storico Carico Carburanti</title>
            <style>
                @media print { @page { size: landscape; } }
                body { font-family: Arial, sans-serif; }
                h1 { font-size: 16pt; }
                table { width: 100%; border-collapse: collapse; font-size: 9pt; }
                th, td { border: 1px solid #ccc; padding: 6px; text-align: center; vertical-align: middle; }
                th { background-color: #f2f2f2; }
                td:nth-child(2) { text-align: left; }
                .table-cell-subvalue { font-size: 8pt; color: #666; }
                .diff-positive { color: #008000; }
                .diff-negative { color: #d90000; }
                .actions-cell { display: none; }
            </style>
        </head><body>`);
        
        let tableHTML = table.cloneNode(true);
        tableHTML.querySelectorAll('.actions-cell').forEach(cell => cell.remove());
        tableHTML.querySelector('thead tr').lastElementChild.remove();
        
        printWindow.document.write(`<h1>Storico Carico Carburanti</h1>`);
        printWindow.document.write(tableHTML.outerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    function setupRegistroFilters() {
        if (registroPeriodTabs) {
            registroPeriodTabs.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab-btn')) {
                    registroPeriodTabs.querySelector('.active').classList.remove('active');
                    e.target.classList.add('active');
                    updateFilterValueOptions(e.target.dataset.period);
                    applyFilters();
                }
            });
        }
        if (registroValueFilter) {
            registroValueFilter.addEventListener('change', applyFilters);
        }
    }

    // Event Listeners
    if (newLoadBtn) newLoadBtn.addEventListener('click', () => openNewLoadModal());
    if (closeLoadModalBtn) closeLoadModalBtn.addEventListener('click', closeNewLoadModal);
    if (saveLoadBtn) saveLoadBtn.addEventListener('click', saveNewLoad);
    if (importRegistroBtn) importRegistroBtn.addEventListener('click', () => registroFileInput.click());
    if (registroFileInput) registroFileInput.addEventListener('change', e => { if (e.target.files.length > 0) importRegistro(e.target.files[0]); });
    if (resetYearBtn) resetYearBtn.addEventListener('click', resetYear);
    if (exportRegistroBtn) exportRegistroBtn.addEventListener('click', exportRegistro);
    if (printRegistroBtn) printRegistroBtn.addEventListener('click', printRegistro);
    if (printRegistroTableBtn) printRegistroTableBtn.addEventListener('click', printRegistroTable);
    
    if (newLoadModal) { newLoadModal.addEventListener('click', (event) => { if (event.target.matches('.spinner-btn')) { event.preventDefault(); const button = event.target; const input = button.parentElement.querySelector('input[type=number]'); if (!input) return; const step = parseFloat(button.dataset.step); let currentValue = parseFloat(input.value) || 0; let newValue = currentValue + step; if (input.min !== '' && newValue < parseFloat(input.min)) { newValue = parseFloat(input.min); } input.value = newValue; } }); }

    if (summaryTableContainer) {
        summaryTableContainer.addEventListener('input', (event) => {
            if (event.target.classList.contains('rimanenza-input')) {
                const input = event.target;
                const product = input.dataset.product;
                const rimanenza = parseFloat(input.value) || 0;
                
                // Aggiorna e salva lo stato delle rimanenze
                rimanenzeState[product] = rimanenza;
                if (window.MemoriaStorage) {
                    window.MemoriaStorage.saveRimanenze(rimanenzeState);
                }

                // Ricalcola il contabile in tempo reale
                const parentRow = input.closest('tr');
                const contabileCell = parentRow.querySelector(`.contabile-value[data-product="${product}"]`);
                
                const caricoText = parentRow.querySelector('.carico-value').textContent.replace(/\./g, '').replace(',', '.');
                const carico = parseFloat(caricoText) || 0;

                const differenzaText = parentRow.querySelector('.diff-value').textContent.replace(/\./g, '').replace(',', '.');
                const differenza = parseFloat(differenzaText) || 0;
                
                contabileCell.textContent = formatNumber(carico + differenza + rimanenza);
            }
        });
    }

    // Inizializzazione
    setupRegistroFilters();
    updateFilterValueOptions('anno');
    loadFromLocalStorage();
});
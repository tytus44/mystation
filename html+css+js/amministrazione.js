/**
 * AMMINISTRAZIONE.JS
 * Gestione completa della sezione amministrazione clienti (Versione Finale Corretta)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Riferimenti DOM
    const clientsGrid = document.getElementById('clients-grid');
    const searchClientInput = document.getElementById('search-client-input');
    const clearClientSearchBtn = document.getElementById('clear-client-search-btn');
    const showHideClientsBtn = document.getElementById('show-hide-clients-btn');
    const filterCreditBtn = document.getElementById('filter-credit-btn');
    const filterDebtBtn = document.getElementById('filter-debt-btn');
    const newClientBtn = document.getElementById('new-client-btn');
    const importClientsBtn = document.getElementById('import-clients-btn');
    const exportClientsBtn = document.getElementById('export-clients-btn');
    const printClientsBtn = document.getElementById('print-clients-btn');
    const newClientModal = document.getElementById('new-client-modal');
    const closeClientModalBtn = document.getElementById('close-client-modal-btn');
    const saveClientBtn = document.getElementById('save-client-btn');
    const transactionModal = document.getElementById('transaction-modal');
    const closeTransactionModalBtn = document.getElementById('close-transaction-modal-btn');
    const clientNameHeader = document.getElementById('client-name-header');
    const clientBalanceHeader = document.getElementById('client-balance-header');
    const confirmTransactionBtn = document.getElementById('confirm-transaction-btn');
    const payFullBtn = document.getElementById('pay-full-btn');
    const payPartialBtn = document.getElementById('pay-partial-btn');
    const deleteClientBtn = document.getElementById('delete-client-btn');
    const viewHistoryBtn = document.getElementById('view-history-btn');
    const printTransactionBtn = document.getElementById('print-transaction-btn');
    const historyModal = document.getElementById('history-modal');
    const closeHistoryModalBtn = document.getElementById('close-history-modal-btn');
    const historyClientName = document.getElementById('history-client-name');
    const historyTableBody = document.getElementById('history-table-body');
    const summaryTotalClients = document.getElementById('summary-total-clients');
    const summaryNetBalance = document.getElementById('summary-net-balance');
    const summaryActiveCredits = document.getElementById('summary-active-credits');
    const summaryActiveDebts = document.getElementById('summary-active-debts');

    // Stato Globale
    let allClients = [];
    let displayedClients = [];
    let currentClientIndex = -1;
    let currentFilter = 'all';
    let isHidden = false;

    // Funzioni utility
    const showAlert = (message, type = 'info') => {
        const customAlertBox = document.getElementById('custom-alert-box');
        if (!customAlertBox) return;
        customAlertBox.innerHTML = message;
        customAlertBox.className = 'custom-alert';
        if (type) customAlertBox.classList.add(type);
        customAlertBox.classList.add('show');
        setTimeout(() => {
            customAlertBox.classList.remove('show');
            setTimeout(() => { customAlertBox.className = 'custom-alert'; }, 400);
        }, 3000);
    };

    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
    const parseCurrency = (value) => parseFloat((value || '0').toString().replace(/[^0-9,.-]/g, '').replace(',', '.')) || 0;
    const formatCurrency = (value) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('it-IT');
    const getTodayISO = () => new Date().toISOString().split('T')[0];
    const parseItalianDate = (dateStr) => {
        if (!dateStr || !dateStr.includes('/')) return getTodayISO();
        const parts = dateStr.split('/');
        if (parts.length !== 3) return getTodayISO();
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    };

    function calculateClientTotal(client) {
        return client.transactions.reduce((total, transaction) => total + (parseFloat(transaction.amount) || 0), 0);
    }

    function applyFilters() {
        const searchTerm = (searchClientInput?.value || '').toLowerCase();
        let filtered = allClients;

        if (searchTerm) {
            filtered = filtered.filter(client => client.name.toLowerCase().includes(searchTerm));
        }

        if (currentFilter === 'credit') {
            filtered = filtered.filter(client => calculateClientTotal(client) < -0.005);
        } else if (currentFilter === 'debt') {
            filtered = filtered.filter(client => calculateClientTotal(client) > 0.005);
        }

        displayedClients = filtered;
        renderClients();
        updateSummaryBox();
    }

    function openTransactionModal(index) {
        currentClientIndex = index;
        const client = allClients[index];
        const total = calculateClientTotal(client);

        if (clientNameHeader) {
            clientNameHeader.innerHTML = `
                <input type="text" id="edit-client-name" value="${client.name}" 
                       style="background: transparent; border: none; font-size: inherit; font-weight: inherit; color: inherit; width: 100%;">
            `;
        }

        if (clientBalanceHeader) {
            clientBalanceHeader.textContent = formatCurrency(total);
            clientBalanceHeader.className = `balance-amount ${total > 0.005 ? 'balance-debt' : (total < -0.005 ? 'balance-credit' : '')}`;
        }

        if (transactionModal) {
            const transactionDate = document.getElementById('transaction-date');
            const transactionDescription = document.getElementById('transaction-description');
            const transactionAmount = document.getElementById('transaction-amount');
            
            if (transactionDate) transactionDate.value = formatDate(getTodayISO());
            if (transactionDescription) transactionDescription.value = '';
            if (transactionAmount) transactionAmount.value = '';
            
            transactionModal.style.display = 'flex';

            const editNameInput = document.getElementById('edit-client-name');
            if (editNameInput) {
                editNameInput.addEventListener('blur', () => {
                    const newName = editNameInput.value.trim();
                    if (newName && newName !== client.name) {
                        client.name = newName;
                        saveToLocalStorage();
                        applyFilters();
                        showAlert('Nome cliente aggiornato.', 'success');
                    }
                });

                editNameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { editNameInput.blur(); } });
            }
        }
    }

    function addTransaction() {
        if (currentClientIndex < 0) return;
        
        const transactionAmount = document.getElementById('transaction-amount');
        const transactionDate = document.getElementById('transaction-date');
        const transactionDescription = document.getElementById('transaction-description');
        
        if (!transactionAmount) return showAlert('Errore: campo importo non trovato.', 'danger');
        
        const amount = parseCurrency(transactionAmount.value);
        if (amount <= 0) return showAlert('L\'importo deve essere maggiore di zero.', 'danger');

        allClients[currentClientIndex].transactions.push({
            date: transactionDate ? parseItalianDate(transactionDate.value) : getTodayISO(),
            description: transactionDescription ? (transactionDescription.value.trim() || 'Carburante') : 'Carburante',
            amount: amount,
            timestamp: new Date().toISOString()
        });
        saveToLocalStorage();
        applyFilters();
        openTransactionModal(currentClientIndex);
        showAlert('Addebito aggiunto.', 'success');
    }

    function payFull() {
        if (currentClientIndex < 0) return;
        const client = allClients[currentClientIndex];
        const total = calculateClientTotal(client);

        if (Math.abs(total) < 0.005) {
            showAlert('Il cliente ha già saldato.', 'info');
            return;
        }

        if (!confirm(`Confermi il pagamento completo di ${formatCurrency(Math.abs(total))}? Lo storico verrà azzerato.`)) return;

        // MODIFICA: Azzera completamente lo storico dopo il saldo
        client.transactions = [];

        saveToLocalStorage();
        applyFilters();
        setTimeout(() => openTransactionModal(currentClientIndex), 100);
        showAlert('Pagamento completo registrato. Storico azzerato.', 'success');
    }

    function payPartial() {
        if (currentClientIndex < 0) return;
        const client = allClients[currentClientIndex];
        const total = calculateClientTotal(client);

        const amountStr = prompt(`Inserisci l'importo dell'acconto (saldo attuale: ${formatCurrency(total)}):`);
        if (!amountStr) return;

        const amount = parseCurrency(amountStr);
        if (amount <= 0) {
            showAlert('L\'importo deve essere maggiore di zero.', 'danger');
            return;
        }

        if (total > 0.005 && amount > total) {
            if (!confirm(`L'importo inserito (${formatCurrency(amount)}) è superiore al debito (${formatCurrency(total)}). Continuare?`)) return;
        }

        client.transactions.push({
            date: getTodayISO(),
            description: 'Acconto',
            amount: -amount,
            timestamp: new Date().toISOString()
        });

        saveToLocalStorage();
        applyFilters();
        setTimeout(() => openTransactionModal(currentClientIndex), 100);
        showAlert('Acconto registrato.', 'success');
    }

    function deleteClient() {
        if (currentClientIndex < 0) return;
        const client = allClients[currentClientIndex];

        if (confirm(`Sei sicuro di voler eliminare il cliente "${client.name}"? Questa azione non può essere annullata.`)) {
            allClients.splice(currentClientIndex, 1);
            saveToLocalStorage();
            applyFilters();
            closeTransactionModal();
            showAlert('Cliente eliminato.', 'success');
        }
    }

    function openHistoryModal() {
        if (currentClientIndex < 0) return;
        const client = allClients[currentClientIndex];
        if (historyClientName) historyClientName.textContent = client.name;
        renderHistory(client);
        if (historyModal) historyModal.style.display = 'flex';
    }

    function saveNewClient() {
        const clientNameInput = document.getElementById('client-name-input');
        const clientInitialBalanceInput = document.getElementById('client-initial-balance');
        
        if (!clientNameInput) return showAlert('Errore: campo nome non trovato.', 'danger');
        
        const name = clientNameInput.value.trim();
        const initialBalance = clientInitialBalanceInput ? parseCurrency(clientInitialBalanceInput.value) : 0;

        if (!name) {
            showAlert('Inserisci il nome del cliente.', 'danger');
            return;
        }

        const newClient = {
            id: generateId(),
            name: name,
            color: window.MemoriaStorage ? window.MemoriaStorage.getNextColor('amministrazione') : '#1D62EC',
            transactions: []
        };

        if (initialBalance > 0) {
            newClient.transactions.push({
                date: getTodayISO(),
                description: 'Credito iniziale',
                amount: -initialBalance,
                timestamp: new Date().toISOString()
            });
        }

        allClients.push(newClient);
        saveToLocalStorage();
        applyFilters();
        closeNewClientModal();
        
        // Pulisci i campi solo se esistono
        if (clientNameInput) clientNameInput.value = '';
        if (clientInitialBalanceInput) clientInitialBalanceInput.value = '';
        
        showAlert('Cliente aggiunto.', 'success');
    }

    function handleHistoryTableEvents(e) {
        const target = e.target;
        const row = target.closest('tr');
        if (!row || !row.dataset.transIndex) return;

        const transIndex = parseInt(row.dataset.transIndex, 10);
        const client = allClients[currentClientIndex];

        if (isNaN(transIndex) || !client || !client.transactions[transIndex]) {
            return showAlert("Errore nell'identificare la transazione.", 'danger');
        }

        if (target.closest('.history-delete-btn')) {
            if (confirm('Sei sicuro di voler eliminare questa transazione?')) {
                client.transactions.splice(transIndex, 1);
                saveToLocalStorage();
                renderHistory(client);
                applyFilters();
                showAlert('Transazione eliminata.');
            }
        } else if (target.matches('.history-input')) {
            target.addEventListener('change', () => {
                const transaction = client.transactions[transIndex];
                const field = target.dataset.field;
                if (field === 'date') transaction.date = parseItalianDate(target.value);
                else if (field === 'description') transaction.description = target.value;
                else if (field === 'amount') transaction.amount = parseCurrency(target.value);
                saveToLocalStorage();
                applyFilters();
            }, { once: true });
        }
    }

    function exportClients() {
        if (allClients.length === 0) return showAlert("Nessun cliente da esportare.", 'info');
        const exportData = {
            version: "1.0",
            type: "MyStation_Clients",
            exportedAt: new Date().toISOString(),
            data: allClients
        };
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clienti_amministrazione_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showAlert('Clienti esportati con successo.', 'success');
    }

    function importClients() {
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
                    let importedClients = [];
                    if (parsedJson && typeof parsedJson === 'object' && Array.isArray(parsedJson.data)) {
                        importedClients = parsedJson.data;
                    } else if (Array.isArray(parsedJson)) {
                        importedClients = parsedJson;
                    } else {
                        throw new Error('Formato del file JSON non valido.');
                    }
                    if (confirm(`Vuoi importare ${importedClients.length} clienti? I clienti esistenti verranno mantenuti.`)) {
                        importedClients.forEach(client => {
                            client.id = client.id || generateId();
                            client.color = client.color || (window.MemoriaStorage ? window.MemoriaStorage.getNextColor('amministrazione') : '#1D62EC');
                            client.transactions = client.transactions || [];
                        });
                        allClients = [...allClients, ...importedClients];
                        saveToLocalStorage();
                        applyFilters();
                        showAlert(`${importedClients.length} clienti importati.`, 'success');
                    }
                } catch (error) {
                    showAlert('Errore importazione: ' + error.message, 'danger');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    function printClientList() {
        if (displayedClients.length === 0) return showAlert("Nessun cliente da stampare.", 'info');
        const printWindow = window.open('', '_blank');
        
        // MODIFICA: Aumentato considerevolmente le dimensioni dei font per sfruttare lo spazio verticale
        let content = `<html><head><title>Lista Clienti</title><style>
            body{font-family:Arial,sans-serif;font-size:18px;line-height:1.6;margin:20px} 
            h1{font-size:32px;margin-bottom:30px;text-align:center} 
            table{width:100%;border-collapse:collapse;font-size:20px} 
            th,td{border:2px solid #333;padding:15px 20px;text-align:left} 
            th{background-color:#f2f2f2;font-size:22px;font-weight:bold} 
            .debt{color:red;font-weight:bold} 
            .credit{color:green;font-weight:bold}
            h3{font-size:26px;margin-top:40px;margin-bottom:20px}
            p{font-size:20px;margin:10px 0}
        </style></head><body>
        <h1>Lista Clienti (${new Date().toLocaleDateString('it-IT')})</h1>
        <table><thead><tr><th>Nome Cliente</th><th>Saldo</th><th>Stato</th></tr></thead><tbody>`;

        displayedClients.forEach(client => {
            const total = calculateClientTotal(client);
            const status = total > 0.005 ? 'Da pagare' : (total < -0.005 ? 'Credito' : 'Saldato');
            const className = total > 0.005 ? 'debt' : (total < -0.005 ? 'credit' : '');
            content += `<tr><td>${client.name}</td><td class="${className}">${formatCurrency(total)}</td><td>${status}</td></tr>`;
        });

        const totalDebt = displayedClients.reduce((sum, c) => (calculateClientTotal(c) > 0 ? sum + calculateClientTotal(c) : sum), 0);
        const totalCredit = displayedClients.reduce((sum, c) => (calculateClientTotal(c) < 0 ? sum + Math.abs(calculateClientTotal(c)) : sum), 0);

        content += `</tbody></table><h3>Riepilogo</h3><p>Totale debiti: <span class="debt">${formatCurrency(totalDebt)}</span></p><p>Totale crediti: <span class="credit">${formatCurrency(totalCredit)}</span></p></body></html>`;

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    }

    function printClientStatement() {
        if (currentClientIndex < 0) return showAlert("Nessun cliente selezionato.", 'info');
        const client = allClients[currentClientIndex];
        const printWindow = window.open('', '_blank');
        let content = `<html><head><title>Estratto Conto: ${client.name}</title><style>
            body{font-family:Arial,sans-serif} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:8px;text-align:left} th{background-color:#f2f2f2} .total-row{font-weight:bold;background-color:#f2f2f2} .credit{color:green} .debt{color:red}
        </style></head><body>
        <h2>Estratto Conto: ${client.name}</h2><h4>Data: ${new Date().toLocaleDateString('it-IT')}</h4>
        <table><thead><tr><th>Data</th><th>Descrizione</th><th style="text-align:right">Importo</th></tr></thead><tbody>`;

        const sorted = [...client.transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        let runningTotal = 0;

        sorted.forEach(t => {
            runningTotal += t.amount;
            const className = t.amount > 0 ? 'debt' : 'credit';
            content += `<tr><td>${formatDate(t.date)}</td><td>${t.description}</td><td style="text-align:right" class="${className}">${formatCurrency(t.amount)}</td></tr>`;
        });

        const finalClass = runningTotal > 0 ? 'debt' : 'credit';
        content += `<tr class="total-row"><td colspan="2">SALDO FINALE</td><td style="text-align:right" class="${finalClass}">${formatCurrency(runningTotal)}</td></tr>`;
        content += '</tbody></table></body></html>';

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    }

    function closeNewClientModal() {
        if (newClientModal) newClientModal.style.display = 'none';
    }

    function closeTransactionModal() {
        if (transactionModal) transactionModal.style.display = 'none';
        currentClientIndex = -1;
    }

    function closeHistoryModal() {
        if (historyModal) historyModal.style.display = 'none';
    }

    function renderClients() {
        if (!clientsGrid) return;

        const clientsToRender = isHidden ? [] : displayedClients;

        if (isHidden) {
            clientsGrid.innerHTML = '<p class="no-data-message">Clicca sull\'icona occhio per mostrare.</p>';
            return;
        }

        clientsGrid.innerHTML = '';
        if (clientsToRender.length === 0) {
            clientsGrid.innerHTML = '<p class="no-data-message">Nessun cliente trovato.</p>';
            return;
        }

        clientsToRender.forEach(client => {
            const clientBox = document.createElement('div');
            const originalIndex = allClients.findIndex(c => c.id === client.id);
            clientBox.className = 'client-box';
            const total = calculateClientTotal(client);
            const totalClass = total > 0.005 ? 'client-debt' : (total < -0.005 ? 'client-credit' : '');

            clientBox.innerHTML = `
                <div class="client-header">
                    <div class="client-icon-container" style="background: ${client.color || '#1D62EC'}"><i data-lucide="handshake"></i></div>
                    <h3 class="client-name">${client.name || 'Sconosciuto'}</h3>
                </div>
                <p class="client-total-grid ${totalClass}">${formatCurrency(Math.abs(total))}</p>
                <div class="client-status">
                    ${total > 0.005 ? '<span class="status-badge debt">Da pagare</span>' : 
                      total < -0.005 ? '<span class="status-badge credit">Credito</span>' : 
                      '<span class="status-badge paid">Saldato</span>'}
                </div>
            `;
            const openModalBtn = document.createElement('button');
            openModalBtn.className = 'client-open-modal-btn';
            openModalBtn.title = 'Apri dettagli';
            openModalBtn.innerHTML = '<i data-lucide="square-arrow-out-up-right"></i>';
            openModalBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openTransactionModal(originalIndex);
            });
            clientBox.appendChild(openModalBtn);
            clientsGrid.appendChild(clientBox);
        });
        if (window.lucide) lucide.createIcons();
    }

    function renderHistory(client) {
        if (!historyTableBody) return;
        historyTableBody.innerHTML = '';
        if (!client || client.transactions.length === 0) {
            historyTableBody.innerHTML = `<tr><td colspan="5" class="no-data-message">Nessuna transazione.</td></tr>`;
            return;
        }
        const sorted = [...client.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
        sorted.forEach(trans => {
            const index = client.transactions.indexOf(trans);
            const row = document.createElement('tr');
            row.dataset.transIndex = index;
            row.innerHTML = `
                <td><input class="history-input" value="${formatDate(trans.date)}" data-field="date"></td>
                <td><input class="history-input" value="${trans.description || ''}" data-field="description"></td>
                <td><input class="history-input" value="${formatCurrency(trans.amount)}" data-field="amount"></td>
                <td><span>${trans.amount > 0 ? 'Addebito' : 'Pagamento'}</span></td>
                <td><button class="action-btn delete-btn" title="Elimina"><i data-lucide="trash-2"></i></button></td>
            `;
            historyTableBody.appendChild(row);
        });
        if (window.lucide) lucide.createIcons();
    }

    // Logica di gestione dati
    function saveToLocalStorage() {
        if (window.MemoriaStorage) window.MemoriaStorage.saveClients(allClients);
    }

    function loadFromLocalStorage() {
        if (window.MemoriaStorage) {
            allClients = window.MemoriaStorage.loadClients().map(client => ({
                ...client,
                id: client.id || generateId(),
                color: client.color || (window.MemoriaStorage ? window.MemoriaStorage.getNextColor('amministrazione') : '#1D62EC'),
                transactions: client.transactions?.map(t => ({...t, amount: parseFloat(t.amount) || 0 })) || []
            }));
            applyFilters();
        }
    }

    function updateSummaryBox() {
        // 1. Posizioni (numero clienti totali)
        if (summaryTotalClients) summaryTotalClients.textContent = allClients.length;

        // 2. Credito concesso (saldo netto totale)
        const netBalance = allClients.reduce((total, client) => total + calculateClientTotal(client), 0);

        if (summaryNetBalance) {
            summaryNetBalance.textContent = formatCurrency(netBalance);
            summaryNetBalance.classList.remove('debt', 'credit');

            if (netBalance > 0.005) {
                summaryNetBalance.classList.add('debt');
            } else if (netBalance < -0.005) {
                // Applica il colore rosso anche per i negativi come richiesto
                summaryNetBalance.classList.add('debt');
            }
        }

        // 3. Crediti attivi (clienti con credito)
        const activeCredits = allClients.filter(client => calculateClientTotal(client) < -0.005).length;
        if (summaryActiveCredits) summaryActiveCredits.textContent = activeCredits;

        // 4. Debiti attivi (clienti con debito)
        const activeDebts = allClients.filter(client => calculateClientTotal(client) > 0.005).length;
        if (summaryActiveDebts) summaryActiveDebts.textContent = activeDebts;
    }

    // Inizializzazione
    function init() {
        loadFromLocalStorage();

        if (searchClientInput) {
            searchClientInput.addEventListener('input', () => {
                if (clearClientSearchBtn) clearClientSearchBtn.style.display = searchClientInput.value ? 'block' : 'none';
                applyFilters();
            });
        }

        if (clearClientSearchBtn) {
            clearClientSearchBtn.addEventListener('click', () => {
                searchClientInput.value = '';
                clearClientSearchBtn.style.display = 'none';
                applyFilters();
            });
        }

        if (showHideClientsBtn) {
            showHideClientsBtn.addEventListener('click', () => {
                isHidden = !isHidden;
                applyFilters();
                const iconElement = showHideClientsBtn.querySelector('i');
                if (iconElement) {
                    iconElement.setAttribute('data-lucide', isHidden ? 'eye-off' : 'eye');
                    if (window.lucide) lucide.createIcons();
                }
            });
        }

        const toggleFilter = (btn, filterType) => {
            const wasActive = currentFilter === filterType;
            currentFilter = wasActive ? 'all' : filterType;
            
            // Resetta specificamente i pulsanti filtro crediti e debiti
            [filterCreditBtn, filterDebtBtn].forEach(filterBtn => {
                if (filterBtn) {
                    filterBtn.classList.remove('active');
                    const icon = filterBtn.querySelector('i');
                    if (icon) {
                        icon.style.color = ''; // Rimuove colore personalizzato
                    }
                }
            });
            
            // Se il filtro non era attivo, attivalo e colora l'icona
            if (!wasActive) {
                btn.classList.add('active');
                const icon = btn.querySelector('i');
                if (icon) {
                    // Colori specifici per tipo di filtro
                    if (filterType === 'credit') {
                        icon.style.color = '#22c55e'; // Verde per crediti
                    } else if (filterType === 'debt') {
                        icon.style.color = '#ef4444'; // Rosso per debiti
                    }
                }
            }
            
            applyFilters();
        };

        if (filterCreditBtn) filterCreditBtn.addEventListener('click', () => toggleFilter(filterCreditBtn, 'credit'));
        if (filterDebtBtn) filterDebtBtn.addEventListener('click', () => toggleFilter(filterDebtBtn, 'debt'));
        if (newClientBtn) newClientBtn.addEventListener('click', () => { if (newClientModal) newClientModal.style.display = 'flex'; });
        if (closeClientModalBtn) closeClientModalBtn.addEventListener('click', closeNewClientModal);
        if (saveClientBtn) saveClientBtn.addEventListener('click', saveNewClient);
        if (closeTransactionModalBtn) closeTransactionModalBtn.addEventListener('click', closeTransactionModal);
        if (confirmTransactionBtn) confirmTransactionBtn.addEventListener('click', addTransaction);
        if (payFullBtn) payFullBtn.addEventListener('click', payFull);
        if (payPartialBtn) payPartialBtn.addEventListener('click', payPartial);
        if (deleteClientBtn) deleteClientBtn.addEventListener('click', deleteClient);
        if (viewHistoryBtn) viewHistoryBtn.addEventListener('click', openHistoryModal);
        if (printTransactionBtn) printTransactionBtn.addEventListener('click', printClientStatement);
        if (closeHistoryModalBtn) closeHistoryModalBtn.addEventListener('click', closeHistoryModal);
        if (historyTableBody) historyTableBody.addEventListener('click', handleHistoryTableEvents);
        if (exportClientsBtn) exportClientsBtn.addEventListener('click', exportClients);
        if (importClientsBtn) importClientsBtn.addEventListener('click', importClients);
        if (printClientsBtn) printClientsBtn.addEventListener('click', printClientList);

        // Gestione modali con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeNewClientModal();
                closeTransactionModal();
                closeHistoryModal();
            }
        });

        // Inizializza gli indicatori dei filtri
        if (clearClientSearchBtn) clearClientSearchBtn.style.display = 'none';
    }

    init();
});
/**
 * ANAGRAFICA.JS
 * Gestione della sezione anagrafica con sistema di categorie e funzione stampa
 * --- VERSIONE DEFINITIVA COMPLETA ---
 */

document.addEventListener('DOMContentLoaded', () => {
    // Riferimenti elementi DOM
    const contactsGrid = document.getElementById('contacts-grid');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const importBtn = document.getElementById('import-vcf-btn');
    const exportBtn = document.getElementById('export-vcf-btn');
    const printBtn = document.getElementById('print-contacts-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const vcfFileInput = document.getElementById('vcf-file-input');
    const customAlertBox = document.getElementById('custom-alert-box');
    const newContactBtn = document.getElementById('new-contact-btn');
    const newContactModal = document.getElementById('new-contact-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const saveContactBtn = document.getElementById('save-contact-btn');
    const editContactModal = document.getElementById('edit-contact-modal');
    const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
    const saveEditContactBtn = document.getElementById('save-edit-contact-btn');
    const editContactName = document.getElementById('edit-contact-name');
    const editContactOrg = document.getElementById('edit-contact-org');
    const editContactTel = document.getElementById('edit-contact-tel');
    const editContactEmail = document.getElementById('edit-contact-email');
    const editContactNotes = document.getElementById('edit-contact-notes');
    const editContactCategory = document.getElementsByName('edit-contact-category');
    const deleteContactBtn = document.getElementById('delete-contact-btn');

    // Variabili globali
    let contacts = [];
    let filteredContacts = [];
    let currentFilter = 'all';
    let searchQuery = '';
    let currentEditingContactId = null;

    // Inizializzazione
    loadContacts();
    setupEventListeners();

    function setupEventListeners() {
        // Ricerca
        if (searchInput) {
            searchInput.addEventListener('input', handleSearch);
        }
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', clearSearch);
        }

        // Filtri categoria
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => handleCategoryFilter(btn.dataset.category));
        });

        // Pulsanti azione
        if (importBtn) importBtn.addEventListener('click', importVCF);
        if (exportBtn) exportBtn.addEventListener('click', exportVCF);
        if (printBtn) printBtn.addEventListener('click', printContacts);
        if (deleteAllBtn) deleteAllBtn.addEventListener('click', deleteAllContacts);
        if (newContactBtn) newContactBtn.addEventListener('click', openNewContactModal);

        // Input file VCF
        if (vcfFileInput) {
            vcfFileInput.addEventListener('change', handleVCFImport);
        }

        // Modali
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeNewContactModal);
        if (saveContactBtn) saveContactBtn.addEventListener('click', saveNewContact);
        if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', closeEditContactModal);
        if (saveEditContactBtn) saveEditContactBtn.addEventListener('click', saveEditContact);
        if (deleteContactBtn) deleteContactBtn.addEventListener('click', deleteContact);

        // Chiusura modali con ESC o click fuori
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeNewContactModal();
                closeEditContactModal();
            }
        });

        // Click fuori dal modal
        if (newContactModal) {
            newContactModal.addEventListener('click', (e) => {
                if (e.target === newContactModal) closeNewContactModal();
            });
        }
        if (editContactModal) {
            editContactModal.addEventListener('click', (e) => {
                if (e.target === editContactModal) closeEditContactModal();
            });
        }
    }

    function loadContacts() {
        const savedContacts = localStorage.getItem('anagrafica-contacts');
        contacts = savedContacts ? JSON.parse(savedContacts) : [];
        
      
        applyFilters();
    }

    function saveContacts() {
        localStorage.setItem('anagrafica-contacts', JSON.stringify(contacts));
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function handleSearch() {
        searchQuery = searchInput.value.toLowerCase().trim();
        
        // Mostra/nascondi il pulsante clear
        if (clearSearchBtn) {
            clearSearchBtn.style.display = searchQuery ? 'flex' : 'none';
        }
        
        applyFilters();
    }

    function clearSearch() {
        searchInput.value = '';
        searchQuery = '';
        if (clearSearchBtn) {
            clearSearchBtn.style.display = 'none';
        }
        applyFilters();
    }

    function handleCategoryFilter(category) {
        // Logica toggle: se clicchi sullo stesso filtro già attivo, deselezionalo
        if (currentFilter === category) {
            currentFilter = 'all'; // Torna a mostrare tutti
        } else {
            currentFilter = category;
        }
        
        // Aggiorna stato visivo pulsanti
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Se non è "all", attiva il pulsante corrispondente
        if (currentFilter !== 'all') {
            const activeBtn = document.querySelector(`[data-category="${currentFilter}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        }
        
        applyFilters();
    }

    function applyFilters() {
        let filtered = [...contacts];
        
        // Filtro categoria
        if (currentFilter !== 'all') {
            filtered = filtered.filter(contact => contact.CATEGORIA === currentFilter);
        }
        
        // Filtro ricerca
        if (searchQuery) {
            filtered = filtered.filter(contact => {
                return (contact.FN || '').toLowerCase().includes(searchQuery) ||
                       (contact.ORG || '').toLowerCase().includes(searchQuery) ||
                       (contact.TEL || '').toLowerCase().includes(searchQuery) ||
                       (contact.EMAIL || '').toLowerCase().includes(searchQuery) ||
                       (contact.NOTE || '').toLowerCase().includes(searchQuery);
            });
        }
        
        // ORDINAMENTO ALFABETICO PER NOME
        filtered.sort((a, b) => {
            const nameA = (a.FN || '').toLowerCase();
            const nameB = (b.FN || '').toLowerCase();
            return nameA.localeCompare(nameB, 'it', { sensitivity: 'base' });
        });
        
        filteredContacts = filtered;
        renderContacts(filteredContacts);
    }

    function renderContacts(contacts) {
        if (!contactsGrid) return;
        
        if (!contacts || contacts.length === 0) {
            contactsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-secondary);">
                    <i data-lucide="users" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <h3 style="margin-bottom: 8px;">Nessun contatto trovato</h3>
                    <p>Aggiungi il primo contatto o modifica i filtri di ricerca</p>
                </div>
            `;
            // Re-initialize lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            return;
        }

        contactsGrid.innerHTML = contacts.map(contact => {
            const categoryColor = getCategoryColor(contact.CATEGORIA);
            const categoryIcon = getCategoryIcon(contact.CATEGORIA);
            
            return `
                <div class="contact-box" data-contact-id="${contact.id}">
                    <div class="contact-header">
                        <div class="contact-icon-container" style="background-color: ${categoryColor};">
                            <i data-lucide="${categoryIcon}"></i>
                        </div>
                        <div class="contact-details">
                            <div class="contact-name">${contact.FN || 'Nome non specificato'}</div>
                            <div class="contact-org">${contact.ORG || ''}</div>
                        </div>
                    </div>
                    <ul class="contact-info-list">
                        ${contact.TEL ? `<li class="contact-info-item"><i data-lucide="phone"></i>${contact.TEL}</li>` : ''}
                        ${contact.EMAIL ? `<li class="contact-info-item"><i data-lucide="mail"></i>${contact.EMAIL}</li>` : ''}
                        ${contact.NOTE ? `<li class="contact-info-item"><i data-lucide="file-text"></i>${contact.NOTE}</li>` : ''}
                    </ul>
                    <button class="contact-edit-btn" onclick="editContact('${contact.id}')" title="Modifica contatto">
                        <i data-lucide="square-pen"></i>
                    </button>
                </div>
            `;
        }).join('');

        // Re-initialize lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function getCategoryColor(category) {
        const colors = {
            'clienti': '#A855F7',    // Viola
            'autisti': '#2ECC71',    // Verde
            'enilive': '#06B6D4'     // Cyan
        };
        return colors[category] || '#6B7280'; // Grigio di default
    }

    function getCategoryIcon(category) {
        const icons = {
            'clienti': 'user',
            'autisti': 'truck',
            'enilive': 'zap'
        };
        return icons[category] || 'user';
    }

    // Funzione globale per modificare contatto
    window.editContact = function(contactId) {
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) return;

        currentEditingContactId = contactId;
        
        // Popola il form di modifica
        if (editContactName) editContactName.value = contact.FN || '';
        if (editContactOrg) editContactOrg.value = contact.ORG || '';
        if (editContactTel) editContactTel.value = contact.TEL || '';
        if (editContactEmail) editContactEmail.value = contact.EMAIL || '';
        if (editContactNotes) editContactNotes.value = contact.NOTE || '';
        
        // Seleziona la categoria
        editContactCategory.forEach(radio => {
            radio.checked = radio.value === contact.CATEGORIA;
        });
        
        // Mostra il modal
        if (editContactModal) {
            editContactModal.style.display = 'flex';
        }
    };

    function openNewContactModal() {
        if (newContactModal) {
            newContactModal.style.display = 'flex';
            
            // Reset form
            const form = newContactModal.querySelector('form');
            if (form) form.reset();
        }
    }

    function closeNewContactModal() {
        if (newContactModal) {
            newContactModal.style.display = 'none';
        }
    }

    function closeEditContactModal() {
        if (editContactModal) {
            editContactModal.style.display = 'none';
        }
        currentEditingContactId = null;
    }

    function saveNewContact() {
        const form = newContactModal.querySelector('form');
        if (!form) return;

        const formData = new FormData(form);
        const newContact = {
            id: generateId(),
            FN: formData.get('contact-name') || '',
            ORG: formData.get('contact-org') || '',
            TEL: formData.get('contact-tel') || '',
            EMAIL: formData.get('contact-email') || '',
            NOTE: formData.get('contact-notes') || '',
            CATEGORIA: formData.get('contact-category') || 'clienti'
        };

        contacts.push(newContact);
        saveContacts();
        applyFilters();
        closeNewContactModal();
        
        showAlert('Contatto aggiunto con successo!', 'success');
    }

    function saveEditContact() {
        if (!currentEditingContactId) return;

        const contactIndex = contacts.findIndex(c => c.id === currentEditingContactId);
        if (contactIndex === -1) return;

        // Ottieni categoria selezionata
        let selectedCategory = 'clienti';
        editContactCategory.forEach(radio => {
            if (radio.checked) selectedCategory = radio.value;
        });

        // Aggiorna il contatto
        contacts[contactIndex] = {
            ...contacts[contactIndex],
            FN: editContactName.value || '',
            ORG: editContactOrg.value || '',
            TEL: editContactTel.value || '',
            EMAIL: editContactEmail.value || '',
            NOTE: editContactNotes.value || '',
            CATEGORIA: selectedCategory
        };

        saveContacts();
        applyFilters();
        closeEditContactModal();
        
        showAlert('Contatto modificato con successo!', 'success');
    }

    function importVCF() {
        if (vcfFileInput) {
            vcfFileInput.click();
        }
    }

    function handleVCFImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const vcfContent = e.target.result;
            const parsedContacts = parseVCF(vcfContent);
            
            if (parsedContacts.length > 0) {
                contacts.push(...parsedContacts);
                saveContacts();
                applyFilters();
                showAlert(`Importati ${parsedContacts.length} contatti!`, 'success');
            } else {
                showAlert('Nessun contatto valido trovato nel file VCF', 'error');
            }
        };
        reader.readAsText(file);
        
        // Reset input
        event.target.value = '';
    }

    function parseVCF(vcfContent) {
        const contacts = [];
        const vcardBlocks = vcfContent.split('BEGIN:VCARD');
        
        vcardBlocks.forEach(block => {
            if (!block.trim()) return;
            
            const contact = {
                id: generateId(),
                FN: '',
                ORG: '',
                TEL: '',
                EMAIL: '',
                NOTE: '',
                CATEGORIA: 'clienti'
            };
            
            const lines = block.split('\n');
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('FN:')) {
                    contact.FN = trimmedLine.substring(3);
                } else if (trimmedLine.startsWith('ORG:')) {
                    contact.ORG = trimmedLine.substring(4);
                } else if (trimmedLine.startsWith('TEL:') || trimmedLine.includes('TEL;')) {
                    contact.TEL = trimmedLine.split(':')[1] || '';
                } else if (trimmedLine.startsWith('EMAIL:') || trimmedLine.includes('EMAIL;')) {
                    contact.EMAIL = trimmedLine.split(':')[1] || '';
                } else if (trimmedLine.startsWith('NOTE:')) {
                    contact.NOTE = trimmedLine.substring(5);
                }
            });
            
            if (contact.FN) {
                contacts.push(contact);
            }
        });
        
        return contacts;
    }

    function exportVCF() {
        if (contacts.length === 0) {
            showAlert('Nessun contatto da esportare', 'error');
            return;
        }

        const vcfContent = contacts.map(contact => {
            return [
                'BEGIN:VCARD',
                'VERSION:3.0',
                `FN:${contact.FN || ''}`,
                contact.ORG ? `ORG:${contact.ORG}` : '',
                contact.TEL ? `TEL:${contact.TEL}` : '',
                contact.EMAIL ? `EMAIL:${contact.EMAIL}` : '',
                contact.NOTE ? `NOTE:${contact.NOTE}` : '',
                'END:VCARD'
            ].filter(line => line).join('\n');
        }).join('\n\n');

        const blob = new Blob([vcfContent], { type: 'text/vcard' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contatti_anagrafica.vcf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showAlert('File VCF esportato con successo!', 'success');
    }

    function printContacts() {
        const contactsToPrint = filteredContacts.length > 0 ? filteredContacts : contacts;
        
        if (contactsToPrint.length === 0) {
            showAlert('Nessun contatto da stampare', 'error');
            return;
        }

        generatePrintableHTML(contactsToPrint);
    }

    function generatePrintableHTML(contactsToPrint) {
        const printWindow = window.open('', '_blank');
        
        // Raggruppa per categoria
        const grouped = {
            clienti: contactsToPrint.filter(c => c.CATEGORIA === 'clienti'),
            autisti: contactsToPrint.filter(c => c.CATEGORIA === 'autisti'),
            enilive: contactsToPrint.filter(c => c.CATEGORIA === 'enilive')
        };

        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Anagrafica Contatti - Stampa</title>
            <style>
                @page {
                    size: landscape;
                    margin: 1cm;
                }
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 11px;
                    line-height: 1.4;
                    color: #333;
                    background: white;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #333;
                }
                .header h1 {
                    font-size: 24px;
                    margin-bottom: 5px;
                    color: #333;
                }
                .header .subtitle {
                    font-size: 14px;
                    color: #666;
                }
                .category-section {
                    margin-bottom: 25px;
                    break-inside: avoid;
                }
                .category-title {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    padding: 8px 12px;
                    color: white;
                    border-radius: 4px;
                }
                .category-title.clienti { background-color: #A855F7; }
                .category-title.autisti { background-color: #2ECC71; }
                .category-title.enilive { background-color: #06B6D4; }
                
                .contacts-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                    border: 1px solid #ddd;
                }
                .contacts-table th {
                    background-color: #f8f9fa;
                    padding: 8px 10px;
                    text-align: left;
                    font-weight: 600;
                    border: 1px solid #ddd;
                    font-size: 12px;
                }
                .contacts-table td {
                    padding: 6px 10px;
                    border: 1px solid #ddd;
                    vertical-align: top;
                    word-wrap: break-word;
                    max-width: 150px;
                }
                .contacts-table tr:nth-child(even) {
                    background-color: #f8f9fa;
                }
                .contact-name {
                    font-weight: 600;
                    color: #333;
                }
                .contact-org,
                .contact-tel,
                .contact-email,
                .contact-notes {
                    color: #666;
                    font-size: 10px;
                }
                .summary {
                    margin-top: 20px;
                    padding: 15px;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                    border: 1px solid #ddd;
                }
                .summary h3 {
                    margin-bottom: 10px;
                    color: #333;
                    font-size: 14px;
                }
                .summary-item {
                    display: inline-block;
                    margin-right: 20px;
                    font-weight: 500;
                    color: #666;
                }
                @media print {
                    body { print-color-adjust: exact; }
                    .category-section { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Anagrafica Contatti</h1>
                <div class="subtitle">Stampato il ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}</div>
            </div>
        `);

        // Stampa per ogni categoria
        Object.keys(grouped).forEach(categoryKey => {
            const categoryContacts = grouped[categoryKey];
            if (categoryContacts.length === 0) return;

            const categoryNames = {
                'clienti': 'CLIENTI',
                'autisti': 'AUTISTI', 
                'enilive': 'ENILIVE'
            };

            printWindow.document.write(`
                <div class="category-section">
                    <div class="category-title ${categoryKey}">${categoryNames[categoryKey]} (${categoryContacts.length})</div>
                    <table class="contacts-table">
                        <thead>
                            <tr>
                                <th style="width: 25%;">Nome</th>
                                <th style="width: 20%;">Organizzazione</th>
                                <th style="width: 18%;">Telefono</th>
                                <th style="width: 22%;">Email</th>
                                <th style="width: 15%;">Note</th>
                            </tr>
                        </thead>
                        <tbody>
            `);

            categoryContacts.forEach(contact => {
                printWindow.document.write(`
                    <tr>
                        <td class="contact-name">${contact.FN || '-'}</td>
                        <td class="contact-org">${contact.ORG || '-'}</td>
                        <td class="contact-tel">${contact.TEL || '-'}</td>
                        <td class="contact-email">${contact.EMAIL || '-'}</td>
                        <td class="contact-notes">${contact.NOTE || '-'}</td>
                    </tr>
                `);
            });

            printWindow.document.write('</tbody></table></div>');
        });

        // Summary
        printWindow.document.write(`
            <div class="summary">
                <h3>Riepilogo</h3>
                <span class="summary-item">Totale contatti: ${contactsToPrint.length}</span>
        `);
        
        if (grouped.clienti.length > 0) {
            printWindow.document.write(`<span class="summary-item">Clienti: ${grouped.clienti.length}</span>`);
        }
        if (grouped.autisti.length > 0) {
            printWindow.document.write(`<span class="summary-item">Autisti: ${grouped.autisti.length}</span>`);
        }
        if (grouped.enilive.length > 0) {
            printWindow.document.write(`<span class="summary-item">Enilive: ${grouped.enilive.length}</span>`);
        }
        
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    function deleteContact() {
        if (!currentEditingContactId) return;

        if (confirm('Sei sicuro di voler eliminare questo contatto? Questa azione non può essere annullata.')) {
            const contactIndex = contacts.findIndex(c => c.id === currentEditingContactId);
            if (contactIndex !== -1) {
                contacts.splice(contactIndex, 1);
                saveContacts();
                applyFilters();
                closeEditContactModal();
                showAlert('Contatto eliminato con successo!', 'success');
            }
        }
    }

    function deleteAllContacts() {
        if (contacts.length === 0) {
            showAlert('Nessun contatto da eliminare', 'error');
            return;
        }

        if (confirm('Sei sicuro di voler eliminare TUTTI i contatti? Questa azione non può essere annullata.')) {
            contacts = [];
            saveContacts();
            applyFilters();
            showAlert('Tutti i contatti sono stati eliminati', 'success');
        }
    }

    function showAlert(message, type = 'info') {
        if (!customAlertBox) return;

        customAlertBox.textContent = message;
        customAlertBox.className = `custom-alert ${type}`;
        customAlertBox.style.display = 'block';

        setTimeout(() => {
            customAlertBox.style.display = 'none';
        }, 3000);
    }
});
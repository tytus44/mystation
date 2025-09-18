// =============================================
// FILE: anagrafica.js (versione Alpine.js) - VERSIONE CON PREFERITI
// DESCRIZIONE: Modulo per la gestione della
// sezione Anagrafica (contatti, import/export, preferiti).
// CORREZIONI: UTF-8 e funzionalità preferiti
// =============================================

function anagraficaModule() {
    return {
        // === STATO DELLA SEZIONE ANAGRAFICA ===
        anagraficaViewMode: Alpine.$persist('list'), // 'list' | 'create-contatto' | 'edit-contatto' | 'import-file'
        anagraficaFilters: Alpine.$persist({ search: '', favorites: 'all' }), // ✨ AGGIUNTO: filtro preferiti
        anagraficaSort: { column: 'cognome', direction: 'asc' },
        
        // === NUOVE: SELEZIONI MULTIPLE ===
        selectedContatti: [],
        selectAll: false,
        
        // === DATI ===
        editingContatto: null,
        contattoForm: {
            nome: '',
            cognome: '',
            azienda: '',
            telefono1: '',
            telefono2: '',
            email: '',
            note: '',
            isFavorite: false // ✨ AGGIUNTO: campo preferito
        },
        
        // === STATO IMPORT ===
        importProgress: { show: false, message: '', progress: 0 },
        
        // === INIZIALIZZAZIONE ===
        initAnagrafica() {
            // Inizializza l'array contatti se non esiste
            if (!Array.isArray(this.data.contatti)) {
                this.data.contatti = [];
            }
            this.resetContattoForm();
            this.selectedContatti = [];
            this.selectAll = false;
        },

        // === ✨ NUOVI METODI PER I PREFERITI ===
        
        // Togglea lo stato preferito di un contatto
        toggleFavorite(contattoId) {
            const contattoIndex = this.data.contatti.findIndex(c => c.id === contattoId);
            if (contattoIndex !== -1) {
                this.data.contatti[contattoIndex].isFavorite = !this.data.contatti[contattoIndex].isFavorite;
                const action = this.data.contatti[contattoIndex].isFavorite ? 'aggiunto ai' : 'rimosso dai';
                this.showNotification(`Contatto ${action} preferiti`);
                this.refreshIcons();
            }
        },
        
        // Conta i contatti preferiti
        getFavoritesCount() {
            if (!Array.isArray(this.data.contatti)) return 0;
            return this.data.contatti.filter(c => c.isFavorite === true).length;
        },

        // === METODI SELEZIONE MULTIPLA ===
        
        toggleSelectAll() {
            if (this.selectAll) {
                this.selectedContatti = this.sortedContatti().map(c => c.id);
            } else {
                this.selectedContatti = [];
            }
        },
        
        toggleSelectContatto(contattoId) {
            const index = this.selectedContatti.indexOf(contattoId);
            if (index > -1) {
                this.selectedContatti.splice(index, 1);
            } else {
                this.selectedContatti.push(contattoId);
            }
            this.updateSelectAllState();
        },
        
        updateSelectAllState() {
            const visibleContatti = this.sortedContatti();
            this.selectAll = visibleContatti.length > 0 && 
                this.selectedContatti.length === visibleContatti.length;
        },
        
        deleteBulkContatti() {
            if (this.selectedContatti.length === 0) {
                this.showNotification('Seleziona almeno un contatto');
                return;
            }
            
            const count = this.selectedContatti.length;
            this.showConfirm(
                `Sei sicuro di voler eliminare ${count} contatti selezionati? Questa azione non può essere annullata.`,
                () => {
                    this.data.contatti = this.data.contatti.filter(c => !this.selectedContatti.includes(c.id));
                    this.selectedContatti = [];
                    this.selectAll = false;
                    this.showNotification(`Eliminati ${count} contatti`);
                    this.refreshIcons();
                }
            );
        },

        // === METODI DI NAVIGAZIONE ===
        
        showCreateContatto() {
            this.anagraficaViewMode = 'create-contatto';
            this.editingContatto = null;
            this.resetContattoForm();
            this.refreshIcons();
        },

        showEditContatto(contatto) {
            this.anagraficaViewMode = 'edit-contatto';
            this.editingContatto = contatto;
            this.contattoForm = {
                nome: contatto.nome || '',
                cognome: contatto.cognome || '',
                azienda: contatto.azienda || '',
                telefono1: contatto.telefono1 || '',
                telefono2: contatto.telefono2 || '',
                email: contatto.email || '',
                note: contatto.note || '',
                isFavorite: contatto.isFavorite || false // ✨ AGGIUNTO: carica stato preferito
            };
            this.refreshIcons();
        },

        showImportFile() {
            this.anagraficaViewMode = 'import-file';
            this.refreshIcons();
        },

        backToAnagraficaList() {
            this.anagraficaViewMode = 'list';
            this.editingContatto = null;
            this.resetContattoForm();
        },

        // === METODI DI ORDINAMENTO E FILTRO ===

        sortAnagrafica(column) {
            if (this.anagraficaSort.column === column) {
                this.anagraficaSort.direction = this.anagraficaSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                this.anagraficaSort.column = column;
                this.anagraficaSort.direction = 'asc';
            }
        },

        // ✨ MODIFICATO: aggiunto filtro preferiti e ordinamento prioritario
        sortedContatti() {
            if (!Array.isArray(this.data.contatti)) return [];
            
            let contatti = [...this.data.contatti];
            
            // Applica filtro ricerca
            if (this.anagraficaFilters.search.trim()) {
                const query = this.anagraficaFilters.search.toLowerCase();
                contatti = contatti.filter(c => 
                    (c.nome || '').toLowerCase().includes(query) ||
                    (c.cognome || '').toLowerCase().includes(query) ||
                    (c.azienda || '').toLowerCase().includes(query) ||
                    (c.email || '').toLowerCase().includes(query)
                );
            }
            
            // ✨ NUOVO: Applica filtro preferiti
            if (this.anagraficaFilters.favorites === 'favorites') {
                contatti = contatti.filter(c => c.isFavorite === true);
            }
            
            // ✨ MODIFICATO: Ordinamento con priorità ai preferiti
            return contatti.sort((a, b) => {
                // I preferiti vengono sempre prima quando il filtro non è specifico sui preferiti
                if (this.anagraficaFilters.favorites !== 'favorites') {
                    const aFav = a.isFavorite ? 1 : 0;
                    const bFav = b.isFavorite ? 1 : 0;
                    if (aFav !== bFav) {
                        return bFav - aFav; // I preferiti prima
                    }
                }
                
                // Ordinamento normale
                const dir = this.anagraficaSort.direction === 'asc' ? 1 : -1;
                const aVal = (a[this.anagraficaSort.column] || '').toLowerCase();
                const bVal = (b[this.anagraficaSort.column] || '').toLowerCase();
                return aVal.localeCompare(bVal, 'it-IT') * dir;
            });
        },

        // === METODI UTILITY ===

        resetContattoForm() {
            this.contattoForm = {
                nome: '',
                cognome: '',
                azienda: '',
                telefono1: '',
                telefono2: '',
                email: '',
                note: '',
                isFavorite: false // ✨ AGGIUNTO: reset campo preferito
            };
        },

        // === GESTIONE CONTATTI ===

        // ✨ MODIFICATO: aggiunto salvataggio campo preferito
        saveContatto() {
            if (!this.contattoForm.nome.trim() && !this.contattoForm.cognome.trim()) {
                this.showNotification('Nome o cognome sono obbligatori');
                return;
            }

            const contatto = {
                id: this.editingContatto ? this.editingContatto.id : this.generateUniqueId('contatto'),
                nome: this.contattoForm.nome.trim(),
                cognome: this.contattoForm.cognome.trim(),
                azienda: this.contattoForm.azienda.trim(),
                telefono1: this.contattoForm.telefono1.trim(),
                telefono2: this.contattoForm.telefono2.trim(),
                email: this.contattoForm.email.trim(),
                note: this.contattoForm.note.trim(),
                isFavorite: this.contattoForm.isFavorite || false, // ✨ AGGIUNTO: salva stato preferito
                createdAt: this.editingContatto ? this.editingContatto.createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (this.editingContatto) {
                const index = this.data.contatti.findIndex(c => c.id === this.editingContatto.id);
                if (index !== -1) this.data.contatti[index] = contatto;
                this.showNotification('Contatto aggiornato con successo!');
            } else {
                this.data.contatti.push(contatto);
                this.showNotification('Contatto aggiunto con successo!');
            }

            this.backToAnagraficaList();
            this.refreshIcons();
        },

        deleteContatto(contattoId) {
            const contatto = this.data.contatti.find(c => c.id === contattoId);
            if (!contatto) return;
            
            const nomeCompleto = [contatto.nome, contatto.cognome].filter(n => n).join(' ') || 'Contatto senza nome';
            this.showConfirm('Sei sicuro di voler eliminare il contatto "' + nomeCompleto + '"?', () => {
                this.data.contatti = this.data.contatti.filter(c => c.id !== contattoId);
                this.showNotification('Contatto eliminato.');
                this.refreshIcons();
            });
        },

        // === ELIMINA RUBRICA COMPLETA ===
        
        deleteAllContatti() {
            if (!Array.isArray(this.data.contatti) || this.data.contatti.length === 0) {
                this.showNotification('La rubrica è già vuota');
                return;
            }
            
            const count = this.data.contatti.length;
            this.showConfirm(
                `Sei sicuro di voler eliminare TUTTA la rubrica? Verranno eliminati ${count} contatti. Questa azione non può essere annullata.`,
                () => {
                    this.data.contatti = [];
                    this.selectedContatti = [];
                    this.selectAll = false;
                    this.showNotification(`Rubrica eliminata: ${count} contatti rimossi`);
                    this.refreshIcons();
                }
            );
        },

        // === IMPORT/EXPORT FILE - SOLO CSV ===

        async handleFileImport(event) {
            const file = event.target.files[0];
            if (!file) return;

            // Reset progress
            this.importProgress = { show: true, message: 'Preparazione import...', progress: 0 };

            try {
                const fileExtension = file.name.split('.').pop().toLowerCase();
                let contatti = [];

                // Solo supporto CSV
                if (fileExtension === 'csv') {
                    contatti = await this.importCSV(file);
                } else {
                    throw new Error('Formato file non supportato. Usa solo file CSV.');
                }

                // Simula progress per UX
                this.importProgress.message = 'Processamento contatti...';
                this.importProgress.progress = 50;

                // Merge con contatti esistenti (evita duplicati per email)
                let added = 0, skipped = 0;
                
                contatti.forEach(nuovoContatto => {
                    const exists = this.data.contatti.some(existing => 
                        existing.email && nuovoContatto.email && existing.email.toLowerCase() === nuovoContatto.email.toLowerCase()
                    );
                    
                    if (!exists) {
                        this.data.contatti.push({
                            ...nuovoContatto,
                            id: this.generateUniqueId('contatto'),
                            isFavorite: false, // ✨ AGGIUNTO: i contatti importati non sono preferiti di default
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });
                        added++;
                    } else {
                        skipped++;
                    }
                });

                this.importProgress.message = 'Completamento...';
                this.importProgress.progress = 100;

                setTimeout(() => {
                    this.importProgress.show = false;
                    this.showNotification('Import completato: ' + added + ' contatti aggiunti, ' + skipped + ' duplicati ignorati.');
                    this.backToAnagraficaList();
                    this.refreshIcons();
                }, 1000);

            } catch (error) {
                console.error('Errore durante import:', error);
                this.importProgress.show = false;
                this.showNotification('Errore durante importazione: ' + error.message);
            }

            // Reset input file
            event.target.value = '';
        },

        async importCSV(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        // Usa Papa Parse se disponibile, altrimenti parsing manuale
                        if (typeof Papa !== 'undefined') {
                            const results = Papa.parse(e.target.result, {
                                header: true,
                                skipEmptyLines: true,
                                transformHeader: (header) => header.trim()
                            });
                            
                            const contatti = results.data.map(row => this.mapCSVRowToContatto(row));
                            resolve(contatti.filter(c => c !== null));
                        } else {
                            // Fallback parsing CSV manuale
                            const lines = e.target.result.split('\n');
                            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                            const contatti = [];

                            for (let i = 1; i < lines.length; i++) {
                                if (lines[i].trim()) {
                                    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                                    const row = {};
                                    headers.forEach((header, index) => {
                                        row[header] = values[index] || '';
                                    });
                                    const contatto = this.mapCSVRowToContatto(row);
                                    if (contatto) contatti.push(contatto);
                                }
                            }
                            resolve(contatti);
                        }
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = () => reject(new Error('Errore lettura file CSV'));
                reader.readAsText(file, 'UTF-8');
            });
        },

        mapCSVRowToContatto(row) {
            // Mappa le colonne CSV ai campi contatto
            const getNormalizedValue = (row, possibleKeys) => {
                for (let key of possibleKeys) {
                    if (row[key] && String(row[key]).trim()) {
                        return String(row[key]).trim();
                    }
                }
                return '';
            };

            const nome = getNormalizedValue(row, ['First Name', 'Nome', 'nome']);
            const cognome = getNormalizedValue(row, ['Last Name', 'Cognome', 'cognome']);
            const azienda = getNormalizedValue(row, ['Organization Name', 'Azienda', 'azienda', 'Company']);
            const telefono1 = getNormalizedValue(row, ['Phone 1 - Value', 'Telefono', 'telefono', 'Phone', 'Cellulare']);
            const email = getNormalizedValue(row, ['E-mail 1 - Value', 'Email', 'email', 'E-mail']);
            const note = getNormalizedValue(row, ['Notes', 'Note', 'note']);

            // Valida che ci sia almeno nome o cognome
            if (!nome && !cognome) {
                return null;
            }

            return {
                nome,
                cognome,
                azienda,
                telefono1,
                telefono2: '', // Non presente nei dati CSV forniti
                email,
                note
                // isFavorite viene aggiunto durante l'import
            };
        },

        exportContatti() {
            if (!Array.isArray(this.data.contatti) || this.data.contatti.length === 0) {
                this.showNotification('Nessun contatto da esportare');
                return;
            }

            // Crea CSV - ✨ AGGIUNTO: colonna Preferito
            const headers = ['Nome', 'Cognome', 'Azienda', 'Telefono1', 'Telefono2', 'Email', 'Note', 'Preferito'];
            const csvContent = [
                headers.join(','),
                ...this.data.contatti.map(c => [
                    this.escapeCsvValue(c.nome || ''),
                    this.escapeCsvValue(c.cognome || ''),
                    this.escapeCsvValue(c.azienda || ''),
                    this.escapeCsvValue(c.telefono1 || ''),
                    this.escapeCsvValue(c.telefono2 || ''),
                    this.escapeCsvValue(c.email || ''),
                    this.escapeCsvValue(c.note || ''),
                    c.isFavorite ? 'Sì' : 'No' // ✨ AGGIUNTO: export campo preferito
                ].join(','))
            ].join('\n');

            // Download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mystation_contatti_' + this.formatDateForFilename() + '.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Contatti esportati con successo');
        },

        escapeCsvValue(value) {
            if (typeof value !== 'string') return '';
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                return '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
        },

        // === ✨ TEMPLATE HTML CON PREFERITI ===
        anagraficaTemplate: `
            <div class="max-w-7xl mx-auto space-y-6">
                
                <!-- VISTA LISTA CONTATTI -->
                <div x-show="anagraficaViewMode === 'list'" class="view-transition">
                    
                    <!-- Statistiche Semplificate con Preferiti -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 no-print">
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Totale Contatti</p>
                                    <p x-text="data.contatti.length" class="text-4xl font-bold text-blue-600 dark:text-blue-400">0</p>
                                </div>
                                <div class="bg-blue-100 dark:bg-blue-900 p-3 rounded-full ml-6">
                                    <i data-lucide="users" class="w-8 h-8 text-blue-600 dark:text-blue-300"></i>
                                </div>
                            </div>
                        </div>
                        
                        <!-- ✨ NUOVO: Card Preferiti -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Preferiti</p>
                                    <p x-text="getFavoritesCount()" class="text-4xl font-bold text-yellow-600 dark:text-yellow-400">0</p>
                                </div>
                                <div class="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full ml-6">
                                    <i data-lucide="star" class="w-8 h-8 text-yellow-600 dark:text-yellow-300"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Con Email</p>
                                    <p x-text="data.contatti.filter(c => c.email && c.email.trim()).length" class="text-4xl font-bold text-green-600 dark:text-green-400">0</p>
                                </div>
                                <div class="bg-green-100 dark:bg-green-900 p-3 rounded-full ml-6">
                                    <i data-lucide="mail" class="w-8 h-8 text-green-600 dark:text-green-300"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Con Telefono</p>
                                    <p x-text="data.contatti.filter(c => c.telefono1 && c.telefono1.trim()).length" class="text-4xl font-bold text-purple-600 dark:text-purple-400">0</p>
                                </div>
                                <div class="bg-purple-100 dark:bg-purple-900 p-3 rounded-full ml-6">
                                    <i data-lucide="phone" class="w-8 h-8 text-purple-600 dark:text-purple-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Filtri e Ricerca con Preferiti -->
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 no-print">
                        <div class="flex flex-wrap items-end gap-4">
                            <!-- Campo Ricerca -->
                            <div class="flex-1 min-w-64 max-w-sm">
                                <label for="contatto-search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cerca Contatto</label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <i data-lucide="search" class="w-4 h-4 text-gray-400"></i>
                                    </div>
                                    <input type="search" id="contatto-search" x-model="anagraficaFilters.search" placeholder="Cerca per nome, cognome, azienda o email..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500">
                                </div>
                            </div>
                            
                            <!-- ✨ NUOVO: Filtro Preferiti -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mostra</label>
                                <select x-model="anagraficaFilters.favorites" class="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option value="all">Tutti i contatti</option>
                                    <option value="favorites">Solo preferiti</option>
                                </select>
                            </div>
                            
                            <!-- Pulsanti Azione -->
                            <button @click="showCreateContatto()" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center">
                                <i data-lucide="plus-circle" class="w-5 h-5 mr-2"></i>Nuovo Contatto
                            </button>
                            
                            <!-- Dropdown Azioni -->
                            <button id="dropdownAzioniButton" data-dropdown-toggle="dropdownAzioni" class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" type="button">
                                <i data-lucide="settings" class="w-5 h-5 mr-2"></i>Azioni
                                <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                                </svg>
                            </button>
                            <div id="dropdownAzioni" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                                <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
                                    <li><a href="#" @click.prevent="showImportFile()" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"><i data-lucide="upload" class="w-4 h-4 inline mr-2"></i>Importa CSV</a></li>
                                    <li><a href="#" @click.prevent="exportContatti()" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"><i data-lucide="download" class="w-4 h-4 inline mr-2"></i>Esporta CSV</a></li>
                                </ul>
                                <div class="py-2">
                                    <a href="#" @click.prevent="deleteAllContatti()" class="block px-4 py-2 text-red-700 hover:bg-red-100 dark:hover:bg-red-600 dark:text-red-200 dark:hover:text-white"><i data-lucide="trash-2" class="w-4 h-4 inline mr-2"></i>Elimina Rubrica</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Barra Selezione Multipla -->
                    <div x-show="selectedContatti.length > 0" x-transition class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 no-print">
                        <div class="flex flex-wrap items-center gap-4">
                            <div class="flex items-center">
                                <span class="text-sm text-red-700 dark:text-red-300 mr-4">
                                    <span x-text="selectedContatti.length"></span> contatti selezionati
                                </span>
                            </div>
                            
                            <button @click="deleteBulkContatti()" class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2">
                                <i data-lucide="trash-2" class="w-4 h-4 inline mr-1"></i>
                                Elimina Selezionati
                            </button>
                            <button @click="selectedContatti = []; selectAll = false" class="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                                Deseleziona
                            </button>
                        </div>
                    </div>

                    <!-- Tabella Contatti con Stelle Preferiti -->
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden no-print">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Elenco Contatti</h2>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <!-- Checkbox Seleziona Tutto -->
                                        <th scope="col" class="p-4">
                                            <div class="flex items-center">
                                                <input id="checkbox-all" type="checkbox" x-model="selectAll" @change="toggleSelectAll()" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                                                <label for="checkbox-all" class="sr-only">checkbox</label>
                                            </div>
                                        </th>
                                        <!-- ✨ NUOVO: Colonna Stella -->
                                        <th scope="col" class="px-2 py-3">
                                            <i data-lucide="star" class="w-4 h-4 text-yellow-500"></i>
                                        </th>
                                        <th scope="col" class="px-6 py-3">
                                            <button @click="sortAnagrafica('cognome')" class="flex items-center">
                                                Cognome <i data-lucide="arrow-up-down" class="w-3 h-3 ml-1.5"></i>
                                            </button>
                                        </th>
                                        <th scope="col" class="px-6 py-3">
                                            <button @click="sortAnagrafica('nome')" class="flex items-center">
                                                Nome <i data-lucide="arrow-up-down" class="w-3 h-3 ml-1.5"></i>
                                            </button>
                                        </th>
                                        <th scope="col" class="px-6 py-3">
                                            <button @click="sortAnagrafica('azienda')" class="flex items-center">
                                                Azienda <i data-lucide="arrow-up-down" class="w-3 h-3 ml-1.5"></i>
                                            </button>
                                        </th>
                                        <th scope="col" class="px-6 py-3">Contatti</th>
                                        <th scope="col" class="px-6 py-3 text-right">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template x-for="contatto in sortedContatti()" :key="contatto.id">
                                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" :class="selectedContatti.includes(contatto.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''">
                                            <!-- Checkbox Selezione -->
                                            <td class="w-4 p-4">
                                                <div class="flex items-center">
                                                    <input :id="'checkbox-' + contatto.id" type="checkbox" :value="contatto.id" @change="toggleSelectContatto(contatto.id)" :checked="selectedContatti.includes(contatto.id)" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                                                    <label :for="'checkbox-' + contatto.id" class="sr-only">checkbox</label>
                                                </div>
                                            </td>
                                            <!-- ✨ NUOVO: Pulsante Stella Preferiti -->
                                            <td class="px-2 py-4">
                                                <button @click="toggleFavorite(contatto.id)" 
                                                        :class="contatto.isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-yellow-500'" 
                                                        class="transition-colors duration-200 p-1"
                                                        :title="contatto.isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'">
                                                    <i data-lucide="star" class="w-4 h-4" :class="contatto.isFavorite ? 'fill-current' : ''"></i>
                                                </button>
                                            </td>
                                            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white" x-text="contatto.cognome || '-'"></td>
                                            <td class="px-6 py-4 text-gray-900 dark:text-white" x-text="contatto.nome || '-'"></td>
                                            <td class="px-6 py-4 text-gray-900 dark:text-white" x-text="contatto.azienda || '-'"></td>
                                            <td class="px-6 py-4">
                                                <div class="text-xs space-y-1">
                                                    <div x-show="contatto.telefono1" class="flex items-center">
                                                        <i data-lucide="phone" class="w-3 h-3 mr-1"></i>
                                                        <span x-text="contatto.telefono1"></span>
                                                    </div>
                                                    <div x-show="contatto.email" class="flex items-center">
                                                        <i data-lucide="mail" class="w-3 h-3 mr-1"></i>
                                                        <span x-text="contatto.email"></span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 text-right">
                                                <div class="flex items-center justify-end space-x-2">
                                                    <button @click="showEditContatto(contatto)" class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 p-1" title="Modifica contatto">
                                                        <i data-lucide="edit" class="w-4 h-4"></i>
                                                    </button>
                                                    <button @click="deleteContatto(contatto.id)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1" title="Elimina contatto">
                                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </template>
                                    <tr x-show="sortedContatti().length === 0">
                                        <td colspan="7" class="text-center py-12">
                                            <div class="text-gray-500 dark:text-gray-400">
                                                <i data-lucide="users" class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"></i>
                                                <p class="text-lg">Nessun contatto trovato</p>
                                                <p class="text-sm">Aggiungi un nuovo contatto o modifica i filtri di ricerca.</p>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- VISTA CREAZIONE/MODIFICA CONTATTO -->
                <div x-show="anagraficaViewMode === 'create-contatto' || anagraficaViewMode === 'edit-contatto'" class="view-transition">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white" 
                                x-text="anagraficaViewMode === 'edit-contatto' ? 'Modifica Contatto' : 'Nuovo Contatto'"></h2>
                            <button @click="backToAnagraficaList()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <i data-lucide="x" class="w-6 h-6"></i>
                            </button>
                        </div>
                        <div class="p-6">
                            <div class="space-y-6">
                                <!-- Riga 1: Nome, Cognome, Azienda -->
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label for="contatto-nome" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome</label>
                                        <input type="text" x-model="contattoForm.nome" id="contatto-nome" 
                                               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                               required>
                                    </div>
                                    <div>
                                        <label for="contatto-cognome" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cognome</label>
                                        <input type="text" x-model="contattoForm.cognome" id="contatto-cognome" 
                                               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                               required>
                                    </div>
                                    <div>
                                        <label for="contatto-azienda" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Azienda</label>
                                        <input type="text" x-model="contattoForm.azienda" id="contatto-azienda" 
                                               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    </div>
                                </div>

                                <!-- Riga 2: Telefono, Telefono, Email -->
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label for="contatto-telefono1" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Telefono 1</label>
                                        <input type="tel" x-model="contattoForm.telefono1" id="contatto-telefono1" 
                                               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    </div>
                                    <div>
                                        <label for="contatto-telefono2" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Telefono 2</label>
                                        <input type="tel" x-model="contattoForm.telefono2" id="contatto-telefono2" 
                                               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    </div>
                                    <div>
                                        <label for="contatto-email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                                        <input type="email" x-model="contattoForm.email" id="contatto-email" 
                                               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    </div>
                                </div>

                                <!-- Riga 3: Note e Preferito -->
                                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div class="md:col-span-3">
                                        <label for="contatto-note" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Note</label>
                                        <textarea x-model="contattoForm.note" id="contatto-note" rows="3" 
                                                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                                                  placeholder="Note aggiuntive sul contatto..."></textarea>
                                    </div>
                                    <!-- ✨ NUOVO: Checkbox Preferito -->
                                    <div class="flex flex-col justify-center">
                                        <div class="flex items-center">
                                            <input id="contatto-favorite" type="checkbox" x-model="contattoForm.isFavorite" 
                                                   class="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                                            <label for="contatto-favorite" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300 flex items-center">
                                                <i data-lucide="star" class="w-4 h-4 text-yellow-500 mr-1"></i>
                                                Preferito
                                            </label>
                                        </div>
                                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">I contatti preferiti appaiono in cima all'elenco</p>
                                    </div>
                                </div>

                                <!-- Pulsanti Azione -->
                                <div class="flex items-center justify-start space-x-3">
                                    <button @click="saveContatto()" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">
                                        Salva Contatto
                                    </button>
                                    <button @click="backToAnagraficaList()" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
                                        Annulla
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- VISTA IMPORT FILE - SOLO CSV -->
                <div x-show="anagraficaViewMode === 'import-file'" class="view-transition">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Importa Contatti da File CSV</h2>
                            <button @click="backToAnagraficaList()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <i data-lucide="x" class="w-6 h-6"></i>
                            </button>
                        </div>
                        <div class="p-6">
                            <div class="space-y-6">
                                <!-- Area Upload File -->
                                <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                                    <i data-lucide="file-text" class="w-12 h-12 mx-auto mb-4 text-gray-400"></i>
                                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Carica File CSV</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Formato supportato: .csv</p>
                                    
                                    <input type="file" x-ref="importFileInput" @change="handleFileImport($event)" 
                                           accept=".csv" class="hidden">
                                    <button @click="$refs.importFileInput.click()" 
                                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center mx-auto">
                                        <i data-lucide="upload" class="w-4 h-4 mr-2"></i>
                                        Scegli File CSV
                                    </button>
                                </div>

                                <!-- Progress Bar Import -->
                                <div x-show="importProgress.show" class="space-y-2">
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-700 dark:text-gray-300" x-text="importProgress.message">Importazione in corso...</span>
                                        <span class="text-gray-700 dark:text-gray-300" x-text="importProgress.progress + '%'">0%</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                        <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                             :style="'width: ' + importProgress.progress + '%'"></div>
                                    </div>
                                </div>

                                <!-- Istruzioni - Solo CSV -->
                                <div class="bg-blue-50 dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <div class="flex items-start">
                                        <i data-lucide="info" class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0"></i>
                                        <div class="text-sm text-blue-700 dark:text-blue-300">
                                            <p class="font-medium mb-1">Formato File CSV:</p>
                                            <p class="mb-2">Il file deve contenere le seguenti colonne (ordine non importante):</p>
                                            <ul class="list-disc list-inside space-y-1 text-xs">
                                                <li><strong>First Name</strong> o <strong>Nome</strong> - Nome del contatto</li>
                                                <li><strong>Last Name</strong> o <strong>Cognome</strong> - Cognome del contatto</li>
                                                <li><strong>Organization Name</strong> o <strong>Azienda</strong> - Nome azienda</li>
                                                <li><strong>Phone 1 - Value</strong> o <strong>Telefono</strong> - Numero di telefono</li>
                                                <li><strong>E-mail 1 - Value</strong> o <strong>Email</strong> - Indirizzo email</li>
                                                <li><strong>Notes</strong> o <strong>Note</strong> - Note aggiuntive</li>
                                            </ul>
                                            <p class="mt-2 text-xs text-blue-600 dark:text-blue-400"><strong>Nota:</strong> I contatti importati non saranno automaticamente preferiti.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        `
    };
}
// =============================================
// FILE: app.js
// DESCRIZIONE: Core dell'applicazione MyStation.
// Contiene il modulo comune e inizializza 
// l'applicazione Alpine.js assemblando tutti i moduli.
// =============================================

// ===== MODULO COMUNE =====
function comuneModule() {
    return {
        isDarkMode: Alpine.$persist(false), 
        currentSection: Alpine.$persist('home'), 
        mobileMenuOpen: false,
        data: Alpine.$persist({ 
            clients: [], 
            registryEntries: [], 
            priceHistory: [], 
            competitorPrices: [], 
            turni: [],
            previousYearStock: { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 }
        }),
        notification: { show: false, message: '' },
        confirm: { show: false, message: '', onConfirm: () => {} },
        
        printTemplates: `
            <div id="print-content" class="hidden print-only">
                <style>
                    /* Stili per la stampa dell'estratto conto */
                    @media print {
                        body * { visibility: hidden; }
                        #print-content, #print-content * { visibility: visible; }
                        #print-content { position: absolute; left: 0; top: 0; width: 100%; }
                        .print-header { text-align: center; margin-bottom: 20px; }
                        .print-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10pt; }
                        .print-table th, .print-table td { border: 1px solid #ddd; padding: 6px; text-align: left; }
                        .print-table th { background-color: #f2f2f2; }
                        .print-balance { font-weight: bold; font-size: 1.2em; }
                    }
                </style>
                <div class="print-header">
                    <h1 class="text-2xl font-bold" x-text="'Estratto Conto - ' + currentClient.name"></h1>
                    <p>Periodo dal: <span x-text="formatDate(currentClientTransactions().slice(-1)[0]?.date)"></span> al: <span x-text="formatDate(currentClientTransactions()[0]?.date)"></span></p>
                </div>
                <table class="print-table">
                    <thead>
                        <tr><th>Data</th><th>Descrizione</th><th>Importo</th></tr>
                    </thead>
                    <tbody>
                        <template x-for="tx in currentClientTransactions()">
                            <tr>
                                <td x-text="formatDate(tx.date)"></td>
                                <td x-text="tx.description"></td>
                                <td x-text="formatTransactionAmount(tx.amount)" :class="tx.amount > 0 ? 'text-green-600' : 'text-red-600'"></td>
                            </tr>
                        </template>
                    </tbody>
                </table>
                <div class="mt-4 text-right">
                    <p class="print-balance">Saldo Finale: <span x-text="formatCurrency(currentClient.balance)"></span></p>
                </div>
            </div>

            <div id="print-clients-content" class="hidden print-only">
                 <style>
                    /* Stili per la stampa dell'elenco clienti */
                    @media print {
                        body * { visibility: hidden; }
                        #print-clients-content, #print-clients-content * { visibility: visible; }
                        #print-clients-content { position: absolute; left: 0; top: 0; width: 100%; }
                    }
                </style>
                <div class="print-header">
                    <h1 class="text-2xl font-bold">Elenco Clienti</h1>
                    <p>Dati aggiornati al: <span x-text="formatDate(new Date().toISOString())"></span></p>
                </div>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Saldo</th>
                            <th>Cliente</th>
                            <th>Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template x-for="pair in getPairedSortedClients()" :key="pair.client1.id">
                            <tr>
                                <td x-text="pair.client1.name"></td>
                                <td x-text="formatCurrency(pair.client1.balance)" :class="getBalanceClass(pair.client1.balance)"></td>
                                
                                <td>
                                    <template x-if="pair.client2">
                                        <span x-text="pair.client2.name"></span>
                                    </template>
                                </td>
                                <td>
                                    <template x-if="pair.client2">
                                        <span x-text="formatCurrency(pair.client2.balance)" :class="getBalanceClass(pair.client2.balance)"></span>
                                    </template>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        `,
        
        initComune() {
            if (typeof this.data.previousYearStock === 'undefined') {
                this.data.previousYearStock = { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 };
            }
            this.updateTheme(); 
            this.$watch('currentSection', (section) => { 
                this.mobileMenuOpen = false; 
                this.$nextTick(() => { 
                    this.refreshIcons();
                }); 
                this.onSectionChange(section); 
            }); 
            this.$watch('isDarkMode', () => this.updateTheme()); 
            this.$watch('virtualFilters.mode', () => { 
                if (this.currentSection === 'virtual' && this.virtualFilters.mode !== 'range') {
                    this.safeUpdateCharts();
                }
            });

            // === WATCHER PER REFRESH ICONE SU CAMBI FILTRI ===
            // Questi watcher assicurano che le icone Lucide vengano reinizializzate
            // ogni volta che i filtri cambiano e il DOM viene aggiornato

            // Watcher per filtri del registro di carico
            this.$watch('registryTimeFilter', () => {
                this.$nextTick(() => this.refreshIcons());
            });
            this.$watch('registrySearchQuery', () => {
                this.$nextTick(() => this.refreshIcons());
            });

            // Watcher per filtri dell'amministrazione
            this.$watch('adminFilters.search', () => {
                this.$nextTick(() => this.refreshIcons());
            });
            this.$watch('adminFilters.filter', () => {
                this.$nextTick(() => this.refreshIcons());
            });

            // Watcher per sort di tutti i moduli
            this.$watch('adminSort', () => {
                this.$nextTick(() => this.refreshIcons());
            }, { deep: true });
            this.$watch('registrySort', () => {
                this.$nextTick(() => this.refreshIcons());
            }, { deep: true });
            this.$watch('virtualSort', () => {
                this.$nextTick(() => this.refreshIcons());
            }, { deep: true });
            this.$watch('priceSort', () => {
                this.$nextTick(() => this.refreshIcons());
            }, { deep: true });

            // Watcher per i view mode (quando si cambia vista)
            this.$watch('amministrazioneViewMode', () => {
                this.$nextTick(() => this.refreshIcons());
            });
            this.$watch('registryViewMode', () => {
                this.$nextTick(() => this.refreshIcons());
            });
            this.$watch('virtualViewMode', () => {
                this.$nextTick(() => this.refreshIcons());
            });
            this.$watch('prezziViewMode', () => {
                this.$nextTick(() => this.refreshIcons());
            });
            this.$watch('priceTab', () => {
                this.$nextTick(() => this.refreshIcons());
            });

            this.$nextTick(() => { this.refreshIcons(); }); 
        },
        
        // === FUNZIONE HELPER PER ICONE ===
        refreshIcons() {
            this.$nextTick(() => {
                if (typeof lucide !== 'undefined' && lucide.createIcons) {
                    lucide.createIcons();
                }
                if (typeof initFlowbite === 'function') {
                    initFlowbite();
                }
            });
        },
        
        updateTheme() {
            document.documentElement.classList.toggle('dark', this.isDarkMode);
            if (typeof this.updateChartsTheme === 'function') { this.updateChartsTheme(); }
        },
        
        switchSection(section) { this.currentSection = section; },
        
        onSectionChange(section) { 
            if (section === 'virtual' && typeof this.onVirtualSectionOpen === 'function') { 
                this.onVirtualSectionOpen(); 
            } 
        },
        
        generateUniqueId(prefix) { 
            return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`; 
        },
        
        formatInteger(num) {
            if (num === null || num === undefined) return '0';
            return Math.round(num).toLocaleString('it-IT');
        },
        
        formatCurrency(amount, isPricePerLiter = false) { 
            if (amount === null || amount === undefined) { 
                return isPricePerLiter ? '€ 0,000' : '€ 0,00'; 
            } 
            const options = { 
                style: 'currency', 
                currency: 'EUR', 
                minimumFractionDigits: isPricePerLiter ? 3 : 2, 
                maximumFractionDigits: isPricePerLiter ? 3 : 2 
            }; 
            return new Intl.NumberFormat('it-IT', options).format(amount); 
        },
        
        formatDate(dateString) { 
            if (!dateString) return '-'; 
            return this.formatToItalianDate(new Date(dateString));
        },
        
        formatDateForFilename(date = new Date()) { 
            const day = String(date.getDate()).padStart(2, '0'); 
            const month = String(date.getMonth() + 1).padStart(2, '0'); 
            const year = date.getFullYear(); 
            return `${day}.${month}.${year}`; 
        },
        
        parseItalianDate(dateStr) { 
            if (!dateStr) return null; 
            const parts = dateStr.split('.'); 
            if (parts.length !== 3) return null; 
            const day = parseInt(parts[0], 10); 
            const month = parseInt(parts[1], 10); 
            const year = parseInt(parts[2], 10); 
            if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || day > 31 || month < 1 || month > 12) return null; 
            const fullYear = year < 100 ? (year < 30 ? 2000 + year : 1900 + year) : year; 
            return new Date(fullYear, month - 1, day, 12); 
        },
        
        formatToItalianDate(isoDate) { 
            if (!isoDate) return ''; 
            const date = new Date(isoDate); 
            const day = String(date.getDate()).padStart(2, '0'); 
            const month = String(date.getMonth() + 1).padStart(2, '0'); 
            const year = date.getFullYear(); 
            return `${day}.${month}.${year}`; 
        },
        
        getTodayFormatted() { 
            return this.formatToItalianDate(new Date().toISOString()); 
        },
        
        validateItalianDate(dateStr) { 
            return this.parseItalianDate(dateStr) !== null; 
        },
        
        showNotification(message) { 
            this.notification.message = message; 
            this.notification.show = true; 
            setTimeout(() => this.notification.show = false, 3000); 
        },
        
        showConfirm(message, onConfirm) { 
            this.confirm.message = message; 
            this.confirm.onConfirm = onConfirm; 
            this.confirm.show = true; 
        },
        
        getBalanceClass(balance) { 
            if (balance > 0) return 'text-green-600 dark:text-green-400'; 
            if (balance < 0) return 'text-red-600 dark:text-red-400'; 
            return 'text-gray-600 dark:text-gray-400'; 
        },
        
        getFilterLabel(filter) { 
            return ({ 
                'all': 'Tutti i clienti', 
                'credit': 'Clienti a credito', 
                'debit': 'Clienti a debito' 
            })[filter] || 'Tutti i clienti'; 
        }
    };
}

// ===== INIZIALIZZAZIONE PRINCIPALE =====
function myStationApp() {
    return {
        // Moduli
        ...comuneModule(), 
        ...homeModule(),
        ...amministrazioneModule(), 
        ...virtualStationModule(), 
        ...registroDiCaricoModule(), 
        ...gestionePrezziModule(), 
        ...impostazioniModule(),
        
        // Funzione di inizializzazione globale
        init() {
            this.initComune(); 
            this.initHome();
            this.initAmministrazione(); 
            this.initVirtualStation(); 
            this.initRegistroDiCarico(); 
            this.initGestionePrezzi(); 
            this.initImpostazioni();
        }
    };
}
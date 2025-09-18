// =============================================
// FILE: app.js
// DESCRIZIONE: File principale dell'applicazione Alpine.js.
// Unisce tutti i moduli e gestisce lo stato globale.
// CORREZIONI: Rimozione datepicker e dropdown Flowbite ovunque
// =============================================

function myStationApp() {
    return {
        // === STATO GLOBALE DELL'APPLICAZIONE ===
        currentSection: Alpine.$persist('home'),
        mobileMenuOpen: false,
        isDarkMode: Alpine.$persist(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches),

        // === GESTIONE NOTIFICHE E CONFERME ===
        notification: { show: false, message: '' },
        confirm: { show: false, message: '', onConfirm: () => {} },

        // === DATABASE PRINCIPALE (PERSISTENTE) ===
        data: Alpine.$persist({
            clients: [],
            registryEntries: [],
            priceHistory: [],
            competitorPrices: [],
            turni: [],
            contatti: [],
            previousYearStock: { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 }
        }).as('myStationData'),

        // =================================================================
        // ✨ TEMPLATE PER LA STAMPA
        printTemplates: `
            <div id="print-content" class="hidden print-only">
                <h1 class="text-2xl font-bold mb-2" x-text="'Estratto Conto: ' + (currentClient.name || '')"></h1>
                <p class="mb-4" x-text="'Data: ' + getTodayFormatted()"></p>
                <table class="w-full text-sm border-collapse border border-gray-400">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="border border-gray-300 p-2 text-left">Data</th>
                            <th class="border border-gray-300 p-2 text-left">Descrizione</th>
                            <th class="border border-gray-300 p-2 text-right">Importo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template x-for="tx in currentClientTransactions()" :key="tx.id">
                            <tr>
                                <td class="border border-gray-300 p-2" x-text="formatDate(tx.date)"></td>
                                <td class="border border-gray-300 p-2" x-text="tx.description"></td>
                                <td class="border border-gray-300 p-2 text-right" x-text="formatTransactionAmount(tx.amount)"></td>
                            </tr>
                        </template>
                    </tbody>
                    <tfoot>
                        <tr class="bg-gray-100 font-bold">
                            <td colspan="2" class="border border-gray-300 p-2 text-right">Saldo Finale:</td>
                            <td class="border border-gray-300 p-2 text-right" x-text="formatCurrency(currentClient.balance)"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div id="print-clients-content" class="hidden print-only">
                <h1 class="text-2xl font-bold mb-2">Elenco Clienti</h1>
                <p class="mb-4" x-text="'Data: ' + getTodayFormatted()"></p>
                <table class="w-full text-sm border-collapse border border-gray-400">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="border border-gray-300 p-2 text-left">Cliente</th>
                            <th class="border border-gray-300 p-2 text-right">Saldo</th>
                            <th class="border border-gray-300 p-2 text-center">N. Transazioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template x-for="client in sortedClients()" :key="client.id">
                            <tr>
                                <td class="border border-gray-300 p-2" x-text="client.name"></td>
                                <td class="border border-gray-300 p-2 text-right" x-text="formatCurrency(client.balance)"></td>
                                <td class="border border-gray-300 p-2 text-center" x-text="client.transactions.length"></td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        `,
        // =================================================================

        // === UNIONE DI TUTTI I MODULI ===
        ...homeModule(),
        ...virtualStationModule(),
        ...anagraficaModule(),
        ...amministrazioneModule(),
        ...registroDiCaricoModule(),
        ...gestionePrezziModule(),
        ...impostazioniModule(),

        // === INIZIALIZZAZIONE GLOBALE ===
        init() {
            this.initComune();
            this.initHome();
            this.initVirtualStation();
            this.initAmministrazione();
            this.initRegistroDiCarico();
            this.initGestionePrezzi();
            this.initImpostazioni();
            this.initAnagrafica();
            
            // ✨ FIX: Inizializza solo i componenti Flowbite
            this.$nextTick(() => {
                this.initFlowbiteComponents();
            });
        },

        // === FUNZIONI COMUNI E WATCHER ===
        initComune() {
            this.updateTheme();
            this.$watch('currentSection', (section) => {
                this.mobileMenuOpen = false;
                this.$nextTick(() => {
                    this.refreshIcons();
                    this.initFlowbiteComponents(); // ✨ FIX: Inizializza componenti Flowbite
                });
                this.onSectionChange(section);
            });
            this.$watch('isDarkMode', () => this.updateTheme());
            this.$watch('virtualFilters.mode', () => {
                if (this.currentSection === 'virtual' && this.virtualFilters.mode !== 'range') {
                    this.safeUpdateCharts();
                }
            });

            // Watcher per reinizializzare componenti Flowbite quando cambiano le viste
            const watchProps = [
                'registryTimeFilter', 'registrySearchQuery', 'adminFilters.search', 'adminFilters.filter',
                'anagraficaFilters.search', 'anagraficaFilters.favorites', 'amministrazioneViewMode',
                'registryViewMode', 'virtualViewMode', 'prezziViewMode', 'anagraficaViewMode',
                'priceTab', 'calculatorTab'
            ];
            
            watchProps.forEach(prop => {
                this.$watch(prop, () => {
                    this.$nextTick(() => {
                        this.refreshIcons();
                        this.initFlowbiteComponents(); // ✨ FIX: Reinizializza componenti Flowbite
                    });
                }, { deep: prop.includes('.') });
            });

            // Watcher per ordinamento
            const sortWatchers = ['adminSort', 'registrySort', 'virtualSort', 'priceSort', 'anagraficaSort'];
            sortWatchers.forEach(sortProp => {
                this.$watch(sortProp, () => this.$nextTick(() => this.refreshIcons()), { deep: true });
            });

            this.$nextTick(() => this.refreshIcons());
        },

        // ✨ NUOVO: Inizializzazione componenti Flowbite (dropdown, ecc.)
        initFlowbiteComponents() {
            setTimeout(() => {
                // Inizializza i componenti Flowbite usando la funzione globale se disponibile
                if (typeof initFlowbite === 'function') {
                    initFlowbite();
                } else if (typeof window.initFlowbite === 'function') {
                    window.initFlowbite();
                }
                
                // Inizializzazione manuale dei dropdown se la funzione globale non è disponibile
                const dropdownButtons = document.querySelectorAll('[data-dropdown-toggle]');
                dropdownButtons.forEach(button => {
                    const targetId = button.getAttribute('data-dropdown-toggle');
                    const dropdown = document.getElementById(targetId);
                    
                    if (dropdown && !button.hasAttribute('data-dropdown-initialized')) {
                        button.setAttribute('data-dropdown-initialized', 'true');
                        
                        button.addEventListener('click', (e) => {
                            e.preventDefault();
                            
                            // Chiudi altri dropdown aperti
                            document.querySelectorAll('[data-dropdown-toggle]').forEach(otherButton => {
                                if (otherButton !== button) {
                                    const otherId = otherButton.getAttribute('data-dropdown-toggle');
                                    const otherDropdown = document.getElementById(otherId);
                                    if (otherDropdown) {
                                        otherDropdown.classList.add('hidden');
                                    }
                                }
                            });
                            
                            // Toggle del dropdown corrente
                            dropdown.classList.toggle('hidden');
                        });
                        
                        // Chiudi dropdown quando si clicca fuori
                        document.addEventListener('click', (e) => {
                            if (!button.contains(e.target) && !dropdown.contains(e.target)) {
                                dropdown.classList.add('hidden');
                            }
                        });
                    }
                });
            }, 150);
        },

        onSectionChange(section) {
            switch (section) {
                case 'home': if (typeof this.initHome === 'function') this.initHome(); break;
                case 'virtual': if (typeof this.onVirtualSectionOpen === 'function') this.onVirtualSectionOpen(); break;
            }
        },

        // === FUNZIONI DI UTILITÀ GLOBALI ===
        switchSection(section) { this.currentSection = section; },
        updateTheme() {
            document.documentElement.classList.toggle('dark', this.isDarkMode);
            if (typeof this.updateChartsTheme === 'function') this.updateChartsTheme();
        },
        showNotification(message) {
            this.notification.message = message;
            this.notification.show = true;
            setTimeout(() => { this.notification.show = false; }, 3000);
        },
        showConfirm(message, onConfirm) {
            this.confirm.message = message;
            this.confirm.onConfirm = onConfirm;
            this.confirm.show = true;
        },
        refreshIcons() { if (typeof lucide !== 'undefined') lucide.createIcons(); },
        generateUniqueId(prefix = 'id') { return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; },
        
        // ✨ CORRETTO: Simbolo euro corretto
        formatCurrency(value, full = false) {
            if (typeof value !== 'number') return full ? '€ 0,000' : '€ 0,00';
            const options = { style: 'currency', currency: 'EUR' };
            if (full) {
                options.minimumFractionDigits = 3;
                options.maximumFractionDigits = 3;
            }
            return new Intl.NumberFormat('it-IT', options).format(value);
        },
        
        formatInteger(value) {
            if (typeof value !== 'number') return '0';
            return Math.round(value).toLocaleString('it-IT');
        },
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString));
        },
        getTodayFormatted() {
            const today = new Date();
            return `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
        },
        formatToItalianDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
        },
        parseItalianDate(dateString) {
            if (!dateString || typeof dateString !== 'string') return null;
            const parts = dateString.split(/[.\/-]/);
            if (parts.length !== 3) return null;
            return new Date(parts[2], parts[1] - 1, parts[0]);
        },
        validateItalianDate(dateString) { 
            return /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[012])\.\d{4}$/.test(dateString); 
        },
        formatDateForFilename() { 
            return new Date().toISOString().slice(0, 10).replace(/-/g, ''); 
        },
        getBalanceClass(balance) {
            if (balance > 0) return 'text-green-600 dark:text-green-400';
            if (balance < 0) return 'text-red-600 dark:text-red-400';
            return 'text-gray-500 dark:text-gray-400';
        },
        getFilterLabel(filter) {
            const labels = { 'all': 'Tutti i clienti', 'credit': 'Clienti a credito', 'debit': 'Clienti a debito' };
            return labels[filter] || 'Filtra per';
        },
    };
}
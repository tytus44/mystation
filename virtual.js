// =============================================
// FILE: virtual.js (versione Alpine.js)
// DESCRIZIONE: Modulo per la gestione della
// sezione VirtualStation (turni, statistiche, grafici).
// CORREZIONI: Layout riorganizzato, no datepicker, dropdown Flowbite
// =============================================

function virtualStationModule() {
    let productsChartInstance = null;
    let serviceChartInstance = null;

    return {
        // ✨ MODIFICA: Filtro predefinito impostato su 'year'
        virtualFilters: Alpine.$persist({ mode: 'year', startDate: null, endDate: null }),
        virtualViewMode: Alpine.$persist('list'),
        virtualSort: { column: 'date', direction: 'desc' },
        showDateRangePicker: false,
        editingTurno: null,
        turnoForm: { 
            date: '', 
            turno: 'Mattina', 
            iperself: { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 }, 
            servito: { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0, adblue: 0 } 
        },
        chartsInitialized: false, 
        updatingCharts: false,
        
        initVirtualStation() { 
            this.resetTurnoForm();
            if (!this.virtualFilters.startDate) {
                const today = new Date();
                this.virtualFilters.startDate = this.formatToItalianDate(new Date(today.getFullYear(), 0, 1));
                this.virtualFilters.endDate = this.formatToItalianDate(today);
            }
        },
        
        // === NAVIGATION METHODS ===
        showCreateTurno() { 
            this.virtualViewMode = 'create-turno'; 
            this.editingTurno = null; 
            this.resetTurnoForm(); 
            this.refreshIcons(); 
            // ✨ FIX: Reinizializza dropdown dopo un delay maggiore
            setTimeout(() => {
                this.initFlowbiteComponents();
            }, 200);
        },
        
        showEditTurno(turno) {
            this.virtualViewMode = 'edit-turno';
            this.editingTurno = turno;
            this.turnoForm = { 
                date: this.formatToItalianDate(turno.date), 
                turno: turno.turno || 'Mattina', 
                iperself: { ...turno.iperself }, 
                servito: { ...turno.servito } 
            };
            this.refreshIcons();
            // ✨ FIX: Reinizializza dropdown dopo un delay maggiore
            setTimeout(() => {
                this.initFlowbiteComponents();
            }, 200);
        },
        
        backToTurniList() { 
            this.virtualViewMode = 'list'; 
            this.editingTurno = null; 
        },

        // === FLOWBITE COMPONENTS INITIALIZATION ===
        initFlowbiteComponents() {
            // Inizializza i dropdown Flowbite manualmente
            setTimeout(() => {
                // Inizializza i dropdown usando la funzione globale initFlowbite se disponibile
                if (typeof initFlowbite === 'function') {
                    initFlowbite();
                } else if (typeof window.initFlowbite === 'function') {
                    window.initFlowbite();
                }
                
                // Alternativa: inizializza manualmente i dropdown se la funzione globale non è disponibile
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
            }, 100);
        },

        // === TURNO DROPDOWN METHODS ===
        selectTurno(turno) {
            this.turnoForm.turno = turno;
            // Chiudi il dropdown dopo la selezione
            const dropdown = document.getElementById('turnoDropdown');
            if (dropdown) {
                dropdown.classList.add('hidden');
            }
        },

        // === SORT & FILTER ===
        sortVirtual(column) { 
            if (this.virtualSort.column === column) { 
                this.virtualSort.direction = this.virtualSort.direction === 'asc' ? 'desc' : 'asc'; 
            } else { 
                this.virtualSort.column = column; 
                this.virtualSort.direction = 'asc'; 
            } 
        },
        
        setFilterMode(mode) { 
            this.virtualFilters.mode = mode; 
            this.showDateRangePicker = (mode === 'range'); 
        },
        
        applyDateRangeFilter() { 
            if (this.virtualFilters.startDate && this.virtualFilters.endDate) { 
                this.safeUpdateCharts(); 
            } else { 
                this.showNotification('Seleziona un intervallo di date valido.'); 
            } 
        },

        // === DATA PROCESSING ===
        getFilteredTurniForPeriod() { 
            if (!Array.isArray(this.data.turni)) return []; 
            const today = new Date(); 
            today.setHours(0, 0, 0, 0); 
            
            switch (this.virtualFilters.mode) { 
                case 'today': 
                    return this.data.turni.filter(t => new Date(t.date).setHours(0,0,0,0) === today.getTime()); 
                case 'year': 
                    return this.data.turni.filter(t => new Date(t.date).getFullYear() === today.getFullYear());
                case 'range': 
                    const startDate = this.parseItalianDate(this.virtualFilters.startDate); 
                    const endDate = this.parseItalianDate(this.virtualFilters.endDate); 
                    if (!startDate || !endDate) return []; 
                    startDate.setHours(0, 0, 0, 0); 
                    endDate.setHours(23, 59, 59, 999); 
                    return this.data.turni.filter(t => new Date(t.date) >= startDate && new Date(t.date) <= endDate); 
                default: 
                    return []; 
            } 
        },
        
        onVirtualSectionOpen() { 
            if (!this.chartsInitialized) { 
                setTimeout(() => { 
                    this.initCharts(); 
                }, 100); 
            } else { 
                this.safeUpdateCharts(); 
            } 
        },
        
        sortedTurni() { 
            if (!Array.isArray(this.data.turni)) return []; 
            let turni = [...this.data.turni].map(t => ({...t, total: this.getTurnoTotal(t) })); 
            return turni.sort((a, b) => { 
                const dir = this.virtualSort.direction === 'asc' ? 1 : -1; 
                if (this.virtualSort.column === 'date') return (new Date(a.date) - new Date(b.date)) * dir; 
                return (a.total - b.total) * dir; 
            }); 
        },
        
        getProductValue(turnoData, product) {
            if (!turnoData) return 0;
            if (product === 'dieselPlus') return parseFloat(turnoData.dieselPlus || turnoData.dieselplus || 0);
            return parseFloat(turnoData[product] || 0);
        },

        // === STATS ===
        virtualStats() {
            if (!Array.isArray(this.data.turni)) return { totalLiters: 0, revenue: 0, servitoPercentage: 0 };
            const filteredTurni = this.getFilteredTurniForPeriod();
            if (filteredTurni.length === 0) return { totalLiters: 0, revenue: 0, servitoPercentage: 0 };
            
            let totalIperself = 0, totalServito = 0, revenue = 0;
            const basePrices = this.currentPrices();
            
            filteredTurni.forEach(turno => {
                const products = ['benzina', 'gasolio', 'dieselPlus', 'hvolution', 'adblue'];
                products.forEach(product => {
                    const iperselfLiters = this.getProductValue(turno.iperself, product);
                    const servitoLiters = this.getProductValue(turno.servito, product);
                    
                    if (product !== 'adblue') { totalIperself += iperselfLiters; }
                    totalServito += servitoLiters;
                    
                    const basePrice = basePrices[product] || 0;
                    if (basePrice > 0) {
                        if (product === 'adblue') { 
                            revenue += servitoLiters * basePrice; 
                        } else {
                            const iperselfPrice = basePrice + 0.005;
                            // ✨ MODIFICA: Aggiornata la formula del prezzo Servito
                            const servitoPrice = basePrice + 0.210 + 0.015;
                            revenue += (iperselfLiters * iperselfPrice) + (servitoLiters * servitoPrice);
                        }
                    }
                });
            });
            
            const totalLiters = totalIperself + totalServito;
            const servitoPercentage = totalLiters > 0 ? (totalServito / totalLiters) * 100 : 0;
            return { totalLiters, revenue, servitoPercentage };
        },
        
        currentPrices() { 
            if (!Array.isArray(this.data.priceHistory) || this.data.priceHistory.length === 0) return {};
            return [...this.data.priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date))[0]; 
        },

        // === TURNO OPERATIONS ===
        resetTurnoForm() { 
            this.turnoForm = { 
                date: this.getTodayFormatted(), 
                turno: 'Mattina', 
                iperself: { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0 }, 
                servito: { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0, adblue: 0 } 
            }; 
        },
        
        saveTurno() { 
            if (!this.turnoForm.date || !this.turnoForm.turno) { 
                this.showNotification('Data e tipo turno sono obbligatori'); 
                return; 
            } 
            if (!this.validateItalianDate(this.turnoForm.date)) { 
                this.showNotification('Formato data non valido. Usa gg.mm.aaaa'); 
                return; 
            } 
            
            const parsedDate = this.parseItalianDate(this.turnoForm.date); 
            const turno = { 
                id: this.editingTurno ? this.editingTurno.id : this.generateUniqueId('turno'), 
                date: parsedDate.toISOString(), 
                turno: this.turnoForm.turno, 
                iperself: { 
                    benzina: parseFloat(this.turnoForm.iperself.benzina) || 0, 
                    gasolio: parseFloat(this.turnoForm.iperself.gasolio) || 0, 
                    dieselPlus: parseFloat(this.turnoForm.iperself.dieselPlus) || 0, 
                    hvolution: parseFloat(this.turnoForm.iperself.hvolution) || 0 
                }, 
                servito: { 
                    benzina: parseFloat(this.turnoForm.servito.benzina) || 0, 
                    gasolio: parseFloat(this.turnoForm.servito.gasolio) || 0, 
                    dieselPlus: parseFloat(this.turnoForm.servito.dieselPlus) || 0, 
                    hvolution: parseFloat(this.turnoForm.servito.hvolution) || 0, 
                    adblue: parseFloat(this.turnoForm.servito.adblue) || 0 
                }, 
                createdAt: this.editingTurno ? this.editingTurno.createdAt : new Date().toISOString() 
            }; 
            
            if (this.editingTurno) { 
                const index = this.data.turni.findIndex(t => t.id === this.editingTurno.id); 
                if (index !== -1) this.data.turni[index] = turno; 
            } else { 
                this.data.turni.push(turno); 
            } 
            
            this.safeUpdateCharts(); 
            this.backToTurniList();
            this.refreshIcons();
        },
        
        deleteTurno(turnoId) { 
            const turno = this.data.turni.find(t => t.id === turnoId); 
            if (!turno) return; 
            this.showConfirm(`Sei sicuro di voler eliminare il turno del ${this.formatDate(turno.date)} - ${turno.turno}?`, () => { 
                this.data.turni = this.data.turni.filter(t => t.id !== turnoId); 
                this.safeUpdateCharts(); 
                this.refreshIcons();
            }); 
        },
        
        getTurnoTotal(turno) { 
            const products = ['benzina', 'gasolio', 'dieselPlus', 'hvolution', 'adblue']; 
            return products.reduce((total, product) => total + this.getProductValue(turno.iperself, product) + this.getProductValue(turno.servito, product), 0); 
        },

        // === CHARTS ===
        initCharts() { 
            if (typeof Chart === 'undefined' || this.chartsInitialized) return; 
            try { 
                const isDark = this.isDarkMode;
                const textColor = isDark ? '#f3f4f6' : '#111827';
                const gridColor = isDark ? '#374151' : '#f3f4f6'; 
                
                if (productsChartInstance) productsChartInstance.destroy(); 
                if (serviceChartInstance) serviceChartInstance.destroy(); 
                
                const productsCtx = document.getElementById('productsChart'); 
                if (productsCtx) { 
                    productsChartInstance = new Chart(productsCtx, { 
                        type: 'bar', 
                        data: { 
                            labels: ['Benzina', 'Gasolio', 'Diesel+', 'Hvolution', 'AdBlue'], 
                            datasets: [{ 
                                label: 'Litri Venduti', 
                                data: [], 
                                backgroundColor: ['#22c55e', '#facc15', '#dc2626', '#2563eb', '#06b6d4'], 
                                borderWidth: 0 
                            }] 
                        }, 
                        options: { 
                            responsive: true, 
                            maintainAspectRatio: false, 
                            animation: false, 
                            plugins: { 
                                legend: { display: false } 
                            }, 
                            scales: { 
                                y: { 
                                    beginAtZero: true, 
                                    grid: { color: gridColor }, 
                                    ticks: { color: textColor } 
                                }, 
                                x: { 
                                    grid: { display: false }, 
                                    ticks: { color: textColor } 
                                } 
                            } 
                        } 
                    }); 
                } 
                
                const serviceCtx = document.getElementById('serviceChart'); 
                if (serviceCtx) { 
                    serviceChartInstance = new Chart(serviceCtx, { 
                        type: 'doughnut', 
                        data: { 
                            labels: ['Iperself', 'Servito'], 
                            datasets: [{ 
                                data: [], 
                                backgroundColor: ['#dc2626', '#2563eb'], 
                                borderWidth: 0 
                            }] 
                        }, 
                        options: { 
                            responsive: true, 
                            maintainAspectRatio: false, 
                            animation: false, 
                            plugins: { 
                                legend: { 
                                    position: 'bottom', 
                                    labels: { color: textColor } 
                                } 
                            } 
                        } 
                    }); 
                } 
                
                this.chartsInitialized = true; 
                this.safeUpdateCharts(); 
            } catch (error) { 
                console.error('Errore inizializzazione chart:', error); 
            } 
        },
        
        safeUpdateCharts() { 
            if (!this.chartsInitialized || !productsChartInstance || this.updatingCharts) return; 
            this.updatingCharts = true; 
            
            setTimeout(() => { 
                try { 
                    const filteredTurni = this.getFilteredTurniForPeriod(); 
                    const productsData = { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0, adblue: 0 }; 
                    let totalIperself = 0, totalServito = 0; 
                    
                    filteredTurni.forEach(turno => { 
                        Object.keys(productsData).forEach(product => { 
                            const iperselfAmount = this.getProductValue(turno.iperself, product);
                            const servitoAmount = this.getProductValue(turno.servito, product);
                            productsData[product] += iperselfAmount + servitoAmount; 
                            if (product !== 'adblue') totalIperself += iperselfAmount; 
                            totalServito += servitoAmount; 
                        }); 
                    }); 
                    
                    if(productsChartInstance) { 
                        productsChartInstance.data.datasets[0].data = Object.values(productsData); 
                        productsChartInstance.update('none'); 
                    } 
                    if(serviceChartInstance) { 
                        serviceChartInstance.data.datasets[0].data = [totalIperself, totalServito]; 
                        serviceChartInstance.update('none'); 
                    } 
                } catch (error) { 
                    console.error('Errore aggiornamento chart:', error); 
                } finally { 
                    this.updatingCharts = false; 
                } 
            }, 0); 
        },
        
        updateChartsTheme() { 
            if (typeof Chart === 'undefined' || !this.chartsInitialized || !productsChartInstance) return; 
            const textColor = this.isDarkMode ? '#f3f4f6' : '#111827';
            const gridColor = this.isDarkMode ? '#374151' : '#f3f4f6'; 
            
            if (productsChartInstance) { 
                productsChartInstance.options.scales.y.ticks.color = textColor; 
                productsChartInstance.options.scales.y.grid.color = gridColor; 
                productsChartInstance.options.scales.x.ticks.color = textColor; 
            } 
            if (serviceChartInstance) { 
                serviceChartInstance.options.plugins.legend.labels.color = textColor; 
            } 
            if (productsChartInstance) productsChartInstance.update('none'); 
            if (serviceChartInstance) serviceChartInstance.update('none'); 
        },

        // ✨ Template HTML con layout riorganizzato e senza datepicker
        virtualTemplate: `
            <div class="max-w-7xl mx-auto space-y-6">
                
                <div x-show="virtualViewMode === 'list'" class="view-transition">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 no-print">
                        <div class="flex flex-col lg:flex-row justify-between items-center mb-4">
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 lg:mb-0">Statistiche VirtualStation</h2>
                            <div class="inline-flex rounded-md shadow-sm" role="group">
                                <button @click="setFilterMode('today')" :class="virtualFilters.mode === 'today' ? 'bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'" type="button" class="px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200 rounded-s-lg focus:z-10 focus:ring-2 focus:ring-blue-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500">Oggi</button>
                                <button @click="setFilterMode('range')" :class="virtualFilters.mode === 'range' ? 'bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'" type="button" class="px-4 py-2 text-sm font-medium text-gray-900 border-t border-b border-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500">Periodo</button>
                                <button @click="setFilterMode('year')" :class="virtualFilters.mode === 'year' ? 'bg-blue-700 text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'" type="button" class="px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200 rounded-e-lg focus:z-10 focus:ring-2 focus:ring-blue-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500">Anno</button>
                            </div>
                        </div>
                        <div x-show="showDateRangePicker" x-transition class="mt-4 p-4 border rounded-lg bg-gray-100 dark:bg-gray-900 dark:border-gray-700">
                            <div class="flex flex-col sm:flex-row items-center gap-4">
                                <div class="flex items-center flex-1 gap-4">
                                    <div>
                                        <input type="text" x-model="virtualFilters.startDate" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Data inizio (gg.mm.aaaa)">
                                    </div>
                                    <span class="text-gray-500 dark:text-gray-400">a</span>
                                    <div>
                                        <input type="text" x-model="virtualFilters.endDate" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Data fine (gg.mm.aaaa)">
                                    </div>
                                </div>
                                <button @click="applyDateRangeFilter()" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">Applica</button>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 no-print">
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Litri Totali</p>
                                    <p x-text="formatInteger(virtualStats().totalLiters)" class="text-4xl font-bold text-blue-600 dark:text-blue-400">0</p>
                                </div>
                                <div class="bg-blue-100 dark:bg-blue-900 p-3 rounded-full ml-6"><i data-lucide="droplets" class="w-8 h-8 text-blue-600 dark:text-blue-300"></i></div>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Fatturato</p>
                                    <p x-text="formatCurrency(virtualStats().revenue)" class="text-4xl font-bold text-green-600 dark:text-green-400">€ 0,00</p>
                                </div>
                                <div class="bg-green-100 dark:bg-green-900 p-3 rounded-full ml-6"><i data-lucide="euro" class="w-8 h-8 text-green-600 dark:text-green-300"></i></div>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">% Servito</p>
                                    <p x-text="Math.round(virtualStats().servitoPercentage) + '%'" class="text-4xl font-bold text-purple-600 dark:text-purple-400">0%</p>
                                </div>
                                <div class="bg-purple-100 dark:bg-purple-900 p-3 rounded-full ml-6"><i data-lucide="pie-chart" class="w-8 h-8 text-purple-600 dark:text-purple-300"></i></div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 no-print">
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vendite per Prodotto</h3>
                            <div class="h-64"><canvas id="productsChart"></canvas></div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Iperself vs Servito</h3>
                            <div class="h-64"><canvas id="serviceChart"></canvas></div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden no-print">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Storico Turni</h2>
                            <button @click="showCreateTurno()" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center">
                                <i data-lucide="plus-circle" class="w-5 h-5 mr-2"></i>Nuovo Turno
                            </button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3"><button @click="sortVirtual('date')" class="flex items-center">Data <i data-lucide="arrow-up-down" class="w-3 h-3 ml-1.5"></i></button></th>
                                        <th scope="col" class="px-6 py-3">Turno</th>
                                        <th scope="col" class="px-6 py-3">Benzina</th>
                                        <th scope="col" class="px-6 py-3">Gasolio</th>
                                        <th scope="col" class="px-6 py-3">Diesel+</th>
                                        <th scope="col" class="px-6 py-3">Hvolution</th>
                                        <th scope="col" class="px-6 py-3">AdBlue</th>
                                        <th scope="col" class="px-6 py-3"><button @click="sortVirtual('total')" class="flex items-center">Totale <i data-lucide="arrow-up-down" class="w-3 h-3 ml-1.5"></i></button></th>
                                        <th scope="col" class="px-6 py-3 text-right">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template x-for="turno in sortedTurni()" :key="turno.id">
                                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white" x-text="formatDate(turno.date)"></td>
                                            <td class="px-6 py-4" x-text="turno.turno"></td>
                                            <td class="px-6 py-4"><div class="text-xs"><div>I: <span x-text="formatInteger(getProductValue(turno.iperself, 'benzina'))"></span> L</div><div>S: <span x-text="formatInteger(getProductValue(turno.servito, 'benzina'))"></span> L</div><div class="font-bold">Tot: <span x-text="formatInteger(getProductValue(turno.iperself, 'benzina') + getProductValue(turno.servito, 'benzina'))"></span> L</div></div></td>
                                            <td class="px-6 py-4"><div class="text-xs"><div>I: <span x-text="formatInteger(getProductValue(turno.iperself, 'gasolio'))"></span> L</div><div>S: <span x-text="formatInteger(getProductValue(turno.servito, 'gasolio'))"></span> L</div><div class="font-bold">Tot: <span x-text="formatInteger(getProductValue(turno.iperself, 'gasolio') + getProductValue(turno.servito, 'gasolio'))"></span> L</div></div></td>
                                            <td class="px-6 py-4"><div class="text-xs"><div>I: <span x-text="formatInteger(getProductValue(turno.iperself, 'dieselPlus'))"></span> L</div><div>S: <span x-text="formatInteger(getProductValue(turno.servito, 'dieselPlus'))"></span> L</div><div class="font-bold">Tot: <span x-text="formatInteger(getProductValue(turno.iperself, 'dieselPlus') + getProductValue(turno.servito, 'dieselPlus'))"></span> L</div></div></td>
                                            <td class="px-6 py-4"><div class="text-xs"><div>I: <span x-text="formatInteger(getProductValue(turno.iperself, 'hvolution'))"></span> L</div><div>S: <span x-text="formatInteger(getProductValue(turno.servito, 'hvolution'))"></span> L</div></div></td>
                                            <td class="px-6 py-4"><div class="text-xs"><div>S: <span x-text="formatInteger(getProductValue(turno.servito, 'adblue'))"></span> L</div></div></td>
                                            <td class="px-6 py-4 font-bold" x-text="formatInteger(turno.total) + ' L'"></td>
                                            <td class="px-6 py-4 text-right">
                                                <div class="flex items-center justify-end space-x-2">
                                                    <button @click="showEditTurno(turno)" class="text-yellow-600 hover:text-yellow-900 p-1" title="Modifica turno"><i data-lucide="edit" class="w-4 h-4"></i></button>
                                                    <button @click="deleteTurno(turno.id)" class="text-red-600 hover:text-red-900 p-1" title="Elimina turno"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    </template>
                                    <tr x-show="sortedTurni().length === 0">
                                        <td colspan="9" class="text-center py-12"><div class="text-gray-500 dark:text-gray-400"><i data-lucide="monitor-x" class="w-16 h-16 mx-auto mb-4 text-gray-300"></i><p class="text-lg">Nessun turno trovato</p></div></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- ✨ FORM TURNO CON LAYOUT RIORGANIZZATO E SENZA DATEPICKER -->
                <div x-show="virtualViewMode === 'create-turno' || virtualViewMode === 'edit-turno'" class="view-transition">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white" x-text="virtualViewMode === 'edit-turno' ? 'Modifica Turno' : 'Nuovo Turno'"></h2>
                            <button @click="backToTurniList()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><i data-lucide="x" class="w-6 h-6"></i></button>
                        </div>
                        <div class="p-6">
                            <div class="space-y-6">
                                <!-- Prima riga: Data e Turno -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <!-- ✅ CAMPO DATA SENZA DATEPICKER -->
                                    <div>
                                        <label for="turno-date" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data</label>
                                        <input id="turno-date" 
                                               type="text" 
                                               x-model="turnoForm.date" 
                                               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                               placeholder="gg.mm.aaaa">
                                    </div>
                                    
                                    <!-- ✅ DROPDOWN TURNO FLOWBITE -->
                                    <div>
                                        <label for="turno-select" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Turno</label>
                                        <button id="turnoDropdownButton" 
                                                data-dropdown-toggle="turnoDropdown" 
                                                class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between w-full dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" 
                                                type="button">
                                            <span x-text="turnoForm.turno"></span>
                                            <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                                            </svg>
                                        </button>
                                        <div id="turnoDropdown" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                                            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="turnoDropdownButton">
                                                <li><a href="#" @click.prevent="selectTurno('Notte')" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Notte</a></li>
                                                <li><a href="#" @click.prevent="selectTurno('Mattina')" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Mattina</a></li>
                                                <li><a href="#" @click.prevent="selectTurno('Pranzo')" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Pranzo</a></li>
                                                <li><a href="#" @click.prevent="selectTurno('Pomeriggio')" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Pomeriggio</a></li>
                                                <li><a href="#" @click.prevent="selectTurno('Weekend')" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Weekend</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- ✨ LAYOUT RIORGANIZZATO: Prima riga - Gasolio e Diesel+ -->
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <!-- Gasolio -->
                                    <div class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-4">
                                        <h4 class="font-semibold text-gray-900 dark:text-white flex items-center">
                                            <div class="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                                            Gasolio (Litri)
                                        </h4>
                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <label class="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Iperself</label>
                                                <input type="number" 
                                                       x-model.number="turnoForm.iperself.gasolio" 
                                                       class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                                       placeholder="0">
                                            </div>
                                            <div>
                                                <label class="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Servito</label>
                                                <input type="number" 
                                                       x-model.number="turnoForm.servito.gasolio" 
                                                       class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                                       placeholder="0">
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Diesel+ -->
                                    <div class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-4">
                                        <h4 class="font-semibold text-gray-900 dark:text-white flex items-center">
                                            <div class="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                                            Diesel+ (Litri)
                                        </h4>
                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <label class="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Iperself</label>
                                                <input type="number" 
                                                       x-model.number="turnoForm.iperself.dieselPlus" 
                                                       class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                                       placeholder="0">
                                            </div>
                                            <div>
                                                <label class="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Servito</label>
                                                <input type="number" 
                                                       x-model.number="turnoForm.servito.dieselPlus" 
                                                       class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                                       placeholder="0">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- ✨ LAYOUT RIORGANIZZATO: Seconda riga - AdBlue (solo servito), Benzina e Hvolution -->
                                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <!-- AdBlue (Solo Servito) -->
                                    <div class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-4">
                                        <h4 class="font-semibold text-gray-900 dark:text-white flex items-center">
                                            <div class="w-4 h-4 bg-cyan-500 rounded-full mr-2"></div>
                                            AdBlue (Litri)
                                        </h4>
                                        <div>
                                            <label class="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Solo Servito</label>
                                            <input type="number" 
                                                   x-model.number="turnoForm.servito.adblue" 
                                                   class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                                   placeholder="0">
                                        </div>
                                    </div>
                                    
                                    <!-- Benzina -->
                                    <div class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-4">
                                        <h4 class="font-semibold text-gray-900 dark:text-white flex items-center">
                                            <div class="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                                            Benzina (Litri)
                                        </h4>
                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <label class="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Iperself</label>
                                                <input type="number" 
                                                       x-model.number="turnoForm.iperself.benzina" 
                                                       class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                                       placeholder="0">
                                            </div>
                                            <div>
                                                <label class="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Servito</label>
                                                <input type="number" 
                                                       x-model.number="turnoForm.servito.benzina" 
                                                       class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                                       placeholder="0">
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Hvolution -->
                                    <div class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-4">
                                        <h4 class="font-semibold text-gray-900 dark:text-white flex items-center">
                                            <div class="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                                            Hvolution (Litri)
                                        </h4>
                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <label class="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Iperself</label>
                                                <input type="number" 
                                                       x-model.number="turnoForm.iperself.hvolution" 
                                                       class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                                       placeholder="0">
                                            </div>
                                            <div>
                                                <label class="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Servito</label>
                                                <input type="number" 
                                                       x-model.number="turnoForm.servito.hvolution" 
                                                       class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                                       placeholder="0">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Pulsanti Azione -->
                                <div class="flex items-center justify-start space-x-3">
                                    <button @click="saveTurno()" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                                        Salva Turno
                                    </button>
                                    <button @click="backToTurniList()" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">
                                        Annulla
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    };
}
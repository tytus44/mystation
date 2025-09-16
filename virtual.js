// =============================================
// FILE: virtual.js (versione Alpine.js)
// DESCRIZIONE: Modulo per la gestione della
// sezione VirtualStation (turni, statistiche, grafici).
// =============================================

function virtualStationModule() {
    let productsChartInstance = null;
    let serviceChartInstance = null;

    return {
        virtualViewMode: Alpine.$persist('list'), // 'list' | 'create-turno' | 'edit-turno'
        virtualFilters: Alpine.$persist({ mode: 'today', startDate: null, endDate: null }),
        virtualSort: { column: 'date', direction: 'desc' },
        showDateRangePicker: false,
        editingTurno: null,
        turnoForm: { 
            date: '', 
            turno: 'Mattina', 
            iperself: { benzina: 0, gasolio: 0, dieselplus: 0, hvolution: 0 }, 
            servito: { benzina: 0, gasolio: 0, dieselplus: 0, hvolution: 0, adblue: 0 } 
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
        },
        
        backToTurniList() {
            this.virtualViewMode = 'list';
            this.editingTurno = null;
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
                    return this.data.turni.filter(turno => { 
                        const turnoDate = new Date(turno.date); 
                        turnoDate.setHours(0, 0, 0, 0); 
                        return turnoDate.getTime() === today.getTime(); 
                    }); 
                case 'year': 
                    const yearStart = new Date(today.getFullYear(), 0, 1); 
                    return this.data.turni.filter(turno => new Date(turno.date) >= yearStart); 
                case 'range': 
                    const startDate = this.parseItalianDate(this.virtualFilters.startDate); 
                    const endDate = this.parseItalianDate(this.virtualFilters.endDate); 
                    if (!startDate || !endDate) return []; 
                    startDate.setHours(0, 0, 0, 0); 
                    endDate.setHours(23, 59, 59, 999); 
                    return this.data.turni.filter(turno => { 
                        const turnoDate = new Date(turno.date); 
                        return turnoDate >= startDate && turnoDate <= endDate; 
                    }); 
                default: return []; 
            } 
        },
        
        onVirtualSectionOpen() { 
            if (!this.chartsInitialized) { 
                setTimeout(() => { this.initCharts(); }, 100); 
            } else { 
                this.safeUpdateCharts(); 
            } 
        },
        
        sortedTurni() { 
            if (!Array.isArray(this.data.turni)) return []; 
            let turni = [...this.data.turni].map(t => ({...t, total: this.getTurnoTotal(t) })); 
            return turni.sort((a, b) => { 
                const dir = this.virtualSort.direction === 'asc' ? 1 : -1; 
                if (this.virtualSort.column === 'date') { 
                    return (new Date(a.date) - new Date(b.date)) * dir; 
                } 
                return (a.total - b.total) * dir; 
            }); 
        },

        // === STATS ===
        virtualStats() {
            if (!Array.isArray(this.data.turni)) return { totalLiters: 0, revenue: 0, servitoPercentage: 0 };
            const filteredTurni = this.getFilteredTurniForPeriod();
            if (filteredTurni.length === 0) return { totalLiters: 0, revenue: 0, servitoPercentage: 0 };
            
            let totalIperself = 0; 
            let totalServito = 0; 
            let revenue = 0;
            const basePrices = this.currentPrices();
            
            filteredTurni.forEach(turno => {
                const products = ['benzina', 'gasolio', 'dieselPlus', 'hvolution', 'adblue'];
                products.forEach(product => {
                    const iperselfLiters = parseFloat(turno.iperself?.[product]) || 0;
                    const servitoLiters = parseFloat(turno.servito?.[product]) || 0;
                    
                    if (product !== 'adblue') { totalIperself += iperselfLiters; }
                    totalServito += servitoLiters;
                    
                    const basePrice = basePrices[product] || 0;
                    if (basePrice > 0) {
                        if (product === 'adblue') { 
                            revenue += servitoLiters * basePrice; 
                        } else {
                            const iperselfPrice = basePrice + 0.005;
                            const servitoPrice = basePrice + 0.015;
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
            if (!Array.isArray(this.data.priceHistory) || this.data.priceHistory.length === 0) { 
                return { benzina: 0, gasolio: 0, dieselPlus: 0, hvolution: 0, adblue: 0 }; 
            } 
            return [...this.data.priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date))[0]; 
        },

        // === TURNO OPERATIONS ===
        resetTurnoForm() { 
            this.turnoForm = { 
                date: this.getTodayFormatted(), 
                turno: 'Mattina', 
                iperself: { benzina: 0, gasolio: 0, dieselplus: 0, hvolution: 0 }, 
                servito: { benzina: 0, gasolio: 0, dieselplus: 0, hvolution: 0, adblue: 0 } 
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
                    dieselplus: parseFloat(this.turnoForm.iperself.dieselplus) || 0, 
                    hvolution: parseFloat(this.turnoForm.iperself.hvolution) || 0 
                }, 
                servito: { 
                    benzina: parseFloat(this.turnoForm.servito.benzina) || 0, 
                    gasolio: parseFloat(this.turnoForm.servito.gasolio) || 0, 
                    dieselplus: parseFloat(this.turnoForm.servito.dieselplus) || 0, 
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
            // AGGIUNTA: Reinizializza le icone
            this.refreshIcons();
        },
        
        deleteTurno(turnoId) { 
            const turno = this.data.turni.find(t => t.id === turnoId); 
            if (!turno) return; 
            this.showConfirm(`Sei sicuro di voler eliminare il turno del ${this.formatDate(turno.date)} - ${turno.turno}?`, () => { 
                this.data.turni = this.data.turni.filter(t => t.id !== turnoId); 
                this.safeUpdateCharts(); 
                // AGGIUNTA: Reinizializza le icone
                this.refreshIcons();
            }); 
        },
        
        getTurnoTotal(turno) { 
            const products = ['benzina', 'gasolio', 'dieselplus', 'hvolution', 'adblue']; 
            return products.reduce((total, product) => { 
                const iperselfAmount = parseFloat(turno.iperself?.[product]) || 0; 
                const servitoAmount = parseFloat(turno.servito?.[product]) || 0; 
                return total + iperselfAmount + servitoAmount; 
            }, 0); 
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
                            plugins: { legend: { display: false } }, 
                            scales: { 
                                y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } }, 
                                x: { grid: { display: false }, ticks: { color: textColor } } 
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
                            plugins: { legend: { position: 'bottom', labels: { color: textColor } } } 
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
                    const productsData = { benzina: 0, gasolio: 0, dieselplus: 0, hvolution: 0, adblue: 0 }; 
                    let totalIperself = 0; 
                    let totalServito = 0; 
                    
                    filteredTurni.forEach(turno => { 
                        Object.keys(productsData).forEach(product => { 
                            const iperselfAmount = parseFloat(turno.iperself?.[product]) || 0; 
                            const servitoAmount = parseFloat(turno.servito?.[product]) || 0; 
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

        // Template HTML
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
                                <div date-rangepicker class="flex items-center flex-1">
                                    <div class="relative">
                                        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z"/><path d="M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/></svg>
                                        </div>
                                        <input name="start" type="text" x-model="virtualFilters.startDate" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Data inizio">
                                    </div>
                                    <span class="mx-4 text-gray-500 dark:text-gray-400">a</span>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z"/><path d="M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/></svg>
                                        </div>
                                        <input name="end" type="text" x-model="virtualFilters.endDate" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Data fine">
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
                                            <td class="px-6 py-4"><div class="text-xs"><div>I: <span x-text="Math.round(turno.iperself?.benzina || 0)"></span> L</div><div>S: <span x-text="Math.round(turno.servito?.benzina || 0)"></span> L</div><div class="font-bold">Tot: <span x-text="Math.round((turno.iperself?.benzina || 0) + (turno.servito?.benzina || 0))"></span> L</div></div></td>
                                            <td class="px-6 py-4"><div class="text-xs"><div>I: <span x-text="Math.round(turno.iperself?.gasolio || 0)"></span> L</div><div>S: <span x-text="Math.round(turno.servito?.gasolio || 0)"></span> L</div><div class="font-bold">Tot: <span x-text="Math.round((turno.iperself?.gasolio || 0) + (turno.servito?.gasolio || 0))"></span> L</div></div></td>
                                            <td class="px-6 py-4"><div class="text-xs"><div>I: <span x-text="Math.round(turno.iperself?.dieselplus || 0)"></span> L</div><div>S: <span x-text="Math.round(turno.servito?.dieselplus || 0)"></span> L</div><div class="font-bold">Tot: <span x-text="Math.round((turno.iperself?.dieselplus || 0) + (turno.servito?.dieselplus || 0))"></span> L</div></div></td>
                                            <td class="px-6 py-4"><div class="text-xs"><div>I: <span x-text="Math.round(turno.iperself?.hvolution || 0)"></span> L</div><div>S: <span x-text="Math.round(turno.servito?.hvolution || 0)"></span> L</div><div class="font-bold">Tot: <span x-text="Math.round((turno.iperself?.hvolution || 0) + (turno.servito?.hvolution || 0))"></span> L</div></div></td>
                                            <td class="px-6 py-4"><div class="text-xs"><div>S: <span x-text="Math.round(turno.servito?.adblue || 0)"></span> L</div></div></td>
                                            <td class="px-6 py-4 font-bold" x-text="Math.round(turno.total) + ' L'"></td>
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

                <div x-show="virtualViewMode === 'create-turno' || virtualViewMode === 'edit-turno'" class="view-transition">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white" x-text="virtualViewMode === 'edit-turno' ? 'Modifica Turno' : 'Nuovo Turno'"></h2>
                            <button @click="backToTurniList()" class="text-gray-500 hover:text-gray-700"><i data-lucide="x" class="w-6 h-6"></i></button>
                        </div>
                        <div class="p-6"><div class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="relative">
                                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data</label>
                                    <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none top-6">
                                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z"/><path d="M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/></svg>
                                    </div>
                                    <input datepicker datepicker-autohide datepicker-format="dd.mm.yyyy" type="text" x-model="turnoForm.date" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="gg.mm.aaaa">
                                </div>
                                <div>
                                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Turno</label>
                                    <select x-model="turnoForm.turno" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600">
                                        <option>Notte</option><option>Mattina</option><option>Pranzo</option><option>Pomeriggio</option><option>Weekend</option>
                                    </select>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-3">
                                    <h4 class="font-semibold text-gray-900 dark:text-white">Iperself (Litri)</h4>
                                    <div class="grid grid-cols-2 gap-3">
                                        <div><label class="block mb-1 text-xs font-medium">Gasolio</label><input type="number" x-model.number="turnoForm.iperself.gasolio" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></div>
                                        <div><label class="block mb-1 text-xs font-medium">Diesel+</label><input type="number" x-model.number="turnoForm.iperself.dieselplus" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></div>
                                        <div><label class="block mb-1 text-xs font-medium">Benzina</label><input type="number" x-model.number="turnoForm.iperself.benzina" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></div>
                                        <div><label class="block mb-1 text-xs font-medium">Hvolution</label><input type="number" x-model.number="turnoForm.iperself.hvolution" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></div>
                                    </div>
                                </div>
                                <div class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-3">
                                    <h4 class="font-semibold text-gray-900 dark:text-white">Servito (Litri)</h4>
                                    <div class="grid grid-cols-2 gap-3">
                                        <div><label class="block mb-1 text-xs font-medium">Gasolio</label><input type="number" x-model.number="turnoForm.servito.gasolio" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></div>
                                        <div><label class="block mb-1 text-xs font-medium">Diesel+</label><input type="number" x-model.number="turnoForm.servito.dieselplus" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></div>
                                        <div><label class="block mb-1 text-xs font-medium">AdBlue</label><input type="number" x-model.number="turnoForm.servito.adblue" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></div>
                                        <div><label class="block mb-1 text-xs font-medium">Benzina</label><input type="number" x-model.number="turnoForm.servito.benzina" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></div>
                                        <div><label class="block mb-1 text-xs font-medium">Hvolution</label><input type="number" x-model.number="turnoForm.servito.hvolution" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center justify-start space-x-3">
                                <button @click="saveTurno()" class="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5">Salva Turno</button>
                                <button @click="backToTurniList()" class="text-gray-500 bg-white hover:bg-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800">Annulla</button>
                            </div>
                        </div></div>
                    </div>
                </div>
            </div>
        `
    };
}
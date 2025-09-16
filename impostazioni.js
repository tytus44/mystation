// =============================================
// FILE: impostazioni.js
// DESCRIZIONE: Modulo per la gestione della 
// sezione Impostazioni (tema, import/export, reset).
// =============================================

function impostazioniModule() {
    return {
        isFullscreen: false,
        
        impostazioniTemplate: `<div class="max-w-4xl mx-auto space-y-6 no-print">
            <div class="bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Impostazioni</h2>
                </div>
                <div class="p-6 space-y-6">
                    <div class="space-y-4">
                        <label class="flex items-center justify-between w-full cursor-pointer">
                            <span class="font-medium text-gray-900 dark:text-gray-300">Tema scuro</span>
                            <label class="inline-flex items-center cursor-pointer">
                                <input type="checkbox" x-model="isDarkMode" class="sr-only peer">
                                <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </label>
                        <label class="flex items-center justify-between w-full cursor-pointer">
                            <span class="font-medium text-gray-900 dark:text-gray-300">Schermo intero</span>
                            <label class="inline-flex items-center cursor-pointer">
                                <input type="checkbox" :checked="isFullscreen" @change="toggleFullscreen()" class="sr-only peer">
                                <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </label>
                    </div>
                    <div class="border-t border-gray-200 dark:border-gray-600 pt-6">
                        <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">Gestione Dati</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="file" x-ref="importFile" @change="importData($event)" accept=".json" class="hidden">
                            <button @click="$refs.importFile.click()" class="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 text-center flex items-center justify-center">
                                <i data-lucide="upload" class="w-5 h-5 mr-2"></i> Importa Dati (JSON)
                            </button>
                            <button @click="exportData()" class="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 text-center flex items-center justify-center">
                                <i data-lucide="download" class="w-5 h-5 mr-2"></i> Esporta Dati (JSON)
                            </button>
                        </div>
                    </div>
                    <div class="border-t border-gray-200 dark:border-gray-600 pt-6">
                        <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">Informazioni Applicazione</h3>
                        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <p><strong>Versione:</strong> 4.0.0 (No-Modal Edition)</p>
                            <p><strong>Framework:</strong> Alpine.js 3.x + Flowbite CSS</p>
                            <p><strong>Storage:</strong> LocalStorage con Alpine Persist</p>
                            <p><strong>Grafici:</strong> Chart.js 3.9.1</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-6 border border-red-300 bg-red-50 dark:bg-gray-800 dark:border-red-600 rounded-lg">
                <h3 class="font-semibold text-red-800 dark:text-red-400">Zona Pericolosa</h3>
                <p class="text-sm text-red-600 dark:text-red-400 mt-1 mb-3">
                    Questa azione eliminerà permanentemente tutti i dati dell'applicazione. Non può essere annullata.
                </p>
                <button @click="confirmReset()" class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
                    <i data-lucide="trash-2" class="w-4 h-4 inline mr-2"></i> Reset Tutti i Dati
                </button>
            </div>
        </div>`,
        
        initImpostazioni() { 
            document.addEventListener('fullscreenchange', () => { 
                this.isFullscreen = !!document.fullscreenElement; 
            }); 
        },
        
        toggleFullscreen() { 
            if (!document.fullscreenElement) { 
                document.documentElement.requestFullscreen().catch(err => { 
                    alert(`Errore nell'attivare la modalità a schermo intero: ${err.message} (${err.name})`); 
                }); 
            } else { 
                if (document.exitFullscreen) { 
                    document.exitFullscreen(); 
                } 
            } 
        },
        
        importData(event) { 
            const file = event.target.files[0]; 
            if (!file) return; 
            const reader = new FileReader(); 
            reader.onload = (e) => { 
                try { 
                    const importedData = JSON.parse(e.target.result); 
                    if (importedData.data) { 
                        Object.assign(this.data, importedData.data); 
                    } else { 
                        this.handleLegacyImport(importedData); 
                    } 
                    this.showNotification('Dati importati con successo'); 
                    event.target.value = ''; 
                } catch (error) { 
                    this.showNotification('Errore durante l\'importazione del file'); 
                    console.error('Import error:', error); 
                } 
            }; 
            reader.readAsText(file); 
        },
        
        handleLegacyImport(importedData) { 
            const merge = confirm('File legacy rilevato. Vuoi unire i dati con quelli esistenti? Annulla per sostituire.'); 
            const importSection = (sectionName, legacyName) => { 
                if (importedData[legacyName] && Array.isArray(importedData[legacyName])) { 
                    this.data[sectionName] = merge ? [...this.data[sectionName], ...importedData[legacyName]] : importedData[legacyName]; 
                } 
            }; 
            importSection('clients', 'clients'); 
            importSection('registryEntries', 'registryEntries'); 
            importSection('priceHistory', 'priceHistory'); 
            importSection('competitorPrices', 'competitorPrices'); 
            importSection('turni', 'turni'); 
        },
        
        exportData() { 
            const exportDate = this.formatDateForFilename(); 
            const dataToExport = { 
                exportDate: new Date().toISOString(), 
                version: '4.0.0', 
                data: this.data 
            }; 
            const dataStr = JSON.stringify(dataToExport, null, 2); 
            const blob = new Blob([dataStr], { type: 'application/json' }); 
            const url = URL.createObjectURL(blob); 
            const a = document.createElement('a'); 
            a.href = url; 
            a.download = `mystation_backup_${exportDate}.json`; 
            document.body.appendChild(a); 
            a.click(); 
            document.body.removeChild(a); 
            URL.revokeObjectURL(url); 
            this.showNotification('Dati esportati con successo'); 
        },
        
        confirmReset() { 
            this.showConfirm('Sei sicuro di voler eliminare TUTTI i dati dell\'applicazione? Questa azione non può essere annullata.', () => this.resetAllData()); 
        },
        
        resetAllData() { 
            Object.keys(this.data).forEach(key => { 
                this.data[key] = []; 
            }); 
            localStorage.clear(); 
            this.showNotification('Tutti i dati sono stati eliminati'); 
            setTimeout(() => window.location.reload(), 1500); 
        }
    };
}
document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // COSTANTI E CONFIGURAZIONE
    // ============================================

    const competitors = [
        { id: 'myoil', name: 'MyOil' },
        { id: 'esso', name: 'Esso' },
        { id: 'q8', name: 'Q8' }
    ];
    const products = ['benzina', 'gasolio'];
    const IPERSELF_EXTRA_MARKUP = 0.005;

    // ============================================
    // RIFERIMENTI AGLI ELEMENTI DEL DOM
    // ============================================
    const competitionBtn = document.getElementById('competition-btn');
    const competitionModal = document.getElementById('competition-modal');
    const closeCompetitionModalBtn = document.getElementById('close-competition-modal-btn');
    const saveCompetitionBtn = document.getElementById('save-competition-btn');
    const competitionGridDisplay = document.getElementById('competition-grid-display');

    // ============================================
    // GESTIONE MODALE
    // ============================================

    // Apre il modale per inserire i prezzi della concorrenza
    const openCompetitionModal = () => {
        const currentPrices = MemoriaStorage.loadCompetitionPrices();
        
        // Carica i prezzi esistenti nei campi del modale
        competitors.forEach(c => {
            products.forEach(p => {
                const input = document.getElementById(`comp-${c.id}-${p}`);
                if (input) {
                    input.value = (currentPrices[c.id] && currentPrices[c.id][p]) ? currentPrices[c.id][p] : '';
                }
            });
        });
        
        competitionModal.style.display = 'flex';
    };

    // Chiude il modale
    const closeCompetitionModal = () => {
        competitionModal.style.display = 'none';
    };

    // Salva i dati della concorrenza
    const saveCompetitionData = () => {
        const pricesToSave = {};
        
        // Raccoglie i prezzi dai campi input
        competitors.forEach(c => {
            pricesToSave[c.id] = {};
            products.forEach(p => {
                const input = document.getElementById(`comp-${c.id}-${p}`);
                if (input && input.value) {
                    pricesToSave[c.id][p] = parseFloat(input.value.replace(',', '.')) || 0;
                }
            });
        });

        // Salva i dati e aggiorna la visualizzazione
        MemoriaStorage.saveCompetitionPrices(pricesToSave);
        renderCompetitionPrices();
        closeCompetitionModal();

        // Mostra messaggio di successo
        if (window.showAlert) {
            window.showAlert('<strong>Successo!</strong> Dati concorrenza salvati.', 'success');
        }
    };

    // ============================================
    // RENDERING PREZZI CONCORRENZA (CORRETTO)
    // ============================================

    // Funzione principale per renderizzare i prezzi della concorrenza
    window.renderCompetitionPrices = () => {
        competitionGridDisplay.innerHTML = '';
        const competitionPrices = MemoriaStorage.loadCompetitionPrices();
        const myPriceHistory = MemoriaStorage.loadPriceHistory();
        const myPrices = myPriceHistory.length > 0 ? myPriceHistory[0] : null;

        if (Object.keys(competitionPrices).length === 0) {
            competitionGridDisplay.innerHTML = '<p class="no-prices-message">Nessun dato sulla concorrenza inserito.</p>';
            return;
        }
        
        // Calcola i prezzi Iperself per le differenze
        const myIperselfPrices = {};
        if (myPrices) {
            products.forEach(p => {
                myIperselfPrices[p] = (myPrices.recommended[p] || 0) + IPERSELF_EXTRA_MARKUP;
            });
        }
        
        // Crea una singola scheda con due griglie separate
        const unifiedCard = document.createElement('div');
        unifiedCard.className = 'price-unified-card';
        
        let cardHTML = '';
        
        // PRIMA GRIGLIA: Prezzi della concorrenza
        cardHTML += '<div class="price-columns-container competition-columns">';
        
        competitors.forEach(c => {
            const competitorData = competitionPrices[c.id] || {};
            cardHTML += `<div class="price-column-unified">
                <h3 class="price-column-title">${c.name}</h3>`;
            
            // Prezzi della concorrenza
            products.forEach(p => {
                const price = competitorData[p] || 0;
                if (price > 0) {
                    cardHTML += `<div class="price-item" data-product="${p}">
                        <span class="price-product-name">${p.charAt(0).toUpperCase() + p.slice(1)}</span>
                        <span class="price-value">€ ${price.toFixed(3)}</span>
                    </div>`;
                } else {
                    cardHTML += `<div class="price-item disabled-price" data-product="${p}">
                        <span class="price-product-name">${p.charAt(0).toUpperCase() + p.slice(1)}</span>
                        <span class="price-value">-</span>
                    </div>`;
                }
            });
            
            cardHTML += '</div>';
        });
        
        cardHTML += '</div>';
        
        // DIVISORE
        cardHTML += '<div class="competition-divider"></div>';
        
        // SECONDA GRIGLIA: Differenze
        cardHTML += '<div class="price-columns-container competition-columns">';
        
        competitors.forEach(c => {
            const competitorData = competitionPrices[c.id] || {};
            cardHTML += `<div class="price-column-unified">`;
            
            // Differenze
            products.forEach(p => {
                const myPrice = myIperselfPrices[p] || 0;
                const theirPrice = competitorData[p] || 0;
                let difference = 0;
                let diffClass = 'neutral';
                let diffSign = '';

                if (myPrice > 0 && theirPrice > 0) {
                    difference = theirPrice - myPrice; // Differenza: loro - nostro
                    if (difference > 0.0005) {
                        diffClass = 'positive'; // Verde se loro sono più alti (buono per noi)
                        diffSign = '+';
                    } else if (difference < -0.0005) {
                        diffClass = 'negative'; // Rosso se loro sono più bassi (cattivo per noi)
                        diffSign = '';
                    }
                }

                cardHTML += `<div class="price-item price-difference" data-product="${p}">
                    <span class="price-product-name">${p.charAt(0).toUpperCase() + p.slice(1)}</span>
                    <span class="price-value diff-${diffClass}">
                        ${(myPrice > 0 && theirPrice > 0) ? diffSign + difference.toFixed(3) : '-.---'}
                    </span>
                </div>`;
            });
            
            cardHTML += '</div>';
        });
        
        cardHTML += '</div>';
        
        unifiedCard.innerHTML = cardHTML;
        competitionGridDisplay.appendChild(unifiedCard);
    };

    // ============================================
    // FUNZIONI DI COMPATIBILITÀ
    // ============================================

    // Funzione mantenuta per compatibilità con gestione-prezzi.js
    window.renderPriceDifferences = () => {
        return; // Non fa nulla, la logica è integrata in renderCompetitionPrices
    };

    // ============================================
    // EVENT LISTENERS
    // ============================================

    // Gestione apertura modale
    if (competitionBtn) {
        competitionBtn.addEventListener('click', openCompetitionModal);
    }
    
    // Gestione chiusura modale
    if (closeCompetitionModalBtn) {
        closeCompetitionModalBtn.addEventListener('click', closeCompetitionModal);
    }
    
    // Gestione salvataggio dati
    if (saveCompetitionBtn) {
        saveCompetitionBtn.addEventListener('click', saveCompetitionData);
    }

    // Chiusura modale cliccando fuori
    if (competitionModal) {
        competitionModal.addEventListener('click', (e) => {
            if (e.target === competitionModal) {
                closeCompetitionModal();
            }
        });
    }

    // ============================================
    // INIZIALIZZAZIONE
    // ============================================

    // Rendering iniziale dei prezzi concorrenza
    renderCompetitionPrices();
});
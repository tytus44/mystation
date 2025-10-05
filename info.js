// =============================================
// FILE: info.js (Vanilla JavaScript Version)
// DESCRIZIONE: Modulo per la gestione della
// sezione Info con link e contatti utili.
// =============================================

// === STATO LOCALE DEL MODULO INFO ===
let infoState = {}; // Stato non necessario per questa sezione statica

// === INIZIALIZZAZIONE MODULO INFO ===
// Inizio funzione initInfo
function initInfo() {
    console.log('ℹ️ Inizializzazione modulo Info...');
    // Nessuna inizializzazione specifica richiesta
    console.log('✅ Modulo Info inizializzato');
}
// Fine funzione initInfo

// === RENDER SEZIONE INFO ===
// Inizio funzione renderInfoSection
function renderInfoSection(container) {
    console.log('🎨 Rendering sezione Info...');
    
    // INIZIO MODIFICA: Colori più vibranti e accesi per le card
    container.innerHTML = `
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-primary">Informazioni Utili</h1>
            <p class="text-secondary">Una raccolta di link e contatti rapidi per le operazioni quotidiane.</p>
        </div>

        <div class="grid grid-cols-3 gap-6">

            <div class="card" style="background-color: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.6);">
                <div class="card-header">
                    <h3 class="card-title">Enilive</h3>
                    <i data-lucide="fuel" style="color: var(--color-success);"></i>
                </div>
                <div class="card-body">
                    <ul class="info-list">
                        <li><a href="https://www.enilive.it/" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="home"></i><span class="link-text">Sito Istituzionale</span><i data-lucide="external-link"></i></a></li>
                        <li><a href="https://myenistation.eni.com/" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="layout-dashboard"></i><span class="link-text">Portale Gestori</span><i data-lucide="external-link"></i></a></li>
                        <li><a href="https://enivirtualstation.4ts.it/auth/login?returnUrl=%2Fhome" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="monitor-dot"></i><span class="link-text">VirtualStation</span><i data-lucide="external-link"></i></a></li>
                        <li><a href="https://myenistation.eni.com/content/myenistation/it/ordini.html" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="truck"></i><span class="link-text">Ordini Carburanti</span><i data-lucide="external-link"></i></a></li>
                        <li><a href="https://myenistation.eni.com/content/myenistation/it/contabilita.html" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="calculator"></i><span class="link-text">Contabilità</span><i data-lucide="external-link"></i></a></li>
                        <li><a href="https://piuservitogestore.private.gestori.eni.com/" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="file-check-2"></i><span class="link-text">Conguagli Mensili</span><i data-lucide="external-link"></i></a></li>
                    </ul>
                </div>
            </div>
            
            <div class="card" style="background-color: rgba(255, 177, 0, 0.15); border-color: rgba(255, 177, 0, 0.6);">
                <div class="card-header">
                    <h3 class="card-title">Multicard</h3>
                    <i data-lucide="credit-card" style="color: var(--color-warning);"></i>
                </div>
                <div class="card-body">
                    <ul class="info-list">
                        <li><a href="https://cartesiodealer.eni.it/sito-esercenti/main.app" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="store"></i><span class="link-text">Portale Esercenti</span><i data-lucide="external-link"></i></a></li>
                        <li><a href="https://www.enilive.it/business/multicard-carta-carburante" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="users"></i><span class="link-text">Portale Clienti</span><i data-lucide="external-link"></i></a></li>
                    </ul>
                </div>
            </div>

            <div class="card" style="background-color: rgba(111, 230, 252, 0.15); border-color: rgba(111, 230, 252, 0.6);">
                <div class="card-header">
                    <h3 class="card-title">Servizi Esterni</h3>
                    <i data-lucide="briefcase" style="color: var(--color-info);"></i>
                </div>
                <div class="card-body">
                     <ul class="info-list">
                        <li><a href="https://assetmanager.4ts.it/" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="shield-check"></i><span class="link-text">Asset Manager</span><i data-lucide="external-link"></i></a></li>
                        <li><a href="https://diviseeni.audes.com/it/customer/account/login" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="shirt"></i><span class="link-text">Audes (Divise)</span><i data-lucide="external-link"></i></a></li>
                        <li><a href="https://cardsmanager.it/Accounting/Login" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="file-text"></i><span class="link-text">Fattura 1click</span><i data-lucide="external-link"></i></a></li>
                        <li><a href="https://fatturazioneelettronica.aruba.it/#login" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="receipt"></i><span class="link-text">Fatturazione (Aruba)</span><i data-lucide="external-link"></i></a></li>
                    </ul>
                </div>
            </div>

            <div class="card" style="background-color: rgba(37, 99, 235, 0.15); border-color: rgba(37, 99, 235, 0.6);">
                <div class="card-header">
                   <h3 class="card-title">Banche</h3>
                    <i data-lucide="landmark" style="color: var(--color-primary);"></i>
                </div>
                <div class="card-body">
                    <ul class="info-list">
                        <li><a href="https://www.unicredit.it/it/privati.html" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="link"></i><span class="link-text">Unicredit</span><i data-lucide="external-link"></i></a></li>
                        <li><a href="https://www.bccroma.it/" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="link"></i><span class="link-text">BCC Roma</span><i data-lucide="external-link"></i></a></li>
                        <li><a href="https://business.nexi.it/" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="link"></i><span class="link-text">Nexi Business</span><i data-lucide="external-link"></i></a></li>
                    </ul>
                </div>
            </div>
            
            <div class="card" style="background-color: rgba(107, 114, 128, 0.15); border-color: rgba(107, 114, 128, 0.6);">
                <div class="card-header">
                    <h3 class="card-title">Enti e Dogane</h3>
                    <i data-lucide="building-2" style="color: var(--text-secondary);"></i>
                </div>
                <div class="card-body">
                    <ul class="info-list">
                        <li><a href="https://iampe.adm.gov.it/sam/UI/Login?realm=/adm&locale=it&goto=https%3A%2F%2Fwww.adm.gov.it%2Fportale%2Fweb%2Fguest%2Flogin%3Fp_p_id%3D58%26p_p_lifecycle%3D0%26_58_redirect%3D%252Fportale%252F-%252Fcorrispettivi-distributori-carburanti" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="file-spreadsheet"></i><span class="link-text">Agenzia Dogane</span><i data-lucide="external-link"></i></a></li>
                        <li><a href="https://servizi2.inps.it/servizi/Esterometro/Informazioni" target="_blank" rel="noopener noreferrer" class="info-link"><i data-lucide="file-check"></i><span class="link-text">INPS Esterometro</span><i data-lucide="external-link"></i></a></li>
                    </ul>
                </div>
            </div>

            <div class="card" style="background-color: rgba(255, 32, 78, 0.15); border-color: rgba(255, 32, 78, 0.6);">
                <div class="card-header">
                    <h3 class="card-title">Numeri Utili</h3>
                    <i data-lucide="phone" style="color: var(--color-danger);"></i>
                </div>
                <div class="card-body">
                    <ul class="info-list">
                        <li><div class="info-item"><i data-lucide="phone-call"></i><span class="item-label">Enilive Verde</span><a href="tel:800797979" class="item-value">800 79 79 79</a></div></li>
                        <li><div class="info-item"><i data-lucide="phone-call"></i><span class="item-label">Portale Gestori</span><a href="tel:800960970" class="item-value">800 960 970</a></div></li>
                        <li><div class="info-item"><i data-lucide="smartphone"></i><span class="item-label">POS Unicredit</span><a href="tel:800900280" class="item-value">800 900 280</a></div></li>
                        <li><div class="info-item"><i data-lucide="smartphone"></i><span class="item-label">POS Enilive</span><a href="tel:800999720" class="item-value">800 999 720</a></div></li>
                    </ul>
                </div>
            </div>

        </div>
    `;
    // FINE MODIFICA

    // Setup event listeners
    setupInfoEventListeners.call(this);

    // Refresh icone
    const app = getApp();
    app.refreshIcons();
}
// Fine funzione renderInfoSection

// === SETUP EVENT LISTENERS ===
// Inizio funzione setupInfoEventListeners
function setupInfoEventListeners() {
    // Nessun event listener specifico necessario per questa sezione
}
// Fine funzione setupInfoEventListeners


// === EXPORT FUNCTIONS FOR GLOBAL ACCESS ===
if (typeof window !== 'undefined') {
    window.initInfo = initInfo;
    window.renderInfoSection = renderInfoSection;
}
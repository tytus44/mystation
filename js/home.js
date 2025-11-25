/* INIZIO MODULO HOME DASHBOARD */
const HomeModule = {
    timeInterval: null,
    litersChart: null,

    init: function() {
        this.render();
        this.startClock();
    },

    render: function() {
        const container = document.getElementById('home-content');
        if (!container) return;
        
        const stats = this.getTodayStats();
        const bannerData = this.getBannerData();

        container.innerHTML = `
            <div class="card" style="border:none; overflow:hidden; margin-bottom: 24px; min-height: 320px; position: relative; color: white;">
                <div style="position: absolute; top:0; left:0; width:100%; height:100%; background-image: url('${bannerData.img}'); background-size: cover; background-position: center; z-index: 0; transition: background-image 0.5s ease;"></div>
                
                <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: ${bannerData.overlay}; z-index: 1;"></div>

                <div style="position: relative; z-index: 2; padding: 40px; display: flex; flex-direction: row; justify-content: space-between; align-items: center; height: 100%; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    
                    <div style="max-width: 60%;">
                        <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 10px; color: var(--text-main);">${bannerData.greeting}</h1>
                        <p style="opacity: 1; font-size: 1.1rem; color: var(--text-main); font-weight: 500;">Benvenuto in Polaris Station Management</p>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                        <div style="background: var(--bg-header); backdrop-filter: blur(10px); padding: 10px 25px; border-radius: 50px; display: flex; align-items: center; gap: 10px; box-shadow: var(--shadow-card); border: 1px solid var(--border-color);">
                            <i data-lucide="clock" style="width: 20px; color: var(--primary-color);"></i>
                            <span id="live-time" style="font-weight: 600; font-size: 1.4rem; color: var(--text-main);">--:--</span>
                        </div>
                        <div style="font-size: 1.1rem; font-weight: 600; text-align: right; padding-right: 10px; color: var(--text-main);" id="live-date">-- -- ----</div>
                    </div>

                </div>
            </div>

            <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); margin-bottom: 24px;">
                
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Fatturato Giornaliero</span>
                        <i data-lucide="euro"></i>
                    </div>
                    <div class="card-body">
                        <h2 style="color: var(--text-main); font-size: 2rem; font-weight: 700;">${stats.revenue.toLocaleString('it-IT', {style:'currency', currency:'EUR'})}</h2>
                        <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 0.85rem; color: var(--text-secondary);">
                            <span>Imp: ${(stats.revenue/1.22).toLocaleString('it-IT', {maximumFractionDigits:0})}€</span>
                            <span>IVA: ${(stats.revenue - (stats.revenue/1.22)).toLocaleString('it-IT', {maximumFractionDigits:0})}€</span>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Margine Lordo</span>
                        <i data-lucide="hand-coins"></i>
                    </div>
                    <div class="card-body">
                        <h2 style="color: #f97316; font-size: 2rem; font-weight: 700;">${stats.margin.toLocaleString('it-IT', {style:'currency', currency:'EUR'})}</h2>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 5px;">
                            Basato su litri erogati
                        </p>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Totale Litri</span>
                        <i data-lucide="droplets"></i>
                    </div>
                    <div class="card-body">
                        <h2 style="color: var(--primary-color); font-size: 2rem; font-weight: 700;">${stats.totalLiters.toLocaleString('it-IT')} L</h2>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 5px;">
                            Turni chiusi oggi: <strong>${stats.shiftsCount}</strong>
                        </p>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Incidenza Servito</span>
                        <i data-lucide="user-check"></i>
                    </div>
                    <div class="card-body">
                        <h2 style="color: #ec4899; font-size: 2rem; font-weight: 700;">${stats.servitoPerc}%</h2>
                        
                        <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 10px; margin-top: 15px; overflow: hidden;">
                            <div style="height: 100%; width: ${stats.servitoPerc}%; background: #ec4899; border-radius: 10px;"></div>
                        </div>
                    </div>
                </div>

            </div>
        `;

        lucide.createIcons();
        this.updateClock();
    },

    startClock: function() {
        this.updateClock();
        if (this.timeInterval) clearInterval(this.timeInterval);
        this.timeInterval = setInterval(() => this.updateClock(), 1000);
    },

    updateClock: function() {
        const now = new Date();
        const timeEl = document.getElementById('live-time');
        const dateEl = document.getElementById('live-date');
        
        if (timeEl && dateEl) {
            timeEl.textContent = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
            const dateStr = now.toLocaleDateString('it-IT', options);
            dateEl.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        }
    },

    // --- LOGICA BANNER E OVERLAY ---
    getBannerData: function() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        const imgDay = 'img/station_day.png'; 
        const imgNight = 'img/station_night.png';
        
        const hour = new Date().getHours();
        const greeting = (hour < 18 && hour > 5) ? 'Buona Giornata' : 'Buona Serata';

        // MODIFICA: Overlay molto più leggero (sbiadisce verso destra)
        // Light: Bianco 70% -> Trasparente
        // Dark: Nero 70% -> Trasparente
        const overlayLight = 'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.0) 100%)';
        const overlayDark = 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.0) 100%)';

        return {
            img: isDarkMode ? imgNight : imgDay, 
            overlay: isDarkMode ? overlayDark : overlayLight,
            greeting: greeting
        };
    },

    // --- CALCOLO STATISTICHE ---
    getTodayStats: function() {
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const allTurni = JSON.parse(localStorage.getItem('polaris_turni') || '[]');
        
        const turniOggi = allTurni.filter(t => {
            const d = new Date(t.date);
            d.setHours(0,0,0,0);
            return d.getTime() === today.getTime() && t.turno !== 'Riepilogo Mensile';
        });

        const lastPriceObj = JSON.parse(localStorage.getItem('polaris_last_prices') || 'null');
        const prices = lastPriceObj ? lastPriceObj.prices : { 
            benzina: {base:0}, gasolio: {base:0}, dieselplus: {base:0}, hvo: {base:0}, adblue: {base:0} 
        };

        let lit = 0;
        let rev = 0;
        let marg = 0;
        let servLiters = 0;

        const mFdt = 0.04;
        const mServ = 0.08;
        const mAdblue = 0.40;
        const surSelf = 0.005;
        const surServ = 0.225; 

        turniOggi.forEach(t => {
            ['benzina','gasolio','dieselplus','hvolution','adblue'].forEach(k => {
                const pp = parseFloat(t.prepay?.[k] || 0);
                const sv = parseFloat(t.servito?.[k] || 0);
                const fd = parseFloat(t.fdt?.[k] || 0);
                
                const totProd = pp + sv + fd;
                lit += totProd;
                servLiters += sv;

                const basePrice = parseFloat(prices[k]?.base || 0);
                
                if (basePrice > 0) {
                    if (k === 'adblue') {
                        rev += totProd * basePrice;
                        marg += sv * mAdblue; 
                    } else {
                        rev += (pp + fd) * (basePrice + surSelf);
                        rev += sv * (basePrice + surServ);
                        marg += (pp * mFdt) + (sv * mServ) + (fd * mFdt);
                    }
                }
            });
        });

        return {
            revenue: rev,
            margin: marg,
            totalLiters: Math.round(lit),
            servitoPerc: lit > 0 ? Math.round((servLiters / lit) * 100) : 0,
            shiftsCount: turniOggi.length
        };
    }
};
/* FINE MODULO HOME */

/* MODULO CLOUD SYNC (FIREBASE) */
const CloudModule = {
    user: null,
    db: null,
    lastSyncTime: 0,

    // CONFIGURAZIONE FIREBASE (Dati del progetto polaris-station)
    firebaseConfig: {
        apiKey: "AIzaSyB6bUIVPWnZqbqRhJma8qabxAV9NfBR-so",
        authDomain: "polaris-station.firebaseapp.com",
        projectId: "polaris-station",
        storageBucket: "polaris-station.firebasestorage.app",
        messagingSenderId: "361830221306",
        appId: "1:361830221306:web:377081a8dd07fe05731043"
    },

    init: function() {
        console.log("--> CloudModule: Inizializzazione...");
        
        try {
            // Verifica che le librerie siano caricate
            if (typeof firebase === 'undefined') {
                console.error("Librerie Firebase non trovate.");
                return;
            }

            // Inizializza Firebase solo se non è già attivo
            if (!firebase.apps.length) {
                firebase.initializeApp(this.firebaseConfig);
            }
            
            this.db = firebase.firestore();
            
            // Listener Auth: monitora lo stato del login
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    this.handleLoginSuccess(user);
                } else {
                    this.handleLogoutSuccess();
                }
            });

            this.attachListeners();
            console.log("--> CloudModule: Firebase pronto.");

        } catch (e) {
            console.error("Errore inizializzazione Firebase:", e);
        }
    },

    attachListeners: function() {
        const btnLogin = document.getElementById('btn-cloud-login');
        const btnLogout = document.getElementById('action-logout');
        const btnSync = document.getElementById('action-sync-now');

        if (btnLogin) btnLogin.addEventListener('click', () => this.loginWithGoogle());
        if (btnLogout) btnLogout.addEventListener('click', () => this.logout());
        if (btnSync) btnSync.addEventListener('click', () => this.syncData(true));
    },

    loginWithGoogle: function() {
        // Controllo se siamo in locale su file system (non funziona con Google Auth)
        if (window.location.protocol === 'file:') {
            alert("ATTENZIONE: Il login Google richiede un server (localhost o web host). Non funziona aprendo il file direttamente.");
            return;
        }

        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                window.showNotification("Accesso effettuato!", "success");
            })
            .catch((error) => {
                console.error("Errore Login:", error);
                window.showNotification("Errore: " + error.message, "error");
            });
    },

    logout: function() {
        firebase.auth().signOut().then(() => {
            window.showNotification("Disconnesso", "info");
            // Ricarica la pagina per pulire lo stato visuale
            setTimeout(() => location.reload(), 500);
        });
    },

    handleLoginSuccess: function(user) {
        this.user = user;
        console.log("Utente loggato:", user.email);

        // Aggiorna Interfaccia Utente
        const btnLogin = document.getElementById('btn-cloud-login');
        const avatar = document.getElementById('user-avatar');
        const logoutItem = document.getElementById('action-logout');

        // Nascondi pulsante login, mostra voce logout nel menu
        if (btnLogin) btnLogin.style.display = 'none';
        if (logoutItem) logoutItem.style.display = 'flex';
        
        // Configura avatar
        if (avatar) {
            avatar.src = user.photoURL;
            avatar.style.display = 'block';
            
            // MODIFICA: Rimossa riga setAttribute('data-tooltip'...)
            // Rimossa riga avatar.title (se presente) per pulizia totale
            avatar.removeAttribute('title'); 
            
            avatar.onclick = null;
        }

        // Avvia sincronizzazione automatica
        this.syncData(false);
    },

    handleLogoutSuccess: function() {
        this.user = null;
        const btnLogin = document.getElementById('btn-cloud-login');
        const avatar = document.getElementById('user-avatar');
        const logoutItem = document.getElementById('action-logout');

        // Mostra pulsante login, nascondi avatar e voce logout
        if (btnLogin) btnLogin.style.display = 'flex';
        if (avatar) avatar.style.display = 'none';
        if (logoutItem) logoutItem.style.display = 'none';
    },

    // --- LOGICA SINCRONIZZAZIONE ---
    syncData: async function(forceDownload = false) {
        if (!this.user || !this.db) return;

        if(forceDownload) window.showNotification("Sincronizzazione in corso...", "info");

        const userDocRef = this.db.collection('users').doc(this.user.uid);

        try {
            const doc = await userDocRef.get();
            
            if (doc.exists) {
                const cloudData = doc.data();
                const cloudTime = cloudData.timestamp || 0;
                const localTime = parseInt(localStorage.getItem('polaris_last_sync') || '0');

                console.log(`Sync Check - Cloud: ${cloudTime}, Local: ${localTime}`);

                if (forceDownload || cloudTime > localTime) {
                    // CLOUD VINCE: I dati online sono più recenti
                    console.log("--> Scaricamento dati dal Cloud...");
                    this.restoreLocalData(cloudData.appData);
                    localStorage.setItem('polaris_last_sync', cloudTime); 
                    window.showNotification("Dati aggiornati dal Cloud!", "success");
                    
                    // Ricarica necessaria per aggiornare le tabelle a video
                    setTimeout(() => location.reload(), 1000);

                } else if (localTime > cloudTime) {
                    // LOCALE VINCE: Abbiamo lavorato offline o siamo più avanti
                    console.log("--> Caricamento dati su Cloud...");
                    this.pushDataToCloud();
                } else {
                    // SINCRONIZZATI
                    console.log("--> Dati già sincronizzati.");
                    if(forceDownload) window.showNotification("Tutto aggiornato.", "success");
                }
            } else {
                // Primo backup assoluto
                console.log("--> Primo backup su Cloud...");
                this.pushDataToCloud();
            }
        } catch (e) {
            console.error("Errore Sync:", e);
            if(forceDownload) window.showNotification("Errore di connessione", "error");
        }
    },

    // Salva tutto il localStorage su Firebase
    pushDataToCloud: async function() {
        if (!this.user || !this.db) return;

        const data = this.getAllLocalData();
        const timestamp = Date.now();

        try {
            await this.db.collection('users').doc(this.user.uid).set({
                appData: data,
                timestamp: timestamp,
                email: this.user.email
            });
            
            localStorage.setItem('polaris_last_sync', timestamp);
            console.log("--> Upload su Cloud completato.");
        } catch (e) {
            console.error("Errore Upload:", e);
        }
    },

    // Raccoglie i dati dai moduli locali
    getAllLocalData: function() {
        return {
            turni: JSON.parse(localStorage.getItem('polaris_turni') || '[]'),
            clients: JSON.parse(localStorage.getItem('polaris_clients') || '[]'),
            carico: JSON.parse(localStorage.getItem('polaris_registro_carico') || '[]'),
            stockPrev: JSON.parse(localStorage.getItem('polaris_registro_stock_prev') || '{}'),
            priceHistory: JSON.parse(localStorage.getItem('polaris_price_history') || '[]'),
            lastPrices: JSON.parse(localStorage.getItem('polaris_last_prices') || 'null'),
            competitors: JSON.parse(localStorage.getItem('polaris_competitors') || 'null'),
            agenda: JSON.parse(localStorage.getItem('polaris_agenda') || '[]'),
            theme: localStorage.getItem('polaris_theme')
        };
    },

    // Ripristina i dati nel localStorage
    restoreLocalData: function(data) {
        if(!data) return;
        if(data.turni) localStorage.setItem('polaris_turni', JSON.stringify(data.turni));
        if(data.clients) localStorage.setItem('polaris_clients', JSON.stringify(data.clients));
        if(data.carico) localStorage.setItem('polaris_registro_carico', JSON.stringify(data.carico));
        if(data.stockPrev) localStorage.setItem('polaris_registro_stock_prev', JSON.stringify(data.stockPrev));
        if(data.priceHistory) localStorage.setItem('polaris_price_history', JSON.stringify(data.priceHistory));
        if(data.lastPrices) localStorage.setItem('polaris_last_prices', JSON.stringify(data.lastPrices));
        if(data.competitors) localStorage.setItem('polaris_competitors', JSON.stringify(data.competitors));
        if(data.agenda) localStorage.setItem('polaris_agenda', JSON.stringify(data.agenda));
        if(data.theme) localStorage.setItem('polaris_theme', data.theme);
    }
};
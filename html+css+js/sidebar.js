document.addEventListener('DOMContentLoaded', () => {
    // Riferimenti elementi DOM
    const navLinks = document.querySelectorAll('.nav-link');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const themeToggle = document.getElementById('theme-toggle');
    const infoToggle = document.getElementById('info-toggle');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');

    // Riferimenti modale info
    const infoModal = document.getElementById('info-modal');
    const infoModalClose = document.getElementById('info-modal-close');

    // Mappatura per titoli e sottotitoli
    const pageDetails = {
        home: { title: "Home", subtitle: "Dashboard principale." },
        anagrafica: { title: "Anagrafica", subtitle: "Gestisci i tuoi contatti business." },
        calendario: { title: "Calendario", subtitle: "Organizza i tuoi appuntamenti e impegni." },
        amministrazione: { title: "Amministrazione", subtitle: "Monitora i conti a credito dei clienti." },
        registro: { title: "Registro di Carico", subtitle: "Monitoraggio delle consegne di carburante." },
        "gestione-prezzi": { title: "Gestione Prezzi", subtitle: "Gestione dei prezzi e monitoraggio della concorrenza." },
        virtualstation: { title: "VirtualStation", subtitle: "Registra le vendite carburante per turni." },
        statistiche: { title: "Statistiche", subtitle: "Visualizza i dati di vendita e performance." }
    };

    // Funzione per cambiare pagina
    function switchPage(pageId) {
        document.querySelectorAll('.page-section').forEach(section => {
            section.style.display = 'none';
        });
        const activeSection = document.getElementById(`${pageId}-content`);
        if (activeSection) activeSection.style.display = 'block';

        if (pageDetails[pageId]) {
            pageTitle.textContent = pageDetails[pageId].title;
            pageSubtitle.textContent = pageDetails[pageId].subtitle;
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageId) link.classList.add('active');
        });

        // Chiama la funzione di inizializzazione della pagina statistiche se è quella attiva
        if (pageId === 'statistiche' && typeof window.initStatsPage === 'function') {
            window.initStatsPage();
        }

        if (window.innerWidth <= 768) sidebar.classList.remove('open');
    }

    // Gestione click sui link di navigazione
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(e.currentTarget.dataset.page);
        });
    });

    // --- GESTIONE MODALE INFO ---
    function openInfoModal() {
        if (infoModal) {
            infoModal.style.display = 'flex';
            setTimeout(() => {
                infoModal.classList.add('show');
                // Inizializza le icone Lucide nel modale
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 10);
        }
    }

    function closeInfoModal() {
        if (infoModal) {
            infoModal.classList.remove('show');
            setTimeout(() => {
                infoModal.style.display = 'none';
            }, 300);
        }
    }

    // Event listeners per il modale info
    if (infoToggle) {
        infoToggle.addEventListener('click', openInfoModal);
    }

    if (infoModalClose) {
        infoModalClose.addEventListener('click', closeInfoModal);
    }

    if (infoModal) {
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) {
                closeInfoModal();
            }
        });
    }

    // Chiudi modale con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && infoModal && infoModal.classList.contains('show')) {
            closeInfoModal();
        }
    });

    // --- GESTIONE FULLSCREEN (NUOVO) ---
    const fullscreenBtn = document.getElementById('fullscreen-toggle');
    if (fullscreenBtn) {
        const maximizeIcon = fullscreenBtn.querySelector('.maximize-icon');
        const minimizeIcon = fullscreenBtn.querySelector('.minimize-icon');

        function updateFullscreenIcon() {
            const isFullscreen = !!document.fullscreenElement;
            maximizeIcon.style.display = isFullscreen ? 'none' : 'block';
            minimizeIcon.style.display = isFullscreen ? 'block' : 'none';
        }

        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    alert(`Errore nell'attivare la modalità schermo intero: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        });
        
        document.addEventListener('fullscreenchange', updateFullscreenIcon);
    }

    // Gestione sidebar mobile
    if(mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar && !sidebar.contains(e.target) && mobileMenuBtn && !mobileMenuBtn.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });

    // --- Inizializzazione ---
    if (window.MemoriaStorage) {
        window.MemoriaStorage.initTheme(themeToggle);
    }
    switchPage('home');
});
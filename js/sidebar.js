/* INIZIO LOGICA SIDEBAR */
document.addEventListener("DOMContentLoaded", () => {
    
    // Seleziona tutti i bottoni che controllano la sidebar (solo quello mobile)
    const sidebarToggleBtns = document.querySelectorAll(".sidebar-toggle-btn");
    // Seleziona il nuovo bottone "Collassa sidebar" nel footer
    const collapseSidebarBtn = document.getElementById("collapse-sidebar-btn");
    // Seleziona il bottone fullscreen
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    
    // Seleziona l'elemento sidebar
    const sidebar = document.querySelector(".sidebar");

    // Funzione per collassare/espandere la sidebar
    const toggleSidebar = () => {
        if (sidebar) {
            sidebar.classList.toggle("collapsed");
        }
    };

    if (sidebar) {
        // Aggiunge l'evento di click ai bottoni toggle standard (quello mobile)
        sidebarToggleBtns.forEach((btn) => {
            btn.addEventListener("click", toggleSidebar);
        });

        // Aggiunge l'evento di click al bottone "Collassa sidebar"
        if (collapseSidebarBtn) {
            collapseSidebarBtn.addEventListener("click", toggleSidebar);
        }

        // Aggiunge l'evento di click al bottone "Schermo interno"
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener("click", () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.error(`Errore nell'attivare la modalità fullscreen: ${err.message} (${err.name})`);
                    });
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                }
            });
        }
        
        // Mostra la sidebar espansa di default su schermi grandi (> 768px)
        if (window.innerWidth > 768) {
            sidebar.classList.remove("collapsed");
        } else {
            // Assicura che sia collassata su schermi piccoli al caricamento
            sidebar.classList.add("collapsed");
        }
        
    } else {
        console.warn("Elemento .sidebar non trovato.");
    }
});
/* FINE LOGICA SIDEBAR */
Polaris Admin è un pannello di amministrazione privato, local-first, progettato per la gestione completa di una stazione di servizio (predefinito Enilive, ma facilmente modificabile).

Si tratta di una Single Page Application (SPA) che non richiede un backend: tutti i dati vengono salvati e letti direttamente dal localStorage del browser. Questo la rende veloce, portatile e completamente offline.

🚀 Core Technologies
Il progetto è costruito utilizzando un stack front-end moderno:

JavaScript (ES6+): Per tutta la logica applicativa.

Tailwind CSS: Per l'utility-first styling.

Flowbite: Come libreria di componenti UI (modali, dropdown, datepicker) basata su Tailwind.

Lucide Icons: Per le icone.

Chart.js: Per la visualizzazione di grafici e statistiche.

Sortable.js: Per la funzionalità di drag-and-drop e la personalizzazione dei layout.

🏛️ Architettura
L'applicazione si basa su un'architettura modulare costruita attorno a un file core (app.js).

Core (app.js): Gestisce lo stato globale (App.state.data), la persistenza dei dati su localStorage (sotto la chiave Polaris_data_v11), la navigazione (routing basato su hash), e fornisce utility globali (modali, toast, formattazione).

Moduli: Ogni sezione (es. home.js, prezzi.js) è un modulo che si registra con il core. Ogni modulo gestisce il proprio stato locale, il rendering della sua sezione e i propri listener.

Persistenza: Tutti i dati inseriti (turni, prezzi, clienti, spese, ecc.) vengono salvati in un unico oggetto JSON nel localStorage del browser.

Layout Personalizzabile: Molte sezioni utilizzano Sortable.js per permettere all'utente di riordinare le card e i pannelli. La disposizione viene salvata nel localStorage (es. Polaris_home_layout_v12).

📋 Funzionalità per Modulo
Il pannello è suddiviso nelle seguenti sezioni principali:

1. Dashboard (home.js)
Pagina di atterraggio con una panoramica della giornata odierna.

Statistiche principali: Fatturato, Margine Stimato, Litri totali, % Servito.

Grafico "Erogato Oggi" (litri per prodotto).

Widget "Attività di Oggi" che aggrega appuntamenti e to-do dalla sezione Applicazioni.

Widget "Consegne Carburante" che mostra gli ordini in arrivo.

Layout completamente personalizzabile con Drag & Drop.

2. Virtualstation (virtualstation.js)
Modulo per la registrazione e l'analisi dei turni di vendita.

Inserimento turni (Mattina, Pomeriggio, Notte, Pausa, Weekend, Riepilogo Mensile).

Il modale di inserimento abilita/disabilita dinamicamente i campi (Prepay, Servito, FaiDaTe) in base al tipo di turno selezionato.

Filtri per periodo (Oggi, Mese, Anno).

Statistiche filtrate (Litri, Fatturato, % Servito).

Grafici:

Modalità di Servizio: Grafico a barre (FaiDaTe, Servito, Prepay).

Vendite per Prodotto: Grafico a ciambella.

Andamento Anno: Grafico lineare dei litri venduti mese per mese.

Tabella paginata dello storico turni.

3. Amministrazione (amministrazione.js)
Gestione della contabilità clienti.

Anagrafica clienti con tracciamento del saldo (credito/debito).

Visualizzazione a Lista o Griglia.

Statistiche: Clienti Attivi, Credito Totale, Debito Totale.

Gestione Cliente: Un modale avanzato permette di:

Aggiungere transazioni (Addebiti o Acconti).

Visualizzare lo storico delle transazioni.

Saldare il conto (azzera il saldo e archivia le transazioni).

Stampare l'estratto conto.

4. Registro di Carico (registro.js)
Tracciamento dei carichi di carburante.

Inserimento dei carichi (litri e differenza) per data e autista.

Statistiche: Litri Totali, Prodotto Top, Autista Top.

Riepilogo Annuale: Una tabella pivot che calcola:

Carico totale e differenze (positive/negative) per prodotto.

Giacenza Anno Precedente (modificabile).

Chiusura: Calcolo automatico della giacenza finale.

Tabella paginata e ordinabile dello storico carichi.

5. Gestione Prezzi (prezzi.js)
Modulo per la gestione dei listini carburante e della concorrenza.

Statistiche dei prezzi attuali (Self e Servito) calcolati in base all'ultimo listino.

Storico Listini: Permette di inserire/modificare i prezzi base (pre-compilati con l'ultimo valore per rapidità).

Concorrenza:

Permette di inserire i prezzi dei competitor.

Visualizza le differenze di prezzo rispetto ai propri.

6. Anagrafica (anagrafica.js)
Rubrica per i contatti.

Gestione di contatti (nome, cognome, azienda, note).

Ricerca avanzata (cerca anche nel campo "note").

Importazione ed Esportazione in formato CSV.

Funzione di stampa della rubrica.

Layout a card con ordinamento personalizzabile (Drag & Drop).

7. Gestione Spese (spese.js)
Modulo per il tracciamento delle uscite.

Inserimento spese con data, importo, descrizione e fornitore.

Gestione Etichette: Permette di creare etichette personalizzate con colori per categorizzare le spese.

Filtri avanzati per ricerca, mese, anno e etichetta.

Statistiche filtrate (Totale, Numero, Spesa Massima).

Layout con sezioni e statistiche personalizzabili (Drag & Drop).

8. Applicazioni (applicazioni.js)
Una suite di utility e mini-app.

Calendario & Eventi: Gestione di Appuntamenti e To-Do. Gli eventi vengono mostrati come "dots" sul calendario.

Ordine Carburante: Form per creare un ordine. Al salvataggio, crea automaticamente un To-Do "urgente" nel calendario per la data di consegna.

Calcolo IVA: Utility per scorporare o aggiungere l'IVA (22%).

Conta Banconote: Calcolatrice per il conteggio dei contanti.

Calcolatrice: Una semplice calcolatrice.

Note Rapide: Un blocco note salvato automaticamente su localStorage.

Radio Stream: Un lettore di radio streaming che recupera le stazioni italiane da un'API pubblica.

Layout multi-colonna completamente personalizzabile (Drag & Drop).

9. Informazioni (informazioni.js)
Pagina statica con risorse utili.

Collegamenti rapidi a siti esterni (predefiniti Virtualstation, Banche, Portali Eni, ecc.).

Elenco numeri di assistenza.

Impianti (predefiniti ENILIVE) Roma: Una tabella ricercabile e paginata di altri impianti (presumibilmente concorrenti o colleghi). Questa lista può essere importata/esportata via CSV.

10. Impostazioni (impostazioni.js)
Configurazione e gestione dell'applicazione.

Backup e Ripristino:

Esporta: Genera un file JSON contenente tutti i dati dell'applicazione.

Importa: Permette di caricare un file JSON di backup per ripristinare i dati.

Modulistica: Link diretti a file PDF statici (es. inizio.pdf, fine.pdf).

Zona Pericolo:

Elimina TUTTI i dati: Un pulsante per pulire completamente il localStorage e resettare l'applicazione.

🚀 Installazione e Avvio
Non è necessaria alcuna build o installazione.

Clonare o scaricare la repository.

Assicurarsi che tutti i file (.html, .js, img/, pdf/) siano nella stessa directory.

Aprire il file index.html in un qualsiasi browser moderno (es. Chrome, Firefox, Edge).

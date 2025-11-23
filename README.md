# ⛽ Polaris - Station Management System

**Polaris** è una web application moderna e modulare progettata per la gestione completa di una stazione di servizio carburanti. L'applicazione offre una dashboard intuitiva in stile "Banking App" per monitorare vendite, prezzi, giacenze e contabilità clienti.

L'intero sistema è **Serverless** e **Database-free**, basandosi sulla potenza del browser e del `LocalStorage` per la persistenza dei dati, con funzionalità avanzate di Backup e Ripristino JSON.

---

## ✨ Caratteristiche Principali

### 🖥️ Dashboard (Home)
* **Banner Dinamico**: Cambia automaticamente tra modalità Giorno/Notte in base al tema selezionato.
* **KPI in Tempo Reale**: Visualizzazione immediata di Fatturato, Margine Lordo, Totale Litri venduti e % Incidenza Servito.
* **Grafici**: Visualizzazione grafica dell'andamento erogato giornaliero.

### ⛽ Virtual Station (Gestione Turni)
* **Registro Turni**: Inserimento dati per turni specifici (Mattina, Pomeriggio, Notte, Weekend, ecc.).
* **Modalità di Vendita**: Gestione separata per **Iperself**, **Servito** e **Fai Da Te**.
* **Prodotti**: Supporto per Benzina, Gasolio, Diesel+, Hvolution e AdBlue.
* **Analisi**: Grafici a ciambella e a barre per analizzare la distribuzione delle vendite.

### 🚚 Registro Carico
* **Gestione Rifornimenti**: Registrazione degli scarichi cisterna.
* **Calcolo Differenze**: Calcolo automatico delle differenze (Cali/Eccedenze) tra il dichiarato nel documento di trasporto e l'effettivo scaricato.
* **Storico**: Tabella completa con indicatori visivi (Verde/Rosso) per le differenze positive o negative.

### 🏷️ Gestione Prezzi
* **Listini**: Inserimento rapido dei prezzi base con calcolo automatico delle maggiorazioni per Self e Servito.
* **Input Intelligente**: Sistema di input a "4 caselle" per inserire i prezzi senza errori decimali.
* **Concorrenza**: Monitoraggio dei prezzi dei competitor (MyOil, Esso, Q8) con calcolo automatico del delta rispetto al proprio prezzo.

### 💼 Amministrazione
* **Gestione Clienti a Credito**: Anagrafica clienti e saldo in tempo reale.
* **Transazioni**: Registrazione di movimenti (Carburante, Acconti, Fatture).
* **Estratto Conto**: Generazione e stampa dell'estratto conto cliente in formato A4.

### 🧰 Strumenti & Utility
* **Calcolatore Ordine**: Stima del fabbisogno di carburante in base a capienza e giacenza.
* **Conta Banconote**: Strumento rapido per il conteggio dei versamenti contanti (con rimozione tagli piccoli).
* **Scorporo IVA**: Calcolatrice rapida per imponibile e IVA.

---

## 🎨 Design & UX

Il progetto utilizza un design system personalizzato (**Banking UI Kit**) caratterizzato da:
* **Color Palette**: Colori vivaci per i prodotti (Verde, Arancio, Rosso, Ciano) e Blu Elettrico per l'interfaccia.
* **Componenti Moderni**: Card arrotondate, ombre morbide, input stepper personalizzati, bottoni a pillola.
* **Dark Mode**: Supporto nativo completo per il tema scuro.
* **Modali Avanzate**: Finestre di dialogo con backdrop sfocato e layout ottimizzato.
* **Responsive**: Adattabile a schermi desktop e tablet.

---

## 🛠️ Stack Tecnologico

* **HTML5**: Struttura semantica.
* **CSS3**: Variabili CSS (Custom Properties), Flexbox, Grid. Nessun framework esterno pesante (solo CSS puro).
* **JavaScript (ES6+)**: Architettura a Moduli (Object Literal Pattern) per separare la logica di ogni sezione.
* **LocalStorage**: Persistenza dei dati lato client.
* **Librerie Esterne**:
    * [Chart.js](https://www.chartjs.org/): Per i grafici statistici.
    * [Lucide Icons](https://lucide.dev/): Per le icone vettoriali.

---

## 📂 Struttura del Progetto

```text
polaris/
├── index.html            # Entry point e struttura base
├── style.css             # Foglio di stile unico (Theming, Componenti)
├── img/                  # Assets grafici
│   ├── favicon.svg
│   ├── logo.png
│   ├── station_day.png
│   └── station_night.png
└── js/
    ├── applicazione.js   # Core, Routing, Gestione Tema, Backup
    ├── home.js           # Logica Dashboard
    ├── prezzi.js         # Modulo Prezzi
    ├── virtualstation.js # Modulo Turni
    ├── carico.js         # Modulo Registro Carico
    ├── amministrazione.js# Modulo Clienti
    └── strumenti.js      # Modulo Utility (Calcolatrici)

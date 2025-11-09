# MyStation Admin V11

Sistema completo di gestione per stazioni di servizio ENI/ENILIVE, sviluppato con tecnologie web moderne per funzionare interamente nel browser.

## 📋 Panoramica

MyStation Admin V11 è un'applicazione web single-page completa per la gestione di stazioni di servizio. Include moduli per amministrazione clienti, gestione turni, registro carburanti, prezzi, spese, rubrica contatti e utility varie.

## ✨ Caratteristiche Principali

### Dashboard & Analytics
- **Dashboard Home**: Statistiche in tempo reale con grafici e KPI
- **Orologio Live**: Data e ora aggiornati automaticamente
- **Visualizzazione Eventi**: Eventi e to-do del giorno in evidenza
- **Monitoraggio Ordini**: Tracciamento consegne carburante

### VirtualStation
- **Gestione Turni**: Registrazione turni (Mattina, Pomeriggio, Notte, Pausa, Weekend)
- **Erogazioni Prodotti**: Tracciamento litri per Benzina, Gasolio, Diesel+, Hvolution, AdBlue
- **Modalità di Servizio**: Distinzione tra Prepay, Servito e FaiDaTe
- **Grafici Analitici**: Visualizzazione vendite per prodotto, modalità e trend annuale
- **Filtri Temporali**: Vista Oggi/Mese/Anno
- **Paginazione**: Navigazione storico turni

### Amministrazione Clienti
- **Gestione Anagrafica Clienti**: Schede cliente complete
- **Saldo & Transazioni**: Tracciamento crediti/debiti con storico movimenti
- **Operazioni Veloci**: Addebiti e acconti rapidi
- **Saldaconto**: Chiusura e azzeramento posizioni
- **Estratto Conto**: Stampa dettagliata transazioni cliente
- **Vista Lista/Griglia**: Due modalità di visualizzazione

### Registro di Carico
- **Carichi Cisterna**: Registrazione arrivi carburante per prodotto
- **Gestione Differenze**: Tracciamento differenze positive/negative
- **Riepilogo Annuale**: Calcolo automatico giacenze e chiusure
- **Anno Precedente**: Input rimanenze anno precedente per continuità
- **Statistiche**: Top prodotto, top autista, totale litri

### Gestione Prezzi
- **Listini Base**: Storico prezzi per tutti i prodotti
- **Calcolo Automatico**: Sovrapprezzi Self e Servito
- **Monitoraggio Concorrenza**: Confronto prezzi MyOil, Esso, Q8
- **Vista 3 Decimali**: Precisione pricing carburanti

### Anagrafica & Rubrica
- **Gestione Contatti**: Nome, cognome, azienda, telefono, email, note
- **Vista Card**: Layout visivo con avatar generato
- **Ricerca**: Filtro istantaneo
- **Import/Export CSV**: Backup e migrazione dati
- **Stampa**: Generazione lista contatti stampabile

### Gestione Spese
- **Registrazione Spese**: Data, importo, fornitore, descrizione
- **Etichette Personalizzate**: Categorie con colori custom
- **Filtri Avanzati**: Per mese, anno, etichetta
- **Statistiche**: Totale spese, numero transazioni, spesa più alta
- **Ricerca**: Filtro per descrizione e fornitore

### Applicazioni & Utility
- **Calendario**: Vista mensile con navigazione
- **Eventi & To-Do**: Appuntamenti con orario e durata + task con priorità
- **Dots Visivi**: Indicatori colorati per tipo e priorità eventi
- **Ordini Carburante**: Pianificazione ordini con calcolo costi
- **Calcolo IVA**: Conversione Lordo/Netto con IVA 22%
- **Conta Banconote**: Conteggio rapido cassa con tagli €500-€5

### Informazioni Utili
- **Collegamenti Rapidi**: Link diretti a servizi ENI (Virtualstation, Ordini, Contabilità, ecc.)
- **Numeri Assistenza**: Rubrica telefonica assistenza
- **Impianti ENILIVE Roma**: Database impianti con import/export CSV
- **Ricerca Impianti**: Filtro per PV, ragione sociale, indirizzo

### Impostazioni
- **Backup/Ripristino**: Export/Import dati completi JSON
- **Modulistica**: Download PDF fogli inizio/fine giornata
- **Reset Dati**: Cancellazione completa con conferma

## 🛠️ Stack Tecnologico

### Frontend
- **HTML5**: Struttura semantica
- **Tailwind CSS 3.x**: Framework CSS utility-first
- **Flowbite 2.3.0**: Componenti UI precostruiti
- **JavaScript ES6+**: Logica applicativa moderna

### Librerie
- **Lucide Icons**: Icone SVG moderne
- **Chart.js**: Grafici interattivi
- **Flowbite Components**: Modal, Dropdown, Datepicker

### Storage
- **LocalStorage**: Persistenza dati browser (chiave: `mystation_data_v11`)

## 📦 Struttura Progetto

```
mystation-admin-v11/
├── index.html              # Pagina principale
├── js/
│   ├── app.js             # Core: routing, storage, utility
│   ├── home.js            # Modulo Dashboard
│   ├── virtualstation.js  # Modulo Turni
│   ├── amministrazione.js # Modulo Clienti
│   ├── registro.js        # Modulo Registro Carico
│   ├── prezzi.js          # Modulo Prezzi
│   ├── anagrafica.js      # Modulo Contatti
│   ├── spese.js           # Modulo Spese
│   ├── applicazioni.js    # Modulo Utility
│   ├── informazioni.js    # Modulo Info
│   └── impostazioni.js    # Modulo Impostazioni
├── img/
│   ├── logo.svg           # Logo applicazione
│   └── favicon.svg        # Favicon
├── pdf/
│   ├── inizio.pdf         # Foglio inizio giornata
│   └── fine.pdf           # Foglio fine giornata
└── README.md
```

## 🚀 Installazione

### Requisiti
- Browser moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Nessun server richiesto

### Setup
1. Scarica tutti i file del progetto
2. Mantieni la struttura delle cartelle
3. Apri `index.html` nel browser

**Nota**: L'applicazione funziona completamente offline dopo il primo caricamento delle CDN.

## 💾 Gestione Dati

### Storage
Tutti i dati sono salvati automaticamente nel LocalStorage del browser con chiave `mystation_data_v11`.

### Struttura Dati
```javascript
{
  priceHistory: [],        // Storico listini
  competitorPrices: [],    // Prezzi concorrenza
  registryEntries: [],     // Carichi cisterna
  previousYearStock: {},   // Rimanenze anno precedente
  clients: [],             // Anagrafica clienti
  stazioni: [],            // Impianti ENILIVE
  turni: [],               // Turni virtualstation
  spese: [],               // Spese
  speseEtichette: [],      // Categorie spese
  todos: [],               // To-Do
  appuntamenti: [],        // Appuntamenti
  fuelOrders: [],          // Ordini carburante
  contatti: []             // Rubrica contatti
}
```

### Backup
- **Automatico**: Ogni modifica viene salvata istantaneamente
- **Manuale**: Export JSON dal menu Impostazioni
- **Import**: Ripristino da file JSON

### Cancellazione
Elimina dati da Impostazioni > Zona Pericolo > Elimina TUTTI i dati (irreversibile).

## 🎨 Temi

### Dark Mode
- Attivo di default
- Toggle manuale da sidebar
- Persistente tramite localStorage
- Rileva preferenze sistema

### Responsive Design
- **Mobile**: < 768px - Sidebar collassabile
- **Tablet**: 768px - 1024px - Layout adattivo
- **Desktop**: > 1024px - Sidebar fissa con collapse opzionale

## 📱 Funzionalità UI

### Sidebar
- **Collapse Desktop**: Riduzione a icone (16px width)
- **Mobile Drawer**: Overlay scorrevole
- **Persistenza**: Stato salvato in localStorage

### Modal
- Dimensioni variabili (md, lg, xl, 2xl, full)
- Backdrop scuro
- Chiusura ESC e click esterno
- Footer personalizzabile

### Tabelle
- Paginazione
- Ordinamento colonne
- Hover rows
- Responsive scroll

### Grafici
- Doughnut Charts (prodotti)
- Bar Charts (modalità servizio)
- Line Charts (trend temporali)
- Responsive & interattivi

## 🔧 Personalizzazione

### Colori Primari
Modifica `tailwind.config` in `index.html`:
```javascript
colors: {
  primary: {
    "50": "#eff6ff",
    "600": "#2563eb",  // Colore principale
    "700": "#1d4ed8"
  }
}
```

### Sovrapprezzi Carburante
Modifica `js/prezzi.js`:
```javascript
surcharges: {
  self: 0.005,    // €0.005/L
  served: 0.220   // €0.220/L aggiuntivi
}
```

### Margini Stimati
Modifica `js/home.js` - funzione `getTodayStats()`:
```javascript
const mFdt = 0.04;      // 4% FaiDaTe
const mServ = 0.08;     // 8% Servito
const mAdblue = 0.40;   // €0.40/L AdBlue
```

## 🐛 Risoluzione Problemi

### Dati non si salvano
- Verifica che LocalStorage sia abilitato
- Controlla spazio disponibile (quota 5-10MB per dominio)
- Verifica console browser per errori

### Grafici non si caricano
- Controlla connessione per CDN Chart.js
- Verifica console per errori JavaScript
- Prova refresh forzato (Ctrl+F5)

### Icone non visibili
- Verifica connessione per CDN Lucide
- Controlla console per errori 404
- Ricarica pagina

### Modal non si apre
- Verifica caricamento Flowbite.js
- Controlla console per errori JavaScript
- Prova inizializzazione manuale: `initFlowbite()`

## 📄 Licenza

Progetto proprietario - Tutti i diritti riservati.

## 👥 Supporto

Per assistenza tecnica o segnalazione bug, contattare l'amministratore di sistema.

## 📝 Changelog

### V11 (Corrente)
- Implementazione completa tutti moduli
- Modal conferma eliminazione Flowbite
- Fix input numerici (no spin buttons)
- Dark mode icone datepicker
- Calendar dots per eventi/todo
- Fix listener dinamici tabelle
- Export CSV impianti ENILIVE
- Gestione etichette spese con colori
- Filtri avanzati spese (mese/anno/etichetta)
- Calcolo automatico IVA 22%
- Conta banconote con totali
- Ordini carburante con stima prezzi
- Formato prezzi 3 decimali (€/L)
- Paginazione universale
- Ricerca live in tutti i moduli

## 🔐 Sicurezza

### Raccomandazioni
- **Non esporre pubblicamente**: L'app è progettata per uso interno
- **Backup regolari**: Esporta dati periodicamente da Impostazioni
- **Browser aggiornato**: Usa versioni recenti per sicurezza e prestazioni
- **LocalStorage**: I dati rimangono sul dispositivo, non sincronizzati cloud

### Privacy
- Nessun dato inviato a server esterni
- Nessun tracciamento o analytics
- Dati salvati solo localmente nel browser
- Cancellazione completa possibile in qualsiasi momento

## 🚀 Prestazioni

### Ottimizzazioni
- Caricamento lazy dei moduli
- Paginazione automatica liste lunghe
- Grafici renderizzati on-demand
- Icone SVG leggere
- Minimal CSS tramite Tailwind

### Limiti Tecnici
- LocalStorage: ~5-10MB per dominio
- Performance: ottimale fino a ~1000 record per entità
- Browser: richiede JavaScript abilitato

## 📚 Moduli Dettagliati

### Home Dashboard
**File**: `js/home.js`
**Funzioni principali**:
- `updateClock()`: Aggiorna ora in tempo reale
- `getTodayStats()`: Calcola statistiche giornaliere
- `renderActivitiesAndOrders()`: Mostra eventi e ordini

### VirtualStation
**File**: `js/virtualstation.js`
**Funzioni principali**:
- `getFilteredTurni()`: Filtra turni per periodo
- `calculateStats()`: Calcola statistiche periodo
- `initCharts()`: Inizializza grafici Chart.js

### Amministrazione
**File**: `js/amministrazione.js`
**Funzioni principali**:
- `renderClientModal()`: Mostra dettaglio cliente con transazioni
- `printStatement()`: Genera estratto conto stampabile
- `settleAccount()`: Salda e azzera posizione cliente

### Registro Carico
**File**: `js/registro.js`
**Funzioni principali**:
- `getAnnualSummary()`: Calcola riepilogo annuale
- `renderSummary()`: Mostra tabella giacenze
- `saveCarico()`: Salva nuovo carico cisterna

### Gestione Prezzi
**File**: `js/prezzi.js`
**Funzioni principali**:
- `getComputedPrices()`: Calcola prezzi con sovrapprezzi
- `renderConcorrenzaBody()`: Confronto prezzi competitori
- `saveListino()`: Salva nuovo listino base

### Anagrafica
**File**: `js/anagrafica.js`
**Funzioni principali**:
- `renderGrid()`: Visualizza contatti in griglia card
- `exportCSV()`: Esporta rubrica in CSV
- `importCSV()`: Importa contatti da CSV

### Gestione Spese
**File**: `js/spese.js`
**Funzioni principali**:
- `getFilteredSpese()`: Filtra spese per mese/anno/etichetta
- `openLabelsModal()`: Gestisce etichette personalizzate
- `renderStats()`: Calcola totali e statistiche

### Applicazioni
**File**: `js/applicazioni.js`
**Funzioni principali**:
- `renderCalendar()`: Genera calendario mensile
- `openEventModal()`: Crea/modifica eventi e todo
- `updateIva()`: Calcola IVA 22% bidirezionale

### Informazioni
**File**: `js/informazioni.js`
**Funzioni principali**:
- `importCSV()`: Importa impianti da CSV
- `exportCSV()`: Esporta database impianti
- `printList()`: Stampa lista impianti

### Impostazioni
**File**: `js/impostazioni.js`
**Funzioni principali**:
- `confirmClearData()`: Modal conferma reset
- Link a modulistica PDF

## 🎯 Best Practices Sviluppo

### Convenzioni Codice
- **Naming**: camelCase per funzioni, PascalCase per moduli
- **Commenti**: Solo intestazione sezioni
- **Indentazione**: 4 spazi
- **Virgolette**: Singole per stringhe
- **Semicolon**: Sempre

### Aggiunta Nuovi Moduli
1. Crea file `js/nuovo-modulo.js`
2. Segui pattern esistente con IIFE
3. Registra con `App.registerModule('nome', ModuloObj)`
4. Aggiungi link sidebar in `index.html`
5. Aggiungi `<script>` tag prima di `</body>`

### Modifiche UI
- Usa solo classi Tailwind esistenti
- Componenti da Flowbite official docs
- Mantieni coerenza dark mode
- Testa responsive mobile/tablet/desktop

---

**MyStation Admin V11** - Sistema Completo di Gestione per Stazioni di Servizio  
Sviluppato con ❤️ da NeRO utilizzando tecnologie web moderne
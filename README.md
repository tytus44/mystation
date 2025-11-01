# MyStation

MyStation centralizza tutte le operazioni di una stazione di servizio in una piattaforma unica. Permette di monitorare vendite, gestire clienti, tracciare carichi carburante, configurare prezzi e analizzare dati con grafici interattivi.

## Funzionalità Principali

**Dashboard Home** - Riepilogo vendite giornaliere, calcolatore IVA, conta banconote, ordine carburante, calendario e to-do list

**VirtualStation** - Registrazione turni con dettagli prepay/servito, grafici vendite per prodotto e andamento mensile, statistiche con drilldown interattivo

**Amministrazione** - Gestione clienti con estratti conto, transazioni editabili, saldo contabile, stampa e gestione conti

**Registro di Carico** - Tracciamento carburante per autista, riepilogo annuale per prodotto, calcolo differenze stock

**Gestione Prezzi** - Storico listini prezzi, confronto prezzi concorrenza (MyOil, Esso, Q8), calcolo margini

**Anagrafica** - Rubrica contatti, importazione da CSV (compatibile Google Contacts), export dati, stampa

**Spese** - Registrazione spese con etichette, filtri mensili, riepilogo per categoria e metodo pagamento

**Info** - Elenco stazioni ENI, link utili (VirtualStation, Audes, banche, autorità)

**Impostazioni** - Backup/ripristino dati JSON, tema chiaro/scuro, temi extra, arrotondamento elementi, reset completo, uscita account

## Tecnologie

**Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
**Styling**: Sistema CSS personalizzato con temi light/dark
**Persistenza**: LocalStorage (browser)
**Grafici**: Chart.js 3.9.1
**Icone**: Lucide 1.0
**Font**: Poppins (Google Fonts)
**Autenticazione**: SHA-256 lato client

## Struttura File

- `index.html` - Pagina login con animazioni wave
- `mystation.html` - Dashboard principale con sezioni collassabili
- `app.js` - Core dell'applicazione, gestione stato e routing
- `auth.js` - Sistema autenticazione con hash SHA-256
- `credentials.js` - Credenziali utenti (password hashate)
- `home.js` - Dashboard, calcolatrice, calendario, to-do
- `virtual.js` - VirtualStation, turni e grafici vendite
- `amministrazione.js` - Gestione clienti e transazioni
- `registro.js` - Registro carico carburante
- `prezzi.js` - Gestione listini e concorrenza
- `anagrafica.js` - Rubrica contatti
- `spese.js` - Gestione spese e etichette
- `info.js` - Info sezione con account e stazioni
- `impostazioni.js` - Configurazioni e backup
- `sidebar.js` - Comportamento della sidebar
- `styles.css` - Sistema CSS completo (3000+ righe)

## Installazione

1. Scarica i file del repository
2. Apri `index.html` in un browser moderno
3. Accedi con credenziali predefinite (vedi credentials.js)
4. Inizia a usare l'applicazione

Non richiede server, database o dipendenze esterne (salvo librerie CDN).

## Utilizzo

**Primo Accesso**: Login obbligatorio (hash SHA-256). Credenziali di default:
- Username: admin
- Password: admin

**Sezioni Principali**:
- Clicca sulla sidebar per navigare tra le sezioni
- Usa i filtri per restringere i dati visualizzati
- Esporta/importa dati nelle Impostazioni per backup

**Dati Persistenti**: Tutti i dati vengono salvati automaticamente in localStorage del browser. I dati rimangono anche dopo chiusura e riapertura.

## Credenziali Predefinite

Nel file `credentials.js` sono memorizzate le credenziali hashate. Per aggiungere utenti:

1. Apri la console browser (F12)
2. Esegui il generatore di hash SHA-256 fornito nei commenti
3. Aggiungi il nuovo utente all'array VALID_CREDENTIALS

Esempio hash:
```
admin → 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
```

## Gestione Dati

**Backup**: Impostazioni → Esporta genera file JSON con tutti i dati
**Ripristino**: Impostazioni → Importa carica un backup precedente
**Reset**: Impostazioni → Cancella tutti i dati (irreversibile)

I dati importanti vanno regolarmente esportati come misura preventiva.

## Componenti Principali

**Calcolatrice**: Operazioni matematiche di base con display
**Calendario**: Interattivo con evidenziazione giorni festivi e to-do
**Grafici**: Chart.js con zoom su prodotti specifici
**Tabelle**: Ordinabili, filtrabili, con azioni inline
**Modali**: Form reattivi per inserimento/modifica dati
**Notifiche**: Sistema toast per feedback operazioni

## Funzioni Importanti

`calcolaTotaleBanconote()` - Somma banconote per calcolo cassa
`getHomeDashboardStats()` - Statistiche vendite giornaliere
`virtuaStats()` - Calcolo percentuale servito e fatturato
`sortedTurni()` - Ordinamento turni con filtri temporali
`getTurnoTotal()` - Somma litri per turno
`renderContattiGrid()` - Visualizzazione grid contatti con colori
`getFilteredAndSortedContatti()` - Ricerca e ordinamento contatti

## Temi e Personalizzazione

**Temi**: Light (default) e Dark selezionabili dalle Impostazioni
**Colori**: Definiti come variabili CSS (--color-primary, --color-success, ecc.)
**Arrotondamento**: Nessuno, Medio (default), Alto
**Sidebar**: Collassabile per più spazio contenuto

## Responsive Design

- Mobile: Layout single column, menu a burger
- Tablet: 2-3 colonne griglia
- Desktop: Layout completo 3+ colonne

## Limitazioni

- Dati solo in memory browser (LocalStorage) - non sincronizzati tra dispositivi
- Nessun database backend
- No autenticazione server-side
- Funziona offline dopo caricamento iniziale

## Roadmap Futuri

- Database backend (MongoDB/PostgreSQL)
- Sincronizzazione cloud
- API REST
- Utenti multipli con permessi
- Export PDF/Excel
- Mobile app nativa
- Notifiche push
- Integrazione EDI con fornitori

## Browser Supportati

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Richiede localStorage e crypto API disponibili.

## Note Sviluppative

L'applicazione usa moduli Vanilla JS con pattern singleton. Lo stato è centralizzato in `app.state` con salvataggio automatico su localStorage. Ogni sezione ha un modulo dedicato (home.js, virtual.js, ecc.) inizializzato da `app.js`.

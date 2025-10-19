// =============================================
// FILE: credentials.js
// DESCRIZIONE: Credenziali di accesso (password hashate SHA-256)
// =============================================

/*
 * ISTRUZIONI PER AGGIUNGERE/MODIFICARE UTENTI:
 * 
 * 1. Per ottenere l'hash SHA-256 di una password, apri la Console del browser (F12)
 * 2. Incolla questo codice e premi Invio:
 * 
 *    async function getHash(password) {
 *        const msgBuffer = new TextEncoder().encode(password);
 *        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
 *        const hashArray = Array.from(new Uint8Array(hashBuffer));
 *        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
 *        console.log('Hash:', hashHex);
 *    }
 *    getHash('tuaPasswordQui');
 * 
 * 3. Copia l'hash generato e aggiungilo alla lista VALID_CREDENTIALS
 */

const VALID_CREDENTIALS = [
    {
        username: 'admin',
        passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918' // password: admin
    },
    {
        username: 'tito',
        passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' // password: tito123 (esempio)
    }
    // Aggiungi qui altri utenti se necessario:
    // {
    //     username: 'nuovoutente',
    //     passwordHash: 'hash_generato_con_il_metodo_sopra'
    // }
];

// =============================================
// ESEMPI DI PASSWORD E RELATIVI HASH:
// =============================================
// password: "admin"        → 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
// password: "mystation"    → 5f4dcc3b5aa765d61d8327deb882cf99 (MD5, non SHA-256)
// password: "password123"  → ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
// 
// IMPORTANTE: Usa il metodo JavaScript nella console per generare hash SHA-256 corretti!
// =============================================

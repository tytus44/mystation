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
 * async function getHash(password) {
 * const msgBuffer = new TextEncoder().encode(password);
 * const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
 * const hashArray = Array.from(new Uint8Array(hashBuffer));
 * const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
 * console.log(`Password: "${password}" -> Hash: ${hashHex}`);
 * return hashHex; // Aggiunto return
 * }
 * // Esegui per ogni password che vuoi hashare:
 * await getHash('tuaPasswordQui');
 *
 * 3. Copia l'hash generato e aggiungilo o modificalo nella lista VALID_CREDENTIALS
 */

const VALID_CREDENTIALS = [
    {
        username: 'admin',
        passwordHash: 'af262c414ae86a2842425b90fe706ae9fea336935319747542def461805d4503'
    },
    {
        username: 'user',
        passwordHash: '04f8996da763b7a969b1028ee3007569eaf3a635486ddab211d512c85b9df8fb'
    }
    // Aggiungi qui altri utenti se necessario:
    // {
    //     username: 'nuovoutente',
    //     passwordHash: 'hash_generato_con_il_metodo_sopra'
    // }
];

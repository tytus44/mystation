// =============================================
// FILE: auth.js
// DESCRIZIONE: Gestione autenticazione lato client
// --- MODIFICATO per percorsi relativi corretti (Logout) ---
// =============================================

// Funzione per creare hash SHA-256 di una stringa
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Verifica se l'utente è già autenticato
function checkAuth() {
    const authToken = localStorage.getItem('mystation_auth');
    const authExpiry = localStorage.getItem('mystation_auth_expiry');
    
    if (authToken && authExpiry) {
        const now = new Date().getTime();
        if (now < parseInt(authExpiry)) {
            return true;
        } else {
            logout();
        }
    }
    return false;
}

// Funzione di login
async function login(username, password) {
    try {
        // Hash della password inserita
        const passwordHash = await sha256(password);
        
        // Verifica credenziali
        const user = VALID_CREDENTIALS.find(
            cred => cred.username === username && cred.passwordHash === passwordHash
        );
        
        if (user) {
            // Login riuscito
            const authToken = await sha256(username + Date.now());
            const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 ore
            
            localStorage.setItem('mystation_auth', authToken);
            localStorage.setItem('mystation_auth_expiry', expiryTime.toString());
            localStorage.setItem('mystation_user', username);
            
            return { success: true };
        } else {
            return { success: false, error: 'Nome utente o password non validi' };
        }
    } catch (error) {
        console.error('Errore durante il login:', error);
        return { success: false, error: 'Errore del sistema. Riprova.' };
    }
}

// Funzione di logout
function logout() {
    localStorage.removeItem('mystation_auth');
    localStorage.removeItem('mystation_auth_expiry');
    localStorage.removeItem('mystation_user');
    
    // === INIZIO MODIFICA ===
    // Questa funzione è chiamata da mystation.html (che è in /html/)
    // Deve "salire" di un livello (../) per trovare index.html
    window.location.href = '../index.html'; 
    // === FINE MODIFICA ===
}

// Funzione per proteggere una pagina
function requireAuth() {
    if (!checkAuth()) {
        // === INIZIO MODIFICA ===
        // Questa funzione è chiamata da mystation.html (che è in /html/)
        // Deve "salire" di un livello (../) per trovare index.html
        window.location.href = '../index.html'; 
        // === FINE MODIFICA ===
    }
}

// Funzione per aggiornare le icone Lucide
function refreshLucideIcons() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

// Funzioni per gestire il modale di stato
function showLoginStatusModal(type, text, subtext) {
    const backdrop = document.getElementById('login-status-backdrop');
    const modal = document.getElementById('login-status-modal');
    const icon = document.getElementById('login-status-icon');
    const textEl = document.getElementById('login-status-text');
    const subtextEl = document.getElementById('login-status-subtext');
    const spinner = document.getElementById('login-status-spinner');
    
    if (!backdrop || !modal) return;
    
    // Reset classi
    modal.classList.remove('loading', 'success');
    
    // Applica il tipo
    modal.classList.add(type);
    
    // Aggiorna contenuto
    textEl.textContent = text;
    subtextEl.textContent = subtext;
    
    // Gestisci icona in base al tipo
    if (type === 'success') {
        icon.innerHTML = '<i data-lucide="check"></i>';
        refreshLucideIcons();
    } else {
        icon.innerHTML = '<div class="login-status-spinner"></div>';
    }
    
    // Mostra modale
    backdrop.classList.add('show');
    modal.classList.add('show');
}

function hideLoginStatusModal() {
    const backdrop = document.getElementById('login-status-backdrop');
    const modal = document.getElementById('login-status-modal');
    
    if (backdrop && modal) {
        backdrop.classList.remove('show');
        modal.classList.remove('show');
    }
}

// ==========================================
// EVENT LISTENERS per la pagina di LOGIN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        // Se già autenticato, vai alla dashboard
        if (checkAuth()) {
            
            // Questo script è su index.html (nella root)
            // Deve "entrare" in /html/ per trovare mystation.html
            window.location.href = 'html/mystation.html'; // <-- CORRETTO
            return;
        }

        // Inizializza icone Lucide
        refreshLucideIcons();

        const togglePassword = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('password');
        const usernameInput = document.getElementById('username');
        const errorDiv = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        const loginBtn = document.getElementById('login-btn');
        
        // Toggle visibilità password
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Cambia l'icona
                const icon = togglePassword.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
                    refreshLucideIcons();
                }
            });
        }

        // Gestione submit del form
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            // Validazione client-side
            if (!username || !password) {
                showError('Inserisci nome utente e password');
                return;
            }
            
            // Disabilita il pulsante
            loginBtn.disabled = true;
            
            // Mostra modale "Accesso in corso"
            showLoginStatusModal('loading', 'Accesso in corso', 'Verifica credenziali...');
            
            // Rimuovi eventuali errori precedenti
            usernameInput.classList.remove('error');
            passwordInput.classList.remove('error');
            errorDiv.classList.remove('show');
            
            // Simula un piccolo delay per UX
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Esegui il login
            const result = await login(username, password);
            
            if (result.success) {
                // Login riuscito - mostra modale success
                errorDiv.classList.remove('show');
                showLoginStatusModal('success', 'Accesso riuscito!', 'Reindirizzamento in corso...');
                
                // Reindirizza dopo 1200ms
                setTimeout(() => {
                    // Questo script è su index.html (nella root)
                    // Deve "entrare" in /html/ per trovare mystation.html
                    window.location.href = 'html/mystation.html'; // <-- CORRETTO
                }, 1200);
            } else {
                // Login fallito - nascondi modale e mostra errore
                hideLoginStatusModal();
                showError(result.error);
                
                // Riabilita il pulsante
                loginBtn.disabled = false;
                
                // Scuoti gli input
                usernameInput.classList.add('error');
                passwordInput.classList.add('error');
                
                // Rimuovi la classe error dopo l'animazione
                setTimeout(() => {
                    usernameInput.classList.remove('error');
                    passwordInput.classList.remove('error');
                }, 400);
                
                // Focus sul campo username
                usernameInput.focus();
            }
        });

        // Funzione per mostrare errori
        function showError(message) {
            errorText.textContent = message;
            errorDiv.classList.add('show');
            refreshLucideIcons();
            
            // Nascondi automaticamente dopo 5 secondi
            setTimeout(() => {
                errorDiv.classList.remove('show');
            }, 5000);
        }
    }
});

// Esporta le funzioni per uso globale
if (typeof window !== 'undefined') {
    window.requireAuth = requireAuth;
    window.logout = logout;
    window.checkAuth = checkAuth;
}
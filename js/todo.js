// =============================================
// FILE: todo.js
// DESCRIZIONE: Modulo per la gestione della
//              To-Do List nella sezione Home.
// (MODIFICATO: Etichetta e stile bottone "Aggiungi Oggi")
// =============================================

// === STATO LOCALE DEL MODULO TODO ===
let todoState = {
    todos: [],          // Array delle attività
    editingTodo: null   // Oggetto ToDo in modifica, o null
};

// === INIZIALIZZAZIONE MODULO TODO ===
function initTodoModule() {
    console.log('📝 Inizializzazione modulo ToDo...');
    const app = this; // 'this' si riferisce all'istanza App
    // Carica i todos salvati in localStorage (chiave specifica 'homeTodos')
    todoState.todos = app.loadFromStorage('homeTodos', []);
    console.log(`✅ Modulo ToDo inizializzato con ${todoState.todos.length} attività.`);
}

// === RENDER COMPONENTE TODO LIST ===
function renderTodoComponent(container) {
    console.log('📝 Rendering componente ToDo List...');
    const app = this; // 'this' si riferisce all'istanza App

    // HTML di base della card ToDo
    container.innerHTML = `
        <div class="card-header">
            <h3 class="card-title">To-Do List</h3>
             <button id="add-todo-today-btn" class="btn btn-primary" title="Aggiungi attività per oggi">
                <i data-lucide="plus-circle" class="w-4 h-4 mr-1"></i> Aggiungi Oggi
            </button>
        </div>
        <div class="card-body">
            <div id="todo-list" class="todo-list">
                </div>
        </div>
    `;

    // Renderizza l'elenco delle attività
    renderTodosList.call(app);

    // Aggiungi event listener specifici della ToDo list
    setupTodoListEventListeners.call(app, container);

    // Aggiorna icone
    app.refreshIcons();
}

// === SETUP EVENT LISTENERS TODO LIST ===
function setupTodoListEventListeners(container) {
    const app = this; // 'this' si riferisce all'istanza App
    const todoListElement = container.querySelector('#todo-list');
    const addTodoTodayBtn = container.querySelector('#add-todo-today-btn');

    if (todoListElement) {
        // Event delegation per click su item, checkbox o delete
        todoListElement.addEventListener('click', (e) => {
            const todoItem = e.target.closest('.todo-item');
            if (!todoItem) return; // Click fuori da un item

            const todoId = todoItem.dataset.todoId;
            const target = e.target; // Elemento specifico cliccato

            if (target.matches('input[type="checkbox"]')) {
                // Click sulla checkbox
                toggleTodo.call(app, todoId);
            } else if (target.closest('.delete-btn')) {
                // Click sul bottone delete (o la sua icona)
                deleteTodoConfirmation.call(app, todoId);
            } else {
                // Click sull'area generale dell'item (per modifica)
                const todoToEdit = todoState.todos.find(t => t.id === todoId);
                if (todoToEdit) {
                    showEditTodoModal.call(app, todoToEdit);
                }
            }
        });
    }

     if (addTodoTodayBtn) {
        addTodoTodayBtn.addEventListener('click', () => {
             const today = new Date();
             const year = today.getFullYear();
             const month = String(today.getMonth() + 1).padStart(2, '0');
             const day = String(today.getDate()).padStart(2, '0');
             const todayString = `${year}-${month}-${day}`;
             showAddTodoModal.call(app, todayString);
        });
    }
}

// === RENDER ELENCO ATTIVITÀ ===
function renderTodosList() {
    const app = this; // 'this' si riferisce all'istanza App
    const todoListContainer = document.getElementById('todo-list');
    if (!todoListContainer) return;

    // Ordina per data, poi per importanza (Urgente prima)
    const importanceOrder = { 'urgent': 1, 'priority': 2, 'standard': 3 };
    const sortedTodos = [...todoState.todos].sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        // Se le date sono uguali, ordina per importanza
        return (importanceOrder[a.color || 'standard'] || 3) - (importanceOrder[b.color || 'standard'] || 3);
    });

    if (sortedTodos.length === 0) {
        todoListContainer.innerHTML = `<p class="text-secondary text-sm text-center">Nessuna attività. Clicca un giorno sul calendario per aggiungerne una!</p>`;
    } else {
        todoListContainer.innerHTML = sortedTodos.map(todo => {
            const isCompleted = todo.completed;
            const colorClass = `color-${todo.color || 'standard'}`;
            return `
                <div class="todo-item ${isCompleted ? 'completed' : ''} ${colorClass}" data-todo-id="${todo.id}">
                    <div class="todo-content">
                         <input type="checkbox" ${isCompleted ? 'checked' : ''} aria-label="Completa attività ${todo.text}">
                         <div class="todo-text-details">
                            <span>${todo.text}</span>
                            ${todo.dueDate ? `<div class="text-secondary">Scad.: ${app.formatDate(todo.dueDate)}</div>` : ''}
                         </div>
                    </div>
                    <button class="delete-btn" aria-label="Elimina attività ${todo.text}" title="Elimina">
                        <i data-lucide="x"></i>
                    </button>
                </div>
            `;
        }).join('');
    }
    // Aggiorna icone se necessario (es. icona 'x' nel delete-btn)
    app.refreshIcons();
     // Aggiorna anche la vista calendario per i puntini
    if (typeof updateCalendarView === 'function') {
        updateCalendarView.call(app);
    }
}


// === FUNZIONI MODALE (Aggiungi/Modifica) ===

function showAddTodoModal(dateString) {
    const app = this; // 'this' ora è l'istanza app
    const modalContentEl = document.getElementById('form-modal-content');
    if (!modalContentEl) return;

    modalContentEl.innerHTML = `
        <div class="card-header">
            <h2 class="card-title">Nuova Attività</h2>
        </div>
        <div class="card-body">
            <div class="form-group">
                <label class="form-label" for="todo-text">Descrizione attività</label>
                <input type="text" id="todo-text" class="form-control" style="max-width: 100%;" autocomplete="off" placeholder="Cosa devi fare?">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                    <label class="form-label">Scadenza</label>
                    <input type="text" class="form-control" style="max-width: 150px;" value="${app.formatToItalianDate(dateString)}" readonly>
                    <input type="hidden" id="todo-due-date-iso" value="${dateString}">
                </div>
                <div class="form-group">
                    <label class="form-label">Importanza</label>
                    <div class="color-picker-group">
                        <label class="color-radio standard" title="Standard">
                            <input type="radio" name="todo-color" value="standard" checked>
                            <span class="color-swatch"></span>
                            <span class="color-label">Standard</span>
                        </label>
                        <label class="color-radio priority" title="Priorità">
                            <input type="radio" name="todo-color" value="priority">
                            <span class="color-swatch"></span>
                            <span class="color-label">Priorità</span>
                        </label>
                        <label class="color-radio urgent" title="Urgente">
                            <input type="radio" name="todo-color" value="urgent">
                            <span class="color-swatch"></span>
                            <span class="color-label">Urgente</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="flex justify-end space-x-4 mt-6">
                <button id="cancel-todo-btn-bottom" type="button" class="btn btn-secondary">Annulla</button>
                <button id="save-todo-btn" type="button" class="btn btn-primary">Salva Attività</button>
            </div>
        </div>`;

    modalContentEl.classList.remove('modal-wide'); // Assicura non sia wide
    modalContentEl.classList.add('modal-todo'); // Applica classe specifica se serve
    setupAddTodoModalEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
    // Focus sul campo testo
    const textInput = modalContentEl.querySelector('#todo-text');
    if (textInput) textInput.focus();
}

function showEditTodoModal(todo) {
    const app = this;
    todoState.editingTodo = todo; // Salva l'oggetto todo in modifica
    const modalContentEl = document.getElementById('form-modal-content');
    if (!modalContentEl) return;

    const currentColor = todo.color || 'standard';

    modalContentEl.innerHTML = `
        <div class="card-header">
            <h2 class="card-title">Modifica Attività</h2>
        </div>
        <div class="card-body">
            <div class="form-group">
                <label class="form-label" for="edit-todo-text">Descrizione attività</label>
                <input type="text" id="edit-todo-text" class="form-control" style="max-width: 100%;" value="${todo.text}" autocomplete="off">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                    <label class="form-label" for="edit-todo-due-date-display">Scadenza</label>
                    <input type="text" id="edit-todo-due-date-display" class="form-control" style="max-width: 150px;" value="${app.formatToItalianDate(todo.dueDate)}" placeholder="gg.mm.aaaa" autocomplete="off">
                 </div>
                <div class="form-group">
                    <label class="form-label">Importanza</label>
                    <div class="color-picker-group">
                        <label class="color-radio standard" title="Standard">
                            <input type="radio" name="todo-color" value="standard" ${currentColor === 'standard' ? 'checked' : ''}>
                            <span class="color-swatch"></span>
                             <span class="color-label">Standard</span>
                        </label>
                        <label class="color-radio priority" title="Priorità">
                            <input type="radio" name="todo-color" value="priority" ${currentColor === 'priority' ? 'checked' : ''}>
                             <span class="color-swatch"></span>
                             <span class="color-label">Priorità</span>
                        </label>
                        <label class="color-radio urgent" title="Urgente">
                            <input type="radio" name="todo-color" value="urgent" ${currentColor === 'urgent' ? 'checked' : ''}>
                            <span class="color-swatch"></span>
                             <span class="color-label">Urgente</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="flex justify-end space-x-4 mt-6">
                <button id="cancel-edit-todo-btn-bottom" type="button" class="btn btn-secondary">Annulla</button>
                <button id="update-todo-btn" type="button" class="btn btn-primary">Aggiorna Attività</button>
            </div>
        </div>`;

    modalContentEl.classList.remove('modal-wide');
    modalContentEl.classList.add('modal-todo');
    setupEditTodoModalEventListeners.call(app);
    app.refreshIcons();
    app.showFormModal();
     // Focus sul campo testo
    const textInput = modalContentEl.querySelector('#edit-todo-text');
    if (textInput) textInput.focus();
}

function setupAddTodoModalEventListeners() {
    const app = this;
    const saveBtn = document.getElementById('save-todo-btn');
    const cancelBtn = document.getElementById('cancel-todo-btn-bottom');

    if (saveBtn) {
        saveBtn.addEventListener('click', () => saveTodo.call(app));
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => app.hideFormModal());
    }
     // Optional: Enter key in text input saves
     const textInput = document.getElementById('todo-text');
     if (textInput) {
         textInput.addEventListener('keydown', (e) => {
             if (e.key === 'Enter') {
                 e.preventDefault();
                 saveTodo.call(app);
             }
         });
     }
}

function setupEditTodoModalEventListeners() {
    const app = this;
    const updateBtn = document.getElementById('update-todo-btn');
    const cancelBtn = document.getElementById('cancel-edit-todo-btn-bottom');

    if (updateBtn) {
        updateBtn.addEventListener('click', () => updateTodo.call(app));
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            todoState.editingTodo = null; // Resetta editing state
            app.hideFormModal();
        });
    }
     // Optional: Enter key in text input saves
     const textInput = document.getElementById('edit-todo-text');
     if (textInput) {
         textInput.addEventListener('keydown', (e) => {
             if (e.key === 'Enter') {
                 e.preventDefault();
                 updateTodo.call(app);
             }
         });
     }
     // Optional: Enter key in date input saves
     const dateInput = document.getElementById('edit-todo-due-date-display');
     if (dateInput) {
         dateInput.addEventListener('keydown', (e) => {
             if (e.key === 'Enter') {
                 e.preventDefault();
                 updateTodo.call(app);
             }
         });
     }
}

// === FUNZIONI CRUD TODO ===

function saveTodo() {
    const app = this;
    const textInput = document.getElementById('todo-text');
    const dueDateInput = document.getElementById('todo-due-date-iso');
    const colorInput = document.querySelector('input[name="todo-color"]:checked');

    if (!textInput || !dueDateInput || !colorInput) {
         console.error("Elementi del form ToDo non trovati.");
         return app.showNotification('Errore nel salvataggio.', 'error');
    }

    const text = textInput.value.trim();
    const dueDate = dueDateInput.value; // Formato YYYY-MM-DD
    const color = colorInput.value;

    if (!text) return app.showNotification('La descrizione è obbligatoria.', 'warning');
    // Non serve validare dueDate perché viene dal calendario
    if (todoState.todos.length >= 10) { // Limite attività (esempio)
        app.showNotification('Puoi aggiungere un massimo di 10 attività.', 'warning');
        app.hideFormModal();
        return;
    }

    const newTodo = {
        id: app.generateUniqueId('todo'),
        text,
        dueDate,
        completed: false,
        color: color
    };

    todoState.todos.push(newTodo);
    app.saveToStorage('homeTodos', todoState.todos); // Salva nello storage
    app.hideFormModal();
    renderTodosList.call(app); // Aggiorna la lista
    // Non serve aggiornare il calendario qui, renderTodosList lo fa
}

function updateTodo() {
    const app = this;
    if (!todoState.editingTodo) return; // Sicurezza

    const textInput = document.getElementById('edit-todo-text');
    const dateDisplayInput = document.getElementById('edit-todo-due-date-display');
    const colorInput = document.querySelector('input[name="todo-color"]:checked');

     if (!textInput || !dateDisplayInput || !colorInput) {
         console.error("Elementi del form modifica ToDo non trovati.");
         return app.showNotification('Errore nell\'aggiornamento.', 'error');
    }

    const text = textInput.value.trim();
    const dateString = dateDisplayInput.value.trim(); // Formato gg.mm.aaaa
    const color = colorInput.value;

    if (!text) return app.showNotification('La descrizione è obbligatoria.', 'warning');
    if (!app.validateItalianDate(dateString)) return app.showNotification('Formato data non valido (gg.mm.aaaa).', 'warning');

    const dueDate = app.parseItalianDate(dateString).toISOString().split('T')[0]; // Converti in YYYY-MM-DD
    const todoId = todoState.editingTodo.id;

    // Aggiorna l'array
    todoState.todos = todoState.todos.map(todo =>
        todo.id === todoId ? { ...todo, text, dueDate, color } : todo
    );

    app.saveToStorage('homeTodos', todoState.todos);
    app.hideFormModal();
    todoState.editingTodo = null; // Resetta stato modifica
    renderTodosList.call(app); // Aggiorna lista
}

function toggleTodo(todoId) {
    const app = this;
    let todoUpdated = false;
    todoState.todos = todoState.todos.map(todo => {
        if (todo.id === todoId) {
            todoUpdated = true;
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });

    if (todoUpdated) {
        app.saveToStorage('homeTodos', todoState.todos);
        renderTodosList.call(app); // Aggiorna lista UI e puntini calendario
    }
}

function deleteTodoConfirmation(todoId) {
    const app = this;
    const todo = todoState.todos.find(t => t.id === todoId);
    if (!todo) return;

    app.showConfirm(
        `Sei sicuro di voler eliminare l'attività?<br>"${todo.text}"?`,
        () => { // Funzione da eseguire se l'utente conferma
            todoState.todos = todoState.todos.filter(t => t.id !== todoId);
            app.saveToStorage('homeTodos', todoState.todos);
            renderTodosList.call(app); // Aggiorna lista UI e puntini calendario
            app.showNotification("Attività eliminata.");
        }
    );
}

// === ESPORTAZIONE FUNZIONI PRINCIPALI ===
if (typeof window !== 'undefined') {
    window.initTodoModule = initTodoModule;
    window.renderTodoComponent = renderTodoComponent;
    window.renderTodosList = renderTodosList; // Esponi per aggiornamenti esterni se necessario
    // Rendi disponibili globalmente le funzioni per aprire i modali
    window.showAddTodoModal = showAddTodoModal;
    window.showEditTodoModal = showEditTodoModal;
}
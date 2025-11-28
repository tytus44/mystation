/* INIZIO MODULO AGENDA (TASK MANAGER) */
window.AgendaModule = {
    editingId: null,
    isInitialized: false,

    init: function() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        console.log("--> AgendaModule: Esecuzione init()...");
        this.updateBadge();
        
        const btnAgenda = document.getElementById('btn-agenda');
        if (btnAgenda) {
            btnAgenda.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openMainModal();
            };
        }

        // Listener globale per chiusura Datepicker
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.datepicker-container')) {
                const w = document.getElementById('custom-datepicker-agenda');
                if (w && w.classList.contains('show')) w.classList.remove('show');
            }
        });
    },

    getTasks: function() {
        try { return JSON.parse(localStorage.getItem('polaris_agenda') || '[]'); } 
        catch (e) { return []; }
    },

    saveTasks: function(tasks) {
        localStorage.setItem('polaris_agenda', JSON.stringify(tasks));
        this.updateBadge();
        this.renderSplitView(); 
    },

    updateBadge: function() {
        const btn = document.getElementById('btn-agenda');
        if (!btn) return;

        const existingBadge = btn.querySelector('.notification-badge');
        if (existingBadge) existingBadge.remove();

        const tasks = this.getTasks();
        const todayStr = new Date().toISOString().split('T')[0];
        const count = tasks.filter(t => !t.completed && (t.date.split('T')[0] <= todayStr)).length;

        if (count > 0) {
            const badge = document.createElement('div');
            badge.className = 'notification-badge';
            btn.appendChild(badge);
        }
    },

    // --- NUOVA APERTURA MODALE (SPLIT VIEW) ---
    openMainModal: function() {
        this.editingId = null; 

        const bodyHTML = `
            <div class="agenda-container">
                <div class="agenda-list" id="agenda-list-container">
                    </div>

                <div class="agenda-form">
                    <h4 style="margin-bottom: 20px; font-size: 1rem; color: var(--text-main); font-weight: 700;" id="form-title">
                        <i data-lucide="plus-circle" style="width: 16px; margin-right: 5px; vertical-align: text-bottom;"></i>
                        Nuovo Task
                    </h4>
                    
                    <div style="margin-bottom: 15px;">
                        <label>Descrizione</label>
                        <input type="text" id="inp-task-desc" class="form-input" placeholder="Es. Bonifico..." >
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label>Scadenza</label>
                        <div class="datepicker-container" style="position: relative;">
                            <input type="date" id="inp-task-date" class="form-input no-icon" style="position:absolute; opacity:0; pointer-events:none;">
                            <button type="button" class="dropdown-trigger" onclick="window.AgendaModule.toggleDatepicker(event)">
                                <span id="date-display-agenda">--</span>
                                <i data-lucide="calendar" style="width:16px;"></i>
                            </button>
                            <div id="custom-datepicker-agenda" class="datepicker-wrapper"></div>
                        </div>
                    </div>

                    <div style="margin-top: auto;">
                        <button id="btn-save-task" class="action-btn btn-save" style="width: 100%; justify-content: center;">
                            SALVA
                        </button>
                        <button id="btn-cancel-edit" class="action-btn btn-secondary" style="width: 100%; margin-top: 10px; display: none; justify-content: center;">
                            ANNULLA MODIFICA
                        </button>
                    </div>
                </div>
            </div>
        `;

        const footerHTML = `
            <div class="btn-group">
                <button class="action-btn" onclick="window.closeModal()">CHIUDI</button>
            </div>
        `;

        window.openModal('Agenda & Task', bodyHTML, footerHTML, '800px');
        
        // Setup iniziale
        setTimeout(() => {
            this.resetForm(); 
            this.renderSplitView(); 
            
            document.getElementById('btn-save-task').onclick = () => this.saveTask();
            document.getElementById('btn-cancel-edit').onclick = () => this.resetForm();
        }, 50);
    },

    renderSplitView: function() {
        const container = document.getElementById('agenda-list-container');
        if(!container) return;

        const tasks = this.getTasks();
        
        tasks.sort((a, b) => {
            if (a.completed === b.completed) return new Date(a.date) - new Date(b.date);
            return a.completed ? 1 : -1;
        });

        const todayStr = new Date().toISOString().split('T')[0];

        if (tasks.length === 0) {
            container.innerHTML = `<div class="agenda-empty"><i data-lucide="clipboard-list" style="width: 48px; height: 48px; margin-bottom: 10px; opacity: 0.5;"></i><p>Nessun task in programma.</p></div>`;
            lucide.createIcons();
            return;
        }

        container.innerHTML = tasks.map(t => {
            const tDate = t.date.split('T')[0];
            const isToday = tDate === todayStr;
            const isLate = !t.completed && tDate < todayStr;
            
            let dateDisplay = new Date(t.date).toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: '2-digit' });
            dateDisplay = dateDisplay.charAt(0).toUpperCase() + dateDisplay.slice(1);
            
            let statusColor = 'var(--text-secondary)';
            if (t.completed) statusColor = 'var(--col-positive)';
            else if (isToday) statusColor = 'var(--primary-color)';
            else if (isLate) statusColor = 'var(--col-destructive)';

            const textStyle = t.completed ? 'text-decoration: line-through; opacity: 0.6;' : '';
            const cardBg = this.editingId === t.id ? 'var(--primary-light-bg)' : (t.completed ? 'rgba(0,0,0,0.02)' : 'transparent');
            const borderColor = this.editingId === t.id ? 'var(--primary-color)' : 'var(--border-color)';

            return `
                <div style="padding: 12px; border: 1px solid ${borderColor}; border-radius: 12px; margin-bottom: 10px; background-color: ${cardBg}; transition: all 0.2s;">
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        
                        <button class="icon-btn" onclick="window.AgendaModule.toggleComplete('${t.id}')" style="margin-top: 2px; width: 32px; height: 32px; flex-shrink: 0; ${t.completed ? 'background-color: var(--col-positive); color: white; border-color: var(--col-positive);' : ''}">
                            <i data-lucide="check" style="width: 16px;"></i>
                        </button>
                        
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-main); margin-bottom: 4px; ${textStyle}">${t.desc}</div>
                            
                            <div style="font-size: 0.85rem; color: ${statusColor}; font-weight: 500; display: flex; align-items: center; gap: 5px;">
                                <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                                <span>${dateDisplay}</span>
                                ${isLate ? '<span style="color:var(--col-destructive); font-weight:700; margin-left: 5px;">(SCADUTO)</span>' : ''} 
                                ${isToday ? '<span style="margin-left: 5px;">(Oggi)</span>' : ''}
                            </div>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <button class="icon-btn icon-btn-sm btn-edit" onclick="window.AgendaModule.loadForEdit('${t.id}')" title="Modifica">
                                <i data-lucide="pencil" style="width: 14px;"></i>
                            </button>
                            <button class="icon-btn icon-btn-sm btn-delete" onclick="window.AgendaModule.deleteTask('${t.id}')" title="Elimina">
                                <i data-lucide="trash-2" style="width: 14px;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        lucide.createIcons();
    },

    resetForm: function() {
        this.editingId = null;
        document.getElementById('form-title').innerHTML = `<i data-lucide="plus-circle" style="width: 16px; margin-right: 5px; vertical-align: text-bottom;"></i> Nuovo Task`;
        document.getElementById('inp-task-desc').value = '';
        document.getElementById('btn-save-task').innerText = 'SALVA';
        document.getElementById('btn-cancel-edit').style.display = 'none';

        const today = new Date().toISOString().split('T')[0];
        this.setFormDate(today);

        lucide.createIcons();
        this.renderSplitView(); 
    },

    loadForEdit: function(id) {
        const task = this.getTasks().find(t => t.id === id);
        if(!task) return;

        this.editingId = id;
        document.getElementById('form-title').innerHTML = `<i data-lucide="pencil" style="width: 16px; margin-right: 5px; vertical-align: text-bottom;"></i> Modifica Task`;
        document.getElementById('inp-task-desc').value = task.desc;
        this.setFormDate(task.date.split('T')[0]);
        
        document.getElementById('btn-save-task').innerText = 'AGGIORNA';
        document.getElementById('btn-cancel-edit').style.display = 'flex';
        
        lucide.createIcons();
        this.renderSplitView(); 
    },

    saveTask: function() {
        const desc = document.getElementById('inp-task-desc').value.trim();
        const date = document.getElementById('inp-task-date').value;

        if (!desc) {
            window.showNotification("Inserisci una descrizione", 'error');
            return;
        }

        let tasks = this.getTasks();

        if (this.editingId) {
            const idx = tasks.findIndex(t => t.id === this.editingId);
            if (idx !== -1) {
                tasks[idx].desc = desc;
                tasks[idx].date = new Date(date).toISOString();
            }
        } else {
            tasks.push({
                id: Date.now().toString(),
                desc: desc,
                date: new Date(date).toISOString(),
                completed: false
            });
        }

        this.saveTasks(tasks);
        window.showNotification(this.editingId ? "Task aggiornato" : "Task aggiunto", 'success');
        this.resetForm();
    },

    toggleComplete: function(id) {
        let tasks = this.getTasks();
        const idx = tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
            tasks[idx].completed = !tasks[idx].completed;
            this.saveTasks(tasks);
        }
    },

    deleteTask: function(id) {
        const bodyHTML = `
            <div style="text-align:center; padding:10px;">
                <i data-lucide="trash-2" style="width:48px; height:48px; color:var(--col-destructive); margin-bottom:10px;"></i>
                <p style="font-weight:600; color:var(--text-main);">Eliminare questo task?</p>
                <p style="font-size:0.9rem; color:var(--text-secondary);">L'azione è irreversibile.</p>
            </div>
        `;

        const footerHTML = `
            <div class="btn-group">
                <button id="btn-cancel-del" class="action-btn btn-cancel">ANNULLA</button>
                <button id="btn-confirm-del" class="action-btn btn-delete">ELIMINA</button>
            </div>
        `;

        window.openModal('Conferma Eliminazione', bodyHTML, footerHTML, '400px');

        setTimeout(() => {
            document.getElementById('btn-cancel-del').onclick = () => this.openMainModal();
            document.getElementById('btn-confirm-del').onclick = () => {
                let tasks = this.getTasks().filter(t => t.id !== id);
                localStorage.setItem('polaris_agenda', JSON.stringify(tasks));
                this.updateBadge();
                if (this.editingId === id) this.editingId = null;
                window.showNotification("Task eliminato", 'info');
                this.openMainModal();
            };
        }, 50);
    },

    setFormDate: function(isoDate) {
        document.getElementById('inp-task-date').value = isoDate;
        document.getElementById('date-display-agenda').innerText = this.formatDateIT(isoDate);
    },

    toggleDatepicker: function(e) {
        e.stopPropagation();
        const w = document.getElementById('custom-datepicker-agenda');
        if (w.classList.contains('show')) {
            w.classList.remove('show');
            return;
        }
        document.querySelectorAll('.show').forEach(el => el.classList.remove('show'));
        w.classList.add('show');
        const curDate = new Date(document.getElementById('inp-task-date').value);
        this.renderCalendar(curDate.getFullYear(), curDate.getMonth());
    },

    renderCalendar: function(y, m) {
        const w = document.getElementById('custom-datepicker-agenda');
        const ms = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
        const ds = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
        const fd = new Date(y, m, 1).getDay();
        const afd = fd === 0 ? 6 : fd - 1;
        const dim = new Date(y, m+1, 0).getDate();
        
        let html = `
            <div class="datepicker-header">
                <button type="button" class="datepicker-nav" onclick="window.AgendaModule.changeMonth(${m-1}, ${y}); event.stopPropagation();"><i data-lucide="chevron-left" style="width:16px;"></i></button>
                <div class="datepicker-title">${ms[m]} ${y}</div>
                <button type="button" class="datepicker-nav" onclick="window.AgendaModule.changeMonth(${m+1}, ${y}); event.stopPropagation();"><i data-lucide="chevron-right" style="width:16px;"></i></button>
            </div>
            <div class="datepicker-grid">
                ${ds.map(d=>`<div class="datepicker-day-label">${d}</div>`).join('')}
        `;
        
        for(let i=0; i<afd; i++) html+=`<div class="datepicker-day empty"></div>`;
        
        const sd = new Date(document.getElementById('inp-task-date').value);
        const today = new Date();
        
        for(let i=1; i<=dim; i++) {
            let cls = 'datepicker-day';
            if(i===today.getDate() && m===today.getMonth() && y===today.getFullYear()) cls+=' today';
            if(i===sd.getDate() && m===sd.getMonth() && y===sd.getFullYear()) cls+=' selected';
            html+=`<div class="${cls}" onclick="window.AgendaModule.selectDate(${y},${m},${i}); event.stopPropagation();">${i}</div>`;
        }
        
        html+='</div>';
        w.innerHTML = html;
        lucide.createIcons();
    },

    changeMonth: function(m, y) {
        if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; }
        this.renderCalendar(y, m);
    },

    selectDate: function(y, m, d) {
        const fmt=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        this.setFormDate(fmt);
        document.getElementById('custom-datepicker-agenda').classList.remove('show');
    },

    formatDateIT: function(iso) {
        if(!iso) return '';
        const d=new Date(iso);
        return d.toLocaleDateString('it-IT',{day:'2-digit',month:'long',year:'numeric'});
    }
};
/* FINE MODULO AGENDA */
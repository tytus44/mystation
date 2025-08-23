/**
 * CALENDARIO.JS
 * Gestione completa della sezione calendario con festività italiane
 * e supporto per eventi multi-giorno.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Riferimenti DOM
    const calendarGrid = document.getElementById('calendar-grid');
    const calendarTitle = document.getElementById('calendar-title');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const todayBtn = document.getElementById('today-btn');
    const newAppointmentBtn = document.getElementById('new-appointment-btn-toolbar');
    const appointmentsTabs = document.getElementById('appointments-tabs');
    const appointmentsList = document.getElementById('appointments-list');
    const selectedDateTitle = document.getElementById('selected-date-title');
    const selectedDateSubtitle = document.getElementById('selected-date-subtitle');
    
    // Modali
    const newAppointmentModal = document.getElementById('new-appointment-modal');
    const editAppointmentModal = document.getElementById('edit-appointment-modal');
    const saveAppointmentBtn = document.getElementById('save-appointment-btn');
    const saveEditAppointmentBtn = document.getElementById('save-edit-appointment-btn');
    const deleteAppointmentBtn = document.getElementById('delete-appointment-btn');
    const appointmentAllDay = document.getElementById('appointment-all-day');
    const editAppointmentAllDay = document.getElementById('edit-appointment-all-day');
    const cancelAppointmentBtn = document.getElementById('cancel-appointment-btn');
    const cancelEditAppointmentBtn = document.getElementById('cancel-edit-appointment-btn');
    
    // Pulsanti Toolbar
    const importCalendarBtn = document.getElementById('import-calendar-btn');
    const exportCalendarBtn = document.getElementById('export-calendar-btn');
    const printCalendarBtn = document.getElementById('print-calendar-btn');
    const deleteAllCalendarBtn = document.getElementById('delete-all-calendar-btn');

    // Variabili globali
    let currentDate = new Date();
    let selectedDate = new Date();
    let allAppointments = [];
    let currentView = 'day';
    let editingAppointmentId = null;

    const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const WEEKDAYS_FULL = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
    const ITALIAN_HOLIDAYS = { '1/1': 'Capodanno', '6/1': 'Epifania', '25/4': 'Festa della Liberazione', '1/5': 'Festa del Lavoro', '2/6': 'Festa della Repubblica', '15/8': 'Ferragosto', '1/11': 'Ognissanti', '8/12': 'Immacolata Concezione', '25/12': 'Natale', '26/12': 'Santo Stefano' };

    function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
    function formatDateISO(date) { return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`; }
    function formatDateItalian(date) { return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`; }
    function parseItalianDate(dateStr) { const parts = dateStr.split('/'); return parts.length !== 3 ? null : new Date(parts[2], parts[1] - 1, parts[0]); }
    function parseISODate(dateStr) { const date = new Date(dateStr); return new Date(date.getTime() + date.getTimezoneOffset() * 60000); }
    function isHoliday(date) { return ITALIAN_HOLIDAYS[`${date.getDate()}/${date.getMonth() + 1}`] || null; }
    function isSameDay(d1, d2) { return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate(); }
    
    function saveAppointments() { window.MemoriaStorage?.saveAppointments(allAppointments); }
    function loadAppointments() { allAppointments = window.MemoriaStorage?.loadAppointments() || []; }

    function generateCalendar() {
        calendarTitle.textContent = `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        calendarGrid.innerHTML = '';
        WEEKDAYS_FULL.forEach(w => { const h = document.createElement('div'); h.className = 'calendar-header'; h.textContent = w.substring(0, 3); calendarGrid.appendChild(h); });
        const year = currentDate.getFullYear(), month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0);
        const start = new Date(firstDay); start.setDate(start.getDate() - (start.getDay() + 6) % 7);
        const end = new Date(lastDay); if ((end.getDay() + 6) % 7 < 6) { end.setDate(end.getDate() + (6 - (end.getDay() + 6) % 7)); }
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) { createCalendarDay(new Date(d), d.getMonth() !== month); }
    }

    function createCalendarDay(date, isOtherMonth) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        if (isOtherMonth) dayEl.classList.add('other-month');
        if (isSameDay(date, new Date())) dayEl.classList.add('today');
        if (isHoliday(date) && !isOtherMonth) dayEl.classList.add('holiday');
        if (isSameDay(date, selectedDate)) dayEl.classList.add('selected');
        dayEl.innerHTML = `<div class="calendar-day-number">${date.getDate()}</div><div class="appointment-dots"></div>`;
        const dotsContainer = dayEl.querySelector('.appointment-dots');
        const dayAppointments = allAppointments.filter(apt => date >= parseISODate(apt.startDate) && date <= parseISODate(apt.endDate));
        if (dayAppointments.length > 0) {
            dotsContainer.innerHTML += `<div class="appointment-dot"></div>`;
            if (dayAppointments.some(apt => apt.isAllDay)) dayEl.classList.add('multiday-event-bg');
        }
        dayEl.addEventListener('click', () => { selectedDate = new Date(date); currentDate = new Date(date); generateCalendar(); updateSelectedDateInfo(); updateAppointmentsList(); });
        calendarGrid.appendChild(dayEl);
    }

    function updateSelectedDateInfo() {
        if (currentView === 'all') { selectedDateTitle.textContent = 'Tutti gli Appuntamenti'; selectedDateSubtitle.textContent = `${allAppointments.length} appuntamenti totali`; } 
        else if (currentView === 'day') { selectedDateTitle.textContent = formatDateItalian(selectedDate); selectedDateSubtitle.textContent = isHoliday(selectedDate) || WEEKDAYS_FULL[(selectedDate.getDay() + 6) % 7]; } 
        else if (currentView === 'week') { const startOfWeek = new Date(selectedDate); startOfWeek.setDate(selectedDate.getDate() - (selectedDate.getDay() + 6) % 7); const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6); selectedDateTitle.textContent = `Settimana del ${formatDateItalian(startOfWeek)}`; selectedDateSubtitle.textContent = `dal ${formatDateItalian(startOfWeek)} al ${formatDateItalian(endOfWeek)}`; } 
        else if (currentView === 'month') { selectedDateTitle.textContent = `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`; const monthAppointments = allAppointments.filter(apt => parseISODate(apt.startDate).getMonth() === selectedDate.getMonth() && parseISODate(apt.startDate).getFullYear() === selectedDate.getFullYear()); selectedDateSubtitle.textContent = `${monthAppointments.length} appuntamenti nel mese`; }
    }

    function updateAppointmentsList() {
        appointmentsList.innerHTML = ''; let filtered = [];
        if (currentView === 'day') { filtered = allAppointments.filter(apt => selectedDate >= parseISODate(apt.startDate) && selectedDate <= parseISODate(apt.endDate)); } 
        else if (currentView === 'week') { const startOfWeek = new Date(selectedDate); startOfWeek.setDate(selectedDate.getDate() - (selectedDate.getDay() + 6) % 7); startOfWeek.setHours(0, 0, 0, 0); const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6); endOfWeek.setHours(23, 59, 59, 999); filtered = allAppointments.filter(apt => parseISODate(apt.startDate) <= endOfWeek && parseISODate(apt.endDate) >= startOfWeek); } 
        else if (currentView === 'month') { const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1); const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0); endOfMonth.setHours(23, 59, 59, 999); filtered = allAppointments.filter(apt => parseISODate(apt.startDate) <= endOfMonth && parseISODate(apt.endDate) >= startOfMonth); } 
        else { filtered = [...allAppointments]; }
        if (filtered.length === 0) { appointmentsList.innerHTML = `<div class="no-appointments">Nessun appuntamento trovato</div>`; return; }
        filtered.sort((a,b) => parseISODate(a.startDate) - parseISODate(b.startDate) || (a.startTime || '00:00').localeCompare(b.startTime || '00:00')).forEach(apt => {
            const item = document.createElement('div'); item.className = 'appointment-item'; const start = parseISODate(apt.startDate), end = parseISODate(apt.endDate);
            let dateDisplay = apt.isAllDay ? (isSameDay(start, end) ? `${formatDateItalian(start)} (Tutto il giorno)` : `${formatDateItalian(start)} - ${formatDateItalian(end)}`) : `${formatDateItalian(start)}, ${apt.startTime} - ${apt.endTime}`;
            item.innerHTML = `<div class="appointment-time">${dateDisplay}</div><div class="appointment-title">${apt.title}</div>${apt.description ? `<div class="appointment-description">${apt.description}</div>` : ''}`;
            item.addEventListener('click', () => openEditAppointmentModal(apt.id)); appointmentsList.appendChild(item);
        });
    }

    function openNewAppointmentModal() {
        newAppointmentModal.style.display = 'flex';
        const form = newAppointmentModal.querySelector('form'); if(form) form.reset();
        const fDate = formatDateItalian(selectedDate);
        document.getElementById('appointment-start-date').value = fDate; document.getElementById('appointment-end-date').value = fDate; document.getElementById('appointment-start-hour').value = '09'; document.getElementById('appointment-start-minute').value = '00'; document.getElementById('appointment-end-hour').value = '10'; document.getElementById('appointment-end-minute').value = '00';
        appointmentAllDay.dispatchEvent(new Event('change'));
    }

    function openEditAppointmentModal(id) {
        const apt = allAppointments.find(a => a.id === id); if (!apt) return; editingAppointmentId = id; editAppointmentModal.style.display = 'flex';
        document.getElementById('edit-appointment-title').value = apt.title; document.getElementById('edit-appointment-start-date').value = formatDateItalian(parseISODate(apt.startDate)); document.getElementById('edit-appointment-end-date').value = formatDateItalian(parseISODate(apt.endDate));
        editAppointmentAllDay.checked = apt.isAllDay; editAppointmentAllDay.dispatchEvent(new Event('change'));
        if (!apt.isAllDay) {
            const [startH, startM] = apt.startTime.split(':'); const [endH, endM] = apt.endTime.split(':');
            document.getElementById('edit-appointment-start-hour').value = startH; document.getElementById('edit-appointment-start-minute').value = startM; document.getElementById('edit-appointment-end-hour').value = endH; document.getElementById('edit-appointment-end-minute').value = endM;
        } else { document.getElementById('edit-appointment-start-hour').value = ''; document.getElementById('edit-appointment-start-minute').value = ''; document.getElementById('edit-appointment-end-hour').value = ''; document.getElementById('edit-appointment-end-minute').value = ''; }
        document.getElementById('edit-appointment-description').value = apt.description || '';
        const recurrenceRadio = editAppointmentModal.querySelector(`input[name="edit-appointment-recurrence"][value="${apt.recurrence || 'none'}"]`); if (recurrenceRadio) recurrenceRadio.checked = true;
    }

    function closeModal(modal) { modal.style.display = 'none'; editingAppointmentId = null; }

    function saveAppointment(isEditing) {
        const modal = isEditing ? editAppointmentModal : newAppointmentModal;
        const modalPrefix = isEditing ? 'edit-' : '';
        const title = document.getElementById(`${modalPrefix}appointment-title`).value.trim();
        const startDate = parseItalianDate(document.getElementById(`${modalPrefix}appointment-start-date`).value.trim());
        const endDate = parseItalianDate(document.getElementById(`${modalPrefix}appointment-end-date`).value.trim());
        const isAllDay = document.getElementById(`${modalPrefix}appointment-all-day`).checked;
        const startHour = document.getElementById(`${modalPrefix}appointment-start-hour`).value.padStart(2, '0');
        const startMinute = document.getElementById(`${modalPrefix}appointment-start-minute`).value.padStart(2, '0');
        const endHour = document.getElementById(`${modalPrefix}appointment-end-hour`).value.padStart(2, '0');
        const endMinute = document.getElementById(`${modalPrefix}appointment-end-minute`).value.padStart(2, '0');
        const description = document.getElementById(`${modalPrefix}appointment-description`).value.trim();
        const recurrence = modal.querySelector(`input[name="${modalPrefix}appointment-recurrence"]:checked`).value;

        if (!title || !startDate || !endDate) return showAlert('Titolo e date sono obbligatori.', 'danger');
        if (endDate < startDate) return showAlert('La data di fine non può precedere quella di inizio.', 'danger');
        if (!isAllDay && isSameDay(startDate, endDate) && `${startHour}:${startMinute}` >= `${endHour}:${endMinute}`) return showAlert('L\'orario di fine deve essere successivo a quello di inizio.', 'danger');

        if (isEditing) { // Logica di modifica semplificata (modifica solo questo evento)
            const aptIndex = allAppointments.findIndex(a => a.id === editingAppointmentId); if (aptIndex === -1) return;
            allAppointments[aptIndex] = { ...allAppointments[aptIndex], title, description, isAllDay, startDate: formatDateISO(startDate), endDate: formatDateISO(endDate), startTime: isAllDay ? null : `${startHour}:${startMinute}`, endTime: isAllDay ? null : `${endHour}:${endMinute}`, recurrence, updatedAt: new Date().toISOString() };
        } else { // Logica di creazione con ricorrenza
            const appointmentsToSave = [];
            const firstAppointmentId = generateId();
            const duration = endDate.getTime() - startDate.getTime();
            
            const baseAppointment = { id: firstAppointmentId, title, description, isAllDay, startDate: formatDateISO(startDate), endDate: formatDateISO(endDate), startTime: isAllDay ? null : `${startHour}:${startMinute}`, endTime: isAllDay ? null : `${endHour}:${endMinute}`, recurrence, createdAt: new Date().toISOString() };
            if (recurrence !== 'none') baseAppointment.recurrenceId = firstAppointmentId;
            appointmentsToSave.push(baseAppointment);

            if (recurrence !== 'none') {
                let loopDate = new Date(startDate);
                const finalDate = new Date(startDate); finalDate.setFullYear(startDate.getFullYear() + 2);
                while (true) {
                    if (recurrence === 'daily') loopDate.setDate(loopDate.getDate() + 1);
                    else if (recurrence === 'weekly') loopDate.setDate(loopDate.getDate() + 7);
                    else if (recurrence === 'monthly') loopDate.setMonth(loopDate.getMonth() + 1);
                    else if (recurrence === 'yearly') loopDate.setFullYear(loopDate.getFullYear() + 1);
                    if (loopDate > finalDate) break;
                    const nextEndDate = new Date(loopDate.getTime() + duration);
                    const recurringAppointment = { ...baseAppointment, id: generateId(), startDate: formatDateISO(loopDate), endDate: formatDateISO(nextEndDate) };
                    appointmentsToSave.push(recurringAppointment);
                }
            }
            allAppointments.push(...appointmentsToSave);
        }
        saveAppointments(); refreshUI(); closeModal(modal); showAlert(`Appuntamento ${isEditing ? 'aggiornato' : 'salvato'}.`, 'success');
    }
    
    function deleteAppointment() { if (!editingAppointmentId || !confirm('Eliminare questo appuntamento?')) return; allAppointments = allAppointments.filter(apt => apt.id !== editingAppointmentId); saveAppointments(); refreshUI(); closeModal(editAppointmentModal); showAlert('Appuntamento eliminato.', 'success'); }
    function deleteAllCalendar() { if (allAppointments.length === 0 || !confirm(`Eliminare TUTTI i ${allAppointments.length} appuntamenti?`)) return; allAppointments = []; saveAppointments(); refreshUI(); showAlert('Calendario eliminato.', 'success'); }
    function exportAppointments() { if (allAppointments.length === 0) return showAlert('Nessun appuntamento da esportare.', 'info'); const dataStr = JSON.stringify(allAppointments, null, 2); const dataBlob = new Blob([dataStr], {type: 'application/json'}); const url = URL.createObjectURL(dataBlob); const link = document.createElement('a'); link.href = url; link.download = `calendario_${formatDateISO(new Date())}.json`; link.click(); URL.revokeObjectURL(url); }
    function importAppointments() { const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'; input.onchange = e => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = event => { try { const imported = JSON.parse(event.target.result); if (!Array.isArray(imported)) throw new Error('Formato non valido'); allAppointments.push(...imported); saveAppointments(); refreshUI(); showAlert(`${imported.length} appuntamenti importati.`, 'success'); } catch (error) { showAlert('Errore nell\'importazione del file.', 'danger'); } }; reader.readAsText(file); }; input.click(); }
    
    function printCurrentView() {
        const calendarGridHTML = document.getElementById('calendar-grid').innerHTML; const appointmentsListHTML = document.getElementById('appointments-list').innerHTML; const calendarTitleText = document.getElementById('calendar-title').textContent;
        const printStyles = `<style>@media print{@page{size:A4;margin:20mm;}body{font-family:sans-serif;color:#000;}h1,h2,h3{color:#000;margin-bottom:0.5em;} .print-container{width:100%;} .calendar-section,.appointments-section{page-break-inside:avoid;margin-bottom:20px;border:1px solid #ccc;border-radius:8px;padding:15px;} .calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;border:1px solid #ccc;} .calendar-header,.calendar-day{text-align:center;padding:5px;border:1px solid #eee;} .calendar-day.other-month{visibility:hidden;} .calendar-header{font-weight:bold;background-color:#f0f0f0;} .calendar-day-number{font-size:12px;color:black !important;} .multiday-event-bg{background-color:#e9e9e9 !important;} .appointment-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background-color:#000 !important;} .appointment-item{font-size:10pt;border-bottom:1px solid #eee;padding:8px 0;page-break-inside:avoid;} .appointment-time{font-size:0.9em;color:#555;} .appointment-title{font-weight:bold;} .no-appointments{text-align:center;color:#777;font-style:italic;}}</style>`;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html><head><title>Stampa Calendario</title>${printStyles}</head><body><div class="print-container"><div class="calendar-section"><h2>${calendarTitleText}</h2><div class="calendar-grid">${calendarGridHTML}</div></div><div class="appointments-section"><div class="appointments-list">${appointmentsListHTML}</div></div></div></body></html>`);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
    }
    
    function refreshUI() { generateCalendar(); updateAppointmentsList(); updateSelectedDateInfo(); }
    const toggleTimeInputs = (modal, shouldDisable) => modal.querySelectorAll('.time-inputs-container input').forEach(input => input.disabled = shouldDisable);

    appointmentAllDay.addEventListener('change', e => toggleTimeInputs(newAppointmentModal, e.target.checked));
    editAppointmentAllDay.addEventListener('change', e => toggleTimeInputs(editAppointmentModal, e.target.checked));
    appointmentsTabs.addEventListener('click', (e) => { if (e.target.classList.contains('tab-btn')) { currentView = e.target.dataset.view; appointmentsTabs.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active')); e.target.classList.add('active'); refreshUI(); } });
    prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); generateCalendar(); });
    nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); generateCalendar(); });
    todayBtn.addEventListener('click', () => { currentDate = new Date(); selectedDate = new Date(); refreshUI(); });
    newAppointmentBtn.addEventListener('click', openNewAppointmentModal);
    saveAppointmentBtn.addEventListener('click', () => saveAppointment(false));
    saveEditAppointmentBtn.addEventListener('click', () => saveAppointment(true));
    deleteAppointmentBtn.addEventListener('click', deleteAppointment);
    cancelAppointmentBtn.addEventListener('click', () => closeModal(newAppointmentModal));
    cancelEditAppointmentBtn.addEventListener('click', () => closeModal(editAppointmentModal));
    document.querySelectorAll('.modal .close-btn').forEach(btn => btn.addEventListener('click', () => { closeModal(newAppointmentModal); closeModal(editAppointmentModal); }));
    deleteAllCalendarBtn.addEventListener('click', deleteAllCalendar);
    exportCalendarBtn.addEventListener('click', exportAppointments);
    importCalendarBtn.addEventListener('click', importAppointments);
    printCalendarBtn.addEventListener('click', printCurrentView);

    function init() { loadAppointments(); refreshUI(); }
    init();
});
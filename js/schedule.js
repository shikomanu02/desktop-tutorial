// Schedule Management Module
const ScheduleManager = {
    currentMonth: null,

    init() {
        this.currentMonth = new Date().toISOString().slice(0, 7);
        document.getElementById('scheduleMonth').value = this.currentMonth;
        this.updateEmployeeSelects();
        this.attachEventListeners();
        this.loadSchedule();
    },

    attachEventListeners() {
        // Add schedule button
        document.getElementById('addScheduleBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Month filter
        document.getElementById('scheduleMonth').addEventListener('change', (e) => {
            this.currentMonth = e.target.value;
            this.loadSchedule();
        });

        // Employee filter
        document.getElementById('scheduleEmployeeFilter').addEventListener('change', () => {
            this.loadSchedule();
        });

        // Form submission
        document.getElementById('scheduleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSchedule();
        });

        // Modal close buttons
        document.querySelectorAll('#scheduleModal .modal-close, #scheduleModal .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // Close modal on outside click
        document.getElementById('scheduleModal').addEventListener('click', (e) => {
            if (e.target.id === 'scheduleModal') {
                this.closeModal();
            }
        });
    },

    updateEmployeeSelects() {
        const employees = EmployeeManager.getAllEmployees();
        const selects = [
            document.getElementById('scheduleEmployeeFilter'),
            document.getElementById('scheduleEmployee')
        ];

        selects.forEach(select => {
            const currentValue = select.value;
            const isFilter = select.id === 'scheduleEmployeeFilter';
            
            select.innerHTML = isFilter ? '<option value="">Todos los empleados</option>' : '<option value="">Seleccionar empleado...</option>';
            
            employees.forEach(emp => {
                const option = document.createElement('option');
                option.value = emp.id;
                option.textContent = `${emp.name} - ${emp.position}`;
                select.appendChild(option);
            });

            if (currentValue) {
                select.value = currentValue;
            }
        });
    },

    loadSchedule() {
        const schedules = Storage.get(Storage.KEYS.SCHEDULES) || [];
        const employeeFilter = document.getElementById('scheduleEmployeeFilter').value;
        
        // Filter by month and employee
        const filtered = schedules.filter(s => {
            const matchMonth = s.date.startsWith(this.currentMonth);
            const matchEmployee = !employeeFilter || s.employeeId === employeeFilter;
            return matchMonth && matchEmployee;
        });

        this.renderCalendar(filtered);
    },

    renderCalendar(schedules) {
        const calendar = document.getElementById('scheduleCalendar');
        const [year, month] = this.currentMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDay = new Date(year, month - 1, 1).getDay();

        let html = '';
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        // Add day headers
        dayNames.forEach(day => {
            html += `<div class="schedule-day-header">${day}</div>`;
        });

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="schedule-day"></div>';
        }

        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daySchedules = schedules.filter(s => s.date === dateStr);
            
            html += `
                <div class="schedule-day">
                    <div class="schedule-day-date">${day}</div>
                    ${daySchedules.map(s => {
                        const employee = EmployeeManager.getEmployee(s.employeeId);
                        return `
                            <div class="schedule-shift ${s.shift}" title="${employee ? employee.name : 'Desconocido'}">
                                ${employee ? employee.name.split(' ')[0] : 'N/A'}
                                <br>${s.hours}h
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        calendar.innerHTML = html;
    },

    openModal() {
        const modal = document.getElementById('scheduleModal');
        const form = document.getElementById('scheduleForm');
        
        form.reset();
        document.getElementById('scheduleDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('scheduleHours').value = 8;
        
        modal.classList.add('active');
    },

    closeModal() {
        document.getElementById('scheduleModal').classList.remove('active');
    },

    saveSchedule() {
        const schedules = Storage.get(Storage.KEYS.SCHEDULES) || [];
        
        const schedule = {
            id: Date.now(),
            employeeId: document.getElementById('scheduleEmployee').value,
            date: document.getElementById('scheduleDate').value,
            shift: document.getElementById('scheduleShift').value,
            hours: parseFloat(document.getElementById('scheduleHours').value)
        };

        // Check if schedule already exists for this employee on this date
        const existingIndex = schedules.findIndex(s => 
            s.employeeId === schedule.employeeId && s.date === schedule.date
        );

        if (existingIndex !== -1) {
            if (confirm('Ya existe un turno para este empleado en esta fecha. ¿Desea reemplazarlo?')) {
                schedules[existingIndex] = schedule;
            } else {
                return;
            }
        } else {
            schedules.push(schedule);
        }

        Storage.set(Storage.KEYS.SCHEDULES, schedules);
        this.loadSchedule();
        this.closeModal();
    },

    getSchedulesByEmployee(employeeId, startDate, endDate) {
        const schedules = Storage.get(Storage.KEYS.SCHEDULES) || [];
        return schedules.filter(s => 
            s.employeeId === employeeId &&
            s.date >= startDate &&
            s.date <= endDate
        );
    },

    getTotalHours(employeeId, startDate, endDate) {
        const schedules = this.getSchedulesByEmployee(employeeId, startDate, endDate);
        return schedules.reduce((total, s) => total + s.hours, 0);
    }
};

// Overtime Management Module
const OvertimeManager = {
    currentMonth: null,

    init() {
        this.currentMonth = new Date().toISOString().slice(0, 7);
        document.getElementById('overtimeMonth').value = this.currentMonth;
        this.updateEmployeeSelects();
        this.attachEventListeners();
        this.loadOvertime();
    },

    attachEventListeners() {
        // Add overtime button
        document.getElementById('addOvertimeBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Month filter
        document.getElementById('overtimeMonth').addEventListener('change', (e) => {
            this.currentMonth = e.target.value;
            this.loadOvertime();
        });

        // Employee filter
        document.getElementById('overtimeEmployeeFilter').addEventListener('change', () => {
            this.loadOvertime();
        });

        // Form submission
        document.getElementById('overtimeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveOvertime();
        });

        // Modal close buttons
        document.querySelectorAll('#overtimeModal .modal-close, #overtimeModal .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // Close modal on outside click
        document.getElementById('overtimeModal').addEventListener('click', (e) => {
            if (e.target.id === 'overtimeModal') {
                this.closeModal();
            }
        });
    },

    updateEmployeeSelects() {
        const employees = EmployeeManager.getAllEmployees();
        const selects = [
            document.getElementById('overtimeEmployeeFilter'),
            document.getElementById('overtimeEmployee')
        ];

        selects.forEach(select => {
            const currentValue = select.value;
            const isFilter = select.id === 'overtimeEmployeeFilter';
            
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

    loadOvertime() {
        const overtimes = Storage.get(Storage.KEYS.OVERTIME) || [];
        const employeeFilter = document.getElementById('overtimeEmployeeFilter').value;
        
        // Filter by month and employee
        const filtered = overtimes.filter(o => {
            const matchMonth = o.date.startsWith(this.currentMonth);
            const matchEmployee = !employeeFilter || o.employeeId === employeeFilter;
            return matchMonth && matchEmployee;
        });

        this.renderOvertime(filtered);
    },

    renderOvertime(overtimes) {
        const tbody = document.getElementById('overtimeTableBody');
        
        if (overtimes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No hay registros de sobretiempo</td></tr>';
            return;
        }

        // Sort by date descending
        overtimes.sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = overtimes.map(ot => {
            const employee = EmployeeManager.getEmployee(ot.employeeId);
            const totalHours = ot.normalHours + ot.holidayHours;
            const amount = this.calculateOvertimeAmount(ot.employeeId, ot.normalHours, ot.holidayHours);

            return `
                <tr>
                    <td>${this.formatDate(ot.date)}</td>
                    <td><strong>${employee ? employee.name : 'Desconocido'}</strong></td>
                    <td>${ot.normalHours.toFixed(1)}h</td>
                    <td>${ot.holidayHours.toFixed(1)}h</td>
                    <td><strong>${totalHours.toFixed(1)}h</strong></td>
                    <td class="text-success"><strong>$${amount.toFixed(2)}</strong></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-danger" onclick="OvertimeManager.deleteOvertime(${ot.id})">Eliminar</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openModal() {
        const modal = document.getElementById('overtimeModal');
        const form = document.getElementById('overtimeForm');
        
        form.reset();
        document.getElementById('overtimeDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('overtimeNormalHours').value = 0;
        document.getElementById('overtimeHolidayHours').value = 0;
        
        modal.classList.add('active');
    },

    closeModal() {
        document.getElementById('overtimeModal').classList.remove('active');
    },

    saveOvertime() {
        const overtimes = Storage.get(Storage.KEYS.OVERTIME) || [];
        
        const normalHours = parseFloat(document.getElementById('overtimeNormalHours').value) || 0;
        const holidayHours = parseFloat(document.getElementById('overtimeHolidayHours').value) || 0;

        if (normalHours === 0 && holidayHours === 0) {
            alert('Debe ingresar al menos una hora extra');
            return;
        }

        const overtime = {
            id: Date.now(),
            employeeId: document.getElementById('overtimeEmployee').value,
            date: document.getElementById('overtimeDate').value,
            normalHours: normalHours,
            holidayHours: holidayHours,
            description: document.getElementById('overtimeDescription').value.trim()
        };

        overtimes.push(overtime);
        Storage.set(Storage.KEYS.OVERTIME, overtimes);
        this.loadOvertime();
        this.closeModal();
    },

    deleteOvertime(id) {
        if (confirm('¿Está seguro de eliminar este registro de sobretiempo?')) {
            let overtimes = Storage.get(Storage.KEYS.OVERTIME) || [];
            overtimes = overtimes.filter(o => o.id !== id);
            Storage.set(Storage.KEYS.OVERTIME, overtimes);
            this.loadOvertime();
        }
    },

    calculateOvertimeAmount(employeeId, normalHours, holidayHours) {
        const employee = EmployeeManager.getEmployee(employeeId);
        if (!employee) return 0;

        // Calculate hourly rate (assuming 160 hours per month)
        const hourlyRate = employee.salary / 160;
        
        // Normal overtime: 1.5x
        const normalAmount = normalHours * hourlyRate * 1.5;
        
        // Holiday/Sunday overtime: 2x
        const holidayAmount = holidayHours * hourlyRate * 2;

        return normalAmount + holidayAmount;
    },

    getOvertimeByEmployee(employeeId, startDate, endDate) {
        const overtimes = Storage.get(Storage.KEYS.OVERTIME) || [];
        return overtimes.filter(o => 
            o.employeeId === employeeId &&
            o.date >= startDate &&
            o.date <= endDate
        );
    },

    getTotalOvertimeAmount(employeeId, startDate, endDate) {
        const overtimes = this.getOvertimeByEmployee(employeeId, startDate, endDate);
        return overtimes.reduce((total, ot) => {
            return total + this.calculateOvertimeAmount(employeeId, ot.normalHours, ot.holidayHours);
        }, 0);
    },

    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
};

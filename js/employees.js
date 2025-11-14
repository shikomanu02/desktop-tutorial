// Employee Management Module
const EmployeeManager = {
    currentEditId: null,

    init() {
        this.loadEmployees();
        this.attachEventListeners();
    },

    attachEventListeners() {
        // Add employee button
        document.getElementById('addEmployeeBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Search functionality
        document.getElementById('searchEmployee').addEventListener('input', (e) => {
            this.searchEmployees(e.target.value);
        });

        // Form submission
        document.getElementById('employeeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEmployee();
        });

        // Modal close buttons
        document.querySelectorAll('#employeeModal .modal-close, #employeeModal .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // Close modal on outside click
        document.getElementById('employeeModal').addEventListener('click', (e) => {
            if (e.target.id === 'employeeModal') {
                this.closeModal();
            }
        });
    },

    loadEmployees() {
        const employees = Storage.get(Storage.KEYS.EMPLOYEES) || [];
        this.renderEmployees(employees);
    },

    renderEmployees(employees) {
        const tbody = document.getElementById('employeesTableBody');
        
        if (employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No hay empleados registrados</td></tr>';
            return;
        }

        tbody.innerHTML = employees.map(emp => `
            <tr>
                <td>${emp.id}</td>
                <td><strong>${emp.name}</strong></td>
                <td>${emp.position}</td>
                <td>${emp.department}</td>
                <td>$${parseFloat(emp.salary).toFixed(2)}</td>
                <td>${this.formatDate(emp.startDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-info" onclick="EmployeeManager.viewEmployee('${emp.id}')">Ver</button>
                        <button class="btn btn-warning" onclick="EmployeeManager.editEmployee('${emp.id}')">Editar</button>
                        <button class="btn btn-danger" onclick="EmployeeManager.deleteEmployee('${emp.id}')">Eliminar</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    searchEmployees(query) {
        const employees = Storage.get(Storage.KEYS.EMPLOYEES) || [];
        const filtered = employees.filter(emp => 
            emp.name.toLowerCase().includes(query.toLowerCase()) ||
            emp.id.includes(query) ||
            emp.position.toLowerCase().includes(query.toLowerCase()) ||
            emp.department.toLowerCase().includes(query.toLowerCase())
        );
        this.renderEmployees(filtered);
    },

    openModal(employee = null) {
        const modal = document.getElementById('employeeModal');
        const form = document.getElementById('employeeForm');
        const title = document.getElementById('employeeModalTitle');

        form.reset();
        this.currentEditId = null;

        if (employee) {
            title.textContent = 'Editar Empleado';
            this.currentEditId = employee.id;
            document.getElementById('employeeId').value = employee.id;
            document.getElementById('employeeName').value = employee.name;
            document.getElementById('employeePosition').value = employee.position;
            document.getElementById('employeeDepartment').value = employee.department;
            document.getElementById('employeeSalary').value = employee.salary;
            document.getElementById('employeeStartDate').value = employee.startDate;
            document.getElementById('employeeEmail').value = employee.email || '';
            document.getElementById('employeePhone').value = employee.phone || '';
            document.getElementById('employeeId').readOnly = true;
        } else {
            title.textContent = 'Agregar Empleado';
            document.getElementById('employeeId').readOnly = false;
        }

        modal.classList.add('active');
    },

    closeModal() {
        document.getElementById('employeeModal').classList.remove('active');
        this.currentEditId = null;
    },

    saveEmployee() {
        const employees = Storage.get(Storage.KEYS.EMPLOYEES) || [];
        
        const employee = {
            id: document.getElementById('employeeId').value.trim(),
            name: document.getElementById('employeeName').value.trim(),
            position: document.getElementById('employeePosition').value.trim(),
            department: document.getElementById('employeeDepartment').value,
            salary: parseFloat(document.getElementById('employeeSalary').value),
            startDate: document.getElementById('employeeStartDate').value,
            email: document.getElementById('employeeEmail').value.trim(),
            phone: document.getElementById('employeePhone').value.trim()
        };

        if (this.currentEditId) {
            // Update existing employee
            const index = employees.findIndex(e => e.id === this.currentEditId);
            if (index !== -1) {
                employees[index] = employee;
            }
        } else {
            // Check if ID already exists
            if (employees.some(e => e.id === employee.id)) {
                alert('Ya existe un empleado con esta cédula');
                return;
            }
            // Add new employee
            employees.push(employee);
        }

        Storage.set(Storage.KEYS.EMPLOYEES, employees);
        this.loadEmployees();
        this.closeModal();
        
        // Update other modules that depend on employees
        if (typeof ScheduleManager !== 'undefined') ScheduleManager.updateEmployeeSelects();
        if (typeof OvertimeManager !== 'undefined') OvertimeManager.updateEmployeeSelects();
        if (typeof PayrollManager !== 'undefined') PayrollManager.updateEmployeeSelects();
    },

    viewEmployee(id) {
        const employees = Storage.get(Storage.KEYS.EMPLOYEES) || [];
        const employee = employees.find(e => e.id === id);
        
        if (employee) {
            const yearsWorked = this.calculateYearsWorked(employee.startDate);
            alert(`
Información del Empleado

Cédula: ${employee.id}
Nombre: ${employee.name}
Puesto: ${employee.position}
Departamento: ${employee.department}
Salario Base: $${parseFloat(employee.salary).toFixed(2)}
Fecha de Ingreso: ${this.formatDate(employee.startDate)}
Años Trabajados: ${yearsWorked.toFixed(1)} años
Email: ${employee.email || 'N/A'}
Teléfono: ${employee.phone || 'N/A'}
            `);
        }
    },

    editEmployee(id) {
        const employees = Storage.get(Storage.KEYS.EMPLOYEES) || [];
        const employee = employees.find(e => e.id === id);
        
        if (employee) {
            this.openModal(employee);
        }
    },

    deleteEmployee(id) {
        if (confirm('¿Está seguro de eliminar este empleado? Esta acción no se puede deshacer.')) {
            let employees = Storage.get(Storage.KEYS.EMPLOYEES) || [];
            employees = employees.filter(e => e.id !== id);
            Storage.set(Storage.KEYS.EMPLOYEES, employees);
            this.loadEmployees();
            
            // Update other modules
            if (typeof ScheduleManager !== 'undefined') ScheduleManager.updateEmployeeSelects();
            if (typeof OvertimeManager !== 'undefined') OvertimeManager.updateEmployeeSelects();
            if (typeof PayrollManager !== 'undefined') PayrollManager.updateEmployeeSelects();
        }
    },

    getEmployee(id) {
        const employees = Storage.get(Storage.KEYS.EMPLOYEES) || [];
        return employees.find(e => e.id === id);
    },

    getAllEmployees() {
        return Storage.get(Storage.KEYS.EMPLOYEES) || [];
    },

    calculateYearsWorked(startDate) {
        const start = new Date(startDate);
        const now = new Date();
        const diff = now - start;
        return diff / (1000 * 60 * 60 * 24 * 365.25);
    },

    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
};

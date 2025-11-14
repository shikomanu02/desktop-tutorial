// Payroll Management Module
const PayrollManager = {
    currentMonth: null,
    currentPayroll: [],

    init() {
        this.currentMonth = new Date().toISOString().slice(0, 7);
        document.getElementById('payrollMonth').value = this.currentMonth;
        this.updateEmployeeSelects();
        this.attachEventListeners();
    },

    attachEventListeners() {
        // Calculate payroll button
        document.getElementById('calculatePayrollBtn').addEventListener('click', () => {
            this.calculatePayroll();
        });

        // Generate payroll button
        document.getElementById('generatePayrollBtn').addEventListener('click', () => {
            this.generatePayrollReport();
        });

        // Month filter
        document.getElementById('payrollMonth').addEventListener('change', (e) => {
            this.currentMonth = e.target.value;
        });

        // Thirteenth month calculation
        document.getElementById('calculateThirteenthBtn').addEventListener('click', () => {
            this.calculateThirteenthMonth();
        });

        // Settlement calculation
        document.getElementById('calculateSettlementBtn').addEventListener('click', () => {
            this.calculateSettlement();
        });
    },

    updateEmployeeSelects() {
        const employees = EmployeeManager.getAllEmployees();
        const selects = [
            document.getElementById('payrollEmployeeFilter'),
            document.getElementById('settlementEmployee')
        ];

        selects.forEach(select => {
            const currentValue = select.value;
            const isFilter = select.id === 'payrollEmployeeFilter';
            
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

    calculatePayroll() {
        const employeeFilter = document.getElementById('payrollEmployeeFilter').value;
        const employees = employeeFilter 
            ? [EmployeeManager.getEmployee(employeeFilter)]
            : EmployeeManager.getAllEmployees();

        if (!employees || employees.length === 0) {
            alert('No hay empleados para calcular nómina');
            return;
        }

        const [year, month] = this.currentMonth.split('-').map(Number);
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

        this.currentPayroll = employees.map(emp => {
            const baseSalary = parseFloat(emp.salary);
            
            // Get overtime
            const overtimeAmount = OvertimeManager.getTotalOvertimeAmount(emp.id, startDate, endDate);
            
            // Bonuses (could be configurable)
            const bonuses = 0;
            
            // Calculate gross salary
            const grossSalary = baseSalary + overtimeAmount + bonuses;
            
            // Calculate deductions
            const deductions = this.calculateDeductions(grossSalary);
            
            // Calculate net salary
            const netSalary = grossSalary - deductions.total;

            return {
                employee: emp,
                baseSalary,
                overtime: overtimeAmount,
                bonuses,
                grossSalary,
                deductions,
                netSalary
            };
        });

        this.renderPayroll();
        this.renderPayrollSummary();
    },

    calculateDeductions(grossSalary) {
        // Panama deductions (approximate rates)
        const socialSecurity = grossSalary * 0.0975; // 9.75%
        const educationalInsurance = grossSalary * 0.0125; // 1.25%
        
        // Income tax (simplified progressive calculation)
        let incomeTax = 0;
        if (grossSalary > 11000) {
            incomeTax = (grossSalary - 11000) * 0.25;
        } else if (grossSalary > 5000) {
            incomeTax = (grossSalary - 5000) * 0.15;
        }

        const total = socialSecurity + educationalInsurance + incomeTax;

        return {
            socialSecurity,
            educationalInsurance,
            incomeTax,
            total
        };
    },

    renderPayroll() {
        const tbody = document.getElementById('payrollTableBody');
        
        if (this.currentPayroll.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Seleccione un mes y calcule la nómina</td></tr>';
            return;
        }

        tbody.innerHTML = this.currentPayroll.map(p => `
            <tr>
                <td><strong>${p.employee.name}</strong><br><small>${p.employee.position}</small></td>
                <td>$${p.baseSalary.toFixed(2)}</td>
                <td class="text-success">$${p.overtime.toFixed(2)}</td>
                <td>$${p.bonuses.toFixed(2)}</td>
                <td><strong>$${p.grossSalary.toFixed(2)}</strong></td>
                <td class="text-danger">$${p.deductions.total.toFixed(2)}</td>
                <td class="text-success"><strong>$${p.netSalary.toFixed(2)}</strong></td>
                <td>
                    <button class="btn btn-info" onclick="PayrollManager.viewPayrollDetail('${p.employee.id}')">Detalle</button>
                </td>
            </tr>
        `).join('');
    },

    renderPayrollSummary() {
        const summary = document.getElementById('payrollSummary');
        
        const totalEmployees = this.currentPayroll.length;
        const totalGross = this.currentPayroll.reduce((sum, p) => sum + p.grossSalary, 0);
        const totalDeductions = this.currentPayroll.reduce((sum, p) => sum + p.deductions.total, 0);
        const totalNet = this.currentPayroll.reduce((sum, p) => sum + p.netSalary, 0);

        summary.innerHTML = `
            <div class="summary-card info">
                <div class="summary-label">Total Empleados</div>
                <div class="summary-value">${totalEmployees}</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Salario Bruto Total</div>
                <div class="summary-value">$${totalGross.toFixed(2)}</div>
            </div>
            <div class="summary-card warning">
                <div class="summary-label">Deducciones Totales</div>
                <div class="summary-value">$${totalDeductions.toFixed(2)}</div>
            </div>
            <div class="summary-card success">
                <div class="summary-label">Salario Neto Total</div>
                <div class="summary-value">$${totalNet.toFixed(2)}</div>
            </div>
        `;
    },

    viewPayrollDetail(employeeId) {
        const payroll = this.currentPayroll.find(p => p.employee.id === employeeId);
        if (!payroll) return;

        const detail = `
DETALLE DE NÓMINA
${this.currentMonth}

EMPLEADO: ${payroll.employee.name}
CÉDULA: ${payroll.employee.id}
PUESTO: ${payroll.employee.position}
DEPARTAMENTO: ${payroll.employee.department}

INGRESOS:
- Salario Base: $${payroll.baseSalary.toFixed(2)}
- Horas Extra: $${payroll.overtime.toFixed(2)}
- Bonificaciones: $${payroll.bonuses.toFixed(2)}
TOTAL BRUTO: $${payroll.grossSalary.toFixed(2)}

DEDUCCIONES:
- Seguro Social (9.75%): $${payroll.deductions.socialSecurity.toFixed(2)}
- Seguro Educativo (1.25%): $${payroll.deductions.educationalInsurance.toFixed(2)}
- Impuesto sobre la Renta: $${payroll.deductions.incomeTax.toFixed(2)}
TOTAL DEDUCCIONES: $${payroll.deductions.total.toFixed(2)}

SALARIO NETO: $${payroll.netSalary.toFixed(2)}
        `;

        alert(detail);
    },

    generatePayrollReport() {
        if (this.currentPayroll.length === 0) {
            alert('Primero debe calcular la nómina');
            return;
        }

        // Save payroll record
        const payrollRecords = Storage.get(Storage.KEYS.PAYROLL) || [];
        const record = {
            id: Date.now(),
            month: this.currentMonth,
            date: new Date().toISOString(),
            payroll: this.currentPayroll
        };
        payrollRecords.push(record);
        Storage.set(Storage.KEYS.PAYROLL, payrollRecords);

        alert('Nómina generada y guardada exitosamente');
        window.print();
    },

    // Thirteenth Month (Aguinaldo) Calculation
    calculateThirteenthMonth() {
        const year = parseInt(document.getElementById('thirteenthYear').value);
        const employees = EmployeeManager.getAllEmployees();
        
        const thirteenthData = employees.map(emp => {
            const startDate = new Date(emp.startDate);
            const yearStart = new Date(year, 0, 1);
            const yearEnd = new Date(year, 11, 31);
            
            // Calculate months worked in the year
            const effectiveStart = startDate > yearStart ? startDate : yearStart;
            const monthsWorked = this.calculateMonthsWorked(effectiveStart, yearEnd);
            
            // Calculate proportional thirteenth month
            const thirteenthAmount = (emp.salary * monthsWorked) / 12;
            
            return {
                employee: emp,
                monthsWorked,
                thirteenthAmount,
                status: monthsWorked >= 12 ? 'Completo' : 'Proporcional'
            };
        });

        this.renderThirteenthMonth(thirteenthData);
    },

    calculateMonthsWorked(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        let months = (end.getFullYear() - start.getFullYear()) * 12;
        months += end.getMonth() - start.getMonth();
        
        // Add 1 to include the current month
        months += 1;
        
        return Math.min(months, 12);
    },

    renderThirteenthMonth(data) {
        const tbody = document.getElementById('thirteenthTableBody');
        
        tbody.innerHTML = data.map(d => `
            <tr>
                <td><strong>${d.employee.name}</strong><br><small>${d.employee.position}</small></td>
                <td>${this.formatDate(d.employee.startDate)}</td>
                <td>$${parseFloat(d.employee.salary).toFixed(2)}</td>
                <td>${d.monthsWorked} meses</td>
                <td class="text-success"><strong>$${d.thirteenthAmount.toFixed(2)}</strong></td>
                <td><span class="badge badge-${d.status === 'Completo' ? 'success' : 'warning'}">${d.status}</span></td>
            </tr>
        `).join('');
    },

    // Settlement Calculation
    calculateSettlement() {
        const employeeId = document.getElementById('settlementEmployee').value;
        const exitDate = document.getElementById('settlementDate').value;
        const reason = document.getElementById('settlementReason').value;

        if (!employeeId || !exitDate) {
            alert('Debe seleccionar un empleado y fecha de salida');
            return;
        }

        const employee = EmployeeManager.getEmployee(employeeId);
        if (!employee) return;

        const startDate = new Date(employee.startDate);
        const endDate = new Date(exitDate);
        const yearsWorked = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);
        const monthsWorked = yearsWorked * 12;

        // Calculate components
        const preaviso = this.calculatePreaviso(yearsWorked, employee.salary, reason);
        const antiguedad = this.calculateAntiguedad(yearsWorked, employee.salary, reason);
        const vacaciones = this.calculateVacaciones(employee.salary);
        const decimoTercero = (employee.salary * (monthsWorked % 12)) / 12;

        const total = preaviso + antiguedad + vacaciones + decimoTercero;

        this.renderSettlement({
            employee,
            exitDate,
            reason,
            yearsWorked,
            preaviso,
            antiguedad,
            vacaciones,
            decimoTercero,
            total
        });
    },

    calculatePreaviso(years, salary, reason) {
        // Preaviso only applies to certain termination reasons
        if (reason === 'renuncia' || reason === 'despido_justa') {
            return 0;
        }

        // Preaviso calculation based on years worked
        if (years < 2) {
            return salary * 1; // 1 month
        } else {
            return salary * 2; // 2 months
        }
    },

    calculateAntiguedad(years, salary, reason) {
        // Antigüedad only applies to dismissal without cause
        if (reason !== 'despido') {
            return 0;
        }

        // 1 week per year worked
        const weeklySalary = salary / 4;
        return weeklySalary * Math.floor(years);
    },

    calculateVacaciones(salary) {
        // Proportional vacation (30 days per year)
        const dailySalary = salary / 30;
        return dailySalary * 30; // Assuming full year
    },

    renderSettlement(data) {
        const result = document.getElementById('settlementResult');
        
        const reasonLabels = {
            'renuncia': 'Renuncia Voluntaria',
            'despido': 'Despido sin Justa Causa',
            'despido_justa': 'Despido con Justa Causa',
            'mutuo': 'Mutuo Acuerdo'
        };

        result.innerHTML = `
            <div class="settlement-header">
                <h3>Cálculo de Liquidación</h3>
                <p><strong>${data.employee.name}</strong> - ${data.employee.position}</p>
                <p>Fecha de Salida: ${this.formatDate(data.exitDate)}</p>
                <p>Motivo: ${reasonLabels[data.reason]}</p>
                <p>Años Trabajados: ${data.yearsWorked.toFixed(2)} años</p>
            </div>

            <div class="settlement-item">
                <span class="settlement-label">Preaviso</span>
                <span class="settlement-value">$${data.preaviso.toFixed(2)}</span>
            </div>

            <div class="settlement-item">
                <span class="settlement-label">Indemnización por Antigüedad</span>
                <span class="settlement-value">$${data.antiguedad.toFixed(2)}</span>
            </div>

            <div class="settlement-item">
                <span class="settlement-label">Vacaciones Proporcionales</span>
                <span class="settlement-value">$${data.vacaciones.toFixed(2)}</span>
            </div>

            <div class="settlement-item">
                <span class="settlement-label">Décimo Tercer Mes Proporcional</span>
                <span class="settlement-value">$${data.decimoTercero.toFixed(2)}</span>
            </div>

            <div class="settlement-total">
                <span class="settlement-total-label">TOTAL A PAGAR</span>
                <span class="settlement-total-value">$${data.total.toFixed(2)}</span>
            </div>
        `;
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

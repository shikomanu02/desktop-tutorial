// Holidays Management Module
const HolidayManager = {
    init() {
        this.loadHolidays();
        this.attachEventListeners();
    },

    attachEventListeners() {
        // Add holiday button
        document.getElementById('addHolidayBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Form submission
        document.getElementById('holidayForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveHoliday();
        });

        // Modal close buttons
        document.querySelectorAll('#holidayModal .modal-close, #holidayModal .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // Close modal on outside click
        document.getElementById('holidayModal').addEventListener('click', (e) => {
            if (e.target.id === 'holidayModal') {
                this.closeModal();
            }
        });
    },

    loadHolidays() {
        const holidays = Storage.get(Storage.KEYS.HOLIDAYS) || [];
        this.renderHolidays(holidays);
    },

    renderHolidays(holidays) {
        const tbody = document.getElementById('holidaysTableBody');
        
        if (holidays.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No hay feriados registrados</td></tr>';
            return;
        }

        // Sort by date
        holidays.sort((a, b) => new Date(a.date) - new Date(b.date));

        tbody.innerHTML = holidays.map(holiday => `
            <tr>
                <td>${this.formatDate(holiday.date)}</td>
                <td><strong>${holiday.name}</strong></td>
                <td><span class="badge badge-${this.getTypeBadge(holiday.type)}">${this.getTypeLabel(holiday.type)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-danger" onclick="HolidayManager.deleteHoliday(${holiday.id})">Eliminar</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    openModal() {
        const modal = document.getElementById('holidayModal');
        const form = document.getElementById('holidayForm');
        
        form.reset();
        modal.classList.add('active');
    },

    closeModal() {
        document.getElementById('holidayModal').classList.remove('active');
    },

    saveHoliday() {
        const holidays = Storage.get(Storage.KEYS.HOLIDAYS) || [];
        
        const holiday = {
            id: Date.now(),
            date: document.getElementById('holidayDate').value,
            name: document.getElementById('holidayName').value.trim(),
            type: document.getElementById('holidayType').value
        };

        // Check if holiday already exists on this date
        if (holidays.some(h => h.date === holiday.date)) {
            alert('Ya existe un feriado registrado en esta fecha');
            return;
        }

        holidays.push(holiday);
        Storage.set(Storage.KEYS.HOLIDAYS, holidays);
        this.loadHolidays();
        this.closeModal();
    },

    deleteHoliday(id) {
        if (confirm('¿Está seguro de eliminar este feriado?')) {
            let holidays = Storage.get(Storage.KEYS.HOLIDAYS) || [];
            holidays = holidays.filter(h => h.id !== id);
            Storage.set(Storage.KEYS.HOLIDAYS, holidays);
            this.loadHolidays();
        }
    },

    isHoliday(date) {
        const holidays = Storage.get(Storage.KEYS.HOLIDAYS) || [];
        return holidays.some(h => h.date === date);
    },

    getHoliday(date) {
        const holidays = Storage.get(Storage.KEYS.HOLIDAYS) || [];
        return holidays.find(h => h.date === date);
    },

    getHolidaysInRange(startDate, endDate) {
        const holidays = Storage.get(Storage.KEYS.HOLIDAYS) || [];
        return holidays.filter(h => h.date >= startDate && h.date <= endDate);
    },

    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        });
    },

    getTypeLabel(type) {
        const labels = {
            'nacional': 'Nacional',
            'religioso': 'Religioso',
            'local': 'Local'
        };
        return labels[type] || type;
    },

    getTypeBadge(type) {
        const badges = {
            'nacional': 'info',
            'religioso': 'warning',
            'local': 'success'
        };
        return badges[type] || 'info';
    }
};

// Storage Manager - Handles all localStorage operations
const Storage = {
    // Keys for localStorage
    KEYS: {
        EMPLOYEES: 'payroll_employees',
        SCHEDULES: 'payroll_schedules',
        HOLIDAYS: 'payroll_holidays',
        OVERTIME: 'payroll_overtime',
        PAYROLL: 'payroll_records',
        THIRTEENTH: 'payroll_thirteenth',
        SETTLEMENTS: 'payroll_settlements'
    },

    // Get data from localStorage
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    // Save data to localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },

    // Remove data from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // Clear all data
    clear() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    // Initialize with sample data if empty
    initializeSampleData() {
        if (!this.get(this.KEYS.EMPLOYEES)) {
            const sampleEmployees = [
                {
                    id: '8-123-4567',
                    name: 'Juan Pérez',
                    position: 'Gerente de Ventas',
                    department: 'Ventas',
                    salary: 2500.00,
                    startDate: '2020-01-15',
                    email: 'juan.perez@empresa.com',
                    phone: '6000-0001'
                },
                {
                    id: '8-234-5678',
                    name: 'María González',
                    position: 'Desarrolladora Senior',
                    department: 'Tecnología',
                    salary: 3000.00,
                    startDate: '2019-06-01',
                    email: 'maria.gonzalez@empresa.com',
                    phone: '6000-0002'
                },
                {
                    id: '8-345-6789',
                    name: 'Carlos Rodríguez',
                    position: 'Contador',
                    department: 'Finanzas',
                    salary: 2200.00,
                    startDate: '2021-03-10',
                    email: 'carlos.rodriguez@empresa.com',
                    phone: '6000-0003'
                }
            ];
            this.set(this.KEYS.EMPLOYEES, sampleEmployees);
        }

        if (!this.get(this.KEYS.HOLIDAYS)) {
            const currentYear = new Date().getFullYear();
            const sampleHolidays = [
                { id: 1, date: `${currentYear}-01-01`, name: 'Año Nuevo', type: 'nacional' },
                { id: 2, date: `${currentYear}-01-09`, name: 'Día de los Mártires', type: 'nacional' },
                { id: 3, date: `${currentYear}-05-01`, name: 'Día del Trabajo', type: 'nacional' },
                { id: 4, date: `${currentYear}-11-03`, name: 'Día de la Separación', type: 'nacional' },
                { id: 5, date: `${currentYear}-11-10`, name: 'Primer Grito de Independencia', type: 'nacional' },
                { id: 6, date: `${currentYear}-11-28`, name: 'Día de la Independencia', type: 'nacional' },
                { id: 7, date: `${currentYear}-12-25`, name: 'Navidad', type: 'religioso' }
            ];
            this.set(this.KEYS.HOLIDAYS, sampleHolidays);
        }
    }
};

// Initialize sample data on first load
Storage.initializeSampleData();

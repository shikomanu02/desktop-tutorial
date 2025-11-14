// Main Application Controller
const App = {
    init() {
        this.setupNavigation();
        this.initializeModules();
        console.log('Sistema de Nómina y Planilla iniciado correctamente');
    },

    setupNavigation() {
        const navTabs = document.querySelectorAll('.nav-tab');
        const tabContents = document.querySelectorAll('.tab-content');

        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                // Remove active class from all tabs and contents
                navTabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                document.getElementById(targetTab).classList.add('active');

                // Trigger module-specific load functions
                this.onTabChange(targetTab);
            });
        });
    },

    onTabChange(tabName) {
        switch(tabName) {
            case 'employees':
                EmployeeManager.loadEmployees();
                break;
            case 'schedule':
                ScheduleManager.loadSchedule();
                break;
            case 'holidays':
                HolidayManager.loadHolidays();
                break;
            case 'overtime':
                OvertimeManager.loadOvertime();
                break;
            case 'payroll':
                // Payroll is calculated on demand
                break;
            case 'thirteenth':
                // Thirteenth month is calculated on demand
                break;
            case 'settlement':
                // Settlement is calculated on demand
                break;
        }
    },

    initializeModules() {
        // Initialize all modules
        if (typeof EmployeeManager !== 'undefined') {
            EmployeeManager.init();
        }

        if (typeof ScheduleManager !== 'undefined') {
            ScheduleManager.init();
        }

        if (typeof HolidayManager !== 'undefined') {
            HolidayManager.init();
        }

        if (typeof OvertimeManager !== 'undefined') {
            OvertimeManager.init();
        }

        if (typeof PayrollManager !== 'undefined') {
            PayrollManager.init();
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Utility functions
const Utils = {
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-PA', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatShortDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    },

    isWeekend(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const day = date.getDay();
        return day === 0 || day === 6; // Sunday or Saturday
    },

    calculateBusinessDays(startDate, endDate) {
        let count = 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        while (start <= end) {
            const dayOfWeek = start.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
            start.setDate(start.getDate() + 1);
        }
        
        return count;
    },

    exportToCSV(data, filename) {
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    },

    convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [];
        
        // Add headers
        csvRows.push(headers.join(','));
        
        // Add data rows
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                return `"${value}"`;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    },

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
};

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

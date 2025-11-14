# Sistema de Nómina y Planilla

Sistema completo de gestión de nómina y recursos humanos desarrollado con HTML, CSS y JavaScript puro.

## 🚀 Características

### Módulos Principales

1. **👥 Gestión de Empleados**
   - CRUD completo (Crear, Leer, Actualizar, Eliminar)
   - Búsqueda y filtrado de empleados
   - Información detallada: cédula, nombre, puesto, departamento, salario, fecha de ingreso
   - Validación de formularios

2. **📅 Gestión de Turnos**
   - Asignación de turnos (diurno, nocturno, mixto)
   - Calendario mensual visual
   - Registro de horas trabajadas por día
   - Filtrado por empleado y mes

3. **🎉 Días Feriados**
   - Gestión de feriados nacionales, religiosos y locales
   - Calendario anual de feriados
   - Impacto en cálculo de horas extras

4. **💰 Cálculo de Nómina**
   - Cálculo automático de salarios
   - Deducciones:
     - Seguro Social (9.75%)
     - Seguro Educativo (1.25%)
     - Impuesto sobre la Renta (progresivo)
   - Inclusión de horas extras y bonificaciones
   - Resumen ejecutivo con totales
   - Detalle individual por empleado

5. **⏰ Sobretiempo (Horas Extra)**
   - Registro de horas extras normales (1.5x)
   - Registro de horas en feriados/domingos (2x)
   - Cálculo automático del monto
   - Historial por empleado

6. **🎁 Décimo Tercer Mes (Aguinaldo)**
   - Cálculo proporcional basado en meses trabajados
   - Fórmula: (Salario mensual × meses trabajados) / 12
   - Reporte anual por empleado

7. **📋 Liquidación**
   - Cálculo de preaviso
   - Indemnización por antigüedad
   - Vacaciones proporcionales
   - Décimo tercer mes proporcional
   - Diferentes escenarios: renuncia, despido, mutuo acuerdo

## 🛠️ Tecnologías

- **HTML5**: Estructura semántica
- **CSS3**: Diseño moderno y responsivo con gradientes y animaciones
- **JavaScript (ES6+)**: Lógica de negocio y manipulación del DOM
- **LocalStorage**: Persistencia de datos en el navegador

## 📦 Estructura del Proyecto

```
/vercel/sandbox/
├── index.html              # Página principal
├── css/
│   └── styles.css         # Estilos globales
├── js/
│   ├── app.js            # Controlador principal
│   ├── storage.js        # Gestión de localStorage
│   ├── employees.js      # Módulo de empleados
│   ├── schedule.js       # Módulo de turnos
│   ├── holidays.js       # Módulo de feriados
│   ├── overtime.js       # Módulo de sobretiempo
│   └── payroll.js        # Módulo de nómina y cálculos
└── README.md             # Documentación
```

## 🚀 Instalación y Uso

### Opción 1: Abrir directamente en el navegador

1. Navega al directorio del proyecto:
   ```bash
   cd /vercel/sandbox
   ```

2. Abre `index.html` en tu navegador favorito:
   ```bash
   # En Linux
   xdg-open index.html
   
   # En macOS
   open index.html
   
   # En Windows
   start index.html
   ```

### Opción 2: Usar un servidor local

1. Con Python 3:
   ```bash
   python3 -m http.server 8000
   ```
   Luego abre: http://localhost:8000

2. Con Node.js (si tienes npx):
   ```bash
   npx http-server -p 8000
   ```
   Luego abre: http://localhost:8000

3. Con PHP:
   ```bash
   php -S localhost:8000
   ```
   Luego abre: http://localhost:8000

## 📖 Guía de Uso

### 1. Gestión de Empleados

- **Agregar empleado**: Click en "+ Agregar Empleado"
- **Editar empleado**: Click en "Editar" en la fila del empleado
- **Eliminar empleado**: Click en "Eliminar" (requiere confirmación)
- **Buscar empleado**: Usa la barra de búsqueda para filtrar por nombre, cédula o puesto

### 2. Asignar Turnos

- Selecciona el mes en el filtro
- Click en "+ Asignar Turno"
- Selecciona empleado, fecha, tipo de turno y horas trabajadas
- El calendario se actualiza automáticamente

### 3. Registrar Feriados

- Click en "+ Agregar Feriado"
- Ingresa fecha, nombre y tipo de feriado
- Los feriados se usan para calcular horas extras con tarifa doble

### 4. Calcular Nómina

- Selecciona el mes a calcular
- Opcionalmente filtra por empleado específico
- Click en "Calcular"
- Revisa el resumen y detalle de cada empleado
- Click en "Generar Nómina" para guardar e imprimir

### 5. Registrar Horas Extra

- Click en "+ Registrar Horas Extra"
- Selecciona empleado y fecha
- Ingresa horas normales (1.5x) o horas en feriado (2x)
- El sistema calcula automáticamente el monto

### 6. Calcular Décimo Tercer Mes

- Selecciona el año
- Click en "Calcular Aguinaldo"
- El sistema calcula proporcionalmente según meses trabajados

### 7. Calcular Liquidación

- Selecciona el empleado
- Ingresa fecha de salida
- Selecciona motivo de terminación
- Click en "Calcular Liquidación"
- Revisa el desglose completo

## 💡 Características Técnicas

### Cálculos Implementados

**Deducciones (Panamá):**
- Seguro Social: 9.75% del salario bruto
- Seguro Educativo: 1.25% del salario bruto
- Impuesto sobre la Renta: Progresivo
  - Hasta $5,000: Exento
  - $5,001 - $11,000: 15%
  - Más de $11,000: 25%

**Horas Extra:**
- Normales: Tarifa horaria × 1.5
- Feriados/Domingos: Tarifa horaria × 2.0
- Tarifa horaria = Salario mensual / 160 horas

**Décimo Tercer Mes:**
- Fórmula: (Salario mensual × meses trabajados) / 12

**Liquidación:**
- Preaviso: 1-2 meses según antigüedad
- Antigüedad: 1 semana por año trabajado
- Vacaciones proporcionales: 30 días anuales
- Décimo tercer mes proporcional

### Persistencia de Datos

Todos los datos se almacenan en `localStorage` del navegador:
- `payroll_employees`: Empleados
- `payroll_schedules`: Turnos
- `payroll_holidays`: Feriados
- `payroll_overtime`: Horas extra
- `payroll_records`: Registros de nómina
- `payroll_thirteenth`: Décimo tercer mes
- `payroll_settlements`: Liquidaciones

### Datos de Ejemplo

El sistema incluye datos de ejemplo al iniciar por primera vez:
- 3 empleados de muestra
- Feriados nacionales de Panamá

## 🎨 Diseño

- **Responsivo**: Funciona en desktop, tablet y móvil
- **Moderno**: Gradientes, sombras y animaciones suaves
- **Intuitivo**: Navegación por pestañas clara
- **Accesible**: Colores contrastantes y tipografía legible

## 🔒 Seguridad

- Validación de formularios en el cliente
- Confirmación para acciones destructivas
- Datos almacenados localmente (no se envían a servidores)

## 📱 Compatibilidad

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contribuciones

Este es un proyecto de código abierto. Siéntete libre de:
- Reportar bugs
- Sugerir nuevas características
- Mejorar la documentación
- Enviar pull requests

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

Sistema desarrollado para gestión de nómina y recursos humanos.

---

**Nota**: Este sistema está diseñado para uso educativo y demostrativo. Para uso en producción, se recomienda implementar un backend robusto con base de datos y medidas de seguridad adicionales.

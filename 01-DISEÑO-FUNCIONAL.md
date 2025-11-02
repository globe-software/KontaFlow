# SISTEMA DE CONTABILIDAD - DISEÑO FUNCIONAL

> **Documento de Diseño y Especificación Funcional**  
> Versión 1.0 - Noviembre 2025

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General](#visión-general)
2. [Modelo Contable](#modelo-contable)
3. [Arquitectura de Datos](#arquitectura-de-datos)
4. [Funcionalidades por Fase](#funcionalidades-por-fase)
5. [Casos de Uso](#casos-de-uso)
6. [Flujos de Trabajo](#flujos-de-trabajo)
7. [Modelo de Datos](#modelo-de-datos)
8. [Reglas de Negocio](#reglas-de-negocio)

---

## 1. VISIÓN GENERAL

### 1.1 Objetivo

Desarrollar un sistema de contabilidad profesional basado en **partida doble**, 100% cloud, que permita a empresas gestionar su contabilidad de manera eficiente, escalable y multi-empresa.

### 1.2 Principios Fundamentales

- ✅ **Partida Doble**: Todo movimiento contable debe tener débito y crédito balanceado
- ✅ **Multi-empresa**: Soporte para grupos económicos con múltiples empresas
- ✅ **Multi-moneda**: Soporte nativo para múltiples monedas (UYU, USD, COP, etc.)
- ✅ **Plan de Cuentas Flexible**: Dinámico y configurable por grupo económico
- ✅ **Automatización**: Cálculos automáticos de impuestos, conversiones y reportes
- ✅ **Trazabilidad**: Auditoría completa de todos los movimientos

### 1.3 Alcance

**Incluye:**
- Gestión de grupos económicos y empresas
- Plan de cuentas configurable
- Asientos contables con partida doble
- Facturación y cuentas por cobrar
- Gastos y cuentas por pagar
- Conciliación bancaria
- Reportes financieros (Balance, Estado de Resultados)
- Cálculos impositivos (IVA, IRAE)
- Templates de asientos frecuentes
- Alertas y notificaciones

**No incluye (futuro):**
- Nómina/sueldos avanzados
- Inventario/stock
- Activos fijos depreciables
- Presupuestos (Fase 5)
- Control de proyectos (Fase 5)

---

## 2. MODELO CONTABLE

### 2.1 Partida Doble

Todos los movimientos contables se registran mediante **asientos** que cumplen:

```
REGLA FUNDAMENTAL:
∑ DÉBITOS = ∑ CRÉDITOS

Para cada asiento:
- Mínimo 2 líneas (1 débito, 1 crédito)
- Suma de débitos = Suma de créditos
- Fecha obligatoria
- Descripción obligatoria
```

### 2.2 Ecuación Contable

```
ACTIVO = PASIVO + PATRIMONIO

Ingresos aumentan Patrimonio
Gastos disminuyen Patrimonio

Por lo tanto:
ACTIVO + GASTOS = PASIVO + PATRIMONIO + INGRESOS
```

### 2.3 Tipos de Cuentas

```
1. ACTIVO (Saldo Deudor)
   - Aumenta: Débito
   - Disminuye: Crédito
   
2. PASIVO (Saldo Acreedor)
   - Aumenta: Crédito
   - Disminuye: Débito
   
3. PATRIMONIO (Saldo Acreedor)
   - Aumenta: Crédito
   - Disminuye: Débito
   
4. INGRESOS (Saldo Acreedor)
   - Aumenta: Crédito
   - Disminuye: Débito
   
5. GASTOS/EGRESOS (Saldo Deudor)
   - Aumenta: Débito
   - Disminuye: Crédito
```

### 2.4 Ejemplos de Asientos

#### Ejemplo 1: Facturar servicios por $10,000

```
Asiento Nro: 001
Fecha: 2025-01-15
Descripción: Factura #123 a Cliente XYZ

DÉBITO:  Cuentas por Cobrar - Cliente XYZ    $10,000
CRÉDITO: Ingresos por Servicios              $10,000
─────────────────────────────────────────────────────
Total:   $10,000                             $10,000 ✓
```

#### Ejemplo 2: Cobrar la factura

```
Asiento Nro: 002
Fecha: 2025-01-20
Descripción: Cobro Factura #123

DÉBITO:  Banco Santander                     $10,000
CRÉDITO: Cuentas por Cobrar - Cliente XYZ    $10,000
─────────────────────────────────────────────────────
Total:   $10,000                             $10,000 ✓
```

#### Ejemplo 3: Pagar gasto (con IVA)

```
Asiento Nro: 003
Fecha: 2025-01-25
Descripción: Pago honorarios profesionales

DÉBITO:  Honorarios Profesionales            $8,197
DÉBITO:  IVA Crédito Fiscal                  $1,803
CRÉDITO: Banco Santander                     $10,000
─────────────────────────────────────────────────────
Total:   $10,000                             $10,000 ✓
```

---

## 3. ARQUITECTURA DE DATOS

### 3.1 Jerarquía

```
GRUPO ECONÓMICO (Tenant/Cliente SaaS)
│
├─ Plan de Cuentas (único por grupo)
│  └─ Cuentas contables (ej: 1.1.1.010 Banco Santander)
│
├─ EMPRESA 1 (ej: Pragmatic Uruguay SRL)
│  ├─ Moneda funcional: UYU
│  ├─ Asientos contables
│  └─ Auxiliares (clientes, proveedores)
│
├─ EMPRESA 2 (ej: Pragmatic Colombia SAS)
│  ├─ Moneda funcional: COP
│  ├─ Asientos contables
│  └─ Auxiliares
│
└─ USUARIOS
   ├─ Admin (acceso a todo)
   ├─ Contador (lectura/escritura)
   └─ Operativo (solo lectura)
```

### 3.2 Grupo Económico

**Propósito:** Agrupar empresas relacionadas que comparten:
- Plan de cuentas
- Consolidación de reportes
- Usuarios y permisos
- Configuración general

**Características:**
- Nombre del grupo
- RUT/identificación del controlador (opcional)
- País principal
- Moneda de consolidación (ej: USD)
- Fecha de creación

**Ejemplo:**
```
Grupo Económico: "Grupo Pragmatic"
├─ Pragmatic Uruguay SRL (UYU)
├─ Pragmatic Colombia SAS (COP)
└─ Pragmatic Argentina SA (ARS)

Plan de cuentas compartido:
- 1.1.1.010 Banco Santander Uruguay
- 1.1.1.020 Banco Davivienda Colombia
- 4.1.1 Ingresos por Desarrollo Software
- etc.
```

### 3.3 Plan de Cuentas

**Estructura jerárquica:**

```
Nivel 1: ACTIVO (1)
  Nivel 2: Activo Corriente (1.1)
    Nivel 3: Disponibilidades (1.1.1)
      Nivel 4: Banco Santander MN (1.1.1.010) ← IMPUTABLE
      Nivel 4: Banco Santander USD (1.1.1.011) ← IMPUTABLE
```

**Atributos de cada cuenta:**

| Atributo | Descripción | Valores |
|----------|-------------|---------|
| Código | Identificador único | ej: "1.1.1.010" |
| Nombre | Descripción | ej: "Banco Santander MN" |
| Tipo | Naturaleza contable | Activo, Pasivo, Patrimonio, Ingreso, Egreso |
| Nivel | Profundidad en jerarquía | 1, 2, 3, 4... |
| Imputable | Acepta asientos | Sí/No (cuentas padres: No) |
| Requiere Auxiliar | Necesita cliente/proveedor | Sí/No |
| Tipo Auxiliar | Qué tipo de auxiliar | Cliente, Proveedor, Empleado |
| Moneda | Monedas permitidas | MN, USD, AMBAS, FUNCIONAL |
| Activa | Está en uso | Sí/No |

**Templates de Plan de Cuentas:**

El sistema debe ofrecer templates pre-configurados:

1. **Plan para Servicios IT (Multi-país)**
   - Uruguay, Colombia, Argentina
   - Cuentas para desarrollo software, consultoría
   - Honorarios profesionales en múltiples países

2. **Plan para Comercio (Uruguay)**
   - Inventario de mercaderías
   - Costo de mercadería vendida
   - Cuentas para comercio minorista

3. **Plan Básico (Genérico)**
   - Mínimo de cuentas para cualquier negocio
   - Personalizable

### 3.4 Empresa

**Atributos:**

- Nombre legal
- Nombre comercial (opcional)
- RUT/NIT/CUIT (identificación fiscal)
- País
- Moneda funcional
- Fecha de inicio de operaciones
- Estado (Activa/Inactiva)

**Ejemplo:**
```json
{
  "nombre": "Pragmatic Uruguay SRL",
  "nombreComercial": "Pragmatic",
  "rut": "217654320018",
  "pais": "UY",
  "monedaFuncional": "UYU",
  "fechaInicio": "2022-01-01",
  "activa": true
}
```

### 3.5 Asiento Contable

**Estructura:**

```
ASIENTO (Cabezal)
├─ Número (único por empresa)
├─ Fecha
├─ Descripción
├─ Tipo (diario, apertura, ajuste, cierre)
├─ Estado (borrador, confirmado)
│
└─ LÍNEAS (Movimientos)
   ├─ Línea 1: Cuenta A - Debe: $10,000 - Haber: $0
   ├─ Línea 2: Cuenta B - Debe: $0 - Haber: $10,000
   └─ Total: $10,000 = $10,000 ✓
```

**Atributos de cada línea:**

| Campo | Descripción | Obligatorio |
|-------|-------------|-------------|
| Cuenta | Referencia a plan de cuentas | Sí |
| Debe | Monto débito | Sí (0 o positivo) |
| Haber | Monto crédito | Sí (0 o positivo) |
| Moneda | USD, UYU, COP, etc. | Sí |
| Tipo de Cambio | Si es moneda extranjera | Condicional |
| Auxiliar | Cliente/Proveedor/Empleado | Condicional |
| Centro de Costo | Uruguay, Colombia, etc. | Opcional |
| Glosa/Nota | Descripción adicional | Opcional |

**Validaciones:**

```
✓ Toda línea debe tener DEBE > 0 O HABER > 0 (no ambos)
✓ Suma de DEBE = Suma de HABER
✓ Todas las líneas deben usar cuentas imputables
✓ Si cuenta requiere auxiliar, debe especificarse
✓ Tipo de cambio requerido para moneda extranjera
✓ Fecha no puede ser futura (configurable)
```

---

## 4. FUNCIONALIDADES POR FASE

### FASE 1: CORE + AUTOMATIZACIÓN BÁSICA (4-5 meses)

**Objetivo:** Sistema funcional que reemplace completamente Excel actual

#### 4.1.1 Gestión de Estructura

**Grupos Económicos:**
- Crear grupo económico
- Configurar datos básicos (nombre, país, moneda consolidación)
- Ver/editar información del grupo

**Empresas:**
- Crear empresa dentro de grupo
- Configurar: RUT, país, moneda funcional
- Activar/desactivar empresa
- Ver listado de empresas del grupo

**Plan de Cuentas:**
- Seleccionar template inicial o crear desde cero
- Agregar/editar/eliminar cuentas
- Organización jerárquica (padre-hijo)
- Configurar atributos (tipo, imputable, auxiliar, moneda)
- Ver árbol completo del plan de cuentas
- Búsqueda de cuentas por código o nombre

#### 4.1.2 Asientos Contables

**Creación Manual:**
- Formulario para crear asiento
- Agregar múltiples líneas (débito/crédito)
- Selección de cuentas (autocomplete)
- Validación automática de balance
- Guardar como borrador o confirmar
- Editar borradores
- Eliminar borradores

**Templates de Asientos Frecuentes:**
- Pre-configurar asientos comunes:
  - Factura de servicios (local)
  - Factura de exportación
  - Cobro de factura
  - Pago a proveedor
  - Pago de honorarios con IVA
  - Pago de sueldos
  - Pago de impuestos (BPS, DGI)
- Usuario selecciona template → sistema pre-llena asiento
- Solo ingresa montos y referencias
- Configurable por empresa/grupo

**Registro de Operaciones Comunes:**
- **Facturación:** Formulario simplificado → genera asiento
  - Cliente
  - Monto neto
  - IVA (calculado automático)
  - Moneda
  - Genera: Débito CxC + Crédito Ingreso + IVA
  
- **Cobranza:** Formulario simplificado → genera asiento
  - Factura a cobrar (desde lista)
  - Banco/Caja
  - Genera: Débito Banco + Crédito CxC
  
- **Gasto:** Formulario simplificado → genera asiento
  - Tipo de gasto
  - Proveedor
  - Monto
  - IVA (calculado automático)
  - Genera: Débito Gasto + Débito IVA + Crédito Banco/CxP
  
- **Pago:** Formulario simplificado → genera asiento
  - Cuenta a pagar (desde lista)
  - Banco/Caja
  - Genera: Débito CxP + Crédito Banco

#### 4.1.3 Cálculos Automáticos

**IVA:**
- Tasa configurable por país (ej: Uruguay 22%)
- Cálculo automático al ingresar neto
- Cuentas de IVA pre-configuradas:
  - IVA Débito Fiscal (ventas)
  - IVA Crédito Fiscal (compras)
- Liquidación mensual de IVA:
  - Suma débitos (ventas)
  - Suma créditos (compras)
  - Diferencia = A pagar o Saldo a favor

**IRAE (Impuesto a la Renta - Uruguay):**
- Cálculo de anticipos mensuales
- Base imponible: Facturación - Gastos deducibles
- Tasas configurables (12%, 36%, 48% según régimen)
- Liquidación anual
- Tracking de anticipos pagados

**Diferencias de Cambio:**
- Al registrar operación en moneda extranjera:
  - Guardar monto en moneda original
  - Guardar tipo de cambio del día
  - Calcular equivalente en moneda funcional
- Al cobrar/pagar con tipo de cambio diferente:
  - Calcular diferencia
  - Generar asiento automático:
    - Diferencia positiva → Ingreso
    - Diferencia negativa → Gasto

#### 4.1.4 Reportes Básicos

**Balance General:**
- Estructura:
  ```
  ACTIVO
    Activo Corriente
      Disponibilidades: $XXX
      Cuentas por Cobrar: $XXX
    Activo No Corriente: $XXX
  Total Activo: $XXX
  
  PASIVO
    Pasivo Corriente: $XXX
    Pasivo No Corriente: $XXX
  Total Pasivo: $XXX
  
  PATRIMONIO
    Capital: $XXX
    Resultados Acumulados: $XXX
    Resultado del Ejercicio: $XXX
  Total Patrimonio: $XXX
  
  Total Pasivo + Patrimonio: $XXX
  
  ✓ Verificación: Activo = Pasivo + Patrimonio
  ```
- Filtros: Fecha, Empresa, Moneda
- Drill-down: Click en cuenta → ver movimientos

**Estado de Resultados (Pérdidas y Ganancias):**
- Estructura:
  ```
  INGRESOS
    Ingresos por Servicios: $XXX
    Otros Ingresos: $XXX
  Total Ingresos: $XXX
  
  EGRESOS/GASTOS
    Sueldos: $XXX
    Honorarios: $XXX
    Impuestos: $XXX
    Otros Gastos: $XXX
  Total Egresos: $XXX
  
  Resultado del Período: $XXX
  ```
- Filtros: Período (desde-hasta), Empresa, Moneda
- Comparación períodos (opcional)

**Libro Diario:**
- Listado cronológico de todos los asientos
- Columnas:
  - Fecha
  - Nro Asiento
  - Descripción
  - Cuenta
  - Debe
  - Haber
- Filtros: Fecha, Empresa
- Exportar a Excel/PDF

**Libro Mayor por Cuenta:**
- Movimientos de una cuenta específica
- Columnas:
  - Fecha
  - Nro Asiento
  - Descripción
  - Debe
  - Haber
  - Saldo
- Saldo inicial y final
- Filtros: Fecha
- Exportar a Excel/PDF

**Saldos de Bancos:**
- Vista consolidada de todas las cuentas bancarias
- Por cada banco:
  - Nombre
  - Moneda
  - Saldo actual
- Total disponible (convertido a moneda de consolidación)

**Cuentas por Cobrar:**
- Listado de facturas pendientes
- Columnas:
  - Cliente
  - Nro Factura
  - Fecha Emisión
  - Vencimiento
  - Monto
  - Días Vencido
- Total a cobrar
- Aging (0-30, 31-60, 61-90, >90 días)

**Cuentas por Pagar:**
- Listado de obligaciones pendientes
- Estructura similar a CxC
- Total a pagar
- Aging

#### 4.1.5 Multimoneda

**Funcionalidades:**
- Configurar monedas activas del grupo
- Asignar moneda funcional por empresa
- Registrar operaciones en cualquier moneda
- Tipo de cambio:
  - Manual por transacción
  - Fecha del tipo de cambio
- Conversión automática a moneda funcional
- Reportes en:
  - Moneda funcional de la empresa
  - Moneda de consolidación del grupo
  - Moneda seleccionada por usuario

#### 4.1.6 Multiempresa

**Selector de Empresa:**
- Dropdown en navbar
- Cambio de empresa → recarga vista con datos de esa empresa
- Recordar última empresa seleccionada

**Reportes Consolidados:**
- Ver balance/PyG de todas las empresas del grupo
- Conversión a moneda de consolidación
- Eliminación de operaciones inter-empresa (futuro)

**Permisos por Empresa:**
- Usuario puede tener acceso a:
  - Todas las empresas del grupo
  - Solo empresas específicas
- Permisos:
  - Lectura
  - Escritura
  - Admin

#### 4.1.7 Alertas Básicas

**Configurables por usuario:**

- **Facturas vencidas:**
  - Diario: Facturas que vencen hoy
  - Semanal: Resumen de CxC vencido
  
- **Pagos próximos:**
  - Obligaciones que vencen en próximos 7 días
  - Evitar intereses por mora
  
- **Saldo bajo en bancos:**
  - Alerta si saldo < umbral configurado
  - Por banco

**Canales:**
- In-app (notificaciones en la aplicación)
- Email (opcional)

---

### FASE 2: IMPORTACIÓN Y CONCILIACIÓN (2-3 meses)

**Objetivo:** Reducir entrada manual de datos, conciliar con bancos

#### 4.2.1 Importación de Extractos Bancarios

**Formatos Soportados:**
- CSV
- Excel (.xlsx)
- OFX (Open Financial Exchange)

**Proceso:**
1. Usuario sube archivo
2. Sistema parsea columnas (fecha, descripción, monto, saldo)
3. Sistema sugiere categorización (por descripción similar a movimientos anteriores)
4. Usuario confirma/ajusta
5. Sistema genera asientos automáticos

**Configuración:**
- Mapeo de columnas (una vez por banco)
- Reglas de categorización automática:
  - "Transferencia a XXXX" → Pago proveedor
  - "Depósito Ref: FAC-123" → Cobro factura

#### 4.2.2 Conciliación Bancaria

**Vista de Conciliación:**

```
Libro (Sistema)          |  Extracto Bancario
─────────────────────────┼──────────────────────
15/01 Débito  $10,000 ✓  |  15/01 Crédito $10,000 ✓
20/01 Crédito $5,000  ✓  |  20/01 Débito  $5,000  ✓
25/01 Débito  $8,000  ?  |  26/01 Crédito $8,000  ?
                         |  30/01 Cargo  $15     ?

Saldo Libro: $13,000
Saldo Extracto: $12,985
Diferencia: $15 (cargo bancario no registrado)
```

**Funcionalidades:**
- Match automático por monto y fecha (±2 días)
- Match manual (drag & drop)
- Marcar transacciones como "conciliadas"
- Generar asientos para diferencias:
  - Cargos bancarios
  - Intereses
  - Errores

**Estado:**
- Verde: Conciliado
- Amarillo: Diferencias menores
- Rojo: Diferencias significativas

---

### FASE 3: UX Y ANÁLISIS (2-3 meses)

**Objetivo:** Sistema profesional con analytics

#### 4.3.1 Dashboard Ejecutivo

**Widgets:**

1. **KPIs Principales:**
   - Total Activo
   - Total Pasivo
   - Patrimonio Neto
   - Liquidez (Activo Corriente / Pasivo Corriente)

2. **Gráfico Ingresos vs Gastos (últimos 12 meses):**
   - Barras o línea
   - Comparación mes a mes

3. **Evolución Patrimonio:**
   - Línea temporal
   - Ver crecimiento/decrecimiento

4. **Top 5 Clientes (por facturación):**
   - Tabla con monto YTD

5. **Top 5 Gastos (por categoría):**
   - Pie chart

6. **Estado de CxC:**
   - Monto total
   - Aging breakdown

7. **Estado de CxP:**
   - Monto total
   - Próximos vencimientos

**Filtros Globales:**
- Rango de fechas
- Empresa
- Moneda

#### 4.3.2 Reportes Avanzados

**Flujo de Caja Proyectado:**
- Saldo inicial bancos
- + Cobranzas proyectadas (por fecha de vencimiento)
- - Pagos proyectados (por fecha de vencimiento)
- = Saldo proyectado
- Por día/semana/mes (próximos 90 días)

**Análisis por Cliente/Proyecto:**
- Ingresos por cliente (período)
- Gastos asociados (si se trackean)
- Margen
- Ranking de clientes

**Rentabilidad por Centro de Costo:**
- Ingresos por centro (Uruguay, Colombia)
- Gastos por centro
- Resultado por centro

**Gráficos Interactivos:**
- Click en barra/porción → drill-down a detalle
- Filtros dinámicos
- Export a imagen/PDF

#### 4.3.3 Mejoras de UX

**Búsqueda Global:**
- Buscador tipo Spotlight/Cmd+K
- Busca en:
  - Asientos (por descripción, monto)
  - Clientes/Proveedores
  - Facturas
  - Cuentas contables

**Atajos de Teclado:**
- `N`: Nuevo asiento
- `F`: Nueva factura
- `P`: Nuevo pago
- `/`: Búsqueda
- `G + B`: Ir a Balance
- `G + D`: Ir a Dashboard

**Entrada Rápida:**
- Formularios optimizados
- Autocompletado inteligente
- Guardar con Enter
- Navegación con Tab

**Favoritos/Recientes:**
- Cuentas más usadas
- Últimos asientos
- Acceso rápido

---

### FASE 4: INTEGRACIONES (2-3 meses)

**Objetivo:** Conectar con mundo exterior

#### 4.4.1 Integración Bancaria (APIs)

**Bancos Soportados (Uruguay):**
- Santander
- ITAU
- BROU (Banco República)

**Funcionalidades:**
- Sincronización automática de movimientos (diaria)
- Notificaciones de nuevos movimientos
- Saldos actualizados en tiempo real

**Seguridad:**
- OAuth 2.0
- Conexión encriptada
- Permisos solo lectura

#### 4.4.2 Integración DGI (Uruguay)

**e-Factura:**
- Envío de CFE (Comprobante Fiscal Electrónico)
- Validación online
- Almacenamiento de XML

**Consulta de Certificados:**
- Download automático de certificados recibidos
- Imputación sugerida a CxC

**Retenciones:**
- Descarga de retenciones recibidas
- Generación de reportes para DDJJ

#### 4.4.3 Facturación Electrónica

**Generación de Facturas:**
- Formulario en el sistema
- Generación de PDF profesional
- Envío automático por email al cliente
- Almacenamiento en Storage

**Datos de Factura:**
- Logo empresa
- Datos fiscales
- Detalle de servicios
- Subtotal, IVA, Total
- Condiciones de pago

#### 4.4.4 Exportación Contable

**Formatos:**
- Excel (para contador externo)
- CSV
- JSON (para otros sistemas)

**Reportes Exportables:**
- Libro Diario
- Libro Mayor
- Balance de Sumas y Saldos
- Listados auxiliares (CxC, CxP)

---

### FASE 5: ENTERPRISE (3+ meses)

**Objetivo:** Features avanzados para empresas grandes

#### 4.5.1 Presupuesto

**Definición de Presupuesto:**
- Por cuenta contable
- Por período (mensual/anual)
- Por empresa

**Comparación Real vs Presupuesto:**
- Reportes de desviaciones
- Gráficos
- Alertas si excede presupuesto

#### 4.5.2 Proyecciones y Escenarios

**Flujo de Caja Proyectado Avanzado:**
- Múltiples escenarios:
  - Optimista
  - Base
  - Pesimista
- Variables configurables:
  - Crecimiento de ventas
  - Nuevos clientes
  - Nuevos gastos

**Análisis de Sensibilidad:**
- Cambiar parámetros → ver impacto en:
  - Liquidez
  - Rentabilidad
  - Punto de equilibrio

#### 4.5.3 Control de Proyectos

**Tracking de Horas:**
- Registro de horas por proyecto
- Por empleado
- Categoría (desarrollo, diseño, reunión)

**Facturación por Proyecto:**
- Facturar horas acumuladas
- Tarifas por rol/empleado
- Generar factura desde proyecto

**Rentabilidad por Proyecto:**
- Ingresos del proyecto
- Gastos directos (horas × tarifa)
- Gastos indirectos (proporción)
- Margen

#### 4.5.4 Auditoría Completa

**Log de Cambios:**
- Tabla de auditoría para cada entidad
- Campos:
  - Usuario
  - Fecha/hora
  - Acción (crear, modificar, eliminar)
  - Valores anteriores
  - Valores nuevos

**Reversión de Cambios:**
- Ver historial de un asiento
- Revertir a versión anterior (crea contra-asiento)

**Reportes de Auditoría:**
- Movimientos por usuario
- Cambios en período
- Asientos modificados/eliminados

#### 4.5.5 Roles y Permisos Granulares

**Roles Predefinidos:**
- Super Admin (todo)
- Admin de Grupo (todo en su grupo)
- Contador (lectura/escritura contabilidad)
- Operativo (crear facturas, gastos)
- Solo Lectura (reportes)

**Permisos por Módulo:**
- Dashboard: Ver
- Asientos: Ver, Crear, Editar, Eliminar
- Facturas: Ver, Crear, Editar, Eliminar
- Reportes: Ver, Exportar
- Configuración: Ver, Editar
- Usuarios: Gestionar

**Workflows de Aprobación:**
- Asientos >$X requieren aprobación
- Facturas >$Y requieren aprobación
- Pagos requieren doble firma (2 aprobadores)

#### 4.5.6 API Pública

**Endpoints:**
- GET /api/balance
- GET /api/asientos
- POST /api/asientos
- GET /api/reportes/pyg

**Autenticación:**
- API Keys
- OAuth 2.0

**Rate Limiting:**
- Por API key
- Prevenir abuso

**Webhooks:**
- Notificar a sistemas externos cuando:
  - Se crea un asiento
  - Se registra una factura
  - Se hace un pago

**Documentación:**
- OpenAPI/Swagger
- Ejemplos de código
- Playground interactivo

---

## 5. CASOS DE USO

### 5.1 Caso de Uso: Registrar Factura de Servicios

**Actor:** Contador

**Precondiciones:**
- Usuario autenticado
- Empresa seleccionada
- Cliente existe en el sistema

**Flujo Principal:**

1. Usuario hace click en "Nueva Factura"
2. Sistema muestra formulario
3. Usuario selecciona:
   - Cliente: "UXDivers"
   - Fecha: 2025-01-15
   - Concepto: "Desarrollo software enero"
   - Monto neto: $10,000
   - Moneda: USD
4. Sistema calcula automáticamente:
   - IVA: $2,200 (22%)
   - Total: $12,200
5. Usuario hace click en "Guardar"
6. Sistema genera asiento automático:
   ```
   DÉBITO:  CxC - UXDivers           $12,200
   CRÉDITO: Ingresos por Servicios   $10,000
   CRÉDITO: IVA Débito Fiscal        $2,200
   ```
7. Sistema confirma: "Factura #123 registrada"

**Postcondiciones:**
- Asiento creado y confirmado
- Balance actualizado
- CxC aumentó en $12,200
- Factura visible en listado de CxC

---

### 5.2 Caso de Uso: Cobrar Factura

**Actor:** Operativo

**Precondiciones:**
- Factura registrada y pendiente de cobro
- Banco configurado

**Flujo Principal:**

1. Usuario navega a "Cuentas por Cobrar"
2. Ve listado de facturas pendientes
3. Selecciona Factura #123 (Cliente: UXDivers, Monto: $12,200)
4. Click en "Registrar Cobro"
5. Sistema muestra formulario pre-llenado:
   - Cliente: UXDivers
   - Monto: $12,200
   - Factura: #123
6. Usuario selecciona:
   - Banco: Santander USD
   - Fecha: 2025-01-20
7. Click en "Guardar"
8. Sistema genera asiento:
   ```
   DÉBITO:  Banco Santander USD      $12,200
   CRÉDITO: CxC - UXDivers           $12,200
   ```
9. Sistema marca factura como "Cobrada"

**Postcondiciones:**
- Saldo banco aumentó
- CxC disminuyó
- Factura #123 ya no aparece en pendientes

---

### 5.3 Caso de Uso: Pagar Gasto con IVA

**Actor:** Contador

**Precondiciones:**
- Empresa seleccionada
- Proveedor existe

**Flujo Principal:**

1. Usuario click en "Nuevo Gasto"
2. Formulario:
   - Proveedor: "Software Inc"
   - Concepto: "Licencia Figma anual"
   - Monto neto: $500
   - IVA: 22% → $110 (calculado auto)
   - Total: $610
   - Banco: Santander USD
   - Fecha: 2025-01-25
3. Click "Guardar y Pagar"
4. Sistema genera asiento:
   ```
   DÉBITO:  Gastos en Software       $500
   DÉBITO:  IVA Crédito Fiscal       $110
   CRÉDITO: Banco Santander USD      $610
   ```

**Postcondiciones:**
- Gasto registrado
- IVA crédito aumentó (recuperable)
- Saldo banco disminuyó

---

### 5.4 Caso de Uso: Ver Balance General

**Actor:** Admin

**Flujo Principal:**

1. Usuario navega a "Reportes" → "Balance General"
2. Selecciona filtros:
   - Fecha: 31/12/2024
   - Empresa: Pragmatic Uruguay
   - Moneda: USD
3. Sistema calcula saldos de todas las cuentas
4. Muestra reporte estructurado:
   ```
   ACTIVO
     Activo Corriente
       Disponibilidades
         Banco Santander USD: $25,000
         Banco ITAU USD: $10,000
       Cuentas por Cobrar
         CxC - UXDivers: $15,000
         CxC - Mevir: $8,000
     Total Activo: $58,000
   
   PASIVO
     Pasivo Corriente
       Cuentas por Pagar: $5,000
       IVA a Pagar: $2,000
     Total Pasivo: $7,000
   
   PATRIMONIO
     Capital: $30,000
     Resultados Acumulados: $10,000
     Resultado del Ejercicio: $11,000
   Total Patrimonio: $51,000
   
   Total Pasivo + Patrimonio: $58,000 ✓
   ```
5. Usuario puede:
   - Click en cuenta → drill-down a movimientos
   - Export a PDF/Excel
   - Compartir por email

---

## 6. FLUJOS DE TRABAJO

### 6.1 Flujo: Ciclo de Facturación y Cobro

```
┌──────────────────────────────────────────────────────┐
│ 1. PRESTACIÓN DEL SERVICIO                          │
│    (Fuera del sistema)                               │
└────────────────┬─────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────┐
│ 2. REGISTRAR FACTURA                                 │
│    Usuario: Operativo/Contador                      │
│    ┌────────────────────────────────────────┐       │
│    │ • Seleccionar cliente                  │       │
│    │ • Ingresar concepto y monto            │       │
│    │ • Sistema calcula IVA                  │       │
│    │ • Generar asiento automático:          │       │
│    │   DÉBITO:  CxC                         │       │
│    │   CRÉDITO: Ingreso + IVA               │       │
│    └────────────────────────────────────────┘       │
└────────────────┬─────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────┐
│ 3. FACTURA QUEDA PENDIENTE DE COBRO                 │
│    • Visible en "Cuentas por Cobrar"                │
│    • Alerta si vence y no se cobra                  │
└────────────────┬─────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────┐
│ 4. CLIENTE PAGA                                      │
│    (Depósito bancario o transferencia)              │
└────────────────┬─────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────┐
│ 5. REGISTRAR COBRO                                   │
│    Usuario: Operativo/Contador                      │
│    ┌────────────────────────────────────────┐       │
│    │ • Seleccionar factura pendiente        │       │
│    │ • Seleccionar banco donde se recibió   │       │
│    │ • Sistema genera asiento:              │       │
│    │   DÉBITO:  Banco                       │       │
│    │   CRÉDITO: CxC                         │       │
│    └────────────────────────────────────────┘       │
└────────────────┬─────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────┐
│ 6. FACTURA MARCADA COMO COBRADA                     │
│    • Ya no aparece en pendientes                     │
│    • Saldo de banco actualizado                      │
│    • CxC disminuye                                   │
└──────────────────────────────────────────────────────┘
```

### 6.2 Flujo: Ciclo de Gastos y Pagos

```
┌──────────────────────────────────────────────────────┐
│ 1. RECIBIR FACTURA/SERVICIO DE PROVEEDOR           │
└────────────────┬─────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────┐
│ 2. REGISTRAR GASTO                                   │
│    ┌────────────────────────────────────────┐       │
│    │ • Proveedor                            │       │
│    │ • Concepto                             │       │
│    │ • Monto + IVA                          │       │
│    │ • ¿Pagar ahora o después?              │       │
│    └────────────────────────────────────────┘       │
└────────────────┬─────────────────────────────────────┘
                 ↓
         ┌───────┴────────┐
         ↓                ↓
┌────────────────┐  ┌─────────────────┐
│ A. PAGAR AHORA │  │ B. PAGAR DESPUÉS│
│                │  │                 │
│ Asiento:       │  │ Asiento:        │
│ DÉBITO: Gasto  │  │ DÉBITO: Gasto   │
│ DÉBITO: IVA    │  │ DÉBITO: IVA     │
│ CRÉDITO: Banco │  │ CRÉDITO: CxP    │
└────────────────┘  └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │ Queda en CxP    │
                    │ (pendiente pago)│
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │ Cuando se paga: │
                    │ DÉBITO: CxP     │
                    │ CRÉDITO: Banco  │
                    └─────────────────┘
```

### 6.3 Flujo: Cierre Mensual

```
┌──────────────────────────────────────────────────────┐
│ 1. FIN DE MES                                        │
└────────────────┬─────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────┐
│ 2. CONCILIACIÓN BANCARIA                            │
│    • Comparar libro vs extracto                      │
│    • Identificar diferencias                         │
│    • Ajustar (cargos bancarios, etc.)               │
└────────────────┬─────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────┐
│ 3. LIQUIDACIÓN DE IVA                               │
│    • Sistema calcula:                                │
│      IVA Débito (ventas) - IVA Crédito (compras)   │
│    • Resultado = A pagar o Saldo a favor            │
│    • Si a pagar:                                     │
│      DÉBITO:  IVA Débito                            │
│      CRÉDITO: IVA Crédito                           │
│      CRÉDITO: IVA a Pagar                           │
└────────────────┬─────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────┐
│ 4. CÁLCULO DE IRAE (anticipo mensual)               │
│    • Base: Ingresos del mes                          │
│    • Tasa según régimen                              │
│    • Generar asiento anticipo                        │
└────────────────┬─────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────┐
│ 5. GENERAR REPORTES                                  │
│    • Balance del mes                                 │
│    • Estado de Resultados                            │
│    • Flujo de caja                                   │
└────────────────┬─────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────┐
│ 6. REVISIÓN Y CIERRE                                │
│    • Contador revisa                                 │
│    • Ajustes si es necesario                         │
│    • "Cerrar" período (opcional, impide cambios)    │
└──────────────────────────────────────────────────────┘
```

---

## 7. MODELO DE DATOS

### 7.1 Diagrama Entidad-Relación Simplificado

```
┌─────────────────────┐
│ GRUPO_ECONOMICO     │
│ ─────────────────── │
│ id                  │
│ nombre              │
│ rut_controlador     │
│ pais_principal      │
│ moneda_consolidacion│
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐         ┌──────────────────┐
│ EMPRESA             │         │ PLAN_CUENTAS     │
│ ─────────────────── │         │ ──────────────── │
│ id                  │         │ id               │
│ grupo_economico_id  │─────────│ grupo_economico  │
│ nombre              │    1:N  │ codigo           │
│ rut                 │         │ nombre           │
│ pais                │         │ tipo             │
│ moneda_funcional    │         │ nivel            │
└──────────┬──────────┘         │ imputable        │
           │                    │ requiere_auxiliar│
           │ 1:N                └──────────────────┘
           │
┌──────────▼──────────┐
│ ASIENTO             │
│ ─────────────────── │
│ id                  │
│ empresa_id          │
│ numero              │
│ fecha               │
│ descripcion         │
│ tipo                │
│ estado              │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│ LINEA_ASIENTO       │
│ ─────────────────── │
│ id                  │
│ asiento_id          │
│ cuenta_id           │─────→ PLAN_CUENTAS
│ debe                │
│ haber               │
│ moneda              │
│ tipo_cambio         │
│ auxiliar_tipo       │
│ auxiliar_id         │
└─────────────────────┘
```

### 7.2 Entidades Principales

#### GRUPO_ECONOMICO
```
id: INTEGER (PK)
nombre: VARCHAR(200)
rut_controlador: VARCHAR(50)
pais_principal: VARCHAR(2)
moneda_consolidacion: VARCHAR(3)
fecha_creacion: TIMESTAMP
activo: BOOLEAN
```

#### EMPRESA
```
id: INTEGER (PK)
grupo_economico_id: INTEGER (FK)
nombre: VARCHAR(200)
nombre_comercial: VARCHAR(200)
rut: VARCHAR(50)
pais: VARCHAR(2)
moneda_funcional: VARCHAR(3)
fecha_inicio: DATE
activa: BOOLEAN
```

#### PLAN_CUENTAS
```
id: INTEGER (PK)
grupo_economico_id: INTEGER (FK)
codigo: VARCHAR(20) UNIQUE per grupo
nombre: VARCHAR(200)
cuenta_padre_id: INTEGER (FK self)
tipo: ENUM (activo, pasivo, patrimonio, ingreso, egreso)
nivel: INTEGER
imputable: BOOLEAN
requiere_auxiliar: BOOLEAN
tipo_auxiliar: VARCHAR(50)
moneda: ENUM (MN, USD, AMBAS, FUNCIONAL)
activa: BOOLEAN
```

#### ASIENTO
```
id: INTEGER (PK)
grupo_economico_id: INTEGER (FK)
empresa_id: INTEGER (FK)
numero: INTEGER (unique per empresa)
fecha: DATE
descripcion: TEXT
tipo: ENUM (diario, apertura, ajuste, cierre)
estado: ENUM (borrador, confirmado)
creado_por: INTEGER (FK usuario)
creado_en: TIMESTAMP
modificado_en: TIMESTAMP
```

#### LINEA_ASIENTO
```
id: INTEGER (PK)
asiento_id: INTEGER (FK)
cuenta_id: INTEGER (FK plan_cuentas)
debe: DECIMAL(18,2)
haber: DECIMAL(18,2)
moneda: VARCHAR(3)
tipo_cambio: DECIMAL(10,4)
auxiliar_tipo: VARCHAR(50)
auxiliar_id: INTEGER
centro_costo: VARCHAR(100)
glosa: TEXT

CONSTRAINTS:
- debe >= 0 AND haber >= 0
- debe > 0 OR haber > 0
- NOT (debe > 0 AND haber > 0)
```

#### USUARIO
```
id: INTEGER (PK)
email: VARCHAR(255) UNIQUE
nombre: VARCHAR(200)
auth_provider_id: VARCHAR(255)
activo: BOOLEAN
```

#### USUARIO_GRUPO
```
usuario_id: INTEGER (FK)
grupo_economico_id: INTEGER (FK)
rol: ENUM (admin, contador, operativo, lectura)

PK: (usuario_id, grupo_economico_id)
```

#### USUARIO_EMPRESA
```
usuario_id: INTEGER (FK)
empresa_id: INTEGER (FK)
puede_escribir: BOOLEAN

PK: (usuario_id, empresa_id)
```

#### CLIENTE
```
id: INTEGER (PK)
grupo_economico_id: INTEGER (FK)
nombre: VARCHAR(200)
rut: VARCHAR(50)
email: VARCHAR(255)
telefono: VARCHAR(50)
direccion: TEXT
activo: BOOLEAN
```

#### PROVEEDOR
```
id: INTEGER (PK)
grupo_economico_id: INTEGER (FK)
nombre: VARCHAR(200)
rut: VARCHAR(50)
email: VARCHAR(255)
telefono: VARCHAR(50)
direccion: TEXT
activo: BOOLEAN
```

---

## 8. REGLAS DE NEGOCIO

### 8.1 Validaciones de Asientos

**RN-001: Balance Obligatorio**
- Todo asiento debe cumplir: ∑ DEBE = ∑ HABER
- Si no balancea, sistema no permite guardar

**RN-002: Cuentas Imputables**
- Solo se puede usar cuentas con `imputable = true`
- Cuentas padre (agrupadores) no aceptan movimientos

**RN-003: Auxiliar Obligatorio**
- Si cuenta tiene `requiere_auxiliar = true`, se debe especificar:
  - Tipo (cliente, proveedor, empleado)
  - ID del auxiliar

**RN-004: Moneda y Tipo de Cambio**
- Si moneda ≠ moneda funcional de empresa:
  - Tipo de cambio es obligatorio
  - Sistema calcula equivalente en moneda funcional

**RN-005: Fecha**
- Fecha no puede ser futura (configurable)
- Fecha no puede ser de período cerrado (si se cierra)

### 8.2 Reglas de IVA

**RN-100: Tasa de IVA**
- Uruguay: 22% por defecto
- Configurable por país/empresa
- Puede haber operaciones exentas (tasa 0%)

**RN-101: Cálculo de IVA**
```
IVA = NETO × TASA
TOTAL = NETO + IVA
```

**RN-102: Recuperación de IVA**
- IVA en compras → IVA Crédito Fiscal (activo)
- IVA en ventas → IVA Débito Fiscal (pasivo)
- Liquidación: Débito - Crédito = A pagar (o saldo a favor)

### 8.3 Reglas de Multimoneda

**RN-200: Conversión Automática**
- Al registrar operación en moneda extranjera:
  - Guardar monto original
  - Guardar tipo de cambio
  - Calcular y guardar equivalente en moneda funcional

**RN-201: Diferencia de Cambio**
- Si se cobra/paga con T/C diferente al registro:
  - Calcular diferencia: (Monto × T/C nuevo) - (Monto × T/C original)
  - Si diferencia > 0 → Ingreso por diferencia de cambio
  - Si diferencia < 0 → Gasto por diferencia de cambio
  - Generar asiento automático

**RN-202: Reportes en Múltiples Monedas**
- Usuario puede ver reportes en:
  - Moneda funcional de la empresa
  - Moneda de consolidación del grupo
  - Cualquier moneda configurada
- Conversión usa tipo de cambio de la fecha del reporte

### 8.4 Reglas de Permisos

**RN-300: Acceso por Grupo**
- Usuario solo ve datos de grupos económicos a los que tiene acceso

**RN-301: Acceso por Empresa**
- Usuario puede tener acceso a:
  - Todas las empresas del grupo (Admin)
  - Solo empresas específicas
- Permisos: lectura y/o escritura

**RN-302: Modificación de Asientos**
- Solo borradores pueden editarse
- Asientos confirmados:
  - No se pueden editar directamente
  - Se pueden revertir (genera contra-asiento)
  - Se pueden ajustar (genera asiento de ajuste)

### 8.5 Reglas de Consolidación

**RN-400: Conversión de Monedas**
- Al consolidar, convertir todas las monedas a moneda de consolidación
- Usar tipo de cambio de la fecha del reporte

**RN-401: Eliminación Inter-empresa (Futuro)**
- Operaciones entre empresas del mismo grupo deben eliminarse
- Ejemplo:
  - Empresa A presta a Empresa B: $10,000
  - En consolidado: préstamo se elimina (es interno al grupo)

---

## 9. GLOSARIO

| Término | Definición |
|---------|------------|
| **Partida Doble** | Sistema contable donde cada operación afecta al menos dos cuentas: una con débito y otra con crédito, manteniendo siempre el balance |
| **Débito** | Anotación en el lado izquierdo de una cuenta. Aumenta activos y gastos, disminuye pasivos e ingresos |
| **Crédito** | Anotación en el lado derecho de una cuenta. Aumenta pasivos e ingresos, disminuye activos y gastos |
| **Asiento Contable** | Registro de una operación económica según partida doble, con fecha, descripción y líneas de débito/crédito |
| **Grupo Económico** | Conjunto de empresas relacionadas que comparten plan de cuentas y se consolidan |
| **Plan de Cuentas** | Estructura jerárquica de cuentas contables (activo, pasivo, patrimonio, ingresos, gastos) |
| **Cuenta Imputable** | Cuenta que acepta movimientos (asientos). Las cuentas padre solo agrupan |
| **Auxiliar** | Detalle adicional en un movimiento (cliente, proveedor, empleado) |
| **Moneda Funcional** | Moneda principal de operación de una empresa |
| **Tipo de Cambio** | Tasa de conversión entre dos monedas en una fecha específica |
| **IVA** | Impuesto al Valor Agregado. Impuesto sobre ventas |
| **IVA Débito Fiscal** | IVA cobrado en ventas (pasivo) |
| **IVA Crédito Fiscal** | IVA pagado en compras (activo, recuperable) |
| **IRAE** | Impuesto a la Renta de Actividades Económicas (Uruguay). Impuesto sobre ganancias |
| **Balance General** | Reporte que muestra activos, pasivos y patrimonio en una fecha |
| **Estado de Resultados** | Reporte que muestra ingresos, gastos y resultado en un período |
| **Libro Diario** | Listado cronológico de todos los asientos |
| **Libro Mayor** | Movimientos de una cuenta específica |
| **CxC** | Cuentas por Cobrar. Dinero que clientes deben |
| **CxP** | Cuentas por Pagar. Dinero que empresa debe a proveedores |
| **Template de Asiento** | Asiento pre-configurado para operaciones frecuentes |
| **Conciliación Bancaria** | Proceso de comparar libro contable vs extracto bancario |
| **Liquidez** | Capacidad de pagar obligaciones de corto plazo |
| **Patrimonio Neto** | Activo - Pasivo. Valor neto de la empresa |

---

## 10. ANEXOS

### 10.1 Ejemplo de Plan de Cuentas Completo

Ver documento separado: `PLAN-DE-CUENTAS-EJEMPLO.md`

### 10.2 Casos de Prueba

Ver documento separado: `CASOS-DE-PRUEBA.md`

### 10.3 Roadmap Visual

```
2025
├─ Q1: Fase 1 (Core)
│  ├─ Enero: Setup proyecto, modelo de datos
│  ├─ Febrero: CRUD básico, asientos manuales
│  └─ Marzo: Templates, cálculos auto, reportes
│
├─ Q2: Fase 1 (cont.) + Fase 2
│  ├─ Abril: Alertas, multimoneda avanzado
│  ├─ Mayo: Importación extractos
│  └─ Junio: Conciliación bancaria
│
├─ Q3: Fase 3
│  ├─ Julio: Dashboard
│  ├─ Agosto: Reportes avanzados
│  └─ Septiembre: UX improvements
│
└─ Q4: Fase 4
   ├─ Octubre: Integraciones bancarias
   ├─ Noviembre: Integración DGI
   └─ Diciembre: Facturación electrónica

2026
└─ Q1+: Fase 5 (Enterprise features)
```

---

**Fin del Documento de Diseño Funcional**

> Este documento es la guía principal para el desarrollo del sistema. Todas las decisiones de diseño y funcionalidad deben referirse a este documento.

---

**Próximos pasos:**
1. Revisar y aprobar este diseño funcional
2. Diseño técnico detallado (ver documento técnico)
3. Setup del proyecto
4. Inicio del desarrollo (Fase 1)

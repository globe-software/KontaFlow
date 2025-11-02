# Análisis del Sistema de Contabilidad PRAGMATIC

## 1. VISIÓN GENERAL

Este es un sistema de contabilidad construido en Excel para gestionar las finanzas de una empresa de servicios (posiblemente desarrollo de software), con operaciones en Uruguay y Colombia, que factura tanto en pesos uruguayos como en dólares.

### Características principales:
- **Multimoneda**: Maneja pesos uruguayos ($), dólares (u$s) y pesos colombianos (COP)
- **Multicuenta**: Gestiona múltiples cuentas bancarias (Santander, ITAU, Mercury, Payoneer)
- **Multi-país**: Opera en Uruguay y Colombia
- **Alcance**: 2022-2025 (datos históricos y actuales)

---

## 2. ESTRUCTURA DE HOJAS

### 2.1 **Resumen** (Hoja principal)
**Propósito**: Dashboard consolidado con vista de activos, pasivos y simulaciones

**Secciones principales**:

#### A) Facturación anual por año
- Facturación 2023, 2024, 2025 en $ y u$s
- Tipo de cambio y conversiones
- Total ingresos menos egresos

#### B) ACTIVO
- **Cuentas corrientes**: Santander m/n, Santander u$s, ITAU $, ITAU u$s, Mercury U$S, Payoneer U$S
- **Cuentas por cobrar**: Facturas a cobrar, Certificados
- **Préstamos a cobrar**
- **Otros**: Caja chica, IRNR a recuperar, Utilidades retiradas
- **Total activo**: Calculado automáticamente

#### C) PASIVO
- Cobranzas sin imputar
- IVA a pagar m/n
- IRAE a pagar fin año
- Impuesto patrimonio
- Préstamos a pagar
- Cuentas a pagar
- Licencias a pagar
- **Total pasivo**: Calculado automáticamente

#### D) Columnas de simulación
- Permite simular escenarios aplicando cambios manuales
- Columnas grises marcadas como "se cargan manualmente para simular"

**Flujo de datos**: Esta hoja CONSUME datos de todas las demás mediante fórmulas

---

### 2.2 **Facturacion** (Detalle de facturas)
**Propósito**: Registro transaccional de cada factura emitida

**Campos principales**:
- Número de factura (A001, A002, etc.)
- Cliente (UXDivers, Mevir, Ingesol, etc.)
- Fecha (mes)
- Centro de Costos
- Tema/Concepto
- **Montos**:
  - Neto m/n (moneda nacional)
  - Neto u$s
  - IVA
  - Monto total
- **Estado**:
  - Cobrado? (S/N)
  - Pagado? (S/N)
  - Exonerado (S/N)
- **Conversiones**:
  - Tipo de cambio (t/c)
  - Convertido a $
- **Cuentas por cobrar**:
  - A cobrar $
  - A cobrar u$s
  - A cuenta $

**Observaciones**:
- Hay facturas negativas (correcciones/anulaciones)
- Aproximadamente 1,186 filas de datos
- Mezcla facturas en pesos y dólares

---

### 2.3 **FacAnual** (Resumen anual de facturación)
**Propósito**: Consolidación mensual y anual de la facturación

**Estructura**:
- **Por mes**: Enero a Diciembre
- **Columnas**:
  - Monto s/IVA en $ y U$S
  - Conversión a $
  - Tipo de cambio
  - Totales en $ y U$S
  - Diferencia UCFE (Unidades de Contabilidad Fiscal Especial)
- **Totales anuales**: Total facturado en ambas monedas
- **Promedio mensual**: Calculado automáticamente

**Observaciones**:
- Muestra diferencias de tipo de cambio
- Incluye notas sobre facturas de exportación
- Permite análisis de estacionalidad

---

### 2.4 **Gastos** (Registro de egresos)
**Propósito**: Registro detallado de todos los gastos de la empresa

**Campos principales**:
- Año
- Fecha de pago
- **Centro de Costo**: Uruguay, Colombia
- **Tipo de Gasto**:
  - Hardware
  - Honorarios Profesionales
  - Sueldos
  - Impuestos
  - Varios
  - Transferencias
- Proveedor
- Concepto
- **Montos**:
  - Total COP $ (pesos colombianos)
  - Total U$S, Neto U$S
  - Total $, Neto $, IVA $
- Tipo de cambio (T/C)

**Observaciones**:
- Aproximadamente 1,460 filas
- Gastos en tres monedas: $, u$s, COP
- Incluye pagos a proveedores, honorarios, sueldos, impuestos (BPS, DGI)
- Distingue entre neto e IVA

---

### 2.5 **CtaCteMN** (Cuenta Corriente Moneda Nacional)
**Propósito**: Movimientos de cuentas bancarias en pesos uruguayos

**Bancos incluidos**:
- **Santander**: 
  - Saldo inicial y actual
  - Disponible: $169,960.10
- **ITAU**:
  - Saldo inicial y actual
  - Disponible: $0

**Columnas**:
- Mes/Fecha
- Crédito (entradas)
- Débito (salidas)
- Concepto
- Nota
- Disponible (saldo corriente)

**Tipos de transacciones**:
- Compra de pesos
- Pagos de honorarios
- Pagos de facturas (referenciadas)
- Pagos de impuestos (BPS, DGI)
- Costos de transferencia

---

### 2.6 **CtaCteUSS** (Cuenta Corriente Dólares)
**Propósito**: Movimientos de cuentas bancarias en dólares

**Bancos incluidos**:
- **Santander u$s**: Disponible: $9,236.38
- **ITAU u$s**: Disponible: $29,377.60
- **Mercury U$S**: $0 (saldo negativo: -$16,753.33)
- **Payoneer U$S**: $41.96

**Estructura similar** a CtaCteMN:
- Fecha
- Crédito/Débito
- Concepto
- Referencias a facturas

**Tipos de transacciones**:
- Pagos de clientes (UXDivers principalmente)
- Venta de dólares
- Honorarios a profesionales
- Costos de transferencia
- Traspasos entre cuentas

---

### 2.7 **IRAE** (Impuesto a las Rentas de Actividades Económicas)
**Propósito**: Cálculo del IRAE (impuesto sobre la renta en Uruguay)

**Estructura**:
- **Por mes**: Facturación mensual en $
- **Anticipos IRAE**: Pagos mensuales adelantados
- **Coeficientes IRAE**:
  - 0.12
  - 0.36
  - 0.48
- **Cálculos**:
  - IRAE sin deducciones
  - IRAE con deducciones en u$s
  - Tipo de cambio
  - Aporte patronal
- **Totales**:
  - Total anticipado
  - Saldo anterior de IRAE
  - Total IRAE con deducciones

**PROBLEMA CRÍTICO**:
- **11 errores #REF!** en la columna H (tipo de cambio)
- Fórmulas rotas que impiden cálculos correctos
- Afecta filas 4-14

---

### 2.8 **CertificadosFinal** (Gestión de certificados)
**Propósito**: Control de certificados de retención de IVA

**Campos**:
- Mes
- **Facturas**:
  - Monto IVA Factura
  - Cliente
  - Saldo Pendiente
- **Certificados**:
  - Total certificado
  - Nº Certificado
  - Fecha de transacción
  - Nº Boleto
  - Intervención
  - Emitido (S/N)
  - Uso mes
  - IVA
  - IRNR (Impuesto a la Renta de No Residentes)

**Observaciones**:
- Principalmente para cliente UXDivers
- Vincula facturas con certificados DGI
- Importante para recuperación de IVA
- Aproximadamente 1,003 filas

---

### 2.9 **Prestamos** (Gestión de préstamos)
**Propósito**: Control de préstamos otorgados y recibidos

**Dos secciones**:

#### A) Préstamos a pagar
- Fecha
- Concepto
- Monto $
- Pagado S/N
- A Pagar $
- A Cobrar $

#### B) Préstamos a cobrar
- Fecha
- Concepto (ejemplo: "préstamo socio", "retiro caja", "devolución iva porto")
- Monto $
- Cobrado S/N

**Observaciones**:
- Actualmente sin préstamos pendientes a pagar
- Historial de préstamos cobrados
- También maneja devoluciones y retiros

---

### 2.10 **APagar** (Cuentas a Pagar)
**Propósito**: Control de obligaciones pendientes

**Dos secciones**:

#### A) Cuentas a pagar MN (moneda nacional)
- Fecha
- Proveedor (A Signum, Oscar, Aporte socios)
- Concepto
- Monto $
- Pagado (S/N)
- A Pagar $

#### B) Cuentas a pagar u$s
- Misma estructura
- A pagar u$s: $5,750

**Tipos de pagos**:
- Servicios legales (escribano, certificados)
- Pagos a DGI
- Compra de dólares
- Aportes de socios

---

## 3. FLUJO DE DATOS

```
ENTRADA DE DATOS (Registro manual)
    ↓
┌─────────────────────────────────────────────────────┐
│ HOJAS DE DETALLE (Transacciones)                    │
│ • Facturacion (ingresos)                            │
│ • Gastos (egresos)                                  │
│ • CtaCteMN, CtaCteUSS (movimientos bancarios)       │
│ • APagar (obligaciones)                             │
│ • Prestamos (préstamos)                             │
│ • CertificadosFinal (certificados)                  │
└─────────────────────────────────────────────────────┘
    ↓ (mediante fórmulas)
┌─────────────────────────────────────────────────────┐
│ HOJAS DE CONSOLIDACIÓN                              │
│ • FacAnual (resumen anual)                          │
│ • IRAE (cálculos impositivos)                       │
└─────────────────────────────────────────────────────┘
    ↓ (mediante fórmulas)
┌─────────────────────────────────────────────────────┐
│ HOJA RESUMEN (Dashboard ejecutivo)                  │
│ • Activo consolidado                                │
│ • Pasivo consolidado                                │
│ • Simulaciones                                      │
└─────────────────────────────────────────────────────┘
    ↓
DECISIONES Y REPORTES
```

---

## 4. FUNCIONALIDADES IDENTIFICADAS

### 4.1 Control de caja y bancos
- ✅ Seguimiento de múltiples cuentas bancarias
- ✅ Saldos actualizados automáticamente
- ✅ Conversión entre monedas
- ✅ Control de disponibilidad

### 4.2 Cuentas por cobrar
- ✅ Facturas pendientes de cobro
- ✅ Seguimiento por cliente
- ✅ Estado de cobro (Cobrado S/N)
- ✅ Diferenciación entre pesos y dólares

### 4.3 Cuentas por pagar
- ✅ Obligaciones pendientes
- ✅ Seguimiento por proveedor
- ✅ Estado de pago (Pagado S/N)

### 4.4 Gestión impositiva
- ✅ Cálculo de IVA
- ✅ Cálculo de IRAE (con errores)
- ✅ Control de certificados
- ✅ Anticipos impositivos
- ⚠️ **IRAE con fórmulas rotas**

### 4.5 Control de facturación
- ✅ Registro detallado por factura
- ✅ Resúmenes mensuales y anuales
- ✅ Diferenciación por cliente
- ✅ Control de exoneraciones

### 4.6 Control de gastos
- ✅ Clasificación por centro de costo
- ✅ Clasificación por tipo de gasto
- ✅ Seguimiento de proveedores
- ✅ Control de IVA en gastos

### 4.7 Simulaciones
- ✅ Columnas manuales para escenarios
- ⚠️ Funcionalidad limitada
- ⚠️ No hay múltiples escenarios guardados

---

## 5. LIMITACIONES Y PROBLEMAS IDENTIFICADOS

### 5.1 Problemas Críticos

#### A) **Errores de fórmulas (#REF!)**
- **Ubicación**: Hoja IRAE, columna H (tipo de cambio)
- **Cantidad**: 11 errores
- **Impacto**: Impide cálculos correctos de IRAE en u$s
- **Causa probable**: Referencias rotas por eliminación de celdas/columnas

#### B) **Integridad de datos**
- No hay validación de datos
- No hay reglas de integridad referencial
- Posibles inconsistencias entre hojas
- Sin control de duplicados

### 5.2 Limitaciones de Diseño

#### A) **Escalabilidad**
- **Problema**: Hojas con >1,000 filas de datos
- **Impacto**: Lentitud al calcular, difícil de navegar
- **Ejemplo**: Facturación (1,186 filas), Gastos (1,460 filas)

#### B) **Mantenimiento**
- Fórmulas largas y complejas
- Sin documentación de reglas de negocio
- Referencias absolutas mezcladas con relativas
- Difícil de auditar

#### C) **Entrada de datos**
- Todo manual, sin validaciones
- Alto riesgo de errores humanos
- Sin formularios de entrada
- Sin listas desplegables para campos repetitivos (clientes, proveedores)

#### D) **Multimoneda**
- **Problema**: Conversiones manuales de tipo de cambio
- **Riesgo**: Inconsistencias en T/C usado
- **Sin**: Control de fecha del tipo de cambio

#### E) **Reportes y análisis**
- Limitado a lo que está en Resumen y FacAnual
- Sin gráficos
- Sin análisis de tendencias
- Sin comparativos históricos sofisticados
- Sin análisis de rentabilidad por cliente/proyecto

#### F) **Control de versiones**
- Un solo archivo
- Sin historial de cambios
- Sin auditoría de modificaciones
- Riesgo de pérdida de datos

#### G) **Colaboración**
- Difícil trabajo simultáneo
- Sin control de acceso por usuario
- Sin roles (quien puede ver/editar qué)

#### H) **Conciliación bancaria**
- No hay proceso formal de conciliación
- Difícil verificar contra extractos bancarios
- No identifica transacciones pendientes automáticamente

#### I) **Simulaciones**
- Muy básicas (columnas manuales)
- No hay múltiples escenarios guardados
- No hay análisis de sensibilidad
- No hay proyecciones automáticas

### 5.3 Limitaciones Funcionales

#### A) **No tiene**
- ❌ Presupuesto vs. Real
- ❌ Flujo de caja proyectado
- ❌ Estado de resultados formal
- ❌ Balance general formal
- ❌ Control de inventario
- ❌ Control de proyectos/horas
- ❌ Análisis de rentabilidad
- ❌ Indicadores financieros (ROI, margen, etc.)
- ❌ Alertas o notificaciones
- ❌ Integración con sistemas externos
- ❌ Importación/exportación de datos bancarios
- ❌ Control de contratos

---

## 6. ARQUITECTURA ACTUAL

### Tecnología
- **Plataforma**: Microsoft Excel (.xlsx)
- **Librerías**: openpyxl compatible
- **Fórmulas**: Estándar de Excel

### Patrones de diseño
- **Modelo**: Hojas de detalle → Consolidación → Resumen
- **Cálculos**: Mediante fórmulas de Excel
- **Navegación**: Por hojas/pestañas
- **Sin**: Macros, VBA, o automatizaciones avanzadas

### Estructura de datos
- **Tablas planas**: Sin normalización
- **Sin base de datos**: Todo en el archivo Excel
- **Referencias**: Por celdas directas
- **Sin**: Tablas de Excel estructuradas (Tables)

---

## 7. CASOS DE USO ACTUALES

### Usuario: Contador/Administrador

#### 1. Registrar una factura
1. Abrir hoja "Facturacion"
2. Agregar fila con datos de factura
3. Completar campos manualmente
4. El Resumen se actualiza automáticamente

#### 2. Registrar un gasto
1. Abrir hoja "Gastos"
2. Agregar fila con datos del gasto
3. Completar campos (fecha, tipo, monto, etc.)
4. El Resumen se actualiza automáticamente

#### 3. Registrar movimiento bancario
1. Abrir hoja correspondiente (CtaCteMN o CtaCteUSS)
2. Agregar fila en la sección del banco
3. Indicar crédito/débito y concepto
4. Saldo se actualiza automáticamente

#### 4. Ver estado financiero
1. Abrir hoja "Resumen"
2. Ver activo y pasivo
3. Ver saldo por banco
4. Ver facturas a cobrar

#### 5. Calcular IRAE
1. Abrir hoja "IRAE"
2. Ver anticipos pagados
3. Ver cálculo de IRAE anual
4. ⚠️ **Actualmente con errores**

#### 6. Hacer una simulación
1. Abrir hoja "Resumen"
2. Modificar valores en columnas grises
3. Ver impacto en totales
4. ⚠️ **Limitado a cambios manuales**

---

## 8. FORTALEZAS DEL SISTEMA ACTUAL

### ✅ Positivas
1. **Completo**: Cubre los aspectos principales de contabilidad
2. **Integrado**: Todas las áreas conectadas
3. **Automático**: Resumen se actualiza con fórmulas
4. **Histórico**: Datos desde 2022
5. **Multimoneda**: Maneja 3 monedas
6. **Multibanco**: Controla varias cuentas
7. **Familiar**: Excel es conocido por los usuarios
8. **Flexible**: Fácil de modificar ad-hoc

---

## 9. DEBILIDADES PARA UN SISTEMA PROFESIONAL

### ❌ Críticas

1. **Escalabilidad**: No soporta crecimiento significativo
2. **Errores**: Fórmulas rotas (#REF!)
3. **Integridad**: Sin validación de datos
4. **Performance**: Lento con muchos datos
5. **Auditoría**: Difícil de auditar cambios
6. **Colaboración**: No permite trabajo simultáneo eficiente
7. **Backup**: Sin versionado ni respaldo automático
8. **Seguridad**: Sin control de acceso por usuario/rol
9. **Reportes**: Limitados y estáticos
10. **Automatización**: Todo manual, alto riesgo de error humano

---

## 10. CONCLUSIONES

### El sistema actual es:
- ✅ **Funcional** para una operación pequeña
- ✅ **Completo** en cobertura de áreas
- ⚠️ **Frágil** por errores y falta de validación
- ❌ **No escalable** para crecimiento
- ❌ **No profesional** para empresa en expansión
- ❌ **Riesgoso** por falta de controles

### Es adecuado para:
- Empresa muy pequeña (1-5 personas)
- Volumen bajo de transacciones (<100/mes)
- Usuario único o secuencial
- Operación simple sin complejidad

### NO es adecuado para:
- Empresa en crecimiento
- Alto volumen de transacciones
- Múltiples usuarios simultáneos
- Operaciones complejas
- Necesidad de reportes avanzados
- Requisitos de auditoría formal
- Cumplimiento normativo estricto

---

## 11. RECOMENDACIONES PARA NUEVO SISTEMA

### Prioridades críticas:

#### 1. **Integridad de datos**
- Base de datos relacional
- Validaciones y restricciones
- Prevención de duplicados
- Auditoría de cambios

#### 2. **Automatización**
- Importación de extractos bancarios
- Cálculos automáticos de impuestos
- Conciliación automática
- Alertas y notificaciones

#### 3. **Escalabilidad**
- Arquitectura moderna
- Optimización de consultas
- Paginación de datos
- Índices en búsquedas

#### 4. **Usabilidad**
- Interfaz intuitiva
- Formularios de entrada
- Búsquedas rápidas
- Navegación eficiente

#### 5. **Reportes**
- Dashboards interactivos
- Gráficos dinámicos
- Exportación a múltiples formatos
- Reportes personalizables

#### 6. **Seguridad**
- Autenticación de usuarios
- Roles y permisos
- Backup automático
- Versionado de datos

#### 7. **Integración**
- APIs bancarias
- Sistemas de facturación
- DGI (para Uruguay)
- Exportación contable

### Mantener del sistema actual:
- Modelo de datos básico (activo/pasivo)
- Estructura de categorización
- Multimoneda y multibanco
- Conceptos impositivos de Uruguay

---

## 12. MÉTRICAS DEL SISTEMA ACTUAL

- **Total de hojas**: 10
- **Filas de datos aproximadas**: ~7,000
- **Período cubierto**: 2022-2025 (3.5 años)
- **Monedas**: 3 (UYU, USD, COP)
- **Bancos**: 4 (Santander, ITAU, Mercury, Payoneer)
- **Clientes principales**: UXDivers, Mevir, Ingesol
- **Centros de costo**: Uruguay, Colombia
- **Errores identificados**: 11 (#REF! en IRAE)
- **Fórmulas en Resumen**: 51+ 
- **Complejidad**: Media-Alta para Excel

# 💱 DIFERENCIAS DE CAMBIO - EXPLICACIÓN COMPLETA

## 📖 Concepto Base

**Diferencia de cambio** = Ganancia o pérdida que surge porque el tipo de cambio varía entre:
1. Cuando registras una operación en moneda extranjera
2. Cuando efectivamente cobras o pagas esa operación

Esta diferencia NO es un error, es una **realidad económica** que debe registrarse contablemente.

---

## 📊 EJEMPLO COMPLETO PASO A PASO

### Escenario: Factura en dólares que se cobra después

**Contexto:**
- Tu empresa está en Uruguay (moneda funcional: pesos uruguayos - UYU)
- Facturas a un cliente en dólares (USD)
- El tipo de cambio varía entre facturar y cobrar

---

### PASO 1: Facturar (15 de enero)

**Operación:**
- Facturas servicios por **USD 1,000**
- Tipo de cambio ese día: **1 USD = $40 UYU**

**Registro contable:**

```
Asiento #001
Fecha: 15/01/2025
Descripción: Factura #123 a Cliente XYZ por servicios

LÍNEA 1:
  Cuenta: Cuentas por Cobrar - Cliente XYZ
  Debe: USD 1,000
  Moneda: USD
  Tipo de Cambio: 40.00
  Equivalente UYU: $40,000 (1,000 × 40)

LÍNEA 2:
  Cuenta: Ingresos por Servicios
  Haber: USD 1,000
  Moneda: USD
  Tipo de Cambio: 40.00
  Equivalente UYU: $40,000

─────────────────────────────────────────
Total: USD 1,000 = USD 1,000 ✓
En UYU: $40,000 = $40,000 ✓
```

**Estado después de facturar:**
- CxC en dólares: USD 1,000
- CxC en pesos (equivalente): $40,000
- Ingreso reconocido: $40,000

---

### PASO 2: Cobrar (20 de enero) - Escenario A: Dólar SUBIÓ

**Operación:**
- Cliente paga los **USD 1,000** que debía
- Tipo de cambio HOY: **1 USD = $42 UYU** (subió $2)

**¿Qué pasó?**
- Esos mismos USD 1,000 ahora valen $42,000 pesos
- Cuando facturaste valían $40,000 pesos
- Ganaste $2,000 pesos extras por el cambio

**Registro contable:**

```
Asiento #002
Fecha: 20/01/2025
Descripción: Cobro Factura #123 - Cliente XYZ

LÍNEA 1:
  Cuenta: Banco Santander USD
  Debe: USD 1,000
  Moneda: USD
  Tipo de Cambio: 42.00
  Equivalente UYU: $42,000 (1,000 × 42)

LÍNEA 2:
  Cuenta: Cuentas por Cobrar - Cliente XYZ
  Haber: USD 1,000
  Moneda: USD
  Tipo de Cambio: 40.00 (el original)
  Equivalente UYU: $40,000

LÍNEA 3:
  Cuenta: Ingresos por Diferencia de Cambio
  Haber: USD 0
  Moneda: UYU
  Monto UYU: $2,000

─────────────────────────────────────────
Total USD: 1,000 = 1,000 ✓
Total UYU: $42,000 = $40,000 + $2,000 ✓
```

**Explicación de la tercera línea:**
- Recibiste $42,000 (valor actual del dólar)
- Tenías registrado en CxC $40,000 (valor histórico)
- Diferencia: $2,000 → **GANANCIA** por diferencia de cambio

---

### PASO 2: Cobrar (20 de enero) - Escenario B: Dólar BAJÓ

**Operación:**
- Cliente paga los **USD 1,000** que debía
- Tipo de cambio HOY: **1 USD = $38 UYU** (bajó $2)

**¿Qué pasó?**
- Esos mismos USD 1,000 ahora valen $38,000 pesos
- Cuando facturaste valían $40,000 pesos
- Perdiste $2,000 pesos por el cambio

**Registro contable:**

```
Asiento #002
Fecha: 20/01/2025
Descripción: Cobro Factura #123 - Cliente XYZ

LÍNEA 1:
  Cuenta: Banco Santander USD
  Debe: USD 1,000
  Moneda: USD
  Tipo de Cambio: 38.00
  Equivalente UYU: $38,000 (1,000 × 38)

LÍNEA 2:
  Cuenta: Gastos por Diferencia de Cambio
  Debe: USD 0
  Moneda: UYU
  Monto UYU: $2,000

LÍNEA 3:
  Cuenta: Cuentas por Cobrar - Cliente XYZ
  Haber: USD 1,000
  Moneda: USD
  Tipo de Cambio: 40.00 (el original)
  Equivalente UYU: $40,000

─────────────────────────────────────────
Total UYU: $38,000 + $2,000 = $40,000 ✓
```

**Explicación:**
- Recibiste $38,000 (valor actual del dólar)
- Tenías registrado en CxC $40,000 (valor histórico)
- Diferencia: $2,000 → **PÉRDIDA** por diferencia de cambio

---

## 🔄 CASO COMPLETO: Pagar a proveedor en USD

### PASO 1: Registrar gasto (10 de febrero)

**Operación:**
- Recibes factura de proveedor por **USD 500**
- T/C: **1 USD = $40 UYU**
- **NO pagas todavía** (lo dejas en CxP)

**Asiento:**

```
Asiento #003
Fecha: 10/02/2025
Descripción: Factura proveedor Software Inc.

LÍNEA 1:
  Cuenta: Gastos en Software
  Debe: USD 500
  Moneda: USD
  Tipo de Cambio: 40.00
  Equivalente UYU: $20,000

LÍNEA 2:
  Cuenta: Cuentas por Pagar - Software Inc.
  Haber: USD 500
  Moneda: USD
  Tipo de Cambio: 40.00
  Equivalente UYU: $20,000

─────────────────────────────────────────
Total: USD 500 = USD 500 ✓
En UYU: $20,000 = $20,000 ✓
```

---

### PASO 2: Pagar (15 de febrero) - Dólar SUBIÓ a $43

**Operación:**
- Pagas los **USD 500** al proveedor
- T/C HOY: **1 USD = $43 UYU**

**¿Qué pasó?**
- Tenías registrada una deuda de $20,000 pesos
- Para pagar USD 500 necesitas $21,500 pesos (500 × 43)
- Te cuesta $1,500 pesos más → **PÉRDIDA**

**Asiento:**

```
Asiento #004
Fecha: 15/02/2025
Descripción: Pago a Software Inc.

LÍNEA 1:
  Cuenta: Cuentas por Pagar - Software Inc.
  Debe: USD 500
  Moneda: USD
  Tipo de Cambio: 40.00 (el original)
  Equivalente UYU: $20,000

LÍNEA 2:
  Cuenta: Gastos por Diferencia de Cambio
  Debe: USD 0
  Moneda: UYU
  Monto UYU: $1,500

LÍNEA 3:
  Cuenta: Banco Santander USD
  Haber: USD 500
  Moneda: USD
  Tipo de Cambio: 43.00
  Equivalente UYU: $21,500

─────────────────────────────────────────
Total UYU: $20,000 + $1,500 = $21,500 ✓
```

---

## 📋 RESUMEN DE REGLAS

### Cuando COBRAS en moneda extranjera:

| Si el dólar... | Entonces... | Cuenta a usar |
|----------------|-------------|---------------|
| **SUBIÓ** | **Ganaste** plata | Ingresos por Diferencia de Cambio |
| **BAJÓ** | **Perdiste** plata | Gastos por Diferencia de Cambio |

### Cuando PAGAS en moneda extranjera:

| Si el dólar... | Entonces... | Cuenta a usar |
|----------------|-------------|---------------|
| **SUBIÓ** | **Perdiste** plata (te cuesta más) | Gastos por Diferencia de Cambio |
| **BAJÓ** | **Ganaste** plata (te cuesta menos) | Ingresos por Diferencia de Cambio |

---

## 🎯 LÓGICA DEL SISTEMA

### Campos necesarios en LINEA_ASIENTO:

```sql
CREATE TABLE linea_asiento (
  id INTEGER PRIMARY KEY,
  asiento_id INTEGER,
  cuenta_id INTEGER,
  debe DECIMAL(18,2),
  haber DECIMAL(18,2),
  moneda VARCHAR(3),               -- USD, UYU, etc.
  tipo_cambio DECIMAL(10,4),       -- Tipo de cambio en esta línea
  monto_moneda_funcional DECIMAL(18,2),  -- Calculado automático
  ...
);
```

### Algoritmo para calcular diferencia de cambio:

```javascript
function calcularDiferenciaCambio(cobroOPago) {
  // 1. Obtener el monto en moneda extranjera
  const montoUSD = cobroOPago.montoUSD;
  
  // 2. Obtener tipo de cambio original (de la factura/gasto)
  const tcOriginal = obtenerTCOriginal(cobroOPago.documentoId);
  
  // 3. Obtener tipo de cambio actual (del cobro/pago)
  const tcActual = cobroOPago.tipoCambio;
  
  // 4. Calcular valores en moneda funcional
  const valorOriginal = montoUSD * tcOriginal;
  const valorActual = montoUSD * tcActual;
  
  // 5. Diferencia
  const diferencia = valorActual - valorOriginal;
  
  // 6. Determinar si es ganancia o pérdida
  if (diferencia > 0) {
    if (cobroOPago.tipo === 'COBRO') {
      return { tipo: 'INGRESO', monto: diferencia };
    } else {
      return { tipo: 'GASTO', monto: diferencia };
    }
  } else if (diferencia < 0) {
    if (cobroOPago.tipo === 'COBRO') {
      return { tipo: 'GASTO', monto: Math.abs(diferencia) };
    } else {
      return { tipo: 'INGRESO', monto: Math.abs(diferencia) };
    }
  }
  
  return { tipo: null, monto: 0 }; // No hay diferencia
}
```

---

## 📊 REPORTE DE DIFERENCIAS DE CAMBIO

El sistema debe poder generar un reporte mensual/anual que muestre:

```
DIFERENCIAS DE CAMBIO - Enero 2025
─────────────────────────────────────────────────────

INGRESOS POR DIFERENCIA DE CAMBIO:
- 20/01: Cobro Factura #123 - Cliente XYZ    $2,000
- 25/01: Cobro Factura #124 - Cliente ABC    $1,500
                                              ──────
Total Ingresos:                               $3,500

GASTOS POR DIFERENCIA DE CAMBIO:
- 15/02: Pago Software Inc.                   $1,500
- 18/02: Pago Consultoría                     $800
                                              ──────
Total Gastos:                                 $2,300

─────────────────────────────────────────────────────
RESULTADO NETO:                               $1,200
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

1. **Momento del reconocimiento**: La diferencia se reconoce cuando se hace efectivo el cobro/pago, NO antes

2. **No afecta el monto en USD**: Los USD siempre son los mismos, la diferencia es solo en pesos

3. **Impacto fiscal**: Las diferencias de cambio son deducibles/gravables para impuestos

4. **Separación de cuentas**: 
   - Tener cuentas separadas para ingresos y gastos por diferencia de cambio
   - Facilita el análisis y reportes

5. **Auditoría**: Cada diferencia debe poder trazarse a:
   - Documento original (factura/gasto)
   - Tipo de cambio original
   - Cobro/pago
   - Tipo de cambio al cobro/pago

---

## 🎨 PRESENTACIÓN EN LA UI

### Al registrar un cobro/pago:

```
┌────────────────────────────────────────────────┐
│ Registrar Cobro - Factura #123                 │
├────────────────────────────────────────────────┤
│ Cliente: XYZ                                   │
│ Factura: #123                                  │
│ Monto facturado: USD 1,000                     │
│ T/C al facturar: $40.00                        │
│ Valor original: $40,000                        │
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ T/C HOY: $42.00                            │ │
│ │ Valor actual: $42,000                      │ │
│ │                                            │ │
│ │ 💰 Ganancia por diferencia: $2,000         │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ Banco destino: [Santander USD ▼]              │
│                                                │
│ [ Registrar Cobro ]                            │
└────────────────────────────────────────────────┘
```

El sistema debe:
- Mostrar claramente el T/C original vs actual
- Calcular y mostrar la diferencia ANTES de guardar
- Permitir al usuario ver el asiento que se generará
- Confirmar la operación

---

**FIN DEL DOCUMENTO**

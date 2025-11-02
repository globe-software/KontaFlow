# 🛠️ PLAN DE IMPLEMENTACIÓN - DIFERENCIAS DE CAMBIO

> Guía técnica para implementar el manejo de diferencias de cambio en el sistema de contabilidad

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Base de Datos

- [ ] **Crear tabla MONEDA**
  ```sql
  CREATE TABLE moneda (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(3) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    simbolo VARCHAR(10),
    activa BOOLEAN DEFAULT true,
    decimales INTEGER DEFAULT 2,
    es_funcional_defecto BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **Crear tabla TIPO_CAMBIO**
  ```sql
  CREATE TABLE tipo_cambio (
    id SERIAL PRIMARY KEY,
    moneda_origen VARCHAR(3) NOT NULL REFERENCES moneda(codigo),
    moneda_destino VARCHAR(3) NOT NULL REFERENCES moneda(codigo),
    fecha DATE NOT NULL,
    tasa_compra DECIMAL(10,4),
    tasa_venta DECIMAL(10,4),
    tasa_promedio DECIMAL(10,4) NOT NULL,
    fuente VARCHAR(100),
    creado_en TIMESTAMP DEFAULT NOW(),
    creado_por INTEGER REFERENCES usuario(id),
    
    UNIQUE(moneda_origen, moneda_destino, fecha)
  );
  
  CREATE INDEX idx_tipo_cambio_fecha 
    ON tipo_cambio(fecha, moneda_origen, moneda_destino);
  ```

- [ ] **Crear tabla CONFIGURACION_SISTEMA**
  ```sql
  CREATE TABLE configuracion_sistema (
    id SERIAL PRIMARY KEY,
    grupo_economico_id INTEGER NOT NULL REFERENCES grupo_economico(id),
    clave VARCHAR(100) NOT NULL,
    valor TEXT,
    tipo VARCHAR(20) CHECK (tipo IN ('string', 'number', 'boolean', 'date')),
    descripcion TEXT,
    modificado_en TIMESTAMP DEFAULT NOW(),
    modificado_por INTEGER REFERENCES usuario(id),
    
    UNIQUE(grupo_economico_id, clave)
  );
  ```

- [ ] **Modificar tabla LINEA_ASIENTO**
  ```sql
  ALTER TABLE linea_asiento
    ADD COLUMN debe_moneda_funcional DECIMAL(18,2),
    ADD COLUMN haber_moneda_funcional DECIMAL(18,2),
    ADD COLUMN documento_origen_id INTEGER,
    ADD COLUMN documento_origen_tipo VARCHAR(50),
    ADD COLUMN es_diferencia_cambio BOOLEAN DEFAULT false,
    ADD COLUMN tipo_cambio_original DECIMAL(10,4);
  
  CREATE INDEX idx_linea_asiento_documento 
    ON linea_asiento(documento_origen_tipo, documento_origen_id);
  ```

- [ ] **Pre-cargar monedas**
  ```sql
  INSERT INTO moneda (codigo, nombre, simbolo) VALUES
    ('USD', 'Dólar Estadounidense', 'US$'),
    ('UYU', 'Peso Uruguayo', '$'),
    ('COP', 'Peso Colombiano', '$'),
    ('ARS', 'Peso Argentino', '$'),
    ('EUR', 'Euro', '€'),
    ('BRL', 'Real Brasileño', 'R$');
  ```

---

### Fase 2: Backend - Servicios

#### A. Servicio de Tipos de Cambio

- [ ] **TipoCambioService**
  ```typescript
  class TipoCambioService {
    // Buscar tipo de cambio para una fecha
    async buscarTipoCambio(
      monedaOrigen: string,
      monedaDestino: string,
      fecha: Date
    ): Promise<TipoCambio | null>
    
    // Buscar o sugerir (busca fecha exacta, si no encuentra busca más cercana)
    async buscarOSugerir(
      monedaOrigen: string,
      monedaDestino: string,
      fecha: Date
    ): Promise<TipoCambio>
    
    // Crear/actualizar tipo de cambio
    async guardar(data: TipoCambioDTO): Promise<TipoCambio>
    
    // Obtener histórico
    async obtenerHistorico(
      monedaOrigen: string,
      monedaDestino: string,
      desde: Date,
      hasta: Date
    ): Promise<TipoCambio[]>
  }
  ```

#### B. Servicio de Configuración

- [ ] **ConfiguracionService**
  ```typescript
  class ConfiguracionService {
    // Obtener fecha actual del sistema
    async obtenerFechaActual(grupoId: number): Promise<Date> {
      const usarFechaSO = await this.obtener(grupoId, 'usar_fecha_so');
      
      if (usarFechaSO === 'true') {
        return new Date();
      } else {
        const fechaConfig = await this.obtener(grupoId, 'fecha_sistema');
        return new Date(fechaConfig);
      }
    }
    
    // Obtener configuración
    async obtener(grupoId: number, clave: string): Promise<string>
    
    // Guardar configuración
    async guardar(grupoId: number, clave: string, valor: string): Promise<void>
  }
  ```

#### C. Servicio de Diferencias de Cambio

- [ ] **DiferenciaCambioService**
  ```typescript
  class DiferenciaCambioService {
    /**
     * Calcula diferencia de cambio al cobrar/pagar un documento
     */
    async calcularDiferencia(params: {
      documentoId: number;
      documentoTipo: 'factura' | 'gasto';
      montoMonedaExtranjera: number;
      tipoCambioActual: number;
      esCobro: boolean; // true = cobro, false = pago
    }): Promise<{
      diferencia: number;
      esDiferencia: boolean;
      esGanancia: boolean; // true = ingreso, false = gasto
      tipoCambioOriginal: number;
    }> {
      // 1. Buscar documento original
      const doc = await this.buscarDocumento(
        params.documentoTipo,
        params.documentoId
      );
      
      // 2. Obtener T/C original del documento
      const tcOriginal = doc.tipo_cambio;
      
      // 3. Calcular valores
      const valorOriginal = params.montoMonedaExtranjera * tcOriginal;
      const valorActual = params.montoMonedaExtranjera * params.tipoCambioActual;
      const diferencia = valorActual - valorOriginal;
      
      // 4. Determinar si es ganancia o pérdida
      let esGanancia: boolean;
      
      if (diferencia > 0) {
        esGanancia = params.esCobro; // Cobro con T/C mayor = ganancia
      } else if (diferencia < 0) {
        esGanancia = !params.esCobro; // Pago con T/C menor = ganancia
      } else {
        return { 
          diferencia: 0, 
          esDiferencia: false, 
          esGanancia: false,
          tipoCambioOriginal: tcOriginal 
        };
      }
      
      return {
        diferencia: Math.abs(diferencia),
        esDiferencia: true,
        esGanancia,
        tipoCambioOriginal: tcOriginal
      };
    }
    
    /**
     * Genera línea de asiento para diferencia de cambio
     */
    async generarLinea(params: {
      diferencia: number;
      esGanancia: boolean;
      documentoId: number;
      documentoTipo: string;
      tipoCambioOriginal: number;
      monedaFuncional: string;
    }): Promise<LineaAsientoDTO> {
      // Buscar cuenta contable apropiada
      const cuenta = esGanancia
        ? await this.buscarCuenta('INGRESO_DIFERENCIA_CAMBIO')
        : await this.buscarCuenta('GASTO_DIFERENCIA_CAMBIO');
      
      return {
        cuenta_id: cuenta.id,
        debe: params.esGanancia ? 0 : params.diferencia,
        haber: params.esGanancia ? params.diferencia : 0,
        moneda: params.monedaFuncional,
        tipo_cambio: 1.0, // Siempre 1.0 porque ya está en moneda funcional
        es_diferencia_cambio: true,
        documento_origen_id: params.documentoId,
        documento_origen_tipo: params.documentoTipo,
        tipo_cambio_original: params.tipoCambioOriginal,
        glosa: `Diferencia de cambio por ${params.documentoTipo} #${params.documentoId}`
      };
    }
  }
  ```

#### D. Servicio de Asientos

- [ ] **Modificar AsientoService para manejar diferencias de cambio**
  ```typescript
  class AsientoService {
    async crearCobroPago(params: {
      tipo: 'cobro' | 'pago';
      documentoId: number;
      documentoTipo: string;
      bancoId: number;
      monto: number;
      moneda: string;
      tipoCambio: number;
      fecha: Date;
    }): Promise<Asiento> {
      const lineas: LineaAsientoDTO[] = [];
      
      // 1. Línea de banco
      lineas.push({
        cuenta_id: params.bancoId,
        debe: params.tipo === 'cobro' ? params.monto : 0,
        haber: params.tipo === 'pago' ? params.monto : 0,
        moneda: params.moneda,
        tipo_cambio: params.tipoCambio,
        // ... otros campos
      });
      
      // 2. Línea de CxC o CxP (valor original)
      const documento = await this.obtenerDocumento(
        params.documentoTipo,
        params.documentoId
      );
      
      lineas.push({
        cuenta_id: documento.cuenta_cxc_cxp_id,
        debe: params.tipo === 'pago' ? documento.monto : 0,
        haber: params.tipo === 'cobro' ? documento.monto : 0,
        moneda: params.moneda,
        tipo_cambio: documento.tipo_cambio, // T/C original
        // ... otros campos
      });
      
      // 3. Si hay diferencia de cambio, agregar línea
      if (params.moneda !== params.monedaFuncional) {
        const diffCambio = await this.diferenciaCambioService.calcularDiferencia({
          documentoId: params.documentoId,
          documentoTipo: params.documentoTipo,
          montoMonedaExtranjera: params.monto,
          tipoCambioActual: params.tipoCambio,
          esCobro: params.tipo === 'cobro'
        });
        
        if (diffCambio.esDiferencia) {
          const lineaDiff = await this.diferenciaCambioService.generarLinea({
            diferencia: diffCambio.diferencia,
            esGanancia: diffCambio.esGanancia,
            documentoId: params.documentoId,
            documentoTipo: params.documentoTipo,
            tipoCambioOriginal: diffCambio.tipoCambioOriginal,
            monedaFuncional: params.monedaFuncional
          });
          
          lineas.push(lineaDiff);
        }
      }
      
      // 4. Validar balance
      this.validarBalance(lineas);
      
      // 5. Crear asiento
      return await this.crear({
        fecha: params.fecha,
        descripcion: `${params.tipo === 'cobro' ? 'Cobro' : 'Pago'} ${params.documentoTipo} #${params.documentoId}`,
        lineas
      });
    }
  }
  ```

---

### Fase 3: Frontend - Componentes

#### A. Gestión de Tipos de Cambio

- [ ] **Pantalla TipoCambioList**
  - Tabla con tipos de cambio del día
  - Filtros por fecha y moneda
  - Botón "Agregar tipo de cambio"

- [ ] **Formulario TipoCambioForm**
  - Selección de moneda origen/destino
  - Fecha
  - Tasa compra, venta, promedio
  - Fuente (manual, BCU, etc.)
  - Validación: tasa > 0

#### B. Cobro/Pago con Diferencia de Cambio

- [ ] **Componente CobroPagoForm**
  ```tsx
  function CobroPagoForm({ documento }) {
    const [tipoCambioActual, setTipoCambioActual] = useState(null);
    const [diferencia, setDiferencia] = useState(null);
    
    // Al cargar, buscar T/C del día
    useEffect(() => {
      if (documento.moneda !== empresa.moneda_funcional) {
        buscarTipoCambio(documento.moneda, empresa.moneda_funcional, hoy)
          .then(tc => setTipoCambioActual(tc?.tasa_promedio || 0));
      }
    }, []);
    
    // Al cambiar T/C, calcular diferencia
    useEffect(() => {
      if (tipoCambioActual) {
        const diff = calcularDiferencia({
          monto: documento.monto,
          tcOriginal: documento.tipo_cambio,
          tcActual: tipoCambioActual,
          esCobro: tipo === 'cobro'
        });
        setDiferencia(diff);
      }
    }, [tipoCambioActual]);
    
    return (
      <form>
        {/* Datos del documento */}
        <div>Monto: {documento.moneda} {documento.monto}</div>
        <div>T/C original: {documento.tipo_cambio}</div>
        
        {/* T/C actual */}
        <input 
          type="number" 
          value={tipoCambioActual}
          onChange={e => setTipoCambioActual(e.target.value)}
          label="Tipo de cambio hoy"
        />
        
        {/* Preview de diferencia */}
        {diferencia && diferencia.existe && (
          <Alert variant={diferencia.esGanancia ? 'success' : 'warning'}>
            <strong>
              {diferencia.esGanancia ? '💰 Ganancia' : '⚠️ Pérdida'} 
              por diferencia de cambio:
            </strong>
            <div>{moneda_funcional} {diferencia.monto.toFixed(2)}</div>
            <small>
              Valor original: {valorOriginal.toFixed(2)} | 
              Valor actual: {valorActual.toFixed(2)}
            </small>
          </Alert>
        )}
        
        {/* Botón guardar */}
        <button type="submit">Registrar {tipo}</button>
      </form>
    );
  }
  ```

#### C. Configuración del Sistema

- [ ] **Pantalla ConfiguracionSistema**
  ```tsx
  function ConfiguracionSistema() {
    const [usarFechaSO, setUsarFechaSO] = useState(true);
    const [fechaSistema, setFechaSistema] = useState(new Date());
    
    return (
      <form>
        <h2>Configuración del Sistema</h2>
        
        <Checkbox
          checked={usarFechaSO}
          onChange={setUsarFechaSO}
          label="Usar fecha del sistema operativo"
        />
        
        {!usarFechaSO && (
          <DatePicker
            value={fechaSistema}
            onChange={setFechaSistema}
            label="Fecha del sistema"
          />
        )}
        
        <Alert variant="info">
          <strong>Esto afecta:</strong>
          <ul>
            <li>Fecha por defecto en nuevos asientos</li>
            <li>Validaciones de fechas futuras</li>
            <li>Búsqueda de tipos de cambio</li>
          </ul>
        </Alert>
        
        <button type="submit">Guardar</button>
      </form>
    );
  }
  ```

---

### Fase 4: Testing

#### A. Tests Unitarios

- [ ] **TipoCambioService.test.ts**
  - Buscar tipo de cambio exacto
  - Buscar tipo de cambio más cercano
  - Crear tipo de cambio duplicado (debe fallar)
  - Histórico de tipos de cambio

- [ ] **DiferenciaCambioService.test.ts**
  - Calcular diferencia - cobro con T/C mayor (ganancia)
  - Calcular diferencia - cobro con T/C menor (pérdida)
  - Calcular diferencia - pago con T/C mayor (pérdida)
  - Calcular diferencia - pago con T/C menor (ganancia)
  - Sin diferencia (T/C igual)
  - Generar línea de diferencia correctamente

- [ ] **ConfiguracionService.test.ts**
  - Obtener fecha con usar_fecha_so = true
  - Obtener fecha con usar_fecha_so = false
  - Guardar y recuperar configuración

#### B. Tests de Integración

- [ ] **Flujo completo: Factura en USD → Cobro**
  1. Crear factura USD 1,000 con T/C 40
  2. Verificar saldos (CxC: USD 1,000, equivalente $40,000)
  3. Registrar cobro con T/C 42
  4. Verificar:
     - Banco: USD 1,000 (equivalente $42,000)
     - CxC: $0
     - Ingreso Diff Cambio: $2,000
     - Balance balancea

- [ ] **Flujo completo: Gasto en USD → Pago**
  1. Crear gasto USD 500 con T/C 40
  2. Verificar saldos (CxP: USD 500, equivalente $20,000)
  3. Registrar pago con T/C 43
  4. Verificar:
     - Banco: -USD 500 (equivalente -$21,500)
     - CxP: $0
     - Gasto Diff Cambio: $1,500
     - Balance balancea

---

### Fase 5: Reportes

- [ ] **Reporte de Diferencias de Cambio**
  ```typescript
  interface ReporteDiferenciaCambio {
    periodo: {
      desde: Date;
      hasta: Date;
    };
    ingresos: {
      lineas: Array<{
        fecha: Date;
        documento: string;
        monto: number;
      }>;
      total: number;
    };
    gastos: {
      lineas: Array<{
        fecha: Date;
        documento: string;
        monto: number;
      }>;
      total: number;
    };
    resultado_neto: number;
  }
  ```

- [ ] **Incluir en Estado de Resultados**
  - Sección de "Otros Ingresos y Gastos"
  - Línea "Diferencias de Cambio (neto)"
  - Drill-down a detalle

---

### Fase 6: Documentación

- [ ] **Documentación de API**
  - Endpoints de tipos de cambio
  - Endpoints de configuración
  - Ejemplos de uso

- [ ] **Documentación de Usuario**
  - Guía: Cómo registrar tipos de cambio
  - Guía: Cómo se calculan diferencias de cambio
  - Guía: Cómo interpretar reportes

- [ ] **Video Tutorial**
  - Configurar monedas y tipos de cambio
  - Facturar en moneda extranjera
  - Cobrar con diferencia de cambio
  - Ver reporte de diferencias

---

## 🎯 ORDEN RECOMENDADO DE IMPLEMENTACIÓN

1. **Semana 1**: Base de datos y modelos
   - Crear tablas
   - Pre-cargar datos
   - Models/DTOs

2. **Semana 2**: Servicios backend
   - TipoCambioService
   - ConfiguracionService
   - DiferenciaCambioService

3. **Semana 3**: Integración con AsientoService
   - Modificar creación de cobros/pagos
   - Tests de integración

4. **Semana 4**: Frontend - Gestión de T/C
   - CRUD tipos de cambio
   - Configuración del sistema

5. **Semana 5**: Frontend - Cobros/Pagos
   - Preview de diferencia de cambio
   - Validaciones
   - UI/UX polish

6. **Semana 6**: Reportes y documentación
   - Reporte diferencias de cambio
   - Documentación
   - Video tutorial

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### Performance
- **Índice en tipo_cambio(fecha, moneda_origen, moneda_destino)**
  - Crítico para búsquedas rápidas
  - Usar EXPLAIN ANALYZE para verificar

### Concurrencia
- **Lock al crear tipo de cambio**
  - Usar constraint UNIQUE para evitar duplicados
  - Manejar error de constraint violation

### Seguridad
- **Solo admin puede cambiar fecha del sistema**
  - Verificar rol antes de guardar configuración
  - Log de cambios para auditoría

### Auditoría
- **Cada diferencia de cambio debe ser trazable**
  - documento_origen_id y documento_origen_tipo obligatorios
  - tipo_cambio_original para verificaciones

---

**FIN DEL PLAN DE IMPLEMENTACIÓN**

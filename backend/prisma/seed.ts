import { PrismaClient, TipoCuenta, Rol, TipoPeriodo, NaturalezaCuenta, CategoriaNIIF, EstadoAsiento, TipoAsiento, TipoAuxiliar, TipoObligacion, EstadoObligacion, EstadoCuota } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ===================================
  // 1. GRUPO ECONÓMICO
  // ===================================
  console.log('📦 Creating GrupoEconomico...');
  const grupo = await prisma.grupoEconomico.create({
    data: {
      nombre: 'Pragmatic Software Group',
      paisPrincipal: 'UY',
      monedaBase: 'UYU',
    },
  });

  // ===================================
  // 2. EMPRESAS
  // ===================================
  console.log('🏢 Creating Empresas...');
  const empresaUY = await prisma.empresa.create({
    data: {
      grupoEconomicoId: grupo.id,
      nombre: 'Pragmatic Software S.A.',
      nombreComercial: 'Pragmatic',
      rut: '217890120018',
      pais: 'UY',
      monedaFuncional: 'UYU',
      fechaInicio: new Date('2020-01-01'),
    },
  });

  const empresaUS = await prisma.empresa.create({
    data: {
      grupoEconomicoId: grupo.id,
      nombre: 'Pragmatic Labs LLC',
      nombreComercial: 'Pragmatic Labs',
      rut: 'US-123456789',
      pais: 'US',
      monedaFuncional: 'USD',
      fechaInicio: new Date('2022-06-01'),
    },
  });

  // ===================================
  // 3. PLAN DE CUENTAS
  // ===================================
  console.log('📋 Creating PlanDeCuentas...');
  const planCuentas = await prisma.planDeCuentas.create({
    data: {
      grupoEconomicoId: grupo.id,
      nombre: 'Plan de cuentas empresas software internacional',
      descripcion: 'Plan de cuentas estándar para empresas de software según NIIF/IFRS',
    },
  });

  // ===================================
  // 4. CUENTAS CONTABLES
  // ===================================
  console.log('💰 Creating Cuentas...');

  // ACTIVO
  const activo = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '1',
      nombre: 'ACTIVO',
      tipo: TipoCuenta.ACTIVO,
      nivel: 1,
      imputable: false,
    },
  });

  // ACTIVO CORRIENTE
  const activoCorriente = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '11',
      nombre: 'ACTIVO CORRIENTE',
      cuentaPadreId: activo.id,
      tipo: TipoCuenta.ACTIVO,
      nivel: 2,
      imputable: false,
      naturaleza: NaturalezaCuenta.CORRIENTE,
    },
  });

  // Disponibilidades
  const disponibilidades = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '111',
      nombre: 'Disponibilidades',
      cuentaPadreId: activoCorriente.id,
      tipo: TipoCuenta.ACTIVO,
      nivel: 3,
      imputable: false,
      naturaleza: NaturalezaCuenta.CORRIENTE,
      categoriaNIIF: CategoriaNIIF.EFECTIVO_Y_EQUIVALENTES,
    },
  });

  const caja = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '111.001',
      nombre: 'Caja',
      cuentaPadreId: disponibilidades.id,
      tipo: TipoCuenta.ACTIVO,
      nivel: 4,
      imputable: true,
      naturaleza: NaturalezaCuenta.CORRIENTE,
      categoriaNIIF: CategoriaNIIF.EFECTIVO_Y_EQUIVALENTES,
    },
  });

  const bancoBROUMN = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '111.002',
      nombre: 'Banco BROU - Cuenta Corriente MN',
      cuentaPadreId: disponibilidades.id,
      tipo: TipoCuenta.ACTIVO,
      nivel: 4,
      imputable: true,
      naturaleza: NaturalezaCuenta.CORRIENTE,
      categoriaNIIF: CategoriaNIIF.EFECTIVO_Y_EQUIVALENTES,
    },
  });

  const bancoBROUUSD = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '111.003',
      nombre: 'Banco BROU - Cuenta Corriente USD',
      cuentaPadreId: disponibilidades.id,
      tipo: TipoCuenta.ACTIVO,
      nivel: 4,
      imputable: true,
      moneda: 'USD' as any,
      naturaleza: NaturalezaCuenta.CORRIENTE,
      categoriaNIIF: CategoriaNIIF.EFECTIVO_Y_EQUIVALENTES,
    },
  });

  // Cuentas por Cobrar
  const cuentasPorCobrar = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '112',
      nombre: 'Cuentas por Cobrar',
      cuentaPadreId: activoCorriente.id,
      tipo: TipoCuenta.ACTIVO,
      nivel: 3,
      imputable: false,
      naturaleza: NaturalezaCuenta.CORRIENTE,
      categoriaNIIF: CategoriaNIIF.CUENTAS_POR_COBRAR,
    },
  });

  const clientesLocales = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '112.001',
      nombre: 'Clientes Locales',
      cuentaPadreId: cuentasPorCobrar.id,
      tipo: TipoCuenta.ACTIVO,
      nivel: 4,
      imputable: true,
      requiereAuxiliar: true,
      tipoAuxiliar: TipoAuxiliar.CLIENTE,
      naturaleza: NaturalezaCuenta.CORRIENTE,
      categoriaNIIF: CategoriaNIIF.CUENTAS_POR_COBRAR,
    },
  });

  const clientesExterior = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '112.002',
      nombre: 'Clientes Exterior',
      cuentaPadreId: cuentasPorCobrar.id,
      tipo: TipoCuenta.ACTIVO,
      nivel: 4,
      imputable: true,
      requiereAuxiliar: true,
      tipoAuxiliar: TipoAuxiliar.CLIENTE,
      naturaleza: NaturalezaCuenta.CORRIENTE,
      categoriaNIIF: CategoriaNIIF.CUENTAS_POR_COBRAR,
    },
  });

  // IVA
  const ivaCreditoFiscal = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '113.001',
      nombre: 'IVA Crédito Fiscal',
      cuentaPadreId: activoCorriente.id,
      tipo: TipoCuenta.ACTIVO,
      nivel: 4,
      imputable: true,
      naturaleza: NaturalezaCuenta.CORRIENTE,
    },
  });

  // PASIVO
  const pasivo = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '2',
      nombre: 'PASIVO',
      tipo: TipoCuenta.PASIVO,
      nivel: 1,
      imputable: false,
    },
  });

  const pasivoCorriente = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '21',
      nombre: 'PASIVO CORRIENTE',
      cuentaPadreId: pasivo.id,
      tipo: TipoCuenta.PASIVO,
      nivel: 2,
      imputable: false,
      naturaleza: NaturalezaCuenta.CORRIENTE,
    },
  });

  const proveedoresLocales = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '211.001',
      nombre: 'Proveedores Locales',
      cuentaPadreId: pasivoCorriente.id,
      tipo: TipoCuenta.PASIVO,
      nivel: 4,
      imputable: true,
      requiereAuxiliar: true,
      tipoAuxiliar: TipoAuxiliar.PROVEEDOR,
      naturaleza: NaturalezaCuenta.CORRIENTE,
      categoriaNIIF: CategoriaNIIF.CUENTAS_POR_PAGAR,
    },
  });

  const proveedoresExterior = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '211.002',
      nombre: 'Proveedores Exterior',
      cuentaPadreId: pasivoCorriente.id,
      tipo: TipoCuenta.PASIVO,
      nivel: 4,
      imputable: true,
      requiereAuxiliar: true,
      tipoAuxiliar: TipoAuxiliar.PROVEEDOR,
      naturaleza: NaturalezaCuenta.CORRIENTE,
      categoriaNIIF: CategoriaNIIF.CUENTAS_POR_PAGAR,
    },
  });

  const ivaDebitoFiscal = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '212.001',
      nombre: 'IVA Débito Fiscal',
      cuentaPadreId: pasivoCorriente.id,
      tipo: TipoCuenta.PASIVO,
      nivel: 4,
      imputable: true,
      naturaleza: NaturalezaCuenta.CORRIENTE,
    },
  });

  const sueldosAPagar = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '213.001',
      nombre: 'Sueldos a Pagar',
      cuentaPadreId: pasivoCorriente.id,
      tipo: TipoCuenta.PASIVO,
      nivel: 4,
      imputable: true,
      naturaleza: NaturalezaCuenta.CORRIENTE,
      categoriaNIIF: CategoriaNIIF.CUENTAS_POR_PAGAR,
    },
  });

  // PATRIMONIO
  const patrimonio = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '3',
      nombre: 'PATRIMONIO',
      tipo: TipoCuenta.PATRIMONIO,
      nivel: 1,
      imputable: false,
    },
  });

  const capitalSocial = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '31.001',
      nombre: 'Capital Social',
      cuentaPadreId: patrimonio.id,
      tipo: TipoCuenta.PATRIMONIO,
      nivel: 3,
      imputable: true,
      categoriaNIIF: CategoriaNIIF.CAPITAL_SOCIAL,
    },
  });

  const resultadoDelEjercicio = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '33.002',
      nombre: 'Resultado del Ejercicio',
      cuentaPadreId: patrimonio.id,
      tipo: TipoCuenta.PATRIMONIO,
      nivel: 3,
      imputable: true,
      categoriaNIIF: CategoriaNIIF.RESULTADOS_ACUMULADOS,
    },
  });

  // INGRESOS
  const ingresos = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '4',
      nombre: 'INGRESOS',
      tipo: TipoCuenta.INGRESO,
      nivel: 1,
      imputable: false,
    },
  });

  const ventaServicios = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '41.001',
      nombre: 'Venta de Servicios de Software',
      cuentaPadreId: ingresos.id,
      tipo: TipoCuenta.INGRESO,
      nivel: 3,
      imputable: true,
      categoriaNIIF: CategoriaNIIF.INGRESOS_OPERACIONALES,
    },
  });

  const ventaLicencias = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '41.002',
      nombre: 'Venta de Licencias',
      cuentaPadreId: ingresos.id,
      tipo: TipoCuenta.INGRESO,
      nivel: 3,
      imputable: true,
      categoriaNIIF: CategoriaNIIF.INGRESOS_OPERACIONALES,
    },
  });

  // EGRESOS
  const egresos = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '5',
      nombre: 'EGRESOS',
      tipo: TipoCuenta.EGRESO,
      nivel: 1,
      imputable: false,
    },
  });

  const costoServiciosCloud = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '51.001',
      nombre: 'Costo Servicios Cloud (AWS/Azure)',
      cuentaPadreId: egresos.id,
      tipo: TipoCuenta.EGRESO,
      nivel: 3,
      imputable: true,
      categoriaNIIF: CategoriaNIIF.COSTOS_VENTAS,
    },
  });

  const sueldosAdministracion = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '52.001',
      nombre: 'Sueldos Administración',
      cuentaPadreId: egresos.id,
      tipo: TipoCuenta.EGRESO,
      nivel: 3,
      imputable: true,
      categoriaNIIF: CategoriaNIIF.GASTOS_ADMINISTRACION,
    },
  });

  const alquilerOficina = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '52.003',
      nombre: 'Alquiler de Oficina',
      cuentaPadreId: egresos.id,
      tipo: TipoCuenta.EGRESO,
      nivel: 3,
      imputable: true,
      categoriaNIIF: CategoriaNIIF.GASTOS_ADMINISTRACION,
    },
  });

  const marketingDigital = await prisma.cuenta.create({
    data: {
      planDeCuentasId: planCuentas.id,
      codigo: '53.002',
      nombre: 'Marketing Digital',
      cuentaPadreId: egresos.id,
      tipo: TipoCuenta.EGRESO,
      nivel: 3,
      imputable: true,
      categoriaNIIF: CategoriaNIIF.GASTOS_VENTAS,
    },
  });

  // ===================================
  // 5. CONFIGURACIÓN CONTABLE
  // ===================================
  console.log('⚙️  Creating ConfiguracionContable...');
  await prisma.configuracionContable.create({
    data: {
      grupoEconomicoId: grupo.id,
      permitirAsientosEnPeriodoCerrado: false,
      requiereAprobacionGlobal: false,
      montoMinimoAprobacion: 50000.00,
      permitirAsientosDescuadrados: false,
      decimalesMonto: 2,
      decimalesTipoCambio: 4,
    },
  });

  // ===================================
  // 6. USUARIOS
  // ===================================
  console.log('👥 Creating Usuarios...');
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@pragmatic.com.uy',
      nombre: 'Administrador Sistema',
      authProviderId: 'clerk_admin_123',
    },
  });

  const contador = await prisma.usuario.create({
    data: {
      email: 'contador@pragmatic.com.uy',
      nombre: 'María Rodríguez',
      authProviderId: 'clerk_contador_456',
    },
  });

  const operativo = await prisma.usuario.create({
    data: {
      email: 'operaciones@pragmatic.com.uy',
      nombre: 'Juan Pérez',
      authProviderId: 'clerk_operativo_789',
    },
  });

  // Permisos
  await prisma.usuarioGrupo.create({
    data: {
      usuarioId: admin.id,
      grupoEconomicoId: grupo.id,
      rol: Rol.ADMIN,
    },
  });

  await prisma.usuarioGrupo.create({
    data: {
      usuarioId: contador.id,
      grupoEconomicoId: grupo.id,
      rol: Rol.CONTADOR,
    },
  });

  await prisma.usuarioGrupo.create({
    data: {
      usuarioId: operativo.id,
      grupoEconomicoId: grupo.id,
      rol: Rol.OPERATIVO,
    },
  });

  // ===================================
  // 7. CLIENTES
  // ===================================
  console.log('🤝 Creating Clientes...');
  const cliente1 = await prisma.cliente.create({
    data: {
      grupoEconomicoId: grupo.id,
      nombre: 'Ministerio de Economía y Finanzas',
      rut: '211266530012',
      email: 'compras@mef.gub.uy',
    },
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      grupoEconomicoId: grupo.id,
      nombre: 'Banco República Oriental del Uruguay',
      rut: '217003530018',
      email: 'sistemas@brou.com.uy',
    },
  });

  const cliente3 = await prisma.cliente.create({
    data: {
      grupoEconomicoId: grupo.id,
      nombre: 'TechCorp Solutions SA',
      rut: '218765430019',
      email: 'admin@techcorp.com.uy',
    },
  });

  const cliente4 = await prisma.cliente.create({
    data: {
      grupoEconomicoId: grupo.id,
      nombre: 'Global Innovations Inc',
      rut: 'US-987654321',
      email: 'procurement@globalinnovations.com',
    },
  });

  // ===================================
  // 8. PROVEEDORES
  // ===================================
  console.log('📦 Creating Proveedores...');
  const proveedor1 = await prisma.proveedor.create({
    data: {
      grupoEconomicoId: grupo.id,
      nombre: 'Amazon Web Services (AWS)',
      rut: 'US-AWS123456',
      email: 'billing@aws.amazon.com',
    },
  });

  const proveedor2 = await prisma.proveedor.create({
    data: {
      grupoEconomicoId: grupo.id,
      nombre: 'Microsoft Azure',
      rut: 'US-MSFT789012',
      email: 'billing@azure.microsoft.com',
    },
  });

  const proveedor3 = await prisma.proveedor.create({
    data: {
      grupoEconomicoId: grupo.id,
      nombre: 'Antel Telecomunicaciones',
      rut: '210360090018',
      email: 'empresas@antel.com.uy',
    },
  });

  const proveedor4 = await prisma.proveedor.create({
    data: {
      grupoEconomicoId: grupo.id,
      nombre: 'Estudio Contable Rodríguez & Asociados',
      rut: '219876540015',
      email: 'contacto@contadores.com.uy',
    },
  });

  // ===================================
  // 9. TIPOS DE CAMBIO
  // ===================================
  console.log('💱 Creating TiposCambio...');
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const fecha = new Date(today);
    fecha.setDate(fecha.getDate() - i);
    const variacion = (Math.random() - 0.5) * 0.5; // ±0.25
    const tipoCambio = 40.50 + variacion;

    await prisma.tipoCambio.create({
      data: {
        grupoEconomicoId: grupo.id,
        fecha: fecha,
        monedaOrigen: 'USD',
        monedaDestino: 'UYU',
        tipoCambio: tipoCambio,
        fuente: 'BCU',
      },
    });
  }

  // ===================================
  // 10. PERIODOS CONTABLES
  // ===================================
  console.log('📅 Creating PeriodosContables...');

  // Ejercicio 2024 (cerrado)
  await prisma.periodoContable.create({
    data: {
      grupoEconomicoId: grupo.id,
      tipo: TipoPeriodo.EJERCICIO,
      ejercicio: 2024,
      fechaInicio: new Date('2024-01-01'),
      fechaFin: new Date('2024-12-31'),
      cerrado: true,
      fechaCierre: new Date('2025-01-15'),
      cerradoPor: contador.id,
    },
  });

  // Meses 2024 (cerrados)
  for (let mes = 1; mes <= 12; mes++) {
    const fechaInicio = new Date(2024, mes - 1, 1);
    const fechaFin = new Date(2024, mes, 0);
    await prisma.periodoContable.create({
      data: {
        grupoEconomicoId: grupo.id,
        tipo: TipoPeriodo.MES,
        ejercicio: 2024,
        mes: mes,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        cerrado: true,
        fechaCierre: new Date(2024, mes, 5),
        cerradoPor: contador.id,
      },
    });
  }

  // Ejercicio 2025 (abierto)
  await prisma.periodoContable.create({
    data: {
      grupoEconomicoId: grupo.id,
      tipo: TipoPeriodo.EJERCICIO,
      ejercicio: 2025,
      fechaInicio: new Date('2025-01-01'),
      fechaFin: new Date('2025-12-31'),
      cerrado: false,
    },
  });

  // Meses 2025 (abiertos hasta octubre, noviembre abierto)
  for (let mes = 1; mes <= 11; mes++) {
    const fechaInicio = new Date(2025, mes - 1, 1);
    const fechaFin = new Date(2025, mes, 0);
    await prisma.periodoContable.create({
      data: {
        grupoEconomicoId: grupo.id,
        tipo: TipoPeriodo.MES,
        ejercicio: 2025,
        mes: mes,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        cerrado: mes <= 10, // Hasta octubre cerrado
        fechaCierre: mes <= 10 ? new Date(2025, mes, 5) : null,
        cerradoPor: mes <= 10 ? contador.id : null,
      },
    });
  }

  // ===================================
  // 11. ASIENTOS DE EJEMPLO
  // ===================================
  console.log('📝 Creating Asientos...');

  // ASIENTO 1: Apertura capital social
  const asiento1 = await prisma.asiento.create({
    data: {
      grupoEconomicoId: grupo.id,
      empresaId: empresaUY.id,
      numero: 1,
      fecha: new Date('2025-01-02'),
      descripcion: 'Apertura - Aporte Capital Social',
      tipo: TipoAsiento.APERTURA,
      estado: EstadoAsiento.CONFIRMADO,
      creadoPor: admin.id,
    },
  });

  await prisma.lineaAsiento.createMany({
    data: [
      {
        asientoId: asiento1.id,
        cuentaId: bancoBROUMN.id,
        debe: 1000000.00,
        haber: 0,
        moneda: 'UYU',
        codigoCuenta: bancoBROUMN.codigo,
        nombreCuenta: bancoBROUMN.nombre,
        tipoCuenta: TipoCuenta.ACTIVO,
      },
      {
        asientoId: asiento1.id,
        cuentaId: capitalSocial.id,
        debe: 0,
        haber: 1000000.00,
        moneda: 'UYU',
        codigoCuenta: capitalSocial.codigo,
        nombreCuenta: capitalSocial.nombre,
        tipoCuenta: TipoCuenta.PATRIMONIO,
      },
    ],
  });

  // ASIENTO 2: Factura de venta a cliente
  const asiento2 = await prisma.asiento.create({
    data: {
      grupoEconomicoId: grupo.id,
      empresaId: empresaUY.id,
      numero: 2,
      fecha: new Date('2025-11-05'),
      descripcion: 'Factura 001-0123 - TechCorp Solutions SA - Servicios de desarrollo',
      tipo: TipoAsiento.DIARIO,
      estado: EstadoAsiento.CONFIRMADO,
      creadoPor: operativo.id,
    },
  });

  await prisma.lineaAsiento.createMany({
    data: [
      {
        asientoId: asiento2.id,
        cuentaId: clientesLocales.id,
        debe: 122000.00, // 100000 + 22% IVA
        haber: 0,
        moneda: 'UYU',
        auxiliarTipo: TipoAuxiliar.CLIENTE,
        auxiliarId: cliente3.id,
        auxiliarNombre: cliente3.nombre,
        codigoCuenta: clientesLocales.codigo,
        nombreCuenta: clientesLocales.nombre,
        tipoCuenta: TipoCuenta.ACTIVO,
        glosa: 'Desarrollo módulo de reportes - 40 horas',
      },
      {
        asientoId: asiento2.id,
        cuentaId: ventaServicios.id,
        debe: 0,
        haber: 100000.00,
        moneda: 'UYU',
        codigoCuenta: ventaServicios.codigo,
        nombreCuenta: ventaServicios.nombre,
        tipoCuenta: TipoCuenta.INGRESO,
      },
      {
        asientoId: asiento2.id,
        cuentaId: ivaDebitoFiscal.id,
        debe: 0,
        haber: 22000.00,
        moneda: 'UYU',
        codigoCuenta: ivaDebitoFiscal.codigo,
        nombreCuenta: ivaDebitoFiscal.nombre,
        tipoCuenta: TipoCuenta.PASIVO,
        glosa: 'IVA 22% sobre servicios',
      },
    ],
  });

  // ASIENTO 3: Pago de proveedor (AWS)
  const asiento3 = await prisma.asiento.create({
    data: {
      grupoEconomicoId: grupo.id,
      empresaId: empresaUY.id,
      numero: 3,
      fecha: new Date('2025-11-10'),
      descripcion: 'Pago AWS - Factura octubre 2025',
      tipo: TipoAsiento.DIARIO,
      estado: EstadoAsiento.CONFIRMADO,
      creadoPor: operativo.id,
    },
  });

  await prisma.lineaAsiento.createMany({
    data: [
      {
        asientoId: asiento3.id,
        cuentaId: costoServiciosCloud.id,
        debe: 950.00,
        haber: 0,
        moneda: 'USD',
        tipoCambio: 40.50,
        auxiliarTipo: TipoAuxiliar.PROVEEDOR,
        auxiliarId: proveedor1.id,
        auxiliarNombre: proveedor1.nombre,
        codigoCuenta: costoServiciosCloud.codigo,
        nombreCuenta: costoServiciosCloud.nombre,
        tipoCuenta: TipoCuenta.EGRESO,
        glosa: 'Servicios cloud octubre 2025',
      },
      {
        asientoId: asiento3.id,
        cuentaId: bancoBROUUSD.id,
        debe: 0,
        haber: 950.00,
        moneda: 'USD',
        tipoCambio: 40.50,
        codigoCuenta: bancoBROUUSD.codigo,
        nombreCuenta: bancoBROUUSD.nombre,
        tipoCuenta: TipoCuenta.ACTIVO,
      },
    ],
  });

  // ASIENTO 4: Pago de sueldos
  const asiento4 = await prisma.asiento.create({
    data: {
      grupoEconomicoId: grupo.id,
      empresaId: empresaUY.id,
      numero: 4,
      fecha: new Date('2025-11-01'),
      descripcion: 'Pago de sueldos octubre 2025',
      tipo: TipoAsiento.DIARIO,
      estado: EstadoAsiento.CONFIRMADO,
      creadoPor: contador.id,
    },
  });

  await prisma.lineaAsiento.createMany({
    data: [
      {
        asientoId: asiento4.id,
        cuentaId: sueldosAdministracion.id,
        debe: 180000.00,
        haber: 0,
        moneda: 'UYU',
        codigoCuenta: sueldosAdministracion.codigo,
        nombreCuenta: sueldosAdministracion.nombre,
        tipoCuenta: TipoCuenta.EGRESO,
        glosa: 'Sueldos equipo administrativo octubre',
      },
      {
        asientoId: asiento4.id,
        cuentaId: bancoBROUMN.id,
        debe: 0,
        haber: 180000.00,
        moneda: 'UYU',
        codigoCuenta: bancoBROUMN.codigo,
        nombreCuenta: bancoBROUMN.nombre,
        tipoCuenta: TipoCuenta.ACTIVO,
      },
    ],
  });

  // ===================================
  // 12. OBLIGACIONES
  // ===================================
  console.log('📋 Creating Obligaciones...');

  // OBLIGACIÓN 1: Compra de licencias Microsoft en 6 cuotas
  const obligacion1 = await prisma.obligacion.create({
    data: {
      grupoEconomicoId: grupo.id,
      tipo: TipoObligacion.PAGAR,
      descripcion: 'Compra licencias Microsoft 365 - 20 usuarios - Plan anual',
      montoTotal: 2400.00,
      moneda: 'USD',
      fechaEmision: new Date('2025-11-01'),
      auxiliarTipo: TipoAuxiliar.PROVEEDOR,
      auxiliarId: proveedor2.id,
      estado: EstadoObligacion.ACTIVA,
    },
  });

  // Crear 6 cuotas de 400 USD cada una
  for (let i = 1; i <= 6; i++) {
    const fechaVencimiento = new Date('2025-11-01');
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

    await prisma.cuotaObligacion.create({
      data: {
        obligacionId: obligacion1.id,
        numeroCuota: i,
        fechaVencimiento: fechaVencimiento,
        monto: 400.00,
        estado: i === 1 ? EstadoCuota.PAGADA : EstadoCuota.PENDIENTE,
        montoPagado: i === 1 ? 400.00 : 0,
      },
    });
  }

  // Pago de la primera cuota
  await prisma.pagoObligacion.create({
    data: {
      obligacionId: obligacion1.id,
      cuotaId: (await prisma.cuotaObligacion.findFirst({
        where: { obligacionId: obligacion1.id, numeroCuota: 1 }
      }))!.id,
      fechaPago: new Date('2025-11-15'),
      monto: 400.00,
      moneda: 'USD',
      tipoCambio: 40.50,
      observaciones: 'Pago primera cuota Microsoft 365',
    },
  });

  // OBLIGACIÓN 2: Factura de cliente a 30, 60, 90 días
  const obligacion2 = await prisma.obligacion.create({
    data: {
      grupoEconomicoId: grupo.id,
      tipo: TipoObligacion.COBRAR,
      descripcion: 'Proyecto desarrollo sistema gestión - BROU',
      montoTotal: 300000.00,
      moneda: 'UYU',
      fechaEmision: new Date('2025-10-01'),
      auxiliarTipo: TipoAuxiliar.CLIENTE,
      auxiliarId: cliente2.id,
      estado: EstadoObligacion.ACTIVA,
    },
  });

  // Crear 3 cuotas
  const cuota1Fecha = new Date('2025-10-31'); // 30 días
  const cuota2Fecha = new Date('2025-11-30'); // 60 días
  const cuota3Fecha = new Date('2025-12-30'); // 90 días

  await prisma.cuotaObligacion.createMany({
    data: [
      {
        obligacionId: obligacion2.id,
        numeroCuota: 1,
        fechaVencimiento: cuota1Fecha,
        monto: 100000.00,
        estado: EstadoCuota.PAGADA,
        montoPagado: 100000.00,
      },
      {
        obligacionId: obligacion2.id,
        numeroCuota: 2,
        fechaVencimiento: cuota2Fecha,
        monto: 100000.00,
        estado: EstadoCuota.PENDIENTE,
      },
      {
        obligacionId: obligacion2.id,
        numeroCuota: 3,
        fechaVencimiento: cuota3Fecha,
        monto: 100000.00,
        estado: EstadoCuota.PENDIENTE,
      },
    ],
  });

  // Pago primera cuota
  await prisma.pagoObligacion.create({
    data: {
      obligacionId: obligacion2.id,
      cuotaId: (await prisma.cuotaObligacion.findFirst({
        where: { obligacionId: obligacion2.id, numeroCuota: 1 }
      }))!.id,
      fechaPago: new Date('2025-11-05'),
      monto: 100000.00,
      moneda: 'UYU',
      observaciones: 'Cobro primera cuota proyecto BROU',
    },
  });

  // ===================================
  // 13. TEMPLATES DE ASIENTOS
  // ===================================
  console.log('📝 Creating Templates...');
  await prisma.templateAsiento.createMany({
    data: [
      {
        grupoEconomicoId: grupo.id,
        nombre: 'Factura de Venta - Servicios',
        descripcion: 'Template para registrar ventas de servicios con IVA',
        tipo: TipoAsiento.DIARIO,
        requiereAprobacion: false,
      },
      {
        grupoEconomicoId: grupo.id,
        nombre: 'Pago de Sueldos Mensual',
        descripcion: 'Template para el pago mensual de sueldos',
        tipo: TipoAsiento.DIARIO,
        requiereAprobacion: true,
      },
      {
        grupoEconomicoId: grupo.id,
        nombre: 'Pago a Proveedor',
        descripcion: 'Template para pagos a proveedores',
        tipo: TipoAsiento.DIARIO,
        requiereAprobacion: false,
      },
      {
        grupoEconomicoId: grupo.id,
        nombre: 'Ajuste Tipo de Cambio',
        descripcion: 'Template para ajustes por diferencias de cambio',
        tipo: TipoAsiento.AJUSTE_CAMBIO,
        requiereAprobacion: true,
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Datos creados:');
  console.log(`   - 1 Grupo Económico`);
  console.log(`   - 2 Empresas (UY y US)`);
  console.log(`   - 1 Plan de Cuentas con ${await prisma.cuenta.count()} cuentas`);
  console.log(`   - 3 Usuarios con permisos`);
  console.log(`   - 4 Clientes`);
  console.log(`   - 4 Proveedores`);
  console.log(`   - 31 Tipos de cambio (últimos 31 días)`);
  console.log(`   - 26 Períodos contables (2024 y 2025)`);
  console.log(`   - 4 Asientos contables con sus líneas`);
  console.log(`   - 2 Obligaciones con cuotas y pagos`);
  console.log(`   - 4 Templates de asientos`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient, AccountType, Role, PeriodType, AccountNature, IFRSCategory, EntryStatus, EntryType, AuxiliaryType, ObligationType, ObligationStatus, InstallmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ===================================
  // 1. GRUPO ECONÓMICO
  // ===================================
  console.log('📦 Creando Grupo Económico...');
  const group = await prisma.economicGroup.create({
    data: {
      name: 'Grupo Pragmatic Software',
      mainCountry: 'UY',
      baseCurrency: 'UYU',
    },
  });

  // ===================================
  // 2. EMPRESAS
  // ===================================
  console.log('🏢 Creando Empresas...');
  const companyUY = await prisma.company.create({
    data: {
      economicGroupId: group.id,
      name: 'Pragmatic Software S.A.',
      tradeName: 'Pragmatic',
      rut: '217890120018',
      country: 'UY',
      functionalCurrency: 'UYU',
      startDate: new Date('2020-01-01'),
    },
  });

  const companyUS = await prisma.company.create({
    data: {
      economicGroupId: group.id,
      name: 'Pragmatic Labs LLC',
      tradeName: 'Pragmatic Labs',
      rut: 'US-123456789',
      country: 'US',
      functionalCurrency: 'USD',
      startDate: new Date('2022-06-01'),
    },
  });

  // ===================================
  // 3. PLAN DE CUENTAS
  // ===================================
  console.log('📋 Creando Plan de Cuentas...');
  const chartOfAccounts = await prisma.chartOfAccounts.create({
    data: {
      economicGroupId: group.id,
      name: 'Plan de Cuentas Internacional para Empresas de Software',
      description: 'Plan de cuentas estándar para empresas de software según NIIF',
    },
  });

  // ===================================
  // 4. CUENTAS
  // ===================================
  console.log('💰 Creando Cuentas...');

  // ACTIVOS
  const assets = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '1',
      name: 'ACTIVO',
      type: AccountType.ASSET,
      level: 1,
      postable: false,
    },
  });

  // ACTIVO CORRIENTE
  const currentAssets = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '11',
      name: 'ACTIVO CORRIENTE',
      parentAccountId: assets.id,
      type: AccountType.ASSET,
      level: 2,
      postable: false,
      nature: AccountNature.CURRENT,
    },
  });

  // Efectivo y Equivalentes
  const cashAndEquivalents = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '111',
      name: 'Efectivo y Equivalentes',
      parentAccountId: currentAssets.id,
      type: AccountType.ASSET,
      level: 3,
      postable: false,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.CASH_AND_EQUIVALENTS,
    },
  });

  const pettyCash = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '111.001',
      name: 'Caja Chica',
      parentAccountId: cashAndEquivalents.id,
      type: AccountType.ASSET,
      level: 4,
      postable: true,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.CASH_AND_EQUIVALENTS,
    },
  });

  const bankBROUMN = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '111.002',
      name: 'Banco BROU - Cuenta Corriente UYU',
      parentAccountId: cashAndEquivalents.id,
      type: AccountType.ASSET,
      level: 4,
      postable: true,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.CASH_AND_EQUIVALENTS,
    },
  });

  const bankBROUUSD = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '111.003',
      name: 'Banco BROU - Cuenta Corriente USD',
      parentAccountId: cashAndEquivalents.id,
      type: AccountType.ASSET,
      level: 4,
      postable: true,
      currency: 'USD' as any,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.CASH_AND_EQUIVALENTS,
    },
  });

  // Cuentas por Cobrar
  const accountsReceivable = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '112',
      name: 'Cuentas por Cobrar',
      parentAccountId: currentAssets.id,
      type: AccountType.ASSET,
      level: 3,
      postable: false,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.ACCOUNTS_RECEIVABLE,
    },
  });

  const localCustomers = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '112.001',
      name: 'Clientes Locales',
      parentAccountId: accountsReceivable.id,
      type: AccountType.ASSET,
      level: 4,
      postable: true,
      requiresAuxiliary: true,
      auxiliaryType: AuxiliaryType.CUSTOMER,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.ACCOUNTS_RECEIVABLE,
    },
  });

  const foreignCustomers = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '112.002',
      name: 'Clientes del Exterior',
      parentAccountId: accountsReceivable.id,
      type: AccountType.ASSET,
      level: 4,
      postable: true,
      requiresAuxiliary: true,
      auxiliaryType: AuxiliaryType.CUSTOMER,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.ACCOUNTS_RECEIVABLE,
    },
  });

  // IVA
  const vatTaxCredit = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '113.001',
      name: 'IVA Crédito Fiscal',
      parentAccountId: currentAssets.id,
      type: AccountType.ASSET,
      level: 4,
      postable: true,
      nature: AccountNature.CURRENT,
    },
  });

  // PASIVOS
  const liabilities = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '2',
      name: 'PASIVO',
      type: AccountType.LIABILITY,
      level: 1,
      postable: false,
    },
  });

  const currentLiabilities = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '21',
      name: 'PASIVO CORRIENTE',
      parentAccountId: liabilities.id,
      type: AccountType.LIABILITY,
      level: 2,
      postable: false,
      nature: AccountNature.CURRENT,
    },
  });

  const localSuppliers = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '211.001',
      name: 'Proveedores Locales',
      parentAccountId: currentLiabilities.id,
      type: AccountType.LIABILITY,
      level: 4,
      postable: true,
      requiresAuxiliary: true,
      auxiliaryType: AuxiliaryType.SUPPLIER,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.ACCOUNTS_PAYABLE,
    },
  });

  const foreignSuppliers = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '211.002',
      name: 'Proveedores del Exterior',
      parentAccountId: currentLiabilities.id,
      type: AccountType.LIABILITY,
      level: 4,
      postable: true,
      requiresAuxiliary: true,
      auxiliaryType: AuxiliaryType.SUPPLIER,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.ACCOUNTS_PAYABLE,
    },
  });

  const vatTaxDebt = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '212.001',
      name: 'IVA Débito Fiscal',
      parentAccountId: currentLiabilities.id,
      type: AccountType.LIABILITY,
      level: 4,
      postable: true,
      nature: AccountNature.CURRENT,
    },
  });

  const salariesPayable = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '213.001',
      name: 'Sueldos a Pagar',
      parentAccountId: currentLiabilities.id,
      type: AccountType.LIABILITY,
      level: 4,
      postable: true,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.ACCOUNTS_PAYABLE,
    },
  });

  // PATRIMONIO
  const equity = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '3',
      name: 'PATRIMONIO',
      type: AccountType.EQUITY,
      level: 1,
      postable: false,
    },
  });

  const shareCapital = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '31.001',
      name: 'Capital Social',
      parentAccountId: equity.id,
      type: AccountType.EQUITY,
      level: 3,
      postable: true,
      ifrsCategory: IFRSCategory.SHARE_CAPITAL,
    },
  });

  const retainedEarnings = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '33.002',
      name: 'Resultados Acumulados',
      parentAccountId: equity.id,
      type: AccountType.EQUITY,
      level: 3,
      postable: true,
      ifrsCategory: IFRSCategory.RETAINED_EARNINGS,
    },
  });

  // INGRESOS
  const income = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '4',
      name: 'INGRESOS',
      type: AccountType.INCOME,
      level: 1,
      postable: false,
    },
  });

  const serviceRevenue = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '41.001',
      name: 'Ingresos por Servicios de Software',
      parentAccountId: income.id,
      type: AccountType.INCOME,
      level: 3,
      postable: true,
      ifrsCategory: IFRSCategory.OPERATING_INCOME,
    },
  });

  const licenseRevenue = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '41.002',
      name: 'Ingresos por Licencias',
      parentAccountId: income.id,
      type: AccountType.INCOME,
      level: 3,
      postable: true,
      ifrsCategory: IFRSCategory.OPERATING_INCOME,
    },
  });

  // EGRESOS
  const expenses = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '5',
      name: 'EGRESOS',
      type: AccountType.EXPENSE,
      level: 1,
      postable: false,
    },
  });

  const cloudServicesCost = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '51.001',
      name: 'Costo de Servicios en la Nube (AWS/Azure)',
      parentAccountId: expenses.id,
      type: AccountType.EXPENSE,
      level: 3,
      postable: true,
      ifrsCategory: IFRSCategory.COST_OF_SALES,
    },
  });

  const administrativeSalaries = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '52.001',
      name: 'Sueldos Administrativos',
      parentAccountId: expenses.id,
      type: AccountType.EXPENSE,
      level: 3,
      postable: true,
      ifrsCategory: IFRSCategory.ADMINISTRATIVE_EXPENSES,
    },
  });

  const officeRent = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '52.003',
      name: 'Alquiler de Oficina',
      parentAccountId: expenses.id,
      type: AccountType.EXPENSE,
      level: 3,
      postable: true,
      ifrsCategory: IFRSCategory.ADMINISTRATIVE_EXPENSES,
    },
  });

  const digitalMarketing = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '53.002',
      name: 'Marketing Digital',
      parentAccountId: expenses.id,
      type: AccountType.EXPENSE,
      level: 3,
      postable: true,
      ifrsCategory: IFRSCategory.SELLING_EXPENSES,
    },
  });

  // ===================================
  // 5. CONFIGURACIÓN CONTABLE
  // ===================================
  console.log('⚙️  Creando Configuración Contable...');
  await prisma.accountingConfiguration.create({
    data: {
      economicGroupId: group.id,
      allowEntriesInClosedPeriod: false,
      requireGlobalApproval: false,
      minimumApprovalAmount: 50000.00,
      allowUnbalancedEntries: false,
      amountDecimals: 2,
      exchangeRateDecimals: 4,
    },
  });

  // ===================================
  // 6. USUARIOS
  // ===================================
  console.log('👥 Creando Usuarios...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@pragmatic.com.uy',
      name: 'Administrador del Sistema',
      authProviderId: 'clerk_admin_123',
    },
  });

  const accountant = await prisma.user.create({
    data: {
      email: 'contador@pragmatic.com.uy',
      name: 'María Rodríguez',
      authProviderId: 'clerk_accountant_456',
    },
  });

  const operator = await prisma.user.create({
    data: {
      email: 'operaciones@pragmatic.com.uy',
      name: 'Juan Pérez',
      authProviderId: 'clerk_operator_789',
    },
  });

  // Permisos
  await prisma.userGroup.create({
    data: {
      userId: admin.id,
      economicGroupId: group.id,
      role: Role.ADMIN,
    },
  });

  await prisma.userGroup.create({
    data: {
      userId: accountant.id,
      economicGroupId: group.id,
      role: Role.ACCOUNTANT,
    },
  });

  await prisma.userGroup.create({
    data: {
      userId: operator.id,
      economicGroupId: group.id,
      role: Role.OPERATOR,
    },
  });

  // ===================================
  // 7. CLIENTES
  // ===================================
  console.log('🤝 Creando Clientes...');
  const customer1 = await prisma.customer.create({
    data: {
      economicGroupId: group.id,
      name: 'Ministerio de Economía y Finanzas',
      rut: '211266530012',
      email: 'compras@mef.gub.uy',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      economicGroupId: group.id,
      name: 'Banco de la República Oriental del Uruguay',
      rut: '217003530018',
      email: 'sistemas@brou.com.uy',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      economicGroupId: group.id,
      name: 'TechCorp Solutions SA',
      rut: '218765430019',
      email: 'admin@techcorp.com.uy',
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      economicGroupId: group.id,
      name: 'Innovaciones Globales Inc',
      rut: 'US-987654321',
      email: 'compras@innovacionesglobales.com',
    },
  });

  // ===================================
  // 8. PROVEEDORES
  // ===================================
  console.log('📦 Creando Proveedores...');
  const supplier1 = await prisma.supplier.create({
    data: {
      economicGroupId: group.id,
      name: 'Amazon Web Services (AWS)',
      rut: 'US-AWS123456',
      email: 'facturacion@aws.amazon.com',
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      economicGroupId: group.id,
      name: 'Microsoft Azure',
      rut: 'US-MSFT789012',
      email: 'facturacion@azure.microsoft.com',
    },
  });

  const supplier3 = await prisma.supplier.create({
    data: {
      economicGroupId: group.id,
      name: 'Antel Telecomunicaciones',
      rut: '210360090018',
      email: 'empresas@antel.com.uy',
    },
  });

  const supplier4 = await prisma.supplier.create({
    data: {
      economicGroupId: group.id,
      name: 'Estudio Contable Rodríguez & Asociados',
      rut: '219876540015',
      email: 'contacto@estudiocontable.com.uy',
    },
  });

  // ===================================
  // 9. TIPOS DE CAMBIO
  // ===================================
  console.log('💱 Creando Tipos de Cambio...');
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const variation = (Math.random() - 0.5) * 0.5; // ±0.25
    const rate = 40.50 + variation;

    await prisma.exchangeRate.create({
      data: {
        economicGroupId: group.id,
        date: date,
        sourceCurrency: 'USD',
        targetCurrency: 'UYU',
        rate: rate,
        source: 'BCU',
      },
    });
  }

  // ===================================
  // 10. PERÍODOS CONTABLES
  // ===================================
  console.log('📅 Creando Períodos Contables...');

  // Ejercicio fiscal 2024 (cerrado)
  await prisma.accountingPeriod.create({
    data: {
      economicGroupId: group.id,
      type: PeriodType.FISCAL_YEAR,
      fiscalYear: 2024,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      closed: true,
      closedAt: new Date('2025-01-15'),
      closedBy: accountant.id,
    },
  });

  // Meses 2024 (cerrados)
  for (let month = 1; month <= 12; month++) {
    const startDate = new Date(2024, month - 1, 1);
    const endDate = new Date(2024, month, 0);
    await prisma.accountingPeriod.create({
      data: {
        economicGroupId: group.id,
        type: PeriodType.MONTH,
        fiscalYear: 2024,
        month: month,
        startDate: startDate,
        endDate: endDate,
        closed: true,
        closedAt: new Date(2024, month, 5),
        closedBy: accountant.id,
      },
    });
  }

  // Ejercicio fiscal 2025 (abierto)
  await prisma.accountingPeriod.create({
    data: {
      economicGroupId: group.id,
      type: PeriodType.FISCAL_YEAR,
      fiscalYear: 2025,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      closed: false,
    },
  });

  // Meses 2025 (abiertos hasta octubre, noviembre abierto)
  for (let month = 1; month <= 11; month++) {
    const startDate = new Date(2025, month - 1, 1);
    const endDate = new Date(2025, month, 0);
    await prisma.accountingPeriod.create({
      data: {
        economicGroupId: group.id,
        type: PeriodType.MONTH,
        fiscalYear: 2025,
        month: month,
        startDate: startDate,
        endDate: endDate,
        closed: month <= 10, // Cerrados hasta octubre
        closedAt: month <= 10 ? new Date(2025, month, 5) : null,
        closedBy: month <= 10 ? accountant.id : null,
      },
    });
  }

  // ===================================
  // 11. ASIENTOS CONTABLES
  // ===================================
  console.log('📝 Creando Asientos Contables...');

  // ASIENTO 1: Apertura - Aporte de capital
  const entry1 = await prisma.journalEntry.create({
    data: {
      economicGroupId: group.id,
      companyId: companyUY.id,
      number: 1,
      date: new Date('2025-01-02'),
      description: 'Apertura - Aporte de Capital Social',
      type: EntryType.OPENING,
      status: EntryStatus.CONFIRMED,
      createdBy: admin.id,
    },
  });

  await prisma.entryLine.createMany({
    data: [
      {
        entryId: entry1.id,
        accountId: bankBROUMN.id,
        debit: 1000000.00,
        credit: 0,
        currency: 'UYU',
        accountCode: bankBROUMN.code,
        accountName: bankBROUMN.name,
        accountType: AccountType.ASSET,
      },
      {
        entryId: entry1.id,
        accountId: shareCapital.id,
        debit: 0,
        credit: 1000000.00,
        currency: 'UYU',
        accountCode: shareCapital.code,
        accountName: shareCapital.name,
        accountType: AccountType.EQUITY,
      },
    ],
  });

  // ASIENTO 2: Factura de venta a cliente
  const entry2 = await prisma.journalEntry.create({
    data: {
      economicGroupId: group.id,
      companyId: companyUY.id,
      number: 2,
      date: new Date('2025-11-05'),
      description: 'Factura 001-0123 - TechCorp Solutions SA - Servicios de desarrollo',
      type: EntryType.JOURNAL,
      status: EntryStatus.CONFIRMED,
      createdBy: operator.id,
    },
  });

  await prisma.entryLine.createMany({
    data: [
      {
        entryId: entry2.id,
        accountId: localCustomers.id,
        debit: 122000.00, // 100000 + 22% IVA
        credit: 0,
        currency: 'UYU',
        auxiliaryType: AuxiliaryType.CUSTOMER,
        auxiliaryId: customer3.id,
        auxiliaryName: customer3.name,
        accountCode: localCustomers.code,
        accountName: localCustomers.name,
        accountType: AccountType.ASSET,
        note: 'Desarrollo módulo de reportes - 40 horas',
      },
      {
        entryId: entry2.id,
        accountId: serviceRevenue.id,
        debit: 0,
        credit: 100000.00,
        currency: 'UYU',
        accountCode: serviceRevenue.code,
        accountName: serviceRevenue.name,
        accountType: AccountType.INCOME,
      },
      {
        entryId: entry2.id,
        accountId: vatTaxDebt.id,
        debit: 0,
        credit: 22000.00,
        currency: 'UYU',
        accountCode: vatTaxDebt.code,
        accountName: vatTaxDebt.name,
        accountType: AccountType.LIABILITY,
        note: 'IVA 22% sobre servicios',
      },
    ],
  });

  // ASIENTO 3: Pago a proveedor (AWS)
  const entry3 = await prisma.journalEntry.create({
    data: {
      economicGroupId: group.id,
      companyId: companyUY.id,
      number: 3,
      date: new Date('2025-11-10'),
      description: 'Pago AWS - Factura octubre 2025',
      type: EntryType.JOURNAL,
      status: EntryStatus.CONFIRMED,
      createdBy: operator.id,
    },
  });

  await prisma.entryLine.createMany({
    data: [
      {
        entryId: entry3.id,
        accountId: cloudServicesCost.id,
        debit: 950.00,
        credit: 0,
        currency: 'USD',
        exchangeRate: 40.50,
        auxiliaryType: AuxiliaryType.SUPPLIER,
        auxiliaryId: supplier1.id,
        auxiliaryName: supplier1.name,
        accountCode: cloudServicesCost.code,
        accountName: cloudServicesCost.name,
        accountType: AccountType.EXPENSE,
        note: 'Servicios en la nube octubre 2025',
      },
      {
        entryId: entry3.id,
        accountId: bankBROUUSD.id,
        debit: 0,
        credit: 950.00,
        currency: 'USD',
        exchangeRate: 40.50,
        accountCode: bankBROUUSD.code,
        accountName: bankBROUUSD.name,
        accountType: AccountType.ASSET,
      },
    ],
  });

  // ASIENTO 4: Pago de sueldos
  const entry4 = await prisma.journalEntry.create({
    data: {
      economicGroupId: group.id,
      companyId: companyUY.id,
      number: 4,
      date: new Date('2025-11-01'),
      description: 'Pago de Sueldos octubre 2025',
      type: EntryType.JOURNAL,
      status: EntryStatus.CONFIRMED,
      createdBy: accountant.id,
    },
  });

  await prisma.entryLine.createMany({
    data: [
      {
        entryId: entry4.id,
        accountId: administrativeSalaries.id,
        debit: 180000.00,
        credit: 0,
        currency: 'UYU',
        accountCode: administrativeSalaries.code,
        accountName: administrativeSalaries.name,
        accountType: AccountType.EXPENSE,
        note: 'Sueldos equipo administrativo octubre',
      },
      {
        entryId: entry4.id,
        accountId: bankBROUMN.id,
        debit: 0,
        credit: 180000.00,
        currency: 'UYU',
        accountCode: bankBROUMN.code,
        accountName: bankBROUMN.name,
        accountType: AccountType.ASSET,
      },
    ],
  });

  // ===================================
  // 12. OBLIGACIONES
  // ===================================
  console.log('📋 Creando Obligaciones...');

  // OBLIGACIÓN 1: Compra de licencias Microsoft en 6 cuotas
  const obligation1 = await prisma.obligation.create({
    data: {
      economicGroupId: group.id,
      type: ObligationType.PAYABLE,
      description: 'Compra licencias Microsoft 365 - 20 usuarios - Plan anual',
      totalAmount: 2400.00,
      currency: 'USD',
      issueDate: new Date('2025-11-01'),
      auxiliaryType: AuxiliaryType.SUPPLIER,
      auxiliaryId: supplier2.id,
      status: ObligationStatus.ACTIVE,
    },
  });

  // Crear 6 cuotas de 400 USD cada una
  for (let i = 1; i <= 6; i++) {
    const dueDate = new Date('2025-11-01');
    dueDate.setMonth(dueDate.getMonth() + i);

    await prisma.obligationInstallment.create({
      data: {
        obligationId: obligation1.id,
        installmentNumber: i,
        dueDate: dueDate,
        amount: 400.00,
        status: i === 1 ? InstallmentStatus.PAID : InstallmentStatus.PENDING,
        paidAmount: i === 1 ? 400.00 : 0,
      },
    });
  }

  // Pago de primera cuota
  await prisma.obligationPayment.create({
    data: {
      obligationId: obligation1.id,
      installmentId: (await prisma.obligationInstallment.findFirst({
        where: { obligationId: obligation1.id, installmentNumber: 1 }
      }))!.id,
      paymentDate: new Date('2025-11-15'),
      amount: 400.00,
      currency: 'USD',
      exchangeRate: 40.50,
      notes: 'Pago primera cuota Microsoft 365',
    },
  });

  // OBLIGACIÓN 2: Factura cliente a 30, 60, 90 días
  const obligation2 = await prisma.obligation.create({
    data: {
      economicGroupId: group.id,
      type: ObligationType.RECEIVABLE,
      description: 'Proyecto desarrollo sistema de gestión - BROU',
      totalAmount: 300000.00,
      currency: 'UYU',
      issueDate: new Date('2025-10-01'),
      auxiliaryType: AuxiliaryType.CUSTOMER,
      auxiliaryId: customer2.id,
      status: ObligationStatus.ACTIVE,
    },
  });

  // Crear 3 cuotas
  const installment1Date = new Date('2025-10-31'); // 30 días
  const installment2Date = new Date('2025-11-30'); // 60 días
  const installment3Date = new Date('2025-12-30'); // 90 días

  await prisma.obligationInstallment.createMany({
    data: [
      {
        obligationId: obligation2.id,
        installmentNumber: 1,
        dueDate: installment1Date,
        amount: 100000.00,
        status: InstallmentStatus.PAID,
        paidAmount: 100000.00,
      },
      {
        obligationId: obligation2.id,
        installmentNumber: 2,
        dueDate: installment2Date,
        amount: 100000.00,
        status: InstallmentStatus.PENDING,
      },
      {
        obligationId: obligation2.id,
        installmentNumber: 3,
        dueDate: installment3Date,
        amount: 100000.00,
        status: InstallmentStatus.PENDING,
      },
    ],
  });

  // Cobro primera cuota
  await prisma.obligationPayment.create({
    data: {
      obligationId: obligation2.id,
      installmentId: (await prisma.obligationInstallment.findFirst({
        where: { obligationId: obligation2.id, installmentNumber: 1 }
      }))!.id,
      paymentDate: new Date('2025-11-05'),
      amount: 100000.00,
      currency: 'UYU',
      notes: 'Cobro primera cuota proyecto BROU',
    },
  });

  // ===================================
  // 13. PLANTILLAS DE ASIENTOS
  // ===================================
  console.log('📝 Creando Plantillas...');
  await prisma.entryTemplate.createMany({
    data: [
      {
        economicGroupId: group.id,
        name: 'Factura de Venta - Servicios',
        description: 'Plantilla para registrar ventas de servicios con IVA',
        type: EntryType.JOURNAL,
        requiresApproval: false,
      },
      {
        economicGroupId: group.id,
        name: 'Pago Mensual de Sueldos',
        description: 'Plantilla para pago mensual de sueldos',
        type: EntryType.JOURNAL,
        requiresApproval: true,
      },
      {
        economicGroupId: group.id,
        name: 'Pago a Proveedores',
        description: 'Plantilla para pagos a proveedores',
        type: EntryType.JOURNAL,
        requiresApproval: false,
      },
      {
        economicGroupId: group.id,
        name: 'Ajuste por Diferencia de Cambio',
        description: 'Plantilla para ajustes por diferencias de cambio',
        type: EntryType.EXCHANGE_ADJUSTMENT,
        requiresApproval: true,
      },
    ],
  });

  console.log('✅ Seed completado exitosamente!');
  console.log('\n📊 Datos creados:');
  console.log(`   - 1 Grupo Económico`);
  console.log(`   - 2 Empresas (UY y US)`);
  console.log(`   - 1 Plan de Cuentas con ${await prisma.account.count()} cuentas`);
  console.log(`   - 3 Usuarios con permisos`);
  console.log(`   - 4 Clientes`);
  console.log(`   - 4 Proveedores`);
  console.log(`   - 31 Tipos de cambio (últimos 31 días)`);
  console.log(`   - 26 Períodos contables (2024 y 2025)`);
  console.log(`   - 4 Asientos contables con líneas`);
  console.log(`   - 2 Obligaciones con cuotas y pagos`);
  console.log(`   - 4 Plantillas de asientos`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

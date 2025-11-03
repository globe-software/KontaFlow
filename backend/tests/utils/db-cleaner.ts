import { prisma } from '../../src/lib/prisma';

/**
 * Limpia todas las tablas de la base de datos
 * Usa TRUNCATE CASCADE para eliminar todos los datos y resetear sequences
 */
export async function cleanDatabase() {
  const tables = [
    'entry_lines',
    'entries',
    'accounting_periods',
    'accounts',
    'charts_of_accounts',
    'accounting_configuration',
    'companies',
    'user_groups',
    'economic_groups',
    'users',
  ];

  // Ejecutar TRUNCATE en todas las tablas en orden inverso (por foreign keys)
  for (const table of tables.reverse()) {
    try {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`
      );
    } catch (error) {
      // Ignorar si la tabla no existe aún
      if (error instanceof Error && !error.message.includes('does not exist')) {
        throw error;
      }
    }
  }
}

/**
 * Seed de datos básicos para testing
 * IDs predecibles y datos consistentes
 */
export async function seedTestData() {
  // Crear usuarios de prueba
  const user1 = await prisma.user.create({
    data: {
      id: 1,
      authProviderId: 'test_auth_id_1',
      email: 'admin@test.com',
      name: 'Admin Test',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 2,
      authProviderId: 'test_auth_id_2',
      email: 'contador@test.com',
      name: 'Contador Test',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      id: 3,
      authProviderId: 'test_auth_id_3',
      email: 'operativo@test.com',
      name: 'Operativo Test',
    },
  });

  // Crear grupo económico de prueba
  const group1 = await prisma.economicGroup.create({
    data: {
      id: 1,
      name: 'Pragmatic Software Group',
      mainCountry: 'UY',
      baseCurrency: 'UYU',
      active: true,
    },
  });

  // Crear plan de cuentas para el grupo
  const chartOfAccounts = await prisma.chartOfAccounts.create({
    data: {
      id: 1,
      economicGroupId: group1.id,
      name: 'Chart of Accounts - Test Group 1',
      description: 'Test chart of accounts',
      active: true,
    },
  });

  // Crear configuración contable para el grupo
  const configuration = await prisma.accountingConfiguration.create({
    data: {
      id: 1,
      economicGroupId: group1.id,
      allowEntriesInClosedPeriod: false,
      requireGlobalApproval: false,
      minimumApprovalAmount: 50000,
      allowUnbalancedEntries: false,
      amountDecimals: 2,
      exchangeRateDecimals: 4,
    },
  });

  // Asignar usuarios al grupo
  await prisma.userGroup.create({
    data: {
      userId: user1.id,
      economicGroupId: group1.id,
      role: 'ADMIN',
    },
  });

  await prisma.userGroup.create({
    data: {
      userId: user2.id,
      economicGroupId: group1.id,
      role: 'ACCOUNTANT',
    },
  });

  await prisma.userGroup.create({
    data: {
      userId: user3.id,
      economicGroupId: group1.id,
      role: 'OPERATOR',
    },
  });

  // Crear empresas de prueba
  const company1 = await prisma.company.create({
    data: {
      id: 1,
      economicGroupId: group1.id,
      name: 'Test Company UY S.A.',
      tradeName: 'Test Company UY',
      rut: '217890120018',
      country: 'UY',
      functionalCurrency: 'UYU',
      active: true,
    },
  });

  const company2 = await prisma.company.create({
    data: {
      id: 2,
      economicGroupId: group1.id,
      name: 'Test Company LLC',
      tradeName: 'Test Company US',
      rut: '123456789012',
      country: 'US',
      functionalCurrency: 'USD',
      active: true,
    },
  });

  // Crear cuentas de prueba (Plan de Cuentas)
  // Activos
  const account1 = await prisma.account.create({
    data: {
      id: 1,
      chartOfAccountsId: chartOfAccounts.id,
      code: '1',
      name: 'ACTIVO',
      type: 'ASSET',
      level: 1,
      postable: false,
      requiresAuxiliary: false,
      currency: 'FUNCTIONAL',
      active: true,
    },
  });

  await prisma.account.create({
    data: {
      id: 2,
      chartOfAccountsId: chartOfAccounts.id,
      code: '1.1',
      name: 'ACTIVO CORRIENTE',
      parentAccountId: account1.id,
      type: 'ASSET',
      level: 2,
      postable: false,
      requiresAuxiliary: false,
      currency: 'FUNCTIONAL',
      nature: 'CURRENT',
      active: true,
    },
  });

  await prisma.account.create({
    data: {
      id: 3,
      chartOfAccountsId: chartOfAccounts.id,
      code: '1.1.01',
      name: 'Caja',
      parentAccountId: 2,
      type: 'ASSET',
      level: 3,
      postable: true,
      requiresAuxiliary: false,
      currency: 'FUNCTIONAL',
      nature: 'CURRENT',
      ifrsCategory: 'CASH_AND_EQUIVALENTS',
      active: true,
    },
  });

  await prisma.account.create({
    data: {
      id: 4,
      chartOfAccountsId: chartOfAccounts.id,
      code: '1.1.02',
      name: 'Bancos',
      parentAccountId: 2,
      type: 'ASSET',
      level: 3,
      postable: true,
      requiresAuxiliary: false,
      currency: 'FUNCTIONAL',
      nature: 'CURRENT',
      ifrsCategory: 'CASH_AND_EQUIVALENTS',
      active: true,
    },
  });

  // Pasivos
  const account5 = await prisma.account.create({
    data: {
      id: 5,
      chartOfAccountsId: chartOfAccounts.id,
      code: '2',
      name: 'PASIVO',
      type: 'LIABILITY',
      level: 1,
      postable: false,
      requiresAuxiliary: false,
      currency: 'FUNCTIONAL',
      active: true,
    },
  });

  await prisma.account.create({
    data: {
      id: 6,
      chartOfAccountsId: chartOfAccounts.id,
      code: '2.1',
      name: 'PASIVO CORRIENTE',
      parentAccountId: account5.id,
      type: 'LIABILITY',
      level: 2,
      postable: false,
      requiresAuxiliary: false,
      currency: 'FUNCTIONAL',
      nature: 'CURRENT',
      active: true,
    },
  });

  // Patrimonio
  await prisma.account.create({
    data: {
      id: 7,
      chartOfAccountsId: chartOfAccounts.id,
      code: '3',
      name: 'PATRIMONIO',
      type: 'EQUITY',
      level: 1,
      postable: false,
      requiresAuxiliary: false,
      currency: 'FUNCTIONAL',
      active: true,
    },
  });

  // Ingresos
  await prisma.account.create({
    data: {
      id: 8,
      chartOfAccountsId: chartOfAccounts.id,
      code: '4',
      name: 'INGRESOS',
      type: 'INCOME',
      level: 1,
      postable: false,
      requiresAuxiliary: false,
      currency: 'FUNCTIONAL',
      active: true,
    },
  });

  // Egresos
  await prisma.account.create({
    data: {
      id: 9,
      chartOfAccountsId: chartOfAccounts.id,
      code: '5',
      name: 'EGRESOS',
      type: 'EXPENSE',
      level: 1,
      postable: false,
      requiresAuxiliary: false,
      currency: 'FUNCTIONAL',
      active: true,
    },
  });

  // Crear períodos contables de prueba
  await prisma.accountingPeriod.create({
    data: {
      id: 1,
      economicGroupId: group1.id,
      type: 'FISCAL_YEAR',
      fiscalYear: 2024,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      closed: false,
    },
  });

  await prisma.accountingPeriod.create({
    data: {
      id: 2,
      economicGroupId: group1.id,
      type: 'MONTH',
      fiscalYear: 2024,
      month: 1,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      closed: false,
    },
  });

  // Resetear las secuencias de IDs para que los tests puedan crear nuevos registros
  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"users"', 'id'), COALESCE(MAX(id), 1)) FROM "users";
  `);
  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"economic_groups"', 'id'), COALESCE(MAX(id), 1)) FROM "economic_groups";
  `);
  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"companies"', 'id'), COALESCE(MAX(id), 1)) FROM "companies";
  `);
  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"charts_of_accounts"', 'id'), COALESCE(MAX(id), 1)) FROM "charts_of_accounts";
  `);
  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"accounting_configuration"', 'id'), COALESCE(MAX(id), 1)) FROM "accounting_configuration";
  `);
  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"accounts"', 'id'), COALESCE(MAX(id), 1)) FROM "accounts";
  `);
  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"accounting_periods"', 'id'), COALESCE(MAX(id), 1)) FROM "accounting_periods";
  `);

  return {
    users: [user1, user2, user3],
    groups: [group1],
    chartOfAccounts,
    configuration,
  };
}

/**
 * Obtener conteo de registros en todas las tablas
 * Útil para debugging
 */
export async function getDatabaseStats() {
  const [users, groups, companies, charts, configurations] =
    await Promise.all([
      prisma.user.count(),
      prisma.economicGroup.count(),
      prisma.company.count(),
      prisma.chartOfAccounts.count(),
      prisma.accountingConfiguration.count(),
    ]);

  return {
    users,
    groups,
    companies,
    charts,
    configurations,
  };
}

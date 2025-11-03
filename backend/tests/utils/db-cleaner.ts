import { prisma } from '../../src/lib/prisma';

/**
 * Limpia todas las tablas de la base de datos
 * Usa TRUNCATE CASCADE para eliminar todos los datos y resetear sequences
 */
export async function cleanDatabase() {
  const tables = [
    'entry_lines',
    'entries',
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
  await prisma.company.create({
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

  await prisma.company.create({
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

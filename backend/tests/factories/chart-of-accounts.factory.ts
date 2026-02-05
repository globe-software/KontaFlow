import type { CreateChartOfAccountsDto } from '../../src/validators/charts-of-accounts.schema';

/**
 * Factory for creating Chart of Accounts data
 * Generates valid default data, but allows overrides
 * Uses timestamp to guarantee uniqueness
 */
export function buildChartOfAccounts(overrides?: Partial<CreateChartOfAccountsDto>): CreateChartOfAccountsDto {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);

  return {
    economicGroupId: 1, // Default to first group, should be overridden in tests
    name: `Test Chart of Accounts ${timestamp}-${random}`,
    description: `Standard chart of accounts for testing purposes - ${timestamp}`,
    ...overrides,
  };
}

/**
 * Factory for creating multiple charts
 */
export function buildChartsOfAccounts(count: number, overrides?: Partial<CreateChartOfAccountsDto>): CreateChartOfAccountsDto[] {
  return Array.from({ length: count }, () => buildChartOfAccounts(overrides));
}

/**
 * Common presets
 */
export const chartOfAccountsPresets = {
  niif: (economicGroupId: number): CreateChartOfAccountsDto => buildChartOfAccounts({
    economicGroupId,
    name: 'Plan de Cuentas NIIF',
    description: 'Plan de cuentas basado en Normas Internacionales de Información Financiera',
  }),

  simplified: (economicGroupId: number): CreateChartOfAccountsDto => buildChartOfAccounts({
    economicGroupId,
    name: 'Plan de Cuentas Simplificado',
    description: 'Plan de cuentas simplificado para pequeñas empresas',
  }),

  detailed: (economicGroupId: number): CreateChartOfAccountsDto => buildChartOfAccounts({
    economicGroupId,
    name: 'Plan de Cuentas Detallado',
    description: 'Plan de cuentas completo con categorías detalladas para empresas grandes',
  }),

  minimal: (economicGroupId: number): CreateChartOfAccountsDto => buildChartOfAccounts({
    economicGroupId,
    name: 'Plan de Cuentas Mínimo',
  }),
};

import type { CreateCompanyDto } from '../../src/validators/companies.schema';

/**
 * Factory for creating Company data
 * Generates valid default data, but allows overrides
 * Uses timestamp to guarantee uniqueness
 */
export function buildCompany(overrides?: Partial<CreateCompanyDto>): CreateCompanyDto {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100);

  return {
    economicGroupId: 1, // Default to first group, should be overridden in tests
    name: `Test Company ${timestamp}-${random}`,
    tradeName: `TC-${timestamp}`,
    rut: `21${timestamp.toString().slice(-8)}${random.toString().padStart(2, '0')}`, // 12 digits for UY
    country: 'UY',
    functionalCurrency: 'UYU',
    startDate: '2024-01-01',
    ...overrides,
  };
}

/**
 * Factory for creating multiple companies
 */
export function buildCompanies(count: number, overrides?: Partial<CreateCompanyDto>): CreateCompanyDto[] {
  return Array.from({ length: count }, () => buildCompany(overrides));
}

/**
 * Common presets
 */
export const companyPresets = {
  uruguay: (economicGroupId: number): CreateCompanyDto => buildCompany({
    economicGroupId,
    country: 'UY',
    functionalCurrency: 'UYU',
  }),

  uruguayUSD: (economicGroupId: number): CreateCompanyDto => buildCompany({
    economicGroupId,
    country: 'UY',
    functionalCurrency: 'USD',
  }),

  argentina: (economicGroupId: number): CreateCompanyDto => buildCompany({
    economicGroupId,
    country: 'AR',
    functionalCurrency: 'ARS',
  }),

  brazil: (economicGroupId: number): CreateCompanyDto => buildCompany({
    economicGroupId,
    country: 'BR',
    functionalCurrency: 'BRL',
  }),

  usa: (economicGroupId: number): CreateCompanyDto => buildCompany({
    economicGroupId,
    country: 'US',
    functionalCurrency: 'USD',
  }),
};
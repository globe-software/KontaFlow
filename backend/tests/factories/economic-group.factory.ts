import type { CreateEconomicGroupDto } from '../../src/validators/economic-groups.schema';

/**
 * Factory for creating Economic Group data
 * Generates valid default data, but allows overrides
 * Uses timestamp to guarantee uniqueness
 */
export function buildEconomicGroup(overrides?: Partial<CreateEconomicGroupDto>): CreateEconomicGroupDto {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);

  return {
    name: `Test Group ${timestamp}-${random}`,
    mainCountry: 'UY',
    baseCurrency: 'UYU',
    ...overrides,
  };
}

/**
 * Factory for creating multiple groups
 */
export function buildEconomicGroups(count: number, overrides?: Partial<CreateEconomicGroupDto>): CreateEconomicGroupDto[] {
  return Array.from({ length: count }, () => buildEconomicGroup(overrides));
}

/**
 * Common presets
 */
export const economicGroupPresets = {
  uruguay: (): CreateEconomicGroupDto => buildEconomicGroup({
    mainCountry: 'UY',
    baseCurrency: 'UYU',
  }),

  uruguayUSD: (): CreateEconomicGroupDto => buildEconomicGroup({
    mainCountry: 'UY',
    baseCurrency: 'USD',
  }),

  argentina: (): CreateEconomicGroupDto => buildEconomicGroup({
    mainCountry: 'AR',
    baseCurrency: 'ARS',
  }),

  brazil: (): CreateEconomicGroupDto => buildEconomicGroup({
    mainCountry: 'BR',
    baseCurrency: 'BRL',
  }),
};

import type { CreateExchangeRateDto } from '../../src/validators/exchange-rates.schema';

/**
 * Factory for creating test Exchange Rate data
 */
export function buildExchangeRate(overrides?: Partial<CreateExchangeRateDto>): CreateExchangeRateDto {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

  return {
    economicGroupId: 1,
    date: dateStr,
    sourceCurrency: 'USD' as const,
    targetCurrency: 'UYU' as const,
    purchaseRate: 40.50,
    saleRate: 41.50,
    averageRate: 41.00,
    source: 'BCU',
    ...overrides,
  };
}

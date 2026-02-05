import type { CreateAccountingPeriodDto } from '../../src/validators/accounting-periods.schema';
import { PeriodType } from '@prisma/client';

/**
 * Factory for creating test Accounting Period data
 */
export function buildAccountingPeriod(overrides?: Partial<CreateAccountingPeriodDto>): CreateAccountingPeriodDto {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  // Default: create a monthly period for current month
  const month = overrides?.month ?? currentMonth;
  const year = overrides?.fiscalYear ?? currentYear;

  // Calculate start and end dates for the month
  const startDate = new Date(year, month - 1, 1); // First day of month
  const endDate = new Date(year, month, 0); // Last day of month

  return {
    economicGroupId: 1,
    type: PeriodType.MONTH,
    fiscalYear: year,
    month: month,
    quarter: null,
    startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
    endDate: endDate.toISOString().split('T')[0],
    ...overrides,
  };
}

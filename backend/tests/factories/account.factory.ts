import type { CreateAccountDto } from '../../src/validators/accounts.schema';
import { AccountType, Currency, AccountNature } from '@prisma/client';

/**
 * Factory for creating test Account data
 */
export function buildAccount(overrides?: Partial<CreateAccountDto>): CreateAccountDto {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);

  return {
    chartOfAccountsId: 1,
    code: `${random}`, // Root level account code (no dots)
    name: `Test Account ${timestamp}-${random}`,
    type: AccountType.ASSET,
    level: 1, // Root level
    postable: true,
    requiresAuxiliary: false,
    currency: Currency.FUNCTIONAL,
    nature: AccountNature.CURRENT, // Required for ASSET and LIABILITY accounts
    ...overrides,
  };
}

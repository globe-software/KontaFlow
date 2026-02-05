import type { CreateUserCompanyDto } from '../../src/validators/user-companies.schema';

/**
 * Factory for creating test User-Company data
 */
export function buildUserCompany(overrides?: Partial<CreateUserCompanyDto>): CreateUserCompanyDto {
  return {
    userId: 1,
    companyId: 1,
    canWrite: false,
    ...overrides,
  };
}

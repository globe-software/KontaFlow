import type { CreateCustomerDto } from '../../src/validators/customers.schema';

/**
 * Factory for creating test Customer data
 */
export function buildCustomer(overrides?: Partial<CreateCustomerDto>): CreateCustomerDto {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);

  return {
    economicGroupId: 1,
    name: `Test Customer ${timestamp}-${random}`,
    rut: `21${timestamp.toString().slice(-8)}${random.toString().padStart(2, '0')}`,
    email: `customer${timestamp}@test.com`,
    phone: `+598 ${random.toString().padStart(3, '0')} ${timestamp.toString().slice(-4)}`,
    address: `Test Address ${random}`,
    ...overrides,
  };
}

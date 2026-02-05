import type { CreateSupplierDto } from '../../src/validators/suppliers.schema';

/**
 * Factory for creating test Supplier data
 */
export function buildSupplier(overrides?: Partial<CreateSupplierDto>): CreateSupplierDto {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);

  return {
    economicGroupId: 1,
    name: `Test Supplier ${timestamp}-${random}`,
    rut: `21${timestamp.toString().slice(-8)}${random.toString().padStart(2, '0')}`,
    email: `supplier${timestamp}@test.com`,
    phone: `+598 ${random.toString().padStart(3, '0')} ${timestamp.toString().slice(-4)}`,
    address: `Test Address ${random}`,
    ...overrides,
  };
}

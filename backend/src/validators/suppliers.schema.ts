import { z } from 'zod';

/**
 * Validation schemas for Suppliers
 *
 * Using Zod for type-safe data validation.
 */

/**
 * Schema for creating a Supplier
 */
export const CreateSupplierSchema = z.object({
  economicGroupId: z
    .number()
    .int()
    .positive('Economic Group ID must be a positive integer'),

  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(255, 'Name cannot exceed 255 characters')
    .trim(),

  rut: z
    .string()
    .min(3, 'RUT must be at least 3 characters')
    .max(50, 'RUT cannot exceed 50 characters')
    .trim()
    .optional(),

  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters')
    .trim()
    .optional(),

  phone: z
    .string()
    .max(50, 'Phone cannot exceed 50 characters')
    .trim()
    .optional(),

  address: z
    .string()
    .max(500, 'Address cannot exceed 500 characters')
    .trim()
    .optional(),
});

/**
 * Schema for updating a Supplier
 * All fields are optional
 */
export const UpdateSupplierSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(255, 'Name cannot exceed 255 characters')
    .trim()
    .optional(),

  rut: z
    .string()
    .min(3, 'RUT must be at least 3 characters')
    .max(50, 'RUT cannot exceed 50 characters')
    .trim()
    .optional(),

  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters')
    .trim()
    .optional(),

  phone: z
    .string()
    .max(50, 'Phone cannot exceed 50 characters')
    .trim()
    .optional(),

  address: z
    .string()
    .max(500, 'Address cannot exceed 500 characters')
    .trim()
    .optional(),

  active: z
    .boolean()
    .optional(),
});

/**
 * Schema for query params when listing suppliers
 */
export const ListSuppliersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .refine((n) => n > 0, 'Page must be greater than 0'),

  limit: z
    .string()
    .optional()
    .default('10')
    .transform(Number)
    .refine((n) => n > 0 && n <= 100, 'Limit must be between 1 and 100'),

  search: z
    .string()
    .optional(),

  active: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),

  economicGroupId: z
    .string()
    .optional()
    .transform((val) => val ? Number(val) : undefined)
    .refine((n) => n === undefined || n > 0, 'Economic Group ID must be a positive integer'),
});

/**
 * Schema for route parameters
 */
export const SupplierParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(Number),
});

/**
 * Exported types
 */
export type CreateSupplierDto = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplierDto = z.infer<typeof UpdateSupplierSchema>;
export type ListSuppliersQuery = z.infer<typeof ListSuppliersQuerySchema>;
export type SupplierParams = z.infer<typeof SupplierParamsSchema>;

/**
 * Helper functions for validation and parsing
 */
export function validateCreateSupplier(data: unknown): CreateSupplierDto {
  return CreateSupplierSchema.parse(data);
}

export function validateUpdateSupplier(data: unknown): UpdateSupplierDto {
  return UpdateSupplierSchema.parse(data);
}

export function validateListSuppliersQuery(data: unknown): ListSuppliersQuery {
  return ListSuppliersQuerySchema.parse(data);
}

export function validateSupplierParams(data: unknown): SupplierParams {
  return SupplierParamsSchema.parse(data);
}

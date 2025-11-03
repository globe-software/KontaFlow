import { z } from 'zod';

/**
 * Validation schemas for Customers
 *
 * Using Zod for type-safe data validation.
 */

/**
 * Schema for creating a Customer
 */
export const CreateCustomerSchema = z.object({
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
 * Schema for updating a Customer
 * All fields are optional
 */
export const UpdateCustomerSchema = z.object({
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
 * Schema for query params when listing customers
 */
export const ListCustomersQuerySchema = z.object({
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
export const CustomerParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(Number),
});

/**
 * Exported types
 */
export type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof UpdateCustomerSchema>;
export type ListCustomersQuery = z.infer<typeof ListCustomersQuerySchema>;
export type CustomerParams = z.infer<typeof CustomerParamsSchema>;

/**
 * Helper functions for validation and parsing
 */
export function validateCreateCustomer(data: unknown): CreateCustomerDto {
  return CreateCustomerSchema.parse(data);
}

export function validateUpdateCustomer(data: unknown): UpdateCustomerDto {
  return UpdateCustomerSchema.parse(data);
}

export function validateListCustomersQuery(data: unknown): ListCustomersQuery {
  return ListCustomersQuerySchema.parse(data);
}

export function validateCustomerParams(data: unknown): CustomerParams {
  return CustomerParamsSchema.parse(data);
}

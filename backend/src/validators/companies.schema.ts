import { z } from 'zod';

/**
 * Validation schemas for Companies
 *
 * Using Zod for type-safe data validation.
 */

// ISO 3166-1 alpha-2 country codes most common in LATAM
const VALID_COUNTRIES = ['UY', 'AR', 'BR', 'CL', 'CO', 'PE', 'MX', 'US', 'ES'] as const;

// Supported currencies (ISO 4217 codes)
const VALID_CURRENCIES = ['UYU', 'USD', 'ARS', 'BRL', 'CLP', 'COP', 'PEN', 'MXN', 'EUR'] as const;

/**
 * Schema for creating a Company
 */
export const CreateCompanySchema = z.object({
  economicGroupId: z
    .number()
    .int()
    .positive('Economic Group ID must be a positive integer'),

  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name cannot exceed 200 characters')
    .trim(),

  tradeName: z
    .string()
    .max(200, 'Trade name cannot exceed 200 characters')
    .trim()
    .optional()
    .nullable(),

  rut: z
    .string()
    .min(8, 'RUT must be at least 8 characters')
    .max(20, 'RUT cannot exceed 20 characters')
    .trim(),

  country: z
    .enum(VALID_COUNTRIES, {
      errorMap: () => ({
        message: `Invalid country. Must be one of: ${VALID_COUNTRIES.join(', ')}`,
      }),
    }),

  functionalCurrency: z
    .enum(VALID_CURRENCIES, {
      errorMap: () => ({
        message: `Invalid currency. Must be one of: ${VALID_CURRENCIES.join(', ')}`,
      }),
    }),

  startDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val ? new Date(val) : null),
});

/**
 * Schema for updating a Company
 * All fields are optional
 */
export const UpdateCompanySchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name cannot exceed 200 characters')
    .trim()
    .optional(),

  tradeName: z
    .string()
    .max(200, 'Trade name cannot exceed 200 characters')
    .trim()
    .optional()
    .nullable(),

  rut: z
    .string()
    .min(8, 'RUT must be at least 8 characters')
    .max(20, 'RUT cannot exceed 20 characters')
    .trim()
    .optional(),

  country: z
    .enum(VALID_COUNTRIES)
    .optional(),

  functionalCurrency: z
    .enum(VALID_CURRENCIES)
    .optional(),

  startDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val ? new Date(val) : null),

  active: z
    .boolean()
    .optional(),
});

/**
 * Schema for query params when listing companies
 */
export const ListCompaniesQuerySchema = z.object({
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
    .transform((val) => val ? Number(val) : undefined),

  country: z
    .enum(VALID_COUNTRIES)
    .optional(),
});

/**
 * Schema for route parameters
 */
export const CompanyParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(Number),
});

/**
 * Exported types
 */
export type CreateCompanyDto = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyDto = z.infer<typeof UpdateCompanySchema>;
export type ListCompaniesQuery = z.infer<typeof ListCompaniesQuerySchema>;
export type CompanyParams = z.infer<typeof CompanyParamsSchema>;

/**
 * Helper functions for validation and parsing
 */
export function validateCreateCompany(data: unknown): CreateCompanyDto {
  return CreateCompanySchema.parse(data);
}

export function validateUpdateCompany(data: unknown): UpdateCompanyDto {
  return UpdateCompanySchema.parse(data);
}

export function validateListCompaniesQuery(data: unknown): ListCompaniesQuery {
  return ListCompaniesQuerySchema.parse(data);
}

export function validateCompanyParams(data: unknown): CompanyParams {
  return CompanyParamsSchema.parse(data);
}

import { z } from 'zod';

/**
 * Validation schemas for Currencies
 *
 * Using Zod for type-safe data validation.
 */

/**
 * Schema for creating a Currency
 */
export const CreateCurrencySchema = z.object({
  code: z
    .string()
    .length(3, 'Currency code must be exactly 3 characters (ISO 4217)')
    .regex(/^[A-Z]{3}$/, 'Currency code must be 3 uppercase letters')
    .trim()
    .transform((val) => val.toUpperCase()),

  name: z
    .string()
    .min(1, 'Currency name is required')
    .max(100, 'Currency name cannot exceed 100 characters')
    .trim(),

  symbol: z
    .string()
    .max(10, 'Symbol cannot exceed 10 characters')
    .trim()
    .optional(),

  active: z.boolean().optional().default(true),

  decimals: z
    .number()
    .int()
    .min(0, 'Decimals must be 0 or greater')
    .max(4, 'Decimals cannot exceed 4')
    .optional()
    .default(2),

  isDefaultFunctional: z.boolean().optional().default(false),
});

/**
 * Schema for updating a Currency
 * All fields are optional except code
 */
export const UpdateCurrencySchema = z.object({
  name: z
    .string()
    .min(1, 'Currency name is required')
    .max(100, 'Currency name cannot exceed 100 characters')
    .trim()
    .optional(),

  symbol: z
    .string()
    .max(10, 'Symbol cannot exceed 10 characters')
    .trim()
    .optional(),

  active: z.boolean().optional(),

  decimals: z
    .number()
    .int()
    .min(0, 'Decimals must be 0 or greater')
    .max(4, 'Decimals cannot exceed 4')
    .optional(),

  isDefaultFunctional: z.boolean().optional(),
});

/**
 * Schema for query params when listing currencies
 */
export const ListCurrenciesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .refine((n) => n > 0, 'Page must be greater than 0'),

  limit: z
    .string()
    .optional()
    .default('50')
    .transform(Number)
    .refine((n) => n > 0 && n <= 100, 'Limit must be between 1 and 100'),

  search: z.string().optional(),

  active: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

/**
 * Schema for route parameters
 */
export const CurrencyParamsSchema = z.object({
  code: z
    .string()
    .length(3, 'Currency code must be exactly 3 characters')
    .regex(/^[A-Z]{3}$/, 'Currency code must be 3 uppercase letters')
    .transform((val) => val.toUpperCase()),
});

/**
 * Exported types
 */
export type CreateCurrencyDto = z.infer<typeof CreateCurrencySchema>;
export type UpdateCurrencyDto = z.infer<typeof UpdateCurrencySchema>;
export type ListCurrenciesQuery = z.infer<typeof ListCurrenciesQuerySchema>;
export type CurrencyParams = z.infer<typeof CurrencyParamsSchema>;

/**
 * Helper functions for validation and parsing
 */
export function validateCreateCurrency(data: unknown): CreateCurrencyDto {
  return CreateCurrencySchema.parse(data);
}

export function validateUpdateCurrency(data: unknown): UpdateCurrencyDto {
  return UpdateCurrencySchema.parse(data);
}

export function validateListCurrenciesQuery(data: unknown): ListCurrenciesQuery {
  return ListCurrenciesQuerySchema.parse(data);
}

export function validateCurrencyParams(data: unknown): CurrencyParams {
  return CurrencyParamsSchema.parse(data);
}

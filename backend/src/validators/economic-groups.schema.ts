import { z } from 'zod';

/**
 * Validation schemas for Economic Groups
 *
 * Using Zod for type-safe data validation.
 */

// ISO 3166-1 alpha-2 country codes most common in LATAM
const VALID_COUNTRIES = ['UY', 'AR', 'BR', 'CL', 'CO', 'PE', 'MX', 'US', 'ES'] as const;

// Supported currencies (ISO 4217 codes)
const VALID_CURRENCIES = ['UYU', 'USD', 'ARS', 'BRL', 'CLP', 'COP', 'PEN', 'MXN', 'EUR'] as const;

/**
 * Schema for creating an Economic Group
 */
export const CreateEconomicGroupSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name cannot exceed 200 characters')
    .trim(),

  mainCountry: z
    .enum(VALID_COUNTRIES, {
      errorMap: () => ({
        message: `Invalid country. Must be one of: ${VALID_COUNTRIES.join(', ')}`,
      }),
    }),

  baseCurrency: z
    .enum(VALID_CURRENCIES, {
      errorMap: () => ({
        message: `Invalid currency. Must be one of: ${VALID_CURRENCIES.join(', ')}`,
      }),
    }),
});

/**
 * Schema for updating an Economic Group
 * All fields are optional
 */
export const UpdateEconomicGroupSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name cannot exceed 200 characters')
    .trim()
    .optional(),

  mainCountry: z
    .enum(VALID_COUNTRIES)
    .optional(),

  baseCurrency: z
    .enum(VALID_CURRENCIES)
    .optional(),

  active: z
    .boolean()
    .optional(),
});

/**
 * Schema for query params when listing groups
 */
export const ListEconomicGroupsQuerySchema = z.object({
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

  mainCountry: z
    .enum(VALID_COUNTRIES)
    .optional(),
});

/**
 * Schema for route parameters
 */
export const EconomicGroupParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(Number),
});

/**
 * Exported types
 */
export type CreateEconomicGroupDto = z.infer<typeof CreateEconomicGroupSchema>;
export type UpdateEconomicGroupDto = z.infer<typeof UpdateEconomicGroupSchema>;
export type ListEconomicGroupsQuery = z.infer<typeof ListEconomicGroupsQuerySchema>;
export type EconomicGroupParams = z.infer<typeof EconomicGroupParamsSchema>;

/**
 * Helper functions for validation and parsing
 */
export function validateCreateEconomicGroup(data: unknown): CreateEconomicGroupDto {
  return CreateEconomicGroupSchema.parse(data);
}

export function validateUpdateEconomicGroup(data: unknown): UpdateEconomicGroupDto {
  return UpdateEconomicGroupSchema.parse(data);
}

export function validateListEconomicGroupsQuery(data: unknown): ListEconomicGroupsQuery {
  return ListEconomicGroupsQuerySchema.parse(data);
}

export function validateEconomicGroupParams(data: unknown): EconomicGroupParams {
  return EconomicGroupParamsSchema.parse(data);
}

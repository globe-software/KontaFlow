import { z } from 'zod';

/**
 * Validation schemas for Exchange Rates
 *
 * Using Zod for type-safe data validation.
 */

// Supported currencies (ISO 4217 codes)
const VALID_CURRENCIES = ['UYU', 'USD', 'ARS', 'BRL', 'CLP', 'COP', 'PEN', 'MXN', 'EUR'] as const;

/**
 * Schema for creating an Exchange Rate
 */
export const CreateExchangeRateSchema = z.object({
  economicGroupId: z
    .number()
    .int()
    .positive('Economic Group ID must be a positive integer'),

  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .transform((str) => new Date(str)),

  sourceCurrency: z
    .enum(VALID_CURRENCIES, {
      errorMap: () => ({
        message: `Invalid source currency. Must be one of: ${VALID_CURRENCIES.join(', ')}`,
      }),
    }),

  targetCurrency: z
    .enum(VALID_CURRENCIES, {
      errorMap: () => ({
        message: `Invalid target currency. Must be one of: ${VALID_CURRENCIES.join(', ')}`,
      }),
    }),

  rate: z
    .number()
    .positive('Rate must be a positive number')
    .max(999999.9999, 'Rate cannot exceed 999999.9999'),

  source: z
    .string()
    .max(100, 'Source cannot exceed 100 characters')
    .trim()
    .optional(),
});

/**
 * Schema for updating an Exchange Rate
 * All fields are optional except the rate
 */
export const UpdateExchangeRateSchema = z.object({
  rate: z
    .number()
    .positive('Rate must be a positive number')
    .max(999999.9999, 'Rate cannot exceed 999999.9999')
    .optional(),

  source: z
    .string()
    .max(100, 'Source cannot exceed 100 characters')
    .trim()
    .optional(),
});

/**
 * Schema for query params when listing exchange rates
 */
export const ListExchangeRatesQuerySchema = z.object({
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

  economicGroupId: z
    .string()
    .optional()
    .transform((val) => val ? Number(val) : undefined)
    .refine((n) => n === undefined || n > 0, 'Economic Group ID must be a positive integer'),

  sourceCurrency: z
    .enum(VALID_CURRENCIES)
    .optional(),

  targetCurrency: z
    .enum(VALID_CURRENCIES)
    .optional(),

  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .transform((str) => new Date(str))
    .optional(),

  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .transform((str) => new Date(str))
    .optional(),
});

/**
 * Schema for route parameters
 */
export const ExchangeRateParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(Number),
});

/**
 * Exported types
 */
export type CreateExchangeRateDto = z.infer<typeof CreateExchangeRateSchema>;
export type UpdateExchangeRateDto = z.infer<typeof UpdateExchangeRateSchema>;
export type ListExchangeRatesQuery = z.infer<typeof ListExchangeRatesQuerySchema>;
export type ExchangeRateParams = z.infer<typeof ExchangeRateParamsSchema>;

/**
 * Helper functions for validation and parsing
 */
export function validateCreateExchangeRate(data: unknown): CreateExchangeRateDto {
  return CreateExchangeRateSchema.parse(data);
}

export function validateUpdateExchangeRate(data: unknown): UpdateExchangeRateDto {
  return UpdateExchangeRateSchema.parse(data);
}

export function validateListExchangeRatesQuery(data: unknown): ListExchangeRatesQuery {
  return ListExchangeRatesQuerySchema.parse(data);
}

export function validateExchangeRateParams(data: unknown): ExchangeRateParams {
  return ExchangeRateParamsSchema.parse(data);
}

import { z } from 'zod';
import { AccountType, Currency, AuxiliaryType, AccountNature, IFRSCategory, ValuationMethod } from '@prisma/client';

/**
 * Validation schemas for Accounts
 *
 * Using Zod for type-safe data validation.
 */

/**
 * Schema for creating an Account
 */
export const CreateAccountSchema = z.object({
  chartOfAccountsId: z
    .number()
    .int()
    .positive('Chart of Accounts ID must be a positive integer'),

  code: z
    .string()
    .min(1, 'Code is required')
    .max(50, 'Code cannot exceed 50 characters')
    .trim()
    .regex(/^[0-9.]+$/, 'Code must contain only numbers and dots'),

  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(255, 'Name cannot exceed 255 characters')
    .trim(),

  parentAccountId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),

  type: z.nativeEnum(AccountType, {
    errorMap: () => ({
      message: `Type must be one of: ${Object.values(AccountType).join(', ')}`,
    }),
  }),

  level: z
    .number()
    .int()
    .min(1, 'Level must be at least 1')
    .max(10, 'Level cannot exceed 10'),

  postable: z
    .boolean()
    .default(true),

  requiresAuxiliary: z
    .boolean()
    .default(false),

  auxiliaryType: z
    .nativeEnum(AuxiliaryType)
    .optional()
    .nullable(),

  currency: z
    .nativeEnum(Currency)
    .default(Currency.FUNCTIONAL),

  // NIIF/IFRS fields
  nature: z
    .nativeEnum(AccountNature)
    .optional()
    .nullable(),

  ifrsCategory: z
    .nativeEnum(IFRSCategory)
    .optional()
    .nullable(),

  valuationMethod: z
    .nativeEnum(ValuationMethod)
    .optional()
    .nullable(),
});

/**
 * Schema for updating an Account
 * All fields are optional
 */
export const UpdateAccountSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .max(50, 'Code cannot exceed 50 characters')
    .trim()
    .regex(/^[0-9.]+$/, 'Code must contain only numbers and dots')
    .optional(),

  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(255, 'Name cannot exceed 255 characters')
    .trim()
    .optional(),

  parentAccountId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),

  type: z
    .nativeEnum(AccountType)
    .optional(),

  level: z
    .number()
    .int()
    .min(1, 'Level must be at least 1')
    .max(10, 'Level cannot exceed 10')
    .optional(),

  postable: z
    .boolean()
    .optional(),

  requiresAuxiliary: z
    .boolean()
    .optional(),

  auxiliaryType: z
    .nativeEnum(AuxiliaryType)
    .optional()
    .nullable(),

  currency: z
    .nativeEnum(Currency)
    .optional(),

  nature: z
    .nativeEnum(AccountNature)
    .optional()
    .nullable(),

  ifrsCategory: z
    .nativeEnum(IFRSCategory)
    .optional()
    .nullable(),

  valuationMethod: z
    .nativeEnum(ValuationMethod)
    .optional()
    .nullable(),

  active: z
    .boolean()
    .optional(),
});

/**
 * Schema for query params when listing accounts
 */
export const ListAccountsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .refine((n) => n > 0, 'Page must be greater than 0'),

  limit: z
    .string()
    .optional()
    .default('100')
    .transform(Number)
    .refine((n) => n > 0 && n <= 500, 'Limit must be between 1 and 500'),

  search: z
    .string()
    .optional(),

  chartOfAccountsId: z
    .string()
    .optional()
    .transform((val) => val ? Number(val) : undefined),

  type: z
    .nativeEnum(AccountType)
    .optional(),

  level: z
    .string()
    .optional()
    .transform((val) => val ? Number(val) : undefined),

  postable: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),

  active: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),

  parentAccountId: z
    .string()
    .optional()
    .transform((val) => val ? Number(val) : undefined),
});

/**
 * Schema for route parameters
 */
export const AccountParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(Number),
});

/**
 * Exported types
 */
export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>;
export type ListAccountsQuery = z.infer<typeof ListAccountsQuerySchema>;
export type AccountParams = z.infer<typeof AccountParamsSchema>;

/**
 * Helper functions for validation and parsing
 */
export function validateCreateAccount(data: unknown): CreateAccountDto {
  return CreateAccountSchema.parse(data);
}

export function validateUpdateAccount(data: unknown): UpdateAccountDto {
  return UpdateAccountSchema.parse(data);
}

export function validateListAccountsQuery(data: unknown): ListAccountsQuery {
  return ListAccountsQuerySchema.parse(data);
}

export function validateAccountParams(data: unknown): AccountParams {
  return AccountParamsSchema.parse(data);
}

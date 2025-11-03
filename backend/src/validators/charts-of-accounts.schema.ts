import { z } from 'zod';

/**
 * Validation schemas for Charts of Accounts
 *
 * Using Zod for type-safe data validation.
 */

/**
 * Schema for creating a Chart of Accounts
 */
export const CreateChartOfAccountsSchema = z.object({
  economicGroupId: z
    .number()
    .int()
    .positive('Economic Group ID must be a positive integer'),

  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name cannot exceed 200 characters')
    .trim(),

  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .trim()
    .optional(),
});

/**
 * Schema for updating a Chart of Accounts
 * All fields are optional
 */
export const UpdateChartOfAccountsSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name cannot exceed 200 characters')
    .trim()
    .optional(),

  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .trim()
    .optional(),

  active: z
    .boolean()
    .optional(),
});

/**
 * Schema for query params when listing charts
 */
export const ListChartsOfAccountsQuerySchema = z.object({
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
});

/**
 * Schema for route parameters
 */
export const ChartOfAccountsParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(Number),
});

/**
 * Exported types
 */
export type CreateChartOfAccountsDto = z.infer<typeof CreateChartOfAccountsSchema>;
export type UpdateChartOfAccountsDto = z.infer<typeof UpdateChartOfAccountsSchema>;
export type ListChartsOfAccountsQuery = z.infer<typeof ListChartsOfAccountsQuerySchema>;
export type ChartOfAccountsParams = z.infer<typeof ChartOfAccountsParamsSchema>;

/**
 * Helper functions for validation and parsing
 */
export function validateCreateChartOfAccounts(data: unknown): CreateChartOfAccountsDto {
  return CreateChartOfAccountsSchema.parse(data);
}

export function validateUpdateChartOfAccounts(data: unknown): UpdateChartOfAccountsDto {
  return UpdateChartOfAccountsSchema.parse(data);
}

export function validateListChartsOfAccountsQuery(data: unknown): ListChartsOfAccountsQuery {
  return ListChartsOfAccountsQuerySchema.parse(data);
}

export function validateChartOfAccountsParams(data: unknown): ChartOfAccountsParams {
  return ChartOfAccountsParamsSchema.parse(data);
}

import { z } from 'zod';
import { PeriodType } from '@prisma/client';

/**
 * Validation schemas for Accounting Periods
 *
 * Using Zod for type-safe data validation.
 * Handles fiscal years and monthly periods.
 */

/**
 * Schema for creating an Accounting Period
 */
export const CreateAccountingPeriodSchema = z
  .object({
    economicGroupId: z
      .number()
      .int()
      .positive('Economic Group ID must be a positive integer'),

    type: z.nativeEnum(PeriodType, {
      errorMap: () => ({
        message: `Type must be one of: ${Object.values(PeriodType).join(', ')}`,
      }),
    }),

    fiscalYear: z
      .number()
      .int()
      .min(2000, 'Fiscal year must be at least 2000')
      .max(2100, 'Fiscal year cannot exceed 2100'),

    month: z
      .number()
      .int()
      .min(1, 'Month must be between 1 and 12')
      .max(12, 'Month must be between 1 and 12')
      .optional()
      .nullable(),

    startDate: z
      .string()
      .or(z.date())
      .transform((val) => (typeof val === 'string' ? new Date(val) : val))
      .refine((date) => !isNaN(date.getTime()), 'Start date must be a valid date'),

    endDate: z
      .string()
      .or(z.date())
      .transform((val) => (typeof val === 'string' ? new Date(val) : val))
      .refine((date) => !isNaN(date.getTime()), 'End date must be a valid date'),
  })
  .refine(
    (data) => {
      // If type is MONTH, month is required
      if (data.type === PeriodType.MONTH && !data.month) {
        return false;
      }
      return true;
    },
    {
      message: 'Month is required for MONTH type periods',
      path: ['month'],
    }
  )
  .refine(
    (data) => {
      // If type is FISCAL_YEAR, month should not be set
      if (data.type === PeriodType.FISCAL_YEAR && data.month) {
        return false;
      }
      return true;
    },
    {
      message: 'Month should not be set for FISCAL_YEAR type periods',
      path: ['month'],
    }
  )
  .refine(
    (data) => {
      // startDate must be before endDate
      return data.startDate < data.endDate;
    },
    {
      message: 'Start date must be before end date',
      path: ['endDate'],
    }
  );

/**
 * Schema for updating an Accounting Period
 * Only allows closing/reopening periods
 */
export const UpdateAccountingPeriodSchema = z.object({
  closed: z.boolean().optional(),
});

/**
 * Schema for closing a period
 * No body needed, just the action
 */
export const CloseAccountingPeriodSchema = z.object({}).optional();

/**
 * Schema for reopening a period
 * No body needed, just the action
 */
export const ReopenAccountingPeriodSchema = z.object({}).optional();

/**
 * Schema for query params when listing accounting periods
 */
export const ListAccountingPeriodsQuerySchema = z.object({
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

  economicGroupId: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),

  type: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return val as PeriodType;
    })
    .refine(
      (val) => !val || Object.values(PeriodType).includes(val as PeriodType),
      'Type must be FISCAL_YEAR or MONTH'
    ),

  fiscalYear: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),

  closed: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
});

/**
 * Schema for route parameters
 */
export const AccountingPeriodParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(Number),
});

/**
 * Exported types
 */
export type CreateAccountingPeriodDto = z.infer<typeof CreateAccountingPeriodSchema>;
export type UpdateAccountingPeriodDto = z.infer<typeof UpdateAccountingPeriodSchema>;
export type ListAccountingPeriodsQuery = z.infer<typeof ListAccountingPeriodsQuerySchema>;
export type AccountingPeriodParams = z.infer<typeof AccountingPeriodParamsSchema>;

/**
 * Helper functions for validation and parsing
 */
export function validateCreateAccountingPeriod(data: unknown): CreateAccountingPeriodDto {
  return CreateAccountingPeriodSchema.parse(data);
}

export function validateUpdateAccountingPeriod(data: unknown): UpdateAccountingPeriodDto {
  return UpdateAccountingPeriodSchema.parse(data);
}

export function validateListAccountingPeriodsQuery(data: unknown): ListAccountingPeriodsQuery {
  return ListAccountingPeriodsQuerySchema.parse(data);
}

export function validateAccountingPeriodParams(data: unknown): AccountingPeriodParams {
  return AccountingPeriodParamsSchema.parse(data);
}

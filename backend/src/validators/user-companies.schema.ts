import { z } from 'zod';

/**
 * Validation schemas for User-Company permissions
 *
 * Using Zod for type-safe data validation.
 */

/**
 * Schema for granting company access to a user
 */
export const CreateUserCompanySchema = z.object({
  userId: z
    .number()
    .int()
    .positive('User ID must be a positive integer'),

  companyId: z
    .number()
    .int()
    .positive('Company ID must be a positive integer'),

  canWrite: z
    .boolean()
    .default(false),
});

/**
 * Schema for updating user-company permissions
 */
export const UpdateUserCompanySchema = z.object({
  canWrite: z
    .boolean(),
});

/**
 * Schema for route parameters (composite key)
 */
export const UserCompanyParamsSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a number')
    .transform(Number),

  companyId: z
    .string()
    .regex(/^\d+$/, 'Company ID must be a number')
    .transform(Number),
});

/**
 * Schema for single ID parameter
 */
export const SingleIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(Number),
});

/**
 * Exported types
 */
export type CreateUserCompanyDto = z.infer<typeof CreateUserCompanySchema>;
export type UpdateUserCompanyDto = z.infer<typeof UpdateUserCompanySchema>;
export type UserCompanyParams = z.infer<typeof UserCompanyParamsSchema>;
export type SingleIdParam = z.infer<typeof SingleIdParamSchema>;

/**
 * Helper functions for validation and parsing
 */
export function validateCreateUserCompany(data: unknown): CreateUserCompanyDto {
  return CreateUserCompanySchema.parse(data);
}

export function validateUpdateUserCompany(data: unknown): UpdateUserCompanyDto {
  return UpdateUserCompanySchema.parse(data);
}

export function validateUserCompanyParams(data: unknown): UserCompanyParams {
  return UserCompanyParamsSchema.parse(data);
}

export function validateSingleIdParam(data: unknown): SingleIdParam {
  return SingleIdParamSchema.parse(data);
}

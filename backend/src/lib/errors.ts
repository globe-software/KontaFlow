/**
 * Custom error system for KontaFlow
 *
 * Error hierarchy:
 * - AppError: Base for all application errors
 * - ValidationError: Data validation errors (400)
 * - NotFoundError: Resource not found (404)
 * - ForbiddenError: Access denied (403)
 * - UnauthorizedError: Not authenticated (401)
 * - ConflictError: Resource conflict (409)
 * - BusinessRuleError: Business rule violation (422)
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Keep correct stack trace
    Error.captureStackTrace(this, this.constructor);

    // Set class name
    this.name = this.constructor.name;
  }
}

/**
 * Data validation error
 * HTTP 400 - Bad Request
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR');

    if (details) {
      (this as any).details = details;
    }
  }
}

/**
 * Resource not found
 * HTTP 404 - Not Found
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: number | string) {
    const message = id
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;

    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Access denied by permissions
 * HTTP 403 - Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Not authenticated
 * HTTP 401 - Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'You must log in to continue') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Resource conflict (eg: duplicate record)
 * HTTP 409 - Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 409, 'CONFLICT');

    if (field) {
      (this as any).field = field;
    }
  }
}

/**
 * Business rule violation
 * HTTP 422 - Unprocessable Entity
 */
export class BusinessRuleError extends AppError {
  constructor(message: string, rule?: string) {
    super(message, 422, 'BUSINESS_RULE_VIOLATION');

    if (rule) {
      (this as any).rule = rule;
    }
  }
}

/**
 * Helper to check if an error is operational
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Helper to format Prisma errors
 */
export function handlePrismaError(error: any): AppError {
  // P2002: Unique constraint violation
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'field';
    return new ConflictError(
      `A record with that ${field} already exists`,
      field
    );
  }

  // P2025: Record not found
  if (error.code === 'P2025') {
    return new NotFoundError('Record');
  }

  // P2003: Foreign key constraint violation
  if (error.code === 'P2003') {
    return new BusinessRuleError(
      'Cannot complete the operation due to relationships with other records'
    );
  }

  // Generic Prisma error
  return new AppError(
    'Database error',
    500,
    'DATABASE_ERROR',
    false
  );
}

/**
 * Helper to format Zod errors
 */
export function handleZodError(error: any): ValidationError {
  const details: Record<string, string[]> = {};

  if (error.errors) {
    error.errors.forEach((err: any) => {
      const path = err.path.join('.');
      if (!details[path]) {
        details[path] = [];
      }
      details[path].push(err.message);
    });
  }

  return new ValidationError(
    'Validation error in submitted data',
    details
  );
}

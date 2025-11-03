/**
 * Types for User-Company Permissions
 * Synchronized with backend validators and Prisma schema
 */

export interface UserCompany {
  userId: number;
  companyId: number;
  canWrite: boolean;
  user: {
    id: number;
    name: string;
    email: string;
  };
  company: {
    id: number;
    name: string;
    economicGroupId: number;
  };
}

export interface CreateUserCompanyDto {
  userId: number;
  companyId: number;
  canWrite: boolean;
}

export interface UpdateUserCompanyDto {
  canWrite: boolean;
}

export interface ListUserCompaniesFilters {
  page?: number;
  limit?: number;
  search?: string;
  userId?: number;
  companyId?: number;
  economicGroupId?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
    rule?: string;
  };
}

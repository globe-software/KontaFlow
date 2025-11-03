/**
 * Types for Chart of Accounts
 * Synchronized with backend validators and Prisma schema
 */

export interface ChartOfAccounts {
  id: number;
  economicGroupId: number;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  economicGroup?: {
    id: number;
    name: string;
  };
  _count?: {
    accounts: number;
  };
}

export interface CreateChartOfAccountsDto {
  economicGroupId: number;
  name: string;
  description?: string;
}

export interface UpdateChartOfAccountsDto {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface ListChartsOfAccountsFilters {
  page?: number;
  limit?: number;
  search?: string;
  economicGroupId?: number;
  active?: boolean;
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

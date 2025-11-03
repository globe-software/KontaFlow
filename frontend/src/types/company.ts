/**
 * Company Types
 * Type definitions for the Company module
 */

export interface Company {
  id: number;
  economicGroupId: number;
  name: string;
  tradeName: string | null;
  rut: string;
  country: string;
  functionalCurrency: string;
  startDate: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  economicGroup?: {
    id: number;
    name: string;
  };
  _count?: {
    journalEntries: number;
  };
}

export interface CreateCompanyDto {
  economicGroupId: number;
  name: string;
  tradeName?: string | null;
  rut: string;
  country: string;
  functionalCurrency: string;
  startDate?: string | null;
}

export interface UpdateCompanyDto {
  name?: string;
  tradeName?: string | null;
  rut?: string;
  country?: string;
  functionalCurrency?: string;
  startDate?: string | null;
  active?: boolean;
}

export interface ListCompaniesFilters {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  economicGroupId?: number;
  country?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: {
    message: string;
    statusCode: number;
    details?: Record<string, string>;
  };
}

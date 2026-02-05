/**
 * Currency Types
 * Type definitions for the Currency module
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string | null;
  active: boolean;
  decimals: number;
  isDefaultFunctional: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCurrencyDto {
  code: string;
  name: string;
  symbol?: string;
  active?: boolean;
  decimals?: number;
  isDefaultFunctional?: boolean;
}

export interface UpdateCurrencyDto {
  name?: string;
  symbol?: string;
  active?: boolean;
  decimals?: number;
  isDefaultFunctional?: boolean;
}

export interface ListCurrenciesFilters {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
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

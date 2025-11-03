/**
 * Types for Customers
 * Synchronized with backend validators and Prisma schema
 */

export interface Customer {
  id: number;
  economicGroupId: number;
  name: string;
  rut: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
  createdAt: string;
}

export interface CreateCustomerDto {
  name: string;
  rut?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  rut?: string;
  email?: string;
  phone?: string;
  address?: string;
  active?: boolean;
}

export interface ListCustomersFilters {
  page?: number;
  limit?: number;
  search?: string;
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

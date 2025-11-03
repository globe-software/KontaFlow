/**
 * Types for Economic Groups
 * Synchronized with backend validators and Prisma schema
 */

export type Country = 'UY' | 'AR' | 'BR' | 'CL' | 'PY' | 'US';

export type Currency = 'UYU' | 'USD' | 'ARS' | 'BRL' | 'CLP' | 'PYG';

export interface CompanySummary {
  id: number;
  name: string;
  rut: string;
  functionalCurrency: string;
  active: boolean;
}

export interface EconomicGroup {
  id: number;
  name: string;
  mainCountry: Country;
  baseCurrency: Currency;
  active: boolean;
  createdAt: string;
  _count?: {
    companies: number;
  };
  companies?: CompanySummary[];
  chartOfAccounts?: {
    id: number;
    name: string;
    active: boolean;
  };
  configuration?: any;
}

export interface CreateEconomicGroupDto {
  name: string;
  mainCountry: Country;
  baseCurrency: Currency;
}

export interface UpdateEconomicGroupDto {
  name?: string;
  mainCountry?: Country;
  baseCurrency?: Currency;
  active?: boolean;
}

export interface ListEconomicGroupsFilters {
  page?: number;
  limit?: number;
  search?: string;
  mainCountry?: Country;
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

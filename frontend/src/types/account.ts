/**
 * Account Types
 * Type definitions for the Account module
 */

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
export type AuxiliaryType = 'CUSTOMER' | 'SUPPLIER' | 'EMPLOYEE' | 'OTHER' | null;
export type CurrencyType = 'MN' | 'USD' | 'BOTH' | 'FUNCTIONAL';
export type NatureType = 'CURRENT' | 'NON_CURRENT' | null;

export interface Account {
  id: number;
  chartOfAccountsId: number;
  code: string;
  name: string;
  parentAccountId: number | null;
  type: AccountType;
  level: number;
  postable: boolean;
  requiresAuxiliary: boolean;
  auxiliaryType: AuxiliaryType;
  currency: CurrencyType;
  nature: NatureType;
  ifrsCategory: string | null;
  valuationMethod: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  parentAccount?: Account;
  subaccounts?: Account[];
  _count?: {
    subaccounts: number;
  };
}

export interface CreateAccountDto {
  chartOfAccountsId: number;
  code: string;
  name: string;
  parentAccountId?: number | null;
  type: AccountType;
  level: number;
  postable?: boolean;
  requiresAuxiliary?: boolean;
  auxiliaryType?: AuxiliaryType;
  currency?: CurrencyType;
  nature?: NatureType;
  ifrsCategory?: string | null;
  valuationMethod?: string | null;
}

export interface UpdateAccountDto {
  code?: string;
  name?: string;
  parentAccountId?: number | null;
  type?: AccountType;
  level?: number;
  postable?: boolean;
  requiresAuxiliary?: boolean;
  auxiliaryType?: AuxiliaryType;
  currency?: CurrencyType;
  nature?: NatureType;
  ifrsCategory?: string | null;
  valuationMethod?: string | null;
  active?: boolean;
}

export interface ListAccountsFilters {
  page?: number;
  limit?: number;
  search?: string;
  chartOfAccountsId?: number;
  type?: AccountType;
  postable?: boolean;
  active?: boolean;
  parentAccountId?: number | null;
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

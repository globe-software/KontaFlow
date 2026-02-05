/**
 * Accounting Period Types
 * Type definitions for the Accounting Period module
 */

export type PeriodType = 'FISCAL_YEAR' | 'QUARTER' | 'MONTH';

export interface AccountingPeriod {
  id: number;
  economicGroupId: number;
  type: PeriodType;
  fiscalYear: number;
  month: number | null;
  quarter: number | null;
  startDate: string;
  endDate: string;
  closed: boolean;
  closedAt: string | null;
  closedBy: number | null;
  createdAt: string;
  updatedAt: string;
  economicGroup?: {
    id: number;
    name: string;
  };
  closedByUser?: {
    id: number;
    name: string;
    email: string;
  };
  _count?: {
    journalEntries: number;
  };
}

export interface CreateAccountingPeriodDto {
  economicGroupId: number;
  type: PeriodType;
  fiscalYear: number;
  month?: number | null;
  quarter?: number | null;
  startDate: string;
  endDate: string;
}

export interface UpdateAccountingPeriodDto {
  type?: PeriodType;
  fiscalYear?: number;
  month?: number | null;
  quarter?: number | null;
  startDate?: string;
  endDate?: string;
}

export interface ListAccountingPeriodsFilters {
  page?: number;
  limit?: number;
  search?: string;
  economicGroupId?: number;
  type?: PeriodType;
  fiscalYear?: number;
  closed?: boolean;
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

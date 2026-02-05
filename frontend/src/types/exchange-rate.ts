export type Currency = 'UYU' | 'USD' | 'ARS' | 'BRL' | 'CLP' | 'COP' | 'PEN' | 'MXN' | 'EUR';

export interface ExchangeRate {
  id: number;
  economicGroupId: number;
  date: string;
  sourceCurrency: Currency;
  targetCurrency: Currency;
  purchaseRate: number;  // Tasa de compra
  saleRate: number;      // Tasa de venta
  averageRate: number;   // Tasa promedio
  source?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateExchangeRateDto {
  economicGroupId: number;
  date: string;
  sourceCurrency: Currency;
  targetCurrency: Currency;
  purchaseRate: number;
  saleRate: number;
  averageRate: number;
  source?: string;
}

export interface UpdateExchangeRateDto {
  purchaseRate?: number;
  saleRate?: number;
  averageRate?: number;
  source?: string;
}

export interface ListExchangeRatesFilters {
  page?: number;
  limit?: number;
  search?: string;
  sourceCurrency?: Currency;
  targetCurrency?: Currency;
  dateFrom?: string;
  dateTo?: string;
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
  meta: PaginationMeta;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

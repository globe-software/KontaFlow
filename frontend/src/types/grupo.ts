/**
 * Tipos para Grupos Económicos
 * Sincronizados con backend validators y Prisma schema
 */

export type Pais = 'UY' | 'AR' | 'BR' | 'CL' | 'PY' | 'US';

export type Moneda = 'UYU' | 'USD' | 'ARS' | 'BRL' | 'CLP' | 'PYG';

export interface GrupoEconomico {
  id: number;
  nombre: string;
  paisPrincipal: Pais;
  monedaBase: Moneda;
  activo: boolean;
  fechaCreacion: string;
  _count?: {
    empresas: number;
  };
}

export interface CreateGrupoDto {
  nombre: string;
  paisPrincipal: Pais;
  monedaBase: Moneda;
}

export interface UpdateGrupoDto {
  nombre?: string;
  paisPrincipal?: Pais;
  monedaBase?: Moneda;
  activo?: boolean;
}

export interface ListGruposFilters {
  page?: number;
  limit?: number;
  search?: string;
  paisPrincipal?: Pais;
  activo?: boolean;
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

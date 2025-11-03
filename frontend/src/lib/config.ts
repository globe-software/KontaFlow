/**
 * Configuración de la aplicación
 */

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

/**
 * Catálogos de datos
 */
export const PAISES = {
  UY: 'Uruguay',
  AR: 'Argentina',
  BR: 'Brasil',
  CL: 'Chile',
  PY: 'Paraguay',
  US: 'Estados Unidos',
} as const;

export const MONEDAS = {
  UYU: 'Peso Uruguayo',
  USD: 'Dólar',
  ARS: 'Peso Argentino',
  BRL: 'Real',
  CLP: 'Peso Chileno',
  PYG: 'Guaraní',
} as const;

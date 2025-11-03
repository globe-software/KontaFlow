// Idiomas soportados
export const locales = ['es', 'pt', 'en'] as const;
export type Locale = (typeof locales)[number];

// Idioma por defecto
export const defaultLocale: Locale = 'es';

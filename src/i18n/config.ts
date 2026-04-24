/**
 * bio.me · i18n configuration
 *
 * Estrategia: NO route-based locale (ni /es/... ni /en/...).
 * El idioma vive en una cookie `NEXT_LOCALE` + `profiles.preferred_language`.
 *
 * Al renderizar, `getRequestConfig` lee:
 *   1. Cookie `NEXT_LOCALE` si existe
 *   2. Caso contrario, default a 'es'
 *
 * El cambio manual se hace con LanguageSwitcher que setea la cookie + actualiza profile si auth.
 */

export const locales = ['es', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'es'

export function isValidLocale(value: string | undefined | null): value is Locale {
    return typeof value === 'string' && (locales as readonly string[]).includes(value)
}

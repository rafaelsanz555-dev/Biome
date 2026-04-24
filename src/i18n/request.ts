import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { defaultLocale, isValidLocale, type Locale } from './config'

/**
 * Resolve locale per-request using (in priority order):
 *   1. NEXT_LOCALE cookie (set by LanguageSwitcher)
 *   2. Accept-Language header
 *   3. Default 'es'
 */
export default getRequestConfig(async () => {
    const cookieStore = await cookies()
    const fromCookie = cookieStore.get('NEXT_LOCALE')?.value

    let locale: Locale = defaultLocale
    if (isValidLocale(fromCookie)) {
        locale = fromCookie
    } else {
        const headerStore = await headers()
        const accept = headerStore.get('accept-language') || ''
        if (accept.toLowerCase().startsWith('en')) locale = 'en'
    }

    const messages = (await import(`./messages/${locale}.json`)).default
    return { locale, messages }
})

'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isValidLocale, type Locale } from './config'

/**
 * Change the active UI language:
 *   1. Set NEXT_LOCALE cookie (persists across visits)
 *   2. If user is authenticated, persist to profiles.preferred_language
 *   3. Revalidate layout so translations rebuild
 */
export async function changeLocale(newLocale: string) {
    if (!isValidLocale(newLocale)) return { error: 'invalid_locale' }
    const locale: Locale = newLocale

    const cookieStore = await cookies()
    cookieStore.set('NEXT_LOCALE', locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,  // 1 año
        sameSite: 'lax',
    })

    // Si está autenticado, persistir preferencia en el perfil
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase
                .from('profiles')
                .update({ preferred_language: locale })
                .eq('id', user.id)
        }
    } catch {
        // No bloquea el cambio si falla el update del perfil
    }

    revalidatePath('/', 'layout')
    return { ok: true }
}

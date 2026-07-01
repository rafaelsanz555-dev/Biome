import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Guards centralizados de auth + rol.
 * - require*Page: para Server Components — redirige si no cumple.
 * - requireCreatorAction: para Server Actions / API — devuelve error legible
 *   en vez de redirigir, para que el form pueda mostrarlo.
 */

export async function requireUserPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    return { supabase, user }
}

export async function requireCreatorPage() {
    const { supabase, user } = await requireUserPage()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, username')
        .eq('id', user.id)
        .maybeSingle()
    if (!profile) redirect('/onboarding')
    if (profile.role !== 'creator') redirect('/dashboard')
    return { supabase, user, profile }
}

type ActionGuardResult =
    | { ok: false; error: string; supabase?: undefined; user?: undefined }
    | { ok: true; error?: undefined; supabase: Awaited<ReturnType<typeof createClient>>; user: { id: string } }

export async function requireCreatorAction(): Promise<ActionGuardResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'No has iniciado sesión.' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    if (profile?.role !== 'creator') {
        return { ok: false, error: 'Necesitas una cuenta de escritor para hacer esto. Actívala en Ajustes.' }
    }
    return { ok: true, supabase, user }
}

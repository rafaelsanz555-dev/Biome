import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from './server'

export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        throw new Error('Supabase service role credentials are not configured')
    }

    return createSupabaseClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}

export async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false as const, error: 'unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    if (profile?.role !== 'admin') return { ok: false as const, error: 'forbidden' }
    return { ok: true as const, user }
}

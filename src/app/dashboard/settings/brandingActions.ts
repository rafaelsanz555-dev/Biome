'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface BrandingPayload {
    accent_color?: string
    font_family?: string
    card_style?: string
    brand_tagline?: string
}

const VALID_FONTS = ['inter', 'playfair', 'crimson', 'ibm-plex']
const VALID_CARDS = ['editorial', 'journal', 'minimal']

export async function updateBranding(payload: BrandingPayload) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'unauthorized' }

    // Validación básica
    const update: Record<string, any> = {}

    if (payload.accent_color && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(payload.accent_color)) {
        update.accent_color = payload.accent_color
    }
    if (payload.font_family && VALID_FONTS.includes(payload.font_family)) {
        update.font_family = payload.font_family
    }
    if (payload.card_style && VALID_CARDS.includes(payload.card_style)) {
        update.card_style = payload.card_style
    }
    if (typeof payload.brand_tagline === 'string') {
        update.brand_tagline = payload.brand_tagline.slice(0, 80) || null
    }

    if (Object.keys(update).length === 0) return { error: 'no_valid_fields' }

    const { error } = await supabase
        .from('creators')
        .update(update)
        .eq('profile_id', user.id)

    if (error) return { error: error.message }

    // Revalidar el perfil público (y si está autenticado, su username)
    const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle()
    if (profile?.username) {
        revalidatePath(`/${profile.username}`)
    }
    revalidatePath('/dashboard/settings')

    return { ok: true }
}

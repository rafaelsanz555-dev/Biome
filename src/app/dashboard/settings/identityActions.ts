'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface IdentityPayload {
    country_code?: string | null
    pronouns?: string | null
    languages?: string[] | null
    interests?: string[] | null
    story_themes?: string[] | null
    website_url?: string | null
    instagram_handle?: string | null
    twitter_handle?: string | null
    cover_image_url?: string | null
}

// Temas curados para story_themes
const VALID_THEMES = [
    'migracion', 'supervivencia', 'amor_perdida', 'negocios',
    'maternidad', 'comenzar_de_nuevo', 'identidad', 'salud_mental',
    'familia', 'viajes', 'carrera', 'espiritualidad'
]

const VALID_LANGUAGES = ['es', 'en', 'pt', 'fr', 'it', 'de']

function sanitizeHandle(val: string | null | undefined): string | null {
    if (!val) return null
    const clean = val.trim().replace(/^@+/, '').slice(0, 30)
    return clean || null
}

function sanitizeUrl(val: string | null | undefined): string | null {
    if (!val) return null
    const trimmed = val.trim()
    if (!trimmed) return null
    try {
        const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
        return url.toString()
    } catch {
        return null
    }
}

export async function updateIdentity(payload: IdentityPayload) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'unauthorized' }

    const update: Record<string, any> = {}

    if (payload.country_code !== undefined) {
        update.country_code = payload.country_code?.toUpperCase().slice(0, 2) || null
    }
    if (payload.pronouns !== undefined) {
        update.pronouns = payload.pronouns?.trim().slice(0, 30) || null
    }
    if (Array.isArray(payload.languages)) {
        update.languages = payload.languages.filter(l => VALID_LANGUAGES.includes(l)).slice(0, 5)
    }
    if (Array.isArray(payload.interests)) {
        update.interests = payload.interests
            .map(i => i.trim().slice(0, 25))
            .filter(Boolean)
            .slice(0, 10)
    }
    if (Array.isArray(payload.story_themes)) {
        update.story_themes = payload.story_themes.filter(t => VALID_THEMES.includes(t)).slice(0, 6)
    }
    if (payload.website_url !== undefined) {
        update.website_url = sanitizeUrl(payload.website_url)
    }
    if (payload.instagram_handle !== undefined) {
        update.instagram_handle = sanitizeHandle(payload.instagram_handle)
    }
    if (payload.twitter_handle !== undefined) {
        update.twitter_handle = sanitizeHandle(payload.twitter_handle)
    }
    if (payload.cover_image_url !== undefined) {
        update.cover_image_url = payload.cover_image_url || null
    }

    if (Object.keys(update).length === 0) return { error: 'no_valid_fields' }

    const { error } = await supabase
        .from('profiles')
        .update(update)
        .eq('id', user.id)

    if (error) return { error: error.message }

    const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle()

    if (profile?.username) revalidatePath(`/${profile.username}`)
    revalidatePath('/dashboard/settings')

    return { ok: true }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function selectTheme(themeId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'unauthorized' }

    // Validar que el theme exista y sea accesible (oficial o propio)
    const { data: theme } = await supabase
        .from('themes')
        .select('id, type, creator_id, config')
        .eq('id', themeId)
        .single()

    if (!theme) return { error: 'theme_not_found' }
    if (theme.type === 'custom' && theme.creator_id !== user.id) return { error: 'forbidden' }

    // Aplicar theme al creator: setea theme_id Y también copia accent/font para fallback
    const cfg = theme.config || {}
    const { error } = await supabase
        .from('creators')
        .update({
            theme_id: themeId,
            accent_color: cfg.accent_color || null,
            font_family: cfg.font || null,
        })
        .eq('profile_id', user.id)

    if (error) return { error: error.message }

    // Incrementar use_count
    await supabase.rpc('increment_theme_use', { theme_id: themeId }).then(() => null, () => null)

    // Revalidar perfil público del creator
    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    if (profile?.username) revalidatePath(`/${profile.username}`)
    revalidatePath('/dashboard/settings')

    return { ok: true }
}

export async function uploadCustomBackground(input: {
    name: string
    accent_color: string
    font: string
    background_image: string
    background_overlay: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'unauthorized' }

    // Validaciones
    try {
        const url = new URL(input.background_image)
        if (!/^https?:$/.test(url.protocol)) return { error: 'invalid_protocol' }
        // Bloquear URLs locales/sospechosas (SSRF prevention)
        const host = url.hostname.toLowerCase()
        if (
            host === 'localhost' || host === '127.0.0.1' ||
            host.startsWith('192.168.') || host.startsWith('10.') ||
            host.endsWith('.local') || host.endsWith('.internal')
        ) return { error: 'invalid_host' }
    } catch {
        return { error: 'invalid_image_url' }
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(input.accent_color)) return { error: 'invalid_color' }
    const validFonts = ['inter', 'playfair', 'crimson', 'ibm-plex']
    if (!validFonts.includes(input.font)) return { error: 'invalid_font' }

    // Crear theme custom
    const slug = `custom-${user.id.slice(0, 8)}-${Date.now().toString(36)}`
    const { data, error } = await supabase
        .from('themes')
        .insert({
            slug,
            name: input.name.slice(0, 50),
            type: 'custom',
            style: 'image',
            config: {
                accent_color: input.accent_color,
                accent_soft: hexToRgba(input.accent_color, 0.1),
                font: input.font,
                background_image: input.background_image,
                background_overlay: input.background_overlay,
                card_style: 'editorial',
            },
            creator_id: user.id,
            is_animated: false,
        })
        .select('id')
        .single()

    if (error || !data) return { error: error?.message || 'create_failed' }

    // Auto-aplicarlo
    await supabase
        .from('creators')
        .update({
            theme_id: data.id,
            accent_color: input.accent_color,
            font_family: input.font,
        })
        .eq('profile_id', user.id)

    // Revalidar
    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    if (profile?.username) revalidatePath(`/${profile.username}`)
    revalidatePath('/dashboard/settings')

    return { ok: true, theme_id: data.id }
}

function hexToRgba(hex: string, alpha: number): string {
    const c = hex.replace('#', '')
    const r = parseInt(c.slice(0, 2), 16)
    const g = parseInt(c.slice(2, 4), 16)
    const b = parseInt(c.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

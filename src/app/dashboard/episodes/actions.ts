'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { runEpisodeChecks } from '@/lib/moderation/runChecks'

export async function createEpisode(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Extract fields
    const title = formData.get('title') as string
    const preview_text = formData.get('preview_text') as string
    const full_text = formData.get('full_text') as string
    const content_json_raw = formData.get('content_json') as string
    const word_count_raw = formData.get('word_count') as string
    const reading_time_raw = formData.get('reading_time_min') as string
    const cover_image_url = formData.get('cover_image_url') as string
    const images_raw = formData.get('images') as string
    const season_id = formData.get('season_id') as string
    const soundtrack_url = formData.get('soundtrack_url') as string
    const soundtrack_title = formData.get('soundtrack_title') as string
    const is_published = formData.get('is_published') === 'true'
    const is_subscription_only = formData.get('monetization') === 'subscription'
    const ppv_price = formData.get('monetization') === 'ppv' ? parseFloat(formData.get('ppv_price') as string) : null

    if (!title || !full_text) {
        return { error: 'Title and Full Text are required' }
    }

    let images: string[] | null = null
    try {
        if (images_raw) {
            const parsed = JSON.parse(images_raw)
            if (Array.isArray(parsed)) images = parsed.filter((u) => typeof u === 'string')
        }
    } catch {
        images = null
    }

    let content_json = null
    try {
        if (content_json_raw) content_json = JSON.parse(content_json_raw)
    } catch {
        content_json = null
    }

    const word_count = word_count_raw ? parseInt(word_count_raw, 10) : null
    const reading_time_min = reading_time_raw ? parseInt(reading_time_raw, 10) : null

    const { data: inserted, error } = await supabase
        .from('episodes')
        .insert({
            creator_id: user.id,
            season_id: season_id || null,
            title,
            preview_text,
            full_text,
            content_json,
            word_count,
            reading_time_min,
            cover_image_url,
            images,
            soundtrack_url: soundtrack_url || null,
            soundtrack_title: soundtrack_title || null,
            is_published,
            is_subscription_only,
            ppv_price,
        })
        .select('id')
        .single()

    if (error) {
        return { error: error.message }
    }

    // Fire-and-forget moderation checks (non-blocking)
    if (inserted?.id && is_published) {
        runEpisodeChecks(inserted.id, full_text).catch((e) =>
            console.error('[moderation] background failed', e)
        )
    }

    revalidatePath('/dashboard/episodes')
    redirect('/dashboard/episodes')
}

// ─────────────────────────────────────────────────
// EDIT episode (storyteller arregla un typo, cambia portada, etc.)
// Solo el creator dueño puede editar.
// ─────────────────────────────────────────────────
export async function updateEpisode(episodeId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Verificar ownership
    const { data: existing, error: fetchErr } = await supabase
        .from('episodes')
        .select('id, creator_id')
        .eq('id', episodeId)
        .maybeSingle()
    if (fetchErr || !existing) return { error: 'Episodio no encontrado' }
    if (existing.creator_id !== user.id) return { error: 'No autorizado' }

    // Extract fields (mismos que create)
    const title = formData.get('title') as string
    const preview_text = formData.get('preview_text') as string
    const full_text = formData.get('full_text') as string
    const content_json_raw = formData.get('content_json') as string
    const word_count_raw = formData.get('word_count') as string
    const reading_time_raw = formData.get('reading_time_min') as string
    const cover_image_url = formData.get('cover_image_url') as string
    const images_raw = formData.get('images') as string
    const season_id = formData.get('season_id') as string
    const soundtrack_url = formData.get('soundtrack_url') as string
    const soundtrack_title = formData.get('soundtrack_title') as string
    const is_published = formData.get('is_published') === 'true'
    const is_subscription_only = formData.get('monetization') === 'subscription'
    const ppv_price = formData.get('monetization') === 'ppv' ? parseFloat(formData.get('ppv_price') as string) : null

    if (!title || !full_text) return { error: 'Title and Full Text are required' }

    let images: string[] | null = null
    try {
        if (images_raw) {
            const parsed = JSON.parse(images_raw)
            if (Array.isArray(parsed)) images = parsed.filter((u) => typeof u === 'string')
        }
    } catch {
        images = null
    }

    // Validación de min words (anti-spam)
    const word_count = word_count_raw ? parseInt(word_count_raw, 10) : 0
    if (word_count < 30) return { error: 'El episodio debe tener al menos 30 palabras' }

    // Validación de ppv_price range
    if (ppv_price !== null && (ppv_price < 0.99 || ppv_price > 999.99)) {
        return { error: 'El precio PPV debe estar entre $0.99 y $999.99' }
    }

    let content_json = null
    try {
        if (content_json_raw) content_json = JSON.parse(content_json_raw)
    } catch {
        content_json = null
    }

    const reading_time_min = reading_time_raw ? parseInt(reading_time_raw, 10) : null

    const { error } = await supabase
        .from('episodes')
        .update({
            season_id: season_id || null,
            title,
            preview_text,
            full_text,
            content_json,
            word_count,
            reading_time_min,
            cover_image_url: cover_image_url || null,
            images,
            soundtrack_url: soundtrack_url || null,
            soundtrack_title: soundtrack_title || null,
            is_published,
            is_subscription_only,
            ppv_price,
            updated_at: new Date().toISOString(),
        })
        .eq('id', episodeId)
        .eq('creator_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/episodes')
    revalidatePath(`/dashboard/episodes/${episodeId}/edit`)
    return { ok: true }
}

// ─────────────────────────────────────────────────
// DELETE episode
// ─────────────────────────────────────────────────
export async function deleteEpisode(episodeId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('episodes')
        .delete()
        .eq('id', episodeId)
        .eq('creator_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/episodes')
    redirect('/dashboard/episodes')
}

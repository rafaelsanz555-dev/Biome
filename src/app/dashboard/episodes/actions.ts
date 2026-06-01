'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { runEpisodeChecks } from '@/lib/moderation/runChecks'
import { z } from 'zod'
import { formString } from '@/lib/validation'
import { sanitizeTipTapContent } from '@/lib/content-security'

const episodeFormSchema = z.object({
    title: z.string().trim().min(1).max(160),
    preview_text: z.string().trim().max(1200).optional().default(''),
    full_text: z.string().trim().min(30).max(120000),
    word_count: z.coerce.number().int().min(30).max(50000),
    reading_time_min: z.coerce.number().int().min(1).max(600).nullable().optional(),
    cover_image_url: z.string().url().optional().or(z.literal('')),
    images: z.string().optional().default(''),
    season_id: z.string().uuid().optional().or(z.literal('')),
    soundtrack_url: z.string().url().optional().or(z.literal('')),
    soundtrack_title: z.string().trim().max(140).optional().default(''),
    is_published: z.boolean(),
    monetization: z.enum(['free', 'subscription', 'ppv']),
    ppv_price: z.coerce.number().min(0.99).max(999.99).optional().nullable(),
})

function parseEpisodeForm(formData: FormData) {
    const monetization = formString(formData, 'monetization') || 'subscription'
    return episodeFormSchema.safeParse({
        title: formString(formData, 'title'),
        preview_text: formString(formData, 'preview_text'),
        full_text: formString(formData, 'full_text'),
        word_count: formString(formData, 'word_count'),
        reading_time_min: formString(formData, 'reading_time_min') || null,
        cover_image_url: formString(formData, 'cover_image_url'),
        images: formString(formData, 'images'),
        season_id: formString(formData, 'season_id'),
        soundtrack_url: formString(formData, 'soundtrack_url'),
        soundtrack_title: formString(formData, 'soundtrack_title'),
        is_published: formString(formData, 'is_published') === 'true',
        monetization,
        ppv_price: monetization === 'ppv' ? formString(formData, 'ppv_price') : null,
    })
}

function parseImages(raw: string) {
    if (!raw) return null
    try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed.filter((u) => typeof u === 'string')
    } catch {}
    return null
}

function parseContentJson(raw: string) {
    if (!raw) return null
    try {
        return sanitizeTipTapContent(JSON.parse(raw))
    } catch {
        return null
    }
}

async function hasNoPublishedChapter(
    supabase: Awaited<ReturnType<typeof createClient>>,
    creatorId: string,
    seasonId: string | null,
) {
    let query = supabase
        .from('episodes')
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', creatorId)
        .eq('is_published', true)

    query = seasonId ? query.eq('season_id', seasonId) : query.is('season_id', null)
    const { count } = await query
    return (count || 0) === 0
}

async function isOldestPublishedChapter(
    supabase: Awaited<ReturnType<typeof createClient>>,
    episodeId: string,
    creatorId: string,
    seasonId: string | null,
) {
    let query = supabase
        .from('episodes')
        .select('id')
        .eq('creator_id', creatorId)
        .eq('is_published', true)
        .order('created_at', { ascending: true })
        .limit(1)

    query = seasonId ? query.eq('season_id', seasonId) : query.is('season_id', null)
    const { data } = await query.maybeSingle()
    return data?.id === episodeId
}

export async function createEpisode(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const parsed = parseEpisodeForm(formData)
    if (!parsed.success) return { error: 'Revisa titulo, texto, precio y campos del episodio.' }

    const values = parsed.data
    const seasonId = values.season_id || null
    const firstChapter = values.is_published ? await hasNoPublishedChapter(supabase, user.id, seasonId) : false
    const monetization = firstChapter ? 'free' : values.monetization
    const contentJson = parseContentJson(formString(formData, 'content_json'))

    const { data: inserted, error } = await supabase
        .from('episodes')
        .insert({
            creator_id: user.id,
            season_id: seasonId,
            title: values.title,
            preview_text: values.preview_text,
            full_text: values.full_text,
            content_json: contentJson,
            word_count: values.word_count,
            reading_time_min: values.reading_time_min,
            cover_image_url: values.cover_image_url || null,
            images: parseImages(values.images),
            soundtrack_url: values.soundtrack_url || null,
            soundtrack_title: values.soundtrack_title || null,
            is_published: values.is_published,
            is_subscription_only: monetization === 'subscription',
            ppv_price: monetization === 'ppv' ? values.ppv_price : null,
        })
        .select('id')
        .single()

    if (error) return { error: error.message }

    if (inserted?.id && values.is_published) {
        runEpisodeChecks(inserted.id, values.full_text).catch((e) =>
            console.error('[moderation] background failed', e)
        )
    }

    revalidatePath('/dashboard/episodes')
    redirect('/dashboard/episodes')
}

export async function updateEpisode(episodeId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: existing, error: fetchErr } = await supabase
        .from('episodes')
        .select('id, creator_id')
        .eq('id', episodeId)
        .maybeSingle()
    if (fetchErr || !existing) return { error: 'Episodio no encontrado' }
    if (existing.creator_id !== user.id) return { error: 'No autorizado' }

    const parsed = parseEpisodeForm(formData)
    if (!parsed.success) return { error: 'Revisa titulo, texto, precio y campos del episodio.' }

    const values = parsed.data
    const seasonId = values.season_id || null
    const firstChapter = values.is_published
        ? await hasNoPublishedChapter(supabase, user.id, seasonId)
            || await isOldestPublishedChapter(supabase, episodeId, user.id, seasonId)
        : false
    const monetization = firstChapter ? 'free' : values.monetization

    const { error } = await supabase
        .from('episodes')
        .update({
            season_id: seasonId,
            title: values.title,
            preview_text: values.preview_text,
            full_text: values.full_text,
            content_json: parseContentJson(formString(formData, 'content_json')),
            word_count: values.word_count,
            reading_time_min: values.reading_time_min,
            cover_image_url: values.cover_image_url || null,
            images: parseImages(values.images),
            soundtrack_url: values.soundtrack_url || null,
            soundtrack_title: values.soundtrack_title || null,
            is_published: values.is_published,
            is_subscription_only: monetization === 'subscription',
            ppv_price: monetization === 'ppv' ? values.ppv_price : null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', episodeId)
        .eq('creator_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/episodes')
    revalidatePath(`/dashboard/episodes/${episodeId}/edit`)
    return { ok: true }
}

export async function deleteEpisode(episodeId: string) {
    const parsed = z.string().uuid().safeParse(episodeId)
    if (!parsed.success) return { error: 'Episodio invalido' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('episodes')
        .delete()
        .eq('id', parsed.data)
        .eq('creator_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/episodes')
    redirect('/dashboard/episodes')
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { requireCreatorAction } from '@/lib/auth-guards'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { runEpisodeChecks } from '@/lib/moderation/runChecks'
import { z } from 'zod'
import { formString } from '@/lib/validation'
import { sanitizeTipTapContent } from '@/lib/content-security'

const episodeFormSchema = z.object({
    title: z.string().trim().min(1).max(160),
    preview_text: z.string().trim().max(1200).optional().default(''),
    // Los borradores pueden ser cortos; el mínimo de 30 palabras solo aplica al publicar
    full_text: z.string().trim().min(1).max(120000),
    word_count: z.coerce.number().int().min(0).max(50000),
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

// Mensajes de error legibles por campo — el reviewer reportó que los errores
// genéricos hacían imposible saber qué corregir
const FIELD_LABELS: Record<string, string> = {
    title: 'el título (obligatorio, máximo 160 caracteres)',
    preview_text: 'el adelanto (máximo 1200 caracteres)',
    full_text: 'el texto de tu historia (no puede estar vacío)',
    word_count: 'el texto de tu historia',
    ppv_price: 'el precio de desbloqueo (entre $0.99 y $999.99)',
    cover_image_url: 'la imagen de portada',
    season_id: 'la serie seleccionada',
    soundtrack_url: 'el link de la banda sonora (debe ser una URL válida de Spotify o YouTube)',
    soundtrack_title: 'el nombre de la canción (máximo 140 caracteres)',
}

function formatEpisodeErrors(error: z.ZodError): string {
    const fields = [...new Set(error.issues.map((i) => FIELD_LABELS[String(i.path[0])] || String(i.path[0])))]
    return `Revisa ${fields.join(' · ')}`
}

const MIN_PUBLISH_WORDS = 30

function publishValidationError(values: z.infer<typeof episodeFormSchema>): string | null {
    if (!values.is_published) return null
    if (values.word_count < MIN_PUBLISH_WORDS) {
        return `Para publicar, tu historia necesita al menos ${MIN_PUBLISH_WORDS} palabras (llevas ${values.word_count}). Puedes guardarla como borrador mientras la terminas.`
    }
    if (values.monetization === 'ppv' && !values.ppv_price) {
        return 'Elegiste "Pago único" pero falta el precio de desbloqueo.'
    }
    return null
}

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
    const guard = await requireCreatorAction()
    if (!guard.ok) return { error: guard.error }
    const { supabase, user } = guard

    const parsed = parseEpisodeForm(formData)
    if (!parsed.success) return { error: formatEpisodeErrors(parsed.error) }

    const values = parsed.data
    const publishError = publishValidationError(values)
    if (publishError) return { error: publishError }

    const seasonId = values.season_id || null
    const firstChapter = values.is_published ? await hasNoPublishedChapter(supabase, user.id, seasonId) : false
    // Regla bio.me: el primer capítulo de cada historia siempre es gratis.
    // Si forzamos el cambio, se lo avisamos al escritor vía query param.
    const monetization = firstChapter ? 'free' : values.monetization
    const forcedFree = firstChapter && values.monetization !== 'free' && values.is_published
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

    if (error) {
        console.error('[createEpisode] insert failed:', error.message)
        return { error: friendlyDbError(error.message) }
    }

    if (inserted?.id && values.is_published) {
        runEpisodeChecks(inserted.id, values.full_text).catch((e) =>
            console.error('[moderation] background failed', e)
        )
    }

    revalidatePath('/dashboard/episodes')
    revalidatePath('/dashboard/drafts')
    if (!values.is_published) {
        redirect('/dashboard/drafts?saved=1')
    }
    redirect(`/dashboard/episodes?published=1${forcedFree ? '&first_free=1' : ''}`)
}

// Errores crudos de Postgres → mensajes que un escritor puede entender
function friendlyDbError(message: string): string {
    if (/foreign key|violates.*constraint/i.test(message)) {
        return 'Tu cuenta de escritor no está completamente activada. Ve a Ajustes y vuelve a intentarlo.'
    }
    if (/row-level security|permission denied/i.test(message)) {
        return 'No tienes permisos para publicar. Cierra sesión, vuelve a entrar e inténtalo de nuevo.'
    }
    return `No se pudo guardar el episodio: ${message}`
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
    if (!parsed.success) return { error: formatEpisodeErrors(parsed.error) }

    const values = parsed.data
    const publishError = publishValidationError(values)
    if (publishError) return { error: publishError }

    const seasonId = values.season_id || null
    const firstChapter = values.is_published
        ? await hasNoPublishedChapter(supabase, user.id, seasonId)
            || await isOldestPublishedChapter(supabase, episodeId, user.id, seasonId)
        : false
    const monetization = firstChapter ? 'free' : values.monetization
    const forcedFree = firstChapter && values.monetization !== 'free'

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

    if (error) {
        console.error('[updateEpisode] update failed:', error.message)
        return { error: friendlyDbError(error.message) }
    }

    revalidatePath('/dashboard/episodes')
    revalidatePath('/dashboard/drafts')
    revalidatePath(`/dashboard/episodes/${episodeId}/edit`)
    return { ok: true, forcedFree }
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

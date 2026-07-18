'use server'

import { createClient } from '@/lib/supabase/server'
import { requireCreatorAction } from '@/lib/auth-guards'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { runEpisodeChecks } from '@/lib/moderation/runChecks'
import { z } from 'zod'
import { formString } from '@/lib/validation'
import { sanitizeTipTapContent } from '@/lib/content-security'
import { MONETIZATION_ENABLED } from '@/lib/flags'
import { AGE_RATINGS, parseContentWarnings, resolveContentType } from '@/lib/editorial'
import { LEGAL_VERSIONS, recordLegalAcceptances } from '@/lib/legal'

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
    age_rating: z.enum(AGE_RATINGS).default('all'),
    content_warnings: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
    accept_publish_terms: z.boolean().default(false),
    rights_confirmed: z.boolean().default(false),
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

function publishValidationError(
    values: z.infer<typeof episodeFormSchema>,
    requireConsent: boolean,
): string | null {
    if (!values.is_published) return null
    if (values.word_count < MIN_PUBLISH_WORDS) {
        return `Para publicar, tu historia necesita al menos ${MIN_PUBLISH_WORDS} palabras (llevas ${values.word_count}). Puedes guardarla como borrador mientras la terminas.`
    }
    if (values.monetization === 'ppv' && !values.ppv_price) {
        return 'Elegiste "Pago único" pero falta el precio de desbloqueo.'
    }
    if (requireConsent && !values.rights_confirmed) {
        return 'Confirma que tienes los derechos para publicar este contenido.'
    }
    if (requireConsent && !values.accept_publish_terms) {
        return 'Acepta la Política de Contenido y los Términos para Creadores antes de publicar.'
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
        age_rating: formString(formData, 'age_rating') || 'all',
        content_warnings: parseContentWarnings(formData.get('content_warnings')),
        accept_publish_terms: formString(formData, 'accept_publish_terms') === 'on',
        rights_confirmed: formString(formData, 'rights_confirmed') === 'on',
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

function isEditorialMigrationMissing(message: string) {
    return /schema cache|content_type|age_rating|content_warnings|rights_confirmed_at|legal_version/i.test(message)
}

async function persistEditorialMetadata(
    supabase: Awaited<ReturnType<typeof createClient>>,
    episodeId: string,
    creatorId: string,
    values: z.infer<typeof episodeFormSchema>,
    seasonId: string | null,
    confirmRights: boolean,
) {
    const payload: Record<string, unknown> = {
        content_type: resolveContentType(seasonId),
        age_rating: values.age_rating,
        content_warnings: values.content_warnings,
        legal_version: LEGAL_VERSIONS.creator_terms,
    }
    if (confirmRights) payload.rights_confirmed_at = new Date().toISOString()

    const { error } = await supabase
        .from('episodes')
        .update(payload)
        .eq('id', episodeId)
        .eq('creator_id', creatorId)

    if (error && !isEditorialMigrationMissing(error.message)) throw error
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

/**
 * Fan-out de notificaciones al publicar: avisa a los seguidores del escritor
 * y a los seguidores de la historia (deduplicados). Usa admin client porque
 * la RLS de notifications no permite insertar filas para otros usuarios.
 * Nunca lanza — publicar jamás debe fallar por una notificación.
 */
async function notifyFollowersOfNewEpisode(
    creatorId: string,
    episodeId: string,
    title: string,
    seasonId: string | null,
) {
    try {
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const admin = createAdminClient()

        const [followsRes, storyRes] = await Promise.all([
            admin.from('follows').select('follower_id').eq('creator_id', creatorId),
            seasonId
                ? admin.from('story_follows').select('follower_id').eq('season_id', seasonId)
                : Promise.resolve({ data: [] as { follower_id: string }[] }),
        ])

        const ids = new Set<string>()
        followsRes.data?.forEach((r) => ids.add(r.follower_id))
        storyRes.data?.forEach((r) => ids.add(r.follower_id))
        ids.delete(creatorId)
        if (ids.size === 0) return

        const rows = Array.from(ids).map((uid) => ({
            user_id: uid,
            actor_id: creatorId,
            type: 'new_episode',
            reference_id: episodeId,
            message: seasonId
                ? `Publicó un nuevo capítulo: «${title}»`
                : `Publicó una nueva entrada: «${title}»`,
        }))
        // Lotes de 500 por si el escritor tiene muchos seguidores
        for (let i = 0; i < rows.length; i += 500) {
            const { error } = await admin.from('notifications').insert(rows.slice(i, i + 500))
            if (error) console.error('[notify followers] insert failed:', error.message)
        }
    } catch (e: any) {
        console.error('[notify followers] failed:', e?.message)
    }
}

export async function createEpisode(formData: FormData) {
    const guard = await requireCreatorAction()
    if (!guard.ok) return { error: guard.error }
    const { supabase, user } = guard

    const parsed = parseEpisodeForm(formData)
    if (!parsed.success) return { error: formatEpisodeErrors(parsed.error) }

    const values = parsed.data
    const publishError = publishValidationError(values, values.is_published)
    if (publishError) return { error: publishError }

    const seasonId = values.season_id || null
    const firstChapter = values.is_published ? await hasNoPublishedChapter(supabase, user.id, seasonId) : false
    // Regla Pergamo: el primer capítulo de cada historia siempre es gratis.
    // MVP: con monetización apagada, TODO capítulo nuevo nace gratis.
    const monetization = !MONETIZATION_ENABLED || firstChapter ? 'free' : values.monetization
    const forcedFree = MONETIZATION_ENABLED && firstChapter && values.monetization !== 'free' && values.is_published
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

    if (inserted?.id) {
        try {
            await persistEditorialMetadata(supabase, inserted.id, user.id, values, seasonId, values.is_published)
            if (values.is_published) {
                await recordLegalAcceptances({
                    userId: user.id,
                    documents: ['content_policy', 'creator_terms'],
                    context: 'publish',
                    resourceId: inserted.id,
                    metadata: {
                        content_type: resolveContentType(seasonId),
                        age_rating: values.age_rating,
                        rights_confirmed: true,
                    },
                })
            }
        } catch (acceptanceError) {
            await supabase.from('episodes').delete().eq('id', inserted.id).eq('creator_id', user.id)
            console.error('[createEpisode] editorial/legal metadata failed:', acceptanceError)
            return { error: 'No pudimos registrar tus derechos y aceptación legal. No se publicó nada; intenta otra vez.' }
        }
    }

    if (inserted?.id && values.is_published) {
        runEpisodeChecks(inserted.id, values.full_text).catch((e) =>
            console.error('[moderation] background failed', e)
        )
        // El loop de retención: avisar a los seguidores que hay capítulo nuevo
        await notifyFollowersOfNewEpisode(user.id, inserted.id, values.title, seasonId)
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
        .select('id, creator_id, is_published')
        .eq('id', episodeId)
        .maybeSingle()
    if (fetchErr || !existing) return { error: 'Episodio no encontrado' }
    if (existing.creator_id !== user.id) return { error: 'No autorizado' }

    const parsed = parseEpisodeForm(formData)
    if (!parsed.success) return { error: formatEpisodeErrors(parsed.error) }

    const values = parsed.data
    const firstPublication = !existing.is_published && values.is_published
    const publishError = publishValidationError(values, firstPublication)
    if (publishError) return { error: publishError }

    const seasonId = values.season_id || null
    const firstChapter = values.is_published
        ? await hasNoPublishedChapter(supabase, user.id, seasonId)
            || await isOldestPublishedChapter(supabase, episodeId, user.id, seasonId)
        : false
    const monetization = !MONETIZATION_ENABLED || firstChapter ? 'free' : values.monetization
    const forcedFree = firstChapter && values.monetization !== 'free'

    if (firstPublication) {
        try {
            await recordLegalAcceptances({
                userId: user.id,
                documents: ['content_policy', 'creator_terms'],
                context: 'publish',
                resourceId: episodeId,
                metadata: {
                    content_type: resolveContentType(seasonId),
                    age_rating: values.age_rating,
                    rights_confirmed: true,
                },
            })
        } catch (acceptanceError) {
            console.error('[updateEpisode] legal acceptance failed:', acceptanceError)
            return { error: 'No pudimos registrar tu aceptación legal. El contenido sigue como borrador.' }
        }
    }

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

    try {
        await persistEditorialMetadata(supabase, episodeId, user.id, values, seasonId, firstPublication)
    } catch (metadataError: any) {
        console.error('[updateEpisode] editorial metadata failed:', metadataError?.message)
        return { error: 'El contenido se guardó, pero no pudimos guardar su clasificación editorial. Intenta otra vez.' }
    }

    // Solo notificar la PRIMERA vez que pasa de borrador a publicado —
    // editar un capítulo ya publicado no debe spamear a los seguidores.
    if (!existing.is_published && values.is_published) {
        await notifyFollowersOfNewEpisode(user.id, episodeId, values.title, seasonId)
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

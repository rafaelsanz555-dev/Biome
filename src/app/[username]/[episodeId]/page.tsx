import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { Lock, ChevronLeft, Gift, ArrowRight, Sparkles } from 'lucide-react'
import { GiftPanel } from '@/components/GiftPanel'
import { ReadingProgress } from '@/components/ReadingProgress'
import { TextHighlightShare } from '@/components/TextHighlightShare'
import { ChapterSoundtrack } from '@/components/ChapterSoundtrack'
import { EmotionalReactions } from '@/components/EmotionalReactions'
import { LiveReaderCount } from '@/components/LiveReaderCount'
import { ReaderRenderer } from '@/components/editor/ReaderRenderer'
import { ThemeProvider, extractTheme } from '@/components/theme/ThemeProvider'
import ReadTracker from '@/components/ReadTracker'
import BookmarkTracker from '@/components/reader/BookmarkTracker'
import { ReportButton } from '@/components/ReportButton'
import { EpisodeRecap } from '@/components/reader/EpisodeRecap'
import { HonestPaywall } from '@/components/reader/HonestPaywall'
import { EpisodeFeedActions } from '@/components/EpisodeFeedActions'
import { CommentSection } from '@/components/comments/CommentSection'
import { ChapterEndCTA } from '@/components/reader/ChapterEndCTA'
import { MONETIZATION_ENABLED } from '@/lib/flags'

interface EpisodePageProps {
    params: Promise<{
        username: string
        episodeId: string
    }>
}

export default async function EpisodePage({ params }: EpisodePageProps) {
    const { username, episodeId } = await params
    const supabase = await createClient()

    // ── Query 1: profile + creators + theme (la query principal) ──
    const { data: creatorProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*, creators!profile_id(profile_id, subscription_price, accent_color, font_family, card_style, brand_tagline, posting_frequency, frequency_promise, series_status, is_verified_storyteller, verification_method, why_i_write, theme_id, themes(id, slug, name, description, type, style, config, is_animated))')
        .eq('username', username.toLowerCase())
        .maybeSingle()

    if (profileError) console.error('[episode page] profile query failed:', profileError.message)
    if (!creatorProfile) notFound()

    // ── Query 2: episode SEPARADO de seasons (evita FK ambigua) ──
    // SIN full_text/content_json: el contenido pago se carga aparte, solo
    // tras validar acceso — antes el texto completo viajaba al HTML del paywall
    const { data: episode, error: epError } = await supabase
        .from('episodes')
        .select('id, season_id, creator_id, title, preview_text, cover_image_url, images, soundtrack_url, soundtrack_title, is_published, is_subscription_only, ppv_price, word_count, reading_time_min, created_at')
        .eq('id', episodeId)
        .maybeSingle()

    if (epError) console.error('[episode page] episode query failed:', epError.message)
    if (!episode) notFound()

    // El episodio DEBE pertenecer al creador de la URL. Sin esto, un suscriptor
    // de A podía abrir /A/{episodeId-de-B} y el check de suscripción (que usa el
    // creador de la URL) le daba acceso al contenido pago de B.
    if (episode.creator_id !== creatorProfile.id) notFound()

    // Cargar season aparte si existe
    let seasonTitle: string | null = null
    let seasonSlug: string | null = null
    if (episode.season_id) {
        const { data: season } = await supabase
            .from('seasons')
            .select('title, slug')
            .eq('id', episode.season_id)
            .maybeSingle()
        seasonTitle = season?.title ?? null
        seasonSlug = season?.slug ?? null
    }
    ;(episode as any).seasons = seasonTitle ? { title: seasonTitle } : null

    // ── Validación de acceso al draft ──
    // Si el episode no está publicado Y no es del creador logueado → 404
    // (la simplificación: si el page llegó hasta acá, el episode existe, solo
    // necesitamos validar que terceros no vean drafts)
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!episode.is_published && episode.creator_id !== currentUser?.id) {
        notFound()
    }

    const user = currentUser
    let hasAccess = false

    // MVP: monetización apagada — todo capítulo publicado se lee completo.
    // (Los drafts de terceros ya devolvieron 404 arriba.)
    if (!MONETIZATION_ENABLED) {
        hasAccess = true
    }

    // Episodio gratis (sin suscripción ni PPV): legible por cualquiera.
    // Antes solo el PRIMER capítulo gratis era accesible — los demás episodios
    // marcados "gratis" quedaban tras el paywall (inconsistente con el perfil).
    if (!episode.is_subscription_only && !episode.ppv_price) {
        hasAccess = true
    }

    if (!hasAccess && user) {
        if (user.id === episode.creator_id) {
            hasAccess = true
        } else {
            // El creator_id usa creatorProfile.id (que es profiles.id = creators.profile_id, todos iguales)
            // PPV: valid_until null = desbloqueo permanente. Subscripción: debe estar vigente.
            const { data: entitlements } = await supabase
                .from('entitlements')
                .select('id, entitlement_type, valid_until')
                .eq('user_id', user.id)
                .or(`episode_id.eq.${episode.id},and(creator_id.eq.${creatorProfile.id},entitlement_type.eq.subscription)`)

            const now = Date.now()
            hasAccess = (entitlements || []).some(
                (e) => !e.valid_until || new Date(e.valid_until).getTime() > now
            )
        }
    }

    // ── Contenido del episodio: SOLO se trae si hay acceso ──
    // Se usa el admin client porque la migración revoca el SELECT de
    // full_text/content_json para anon/authenticated (el contenido pago ya no
    // es legible vía la REST API pública de Supabase).
    let fullText: string | null = null
    let contentJson: any = null
    let teaser: string | null = null
    try {
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const admin = createAdminClient()
        const { data: content } = await admin
            .from('episodes')
            .select('full_text, content_json')
            .eq('id', episode.id)
            .maybeSingle()
        if (hasAccess) {
            fullText = content?.full_text ?? null
            contentJson = content?.content_json ?? null
        } else {
            // Lo ÚNICO del texto pago que llega al HTML: un teaser corto.
            // Antes se mandaba el texto COMPLETO oculto con CSS (overflow hidden).
            teaser = (content?.full_text || '').slice(0, 400) || null
        }
    } catch (e: any) {
        console.error('[episode page] content load failed:', e?.message)
    }

    const isOwnProfile = user?.id === creatorProfile.id
    const initial = (creatorProfile.full_name || creatorProfile.username).charAt(0).toUpperCase()
    const subPrice = creatorProfile.creators?.subscription_price || 5
    const creatorIdForSub = creatorProfile.creators?.profile_id || creatorProfile.id

    let isFollowingCreator = false
    if (user && !isOwnProfile) {
        const { data: followRow } = await supabase
            .from('follows')
            .select('creator_id')
            .eq('follower_id', user.id)
            .eq('creator_id', creatorProfile.id)
            .maybeSingle()
        isFollowingCreator = !!followRow
    }

    // Continuity context: previous + next episodes, total count, last activity
    // Continuity context: previous + next episodes within the SAME story (season)
    let siblingsQuery = supabase
        .from('episodes')
        .select('id, title, preview_text, cover_image_url, created_at, chapter_number, auto_recap, is_subscription_only, ppv_price')
        .eq('creator_id', creatorProfile.id)
        .eq('is_published', true)
        .order('created_at', { ascending: true })

    if (episode.season_id) {
        siblingsQuery = siblingsQuery.eq('season_id', episode.season_id)
    } else {
        siblingsQuery = siblingsQuery.is('season_id', null)
    }

    const { data: siblings } = await siblingsQuery

    const totalPublished = siblings?.length ?? 0
    const myIndex = siblings?.findIndex((e) => e.id === episode.id) ?? -1
    const prevEp = myIndex > 0 ? siblings![myIndex - 1] : null
    const nextEp = myIndex >= 0 && myIndex < (siblings?.length ?? 0) - 1 ? siblings![myIndex + 1] : null

    const lastEpisodeAt = siblings && siblings.length > 0 ? siblings[siblings.length - 1].created_at : null
    const daysSinceLastEpisode = lastEpisodeAt
        ? Math.floor((Date.now() - new Date(lastEpisodeAt).getTime()) / 86400000)
        : null

    // Word count for reading time — usa la columna word_count (el texto ya no
    // se descarga cuando no hay acceso)
    const words = Number(episode.word_count || 0) || (fullText || '').trim().split(/\s+/).filter(Boolean).length
    const readMin = Number(episode.reading_time_min || 0) || Math.max(1, Math.round(words / 220))

    // Fetch emotional reactions for this episode
    const { data: reactions } = await supabase
        .from('reactions')
        .select('emoji, user_id')
        .eq('episode_id', episode.id)

    const reactionCounts: Record<string, number> = {}
    let myReaction: string | null = null
    reactions?.forEach(r => {
        reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1
        if (user && r.user_id === user.id) myReaction = r.emoji
    })

    const { fallback } = extractTheme(creatorProfile.creators)

    return (
        <ThemeProvider fallbackBranding={fallback} className="min-h-screen bg-[#F8F4EA] pb-24 text-[#171512]">
            {hasAccess && <ReadTracker episodeId={episode.id} />}
            {hasAccess && !!user && <BookmarkTracker episodeId={episode.id} enabled={hasAccess} />}
            {hasAccess && <ReadingProgress />}
            <Navbar />

            {/* Sticky Back Header */}
            <div className="sticky top-16 z-40 border-b border-[#171512]/10 bg-[#F8F4EA]/92 backdrop-blur-md">
                <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link
                        href={`/${username}`}
                        className="flex items-center gap-3 group"
                    >
                        <div className="rounded-full border border-[#171512]/12 bg-[#FFFCF5] p-1.5 transition group-hover:border-[#A63D2D]/30">
                            <ChevronLeft size={16} className="text-[#746A5C] transition group-hover:text-[#A63D2D]" />
                        </div>
                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#171512]/12">
                            {creatorProfile.avatar_url ? (
                                <img src={creatorProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[#274C43]/10 text-sm font-bold text-[#274C43]">
                                    {initial}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold leading-none text-[#171512]">
                                {creatorProfile.full_name || creatorProfile.username}
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#746A5C]">@{creatorProfile.username}</p>
                        </div>
                    </Link>
                    <div className="flex items-center gap-2">
                        {seasonTitle && (
                            <div className="border border-[#A63D2D]/18 bg-[#A63D2D]/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#A63D2D]">
                                {seasonTitle}
                            </div>
                        )}
                        {!episode.is_subscription_only && !episode.ppv_price && (
                            <div className="border border-[#274C43]/18 bg-[#274C43]/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#274C43]">
                                Gratis
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 pt-8">

                {/* Live reader count */}
                <div className="mb-4">
                    <LiveReaderCount episodeId={episode.id} />
                </div>

                {/* Meta */}
                <div className="mb-5 flex flex-wrap items-center gap-3 text-sm font-medium text-[#746A5C]">
                    <span>
                        {new Date(episode.created_at).toLocaleDateString('es-ES', {
                            month: 'long', day: 'numeric', year: 'numeric',
                        })}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-[#171512]/25"></span>
                    <span>{readMin} min de lectura</span>
                    {words > 0 && (
                        <>
                            <span className="h-1 w-1 rounded-full bg-[#171512]/25"></span>
                            <span>{words.toLocaleString('es-ES')} palabras</span>
                        </>
                    )}
                </div>

                {/* Title */}
                <h1 className="mb-8 font-serif text-3xl font-black leading-[1.1] text-[#171512] md:text-5xl">
                    {episode.title}
                </h1>

                {/* Cover */}
                {(episode.cover_image_url || !hasAccess) && (
                    <div className={`relative mb-10 flex w-full items-center justify-center overflow-hidden border border-[#171512]/10 bg-[#EEE5D5] ${episode.cover_image_url ? '' : 'aspect-[16/9]'}`}>
                        {episode.cover_image_url ? (
                            <img
                                src={episode.cover_image_url}
                                alt={episode.title}
                                className={`w-full h-auto max-h-[70vh] object-contain transition-all ${!hasAccess ? 'blur-2xl opacity-40 scale-110' : ''}`}
                            />
                        ) : (
                            <div className="h-full w-full bg-[#E7DDCC]"></div>
                        )}

                        {!hasAccess && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#171512]/72 p-6 text-center backdrop-blur-sm">
                                <div className="mb-5 flex h-16 w-16 items-center justify-center border border-[#D8BA63]/30 bg-[#C9A84C]/12">
                                    <Lock className="h-7 w-7 text-[#E5CA79]" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Contenido exclusivo</h2>
                                <p className="text-gray-300 text-sm mb-6 max-w-sm leading-relaxed">
                                    Suscríbete a <strong>@{creatorProfile.username}</strong> por <strong>${subPrice}/mes</strong> para leer este episodio completo.
                                </p>
                                <Link href={`/api/checkout?type=subscription&creatorId=${creatorIdForSub}`}>
                                    <Button className="bg-[#C9A84C] hover:bg-[#D8BA63] text-[#0D0D0D] font-bold h-12 px-8 rounded-xl shadow-lg shadow-[#C9A84C]/20 transition-transform hover:scale-105">
                                        Suscribirme — ${subPrice}/mes
                                    </Button>
                                </Link>

                                {!episode.is_subscription_only && episode.ppv_price && (
                                    <div className="mt-5 text-center">
                                        <span className="text-gray-500 text-[10px] uppercase tracking-widest block mb-2">O solo este episodio</span>
                                        <form action={`/api/checkout?type=ppv&episodeId=${episode.id}`} method="POST">
                                            <Button type="submit" variant="outline" className="h-10 border-white/20 bg-white/8 px-6 font-bold text-white hover:bg-white/14 hover:text-white">
                                                Desbloquear por ${episode.ppv_price}
                                            </Button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Free preview (if there's one) */}
                {episode.preview_text && (
                    <div className="mb-8 border-l-4 border-[#A63D2D] py-2 pl-6 font-serif text-xl font-medium italic leading-relaxed text-[#5F574B]">
                        {episode.preview_text}
                    </div>
                )}

                {/* Recap del anterior */}
                {hasAccess && prevEp && (prevEp.auto_recap || prevEp.preview_text) && (
                    <EpisodeRecap previousTitle={prevEp.title} recap={prevEp.auto_recap || prevEp.preview_text || ''} />
                )}

                {/* Full text — immersive reading */}
                {hasAccess && fullText && (
                    <article className="prose max-w-none bio-reading-experience prose-headings:text-[#171512] prose-p:text-[#2F2A24] prose-strong:text-[#171512]">
                        {/* 🎵 Chapter Soundtrack */}
                        {episode.soundtrack_url && (
                            <ChapterSoundtrack url={episode.soundtrack_url} title={episode.soundtrack_title} />
                        )}

                        {contentJson ? (
                            <div className="bio-reader-immersive text-xl leading-[1.95] text-[#2F2A24] selection:bg-[#A63D2D]/20 md:text-[22px]" style={{ fontFamily: 'var(--brand-font, Georgia, serif)' }}>
                                <ReaderRenderer content={contentJson} />
                            </div>
                        ) : (
                            <div
                                data-reader-content
                                className="bio-reader-immersive whitespace-pre-wrap text-xl leading-[1.95] text-[#2F2A24] selection:bg-[#A63D2D]/20 md:text-[22px]"
                                style={{ fontFamily: 'var(--brand-font, Georgia, serif)' }}
                            >
                                {fullText}
                            </div>
                        )}
                        <TextHighlightShare creatorUsername={creatorProfile.username} episodeTitle={episode.title} />

                        {/* 🖼️ Galería: imágenes adicionales del episodio */}
                        {Array.isArray(episode.images) && episode.images.length > 0 && (
                            <div className="not-prose mt-10 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {episode.images.map((url: string, i: number) => (
                                    <div key={i} className="relative overflow-hidden border border-[#171512]/10 bg-[#EEE5D5]">
                                        <img
                                            src={url}
                                            alt={`Imagen ${i + 1} del capítulo`}
                                            className="w-full h-auto object-contain max-h-[600px]"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 🎭 Emotional Signature */}
                        <EmotionalReactions
                            episodeId={episode.id}
                            initialCounts={reactionCounts}
                            initialMyReaction={myReaction}
                            totalReaders={reactions?.length || 0}
                        />
                    </article>
                )}

                {/* Paywall fade teaser — solo un fragmento corto llega al HTML */}
                {!hasAccess && teaser && (
                    <div className="relative mb-2">
                        <div
                            className="relative whitespace-pre-wrap text-lg leading-[1.9] text-[#4B443A] md:text-xl"
                            style={{
                                fontFamily: 'Georgia, "Playfair Display", serif',
                                maxHeight: '320px',
                                overflow: 'hidden',
                            }}
                        >
                            {teaser}…
                            <div
                                className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none"
                                style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(248,244,234,0.72) 50%, #F8F4EA 100%)' }}
                            />
                        </div>
                    </div>
                )}

                {/* Honest paywall (with continuity + trust signals) */}
                {!hasAccess && (
                    <HonestPaywall
                        creatorUsername={creatorProfile.username}
                        subPrice={subPrice}
                        creatorIdForSub={creatorIdForSub}
                        episodeId={episode.id}
                        ppvPrice={episode.ppv_price}
                        isSubscriptionOnly={episode.is_subscription_only}
                        seriesStatus={creatorProfile.creators?.series_status}
                        postingFrequency={creatorProfile.creators?.posting_frequency}
                        frequencyPromise={creatorProfile.creators?.frequency_promise}
                        totalEpisodes={totalPublished}
                        isVerified={creatorProfile.creators?.is_verified_storyteller}
                        daysSinceLastEpisode={daysSinceLastEpisode}
                    />
                )}

                {/* Engagement bar (sticky footer-like) */}
                {hasAccess && (
                    <>
                        <ChapterEndCTA
                            creatorId={creatorProfile.id}
                            creatorUsername={creatorProfile.username}
                            creatorName={creatorProfile.full_name || creatorProfile.username}
                            isAuthenticated={!!user}
                            isOwnProfile={isOwnProfile}
                            initialFollowing={isFollowingCreator}
                            nextEpisode={nextEp ? { id: nextEp.id, title: nextEp.title } : null}
                            subscriptionPrice={subPrice}
                            creatorIdForSub={creatorIdForSub}
                            storyHref={episode.season_id ? `/${creatorProfile.username}/stories/${seasonSlug || episode.season_id}` : null}
                        />

                        <div className="mt-16 flex items-center justify-between border-y border-[#171512]/10 py-2">
                            <EpisodeFeedActions
                                episodeId={episode.id}
                                episodeUrl={`/${creatorProfile.username}/${episode.id}`}
                                episodeTitle={episode.title}
                                isOwner={isOwnProfile}
                                isAuthenticated={!!user}
                                initialLiked={myReaction === '❤️'}
                                initialLikeCount={reactionCounts['❤️'] || 0}
                                hideGift={true}
                                commentScrollTarget="#comments"
                                creatorUsername={creatorProfile.username}
                                variant="editorial"
                            />
                            {MONETIZATION_ENABLED && !isOwnProfile && (
                                <a href="#gift-panel" className="flex items-center gap-2 bg-[#C9A84C]/10 text-[#D8BA63] border border-[#C9A84C]/20 px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#C9A84C]/20 transition">
                                    <Gift size={16} />
                                    Enviar regalo
                                </a>
                            )}
                        </div>

                        {/* Comentarios */}
                        <CommentSection episodeId={episode.id} creatorId={creatorProfile.id} />

                        {/* Gift section */}
                        {MONETIZATION_ENABLED && !isOwnProfile && (
                            <div id="gift-panel" className="mt-10 border border-[#171512]/10 bg-[#FFFCF5] p-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center">
                                        <Gift className="text-[#D8BA63]" size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-[#171512]">Apoya a {creatorProfile.full_name || creatorProfile.username}</h3>
                                        <p className="text-xs text-[#746A5C]">El escritor recibe el 88% de cada regalo</p>
                                    </div>
                                </div>
                                <GiftPanel recipientId={creatorProfile.id} recipientUsername={creatorProfile.username} postId={episode.id} />
                            </div>
                        )}

                        {/* Author footer */}
                        <div className="mt-10 flex items-center gap-4 border border-[#171512]/10 bg-[#FFFCF5] p-6">
                            <Link href={`/${username}`} className="shrink-0">
                                <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-[#171512]/12 transition hover:border-[#A63D2D]/50">
                                    {creatorProfile.avatar_url ? (
                                        <img src={creatorProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-[#274C43]/10 text-lg font-bold text-[#274C43]">
                                            {initial}
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                                <Link href={`/${username}`}>
                                    <p className="font-bold text-[#171512] transition hover:text-[#A63D2D]">
                                        {creatorProfile.full_name || creatorProfile.username}
                                    </p>
                                </Link>
                                <p className="truncate text-sm text-[#746A5C]">
                                    {creatorProfile.bio || 'Compartiendo su historia en Pergamo.'}
                                </p>
                            </div>
                            {!isOwnProfile && (
                                <Link href={`/${username}`}>
                                    <Button variant="outline" className="h-10 shrink-0 border-[#171512]/15 bg-transparent font-bold text-[#171512] hover:bg-[#F0E8D9]">
                                        Ver perfil
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </>
                )}

                {/* Continuity Navigation (Prev/Next) */}
                {hasAccess && (
                    <div className="my-12 flex flex-col sm:flex-row gap-4 justify-between items-stretch">
                        {prevEp ? (
                            <Link href={`/${creatorProfile.username}/${prevEp.id}`} className="group flex flex-1 flex-col justify-center border border-[#171512]/10 bg-[#FFFCF5] p-4 transition hover:border-[#A63D2D]/35">
                                <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#746A5C]">
                                    <ChevronLeft size={12} className="group-hover:-translate-x-1 transition" /> Anterior
                                </div>
                                <h3 className="font-serif font-bold text-[#171512] transition group-hover:text-[#A63D2D]">{prevEp.title}</h3>
                            </Link>
                        ) : <div className="flex-1 hidden sm:block"></div>}
                        
                        {nextEp ? (
                            <Link href={`/${creatorProfile.username}/${nextEp.id}`} className="group flex flex-1 flex-col justify-center border border-[#A63D2D]/20 bg-[#F3E9DB] p-4 text-right transition hover:border-[#A63D2D]/50">
                                <div className="mb-1 flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-wider text-[#A63D2D]">
                                    Siguiente <ArrowRight size={12} className="group-hover:translate-x-1 transition" />
                                </div>
                                <h3 className="font-serif font-bold text-[#171512] transition group-hover:text-[#A63D2D]">{nextEp.title}</h3>
                            </Link>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center border border-[#171512]/10 bg-[#FFFCF5] p-4 text-center">
                                <Sparkles className="mb-1 text-[#C9A84C]" size={16} />
                                <h3 className="font-serif text-sm font-bold text-[#746A5C]">Estás al día</h3>
                            </div>
                        )}
                    </div>
                )}

                {/* Report button */}
                {!isOwnProfile && (
                    <div className="mt-8 flex justify-end">
                        <ReportButton targetType="episode" targetId={episode.id} />
                    </div>
                )}
            </main>
        </ThemeProvider>
    )
}

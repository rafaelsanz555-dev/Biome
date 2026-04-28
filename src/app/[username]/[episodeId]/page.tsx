import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { Lock, ChevronLeft, Heart, MessageCircle, Gift, Play, Share2 } from 'lucide-react'
import { GiftPanel } from '@/components/GiftPanel'
import { ReadingProgress } from '@/components/ReadingProgress'
import { TextHighlightShare } from '@/components/TextHighlightShare'
import { ChapterSoundtrack } from '@/components/ChapterSoundtrack'
import { EmotionalReactions } from '@/components/EmotionalReactions'
import { LiveReaderCount } from '@/components/LiveReaderCount'
import { ReaderRenderer } from '@/components/editor/ReaderRenderer'
import { CreatorBrandProvider, extractBranding } from '@/components/CreatorBrandProvider'
import { ThemeProvider, extractTheme } from '@/components/theme/ThemeProvider'
import ReadTracker from '@/components/ReadTracker'
import BookmarkTracker from '@/components/reader/BookmarkTracker'
import { ReportButton } from '@/components/ReportButton'
import { NextEpisode } from '@/components/reader/NextEpisode'
import { EpisodeRecap } from '@/components/reader/EpisodeRecap'
import { HonestPaywall } from '@/components/reader/HonestPaywall'

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
    const { data: episode, error: epError } = await supabase
        .from('episodes')
        .select('*')
        .eq('id', episodeId)
        .maybeSingle()

    if (epError) console.error('[episode page] episode query failed:', epError.message)
    if (!episode) notFound()

    // Cargar season aparte si existe
    let seasonTitle: string | null = null
    if (episode.season_id) {
        const { data: season } = await supabase
            .from('seasons')
            .select('title')
            .eq('id', episode.season_id)
            .maybeSingle()
        seasonTitle = season?.title ?? null
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

    if (user) {
        if (user.id === episode.creator_id) {
            hasAccess = true
        } else {
            // El creator_id usa creatorProfile.id (que es profiles.id = creators.profile_id, todos iguales)
            const { data: entitlement } = await supabase
                .from('entitlements')
                .select('id')
                .eq('user_id', user.id)
                .or(`episode_id.eq.${episode.id},and(creator_id.eq.${creatorProfile.id},entitlement_type.eq.subscription)`)
                .limit(1)
                .maybeSingle()

            if (entitlement) hasAccess = true
        }
    }

    // First episode is always free
    const { data: allEpisodes } = await supabase
        .from('episodes')
        .select('id, created_at')
        .eq('creator_id', creatorProfile.id)
        .eq('is_published', true)
        .order('created_at', { ascending: true })
        .limit(1)

    const isFirstEpisode = allEpisodes?.[0]?.id === episode.id
    if (isFirstEpisode && !episode.is_subscription_only && !episode.ppv_price) {
        hasAccess = true
    }

    const isOwnProfile = user?.id === creatorProfile.id
    const initial = (creatorProfile.full_name || creatorProfile.username).charAt(0).toUpperCase()
    const subPrice = creatorProfile.creators?.subscription_price || 5
    const creatorIdForSub = creatorProfile.creators?.profile_id || creatorProfile.id

    // Continuity context: previous + next episodes, total count, last activity
    const { data: siblings } = await supabase
        .from('episodes')
        .select('id, title, preview_text, cover_image_url, created_at, chapter_number, auto_recap, is_subscription_only, ppv_price')
        .eq('creator_id', creatorProfile.id)
        .eq('is_published', true)
        .order('created_at', { ascending: true })

    const totalPublished = siblings?.length ?? 0
    const myIndex = siblings?.findIndex((e) => e.id === episode.id) ?? -1
    const prevEp = myIndex > 0 ? siblings![myIndex - 1] : null
    const nextEp = myIndex >= 0 && myIndex < (siblings?.length ?? 0) - 1 ? siblings![myIndex + 1] : null

    const lastEpisodeAt = siblings && siblings.length > 0 ? siblings[siblings.length - 1].created_at : null
    const daysSinceLastEpisode = lastEpisodeAt
        ? Math.floor((Date.now() - new Date(lastEpisodeAt).getTime()) / 86400000)
        : null

    // Word count for reading time
    const words = (episode.full_text || '').trim().split(/\s+/).filter(Boolean).length
    const readMin = Math.max(1, Math.round(words / 220))

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

    const branding = extractBranding(creatorProfile.creators)
    const { theme, fallback } = extractTheme(creatorProfile.creators)

    return (
        <ThemeProvider theme={theme} fallbackBranding={fallback} className="min-h-screen pb-24 text-gray-100">
            {hasAccess && <ReadTracker episodeId={episode.id} />}
            {hasAccess && !!user && <BookmarkTracker episodeId={episode.id} enabled={hasAccess} />}
            {hasAccess && <ReadingProgress />}
            <Navbar />

            {/* Sticky Back Header */}
            <div className="sticky top-16 z-40 bg-[#0A0B0E]/90 backdrop-blur-md border-b border-gray-800">
                <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link
                        href={`/${username}`}
                        className="flex items-center gap-3 group"
                    >
                        <div className="bg-[#15171C] border border-gray-800 p-1.5 rounded-full group-hover:border-blue-500/30 transition">
                            <ChevronLeft size={16} className="text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-700">
                            {creatorProfile.avatar_url ? (
                                <img src={creatorProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-sm bg-blue-900/40 text-blue-400">
                                    {initial}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-sm text-white leading-none">
                                {creatorProfile.full_name || creatorProfile.username}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5">@{creatorProfile.username}</p>
                        </div>
                    </Link>
                    <div className="flex items-center gap-2">
                        {episode.seasons?.title && (
                            <div className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 uppercase tracking-wider">
                                {episode.seasons.title}
                            </div>
                        )}
                        {isFirstEpisode && (
                            <div className="text-[10px] font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20 uppercase tracking-wider">
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
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-5 font-medium flex-wrap">
                    <span>
                        {new Date(episode.created_at).toLocaleDateString('es-ES', {
                            month: 'long', day: 'numeric', year: 'numeric',
                        })}
                    </span>
                    <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                    <span>{readMin} min de lectura</span>
                    {words > 0 && (
                        <>
                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                            <span>{words.toLocaleString('es-ES')} palabras</span>
                        </>
                    )}
                </div>

                {/* Title */}
                <h1 className="font-bold text-3xl md:text-5xl text-white leading-[1.1] tracking-tight mb-8">
                    {episode.title}
                </h1>

                {/* Cover */}
                {(episode.cover_image_url || !hasAccess) && (
                    <div className="mb-10 w-full rounded-2xl overflow-hidden relative border border-gray-800 bg-[#15171C] aspect-[16/9] flex items-center justify-center">
                        {episode.cover_image_url ? (
                            <img
                                src={episode.cover_image_url}
                                alt={episode.title}
                                className={`w-full h-full object-cover transition-all ${!hasAccess ? 'blur-2xl opacity-40 scale-110' : ''}`}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-900/30 via-[#15171C] to-[#0A0B0E]"></div>
                        )}

                        {!hasAccess && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/50 backdrop-blur-sm">
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-5">
                                    <Lock className="w-7 h-7 text-blue-400" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Contenido exclusivo</h2>
                                <p className="text-gray-300 text-sm mb-6 max-w-sm leading-relaxed">
                                    Suscríbete a <strong>@{creatorProfile.username}</strong> por <strong>${subPrice}/mes</strong> para leer este episodio completo.
                                </p>
                                <Link href={`/api/checkout?type=subscription&creatorId=${creatorIdForSub}`}>
                                    <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-blue-500/20 transition-transform hover:scale-105">
                                        Suscribirme — ${subPrice}/mes
                                    </Button>
                                </Link>

                                {!episode.is_subscription_only && episode.ppv_price && (
                                    <div className="mt-5 text-center">
                                        <span className="text-gray-500 text-[10px] uppercase tracking-widest block mb-2">O solo este episodio</span>
                                        <form action={`/api/checkout?type=ppv&episodeId=${episode.id}`} method="POST">
                                            <Button type="submit" variant="outline" className="border-gray-700 bg-[#15171C] text-gray-300 hover:text-white hover:bg-gray-800 font-bold h-10 px-6 rounded-xl">
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
                    <div className="text-gray-400 text-xl leading-relaxed mb-8 font-medium italic border-l-4 border-blue-500 pl-6 py-2">
                        {episode.preview_text}
                    </div>
                )}

                {/* Recap del anterior */}
                {hasAccess && prevEp?.auto_recap && (
                    <EpisodeRecap previousTitle={prevEp.title} recap={prevEp.auto_recap} />
                )}

                {/* Full text — immersive reading */}
                {hasAccess && episode.full_text && (
                    <article className="prose prose-invert max-w-none bio-reading-experience">
                        {/* 🎵 Chapter Soundtrack */}
                        {episode.soundtrack_url && (
                            <ChapterSoundtrack url={episode.soundtrack_url} title={episode.soundtrack_title} />
                        )}

                        {episode.content_json ? (
                            <div className="bio-reader-immersive text-gray-100 text-xl md:text-[22px] leading-[1.95] selection:bg-blue-500/40 selection:text-white" style={{ fontFamily: 'var(--brand-font, Georgia, serif)', letterSpacing: '-0.005em' }}>
                                <ReaderRenderer content={episode.content_json} />
                            </div>
                        ) : (
                            <div
                                data-reader-content
                                className="bio-reader-immersive text-gray-100 text-xl md:text-[22px] leading-[1.95] whitespace-pre-wrap selection:bg-blue-500/40 selection:text-white"
                                style={{ fontFamily: 'var(--brand-font, Georgia, serif)', letterSpacing: '-0.005em' }}
                            >
                                {episode.full_text}
                            </div>
                        )}
                        <TextHighlightShare creatorUsername={creatorProfile.username} episodeTitle={episode.title} />

                        {/* 🎭 Emotional Signature */}
                        <EmotionalReactions
                            episodeId={episode.id}
                            initialCounts={reactionCounts}
                            initialMyReaction={myReaction}
                            totalReaders={reactions?.length || 0}
                        />
                    </article>
                )}

                {/* Paywall fade teaser for non-subscribers */}
                {!hasAccess && episode.full_text && (
                    <div className="relative mb-2">
                        <div
                            className="text-gray-300 text-lg md:text-xl leading-[1.9] whitespace-pre-wrap relative"
                            style={{
                                fontFamily: 'Georgia, "Playfair Display", serif',
                                maxHeight: '320px',
                                overflow: 'hidden',
                            }}
                        >
                            {episode.full_text}
                            <div
                                className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none"
                                style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(10,11,14,0.7) 50%, #0A0B0E 100%)' }}
                            />
                        </div>
                    </div>
                )}

                {/* Honest paywall (with continuity + trust signals) */}
                {!hasAccess && (
                    <HonestPaywall
                        creatorUsername={creatorProfile.username}
                        creatorName={creatorProfile.full_name || creatorProfile.username}
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
                        <div className="mt-16 py-6 border-y border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 transition text-gray-400 hover:text-red-500 font-semibold text-sm">
                                    <Heart size={18} />
                                    <span>Me gusta</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 transition text-gray-400 hover:text-white font-semibold text-sm">
                                    <MessageCircle size={18} />
                                    <span>Comentar</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 transition text-gray-400 hover:text-white font-semibold text-sm">
                                    <Share2 size={18} />
                                    <span>Compartir</span>
                                </button>
                            </div>
                            {!isOwnProfile && (
                                <a href="#gift-panel" className="flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-500/20 transition">
                                    <Gift size={16} />
                                    Enviar regalo
                                </a>
                            )}
                        </div>

                        {/* Gift section */}
                        {!isOwnProfile && (
                            <div id="gift-panel" className="mt-10 bg-gradient-to-br from-[#15171C] to-[#0F1114] p-6 rounded-2xl border border-gray-800">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <Gift className="text-blue-400" size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-base">Apoya a {creatorProfile.full_name || creatorProfile.username}</h3>
                                        <p className="text-xs text-gray-500">El escritor recibe el 88% de cada regalo</p>
                                    </div>
                                </div>
                                <GiftPanel recipientId={creatorProfile.id} recipientUsername={creatorProfile.username} postId={episode.id} />
                            </div>
                        )}

                        {/* Author footer */}
                        <div className="mt-10 p-6 rounded-2xl bg-[#15171C] border border-gray-800 flex items-center gap-4">
                            <Link href={`/${username}`} className="shrink-0">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-700 hover:border-blue-500 transition">
                                    {creatorProfile.avatar_url ? (
                                        <img src={creatorProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-lg bg-blue-900/40 text-blue-400">
                                            {initial}
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                                <Link href={`/${username}`}>
                                    <p className="font-bold text-white hover:text-blue-400 transition">
                                        {creatorProfile.full_name || creatorProfile.username}
                                    </p>
                                </Link>
                                <p className="text-sm text-gray-500 truncate">
                                    {creatorProfile.bio || 'Compartiendo su historia en bio.me.'}
                                </p>
                            </div>
                            {!isOwnProfile && (
                                <Link href={`/${username}`}>
                                    <Button variant="outline" className="border-gray-700 bg-[#15171C] text-white hover:bg-gray-800 font-bold h-10 rounded-xl shrink-0">
                                        Ver perfil
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </>
                )}

                {/* Next episode (continuity) */}
                {hasAccess && (
                    <NextEpisode
                        creatorUsername={creatorProfile.username}
                        episode={nextEp ? {
                            id: nextEp.id,
                            title: nextEp.title,
                            preview_text: nextEp.preview_text,
                            cover_image_url: nextEp.cover_image_url,
                            is_subscription_only: nextEp.is_subscription_only,
                            ppv_price: nextEp.ppv_price,
                            chapter_number: nextEp.chapter_number,
                        } : null}
                        seriesProgress={totalPublished > 1 ? { current: myIndex + 1, total: totalPublished } : null}
                    />
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

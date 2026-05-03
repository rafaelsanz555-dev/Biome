import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { GiftPanel } from '@/components/GiftPanel'
import { Navbar } from '@/components/Navbar'
import { CreatorBrandProvider, extractBranding } from '@/components/CreatorBrandProvider'
import { ThemeProvider, extractTheme } from '@/components/theme/ThemeProvider'
import { CreatorBioCard } from '@/components/trust/CreatorBioCard'
import Link from 'next/link'
import { Lock, Heart, Gift, MessageCircle } from 'lucide-react'
import { EpisodeFeedActions } from '@/components/EpisodeFeedActions'

interface ProfilePageProps {
    params: Promise<{ username: string }>
}

export default async function CreatorProfilePage({ params }: ProfilePageProps) {
    const { username } = await params
    const supabase = await createClient()

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, creators!profile_id(subscription_price, accent_color, font_family, card_style, brand_tagline, cover_pattern, posting_frequency, frequency_promise, series_status, is_verified_storyteller, verification_method, why_i_write, theme_id, themes(id, slug, name, description, type, style, config, is_animated))')
        .eq('username', username.toLowerCase())
        .single()

    if (error || !profile) notFound()

    const { data: episodes } = await supabase
        .from('episodes')
        .select('id, title, preview_text, full_text, cover_image_url, is_subscription_only, ppv_price, created_at, season_id, seasons(id, title, description)')
        .eq('creator_id', profile.id)
        .eq('is_published', true)
        .order('created_at', { ascending: true })

    const { data: { user } } = await supabase.auth.getUser()

    let isSubscribed = false
    if (user) {
        const { data: entitlement } = await supabase
            .from('entitlements')
            .select('id')
            .eq('user_id', user.id)
            .eq('creator_id', profile.id)
            .eq('entitlement_type', 'subscription')
            .gte('valid_until', new Date().toISOString())
            .maybeSingle()
        isSubscribed = !!entitlement
    }

    const isOwnProfile = user?.id === profile.id
    const subscriptionPrice = profile.creators?.subscription_price || 4.99
    const initial = (profile.full_name || profile.username).charAt(0).toUpperCase()

    // Reactions (likes ❤️) por episodio — para alimentar el action bar
    const episodeIds = (episodes || []).map((e) => e.id)
    const likeCountByEp: Record<string, number> = {}
    const likedByMe: Record<string, boolean> = {}
    if (episodeIds.length > 0) {
        const { data: heartRows } = await supabase
            .from('reactions')
            .select('episode_id, user_id')
            .in('episode_id', episodeIds)
            .eq('emoji', '❤️')
        heartRows?.forEach((r) => {
            likeCountByEp[r.episode_id] = (likeCountByEp[r.episode_id] || 0) + 1
            if (user && r.user_id === user.id) likedByMe[r.episode_id] = true
        })
    }

    // Subscriber count (social proof in CTA)
    const { count: subCount } = await supabase
        .from('entitlements')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', profile.id)
        .eq('entitlement_type', 'subscription')
        .gte('valid_until', new Date().toISOString())

    const { count: followerCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', profile.id)

    const freePostIds = new Set((episodes || [])
        .slice()
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .slice(0, 1) // First post is free
        .map(e => e.id))

    const branding = extractBranding(profile.creators)
    const { theme, fallback } = extractTheme(profile.creators)
    const cardStyle = profile.creators?.card_style || 'editorial'

    // Agrupar episodios por temporada (Historia)
    const groupedEpisodes = (episodes || []).reduce((acc: any, episode: any) => {
        const seasonId = episode.season_id || 'standalone';
        if (!acc[seasonId]) {
            acc[seasonId] = {
                season: episode.seasons || null,
                episodes: []
            };
        }
        acc[seasonId].episodes.push(episode);
        return acc;
    }, {});
    
    // Convertir a array y ordenar (Las historias más recientes arriba, basadas en su último capítulo)
    const groupedList = Object.values(groupedEpisodes).sort((a: any, b: any) => {
        if (a.season && !b.season) return -1;
        if (!a.season && b.season) return 1;
        const lastDateA = new Date(a.episodes[a.episodes.length - 1].created_at).getTime();
        const lastDateB = new Date(b.episodes[b.episodes.length - 1].created_at).getTime();
        return lastDateB - lastDateA; // Descending order of update
    });

    return (
        <ThemeProvider theme={theme} fallbackBranding={fallback} className="min-h-screen text-gray-100 font-sans pb-20">
            <Navbar />

            {/* Espacio superior — deja respirar el theme arriba sin taparlo con un bg sólido */}
            <div className="h-32 md:h-48"></div>

            <main className="max-w-2xl mx-auto px-4 sm:px-6">

                {/* Profile Info Card — semi-transparente con blur para que el theme se vea atrás */}
                <div className="bg-[#15171C]/85 backdrop-blur-md rounded-2xl border border-white/10 p-6 -mt-16 relative z-10 shadow-2xl mb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
                        
                        {/* Avatar */}
                        <div className="w-24 h-24 shrink-0 rounded-full overflow-hidden border-4 border-[#15171C] bg-[#0A0B0E] shadow-[0_0_20px_rgba(0,0,0,0.5)] -mt-12 md:-mt-16">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-3xl bg-blue-600/10 text-blue-500">
                                    {initial}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="mb-2">
                                <h1 className="font-bold text-2xl text-white flex items-center justify-center md:justify-start gap-2">
                                    {profile.full_name || profile.username}
                                    <span className="text-blue-500 text-sm bg-blue-500/10 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                                </h1>
                                <p className="text-sm font-medium text-gray-500">@{profile.username}</p>
                                {profile.creators?.brand_tagline && (
                                    <p className="text-sm font-semibold text-blue-400 mt-1.5 italic" style={{ fontFamily: 'Georgia, serif' }}>
                                        {profile.creators.brand_tagline}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-medium justify-center md:justify-start">
                                    <span><strong className="text-white">{subCount || 0}</strong> suscriptores</span>
                                    <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                    <span><strong className="text-white">{followerCount || 0}</strong> seguidores</span>
                                    <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                    <span><strong className="text-white">{episodes?.length || 0}</strong> episodios</span>
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-300 leading-relaxed mb-6 max-w-lg mx-auto md:mx-0">
                                {profile.bio || 'Compartiendo mi historia y contenido exclusivo en bio.me.'}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                {!isOwnProfile ? (
                                    <>
                                        {!isSubscribed ? (
                                            <div className="w-full sm:w-auto flex flex-col items-center sm:items-start gap-1">
                                                <Link href={`/api/checkout?type=subscription&creatorId=${profile.id}`} className="w-full sm:w-auto">
                                                    <Button className="w-full sm:w-auto font-bold px-8 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20">
                                                        Suscribirse · ${subscriptionPrice}/mes
                                                    </Button>
                                                </Link>
                                                {(subCount || 0) > 0 && (
                                                    <p className="text-[11px] text-gray-500 font-medium">
                                                        Únete a <strong className="text-gray-300">{subCount}</strong> {subCount === 1 ? 'lector' : 'lectores'} que ya lo apoyan
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 w-full sm:w-auto justify-center">
                                                ✓ Suscrito
                                            </span>
                                        )}
                                        <Button variant="outline" className="w-full sm:w-auto h-11 rounded-xl font-bold border-gray-700 bg-[#1A1C23] text-gray-300 hover:text-white hover:bg-gray-800">
                                            Seguir
                                        </Button>
                                    </>
                                ) : (
                                    <Link href="/dashboard" className="w-full sm:w-auto">
                                        <Button className="w-full sm:w-auto h-11 rounded-xl font-bold bg-gray-800 text-white hover:bg-gray-700">
                                            Dashboard
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gift Panel / Tipping Area for whole profile */}
                {!isOwnProfile && (
                    <div className="mb-8">
                        <GiftPanel recipientId={profile.id} recipientUsername={profile.username} />
                    </div>
                )}

                {/* Bio + Trust signals (Loop refinement Round 1) */}
                <div className="mb-10">
                    <CreatorBioCard
                        bio={profile.bio}
                        whyIWrite={profile.creators?.why_i_write}
                        storyThemes={profile.story_themes}
                        languages={profile.languages}
                        countryCode={profile.country_code}
                        pronouns={profile.pronouns}
                        isVerified={profile.creators?.is_verified_storyteller}
                        verificationMethod={profile.creators?.verification_method}
                        seriesStatus={profile.creators?.series_status}
                        postingFrequency={profile.creators?.posting_frequency}
                        frequencyPromise={profile.creators?.frequency_promise}
                        totalEpisodes={episodes?.length || 0}
                        daysSinceLastEpisode={
                            episodes && episodes.length > 0
                                ? Math.floor((Date.now() - new Date(episodes[0].created_at).getTime()) / 86400000)
                                : null
                        }
                    />
                </div>

                {/* Feed (Agrupado por Historia/Temporada) */}
                <div className="space-y-12 bio-card-style-root" data-card-style={cardStyle}>
                    {(!episodes || episodes.length === 0) ? (
                        <div className="bg-[#15171C] border border-gray-800 rounded-2xl py-16 text-center text-gray-500">
                            Aún no hay publicaciones.
                        </div>
                    ) : (
                        groupedList.map((group: any, idx: number) => (
                            <div key={idx} className="relative">
                                {/* Encabezado de la Historia */}
                                {group.season ? (
                                    <div className="mb-6 pl-4 border-l-4 border-[var(--brand-accent)]">
                                        <h2 className="text-2xl font-serif font-bold text-white mb-2">{group.season.title}</h2>
                                        {group.season.description && (
                                            <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">{group.season.description}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mb-6 pl-4 border-l-4 border-gray-700">
                                        <h2 className="text-xl font-bold text-gray-300">Publicaciones Sueltas</h2>
                                    </div>
                                )}

                                {/* Lista de Capítulos */}
                                <div className="space-y-6">
                                    {group.episodes.map((episode: any, epIdx: number) => {
                                        const isFree = freePostIds.has(episode.id) || (!episode.is_subscription_only && !episode.ppv_price)
                                        const canRead = isFree || isSubscribed || isOwnProfile
                                        const chapterNumber = group.season ? `Capítulo ${epIdx + 1}` : null

                                        return (
                                            <div key={episode.id} className="bg-[#15171C] border border-gray-800 rounded-2xl overflow-hidden shadow-md">
                                                {/* Post Header */}
                                                <div className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 shrink-0">
                                                            {profile.avatar_url ? (
                                                                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-blue-900 text-blue-400">{initial}</div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white text-sm hover:underline cursor-pointer">{profile.full_name || profile.username}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(episode.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} a las {new Date(episode.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit'})}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 flex items-center gap-2">
                                                        {chapterNumber && (
                                                            <span className="text-xs font-medium text-gray-400 bg-gray-800 px-2 py-1 rounded-md">
                                                                {chapterNumber}
                                                            </span>
                                                        )}
                                                        {!canRead && (
                                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
                                                                <Lock size={12} /> Exclusivo
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Post Content */}
                                                <div className="px-4 pb-3">
                                                    <h3 className="font-bold text-gray-100 text-base mb-1">{episode.title}</h3>
                                                    <p className="text-sm text-gray-400 mb-4 whitespace-pre-wrap leading-relaxed line-clamp-3">
                                                        {episode.preview_text || "Mira este post..."}
                                                    </p>
                                                </div>

                                                {/* Big Media Area */}
                                                {(episode.cover_image_url || !canRead) && (
                                                    <div className="relative w-full bg-[#0A0B0E] border-y border-gray-800 min-h-[250px] flex items-center justify-center overflow-hidden">
                                                        {episode.cover_image_url && (
                                                            <img
                                                                src={episode.cover_image_url}
                                                                alt="Contenido"
                                                                className={`w-full h-auto max-h-[600px] object-contain ${!canRead ? 'blur-2xl opacity-40 scale-110' : ''}`}
                                                            />
                                                        )}
                                                        
                                                        {!canRead && (
                                                            <div className="absolute inset-0 flex items-center justify-center flex-col bg-black/40 p-6 text-center">
                                                                <Lock className="w-10 h-10 text-gray-400 mb-3" />
                                                                <p className="text-white font-bold text-lg mb-2">Contenido Exclusivo</p>
                                                                <p className="text-sm text-gray-400 mb-4">Suscríbete a {profile.username} para desbloquear este post y más.</p>
                                                                <Link href={`/api/checkout?type=subscription&creatorId=${profile.id}`}>
                                                                    <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20">
                                                                        Suscribirse por ${subscriptionPrice}/mes
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Action Bar — like real, share funcional, kebab para dueño */}
                                                <EpisodeFeedActions
                                                    episodeId={episode.id}
                                                    episodeUrl={`/${profile.username}/${episode.id}`}
                                                    episodeTitle={episode.title}
                                                    isOwner={isOwnProfile}
                                                    isAuthenticated={!!user}
                                                    initialLiked={!!likedByMe[episode.id]}
                                                    initialLikeCount={likeCountByEp[episode.id] || 0}
                                                    creatorUsername={profile.username}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </ThemeProvider>
    )
}

import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Heart, MessageCircle, Gift, Lock, MoreHorizontal, Crown, Play, CheckCircle2, BookOpen, TrendingUp, Users, PenLine, Sparkles, WalletCards, ArrowRight, Compass } from 'lucide-react'
import { ResumeReading } from '@/components/reader/ResumeReading'
import { FeedTabs } from '@/components/FeedTabs'
import { EpisodeKebab } from '@/components/EpisodeKebab'

function makeTimeAgo(locale: string, t: (k: string, v?: any) => string) {
    return (date: string): string => {
        const diff = Date.now() - new Date(date).getTime()
        const mins = Math.floor(diff / 60000)
        const hours = Math.floor(mins / 60)
        const days = Math.floor(hours / 24)
        if (mins < 1) return t('now')
        if (mins < 60) return t('ago_minutes', { min: mins })
        if (hours < 24) return t('ago_hours', { h: hours })
        if (days < 7) return t('ago_days', { d: days })
        return new Date(date).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'short' })
    }
}

function Badge({ type, labels }: { type: string; labels: Record<string, React.ReactNode> }) {
    const styles: Record<string, string> = {
        free: 'bg-yellow-600/30 text-yellow-500 border-yellow-500/20',
        series: 'bg-[#C9A84C]/30 text-[#D8BA63] border-[#C9A84C]/20',
        top: 'bg-red-900/30 text-red-400 border-red-500/20',
        exclusive: 'bg-purple-600/30 text-purple-400 border-purple-500/20',
    }
    return (
        <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase border ${styles[type] || styles.exclusive}`}>
            {labels[type] || type}
        </span>
    )
}

async function WriterCommandCenter({ userId, username }: { userId: string; username: string | null }) {
    const supabase = await createClient()
    const [
        { data: episodes },
        { data: creator },
        { data: gifts },
        { data: entitlements },
    ] = await Promise.all([
        supabase
            .from('episodes')
            .select('id, title, preview_text, cover_image_url, is_published, is_subscription_only, ppv_price, word_count, created_at, season_id, seasons(title)')
            .eq('creator_id', userId)
            .order('created_at', { ascending: false }),
        supabase
            .from('creators')
            .select('subscription_price, stripe_account_id, is_verified_storyteller, posting_frequency, why_i_write')
            .eq('profile_id', userId)
            .maybeSingle(),
        supabase
            .from('gifts')
            .select('amount, platform_fee, recipient_id, created_at')
            .eq('recipient_id', userId)
            .eq('status', 'completed'),
        supabase
            .from('entitlements')
            .select('id, creator_id')
            .eq('creator_id', userId)
            .eq('entitlement_type', 'subscription')
            // Solo suscripciones vigentes — antes contaba también las expiradas
            .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`),
    ])

    const published = episodes?.filter((e: any) => e.is_published) || []
    const drafts = episodes?.filter((e: any) => !e.is_published) || []
    const totalWords = episodes?.reduce((sum: number, e: any) => sum + Number(e.word_count || 0), 0) || 0
    const giftRevenue = gifts?.reduce((sum: number, g: any) => sum + Number(g.amount || 0), 0) || 0
    const hasFreeHook = published.some((e: any) => !e.is_subscription_only && !e.ppv_price)
    const hasPaidChapter = published.some((e: any) => e.is_subscription_only || e.ppv_price)
    const hasProfile = !!creator?.why_i_write
    const hasStripe = !!creator?.stripe_account_id
    const launchItems = [
        { label: 'Publica tu primer capitulo gratis', done: hasFreeHook, href: '/dashboard/episodes/new' },
        { label: 'Agrega un capitulo monetizado', done: hasPaidChapter, href: '/dashboard/episodes/new' },
        { label: 'Define por que escribes', done: hasProfile, href: '/dashboard/settings' },
        { label: 'Conecta pagos', done: hasStripe, href: '/dashboard/billing', muted: true },
    ]
    const launchProgress = Math.round((launchItems.filter((i) => i.done).length / launchItems.length) * 100)

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-6 py-6 pb-20">
            <section className="overflow-hidden rounded-2xl border border-[#2A261F] bg-[#12100D]">
                <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="p-6 md:p-8">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C9A84C]">Tu estudio</p>
                        <h1 className="mt-3 max-w-2xl font-serif text-4xl font-black leading-tight text-[#FAF7F0] md:text-5xl">
                            ¿Qué pasa en el próximo capítulo?
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#B9AD98]">
                            Escribe, publica y mira cómo responde tu audiencia.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/dashboard/episodes/new" className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#C9A84C] px-5 text-sm font-black text-[#0D0D0D] hover:bg-[#D8BA63]">
                                <PenLine size={16} /> Nuevo capitulo
                            </Link>
                            {username && (
                                <Link href={`/${username}`} className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#FAF7F0]/15 px-5 text-sm font-bold text-[#FAF7F0] hover:border-[#C9A84C]">
                                    Ver perfil publico <ArrowRight size={15} />
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="border-t border-[#2A261F] bg-[#0D0D0D] p-6 lg:border-l lg:border-t-0">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C9A84C]">Launch checklist</p>
                                <p className="mt-1 text-2xl font-black text-[#FAF7F0]">{launchProgress}% listo</p>
                            </div>
                            <ListProgress percent={launchProgress} />
                        </div>
                        <div className="space-y-2">
                            {launchItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${item.done ? 'border-[#C9A84C]/25 bg-[#C9A84C]/10' : 'border-white/10 bg-white/[0.03] hover:border-[#C9A84C]/35'}`}
                                >
                                    <span className="flex items-center gap-3 text-sm font-semibold text-[#FAF7F0]">
                                        <CheckCircle2 size={16} className={item.done ? 'text-[#C9A84C]' : 'text-[#666]'} />
                                        {item.label}
                                    </span>
                                    {item.muted && <span className="text-[10px] font-bold uppercase tracking-wider text-[#777]">Luego</span>}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-4">
                <WriterMetric icon={BookOpen} label="Capitulos publicados" value={published.length} sub={`${drafts.length} borradores`} />
                <WriterMetric icon={Users} label="Suscriptores" value={entitlements?.length || 0} sub={`$${creator?.subscription_price || 5}/mes`} />
                <WriterMetric icon={TrendingUp} label="Palabras publicadas" value={totalWords.toLocaleString('en-US')} sub="Inventario narrativo" />
                <WriterMetric icon={WalletCards} label="Gifts recibidos" value={`$${giftRevenue.toFixed(2)}`} sub="Antes de fees Stripe" />
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
                <div className="rounded-2xl border border-gray-800 bg-[#15171C]">
                    <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
                        <div>
                            <h2 className="text-lg font-black text-white">Tus historias activas</h2>
                            <p className="text-xs text-gray-500">Vista rapida inspirada en plataformas de autores: estado, palabras y monetizacion.</p>
                        </div>
                        <Link href="/dashboard/episodes" className="text-xs font-bold text-[#C9A84C] hover:text-[#D8BA63]">Gestionar todo</Link>
                    </div>
                    <div className="divide-y divide-gray-800">
                        {(episodes || []).slice(0, 5).map((episode: any) => (
                            <div key={episode.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="truncate font-bold text-white">{episode.title}</h3>
                                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${episode.is_published ? 'bg-[#C9A84C]/15 text-[#C9A84C]' : 'bg-gray-800 text-gray-400'}`}>
                                            {episode.is_published ? 'Publicado' : 'Borrador'}
                                        </span>
                                    </div>
                                    <p className="mt-1 truncate text-xs text-gray-500">{episode.seasons?.title || 'Historia independiente'} · {new Date(episode.created_at).toLocaleDateString('es-ES')}</p>
                                </div>
                                <div className="flex items-center gap-5 text-sm text-gray-400">
                                    <span>{Number(episode.word_count || 0).toLocaleString('en-US')} palabras</span>
                                    <span>{episode.is_subscription_only ? 'Subs' : episode.ppv_price ? `$${episode.ppv_price}` : 'Gratis'}</span>
                                </div>
                                <Link href={`/dashboard/episodes/${episode.id}/edit`} className="text-sm font-bold text-gray-300 hover:text-white">Editar</Link>
                            </div>
                        ))}
                        {(!episodes || episodes.length === 0) && (
                            <div className="px-5 py-12 text-center">
                                <p className="font-bold text-white">Todavia no tienes capitulos.</p>
                                <Link href="/dashboard/episodes/new" className="mt-4 inline-flex rounded-lg bg-[#C9A84C] px-5 py-2 text-sm font-black text-[#0D0D0D]">Crear primer capitulo</Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-800 bg-[#15171C] p-5">
                    <div className="flex items-center gap-2 text-[#C9A84C]">
                        <Sparkles size={18} />
                        <h2 className="font-black text-white">Proxima mejor accion</h2>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-gray-400">
                        {published.length === 0
                            ? 'Publica tu primer capítulo. Es gratis para los lectores y es lo que te hace visible.'
                            : !hasPaidChapter
                                ? 'Ya tienes el gancho. Publica la continuación de pago.'
                                : 'Mejora la portada y el adelanto de tus capítulos, y publica con regularidad.'}
                    </p>
                </div>
            </section>
        </div>
    )
}

function WriterMetric({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub: string }) {
    return (
        <div className="rounded-2xl border border-gray-800 bg-[#15171C] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A84C]/10 text-[#C9A84C]">
                <Icon size={18} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-white">{value}</p>
            <p className="mt-1 text-xs text-gray-500">{sub}</p>
        </div>
    )
}

function ListProgress({ percent }: { percent: number }) {
    return (
        <div className="relative h-14 w-14 rounded-full bg-[#222]">
            <div
                className="absolute inset-0 rounded-full"
                style={{ background: `conic-gradient(#C9A84C ${percent * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
            />
            <div className="absolute inset-1 flex items-center justify-center rounded-full bg-[#0D0D0D] text-xs font-black text-[#FAF7F0]">
                {percent}%
            </div>
        </div>
    )
}

export default async function DashboardHome() {
    const supabase = await createClient()
    const { data: { user: viewer } } = await supabase.auth.getUser()
    const tFeed = await getTranslations('feed')
    const tComments = await getTranslations('comments')
    const locale = await getLocale()
    const timeAgo = makeTimeAgo(locale, tComments)
    const badgeLabels: Record<string, React.ReactNode> = {
        free: tFeed('chip_first_free'),
        series: <><Play size={10} fill="currentColor" className="inline mr-1" /> {tFeed('chip_series')}</>,
        top: <><Crown size={10} className="inline mr-1" /> {tFeed('chip_top_gifted')}</>,
        exclusive: <><Lock size={10} className="inline mr-1" /> {tFeed('exclusive_badge')}</>,
    }

    if (viewer) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, username')
            .eq('id', viewer.id)
            .maybeSingle()

        if (profile?.role === 'creator') {
            return <WriterCommandCenter userId={viewer.id} username={profile.username} />
        }
    }

    // Episodios publicados (sin embed para evitar FK ambigua episodes.creator_id -> creators.profile_id)
    const { data: episodesRaw, error: epError } = await supabase
        .from('episodes')
        .select('id, title, preview_text, cover_image_url, is_subscription_only, ppv_price, created_at, creator_id')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(10)
    if (epError) console.error('[dashboard feed] episodes query failed:', epError.message)

    // Profiles de los autores en una segunda query, mergeamos en JS
    const creatorIds = Array.from(new Set((episodesRaw || []).map((e) => e.creator_id).filter(Boolean)))
    const profilesMap: Record<string, { username: string | null; full_name: string | null; avatar_url: string | null }> = {}
    if (creatorIds.length > 0) {
        const { data: profilesRows } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .in('id', creatorIds)
        profilesRows?.forEach((p) => {
            profilesMap[p.id] = { username: p.username, full_name: p.full_name, avatar_url: p.avatar_url }
        })
    }
    const episodes = (episodesRaw || []).map((ep) => ({
        ...ep,
        profiles: profilesMap[ep.creator_id] || null,
    }))

    const episodeIds = (episodesRaw || []).map((e) => e.id)
    const [{ data: gifts }, { data: feedReactions }, { data: feedComments }] = await Promise.all([
        supabase.from('gifts').select('post_id').eq('status', 'completed').in('post_id', episodeIds.length ? episodeIds : ['00000000-0000-0000-0000-000000000000']),
        supabase.from('reactions').select('episode_id').in('episode_id', episodeIds.length ? episodeIds : ['00000000-0000-0000-0000-000000000000']),
        supabase.from('comments').select('episode_id').in('episode_id', episodeIds.length ? episodeIds : ['00000000-0000-0000-0000-000000000000']),
    ])

    const giftCount: Record<string, number> = {}
    gifts?.forEach(g => { if (g.post_id) giftCount[g.post_id] = (giftCount[g.post_id] || 0) + 1 })
    // Contadores reales — antes el feed mostraba 0 likes / 0 comentarios fijo
    const reactionCount: Record<string, number> = {}
    feedReactions?.forEach(r => { reactionCount[r.episode_id] = (reactionCount[r.episode_id] || 0) + 1 })
    const commentCount: Record<string, number> = {}
    feedComments?.forEach(c => { commentCount[c.episode_id] = (commentCount[c.episode_id] || 0) + 1 })

    const realEpisodes = (episodes || []).map((ep: any) => ({
        id: ep.id,
        title: ep.title,
        chapter: null,
        cover: ep.cover_image_url,
        author: ep.profiles?.full_name || ep.profiles?.username || tFeed('fallback_author'),
        handle: ep.profiles?.username || tFeed('fallback_handle'),
        avatar: ep.profiles?.avatar_url,
        time: timeAgo(ep.created_at),
        reads: String(reactionCount[ep.id] || 0),
        comments: commentCount[ep.id] || 0,
        gifts: giftCount[ep.id] || 0,
        badges: [ep.is_subscription_only ? 'exclusive' : 'free'],
        hero: false,
        preview: ep.preview_text,
        realUrl: `/${ep.profiles?.username}/${ep.id}`,
        creatorId: ep.creator_id,            // para isOwner check
        isReal: true,                        // distingue de mocks
    }))
    const feed = realEpisodes.slice(0, 8)
    if (feed.length > 0) feed[0].hero = true

    return (
        <div className="w-full">
            <div className="px-8 pt-6">
                <FeedTabs />
            </div>

            <div className="max-w-3xl mx-auto px-6">
                {/* Continúa donde lo dejaste */}
                <ReaderStartPanel />
                <ResumeReading />
            </div>

            <div className="max-w-3xl mx-auto space-y-6 px-6 pb-20">
                {feed.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[#2D2D2D] bg-[#1E1E1E] p-10 text-center">
                        <p className="font-serif text-2xl font-black text-white">Aún no hay capítulos publicados.</p>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                            Cuando sigas a escritores, sus capítulos aparecerán aquí. Empieza explorando.
                        </p>
                        <Link href="/discover" className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-[#C9A84C] px-5 text-sm font-black text-[#0D0D0D] hover:bg-[#D8BA63]">
                            Explorar escritores
                        </Link>
                    </div>
                )}
                {feed.map((ep: any, idx: number) => {
                    const href = ep.realUrl || `/${ep.handle}`
                    const AvatarFallback = () => (
                        <div className="w-full h-full flex items-center justify-center bg-[#2A2418]/40 text-[#D8BA63] font-bold text-sm">
                            {(ep.author || '?').charAt(0).toUpperCase()}
                        </div>
                    )

                    // Hero card for first item
                    if (idx === 0 && ep.hero) {
                        const isOwnerHero = !!(ep.isReal && viewer && ep.creatorId === viewer.id)
                        return (
                            <article key={ep.id} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl overflow-hidden shadow-2xl relative">
                                {/* Kebab — overlay sobre cover, top-right */}
                                {ep.isReal && (
                                    <div className="absolute top-4 right-4 z-20">
                                        <EpisodeKebab
                                            episodeId={ep.id}
                                            episodeUrl={ep.realUrl}
                                            episodeTitle={ep.title}
                                            isOwner={isOwnerHero}
                                            isAuthenticated={!!viewer}
                                            creatorUsername={ep.handle}
                                            variant="overlay"
                                            align="right"
                                        />
                                    </div>
                                )}
                                <Link href={href} className="block">
                                    <div className="relative h-96 sm:h-[400px]" style={ep.cover ? {} : { background: 'linear-gradient(135deg, #14532d, #052e16)' }}>
                                        {ep.cover && (
                                            <img className="w-full h-full object-cover opacity-80" src={ep.cover} alt={ep.title} />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 w-full p-6">
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {ep.badges.map((b: string) => <Badge key={b} type={b} labels={badgeLabels} />)}
                                            </div>
                                            <h2 className="text-3xl font-bold text-white mb-2 leading-tight drop-shadow-md">{ep.title}</h2>
                                            {ep.chapter && (
                                                <p className="text-gray-300 text-sm mb-4 drop-shadow-md">{ep.chapter}</p>
                                            )}

                                            <div className="flex items-center justify-between flex-wrap gap-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-9 h-9 rounded-full border border-gray-600 overflow-hidden bg-[#15171C]">
                                                        {ep.avatar ? <img className="w-full h-full object-cover" src={ep.avatar} alt="" /> : <AvatarFallback />}
                                                    </div>
                                                    <span className="text-sm font-medium text-white">{ep.author}</span>
                                                    <span className="text-xs text-gray-500">· {ep.time}</span>
                                                </div>
                                                <div className="flex items-center space-x-4 text-xs font-medium text-gray-300">
                                                    <span className="flex items-center"><Heart size={14} className="mr-1.5 text-red-500" /> {ep.reads}</span>
                                                    <span className="flex items-center"><MessageCircle size={14} className="mr-1.5 text-gray-400" /> {ep.comments}</span>
                                                    <span className="flex items-center"><Gift size={14} className="mr-1.5 text-yellow-500" /> {ep.gifts}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                <div className="p-5 bg-[#242424] border-t border-[#333]">
                                    <Link href={href}>
                                        <button className="w-full bg-[#C9A84C] hover:bg-[#D8BA63] text-[#0D0D0D] font-bold py-3.5 rounded-xl transition text-base tracking-wide shadow-lg border border-[#C9A84C]/20">
                                            {tFeed('read_episode')}
                                        </button>
                                    </Link>
                                </div>
                            </article>
                        )
                    }

                    // Compact card
                    return (
                        <article key={ep.id} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl overflow-hidden shadow-2xl p-6 hover:border-[#3D3D3D] transition">
                            <div className="flex items-center justify-between mb-4">
                                <Link href={`/${ep.handle}`} className="flex items-center space-x-3 group">
                                    <div className="w-12 h-12 rounded-full border border-gray-600 overflow-hidden bg-[#15171C] group-hover:border-[#C9A84C] transition">
                                        {ep.avatar ? <img className="w-full h-full object-cover" src={ep.avatar} alt="" /> : <AvatarFallback />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-[#D8BA63] transition">{ep.author}</h3>
                                        <p className="text-xs text-gray-500">{ep.time} · @{ep.handle}</p>
                                    </div>
                                </Link>
                                {ep.isReal ? (
                                    <EpisodeKebab
                                        episodeId={ep.id}
                                        episodeUrl={ep.realUrl}
                                        episodeTitle={ep.title}
                                        isOwner={!!(viewer && ep.creatorId === viewer.id)}
                                        isAuthenticated={!!viewer}
                                        creatorUsername={ep.handle}
                                        align="right"
                                    />
                                ) : (
                                    <span className="text-gray-700"><MoreHorizontal size={20} /></span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {ep.badges.map((b: string) => <Badge key={b} type={b} labels={badgeLabels} />)}
                            </div>

                            <Link href={href}>
                                <h2 className="text-xl font-bold text-white mb-2 leading-snug hover:text-[#D8BA63] transition">{ep.title}</h2>
                            </Link>
                            {ep.preview && (
                                <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">{ep.preview}</p>
                            )}

                            {ep.cover && (
                                <Link href={href}>
                                    <div className="w-full h-56 rounded-xl overflow-hidden mb-4 bg-[#0A0B0E] border border-gray-800 relative group">
                                        <img src={ep.cover} alt="" className="w-full h-full object-cover transition group-hover:scale-105" />
                                        {ep.badges.includes('exclusive') && !ep.badges.includes('free') && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2">
                                                    <Lock size={16} className="text-[#D8BA63]" />
                                                    <span className="text-[#D8BA63] font-bold text-sm">{tFeed('subscribers_only')}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                <div className="flex items-center gap-5 text-xs text-gray-400">
                                    <span className="flex items-center gap-1.5 hover:text-red-500 cursor-pointer transition">
                                        <Heart size={14} /> {ep.reads}
                                    </span>
                                    <span className="flex items-center gap-1.5 hover:text-white cursor-pointer transition">
                                        <MessageCircle size={14} /> {ep.comments}
                                    </span>
                                    <span className="flex items-center gap-1.5 hover:text-yellow-500 cursor-pointer transition">
                                        <Gift size={14} /> {ep.gifts}
                                    </span>
                                </div>
                                <Link href={href} className="text-xs font-bold text-[#C9A84C] hover:text-[#D8BA63] transition">
                                    {tFeed('read_short')}
                                </Link>
                            </div>
                        </article>
                    )
                })}
            </div>
        </div>
    )
}

function ReaderStartPanel() {
    return (
        <section className="mb-5 grid gap-3 sm:grid-cols-3">
            <Link href="/discover" className="rounded-2xl border border-[#2D2D2D] bg-[#1E1E1E] p-4 transition hover:border-[#C9A84C]/50">
                <Compass className="mb-3 text-[#C9A84C]" size={18} />
                <p className="text-sm font-black text-white">Descubrir voces</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">Historias por emocion, tema y persona.</p>
            </Link>
            <Link href="/dashboard/subscriptions" className="rounded-2xl border border-[#2D2D2D] bg-[#1E1E1E] p-4 transition hover:border-[#C9A84C]/50">
                <Crown className="mb-3 text-[#C9A84C]" size={18} />
                <p className="text-sm font-black text-white">Mis escritores</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">Tu biblioteca de personas a las que apoyas.</p>
            </Link>
            <Link href="/dashboard/history" className="rounded-2xl border border-[#2D2D2D] bg-[#1E1E1E] p-4 transition hover:border-[#C9A84C]/50">
                <BookOpen className="mb-3 text-[#C9A84C]" size={18} />
                <p className="text-sm font-black text-white">Historial</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">Pagos, regalos y actividad reciente.</p>
            </Link>
        </section>
    )
}



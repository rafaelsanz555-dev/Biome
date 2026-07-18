import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, CheckCircle2, MapPin, PenLine, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { FollowButton } from '@/components/FollowButton'
import { ReportButton } from '@/components/ReportButton'
import { ThemeProvider, extractTheme } from '@/components/theme/ThemeProvider'
import { ProfileContentTabs } from '@/components/content/ProfileContentTabs'
import { getTranslations } from 'next-intl/server'

interface ProfilePageProps {
    params: Promise<{ username: string }>
}

export default async function CreatorProfilePage({ params }: ProfilePageProps) {
    const { username } = await params
    const supabase = await createClient()
    const t = await getTranslations('profile_public')

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, creators!profile_id(subscription_price, accent_color, font_family, card_style, brand_tagline, posting_frequency, frequency_promise, series_status, is_verified_storyteller, verification_method, why_i_write, theme_id, themes(id, slug, name, description, type, style, config, is_animated))')
        .eq('username', username.toLowerCase())
        .maybeSingle()
    if (error || !profile || profile.role !== 'creator') notFound()

    const creator = Array.isArray(profile.creators) ? profile.creators[0] : profile.creators
    const { theme, fallback } = extractTheme(creator)

    const { data: legacyEpisodes } = await supabase
        .from('episodes')
        .select('id, title, preview_text, cover_image_url, created_at, season_id, seasons(id, title, description, slug, tagline, promise, format)')
        .eq('creator_id', profile.id)
        .eq('is_published', true)
        .order('created_at', { ascending: true })

    const episodes = (legacyEpisodes || []).map((episode: any) => ({
        ...episode,
        age_rating: 'all',
        content_warnings: [] as string[],
    }))
    const episodeIds = episodes.map((episode) => episode.id)

    if (episodeIds.length) {
        const { data: editorialMeta } = await supabase
            .from('episodes')
            .select('id, age_rating, content_warnings')
            .in('id', episodeIds)
        editorialMeta?.forEach((meta: any) => {
            const target = episodes.find((episode) => episode.id === meta.id)
            if (target) {
                target.age_rating = meta.age_rating || 'all'
                target.content_warnings = meta.content_warnings || []
            }
        })
    }

    const { data: { user } } = await supabase.auth.getUser()
    const isOwnProfile = user?.id === profile.id

    const [{ count: followerCount }, { data: creatorFollow }, { data: reactions }] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('creator_id', profile.id),
        user
            ? supabase.from('follows').select('creator_id').eq('follower_id', user.id).eq('creator_id', profile.id).maybeSingle()
            : Promise.resolve({ data: null }),
        episodeIds.length
            ? supabase.from('reactions').select('episode_id, user_id').in('episode_id', episodeIds)
            : Promise.resolve({ data: [] as { episode_id: string; user_id: string }[] }),
    ])

    const likeCountByEpisode: Record<string, number> = {}
    const likedByEpisode: Record<string, boolean> = {}
    reactions?.forEach((reaction: any) => {
        likeCountByEpisode[reaction.episode_id] = (likeCountByEpisode[reaction.episode_id] || 0) + 1
        if (user?.id === reaction.user_id) likedByEpisode[reaction.episode_id] = true
    })

    const entries = episodes.filter((episode) => !episode.season_id)
    const workMap = new Map<string, any>()
    episodes.filter((episode) => episode.season_id).forEach((episode: any) => {
        const season = Array.isArray(episode.seasons) ? episode.seasons[0] : episode.seasons
        if (!season) return
        const current = workMap.get(season.id) || {
            id: season.id,
            title: season.title,
            slug: season.slug,
            description: season.description || season.promise,
            format: season.format || 'series',
            storyType: 'life_story',
            coverUrl: null,
            initialFollowing: false,
            episodes: [],
        }
        current.episodes.push(episode)
        if (!current.coverUrl && episode.cover_image_url) current.coverUrl = episode.cover_image_url
        workMap.set(season.id, current)
    })
    const works = Array.from(workMap.values())

    if (works.length) {
        const workIds = works.map((work) => work.id)
        const [{ data: workMeta }, { data: storyFollows }] = await Promise.all([
            supabase.from('seasons').select('id, story_type, cover_image_url').in('id', workIds),
            user
                ? supabase.from('story_follows').select('season_id').eq('follower_id', user.id).in('season_id', workIds)
                : Promise.resolve({ data: [] as { season_id: string }[] }),
        ])
        workMeta?.forEach((meta: any) => {
            const work = works.find((item) => item.id === meta.id)
            if (work) {
                work.storyType = meta.story_type || 'life_story'
                work.coverUrl = meta.cover_image_url || work.coverUrl
            }
        })
        const followedIds = new Set(storyFollows?.map((item: any) => item.season_id) || [])
        works.forEach((work) => { work.initialFollowing = followedIds.has(work.id) })
    }

    const saved: any[] = []
    if (isOwnProfile && user) {
        const { data: bookmarks } = await supabase
            .from('reading_bookmarks')
            .select('episode_id, reached_percent')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(30)

        const savedEpisodeIds = bookmarks?.map((bookmark) => bookmark.episode_id) || []
        const { data: savedEpisodes } = savedEpisodeIds.length
            ? await supabase
                .from('episodes')
                .select('id, title, preview_text, cover_image_url, created_at, season_id, creator_id')
                .in('id', savedEpisodeIds)
                .eq('is_published', true)
            : { data: [] }
        const savedCreatorIds = Array.from(new Set((savedEpisodes || []).map((episode) => episode.creator_id)))
        const { data: savedAuthors } = savedCreatorIds.length
            ? await supabase.from('profiles').select('id, username, full_name').in('id', savedCreatorIds)
            : { data: [] }
        const savedEpisodesById = new Map((savedEpisodes || []).map((episode) => [episode.id, episode]))
        const savedAuthorsById = new Map((savedAuthors || []).map((author) => [author.id, author]))

        bookmarks?.forEach((bookmark) => {
            const episode = savedEpisodesById.get(bookmark.episode_id)
            if (!episode) return
            const author = savedAuthorsById.get(episode.creator_id)
            saved.push({
                ...episode,
                username: author?.username || profile.username,
                authorName: author?.full_name || author?.username || t('pergamo_author'),
                reachedPercent: Number(bookmark.reached_percent || 0),
            })
        })
    }

    const authorName = profile.full_name || profile.username
    const initial = authorName.charAt(0).toUpperCase()
    const latest = episodes.at(-1)
    const postingLabel = creator?.frequency_promise || creator?.posting_frequency || (latest ? t('publishing') : t('preparing'))

    return (
        <div className="min-h-screen bg-[#F8F4EA] text-[#171512]">
            <Navbar />

            <ThemeProvider theme={theme} fallbackBranding={fallback} className="border-b border-[#171512]/10 bg-[#EDE3D1]">
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,244,234,0.96),rgba(248,244,234,0.78),rgba(248,244,234,0.35))]" />
                    <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-7 sm:py-14">
                        <div className="grid items-start gap-7 md:grid-cols-[132px_1fr_auto]">
                            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-[#F8F4EA] bg-[var(--brand-accent,#A63D2D)] shadow-xl sm:h-32 sm:w-32">
                                {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center font-serif text-4xl font-black text-white">{initial}</span>}
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="font-serif text-4xl font-black leading-none text-[#171512] sm:text-5xl">{authorName}</h1>
                                    {creator?.is_verified_storyteller && <span title={t('verified')} className="text-[var(--brand-accent,#A63D2D)]"><CheckCircle2 size={19} fill="currentColor" className="text-white" /></span>}
                                </div>
                                <p className="mt-2 text-sm font-bold text-[#776E61]">@{profile.username}{profile.country_code ? ` · ${profile.country_code}` : ''}</p>
                                {creator?.brand_tagline && <p className="mt-4 max-w-2xl font-serif text-xl font-bold italic text-[var(--brand-accent,#A63D2D)]">{creator.brand_tagline}</p>}
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5F574B]">{profile.bio || creator?.why_i_write || t('new_voice')}</p>
                                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[#746A5C]">
                                    <span><strong className="text-[#171512]">{followerCount || 0}</strong> {t('followers')}</span>
                                    <span><strong className="text-[#171512]">{entries.length}</strong> {t('entries')}</span>
                                    <span><strong className="text-[#171512]">{works.length}</strong> {t('works')}</span>
                                    <span className="inline-flex items-center gap-1"><PenLine size={12} /> {postingLabel}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 md:justify-end">
                                {isOwnProfile ? (
                                    <Link href="/dashboard/settings" className="inline-flex h-10 items-center justify-center rounded-full bg-[#171512] px-5 text-xs font-black text-white">{t('customize')}</Link>
                                ) : (
                                    <FollowButton targetType="creator" targetId={profile.id} initialFollowing={!!creatorFollow} isAuthenticated={!!user} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[var(--brand-accent,#A63D2D)] px-5 text-xs font-black text-white" />
                                )}
                                {!isOwnProfile && <ReportButton targetType="profile" targetId={profile.id} compact />}
                            </div>
                        </div>

                        <div className="mt-8 grid gap-3 border-t border-[#171512]/10 pt-5 sm:grid-cols-3">
                            <TrustItem icon={ShieldCheck} label={creator?.is_verified_storyteller ? t('identity_verified') : t('public_profile')} />
                            <TrustItem icon={BookOpen} label={works.length ? t('works_in_progress', { count: works.length }) : t('independent_entries')} />
                            <TrustItem icon={MapPin} label={profile.story_themes?.slice(0, 2).join(' · ') || t('original_voice')} />
                        </div>
                    </div>
                </section>
            </ThemeProvider>

            <main className="mx-auto max-w-5xl px-4 py-9 pb-24 sm:px-6">
                <ProfileContentTabs
                    entries={entries}
                    works={works}
                    saved={saved}
                    username={profile.username}
                    authorName={authorName}
                    avatarUrl={profile.avatar_url}
                    isOwner={isOwnProfile}
                    isAuthenticated={!!user}
                    likedByEpisode={likedByEpisode}
                    likeCountByEpisode={likeCountByEpisode}
                />
            </main>
        </div>
    )
}

function TrustItem({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
    return <div className="flex items-center gap-2 text-xs font-bold text-[#655C4F]"><Icon size={14} className="text-[var(--brand-accent,#A63D2D)]" /> {label}</div>
}

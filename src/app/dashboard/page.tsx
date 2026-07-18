import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, BookOpen, CheckCircle2, Compass, FileText, Heart, TrendingUp, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EditorialEpisodeCard } from '@/components/content/EditorialEpisodeCard'
import { ResumeReading } from '@/components/reader/ResumeReading'
import { getLocale, getTranslations } from 'next-intl/server'

export default async function DashboardHome() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, username, full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle()

    if (profile?.role === 'creator') {
        return <WriterHome userId={user.id} username={profile.username} name={profile.full_name || profile.username} avatarUrl={profile.avatar_url} />
    }
    return <ReaderHome userId={user.id} />
}

async function WriterHome({ userId, username, name, avatarUrl }: { userId: string; username: string; name: string; avatarUrl?: string | null }) {
    const supabase = await createClient()
    const t = await getTranslations('dashboard_home')
    const locale = await getLocale()
    const [{ data: episodes }, { count: followers }] = await Promise.all([
        supabase
            .from('episodes')
            .select('id, title, preview_text, cover_image_url, is_published, created_at, season_id, chapter_number, word_count, seasons(id, title)')
            .eq('creator_id', userId)
            .order('created_at', { ascending: false }),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('creator_id', userId),
    ])

    const all = episodes || []
    const published = all.filter((episode: any) => episode.is_published)
    const entries = published.filter((episode: any) => !episode.season_id)
    const chapters = published.filter((episode: any) => episode.season_id)
    const workIds = new Set(chapters.map((episode: any) => episode.season_id))
    const words = published.reduce((sum: number, episode: any) => sum + Number(episode.word_count || 0), 0)
    const { data: reactions } = all.length
        ? await supabase.from('reactions').select('episode_id').in('episode_id', all.map((episode: any) => episode.id))
        : { data: [] }
    const reactionCount: Record<string, number> = {}
    reactions?.forEach((reaction: any) => { reactionCount[reaction.episode_id] = (reactionCount[reaction.episode_id] || 0) + 1 })
    const checklist = [
        { label: t('checklist_first_entry'), done: entries.length > 0, href: '/dashboard/episodes/new' },
        { label: t('checklist_create_story'), done: workIds.size > 0, href: '/dashboard/episodes/new' },
        { label: t('checklist_three_posts'), done: published.length >= 3, href: '/dashboard/episodes/new' },
        { label: t('checklist_customize_profile'), done: Boolean(avatarUrl), href: '/dashboard/settings' },
    ]
    const progress = Math.round((checklist.filter((item) => item.done).length / checklist.length) * 100)

    return (
        <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 pb-24 sm:px-6 lg:px-8">
            <section className="grid overflow-hidden border border-[#171512]/12 bg-[#FFFCF5] lg:grid-cols-[1.2fr_0.8fr]">
                <div className="p-7 sm:p-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A63D2D]">{t('writer_kicker', { name })}</p>
                    <h1 className="mt-4 max-w-2xl font-serif text-4xl font-black leading-[1.02] text-[#171512] sm:text-6xl">{t('writer_title')}</h1>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-[#655C4F]">{t('writer_description')}</p>
                    <div className="mt-7 flex flex-wrap gap-2">
                        <Link href="/dashboard/episodes/new" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#A63D2D] px-5 text-xs font-black text-white"><FileText size={14} /> {t('new_entry')}</Link>
                        <Link href="/dashboard/episodes/new" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#171512]/15 px-5 text-xs font-black text-[#171512]"><BookOpen size={14} /> {t('new_chapter')}</Link>
                        <Link href={`/${username}`} className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-xs font-black text-[#A63D2D]">{t('view_profile')} <ArrowRight size={14} /></Link>
                    </div>
                </div>
                <div className="border-t border-[#171512]/10 bg-[#171512] p-7 text-[#F8F4EA] lg:border-l lg:border-t-0 sm:p-9">
                    <div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D4B963]">{t('preparation')}</p><strong className="font-serif text-3xl">{progress}%</strong></div>
                    <div className="mt-5 h-1.5 overflow-hidden bg-white/10"><div className="h-full bg-[#D4B963]" style={{ width: `${progress}%` }} /></div>
                    <div className="mt-6 space-y-3">
                        {checklist.map((item) => (
                            <Link key={item.label} href={item.href} className="flex items-center gap-3 border-b border-white/10 pb-3 text-sm font-bold text-white/85">
                                <CheckCircle2 size={16} className={item.done ? 'text-[#D4B963]' : 'text-white/25'} />
                                <span className="flex-1">{item.label}</span>
                                <ArrowRight size={13} className="text-white/30" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-2 gap-px border-y border-[#171512]/12 bg-[#171512]/12 md:grid-cols-4">
                <Metric label={t('metric_entries')} value={entries.length} icon={FileText} />
                <Metric label={t('metric_chapters')} value={chapters.length} icon={BookOpen} />
                <Metric label={t('metric_followers')} value={followers || 0} icon={Users} />
                <Metric label={t('metric_words')} value={words.toLocaleString(locale)} icon={TrendingUp} />
            </section>

            <section>
                <div className="flex items-end justify-between gap-4 border-b border-[#171512]/12 pb-4">
                    <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#A63D2D]">{t('library_kicker')}</p><h2 className="mt-1 font-serif text-3xl font-black text-[#171512]">{t('recent_publications')}</h2></div>
                    <Link href="/dashboard/episodes" className="text-xs font-black text-[#A63D2D]">{t('manage_all')}</Link>
                </div>
                <div className="mt-6 space-y-5">
                    {all.slice(0, 6).map((episode: any, index: number) => {
                        const season = Array.isArray(episode.seasons) ? episode.seasons[0] : episode.seasons
                        return (
                            <div key={episode.id} className={!episode.is_published ? 'opacity-65' : ''}>
                                <EditorialEpisodeCard episode={episode} username={username} authorName={name} avatarUrl={avatarUrl} workTitle={season?.title || null} chapterNumber={episode.season_id ? Number(episode.chapter_number || index + 1) : null} isOwner isAuthenticated initialLikeCount={reactionCount[episode.id] || 0} />
                                {!episode.is_published && <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#8A8174]">{t('private_draft')}</p>}
                            </div>
                        )
                    })}
                    {!all.length && <EmptyFeed title={t('empty_writer_title')} text={t('empty_writer_text')} href="/dashboard/episodes/new" label={t('start_writing')} />}
                </div>
            </section>
        </div>
    )
}

async function ReaderHome({ userId }: { userId: string }) {
    const supabase = await createClient()
    const t = await getTranslations('dashboard_home')
    const { data: episodesRaw } = await supabase
        .from('episodes')
        .select('id, title, preview_text, cover_image_url, created_at, season_id, chapter_number, creator_id, seasons(id, title)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(20)

    const creatorIds = Array.from(new Set((episodesRaw || []).map((episode: any) => episode.creator_id)))
    const [{ data: profiles }, { data: reactions }] = await Promise.all([
        creatorIds.length ? supabase.from('profiles').select('id, username, full_name, avatar_url').in('id', creatorIds) : Promise.resolve({ data: [] }),
        episodesRaw?.length ? supabase.from('reactions').select('episode_id, user_id').in('episode_id', episodesRaw.map((episode: any) => episode.id)) : Promise.resolve({ data: [] }),
    ])
    const profilesById = Object.fromEntries((profiles || []).map((profile: any) => [profile.id, profile]))
    const likeCount: Record<string, number> = {}
    const likedByMe: Record<string, boolean> = {}
    reactions?.forEach((reaction: any) => {
        likeCount[reaction.episode_id] = (likeCount[reaction.episode_id] || 0) + 1
        if (reaction.user_id === userId) likedByMe[reaction.episode_id] = true
    })

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6">
            <section className="mb-8 flex flex-col gap-4 border-b border-[#171512]/12 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A63D2D]">{t('reader_kicker')}</p><h1 className="mt-2 font-serif text-4xl font-black text-[#171512]">{t('reader_title')}</h1></div>
                <Link href="/discover" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#171512] px-4 text-xs font-black text-white"><Compass size={14} /> {t('discover')}</Link>
            </section>

            <ResumeReading />

            <div className="mt-7 space-y-5">
                {(episodesRaw || []).map((episode: any) => {
                    const author = profilesById[episode.creator_id]
                    if (!author?.username) return null
                    const season = Array.isArray(episode.seasons) ? episode.seasons[0] : episode.seasons
                    const chapterNumber = episode.season_id ? Number(episode.chapter_number || 1) : null
                    return <EditorialEpisodeCard key={episode.id} episode={episode} username={author.username} authorName={author.full_name || author.username} avatarUrl={author.avatar_url} workTitle={season?.title || null} chapterNumber={chapterNumber} isOwner={false} isAuthenticated initialLiked={!!likedByMe[episode.id]} initialLikeCount={likeCount[episode.id] || 0} />
                })}
                {!episodesRaw?.length && <EmptyFeed title={t('empty_reader_title')} text={t('empty_reader_text')} href="/discover" label={t('explore_writers')} />}
            </div>
        </div>
    )
}

function Metric({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
    return <div className="bg-[#F8F4EA] p-5"><Icon size={15} className="text-[#A63D2D]" /><p className="mt-3 font-serif text-3xl font-black text-[#171512]">{value}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#8A8174]">{label}</p></div>
}

function EmptyFeed({ title, text, href, label }: { title: string; text: string; href: string; label: string }) {
    return <div className="border border-dashed border-[#171512]/15 bg-white/35 px-6 py-14 text-center"><Heart size={22} className="mx-auto text-[#A63D2D]" /><h3 className="mt-3 font-serif text-2xl font-black text-[#171512]">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#746A5C]">{text}</p><Link href={href} className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-[#171512] px-4 text-xs font-black text-white">{label} <ArrowRight size={13} /></Link></div>
}

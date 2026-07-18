import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'

export async function ResumeReading() {
    const supabase = await createClient()
    const t = await getTranslations('dashboard_home')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: bookmarks, error } = await supabase
        .from('reading_bookmarks')
        .select('episode_id, reached_percent, completed, updated_at')
        .eq('user_id', user.id)
        .gt('reached_percent', 5)
        .order('updated_at', { ascending: false })
        .limit(12)

    if (error || !bookmarks?.length) return null

    const episodeIds = bookmarks.map((bookmark) => bookmark.episode_id)
    const { data: bookmarkedEpisodes } = await supabase
        .from('episodes')
        .select('id, title, cover_image_url, season_id, chapter_number, created_at, creator_id')
        .in('id', episodeIds)
        .eq('is_published', true)
    const episodesById = new Map((bookmarkedEpisodes || []).map((episode) => [episode.id, episode]))

    const completedSeasonIds = Array.from(new Set(bookmarks
        .map((bookmark) => ({ bookmark, episode: episodesById.get(bookmark.episode_id) }))
        .filter(({ bookmark, episode }) => bookmark.completed && episode?.season_id)
        .map(({ episode }) => episode!.season_id)))
    const { data: seasonEpisodes } = completedSeasonIds.length
        ? await supabase
            .from('episodes')
            .select('id, title, cover_image_url, season_id, chapter_number, created_at, creator_id')
            .in('season_id', completedSeasonIds)
            .eq('is_published', true)
            .order('created_at', { ascending: true })
        : { data: [] }

    const resumable = bookmarks.flatMap((bookmark) => {
        const current = episodesById.get(bookmark.episode_id)
        if (!current) return []
        if (!bookmark.completed) return [{ ...bookmark, displayEpisode: current }]
        const next = (seasonEpisodes || []).find((candidate: any) =>
            candidate.season_id === current.season_id && (
                Number(candidate.chapter_number || 0) > Number(current.chapter_number || 0)
                || (!candidate.chapter_number && new Date(candidate.created_at) > new Date(current.created_at))
            ))
        return next ? [{ ...bookmark, reached_percent: 0, displayEpisode: next, continuingNext: true }] : []
    }).slice(0, 4)

    if (!resumable.length) return null

    const creatorIds = Array.from(new Set(resumable.map((bookmark: any) => bookmark.displayEpisode.creator_id)))
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', creatorIds)
    const profilesById = Object.fromEntries((profiles || []).map((profile) => [profile.id, profile]))

    return (
        <section className="mb-8 border-y border-[#171512]/12 bg-[#FFFCF5] px-5 py-6 sm:px-7">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-[#A63D2D]" />
                    <h3 className="font-serif text-xl font-black text-[#171512]">{t('continue_reading')}</h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#8A8174]">{t('reading_count', { count: resumable.length })}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {resumable.map((bookmark: any) => {
                    const episode = bookmark.displayEpisode
                    if (!episode) return null
                    const profile = profilesById[episode.creator_id]
                    const username = profile?.username
                    const author = profile?.full_name || username
                    if (!username) return null
                    return (
                        <Link key={episode.id} href={`/${username}/${episode.id}`} className="group flex gap-3 border border-[#171512]/10 bg-[#F8F4EA] p-3 transition hover:border-[#A63D2D]/30">
                            <div className="h-16 w-12 shrink-0 overflow-hidden bg-[#DED6C7]">
                                {episode.cover_image_url ? <img src={episode.cover_image_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-[#D8C8A4]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 font-serif text-sm font-black text-[#171512] transition group-hover:text-[#A63D2D]">{episode.title}</p>
                                <p className="mt-0.5 text-[11px] text-[#746A5C]">{author}</p>
                                {bookmark.continuingNext && <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#A63D2D]">{t('next_chapter')}</p>}
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="h-1 flex-1 overflow-hidden bg-[#171512]/10">
                                        <div className="h-full bg-[#A63D2D]" style={{ width: `${bookmark.reached_percent}%` }} />
                                    </div>
                                    <span className="font-mono text-[10px] text-[#746A5C]">{Math.round(bookmark.reached_percent)}%</span>
                                </div>
                            </div>
                            <ArrowRight size={14} className="self-center shrink-0 text-[#9A9082] transition group-hover:text-[#A63D2D]" />
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}

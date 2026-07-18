'use client'

import Link from 'next/link'
import { BookOpen, Clock3, FileText, ShieldCheck } from 'lucide-react'
import { EpisodeFeedActions } from '@/components/EpisodeFeedActions'
import { useLocale, useTranslations } from 'next-intl'

export type EditorialEpisode = {
    id: string
    title: string
    preview_text?: string | null
    cover_image_url?: string | null
    created_at: string
    season_id?: string | null
    age_rating?: string | null
    content_warnings?: string[] | null
}

type Props = {
    episode: EditorialEpisode
    username: string
    authorName: string
    avatarUrl?: string | null
    workTitle?: string | null
    chapterNumber?: number | null
    isOwner: boolean
    isAuthenticated: boolean
    initialLiked?: boolean
    initialLikeCount?: number
    compact?: boolean
}

export function EditorialEpisodeCard({
    episode,
    username,
    authorName,
    avatarUrl,
    workTitle,
    chapterNumber,
    isOwner,
    isAuthenticated,
    initialLiked = false,
    initialLikeCount = 0,
    compact = false,
}: Props) {
    const t = useTranslations('content_cards')
    const locale = useLocale()
    const isChapter = Boolean(episode.season_id || workTitle)
    const href = `/${username}/${episode.id}`
    const date = new Date(episode.created_at).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
    const initial = authorName.charAt(0).toUpperCase()

    return (
        <article className={`overflow-hidden border border-[#171512]/12 bg-[#FFFCF5] shadow-[0_12px_35px_rgba(52,42,24,0.06)] ${compact ? '' : 'rounded-[6px]'}`}>
            {isChapter ? (
                <div className="grid gap-0 sm:grid-cols-[128px_1fr]">
                    <Link href={href} className="relative block min-h-48 overflow-hidden bg-[#263E58] sm:min-h-[205px]">
                        {episode.cover_image_url ? (
                            <img src={episode.cover_image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(145deg,#263E58,#101923)] text-white/50">
                                <BookOpen size={28} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/65">{workTitle || t('serial_story')}</p>
                        </div>
                    </Link>
                    <div className="flex min-w-0 flex-col">
                        <div className="flex-1 p-5 sm:p-6">
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.13em] text-[#A63D2D]">
                                <BookOpen size={13} />
                                <span>{t('chapter')} {chapterNumber || 1}</span>
                                <span className="text-[#9A9081]">·</span>
                                <span className="truncate text-[#776E61]">{workTitle}</span>
                            </div>
                            <Link href={href}>
                                <h3 className="mt-3 font-serif text-2xl font-black leading-tight text-[#171512] transition hover:text-[#A63D2D]">{episode.title}</h3>
                            </Link>
                            {episode.preview_text && <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#655C4F]">{episode.preview_text}</p>}
                            <MetaLine date={date} ageRating={episode.age_rating} warnings={episode.content_warnings} />
                        </div>
                        <EpisodeFeedActions episodeId={episode.id} episodeUrl={href} episodeTitle={episode.title} isOwner={isOwner} isAuthenticated={isAuthenticated} initialLiked={initialLiked} initialLikeCount={initialLikeCount} creatorUsername={username} variant="editorial" />
                    </div>
                </div>
            ) : (
                <>
                    <div className="p-5 sm:p-6">
                        <div className="flex items-center gap-3">
                            <Link href={`/${username}`} className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[#F1E7D4] bg-[#A63D2D]">
                                {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-xs font-black text-white">{initial}</span>}
                            </Link>
                            <div className="min-w-0 flex-1">
                                <Link href={`/${username}`} className="truncate text-sm font-black text-[#171512] hover:text-[#A63D2D]">{authorName}</Link>
                                <p className="mt-0.5 text-[11px] font-semibold text-[#8A8174]">@{username} · {date}</p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#A63D2D]/8 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-[#A63D2D]">
                                <FileText size={11} /> {t('entry')}
                            </span>
                        </div>
                        <Link href={href} className="mt-5 block">
                            <h3 className="font-serif text-2xl font-black leading-tight text-[#171512] transition hover:text-[#A63D2D] sm:text-3xl">{episode.title}</h3>
                            {episode.preview_text && <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-[#5F574B]">{episode.preview_text}</p>}
                        </Link>
                        {episode.cover_image_url && (
                            <Link href={href} className="mt-5 block aspect-[16/9] overflow-hidden rounded-[4px] bg-[#E8DECB]">
                                <img src={episode.cover_image_url} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-[1.015]" />
                            </Link>
                        )}
                        <MetaLine date={null} ageRating={episode.age_rating} warnings={episode.content_warnings} />
                    </div>
                    <EpisodeFeedActions episodeId={episode.id} episodeUrl={href} episodeTitle={episode.title} isOwner={isOwner} isAuthenticated={isAuthenticated} initialLiked={initialLiked} initialLikeCount={initialLikeCount} creatorUsername={username} variant="editorial" />
                </>
            )}
        </article>
    )
}

function MetaLine({ date, ageRating, warnings }: { date: string | null; ageRating?: string | null; warnings?: string[] | null }) {
    if (!date && (!ageRating || ageRating === 'all') && !warnings?.length) return null
    return (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] font-bold text-[#8A8174]">
            {date && <span className="inline-flex items-center gap-1"><Clock3 size={11} /> {date}</span>}
            {ageRating && ageRating !== 'all' && <span className="inline-flex items-center gap-1"><ShieldCheck size={11} /> {ageRating}</span>}
            {warnings?.slice(0, 2).map((warning) => <span key={warning}>#{warning.replaceAll('_', ' ')}</span>)}
        </div>
    )
}

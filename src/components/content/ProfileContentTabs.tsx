'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bookmark, BookOpen, FileText, Library, LockKeyhole } from 'lucide-react'
import { EditorialEpisodeCard, type EditorialEpisode } from '@/components/content/EditorialEpisodeCard'
import { FollowButton } from '@/components/FollowButton'
import { useTranslations } from 'next-intl'

type Work = {
    id: string
    title: string
    slug?: string | null
    description?: string | null
    storyType?: 'life_story' | 'fiction' | null
    format?: 'series' | 'thread' | null
    coverUrl?: string | null
    initialFollowing?: boolean
    episodes: EditorialEpisode[]
}

type SavedItem = EditorialEpisode & { username: string; authorName: string; reachedPercent: number }

type Props = {
    entries: EditorialEpisode[]
    works: Work[]
    saved: SavedItem[]
    username: string
    authorName: string
    avatarUrl?: string | null
    isOwner: boolean
    isAuthenticated: boolean
    likedByEpisode?: Record<string, boolean>
    likeCountByEpisode?: Record<string, number>
}

type TabId = 'entries' | 'works' | 'saved'

export function ProfileContentTabs(props: Props) {
    const t = useTranslations('profile_content')
    const [tab, setTab] = useState<TabId>(props.works.length > 0 ? 'works' : 'entries')
    const tabs = [
        { id: 'entries' as const, label: t('entries'), count: props.entries.length, icon: FileText },
        { id: 'works' as const, label: t('works'), count: props.works.length, icon: Library },
        ...(props.isOwner ? [{ id: 'saved' as const, label: t('saved'), count: props.saved.length, icon: Bookmark }] : []),
    ]

    return (
        <section>
            <div className="flex gap-1 overflow-x-auto border-b border-[#171512]/12 [scrollbar-width:none]">
                {tabs.map((item) => {
                    const Icon = item.icon
                    return (
                        <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`flex h-12 shrink-0 items-center gap-2 border-b-2 px-4 text-xs font-black transition ${tab === item.id ? 'border-[#A63D2D] text-[#A63D2D]' : 'border-transparent text-[#776E61] hover:text-[#171512]'}`}>
                            <Icon size={14} /> {item.label} <span className="text-[10px] opacity-55">{item.count}</span>
                        </button>
                    )
                })}
            </div>

            {tab === 'entries' && (
                <div className="mt-7 space-y-5">
                    {props.entries.length ? props.entries.map((episode) => (
                        <EditorialEpisodeCard key={episode.id} episode={episode} username={props.username} authorName={props.authorName} avatarUrl={props.avatarUrl} isOwner={props.isOwner} isAuthenticated={props.isAuthenticated} initialLiked={!!props.likedByEpisode?.[episode.id]} initialLikeCount={props.likeCountByEpisode?.[episode.id] || 0} />
                    )) : <EmptyState icon={FileText} title={t('no_entries')} text={t('no_entries_text')} />}
                </div>
            )}

            {tab === 'works' && (
                <div className="mt-7 space-y-8">
                    {props.works.length ? props.works.map((work) => (
                        <article key={work.id} className="border-y border-[#171512]/12 py-6">
                            <div className="grid gap-5 sm:grid-cols-[104px_1fr_auto] sm:items-start">
                                <Link href={`/${props.username}/stories/${work.slug || work.id}`} className="relative aspect-[2/3] overflow-hidden rounded-[5px] bg-[#263E58] shadow-[0_14px_30px_rgba(23,21,18,0.14)]">
                                    {work.coverUrl ? <img src={work.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-white/55"><BookOpen size={24} /></div>}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                                    <p className="absolute inset-x-0 bottom-0 p-3 text-[9px] font-black uppercase tracking-[0.13em] text-white/80">{work.storyType === 'fiction' ? t('novel') : work.format === 'thread' ? t('serial_diary') : t('true_story')}</p>
                                </Link>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A63D2D]">{work.storyType === 'fiction' ? t('novel') : work.format === 'thread' ? t('serial_diary') : t('true_story')}</p>
                                    <Link href={`/${props.username}/stories/${work.slug || work.id}`}><h3 className="mt-2 font-serif text-3xl font-black leading-tight text-[#171512] hover:text-[#A63D2D]">{work.title}</h3></Link>
                                    {work.description && <p className="mt-3 max-w-2xl text-sm leading-6 text-[#655C4F]">{work.description}</p>}
                                    <p className="mt-4 text-xs font-bold text-[#8A8174]">{t('chapter_count', { count: work.episodes.length })}</p>
                                </div>
                                {!props.isOwner && <FollowButton targetType="story" targetId={work.id} initialFollowing={!!work.initialFollowing} isAuthenticated={props.isAuthenticated} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#171512]/15 px-4 text-xs font-black text-[#171512] hover:border-[#A63D2D] hover:text-[#A63D2D]" />}
                            </div>
                            <div className="mt-6 space-y-3">
                                {work.episodes.map((episode, index) => (
                                    <EditorialEpisodeCard key={episode.id} episode={episode} username={props.username} authorName={props.authorName} avatarUrl={props.avatarUrl} workTitle={work.title} chapterNumber={index + 1} isOwner={props.isOwner} isAuthenticated={props.isAuthenticated} initialLiked={!!props.likedByEpisode?.[episode.id]} initialLikeCount={props.likeCountByEpisode?.[episode.id] || 0} compact />
                                ))}
                            </div>
                        </article>
                    )) : <EmptyState icon={Library} title={t('no_works')} text={t('no_works_text')} />}
                </div>
            )}

            {tab === 'saved' && props.isOwner && (
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    {props.saved.length ? props.saved.map((item) => (
                        <Link key={item.id} href={`/${item.username}/${item.id}`} className="border border-[#171512]/12 bg-[#FFFCF5] p-4 transition hover:border-[#A63D2D]/45">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#A63D2D]">{t('saved_label')} · {Math.round(item.reachedPercent)}%</span>
                                <BookOpen size={14} className="text-[#8A8174]" />
                            </div>
                            <h3 className="mt-3 font-serif text-xl font-black text-[#171512]">{item.title}</h3>
                            <p className="mt-1 text-xs font-bold text-[#8A8174]">{item.authorName}</p>
                            <div className="mt-4 h-1 overflow-hidden bg-[#E4DAC7]"><div className="h-full bg-[#A63D2D]" style={{ width: `${item.reachedPercent}%` }} /></div>
                        </Link>
                    )) : <div className="sm:col-span-2"><EmptyState icon={LockKeyhole} title={t('no_saved')} text={t('no_saved_text')} /></div>}
                </div>
            )}
        </section>
    )
}

function EmptyState({ icon: Icon, title, text }: { icon: typeof FileText; title: string; text: string }) {
    return (
        <div className="border border-dashed border-[#171512]/15 bg-white/35 px-6 py-12 text-center">
            <Icon className="mx-auto text-[#A63D2D]" size={24} />
            <h3 className="mt-3 font-serif text-2xl font-black text-[#171512]">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#746A5C]">{text}</p>
        </div>
    )
}

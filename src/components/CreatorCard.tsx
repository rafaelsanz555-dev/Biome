import Link from 'next/link'
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import { MONETIZATION_ENABLED } from '@/lib/flags'
import { useTranslations } from 'next-intl'

interface CreatorCardProps {
    creator: {
        id: string
        username: string
        full_name: string | null
        avatar_url: string | null
        bio: string | null
        cover_image_url?: string | null
        story_themes?: string[] | null
        creators?: {
            subscription_price: number | null
            brand_tagline?: string | null
            posting_frequency?: string | null
            series_status?: string | null
            is_verified_storyteller?: boolean | null
        } | Array<{
            subscription_price: number | null
            brand_tagline?: string | null
            posting_frequency?: string | null
            series_status?: string | null
            is_verified_storyteller?: boolean | null
        }> | null
    }
}

const COVER_COLORS = ['#274C43', '#8E4E3E', '#42667A', '#6B5C3B']

function hashUsername(username: string): number {
    let h = 0
    for (let i = 0; i < username.length; i++) {
        h = (h * 31 + username.charCodeAt(i)) & 0xffffffff
    }
    return Math.abs(h)
}

export function CreatorCard({ creator }: CreatorCardProps) {
    const t = useTranslations('editorial_discover')
    const coverColor = COVER_COLORS[hashUsername(creator.username) % COVER_COLORS.length]
    const name = creator.full_name || creator.username
    const initial = name.charAt(0).toUpperCase()
    const creatorMeta = Array.isArray(creator.creators) ? creator.creators[0] : creator.creators
    const price = creatorMeta?.subscription_price || 5
    const tagline = creatorMeta?.brand_tagline || creator.bio || t('default_tagline')
    const themes = creator.story_themes?.slice(0, 2) || []

    return (
        <Link href={`/${creator.username}`} className="group block h-full">
            <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#0D0D0D]/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#C9A84C]/55 hover:shadow-xl">
                <div className="relative h-32 overflow-hidden" style={{ backgroundColor: coverColor }}>
                    {creator.cover_image_url && <img src={creator.cover_image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute right-3 top-3 bg-[#FFFCF5] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#A63D2D]">
                        {t('author_to_follow')}
                    </div>
                </div>

                <div className="relative flex flex-1 flex-col p-5 pt-0">
                    <div className="-mt-9 mb-4 flex items-end justify-between gap-3">
                        <div className="h-18 w-18 overflow-hidden rounded-2xl border-4 border-white bg-[#0D0D0D] shadow-lg">
                            {creator.avatar_url ? (
                                <img src={creator.avatar_url} alt={creator.username} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-2xl font-black text-[#C9A84C]">
                                    {initial}
                                </div>
                            )}
                        </div>
                        {MONETIZATION_ENABLED && <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-[#C9A84C]/14 px-3 py-1 text-[11px] font-black text-[#765B15]">
                            <Sparkles size={12} />
                            ${price}/{t('month')}
                        </span>}
                    </div>

                    <div>
                        <h3 className="line-clamp-1 font-serif text-2xl font-black leading-tight text-[#0D0D0D] group-hover:text-[#8A6A1C]">
                            {name}
                        </h3>
                        <p className="mt-1 text-xs font-bold text-[#0D0D0D]/45">@{creator.username}</p>
                    </div>

                    <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[#0D0D0D]/64">
                        {tagline}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                        {(themes.length ? themes : ['Story-first']).map((theme) => (
                            <span key={theme} className="rounded-full border border-[#0D0D0D]/10 bg-[#FAF7F0] px-3 py-1 text-[11px] font-bold text-[#0D0D0D]/62">
                                {theme}
                            </span>
                        ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-[#0D0D0D]/8 pt-5">
                        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#8A6A1C]">
                            <BookOpen size={14} />
                            {t('writer_profile')}
                        </span>
                        <ArrowRight size={17} className="text-[#0D0D0D]/38 transition group-hover:translate-x-1 group-hover:text-[#C9A84C]" />
                    </div>
                </div>
            </article>
        </Link>
    )
}

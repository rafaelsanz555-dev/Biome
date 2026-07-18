'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, PenLine } from 'lucide-react'
import { CreatorCard } from '@/components/CreatorCard'
import { useTranslations } from 'next-intl'

interface Creator {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
    bio: string | null
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

interface DiscoverGridProps {
    creators: Creator[]
}

const FILTERS = [
    { labelKey: 'filter_all', key: 'all', keywords: [] },
    { labelKey: 'filter_migration', key: 'migration', keywords: ['migra', 'emigr', 'pais', 'frontera', 'venezuel', 'extranjero'] },
    { labelKey: 'filter_survival', key: 'survival', keywords: ['surviv', 'cancer', 'trauma', 'recover', 'sobreviv', 'enferm'] },
    { labelKey: 'filter_love', key: 'love', keywords: ['love', 'loss', 'duelo', 'amor', 'divorci', 'relationship'] },
    { labelKey: 'filter_business', key: 'business', keywords: ['business', 'startup', 'negocio', 'empren', 'empresa', 'founder'] },
    { labelKey: 'filter_motherhood', key: 'motherhood', keywords: ['mother', 'mama', 'madre', 'hijo', 'familia', 'baby'] },
    { labelKey: 'filter_starting', key: 'starting', keywords: ['start over', 'restart', 'nuevo comienzo', 'nueva vida', 'reinvent'] },
]

function matchesFilter(creator: Creator, filterKey: string): boolean {
    if (filterKey === 'all') return true
    const filter = FILTERS.find((f) => f.key === filterKey)
    if (!filter) return true
    const text = [
        creator.bio,
        creator.full_name,
        creator.username,
        ...(Array.isArray(creator.creators)
            ? creator.creators.map((meta) => meta.brand_tagline)
            : [creator.creators?.brand_tagline]),
        ...(creator.story_themes || []),
    ].filter(Boolean).join(' ').toLowerCase()

    return filter.keywords.some((keyword) => text.includes(keyword.toLowerCase()))
}

export function DiscoverGrid({ creators }: DiscoverGridProps) {
    const t = useTranslations('editorial_discover')
    const [active, setActive] = useState('all')
    const filtered = creators.filter((creator) => matchesFilter(creator, active))

    if (creators.length === 0) {
        return (
            <div className="rounded-3xl border border-[#0D0D0D]/10 bg-white p-8 text-center shadow-sm md:p-12">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C9A84C]/15 text-[#8A6A1C]">
                    <PenLine size={22} />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8A6A1C]">{t('founding')}</p>
                <h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl font-black text-[#0D0D0D] md:text-4xl">
                    {t('empty_title')}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#0D0D0D]/62">
                    {t('empty_text')}
                </p>
                <Link href="/login?mode=registro" className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0D0D0D] px-6 text-sm font-black text-[#FAF7F0] transition hover:bg-[#2A2418]">
                    {t('join_writer')}
                    <ArrowRight size={16} />
                </Link>
            </div>
        )
    }

    return (
        <div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:justify-center">
                {FILTERS.map((filter) => {
                    const selected = active === filter.key
                    return (
                        <button
                            key={filter.key}
                            type="button"
                            onClick={() => setActive(filter.key)}
                            className={`h-10 shrink-0 rounded-full border px-4 text-xs font-black transition ${
                                selected
                                    ? 'border-[#0D0D0D] bg-[#0D0D0D] text-[#FAF7F0]'
                                    : 'border-[#0D0D0D]/12 bg-white/60 text-[#0D0D0D]/58 hover:border-[#C9A84C]/60 hover:text-[#0D0D0D]'
                            }`}
                        >
                            {t(filter.labelKey)}
                        </button>
                    )
                })}
            </div>

            {active !== 'all' && (
                <p className="mt-4 text-center text-xs font-bold text-[#0D0D0D]/45">
                    {filtered.length === 0 ? t('none_in_category') : t('writers_found', { count: filtered.length })}
                </p>
            )}

            {filtered.length > 0 ? (
                <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((creator) => (
                        <CreatorCard key={creator.id} creator={creator} />
                    ))}
                </div>
            ) : (
                <div className="mt-9 rounded-3xl border border-dashed border-[#0D0D0D]/12 bg-white/70 p-10 text-center">
                    <p className="font-serif text-2xl font-black text-[#0D0D0D]">{t('shelf_empty')}</p>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#0D0D0D]/58">
                        {t('shelf_empty_text')}
                    </p>
                </div>
            )}
        </div>
    )
}

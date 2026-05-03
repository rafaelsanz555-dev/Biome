'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

const TAB_IDS = ['foryou', 'trending', 'new', 'real', 'gifted'] as const
const CHIP_IDS = ['first-free', 'series', 'top-gifted', 'top-eps'] as const

const TAB_KEY: Record<(typeof TAB_IDS)[number], string> = {
    foryou: 'tab_foryou',
    trending: 'tab_trending',
    new: 'tab_new',
    real: 'tab_real',
    gifted: 'tab_gifted',
}

const CHIP_KEY: Record<(typeof CHIP_IDS)[number], string> = {
    'first-free': 'chip_first_free',
    series: 'chip_series',
    'top-gifted': 'chip_top_gifted',
    'top-eps': 'chip_top_eps',
}

export function FeedTabs() {
    const t = useTranslations('feed')
    const [activeTab, setActiveTab] = useState<(typeof TAB_IDS)[number]>('foryou')
    const [activeChips, setActiveChips] = useState<Set<string>>(new Set())

    function toggleChip(id: string) {
        setActiveChips((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    return (
        <>
            <div className="flex items-center space-x-8 mb-6 border-b border-[#262626] overflow-x-auto whitespace-nowrap">
                {TAB_IDS.map((id) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setActiveTab(id)}
                        className={`pb-4 font-medium text-sm transition ${
                            activeTab === id
                                ? 'text-blue-500 border-b-2 border-blue-500'
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {t(TAB_KEY[id])}
                    </button>
                ))}
            </div>

            <div className="flex items-center space-x-3 mb-8 overflow-x-auto whitespace-nowrap pb-2">
                {CHIP_IDS.map((id) => {
                    const active = activeChips.has(id)
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => toggleChip(id)}
                            className={`px-4 py-1.5 rounded-full text-xs transition border ${
                                active
                                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                                    : 'bg-[#1E1E1E] hover:bg-[#2D2D2D] text-gray-300 border-[#333]'
                            }`}
                        >
                            {t(CHIP_KEY[id])}
                        </button>
                    )
                })}
            </div>

            {/* Mensaje sutil cuando hay filtros activos */}
            {(activeTab !== 'foryou' || activeChips.size > 0) && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-blue-300 flex items-center justify-between">
                    <span>
                        {t('filter_label')}: <strong>{t(TAB_KEY[activeTab])}</strong>
                        {activeChips.size > 0 && (
                            <span className="text-gray-400">
                                {' · '}
                                {activeChips.size === 1
                                    ? t('chips_active_one', { count: activeChips.size })
                                    : t('chips_active_other', { count: activeChips.size })}
                            </span>
                        )}
                    </span>
                    <button
                        type="button"
                        onClick={() => { setActiveTab('foryou'); setActiveChips(new Set()) }}
                        className="text-gray-500 hover:text-white text-xs font-semibold"
                    >
                        {t('clear')}
                    </button>
                </div>
            )}
        </>
    )
}

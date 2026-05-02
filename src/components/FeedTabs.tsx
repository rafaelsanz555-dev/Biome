'use client'

import { useState } from 'react'

const TABS = [
    { id: 'foryou', label: 'Para ti' },
    { id: 'trending', label: 'Trending' },
    { id: 'new', label: 'Nuevas voces' },
    { id: 'real', label: 'Historias reales' },
    { id: 'gifted', label: 'Más regaladas' },
] as const

const CHIPS = [
    { id: 'first-free', label: 'Gratis el primer capítulo' },
    { id: 'series', label: 'Series en progreso' },
    { id: 'top-gifted', label: 'Top gifted' },
    { id: 'top-eps', label: 'Top episodios' },
] as const

export function FeedTabs() {
    const [activeTab, setActiveTab] = useState<string>('foryou')
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
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTab(t.id)}
                        className={`pb-4 font-medium text-sm transition ${
                            activeTab === t.id
                                ? 'text-blue-500 border-b-2 border-blue-500'
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center space-x-3 mb-8 overflow-x-auto whitespace-nowrap pb-2">
                {CHIPS.map((c) => {
                    const active = activeChips.has(c.id)
                    return (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleChip(c.id)}
                            className={`px-4 py-1.5 rounded-full text-xs transition border ${
                                active
                                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                                    : 'bg-[#1E1E1E] hover:bg-[#2D2D2D] text-gray-300 border-[#333]'
                            }`}
                        >
                            {c.label}
                        </button>
                    )
                })}
            </div>

            {/* Mensaje sutil cuando hay filtros activos */}
            {(activeTab !== 'foryou' || activeChips.size > 0) && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-blue-300 flex items-center justify-between">
                    <span>
                        Filtro: <strong>{TABS.find((t) => t.id === activeTab)?.label}</strong>
                        {activeChips.size > 0 && (
                            <span className="text-gray-400"> · {activeChips.size} {activeChips.size === 1 ? 'chip' : 'chips'} activo</span>
                        )}
                    </span>
                    <button
                        type="button"
                        onClick={() => { setActiveTab('foryou'); setActiveChips(new Set()) }}
                        className="text-gray-500 hover:text-white text-xs font-semibold"
                    >
                        Limpiar
                    </button>
                </div>
            )}
        </>
    )
}

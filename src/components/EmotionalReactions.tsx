'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

const EMOTION_KEYS = [
    { emoji: '❤️', key: 'emotion_touching' },
    { emoji: '🔥', key: 'emotion_inspiring' },
    { emoji: '😢', key: 'emotion_sad' },
    { emoji: '😡', key: 'emotion_angry' },
    { emoji: '🤯', key: 'emotion_shocking' },
    { emoji: '😂', key: 'emotion_funny' },
] as const

interface EmotionalReactionsProps {
    episodeId: string
    initialCounts: Record<string, number>
    initialMyReaction: string | null
    totalReaders: number
}

export function EmotionalReactions({ episodeId, initialCounts, initialMyReaction, totalReaders }: EmotionalReactionsProps) {
    const t = useTranslations('reader')
    const [counts, setCounts] = useState<Record<string, number>>(initialCounts)
    const [myReaction, setMyReaction] = useState<string | null>(initialMyReaction)
    const [loading, setLoading] = useState(false)

    async function react(emoji: string) {
        if (loading) return
        setLoading(true)

        // Optimistic update
        const prev = myReaction
        const newCounts = { ...counts }

        if (prev === emoji) {
            newCounts[emoji] = Math.max(0, (newCounts[emoji] || 0) - 1)
            setMyReaction(null)
        } else {
            if (prev) newCounts[prev] = Math.max(0, (newCounts[prev] || 0) - 1)
            newCounts[emoji] = (newCounts[emoji] || 0) + 1
            setMyReaction(emoji)
        }
        setCounts(newCounts)

        try {
            const res = await fetch('/api/reactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ episode_id: episodeId, emoji }),
            })
            if (!res.ok) {
                // Revert on error
                setMyReaction(prev)
                setCounts(initialCounts)
            }
        } catch {
            setMyReaction(prev)
            setCounts(initialCounts)
        } finally {
            setLoading(false)
        }
    }

    const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0)

    return (
        <div className="my-10 rounded-2xl border border-gray-800 bg-[#15171C] p-6">
            <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">
                    ✦ Huella emocional
                </p>
                <h3 className="font-bold text-white text-lg">{t('emotional_title')}</h3>
                {totalReactions > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                        {totalReactions === 1
                            ? t('emotional_subtitle_one', { count: totalReactions })
                            : t('emotional_subtitle_other', { count: totalReactions })}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {EMOTION_KEYS.map(({ emoji, key }) => {
                    const label = t(key)
                    const count = counts[emoji] || 0
                    const isSelected = myReaction === emoji
                    const pct = totalReactions > 0 ? Math.round((count / totalReactions) * 100) : 0

                    return (
                        <button
                            key={emoji}
                            onClick={() => react(emoji)}
                            disabled={loading}
                            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all overflow-hidden ${
                                isSelected
                                    ? 'border-blue-500 bg-blue-500/10 scale-105 shadow-lg shadow-blue-500/10'
                                    : 'border-gray-800 bg-[#0A0B0E] hover:border-gray-700 hover:bg-[#101217]'
                            } ${loading ? 'opacity-60 cursor-wait' : ''}`}
                        >
                            {/* Progress bar */}
                            {pct > 0 && (
                                <div
                                    className={`absolute bottom-0 left-0 h-1 transition-all ${isSelected ? 'bg-blue-500' : 'bg-blue-500/30'}`}
                                    style={{ width: `${pct}%` }}
                                />
                            )}
                            <span className="text-2xl drop-shadow-md">{emoji}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-blue-400' : 'text-gray-500'}`}>
                                {label}
                            </span>
                            <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                                {count > 0 ? count : ''}
                            </span>
                        </button>
                    )
                })}
            </div>

            {myReaction && (
                <p className="text-xs text-gray-500 mt-4 text-center">
                    {t('reacted_with')} <span className="text-lg">{myReaction}</span> · {t('click_to_remove')}
                </p>
            )}
        </div>
    )
}

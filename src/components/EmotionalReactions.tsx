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

export function EmotionalReactions({ episodeId, initialCounts, initialMyReaction }: EmotionalReactionsProps) {
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
        <div className="my-10 border border-[#171512]/10 bg-[#FFFCF5] p-6">
            <div className="mb-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#A63D2D]">
                    ✦ Huella emocional
                </p>
                <h3 className="font-serif text-lg font-bold text-[#171512]">{t('emotional_title')}</h3>
                {totalReactions > 0 && (
                    <p className="mt-1 text-xs text-[#746A5C]">
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
                                    ? 'border-[#A63D2D] bg-[#A63D2D]/8 scale-105 shadow-sm'
                                    : 'border-[#171512]/10 bg-[#F8F4EA] hover:border-[#A63D2D]/30 hover:bg-[#F0E8D9]'
                            } ${loading ? 'opacity-60 cursor-wait' : ''}`}
                        >
                            {/* Progress bar */}
                            {pct > 0 && (
                                <div
                                    className={`absolute bottom-0 left-0 h-1 transition-all ${isSelected ? 'bg-[#A63D2D]' : 'bg-[#C9A84C]/50'}`}
                                    style={{ width: `${pct}%` }}
                                />
                            )}
                            <span className="text-2xl drop-shadow-md">{emoji}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#A63D2D]' : 'text-[#746A5C]'}`}>
                                {label}
                            </span>
                            <span className={`text-xs font-bold ${isSelected ? 'text-[#171512]' : 'text-[#8A8174]'}`}>
                                {count > 0 ? count : ''}
                            </span>
                        </button>
                    )
                })}
            </div>

            {myReaction && (
                <p className="mt-4 text-center text-xs text-[#746A5C]">
                    {t('reacted_with')} <span className="text-lg">{myReaction}</span> · {t('click_to_remove')}
                </p>
            )}
        </div>
    )
}



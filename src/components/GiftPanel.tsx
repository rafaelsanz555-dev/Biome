'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

const GIFTS = [
    { emoji: '❤️', label: 'Amor', price: 1 },
    { emoji: '🔥', label: 'Fuego', price: 2 },
    { emoji: '👏', label: 'Aplauso', price: 3 },
    { emoji: '⭐', label: 'Estrella', price: 5 },
    { emoji: '💎', label: 'Diamante', price: 10 },
    { emoji: '👑', label: 'Corona', price: 25 },
    { emoji: '🚀', label: 'Cohete', price: 50 },
]

interface GiftPanelProps {
    recipientId: string
    recipientUsername: string
    postId?: string
}

export function GiftPanel({ recipientId, recipientUsername, postId }: GiftPanelProps) {
    const [selected, setSelected] = useState<typeof GIFTS[0] | null>(null)
    const [loading, setLoading] = useState(false)

    async function sendGift() {
        if (!selected) return
        setLoading(true)
        try {
            const res = await fetch('/api/gifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId,
                    postId: postId || null,
                    amount: selected.price,
                    emoji: selected.emoji,
                }),
            })
            const data = await res.json()
            if (data.url) window.location.href = data.url
        } catch (e) {
            console.error('Gift error:', e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="rounded-2xl p-5"
            style={{
                backgroundColor: 'var(--cream-dark)',
                border: '1px solid var(--cream-mid)',
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-base" style={{ color: 'var(--gold)' }}>✦</span>
                <h3
                    className="font-semibold text-sm"
                    style={{ color: 'var(--ink)' }}
                >
                    Enviar un regalo a <span style={{ color: 'var(--gold-dark)' }}>@{recipientUsername}</span>
                </h3>
            </div>

            {/* Gift grid */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-4">
                {GIFTS.map((g) => {
                    const isSelected = selected?.label === g.label
                    return (
                        <button
                            key={g.label}
                            onClick={() => setSelected(isSelected ? null : g)}
                            className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all"
                            style={{
                                border: isSelected
                                    ? '2px solid var(--gold)'
                                    : '2px solid var(--cream-mid)',
                                backgroundColor: isSelected
                                    ? 'var(--gold-bg)'
                                    : 'var(--cream)',
                                transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                            }}
                        >
                            <span className="text-2xl">{g.emoji}</span>
                            <span
                                className="text-[10px] font-bold"
                                style={{ color: isSelected ? 'var(--gold-dark)' : 'var(--ink-light)' }}
                            >
                                ${g.price}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Selected preview */}
            {selected && (
                <div
                    className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
                    style={{
                        backgroundColor: 'var(--gold-bg)',
                        border: '1px solid var(--cream-mid)',
                    }}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{selected.emoji}</span>
                        <div>
                            <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Regalo de {selected.label}</p>
                            <p className="text-xs" style={{ color: 'var(--ink-light)' }}>
                                @{recipientUsername} recibe ${(selected.price * 0.88).toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <span className="text-lg font-black" style={{ color: 'var(--gold-dark)' }}>
                        ${selected.price}
                    </span>
                </div>
            )}

            {/* Send button */}
            <Button
                onClick={sendGift}
                disabled={!selected || loading}
                className="w-full font-bold h-11 rounded-xl transition-all"
                style={{
                    backgroundColor: selected ? 'var(--ink)' : 'var(--cream-mid)',
                    color: selected ? 'var(--cream)' : 'var(--ink-light)',
                    border: 'none',
                    opacity: loading ? 0.6 : 1,
                }}
            >
                {loading
                    ? 'Procesando...'
                    : selected
                    ? `Enviar ${selected.emoji} — $${selected.price}`
                    : 'Selecciona un regalo'}
            </Button>

            <p className="text-center text-[10px] mt-2" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>
                Pago seguro vía Stripe · El escritor recibe 88%
            </p>
        </div>
    )
}

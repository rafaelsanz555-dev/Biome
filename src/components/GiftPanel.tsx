'use client'

import { useState } from 'react'

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
        <div>
            {/* Gift grid */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-4">
                {GIFTS.map((g) => {
                    const isSelected = selected?.label === g.label
                    return (
                        <button
                            key={g.label}
                            onClick={() => setSelected(isSelected ? null : g)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                                isSelected
                                    ? 'bg-green-500/10 border-2 border-green-500 scale-105 shadow-lg shadow-green-500/10'
                                    : 'bg-[#0A0B0E] border-2 border-gray-800 hover:border-gray-600 hover:bg-[#15171C]'
                            }`}
                        >
                            <span className="text-2xl drop-shadow-md">{g.emoji}</span>
                            <span className={`text-[10px] font-bold ${isSelected ? 'text-green-400' : 'text-gray-500'}`}>
                                ${g.price}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Selected preview */}
            {selected && (
                <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-3 bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl drop-shadow-md">{selected.emoji}</span>
                        <div>
                            <p className="text-sm font-bold text-white">Regalo de {selected.label}</p>
                            <p className="text-xs text-gray-400">
                                @{recipientUsername} recibe <span className="text-green-400 font-bold">${(selected.price * 0.88).toFixed(2)}</span>
                            </p>
                        </div>
                    </div>
                    <span className="text-xl font-black text-green-400">
                        ${selected.price}
                    </span>
                </div>
            )}

            {/* Send button */}
            <button
                onClick={sendGift}
                disabled={!selected || loading}
                className={`w-full font-bold h-12 rounded-xl transition-all text-sm ${
                    selected
                        ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                } ${loading ? 'opacity-60' : ''}`}
            >
                {loading
                    ? 'Procesando...'
                    : selected
                    ? `Enviar ${selected.emoji} — $${selected.price}`
                    : 'Selecciona un regalo'}
            </button>

            <p className="text-center text-[10px] mt-3 text-gray-600">
                🔒 Pago seguro vía Stripe · El escritor recibe 88%
            </p>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { Crown, Flame, Gem, Heart, Rocket, Sparkles, Star } from 'lucide-react'

const GIFTS = [
    { icon: Heart, label: 'Amor', price: 1 },
    { icon: Flame, label: 'Fuego', price: 2 },
    { icon: Sparkles, label: 'Aplauso', price: 3 },
    { icon: Star, label: 'Estrella', price: 5 },
    { icon: Gem, label: 'Diamante', price: 10 },
    { icon: Crown, label: 'Corona', price: 25 },
    { icon: Rocket, label: 'Impulso', price: 50 },
]

interface GiftPanelProps {
    recipientId: string
    recipientUsername: string
    postId?: string
}

export function GiftPanel({ recipientId, recipientUsername, postId }: GiftPanelProps) {
    const [selected, setSelected] = useState<typeof GIFTS[0] | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function sendGift() {
        if (!selected || loading) return
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/gifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId,
                    postId: postId || null,
                    amount: selected.price,
                    emoji: selected.label,
                }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.error || 'No se pudo iniciar el pago.')
            if (data.url) window.location.href = data.url
        } catch (e: any) {
            setError(e.message || 'No se pudo enviar el regalo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {GIFTS.map((gift) => {
                    const Icon = gift.icon
                    const isSelected = selected?.label === gift.label
                    return (
                        <button
                            key={gift.label}
                            type="button"
                            onClick={() => setSelected(isSelected ? null : gift)}
                            className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                                isSelected
                                    ? 'scale-105 border-[#C9A84C] bg-[#C9A84C]/10 shadow-lg shadow-[#C9A84C]/10'
                                    : 'border-gray-800 bg-[#0A0B0E] hover:border-gray-600 hover:bg-[#15171C]'
                            }`}
                        >
                            <Icon className={isSelected ? 'text-[#C9A84C]' : 'text-gray-400'} size={22} />
                            <span className={`text-[10px] font-bold ${isSelected ? 'text-[#D8BA63]' : 'text-gray-500'}`}>
                                ${gift.price}
                            </span>
                        </button>
                    )
                })}
            </div>

            {selected && (
                <div className="mb-3 flex items-center justify-between rounded-xl border border-[#C9A84C]/20 bg-[#C9A84C]/10 px-4 py-3">
                    <div>
                        <p className="text-sm font-bold text-white">Regalo de {selected.label}</p>
                        <p className="text-xs text-gray-400">
                            @{recipientUsername} recibe <span className="font-bold text-[#D8BA63]">${(selected.price * 0.88).toFixed(2)}</span>
                        </p>
                    </div>
                    <span className="text-xl font-black text-[#D8BA63]">${selected.price}</span>
                </div>
            )}

            {error && (
                <div className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-bold text-red-300">
                    {error}
                </div>
            )}

            <button
                type="button"
                onClick={sendGift}
                disabled={!selected || loading}
                className={`h-12 w-full rounded-xl text-sm font-bold transition-all ${
                    selected
                        ? 'bg-[#C9A84C] text-[#0D0D0D] shadow-lg shadow-[#C9A84C]/20 hover:bg-[#D8BA63]'
                        : 'cursor-not-allowed bg-gray-800 text-gray-500'
                } ${loading ? 'opacity-60' : ''}`}
            >
                {loading ? 'Procesando...' : selected ? `Enviar ${selected.label} - $${selected.price}` : 'Selecciona un regalo'}
            </button>

            <p className="mt-3 text-center text-[10px] text-gray-600">
                Pago seguro via Stripe. El escritor recibe 88%.
            </p>
        </div>
    )
}

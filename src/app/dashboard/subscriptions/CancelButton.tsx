'use client'

import { useState, useTransition } from 'react'
import { cancelSubscription } from './actions'
import { X, Loader2, AlertCircle } from 'lucide-react'

interface CancelButtonProps {
    entitlementId: string
    creatorName: string
    validUntil: string
    cancelAtPeriodEnd?: boolean
}

export function CancelButton({ entitlementId, creatorName, validUntil, cancelAtPeriodEnd }: CancelButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    function handleCancel(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        setShowConfirm(true)
    }

    function confirmCancel() {
        startTransition(async () => {
            const res = await cancelSubscription(entitlementId)
            if (res.error) {
                setError(res.error)
            } else {
                setDone(true)
                setTimeout(() => setShowConfirm(false), 3000)
            }
        })
    }

    if (cancelAtPeriodEnd) {
        return (
            <span className="text-[10px] px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 font-bold uppercase tracking-wider">
                Cancelando · activa hasta {new Date(validUntil).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </span>
        )
    }

    return (
        <>
            <button
                type="button"
                onClick={handleCancel}
                className="text-[10px] text-gray-500 hover:text-red-400 font-semibold uppercase tracking-wider transition"
                title="Cancelar suscripción"
            >
                Cancelar
            </button>

            {showConfirm && (
                <div
                    className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={(e) => { if (!isPending && !done) { e.stopPropagation(); setShowConfirm(false); setError(null) } }}
                >
                    <div
                        className="w-full max-w-md bg-[#0F1114] border border-gray-800 rounded-2xl p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {done ? (
                            <div className="text-center py-4">
                                <div className="text-blue-400 text-4xl mb-3">✓</div>
                                <h3 className="text-lg font-bold text-white mb-2">Suscripción cancelada</h3>
                                <p className="text-sm text-gray-400">
                                    Mantienes acceso hasta el <strong className="text-white">{new Date(validUntil).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>. Después no se renovará.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                        <AlertCircle className="text-amber-400" size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">¿Cancelar suscripción a @{creatorName}?</h3>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Mantendrás acceso al contenido hasta el <strong className="text-white">{new Date(validUntil).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
                                            No se realizará el próximo cobro. <strong className="text-amber-300">Sin reembolsos.</strong>
                                        </p>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 mb-4 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-red-400">{error}</div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setShowConfirm(false); setError(null) }}
                                        disabled={isPending}
                                        className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-bold transition"
                                    >
                                        No, mantener
                                    </button>
                                    <button
                                        onClick={confirmCancel}
                                        disabled={isPending}
                                        className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isPending && <Loader2 size={14} className="animate-spin" />}
                                        {isPending ? 'Cancelando...' : 'Sí, cancelar'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

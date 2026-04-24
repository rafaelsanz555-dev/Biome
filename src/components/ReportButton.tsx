'use client'

import { useState } from 'react'
import { Flag, X } from 'lucide-react'

type TargetType = 'episode' | 'profile' | 'comment'
type Reason = 'copyright' | 'harassment' | 'explicit' | 'spam' | 'other'

interface Props {
    targetType: TargetType
    targetId: string
    compact?: boolean
}

const REASONS: { value: Reason; label: string; desc: string }[] = [
    { value: 'copyright', label: 'Copyright', desc: 'Contenido copiado o plagiado' },
    { value: 'harassment', label: 'Acoso', desc: 'Comportamiento abusivo o amenazante' },
    { value: 'explicit', label: 'Explícito', desc: 'Contenido sexual o violento no apropiado' },
    { value: 'spam', label: 'Spam', desc: 'Publicidad engañosa o contenido repetitivo' },
    { value: 'other', label: 'Otro', desc: 'Otra razón — explica abajo' },
]

export function ReportButton({ targetType, targetId, compact = false }: Props) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState<Reason>('copyright')
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(false)

    async function submit() {
        setSubmitting(true)
        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_type: targetType, target_id: targetId, reason, description }),
            })
            if (res.ok) {
                setDone(true)
                setTimeout(() => {
                    setOpen(false)
                    setDone(false)
                    setDescription('')
                }, 1500)
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={
                    compact
                        ? 'text-xs text-gray-500 hover:text-red-400 transition flex items-center gap-1.5'
                        : 'px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition flex items-center gap-1.5'
                }
                title="Reportar"
            >
                <Flag size={12} /> Reportar
            </button>

            {open && (
                <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !submitting && setOpen(false)}>
                    <div className="w-full max-w-md bg-[#0F1114] border border-gray-800 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Reportar contenido</h3>
                            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
                        </div>

                        {done ? (
                            <div className="py-8 text-center">
                                <div className="text-green-400 text-4xl mb-2">✓</div>
                                <p className="text-white font-semibold">Reporte enviado</p>
                                <p className="text-gray-400 text-sm mt-1">Nuestro equipo lo revisará pronto.</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-400 mb-4">Ayúdanos a mantener bio.me un espacio seguro. Cuéntanos qué pasó.</p>
                                <div className="space-y-2 mb-4">
                                    {REASONS.map((r) => (
                                        <label key={r.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${reason === r.value ? 'border-green-500/50 bg-green-500/5' : 'border-gray-800 hover:border-gray-700'}`}>
                                            <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} className="mt-0.5" />
                                            <div>
                                                <div className="text-sm font-semibold text-white">{r.label}</div>
                                                <div className="text-xs text-gray-500">{r.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                                    placeholder="Detalles adicionales (opcional)"
                                    rows={3}
                                    className="w-full bg-[#0A0B0E] border border-gray-800 rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:border-gray-600 focus:outline-none mb-4"
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => setOpen(false)} disabled={submitting} className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold transition">
                                        Cancelar
                                    </button>
                                    <button onClick={submit} disabled={submitting} className="flex-1 px-4 py-2.5 rounded-lg bg-red-500/90 hover:bg-red-500 text-white text-sm font-semibold transition disabled:opacity-50">
                                        {submitting ? 'Enviando...' : 'Enviar reporte'}
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

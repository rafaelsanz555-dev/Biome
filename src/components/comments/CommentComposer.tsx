'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2 } from 'lucide-react'

interface Props {
    episodeId: string
    parentId: string | null
    initialBody?: string
    placeholder?: string
    onCancel?: () => void
    onSaved?: () => void
    /** Modo edit: PATCH a /api/comments/[id] en vez de POST a /api/comments */
    editingId?: string | null
}

const MAX = 2000

export function CommentComposer({
    episodeId,
    parentId,
    initialBody = '',
    placeholder,
    onCancel,
    onSaved,
    editingId = null,
}: Props) {
    const router = useRouter()
    const [body, setBody] = useState(initialBody)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const ref = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        // Auto-resize
        if (ref.current) {
            ref.current.style.height = 'auto'
            ref.current.style.height = ref.current.scrollHeight + 'px'
        }
    }, [body])

    async function handleSubmit() {
        const text = body.trim()
        if (text.length < 1) return
        if (text.length > MAX) {
            setError(`Máximo ${MAX} caracteres.`)
            return
        }
        setBusy(true)
        setError(null)
        try {
            let res: Response
            if (editingId) {
                res = await fetch(`/api/comments/${editingId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ body: text }),
                })
            } else {
                res = await fetch('/api/comments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ episode_id: episodeId, parent_id: parentId, body: text }),
                })
            }
            if (!res.ok) {
                const j = await res.json().catch(() => null)
                if (j?.error === 'rate_limit') setError('Estás comentando muy rápido. Esperá un momento.')
                else if (j?.error === 'body_length') setError(`Mantenelo entre 1 y ${MAX} caracteres.`)
                else setError('Error guardando el comentario.')
                return
            }
            setBody('')
            onSaved?.()
            router.refresh()
        } finally {
            setBusy(false)
        }
    }

    const remaining = MAX - body.length
    const overLimit = remaining < 0
    const placeholderText = placeholder || (parentId ? 'Tu respuesta…' : 'Compartí lo que esta historia te dejó.')

    return (
        <div className="rounded-xl border border-gray-800 bg-[#0F1114] focus-within:border-blue-500/40 transition">
            <textarea
                ref={ref}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={placeholderText}
                className="w-full bg-transparent px-4 py-3 text-sm text-gray-200 placeholder-gray-600 resize-none outline-none leading-relaxed"
                style={{ fontFamily: 'Georgia, serif', minHeight: 70 }}
                rows={2}
                maxLength={MAX + 200}
            />
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-800/60">
                <span className={`text-[11px] ${overLimit ? 'text-red-400 font-bold' : 'text-gray-600'}`}>
                    {overLimit ? `${-remaining} de más` : `${remaining} restantes`}
                </span>
                <div className="flex items-center gap-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={busy}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={busy || body.trim().length < 1 || overLimit}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-xs font-bold flex items-center gap-1.5 transition"
                    >
                        {busy ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        {editingId ? 'Guardar' : (parentId ? 'Responder' : 'Comentar')}
                    </button>
                </div>
            </div>
            {error && <p className="px-4 pb-2 text-[11px] text-red-400">{error}</p>}
        </div>
    )
}

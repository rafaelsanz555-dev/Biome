'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
    const t = useTranslations('comments')
    const tCommon = useTranslations('common')
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
                if (j?.error === 'rate_limit') setError(t('error_rate_limit'))
                else if (j?.error === 'body_length') setError(t('error_length'))
                else setError(t('error_generic'))
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
    const placeholderText = placeholder || (parentId ? t('placeholder_reply') : t('placeholder_root'))

    return (
        <div className="border border-[#171512]/12 bg-[#FFFCF5] transition focus-within:border-[#A63D2D]/40">
            <textarea
                ref={ref}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={placeholderText}
                className="w-full resize-none bg-transparent px-4 py-3 text-sm leading-relaxed text-[#2F2A24] outline-none placeholder:text-[#9A9082]"
                style={{ fontFamily: 'Georgia, serif', minHeight: 70 }}
                rows={2}
                maxLength={MAX + 200}
            />
            <div className="flex items-center justify-between border-t border-[#171512]/10 px-4 py-2">
                <span className={`text-[11px] ${overLimit ? 'font-bold text-red-600' : 'text-[#8A8174]'}`}>
                    {overLimit ? t('over_limit', { count: -remaining }) : t('remaining', { count: remaining })}
                </span>
                <div className="flex items-center gap-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={busy}
                            className="px-3 py-1.5 text-xs font-semibold text-[#746A5C] transition hover:bg-[#F0E8D9] hover:text-[#171512]"
                        >
                            {tCommon('cancel')}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={busy || body.trim().length < 1 || overLimit}
                        className="flex items-center gap-1.5 bg-[#171512] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#A63D2D] disabled:bg-[#D8D0C2] disabled:text-[#8A8174]"
                    >
                        {busy ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        {editingId ? t('submit_save') : (parentId ? t('submit_reply') : t('submit_root'))}
                    </button>
                </div>
            </div>
            {error && <p className="px-4 pb-2 text-[11px] text-red-400">{error}</p>}
        </div>
    )
}


'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
    MoreHorizontal, Edit3, Trash2, Loader2, Link as LinkIcon, Flag,
    Check, EyeOff, BellOff, X,
} from 'lucide-react'
import { deleteEpisode } from '@/app/dashboard/episodes/actions'

interface Props {
    episodeId: string
    episodeUrl: string                // path relativo (e.g. /username/id)
    episodeTitle: string
    isOwner: boolean
    isAuthenticated: boolean
    creatorUsername?: string | null   // para "Silenciar a @creator"
    /** Estilo del trigger */
    size?: 'sm' | 'md'
    /** Posición del menú dropdown */
    align?: 'left' | 'right'
    /** Variante de color del trigger */
    variant?: 'subtle' | 'overlay'    // overlay = sobre cover oscuro
}

type Reason = 'copyright' | 'harassment' | 'explicit' | 'spam' | 'other'

/**
 * EpisodeKebab — el menú de 3 puntos contextual.
 *
 * REGLA DE ORO: las opciones cambian según `isOwner`. Nunca se cruzan.
 *
 * Owner ve:
 *   - Editar
 *   - Copiar enlace
 *   - (Analytics — sprint próximo, link a /dashboard/analytics?ep=id)
 *   - ─────
 *   - Eliminar (rojo, con confirm)
 *
 * Lector/espectador ve:
 *   - Copiar enlace
 *   - Silenciar a @creator (stub — schema en backlog)
 *   - Ocultar este post (stub — schema en backlog)
 *   - ─────
 *   - Reportar (rojo, abre modal con razones)
 */
export function EpisodeKebab({
    episodeId,
    episodeUrl,
    episodeTitle,
    isOwner,
    isAuthenticated,
    creatorUsername,
    size = 'md',
    align = 'right',
    variant = 'subtle',
}: Props) {
    const router = useRouter()
    const t = useTranslations('reader')
    const [open, setOpen] = useState(false)
    const [busy, setBusy] = useState(false)
    const [copied, setCopied] = useState(false)
    const [reportOpen, setReportOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', onClick)
        return () => document.removeEventListener('mousedown', onClick)
    }, [])

    async function handleCopyLink() {
        const fullUrl = typeof window !== 'undefined'
            ? new URL(episodeUrl, window.location.origin).toString()
            : episodeUrl
        try {
            await navigator.clipboard.writeText(fullUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 1400)
        } catch {
            // ignore
        }
        setOpen(false)
    }

    async function handleDelete() {
        if (!confirm(t('owner_delete_confirm', { title: episodeTitle }))) return
        setBusy(true)
        try {
            const res = await deleteEpisode(episodeId)
            if (res?.error) {
                alert('Error eliminando: ' + res.error)
                setBusy(false)
                return
            }
            router.refresh()
        } catch {
            alert('Error eliminando episodio')
            setBusy(false)
        }
    }

    const triggerSize = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
    const triggerColor = variant === 'overlay'
        ? 'text-white/70 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur'
        : 'text-gray-500 hover:text-white hover:bg-white/10'

    return (
        <>
            <div ref={ref} className="relative">
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    disabled={busy}
                    className={`${triggerSize} rounded-full flex items-center justify-center transition disabled:opacity-50 ${triggerColor}`}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    aria-label={t('action_more')}
                    title={t('action_more')}
                >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <MoreHorizontal size={16} />}
                </button>

                {open && (
                    <div
                        role="menu"
                        className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} top-full mt-1.5 w-56 bg-[#0F1114] border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50`}
                    >
                        {isOwner ? (
                            <OwnerMenu
                                episodeId={episodeId}
                                onCopy={handleCopyLink}
                                copied={copied}
                                onDelete={handleDelete}
                                onClose={() => setOpen(false)}
                            />
                        ) : (
                            <SpectatorMenu
                                creatorUsername={creatorUsername}
                                onCopy={handleCopyLink}
                                copied={copied}
                                onReport={() => { setOpen(false); setReportOpen(true) }}
                                isAuthenticated={isAuthenticated}
                            />
                        )}
                    </div>
                )}
            </div>

            {reportOpen && (
                <ReportDialog
                    episodeId={episodeId}
                    onClose={() => setReportOpen(false)}
                />
            )}
        </>
    )
}

// ─────────────────────────────────────────────
// OWNER menu
// ─────────────────────────────────────────────
function OwnerMenu({
    episodeId,
    onCopy,
    copied,
    onDelete,
    onClose,
}: {
    episodeId: string
    onCopy: () => void
    copied: boolean
    onDelete: () => void
    onClose: () => void
}) {
    const t = useTranslations('reader')
    return (
        <>
            <Link
                href={`/dashboard/episodes/${episodeId}/edit`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition"
                role="menuitem"
            >
                <Edit3 size={14} className="text-gray-500" />
                {t('owner_edit')}
            </Link>
            <button
                onClick={onCopy}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition text-left"
                role="menuitem"
            >
                {copied ? <Check size={14} className="text-blue-400" /> : <LinkIcon size={14} className="text-gray-500" />}
                {copied ? 'Enlace copiado' : 'Copiar enlace'}
            </button>
            <div className="border-t border-gray-800/60" />
            <button
                onClick={onDelete}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition text-left"
                role="menuitem"
            >
                <Trash2 size={14} />
                {t('owner_delete')}
            </button>
        </>
    )
}

// ─────────────────────────────────────────────
// SPECTATOR menu
// ─────────────────────────────────────────────
function SpectatorMenu({
    creatorUsername,
    onCopy,
    copied,
    onReport,
    isAuthenticated,
}: {
    creatorUsername?: string | null
    onCopy: () => void
    copied: boolean
    onReport: () => void
    isAuthenticated: boolean
}) {
    return (
        <>
            <button
                onClick={onCopy}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition text-left"
                role="menuitem"
            >
                {copied ? <Check size={14} className="text-blue-400" /> : <LinkIcon size={14} className="text-gray-500" />}
                {copied ? 'Enlace copiado' : 'Copiar enlace'}
            </button>

            {/* Stubs — schema en backlog. Mostramos pero deshabilitados con tooltip. */}
            {creatorUsername && (
                <button
                    onClick={(e) => { e.preventDefault(); alert('Próximamente: silenciar usuarios desde el feed.') }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:bg-white/5 transition text-left"
                    role="menuitem"
                    title="Próximamente"
                >
                    <BellOff size={14} className="text-gray-500" />
                    <span className="truncate">Silenciar a @{creatorUsername}</span>
                </button>
            )}
            <button
                onClick={(e) => { e.preventDefault(); alert('Próximamente: ocultar posts específicos.') }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:bg-white/5 transition text-left"
                role="menuitem"
                title="Próximamente"
            >
                <EyeOff size={14} className="text-gray-500" />
                Ocultar este post
            </button>

            <div className="border-t border-gray-800/60" />
            <button
                onClick={isAuthenticated ? onReport : (e) => { e.preventDefault(); alert('Iniciá sesión para reportar contenido.') }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition text-left"
                role="menuitem"
            >
                <Flag size={14} />
                Reportar
            </button>
        </>
    )
}

// ─────────────────────────────────────────────
// REPORT dialog
// ─────────────────────────────────────────────

const REASONS: { value: Reason; labelKey: string }[] = [
    { value: 'copyright', labelKey: 'reason_copyright' },
    { value: 'harassment', labelKey: 'reason_harassment' },
    { value: 'explicit', labelKey: 'reason_explicit' },
    { value: 'spam', labelKey: 'reason_spam' },
    { value: 'other', labelKey: 'reason_other' },
]

function ReportDialog({ episodeId, onClose }: { episodeId: string; onClose: () => void }) {
    const t = useTranslations('report')
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
                body: JSON.stringify({ target_type: 'episode', target_id: episodeId, reason, description }),
            })
            if (res.ok) {
                setDone(true)
                setTimeout(onClose, 1600)
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#0F1114] p-6 shadow-2xl"
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
                            {t('title')}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{t('description')}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                {done ? (
                    <div className="py-6 text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/15 flex items-center justify-center mb-3">
                            <Check size={20} className="text-blue-400" />
                        </div>
                        <p className="text-sm font-bold text-white">{t('sent')}</p>
                        <p className="text-xs text-gray-500 mt-1">{t('sent_description')}</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2 mb-4">
                            {REASONS.map((r) => (
                                <label
                                    key={r.value}
                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                                        reason === r.value
                                            ? 'border-blue-500/40 bg-blue-500/5'
                                            : 'border-gray-800 hover:border-gray-700'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="report_reason"
                                        value={r.value}
                                        checked={reason === r.value}
                                        onChange={() => setReason(r.value)}
                                        className="mt-0.5 accent-blue-500"
                                    />
                                    <div>
                                        <div className="text-sm font-semibold text-white">{t(r.labelKey)}</div>
                                        <div className="text-[11px] text-gray-500">{t(r.labelKey + '_desc')}</div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('additional_details')}
                            maxLength={1000}
                            rows={3}
                            className="w-full bg-[#15171C] border border-gray-800 rounded-lg p-3 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-blue-500/40 resize-none"
                        />

                        <div className="flex items-center justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={submit}
                                disabled={submitting}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-gray-800 text-white text-sm font-bold flex items-center gap-2 transition"
                            >
                                {submitting && <Loader2 size={14} className="animate-spin" />}
                                {t('submit')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

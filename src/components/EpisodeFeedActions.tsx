'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Gift, Share2, MoreHorizontal, Edit3, Trash2, Loader2 } from 'lucide-react'
import { deleteEpisode } from '@/app/dashboard/episodes/actions'

interface Props {
    episodeId: string
    episodeUrl: string
    episodeTitle: string
    isOwner: boolean
    isAuthenticated: boolean
    initialLiked: boolean
    initialLikeCount: number
    /** En la página del episodio ya hay anchor a #gift-panel, evitar duplicado */
    hideGift?: boolean
    /** Comentar es link al episodio en feeds; en la pagina del episodio no tiene sentido */
    commentScrollTarget?: string
}

/**
 * Action bar funcional para una card de episodio en el feed del perfil.
 *
 * Casiani feedback: el "me gusta" no hace nada, "compartir" no existe,
 * y el dueño no tiene un menú de 3 puntos para editar/eliminar.
 *
 * Cosas que funcionan ahora:
 * - Like: toggle vía /api/reactions con emoji ❤️ (optimistic UI)
 * - Compartir: native Share API + fallback a copiar link
 * - Menú dueño: editar (link) + eliminar (confirm + server action)
 *
 * Comentar sigue siendo un link al episodio — el sistema de comments
 * todavía no existe en DB. Backlog.
 */
export function EpisodeFeedActions({
    episodeId,
    episodeUrl,
    episodeTitle,
    isOwner,
    isAuthenticated,
    initialLiked,
    initialLikeCount,
    hideGift = false,
    commentScrollTarget,
}: Props) {
    const router = useRouter()
    const [liked, setLiked] = useState(initialLiked)
    const [likeCount, setLikeCount] = useState(initialLikeCount)
    const [likeBusy, setLikeBusy] = useState(false)
    const [shared, setShared] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
        }
        document.addEventListener('mousedown', onClickOutside)
        return () => document.removeEventListener('mousedown', onClickOutside)
    }, [])

    async function toggleLike() {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        if (likeBusy) return
        setLikeBusy(true)
        // Optimistic
        const wasLiked = liked
        setLiked(!wasLiked)
        setLikeCount((n) => Math.max(0, n + (wasLiked ? -1 : 1)))
        try {
            const res = await fetch('/api/reactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ episode_id: episodeId, emoji: '❤️' }),
            })
            if (!res.ok) throw new Error('reaction failed')
        } catch {
            // Revert
            setLiked(wasLiked)
            setLikeCount((n) => Math.max(0, n + (wasLiked ? 1 : -1)))
        } finally {
            setLikeBusy(false)
        }
    }

    async function handleShare() {
        const fullUrl = typeof window !== 'undefined' ? new URL(episodeUrl, window.location.origin).toString() : episodeUrl
        // Try native share first
        if (typeof navigator !== 'undefined' && (navigator as any).share) {
            try {
                await (navigator as any).share({
                    title: episodeTitle,
                    text: `Lee "${episodeTitle}" en bio.me`,
                    url: fullUrl,
                })
                return
            } catch {
                // user cancelled — fall through to clipboard
            }
        }
        // Fallback: copy link
        try {
            await navigator.clipboard.writeText(fullUrl)
            setShared(true)
            setTimeout(() => setShared(false), 1800)
        } catch {
            // ignore
        }
    }

    async function handleDelete() {
        if (!confirm(`¿Eliminar "${episodeTitle}"? Esta acción no se puede deshacer.`)) return
        setDeleting(true)
        try {
            const res = await deleteEpisode(episodeId)
            if (res?.error) {
                alert('Error eliminando: ' + res.error)
                setDeleting(false)
                return
            }
            // deleteEpisode redirige a /dashboard/episodes; refresh por si seguimos en /[username]
            router.refresh()
        } catch (e) {
            alert('Error eliminando episodio')
            setDeleting(false)
        }
    }

    return (
        <div className="px-4 py-3 bg-[#15171C] flex items-center gap-5">
            {/* Like */}
            <button
                onClick={toggleLike}
                disabled={likeBusy}
                className={`flex items-center gap-2 font-medium text-sm transition-colors disabled:opacity-50 ${
                    liked ? 'text-red-500 hover:text-red-400' : 'text-gray-500 hover:text-white'
                }`}
                aria-pressed={liked}
                title={liked ? 'Quitar me gusta' : 'Me gusta'}
            >
                <Heart size={18} className={liked ? 'fill-current' : ''} />
                <span>{likeCount > 0 ? likeCount : 'Me gusta'}</span>
            </button>

            {/* Comment — en feed va al episodio (con #comments); en la pagina del episodio scrollea */}
            {commentScrollTarget ? (
                <a
                    href={commentScrollTarget}
                    className="flex items-center gap-2 text-gray-500 hover:text-white font-medium text-sm transition-colors"
                    title="Ir a los comentarios"
                >
                    <MessageCircle size={18} />
                    <span>Comentar</span>
                </a>
            ) : (
                <Link
                    href={`${episodeUrl}#comments`}
                    className="flex items-center gap-2 text-gray-500 hover:text-white font-medium text-sm transition-colors"
                    title="Leer y comentar"
                >
                    <MessageCircle size={18} />
                    <span>Comentar</span>
                </Link>
            )}

            {/* Share */}
            <button
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-500 hover:text-white font-medium text-sm transition-colors"
                title="Compartir"
            >
                <Share2 size={18} />
                <span>{shared ? 'Link copiado' : 'Compartir'}</span>
            </button>

            <div className="ml-auto flex items-center gap-2">
                {/* Gift */}
                {!hideGift && (
                    <Link
                        href={episodeUrl}
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-400 font-medium text-sm transition-colors"
                    >
                        <Gift size={18} />
                        <span>Dar regalo</span>
                    </Link>
                )}

                {/* Owner kebab menu */}
                {isOwner && (
                    <div ref={menuRef} className="relative">
                        <button
                            onClick={() => setMenuOpen((o) => !o)}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition"
                            title="Más opciones"
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                        >
                            <MoreHorizontal size={18} />
                        </button>
                        {menuOpen && (
                            <div
                                role="menu"
                                className="absolute right-0 bottom-full mb-2 w-48 bg-[#0F1114] border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50"
                            >
                                <Link
                                    href={`/dashboard/episodes/${episodeId}/edit`}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition"
                                    role="menuitem"
                                >
                                    <Edit3 size={14} className="text-gray-500" />
                                    Editar
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                                    role="menuitem"
                                >
                                    {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    {deleting ? 'Eliminando…' : 'Eliminar'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

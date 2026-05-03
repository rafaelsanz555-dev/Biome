'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Heart, MessageCircle, Gift, Share2 } from 'lucide-react'
import { EpisodeKebab } from '@/components/EpisodeKebab'

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
    /** Comentar es link al episodio en feeds; en la pagina del episodio scrollea */
    commentScrollTarget?: string
    /** Para el kebab spectator: silenciar a @username */
    creatorUsername?: string | null
}

/**
 * Action bar funcional para una card de episodio.
 *
 * Acciones FRECUENTES (visibles inline):
 *   - Like (toggle a /api/reactions con ❤️, optimistic UI)
 *   - Comentar (scroll a #comments si ya estamos en el episodio,
 *     link al episodio si estamos en feed)
 *   - Compartir (native Share API + clipboard fallback)
 *   - Dar regalo (oculto si hideGift=true)
 *
 * Acciones POWER (en EpisodeKebab — owner vs spectator distinto):
 *   - Owner: Editar, Copiar enlace, Eliminar
 *   - Spectator: Copiar enlace, Silenciar (stub), Ocultar (stub), Reportar
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
    creatorUsername,
}: Props) {
    const router = useRouter()
    const t = useTranslations('reader')
    const [liked, setLiked] = useState(initialLiked)
    const [likeCount, setLikeCount] = useState(initialLikeCount)
    const [likeBusy, setLikeBusy] = useState(false)
    const [shared, setShared] = useState(false)

    async function toggleLike() {
        // No tiene sentido que el dueño dé like a su propio post
        if (isOwner) return
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        if (likeBusy) return
        setLikeBusy(true)
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
            setLiked(wasLiked)
            setLikeCount((n) => Math.max(0, n + (wasLiked ? 1 : -1)))
        } finally {
            setLikeBusy(false)
        }
    }

    async function handleShare() {
        const fullUrl = typeof window !== 'undefined'
            ? new URL(episodeUrl, window.location.origin).toString()
            : episodeUrl
        if (typeof navigator !== 'undefined' && (navigator as any).share) {
            try {
                await (navigator as any).share({ title: episodeTitle, text: episodeTitle, url: fullUrl })
                return
            } catch { /* user cancelled, fall through */ }
        }
        try {
            await navigator.clipboard.writeText(fullUrl)
            setShared(true)
            setTimeout(() => setShared(false), 1800)
        } catch { /* ignore */ }
    }

    return (
        <div className="px-4 py-3 bg-[#15171C] flex items-center gap-5">
            {/* Like — el dueño no puede darse like a sí mismo */}
            {!isOwner && (
                <button
                    onClick={toggleLike}
                    disabled={likeBusy}
                    className={`flex items-center gap-2 font-medium text-sm transition-colors disabled:opacity-50 ${
                        liked ? 'text-red-500 hover:text-red-400' : 'text-gray-500 hover:text-white'
                    }`}
                    aria-pressed={liked}
                    title={t('action_like')}
                >
                    <Heart size={18} className={liked ? 'fill-current' : ''} />
                    <span>{likeCount > 0 ? likeCount : t('action_like')}</span>
                </button>
            )}
            {/* Si sos dueño mostramos el contador de likes recibidos como info, sin botón */}
            {isOwner && likeCount > 0 && (
                <span className="flex items-center gap-2 text-sm text-gray-500" title={t('action_like')}>
                    <Heart size={18} className="text-red-500/70" />
                    <span>{likeCount}</span>
                </span>
            )}

            {/* Comment */}
            {commentScrollTarget ? (
                <a
                    href={commentScrollTarget}
                    className="flex items-center gap-2 text-gray-500 hover:text-white font-medium text-sm transition-colors"
                    title={t('action_comment')}
                >
                    <MessageCircle size={18} />
                    <span>{t('action_comment')}</span>
                </a>
            ) : (
                <Link
                    href={`${episodeUrl}#comments`}
                    className="flex items-center gap-2 text-gray-500 hover:text-white font-medium text-sm transition-colors"
                    title={t('action_comment')}
                >
                    <MessageCircle size={18} />
                    <span>{t('action_comment')}</span>
                </Link>
            )}

            {/* Share — disponible para todos */}
            <button
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-500 hover:text-white font-medium text-sm transition-colors"
                title={t('action_share')}
            >
                <Share2 size={18} />
                <span>{shared ? t('action_share_copied') : t('action_share')}</span>
            </button>

            <div className="ml-auto flex items-center gap-2">
                {/* Gift — solo para espectadores (no podés regalarte a vos mismo) */}
                {!hideGift && !isOwner && (
                    <Link
                        href={episodeUrl}
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-400 font-medium text-sm transition-colors"
                    >
                        <Gift size={18} />
                        <span>{t('action_gift')}</span>
                    </Link>
                )}

                {/* Kebab universal — owner ve Editar/Eliminar, spectator ve Reportar/etc */}
                <EpisodeKebab
                    episodeId={episodeId}
                    episodeUrl={episodeUrl}
                    episodeTitle={episodeTitle}
                    isOwner={isOwner}
                    isAuthenticated={isAuthenticated}
                    creatorUsername={creatorUsername}
                    align="right"
                />
            </div>
        </div>
    )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ThumbsUp, ThumbsDown, MoreHorizontal, Edit3, Trash2, Pin, EyeOff, Loader2, Reply } from 'lucide-react'
import { CommentComposer } from './CommentComposer'
import type { CommentRow } from './CommentSection'

interface Props {
    comment: CommentRow
    replies: CommentRow[]
    currentUserId: string | null
    isCreator: boolean
    episodeId: string
}

function useTimeAgo() {
    const t = useTranslations('comments')
    return (iso: string): string => {
        const diff = Date.now() - new Date(iso).getTime()
        const m = Math.floor(diff / 60000)
        if (m < 1) return t('now')
        if (m < 60) return t('ago_minutes', { min: m })
        const h = Math.floor(m / 60)
        if (h < 24) return t('ago_hours', { h })
        const d = Math.floor(h / 24)
        if (d < 7) return t('ago_days', { d })
        return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
    }
}

export function CommentItem({ comment, replies, currentUserId, isCreator, episodeId }: Props) {
    return (
        <CommentRow
            comment={comment}
            replies={replies}
            currentUserId={currentUserId}
            isCreator={isCreator}
            episodeId={episodeId}
            isReply={false}
        />
    )
}

function CommentRow({
    comment,
    replies = [],
    currentUserId,
    isCreator,
    episodeId,
    isReply,
}: {
    comment: CommentRow
    replies?: CommentRow[]
    currentUserId: string | null
    isCreator: boolean
    episodeId: string
    isReply: boolean
}) {
    const router = useRouter()
    const t = useTranslations('comments')
    const timeAgo = useTimeAgo()
    const [score, setScore] = useState(comment.score)
    const [myVote, setMyVote] = useState<number>(comment.myVote || 0)
    const [voting, setVoting] = useState(false)
    const [editing, setEditing] = useState(false)
    const [replying, setReplying] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [busy, setBusy] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const isAuthor = !!currentUserId && comment.author_id === currentUserId
    const canModerate = isCreator
    const canEdit = isAuthor
    const canDelete = isAuthor || canModerate

    const author = comment.profiles
    const displayName = author?.full_name || author?.username || t('anonymous_reader')
    const handle = author?.username || 'anonimo'
    const initial = displayName.charAt(0).toUpperCase()

    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
        }
        document.addEventListener('mousedown', onClick)
        return () => document.removeEventListener('mousedown', onClick)
    }, [])

    async function vote(value: 1 | -1) {
        if (!currentUserId) {
            router.push('/login')
            return
        }
        if (voting) return
        setVoting(true)
        const next = myVote === value ? 0 : value
        // Optimistic
        const prevScore = score
        const prevVote = myVote
        const delta = next - myVote
        setScore(score + delta)
        setMyVote(next)
        try {
            const res = await fetch(`/api/comments/${comment.id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: next }),
            })
            if (!res.ok) throw new Error('vote failed')
            const j = await res.json().catch(() => null)
            if (typeof j?.score === 'number') setScore(j.score)
        } catch {
            setScore(prevScore)
            setMyVote(prevVote)
        } finally {
            setVoting(false)
        }
    }

    async function handleDelete() {
        if (!confirm(t('delete_confirm'))) return
        setBusy(true)
        try {
            const res = await fetch(`/api/comments/${comment.id}`, { method: 'DELETE' })
            if (!res.ok) {
                alert('No se pudo eliminar.')
                return
            }
            router.refresh()
        } finally {
            setBusy(false)
        }
    }

    async function togglePinned() {
        setBusy(true)
        try {
            await fetch(`/api/comments/${comment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_pinned: !comment.is_pinned }),
            })
            router.refresh()
        } finally {
            setBusy(false)
        }
    }

    async function toggleHidden() {
        setBusy(true)
        try {
            await fetch(`/api/comments/${comment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_hidden: !comment.is_hidden }),
            })
            router.refresh()
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className={`${isReply ? 'pl-6 border-l-2 border-gray-800/60' : ''}`}>
            <div className={`rounded-xl ${comment.is_pinned ? 'border border-blue-500/30 bg-blue-500/[0.03]' : 'border border-gray-800/60 bg-[#0F1114]'} p-4 ${comment.is_hidden ? 'opacity-50' : ''}`}>
                {comment.is_pinned && (
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-2">
                        <Pin size={10} /> {t('pinned_label')}
                    </p>
                )}
                {comment.is_hidden && (
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-2">
                        <EyeOff size={10} /> {t('hidden_label')}
                    </p>
                )}

                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <Link href={`/${handle}`} className="shrink-0">
                        {author?.avatar_url ? (
                            <img src={author.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-700" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-bold text-gray-300">
                                {initial}
                            </div>
                        )}
                    </Link>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/${handle}`} className="text-sm font-bold text-white hover:text-blue-400 transition">
                                {displayName}
                            </Link>
                            <span className="text-[11px] text-gray-600">@{handle}</span>
                            <span className="text-[11px] text-gray-600">·</span>
                            <span className="text-[11px] text-gray-500">{timeAgo(comment.created_at)}</span>
                            {comment.edited_at && <span className="text-[11px] text-gray-600 italic">· {t('edited')}</span>}
                        </div>

                        {/* Body or editing */}
                        {editing ? (
                            <div className="mt-2">
                                <CommentComposer
                                    episodeId={episodeId}
                                    parentId={null}
                                    editingId={comment.id}
                                    initialBody={comment.body}
                                    onCancel={() => setEditing(false)}
                                    onSaved={() => setEditing(false)}
                                />
                            </div>
                        ) : (
                            <p className="mt-1.5 text-[15px] text-gray-200 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                                {comment.body}
                            </p>
                        )}

                        {/* Actions row */}
                        {!editing && (
                            <div className="flex items-center gap-1 mt-2">
                                {/* Upvote */}
                                <button
                                    onClick={() => vote(1)}
                                    disabled={voting}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition ${
                                        myVote === 1
                                            ? 'bg-blue-500/15 text-blue-400'
                                            : 'text-gray-500 hover:bg-white/5 hover:text-blue-400'
                                    }`}
                                    aria-pressed={myVote === 1}
                                    title={t('vote_up')}
                                >
                                    <ThumbsUp size={13} className={myVote === 1 ? 'fill-current' : ''} />
                                    {score !== 0 && <span>{score}</span>}
                                </button>
                                {/* Downvote */}
                                <button
                                    onClick={() => vote(-1)}
                                    disabled={voting}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition ${
                                        myVote === -1
                                            ? 'bg-red-500/10 text-red-400'
                                            : 'text-gray-500 hover:bg-white/5 hover:text-red-400'
                                    }`}
                                    aria-pressed={myVote === -1}
                                    title={t('vote_down')}
                                >
                                    <ThumbsDown size={13} className={myVote === -1 ? 'fill-current' : ''} />
                                </button>

                                {/* Reply (solo en root, un nivel) */}
                                {!isReply && currentUserId && (
                                    <button
                                        onClick={() => setReplying((r) => !r)}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-gray-500 hover:bg-white/5 hover:text-white transition"
                                    >
                                        <Reply size={13} /> {t('reply')}
                                    </button>
                                )}

                                {/* Kebab */}
                                {(canEdit || canDelete || canModerate) && (
                                    <div ref={menuRef} className="relative ml-auto">
                                        <button
                                            onClick={() => setMenuOpen((o) => !o)}
                                            disabled={busy}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition"
                                            aria-haspopup="menu"
                                        >
                                            {busy ? <Loader2 size={13} className="animate-spin" /> : <MoreHorizontal size={13} />}
                                        </button>
                                        {menuOpen && (
                                            <div role="menu" className="absolute right-0 top-full mt-1 w-44 bg-[#0F1114] border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-30">
                                                {canEdit && (
                                                    <button
                                                        onClick={() => { setMenuOpen(false); setEditing(true) }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-200 hover:bg-white/5 transition text-left"
                                                    >
                                                        <Edit3 size={12} /> {t('edit')}
                                                    </button>
                                                )}
                                                {canModerate && !isReply && (
                                                    <button
                                                        onClick={() => { setMenuOpen(false); togglePinned() }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-200 hover:bg-white/5 transition text-left"
                                                    >
                                                        <Pin size={12} /> {comment.is_pinned ? t('unpin') : t('pin')}
                                                    </button>
                                                )}
                                                {canModerate && (
                                                    <button
                                                        onClick={() => { setMenuOpen(false); toggleHidden() }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-200 hover:bg-white/5 transition text-left"
                                                    >
                                                        <EyeOff size={12} /> {comment.is_hidden ? t('unhide') : t('hide')}
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => { setMenuOpen(false); handleDelete() }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition text-left"
                                                    >
                                                        <Trash2 size={12} /> {t('delete')}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reply composer */}
                        {replying && currentUserId && (
                            <div className="mt-3">
                                <CommentComposer
                                    episodeId={episodeId}
                                    parentId={comment.id}
                                    onCancel={() => setReplying(false)}
                                    onSaved={() => setReplying(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Replies */}
            {replies.length > 0 && (
                <div className="mt-3 space-y-3 pl-3">
                    {replies.map((r) => (
                        <CommentRow
                            key={r.id}
                            comment={r}
                            currentUserId={currentUserId}
                            isCreator={isCreator}
                            episodeId={episodeId}
                            isReply={true}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

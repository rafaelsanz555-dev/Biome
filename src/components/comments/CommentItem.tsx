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
        <div className={`${isReply ? 'border-l-2 border-[#171512]/10 pl-6' : ''}`}>
            <div className={`${comment.is_pinned ? 'border border-[#C9A84C]/40 bg-[#C9A84C]/8' : 'border border-[#171512]/10 bg-[#FFFCF5]'} p-4 ${comment.is_hidden ? 'opacity-50' : ''}`}>
                {comment.is_pinned && (
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8B6E1B]">
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
                            <img src={author.avatar_url} alt="" className="h-9 w-9 rounded-full border border-[#171512]/12 object-cover" />
                        ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#171512]/12 bg-[#EEE5D5] text-sm font-bold text-[#5F574B]">
                                {initial}
                            </div>
                        )}
                    </Link>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/${handle}`} className="text-sm font-bold text-[#171512] transition hover:text-[#A63D2D]">
                                {displayName}
                            </Link>
                            <span className="text-[11px] text-[#8A8174]">@{handle}</span>
                            <span className="text-[11px] text-[#9A9082]">·</span>
                            <span className="text-[11px] text-[#746A5C]">{timeAgo(comment.created_at)}</span>
                            {comment.edited_at && <span className="text-[11px] italic text-[#8A8174]">· {t('edited')}</span>}
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
                            <p className="mt-1.5 whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-[#2F2A24]">
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
                                            ? 'bg-[#C9A84C]/18 text-[#8B6E1B]'
                                            : 'text-[#746A5C] hover:bg-[#F0E8D9] hover:text-[#8B6E1B]'
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
                                            : 'text-[#746A5C] hover:bg-[#F0E8D9] hover:text-red-600'
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
                                        className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#746A5C] transition hover:bg-[#F0E8D9] hover:text-[#171512]"
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
                                            className="flex h-7 w-7 items-center justify-center text-[#746A5C] transition hover:bg-[#F0E8D9] hover:text-[#171512]"
                                            aria-haspopup="menu"
                                        >
                                            {busy ? <Loader2 size={13} className="animate-spin" /> : <MoreHorizontal size={13} />}
                                        </button>
                                        {menuOpen && (
                                            <div role="menu" className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden border border-[#171512]/12 bg-[#FFFCF5] shadow-xl">
                                                {canEdit && (
                                                    <button
                                                        onClick={() => { setMenuOpen(false); setEditing(true) }}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#2F2A24] transition hover:bg-[#F0E8D9]"
                                                    >
                                                        <Edit3 size={12} /> {t('edit')}
                                                    </button>
                                                )}
                                                {canModerate && !isReply && (
                                                    <button
                                                        onClick={() => { setMenuOpen(false); togglePinned() }}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#2F2A24] transition hover:bg-[#F0E8D9]"
                                                    >
                                                        <Pin size={12} /> {comment.is_pinned ? t('unpin') : t('pin')}
                                                    </button>
                                                )}
                                                {canModerate && (
                                                    <button
                                                        onClick={() => { setMenuOpen(false); toggleHidden() }}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#2F2A24] transition hover:bg-[#F0E8D9]"
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


import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { CommentComposer } from './CommentComposer'
import { CommentItem } from './CommentItem'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface Props {
    episodeId: string
    creatorId: string
}

export type CommentRow = {
    id: string
    parent_id: string | null
    body: string
    score: number
    is_hidden: boolean
    is_pinned: boolean
    edited_at: string | null
    created_at: string
    author_id: string
    profiles: {
        username: string | null
        full_name: string | null
        avatar_url: string | null
    } | null
    myVote?: number
}

export async function CommentSection({ episodeId, creatorId }: Props) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const t = await getTranslations('comments')

    // Pull all comments for this episode (capped 200 — paginado real cuando crezcan)
    const { data: rows } = await supabase
        .from('comments')
        .select('id, parent_id, body, score, is_hidden, is_pinned, edited_at, created_at, author_id, profiles:author_id(username, full_name, avatar_url)')
        .eq('episode_id', episodeId)
        .order('is_pinned', { ascending: false })
        .order('score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(200)

    let comments: CommentRow[] = (rows as any[]) || []

    // My votes (si logueado)
    if (user && comments.length > 0) {
        const ids = comments.map((c) => c.id)
        const { data: myVotes } = await supabase
            .from('comment_votes')
            .select('comment_id, value')
            .eq('user_id', user.id)
            .in('comment_id', ids)
        const voteMap: Record<string, number> = {}
        myVotes?.forEach((v) => { voteMap[v.comment_id] = v.value })
        comments = comments.map((c) => ({ ...c, myVote: voteMap[c.id] || 0 }))
    }

    // Tree: raíz + replies
    const roots = comments.filter((c) => !c.parent_id)
    const repliesByParent: Record<string, CommentRow[]> = {}
    comments.filter((c) => c.parent_id).forEach((c) => {
        const k = c.parent_id!
        if (!repliesByParent[k]) repliesByParent[k] = []
        repliesByParent[k].push(c)
    })
    // ordenar replies por antigüedad ascendente (conversación natural)
    Object.values(repliesByParent).forEach((arr) =>
        arr.sort((a, b) => a.created_at.localeCompare(b.created_at))
    )

    const isCreator = !!user && user.id === creatorId
    const totalCount = comments.length

    return (
        <section id="comments" className="mt-12 space-y-6 scroll-mt-20">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                <MessageCircle className="text-blue-400" size={20} />
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
                    {t('section_title')}
                </h2>
                <span className="text-sm text-gray-500">
                    {totalCount === 0
                        ? t('count_zero')
                        : totalCount === 1
                            ? t('count_one', { count: totalCount })
                            : t('count_other', { count: totalCount })}
                </span>
            </div>

            {user ? (
                <CommentComposer episodeId={episodeId} parentId={null} />
            ) : (
                <div className="rounded-xl border border-gray-800 bg-[#0F1114] p-5 text-sm text-gray-400">
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">Login</Link>
                    {' '}{t('login_prompt')}
                </div>
            )}

            {roots.length === 0 ? (
                <p className="text-sm text-gray-500 italic py-8 text-center">
                    {t('empty_state')}
                </p>
            ) : (
                <div className="space-y-5">
                    {roots.map((c) => (
                        <CommentItem
                            key={c.id}
                            comment={c}
                            replies={repliesByParent[c.id] || []}
                            currentUserId={user?.id || null}
                            isCreator={isCreator}
                            episodeId={episodeId}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

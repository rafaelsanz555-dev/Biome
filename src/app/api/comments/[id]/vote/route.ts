import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/comments/[id]/vote — body: { value: 1 | -1 | 0 }
// 1 = upvote, -1 = downvote, 0 = quitar voto
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    const value = body?.value
    if (value !== 1 && value !== -1 && value !== 0) {
        return NextResponse.json({ error: 'invalid_value' }, { status: 400 })
    }

    if (value === 0) {
        // quitar voto
        await supabase.from('comment_votes').delete().eq('comment_id', id).eq('user_id', user.id)
    } else {
        // upsert
        const { data: existing } = await supabase
            .from('comment_votes')
            .select('value')
            .eq('comment_id', id)
            .eq('user_id', user.id)
            .maybeSingle()
        if (existing) {
            await supabase
                .from('comment_votes')
                .update({ value })
                .eq('comment_id', id)
                .eq('user_id', user.id)
        } else {
            await supabase
                .from('comment_votes')
                .insert({ comment_id: id, user_id: user.id, value })
        }
    }

    // Trigger DB recalcula score; devolvemos el nuevo score
    const { data: updated } = await supabase
        .from('comments')
        .select('score')
        .eq('id', id)
        .maybeSingle()

    return NextResponse.json({ ok: true, score: updated?.score ?? 0 })
}

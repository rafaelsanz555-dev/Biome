import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/validation'

const voteSchema = z.object({ value: z.union([z.literal(1), z.literal(-1), z.literal(0)]) })

// POST /api/comments/[id]/vote — body: { value: 1 | -1 | 0 }
// 1 = upvote, -1 = downvote, 0 = quitar voto
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const parsed = parseJsonBody(voteSchema, await req.json().catch(() => null))
    if (!parsed.ok) return NextResponse.json({ error: 'invalid_value' }, { status: 400 })
    const { value } = parsed.data

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

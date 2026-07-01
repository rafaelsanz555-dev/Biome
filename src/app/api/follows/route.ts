import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/validation'

const followSchema = z.discriminatedUnion('targetType', [
    z.object({ targetType: z.literal('creator'), targetId: z.string().uuid() }),
    z.object({ targetType: z.literal('story'), targetId: z.string().uuid() }),
])

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const parsed = parseJsonBody(followSchema, await req.json().catch(() => null))
    if (!parsed.ok) return NextResponse.json({ error: 'invalid_body' }, { status: 400 })

    const { targetType, targetId } = parsed.data
    if (targetType === 'creator' && targetId === user.id) {
        return NextResponse.json({ error: 'cannot_follow_self' }, { status: 400 })
    }
    const table = targetType === 'creator' ? 'follows' : 'story_follows'
    const targetColumn = targetType === 'creator' ? 'creator_id' : 'season_id'

    const { data: existing } = await supabase
        .from(table)
        .select(targetColumn)
        .eq('follower_id', user.id)
        .eq(targetColumn, targetId)
        .maybeSingle()

    if (existing) {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('follower_id', user.id)
            .eq(targetColumn, targetId)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ ok: true, following: false })
    }

    const { error } = await supabase
        .from(table)
        .insert({ follower_id: user.id, [targetColumn]: targetId })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, following: true })
}

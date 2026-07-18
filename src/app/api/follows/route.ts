import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/validation'
import { createAdminClient } from '@/lib/supabase/admin'

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

    try {
        const admin = createAdminClient()
        const [{ data: actor }, targetCreator] = await Promise.all([
            admin.from('profiles').select('username, full_name').eq('id', user.id).maybeSingle(),
            targetType === 'creator'
                ? Promise.resolve(targetId)
                : admin.from('seasons').select('creator_id').eq('id', targetId).maybeSingle().then(({ data }) => data?.creator_id || null),
        ])
        if (targetCreator && targetCreator !== user.id) {
            const actorName = actor?.full_name || actor?.username || 'Alguien'
            await admin.from('notifications').insert({
                user_id: targetCreator,
                actor_id: user.id,
                type: targetType === 'creator' ? 'new_follower' : 'story_follower',
                reference_id: targetId,
                message: targetType === 'creator'
                    ? `${actorName} empezó a seguirte.`
                    : `${actorName} empezó a seguir una de tus obras.`,
            })
        }
    } catch (notificationError) {
        console.error('[follow notification]', notificationError)
    }
    return NextResponse.json({ ok: true, following: true })
}

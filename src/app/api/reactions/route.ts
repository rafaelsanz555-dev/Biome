import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/validation'

// OJO: esta lista debe coincidir byte a byte con los emojis que envía el front
// (EmotionalReactions / EpisodeFeedActions). Antes estaba con doble encoding
// y TODAS las reacciones fallaban con invalid_emoji.
const VALID_EMOJIS = ['❤️', '🔥', '😢', '😡', '🤯', '😂']
const reactionSchema = z.object({
    episode_id: z.string().uuid(),
    emoji: z.string().refine((emoji) => VALID_EMOJIS.includes(emoji), 'invalid_emoji'),
})

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = parseJsonBody(reactionSchema, await req.json().catch(() => null))
    if (!parsed.ok) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    const { episode_id, emoji } = parsed.data

    const { data: existing } = await supabase
        .from('reactions')
        .select('id, emoji')
        .eq('episode_id', episode_id)
        .eq('user_id', user.id)
        .maybeSingle()

    if (existing) {
        if (existing.emoji === emoji) {
            await supabase.from('reactions').delete().eq('id', existing.id)
            return NextResponse.json({ ok: true, action: 'removed' })
        }

        await supabase.from('reactions').update({ emoji }).eq('id', existing.id)
        return NextResponse.json({ ok: true, action: 'updated' })
    }

    const { error } = await supabase
        .from('reactions')
        .insert({ episode_id, user_id: user.id, emoji })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, action: 'added' })
}

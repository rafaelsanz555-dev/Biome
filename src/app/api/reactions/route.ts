import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_EMOJIS = ['❤️', '🔥', '😢', '😡', '🤯', '😂']

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { episode_id, emoji } = body

    if (!episode_id || !emoji || !VALID_EMOJIS.includes(emoji)) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Upsert (one reaction per user per episode)
    const { data: existing } = await supabase
        .from('reactions')
        .select('id, emoji')
        .eq('episode_id', episode_id)
        .eq('user_id', user.id)
        .maybeSingle()

    if (existing) {
        if (existing.emoji === emoji) {
            // Toggle off
            await supabase.from('reactions').delete().eq('id', existing.id)
            return NextResponse.json({ ok: true, action: 'removed' })
        }
        // Change emoji
        await supabase.from('reactions').update({ emoji }).eq('id', existing.id)
        return NextResponse.json({ ok: true, action: 'updated' })
    }

    // New reaction
    const { error } = await supabase
        .from('reactions')
        .insert({ episode_id, user_id: user.id, emoji })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, action: 'added' })
}

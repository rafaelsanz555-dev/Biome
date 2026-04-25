import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    if (!body?.episode_id) return NextResponse.json({ error: 'invalid' }, { status: 400 })

    const pct = Math.max(0, Math.min(100, Number(body.reached_percent ?? 0)))
    const completed = !!body.completed

    const { error } = await supabase
        .from('reading_bookmarks')
        .upsert(
            {
                user_id: user.id,
                episode_id: body.episode_id,
                reached_percent: pct,
                completed,
                last_position_text: typeof body.last_position_text === 'string' ? body.last_position_text.slice(0, 500) : null,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,episode_id' }
        )

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
}

export async function GET(_req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ bookmarks: [] })

    const { data } = await supabase
        .from('reading_bookmarks')
        .select('episode_id, reached_percent, completed, updated_at, episodes(id, title, cover_image_url, creator_id, profiles:creator_id(username, full_name, avatar_url))')
        .eq('user_id', user.id)
        .eq('completed', false)
        .gt('reached_percent', 5)
        .order('updated_at', { ascending: false })
        .limit(8)

    return NextResponse.json({ bookmarks: data ?? [] })
}

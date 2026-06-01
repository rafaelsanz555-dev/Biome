import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/validation'

const bookmarkSchema = z.object({
    episode_id: z.string().uuid(),
    reached_percent: z.coerce.number().min(0).max(100).default(0),
    completed: z.boolean().optional().default(false),
    last_position_text: z.string().max(500).nullable().optional(),
})

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const parsed = parseJsonBody(bookmarkSchema, await req.json().catch(() => null))
    if (!parsed.ok) return NextResponse.json({ error: 'invalid_body', details: parsed.error }, { status: 400 })
    const body = parsed.data

    const { error } = await supabase
        .from('reading_bookmarks')
        .upsert(
            {
                user_id: user.id,
                episode_id: body.episode_id,
                reached_percent: body.reached_percent,
                completed: body.completed,
                last_position_text: body.last_position_text || null,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,episode_id' }
        )

    if (error) {
        const isMigrationMissing = /schema cache|does not exist|relation .* does not exist/i.test(error.message)
        if (isMigrationMissing) return NextResponse.json({ ok: true, disabled: true })
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
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

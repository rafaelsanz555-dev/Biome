import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/seasons — crear una serie inline desde el form de publicar
export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    const title = typeof body?.title === 'string' ? body.title.trim() : ''
    const description = typeof body?.description === 'string' ? body.description.trim() : ''
    const formatRaw = typeof body?.format === 'string' ? body.format : 'series'
    const format = formatRaw === 'thread' ? 'thread' : 'series'

    if (title.length < 1 || title.length > 120) {
        return NextResponse.json({ error: 'invalid_title' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('seasons')
        .insert({
            creator_id: user.id,
            title,
            description: description || null,
            sort_order: 1,
            format,
        })
        .select('id, title, format')
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, season: data })
}

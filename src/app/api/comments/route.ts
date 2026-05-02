import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/comments — crear comentario
export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'invalid_json' }, { status: 400 })

    const episode_id = typeof body.episode_id === 'string' ? body.episode_id : null
    const parent_id = typeof body.parent_id === 'string' ? body.parent_id : null
    const text = typeof body.body === 'string' ? body.body.trim() : ''

    if (!episode_id) return NextResponse.json({ error: 'missing_episode_id' }, { status: 400 })
    if (text.length < 1 || text.length > 2000) {
        return NextResponse.json({ error: 'body_length' }, { status: 400 })
    }

    // Anti-spam ligero: rate limit 5 / 60s
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    const { count: recentCount } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', user.id)
        .gte('created_at', oneMinuteAgo)
    if ((recentCount || 0) >= 5) {
        return NextResponse.json({ error: 'rate_limit' }, { status: 429 })
    }

    // Si parent_id viene, validar que es comentario raíz del mismo episodio (un solo nivel)
    if (parent_id) {
        const { data: parent } = await supabase
            .from('comments')
            .select('id, episode_id, parent_id')
            .eq('id', parent_id)
            .maybeSingle()
        if (!parent || parent.episode_id !== episode_id || parent.parent_id !== null) {
            return NextResponse.json({ error: 'invalid_parent' }, { status: 400 })
        }
    }

    const { data: inserted, error } = await supabase
        .from('comments')
        .insert({
            episode_id,
            author_id: user.id,
            parent_id,
            body: text,
        })
        .select('id')
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, id: inserted.id })
}

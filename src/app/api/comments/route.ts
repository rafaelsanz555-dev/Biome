import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/validation'

const createCommentSchema = z.object({
    episode_id: z.string().uuid(),
    parent_id: z.string().uuid().nullable().optional(),
    body: z.string().trim().min(1).max(2000),
})

// POST /api/comments — crear comentario
export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const parsed = parseJsonBody(createCommentSchema, await req.json().catch(() => null))
    if (!parsed.ok) return NextResponse.json({ error: 'invalid_body', details: parsed.error }, { status: 400 })

    const { episode_id, parent_id = null, body: text } = parsed.data

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

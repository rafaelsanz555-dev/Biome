import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/comments/[id] — editar (autor) o pin/hide (creator del episodio)
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'invalid_json' }, { status: 400 })

    // Buscar comentario + creator del episodio
    const { data: comment } = await supabase
        .from('comments')
        .select('id, author_id, episode_id, episodes(creator_id)')
        .eq('id', id)
        .maybeSingle()
    if (!comment) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    const isAuthor = comment.author_id === user.id
    // @ts-ignore — embedded relation typing
    const isCreator = comment.episodes?.creator_id === user.id

    const update: any = {}

    // Autor edita su body
    if (typeof body.body === 'string' && isAuthor) {
        const text = body.body.trim()
        if (text.length < 1 || text.length > 2000) {
            return NextResponse.json({ error: 'body_length' }, { status: 400 })
        }
        update.body = text
        update.edited_at = new Date().toISOString()
    }

    // Creator pin/hide
    if (typeof body.is_pinned === 'boolean' && isCreator) {
        update.is_pinned = body.is_pinned
    }
    if (typeof body.is_hidden === 'boolean' && isCreator) {
        update.is_hidden = body.is_hidden
    }

    if (Object.keys(update).length === 0) {
        return NextResponse.json({ error: 'forbidden_or_empty' }, { status: 403 })
    }

    const { error } = await supabase.from('comments').update(update).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
}

// DELETE /api/comments/[id] — autor o creator del episodio
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    // RLS valida; igual chequeamos para 404 limpio
    const { data: existing } = await supabase
        .from('comments')
        .select('id')
        .eq('id', id)
        .maybeSingle()
    if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
}

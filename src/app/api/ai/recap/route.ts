import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRecap } from '@/lib/ai'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    if (!body?.episode_id) return NextResponse.json({ error: 'invalid' }, { status: 400 })

    // Solo el creador puede regenerar el recap
    const { data: ep } = await supabase
        .from('episodes')
        .select('id, full_text, creator_id, auto_recap')
        .eq('id', body.episode_id)
        .single()
    if (!ep) return NextResponse.json({ error: 'not_found' }, { status: 404 })
    if (ep.creator_id !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const recap = await generateRecap(ep.full_text || '')
    if (!recap) return NextResponse.json({ error: 'ai_unavailable' }, { status: 503 })

    await supabase.from('episodes').update({ auto_recap: recap }).eq('id', ep.id)
    await supabase.from('ai_assists').insert({
        user_id: user.id,
        episode_id: ep.id,
        assist_type: 'recap',
        input_length: (ep.full_text || '').length,
        output_length: recap.length,
        model: process.env.ANTHROPIC_MODEL || 'claude-opus-4-7',
    })

    return NextResponse.json({ recap })
}

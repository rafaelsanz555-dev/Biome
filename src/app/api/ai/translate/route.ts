import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { translateToEnglish } from '@/lib/ai'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    if (!body?.text || typeof body.text !== 'string') return NextResponse.json({ error: 'invalid' }, { status: 400 })
    const text = body.text.slice(0, 8000)

    const out = await translateToEnglish(text)
    if (!out) return NextResponse.json({ error: 'ai_unavailable' }, { status: 503 })

    await supabase.from('ai_assists').insert({
        user_id: user.id,
        episode_id: body.episode_id || null,
        assist_type: 'translate',
        input_length: text.length,
        output_length: out.length,
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
    })

    return NextResponse.json({ output: out })
}

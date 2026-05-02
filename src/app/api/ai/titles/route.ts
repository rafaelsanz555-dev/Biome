import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { suggestTitles } from '@/lib/ai'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    if (!body?.text || typeof body.text !== 'string') return NextResponse.json({ error: 'invalid' }, { status: 400 })
    const text = body.text.slice(0, 8000)

    const titles = await suggestTitles(text)
    if (!titles) return NextResponse.json({ error: 'ai_unavailable' }, { status: 503 })

    await supabase.from('ai_assists').insert({
        user_id: user.id,
        episode_id: body.episode_id || null,
        assist_type: 'suggest_titles',
        input_length: text.length,
        output_length: titles.join('\n').length,
        model: process.env.ANTHROPIC_MODEL || 'claude-opus-4-7',
    })

    return NextResponse.json({ titles })
}

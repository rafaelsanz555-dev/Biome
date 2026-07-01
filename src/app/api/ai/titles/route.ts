import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { suggestTitles } from '@/lib/ai'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/validation'

const aiTextSchema = z.object({
    text: z.string().trim().min(1).max(8000),
    episode_id: z.string().uuid().optional().nullable(),
})

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    // Herramienta de escritor: cada llamada cuesta tokens — solo creators
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role !== 'creator') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const parsed = parseJsonBody(aiTextSchema, await req.json().catch(() => null))
    if (!parsed.ok) return NextResponse.json({ error: 'invalid', details: parsed.error }, { status: 400 })
    const { text, episode_id } = parsed.data

    const titles = await suggestTitles(text)
    if (!titles) return NextResponse.json({ error: 'ai_unavailable' }, { status: 503 })

    await supabase.from('ai_assists').insert({
        user_id: user.id,
        episode_id: episode_id || null,
        assist_type: 'suggest_titles',
        input_length: text.length,
        output_length: titles.join('\n').length,
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
    })

    return NextResponse.json({ titles })
}

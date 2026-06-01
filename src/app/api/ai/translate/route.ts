import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { translateToEnglish } from '@/lib/ai'
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

    const parsed = parseJsonBody(aiTextSchema, await req.json().catch(() => null))
    if (!parsed.ok) return NextResponse.json({ error: 'invalid', details: parsed.error }, { status: 400 })
    const { text, episode_id } = parsed.data

    const out = await translateToEnglish(text)
    if (!out) return NextResponse.json({ error: 'ai_unavailable' }, { status: 503 })

    await supabase.from('ai_assists').insert({
        user_id: user.id,
        episode_id: episode_id || null,
        assist_type: 'translate',
        input_length: text.length,
        output_length: out.length,
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
    })

    return NextResponse.json({ output: out })
}

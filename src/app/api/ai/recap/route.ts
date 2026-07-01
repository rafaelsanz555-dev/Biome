import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateRecap } from '@/lib/ai'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/validation'

const recapSchema = z.object({ episode_id: z.string().uuid() })

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const parsed = parseJsonBody(recapSchema, await req.json().catch(() => null))
    if (!parsed.ok) return NextResponse.json({ error: 'invalid', details: parsed.error }, { status: 400 })
    const { episode_id } = parsed.data

    // Solo el creador puede regenerar el recap — validamos ownership con la
    // sesión, y leemos full_text con admin (columna revocada para sesiones)
    const { data: ep } = await supabase
        .from('episodes')
        .select('id, creator_id, auto_recap')
        .eq('id', episode_id)
        .maybeSingle()
    if (!ep) return NextResponse.json({ error: 'not_found' }, { status: 404 })
    if (ep.creator_id !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    let fullText = ''
    try {
        const admin = createAdminClient()
        const { data: content } = await admin
            .from('episodes')
            .select('full_text')
            .eq('id', episode_id)
            .maybeSingle()
        fullText = content?.full_text || ''
    } catch {
        const { data: content } = await supabase
            .from('episodes')
            .select('full_text')
            .eq('id', episode_id)
            .maybeSingle()
        fullText = content?.full_text || ''
    }

    const recap = await generateRecap(fullText)
    if (!recap) return NextResponse.json({ error: 'ai_unavailable' }, { status: 503 })

    await supabase.from('episodes').update({ auto_recap: recap }).eq('id', ep.id)
    await supabase.from('ai_assists').insert({
        user_id: user.id,
        episode_id: ep.id,
        assist_type: 'recap',
        input_length: fullText.length,
        output_length: recap.length,
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
    })

    return NextResponse.json({ recap })
}

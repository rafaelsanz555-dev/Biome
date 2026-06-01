import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/validation'
import { slugify } from '@/lib/slugs'

const seasonSchema = z.object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500).optional().default(''),
    format: z.enum(['series', 'thread']).optional().default('series'),
})

// POST /api/seasons — crear una serie inline desde el form de publicar
export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const parsed = parseJsonBody(seasonSchema, await req.json().catch(() => null))
    if (!parsed.ok) return NextResponse.json({ error: 'invalid_body', details: parsed.error }, { status: 400 })
    const { title, description, format } = parsed.data

    const { data, error } = await supabase
        .from('seasons')
        .insert({
            creator_id: user.id,
            title,
            description: description || null,
            slug: `${slugify(title)}-${Date.now().toString(36).slice(-4)}`,
            sort_order: 1,
            format,
        })
        .select('id, title, format, slug')
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, season: data })
}

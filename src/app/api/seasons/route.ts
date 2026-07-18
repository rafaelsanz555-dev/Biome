import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/validation'
import { slugify } from '@/lib/slugs'

const seasonSchema = z.object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500).optional().default(''),
    format: z.enum(['series', 'thread']).optional().default('series'),
    story_type: z.enum(['life_story', 'fiction']).optional().default('life_story'),
})

// POST /api/seasons — crear una serie inline desde el form de publicar
export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
    if (profile?.role !== 'creator') {
        return NextResponse.json({ error: 'Necesitas una cuenta de escritor para crear series.' }, { status: 403 })
    }

    const parsed = parseJsonBody(seasonSchema, await req.json().catch(() => null))
    if (!parsed.ok) return NextResponse.json({ error: 'invalid_body', details: parsed.error }, { status: 400 })
    const { title, description, format, story_type } = parsed.data

    let { data, error } = await supabase
        .from('seasons')
        .insert({
            creator_id: user.id,
            title,
            description: description || null,
            slug: `${slugify(title)}-${Date.now().toString(36).slice(-4)}`,
            sort_order: 1,
            format,
            story_type,
        })
        .select('id, title, format, story_type, slug')
        .single()

    if (error && /story_type|schema cache/i.test(error.message)) {
        const fallback = await supabase
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
        data = fallback.data ? { ...fallback.data, story_type } : null
        error = fallback.error
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, season: data })
}

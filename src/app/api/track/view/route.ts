import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/validation'

const viewSchema = z.object({
    episode_id: z.string().uuid(),
    anon_id: z.string().max(120).nullable().optional(),
    referrer: z.string().max(500).nullable().optional(),
    device_type: z.enum(['mobile', 'desktop', 'tablet']).optional().default('desktop'),
})

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const parsed = parseJsonBody(viewSchema, await req.json().catch(() => null))
    if (!parsed.ok) return NextResponse.json({ error: 'invalid_body', details: parsed.error }, { status: 400 })
    const body = parsed.data

    const country = req.headers.get('x-vercel-ip-country') || null

    const { data, error } = await supabase
        .from('episode_views')
        .insert({
            episode_id: body.episode_id,
            viewer_id: user?.id ?? null,
            anon_id: user ? null : body.anon_id ?? null,
            country_code: country,
            referrer: body.referrer || null,
            device_type: body.device_type,
        })
        .select('id')
        .single()

    // Soft-fail when DB tables aren't migrated yet (PGRST205 / "schema cache")
    if (error) {
        const isMigrationMissing = /schema cache|does not exist|relation .* does not exist/i.test(error.message)
        if (isMigrationMissing) {
            // Return 200 so client tracker doesn't spam console — feature simply disabled.
            return NextResponse.json({ view_id: null, disabled: true })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create an initial reading_sessions row
    await supabase.from('reading_sessions').insert({ view_id: data.id, reached_percent: 0, time_spent_seconds: 0 })

    return NextResponse.json({ view_id: data.id })
}

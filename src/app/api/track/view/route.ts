import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json().catch(() => null)
    if (!body?.episode_id) return NextResponse.json({ error: 'invalid' }, { status: 400 })

    const country = req.headers.get('x-vercel-ip-country') || null

    const { data, error } = await supabase
        .from('episode_views')
        .insert({
            episode_id: body.episode_id,
            viewer_id: user?.id ?? null,
            anon_id: user ? null : body.anon_id ?? null,
            country_code: country,
            referrer: typeof body.referrer === 'string' ? body.referrer.slice(0, 500) : null,
            device_type: ['mobile', 'desktop', 'tablet'].includes(body.device_type) ? body.device_type : 'desktop',
        })
        .select('id')
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Create an initial reading_sessions row
    await supabase.from('reading_sessions').insert({ view_id: data.id, reached_percent: 0, time_spent_seconds: 0 })

    return NextResponse.json({ view_id: data.id })
}

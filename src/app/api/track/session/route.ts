import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function handler(req: Request) {
    const supabase = await createClient()
    const body = await req.json().catch(() => null)
    if (!body?.view_id) return NextResponse.json({ error: 'invalid' }, { status: 400 })

    const pct = Math.max(0, Math.min(100, Number(body.reached_percent ?? 0)))
    const sec = Math.max(0, Math.min(24 * 3600, Number(body.time_spent_seconds ?? 0)))

    await supabase
        .from('reading_sessions')
        .update({
            reached_percent: pct,
            time_spent_seconds: sec,
            completed: !!body.completed,
            updated_at: new Date().toISOString(),
        })
        .eq('view_id', body.view_id)

    return NextResponse.json({ ok: true })
}

export const POST = handler
export const PATCH = handler

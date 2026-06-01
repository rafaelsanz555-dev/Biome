import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/validation'

const sessionSchema = z.object({
    view_id: z.string().uuid(),
    reached_percent: z.coerce.number().min(0).max(100).default(0),
    time_spent_seconds: z.coerce.number().min(0).max(24 * 3600).default(0),
    completed: z.boolean().optional().default(false),
})

async function handler(req: Request) {
    const supabase = await createClient()
    const parsed = parseJsonBody(sessionSchema, await req.json().catch(() => null))
    if (!parsed.ok) return NextResponse.json({ error: 'invalid_body', details: parsed.error }, { status: 400 })
    const body = parsed.data

    await supabase
        .from('reading_sessions')
        .update({
            reached_percent: body.reached_percent,
            time_spent_seconds: body.time_spent_seconds,
            completed: body.completed,
            updated_at: new Date().toISOString(),
        })
        .eq('view_id', body.view_id)

    return NextResponse.json({ ok: true })
}

export const POST = handler
export const PATCH = handler

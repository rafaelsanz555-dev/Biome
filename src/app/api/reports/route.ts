import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_TARGETS = new Set(['episode', 'profile', 'comment'])
const VALID_REASONS = new Set(['copyright', 'harassment', 'explicit', 'spam', 'other'])

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 })

    const { target_type, target_id, reason, description } = body
    if (!VALID_TARGETS.has(target_type)) return NextResponse.json({ error: 'invalid target_type' }, { status: 400 })
    if (!VALID_REASONS.has(reason)) return NextResponse.json({ error: 'invalid reason' }, { status: 400 })
    if (typeof target_id !== 'string' || target_id.length < 8) return NextResponse.json({ error: 'invalid target_id' }, { status: 400 })

    const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        target_type,
        target_id,
        reason,
        description: typeof description === 'string' ? description.slice(0, 1000) : null,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
}

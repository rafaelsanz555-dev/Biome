import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/validation'

const reportSchema = z.object({
    target_type: z.enum(['episode', 'profile', 'comment']),
    target_id: z.string().min(8).max(80),
    reason: z.enum(['copyright', 'harassment', 'explicit', 'privacy', 'impersonation', 'underage', 'spam', 'other']),
    description: z.string().trim().max(1000).optional().nullable(),
})

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const parsed = parseJsonBody(reportSchema, await req.json().catch(() => null))
    if (!parsed.ok) return NextResponse.json({ error: 'invalid body', details: parsed.error }, { status: 400 })
    const { target_type, target_id, reason, description } = parsed.data

    const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        target_type,
        target_id,
        reason,
        description: description || null,
    })

    if (error) {
        const isMigrationMissing = /schema cache|does not exist|relation .* does not exist/i.test(error.message)
        if (isMigrationMissing) return NextResponse.json({ ok: true, disabled: true })
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
}

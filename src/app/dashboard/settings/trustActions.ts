'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const VALID_FREQUENCIES = ['weekly', 'biweekly', 'monthly', 'irregular'] as const
const VALID_STATUSES = ['active', 'paused', 'completed', 'planning'] as const

interface Input {
    posting_frequency: string
    frequency_promise: string | null
    series_status: string
    why_i_write: string | null
}
const trustSchema = z.object({
    posting_frequency: z.enum(VALID_FREQUENCIES).default('irregular'),
    frequency_promise: z.string().trim().max(60).nullable().optional(),
    series_status: z.enum(VALID_STATUSES).default('active'),
    why_i_write: z.string().trim().max(280).nullable().optional(),
})

export async function saveTrustSettings(input: Input) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const parsed = trustSchema.safeParse(input)
    if (!parsed.success) return { error: 'invalid_trust_settings' }
    const freq = parsed.data.posting_frequency
    const status = parsed.data.series_status
    const promise = parsed.data.frequency_promise || null
    const whyIWrite = parsed.data.why_i_write || null

    // upsert: si la fila creators no existe, update() no guardaría nada y no daría error
    const { error } = await supabase
        .from('creators')
        .upsert({
            profile_id: user.id,
            posting_frequency: freq,
            frequency_promise: promise,
            series_status: status,
            why_i_write: whyIWrite,
        }, { onConflict: 'profile_id' })

    if (error) return { error: error.message }

    // Get username for revalidation
    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    if (profile?.username) revalidatePath(`/${profile.username}`)
    revalidatePath('/dashboard/settings')

    return { ok: true }
}

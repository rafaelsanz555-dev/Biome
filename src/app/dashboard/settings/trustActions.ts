'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const VALID_FREQUENCIES = ['weekly', 'biweekly', 'monthly', 'irregular'] as const
const VALID_STATUSES = ['active', 'paused', 'completed', 'planning'] as const

interface Input {
    posting_frequency: string
    frequency_promise: string | null
    series_status: string
    why_i_write: string | null
}

export async function saveTrustSettings(input: Input) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const freq = VALID_FREQUENCIES.includes(input.posting_frequency as any) ? input.posting_frequency : 'irregular'
    const status = VALID_STATUSES.includes(input.series_status as any) ? input.series_status : 'active'
    const promise = input.frequency_promise ? input.frequency_promise.slice(0, 60) : null
    const whyIWrite = input.why_i_write ? input.why_i_write.slice(0, 280) : null

    const { error } = await supabase
        .from('creators')
        .update({
            posting_frequency: freq,
            frequency_promise: promise,
            series_status: status,
            why_i_write: whyIWrite,
        })
        .eq('profile_id', user.id)

    if (error) return { error: error.message }

    // Get username for revalidation
    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    if (profile?.username) revalidatePath(`/${profile.username}`)
    revalidatePath('/dashboard/settings')

    return { ok: true }
}

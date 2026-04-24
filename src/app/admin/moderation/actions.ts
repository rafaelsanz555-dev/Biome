'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function resolveReport(reportId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
        .from('reports')
        .update({ status: 'resolved', resolved_by: user.id, resolved_at: new Date().toISOString() })
        .eq('id', reportId)
    revalidatePath('/admin/moderation')
}

export async function dismissReport(reportId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
        .from('reports')
        .update({ status: 'dismissed', resolved_by: user.id, resolved_at: new Date().toISOString() })
        .eq('id', reportId)
    revalidatePath('/admin/moderation')
}

export async function resolveFlag(flagId: string) {
    const supabase = await createClient()
    await supabase.from('content_flags').update({ reviewed: true }).eq('id', flagId)
    revalidatePath('/admin/moderation')
}

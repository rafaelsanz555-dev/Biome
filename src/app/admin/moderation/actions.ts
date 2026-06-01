'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient, requireAdmin } from '@/lib/supabase/admin'

const idSchema = z.string().uuid()

export async function resolveReport(reportId: string) {
    const parsed = idSchema.safeParse(reportId)
    const admin = await requireAdmin()
    if (!parsed.success || !admin.ok) return

    const supabase = createAdminClient()
    await supabase
        .from('reports')
        .update({ status: 'resolved', resolved_by: admin.user.id, resolved_at: new Date().toISOString() })
        .eq('id', parsed.data)

    revalidatePath('/admin/moderation')
}

export async function dismissReport(reportId: string) {
    const parsed = idSchema.safeParse(reportId)
    const admin = await requireAdmin()
    if (!parsed.success || !admin.ok) return

    const supabase = createAdminClient()
    await supabase
        .from('reports')
        .update({ status: 'dismissed', resolved_by: admin.user.id, resolved_at: new Date().toISOString() })
        .eq('id', parsed.data)

    revalidatePath('/admin/moderation')
}

export async function resolveFlag(flagId: string) {
    const parsed = idSchema.safeParse(flagId)
    const admin = await requireAdmin()
    if (!parsed.success || !admin.ok) return

    const supabase = createAdminClient()
    await supabase.from('content_flags').update({ reviewed: true }).eq('id', parsed.data)
    revalidatePath('/admin/moderation')
}

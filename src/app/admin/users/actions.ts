'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient, requireAdmin } from '@/lib/supabase/admin'
import { adminRoleSchema } from '@/lib/validation'

const updateRoleSchema = z.object({
    profileId: z.string().uuid(),
    role: adminRoleSchema,
})

export async function updateUserRole(input: { profileId: string; role: string }) {
    const parsed = updateRoleSchema.safeParse(input)
    const admin = await requireAdmin()
    if (!parsed.success || !admin.ok) return { error: 'forbidden' }

    const supabase = createAdminClient()
    const { error } = await supabase
        .from('profiles')
        .update({ role: parsed.data.role })
        .eq('id', parsed.data.profileId)

    if (error) return { error: error.message }

    if (parsed.data.role === 'creator') {
        await supabase.from('creators').upsert({
            profile_id: parsed.data.profileId,
            subscription_price: 5,
            is_active: true,
        }, { onConflict: 'profile_id' })
    }

    revalidatePath('/admin/users')
    return { ok: true }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileSettingsSchema = z.object({
    full_name: z.string().trim().max(100).optional().default(''),
    bio: z.string().trim().max(500).optional().default(''),
    avatar_url: z.string().url().optional().or(z.literal('')),
    subscription_price: z.coerce.number().min(2).max(999).optional().nullable(),
})

export async function updateProfileSettings(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated.' }
    }

    const parsed = profileSettingsSchema.safeParse({
        full_name: formData.get('full_name') || '',
        bio: formData.get('bio') || '',
        avatar_url: formData.get('avatar_url') || '',
        subscription_price: formData.get('subscription_price') || null,
    })
    if (!parsed.success) {
        const fields = parsed.error.issues.map((i) => String(i.path[0]))
        if (fields.includes('subscription_price')) {
            return { error: 'El precio de suscripción debe estar entre $2 y $999 al mes.' }
        }
        if (fields.includes('full_name')) return { error: 'El nombre público no puede superar 100 caracteres.' }
        if (fields.includes('bio')) return { error: 'La biografía no puede superar 500 caracteres.' }
        return { error: 'Revisa los campos del formulario.' }
    }
    const { full_name, bio, avatar_url, subscription_price } = parsed.data

    // Update Profile
    const profileUpdates: any = {
        full_name,
        bio,
    }
    if (avatar_url) {
        profileUpdates.avatar_url = avatar_url
    }

    const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id)

    if (profileError) {
        console.error('Error updating profile:', profileError)
        return { error: 'No se pudo guardar tu perfil. Inténtalo de nuevo.' }
    }

    // Update Creator settings — UPSERT, no update:
    // update() sobre una fila inexistente afecta 0 filas SIN devolver error,
    // por eso el precio de suscripción "no se guardaba" cuando faltaba la fila creators
    if (subscription_price) {
        const { error: creatorError } = await supabase
            .from('creators')
            .upsert({ profile_id: user.id, subscription_price }, { onConflict: 'profile_id' })

        if (creatorError) {
            console.error('Error updating creator settings:', creatorError)
            return { error: 'No se pudo guardar el precio de suscripción. Inténtalo de nuevo.' }
        }
    }

    // Attempt to update Stripe if needed - for MVP, we'll just log or depend on the dynamic checkout 
    // to use the new price from DB when creating a session, keeping Stripe Products/Prices simple or lazy-created.

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard')
    revalidatePath(`/[username]`, 'layout') // Revalidate public profile

    return { success: true }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileSettings(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated.' }
    }

    const full_name = formData.get('full_name') as string
    const bio = formData.get('bio') as string
    const avatar_url = formData.get('avatar_url') as string
    const subscription_price = formData.get('subscription_price') as string

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
        return { error: 'Failed to update profile.' }
    }

    // Update Creator settings
    if (subscription_price) {
        const { error: creatorError } = await supabase
            .from('creators')
            .update({ subscription_price: parseFloat(subscription_price) })
            .eq('profile_id', user.id)

        if (creatorError) {
            console.error('Error updating creator settings:', creatorError)
            return { error: 'Failed to update subscription price.' }
        }
    }

    // Attempt to update Stripe if needed - for MVP, we'll just log or depend on the dynamic checkout 
    // to use the new price from DB when creating a session, keeping Stripe Products/Prices simple or lazy-created.

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard')
    revalidatePath(`/[username]`, 'layout') // Revalidate public profile

    return { success: true }
}

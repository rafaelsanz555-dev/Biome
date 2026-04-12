'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createEpisode(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Extract fields
    const title = formData.get('title') as string
    const preview_text = formData.get('preview_text') as string
    const full_text = formData.get('full_text') as string
    const cover_image_url = formData.get('cover_image_url') as string
    const season_id = formData.get('season_id') as string
    const is_published = formData.get('is_published') === 'true'
    const is_subscription_only = formData.get('monetization') === 'subscription'
    const ppv_price = formData.get('monetization') === 'ppv' ? parseFloat(formData.get('ppv_price') as string) : null

    if (!title || !full_text) {
        return { error: 'Title and Full Text are required' }
    }

    const { error } = await supabase.from('episodes').insert({
        creator_id: user.id,
        season_id: season_id || null,
        title,
        preview_text,
        full_text,
        cover_image_url,
        is_published,
        is_subscription_only,
        ppv_price,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/episodes')
    redirect('/dashboard/episodes')
}

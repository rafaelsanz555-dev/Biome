'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSeason(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!title) {
        throw new Error('Title is required')
    }

    const { error } = await supabase.from('seasons').insert({
        creator_id: user.id,
        title,
        description,
        sort_order: 1 // Default MVP MVP 
    })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/dashboard/seasons')
}

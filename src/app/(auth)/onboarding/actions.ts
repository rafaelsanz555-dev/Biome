'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function completeOnboarding(prevState: { error: string }, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const username = formData.get('username') as string
    const role = formData.get('role') as string // 'creator' or 'reader'

    // Server-side validation
    if (!username || username.trim() === '' || !role) {
        return { error: 'Username and Role are required.' }
    }

    // Regex for valid username (alphanumeric and underscores)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return { error: 'Username must be 3-20 characters long and can only contain letters, numbers, and underscores.' }
    }

    // Insert profile entry
    const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        username: username.toLowerCase().trim(),
        role: role,
    })

    if (profileError) {
        // If uniqueness constraint fails = code '23505'
        if (profileError.code === '23505') {
            return { error: 'Username is already taken.' }
        }
        return { error: profileError.message }
    }

    // If role is creator, insert into creators table
    if (role === 'creator') {
        const { error: creatorError } = await supabase.from('creators').insert({
            profile_id: user.id,
            subscription_price: 3.00, // Default MVP
            is_active: true
        })

        if (creatorError) {
            console.error('Error creating creator profile:', creatorError)
        }
    }

    // Redirect based on role
    if (role === 'creator') {
        redirect('/dashboard')
    } else {
        redirect('/discover')
    }
}

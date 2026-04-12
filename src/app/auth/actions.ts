'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = (formData.get('email') as string || '').trim()
    const password = formData.get('password') as string

    if (!email || !password) {
        redirect('/login?error=campos')
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        redirect('/login?error=credenciales')
    }

    // Check if profile exists
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()

        if (!profile) {
            redirect('/onboarding')
        }
        if (profile.role === 'creator') {
            redirect('/dashboard')
        }
    }

    redirect('/discover')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = (formData.get('email') as string || '').trim()
    const password = formData.get('password') as string

    if (!email || !password) {
        redirect('/login?mode=registro&error=campos')
    }

    if (password.length < 6) {
        redirect('/login?mode=registro&error=password_corto')
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
    })

    if (error) {
        if (error.message.includes('already registered')) {
            redirect('/login?error=existe')
        }
        redirect('/login?mode=registro&error=registro')
    }

    redirect('/onboarding')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

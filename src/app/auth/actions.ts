'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { recordLegalAcceptances } from '@/lib/legal'

const credentialsSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(6).max(128),
})

export async function login(formData: FormData) {
    const supabase = await createClient()

    const parsed = credentialsSchema.safeParse({ email: formData.get('email'), password: formData.get('password') })
    if (!parsed.success) redirect('/login?error=campos')
    const { email, password } = parsed.data

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

    const parsed = credentialsSchema.safeParse({ email: formData.get('email'), password: formData.get('password') })
    if (!parsed.success) redirect('/login?mode=registro&error=campos')
    const { email, password } = parsed.data

    const confirmPassword = formData.get('confirm_password')
    if (confirmPassword !== password) {
        redirect('/login?mode=registro&error=password_mismatch')
    }
    if (formData.get('accept_legal') !== 'on') {
        redirect('/login?mode=registro&error=legal_required')
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        if (error.message.includes('already registered')) {
            redirect('/login?error=existe')
        }
        redirect(`/login?mode=registro&error=registro&debug=${encodeURIComponent(error.message)}`)
    }

    // If user needs email confirmation (shouldn't happen with confirm OFF)
    if (data?.user?.identities?.length === 0) {
        redirect('/login?error=existe')
    }

    if (data.user) {
        await recordLegalAcceptances({
            userId: data.user.id,
            documents: ['terms', 'privacy', 'content_policy'],
            context: 'signup',
        })
    }

    redirect('/onboarding')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

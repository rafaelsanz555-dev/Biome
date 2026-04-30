'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { sendEmail } from '@/lib/email/client'
import { welcomeEmail } from '@/lib/email/templates'

export async function completeOnboarding(prevState: { error: string }, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const username = (formData.get('username') as string || '').trim().toLowerCase()
    const role = formData.get('role') as string
    const acceptTerms = formData.get('accept_terms')

    if (!username || !role) {
        return { error: 'El nombre de usuario y el rol son obligatorios.' }
    }

    if (!acceptTerms) {
        return { error: 'Debes aceptar los términos para continuar.' }
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return { error: 'El usuario debe tener 3–20 caracteres y solo puede contener letras, números y guiones bajos.' }
    }

    // Check if profile already exists (returning user)
    const { data: existing } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    if (existing) {
        // Already has a profile — redirect appropriately
        if (existing.role === 'creator') {
            redirect('/dashboard')
        } else {
            redirect('/dashboard')
        }
    }

    const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        username,
        role,
    })

    if (profileError) {
        if (profileError.code === '23505') {
            return { error: 'Ese nombre de usuario ya está tomado. Elige otro.' }
        }
        return { error: 'Error al crear el perfil. Intenta de nuevo.' }
    }

    if (role === 'creator') {
        const { error: creatorError } = await supabase.from('creators').insert({
            profile_id: user.id,
            subscription_price: 5.00,
            is_active: true,
        })

        if (creatorError) {
            // Si falla, hacer rollback del profile recién creado para evitar estados inconsistentes
            await supabase.from('profiles').delete().eq('id', user.id)
            console.error('[onboarding] creators.insert failed:', creatorError.message)
            return { error: 'No pudimos crear tu perfil de escritor. Intenta de nuevo en unos segundos.' }
        }
    }

    // Welcome email (fire-and-forget, no bloquea el redirect)
    if (user.email) {
        const { subject, html, text } = welcomeEmail({
            username,
            isCreator: role === 'creator',
        })
        sendEmail({ to: user.email, subject, html, text }).catch((e) =>
            console.error('[onboarding] welcome email failed:', e)
        )
    }

    redirect('/dashboard')
}

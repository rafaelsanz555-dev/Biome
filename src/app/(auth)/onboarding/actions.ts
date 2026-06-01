'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { sendEmail } from '@/lib/email/client'
import { welcomeEmail } from '@/lib/email/templates'
import { z } from 'zod'
import { profileRoleSchema, usernameSchema } from '@/lib/validation'

const onboardingSchema = z.object({
    username: usernameSchema,
    role: profileRoleSchema,
    accept_terms: z.literal(true),
})

export async function completeOnboarding(prevState: { error: string }, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const parsed = onboardingSchema.safeParse({
        username: formData.get('username'),
        role: formData.get('role'),
        accept_terms: formData.get('accept_terms') === 'on',
    })

    if (!parsed.success) {
        return { error: 'Revisa usuario, rol y terminos antes de continuar.' }
    }

    const { username, role } = parsed.data

    const { data: existing } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    if (existing) redirect('/dashboard')

    const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        username,
        role,
    })

    if (profileError) {
        if (profileError.code === '23505') {
            return { error: 'Ese nombre de usuario ya esta tomado. Elige otro.' }
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
            await supabase.from('profiles').delete().eq('id', user.id)
            console.error('[onboarding] creators.insert failed:', creatorError.message)
            return { error: 'No pudimos crear tu perfil de escritor. Intenta de nuevo en unos segundos.' }
        }
    }

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

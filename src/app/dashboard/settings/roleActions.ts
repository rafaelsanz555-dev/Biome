'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const targetRoleSchema = z.enum(['reader', 'creator'])

/**
 * Cambia el modo de cuenta entre lector y escritor.
 *
 * profiles.role está protegido por un trigger de DB (migración 017) que solo
 * permite cambios con service role — por eso usamos el admin client aquí,
 * limitado estrictamente a reader↔creator (nunca admin) y solo sobre la
 * cuenta del usuario autenticado.
 */
export async function switchRole(targetRole: string) {
    const parsed = targetRoleSchema.safeParse(targetRole)
    if (!parsed.success) return { error: 'Rol inválido.' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No has iniciado sesión.' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, username')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile) return { error: 'Completa el onboarding primero.' }
    if (profile.role === 'admin') return { error: 'Las cuentas admin no pueden cambiar de rol desde aquí.' }
    if (profile.role === parsed.data) return { error: null, role: parsed.data }

    let admin
    try {
        admin = createAdminClient()
    } catch {
        return { error: 'El cambio de rol no está disponible en este momento. Inténtalo más tarde.' }
    }

    const { error: roleError } = await admin
        .from('profiles')
        .update({ role: parsed.data })
        .eq('id', user.id)

    if (roleError) {
        console.error('[switchRole] role update failed:', roleError.message)
        return { error: 'No se pudo cambiar el modo de cuenta. Inténtalo de nuevo.' }
    }

    // Al activar modo escritor, garantizamos la fila de configuración creators.
    // Al volver a lector NO se borra nada: episodios, precio y marca quedan intactos.
    if (parsed.data === 'creator') {
        const { error: creatorError } = await admin
            .from('creators')
            .upsert({ profile_id: user.id, is_active: true }, { onConflict: 'profile_id' })
        if (creatorError) {
            console.error('[switchRole] creators upsert failed:', creatorError.message)
        }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    if (profile.username) revalidatePath(`/${profile.username}`)

    return { error: null, role: parsed.data }
}

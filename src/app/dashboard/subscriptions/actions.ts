'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'

/**
 * Cancela una suscripción al final del período actual.
 * El lector mantiene acceso hasta `valid_until` y luego pierde acceso automáticamente.
 * No reembolsa el pago en curso.
 */
export async function cancelSubscription(entitlementId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    // Verificar ownership
    const { data: entitlement, error: fetchErr } = await supabase
        .from('entitlements')
        .select('id, user_id, stripe_subscription_id, valid_until, creator_id')
        .eq('id', entitlementId)
        .maybeSingle()

    if (fetchErr || !entitlement) return { error: 'Suscripción no encontrada' }
    if (entitlement.user_id !== user.id) return { error: 'No autorizado' }

    if (!entitlement.stripe_subscription_id) {
        return { error: 'No se puede cancelar: falta referencia a Stripe' }
    }

    // Llamar a Stripe para cancel_at_period_end
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
        return { error: 'Stripe no está configurado en el servidor' }
    }

    try {
        const stripe = new Stripe(stripeKey, { apiVersion: '2026-01-28.clover' })
        await stripe.subscriptions.update(entitlement.stripe_subscription_id, {
            cancel_at_period_end: true,
        })
    } catch (e: any) {
        console.error('[cancel sub] stripe error:', e.message)
        return { error: 'No se pudo cancelar en Stripe: ' + e.message }
    }

    // Marcar como "cancelando" en nuestra DB (mantiene valid_until)
    const { error: updateErr } = await supabase
        .from('entitlements')
        .update({
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
        })
        .eq('id', entitlementId)

    if (updateErr) {
        // No es crítico — Stripe ya marcó cancel_at_period_end
        console.error('[cancel sub] db update failed:', updateErr.message)
    }

    revalidatePath('/dashboard/subscriptions')
    return { ok: true, validUntil: entitlement.valid_until }
}

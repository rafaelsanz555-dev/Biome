import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/client'
import { writerEarnings, platformFee } from '@/lib/fees'
import {
    subscriptionSuccessReaderEmail,
    subscriptionSuccessCreatorEmail,
    subscriptionCancelledEmail,
} from '@/lib/email/templates'

// Lazy Supabase admin client — solo se inicializa cuando llega un webhook real
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
        throw new Error('Supabase admin credentials no configurados')
    }
    return createClient(url, key)
}

export async function POST(req: Request) {
    // Stripe no configurado — responder OK para no bloquear
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
        return new NextResponse('Webhook no configurado', { status: 200 })
    }

    const body = await req.text()
    const sig = req.headers.get('stripe-signature') as string

    let event: Stripe.Event
    const stripe = getStripe()

    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err: any) {
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata

        if (metadata?.userId) {
            const supabaseAdmin = getSupabaseAdmin()
            const type = metadata.type
            const userId = metadata.userId

            // ── Idempotencia ──
            // Stripe reintenta webhooks; sin esto, un reintento duplicaría
            // entitlements, transacciones y regalos.
            const paymentRef = (session.payment_intent as string) || (session.subscription as string) || null
            if (paymentRef) {
                const [{ data: existingTx }, { data: existingGift }] = await Promise.all([
                    supabaseAdmin.from('transactions').select('id').eq('stripe_payment_intent', paymentRef).maybeSingle(),
                    supabaseAdmin.from('gifts').select('id').eq('stripe_payment_intent', paymentRef).maybeSingle(),
                ])
                if (existingTx || existingGift) {
                    return new NextResponse('OK (already processed)', { status: 200 })
                }
            }

            if (type === 'ppv' && metadata.episodeId) {
                await supabaseAdmin.from('entitlements').insert({
                    user_id: userId,
                    episode_id: metadata.episodeId,
                    entitlement_type: 'ppv'
                })
                await supabaseAdmin.from('transactions').insert({
                    user_id: userId,
                    amount: (session.amount_total || 0) / 100,
                    transaction_type: 'ppv',
                    stripe_payment_intent: session.payment_intent as string,
                    status: 'completed'
                })
            }

            if (type === 'subscription' && metadata.creatorId) {
                const validUntil = new Date()
                validUntil.setMonth(validUntil.getMonth() + 1)
                const amount = (session.amount_total || 0) / 100

                await supabaseAdmin.from('entitlements').insert({
                    user_id: userId,
                    creator_id: metadata.creatorId,
                    entitlement_type: 'subscription',
                    valid_until: validUntil.toISOString(),
                    stripe_subscription_id: session.subscription as string,
                })
                await supabaseAdmin.from('transactions').insert({
                    user_id: userId,
                    creator_id: metadata.creatorId,
                    amount,
                    transaction_type: 'subscription',
                    stripe_payment_intent: session.subscription as string,
                    status: 'completed'
                })

                await supabaseAdmin.from('notifications').insert({
                    user_id: metadata.creatorId,
                    actor_id: userId,
                    type: 'subscription',
                    message: '¡Tienes un nuevo suscriptor!'
                })

                // ── Emails: lector + creador ──
                try {
                    const [{ data: subscriber }, { data: creator }] = await Promise.all([
                        supabaseAdmin.from('profiles').select('full_name, username').eq('id', userId).single(),
                        supabaseAdmin.from('profiles').select('full_name, username').eq('id', metadata.creatorId).single(),
                    ])
                    const { data: subAuth } = await supabaseAdmin.auth.admin.getUserById(userId)
                    const { data: crAuth } = await supabaseAdmin.auth.admin.getUserById(metadata.creatorId)

                    if (subAuth?.user?.email && creator) {
                        const { subject, html, text } = subscriptionSuccessReaderEmail({
                            creatorName: creator.full_name || creator.username,
                            creatorUsername: creator.username,
                            amount,
                            validUntil,
                        })
                        sendEmail({ to: subAuth.user.email, subject, html, text }).catch(() => {})
                    }

                    if (crAuth?.user?.email && creator && subscriber) {
                        const { subject, html, text } = subscriptionSuccessCreatorEmail({
                            creatorName: creator.full_name || creator.username,
                            subscriberName: subscriber.full_name || subscriber.username,
                            amount,
                            earnings: writerEarnings(amount),
                        })
                        sendEmail({ to: crAuth.user.email, subject, html, text }).catch(() => {})
                    }
                } catch (e) {
                    console.error('[webhook] subscription emails failed:', e)
                }
            }

            if (type === 'tip' && metadata.creatorId) {
                await supabaseAdmin.from('transactions').insert({
                    user_id: userId,
                    creator_id: metadata.creatorId,
                    amount: (session.amount_total || 0) / 100,
                    transaction_type: 'tip',
                    stripe_payment_intent: session.payment_intent as string,
                    status: 'completed'
                })
            }

            if (type === 'gift' && metadata.recipientId) {
                const totalAmount = (session.amount_total || 0) / 100

                await supabaseAdmin.from('gifts').insert({
                    sender_id: userId,
                    recipient_id: metadata.recipientId,
                    post_id: metadata.postId || null,
                    amount: totalAmount,
                    platform_fee: platformFee(totalAmount),
                    writer_earnings: writerEarnings(totalAmount),
                    emoji: metadata.emoji || '🎁',
                    stripe_payment_intent: session.payment_intent as string,
                    status: 'completed'
                })

                await supabaseAdmin.from('notifications').insert({
                    user_id: metadata.recipientId,
                    actor_id: userId,
                    type: 'gift',
                    message: `¡Has recibido un regalo (${metadata.emoji || '🎁'}) de $${totalAmount.toFixed(2)}!`
                })
            }
        }
    }

    // ────────────────────────────────────────────
    // RENOVACIÓN MENSUAL DE SUSCRIPCIÓN
    // El primer cobro lo registra checkout.session.completed; los siguientes
    // llegan SOLO como invoice.payment_succeeded. Sin esto, las renovaciones
    // no extendían el acceso ni contaban como ingresos del escritor.
    // ────────────────────────────────────────────
    if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object as any
        // En versiones nuevas de la API, subscription vive en parent.subscription_details
        const subId: string | null =
            (typeof invoice.subscription === 'string' && invoice.subscription) ||
            invoice.parent?.subscription_details?.subscription ||
            null

        if (subId && invoice.billing_reason !== 'subscription_create') {
            try {
                const supabaseAdmin = getSupabaseAdmin()
                const paymentRef = (invoice.payment_intent as string) || (invoice.id as string)

                const { data: existing } = await supabaseAdmin
                    .from('transactions')
                    .select('id')
                    .eq('stripe_payment_intent', paymentRef)
                    .maybeSingle()

                if (!existing) {
                    const { data: ents } = await supabaseAdmin
                        .from('entitlements')
                        .select('id, user_id, creator_id')
                        .eq('stripe_subscription_id', subId)
                        .limit(1)
                    const ent = ents?.[0]

                    if (ent) {
                        const periodEnd = invoice.lines?.data?.[0]?.period?.end
                        const validUntil = periodEnd
                            ? new Date(periodEnd * 1000)
                            : (() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d })()

                        await supabaseAdmin
                            .from('entitlements')
                            .update({
                                valid_until: validUntil.toISOString(),
                                updated_at: new Date().toISOString(),
                            })
                            .eq('stripe_subscription_id', subId)

                        await supabaseAdmin.from('transactions').insert({
                            user_id: ent.user_id,
                            creator_id: ent.creator_id,
                            amount: (invoice.amount_paid || 0) / 100,
                            transaction_type: 'subscription',
                            stripe_payment_intent: paymentRef,
                            status: 'completed',
                        })
                    }
                }
            } catch (e: any) {
                console.error('[webhook] invoice.payment_succeeded error:', e.message)
            }
        }
    }

    // ────────────────────────────────────────────
    // CANCELACIÓN DE SUSCRIPCIÓN
    // Cuando Stripe marca cancel_at_period_end Y termina el período,
    // la suscripción se elimina y disparamos este evento.
    // ────────────────────────────────────────────
    if (event.type === 'customer.subscription.deleted') {
        const sub = event.data.object as Stripe.Subscription
        try {
            const supabaseAdmin = getSupabaseAdmin()
            const expiredAt = new Date().toISOString()
            // Marcar entitlements como expirados, traer también para email
            const { data: entitlements } = await supabaseAdmin
                .from('entitlements')
                .update({
                    valid_until: expiredAt,
                    cancel_at_period_end: false,
                    updated_at: expiredAt,
                })
                .eq('stripe_subscription_id', sub.id)
                .select('user_id, creator_id, valid_until, profiles:creator_id(username)')

            // Email de cancelación al lector
            for (const ent of entitlements || []) {
                try {
                    const { data: userAuth } = await supabaseAdmin.auth.admin.getUserById(ent.user_id)
                    const creator = (ent as any).profiles
                    if (userAuth?.user?.email && creator?.username) {
                        const { subject, html, text } = subscriptionCancelledEmail({
                            creatorUsername: creator.username,
                            validUntil: new Date(ent.valid_until),
                        })
                        sendEmail({ to: userAuth.user.email, subject, html, text }).catch(() => {})
                    }
                } catch {}
            }
        } catch (e: any) {
            console.error('[webhook] subscription.deleted error:', e.message)
        }
    }

    // ────────────────────────────────────────────
    // ACTUALIZACIÓN DE SUSCRIPCIÓN (cancel_at_period_end toggled)
    // ────────────────────────────────────────────
    if (event.type === 'customer.subscription.updated') {
        const sub = event.data.object as Stripe.Subscription
        try {
            const supabaseAdmin = getSupabaseAdmin()
            // En Stripe API moderna current_period_end vive en items.data[0]
            const periodEnd = (sub as any).current_period_end ?? sub.items?.data?.[0]?.current_period_end
            const update: any = {
                cancel_at_period_end: sub.cancel_at_period_end,
                updated_at: new Date().toISOString(),
            }
            if (periodEnd) update.valid_until = new Date(periodEnd * 1000).toISOString()
            await supabaseAdmin
                .from('entitlements')
                .update(update)
                .eq('stripe_subscription_id', sub.id)
        } catch (e: any) {
            console.error('[webhook] subscription.updated error:', e.message)
        }
    }

    return new NextResponse('OK', { status: 200 })
}

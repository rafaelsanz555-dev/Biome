import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

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

                await supabaseAdmin.from('entitlements').insert({
                    user_id: userId,
                    creator_id: metadata.creatorId,
                    entitlement_type: 'subscription',
                    valid_until: validUntil.toISOString()
                })
                await supabaseAdmin.from('transactions').insert({
                    user_id: userId,
                    creator_id: metadata.creatorId,
                    amount: (session.amount_total || 0) / 100,
                    transaction_type: 'subscription',
                    stripe_payment_intent: session.subscription as string,
                    status: 'completed'
                })
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
                const platformFee = +(totalAmount * 0.12).toFixed(2)
                const writerEarnings = +(totalAmount * 0.88).toFixed(2)

                await supabaseAdmin.from('gifts').insert({
                    sender_id: userId,
                    recipient_id: metadata.recipientId,
                    post_id: metadata.postId || null,
                    amount: totalAmount,
                    platform_fee: platformFee,
                    writer_earnings: writerEarnings,
                    emoji: metadata.emoji || '🎁',
                    stripe_payment_intent: session.payment_intent as string,
                    status: 'completed'
                })
            }
        }
    }

    return new NextResponse('OK', { status: 200 })
}

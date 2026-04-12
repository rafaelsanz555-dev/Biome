import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Webhooks require the service role key to bypass RLS and securely grant entitlements
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err: any) {
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata

        if (metadata?.userId) {
            const type = metadata.type
            const userId = metadata.userId

            // Grant PPV Entitlement
            if (type === 'ppv' && metadata.episodeId) {
                await supabaseAdmin.from('entitlements').insert({
                    user_id: userId,
                    episode_id: metadata.episodeId,
                    entitlement_type: 'ppv'
                })

                // Log transaction
                await supabaseAdmin.from('transactions').insert({
                    user_id: userId,
                    amount: (session.amount_total || 0) / 100,
                    transaction_type: 'ppv',
                    stripe_payment_intent: session.payment_intent as string,
                    status: 'completed'
                })
            }

            // Grant Subscription Entitlement
            if (type === 'subscription' && metadata.creatorId) {
                // Find valid_until based on interval
                const validUntil = new Date()
                validUntil.setMonth(validUntil.getMonth() + 1) // 1 month from now for MVP default

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
                    stripe_payment_intent: session.subscription as string, // For subscriptions
                    status: 'completed'
                })
            }

            // Tip (legacy)
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

            // Gift (emoji gift system)
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

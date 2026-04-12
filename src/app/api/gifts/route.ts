import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
})

const PLATFORM_FEE_PCT = 0.12 // 12% to bio.me

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { recipientId, postId, amount, emoji } = await req.json()

        if (!recipientId || !amount || amount < 1 || amount > 50) {
            return NextResponse.json({ error: 'Invalid gift parameters' }, { status: 400 })
        }

        // Get recipient profile for display
        const { data: recipient } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', recipientId)
            .single()

        if (!recipient) {
            return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
        }

        const platformFee = Math.round(amount * PLATFORM_FEE_PCT * 100) // in cents
        const totalCents = Math.round(amount * 100)

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${emoji} Gift to @${recipient.username}`,
                            description: `You're sending a gift to ${recipient.full_name || recipient.username} on bio.me. They keep 88%.`,
                        },
                        unit_amount: totalCents,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                type: 'gift',
                senderId: user.id,
                recipientId,
                postId: postId || '',
                amount: String(amount),
                platformFee: String(platformFee / 100),
                emoji,
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/gift/success?emoji=${emoji}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`,
        })

        return NextResponse.json({ url: session.url })
    } catch (err: any) {
        console.error('Gift checkout error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

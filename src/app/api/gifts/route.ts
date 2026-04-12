import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

const PLATFORM_FEE_PCT = 0.12 // 12% a bio.me

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        }

        const { recipientId, postId, amount, emoji } = await req.json()

        if (!recipientId || !amount || amount < 1 || amount > 50) {
            return NextResponse.json({ error: 'Parámetros de regalo inválidos' }, { status: 400 })
        }

        // Check Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Pagos no configurados aún. Pronto estará disponible.' }, { status: 503 })
        }

        const { data: recipient } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', recipientId)
            .single()

        if (!recipient) {
            return NextResponse.json({ error: 'Destinatario no encontrado' }, { status: 404 })
        }

        const platformFee = Math.round(amount * PLATFORM_FEE_PCT * 100)
        const totalCents = Math.round(amount * 100)

        const stripe = getStripe()

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${emoji} Regalo a @${recipient.username}`,
                            description: `Enviando un regalo a ${recipient.full_name || recipient.username} en bio.me. Ellos reciben el 88%.`,
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
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://biome-app.vercel.app'}/gift/success?emoji=${emoji}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://biome-app.vercel.app'}`,
        })

        return NextResponse.json({ url: session.url })
    } catch (err: any) {
        console.error('Gift checkout error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

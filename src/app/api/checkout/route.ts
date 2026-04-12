import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://biome-app.vercel.app'}/login`)
        }

        // Check Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            return new NextResponse(
                JSON.stringify({ error: 'Pagos no configurados aún. Pronto estará disponible.' }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type') // 'ppv' | 'subscription' | 'tip'
        const episodeId = searchParams.get('episodeId')
        const creatorId = searchParams.get('creatorId')

        const stripe = getStripe()
        let line_items: any[] = []
        let metadata: any = { userId: user.id, type }
        let mode: 'payment' | 'subscription' = 'payment'

        if (type === 'ppv' && episodeId) {
            const { data: episode } = await supabase
                .from('episodes')
                .select('title, ppv_price')
                .eq('id', episodeId)
                .single()

            if (!episode || !episode.ppv_price) {
                return new NextResponse('Episodio inválido', { status: 400 })
            }

            metadata.episodeId = episodeId
            line_items = [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Desbloquear: ${episode.title}` },
                    unit_amount: Math.round(episode.ppv_price * 100),
                },
                quantity: 1,
            }]
        }
        else if (type === 'subscription' && creatorId) {
            const { data: creator } = await supabase
                .from('creators')
                .select('subscription_price, profiles(username)')
                .eq('profile_id', creatorId)
                .single() as any

            if (!creator || !creator.subscription_price) {
                return new NextResponse('Escritor inválido', { status: 400 })
            }

            metadata.creatorId = creatorId
            mode = 'subscription'
            line_items = [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Suscripción mensual a @${creator.profiles?.username}` },
                    unit_amount: Math.round(creator.subscription_price * 100),
                    recurring: { interval: 'month' }
                },
                quantity: 1,
            }]
        }
        else if (type === 'tip' && creatorId) {
            const amountStr = searchParams.get('amount') || '5.00'
            const amount = parseFloat(amountStr)

            const { data: creator } = await supabase
                .from('creators')
                .select('profiles(username)')
                .eq('profile_id', creatorId)
                .single() as any

            metadata.creatorId = creatorId
            line_items = [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Propina para @${creator?.profiles?.username}` },
                    unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
            }]
        }
        else {
            return new NextResponse('Solicitud inválida', { status: 400 })
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode,
            metadata,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://biome-app.vercel.app'}/dashboard/billing?success=true`,
            cancel_url: req.headers.get('referer') || `${process.env.NEXT_PUBLIC_APP_URL || 'https://biome-app.vercel.app'}/descubrir`,
        })

        return NextResponse.redirect(session.url!, { status: 303 })
    } catch (error: any) {
        console.error('Checkout error:', error)
        return new NextResponse(error.message, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { z } from 'zod'
import { MONETIZATION_ENABLED } from '@/lib/flags'

const checkoutQuerySchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('ppv'), episodeId: z.string().uuid() }),
    z.object({ type: z.literal('subscription'), creatorId: z.string().uuid() }),
    z.object({ type: z.literal('tip'), creatorId: z.string().uuid(), amount: z.coerce.number().min(1).max(500).default(5) }),
])

export async function POST(req: Request) {
    if (!MONETIZATION_ENABLED) {
        return NextResponse.json({ error: 'La monetizacion todavia no esta habilitada.' }, { status: 503 })
    }
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://biome-app.vercel.app'}/login`)
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Pagos no configurados aun. Pronto estara disponible.' }, { status: 503 })
        }

        const { searchParams } = new URL(req.url)
        const parsedQuery = checkoutQuerySchema.safeParse({
            type: searchParams.get('type'),
            episodeId: searchParams.get('episodeId') || undefined,
            creatorId: searchParams.get('creatorId') || undefined,
            amount: searchParams.get('amount') || undefined,
        })

        if (!parsedQuery.success) return new NextResponse('Solicitud invalida', { status: 400 })

        const query = parsedQuery.data
        if ('creatorId' in query && query.creatorId === user.id) {
            return new NextResponse('No puedes suscribirte ni enviarte propinas a ti mismo.', { status: 400 })
        }
        const stripe = getStripe()
        let line_items: any[] = []
        const metadata: any = { userId: user.id, type: query.type }
        let mode: 'payment' | 'subscription' = 'payment'

        if (query.type === 'ppv') {
            const { data: episode } = await supabase
                .from('episodes')
                .select('title, ppv_price, creator_id, is_published')
                .eq('id', query.episodeId)
                .single()

            if (!episode || !episode.ppv_price || !episode.is_published) {
                return new NextResponse('Episodio invalido', { status: 400 })
            }
            if (episode.creator_id === user.id) {
                return new NextResponse('No puedes comprar tu propio episodio.', { status: 400 })
            }

            metadata.episodeId = query.episodeId
            line_items = [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Desbloquear: ${episode.title}` },
                    unit_amount: Math.round(episode.ppv_price * 100),
                },
                quantity: 1,
            }]
        } else if (query.type === 'subscription') {
            const { data: creator } = await supabase
                .from('creators')
                .select('subscription_price, profiles(username)')
                .eq('profile_id', query.creatorId)
                .single() as any

            if (!creator || !creator.subscription_price) {
                return new NextResponse('Escritor invalido', { status: 400 })
            }

            // Evitar doble suscripción: si ya hay una vigente, no crear otra sesión
            const { data: activeSub } = await supabase
                .from('entitlements')
                .select('id, valid_until')
                .eq('user_id', user.id)
                .eq('creator_id', query.creatorId)
                .eq('entitlement_type', 'subscription')
                .gt('valid_until', new Date().toISOString())
                .limit(1)
                .maybeSingle()

            if (activeSub) {
                return NextResponse.redirect(
                    `${process.env.NEXT_PUBLIC_APP_URL || 'https://biome-app.vercel.app'}/dashboard/subscriptions?already=true`,
                    { status: 303 }
                )
            }

            metadata.creatorId = query.creatorId
            mode = 'subscription'
            line_items = [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Suscripcion mensual a @${creator.profiles?.username}` },
                    unit_amount: Math.round(creator.subscription_price * 100),
                    recurring: { interval: 'month' },
                },
                quantity: 1,
            }]
        } else {
            const { data: creator } = await supabase
                .from('creators')
                .select('profiles(username)')
                .eq('profile_id', query.creatorId)
                .single() as any

            if (!creator?.profiles?.username) {
                return new NextResponse('Escritor invalido', { status: 400 })
            }

            metadata.creatorId = query.creatorId
            line_items = [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Propina para @${creator?.profiles?.username}` },
                    unit_amount: Math.round(query.amount * 100),
                },
                quantity: 1,
            }]
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode,
            metadata,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://biome-app.vercel.app'}/dashboard/billing?success=true`,
            cancel_url: req.headers.get('referer') || `${process.env.NEXT_PUBLIC_APP_URL || 'https://biome-app.vercel.app'}/discover`,
        })

        return NextResponse.redirect(session.url!, { status: 303 })
    } catch (error: any) {
        console.error('Checkout error:', error)
        return new NextResponse(error.message, { status: 500 })
    }
}

export async function GET(req: Request) {
    return POST(req)
}

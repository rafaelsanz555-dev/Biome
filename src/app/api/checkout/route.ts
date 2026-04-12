import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // For MVP, require login to buy. Guest checkout complicates Entitlements.
        if (!user) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?next=${req.headers.get('referer')}`)
        }

        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type') // 'ppv' or 'subscription' or 'tip'
        const episodeId = searchParams.get('episodeId')
        const creatorId = searchParams.get('creatorId')

        let line_items: any[] = []
        let metadata: any = { userId: user.id, type }
        let mode: 'payment' | 'subscription' = 'payment'

        if (type === 'ppv' && episodeId) {
            // Fetch Episode info
            const { data: episode } = await supabase.from('episodes').select('title, ppv_price').eq('id', episodeId).single()
            if (!episode || !episode.ppv_price) return new NextResponse('Invalid PPV episode', { status: 400 })

            metadata.episodeId = episodeId
            line_items = [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Unlock Episode: ${episode.title}` },
                    unit_amount: Math.round(episode.ppv_price * 100),
                },
                quantity: 1,
            }]
        }
        else if (type === 'subscription' && creatorId) {
            // Fetch Creator info
            const { data: creator } = await supabase.from('creators').select('subscription_price, profiles(username)').eq('profile_id', creatorId).single() as any
            if (!creator || !creator.subscription_price) return new NextResponse('Invalid creator', { status: 400 })

            metadata.creatorId = creatorId
            mode = 'subscription'
            line_items = [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Monthly Subscription to @${creator.profiles?.username}` },
                    unit_amount: Math.round(creator.subscription_price * 100),
                    recurring: { interval: 'month' }
                },
                quantity: 1,
            }]
        }
        // Tips
        else if (type === 'tip' && creatorId) {
            // Just a simple $5 tip for MVP example
            const amountStr = searchParams.get('amount') || '5.00'
            const amount = parseFloat(amountStr)

            const { data: creator } = await supabase.from('creators').select('profiles(username)').eq('profile_id', creatorId).single() as any

            metadata.creatorId = creatorId
            line_items = [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Tip for @${creator?.profiles?.username}` },
                    unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
            }]
        }
        else {
            return new NextResponse('Invalid request', { status: 400 })
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode,
            metadata,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
            cancel_url: req.headers.get('referer') || `${process.env.NEXT_PUBLIC_APP_URL}/discover`,
        })

        return NextResponse.redirect(session.url!, { status: 303 })
    } catch (error: any) {
        console.error('Checkout error:', error)
        return new NextResponse(error.message, { status: 500 })
    }
}

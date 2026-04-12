import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY no está configurado. Agrega la llave en .env.local o en Vercel Environment Variables.')
    }
    if (!_stripe) {
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2026-01-28.clover' as any,
            appInfo: {
                name: 'bio.me',
                version: '0.1.0',
            },
        })
    }
    return _stripe
}

// backwards-compat: exportar como `stripe` para no romper imports existentes
export const stripe = new Proxy({} as Stripe, {
    get(_target, prop) {
        return (getStripe() as any)[prop]
    }
})

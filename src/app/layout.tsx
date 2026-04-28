import type { Metadata } from 'next'
import { Inter, Playfair_Display, Crimson_Pro, IBM_Plex_Serif } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { PostHogProvider } from '@/components/PostHogProvider'
import './globals.css'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
})

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
    display: 'swap',
    weight: ['600', '700', '800', '900'],
    style: ['normal', 'italic'],
})

const crimson = Crimson_Pro({
    subsets: ['latin'],
    variable: '--font-crimson',
    display: 'swap',
    weight: ['400', '500', '600', '700', '800'],
    style: ['normal', 'italic'],
})

const ibmPlex = IBM_Plex_Serif({
    subsets: ['latin'],
    variable: '--font-ibm-plex',
    display: 'swap',
    weight: ['400', '500', '600', '700'],
    style: ['normal', 'italic'],
})

export const metadata: Metadata = {
    title: { default: 'bio.me — Tu historia. Tus ingresos.', template: '%s · bio.me' },
    description: 'La plataforma para storytellers. Publica tu vida en capítulos y gana ingresos reales de quienes no pueden dejar de leerte.',
    metadataBase: new URL('https://bio.me'),
    openGraph: {
        type: 'website',
        locale: 'es_ES',
        url: 'https://bio.me',
        siteName: 'bio.me',
        title: 'bio.me — Tu historia. Tus ingresos.',
        description: 'La plataforma para storytellers. Publica tu vida en capítulos y gana ingresos reales.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'bio.me — Tu historia. Tus ingresos.',
        description: 'La plataforma para storytellers.',
    },
    robots: { index: true, follow: true },
    icons: { icon: '/favicon.ico' },
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    // Fetch current user for analytics identification
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let userForAnalytics = null
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, username')
            .eq('id', user.id)
            .maybeSingle()
        userForAnalytics = {
            id: user.id,
            email: user.email,
            role: profile?.role || null,
            username: profile?.username || null,
        }
    }

    // Resolve current locale + messages from cookie/header
    const locale = await getLocale()
    const messages = await getMessages()

    return (
        <html lang={locale} suppressHydrationWarning>
            <body
                className={`${inter.variable} ${playfair.variable} ${crimson.variable} ${ibmPlex.variable} font-sans antialiased`}
                suppressHydrationWarning
            >
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <PostHogProvider user={userForAnalytics}>
                        {children}
                    </PostHogProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}

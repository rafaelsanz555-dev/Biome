import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
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
    weight: ['400', '500', '600', '700', '800', '900'],
    style: ['normal', 'italic'],
})

export const metadata: Metadata = {
    title: {
        default: 'bio.me — Your Story. Your Income.',
        template: '%s · bio.me',
    },
    description:
        'The storytelling platform where writers share their life and earn from day one. $5/month for writers. Readers gift you real money.',
    keywords: [
        'storytelling platform',
        'life stories',
        'earn from writing',
        'creator economy',
        'paid newsletter',
        'monetize stories',
        'writer income',
        'personal narrative',
        'bio me',
    ],
    authors: [{ name: 'bio.me', url: 'https://bio.me' }],
    creator: 'bio.me',
    publisher: 'bio.me',
    metadataBase: new URL('https://bio.me'),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://bio.me',
        siteName: 'bio.me',
        title: 'bio.me — Your Story. Your Income.',
        description: 'The storytelling platform where writers share their life and earn from day one.',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'bio.me' }],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@biome',
        creator: '@biome',
        title: 'bio.me — Your Story. Your Income.',
        description: 'Write your life. Build an audience. Earn real money.',
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
    alternates: { canonical: 'https://bio.me' },
    applicationName: 'bio.me',
    category: 'storytelling, creator economy, writing platform',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
            <body className="font-sans antialiased">
                {children}
            </body>
        </html>
    )
}

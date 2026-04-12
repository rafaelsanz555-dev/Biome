import Link from 'next/link'

interface CreatorCardProps {
    creator: {
        id: string
        username: string
        full_name: string | null
        avatar_url: string | null
        bio: string | null
        creators?: { subscription_price: number | null } | null
    }
}

// Cinematic book-cover gradients — warm, atmospheric, literary
const COVER_GRADIENTS = [
    'linear-gradient(170deg, #1A0A02 0%, #6B2D0A 45%, #C9640A 100%)',   // Amber / Fire
    'linear-gradient(170deg, #020C0A 0%, #0A3D2B 45%, #1A7A52 100%)',   // Forest / Deep
    'linear-gradient(170deg, #0A0214 0%, #2D0A4A 45%, #7A1A8A 100%)',   // Dusk / Mystery
    'linear-gradient(170deg, #0A0A1A 0%, #1A2A5C 45%, #2A5CAA 100%)',   // Ocean / Depth
    'linear-gradient(170deg, #140A0A 0%, #4A1A1A 45%, #8A2A2A 100%)',   // Crimson / Drama
    'linear-gradient(170deg, #0A0C02 0%, #2A3A08 45%, #6A7A14 100%)',   // Olive / Earth
]

function hashUsername(username: string): number {
    let h = 0
    for (let i = 0; i < username.length; i++) {
        h = (h * 31 + username.charCodeAt(i)) & 0xffffffff
    }
    return Math.abs(h)
}

export function CreatorCard({ creator }: CreatorCardProps) {
    const gradient = COVER_GRADIENTS[hashUsername(creator.username) % COVER_GRADIENTS.length]
    const initial = (creator.full_name || creator.username).charAt(0).toUpperCase()
    const price = creator.creators?.subscription_price || 4.99

    return (
        <Link href={`/${creator.username}`} className="group block">
            <div
                className="rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1"
                style={{
                    border: '1px solid var(--cream-mid)',
                    boxShadow: '0 2px 12px rgba(20,16,10,0.06)',
                }}
            >
                {/* Cinematic Cover */}
                <div
                    className="relative h-40 flex items-end p-4"
                    style={{ background: gradient }}
                >
                        {/* "Chapter 1 Free" badge */}
                    <div
                        className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{
                            backgroundColor: 'rgba(201,168,76,0.85)',
                            color: '#14100A',
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        Cap. 1 Gratis
                    </div>

                    {/* Avatar at the bottom-left of cover */}
                    <div
                        className="relative w-14 h-14 rounded-full overflow-hidden shrink-0"
                        style={{
                            border: '2px solid rgba(255,255,255,0.25)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        }}
                    >
                        {creator.avatar_url ? (
                            <img src={creator.avatar_url} alt={creator.username} className="w-full h-full object-cover" />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center font-serif font-bold text-xl"
                                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)' }}
                            >
                                {initial}
                            </div>
                        )}
                    </div>
                </div>

                {/* Card Body */}
                <div
                    className="p-4"
                    style={{ backgroundColor: 'var(--cream)' }}
                >
                    <div className="mb-2">
                        <p
                            className="font-serif font-semibold text-base leading-snug transition-colors"
                            style={{ color: 'var(--ink)' }}
                        >
                            {creator.full_name || creator.username}
                        </p>
                        <p
                            className="text-xs mt-0.5"
                            style={{ color: 'var(--ink-light)' }}
                        >
                            @{creator.username}
                        </p>
                    </div>

                    <p
                        className="text-sm leading-relaxed line-clamp-2 mb-4"
                        style={{ color: 'var(--ink-light)', minHeight: '2.5rem' }}
                    >
                        {creator.bio || 'Compartiendo historias en bio.me.'}
                    </p>

                    <div className="flex items-center justify-between">
                        <span
                            className="text-xs font-bold px-2.5 py-1 rounded-lg"
                            style={{
                                backgroundColor: 'var(--gold-bg)',
                                color: 'var(--gold-dark)',
                                border: '1px solid var(--cream-mid)',
                            }}
                        >
                            ${price}/mes
                        </span>
                        <span
                            className="text-xs font-medium transition-colors group-hover:opacity-80"
                            style={{ color: 'var(--ink-light)' }}
                        >
                            Leer historias →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

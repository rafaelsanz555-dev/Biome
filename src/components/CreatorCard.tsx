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

// Sleek dark gradients for "Social" feeling covers
const COVER_GRADIENTS = [
    'linear-gradient(135deg, #1A1C29 0%, #0D0E15 100%)',   // Night Sky
    'linear-gradient(135deg, #1D1525 0%, #0F0A14 100%)',   // Deep Purple
    'linear-gradient(135deg, #0A1929 0%, #050B14 100%)',   // Ocean Dark
    'linear-gradient(135deg, #241A1A 0%, #170A0A 100%)',   // Maroon Dark
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
            <div className="bg-[#15171C] rounded-2xl overflow-hidden border border-gray-800 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgba(37, 99, 235,0.15)] group-hover:border-blue-500/30">
                {/* Cover Header */}
                <div
                    className="relative h-28 flex flex-col justify-end p-4"
                    style={{ background: gradient }}
                >
                    {/* Badge */}
                    <div className="absolute top-3 right-3">
                        <div className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/20 backdrop-blur-sm shadow-sm">
                            Primer post Gratis
                        </div>
                    </div>
                </div>

                {/* Avatar positioning */}
                <div className="relative px-4 pb-0 -mt-10 flex justify-between items-end">
                    <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-4 border-[#15171C] bg-[#0A0B0E] shadow-xl z-10 transition-transform group-hover:scale-105">
                        {creator.avatar_url ? (
                            <img src={creator.avatar_url} alt={creator.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xl bg-blue-600/20 text-blue-500">
                                {initial}
                            </div>
                        )}
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-5 pt-3">
                    <div className="mb-3">
                        <p className="font-bold text-white leading-tight truncate text-lg group-hover:text-blue-400 transition-colors">
                            {creator.full_name || creator.username}
                        </p>
                        <p className="text-xs font-medium text-gray-500">
                            @{creator.username}
                        </p>
                    </div>

                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 min-h-[2.5rem] mb-5">
                        {creator.bio || 'Compartiendo contenido exclusivo en bio.me.'}
                    </p>

                    <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/5 text-gray-300">
                            ${price}/mes
                        </span>
                        <span className="text-xs font-bold text-blue-500 transition-all group-hover:translate-x-1">
                            Ver Feed →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

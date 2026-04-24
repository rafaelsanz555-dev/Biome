import Link from 'next/link'
import { Badge } from './ui/Badge'
import { Heart, Gift } from 'lucide-react'

interface StoryCardProps {
    href: string
    title: string
    preview?: string
    coverUrl?: string | null
    authorName?: string
    authorUsername?: string
    authorAvatar?: string | null
    createdAt?: string
    readMin?: number
    reactionsTotal?: number
    giftsTotal?: number
    isFirst?: boolean
    isExclusive?: boolean
    themes?: string[]
    variant?: 'hero' | 'compact'
}

export function StoryCard({
    href, title, preview, coverUrl, authorName, authorUsername, authorAvatar,
    createdAt, readMin, reactionsTotal = 0, giftsTotal = 0,
    isFirst, isExclusive, themes = [], variant = 'compact',
}: StoryCardProps) {
    const initial = (authorName || authorUsername || '?').charAt(0).toUpperCase()
    const dateLabel = createdAt
        ? new Date(createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
        : null

    if (variant === 'hero') {
        return (
            <Link href={href} className="group block rounded-2xl overflow-hidden relative border border-gray-800 bg-[#0F1114] hover:border-gray-700 transition" style={{ minHeight: 480 }}>
                {coverUrl && (
                    <div className="absolute inset-0">
                        <img src={coverUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E] via-[#0A0B0E]/60 to-transparent" />
                    </div>
                )}
                <div className="relative p-6 flex flex-col h-full min-h-[480px] justify-end">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {isFirst && <Badge variant="free">Gratis</Badge>}
                        {isExclusive && <Badge variant="exclusive">Exclusivo</Badge>}
                        {themes.slice(0, 3).map((t) => <Badge key={t} variant="neutral">{t}</Badge>)}
                    </div>
                    <h2 className="text-white font-bold text-2xl md:text-3xl leading-tight mb-3" style={{ fontFamily: 'Georgia, "Playfair Display", serif' }}>
                        {title}
                    </h2>
                    {preview && <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-2 mb-4">{preview}</p>}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-700">
                                {authorAvatar ? <img src={authorAvatar} alt="" className="w-full h-full object-cover" />
                                 : <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-green-900/40 text-green-400">{initial}</div>}
                            </div>
                            <span className="text-white font-semibold">{authorName || authorUsername}</span>
                        </div>
                        {dateLabel && <><span className="w-1 h-1 bg-gray-700 rounded-full"></span><span>{dateLabel}</span></>}
                        {readMin && <><span className="w-1 h-1 bg-gray-700 rounded-full"></span><span>{readMin} min</span></>}
                        {reactionsTotal > 0 && <><span className="w-1 h-1 bg-gray-700 rounded-full"></span><span className="flex items-center gap-1"><Heart size={11} />{reactionsTotal}</span></>}
                        {giftsTotal > 0 && <span className="flex items-center gap-1 ml-auto text-green-400 font-semibold"><Gift size={11} />{giftsTotal}</span>}
                    </div>
                </div>
            </Link>
        )
    }

    return (
        <Link href={href} className="group block rounded-xl overflow-hidden border border-gray-800 bg-[#0F1114] hover:border-gray-700 transition">
            {coverUrl && (
                <div className="aspect-[16/9] overflow-hidden">
                    <img src={coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
            )}
            <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                    {isFirst && <Badge variant="free">Gratis</Badge>}
                    {isExclusive && <Badge variant="exclusive">Exclusivo</Badge>}
                </div>
                <h3 className="text-white font-bold text-lg leading-snug mb-2 line-clamp-2" style={{ fontFamily: 'Georgia, serif' }}>{title}</h3>
                {preview && <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-3">{preview}</p>}
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <span className="text-gray-300 font-semibold">{authorName || authorUsername}</span>
                    {dateLabel && <><span className="w-1 h-1 bg-gray-700 rounded-full"></span><span>{dateLabel}</span></>}
                    {readMin && <><span className="w-1 h-1 bg-gray-700 rounded-full"></span><span>{readMin} min</span></>}
                </div>
            </div>
        </Link>
    )
}

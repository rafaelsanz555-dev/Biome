'use client'

import { useState } from 'react'
import { Music, ChevronUp, ChevronDown } from 'lucide-react'

interface ChapterSoundtrackProps {
    url: string
    title?: string | null
}

function parseEmbed(url: string): { kind: 'spotify' | 'youtube' | 'none'; embedUrl: string; displayTitle: string } {
    try {
        const u = new URL(url)
        // Spotify: open.spotify.com/track/ID or /episode/ID or /playlist/ID
        if (u.hostname.includes('spotify.com')) {
            const parts = u.pathname.split('/').filter(Boolean)
            if (parts.length >= 2) {
                return {
                    kind: 'spotify',
                    embedUrl: `https://open.spotify.com/embed/${parts[0]}/${parts[1]}?utm_source=generator&theme=0`,
                    displayTitle: 'Escucha en Spotify',
                }
            }
        }
        // YouTube: youtube.com/watch?v=ID or youtu.be/ID
        if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
            const videoId = u.searchParams.get('v') || u.pathname.slice(1).split('/')[0]
            if (videoId) {
                return {
                    kind: 'youtube',
                    embedUrl: `https://www.youtube.com/embed/${videoId}`,
                    displayTitle: 'Ver en YouTube',
                }
            }
        }
    } catch { /* invalid URL */ }
    return { kind: 'none', embedUrl: '', displayTitle: '' }
}

export function ChapterSoundtrack({ url, title }: ChapterSoundtrackProps) {
    const [expanded, setExpanded] = useState(false)
    const { kind, embedUrl } = parseEmbed(url)
    if (kind === 'none') return null

    return (
        <div className="my-8 overflow-hidden border border-[#171512]/10 bg-[#FFFCF5]">
            <button
                onClick={() => setExpanded(!expanded)}
                className="group flex w-full items-center justify-between p-4 transition hover:bg-[#F0E8D9]"
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center bg-[#274C43]">
                        <Music size={16} className="text-white" />
                    </div>
                    <div className="text-left">
                        <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#A63D2D]">
                            Banda sonora del capítulo
                        </p>
                        <p className="max-w-[260px] truncate text-sm font-bold text-[#171512] sm:max-w-md">
                            {title || 'Escucha mientras lees'}
                        </p>
                    </div>
                </div>
                <div className="text-[#746A5C] transition group-hover:text-[#A63D2D]">
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </button>

            {expanded && (
                <div className="border-t border-[#171512]/10 p-3">
                    {kind === 'spotify' ? (
                        <iframe
                            src={embedUrl}
                            width="100%"
                            height="152"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            style={{ borderRadius: '12px' }}
                        />
                    ) : (
                        <div className="relative pb-[56.25%] rounded-xl overflow-hidden bg-black">
                            <iframe
                                src={embedUrl}
                                className="absolute inset-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}


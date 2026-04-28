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
            let videoId = u.searchParams.get('v') || u.pathname.slice(1).split('/')[0]
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
        <div className="my-8 rounded-2xl border border-gray-800 bg-gradient-to-br from-[#15171C] to-[#0F1114] overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Music size={16} className="text-white" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-0.5">
                            Banda sonora del capítulo
                        </p>
                        <p className="text-sm font-bold text-white truncate max-w-[260px] sm:max-w-md">
                            {title || 'Escucha mientras lees'}
                        </p>
                    </div>
                </div>
                <div className="text-gray-500 group-hover:text-blue-400 transition">
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </button>

            {expanded && (
                <div className="border-t border-gray-800 p-3">
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

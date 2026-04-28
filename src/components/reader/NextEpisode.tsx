import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

interface NextEpisodeProps {
    creatorUsername: string
    episode: {
        id: string
        title: string
        preview_text?: string | null
        cover_image_url?: string | null
        is_subscription_only?: boolean
        ppv_price?: number | null
        chapter_number?: number | null
    } | null
    seriesProgress?: { current: number; total: number } | null
}

export function NextEpisode({ creatorUsername, episode, seriesProgress }: NextEpisodeProps) {
    if (!episode) {
        // Last episode — show series-end message
        return (
            <div className="my-12 p-8 rounded-2xl border border-gray-800 bg-gradient-to-br from-[#0F1114] to-[#15171C] text-center">
                <Sparkles className="text-blue-400 mx-auto mb-3" size={28} />
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                    Estás al día
                </h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                    Has llegado al último episodio publicado. <strong className="text-white">@{creatorUsername}</strong> volverá pronto con la continuación.
                </p>
                <Link
                    href={`/${creatorUsername}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-semibold"
                >
                    Ver perfil del autor <ArrowRight size={14} />
                </Link>
            </div>
        )
    }

    return (
        <Link
            href={`/${creatorUsername}/${episode.id}`}
            className="group block my-12 rounded-2xl border border-gray-800 hover:border-blue-500/50 bg-gradient-to-br from-[#0F1114] to-[#15171C] overflow-hidden transition"
        >
            <div className="p-2">
                <div className="flex items-stretch gap-0 rounded-xl overflow-hidden">
                    {episode.cover_image_url && (
                        <div className="w-32 sm:w-48 shrink-0 relative overflow-hidden bg-[#0A0B0E]">
                            <img src={episode.cover_image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                    )}
                    <div className="flex-1 p-5">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400">
                                Siguiente episodio
                                {episode.chapter_number && ` · Cap. ${episode.chapter_number}`}
                            </span>
                            {seriesProgress && (
                                <span className="text-[10px] text-gray-500">
                                    {seriesProgress.current} de {seriesProgress.total}
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition mb-1.5 leading-snug" style={{ fontFamily: 'Georgia, serif' }}>
                            {episode.title}
                        </h3>
                        {episode.preview_text && (
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                {episode.preview_text}
                            </p>
                        )}
                        <div className="mt-3 flex items-center gap-2 text-xs">
                            {episode.is_subscription_only && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                                    Exclusivo
                                </span>
                            )}
                            {!episode.is_subscription_only && episode.ppv_price && (
                                <span className="text-gray-500">${episode.ppv_price} desbloqueo</span>
                            )}
                            <span className="ml-auto inline-flex items-center gap-1 text-blue-400 font-semibold">
                                Continuar <ArrowRight size={12} className="group-hover:translate-x-1 transition" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

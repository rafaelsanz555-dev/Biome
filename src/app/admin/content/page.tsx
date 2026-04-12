import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminContentPage() {
    const supabase = await createClient()

    // Get all episodes with creator info
    const { data: episodes } = await supabase
        .from('episodes')
        .select(`
            id,
            title,
            preview_text,
            cover_image_url,
            is_published,
            is_subscription_only,
            ppv_price,
            created_at,
            creator_id,
            season_id,
            profiles!episodes_creator_id_fkey (
                username,
                full_name,
                avatar_url
            ),
            seasons (
                title
            )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

    const { count: totalEpisodes } = await supabase
        .from('episodes')
        .select('*', { count: 'exact', head: true })

    const { count: publishedCount } = await supabase
        .from('episodes')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)

    const { count: draftCount } = await supabase
        .from('episodes')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', false)

    const { count: seasonCount } = await supabase
        .from('seasons')
        .select('*', { count: 'exact', head: true })

    function monetizationBadge(episode: { is_subscription_only: boolean; ppv_price: number | null }) {
        if (episode.ppv_price && Number(episode.ppv_price) > 0) {
            return { label: `PPV $${Number(episode.ppv_price).toFixed(2)}`, style: 'bg-[#FF9800]/15 text-[#FFB74D] border-[#FFB74D]/20' }
        }
        if (episode.is_subscription_only) {
            return { label: 'Suscripcion', style: 'bg-[#C9A84C]/15 text-[#C9A84C] border-[#C9A84C]/20' }
        }
        return { label: 'Gratis', style: 'bg-[#2E7D32]/15 text-[#4CAF50] border-[#4CAF50]/20' }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#FAF7F0] tracking-tight">Contenido</h1>
                <p className="text-[#666] text-sm mt-1">Gestion y moderacion de todo el contenido publicado en bio.me</p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-[#222] bg-[#111] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mb-1">Total Episodios</p>
                    <p className="text-2xl font-bold text-[#FAF7F0]">{totalEpisodes || 0}</p>
                </div>
                <div className="rounded-2xl border border-[#4CAF50]/20 bg-[#4CAF50]/5 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4CAF50]/70 mb-1">Publicados</p>
                    <p className="text-2xl font-bold text-[#4CAF50]">{publishedCount || 0}</p>
                </div>
                <div className="rounded-2xl border border-[#FF9800]/20 bg-[#FF9800]/5 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#FFB74D]/70 mb-1">Borradores</p>
                    <p className="text-2xl font-bold text-[#FFB74D]">{draftCount || 0}</p>
                </div>
                <div className="rounded-2xl border border-[#222] bg-[#111] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mb-1">Series/Arcos</p>
                    <p className="text-2xl font-bold text-[#FAF7F0]">{seasonCount || 0}</p>
                </div>
            </div>

            {/* Content list */}
            <div className="rounded-2xl border border-[#222] bg-[#111] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#FAF7F0] uppercase tracking-wider">
                        Todos los Episodios
                    </h2>
                    <span className="text-xs text-[#666]">Mostrando {episodes?.length || 0} de {totalEpisodes || 0}</span>
                </div>

                <div className="divide-y divide-[#1a1a1a]">
                    {episodes?.map((episode) => {
                        const profile = episode.profiles as unknown as {
                            username: string
                            full_name: string | null
                            avatar_url: string | null
                        }
                        const season = episode.seasons as unknown as { title: string } | null
                        const badge = monetizationBadge(episode)

                        return (
                            <div key={episode.id} className="px-6 py-4 hover:bg-[#1a1a1a] transition-colors">
                                <div className="flex items-start gap-4">
                                    {/* Cover thumbnail */}
                                    <div className="w-16 h-16 rounded-xl bg-[#222] flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {episode.cover_image_url ? (
                                            <img src={episode.cover_image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl">📝</span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-sm font-bold text-[#FAF7F0] truncate">{episode.title}</h3>
                                            <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 ${
                                                episode.is_published
                                                    ? 'bg-[#2E7D32]/15 text-[#4CAF50] border-[#4CAF50]/20'
                                                    : 'bg-[#333] text-[#999] border-[#444]'
                                            }`}>
                                                {episode.is_published ? 'Publicado' : 'Borrador'}
                                            </span>
                                            <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 ${badge.style}`}>
                                                {badge.label}
                                            </span>
                                        </div>

                                        <p className="text-xs text-[#888] line-clamp-1 mb-2">
                                            {episode.preview_text || 'Sin preview'}
                                        </p>

                                        <div className="flex items-center gap-4 text-[11px] text-[#666]">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-5 h-5 rounded-full bg-[#222] flex items-center justify-center overflow-hidden">
                                                    {profile?.avatar_url ? (
                                                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[8px] font-bold text-[#C9A84C]">
                                                            {(profile?.full_name || profile?.username || '?')[0].toUpperCase()}
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="text-[#999]">@{profile?.username}</span>
                                            </span>
                                            {season && (
                                                <span className="text-[#555]">Serie: {season.title}</span>
                                            )}
                                            <span className="text-[#555]">
                                                {new Date(episode.created_at).toLocaleDateString('es-ES', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                            <Link
                                                href={`/${profile?.username}/${episode.id}`}
                                                className="text-[#C9A84C] hover:text-[#C9A84C]/80 font-medium transition-colors ml-auto"
                                            >
                                                Ver episodio →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {(!episodes || episodes.length === 0) && (
                        <div className="px-6 py-12 text-center text-sm text-[#666]">
                            No hay episodios publicados aun
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

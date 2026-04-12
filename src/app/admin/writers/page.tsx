import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminWritersPage() {
    const supabase = await createClient()

    // Get all creators with their profile info
    const { data: creators } = await supabase
        .from('creators')
        .select(`
            profile_id,
            subscription_price,
            is_active,
            writer_subscription_active,
            stripe_account_id,
            profiles!creators_profile_id_fkey (
                username,
                full_name,
                avatar_url,
                bio,
                created_at
            )
        `)
        .order('profile_id')

    // Get episode counts per creator
    const { data: episodeCounts } = await supabase
        .from('episodes')
        .select('creator_id')

    // Get follower counts per creator
    const { data: followerCounts } = await supabase
        .from('follows')
        .select('creator_id')

    // Get gift totals per creator
    const { data: giftData } = await supabase
        .from('gifts')
        .select('recipient_id, amount, platform_fee')
        .eq('status', 'completed')

    // Get transaction totals per creator
    const { data: txData } = await supabase
        .from('transactions')
        .select('creator_id, amount')
        .eq('status', 'completed')

    // Aggregate stats per creator
    function getCreatorStats(creatorId: string) {
        const episodes = episodeCounts?.filter(e => e.creator_id === creatorId).length || 0
        const followers = followerCounts?.filter(f => f.creator_id === creatorId).length || 0
        const giftTotal = giftData?.filter(g => g.recipient_id === creatorId)
            .reduce((acc, g) => acc + Number(g.amount), 0) || 0
        const giftPlatformFee = giftData?.filter(g => g.recipient_id === creatorId)
            .reduce((acc, g) => acc + Number(g.platform_fee), 0) || 0
        const txTotal = txData?.filter(t => t.creator_id === creatorId)
            .reduce((acc, t) => acc + Number(t.amount), 0) || 0
        const txPlatformFee = txTotal * 0.10
        return {
            episodes,
            followers,
            grossRevenue: giftTotal + txTotal,
            platformRevenue: giftPlatformFee + txPlatformFee,
        }
    }

    const totalPlatformRevenue = creators?.reduce((acc, c) => {
        const stats = getCreatorStats(c.profile_id)
        return acc + stats.platformRevenue
    }, 0) || 0

    const totalWriterFees = (creators?.length || 0) * 5

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#FAF7F0] tracking-tight">Escritores</h1>
                <p className="text-[#666] text-sm mt-1">Performance y gestion de todos los creadores de bio.me</p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-[#C9A84C]/20 bg-gradient-to-br from-[#C9A84C]/10 to-[#C9A84C]/5 p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C9A84C]/70 mb-1">Total Escritores</p>
                    <p className="text-3xl font-bold text-[#C9A84C]">{creators?.length || 0}</p>
                    <p className="text-xs text-[#666] mt-1">Creadores activos</p>
                </div>
                <div className="rounded-2xl border border-[#222] bg-[#111] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mb-1">Writer Fees</p>
                    <p className="text-3xl font-bold text-[#FAF7F0]">${totalWriterFees}</p>
                    <p className="text-xs text-[#555] mt-1">Mensual garantizado</p>
                </div>
                <div className="rounded-2xl border border-[#222] bg-[#111] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mb-1">Platform Revenue</p>
                    <p className="text-3xl font-bold text-[#FAF7F0]">${totalPlatformRevenue.toFixed(2)}</p>
                    <p className="text-xs text-[#555] mt-1">10-12% del revenue generado</p>
                </div>
                <div className="rounded-2xl border border-[#222] bg-[#111] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mb-1">Episodios Totales</p>
                    <p className="text-3xl font-bold text-[#FAF7F0]">{episodeCounts?.length || 0}</p>
                    <p className="text-xs text-[#555] mt-1">Contenido publicado</p>
                </div>
            </div>

            {/* Writers table */}
            <div className="rounded-2xl border border-[#222] bg-[#111] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#222]">
                    <h2 className="text-sm font-bold text-[#FAF7F0] uppercase tracking-wider">
                        Performance por Escritor
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#222]">
                                <th className="text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-6 py-3">Escritor</th>
                                <th className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-3 py-3">Precio</th>
                                <th className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-3 py-3">Posts</th>
                                <th className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-3 py-3">Followers</th>
                                <th className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-3 py-3">Revenue Bruto</th>
                                <th className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-3 py-3">Para bio.me</th>
                                <th className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-3 py-3">Estado</th>
                                <th className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-3 py-3">Perfil</th>
                            </tr>
                        </thead>
                        <tbody>
                            {creators?.map((creator) => {
                                const profile = creator.profiles as unknown as {
                                    username: string
                                    full_name: string | null
                                    avatar_url: string | null
                                    bio: string | null
                                    created_at: string
                                }
                                const stats = getCreatorStats(creator.profile_id)
                                return (
                                    <tr key={creator.profile_id} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-[#222] flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {profile?.avatar_url ? (
                                                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-bold text-[#C9A84C]">
                                                            {(profile?.full_name || profile?.username || '?')[0].toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-[#FAF7F0]">{profile?.full_name || 'Sin nombre'}</p>
                                                    <p className="text-xs text-[#666]">@{profile?.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-center">
                                            <span className="text-sm font-bold text-[#FAF7F0]">${Number(creator.subscription_price).toFixed(2)}</span>
                                            <span className="text-[10px] text-[#666]">/mes</span>
                                        </td>
                                        <td className="px-3 py-4 text-center text-sm text-[#FAF7F0]">{stats.episodes}</td>
                                        <td className="px-3 py-4 text-center text-sm text-[#FAF7F0]">{stats.followers}</td>
                                        <td className="px-3 py-4 text-center">
                                            <span className="text-sm font-bold text-[#FAF7F0]">${stats.grossRevenue.toFixed(2)}</span>
                                        </td>
                                        <td className="px-3 py-4 text-center">
                                            <span className="text-sm font-bold text-[#C9A84C]">${stats.platformRevenue.toFixed(2)}</span>
                                        </td>
                                        <td className="px-3 py-4 text-center">
                                            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                                                creator.is_active
                                                    ? 'bg-[#2E7D32]/15 text-[#4CAF50] border-[#4CAF50]/20'
                                                    : 'bg-[#C62828]/15 text-[#EF5350] border-[#EF5350]/20'
                                            }`}>
                                                {creator.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 text-center">
                                            <Link
                                                href={`/${profile?.username}`}
                                                className="text-xs text-[#C9A84C] hover:text-[#C9A84C]/80 font-medium transition-colors"
                                            >
                                                Ver →
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                            {(!creators || creators.length === 0) && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#666]">
                                        No hay escritores registrados aun
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

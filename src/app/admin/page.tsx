import { createClient } from '@/lib/supabase/server'

async function getAdminStats() {
    const supabase = await createClient()

    const [
        { count: totalUsers },
        { count: totalWriters },
        { count: totalReaders },
        { count: totalEpisodes },
        { count: totalPublished },
        { data: transactions },
        { data: gifts },
        { count: totalFollows },
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'creator'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'reader'),
        supabase.from('episodes').select('*', { count: 'exact', head: true }),
        supabase.from('episodes').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('transactions').select('amount, transaction_type, created_at').eq('status', 'completed'),
        supabase.from('gifts').select('amount, platform_fee, writer_earnings, created_at').eq('status', 'completed'),
        supabase.from('follows').select('*', { count: 'exact', head: true }),
    ])

    const totalTransactionRevenue = transactions?.reduce((acc, t) => acc + Number(t.amount), 0) || 0
    const platformFeeFromTransactions = totalTransactionRevenue * 0.10
    const totalGiftRevenue = gifts?.reduce((acc, g) => acc + Number(g.amount), 0) || 0
    const platformFeeFromGifts = gifts?.reduce((acc, g) => acc + Number(g.platform_fee), 0) || 0
    const totalPlatformRevenue = platformFeeFromTransactions + platformFeeFromGifts

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const recentTransactions = transactions?.filter(t => t.created_at >= sevenDaysAgo) || []
    const recentGifts = gifts?.filter(g => g.created_at >= sevenDaysAgo) || []
    const recentRevenue = recentTransactions.reduce((acc, t) => acc + Number(t.amount) * 0.10, 0)
        + recentGifts.reduce((acc, g) => acc + Number(g.platform_fee), 0)

    return {
        totalUsers: totalUsers || 0,
        totalWriters: totalWriters || 0,
        totalReaders: totalReaders || 0,
        totalEpisodes: totalEpisodes || 0,
        totalPublished: totalPublished || 0,
        totalFollows: totalFollows || 0,
        totalGrossRevenue: totalTransactionRevenue + totalGiftRevenue,
        totalPlatformRevenue,
        platformFeeFromGifts,
        platformFeeFromTransactions,
        totalGiftRevenue,
        recentRevenue,
        transactionCount: transactions?.length || 0,
        giftCount: gifts?.length || 0,
    }
}

function StatCard({ label, value, sub, accent = false }: {
    label: string
    value: string | number
    sub?: string
    accent?: boolean
}) {
    return (
        <div className={`rounded-2xl border p-5 transition-all duration-200 hover:border-[#C9A84C]/30 ${accent
            ? 'bg-gradient-to-br from-[#C9A84C]/10 to-[#C9A84C]/5 border-[#C9A84C]/20'
            : 'bg-[#111] border-[#222]'
            }`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mb-2">{label}</p>
            <p className={`text-3xl font-bold tracking-tight ${accent ? 'text-[#C9A84C]' : 'text-[#FAF7F0]'}`}>
                {value}
            </p>
            {sub && <p className="text-xs text-[#555] mt-1.5">{sub}</p>}
        </div>
    )
}

export default async function AdminOverview() {
    const stats = await getAdminStats()

    const writerFees = stats.totalWriters * 5

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#FAF7F0] tracking-tight">Panel General</h1>
                <p className="text-[#666] text-sm mt-1">Vista general de bio.me en tiempo real</p>
            </div>

            {/* Revenue highlight */}
            <div className="rounded-2xl border border-[#C9A84C]/20 bg-gradient-to-r from-[#C9A84C]/10 via-[#111] to-[#111] p-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C9A84C]/70 mb-1">
                            Revenue Total de Plataforma
                        </p>
                        <p className="text-4xl font-bold text-[#C9A84C] tracking-tight">
                            ${stats.totalPlatformRevenue.toFixed(2)}
                        </p>
                        <p className="text-xs text-[#666] mt-1">
                            10-12% de ${stats.totalGrossRevenue.toFixed(2)} bruto generado por escritores
                        </p>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-right">
                            <p className="text-[10px] text-[#666] uppercase tracking-wider">Ultimos 7 dias</p>
                            <p className="text-xl font-bold text-[#FAF7F0]">${stats.recentRevenue.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-[#666] uppercase tracking-wider">Writer fees ($5/mes)</p>
                            <p className="text-xl font-bold text-[#FAF7F0]">${writerFees}/mes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Usuarios Totales" value={stats.totalUsers} sub="Registrados en la plataforma" />
                <StatCard label="Escritores" value={stats.totalWriters} sub={`$${writerFees}/mes en fees`} accent />
                <StatCard label="Lectores" value={stats.totalReaders} sub="Consumidores de contenido" />
                <StatCard label="Suscripciones" value={stats.totalFollows} sub="Conexiones lector-escritor" />
            </div>

            {/* Content & Financial stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Episodios Totales" value={stats.totalEpisodes} sub={`${stats.totalPublished} publicados`} />
                <StatCard label="Transacciones" value={stats.transactionCount} sub={`$${stats.platformFeeFromTransactions.toFixed(2)} para bio.me`} />
                <StatCard label="Regalos Enviados" value={stats.giftCount} sub={`$${stats.platformFeeFromGifts.toFixed(2)} para bio.me (12%)`} accent />
                <StatCard label="Revenue Bruto" value={`$${stats.totalGrossRevenue.toFixed(2)}`} sub="Generado por escritores" />
            </div>

            {/* Revenue breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
                    <h3 className="text-sm font-bold text-[#FAF7F0] mb-4 uppercase tracking-wider">Desglose de Revenue</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-[#222]">
                            <span className="text-sm text-[#999]">Writer fees ($5/mes x {stats.totalWriters})</span>
                            <span className="text-sm font-bold text-[#FAF7F0]">${writerFees}/mes</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#222]">
                            <span className="text-sm text-[#999]">10% de suscripciones/PPV</span>
                            <span className="text-sm font-bold text-[#FAF7F0]">${stats.platformFeeFromTransactions.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#222]">
                            <span className="text-sm text-[#999]">12% de regalos</span>
                            <span className="text-sm font-bold text-[#FAF7F0]">${stats.platformFeeFromGifts.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm font-bold text-[#C9A84C]">Total plataforma</span>
                            <span className="text-sm font-bold text-[#C9A84C]">${stats.totalPlatformRevenue.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
                    <h3 className="text-sm font-bold text-[#FAF7F0] mb-4 uppercase tracking-wider">Proyeccion a Escala</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-[#222]">
                            <span className="text-sm text-[#999]">A 100 escritores</span>
                            <span className="text-sm font-bold text-[#FAF7F0]">$500 + fees/mes</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#222]">
                            <span className="text-sm text-[#999]">A 500 escritores</span>
                            <span className="text-sm font-bold text-[#FAF7F0]">$2,500 + fees/mes</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#222]">
                            <span className="text-sm text-[#999]">A 1,000 escritores</span>
                            <span className="text-sm font-bold text-[#C9A84C]">$25,000/mes</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-[#999]">A 10,000 escritores</span>
                            <span className="text-sm font-bold text-[#C9A84C]">$250,000/mes</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

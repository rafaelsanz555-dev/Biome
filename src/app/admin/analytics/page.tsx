import { createClient } from '@/lib/supabase/server'

export default async function AdminAnalyticsPage() {
    const supabase = await createClient()

    // Get all data for analytics
    const [
        { data: profiles },
        { data: episodes },
        { data: transactions },
        { data: gifts },
        { data: follows },
        { data: creators },
    ] = await Promise.all([
        supabase.from('profiles').select('id, role, created_at').order('created_at', { ascending: true }),
        supabase.from('episodes').select('id, creator_id, is_published, is_subscription_only, ppv_price, created_at').order('created_at', { ascending: true }),
        supabase.from('transactions').select('id, amount, transaction_type, status, created_at').eq('status', 'completed'),
        supabase.from('gifts').select('id, amount, platform_fee, status, created_at').eq('status', 'completed'),
        supabase.from('follows').select('id, created_at'),
        supabase.from('creators').select('profile_id, subscription_price, is_active'),
    ])

    // Growth metrics - last 30 days vs previous 30 days
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const recentUsers = profiles?.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length || 0
    const previousUsers = profiles?.filter(p => {
        const d = new Date(p.created_at)
        return d >= sixtyDaysAgo && d < thirtyDaysAgo
    }).length || 0

    const recentEpisodes = episodes?.filter(e => new Date(e.created_at) >= thirtyDaysAgo).length || 0
    const previousEpisodes = episodes?.filter(e => {
        const d = new Date(e.created_at)
        return d >= sixtyDaysAgo && d < thirtyDaysAgo
    }).length || 0

    const recentTxRevenue = transactions?.filter(t => new Date(t.created_at) >= thirtyDaysAgo)
        .reduce((acc, t) => acc + Number(t.amount), 0) || 0
    const previousTxRevenue = transactions?.filter(t => {
        const d = new Date(t.created_at)
        return d >= sixtyDaysAgo && d < thirtyDaysAgo
    }).reduce((acc, t) => acc + Number(t.amount), 0) || 0

    const recentGiftRevenue = gifts?.filter(g => new Date(g.created_at) >= thirtyDaysAgo)
        .reduce((acc, g) => acc + Number(g.amount), 0) || 0
    const previousGiftRevenue = gifts?.filter(g => {
        const d = new Date(g.created_at)
        return d >= sixtyDaysAgo && d < thirtyDaysAgo
    }).reduce((acc, g) => acc + Number(g.amount), 0) || 0

    const recentRevenue = recentTxRevenue + recentGiftRevenue
    const previousRevenue = previousTxRevenue + previousGiftRevenue

    function growthPercent(current: number, previous: number): string {
        if (previous === 0) return current > 0 ? '+100%' : '0%'
        const pct = ((current - previous) / previous) * 100
        return `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`
    }

    function growthColor(current: number, previous: number): string {
        if (current >= previous) return 'text-[#4CAF50]'
        return 'text-[#EF5350]'
    }

    // Content breakdown
    const freeEpisodes = episodes?.filter(e => !e.is_subscription_only && (!e.ppv_price || Number(e.ppv_price) === 0)).length || 0
    const subEpisodes = episodes?.filter(e => e.is_subscription_only).length || 0
    const ppvEpisodes = episodes?.filter(e => e.ppv_price && Number(e.ppv_price) > 0).length || 0
    const totalEpisodes = episodes?.length || 0

    // Top metrics
    const avgSubPrice = creators?.length
        ? creators.reduce((acc, c) => acc + Number(c.subscription_price), 0) / creators.length
        : 0
    const avgEpisodesPerWriter = creators?.length
        ? (episodes?.length || 0) / creators.length
        : 0
    const avgFollowsPerWriter = creators?.length
        ? (follows?.length || 0) / creators.length
        : 0

    // Revenue per transaction type
    const subRev = transactions?.filter(t => t.transaction_type === 'subscription')
        .reduce((acc, t) => acc + Number(t.amount), 0) || 0
    const ppvRev = transactions?.filter(t => t.transaction_type === 'ppv')
        .reduce((acc, t) => acc + Number(t.amount), 0) || 0
    const giftRev = gifts?.reduce((acc, g) => acc + Number(g.amount), 0) || 0
    const totalRev = subRev + ppvRev + giftRev

    function pct(value: number, total: number): string {
        if (total === 0) return '0'
        return ((value / total) * 100).toFixed(0)
    }

    // Weekly activity - last 12 weeks
    const weeks = Array.from({ length: 12 }, (_, i) => {
        const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
        const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000)
        const weekUsers = profiles?.filter(p => {
            const d = new Date(p.created_at)
            return d >= weekStart && d < weekEnd
        }).length || 0
        const weekEpisodes = episodes?.filter(e => {
            const d = new Date(e.created_at)
            return d >= weekStart && d < weekEnd
        }).length || 0
        const weekTx = transactions?.filter(t => {
            const d = new Date(t.created_at)
            return d >= weekStart && d < weekEnd
        }).reduce((acc, t) => acc + Number(t.amount), 0) || 0
        const weekGifts = gifts?.filter(g => {
            const d = new Date(g.created_at)
            return d >= weekStart && d < weekEnd
        }).reduce((acc, g) => acc + Number(g.amount), 0) || 0

        return {
            label: `S${12 - i}`,
            weekLabel: weekStart.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
            users: weekUsers,
            episodes: weekEpisodes,
            revenue: weekTx + weekGifts,
        }
    }).reverse()

    const maxWeekRevenue = Math.max(...weeks.map(w => w.revenue), 1)
    const maxWeekUsers = Math.max(...weeks.map(w => w.users), 1)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#FAF7F0] tracking-tight">Analytics</h1>
                <p className="text-[#666] text-sm mt-1">Metricas de crecimiento y tendencias de bio.me</p>
            </div>

            {/* Growth cards - 30 day comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mb-3">Nuevos Usuarios (30d)</p>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-[#FAF7F0]">{recentUsers}</p>
                        <p className={`text-sm font-bold ${growthColor(recentUsers, previousUsers)}`}>
                            {growthPercent(recentUsers, previousUsers)}
                        </p>
                    </div>
                    <p className="text-xs text-[#555] mt-2">vs {previousUsers} periodo anterior</p>
                </div>
                <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mb-3">Nuevos Episodios (30d)</p>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-[#FAF7F0]">{recentEpisodes}</p>
                        <p className={`text-sm font-bold ${growthColor(recentEpisodes, previousEpisodes)}`}>
                            {growthPercent(recentEpisodes, previousEpisodes)}
                        </p>
                    </div>
                    <p className="text-xs text-[#555] mt-2">vs {previousEpisodes} periodo anterior</p>
                </div>
                <div className="rounded-2xl border border-[#C9A84C]/20 bg-gradient-to-br from-[#C9A84C]/10 to-[#C9A84C]/5 p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C9A84C]/70 mb-3">Revenue Bruto (30d)</p>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-[#C9A84C]">${recentRevenue.toFixed(2)}</p>
                        <p className={`text-sm font-bold ${growthColor(recentRevenue, previousRevenue)}`}>
                            {growthPercent(recentRevenue, previousRevenue)}
                        </p>
                    </div>
                    <p className="text-xs text-[#666] mt-2">vs ${previousRevenue.toFixed(2)} periodo anterior</p>
                </div>
            </div>

            {/* Weekly activity chart */}
            <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
                <h3 className="text-sm font-bold text-[#FAF7F0] mb-6 uppercase tracking-wider">
                    Actividad Semanal (12 semanas)
                </h3>

                {/* Revenue bars */}
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C9A84C]/70 mb-3">Revenue por Semana</p>
                <div className="flex items-end gap-2 h-32 mb-6">
                    {weeks.map((week, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[9px] text-[#666] font-medium">
                                {week.revenue > 0 ? `$${week.revenue.toFixed(0)}` : ''}
                            </span>
                            <div
                                className="w-full rounded-t-md bg-gradient-to-t from-[#C9A84C]/40 to-[#C9A84C] transition-all duration-300 min-h-[2px]"
                                style={{ height: `${Math.max((week.revenue / maxWeekRevenue) * 100, 2)}%` }}
                            />
                            <span className="text-[8px] text-[#555]">{week.weekLabel}</span>
                        </div>
                    ))}
                </div>

                {/* Users bars */}
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4CAF50]/70 mb-3">Nuevos Usuarios por Semana</p>
                <div className="flex items-end gap-2 h-24">
                    {weeks.map((week, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[9px] text-[#666] font-medium">
                                {week.users > 0 ? week.users : ''}
                            </span>
                            <div
                                className="w-full rounded-t-md bg-gradient-to-t from-[#4CAF50]/40 to-[#4CAF50] transition-all duration-300 min-h-[2px]"
                                style={{ height: `${Math.max((week.users / maxWeekUsers) * 100, 2)}%` }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Averages and breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Writer averages */}
                <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
                    <h3 className="text-sm font-bold text-[#FAF7F0] mb-4 uppercase tracking-wider">Promedios por Escritor</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
                            <span className="text-sm text-[#999]">Precio de suscripcion promedio</span>
                            <span className="text-sm font-bold text-[#C9A84C]">${avgSubPrice.toFixed(2)}/mes</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
                            <span className="text-sm text-[#999]">Episodios por escritor</span>
                            <span className="text-sm font-bold text-[#FAF7F0]">{avgEpisodesPerWriter.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
                            <span className="text-sm text-[#999]">Seguidores por escritor</span>
                            <span className="text-sm font-bold text-[#FAF7F0]">{avgFollowsPerWriter.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-[#999]">Total escritores activos</span>
                            <span className="text-sm font-bold text-[#4CAF50]">
                                {creators?.filter(c => c.is_active).length || 0} / {creators?.length || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Revenue split */}
                <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
                    <h3 className="text-sm font-bold text-[#FAF7F0] mb-4 uppercase tracking-wider">Revenue por Canal</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm text-[#999]">Suscripciones</span>
                                <span className="text-sm font-bold text-[#C9A84C]">${subRev.toFixed(2)} ({pct(subRev, totalRev)}%)</span>
                            </div>
                            <div className="w-full bg-[#222] rounded-full h-2">
                                <div className="bg-[#C9A84C] h-2 rounded-full transition-all" style={{ width: `${pct(subRev, totalRev)}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm text-[#999]">Pay-Per-View</span>
                                <span className="text-sm font-bold text-[#FFB74D]">${ppvRev.toFixed(2)} ({pct(ppvRev, totalRev)}%)</span>
                            </div>
                            <div className="w-full bg-[#222] rounded-full h-2">
                                <div className="bg-[#FFB74D] h-2 rounded-full transition-all" style={{ width: `${pct(ppvRev, totalRev)}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm text-[#999]">Regalos</span>
                                <span className="text-sm font-bold text-[#F48FB1]">${giftRev.toFixed(2)} ({pct(giftRev, totalRev)}%)</span>
                            </div>
                            <div className="w-full bg-[#222] rounded-full h-2">
                                <div className="bg-[#F48FB1] h-2 rounded-full transition-all" style={{ width: `${pct(giftRev, totalRev)}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content breakdown */}
            <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
                <h3 className="text-sm font-bold text-[#FAF7F0] mb-4 uppercase tracking-wider">Distribucion de Contenido</h3>
                <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-[#4CAF50]">{freeEpisodes}</p>
                        <p className="text-xs text-[#666] mt-1">Episodios Gratis</p>
                        <div className="w-full bg-[#222] rounded-full h-1.5 mt-2">
                            <div className="bg-[#4CAF50] h-1.5 rounded-full" style={{ width: `${pct(freeEpisodes, totalEpisodes)}%` }} />
                        </div>
                        <p className="text-[10px] text-[#555] mt-1">{pct(freeEpisodes, totalEpisodes)}% del total</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-[#C9A84C]">{subEpisodes}</p>
                        <p className="text-xs text-[#666] mt-1">Solo Suscripcion</p>
                        <div className="w-full bg-[#222] rounded-full h-1.5 mt-2">
                            <div className="bg-[#C9A84C] h-1.5 rounded-full" style={{ width: `${pct(subEpisodes, totalEpisodes)}%` }} />
                        </div>
                        <p className="text-[10px] text-[#555] mt-1">{pct(subEpisodes, totalEpisodes)}% del total</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-[#FFB74D]">{ppvEpisodes}</p>
                        <p className="text-xs text-[#666] mt-1">Pay-Per-View</p>
                        <div className="w-full bg-[#222] rounded-full h-1.5 mt-2">
                            <div className="bg-[#FFB74D] h-1.5 rounded-full" style={{ width: `${pct(ppvEpisodes, totalEpisodes)}%` }} />
                        </div>
                        <p className="text-[10px] text-[#555] mt-1">{pct(ppvEpisodes, totalEpisodes)}% del total</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

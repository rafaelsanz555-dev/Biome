import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsCharts } from './AnalyticsCharts'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch creator's episodes
    const { data: episodes } = await supabase
        .from('episodes')
        .select('id, title, cover_image_url, word_count, reading_time_min, is_published, created_at')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    const episodeIds = (episodes ?? []).map((e) => e.id)

    const { data: views } = episodeIds.length
        ? await supabase
              .from('episode_views')
              .select('id, episode_id, country_code, device_type, referrer, started_at')
              .in('episode_id', episodeIds)
              .gte('started_at', new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString())
        : { data: [] as any[] }

    const viewIds = (views ?? []).map((v: any) => v.id)
    const { data: sessions } = viewIds.length
        ? await supabase.from('reading_sessions').select('view_id, reached_percent, time_spent_seconds, completed').in('view_id', viewIds)
        : { data: [] as any[] }

    // Aggregate retention buckets (every 10%)
    const buckets = Array.from({ length: 11 }, (_, i) => ({ pct: i * 10, count: 0 }))
    for (const s of sessions ?? []) {
        const reached = Math.floor((s.reached_percent ?? 0) / 10)
        for (let i = 0; i <= reached && i < 11; i++) buckets[i].count++
    }

    // Country map
    const countryMap = new Map<string, number>()
    for (const v of views ?? []) {
        const c = v.country_code || '—'
        countryMap.set(c, (countryMap.get(c) ?? 0) + 1)
    }
    const topCountries = Array.from(countryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([code, n]) => ({ code, count: n }))

    // Device breakdown
    const deviceMap = new Map<string, number>()
    for (const v of views ?? []) {
        const d = v.device_type || 'desktop'
        deviceMap.set(d, (deviceMap.get(d) ?? 0) + 1)
    }
    const deviceData = Array.from(deviceMap.entries()).map(([name, value]) => ({ name, value }))

    // Per-episode stats
    const viewsByEpisode = new Map<string, number>()
    for (const v of views ?? []) viewsByEpisode.set(v.episode_id, (viewsByEpisode.get(v.episode_id) ?? 0) + 1)
    const completionByEpisode = new Map<string, { completed: number; total: number }>()
    for (const s of sessions ?? []) {
        const view = (views ?? []).find((v: any) => v.id === s.view_id)
        if (!view) continue
        const cur = completionByEpisode.get(view.episode_id) ?? { completed: 0, total: 0 }
        cur.total++
        if (s.completed) cur.completed++
        completionByEpisode.set(view.episode_id, cur)
    }

    const episodeStats = (episodes ?? []).map((e) => {
        const c = completionByEpisode.get(e.id)
        return {
            id: e.id,
            title: e.title,
            views: viewsByEpisode.get(e.id) ?? 0,
            completion: c && c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
        }
    }).sort((a, b) => b.views - a.views).slice(0, 10)

    const totalViews = (views ?? []).length
    const totalSessions = (sessions ?? []).length
    const completedSessions = (sessions ?? []).filter((s: any) => s.completed).length
    const avgCompletion = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

    return (
        <div className="min-h-screen bg-[#0A0B0E] text-white py-8 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Analítica</h1>
                    <p className="text-gray-400 mt-1">Últimos 30 días</p>
                </div>

                {/* Top stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    <StatCard label="Vistas" value={totalViews.toLocaleString('es-ES')} />
                    <StatCard label="Sesiones" value={totalSessions.toLocaleString('es-ES')} />
                    <StatCard label="Tasa de finalización" value={`${avgCompletion}%`} />
                    <StatCard label="Episodios publicados" value={String((episodes ?? []).filter((e) => e.is_published).length)} />
                </div>

                <AnalyticsCharts buckets={buckets} topCountries={topCountries} deviceData={deviceData} episodeStats={episodeStats} />

                {totalViews === 0 && (
                    <div className="mt-8 p-6 rounded-xl border border-gray-800 bg-[#0F1114] text-center">
                        <p className="text-gray-400">Aún no tienes lecturas registradas. Los datos aparecerán aquí cuando tus lectores empiecen a llegar.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-[#0F1114] border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
    )
}

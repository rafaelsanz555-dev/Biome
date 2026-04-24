import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { resolveReport, dismissReport, resolveFlag } from './actions'

export const dynamic = 'force-dynamic'

// Admin allowlist (email-based). Extend via env var ADMIN_EMAILS (comma-separated).
function isAdmin(email: string | undefined): boolean {
    if (!email) return false
    const env = process.env.ADMIN_EMAILS || ''
    const list = env.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    // Default: Rafael's admin email always allowed
    if (email.toLowerCase().includes('rafael')) return true
    return list.includes(email.toLowerCase())
}

export default async function ModerationPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    if (!isAdmin(user.email)) {
        return (
            <div className="min-h-screen bg-[#0A0B0E] flex items-center justify-center">
                <div className="max-w-md text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Acceso restringido</h1>
                    <p className="text-gray-400">Esta página es solo para administradores de bio.me.</p>
                </div>
            </div>
        )
    }

    const { data: reports } = await supabase
        .from('reports')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50)

    const { data: flags } = await supabase
        .from('content_flags')
        .select('*, episodes(title, creator_id, profiles:creator_id(username, display_name))')
        .eq('reviewed', false)
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <div className="min-h-screen bg-[#0A0B0E] text-white py-8 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Moderación</h1>
                    <p className="text-gray-400 mt-1">Reportes pendientes y flags automáticos</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <section>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                            Reportes ({reports?.length ?? 0})
                        </h2>
                        <div className="space-y-3">
                            {(reports ?? []).length === 0 && <p className="text-sm text-gray-500">Sin reportes pendientes</p>}
                            {(reports ?? []).map((r: any) => (
                                <div key={r.id} className="bg-[#0F1114] border border-gray-800 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <span className="text-xs uppercase tracking-wider text-red-400 font-bold">{r.reason}</span>
                                            <p className="text-xs text-gray-500 mt-0.5">{r.target_type} · {r.target_id.slice(0, 8)}…</p>
                                        </div>
                                        <span className="text-[10px] text-gray-600">{new Date(r.created_at).toLocaleDateString('es-ES')}</span>
                                    </div>
                                    {r.description && <p className="text-sm text-gray-300 mb-3">{r.description}</p>}
                                    <div className="flex gap-2">
                                        <form action={resolveReport.bind(null, r.id)}>
                                            <button className="px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 text-xs font-semibold transition">Resolver</button>
                                        </form>
                                        <form action={dismissReport.bind(null, r.id)}>
                                            <button className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition">Descartar</button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                            Flags automáticos ({flags?.length ?? 0})
                        </h2>
                        <div className="space-y-3">
                            {(flags ?? []).length === 0 && <p className="text-sm text-gray-500">Sin flags pendientes</p>}
                            {(flags ?? []).map((f: any) => (
                                <div key={f.id} className="bg-[#0F1114] border border-gray-800 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">{f.flag_type}</span>
                                            <p className="text-xs text-gray-500 mt-0.5">confianza: {(Number(f.confidence ?? 0) * 100).toFixed(0)}%</p>
                                        </div>
                                        <span className="text-[10px] text-gray-600">{new Date(f.created_at).toLocaleDateString('es-ES')}</span>
                                    </div>
                                    {f.episodes && (
                                        <Link href={`/${f.episodes.profiles?.username}/${f.episode_id}`} className="text-sm text-white hover:text-green-400 font-semibold block mb-2">
                                            {f.episodes.title}
                                        </Link>
                                    )}
                                    <pre className="text-[10px] text-gray-500 bg-black/30 p-2 rounded overflow-x-auto mb-3">{JSON.stringify(f.evidence, null, 2).slice(0, 300)}</pre>
                                    <form action={resolveFlag.bind(null, f.id)}>
                                        <button className="px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 text-xs font-semibold transition">Marcar revisado</button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

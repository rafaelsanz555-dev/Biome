import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Star, Heart, TrendingUp } from 'lucide-react'

export default async function AudiencePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: _p } = await supabase.from('profiles').select('role').eq('id', user?.id ?? '').maybeSingle()
    if (_p?.role !== 'creator') redirect('/dashboard')

    // Followers
    const { data: follows, count: followersCount } = await supabase
        .from('follows')
        .select('*, profiles!user_id(username, full_name, avatar_url)', { count: 'exact' })
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50)

    // Active subscribers
    const { data: subs, count: subsCount } = await supabase
        .from('entitlements')
        .select('*, profiles!user_id(username, full_name, avatar_url)', { count: 'exact' })
        .eq('creator_id', user?.id)
        .eq('entitlement_type', 'subscription')
        .gte('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-1 text-white">Audiencia</h1>
                <p className="text-sm text-gray-500">Las personas que siguen y pagan por tus historias.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl p-5 bg-[#15171C] border border-gray-800">
                    <div className="flex items-start justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Seguidores</p>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-pink-500/10">
                            <Heart size={14} className="text-pink-500" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{followersCount || 0}</div>
                    <p className="text-xs text-gray-500">Total gratis</p>
                </div>

                <div className="rounded-2xl p-5 bg-gradient-to-br from-green-900/40 to-[#15171C] border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                    <div className="flex items-start justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-green-400">Suscriptores</p>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/20">
                            <Star size={14} className="text-green-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{subsCount || 0}</div>
                    <p className="text-xs text-green-500/80">Pagando activamente</p>
                </div>

                <div className="rounded-2xl p-5 bg-[#15171C] border border-gray-800">
                    <div className="flex items-start justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Conversión</p>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/10">
                            <TrendingUp size={14} className="text-green-500" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        {followersCount && followersCount > 0 ? Math.round(((subsCount || 0) / followersCount) * 100) : 0}%
                    </div>
                    <p className="text-xs text-gray-500">Seguidores → suscriptores</p>
                </div>
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subscribers */}
                <div className="rounded-2xl overflow-hidden bg-[#15171C] border border-gray-800">
                    <div className="px-5 pt-5 pb-4 border-b border-gray-800">
                        <h2 className="font-bold text-white text-base mb-0.5 flex items-center gap-2">
                            <Star size={16} className="text-green-500" />
                            Suscriptores activos
                        </h2>
                        <p className="text-xs text-gray-500">Los que pagan por tu contenido</p>
                    </div>
                    <div className="p-5">
                        {!subs || subs.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-sm text-gray-500">Sin suscriptores todavía.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {subs.map((s: any) => (
                                    <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#0A0B0E] border border-gray-800/80">
                                        <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center text-sm font-bold text-green-400 shrink-0 overflow-hidden">
                                            {s.profiles?.avatar_url ? (
                                                <img src={s.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                (s.profiles?.full_name || s.profiles?.username || '?').charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">
                                                {s.profiles?.full_name || s.profiles?.username || 'Usuario'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">@{s.profiles?.username || 'anónimo'}</p>
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 font-bold uppercase tracking-wider">
                                            Suscrito
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Followers */}
                <div className="rounded-2xl overflow-hidden bg-[#15171C] border border-gray-800">
                    <div className="px-5 pt-5 pb-4 border-b border-gray-800">
                        <h2 className="font-bold text-white text-base mb-0.5 flex items-center gap-2">
                            <Heart size={16} className="text-pink-500" />
                            Seguidores
                        </h2>
                        <p className="text-xs text-gray-500">Lectores gratis que te siguen</p>
                    </div>
                    <div className="p-5">
                        {!follows || follows.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-sm text-gray-500">Sin seguidores todavía.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {follows.map((f: any) => (
                                    <div key={f.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#0A0B0E] border border-gray-800/80">
                                        <div className="w-9 h-9 rounded-full bg-pink-500/10 flex items-center justify-center text-sm font-bold text-pink-400 shrink-0 overflow-hidden">
                                            {f.profiles?.avatar_url ? (
                                                <img src={f.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                (f.profiles?.full_name || f.profiles?.username || '?').charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">
                                                {f.profiles?.full_name || f.profiles?.username || 'Usuario'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">@{f.profiles?.username || 'anónimo'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

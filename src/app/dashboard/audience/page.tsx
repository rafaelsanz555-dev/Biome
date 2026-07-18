import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Star, Heart, TrendingUp } from 'lucide-react'

export default async function AudiencePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: _p } = await supabase.from('profiles').select('role').eq('id', user?.id ?? '').maybeSingle()
    if (_p?.role !== 'creator') redirect('/dashboard')

    // Followers — el FK hint correcto es follower_id (follows no tiene user_id)
    const { data: follows, count: followersCount, error: followsError } = await supabase
        .from('follows')
        .select('*, profiles!follower_id(username, full_name, avatar_url)', { count: 'exact' })
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50)
    if (followsError) console.error('[audience] follows query failed:', followsError.message)

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
        <div className="space-y-7">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A63D2D]">Comunidad</p>
                <h1 className="mt-2 font-serif text-4xl font-black text-[#171512]">Audiencia</h1>
                <p className="mt-2 text-sm text-[#746A5C]">Las personas que siguen y apoyan tus historias.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-[#171512]/10 bg-[#FFFCF5] p-5">
                    <div className="flex items-start justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#746A5C]">Seguidores</p>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-pink-500/10">
                            <Heart size={14} className="text-pink-500" />
                        </div>
                    </div>
                    <div className="mb-1 font-serif text-3xl font-black text-[#171512]">{followersCount || 0}</div>
                    <p className="text-xs text-[#8A8174]">Seguimiento gratuito</p>
                </div>

                <div className="border border-[#D4B963]/45 bg-[#EEE5D5] p-5">
                    <div className="flex items-start justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#D8BA63]">Suscriptores</p>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#C9A84C]/20">
                            <Star size={14} className="text-[#D8BA63]" />
                        </div>
                    </div>
                    <div className="mb-1 font-serif text-3xl font-black text-[#171512]">{subsCount || 0}</div>
                    <p className="text-xs text-[#746A5C]">Apoyando activamente</p>
                </div>

                <div className="border border-[#171512]/10 bg-[#FFFCF5] p-5">
                    <div className="flex items-start justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Conversión</p>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#C9A84C]/10">
                            <TrendingUp size={14} className="text-[#C9A84C]" />
                        </div>
                    </div>
                    <div className="mb-1 font-serif text-3xl font-black text-[#171512]">
                        {followersCount && followersCount > 0 ? Math.round(((subsCount || 0) / followersCount) * 100) : 0}%
                    </div>
                    <p className="text-xs text-[#8A8174]">Seguidores a suscriptores</p>
                </div>
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subscribers */}
                <div className="overflow-hidden border border-[#171512]/10 bg-[#FFFCF5]">
                    <div className="border-b border-[#171512]/10 px-5 pb-4 pt-5">
                        <h2 className="mb-0.5 flex items-center gap-2 font-serif text-lg font-black text-[#171512]">
                            <Star size={16} className="text-[#C9A84C]" />
                            Suscriptores activos
                        </h2>
                        <p className="text-xs text-[#746A5C]">Lectores que apoyan tu trabajo</p>
                    </div>
                    <div className="p-5">
                        {!subs || subs.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-sm text-gray-500">Sin suscriptores todavía.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {subs.map((s: any) => (
                                    <div key={s.id} className="flex items-center gap-3 border border-[#171512]/8 bg-[#F8F4EA] px-3 py-2.5">
                                        <div className="w-9 h-9 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-sm font-bold text-[#D8BA63] shrink-0 overflow-hidden">
                                            {s.profiles?.avatar_url ? (
                                                <img src={s.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                (s.profiles?.full_name || s.profiles?.username || '?').charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-bold text-[#171512]">
                                                {s.profiles?.full_name || s.profiles?.username || 'Usuario'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">@{s.profiles?.username || 'anónimo'}</p>
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#C9A84C]/10 text-[#D8BA63] font-bold uppercase tracking-wider">
                                            Suscrito
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Followers */}
                <div className="overflow-hidden border border-[#171512]/10 bg-[#FFFCF5]">
                    <div className="border-b border-[#171512]/10 px-5 pb-4 pt-5">
                        <h2 className="mb-0.5 flex items-center gap-2 font-serif text-lg font-black text-[#171512]">
                            <Heart size={16} className="text-pink-500" />
                            Seguidores
                        </h2>
                        <p className="text-xs text-[#746A5C]">Lectores que quieren volver a tus historias</p>
                    </div>
                    <div className="p-5">
                        {!follows || follows.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-sm text-gray-500">Sin seguidores todavía.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {follows.map((f: any) => (
                                    <div key={f.follower_id} className="flex items-center gap-3 border border-[#171512]/8 bg-[#F8F4EA] px-3 py-2.5">
                                        <div className="w-9 h-9 rounded-full bg-pink-500/10 flex items-center justify-center text-sm font-bold text-pink-400 shrink-0 overflow-hidden">
                                            {f.profiles?.avatar_url ? (
                                                <img src={f.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                (f.profiles?.full_name || f.profiles?.username || '?').charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-bold text-[#171512]">
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

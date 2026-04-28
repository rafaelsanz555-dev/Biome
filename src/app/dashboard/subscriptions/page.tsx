import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Star, Compass } from 'lucide-react'

export default async function SubscriptionsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: subs } = await supabase
        .from('entitlements')
        .select('*, profiles!creator_id(username, full_name, avatar_url, bio)')
        .eq('user_id', user?.id)
        .eq('entitlement_type', 'subscription')
        .gte('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-1 text-white">Mis Suscripciones</h1>
                <p className="text-sm text-gray-500">Creadores a los que apoyas activamente.</p>
            </div>

            {!subs || subs.length === 0 ? (
                <div className="p-14 text-center rounded-2xl border border-dashed border-gray-800 bg-[#15171C]">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-blue-500/10">
                        <Star size={22} className="text-blue-500" />
                    </div>
                    <p className="text-xl font-bold mb-2 text-white">Aún no sigues a nadie</p>
                    <p className="text-sm mb-6 text-gray-400">Encuentra escritores que te cuenten su historia.</p>
                    <Link href="/discover">
                        <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                            <Compass size={15} />
                            Explorar creadores
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subs.map((s: any) => (
                        <Link
                            key={s.id}
                            href={`/${s.profiles?.username}`}
                            className="group block bg-[#15171C] rounded-2xl border border-gray-800 p-5 transition-all hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(37, 99, 235,0.15)] hover:-translate-y-0.5"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-500/10 flex items-center justify-center font-bold text-blue-400 shrink-0">
                                    {s.profiles?.avatar_url ? (
                                        <img src={s.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        (s.profiles?.full_name || s.profiles?.username || '?').charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                                        {s.profiles?.full_name || s.profiles?.username}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">@{s.profiles?.username}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2 min-h-[2.5rem] mb-4">
                                {s.profiles?.bio || 'Compartiendo contenido exclusivo.'}
                            </p>
                            <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                                <span className="text-[10px] px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Star size={10} fill="currentColor" />
                                    Suscrito
                                </span>
                                <span className="text-xs text-gray-500">
                                    Hasta {new Date(s.valid_until).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

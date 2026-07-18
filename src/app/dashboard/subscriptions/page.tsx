import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Star, Compass } from 'lucide-react'
import { CancelButton } from './CancelButton'
import { MONETIZATION_ENABLED } from '@/lib/flags'

export default async function SubscriptionsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { already } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: subs } = MONETIZATION_ENABLED
        ? await supabase
            .from('entitlements')
            .select('*, profiles!creator_id(username, full_name, avatar_url, bio)')
            .eq('user_id', user?.id)
            .eq('entitlement_type', 'subscription')
            .gte('valid_until', new Date().toISOString())
            .order('created_at', { ascending: false })
        : await supabase
            .from('follows')
            .select('*, profiles!creator_id(username, full_name, avatar_url, bio)')
            .eq('follower_id', user?.id)
            .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            {already && (
                <div className="border border-[#274C43]/20 bg-[#274C43]/8 p-4 text-sm font-bold text-[#274C43]">
                    Ya tienes una suscripción activa con este escritor.
                </div>
            )}
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A63D2D]">Tu biblioteca</p>
                <h1 className="mt-2 font-serif text-4xl font-black text-[#171512]">{MONETIZATION_ENABLED ? 'Suscripciones' : 'Siguiendo'}</h1>
                <p className="mt-2 text-sm text-[#746A5C]">{MONETIZATION_ENABLED ? 'Autores e historias que apoyas activamente.' : 'Autores cuyas nuevas publicaciones quieres recibir.'}</p>
            </div>

            {!subs || subs.length === 0 ? (
                <div className="border border-dashed border-[#171512]/18 bg-white/35 p-14 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[#C9A84C]/10">
                        <Star size={22} className="text-[#C9A84C]" />
                    </div>
                    <p className="mb-2 font-serif text-2xl font-black text-[#171512]">Aún no sigues autores</p>
                    <p className="mb-6 text-sm text-[#746A5C]">Descubre una voz que quieras volver a leer.</p>
                    <Link href="/discover">
                        <button className="inline-flex items-center gap-2 rounded-full bg-[#171512] px-6 py-2.5 text-sm font-black text-white transition hover:bg-[#A63D2D]">
                            <Compass size={15} />
                            Explorar creadores
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subs.map((s: any) => (
                        <Link
                            key={s.id || `${s.follower_id}-${s.creator_id}`}
                            href={`/${s.profiles?.username}`}
                            className="group block border border-[#171512]/10 bg-[#FFFCF5] p-5 transition hover:border-[#A63D2D]/30"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#C9A84C]/10 flex items-center justify-center font-bold text-[#D8BA63] shrink-0">
                                    {s.profiles?.avatar_url ? (
                                        <img src={s.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        (s.profiles?.full_name || s.profiles?.username || '?').charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate font-serif text-lg font-black text-[#171512] transition-colors group-hover:text-[#A63D2D]">
                                        {s.profiles?.full_name || s.profiles?.username}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">@{s.profiles?.username}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2 min-h-[2.5rem] mb-4">
                                {s.profiles?.bio || 'Compartiendo contenido exclusivo.'}
                            </p>
                            <div className="flex items-center justify-between border-t border-[#171512]/10 pt-3">
                                <span className="flex items-center gap-1 bg-[#D4B963]/14 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8B6E1B]">
                                    <Star size={10} fill="currentColor" />
                                    {MONETIZATION_ENABLED ? 'Suscrito' : 'Siguiendo'}
                                </span>
                                {MONETIZATION_ENABLED && <CancelButton
                                    entitlementId={s.id}
                                    creatorName={s.profiles?.username || ''}
                                    validUntil={s.valid_until}
                                    cancelAtPeriodEnd={s.cancel_at_period_end}
                                />}
                            </div>
                            {MONETIZATION_ENABLED && <p className="text-[10px] text-gray-600 mt-2 text-right">
                                Hasta {new Date(s.valid_until).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

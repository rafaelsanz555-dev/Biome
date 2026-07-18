import { createClient } from '@/lib/supabase/server'
import { Bell, BookOpen, Gift, Star, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default async function NotificationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get notifications with actor details
    const { data: notifications } = await supabase
        .from('notifications')
        .select(`
            *,
            actor:profiles!actor_id(username, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    // Mark as read
    if (notifications?.some(n => !n.is_read)) {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false)
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#A63D2D]/8 p-2">
                    <Bell className="h-6 w-6 text-[#A63D2D]" />
                </div>
                <div>
                    <h1 className="mb-1 font-serif text-4xl font-black text-[#171512]">Notificaciones</h1>
                    <p className="text-sm text-[#746A5C]">Nuevos capítulos, seguidores y actividad de tu comunidad.</p>
                </div>
            </div>

            <div className="overflow-hidden border border-[#171512]/10 bg-[#FFFCF5]">
                {!notifications || notifications.length === 0 ? (
                    <div className="p-10 text-center">
                        <Bell className="mx-auto mb-3 h-10 w-10 text-[#A63D2D]/40" />
                        <p className="font-serif text-xl font-black text-[#171512]">Aún no tienes notificaciones</p>
                        <p className="mt-1 text-sm text-[#746A5C]">Aquí verás nuevas publicaciones y actividad de tu comunidad.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#171512]/8">
                        {notifications.map((notif: any) => {
                            const isGift = notif.type === 'gift'
                            const isSub = notif.type === 'subscription'
                            const isNewEpisode = notif.type === 'new_episode'
                            const Icon = isGift ? Gift : isSub ? Star : isNewEpisode ? BookOpen : DollarSign
                            const iconColor = isGift ? 'text-pink-500' : isSub ? 'text-yellow-400' : 'text-[#D8BA63]'
                            const iconBg = isGift ? 'bg-pink-500/10' : isSub ? 'bg-yellow-400/10' : 'bg-[#C9A84C]/10'

                            const actorName = notif.actor?.username || 'Alguien'
                            const actorAvatar = notif.actor?.avatar_url
                            // Nuevo capítulo: el click lleva directo a leerlo
                            const episodeHref = isNewEpisode && notif.reference_id && notif.actor?.username
                                ? `/${notif.actor.username}/${notif.reference_id}`
                                : null

                            return (
                                <div key={notif.id} className={`flex gap-4 p-4 transition-colors hover:bg-[#F8F4EA] ${!notif.is_read ? 'bg-[#D4B963]/8' : ''}`}>
                                    <div className="relative shrink-0">
                                        {actorAvatar ? (
                                            <img src={actorAvatar} alt={actorName} className="h-12 w-12 rounded-full border border-[#171512]/12 object-cover" />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#171512]/12 bg-[#EEE5D5] font-bold text-[#574F45]">
                                                {actorName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full ${iconBg} border-2 border-[#FFFCF5]`}>
                                            <Icon size={10} className={iconColor} />
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <p className="text-sm text-[#746A5C]">
                                            <Link href={`/${actorName}`} className="font-bold text-[#171512] hover:text-[#A63D2D]">@{actorName}</Link>
                                            {' '}{!notif.is_read && <span className="inline-block w-2 h-2 rounded-full bg-[#C9A84C] ml-1"></span>}
                                        </p>
                                        {episodeHref ? (
                                            <Link href={episodeHref} className="mt-0.5 block text-base text-[#171512] transition hover:text-[#A63D2D]">
                                                {notif.message} <span className="text-xs font-bold text-[#C9A84C]">Leer →</span>
                                            </Link>
                                        ) : (
                                            <p className="mt-0.5 text-base text-[#171512]">{notif.message}</p>
                                        )}
                                        <p className="text-xs text-gray-600 mt-2 font-medium">
                                            {new Date(notif.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

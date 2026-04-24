import { createClient } from '@/lib/supabase/server'
import { Bell, Gift, Star, DollarSign } from 'lucide-react'
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
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-xl">
                    <Bell className="text-green-500 h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Notificaciones</h1>
                    <p className="text-sm text-gray-400">Mantente al tanto de la actividad en tu perfil.</p>
                </div>
            </div>

            <div className="bg-[#15171C] border border-gray-800 rounded-2xl overflow-hidden shadow-md">
                {!notifications || notifications.length === 0 ? (
                    <div className="p-10 text-center">
                        <Bell className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">Aún no tienes notificaciones</p>
                        <p className="text-sm text-gray-600 mt-1">Aquí verás tus nuevos suscriptores y regalos.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800/80">
                        {notifications.map((notif: any) => {
                            const isGift = notif.type === 'gift'
                            const isSub = notif.type === 'subscription'
                            const Icon = isGift ? Gift : isSub ? Star : DollarSign
                            const iconColor = isGift ? 'text-pink-500' : isSub ? 'text-yellow-400' : 'text-green-400'
                            const iconBg = isGift ? 'bg-pink-500/10' : isSub ? 'bg-yellow-400/10' : 'bg-green-500/10'
                            
                            const actorName = notif.actor?.username || 'Alguien'
                            const actorAvatar = notif.actor?.avatar_url

                            return (
                                <div key={notif.id} className={`p-4 flex gap-4 transition-colors hover:bg-[#1A1C23] ${!notif.is_read ? 'bg-green-500/5' : ''}`}>
                                    <div className="relative shrink-0">
                                        {actorAvatar ? (
                                            <img src={actorAvatar} alt={actorName} className="w-12 h-12 rounded-full object-cover border border-gray-700" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold border border-gray-700">
                                                {actorName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${iconBg} border-2 border-[#15171C]`}>
                                            <Icon size={10} className={iconColor} />
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-300">
                                            <Link href={`/${actorName}`} className="font-bold text-white hover:underline">@{actorName}</Link>
                                            {' '}{!notif.is_read && <span className="inline-block w-2 h-2 rounded-full bg-green-500 ml-1"></span>}
                                        </p>
                                        <p className="text-base text-gray-100 mt-0.5">{notif.message}</p>
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

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Clock, Compass } from 'lucide-react'

export default async function HistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Use transactions as a proxy for "recently engaged with" episodes
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*, profiles!creator_id(username, full_name, avatar_url)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20)

    const { data: gifts } = await supabase
        .from('gifts')
        .select('*, profiles!recipient_id(username, full_name, avatar_url)')
        .eq('sender_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20)

    const activity = [
        ...(transactions || []).map((t: any) => ({
            id: 't-' + t.id,
            type: t.transaction_type === 'subscription' ? 'Suscripción' : t.transaction_type === 'ppv' ? 'Compra de episodio' : 'Transacción',
            date: t.created_at,
            amount: t.amount,
            profiles: t.profiles,
        })),
        ...(gifts || []).map((g: any) => ({
            id: 'g-' + g.id,
            type: `Regalo ${g.emoji || '✨'}`,
            date: g.created_at,
            amount: g.amount,
            profiles: g.profiles,
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-1 text-white flex items-center gap-2">
                    <Clock size={22} className="text-green-500" />
                    Historial
                </h1>
                <p className="text-sm text-gray-500">Tu actividad reciente en bio.me.</p>
            </div>

            {activity.length === 0 ? (
                <div className="p-14 text-center rounded-2xl border border-dashed border-gray-800 bg-[#15171C]">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-green-500/10">
                        <Clock size={22} className="text-green-500" />
                    </div>
                    <p className="text-xl font-bold mb-2 text-white">Sin actividad todavía</p>
                    <p className="text-sm mb-6 text-gray-400">Suscríbete a un escritor o manda un regalo para empezar.</p>
                    <Link href="/discover">
                        <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-500 transition-colors shadow-lg shadow-green-500/20">
                            <Compass size={15} />
                            Explorar escritores
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="rounded-2xl overflow-hidden bg-[#15171C] border border-gray-800">
                    <div className="divide-y divide-gray-800">
                        {activity.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-green-500/10 flex items-center justify-center text-sm font-bold text-green-400 shrink-0">
                                        {item.profiles?.avatar_url ? (
                                            <img src={item.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            (item.profiles?.full_name || item.profiles?.username || '?').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{item.type}</p>
                                        <p className="text-xs text-gray-500 truncate">
                                            con @{item.profiles?.username || 'anónimo'} · {new Date(item.date).toLocaleDateString('es-ES')}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-gray-400 shrink-0 ml-4">
                                    ${Number(item.amount || 0).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

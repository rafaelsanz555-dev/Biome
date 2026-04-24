import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TrendingUp, Gift, CreditCard, Lock } from 'lucide-react'

export default async function BillingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { success } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: _p } = await supabase.from('profiles').select('role').eq('id', user?.id ?? '').maybeSingle()
    if (_p?.role !== 'creator') redirect('/dashboard')

    const { data: transactions } = await supabase
        .from('transactions')
        .select('*, profiles!user_id(username)')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20)

    const { data: gifts } = await supabase
        .from('gifts')
        .select('*, profiles!sender_id(username)')
        .eq('recipient_id', user?.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20)

    const totalTransactions = transactions?.reduce((acc, t) => acc + Number(t.amount), 0) || 0
    const totalGiftEarnings = gifts?.reduce((acc, g) => acc + Number(g.writer_earnings), 0) || 0
    const totalGross = totalTransactions + (gifts?.reduce((acc, g) => acc + Number(g.amount), 0) || 0)
    const totalNet = totalTransactions + totalGiftEarnings

    return (
        <div className="space-y-6">

            {success && (
                <div className="p-4 rounded-xl flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400">
                    <Lock size={18} />
                    <span className="font-bold text-sm">¡Pago exitoso! El acceso ha sido concedido.</span>
                </div>
            )}

            <div>
                <h1 className="text-2xl font-bold mb-1 text-white">Ingresos</h1>
                <p className="text-sm text-gray-500">Suscripciones, pago por post y regalos.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl p-5 bg-[#15171C] border border-gray-800 shadow-md">
                    <div className="flex items-start justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Ingresos brutos</p>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-800">
                            <TrendingUp size={14} className="text-gray-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1 text-white">${totalGross.toFixed(2)}</div>
                    <p className="text-xs text-gray-500">Antes de comisiones de plataforma</p>
                </div>

                <div className="rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br from-green-900/40 to-[#15171C] border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                    <div className="flex items-start justify-between mb-3 relative z-10">
                        <p className="text-xs font-bold uppercase tracking-wider text-green-400">Ganancias Netas</p>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/20">
                            <CreditCard size={14} className="text-green-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1 text-white relative z-10">${totalNet.toFixed(2)}</div>
                    <p className="text-xs text-green-500/80 relative z-10">Lo que te llevas a casa</p>
                </div>

                <div className="rounded-2xl p-5 bg-[#15171C] border border-gray-800 shadow-md">
                    <div className="flex items-start justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Regalos</p>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-pink-500/10">
                            <Gift size={14} className="text-pink-500" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1 text-white">{gifts?.length || 0}</div>
                    <p className="text-xs text-gray-500">${totalGiftEarnings.toFixed(2)} generados por regalos</p>
                </div>
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl overflow-hidden bg-[#15171C] border border-gray-800 shadow-md">
                    <div className="px-5 pt-5 pb-4 border-b border-gray-800">
                        <h2 className="font-bold text-white text-base mb-0.5 flex items-center gap-2">
                            <Gift size={16} className="text-pink-500" /> 
                            Regalos Recibidos
                        </h2>
                        <p className="text-xs text-gray-500">Recibes el 88% de casa propina</p>
                    </div>
                    <div className="p-5">
                        {!gifts || gifts.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500 text-sm">Sin regalos todavía.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {gifts.map(g => (
                                    <div key={g.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#0A0B0E] border border-gray-800/80">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl drop-shadow-md">{g.emoji}</span>
                                            <div>
                                                <p className="text-sm font-bold text-white">@{g.profiles?.username || 'Fan Anónimo'}</p>
                                                <p className="text-xs text-gray-500">{new Date(g.created_at).toLocaleDateString('es-ES')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-green-400">+${Number(g.writer_earnings).toFixed(2)}</p>
                                            <p className="text-[10px] text-gray-600">Enviado: ${Number(g.amount).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl overflow-hidden bg-[#15171C] border border-gray-800 shadow-md">
                    <div className="px-5 pt-5 pb-4 border-b border-gray-800">
                        <h2 className="font-bold text-white text-base mb-0.5 flex items-center gap-2">
                            <CreditCard size={16} className="text-green-500" /> 
                            Suscripciones y PPV
                        </h2>
                        <p className="text-xs text-gray-500">Últimas 20 transacciones</p>
                    </div>
                    <div className="p-5">
                        {!transactions || transactions.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500 text-sm">Sin transacciones todavía.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map(tx => (
                                    <div key={tx.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#0A0B0E] border border-gray-800/80">
                                        <div>
                                            <p className="text-sm font-bold text-white capitalize flex items-center gap-2">
                                                {tx.transaction_type === 'subscription' && <Lock size={12} className="text-green-500" />}
                                                {tx.transaction_type === 'subscription' ? 'Suscripción Mensual' : tx.transaction_type === 'gift' ? 'Regalo' : 'Post Exclusivo (PPV)'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                de @{tx.profiles?.username || 'Fan'} · {new Date(tx.created_at).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
                                            +${Number(tx.amount).toFixed(2)}
                                        </span>
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

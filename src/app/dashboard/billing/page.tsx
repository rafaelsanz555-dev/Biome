import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { writerEarnings } from '@/lib/fees'
import { TrendingUp, Gift, CreditCard, Lock } from 'lucide-react'
import { MONETIZATION_ENABLED } from '@/lib/flags'

export default async function BillingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    if (!MONETIZATION_ENABLED) redirect('/dashboard')
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

    // Las transactions guardan el monto BRUTO que pagó el lector; el escritor
    // recibe su parte (88%). Antes se mostraba el bruto como "ganancia neta".
    const totalTransactionsGross = transactions?.reduce((acc, t) => acc + Number(t.amount), 0) || 0
    const totalGiftEarnings = gifts?.reduce((acc, g) => acc + Number(g.writer_earnings), 0) || 0
    const totalGross = totalTransactionsGross + (gifts?.reduce((acc, g) => acc + Number(g.amount), 0) || 0)
    const totalNet = writerEarnings(totalTransactionsGross) + totalGiftEarnings

    return (
        <div className="space-y-6">

            {success && (
                <div className="flex items-center gap-3 border border-[#274C43]/20 bg-[#274C43]/8 p-4 text-[#274C43]">
                    <Lock size={18} />
                    <span className="font-bold text-sm">¡Pago exitoso! El acceso ha sido concedido.</span>
                </div>
            )}

            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A63D2D]">Monetización</p>
                <h1 className="mt-2 font-serif text-4xl font-black text-[#171512]">Ingresos</h1>
                <p className="mt-2 text-sm text-[#746A5C]">Suscripciones, capítulos de pago y regalos.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-[#171512]/10 bg-[#FFFCF5] p-5">
                    <div className="flex items-start justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Ingresos brutos</p>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-800">
                            <TrendingUp size={14} className="text-gray-400" />
                        </div>
                    </div>
                    <div className="mb-1 font-serif text-3xl font-black text-[#171512]">${totalGross.toFixed(2)}</div>
                    <p className="text-xs text-gray-500">Antes de comisiones de plataforma</p>
                </div>

                <div className="relative overflow-hidden border border-[#D4B963]/45 bg-[#EEE5D5] p-5">
                    <div className="flex items-start justify-between mb-3 relative z-10">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#D8BA63]">Ganancias Netas</p>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#C9A84C]/20">
                            <CreditCard size={14} className="text-[#D8BA63]" />
                        </div>
                    </div>
                    <div className="relative z-10 mb-1 font-serif text-3xl font-black text-[#171512]">${totalNet.toFixed(2)}</div>
                    <p className="relative z-10 text-xs text-[#746A5C]">Ganancia estimada para el escritor</p>
                </div>

                <div className="border border-[#171512]/10 bg-[#FFFCF5] p-5">
                    <div className="flex items-start justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Regalos</p>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-pink-500/10">
                            <Gift size={14} className="text-pink-500" />
                        </div>
                    </div>
                    <div className="mb-1 font-serif text-3xl font-black text-[#171512]">{gifts?.length || 0}</div>
                    <p className="text-xs text-gray-500">${totalGiftEarnings.toFixed(2)} generados por regalos</p>
                </div>
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="overflow-hidden border border-[#171512]/10 bg-[#FFFCF5]">
                    <div className="border-b border-[#171512]/10 px-5 pb-4 pt-5">
                        <h2 className="mb-0.5 flex items-center gap-2 font-serif text-lg font-black text-[#171512]">
                            <Gift size={16} className="text-pink-500" /> 
                            Regalos Recibidos
                        </h2>
                        <p className="text-xs text-gray-500">Recibes el 88% de cada propina</p>
                    </div>
                    <div className="p-5">
                        {!gifts || gifts.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500 text-sm">Sin regalos todavía.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {gifts.map(g => (
                                    <div key={g.id} className="flex items-center justify-between border border-[#171512]/8 bg-[#F8F4EA] px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl drop-shadow-md">{g.emoji}</span>
                                            <div>
                                                <p className="text-sm font-bold text-[#171512]">@{g.profiles?.username || 'Fan Anónimo'}</p>
                                                <p className="text-xs text-gray-500">{new Date(g.created_at).toLocaleDateString('es-ES')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-[#D8BA63]">+${Number(g.writer_earnings).toFixed(2)}</p>
                                            <p className="text-[10px] text-gray-600">Enviado: ${Number(g.amount).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-hidden border border-[#171512]/10 bg-[#FFFCF5]">
                    <div className="border-b border-[#171512]/10 px-5 pb-4 pt-5">
                        <h2 className="mb-0.5 flex items-center gap-2 font-serif text-lg font-black text-[#171512]">
                            <CreditCard size={16} className="text-[#C9A84C]" /> 
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
                                    <div key={tx.id} className="flex items-center justify-between border border-[#171512]/8 bg-[#F8F4EA] px-4 py-3">
                                        <div>
                                            <p className="flex items-center gap-2 text-sm font-bold capitalize text-[#171512]">
                                                {tx.transaction_type === 'subscription' && <Lock size={12} className="text-[#C9A84C]" />}
                                                {tx.transaction_type === 'subscription' ? 'Suscripción Mensual' : tx.transaction_type === 'tip' ? 'Propina' : tx.transaction_type === 'gift' ? 'Regalo' : 'Post Exclusivo (PPV)'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                de @{tx.profiles?.username || 'Fan'} · {new Date(tx.created_at).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-[#D8BA63] bg-[#C9A84C]/10 px-2 py-1 rounded-md border border-[#C9A84C]/20">
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

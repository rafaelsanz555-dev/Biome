import { createClient } from '@/lib/supabase/server'

export default async function AdminRevenuePage() {
    const supabase = await createClient()

    // All transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select(`
            id,
            amount,
            currency,
            transaction_type,
            status,
            created_at,
            user_id,
            creator_id,
            profiles!transactions_user_id_fkey (
                username,
                full_name
            )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

    // All gifts
    const { data: gifts } = await supabase
        .from('gifts')
        .select(`
            id,
            amount,
            platform_fee,
            writer_earnings,
            emoji,
            status,
            created_at,
            sender_id,
            recipient_id
        `)
        .order('created_at', { ascending: false })
        .limit(50)

    // Get sender/recipient profiles for gifts
    const giftUserIds = [
        ...new Set([
            ...(gifts?.map(g => g.sender_id).filter(Boolean) || []),
            ...(gifts?.map(g => g.recipient_id) || []),
        ])
    ]

    const { data: giftProfiles } = giftUserIds.length > 0
        ? await supabase.from('profiles').select('id, username, full_name').in('id', giftUserIds)
        : { data: [] }

    function getProfile(id: string) {
        return giftProfiles?.find(p => p.id === id)
    }

    // Totals
    const completedTx = transactions?.filter(t => t.status === 'completed') || []
    const completedGifts = gifts?.filter(g => g.status === 'completed') || []

    const totalTxRevenue = completedTx.reduce((acc, t) => acc + Number(t.amount), 0)
    const totalTxPlatformFee = totalTxRevenue * 0.10
    const totalGiftRevenue = completedGifts.reduce((acc, g) => acc + Number(g.amount), 0)
    const totalGiftPlatformFee = completedGifts.reduce((acc, g) => acc + Number(g.platform_fee), 0)
    const totalPlatformRevenue = totalTxPlatformFee + totalGiftPlatformFee

    // By type breakdown
    const subscriptionRevenue = completedTx.filter(t => t.transaction_type === 'subscription')
        .reduce((acc, t) => acc + Number(t.amount), 0)
    const ppvRevenue = completedTx.filter(t => t.transaction_type === 'ppv')
        .reduce((acc, t) => acc + Number(t.amount), 0)
    const tipRevenue = completedTx.filter(t => t.transaction_type === 'tip')
        .reduce((acc, t) => acc + Number(t.amount), 0)

    function typeBadge(type: string) {
        const styles: Record<string, { label: string; style: string }> = {
            subscription: { label: 'Suscripcion', style: 'bg-[#C9A84C]/15 text-[#C9A84C] border-[#C9A84C]/20' },
            ppv: { label: 'PPV', style: 'bg-[#FF9800]/15 text-[#FFB74D] border-[#FFB74D]/20' },
            tip: { label: 'Propina', style: 'bg-[#2196F3]/15 text-[#64B5F6] border-[#64B5F6]/20' },
            gift: { label: 'Regalo', style: 'bg-[#E91E63]/15 text-[#F48FB1] border-[#F48FB1]/20' },
        }
        return styles[type] || { label: type, style: 'bg-[#333] text-[#999] border-[#444]' }
    }

    function statusBadge(status: string) {
        if (status === 'completed') return 'bg-[#2E7D32]/15 text-[#4CAF50] border-[#4CAF50]/20'
        return 'bg-[#FF9800]/15 text-[#FFB74D] border-[#FFB74D]/20'
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#FAF7F0] tracking-tight">Ingresos</h1>
                <p className="text-[#666] text-sm mt-1">Detalle completo de todas las transacciones y revenue de la plataforma</p>
            </div>

            {/* Revenue highlight */}
            <div className="rounded-2xl border border-[#C9A84C]/20 bg-gradient-to-r from-[#C9A84C]/10 via-[#111] to-[#111] p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C9A84C]/70 mb-1">Revenue Plataforma</p>
                        <p className="text-3xl font-bold text-[#C9A84C]">${totalPlatformRevenue.toFixed(2)}</p>
                        <p className="text-xs text-[#666] mt-1">Tu 10-12% del total</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mb-1">Revenue Bruto</p>
                        <p className="text-3xl font-bold text-[#FAF7F0]">${(totalTxRevenue + totalGiftRevenue).toFixed(2)}</p>
                        <p className="text-xs text-[#555] mt-1">Generado por escritores</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mb-1">Transacciones</p>
                        <p className="text-3xl font-bold text-[#FAF7F0]">{completedTx.length + completedGifts.length}</p>
                        <p className="text-xs text-[#555] mt-1">Completadas</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mb-1">Ticket Promedio</p>
                        <p className="text-3xl font-bold text-[#FAF7F0]">
                            ${completedTx.length + completedGifts.length > 0
                                ? ((totalTxRevenue + totalGiftRevenue) / (completedTx.length + completedGifts.length)).toFixed(2)
                                : '0.00'}
                        </p>
                        <p className="text-xs text-[#555] mt-1">Por transaccion</p>
                    </div>
                </div>
            </div>

            {/* Revenue by type */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-[#C9A84C]/20 bg-[#111] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C9A84C]/70 mb-1">Suscripciones</p>
                    <p className="text-2xl font-bold text-[#C9A84C]">${subscriptionRevenue.toFixed(2)}</p>
                    <p className="text-xs text-[#666] mt-1">${(subscriptionRevenue * 0.10).toFixed(2)} para bio.me</p>
                </div>
                <div className="rounded-2xl border border-[#FFB74D]/20 bg-[#111] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#FFB74D]/70 mb-1">Pay-Per-View</p>
                    <p className="text-2xl font-bold text-[#FFB74D]">${ppvRevenue.toFixed(2)}</p>
                    <p className="text-xs text-[#666] mt-1">${(ppvRevenue * 0.10).toFixed(2)} para bio.me</p>
                </div>
                <div className="rounded-2xl border border-[#F48FB1]/20 bg-[#111] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#F48FB1]/70 mb-1">Regalos</p>
                    <p className="text-2xl font-bold text-[#F48FB1]">${totalGiftRevenue.toFixed(2)}</p>
                    <p className="text-xs text-[#666] mt-1">${totalGiftPlatformFee.toFixed(2)} para bio.me (12%)</p>
                </div>
                <div className="rounded-2xl border border-[#64B5F6]/20 bg-[#111] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#64B5F6]/70 mb-1">Propinas</p>
                    <p className="text-2xl font-bold text-[#64B5F6]">${tipRevenue.toFixed(2)}</p>
                    <p className="text-xs text-[#666] mt-1">${(tipRevenue * 0.10).toFixed(2)} para bio.me</p>
                </div>
            </div>

            {/* Transactions table */}
            <div className="rounded-2xl border border-[#222] bg-[#111] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#222]">
                    <h2 className="text-sm font-bold text-[#FAF7F0] uppercase tracking-wider">
                        Transacciones Recientes
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#222]">
                                <th className="text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-6 py-3">Tipo</th>
                                <th className="text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-4 py-3">De</th>
                                <th className="text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-4 py-3">Monto</th>
                                <th className="text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-4 py-3">Para bio.me</th>
                                <th className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-4 py-3">Estado</th>
                                <th className="text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-6 py-3">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions?.map((tx) => {
                                const badge = typeBadge(tx.transaction_type)
                                const profile = tx.profiles as unknown as { username: string; full_name: string | null }
                                return (
                                    <tr key={tx.id} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors">
                                        <td className="px-6 py-3">
                                            <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${badge.style}`}>
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-[#999]">
                                            @{profile?.username || 'desconocido'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-[#FAF7F0]">
                                            ${Number(tx.amount).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-[#C9A84C]">
                                            ${(Number(tx.amount) * 0.10).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadge(tx.status)}`}>
                                                {tx.status === 'completed' ? 'OK' : tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right text-xs text-[#666]">
                                            {new Date(tx.created_at).toLocaleDateString('es-ES', {
                                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                    </tr>
                                )
                            })}
                            {(!transactions || transactions.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#666]">
                                        No hay transacciones aun
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Gifts table */}
            <div className="rounded-2xl border border-[#222] bg-[#111] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#222]">
                    <h2 className="text-sm font-bold text-[#FAF7F0] uppercase tracking-wider">
                        Regalos Recientes
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#222]">
                                <th className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-4 py-3">Emoji</th>
                                <th className="text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-4 py-3">De</th>
                                <th className="text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-4 py-3">Para</th>
                                <th className="text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-4 py-3">Monto</th>
                                <th className="text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-4 py-3">bio.me (12%)</th>
                                <th className="text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-4 py-3">Escritor (88%)</th>
                                <th className="text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-6 py-3">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gifts?.map((gift) => {
                                const sender = getProfile(gift.sender_id)
                                const recipient = getProfile(gift.recipient_id)
                                return (
                                    <tr key={gift.id} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors">
                                        <td className="px-4 py-3 text-center text-xl">{gift.emoji}</td>
                                        <td className="px-4 py-3 text-sm text-[#999]">
                                            @{sender?.username || 'anonimo'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-[#FAF7F0] font-medium">
                                            @{recipient?.username || 'desconocido'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-[#FAF7F0]">
                                            ${Number(gift.amount).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-[#C9A84C]">
                                            ${Number(gift.platform_fee).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-[#4CAF50]">
                                            ${Number(gift.writer_earnings).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-3 text-right text-xs text-[#666]">
                                            {new Date(gift.created_at).toLocaleDateString('es-ES', {
                                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                    </tr>
                                )
                            })}
                            {(!gifts || gifts.length === 0) && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-[#666]">
                                        No hay regalos aun
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

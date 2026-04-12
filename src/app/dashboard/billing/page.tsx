import { createClient } from '@/lib/supabase/server'

export default async function BillingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { success } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Transactions (subscriptions, PPV)
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*, profiles!user_id(username)')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20)

    // Gifts received
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
        <div className="space-y-8">

            {/* Success Banner */}
            {success && (
                <div
                    className="p-4 rounded-xl flex items-center gap-3"
                    style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-warm)', color: 'var(--gold-dark)' }}
                >
                    <span className="text-xl">✦</span>
                    <span className="font-medium">¡Pago exitoso! El acceso ha sido concedido.</span>
                </div>
            )}

            {/* Header */}
            <div>
                <h1
                    className="font-serif text-3xl mb-1"
                    style={{ color: 'var(--ink)' }}
                >
                    Ganancias
                </h1>
                <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
                    Ingresos por suscripciones, pago por publicación y regalos.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Gross Revenue */}
                <div
                    className="rounded-2xl border p-5 shadow-sm"
                    style={{ background: '#ffffff', borderColor: 'var(--cream-mid)' }}
                >
                    <p
                        className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                        style={{ color: 'var(--ink-light)' }}
                    >
                        Ingresos brutos
                    </p>
                    <div
                        className="text-4xl font-bold mb-1"
                        style={{ color: 'var(--ink)' }}
                    >
                        ${totalGross.toFixed(2)}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--ink-light)' }}>
                        Antes de comisiones · este mes
                    </p>
                </div>

                {/* Net Earnings — gold highlight */}
                <div
                    className="rounded-2xl border p-5 shadow-sm"
                    style={{ background: 'var(--gold-bg)', borderColor: 'var(--gold-warm)' }}
                >
                    <p
                        className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                        style={{ color: 'var(--gold-dark)' }}
                    >
                        Ganancias netas
                    </p>
                    <div
                        className="text-4xl font-bold mb-1"
                        style={{ color: 'var(--gold-dark)' }}
                    >
                        ${totalNet.toFixed(2)}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--ink-light)' }}>
                        Comisión de plataforma (10-12%) · este mes
                    </p>
                </div>

                {/* Gifts Count */}
                <div
                    className="rounded-2xl border p-5 shadow-sm"
                    style={{ background: '#ffffff', borderColor: 'var(--cream-mid)' }}
                >
                    <p
                        className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                        style={{ color: 'var(--ink-light)' }}
                    >
                        Regalos recibidos
                    </p>
                    <div
                        className="text-4xl font-bold mb-1"
                        style={{ color: 'var(--ink)' }}
                    >
                        {gifts?.length || 0}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--ink-light)' }}>
                        ${totalGiftEarnings.toFixed(2)} ganados en regalos
                    </p>
                </div>
            </div>

            {/* Gifts + Transactions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Gifts Received */}
                <div
                    className="rounded-2xl border shadow-sm overflow-hidden"
                    style={{ background: '#ffffff', borderColor: 'var(--cream-mid)' }}
                >
                    <div
                        className="px-5 pt-5 pb-4 border-b"
                        style={{ borderColor: 'var(--cream-mid)' }}
                    >
                        <h2
                            className="font-serif text-base font-bold mb-0.5"
                            style={{ color: 'var(--ink)' }}
                        >
                            ✦ Regalos recibidos
                        </h2>
                        <p className="text-xs" style={{ color: 'var(--ink-light)' }}>
                            De tus lectores (tú recibes 88%)
                        </p>
                    </div>
                    <div className="p-5">
                        {!gifts || gifts.length === 0 ? (
                            <div className="text-center py-10">
                                <p
                                    className="font-serif italic text-lg mb-1"
                                    style={{ color: 'var(--ink-light)' }}
                                >
                                    Sin transacciones todavía.
                                </p>
                                <p className="text-xs" style={{ color: 'var(--ink-light)' }}>
                                    Tus ganancias aparecerán aquí cuando los lectores se suscriban.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {gifts.map(g => (
                                    <div
                                        key={g.id}
                                        className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                                        style={{ background: 'var(--cream-dark)' }}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className="text-xl"
                                                style={{ color: 'var(--gold)' }}
                                            >
                                                {g.emoji}
                                            </span>
                                            <div>
                                                <p
                                                    className="text-sm font-semibold"
                                                    style={{ color: 'var(--ink)' }}
                                                >
                                                    @{g.profiles?.username || 'Alguien'}
                                                </p>
                                                <p
                                                    className="text-xs"
                                                    style={{ color: 'var(--ink-light)' }}
                                                >
                                                    {new Date(g.created_at).toLocaleDateString('es-ES')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className="text-sm font-bold"
                                                style={{ color: 'var(--gold-dark)' }}
                                            >
                                                +${Number(g.writer_earnings).toFixed(2)}
                                            </p>
                                            <p
                                                className="text-[10px]"
                                                style={{ color: 'var(--ink-light)' }}
                                            >
                                                ${Number(g.amount).toFixed(2)} total
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Subscriptions & PPV */}
                <div
                    className="rounded-2xl border shadow-sm overflow-hidden"
                    style={{ background: '#ffffff', borderColor: 'var(--cream-mid)' }}
                >
                    <div
                        className="px-5 pt-5 pb-4 border-b"
                        style={{ borderColor: 'var(--cream-mid)' }}
                    >
                        <h2
                            className="font-serif text-base font-bold mb-0.5"
                            style={{ color: 'var(--ink)' }}
                        >
                            ◈ Suscripciones y Pago único
                        </h2>
                        <p className="text-xs" style={{ color: 'var(--ink-light)' }}>
                            Últimas 20 transacciones
                        </p>
                    </div>
                    <div className="p-5">
                        {!transactions || transactions.length === 0 ? (
                            <div className="text-center py-10">
                                <p
                                    className="font-serif italic text-lg mb-1"
                                    style={{ color: 'var(--ink-light)' }}
                                >
                                    Sin transacciones todavía.
                                </p>
                                <p className="text-xs" style={{ color: 'var(--ink-light)' }}>
                                    Tus ganancias aparecerán aquí cuando los lectores se suscriban.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {transactions.map(tx => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                                        style={{ background: 'var(--cream-dark)' }}
                                    >
                                        <div>
                                            <p
                                                className="text-sm font-semibold capitalize"
                                                style={{ color: 'var(--ink)' }}
                                            >
                                                {tx.transaction_type === 'subscription'
                                                    ? 'Suscripción'
                                                    : tx.transaction_type === 'gift'
                                                    ? 'Regalo'
                                                    : tx.transaction_type === 'ppv'
                                                    ? 'Pago único'
                                                    : tx.transaction_type}
                                            </p>
                                            <p
                                                className="text-xs"
                                                style={{ color: 'var(--ink-light)' }}
                                            >
                                                de @{tx.profiles?.username || 'Lector'} · {new Date(tx.created_at).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                        <span
                                            className="text-sm font-bold"
                                            style={{ color: 'var(--gold-dark)' }}
                                        >
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

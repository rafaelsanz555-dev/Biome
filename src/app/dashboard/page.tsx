import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardOverview() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { count: postsCount } = await supabase
        .from('episodes')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user?.id)

    const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user?.id)

    const { data: gifts } = await supabase
        .from('gifts')
        .select('amount')
        .eq('recipient_id', user?.id)
        .eq('status', 'completed')

    const totalGiftEarnings = gifts?.reduce((acc, g) => acc + Number(g.amount) * 0.88, 0) || 0

    return (
        <div className="space-y-8" style={{ background: 'var(--cream)' }}>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1
                        className="font-serif text-3xl mb-1"
                        style={{ color: 'var(--ink)' }}
                    >
                        Panel
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
                        Bienvenido a tu panel de escritor en bio.me
                    </p>
                </div>
                <Link href="/dashboard/episodes/new">
                    <Button
                        className="font-semibold px-5"
                        style={{ background: 'var(--ink)', color: 'var(--cream)' }}
                    >
                        ✦ Nuevo episodio
                    </Button>
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Subscribers */}
                <div
                    className="rounded-2xl border p-5 shadow-sm"
                    style={{ background: '#ffffff', borderColor: 'var(--cream-mid)' }}
                >
                    <p
                        className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                        style={{ color: 'var(--ink-light)' }}
                    >
                        Suscriptores activos
                    </p>
                    <div
                        className="text-4xl font-bold mb-1"
                        style={{ color: 'var(--ink)' }}
                    >
                        {followersCount || 0}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--ink-light)' }}>
                        Personas siguiendo tu historia
                    </p>
                </div>

                {/* Episodes */}
                <div
                    className="rounded-2xl border p-5 shadow-sm"
                    style={{ background: '#ffffff', borderColor: 'var(--cream-mid)' }}
                >
                    <p
                        className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                        style={{ color: 'var(--ink-light)' }}
                    >
                        Episodios publicados
                    </p>
                    <div
                        className="text-4xl font-bold mb-1"
                        style={{ color: 'var(--ink)' }}
                    >
                        {postsCount || 0}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--ink-light)' }}>
                        Total de publicaciones en tu perfil
                    </p>
                </div>

                {/* Gift Earnings — highlighted gold */}
                <div
                    className="rounded-2xl border p-5 shadow-sm"
                    style={{ background: 'var(--gold-bg)', borderColor: 'var(--gold-warm)' }}
                >
                    <p
                        className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                        style={{ color: 'var(--gold-dark)' }}
                    >
                        Ingresos por regalos
                    </p>
                    <div
                        className="text-4xl font-bold mb-1"
                        style={{ color: 'var(--gold-dark)' }}
                    >
                        ${totalGiftEarnings.toFixed(2)}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--ink-light)' }}>
                        De regalos de lectores · Tu 88% · este mes
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div
                className="rounded-2xl border p-6"
                style={{ background: 'var(--cream-dark)', borderColor: 'var(--cream-mid)' }}
            >
                <h2
                    className="font-serif text-lg mb-4"
                    style={{ color: 'var(--ink)' }}
                >
                    Acciones rápidas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    <Link href="/dashboard/episodes/new">
                        <div
                            className="rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm"
                            style={{ background: '#ffffff', borderColor: 'var(--cream-mid)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream-dark)')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
                        >
                            <div
                                className="text-xl mb-2 font-serif leading-none"
                                style={{ color: 'var(--gold)' }}
                            >
                                ✦
                            </div>
                            <div
                                className="font-serif font-semibold text-sm mb-0.5"
                                style={{ color: 'var(--ink)' }}
                            >
                                Nuevo episodio
                            </div>
                            <div className="text-xs" style={{ color: 'var(--ink-light)' }}>
                                Comparte un nuevo capítulo de tu historia
                            </div>
                        </div>
                    </Link>

                    <Link href="/dashboard/episodes">
                        <div
                            className="rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm"
                            style={{ background: '#ffffff', borderColor: 'var(--cream-mid)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream-dark)')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
                        >
                            <div
                                className="text-xl mb-2 font-serif leading-none"
                                style={{ color: 'var(--gold)' }}
                            >
                                ◈
                            </div>
                            <div
                                className="font-serif font-semibold text-sm mb-0.5"
                                style={{ color: 'var(--ink)' }}
                            >
                                Nueva serie
                            </div>
                            <div className="text-xs" style={{ color: 'var(--ink-light)' }}>
                                Editar o eliminar episodios
                            </div>
                        </div>
                    </Link>

                    <Link href="/dashboard/billing">
                        <div
                            className="rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm"
                            style={{ background: '#ffffff', borderColor: 'var(--cream-mid)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream-dark)')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
                        >
                            <div
                                className="text-xl mb-2 font-serif leading-none"
                                style={{ color: 'var(--gold)' }}
                            >
                                ▲
                            </div>
                            <div
                                className="font-serif font-semibold text-sm mb-0.5"
                                style={{ color: 'var(--ink)' }}
                            >
                                Ver ganancias
                            </div>
                            <div className="text-xs" style={{ color: 'var(--ink-light)' }}>
                                Rastrea tus ingresos
                            </div>
                        </div>
                    </Link>

                </div>
            </div>
        </div>
    )
}

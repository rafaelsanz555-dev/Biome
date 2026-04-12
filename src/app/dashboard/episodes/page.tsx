import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export default async function EpisodesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: episodes } = await supabase
        .from('episodes')
        .select('*, seasons(title)')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1
                        className="font-serif text-3xl mb-2"
                        style={{ color: 'var(--ink)' }}
                    >
                        Mis Episodios
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
                        Administra tus historias publicadas y borradores.
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

            {/* Episode List */}
            <div className="space-y-4">
                {!episodes || episodes.length === 0 ? (
                    <div
                        className="p-12 text-center rounded-2xl border border-dashed"
                        style={{ background: 'var(--cream-dark)', borderColor: 'var(--cream-mid)' }}
                    >
                        <p
                            className="font-serif text-xl italic mb-2"
                            style={{ color: 'var(--ink-light)' }}
                        >
                            Sin episodios todavía.
                        </p>
                        <p className="text-sm mb-6" style={{ color: 'var(--ink-light)' }}>
                            Crea tu primer episodio para comenzar.
                        </p>
                        <Link href="/dashboard/episodes/new">
                            <Button
                                variant="outline"
                                className="font-semibold"
                                style={{
                                    borderColor: 'var(--cream-mid)',
                                    background: '#ffffff',
                                    color: 'var(--ink)',
                                }}
                            >
                                Escribe tu primer episodio
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {episodes.map((episode) => (
                            <div
                                key={episode.id}
                                className="rounded-2xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center pr-0 sm:pr-6 transition-shadow hover:shadow-md"
                                style={{ background: '#ffffff', borderColor: 'var(--cream-mid)' }}
                            >
                                {/* Left: text content */}
                                <div className="p-5 flex-1 min-w-0">

                                    {/* Title + badges row */}
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <h2
                                            className="font-serif text-xl"
                                            style={{ color: 'var(--ink)' }}
                                        >
                                            {episode.title}
                                        </h2>

                                        {/* Publicado / Borrador badge */}
                                        {episode.is_published ? (
                                            <span
                                                className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md"
                                                style={{ background: 'var(--gold-bg)', color: 'var(--gold-dark)' }}
                                            >
                                                Publicado
                                            </span>
                                        ) : (
                                            <span
                                                className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md"
                                                style={{ background: 'var(--cream-dark)', color: 'var(--ink-light)' }}
                                            >
                                                Borrador
                                            </span>
                                        )}

                                        {/* Season badge */}
                                        {episode.seasons?.title && (
                                            <span
                                                className="px-2 py-0.5 text-xs font-medium rounded-md border"
                                                style={{
                                                    background: 'var(--cream-dark)',
                                                    color: 'var(--ink-mid)',
                                                    borderColor: 'var(--cream-mid)',
                                                }}
                                            >
                                                {episode.seasons.title}
                                            </span>
                                        )}
                                    </div>

                                    {/* Preview text */}
                                    <p
                                        className="text-sm line-clamp-1 max-w-2xl"
                                        style={{ color: 'var(--ink-light)' }}
                                    >
                                        {episode.preview_text || 'Sin texto de vista previa.'}
                                    </p>
                                </div>

                                {/* Right: access type + edit */}
                                <div className="pb-5 sm:pb-0 px-5 sm:px-0 flex items-center gap-4 text-sm font-medium shrink-0">
                                    {episode.is_subscription_only ? (
                                        <span
                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs"
                                            style={{ background: 'var(--ink)', color: 'var(--cream)' }}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                            </svg>
                                            Suscriptores
                                        </span>
                                    ) : episode.ppv_price ? (
                                        <span
                                            className="px-2.5 py-1 rounded-lg font-bold text-xs"
                                            style={{ background: 'var(--gold-bg)', color: 'var(--gold-dark)' }}
                                        >
                                            ${episode.ppv_price} Pago único
                                        </span>
                                    ) : (
                                        <span
                                            className="text-xs font-medium"
                                            style={{ color: 'var(--ink-light)' }}
                                        >
                                            Gratis
                                        </span>
                                    )}

                                    <Link
                                        href={`#`}
                                        className="underline underline-offset-4 font-bold text-sm transition-colors"
                                        style={{ color: 'var(--gold-dark)' }}
                                    >
                                        Editar
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

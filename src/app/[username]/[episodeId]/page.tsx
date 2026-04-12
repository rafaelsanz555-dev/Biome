import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'

interface EpisodePageProps {
    params: Promise<{
        username: string
        episodeId: string
    }>
}

export default async function EpisodePage({ params }: EpisodePageProps) {
    const { username, episodeId } = await params
    const supabase = await createClient()

    const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('*, creators(profile_id, subscription_price)')
        .eq('username', username.toLowerCase())
        .single()

    if (!creatorProfile) notFound()

    const { data: episode } = await supabase
        .from('episodes')
        .select('*, seasons(title)')
        .eq('id', episodeId)
        .single()

    if (!episode || (!episode.is_published && episode.creator_id !== creatorProfile.id)) {
        notFound()
    }

    const { data: { user } } = await supabase.auth.getUser()
    let hasAccess = false

    if (user) {
        if (user.id === episode.creator_id) {
            hasAccess = true
        } else {
            const { data: entitlement } = await supabase
                .from('entitlements')
                .select('id')
                .eq('user_id', user.id)
                .or(`episode_id.eq.${episode.id},and(creator_id.eq.${creatorProfile.creators?.profile_id},entitlement_type.eq.subscription)`)
                .limit(1)
                .maybeSingle()

            if (entitlement) hasAccess = true
        }
    }

    const initial = (creatorProfile.full_name || creatorProfile.username).charAt(0).toUpperCase()

    return (
        <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--cream)' }}>
            <Navbar />

            {/* Episode breadcrumb bar */}
            <div
                className="sticky top-16 z-40"
                style={{
                    backgroundColor: 'var(--cream)',
                    borderBottom: '1px solid var(--cream-mid)',
                }}
            >
                <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link
                        href={`/${username}`}
                        className="flex items-center gap-3 transition-opacity hover:opacity-70"
                    >
                        <div
                            className="w-8 h-8 rounded-full overflow-hidden shrink-0"
                            style={{ border: '2px solid var(--cream-mid)' }}
                        >
                            {creatorProfile.avatar_url ? (
                                <img src={creatorProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center font-serif font-bold text-sm"
                                    style={{ backgroundColor: 'var(--ink)', color: 'var(--cream)' }}
                                >
                                    {initial}
                                </div>
                            )}
                        </div>
                        <span className="font-serif font-semibold text-sm" style={{ color: 'var(--ink)' }}>
                            {creatorProfile.full_name || creatorProfile.username}
                        </span>
                    </Link>
                    <div className="text-xs font-medium" style={{ color: 'var(--ink-light)' }}>
                        {episode.seasons?.title || 'Independiente'}
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 mt-12">
                {/* Cover image */}
                {episode.cover_image_url && (
                    <div
                        className="w-full aspect-video rounded-2xl overflow-hidden mb-10"
                        style={{
                            border: '1px solid var(--cream-mid)',
                            boxShadow: '0 8px 32px rgba(20,16,10,0.10)',
                        }}
                    >
                        <img src={episode.cover_image_url} alt={episode.title} className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Episode title */}
                <h1
                    className="font-serif font-bold leading-tight mb-6"
                    style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        color: 'var(--ink)',
                    }}
                >
                    {episode.title}
                </h1>

                {/* Meta bar */}
                <div
                    className="flex items-center gap-4 text-sm mb-12 pb-8"
                    style={{
                        borderBottom: '1px solid var(--cream-mid)',
                        color: 'var(--ink-light)',
                    }}
                >
                    <span>
                        {new Date(episode.created_at).toLocaleDateString('es-ES', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </span>
                    {!hasAccess && (
                        <span
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                            style={{
                                backgroundColor: 'var(--gold-bg)',
                                color: 'var(--gold-dark)',
                                border: '1px solid var(--cream-mid)',
                            }}
                        >
                            ✦ Premium
                        </span>
                    )}
                </div>

                {/* Preview text — always free */}
                {episode.preview_text && (
                    <div
                        className="mb-10 pl-5 text-base leading-relaxed italic"
                        style={{
                            borderLeft: '3px solid var(--gold)',
                            color: 'var(--ink-mid)',
                            fontFamily: 'var(--font-playfair), Georgia, serif',
                        }}
                    >
                        {episode.preview_text}
                    </div>
                )}

                {/* ── Full Content or Paywall ─────────────────────── */}
                {hasAccess ? (
                    <div
                        className="text-base leading-8 whitespace-pre-wrap"
                        style={{
                            color: 'var(--ink)',
                            fontFamily: 'var(--font-playfair), Georgia, serif',
                            fontSize: '1.0625rem',
                        }}
                    >
                        {episode.full_text}
                    </div>
                ) : (
                    /* ── Paywall ─────────────────────────────────── */
                    <div className="relative">
                        {/* Blurred continuation hint */}
                        <div
                            className="rounded-2xl overflow-hidden mb-8"
                            style={{
                                border: '1px solid var(--cream-mid)',
                                backgroundColor: 'var(--cream-dark)',
                            }}
                        >
                            {/* Fake blurred text preview */}
                            <div className="p-8 select-none" style={{ filter: 'blur(5px)', userSelect: 'none' }}>
                                <p className="text-base leading-8 mb-4" style={{ color: 'var(--ink)', fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                                    El resto de esta historia continúa aquí. Este es el momento en que todo cambia, donde el relato da un giro y la verdad finalmente sale a la luz. Desbloquéala para leer el capítulo completo.
                                </p>
                                <p className="text-base leading-8" style={{ color: 'var(--ink)', fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                                    Lo que vino después fue algo que jamás esperé. Después de todos esos años de espera, la respuesta llegó no como una tormenta sino como el susurro más silencioso...
                                </p>
                            </div>
                            {/* Fade overlay */}
                            <div
                                className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                                style={{
                                    background: 'linear-gradient(to bottom, transparent, var(--cream-dark))',
                                }}
                            />
                        </div>

                        {/* Paywall CTA card */}
                        <div
                            className="rounded-2xl p-8 text-center"
                            style={{
                                backgroundColor: 'white',
                                border: '1px solid var(--cream-mid)',
                                boxShadow: '0 8px 40px rgba(20,16,10,0.08)',
                            }}
                        >
                            {/* Lock icon */}
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
                                style={{ backgroundColor: 'var(--gold-bg)' }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7" style={{ color: 'var(--gold-dark)' }}>
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>

                            <h3
                                className="font-serif font-bold text-2xl mb-3"
                                style={{ color: 'var(--ink)' }}
                            >
                                Seguir leyendo
                            </h3>
                            <p
                                className="text-sm leading-relaxed mb-8 max-w-sm mx-auto"
                                style={{ color: 'var(--ink-light)' }}
                            >
                                Desbloquea esta historia y apoya a <strong style={{ color: 'var(--ink)' }}>@{creatorProfile.username}</strong>.
                                Cada suscripción va directamente al escritor.
                            </p>

                            <div className="space-y-3 max-w-xs mx-auto">
                                {episode.is_subscription_only ? (
                                    <form action={`/api/checkout?type=subscription&creatorId=${creatorProfile.creators?.profile_id}`} method="POST">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full font-bold h-13 text-base rounded-xl"
                                            style={{
                                                backgroundColor: 'var(--ink)',
                                                color: 'var(--cream)',
                                                border: 'none',
                                                boxShadow: '0 4px 20px rgba(20,16,10,0.20)',
                                            }}
                                        >
                                            Suscribirse · ${creatorProfile.creators?.subscription_price}/mes
                                        </Button>
                                    </form>
                                ) : (
                                    <>
                                        <form action={`/api/checkout?type=ppv&episodeId=${episode.id}`} method="POST">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full font-bold h-13 text-base rounded-xl"
                                                style={{
                                                    backgroundColor: 'var(--ink)',
                                                    color: 'var(--cream)',
                                                    border: 'none',
                                                    boxShadow: '0 4px 20px rgba(20,16,10,0.20)',
                                                }}
                                            >
                                                Desbloquear este episodio · ${episode.ppv_price}
                                            </Button>
                                        </form>
                                        <div className="flex items-center gap-3" style={{ color: 'var(--ink-light)' }}>
                                            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--cream-mid)' }} />
                                            <span className="text-xs">o</span>
                                            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--cream-mid)' }} />
                                        </div>
                                        <form action={`/api/checkout?type=subscription&creatorId=${creatorProfile.creators?.profile_id}`} method="POST">
                                            <Button
                                                type="submit"
                                                variant="outline"
                                                size="lg"
                                                className="w-full font-semibold h-12 rounded-xl"
                                                style={{
                                                    borderColor: 'var(--cream-mid)',
                                                    color: 'var(--ink)',
                                                    backgroundColor: 'transparent',
                                                }}
                                            >
                                                Suscribirse · ${creatorProfile.creators?.subscription_price}/mes
                                            </Button>
                                        </form>
                                    </>
                                )}
                            </div>

                            {!user && (
                                <p className="mt-6 text-xs" style={{ color: 'var(--ink-light)' }}>
                                    ¿Ya tienes cuenta?{' '}
                                    <Link href="/login" className="underline" style={{ color: 'var(--gold-dark)' }}>
                                        Inicia sesión
                                    </Link>
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

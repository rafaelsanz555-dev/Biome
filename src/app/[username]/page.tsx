import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { GiftPanel } from '@/components/GiftPanel'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

interface ProfilePageProps {
    params: Promise<{ username: string }>
}

export default async function CreatorProfilePage({ params }: ProfilePageProps) {
    const { username } = await params
    const supabase = await createClient()

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, creators(subscription_price)')
        .eq('username', username.toLowerCase())
        .single()

    if (error || !profile) notFound()

    const { data: episodes } = await supabase
        .from('episodes')
        .select('id, title, preview_text, cover_image_url, images, is_subscription_only, ppv_price, created_at')
        .eq('creator_id', profile.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

    const { data: { user } } = await supabase.auth.getUser()

    const { data: entitlement } = user ? await supabase
        .from('entitlements')
        .select('id')
        .eq('user_id', user.id)
        .eq('creator_id', profile.id)
        .eq('entitlement_type', 'subscription')
        .gte('valid_until', new Date().toISOString())
        .maybeSingle() : { data: null }

    const isSubscribed = !!entitlement
    const isOwnProfile = user?.id === profile.id
    const subscriptionPrice = profile.creators?.subscription_price || 4.99

    const freePostIds = new Set((episodes || [])
        .slice()
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .slice(0, 5)
        .map(e => e.id))

    const initial = (profile.full_name || profile.username).charAt(0).toUpperCase()

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 py-10">

                {/* ── Profile Header ─────────────────────────────── */}
                <div
                    className="rounded-2xl p-6 mb-6"
                    style={{
                        backgroundColor: 'white',
                        border: '1px solid var(--cream-mid)',
                        boxShadow: '0 2px 16px rgba(20,16,10,0.06)',
                    }}
                >
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* Avatar */}
                        <div
                            className="w-24 h-24 shrink-0 rounded-full overflow-hidden"
                            style={{
                                border: '3px solid var(--cream-mid)',
                                boxShadow: '0 4px 12px rgba(20,16,10,0.10)',
                            }}
                        >
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center font-serif font-bold text-3xl"
                                    style={{ backgroundColor: 'var(--ink)', color: 'var(--cream)' }}
                                >
                                    {initial}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                                <h1 className="font-serif font-bold text-2xl" style={{ color: 'var(--ink)' }}>
                                    {profile.full_name || profile.username}
                                </h1>
                                <span className="text-sm" style={{ color: 'var(--ink-light)' }}>
                                    @{profile.username}
                                </span>
                            </div>

                            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--ink-light)' }}>
                                {profile.bio || 'Escritor en bio.me.'}
                            </p>

                            <div className="flex flex-wrap items-center gap-3">
                                {!isOwnProfile ? (
                                    <>
                                        {!isSubscribed ? (
                                            <Link href={`/api/checkout?type=subscription&creatorId=${profile.id}`}>
                                                <Button
                                                    className="font-bold px-6 h-10 rounded-xl"
                                                    style={{
                                                        backgroundColor: 'var(--ink)',
                                                        color: 'var(--cream)',
                                                        border: 'none',
                                                    }}
                                                >
                                                    Suscribirse · ${subscriptionPrice}/mes
                                                </Button>
                                            </Link>
                                        ) : (
                                            <span
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
                                                style={{
                                                    backgroundColor: 'var(--gold-bg)',
                                                    color: 'var(--gold-dark)',
                                                    border: '1px solid var(--cream-mid)',
                                                }}
                                            >
                                                ✓ Suscrito
                                            </span>
                                        )}
                                        <Button
                                            variant="outline"
                                            className="h-10 rounded-xl font-medium"
                                            style={{
                                                borderColor: 'var(--cream-mid)',
                                                color: 'var(--ink-light)',
                                                backgroundColor: 'transparent',
                                            }}
                                        >
                                            Seguir
                                        </Button>
                                    </>
                                ) : (
                                    <Link href="/dashboard">
                                        <Button
                                            variant="outline"
                                            className="h-10 rounded-xl"
                                            style={{
                                                borderColor: 'var(--cream-mid)',
                                                color: 'var(--ink)',
                                                backgroundColor: 'transparent',
                                            }}
                                        >
                                            Editar perfil & Dashboard
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Gift Panel ─────────────────────────────────── */}
                {!isOwnProfile && (
                    <div className="mb-6">
                        <GiftPanel
                            recipientId={profile.id}
                            recipientUsername={profile.username}
                        />
                    </div>
                )}

                {/* ── Posts Feed ─────────────────────────────────── */}
                <div>
                    <h2 className="font-serif font-semibold text-xl mb-4" style={{ color: 'var(--ink)' }}>
                        Historias
                    </h2>

                    {(!episodes || episodes.length === 0) ? (
                        <div
                            className="py-16 text-center rounded-2xl"
                            style={{ border: '1px solid var(--cream-mid)', backgroundColor: 'var(--cream-dark)' }}
                        >
                            <p className="font-serif text-lg mb-1" style={{ color: 'var(--ink)' }}>
                                Sin historias todavía.
                            </p>
                            <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
                                El primer capítulo está en camino.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {episodes.map((episode) => {
                                const isFree = freePostIds.has(episode.id) || (!episode.is_subscription_only && !episode.ppv_price)
                                const canRead = isFree || isSubscribed || isOwnProfile

                                return (
                                    <div
                                        key={episode.id}
                                        className="rounded-2xl overflow-hidden transition-all"
                                        style={{
                                            backgroundColor: 'white',
                                            border: '1px solid var(--cream-mid)',
                                            boxShadow: '0 2px 10px rgba(20,16,10,0.04)',
                                        }}
                                    >
                                        {/* Cover image */}
                                        {episode.cover_image_url && (
                                            <div className="w-full h-44 overflow-hidden" style={{ backgroundColor: 'var(--cream-dark)' }}>
                                                <img src={episode.cover_image_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}

                                        <div className="p-5">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <h3
                                                    className="font-serif font-semibold text-lg leading-snug"
                                                    style={{ color: 'var(--ink)' }}
                                                >
                                                    {episode.title}
                                                </h3>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {isFree && (
                                                        <span
                                                            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                                                            style={{
                                                                backgroundColor: 'var(--gold-bg)',
                                                                color: 'var(--gold-dark)',
                                                                border: '1px solid var(--cream-mid)',
                                                            }}
                                                        >
                                                            Gratis
                                                        </span>
                                                    )}
                                                    {!canRead && (
                                                        <span
                                                            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                                                            style={{
                                                                backgroundColor: 'var(--cream-dark)',
                                                                color: 'var(--ink-light)',
                                                            }}
                                                        >
                                                            🔒 Suscriptores
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {episode.preview_text && (
                                                <p
                                                    className="text-sm leading-relaxed mb-4 line-clamp-2"
                                                    style={{ color: 'var(--ink-light)' }}
                                                >
                                                    {episode.preview_text}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>
                                                    {new Date(episode.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <Link href={`/${profile.username}/${episode.id}`}>
                                                    {canRead ? (
                                                        <Button
                                                            size="sm"
                                                            className="font-semibold rounded-lg"
                                                            style={{
                                                                backgroundColor: 'var(--ink)',
                                                                color: 'var(--cream)',
                                                                border: 'none',
                                                            }}
                                                        >
                                                            Leer →
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="font-semibold rounded-lg"
                                                            style={{
                                                                borderColor: 'var(--cream-mid)',
                                                                color: 'var(--ink-light)',
                                                                backgroundColor: 'transparent',
                                                            }}
                                                        >
                                                            Suscríbete para leer
                                                        </Button>
                                                    )}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

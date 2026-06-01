import Link from 'next/link'
import { ArrowRight, Gift, HeartHandshake, Sparkles } from 'lucide-react'
import { FollowButton } from '@/components/FollowButton'

interface ChapterEndCTAProps {
    creatorId: string
    creatorUsername: string
    creatorName: string
    isAuthenticated: boolean
    isOwnProfile: boolean
    initialFollowing: boolean
    nextEpisode: { id: string; title: string } | null
    subscriptionPrice: number
    creatorIdForSub: string
    storyHref?: string | null
}

export function ChapterEndCTA({
    creatorId,
    creatorUsername,
    creatorName,
    isAuthenticated,
    isOwnProfile,
    initialFollowing,
    nextEpisode,
    subscriptionPrice,
    creatorIdForSub,
    storyHref,
}: ChapterEndCTAProps) {
    return (
        <section className="mt-14 overflow-hidden rounded-3xl border border-[#C9A84C]/20 bg-[#0D0D0D] text-[#FAF7F0]">
            <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
                <div className="p-6 md:p-8">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C9A84C]">Te movio algo?</p>
                    <h2 className="mt-3 font-serif text-3xl font-black leading-tight">
                        Ayuda a que {creatorName} siga escribiendo esta historia.
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-[#FAF7F0]/68">
                        Seguir es gratis. Suscribirte, regalar o compartir le dice al escritor que este capitulo encontro a alguien real.
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        {nextEpisode ? (
                            <Link href={`/${creatorUsername}/${nextEpisode.id}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-6 text-sm font-black text-[#0D0D0D] transition hover:bg-[#E2C96E]">
                                Leer siguiente
                                <ArrowRight size={16} />
                            </Link>
                        ) : storyHref ? (
                            <Link href={storyHref} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-6 text-sm font-black text-[#0D0D0D] transition hover:bg-[#E2C96E]">
                                Ver historia completa
                                <ArrowRight size={16} />
                            </Link>
                        ) : null}

                        {!isOwnProfile && (
                            <FollowButton
                                targetType="creator"
                                targetId={creatorId}
                                initialFollowing={initialFollowing}
                                isAuthenticated={isAuthenticated}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#FAF7F0]/18 px-6 text-sm font-black text-[#FAF7F0] transition hover:border-[#C9A84C] hover:text-[#C9A84C]"
                            />
                        )}

                        {!isOwnProfile && (
                            <Link href={`/api/checkout?type=subscription&creatorId=${creatorIdForSub}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#FAF7F0]/18 px-6 text-sm font-black text-[#FAF7F0] transition hover:border-[#C9A84C] hover:text-[#C9A84C]">
                                <HeartHandshake size={16} />
                                ${subscriptionPrice}/mes
                            </Link>
                        )}
                    </div>
                </div>

                <div className="border-t border-[#FAF7F0]/10 bg-[#FAF7F0]/6 p-6 md:border-l md:border-t-0 md:p-8">
                    <div className="flex h-full flex-col justify-between gap-8">
                        <div>
                            <Sparkles className="text-[#C9A84C]" size={24} />
                            <p className="mt-4 text-sm font-bold leading-7 text-[#FAF7F0]/74">
                                Si este capitulo se quedo contigo, deja una senal. Un follow, un regalo o una lectura mas cambia el proximo capitulo.
                            </p>
                        </div>
                        {!isOwnProfile && (
                            <a href="#gift-panel" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#FAF7F0] px-6 text-sm font-black text-[#0D0D0D] transition hover:bg-white">
                                <Gift size={16} />
                                Enviar regalo
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

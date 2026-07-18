import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lock, Calendar, BookOpen, ShieldCheck, Heart, X } from 'lucide-react'

interface HonestPaywallProps {
    creatorUsername: string
    subPrice: number
    creatorIdForSub: string
    episodeId: string
    ppvPrice?: number | null
    isSubscriptionOnly?: boolean
    // Trust + continuity context
    seriesStatus?: 'active' | 'paused' | 'completed' | 'planning' | null
    postingFrequency?: string | null
    frequencyPromise?: string | null
    totalEpisodes?: number
    isVerified?: boolean
    daysSinceLastEpisode?: number | null
}

/**
 * Paywall honesto: muestra continuidad, frecuencia, transparencia y trust signals
 * ANTES del CTA de suscripción. No vende el episodio, vende la relación.
 */
export function HonestPaywall(props: HonestPaywallProps) {
    const {
        creatorUsername, subPrice, creatorIdForSub, episodeId,
        ppvPrice, isSubscriptionOnly,
        seriesStatus, frequencyPromise, postingFrequency,
        totalEpisodes, isVerified, daysSinceLastEpisode,
    } = props

    return (
        <div className="my-8 overflow-hidden border border-[#171512]/10 bg-[#FFFCF5]">
            <div className="p-8 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center bg-[#A63D2D]/8">
                    <Lock className="h-6 w-6 text-[#A63D2D]" />
                </div>
                <h2 className="mb-2 font-serif text-2xl font-bold text-[#171512]">
                    Continúa la historia
                </h2>
                <p className="mx-auto mb-6 max-w-md text-sm text-[#746A5C]">
                    Suscríbete a <strong className="text-[#171512]">@{creatorUsername}</strong> y desbloquea todo el archivo + cada nuevo episodio.
                </p>

                {/* Trust + continuity panel */}
                <div className="mx-auto mb-6 max-w-sm space-y-2.5 bg-[#F0E8D9] p-4 text-left">
                    {totalEpisodes && totalEpisodes > 0 && (
                        <div className="flex items-center gap-2.5 text-sm">
                            <BookOpen className="text-[#D8BA63]" size={14} />
                            <span className="text-[#5F574B]">
                                <strong className="text-[#171512]">{totalEpisodes}</strong> episodios ya publicados
                            </span>
                        </div>
                    )}
                    {(frequencyPromise || (postingFrequency && postingFrequency !== 'irregular')) && (
                        <div className="flex items-center gap-2.5 text-sm">
                            <Calendar className="text-[#D8BA63]" size={14} />
                            <span className="text-[#5F574B]">
                                Publica <strong className="text-[#171512]">{frequencyPromise || postingFrequency}</strong>
                            </span>
                        </div>
                    )}
                    {seriesStatus === 'active' && (
                        <div className="flex items-center gap-2.5 text-sm">
                            <span className="w-2 h-2 rounded-full bg-[#D8BA63] animate-pulse"></span>
                            <span className="text-[#5F574B]">Serie activa — historias en curso</span>
                        </div>
                    )}
                    {seriesStatus === 'paused' && (
                        <div className="flex items-center gap-2.5 text-sm">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            <span className="text-amber-300">Serie en pausa — el escritor avisará al volver</span>
                        </div>
                    )}
                    {isVerified && (
                        <div className="flex items-center gap-2.5 text-sm">
                            <ShieldCheck className="text-[#D8BA63]" size={14} />
                            <span className="text-[#5F574B]">Storyteller verificado por Pergamo</span>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <Link href={`/api/checkout?type=subscription&creatorId=${creatorIdForSub}`} className="block">
                    <Button className="bg-[#C9A84C] hover:bg-[#D8BA63] text-[#0D0D0D] font-bold h-12 px-8 rounded-xl shadow-lg shadow-[#C9A84C]/20 w-full max-w-sm">
                        Suscribirme — ${subPrice}/mes
                    </Button>
                </Link>

                {!isSubscriptionOnly && ppvPrice && (
                    <div className="mt-3">
                        <span className="mb-2 block text-[10px] uppercase tracking-widest text-[#746A5C]">o solo este episodio</span>
                        <form action={`/api/checkout?type=ppv&episodeId=${episodeId}`} method="POST">
                            <Button type="submit" variant="outline" className="h-10 border-[#171512]/15 bg-transparent px-6 font-semibold text-[#171512] hover:bg-[#F0E8D9]">
                                Desbloquear por ${ppvPrice}
                            </Button>
                        </form>
                    </div>
                )}

                {/* Honest fineprint */}
                <div className="mx-auto mt-6 max-w-sm space-y-1.5 border-t border-[#171512]/10 pt-6 text-[11px] text-[#746A5C]">
                    <p className="flex items-center justify-center gap-2">
                        <X size={11} className="text-[#8A8174]" /> Cancela cuando quieras, sin preguntas
                    </p>
                    <p className="flex items-center justify-center gap-2">
                        <Heart size={11} className="text-[#8A8174]" /> El escritor recibe el 88% de cada suscripción
                    </p>
                    {daysSinceLastEpisode !== null && daysSinceLastEpisode !== undefined && daysSinceLastEpisode > 60 && (
                        <p className="text-amber-400 pt-2 italic">
                            ⚠ Sin actividad reciente ({daysSinceLastEpisode} días). Considera esperar antes de suscribirte.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

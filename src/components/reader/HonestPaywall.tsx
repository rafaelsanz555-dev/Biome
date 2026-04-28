import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lock, Calendar, BookOpen, ShieldCheck, Heart, X } from 'lucide-react'

interface HonestPaywallProps {
    creatorUsername: string
    creatorName: string
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
        creatorUsername, creatorName, subPrice, creatorIdForSub, episodeId,
        ppvPrice, isSubscriptionOnly,
        seriesStatus, frequencyPromise, postingFrequency,
        totalEpisodes, isVerified, daysSinceLastEpisode,
    } = props

    return (
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-[#15171C] to-[#0F1114] overflow-hidden my-8">
            <div className="p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
                    <Lock className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                    Continúa la historia
                </h2>
                <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                    Suscríbete a <strong className="text-white">@{creatorUsername}</strong> y desbloquea todo el archivo + cada nuevo episodio.
                </p>

                {/* Trust + continuity panel */}
                <div className="bg-black/30 rounded-xl p-4 mb-6 max-w-sm mx-auto space-y-2.5 text-left">
                    {totalEpisodes && totalEpisodes > 0 && (
                        <div className="flex items-center gap-2.5 text-sm">
                            <BookOpen className="text-blue-400" size={14} />
                            <span className="text-gray-300">
                                <strong className="text-white">{totalEpisodes}</strong> episodios ya publicados
                            </span>
                        </div>
                    )}
                    {(frequencyPromise || (postingFrequency && postingFrequency !== 'irregular')) && (
                        <div className="flex items-center gap-2.5 text-sm">
                            <Calendar className="text-blue-400" size={14} />
                            <span className="text-gray-300">
                                Publica <strong className="text-white">{frequencyPromise || postingFrequency}</strong>
                            </span>
                        </div>
                    )}
                    {seriesStatus === 'active' && (
                        <div className="flex items-center gap-2.5 text-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                            <span className="text-gray-300">Serie activa — historias en curso</span>
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
                            <ShieldCheck className="text-blue-400" size={14} />
                            <span className="text-gray-300">Storyteller verificado por bio.me</span>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <Link href={`/api/checkout?type=subscription&creatorId=${creatorIdForSub}`} className="block">
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-blue-500/20 w-full max-w-sm">
                        Suscribirme — ${subPrice}/mes
                    </Button>
                </Link>

                {!isSubscriptionOnly && ppvPrice && (
                    <div className="mt-3">
                        <span className="text-gray-500 text-[10px] uppercase tracking-widest block mb-2">o solo este episodio</span>
                        <form action={`/api/checkout?type=ppv&episodeId=${episodeId}`} method="POST">
                            <Button type="submit" variant="outline" className="border-gray-700 bg-transparent text-gray-300 hover:bg-white/5 font-semibold h-10 px-6 rounded-xl">
                                Desbloquear por ${ppvPrice}
                            </Button>
                        </form>
                    </div>
                )}

                {/* Honest fineprint */}
                <div className="mt-6 pt-6 border-t border-gray-800 text-[11px] text-gray-500 space-y-1.5 max-w-sm mx-auto">
                    <p className="flex items-center justify-center gap-2">
                        <X size={11} className="text-gray-600" /> Cancela cuando quieras, sin preguntas
                    </p>
                    <p className="flex items-center justify-center gap-2">
                        <Heart size={11} className="text-gray-600" /> El escritor recibe el 88% de cada suscripción
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

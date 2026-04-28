import { ShieldCheck, Calendar, Pause, Sparkles, Clock, BookOpen } from 'lucide-react'

interface TrustSignalsProps {
    isVerified?: boolean
    verificationMethod?: string | null
    seriesStatus?: 'active' | 'paused' | 'completed' | 'planning' | null
    postingFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'irregular' | null
    frequencyPromise?: string | null
    lastEpisodeAt?: string | null
    totalEpisodes?: number
    daysSinceLastEpisode?: number | null
    compact?: boolean
}

const FREQUENCY_LABEL: Record<string, string> = {
    weekly: 'Cada semana',
    biweekly: 'Cada dos semanas',
    monthly: 'Cada mes',
    irregular: 'Irregular',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    active: { label: 'Serie activa', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: BookOpen },
    paused: { label: 'En pausa', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Pause },
    completed: { label: 'Completa', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: ShieldCheck },
    planning: { label: 'En preparación', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20', icon: Sparkles },
}

export function TrustSignals({
    isVerified, verificationMethod, seriesStatus, postingFrequency, frequencyPromise,
    lastEpisodeAt, totalEpisodes, daysSinceLastEpisode, compact = false,
}: TrustSignalsProps) {
    const status = seriesStatus ? STATUS_CONFIG[seriesStatus] : null
    const StatusIcon = status?.icon

    const isStale = daysSinceLastEpisode !== null && daysSinceLastEpisode !== undefined && daysSinceLastEpisode > 60 && seriesStatus === 'active'

    if (compact) {
        return (
            <div className="flex items-center gap-2 flex-wrap text-[11px]">
                {isVerified && (
                    <span className="inline-flex items-center gap-1 text-blue-400 font-semibold">
                        <ShieldCheck size={12} /> Verificado
                    </span>
                )}
                {status && StatusIcon && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-semibold ${status.color}`}>
                        <StatusIcon size={10} /> {status.label}
                    </span>
                )}
                {postingFrequency && postingFrequency !== 'irregular' && (
                    <span className="inline-flex items-center gap-1 text-gray-400">
                        <Calendar size={11} /> {FREQUENCY_LABEL[postingFrequency]}
                    </span>
                )}
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-gray-800 bg-[#0F1114] p-4 space-y-3">
            <h3 className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Señales de confianza</h3>

            {/* Verified */}
            {isVerified && (
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <ShieldCheck className="text-blue-400" size={16} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-white">Storyteller verificado</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {verificationMethod === 'id' && 'Identidad confirmada por documento'}
                            {verificationMethod === 'social' && 'Verificado por redes sociales'}
                            {verificationMethod === 'manual' && 'Revisado por el equipo de bio.me'}
                            {!verificationMethod && 'Cuenta verificada'}
                        </p>
                    </div>
                </div>
            )}

            {/* Series status */}
            {status && StatusIcon && (
                <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${status.color}`}>
                        <StatusIcon size={16} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{status.label}</p>
                        {totalEpisodes && totalEpisodes > 0 && (
                            <p className="text-xs text-gray-500 mt-0.5">{totalEpisodes} episodios publicados</p>
                        )}
                    </div>
                </div>
            )}

            {/* Posting frequency */}
            {(frequencyPromise || (postingFrequency && postingFrequency !== 'irregular')) && (
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Calendar className="text-blue-400" size={16} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-white">
                            {frequencyPromise || FREQUENCY_LABEL[postingFrequency!]}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Frecuencia prometida</p>
                    </div>
                </div>
            )}

            {/* Last episode */}
            {lastEpisodeAt && (
                <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isStale ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5 border border-gray-800'}`}>
                        <Clock className={isStale ? 'text-amber-400' : 'text-gray-400'} size={16} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-white">
                            {daysSinceLastEpisode === 0 && 'Publicado hoy'}
                            {daysSinceLastEpisode === 1 && 'Publicado ayer'}
                            {daysSinceLastEpisode && daysSinceLastEpisode > 1 && `Hace ${daysSinceLastEpisode} días`}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Última actividad</p>
                        {isStale && (
                            <p className="text-[11px] text-amber-400 mt-1">⚠ Sin publicar en {daysSinceLastEpisode} días</p>
                        )}
                    </div>
                </div>
            )}

            <p className="text-[10px] text-gray-600 italic pt-2 border-t border-gray-800">
                bio.me aumenta la confianza en cada perfil pero no certifica la veracidad absoluta de cada historia.
            </p>
        </div>
    )
}

import { Quote } from 'lucide-react'
import { TrustSignals } from './TrustSignals'

interface CreatorBioCardProps {
    bio?: string | null
    whyIWrite?: string | null
    storyThemes?: string[] | null
    languages?: string[] | null
    countryCode?: string | null
    pronouns?: string | null
    isVerified?: boolean
    verificationMethod?: string | null
    seriesStatus?: 'active' | 'paused' | 'completed' | 'planning' | null
    postingFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'irregular' | null
    frequencyPromise?: string | null
    totalEpisodes?: number
    daysSinceLastEpisode?: number | null
}

const FLAG_FROM_CC: Record<string, string> = {
    MX: '🇲🇽', AR: '🇦🇷', CO: '🇨🇴', CL: '🇨🇱', PE: '🇵🇪', VE: '🇻🇪', EC: '🇪🇨', UY: '🇺🇾',
    BO: '🇧🇴', PY: '🇵🇾', CR: '🇨🇷', PA: '🇵🇦', GT: '🇬🇹', SV: '🇸🇻', HN: '🇭🇳', NI: '🇳🇮',
    DO: '🇩🇴', CU: '🇨🇺', PR: '🇵🇷', ES: '🇪🇸', US: '🇺🇸', BR: '🇧🇷', PT: '🇵🇹',
    FR: '🇫🇷', IT: '🇮🇹', DE: '🇩🇪', GB: '🇬🇧', CA: '🇨🇦',
}

const THEME_LABEL: Record<string, string> = {
    migración: 'Migración',
    supervivencia: 'Supervivencia',
    amor_perdida: 'Amor y pérdida',
    negocios: 'Negocios',
    maternidad: 'Maternidad',
    comenzar_de_nuevo: 'Comenzar de nuevo',
    identidad: 'Identidad',
    salud_mental: 'Salud mental',
    familia: 'Familia',
    viajes: 'Viajes',
    carrera: 'Carrera',
    espiritualidad: 'Espiritualidad',
}

/**
 * El centro emocional de la bio page. Quién es, por qué escribe, qué temas toca,
 * cómo y cuándo publica, qué señales de confianza tiene.
 */
export function CreatorBioCard({
    bio, whyIWrite, storyThemes, languages, countryCode, pronouns,
    isVerified, verificationMethod, seriesStatus, postingFrequency, frequencyPromise,
    totalEpisodes, daysSinceLastEpisode,
}: CreatorBioCardProps) {
    return (
        <div className="space-y-5">
            {/* Identity row */}
            {(countryCode || pronouns || (languages && languages.length > 0)) && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    {countryCode && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-gray-800 text-gray-300 font-mono">
                            {countryCode}
                        </span>
                    )}
                    {pronouns && (
                        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-gray-800 text-gray-300">
                            {pronouns}
                        </span>
                    )}
                    {languages?.map((l) => (
                        <span key={l} className="px-2.5 py-1 rounded-full bg-white/5 border border-gray-800 text-gray-300 uppercase text-[10px]">
                            {l}
                        </span>
                    ))}
                </div>
            )}

            {/* Bio */}
            {bio && (
                <p className="text-base text-gray-200 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                    {bio}
                </p>
            )}

            {/* Why I write — manifesto del autor */}
            {whyIWrite && (
                <div className="rounded-xl border border-green-500/15 bg-gradient-to-br from-green-500/5 to-transparent p-5">
                    <div className="flex items-start gap-3">
                        <Quote className="text-green-400/60 shrink-0 mt-0.5" size={18} />
                        <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-green-400 mb-1.5">Por qué cuento mi historia</p>
                            <p className="text-base text-gray-200 leading-relaxed italic" style={{ fontFamily: 'Georgia, serif' }}>
                                {whyIWrite}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Themes */}
            {storyThemes && storyThemes.length > 0 && (
                <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2">Lo que escribe</p>
                    <div className="flex flex-wrap gap-1.5">
                        {storyThemes.map((t) => (
                            <span key={t} className="px-2.5 py-1 rounded-full bg-white/5 border border-gray-800 text-xs text-gray-300">
                                {THEME_LABEL[t] || t}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Trust signals */}
            <TrustSignals
                isVerified={isVerified}
                verificationMethod={verificationMethod}
                seriesStatus={seriesStatus}
                postingFrequency={postingFrequency}
                frequencyPromise={frequencyPromise}
                totalEpisodes={totalEpisodes}
                daysSinceLastEpisode={daysSinceLastEpisode}
            />
        </div>
    )
}

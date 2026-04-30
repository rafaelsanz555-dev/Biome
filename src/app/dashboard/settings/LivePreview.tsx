'use client'

import { useEffect, useState } from 'react'
import { ShieldCheck, BookOpen, Calendar, Lock, Heart, Gift } from 'lucide-react'

interface LivePreviewProps {
    initial?: {
        accent_color?: string | null
        font_family?: string | null
        card_style?: string | null
        brand_tagline?: string | null
        why_i_write?: string | null
        posting_frequency?: string | null
        frequency_promise?: string | null
        series_status?: string | null
        is_verified_storyteller?: boolean
        theme_config?: any
        username: string
        full_name?: string | null
        bio?: string | null
        avatar_url?: string | null
        subscription_price?: number | null
    }
}

interface BrandingState {
    accent_color: string
    font_family: string
    card_style: string
    brand_tagline: string
}

interface TrustState {
    why_i_write: string
    posting_frequency: string
    frequency_promise: string
    series_status: string
}

interface ThemeState {
    config: any
    is_animated: boolean
    name: string
}

const FONT_VAR: Record<string, string> = {
    inter: 'var(--font-inter), system-ui, sans-serif',
    playfair: 'var(--font-playfair), Georgia, serif',
    crimson: 'var(--font-crimson), Georgia, serif',
    'ibm-plex': 'var(--font-ibm-plex), Georgia, serif',
}

function hexToRgba(hex: string, alpha: number): string {
    const c = hex.replace('#', '')
    const full = c.length === 3 ? c.split('').map(x => x + x).join('') : c
    const r = parseInt(full.slice(0, 2), 16) || 0
    const g = parseInt(full.slice(2, 4), 16) || 0
    const b = parseInt(full.slice(4, 6), 16) || 0
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const FREQ_LABEL: Record<string, string> = {
    weekly: 'Cada semana',
    biweekly: 'Cada dos semanas',
    monthly: 'Cada mes',
    irregular: 'Irregular',
}

export function LivePreview({ initial }: LivePreviewProps) {
    // Estado vivo del preview, alimentado por eventos custom desde los forms
    const [branding, setBranding] = useState<BrandingState>({
        accent_color: initial?.accent_color || '#2563EB',
        font_family: initial?.font_family || 'inter',
        card_style: initial?.card_style || 'editorial',
        brand_tagline: initial?.brand_tagline || '',
    })
    const [trust, setTrust] = useState<TrustState>({
        why_i_write: initial?.why_i_write || '',
        posting_frequency: initial?.posting_frequency || 'irregular',
        frequency_promise: initial?.frequency_promise || '',
        series_status: initial?.series_status || 'active',
    })
    const [theme, setTheme] = useState<ThemeState | null>(
        initial?.theme_config ? { config: initial.theme_config, is_animated: false, name: 'Aplicado' } : null
    )

    useEffect(() => {
        function onBranding(e: any) { setBranding((s) => ({ ...s, ...e.detail })) }
        function onTrust(e: any) { setTrust((s) => ({ ...s, ...e.detail })) }
        function onTheme(e: any) { setTheme(e.detail) }
        window.addEventListener('biome:branding', onBranding)
        window.addEventListener('biome:trust', onTrust)
        window.addEventListener('biome:theme', onTheme)
        return () => {
            window.removeEventListener('biome:branding', onBranding)
            window.removeEventListener('biome:trust', onTrust)
            window.removeEventListener('biome:theme', onTheme)
        }
    }, [])

    // Theme tiene prioridad sobre branding individual
    const cfg = theme?.config || {}
    const accent = cfg.accent_color || branding.accent_color
    const font = cfg.font || branding.font_family
    const fontVar = FONT_VAR[font] || FONT_VAR.inter

    // Background del preview
    const bgLayers: string[] = []
    if (cfg.background_image) bgLayers.push(`url("${cfg.background_image}")`)
    if (cfg.background_pattern) bgLayers.push(cfg.background_pattern)
    if (cfg.background_gradient && !cfg.background_image) bgLayers.push(cfg.background_gradient)
    if (cfg.background_overlay) bgLayers.push(cfg.background_overlay)

    const bgStyle: React.CSSProperties = {
        backgroundColor: cfg.background || '#0A0B0E',
        backgroundImage: bgLayers.length > 0 ? bgLayers.join(', ') : undefined,
        backgroundSize: cfg.background_size || 'cover',
        backgroundPosition: 'center',
        animation: cfg.background_animation || undefined,
    }

    const initial_letter = (initial?.full_name || initial?.username || '?').charAt(0).toUpperCase()
    const subPrice = initial?.subscription_price || 5
    const isLight = !!cfg.is_light
    const textColor = isLight ? '#0F172A' : '#fff'
    const subTextColor = isLight ? '#475569' : '#cbd5e1'

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Vista en vivo</p>
                </div>
                <p className="text-[10px] text-gray-600">{theme ? `🎨 ${theme.name}` : 'Sin tema'}</p>
            </div>

            {/* Mock browser frame */}
            <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl bg-[#0A0B0E]">
                {/* Fake URL bar */}
                <div className="flex items-center gap-2 p-2 bg-[#15171C] border-b border-gray-800">
                    <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500/50"></span>
                        <span className="w-2 h-2 rounded-full bg-yellow-500/50"></span>
                        <span className="w-2 h-2 rounded-full bg-blue-500/50"></span>
                    </div>
                    <div className="flex-1 px-2 py-1 rounded-md bg-[#0A0B0E] text-[10px] text-gray-500 font-mono truncate">
                        bio.me/{initial?.username || 'tu-perfil'}
                    </div>
                </div>

                {/* Profile preview con theme aplicado */}
                <div
                    className="relative min-h-[420px] p-5 transition-all duration-500"
                    style={{ ...bgStyle, fontFamily: fontVar, color: textColor }}
                >
                    {/* Avatar + identidad */}
                    <div className="relative z-10 flex items-start gap-3 mb-4">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shrink-0 ring-2 ring-white/10"
                            style={{ backgroundColor: hexToRgba(accent, 0.2), color: accent }}
                        >
                            {initial?.avatar_url ? (
                                <img src={initial.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : initial_letter}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <p className="font-bold text-base truncate" style={{ fontFamily: fontVar, color: textColor }}>
                                    {initial?.full_name || initial?.username}
                                </p>
                                {initial?.is_verified_storyteller && (
                                    <ShieldCheck size={14} style={{ color: accent }} />
                                )}
                            </div>
                            <p className="text-xs opacity-70 truncate" style={{ color: subTextColor }}>@{initial?.username}</p>
                            {branding.brand_tagline && (
                                <p className="text-[11px] mt-1 italic line-clamp-1" style={{ color: subTextColor }}>
                                    {branding.brand_tagline}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    <p className="relative z-10 text-sm mb-4 line-clamp-3 leading-relaxed" style={{ fontFamily: fontVar, color: textColor, opacity: 0.92 }}>
                        {initial?.bio || 'Compartiendo mi historia y contenido exclusivo en bio.me.'}
                    </p>

                    {/* Why I write — manifesto */}
                    {trust.why_i_write && (
                        <div
                            className="relative z-10 rounded-lg p-3 mb-4 border"
                            style={{
                                background: `linear-gradient(135deg, ${hexToRgba(accent, 0.08)}, transparent)`,
                                borderColor: hexToRgba(accent, 0.2),
                            }}
                        >
                            <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: accent }}>
                                Por qué cuento mi historia
                            </p>
                            <p className="text-xs italic line-clamp-2 leading-relaxed" style={{ color: textColor, opacity: 0.92 }}>
                                {trust.why_i_write}
                            </p>
                        </div>
                    )}

                    {/* CTA Subscribirse */}
                    <button
                        type="button"
                        className="relative z-10 w-full py-2.5 rounded-xl font-bold text-sm shadow-lg transition-transform hover:scale-[1.01] mb-4"
                        style={{
                            backgroundColor: accent,
                            color: '#fff',
                            boxShadow: `0 4px 20px ${hexToRgba(accent, 0.35)}`,
                        }}
                    >
                        Suscribirme — ${subPrice}/mes
                    </button>

                    {/* Trust signals compactos */}
                    <div
                        className="relative z-10 rounded-lg p-3 mb-4 space-y-1.5 border"
                        style={{
                            background: 'rgba(0,0,0,0.25)',
                            borderColor: hexToRgba(accent, 0.15),
                        }}
                    >
                        {trust.series_status === 'active' && (
                            <div className="flex items-center gap-2 text-[11px]" style={{ color: textColor, opacity: 0.85 }}>
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }}></span>
                                Serie activa
                            </div>
                        )}
                        {(trust.frequency_promise || (trust.posting_frequency !== 'irregular')) && (
                            <div className="flex items-center gap-2 text-[11px]" style={{ color: textColor, opacity: 0.85 }}>
                                <Calendar size={11} style={{ color: accent }} />
                                {trust.frequency_promise || FREQ_LABEL[trust.posting_frequency] || 'Frecuencia no establecida'}
                            </div>
                        )}
                        {initial?.is_verified_storyteller && (
                            <div className="flex items-center gap-2 text-[11px]" style={{ color: textColor, opacity: 0.85 }}>
                                <ShieldCheck size={11} style={{ color: accent }} />
                                Storyteller verificado
                            </div>
                        )}
                    </div>

                    {/* Mini episode card */}
                    <div className="relative z-10 rounded-lg overflow-hidden border" style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.08)' }}>
                        <div className="aspect-[16/9] flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${hexToRgba(accent, 0.4)}, ${hexToRgba(accent, 0.1)})` }}>
                            <Lock size={20} style={{ color: '#fff', opacity: 0.7 }} />
                        </div>
                        <div className="p-3">
                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mb-2" style={{ background: hexToRgba(accent, 0.15), color: accent, border: `1px solid ${hexToRgba(accent, 0.3)}` }}>
                                Exclusivo
                            </span>
                            <p className="text-sm font-bold leading-tight mb-1" style={{ fontFamily: fontVar, color: textColor }}>
                                La noche que todo cambió
                            </p>
                            <p className="text-[11px] line-clamp-1" style={{ color: subTextColor }}>
                                Esa noche no pasó nada extraordinario al principio...
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-[10px]" style={{ color: subTextColor }}>
                                <span className="flex items-center gap-1"><Heart size={10} /> 47</span>
                                <span className="flex items-center gap-1"><Gift size={10} /> 12</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-gray-600 italic px-1 text-center">
                Lo que tus lectores van a ver. Se actualiza en vivo conforme cambias settings.
            </p>
        </div>
    )
}

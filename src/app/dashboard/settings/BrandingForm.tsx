'use client'

import { useState, useTransition } from 'react'
import { updateBranding } from './brandingActions'
import { track } from '@/lib/analytics'
import { Check, Palette, Type, Sparkles } from 'lucide-react'

// 12 acentos curados (la paleta premium)
const ACCENTS = [
    { code: '#22C55E', name: 'Emerald' },
    { code: '#EF4444', name: 'Crimson' },
    { code: '#F59E0B', name: 'Amber' },
    { code: '#8B5CF6', name: 'Violet' },
    { code: '#14B8A6', name: 'Teal' },
    { code: '#FB7185', name: 'Coral' },
    { code: '#CA8A04', name: 'Bronze' },
    { code: '#166534', name: 'Forest' },
    { code: '#1E3A8A', name: 'Navy' },
    { code: '#E11D48', name: 'Rose' },
    { code: '#B45309', name: 'Ochre' },
    { code: '#64748B', name: 'Slate' },
]

// Las CSS vars vienen de next/font/google en layout.tsx
const FONTS = [
    {
        code: 'inter',
        name: 'Inter',
        desc: 'Limpia, contemporánea — perfecta para periodismo digital',
        preview: 'La nostalgia llega sin avisar',
        cssFamily: 'var(--font-inter), system-ui, sans-serif',
    },
    {
        code: 'playfair',
        name: 'Playfair Display',
        desc: 'Editorial elegante — para historias literarias',
        preview: 'La nostalgia llega sin avisar',
        cssFamily: 'var(--font-playfair), Georgia, serif',
    },
    {
        code: 'crimson',
        name: 'Crimson Pro',
        desc: 'Cálida y humana — para memorias íntimas',
        preview: 'La nostalgia llega sin avisar',
        cssFamily: 'var(--font-crimson), Georgia, serif',
    },
    {
        code: 'ibm-plex',
        name: 'IBM Plex Serif',
        desc: 'Moderna con carácter — para ensayos y crónicas',
        preview: 'La nostalgia llega sin avisar',
        cssFamily: 'var(--font-ibm-plex), Georgia, serif',
    },
]

const CARD_STYLES = [
    { code: 'editorial', name: 'Editorial', desc: 'Portada grande, tipografía prominente' },
    { code: 'journal', name: 'Journal', desc: 'Más íntimo, texto sobre fondo limpio' },
    { code: 'minimal', name: 'Minimal', desc: 'Solo lo esencial, mucho espacio blanco' },
]

interface BrandingFormProps {
    initial: {
        accent_color?: string | null
        font_family?: string | null
        card_style?: string | null
        brand_tagline?: string | null
    } | null
}

export function BrandingForm({ initial }: BrandingFormProps) {
    const [accent, setAccent] = useState(initial?.accent_color || '#22C55E')
    const [font, setFont] = useState(initial?.font_family || 'inter')
    const [cardStyle, setCardStyle] = useState(initial?.card_style || 'editorial')
    const [tagline, setTagline] = useState(initial?.brand_tagline || '')
    const [saved, setSaved] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleSave() {
        startTransition(async () => {
            const res = await updateBranding({
                accent_color: accent,
                font_family: font,
                card_style: cardStyle,
                brand_tagline: tagline,
            })
            if (res?.ok) {
                track('branding_updated', { accent_color: accent, font_family: font, card_style: cardStyle })
                setSaved(true)
                setTimeout(() => setSaved(false), 2500)
            }
        })
    }

    return (
        <div className="rounded-2xl bg-[#15171C] border border-gray-800 p-6 space-y-8">

            <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Sparkles size={18} className="text-green-400" />
                </div>
                <div>
                    <h2 className="font-bold text-lg text-white">Tu marca personal</h2>
                    <p className="text-sm text-gray-500">Personaliza cómo se ve tu perfil y tus historias. Todos tus lectores lo verán así.</p>
                </div>
            </div>

            {/* Accent color */}
            <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    <Palette size={12} /> Color de acento
                </label>
                <div className="grid grid-cols-6 gap-2 mb-3">
                    {ACCENTS.map(c => (
                        <button
                            key={c.code}
                            type="button"
                            onClick={() => setAccent(c.code)}
                            className={`relative h-14 rounded-xl border-2 transition-all ${accent === c.code ? 'scale-105 shadow-lg' : 'hover:scale-105'}`}
                            style={{
                                backgroundColor: c.code,
                                borderColor: accent === c.code ? 'rgba(255,255,255,0.6)' : 'transparent',
                            }}
                            aria-label={c.name}
                            title={c.name}
                        >
                            {accent === c.code && <Check size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white stroke-[3] drop-shadow-md" />}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Seleccionado:</span>
                    <div className="w-4 h-4 rounded-md" style={{ backgroundColor: accent }} />
                    <code className="font-mono text-gray-400">{accent}</code>
                </div>
            </div>

            {/* Font */}
            <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    <Type size={12} /> Tipografía
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FONTS.map(f => (
                        <button
                            key={f.code}
                            type="button"
                            onClick={() => setFont(f.code)}
                            className={`text-left p-5 rounded-xl border-2 transition-all ${
                                font === f.code
                                    ? 'border-green-500 bg-green-500/5 shadow-lg shadow-green-500/10'
                                    : 'border-gray-800 bg-[#0A0B0E] hover:border-gray-700'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-0.5">{f.name}</span>
                                    <span className="text-[11px] text-gray-600">{f.desc}</span>
                                </div>
                                {font === f.code && <Check size={14} className="text-green-500 shrink-0" />}
                            </div>
                            <p className="text-2xl text-white leading-tight mb-1" style={{ fontFamily: f.cssFamily, fontWeight: 600 }}>
                                {f.preview}
                            </p>
                            <p className="text-base text-gray-400 italic" style={{ fontFamily: f.cssFamily }}>
                                Y a veces, en un perfume olvidado.
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Card style */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Estilo de card
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {CARD_STYLES.map(s => (
                        <button
                            key={s.code}
                            type="button"
                            onClick={() => setCardStyle(s.code)}
                            className={`text-left p-4 rounded-xl border-2 transition-all ${
                                cardStyle === s.code
                                    ? 'border-green-500 bg-green-500/5'
                                    : 'border-gray-800 bg-[#0A0B0E] hover:border-gray-700'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-sm text-white">{s.name}</span>
                                {cardStyle === s.code && <Check size={14} className="text-green-500" />}
                            </div>
                            <p className="text-xs text-gray-500">{s.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tagline */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Frase de marca
                    <span className="normal-case font-medium text-gray-600 ml-2">· aparece bajo tu nombre</span>
                </label>
                <input
                    type="text"
                    value={tagline}
                    onChange={e => setTagline(e.target.value.slice(0, 80))}
                    placeholder="ej. Contando mi vida, un capítulo a la vez"
                    className="w-full px-4 py-3 rounded-xl bg-[#0A0B0E] border border-gray-800 text-white placeholder-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500 focus:outline-none text-sm"
                />
                <p className="text-[10px] text-gray-600 mt-1">{tagline.length}/80</p>
            </div>

            {/* Save */}
            <div className="pt-4 border-t border-gray-800 flex items-center gap-3">
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                >
                    {isPending ? 'Guardando...' : 'Guardar mi marca'}
                </button>
                {saved && (
                    <span className="text-sm text-green-400 font-bold flex items-center gap-1.5">
                        <Check size={14} /> Guardado
                    </span>
                )}
            </div>
        </div>
    )
}

'use client'

import { useState, useTransition } from 'react'
import { updateIdentity } from './identityActions'
import { createClient } from '@/lib/supabase/client'
import { Check, MapPin, Globe2, Heart, Tag, Sparkles, Upload, Image as ImageIcon, X } from 'lucide-react'

const COUNTRIES = [
    { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
    { code: 'MX', name: 'México', flag: '🇲🇽' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: 'ES', name: 'España', flag: '🇪🇸' },
    { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: 'PE', name: 'Perú', flag: '🇵🇪' },
    { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
    { code: 'DO', name: 'Rep. Dominicana', flag: '🇩🇴' },
    { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷' },
    { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
    { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
    { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
    { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
    { code: 'PA', name: 'Panamá', flag: '🇵🇦' },
    { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
    { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
    { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
    { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
    { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
    { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'FR', name: 'Francia', flag: '🇫🇷' },
    { code: 'IT', name: 'Italia', flag: '🇮🇹' },
    { code: 'DE', name: 'Alemania', flag: '🇩🇪' },
    { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
    { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
]

const LANGUAGES = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'de', name: 'Deutsch' },
]

const THEMES = [
    { code: 'migracion', label: '✈ Migración' },
    { code: 'supervivencia', label: '🔥 Supervivencia' },
    { code: 'amor_perdida', label: '❤️ Amor y Pérdida' },
    { code: 'negocios', label: '💼 Negocios' },
    { code: 'maternidad', label: '👶 Maternidad' },
    { code: 'comenzar_de_nuevo', label: '🌱 Comenzar de Nuevo' },
    { code: 'identidad', label: '🪞 Identidad' },
    { code: 'salud_mental', label: '🧠 Salud Mental' },
    { code: 'familia', label: '🏠 Familia' },
    { code: 'viajes', label: '🌍 Viajes' },
    { code: 'carrera', label: '🚀 Carrera' },
    { code: 'espiritualidad', label: '✨ Espiritualidad' },
]

const PRONOUN_PRESETS = ['ella/she', 'él/he', 'elle/they', 'no especificado']

interface IdentityFormProps {
    initial: {
        id: string
        country_code?: string | null
        pronouns?: string | null
        languages?: string[] | null
        interests?: string[] | null
        story_themes?: string[] | null
        website_url?: string | null
        instagram_handle?: string | null
        twitter_handle?: string | null
        cover_image_url?: string | null
    }
}

export function IdentityForm({ initial }: IdentityFormProps) {
    const [country, setCountry] = useState(initial.country_code || '')
    const [pronouns, setPronouns] = useState(initial.pronouns || '')
    const [languages, setLanguages] = useState<string[]>(initial.languages || ['es'])
    const [interestInput, setInterestInput] = useState('')
    const [interests, setInterests] = useState<string[]>(initial.interests || [])
    const [themes, setThemes] = useState<string[]>(initial.story_themes || [])
    const [website, setWebsite] = useState(initial.website_url || '')
    const [instagram, setInstagram] = useState(initial.instagram_handle || '')
    const [twitter, setTwitter] = useState(initial.twitter_handle || '')
    const [coverUrl, setCoverUrl] = useState(initial.cover_image_url || '')
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState(initial.cover_image_url || '')
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [isPending, startTransition] = useTransition()

    function toggleLang(code: string) {
        setLanguages(prev => prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code])
    }

    function toggleTheme(code: string) {
        setThemes(prev => {
            if (prev.includes(code)) return prev.filter(t => t !== code)
            if (prev.length >= 6) return prev
            return [...prev, code]
        })
    }

    function addInterest(raw?: string) {
        const value = (raw ?? interestInput).trim()
        if (!value) return
        if (interests.length >= 10) return
        if (interests.some(i => i.toLowerCase() === value.toLowerCase())) return
        setInterests(prev => [...prev, value.slice(0, 25)])
        setInterestInput('')
    }

    function removeInterest(i: string) {
        setInterests(prev => prev.filter(x => x !== i))
    }

    function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null
        setCoverFile(file)
        if (file) setCoverPreview(URL.createObjectURL(file))
    }

    async function handleSave() {
        setError('')
        startTransition(async () => {
            let finalCoverUrl = coverUrl

            // Upload cover if a new file was selected
            if (coverFile) {
                const supabase = createClient()
                const ext = coverFile.name.split('.').pop()
                const fileName = `${initial.id}_cover_${Date.now()}.${ext}`
                const { error: uploadErr } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, coverFile, { upsert: true })
                if (uploadErr) {
                    setError('Error subiendo portada: ' + uploadErr.message)
                    return
                }
                const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
                finalCoverUrl = data.publicUrl
                setCoverUrl(finalCoverUrl)
                setCoverFile(null)
            }

            const res = await updateIdentity({
                country_code: country || null,
                pronouns: pronouns || null,
                languages,
                interests,
                story_themes: themes,
                website_url: website || null,
                instagram_handle: instagram || null,
                twitter_handle: twitter || null,
                cover_image_url: finalCoverUrl || null,
            })

            if (res?.error) {
                setError(res.error)
            } else {
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
                    <h2 className="font-bold text-lg text-white">Tu identidad</h2>
                    <p className="text-sm text-gray-500">Información pública en tu perfil. Ayuda a los lectores a conectar contigo.</p>
                </div>
            </div>

            {/* Cover image */}
            <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    <ImageIcon size={12} /> Banner del perfil
                </label>
                {coverPreview ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-800 group">
                        <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => { setCoverFile(null); setCoverPreview(''); setCoverUrl('') }}
                            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-gray-700 bg-[#0A0B0E] hover:border-green-500/50 cursor-pointer transition">
                        <Upload size={22} className="text-gray-500 mb-1.5" />
                        <span className="text-sm font-semibold text-gray-400">Haz clic para subir banner</span>
                        <span className="text-xs text-gray-600 mt-0.5">Recomendado: 1600×400</span>
                        <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                    </label>
                )}
            </div>

            {/* Country + Pronouns row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                        <MapPin size={12} /> País
                    </label>
                    <select
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#0A0B0E] border border-gray-800 text-white focus:border-green-500/50 focus:ring-1 focus:ring-green-500 focus:outline-none text-sm"
                    >
                        <option value="" className="bg-[#15171C]">Seleccionar país</option>
                        {COUNTRIES.map(c => (
                            <option key={c.code} value={c.code} className="bg-[#15171C]">
                                {c.flag} {c.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Pronombres
                    </label>
                    <input
                        type="text"
                        value={pronouns}
                        onChange={e => setPronouns(e.target.value.slice(0, 30))}
                        placeholder="ella/she"
                        list="pronoun-presets"
                        className="w-full px-4 py-3 rounded-xl bg-[#0A0B0E] border border-gray-800 text-white placeholder-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500 focus:outline-none text-sm"
                    />
                    <datalist id="pronoun-presets">
                        {PRONOUN_PRESETS.map(p => <option key={p} value={p} />)}
                    </datalist>
                </div>
            </div>

            {/* Languages */}
            <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    <Globe2 size={12} /> Idiomas que dominas
                </label>
                <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(l => {
                        const active = languages.includes(l.code)
                        return (
                            <button
                                key={l.code}
                                type="button"
                                onClick={() => toggleLang(l.code)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                                    active
                                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                        : 'bg-[#0A0B0E] text-gray-400 border-gray-800 hover:border-gray-700'
                                }`}
                            >
                                {active && <Check size={12} className="inline mr-1.5" />}
                                {l.name}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Story themes */}
            <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    <Heart size={12} /> ¿De qué escribes?
                    <span className="normal-case font-medium text-gray-600 text-[10px]">· máx 6</span>
                </label>
                <div className="flex flex-wrap gap-2">
                    {THEMES.map(t => {
                        const active = themes.includes(t.code)
                        const disabled = !active && themes.length >= 6
                        return (
                            <button
                                key={t.code}
                                type="button"
                                onClick={() => toggleTheme(t.code)}
                                disabled={disabled}
                                className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition ${
                                    active
                                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                        : disabled
                                            ? 'bg-[#0A0B0E] text-gray-700 border-gray-900 cursor-not-allowed'
                                            : 'bg-[#0A0B0E] text-gray-400 border-gray-800 hover:border-gray-700'
                                }`}
                            >
                                {t.label}
                            </button>
                        )
                    })}
                </div>
                <p className="text-[10px] text-gray-600 mt-2">{themes.length}/6 seleccionados</p>
            </div>

            {/* Interests (tag input) */}
            <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    <Tag size={12} /> Intereses
                    <span className="normal-case font-medium text-gray-600 text-[10px]">· máx 10, libre</span>
                </label>
                <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[#0A0B0E] border border-gray-800 min-h-[52px] focus-within:border-green-500/50">
                    {interests.map(i => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/20">
                            {i}
                            <button type="button" onClick={() => removeInterest(i)} className="hover:text-white transition">
                                <X size={11} />
                            </button>
                        </span>
                    ))}
                    {interests.length < 10 && (
                        <input
                            type="text"
                            value={interestInput}
                            onChange={e => setInterestInput(e.target.value.slice(0, 25))}
                            onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addInterest() }
                            }}
                            placeholder={interests.length === 0 ? 'ej. fotografía, jazz, migración...' : '+ agregar'}
                            className="flex-1 min-w-[140px] bg-transparent text-white placeholder-gray-600 outline-none text-sm"
                        />
                    )}
                </div>
                <p className="text-[10px] text-gray-600 mt-1">Presiona Enter o coma para agregar · {interests.length}/10</p>
            </div>

            {/* Social */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Redes sociales
                </label>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 shrink-0 text-center text-xs font-bold text-gray-500">🌐</div>
                        <input
                            type="text"
                            value={website}
                            onChange={e => setWebsite(e.target.value)}
                            placeholder="https://tuweb.com"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-[#0A0B0E] border border-gray-800 text-white placeholder-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500 focus:outline-none text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 shrink-0 text-center text-xs font-bold text-pink-400">IG</div>
                        <div className="flex-1 flex items-center rounded-xl bg-[#0A0B0E] border border-gray-800 focus-within:border-green-500/50">
                            <span className="px-3 text-gray-600 text-sm">@</span>
                            <input
                                type="text"
                                value={instagram}
                                onChange={e => setInstagram(e.target.value)}
                                placeholder="tuhandle"
                                className="flex-1 py-2.5 pr-3 bg-transparent text-white placeholder-gray-600 outline-none text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 shrink-0 text-center text-xs font-bold text-gray-400">𝕏</div>
                        <div className="flex-1 flex items-center rounded-xl bg-[#0A0B0E] border border-gray-800 focus-within:border-green-500/50">
                            <span className="px-3 text-gray-600 text-sm">@</span>
                            <input
                                type="text"
                                value={twitter}
                                onChange={e => setTwitter(e.target.value)}
                                placeholder="tuhandle"
                                className="flex-1 py-2.5 pr-3 bg-transparent text-white placeholder-gray-600 outline-none text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="text-sm font-medium p-3 rounded-xl text-red-400 bg-red-500/10 border border-red-500/20">
                    {error}
                </div>
            )}

            {/* Save */}
            <div className="pt-4 border-t border-gray-800 flex items-center gap-3">
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                >
                    {isPending ? 'Guardando...' : 'Guardar identidad'}
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

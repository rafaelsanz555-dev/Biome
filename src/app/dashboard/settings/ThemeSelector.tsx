'use client'

import { useState, useTransition, useEffect } from 'react'
import { Check, Upload, Sparkles, Wand2, Palette, X, Link2 as Link2Icon } from 'lucide-react'
import { selectTheme, uploadCustomBackground } from './themeActions'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics'

interface ThemeRow {
    id: string
    slug: string
    name: string
    description: string | null
    type: 'official' | 'custom' | 'community'
    style: 'solid' | 'gradient' | 'image' | 'animated' | 'pattern'
    config: any
    is_animated: boolean
}

interface Props {
    initialThemeId?: string | null
    initialAccent?: string | null
    initialFont?: string | null
    /** Themes disponibles desde el server */
    themes: ThemeRow[]
}

export function ThemeSelector({ initialThemeId, initialAccent, initialFont, themes }: Props) {
    const [selected, setSelected] = useState<string | null>(initialThemeId || null)
    const [hovered, setHovered] = useState<string | null>(null)
    const [previewTheme, setPreviewTheme] = useState<ThemeRow | null>(null)
    const [showCustomDialog, setShowCustomDialog] = useState(false)
    const [saving, startTransition] = useTransition()
    const [saved, setSaved] = useState(false)

    // Resolver theme actual para el preview
    const currentTheme = previewTheme || (selected ? themes.find(t => t.id === selected) || null : null)

    function handleSelect(themeId: string) {
        setSelected(themeId)
        const theme = themes.find(t => t.id === themeId)
        if (theme) {
            track('theme_changed', { theme_slug: theme.slug, theme_type: theme.type })
            startTransition(async () => {
                const res = await selectTheme(themeId)
                if (res?.ok) {
                    setSaved(true)
                    setTimeout(() => setSaved(false), 2000)
                }
            })
        }
    }

    return (
        <div className="rounded-2xl bg-[#15171C] border border-gray-800 p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Wand2 size={18} className="text-violet-400" />
                </div>
                <div className="flex-1">
                    <h2 className="font-bold text-lg text-white flex items-center gap-2">
                        Themes
                        <span className="text-[10px] bg-violet-500/15 text-violet-300 px-2 py-0.5 rounded-full font-bold">NUEVO</span>
                    </h2>
                    <p className="text-sm text-gray-500">El theme cambia color, tipografía Y fondo. Los animados se mueven sutilmente mientras tu lector lee.</p>
                </div>
                {saved && <span className="text-sm text-blue-400 font-bold flex items-center gap-1.5"><Check size={14} /> Aplicado</span>}
            </div>

            {/* Grid de themes oficiales */}
            <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-3">Oficiales · curados por bio.me</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {themes.filter(t => t.type === 'official').map(theme => (
                        <ThemeCard
                            key={theme.id}
                            theme={theme}
                            isSelected={selected === theme.id}
                            isHovered={hovered === theme.id}
                            onHover={(v) => setHovered(v ? theme.id : null)}
                            onSelect={() => handleSelect(theme.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Themes custom (subidos por el creador) */}
            {themes.filter(t => t.type === 'custom').length > 0 && (
                <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-3">Tus themes personalizados</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {themes.filter(t => t.type === 'custom').map(theme => (
                            <ThemeCard
                                key={theme.id}
                                theme={theme}
                                isSelected={selected === theme.id}
                                isHovered={hovered === theme.id}
                                onHover={(v) => setHovered(v ? theme.id : null)}
                                onSelect={() => handleSelect(theme.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Botón para crear theme custom */}
            <button
                type="button"
                onClick={() => setShowCustomDialog(true)}
                className="w-full p-4 rounded-xl border-2 border-dashed border-gray-700 hover:border-violet-500/50 text-gray-400 hover:text-violet-400 transition-all flex items-center justify-center gap-2 text-sm font-bold"
            >
                <Upload size={16} />
                Sube tu propio fondo (Akatsuki, foto, lo que quieras)
            </button>

            {showCustomDialog && (
                <CustomThemeDialog
                    onClose={() => setShowCustomDialog(false)}
                    onCreated={(newId) => {
                        setShowCustomDialog(false)
                        setSelected(newId)
                    }}
                />
            )}

            <p className="text-[11px] text-gray-600 italic pt-2 border-t border-gray-800">
                💡 Los themes solo aplican a tu perfil y a tus episodios. El feed global de bio.me mantiene su estilo neutral para que las historias se diferencien por su voz, no solo por su look.
            </p>
        </div>
    )
}

// ─────────────────────────────────────────────────
// Theme card individual con mini preview real
// ─────────────────────────────────────────────────
function ThemeCard({
    theme,
    isSelected,
    isHovered,
    onSelect,
    onHover,
}: {
    theme: ThemeRow
    isSelected: boolean
    isHovered: boolean
    onSelect: () => void
    onHover: (v: boolean) => void
}) {
    // Construir el style del preview — IDÉNTICO al ThemeProvider real
    const cfg = theme.config || {}
    const bgLayers: string[] = []
    if (cfg.background_overlay) bgLayers.push(cfg.background_overlay)
    if (cfg.background_image) bgLayers.push(`url("${cfg.background_image}")`)
    if (cfg.background_pattern) bgLayers.push(cfg.background_pattern)
    if (cfg.background_gradient && !cfg.background_image) bgLayers.push(cfg.background_gradient)

    const bgStyle: React.CSSProperties = {
        backgroundColor: cfg.background || '#0A0B0E',
        backgroundImage: bgLayers.length > 0 ? bgLayers.join(', ') : undefined,
        backgroundSize: cfg.background_size || 'cover',
        backgroundPosition: 'center',
        // ANIMACIÓN EN VIVO: misma animación que el theme real corre cuando se aplica
        animation: cfg.background_animation || undefined,
    }

    const fontFamily = {
        inter: 'var(--font-inter), system-ui, sans-serif',
        playfair: 'var(--font-playfair), Georgia, serif',
        crimson: 'var(--font-crimson), Georgia, serif',
        'ibm-plex': 'var(--font-ibm-plex), Georgia, serif',
    }[cfg.font as string] || 'var(--font-inter), system-ui, sans-serif'

    return (
        <button
            type="button"
            onClick={onSelect}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
            suppressHydrationWarning
            className={`group relative aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all text-left ${
                isSelected
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]'
                    : 'border-transparent hover:border-gray-600 hover:scale-[1.02]'
            }`}
        >
            <div className="absolute inset-0" style={bgStyle} />

            {/* Mini composition de preview: título + accent */}
            <div className="absolute inset-0 p-3 flex flex-col justify-end">
                <div className="space-y-1.5">
                    <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: cfg.accent_color || '#2563EB' }} />
                    <p
                        className="text-white text-sm font-bold leading-tight line-clamp-2"
                        style={{ fontFamily, color: cfg.is_light ? '#0F172A' : '#fff' }}
                    >
                        {theme.name}
                    </p>
                    <p className="text-[10px] opacity-80 line-clamp-1" style={{ color: cfg.is_light ? '#475569' : '#cbd5e1' }}>
                        {theme.description}
                    </p>
                </div>
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
                {theme.is_animated && (
                    <span className="bg-violet-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={8} /> Anim
                    </span>
                )}
            </div>

            {/* Selected indicator */}
            {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                    <Check size={14} className="text-white stroke-[3]" />
                </div>
            )}
        </button>
    )
}

// ─────────────────────────────────────────────────
// Dialog para crear theme custom: Subir imagen O pegar URL
// ─────────────────────────────────────────────────
type SourceMode = 'upload' | 'url'

function CustomThemeDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
    const [mode, setMode] = useState<SourceMode>('upload')

    // Upload mode state
    const [file, setFile] = useState<File | null>(null)
    const [filePreview, setFilePreview] = useState<string | null>(null)

    // URL mode state
    const [urlInput, setUrlInput] = useState('')
    const [urlPreview, setUrlPreview] = useState<string | null>(null)
    const [urlValid, setUrlValid] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle')

    // Common state
    const [name, setName] = useState('Mi theme')
    const [accent, setAccent] = useState('#2563EB')
    const [font, setFont] = useState('playfair')
    const [overlay, setOverlay] = useState<'dark' | 'medium' | 'light'>('dark')
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0]
        if (!f) return
        if (f.size > 5 * 1024 * 1024) {
            setError('Imagen demasiado grande (máx 5MB)')
            return
        }
        setFile(f)
        setFilePreview(URL.createObjectURL(f))
        setError(null)
    }

    async function checkUrl() {
        const trimmed = urlInput.trim()
        if (!trimmed) { setUrlValid('idle'); setUrlPreview(null); return }
        if (!/^https?:\/\//i.test(trimmed)) {
            setUrlValid('fail')
            setError('La URL debe empezar con http:// o https://')
            return
        }
        setUrlValid('checking')
        setError(null)
        try {
            // Cargar imagen via <img> nativo — esto evita problemas de CORS con HEAD requests
            await new Promise<void>((resolve, reject) => {
                const img = new Image()
                img.onload = () => resolve()
                img.onerror = () => reject(new Error('La imagen no se pudo cargar — verifica que sea pública'))
                img.src = trimmed
                setTimeout(() => reject(new Error('Timeout — la URL tardó demasiado')), 10000)
            })
            setUrlValid('ok')
            setUrlPreview(trimmed)
        } catch (e: any) {
            setUrlValid('fail')
            setError(e.message || 'No se pudo cargar la imagen')
        }
    }

    async function handleSubmit() {
        setUploading(true)
        setError(null)
        try {
            let finalImageUrl: string

            if (mode === 'upload') {
                if (!file) { setError('Sube una imagen primero'); setUploading(false); return }
                const supabase = createClient()
                const ext = file.name.split('.').pop()
                const fileName = `theme_${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`
                const { error: upErr } = await supabase.storage.from('themes').upload(fileName, file)
                if (upErr) {
                    setError('Error subiendo: ' + upErr.message)
                    setUploading(false)
                    return
                }
                const { data: urlData } = supabase.storage.from('themes').getPublicUrl(fileName)
                finalImageUrl = urlData.publicUrl
            } else {
                // mode === 'url'
                if (urlValid !== 'ok' || !urlPreview) { setError('Verifica la URL primero'); setUploading(false); return }
                finalImageUrl = urlPreview
            }

            const overlayMap = {
                dark: 'linear-gradient(180deg, rgba(10,11,14,0.85), rgba(10,11,14,0.95))',
                medium: 'linear-gradient(180deg, rgba(10,11,14,0.65), rgba(10,11,14,0.85))',
                light: 'linear-gradient(180deg, rgba(10,11,14,0.4), rgba(10,11,14,0.7))',
            }
            const res = await uploadCustomBackground({
                name: name.slice(0, 50),
                accent_color: accent,
                font,
                background_image: finalImageUrl,
                background_overlay: overlayMap[overlay],
            })
            if (res.error) { setError(res.error); setUploading(false); return }
            track('custom_theme_created', { font, overlay, source: mode })
            onCreated(res.theme_id!)
        } catch (e: any) {
            setError(e.message || 'Error inesperado')
        } finally {
            setUploading(false)
        }
    }

    const canSubmit =
        (mode === 'upload' && !!file) ||
        (mode === 'url' && urlValid === 'ok')

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0F1114] border border-gray-800 rounded-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-gray-800">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Palette size={18} className="text-violet-400" />
                        Theme personalizado
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Mode tabs */}
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0A0B0E] border border-gray-800">
                        <button
                            type="button"
                            onClick={() => { setMode('upload'); setError(null) }}
                            className={`px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${
                                mode === 'upload' ? 'bg-violet-500/15 text-violet-300' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            <Upload size={14} /> Desde mi compu
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('url'); setError(null) }}
                            className={`px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${
                                mode === 'url' ? 'bg-violet-500/15 text-violet-300' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            <Link2Icon size={14} /> Pegar URL de internet
                        </button>
                    </div>

                    {/* Upload mode */}
                    {mode === 'upload' && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                                Imagen (máx 5MB · jpg, png, webp)
                            </label>
                            <label className="block aspect-video rounded-xl border-2 border-dashed border-gray-700 hover:border-violet-500/50 cursor-pointer overflow-hidden bg-[#0A0B0E]">
                                {filePreview ? (
                                    <div className="relative w-full h-full">
                                        <img src={filePreview} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition">
                                            <span className="text-white text-sm font-bold">Cambiar imagen</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-violet-400 transition">
                                        <Upload size={28} className="mb-2" />
                                        <span className="text-sm font-bold">Click para subir</span>
                                        <span className="text-[11px] mt-1">o arrastra una imagen aquí</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                            </label>
                        </div>
                    )}

                    {/* URL mode */}
                    {mode === 'url' && (
                        <div className="space-y-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                URL de la imagen
                            </label>
                            <p className="text-[11px] text-gray-500 -mt-2">
                                💡 Tip: Click derecho sobre cualquier imagen en internet → "Copiar dirección de imagen". Funciona con Pinterest, Unsplash, Imgur, Google Images, etc.
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={e => { setUrlInput(e.target.value); setUrlValid('idle'); setUrlPreview(null) }}
                                    placeholder="https://i.pinimg.com/originals/..."
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-[#0A0B0E] border border-gray-800 text-white text-sm font-mono focus:border-violet-500/50 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={checkUrl}
                                    disabled={!urlInput.trim() || urlValid === 'checking'}
                                    className="px-4 py-2.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 text-sm font-bold transition disabled:opacity-50 whitespace-nowrap"
                                >
                                    {urlValid === 'checking' ? 'Verificando...' : 'Verificar'}
                                </button>
                            </div>
                            {urlValid === 'ok' && urlPreview && (
                                <div>
                                    <p className="text-[11px] text-blue-400 mb-2 flex items-center gap-1.5"><Check size={12} /> Imagen cargada correctamente</p>
                                    <div className="aspect-video rounded-xl overflow-hidden bg-[#0A0B0E] border border-gray-800">
                                        <img src={urlPreview} alt="" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            )}
                            {urlValid === 'fail' && (
                                <p className="text-[11px] text-red-400 flex items-center gap-1.5">
                                    ✗ No se pudo cargar — verifica que la URL sea pública y termine en .jpg / .png / .webp
                                </p>
                            )}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Nombre del theme</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-[#0A0B0E] border border-gray-800 text-white text-sm focus:border-violet-500/50 focus:outline-none"
                        />
                    </div>

                    {/* Accent + font + overlay */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Color acento</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={accent}
                                    onChange={e => setAccent(e.target.value)}
                                    className="w-12 h-10 rounded-lg cursor-pointer bg-transparent"
                                />
                                <code className="text-xs font-mono text-gray-300">{accent}</code>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Tipografía</label>
                            <select
                                value={font}
                                onChange={e => setFont(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-[#0A0B0E] border border-gray-800 text-white text-sm"
                            >
                                <option value="playfair">Playfair Display</option>
                                <option value="crimson">Crimson Pro</option>
                                <option value="ibm-plex">IBM Plex Serif</option>
                                <option value="inter">Inter</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Oscuridad</label>
                            <select
                                value={overlay}
                                onChange={e => setOverlay(e.target.value as any)}
                                className="w-full px-3 py-2 rounded-lg bg-[#0A0B0E] border border-gray-800 text-white text-sm"
                            >
                                <option value="dark">Oscuro (legible)</option>
                                <option value="medium">Medio</option>
                                <option value="light">Claro (más imagen)</option>
                            </select>
                        </div>
                    </div>

                    {error && <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-red-400">{error}</div>}

                    <div className="flex gap-2 pt-2">
                        <button onClick={onClose} disabled={uploading} className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold transition">Cancelar</button>
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit || uploading}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition disabled:opacity-50"
                        >
                            {uploading ? 'Creando...' : 'Crear theme'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateEpisode, deleteEpisode } from '../../actions'
import { createClient } from '@/lib/supabase/client'
import { Trash2, ImagePlus, Eye, EyeOff, Loader2 } from 'lucide-react'
import { LivePreview } from '@/app/dashboard/settings/LivePreview'
import { RichEditor, RichEditorHandle } from '@/components/editor/RichEditor'
import { MONETIZATION_ENABLED } from '@/lib/flags'
import { AGE_RATINGS, CONTENT_WARNING_OPTIONS } from '@/lib/editorial'

// full_text plano (legacy sin content_json) → documento TipTap
function plainTextToDoc(text: string) {
    const paragraphs = (text || '').split(/\n{2,}|\r\n{2,}/).map((p) => p.trim()).filter(Boolean)
    return {
        type: 'doc',
        content: paragraphs.length
            ? paragraphs.map((p) => ({ type: 'paragraph', content: [{ type: 'text', text: p }] }))
            : [{ type: 'paragraph' }],
    }
}

interface EditEpisodeFormProps {
    episode: any
    previewInitial?: any
}

export function EditEpisodeForm({ episode, previewInitial }: EditEpisodeFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [saved, setSaved] = useState(false)
    const [forcedFreeNotice, setForcedFreeNotice] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Form state
    const editorRef = useRef<RichEditorHandle>(null)
    const initialDoc = episode.content_json || plainTextToDoc(episode.full_text || '')
    const [title, setTitle] = useState(episode.title || '')
    const [previewText, setPreviewText] = useState(episode.preview_text || '')
    const [coverUrl, setCoverUrl] = useState(episode.cover_image_url || '')
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [isPublished, setIsPublished] = useState(episode.is_published)
    const [monetization, setMonetization] = useState<'free' | 'subscription' | 'ppv'>(
        episode.is_subscription_only ? 'subscription' : episode.ppv_price ? 'ppv' : 'free'
    )
    const [ppvPrice, setPpvPrice] = useState(episode.ppv_price?.toString() || '2.99')
    const [ageRating, setAgeRating] = useState(episode.age_rating || 'all')
    const [selectedWarnings, setSelectedWarnings] = useState<string[]>(episode.content_warnings || [])
    const [rightsConfirmed, setRightsConfirmed] = useState(false)
    const [acceptPublishTerms, setAcceptPublishTerms] = useState(false)

    function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0]
        if (!f) return
        if (f.size > 5 * 1024 * 1024) {
            setError('Imagen demasiado grande (máx 5MB)')
            return
        }
        if (!f.type.startsWith('image/')) {
            setError('Solo imágenes (jpg, png, webp)')
            return
        }
        setCoverFile(f)
        setCoverUrl(URL.createObjectURL(f))
        setError(null)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setSaved(false)

        startTransition(async () => {
            // Si hay nueva cover, subirla primero
            let finalCoverUrl = episode.cover_image_url
            if (coverFile) {
                const supabase = createClient()
                const ext = coverFile.name.split('.').pop()
                const fileName = `cover_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
                // upload y getPublicUrl deben usar el MISMO bucket — antes se subía
                // a 'post-images' pero la URL se generaba contra 'episodes' (portada rota)
                const { error: upErr } = await supabase.storage.from('episodes').upload(fileName, coverFile)
                if (upErr) {
                    setError('Error subiendo portada: ' + upErr.message)
                    return
                }
                const { data: urlData } = supabase.storage.from('episodes').getPublicUrl(fileName)
                finalCoverUrl = urlData.publicUrl
            }

            // Construir FormData — el cuerpo sale del editor (ya es editable)
            const editorText = editorRef.current?.getText() ?? (episode.full_text || '')
            const editorJson = editorRef.current?.getJSON() ?? episode.content_json
            const wordCount = editorRef.current?.getWordCount() ?? (episode.word_count || 0)
            const readingTime = editorRef.current?.getReadingTime() ?? (episode.reading_time_min || 1)

            if (!editorText.trim()) {
                setError('Tu historia está vacía. Escribe algo antes de guardar.')
                return
            }
            if (isPublished && wordCount < 30) {
                setError(`Para mantenerlo publicado necesitas al menos 30 palabras (llevas ${wordCount}). Despublícalo si quieres guardarlo corto.`)
                return
            }
            const firstPublication = !episode.is_published && isPublished
            if (firstPublication && (!rightsConfirmed || !acceptPublishTerms)) {
                setError('Para publicar, confirma tus derechos y acepta las políticas vigentes.')
                return
            }

            const formData = new FormData()
            formData.append('title', title)
            formData.append('preview_text', previewText)
            formData.append('full_text', editorText)
            formData.append('content_json', JSON.stringify(editorJson))
            formData.append('word_count', String(wordCount))
            formData.append('reading_time_min', String(readingTime))
            formData.append('cover_image_url', finalCoverUrl || '')
            formData.append('season_id', episode.season_id || '')
            formData.append('soundtrack_url', episode.soundtrack_url || '')
            formData.append('soundtrack_title', episode.soundtrack_title || '')
            formData.append('is_published', String(isPublished))
            formData.append('monetization', monetization)
            formData.append('age_rating', ageRating)
            formData.append('content_warnings', JSON.stringify(selectedWarnings))
            if (rightsConfirmed) formData.append('rights_confirmed', 'on')
            if (acceptPublishTerms) formData.append('accept_publish_terms', 'on')
            if (monetization === 'ppv') formData.append('ppv_price', ppvPrice)

            const result = await updateEpisode(episode.id, formData)
            if (result.error) {
                setError(result.error)
            } else {
                if ((result as any).forcedFree) {
                    setMonetization('free')
                    setError(null)
                    setForcedFreeNotice(true)
                    setTimeout(() => setForcedFreeNotice(false), 6000)
                }
                setSaved(true)
                setTimeout(() => setSaved(false), 3000)
                router.refresh()
            }
        })
    }

    async function handleDelete() {
        startTransition(async () => {
            const result = await deleteEpisode(episode.id)
            if (result?.error) {
                setError(result.error)
                setShowDeleteConfirm(false)
            }
            // si no hay error, redirige a /dashboard/episodes desde la action
        })
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-5 border border-[#171512]/10 bg-[#FFFCF5] p-6">
                    {/* Título */}
                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#574F45]">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full border border-[#171512]/15 bg-[#F8F4EA] px-4 py-3 text-[#171512] placeholder:text-[#9A9082] focus:border-[#A63D2D]/50 focus:outline-none"
                        />
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#574F45]">
                            Vista previa <span className="text-gray-600 normal-case">— el gancho que ven en el feed</span>
                        </label>
                        <textarea
                            value={previewText}
                            onChange={(e) => setPreviewText(e.target.value.slice(0, 240))}
                            rows={3}
                            className="w-full border border-[#171512]/15 bg-[#F8F4EA] px-4 py-3 text-[#171512] placeholder:text-[#9A9082] focus:border-[#A63D2D]/50 focus:outline-none"
                        />
                        <p className="text-[10px] text-gray-600 mt-1">{previewText.length}/240</p>
                    </div>

                    {/* Cuerpo del episodio — editable */}
                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#574F45]">Tu historia</label>
                        <RichEditor ref={editorRef} initialContent={initialDoc} />
                    </div>

                    {/* Cover image */}
                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#574F45]">Portada</label>
                        <label className="block aspect-video cursor-pointer overflow-hidden border-2 border-dashed border-[#171512]/20 bg-[#EEE5D5] hover:border-[#A63D2D]/45">
                            {coverUrl ? (
                                <div className="relative w-full h-full group">
                                    <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">Cambiar portada</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-[#D8BA63] transition">
                                    <ImagePlus size={28} className="mb-2" />
                                    <span className="text-sm font-bold">Click para subir portada</span>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                        </label>
                    </div>
                </div>

                {/* Monetización — oculta en el MVP; conserva el valor existente del episodio */}
                {MONETIZATION_ENABLED && (
                <div className="space-y-4 border border-[#171512]/10 bg-[#FFFCF5] p-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#574F45]">Monetización</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {(['free', 'subscription', 'ppv'] as const).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMonetization(m)}
                                className={`p-3 rounded-lg border text-sm font-bold transition ${
                                    monetization === m
                                        ? 'border-[#C9A84C]/50 bg-[#C9A84C]/10 text-[#D8BA63]'
                                        : 'border-[#171512]/12 text-[#746A5C] hover:border-[#A63D2D]/30'
                                }`}
                            >
                                {m === 'free' && 'Gratis'}
                                {m === 'subscription' && 'Solo suscriptores'}
                                {m === 'ppv' && 'Pay-per-view'}
                            </button>
                        ))}
                    </div>
                    {monetization === 'ppv' && (
                        <div>
                            <label className="block text-[11px] text-gray-500 mb-1">Precio PPV (USD)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.99"
                                max="999.99"
                                value={ppvPrice}
                                onChange={(e) => setPpvPrice(e.target.value)}
                                className="w-32 border border-[#171512]/15 bg-[#F8F4EA] px-3 py-2 text-[#171512]"
                            />
                        </div>
                    )}
                </div>
                )}

                <div className="space-y-4 border border-[#171512]/10 bg-[#FFFCF5] p-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#574F45]">Clasificación editorial</h3>
                    <div>
                        <label className="mb-1.5 block text-[11px] font-bold text-gray-500">Edad recomendada</label>
                        <select value={ageRating} onChange={(event) => setAgeRating(event.target.value)} className="w-full border border-[#171512]/15 bg-[#F8F4EA] px-3 py-2.5 text-sm text-[#171512] outline-none focus:border-[#A63D2D]/50">
                            {AGE_RATINGS.map((rating) => <option key={rating} value={rating}>{rating === 'all' ? 'Para todos' : `${rating} años`}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {CONTENT_WARNING_OPTIONS.map((warning) => {
                            const checked = selectedWarnings.includes(warning.value)
                            return (
                                <label key={warning.value} className={`flex items-center gap-2 border px-2.5 py-2 text-[11px] font-semibold ${checked ? 'border-[#A63D2D]/35 bg-[#A63D2D]/6 text-[#A63D2D]' : 'border-[#171512]/12 text-[#746A5C]'}`}>
                                    <input type="checkbox" checked={checked} onChange={() => setSelectedWarnings((current) => checked ? current.filter((item) => item !== warning.value) : [...current, warning.value])} />
                                    {warning.label}
                                </label>
                            )
                        })}
                    </div>
                </div>

                {/* Estado de publicación */}
                <div className="border border-[#171512]/10 bg-[#FFFCF5] p-6">
                    <button
                        type="button"
                        onClick={() => setIsPublished(!isPublished)}
                        className="w-full flex items-center justify-between gap-3 text-left"
                    >
                        <div className="flex items-center gap-3">
                            {isPublished ? <Eye className="text-[#D8BA63]" size={18} /> : <EyeOff className="text-gray-500" size={18} />}
                            <div>
                                <p className="text-sm font-bold text-[#171512]">
                                    {isPublished ? 'Publicado' : 'Borrador'}
                                </p>
                                <p className="text-[11px] text-gray-500">
                                    {isPublished ? 'Visible para todos · click para despublicar' : 'Solo tú lo ves · click para publicar'}
                                </p>
                            </div>
                        </div>
                        <div className={`w-10 h-6 rounded-full transition ${isPublished ? 'bg-[#C9A84C]' : 'bg-gray-700'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md transition mt-0.5 ${isPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                    </button>
                </div>

                {!episode.is_published && isPublished && (
                    <div className="rounded-2xl border border-[#C9A84C]/25 bg-[#C9A84C]/5 p-5 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#D8BA63]">Consentimiento de publicación</p>
                        <label className="flex items-start gap-2.5 text-xs leading-5 text-gray-400">
                            <input type="checkbox" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)} className="mt-1 accent-[#C9A84C]" />
                            Confirmo que el contenido es mío o tengo autorización para publicarlo.
                        </label>
                        <label className="flex items-start gap-2.5 text-xs leading-5 text-gray-400">
                            <input type="checkbox" checked={acceptPublishTerms} onChange={(event) => setAcceptPublishTerms(event.target.checked)} className="mt-1 accent-[#C9A84C]" />
                            <span>Acepto la <a href="/legal/content-policy" target="_blank" className="font-bold text-[#D8BA63]">Política de Contenido</a> y los <a href="/legal/creator-terms" target="_blank" className="font-bold text-[#D8BA63]">Términos para Creadores</a>.</span>
                        </label>
                    </div>
                )}

                {/* Errors */}
                {error && (
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-sm text-red-400">{error}</div>
                )}
                {saved && (
                    <div className="p-3 rounded-lg bg-[#C9A84C]/5 border border-[#C9A84C]/20 text-sm text-[#D8BA63]">✓ Cambios guardados</div>
                )}
                {forcedFreeNotice && (
                    <div className="p-3 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-sm text-[#D8BA63]">
                        Este es el primer capítulo de la historia, así que se publicó <strong>gratis</strong> (regla Pergamo: el gancho siempre es gratis).
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#A63D2D] px-5 py-3 font-bold text-white transition hover:bg-[#873023] disabled:opacity-50"
                    >
                        {isPending && <Loader2 size={14} className="animate-spin" />}
                        {isPending ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isPending}
                        className="px-5 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 transition flex items-center gap-2"
                    >
                        <Trash2 size={14} /> Borrar
                    </button>
                </div>

                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="hidden lg:block mt-0">
                        <LivePreview initial={previewInitial} />
                    </div>
                </div>
            </form>

            {/* Delete confirm modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171512]/70 p-4 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="w-full max-w-md border border-red-500/25 bg-[#FFFCF5] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="mb-2 font-serif text-xl font-black text-[#171512]">¿Borrar este episodio?</h3>
                        <p className="mb-5 text-sm text-[#746A5C]">
                            Esta acción es <strong className="text-red-600">irreversible</strong>. El episodio "<strong className="text-[#171512]">{title}</strong>" desaparecerá del perfil y de cualquier suscripción activa.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setShowDeleteConfirm(false)} disabled={isPending} className="flex-1 border border-[#171512]/12 px-4 py-2.5 text-sm font-bold text-[#574F45] transition hover:bg-[#F8F4EA]">
                                Cancelar
                            </button>
                            <button onClick={handleDelete} disabled={isPending} className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition disabled:opacity-50">
                                {isPending ? 'Borrando...' : 'Sí, borrar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

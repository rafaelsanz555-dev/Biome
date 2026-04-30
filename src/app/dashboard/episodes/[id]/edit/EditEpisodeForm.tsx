'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateEpisode, deleteEpisode } from '../../actions'
import { createClient } from '@/lib/supabase/client'
import { Trash2, ImagePlus, Eye, EyeOff, Loader2 } from 'lucide-react'

interface EditEpisodeFormProps {
    episode: any
}

export function EditEpisodeForm({ episode }: EditEpisodeFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [saved, setSaved] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Form state
    const [title, setTitle] = useState(episode.title || '')
    const [previewText, setPreviewText] = useState(episode.preview_text || '')
    const [coverUrl, setCoverUrl] = useState(episode.cover_image_url || '')
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [isPublished, setIsPublished] = useState(episode.is_published)
    const [monetization, setMonetization] = useState<'free' | 'subscription' | 'ppv'>(
        episode.is_subscription_only ? 'subscription' : episode.ppv_price ? 'ppv' : 'free'
    )
    const [ppvPrice, setPpvPrice] = useState(episode.ppv_price?.toString() || '2.99')

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
                const { error: upErr } = await supabase.storage.from('post-images').upload(fileName, coverFile)
                if (upErr) {
                    setError('Error subiendo portada: ' + upErr.message)
                    return
                }
                const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(fileName)
                finalCoverUrl = urlData.publicUrl
            }

            // Construir FormData
            const formData = new FormData()
            formData.append('title', title)
            formData.append('preview_text', previewText)
            formData.append('full_text', episode.full_text || '')
            formData.append('content_json', JSON.stringify(episode.content_json))
            formData.append('word_count', String(episode.word_count || 0))
            formData.append('reading_time_min', String(episode.reading_time_min || 1))
            formData.append('cover_image_url', finalCoverUrl || '')
            formData.append('season_id', episode.season_id || '')
            formData.append('soundtrack_url', episode.soundtrack_url || '')
            formData.append('soundtrack_title', episode.soundtrack_title || '')
            formData.append('is_published', String(isPublished))
            formData.append('monetization', monetization)
            if (monetization === 'ppv') formData.append('ppv_price', ppvPrice)

            const result = await updateEpisode(episode.id, formData)
            if (result.error) {
                setError(result.error)
            } else {
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
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-2xl border border-gray-800 bg-[#15171C] p-6 space-y-5">
                    {/* Título */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-[#0A0B0E] border border-gray-800 text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none"
                        />
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Vista previa <span className="text-gray-600 normal-case">— el gancho que ven en el feed</span>
                        </label>
                        <textarea
                            value={previewText}
                            onChange={(e) => setPreviewText(e.target.value.slice(0, 240))}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-[#0A0B0E] border border-gray-800 text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none"
                        />
                        <p className="text-[10px] text-gray-600 mt-1">{previewText.length}/240</p>
                    </div>

                    {/* Cover image */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Portada</label>
                        <label className="block aspect-video rounded-xl border-2 border-dashed border-gray-700 hover:border-blue-500/50 cursor-pointer overflow-hidden bg-[#0A0B0E]">
                            {coverUrl ? (
                                <div className="relative w-full h-full group">
                                    <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">Cambiar portada</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-blue-400 transition">
                                    <ImagePlus size={28} className="mb-2" />
                                    <span className="text-sm font-bold">Click para subir portada</span>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                        </label>
                    </div>
                </div>

                {/* Monetización */}
                <div className="rounded-2xl border border-gray-800 bg-[#15171C] p-6 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Monetización</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {(['free', 'subscription', 'ppv'] as const).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMonetization(m)}
                                className={`p-3 rounded-lg border text-sm font-bold transition ${
                                    monetization === m
                                        ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                                        : 'border-gray-800 text-gray-400 hover:border-gray-700'
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
                                className="w-32 px-3 py-2 rounded-lg bg-[#0A0B0E] border border-gray-800 text-white"
                            />
                        </div>
                    )}
                </div>

                {/* Estado de publicación */}
                <div className="rounded-2xl border border-gray-800 bg-[#15171C] p-6">
                    <button
                        type="button"
                        onClick={() => setIsPublished(!isPublished)}
                        className="w-full flex items-center justify-between gap-3 text-left"
                    >
                        <div className="flex items-center gap-3">
                            {isPublished ? <Eye className="text-blue-400" size={18} /> : <EyeOff className="text-gray-500" size={18} />}
                            <div>
                                <p className="text-sm font-bold text-white">
                                    {isPublished ? 'Publicado' : 'Borrador'}
                                </p>
                                <p className="text-[11px] text-gray-500">
                                    {isPublished ? 'Visible para todos · click para despublicar' : 'Solo tú lo ves · click para publicar'}
                                </p>
                            </div>
                        </div>
                        <div className={`w-10 h-6 rounded-full transition ${isPublished ? 'bg-blue-500' : 'bg-gray-700'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md transition mt-0.5 ${isPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                    </button>
                </div>

                {/* Errors */}
                {error && (
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-sm text-red-400">{error}</div>
                )}
                {saved && (
                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-sm text-blue-400">✓ Cambios guardados</div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex-1 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
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

                <p className="text-[11px] text-gray-600 italic text-center pt-2 border-t border-gray-800">
                    💡 Para editar el cuerpo del episodio (texto e imágenes inline), próximamente desde aquí. Por ahora puedes despublicar y crear uno nuevo si necesitas cambios profundos.
                </p>
            </form>

            {/* Delete confirm modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="w-full max-w-md bg-[#0F1114] border border-red-500/30 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-2">¿Borrar este episodio?</h3>
                        <p className="text-sm text-gray-400 mb-5">
                            Esta acción es <strong className="text-red-400">irreversible</strong>. El episodio "<strong className="text-white">{title}</strong>" desaparecerá del perfil y de cualquier suscripción activa.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setShowDeleteConfirm(false)} disabled={isPending} className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-bold transition">
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

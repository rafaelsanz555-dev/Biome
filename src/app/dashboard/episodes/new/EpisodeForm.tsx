'use client'

import { useState, useRef } from 'react'
import { createEpisode } from '../actions'
import { createClient } from '@/lib/supabase/client'
import { ImagePlus, X, Lock, DollarSign, Eye, Upload, Music, Monitor } from 'lucide-react'
import { track } from '@/lib/analytics'
import { RichEditor, RichEditorHandle } from '@/components/editor/RichEditor'
import { PreviewToggle } from '@/components/editor/PreviewToggle'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { PullQuote } from '@/components/editor/PullQuote'
import { sanitizeTipTapContent } from '@/lib/content-security'
import { WritingCoach } from '@/components/writer/WritingCoach'
import { AIAssistant } from '@/components/writer/AIAssistant'
import { SeasonPicker } from '@/components/writer/SeasonPicker'
import { LivePreview } from '@/app/dashboard/settings/LivePreview'
import { MONETIZATION_ENABLED } from '@/lib/flags'
import { AGE_RATINGS, CONTENT_WARNING_OPTIONS } from '@/lib/editorial'

interface EpisodeFormProps {
    seasons: any[]
    previewInitial?: any
    defaultSeasonId?: string
}

export default function EpisodeForm({ seasons, previewInitial, defaultSeasonId }: EpisodeFormProps) {
    const [isPending, setIsPending] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    // MVP: sin monetización todo capítulo nace gratis
    const [monetization, setMonetization] = useState<'free' | 'subscription' | 'ppv'>(MONETIZATION_ENABLED ? 'subscription' : 'free')
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    const [postImages, setPostImages] = useState<File[]>([])
    const [postImagePreviews, setPostImagePreviews] = useState<string[]>([])
    const postImagesRef = useRef<HTMLInputElement>(null)
    const editorRef = useRef<RichEditorHandle>(null)
    const [showPreview, setShowPreview] = useState(false)
    const [titleValue, setTitleValue] = useState('')
    const [previewTextValue, setPreviewTextValue] = useState('')
    const [selectedWarnings, setSelectedWarnings] = useState<string[]>([])
    const [rightsConfirmed, setRightsConfirmed] = useState(false)
    const [acceptPublishTerms, setAcceptPublishTerms] = useState(false)
    const [editorState, setEditorState] = useState<{ json: any; text: string; wordCount: number; readingTimeMin: number }>({ json: null, text: '', wordCount: 0, readingTimeMin: 1 })

    const MAX_IMAGE_MB = 5

    function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null
        if (file && file.size > MAX_IMAGE_MB * 1024 * 1024) {
            setErrorMsg(`La portada pesa más de ${MAX_IMAGE_MB}MB. Comprime la imagen e inténtalo de nuevo.`)
            e.target.value = ''
            return
        }
        setErrorMsg('')
        setCoverFile(file)
        setCoverPreview(file ? URL.createObjectURL(file) : null)
    }

    function handlePostImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || [])
        const tooBig = files.find((f) => f.size > MAX_IMAGE_MB * 1024 * 1024)
        if (tooBig) {
            setErrorMsg(`"${tooBig.name}" pesa más de ${MAX_IMAGE_MB}MB. Comprime la imagen e inténtalo de nuevo.`)
            e.target.value = ''
            return
        }
        setErrorMsg('')
        const combined = [...postImages, ...files].slice(0, 10)
        setPostImages(combined)
        setPostImagePreviews(combined.map(f => URL.createObjectURL(f)))
    }

    function removePostImage(index: number) {
        const updated = postImages.filter((_, i) => i !== index)
        setPostImages(updated)
        setPostImagePreviews(updated.map(f => URL.createObjectURL(f)))
    }

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        setErrorMsg('')
        const supabase = createClient()

        // El botón presionado define si es publicación o borrador
        const publishing = formData.get('intent') !== 'draft'
        formData.set('is_published', publishing ? 'true' : 'false')

        // Pull data from rich editor
        const editorJson = editorRef.current?.getJSON() || editorState.json
        const editorText = editorRef.current?.getText() || editorState.text
        const wordCount = editorRef.current?.getWordCount() || editorState.wordCount
        const readingTime = editorRef.current?.getReadingTime() || editorState.readingTimeMin

        // Validación en cliente — espejo de las reglas del servidor para que
        // el error aparezca al instante y diga exactamente qué falta
        const title = (formData.get('title') as string || '').trim()
        if (!title) {
            setErrorMsg('Ponle un título a tu episodio antes de continuar.')
            setIsPending(false)
            return
        }
        if (title.length > 160) {
            setErrorMsg('El título es demasiado largo (máximo 160 caracteres).')
            setIsPending(false)
            return
        }
        if (!editorText || editorText.trim().length === 0) {
            setErrorMsg('Tu historia está vacía. Escribe algo antes de guardar.')
            setIsPending(false)
            return
        }
        if (publishing && wordCount < 30) {
            setErrorMsg(`Para publicar necesitas al menos 30 palabras (llevas ${wordCount}). Usa "Guardar borrador" si aún no terminas.`)
            setIsPending(false)
            return
        }
        if (publishing && monetization === 'ppv') {
            const price = parseFloat((formData.get('ppv_price') as string) || '')
            if (!price || price < 0.99 || price > 999.99) {
                setErrorMsg('El precio de desbloqueo debe estar entre $0.99 y $999.99.')
                setIsPending(false)
                return
            }
        }
        if (publishing && !rightsConfirmed) {
            setErrorMsg('Confirma que tienes los derechos para publicar este contenido.')
            setIsPending(false)
            return
        }
        if (publishing && !acceptPublishTerms) {
            setErrorMsg('Acepta la Política de Contenido y los Términos para Creadores antes de publicar.')
            setIsPending(false)
            return
        }

        formData.set('full_text', editorText)
        formData.set('content_json', JSON.stringify(editorJson))
        formData.set('word_count', String(wordCount))
        formData.set('reading_time_min', String(readingTime))
        formData.set('content_warnings', JSON.stringify(selectedWarnings))

        if (coverFile) {
            const ext = coverFile.name.split('.').pop()
            const fileName = `cover_${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`
            const { error: uploadError } = await supabase.storage.from('episodes').upload(fileName, coverFile)
            if (uploadError) {
                setErrorMsg('Error al subir la portada: ' + uploadError.message)
                setIsPending(false)
                return
            }
            const { data: urlData } = supabase.storage.from('episodes').getPublicUrl(fileName)
            formData.append('cover_image_url', urlData.publicUrl)
        }

        if (postImages.length > 0) {
            const imageUrls: string[] = []
            for (const file of postImages) {
                const ext = file.name.split('.').pop()
                const fileName = `post_${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`
                const { error: uploadError } = await supabase.storage.from('episodes').upload(fileName, file)
                if (uploadError) {
                    setErrorMsg('Error al subir imagen: ' + uploadError.message)
                    setIsPending(false)
                    return
                }
                const { data: urlData } = supabase.storage.from('episodes').getPublicUrl(fileName)
                imageUrls.push(urlData.publicUrl)
            }
            formData.append('images', JSON.stringify(imageUrls))
        }

        // Track antes del server action (el action puede redirect)
        track(publishing ? 'episode_published' : 'episode_draft_saved', {
            title_length: title.length,
            word_count: wordCount,
            reading_time_min: readingTime,
            monetization: formData.get('monetization') as string,
            has_cover: !!coverFile,
            has_soundtrack: !!formData.get('soundtrack_url'),
            post_images_count: postImages.length,
        })

        const res = await createEpisode(formData)
        if (res?.error) {
            setErrorMsg(res.error)
            setIsPending(false)
        }
    }

    const inputCls = "w-full border border-[#171512]/15 bg-[#FFFCF5] text-[#171512] placeholder:text-[#9A9082] focus:border-[#A63D2D]/55 focus:ring-1 focus:ring-[#A63D2D] focus:outline-none transition"

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Main Content ── */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="overflow-hidden border border-[#171512]/12 bg-[#F8F4EA]">
                        <div className="p-6 space-y-6">

                            {/* Title */}
                            <div className="space-y-2">
                                <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-[#746A5C]">
                                    Título del episodio
                                </label>
                                <input
                                    id="title"
                                    name="title"
                                    required
                                    value={titleValue}
                                    onChange={(e) => setTitleValue(e.target.value)}
                                    placeholder="ej. La noche que todo cambió..."
                                    className={`${inputCls} text-2xl font-bold px-4 py-4`}
                                />
                            </div>

                            {/* Cover */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#746A5C]">
                                    Imagen de portada <span className="normal-case font-medium text-gray-600 ml-1">· opcional</span>
                                </label>
                                <p className="text-[11px] text-gray-500 leading-relaxed">
                                    Recomendado: <span className="text-gray-300 font-mono">1200×630px</span> (proporción 16:9). Otras medidas serán recortadas al centro.
                                </p>
                                {coverPreview ? (
                                    <div className="relative h-52 w-full overflow-hidden border border-[#171512]/12">
                                        <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                                            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="cover_image"
                                        className="group flex h-32 w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[#171512]/20 bg-[#EEE5D5] transition hover:border-[#A63D2D]/40 hover:bg-[#E8DECC]"
                                    >
                                        <ImagePlus size={24} className="text-gray-500 group-hover:text-[#C9A84C] transition mb-1.5" />
                                        <span className="text-sm font-semibold text-gray-400 group-hover:text-white transition">Haz clic para agregar portada</span>
                                        <span className="text-xs text-gray-600 mt-0.5">JPG, PNG · 1200×630px ideal · hasta 5MB</span>
                                    </label>
                                )}
                                <input id="cover_image" type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                            </div>

                            {/* Preview */}
                            <div className="space-y-2">
                                <label htmlFor="preview_text" className="block text-xs font-bold uppercase tracking-wider text-[#746A5C]">
                                    Adelanto gratis <span className="normal-case font-medium text-[#C9A84C] ml-1">· visible para todos</span>
                                </label>
                                <textarea
                                    id="preview_text"
                                    name="preview_text"
                                    rows={3}
                                    value={previewTextValue}
                                    onChange={(e) => setPreviewTextValue(e.target.value)}
                                    className={`${inputCls} px-4 py-3 text-base resize-none`}
                                    placeholder="El gancho: una frase que haga que el lector quiera seguir contigo..."
                                />
                            </div>

                            {/* Full text — Rich Editor */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#746A5C]">
                                        Tu historia
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowPreview(true)}
                                            className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-md bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition uppercase tracking-wider"
                                        >
                                            <Monitor size={11} /> Vista previa
                                        </button>
                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md bg-[#C9A84C]/10 text-[#D8BA63] border border-[#C9A84C]/20 uppercase tracking-wider">
                                            <Lock size={10} /> {monetization === 'free' ? 'Pública' : monetization === 'subscription' ? 'Solo suscriptores' : 'Pago único'}
                                        </span>
                                    </div>
                                </div>
                                <RichEditor
                                    ref={editorRef}
                                    onChange={(data) => setEditorState(data)}
                                />
                            </div>

                            {/* Chapter Soundtrack */}
                            <div className="space-y-2 border-t border-[#171512]/10 pt-5">
                                <label htmlFor="soundtrack_url" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                                    <Music size={12} className="text-[#C9A84C]" />
                                    Banda sonora <span className="normal-case font-medium text-[#C9A84C] ml-1">· nuevo en Pergamo</span>
                                </label>
                                <p className="text-xs text-gray-500 -mt-1">
                                    Agrega la canción que acompaña este capítulo. Los lectores la escuchan mientras te leen.
                                </p>
                                <input
                                    id="soundtrack_url"
                                    name="soundtrack_url"
                                    type="url"
                                    placeholder="Pega un link de Spotify o YouTube..."
                                    className={`${inputCls} px-4 py-3 text-sm`}
                                />
                                <input
                                    id="soundtrack_title"
                                    name="soundtrack_title"
                                    type="text"
                                    placeholder="Nombre de la canción (opcional)"
                                    className={`${inputCls} px-4 py-2.5 text-sm`}
                                />
                            </div>

                            {/* Post images */}
                            <div className="space-y-3 border-t border-[#171512]/10 pt-5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Fotos del post <span className="normal-case font-medium text-gray-600 ml-1">· hasta 10</span>
                                    </label>
                                    {postImagePreviews.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => postImagesRef.current?.click()}
                                            className="text-xs font-bold text-[#C9A84C] hover:text-[#D8BA63] transition flex items-center gap-1"
                                        >
                                            <Upload size={12} /> Agregar más
                                        </button>
                                    )}
                                </div>

                                <input
                                    ref={postImagesRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePostImagesChange}
                                    className="hidden"
                                />

                                {postImagePreviews.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {postImagePreviews.map((src, i) => (
                                            <div key={i} className="group relative aspect-square overflow-hidden border border-[#171512]/12">
                                                <img src={src} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removePostImage(i)}
                                                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {postImages.length < 10 && (
                                            <button
                                                type="button"
                                                onClick={() => postImagesRef.current?.click()}
                                                className="flex aspect-square items-center justify-center border-2 border-dashed border-[#171512]/20 bg-[#EEE5D5] text-[#8A8174] transition hover:border-[#A63D2D]/40 hover:text-[#A63D2D]"
                                            >
                                                <ImagePlus size={20} />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => postImagesRef.current?.click()}
                                        className="flex h-24 w-full flex-col items-center justify-center gap-1.5 border-2 border-dashed border-[#171512]/20 bg-[#EEE5D5] text-[#8A8174] transition hover:border-[#A63D2D]/40 hover:text-[#A63D2D]"
                                    >
                                        <ImagePlus size={20} />
                                        <span className="text-xs font-semibold">Agregar fotos</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Sidebar ── */}
                <div className="space-y-4">
                    <div className="sticky top-4 space-y-5 border border-[#171512]/12 bg-[#EEE5D5] p-5">

                        {/* Season — picker custom con creación inline (sin abrir otra pestaña) */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#746A5C]">
                                ¿Qué estás publicando?
                            </label>
                            <SeasonPicker
                                name="season_id"
                                initialSeasons={seasons || []}
                                initialValue={defaultSeasonId}
                                inputClassName={inputCls}
                            />
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                Una <strong className="text-[#171512]">entrada</strong> vive sola en el feed. Un <strong className="text-[#171512]">capítulo</strong> siempre pertenece a una historia, novela o diario serial.
                            </p>
                        </div>

                        {/* Monetization — oculto en el MVP (todo se publica gratis) */}
                        {MONETIZATION_ENABLED && (
                        <div className="space-y-2 border-t border-[#171512]/10 pt-5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                                Acceso y precio
                            </label>

                            <label className={`flex cursor-pointer items-start gap-3 border p-3.5 transition ${monetization === 'free' ? 'border-[#A63D2D]/50 bg-[#A63D2D]/5' : 'border-[#171512]/12 bg-[#FFFCF5] hover:border-[#171512]/30'}`}>
                                <input type="radio" name="monetization" value="free" checked={monetization === 'free'} onChange={() => setMonetization('free')} className="mt-0.5 accent-[#C9A84C]" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-sm font-bold text-[#171512]">
                                        <Eye size={13} /> Gratis para todos
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">Cualquiera puede leer</p>
                                </div>
                            </label>

                            <label className={`flex cursor-pointer items-start gap-3 border p-3.5 transition ${monetization === 'subscription' ? 'border-[#A63D2D]/50 bg-[#A63D2D]/5' : 'border-[#171512]/12 bg-[#FFFCF5] hover:border-[#171512]/30'}`}>
                                <input type="radio" name="monetization" value="subscription" checked={monetization === 'subscription'} onChange={() => setMonetization('subscription')} className="mt-0.5 accent-[#C9A84C]" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-sm font-bold text-[#171512]">
                                        <Lock size={13} /> Solo suscriptores
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">Debe estar suscrito para leer</p>
                                </div>
                            </label>

                            <label className={`flex cursor-pointer items-start gap-3 border p-3.5 transition ${monetization === 'ppv' ? 'border-[#A63D2D]/50 bg-[#A63D2D]/5' : 'border-[#171512]/12 bg-[#FFFCF5] hover:border-[#171512]/30'}`}>
                                <input type="radio" name="monetization" value="ppv" checked={monetization === 'ppv'} onChange={() => setMonetization('ppv')} className="mt-0.5 accent-[#C9A84C]" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-sm font-bold text-[#171512]">
                                        <DollarSign size={13} /> Pago único
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">Desbloqueo por un precio</p>
                                    {monetization === 'ppv' && (
                                        <div className="mt-2.5 relative">
                                            <span className="absolute left-3 top-2.5 font-bold text-sm text-gray-400">$</span>
                                            <input
                                                type="number"
                                                name="ppv_price"
                                                step="0.01"
                                                min="0.99"
                                                max="999.99"
                                                defaultValue="1.99"
                                                className={`${inputCls} pl-7 pr-3 py-2 text-sm font-bold`}
                                            />
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                        )}

                        <div className="space-y-4 border-t border-[#171512]/10 pt-5">
                            <div>
                                <label htmlFor="age_rating" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                                    Clasificación por edad
                                </label>
                                <select id="age_rating" name="age_rating" defaultValue="all" className={`${inputCls} px-3 py-2.5 text-sm`}>
                                    {AGE_RATINGS.map((rating) => (
                                        <option key={rating} value={rating}>{rating === 'all' ? 'Para todos' : `${rating} años`}</option>
                                    ))}
                                </select>
                            </div>

                            <fieldset>
                                <legend className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Avisos de contenido</legend>
                                <div className="grid grid-cols-2 gap-2">
                                    {CONTENT_WARNING_OPTIONS.map((warning) => {
                                        const checked = selectedWarnings.includes(warning.value)
                                        return (
                                            <label key={warning.value} className={`flex items-center gap-2 border px-2.5 py-2 text-[11px] font-semibold transition ${checked ? 'border-[#A63D2D]/35 bg-[#A63D2D]/6 text-[#A63D2D]' : 'border-[#171512]/12 text-[#746A5C]'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => setSelectedWarnings((current) => checked ? current.filter((item) => item !== warning.value) : [...current, warning.value])}
                                                    className="accent-[#C9A84C]"
                                                />
                                                {warning.label}
                                            </label>
                                        )
                                    })}
                                </div>
                            </fieldset>
                        </div>

                        <div className="space-y-3 border-t border-[#171512]/10 pt-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#746A5C]">Antes de publicar</p>
                            <label className="flex items-start gap-2.5 text-xs leading-5 text-[#574F45]">
                                <input type="checkbox" name="rights_confirmed" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)} className="mt-1 accent-[#C9A84C]" />
                                <span>Confirmo que este contenido es mío o que tengo autorización para publicarlo.</span>
                            </label>
                            <label className="flex items-start gap-2.5 text-xs leading-5 text-[#574F45]">
                                <input type="checkbox" name="accept_publish_terms" checked={acceptPublishTerms} onChange={(event) => setAcceptPublishTerms(event.target.checked)} className="mt-1 accent-[#C9A84C]" />
                                <span>Acepto la <a href="/legal/content-policy" target="_blank" className="font-bold text-[#A63D2D] hover:underline">Política de Contenido</a> y los <a href="/legal/creator-terms" target="_blank" className="font-bold text-[#A63D2D] hover:underline">Términos para Creadores</a> vigentes.</span>
                            </label>
                            <p className="text-[10px] leading-4 text-gray-600">Solo se exige al publicar. Puedes guardar un borrador sin aceptar todavía.</p>
                        </div>

                        {/* Error */}
                        {errorMsg && (
                            <div className="text-sm font-medium p-3 rounded-xl text-red-400 bg-red-500/10 border border-red-500/20">
                                {errorMsg}
                            </div>
                        )}

                        {/* Submit — publicar o guardar borrador */}
                        <div className="space-y-2 border-t border-[#171512]/10 pt-4">
                            <button
                                type="submit"
                                name="intent"
                                value="publish"
                                disabled={isPending}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#A63D2D] font-bold text-white transition hover:bg-[#873023] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isPending ? (
                                    <>
                                        <span className="w-4 h-4 border-2 rounded-full animate-spin border-white/30 border-t-white" />
                                        Guardando...
                                    </>
                                ) : 'Publicar →'}
                            </button>
                            <button
                                type="submit"
                                name="intent"
                                value="draft"
                                disabled={isPending}
                                className="h-11 w-full rounded-full border border-[#171512]/20 bg-transparent font-bold text-[#574F45] transition hover:border-[#A63D2D]/50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Guardar borrador
                            </button>
                            <p className="text-[10px] text-gray-600 text-center pt-1">
                                El primer capítulo de cada historia se publica gratis — es el gancho para tus lectores.
                            </p>
                        </div>
                    </div>

                    {/* Live Preview en el Sidebar */}
                    <div className="hidden lg:block mt-6">
                        <LivePreview initial={previewInitial} />
                    </div>
                </div>
            </div>

            {/* Preview modal */}
            {showPreview && (
                <PreviewToggle
                    title={titleValue}
                    previewText={previewTextValue}
                    coverUrl={coverPreview}
                    contentHtml={renderPreviewHtml(editorState.json)}
                    readMinutes={editorState.readingTimeMin}
                    wordCount={editorState.wordCount}
                    onClose={() => setShowPreview(false)}
                />
            )}

            {/* Writer studio sidekicks (Round 3 + 4) */}
            <WritingCoach
                title={titleValue}
                previewText={previewTextValue}
                wordCount={editorState.wordCount}
            />
            <AIAssistant
                getText={() => editorRef.current?.getText() || editorState.text}
                onChooseTitle={(t) => setTitleValue(t)}
            />
        </form>
    )
}

// Helper to render TipTap JSON → HTML for the preview modal
function renderPreviewHtml(json: any): string {
    const safeJson = sanitizeTipTapContent(json)
    if (!safeJson) return ''
    try {
        return generateHTML(safeJson, [
            StarterKit.configure({ heading: { levels: [2, 3] }, codeBlock: false, code: false }),
            Image,
            Link,
            PullQuote,
        ])
    } catch {
        return ''
    }
}

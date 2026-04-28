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
import { WritingCoach } from '@/components/writer/WritingCoach'
import { AIAssistant } from '@/components/writer/AIAssistant'

interface EpisodeFormProps {
    seasons: any[]
}

export default function EpisodeForm({ seasons }: EpisodeFormProps) {
    const [isPending, setIsPending] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [monetization, setMonetization] = useState<'free' | 'subscription' | 'ppv'>('subscription')
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    const [postImages, setPostImages] = useState<File[]>([])
    const [postImagePreviews, setPostImagePreviews] = useState<string[]>([])
    const postImagesRef = useRef<HTMLInputElement>(null)
    const editorRef = useRef<RichEditorHandle>(null)
    const [showPreview, setShowPreview] = useState(false)
    const [titleValue, setTitleValue] = useState('')
    const [previewTextValue, setPreviewTextValue] = useState('')
    const [editorState, setEditorState] = useState<{ json: any; text: string; wordCount: number; readingTimeMin: number }>({ json: null, text: '', wordCount: 0, readingTimeMin: 1 })

    function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null
        setCoverFile(file)
        setCoverPreview(file ? URL.createObjectURL(file) : null)
    }

    function handlePostImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || [])
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

        // Pull data from rich editor
        const editorJson = editorRef.current?.getJSON() || editorState.json
        const editorText = editorRef.current?.getText() || editorState.text
        const wordCount = editorRef.current?.getWordCount() || editorState.wordCount
        const readingTime = editorRef.current?.getReadingTime() || editorState.readingTimeMin

        if (!editorText || editorText.trim().length < 10) {
            setErrorMsg('Escribe al menos algunos párrafos de tu historia antes de publicar.')
            setIsPending(false)
            return
        }

        formData.set('full_text', editorText)
        formData.set('content_json', JSON.stringify(editorJson))
        formData.set('word_count', String(wordCount))
        formData.set('reading_time_min', String(readingTime))

        if (coverFile) {
            const ext = coverFile.name.split('.').pop()
            const fileName = `cover_${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`
            const { error: uploadError } = await supabase.storage.from('post-images').upload(fileName, coverFile)
            if (uploadError) {
                setErrorMsg('Error al subir la portada: ' + uploadError.message)
                setIsPending(false)
                return
            }
            const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(fileName)
            formData.append('cover_image_url', urlData.publicUrl)
        }

        if (postImages.length > 0) {
            const imageUrls: string[] = []
            for (const file of postImages) {
                const ext = file.name.split('.').pop()
                const fileName = `post_${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`
                const { error: uploadError } = await supabase.storage.from('post-images').upload(fileName, file)
                if (uploadError) {
                    setErrorMsg('Error al subir imagen: ' + uploadError.message)
                    setIsPending(false)
                    return
                }
                const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(fileName)
                imageUrls.push(urlData.publicUrl)
            }
            formData.append('images', JSON.stringify(imageUrls))
        }

        // Track antes del server action (el action puede redirect)
        const title = formData.get('title') as string
        const monetization = formData.get('monetization') as string
        track('episode_published', {
            title_length: title?.length || 0,
            word_count: wordCount,
            reading_time_min: readingTime,
            monetization,
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

    const inputCls = "w-full rounded-xl border border-gray-800 bg-[#15171C] text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Main Content ── */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="rounded-2xl border border-gray-800 bg-[#15171C] overflow-hidden">
                        <div className="p-6 space-y-6">

                            {/* Title */}
                            <div className="space-y-2">
                                <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-gray-400">
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
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Imagen de portada <span className="normal-case font-medium text-gray-600 ml-1">· opcional</span>
                                </label>
                                {coverPreview ? (
                                    <div className="relative w-full h-52 rounded-xl overflow-hidden border border-gray-800">
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
                                        className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-gray-700 bg-[#0A0B0E] hover:border-blue-500/50 hover:bg-[#101217] cursor-pointer transition group"
                                    >
                                        <ImagePlus size={24} className="text-gray-500 group-hover:text-blue-500 transition mb-1.5" />
                                        <span className="text-sm font-semibold text-gray-400 group-hover:text-white transition">Haz clic para agregar portada</span>
                                        <span className="text-xs text-gray-600 mt-0.5">JPG, PNG — hasta 5MB</span>
                                    </label>
                                )}
                                <input id="cover_image" type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                            </div>

                            {/* Preview */}
                            <div className="space-y-2">
                                <label htmlFor="preview_text" className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Adelanto gratis <span className="normal-case font-medium text-blue-500 ml-1">· visible para todos</span>
                                </label>
                                <textarea
                                    id="preview_text"
                                    name="preview_text"
                                    rows={3}
                                    value={previewTextValue}
                                    onChange={(e) => setPreviewTextValue(e.target.value)}
                                    className={`${inputCls} px-4 py-3 text-base resize-none`}
                                    placeholder="El gancho. Algo que los enganche para que paguen por seguir leyendo..."
                                />
                            </div>

                            {/* Full text — Rich Editor */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
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
                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
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
                            <div className="space-y-2 border-t border-gray-800 pt-5">
                                <label htmlFor="soundtrack_url" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                                    <Music size={12} className="text-blue-500" />
                                    Banda sonora <span className="normal-case font-medium text-blue-500 ml-1">· nuevo en bio.me</span>
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
                            <div className="space-y-3 border-t border-gray-800 pt-5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Fotos del post <span className="normal-case font-medium text-gray-600 ml-1">· hasta 10</span>
                                    </label>
                                    {postImagePreviews.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => postImagesRef.current?.click()}
                                            className="text-xs font-bold text-blue-500 hover:text-blue-400 transition flex items-center gap-1"
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
                                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-800 group">
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
                                                className="aspect-square rounded-xl border-2 border-dashed border-gray-700 bg-[#0A0B0E] hover:border-blue-500/50 flex items-center justify-center text-gray-500 hover:text-blue-500 transition"
                                            >
                                                <ImagePlus size={20} />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => postImagesRef.current?.click()}
                                        className="w-full h-24 rounded-xl border-2 border-dashed border-gray-700 bg-[#0A0B0E] hover:border-blue-500/50 flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:text-blue-500 transition"
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
                    <div className="rounded-2xl border border-gray-800 bg-[#15171C] p-5 sticky top-4 space-y-5">

                        {/* Season */}
                        <div className="space-y-2">
                            <label htmlFor="season_id" className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                Serie / Temporada
                            </label>
                            <select
                                id="season_id"
                                name="season_id"
                                className={`${inputCls} px-3 py-2.5 text-sm`}
                            >
                                <option value="" className="bg-[#15171C]">Sin serie — episodio independiente</option>
                                {seasons?.map(s => (
                                    <option key={s.id} value={s.id} className="bg-[#15171C]">{s.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Monetization */}
                        <div className="space-y-2 border-t border-gray-800 pt-5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                                Acceso y precio
                            </label>

                            <label className={`flex items-start gap-3 cursor-pointer rounded-xl border-2 p-3.5 transition ${monetization === 'free' ? 'border-blue-500/60 bg-blue-500/5' : 'border-gray-800 bg-[#0A0B0E] hover:border-gray-700'}`}>
                                <input type="radio" name="monetization" value="free" checked={monetization === 'free'} onChange={() => setMonetization('free')} className="mt-0.5 accent-blue-500" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 font-bold text-sm text-white">
                                        <Eye size={13} /> Gratis para todos
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">Cualquiera puede leer</p>
                                </div>
                            </label>

                            <label className={`flex items-start gap-3 cursor-pointer rounded-xl border-2 p-3.5 transition ${monetization === 'subscription' ? 'border-blue-500/60 bg-blue-500/5' : 'border-gray-800 bg-[#0A0B0E] hover:border-gray-700'}`}>
                                <input type="radio" name="monetization" value="subscription" checked={monetization === 'subscription'} onChange={() => setMonetization('subscription')} className="mt-0.5 accent-blue-500" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 font-bold text-sm text-white">
                                        <Lock size={13} /> Solo suscriptores
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">Debe estar suscrito para leer</p>
                                </div>
                            </label>

                            <label className={`flex items-start gap-3 cursor-pointer rounded-xl border-2 p-3.5 transition ${monetization === 'ppv' ? 'border-blue-500/60 bg-blue-500/5' : 'border-gray-800 bg-[#0A0B0E] hover:border-gray-700'}`}>
                                <input type="radio" name="monetization" value="ppv" checked={monetization === 'ppv'} onChange={() => setMonetization('ppv')} className="mt-0.5 accent-blue-500" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 font-bold text-sm text-white">
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
                                                max="99.99"
                                                defaultValue="1.99"
                                                className={`${inputCls} pl-7 pr-3 py-2 text-sm font-bold`}
                                            />
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* Error */}
                        {errorMsg && (
                            <div className="text-sm font-medium p-3 rounded-xl text-red-400 bg-red-500/10 border border-red-500/20">
                                {errorMsg}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="border-t border-gray-800 pt-4">
                            <input type="hidden" name="is_published" value="true" />
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full font-bold h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <span className="w-4 h-4 border-2 rounded-full animate-spin border-white/30 border-t-white" />
                                        Publicando...
                                    </>
                                ) : 'Publicar episodio →'}
                            </button>
                            <p className="text-[10px] text-gray-600 text-center mt-2">
                                Tu primer capítulo siempre es gratis para todos
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview modal */}
            {showPreview && (
                <PreviewToggle
                    title={titleValue}
                    previewText={previewTextValue}
                    coverUrl={coverPreview}
                    contentHtml={renderPreviewHtml(editorRef.current?.getJSON() || editorState.json)}
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
    if (!json) return ''
    try {
        return generateHTML(json, [
            StarterKit.configure({ heading: { levels: [2, 3] }, codeBlock: false, code: false }),
            Image,
            Link,
            PullQuote,
        ])
    } catch {
        return ''
    }
}

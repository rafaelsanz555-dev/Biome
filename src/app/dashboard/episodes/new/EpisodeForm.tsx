'use client'

import { useState, useRef } from 'react'
import { createEpisode } from '../actions'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

    function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null
        setCoverFile(file)
        if (file) {
            setCoverPreview(URL.createObjectURL(file))
        } else {
            setCoverPreview(null)
        }
    }

    function handlePostImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || [])
        const combined = [...postImages, ...files].slice(0, 10) // max 10 images
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

        // Upload cover image
        if (coverFile) {
            const ext = coverFile.name.split('.').pop()
            const fileName = `cover_${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`
            const { error: uploadError } = await supabase.storage
                .from('post-images')
                .upload(fileName, coverFile)

            if (uploadError) {
                setErrorMsg('Error al subir la imagen de portada: ' + uploadError.message)
                setIsPending(false)
                return
            }

            const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(fileName)
            formData.append('cover_image_url', urlData.publicUrl)
        }

        // Upload inline post images
        if (postImages.length > 0) {
            const imageUrls: string[] = []
            for (const file of postImages) {
                const ext = file.name.split('.').pop()
                const fileName = `post_${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`
                const { error: uploadError } = await supabase.storage
                    .from('post-images')
                    .upload(fileName, file)

                if (uploadError) {
                    setErrorMsg('Error al subir la imagen: ' + uploadError.message)
                    setIsPending(false)
                    return
                }

                const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(fileName)
                imageUrls.push(urlData.publicUrl)
            }
            // Pass as JSON string since we can't do arrays in FormData easily
            formData.append('images', JSON.stringify(imageUrls))
        }

        const res = await createEpisode(formData)
        if (res?.error) {
            setErrorMsg(res.error)
            setIsPending(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* ── Contenido principal ── */}
                <div className="md:col-span-2 space-y-5">
                    <div
                        className="rounded-2xl border overflow-hidden"
                        style={{ background: '#ffffff', borderColor: 'var(--cream-mid)' }}
                    >
                        <div className="p-6 space-y-6">

                            {/* Título */}
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="title"
                                    className="text-base font-bold"
                                    style={{ color: 'var(--ink)' }}
                                >
                                    Título del episodio
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    required
                                    placeholder="ej. La noche que todo cambió..."
                                    className="text-xl h-14 border font-serif placeholder:font-sans focus-visible:ring-2"
                                    style={{
                                        background: 'var(--cream)',
                                        borderColor: 'var(--cream-mid)',
                                        color: 'var(--ink)',
                                        // @ts-ignore
                                        '--tw-ring-color': 'var(--gold)',
                                    }}
                                />
                            </div>

                            {/* Imagen de portada */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="cover_image"
                                    className="font-medium"
                                    style={{ color: 'var(--ink-mid)' }}
                                >
                                    Imagen de portada{' '}
                                    <span className="text-xs font-normal" style={{ color: 'var(--ink-light)' }}>
                                        (opcional — se muestra como miniatura)
                                    </span>
                                </Label>
                                {coverPreview ? (
                                    <div
                                        className="relative w-full h-44 rounded-xl overflow-hidden border mb-2"
                                        style={{ borderColor: 'var(--cream-mid)' }}
                                    >
                                        <img src={coverPreview} alt="Vista previa de portada" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                                            className="absolute top-2 right-2 rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-sm transition-colors"
                                            style={{ background: '#ffffff', border: '1px solid var(--cream-mid)', color: 'var(--ink-light)' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="cover_image"
                                        className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed cursor-pointer transition-colors"
                                        style={{ background: 'var(--cream-dark)', borderColor: 'var(--cream-mid)' }}
                                    >
                                        <span className="text-2xl mb-1" style={{ color: 'var(--ink-light)' }}>◫</span>
                                        <span className="text-xs font-medium" style={{ color: 'var(--ink-light)' }}>
                                            Haz clic para agregar una imagen de portada
                                        </span>
                                    </label>
                                )}
                                <Input
                                    id="cover_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverChange}
                                    className={`border h-auto py-2 cursor-pointer ${coverPreview ? '' : 'hidden'}`}
                                    style={{
                                        background: 'var(--cream)',
                                        borderColor: 'var(--cream-mid)',
                                        color: 'var(--ink-light)',
                                    }}
                                />
                            </div>

                            {/* Texto de vista previa */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="preview_text"
                                        className="font-medium"
                                        style={{ color: 'var(--ink-mid)' }}
                                    >
                                        Texto de vista previa{' '}
                                        <span className="text-xs font-normal" style={{ color: 'var(--ink-light)' }}>
                                            (gratis para todos)
                                        </span>
                                    </Label>
                                </div>
                                <textarea
                                    id="preview_text"
                                    name="preview_text"
                                    rows={3}
                                    className="w-full rounded-lg border p-3 text-sm resize-none transition-shadow focus:outline-none focus:ring-2"
                                    style={{
                                        background: 'var(--cream)',
                                        borderColor: 'var(--cream-mid)',
                                        color: 'var(--ink)',
                                        // @ts-ignore
                                        '--tw-ring-color': 'var(--gold)',
                                    }}
                                    placeholder="Un adelanto para enganchar a tus lectores — mantenlo emocionante..."
                                />
                            </div>

                            {/* Historia completa */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="full_text"
                                        className="text-base font-bold"
                                        style={{ color: 'var(--ink)' }}
                                    >
                                        Tu historia
                                    </Label>
                                    <span
                                        className="text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1"
                                        style={{ background: 'var(--ink)', color: 'var(--cream)' }}
                                    >
                                        &#9679; Solo suscriptores
                                    </span>
                                </div>
                                <textarea
                                    id="full_text"
                                    name="full_text"
                                    required
                                    rows={16}
                                    className="w-full rounded-lg border p-4 text-sm leading-relaxed resize-y transition-shadow focus:outline-none focus:ring-2"
                                    style={{
                                        background: 'var(--cream)',
                                        borderColor: 'var(--cream-mid)',
                                        color: 'var(--ink)',
                                        // @ts-ignore
                                        '--tw-ring-color': 'var(--gold)',
                                    }}
                                    placeholder="Escribe tu historia aquí... Vacíate por completo. Tus lectores están esperando."
                                />
                            </div>

                            {/* Fotos del post (imágenes en línea) */}
                            <div
                                className="space-y-3 border-t pt-5"
                                style={{ borderColor: 'var(--cream-mid)' }}
                            >
                                <div className="flex items-center justify-between">
                                    <Label
                                        className="font-medium"
                                        style={{ color: 'var(--ink-mid)' }}
                                    >
                                        Fotos del post{' '}
                                        <span className="text-xs font-normal" style={{ color: 'var(--ink-light)' }}>
                                            (hasta 10 imágenes mostradas en tu post)
                                        </span>
                                    </Label>
                                    <button
                                        type="button"
                                        onClick={() => postImagesRef.current?.click()}
                                        className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                        style={{ background: 'var(--gold-bg)', color: 'var(--gold-dark)' }}
                                    >
                                        ◫ Agregar fotos
                                    </button>
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
                                            <div
                                                key={i}
                                                className="relative aspect-square rounded-lg overflow-hidden border group"
                                                style={{ borderColor: 'var(--cream-mid)', background: 'var(--cream-dark)' }}
                                            >
                                                <img src={src} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removePostImage(i)}
                                                    className="absolute top-1 right-1 rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                    style={{ background: '#ffffff', border: '1px solid var(--cream-mid)', color: 'var(--ink-light)' }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        {postImages.length < 10 && (
                                            <button
                                                type="button"
                                                onClick={() => postImagesRef.current?.click()}
                                                className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center text-2xl transition-colors"
                                                style={{ borderColor: 'var(--cream-mid)', color: 'var(--ink-light)' }}
                                            >
                                                +
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => postImagesRef.current?.click()}
                                        className="w-full h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors"
                                        style={{ borderColor: 'var(--cream-mid)', color: 'var(--ink-light)' }}
                                    >
                                        <span className="text-2xl">◫</span>
                                        <span className="text-xs font-medium">Haz clic para agregar fotos</span>
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                {/* ── Panel lateral ── */}
                <div className="md:col-span-1 space-y-4">
                    <div
                        className="rounded-2xl border shadow-sm sticky top-24"
                        style={{ background: '#ffffff', borderColor: 'var(--cream-mid)' }}
                    >
                        <div className="p-5 space-y-5">

                            {/* Serie */}
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="season_id"
                                    className="text-sm font-bold"
                                    style={{ color: 'var(--ink-mid)' }}
                                >
                                    Temporada / Serie
                                </Label>
                                <select
                                    id="season_id"
                                    name="season_id"
                                    className="w-full h-10 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-shadow"
                                    style={{
                                        background: 'var(--cream)',
                                        borderColor: 'var(--cream-mid)',
                                        color: 'var(--ink)',
                                        // @ts-ignore
                                        '--tw-ring-color': 'var(--gold)',
                                    }}
                                >
                                    <option value="">Sin serie — episodio independiente</option>
                                    {seasons?.map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Monetización */}
                            <div
                                className="border-t pt-4 space-y-3"
                                style={{ borderColor: 'var(--cream-mid)' }}
                            >
                                <Label
                                    className="text-sm font-bold"
                                    style={{ color: 'var(--ink)' }}
                                >
                                    Acceso y precio
                                </Label>

                                <div className="space-y-2">

                                    {/* Gratis */}
                                    <label
                                        className="flex items-start gap-3 cursor-pointer rounded-xl border p-3.5 transition-all"
                                        style={
                                            monetization === 'free'
                                                ? { background: 'var(--gold-bg)', borderColor: 'var(--gold)' }
                                                : { background: '#ffffff', borderColor: 'var(--cream-mid)' }
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="monetization"
                                            value="free"
                                            checked={monetization === 'free'}
                                            onChange={() => setMonetization('free')}
                                            className="mt-0.5"
                                            style={{ accentColor: 'var(--gold-dark)' }}
                                        />
                                        <div>
                                            <span
                                                className="font-bold text-sm block"
                                                style={{ color: 'var(--ink)' }}
                                            >
                                                Gratis para todos
                                            </span>
                                            <span className="text-xs" style={{ color: 'var(--ink-light)' }}>
                                                Cualquiera puede leer este post
                                            </span>
                                        </div>
                                    </label>

                                    {/* Solo suscriptores */}
                                    <label
                                        className="flex items-start gap-3 cursor-pointer rounded-xl border p-3.5 transition-all"
                                        style={
                                            monetization === 'subscription'
                                                ? { background: 'var(--ink)', borderColor: 'var(--ink)' }
                                                : { background: '#ffffff', borderColor: 'var(--cream-mid)' }
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="monetization"
                                            value="subscription"
                                            checked={monetization === 'subscription'}
                                            onChange={() => setMonetization('subscription')}
                                            className="mt-0.5"
                                            style={{ accentColor: 'var(--gold)' }}
                                        />
                                        <div>
                                            <span
                                                className="font-bold text-sm block"
                                                style={{ color: monetization === 'subscription' ? 'var(--cream)' : 'var(--ink)' }}
                                            >
                                                &#9679; Solo suscriptores
                                            </span>
                                            <span
                                                className="text-xs"
                                                style={{ color: monetization === 'subscription' ? 'var(--gold-warm)' : 'var(--ink-light)' }}
                                            >
                                                Debe estar suscrito para leer
                                            </span>
                                        </div>
                                    </label>

                                    {/* Pago único */}
                                    <label
                                        className="flex items-start gap-3 cursor-pointer rounded-xl border p-3.5 transition-all"
                                        style={
                                            monetization === 'ppv'
                                                ? { background: 'var(--gold-bg)', borderColor: 'var(--gold)' }
                                                : { background: '#ffffff', borderColor: 'var(--cream-mid)' }
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="monetization"
                                            value="ppv"
                                            checked={monetization === 'ppv'}
                                            onChange={() => setMonetization('ppv')}
                                            className="mt-0.5"
                                            style={{ accentColor: 'var(--gold-dark)' }}
                                        />
                                        <div className="flex-1">
                                            <span
                                                className="font-bold text-sm block"
                                                style={{ color: 'var(--ink)' }}
                                            >
                                                ◈ Pago único
                                            </span>
                                            <span className="text-xs" style={{ color: 'var(--ink-light)' }}>
                                                Precio de desbloqueo único
                                            </span>
                                            {monetization === 'ppv' && (
                                                <div className="mt-2 relative">
                                                    <span
                                                        className="absolute left-3 top-2.5 font-bold text-sm"
                                                        style={{ color: 'var(--ink-mid)' }}
                                                    >
                                                        $
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        name="ppv_price"
                                                        step="0.01"
                                                        min="0.99"
                                                        max="99.99"
                                                        defaultValue="1.99"
                                                        className="pl-6 h-9 border focus-visible:ring-2"
                                                        style={{
                                                            background: '#ffffff',
                                                            borderColor: 'var(--gold)',
                                                            color: 'var(--ink)',
                                                            // @ts-ignore
                                                            '--tw-ring-color': 'var(--gold)',
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Error */}
                            {errorMsg && (
                                <div
                                    className="text-sm font-medium p-3 rounded-lg border"
                                    style={{ color: '#92271F', background: '#FDF3F2', borderColor: '#F5C5C1' }}
                                >
                                    {errorMsg}
                                </div>
                            )}

                            {/* Publicar */}
                            <div
                                className="pt-3 border-t"
                                style={{ borderColor: 'var(--cream-mid)' }}
                            >
                                <input type="hidden" name="is_published" value="true" />
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full font-bold h-12 text-base disabled:opacity-50"
                                    style={{ background: 'var(--ink)', color: 'var(--cream)' }}
                                >
                                    {isPending ? (
                                        <span className="flex items-center gap-2">
                                            <span
                                                className="w-4 h-4 border-2 rounded-full animate-spin"
                                                style={{ borderColor: 'rgba(250,247,240,0.3)', borderTopColor: 'var(--cream)' }}
                                            />
                                            Publicando...
                                        </span>
                                    ) : 'Publicar episodio →'}
                                </Button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}

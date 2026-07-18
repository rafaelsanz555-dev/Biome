'use client'

import { useState } from 'react'
import { updateProfileSettings } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Camera, Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import { MONETIZATION_ENABLED } from '@/lib/flags'

export default function SettingsForm({ profile, creatorInfo }: { profile: any, creatorInfo: any }) {
    const [isPending, setIsPending] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.avatar_url || null)
    const router = useRouter()

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            setAvatarFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        setErrorMsg('')
        setSuccessMsg('')

        if (avatarFile) {
            const supabase = createClient()
            const fileExt = avatarFile.name.split('.').pop()
            const fileName = `${profile.id}_${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, avatarFile, { upsert: true })

            if (uploadError) {
                setErrorMsg('Error al subir la imagen: ' + uploadError.message)
                setIsPending(false)
                return
            }

            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            formData.append('avatar_url', publicUrlData.publicUrl)
        }

        const res = await updateProfileSettings(formData)

        if (res?.error) {
            setErrorMsg(res.error)
        } else {
            setSuccessMsg('Perfil actualizado correctamente.')
            router.refresh()
        }
        setIsPending(false)
    }

    const initial = (profile?.full_name || profile?.username || 'W').charAt(0).toUpperCase()

    return (
        <form action={handleSubmit} className="space-y-6">
            
            {/* Foto de Perfil */}
            <div className="border border-[#171512]/10 bg-[#FFFCF5] p-6 transition-all hover:border-[#A63D2D]/25">
                <h3 className="mb-4 font-serif text-lg font-black text-[#171512]">Foto de perfil</h3>
                <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-700 bg-gray-900 shrink-0">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-[#C9A84C] bg-[#C9A84C]/10">
                                {initial}
                            </div>
                        )}
                        <label htmlFor="avatar" className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                            <Camera size={20} className="text-white" />
                        </label>
                        <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                    <div>
                        <Label htmlFor="avatar" className="font-bold text-[#C9A84C] hover:text-[#D8BA63] cursor-pointer text-sm mb-1 inline-block">
                            Cambiar imagen
                        </Label>
                        <p className="text-xs text-gray-500">JPG, GIF o PNG. Max 2MB.</p>
                    </div>
                </div>
            </div>

            {/* Información Personal */}
            <div className="border border-[#171512]/10 bg-[#FFFCF5] p-6 transition-all hover:border-[#A63D2D]/25">
                <h3 className="mb-4 font-serif text-lg font-black text-[#171512]">Información del perfil</h3>
                
                <div className="space-y-5">
                    <div className="space-y-2 relative">
                        <Label htmlFor="full_name" className="text-sm font-bold text-[#574F45]">Nombre público</Label>
                        <Input
                            id="full_name"
                            name="full_name"
                            defaultValue={profile?.full_name || ''}
                            placeholder="Tu Nombre o Seudónimo"
                            className="h-12 border-[#171512]/15 bg-[#F8F4EA] text-[#171512] focus-visible:ring-[#A63D2D]"
                        />
                    </div>

                    <div className="space-y-2 relative">
                        <Label htmlFor="bio" className="text-sm font-bold text-[#574F45]">Biografía</Label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows={4}
                            defaultValue={profile?.bio || ''}
                            className="w-full resize-none border border-[#171512]/15 bg-[#F8F4EA] p-4 text-[#171512] outline-none transition-all placeholder:text-[#9A9082] focus-visible:ring-1 focus-visible:ring-[#A63D2D]"
                            placeholder="Cuéntale a tus fans sobre ti..."
                        />
                        <p className="text-xs text-gray-600 text-right">Visible en tu perfil público.</p>
                    </div>
                </div>
            </div>

            {/* Hidden until Stripe Connect is production-ready. */}
            {MONETIZATION_ENABLED && <div className="border border-[#171512]/10 bg-[#FFFCF5] p-6 transition-all hover:border-[#A63D2D]/25">
                <h3 className="text-lg font-bold text-white mb-4">Monetización</h3>
                
                <div className="space-y-3">
                    <Label htmlFor="subscription_price" className="text-sm font-bold text-gray-400">Precio de Suscripción Mensual ($)</Label>
                    <div className="relative max-w-sm">
                        <span className="absolute left-4 top-3 text-gray-500 font-bold">$</span>
                        <Input
                            type="number"
                            id="subscription_price"
                            name="subscription_price"
                            step="0.01"
                            min="2"
                            max="999"
                            defaultValue={creatorInfo?.subscription_price || "4.99"}
                            className="h-12 border-[#171512]/15 bg-[#F8F4EA] pl-8 font-bold text-[#171512] focus-visible:ring-[#A63D2D]"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Mínimo $2/mes. El nuevo precio aplica para suscriptores nuevos; los actuales conservan el suyo.
                    </p>
                </div>
            </div>}

            {/* Alertas */}
            {errorMsg && (
                <div className="flex items-center gap-3 text-sm font-bold text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                    <AlertCircle size={18} /> {errorMsg}
                </div>
            )}

            {successMsg && (
                <div className="flex items-center gap-3 text-sm font-bold text-[#D8BA63] bg-[#C9A84C]/10 p-4 rounded-xl border border-[#C9A84C]/20">
                    <CheckCircle2 size={18} /> {successMsg}
                </div>
            )}

            {/* Submit */}
            <div className="pt-2 flex justify-end">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="flex h-12 items-center gap-2 rounded-full bg-[#A63D2D] px-8 font-bold text-white transition hover:bg-[#873023]"
                >
                    <Save size={18} />
                    {isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    )
}

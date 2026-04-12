'use client'

import { useState } from 'react'
import { updateProfileSettings } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsForm({ profile, creatorInfo }: { profile: any, creatorInfo: any }) {
    const [isPending, setIsPending] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const router = useRouter()

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
                setErrorMsg('Error uploading avatar: ' + uploadError.message)
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
            setSuccessMsg('Profile updated successfully!')
            router.refresh()
        }
        setIsPending(false)
    }

    return (
        <form action={handleSubmit}>
            <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Profile Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="full_name" className="text-gray-700 font-medium">Display Name</Label>
                            <Input
                                id="full_name"
                                name="full_name"
                                defaultValue={profile?.full_name || ''}
                                placeholder="Your Name"
                                className="bg-white border-gray-300 text-gray-900 focus-visible:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio" className="text-gray-700 font-medium">Bio</Label>
                            <textarea
                                id="bio"
                                name="bio"
                                rows={4}
                                defaultValue={profile?.bio || ''}
                                className="w-full rounded-md bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 p-3"
                                placeholder="Tell your readers about yourself..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="avatar" className="text-gray-700 font-medium">Avatar Image</Label>
                            <div className="flex items-center gap-4">
                                {profile?.avatar_url && !avatarFile && (
                                    <img src={profile.avatar_url} alt="Current avatar" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                )}
                                <Input
                                    id="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                                    className="bg-white border-gray-300 text-gray-500 file:text-gray-700 file:bg-gray-100 hover:file:bg-gray-200 file:border-0 file:rounded-md file:px-4 file:py-1 cursor-pointer focus-visible:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 mt-6">
                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Monetization</h3>

                        <div className="space-y-2">
                            <Label htmlFor="subscription_price" className="text-gray-700 font-medium">Monthly Subscription Price ($)</Label>
                            <div className="relative max-w-xs">
                                <span className="absolute left-3 top-2.5 text-gray-500 font-bold">$</span>
                                <Input
                                    type="number"
                                    id="subscription_price"
                                    name="subscription_price"
                                    step="0.01"
                                    min="0.99"
                                    max="999.99"
                                    defaultValue={creatorInfo?.subscription_price || "4.99"}
                                    className="pl-6 bg-white border-gray-300 text-gray-900 font-bold focus-visible:ring-blue-500"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">This is the default price for access to all your subscriber-only episodes.</p>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                            {errorMsg}
                        </div>
                    )}

                    {successMsg && (
                        <div className="text-sm font-medium text-green-700 bg-green-50 p-3 rounded-md border border-green-200">
                            {successMsg}
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold w-full sm:w-auto px-8"
                        >
                            {isPending ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}

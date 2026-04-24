import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'
import { BrandingForm } from './BrandingForm'
import { IdentityForm } from './IdentityForm'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

    const { data: creatorInfo } = await supabase
        .from('creators')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle()

    const isCreator = profile?.role === 'creator'

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold mb-1 text-white">Ajustes</h1>
                <p className="text-sm text-gray-500">
                    {isCreator
                        ? 'Actualiza tu perfil, identidad, marca personal y monetización.'
                        : 'Actualiza tu perfil y preferencias.'}
                </p>
            </div>

            <SettingsForm profile={profile} creatorInfo={creatorInfo} />

            <IdentityForm
                initial={{
                    id: profile?.id,
                    country_code: profile?.country_code,
                    pronouns: profile?.pronouns,
                    languages: profile?.languages,
                    interests: profile?.interests,
                    story_themes: profile?.story_themes,
                    website_url: profile?.website_url,
                    instagram_handle: profile?.instagram_handle,
                    twitter_handle: profile?.twitter_handle,
                    cover_image_url: profile?.cover_image_url,
                }}
            />

            {isCreator && (
                <BrandingForm
                    initial={{
                        accent_color: creatorInfo?.accent_color,
                        font_family: creatorInfo?.font_family,
                        card_style: creatorInfo?.card_style,
                        brand_tagline: creatorInfo?.brand_tagline,
                    }}
                />
            )}
        </div>
    )
}

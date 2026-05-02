import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EpisodeForm from './EpisodeForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NewEpisodePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, creators!profile_id(*, themes(*))')
        .eq('id', user?.id ?? '')
        .maybeSingle()

    if (profile?.role !== 'creator') redirect('/dashboard')

    const { data: seasons } = await supabase
        .from('seasons')
        .select('id, title')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false })

    const creatorInfo = Array.isArray(profile?.creators) ? profile.creators[0] : profile?.creators
    const themeInfo = creatorInfo?.themes

    const previewInitial = {
        username: profile?.username || '',
        full_name: profile?.full_name,
        bio: profile?.bio,
        avatar_url: profile?.avatar_url,
        accent_color: creatorInfo?.accent_color,
        font_family: creatorInfo?.font_family,
        card_style: creatorInfo?.card_style,
        brand_tagline: creatorInfo?.brand_tagline,
        why_i_write: creatorInfo?.why_i_write,
        posting_frequency: creatorInfo?.posting_frequency,
        frequency_promise: creatorInfo?.frequency_promise,
        series_status: creatorInfo?.series_status,
        theme_config: themeInfo?.config,
        subscription_price: creatorInfo?.subscription_price,
    }

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div>
                <Link href="/dashboard/episodes" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-blue-400 mb-4 transition">
                    <ChevronLeft size={14} /> Volver a mis publicaciones
                </Link>
                <h1 className="text-3xl font-bold text-white mb-1">Nuevo Episodio</h1>
                <p className="text-sm text-gray-500">Escribe, elige el acceso y publica cuando estés listo.</p>
            </div>

            <EpisodeForm seasons={seasons || []} previewInitial={previewInitial} />
        </div>
    )
}

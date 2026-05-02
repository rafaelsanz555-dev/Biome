import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EditEpisodeForm } from './EditEpisodeForm'

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditEpisodePage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: episode } = await supabase
        .from('episodes')
        .select('*')
        .eq('id', id)
        .eq('creator_id', user.id)
        .maybeSingle()

    if (!episode) notFound()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, creators(*, themes(*))')
        .eq('id', user.id)
        .maybeSingle()

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
            <Link href="/dashboard/episodes" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
                <ArrowLeft size={14} /> Volver a mis historias
            </Link>

            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Editar episodio</h1>
                <p className="text-sm text-gray-500">
                    Cambia título, descripción, portada, monetización o estado de publicación.
                </p>
            </div>

            <EditEpisodeForm episode={episode} previewInitial={previewInitial} />
        </div>
    )
}

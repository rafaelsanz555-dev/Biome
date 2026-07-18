import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EpisodeForm from './EpisodeForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NewEpisodePage({ searchParams }: { searchParams: Promise<{ season?: string }> }) {
    const { season } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, creators!profile_id(*, themes(*))')
        .eq('id', user?.id ?? '')
        .maybeSingle()

    if (profile?.role !== 'creator') redirect('/dashboard')

    let { data: seasons, error: seasonsError } = await supabase
        .from('seasons')
        .select('id, title, format, story_type')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false })

    if (seasonsError && /story_type|schema cache/i.test(seasonsError.message)) {
        const fallback = await supabase
            .from('seasons')
            .select('id, title, format')
            .eq('creator_id', user?.id)
            .order('created_at', { ascending: false })
        seasons = (fallback.data || []).map((item) => ({ ...item, story_type: 'life_story' }))
        seasonsError = fallback.error
    }

    // Solo pre-seleccionamos la serie si de verdad pertenece a este escritor
    const defaultSeasonId = season && (seasons || []).some((s) => s.id === season) ? season : ''

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
        <div className="mx-auto max-w-6xl space-y-6 p-5 pb-24 md:p-8">
            <div>
                <Link href="/dashboard/episodes" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#746A5C] transition hover:text-[#A63D2D]">
                    <ChevronLeft size={14} /> Volver a mis publicaciones
                </Link>
                <h1 className="mb-1 font-serif text-4xl font-black text-[#171512]">Nueva publicación</h1>
                <p className="text-sm text-[#746A5C]">Primero define si es una entrada independiente o un capítulo de una obra. Luego escribe y clasifica el contenido.</p>
            </div>

            <EpisodeForm seasons={seasons || []} previewInitial={previewInitial} defaultSeasonId={defaultSeasonId} />
        </div>
    )
}

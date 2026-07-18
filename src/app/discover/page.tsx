import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { DiscoverGrid } from '@/components/DiscoverGrid'
import { EditorialEpisodeCard } from '@/components/content/EditorialEpisodeCard'
import { getTranslations } from 'next-intl/server'

export default async function DiscoverPage() {
    const supabase = await createClient()
    const t = await getTranslations('editorial_discover')
    const { data: { user } } = await supabase.auth.getUser()

    const { data: creators } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, cover_image_url, bio, story_themes, creators!profile_id!inner(subscription_price, brand_tagline, posting_frequency, series_status, is_verified_storyteller)')
        .eq('role', 'creator')
        .limit(100)

    const { data: publications } = await supabase
        .from('episodes')
        .select('id, title, preview_text, cover_image_url, created_at, season_id, chapter_number, creator_id, seasons(id, title)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(12)

    const publicationCreatorIds = Array.from(new Set((publications || []).map((publication) => publication.creator_id)))
    const { data: publicationProfiles } = publicationCreatorIds.length
        ? await supabase.from('profiles').select('id, username, full_name, avatar_url').in('id', publicationCreatorIds)
        : { data: [] }
    const publicationProfilesById = Object.fromEntries((publicationProfiles || []).map((profile) => [profile.id, profile]))

    return (
        <div className="min-h-screen bg-[#FAF7F0] text-[#0D0D0D]">
            <Navbar />

            <section className="border-b border-[#0D0D0D]/10 bg-[#FAF7F0] px-4 py-14 sm:px-6 md:py-20">
                <div className="mx-auto max-w-5xl text-center">
                    <p className="text-xs font-black uppercase tracking-[0.26em] text-[#A63D2D]">{t('kicker')}</p>
                    <h1 className="mx-auto mt-4 max-w-4xl font-serif text-5xl font-black leading-tight text-[#0D0D0D] md:text-7xl">
                        {t('title')}
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#0D0D0D]/64 md:text-lg">
                        {t('description')}
                    </p>
                </div>
            </section>

            <main className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6">
                <section>
                    <div className="mb-6 border-b border-[#171512]/12 pb-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#A63D2D]">{t('now')}</p>
                        <h2 className="mt-1 font-serif text-3xl font-black">{t('recent')}</h2>
                    </div>
                    <div className="mx-auto max-w-4xl space-y-5">
                        {(publications || []).map((publication: any) => {
                            const author = publicationProfilesById[publication.creator_id]
                            const work = Array.isArray(publication.seasons) ? publication.seasons[0] : publication.seasons
                            if (!author?.username) return null
                            return (
                                <EditorialEpisodeCard
                                    key={publication.id}
                                    episode={publication}
                                    username={author.username}
                                    authorName={author.full_name || author.username}
                                    avatarUrl={author.avatar_url}
                                    workTitle={work?.title || null}
                                    chapterNumber={publication.season_id ? Number(publication.chapter_number || 1) : null}
                                    isOwner={false}
                                    isAuthenticated={Boolean(user)}
                                    initialLikeCount={0}
                                />
                            )
                        })}
                    </div>
                </section>

                <section className="mt-16 border-t border-[#171512]/12 pt-10">
                    <div className="mb-7">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#A63D2D]">{t('meet')}</p>
                        <h2 className="mt-1 font-serif text-3xl font-black">{t('authors')}</h2>
                    </div>
                    <DiscoverGrid creators={creators || []} />
                </section>
            </main>
        </div>
    )
}

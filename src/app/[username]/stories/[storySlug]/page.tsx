import type { Metadata } from 'next'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, BookOpen, Clock, Lock, Sparkles, Users } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { FollowButton } from '@/components/FollowButton'
import { ShareStoryButton } from '@/components/ShareStoryButton'
import { createClient } from '@/lib/supabase/server'

interface StoryPageProps {
    params: Promise<{ username: string; storySlug: string }>
}

async function getStory(username: string, storySlug: string) {
    const supabase = await createClient()
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio')
        .eq('username', username.toLowerCase())
        .maybeSingle()

    if (!profile) return null

    let { data: season } = await supabase
        .from('seasons')
        .select('id, title, description, slug, tagline, promise, central_question, audience, transformation, tone, emotional_tags, created_at')
        .eq('creator_id', profile.id)
        .eq('slug', storySlug)
        .maybeSingle()

    if (!season) {
        const fallback = await supabase
            .from('seasons')
            .select('id, title, description, slug, tagline, promise, central_question, audience, transformation, tone, emotional_tags, created_at')
            .eq('creator_id', profile.id)
            .eq('id', storySlug)
            .maybeSingle()
        season = fallback.data
    }

    if (!season) return null
    return { supabase, profile, season }
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
    const { username, storySlug } = await params
    const story = await getStory(username, storySlug)
    if (!story) return {}

    const title = `${story.season.title} by ${story.profile.full_name || story.profile.username}`
    const description = story.season.tagline || story.season.description || story.season.promise || `Read ${story.season.title} on Pergamo.`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    }
}

export default async function StoryPage({ params }: StoryPageProps) {
    const { username, storySlug } = await params
    const story = await getStory(username, storySlug)
    if (!story) notFound()

    const { supabase, profile, season } = story
    const { data: { user } } = await supabase.auth.getUser()
    const isOwnProfile = user?.id === profile.id

    const { data: episodes } = await supabase
        .from('episodes')
        .select('id, title, preview_text, cover_image_url, is_subscription_only, ppv_price, created_at, chapter_number, word_count')
        .eq('creator_id', profile.id)
        .eq('season_id', season.id)
        .eq('is_published', true)
        .order('created_at', { ascending: true })

    const { count: followerCount } = await supabase
        .from('story_follows')
        .select('*', { count: 'exact', head: true })
        .eq('season_id', season.id)

    let isFollowingStory = false
    if (user && !isOwnProfile) {
        const { data: followRow } = await supabase
            .from('story_follows')
            .select('season_id')
            .eq('follower_id', user.id)
            .eq('season_id', season.id)
            .maybeSingle()
        isFollowingStory = !!followRow
    }

    const firstEpisodeId = episodes?.[0]?.id
    const totalWords = (episodes || []).reduce((sum, episode) => sum + Number(episode.word_count || 0), 0)

    return (
        <div className="min-h-screen bg-[#FAF7F0] text-[#0D0D0D]">
            <Navbar />
            <main>
                <section className="border-b border-[#0D0D0D]/10 bg-[#0D0D0D] text-[#FAF7F0]">
                    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:py-16">
                        <div>
                            <Link href={`/${profile.username}`} className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#C9A84C] transition hover:text-[#E2C96E]">
                                <ArrowLeft size={16} />
                                Volver al perfil
                            </Link>
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#C9A84C]">Story DNA</p>
                            <h1 className="mt-3 max-w-3xl font-serif text-4xl font-black leading-tight md:text-6xl">
                                {season.title}
                            </h1>
                            {(season.tagline || season.promise) && (
                                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#FAF7F0]/78 md:text-xl">
                                    {season.tagline || season.promise}
                                </p>
                            )}
                            {season.description && (
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#FAF7F0]/62">
                                    {season.description}
                                </p>
                            )}

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                                {!isOwnProfile && (
                                    <FollowButton
                                        targetType="story"
                                        targetId={season.id}
                                        initialFollowing={isFollowingStory}
                                        isAuthenticated={!!user}
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-6 text-sm font-black text-[#0D0D0D] transition hover:bg-[#E2C96E]"
                                    />
                                )}
                                {firstEpisodeId && (
                                    <Link href={`/${profile.username}/${firstEpisodeId}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#FAF7F0]/20 px-6 text-sm font-black text-[#FAF7F0] transition hover:border-[#C9A84C] hover:text-[#C9A84C]">
                                        Empezar gratis
                                        <ArrowRight size={16} />
                                    </Link>
                                )}
                                <ShareStoryButton
                                    title={season.title}
                                    text={season.tagline || season.description || `Lee ${season.title} en Pergamo.`}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#FAF7F0]/20 px-6 text-sm font-black text-[#FAF7F0] transition hover:border-[#C9A84C] hover:text-[#C9A84C]"
                                />
                            </div>
                        </div>

                        <aside className="rounded-[2rem] border border-[#FAF7F0]/12 bg-[#FAF7F0]/6 p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 overflow-hidden rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xl font-black text-[#C9A84C]">
                                            {(profile.full_name || profile.username).charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-black">{profile.full_name || profile.username}</p>
                                    <p className="text-sm text-[#FAF7F0]/55">@{profile.username}</p>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                                <Stat value={episodes?.length || 0} label="capitulos" icon={BookOpen} />
                                <Stat value={followerCount || 0} label="siguen" icon={Users} />
                                <Stat value={Math.max(1, Math.round(totalWords / 220))} label="min" icon={Clock} />
                            </div>

                            <div className="mt-8 space-y-4">
                                {season.central_question && <DNA label="Pregunta central" value={season.central_question} />}
                                {season.audience && <DNA label="Para quien" value={season.audience} />}
                                {season.transformation && <DNA label="Transformacion" value={season.transformation} />}
                                {season.tone && <DNA label="Tono" value={season.tone} />}
                            </div>
                        </aside>
                    </div>
                </section>

                <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
                    <div className="mb-8 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9B7A24]">Capitulos</p>
                            <h2 className="mt-2 font-serif text-3xl font-black">Lee desde el primer gancho</h2>
                        </div>
                        <p className="hidden text-sm font-bold text-[#0D0D0D]/55 sm:block">Capitulo 1 siempre gratis</p>
                    </div>

                    <div className="space-y-4">
                        {(episodes || []).map((episode, index) => {
                            const isFree = index === 0 || (!episode.is_subscription_only && !episode.ppv_price)
                            return (
                                <Link
                                    key={episode.id}
                                    href={`/${profile.username}/${episode.id}`}
                                    className="grid gap-4 rounded-2xl border border-[#0D0D0D]/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C9A84C]/50 hover:shadow-md sm:grid-cols-[112px_1fr_auto]"
                                >
                                    <div className="aspect-[4/5] overflow-hidden rounded-xl bg-[#0D0D0D]/8">
                                        {episode.cover_image_url ? (
                                            <img src={episode.cover_image_url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Sparkles className="text-[#C9A84C]" size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9B7A24]">Capitulo {index + 1}</p>
                                        <h3 className="mt-2 font-serif text-2xl font-black">{episode.title}</h3>
                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#0D0D0D]/60">
                                            {episode.preview_text || 'Un nuevo fragmento de esta historia.'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 self-center justify-self-start sm:justify-self-end">
                                        {isFree ? (
                                            <span className="rounded-full bg-[#C9A84C]/16 px-3 py-1 text-xs font-black text-[#745915]">Gratis</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#0D0D0D] px-3 py-1 text-xs font-black text-[#FAF7F0]">
                                                <Lock size={12} />
                                                Premium
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            </main>
        </div>
    )
}

function Stat({ value, label, icon: Icon }: { value: number; label: string; icon: LucideIcon }) {
    return (
        <div className="rounded-2xl border border-[#FAF7F0]/10 bg-[#0D0D0D]/25 p-3">
            <Icon className="mx-auto mb-2 text-[#C9A84C]" size={17} />
            <p className="text-lg font-black">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FAF7F0]/45">{label}</p>
        </div>
    )
}

function DNA({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-t border-[#FAF7F0]/10 pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C9A84C]">{label}</p>
            <p className="mt-1 text-sm leading-6 text-[#FAF7F0]/72">{value}</p>
        </div>
    )
}

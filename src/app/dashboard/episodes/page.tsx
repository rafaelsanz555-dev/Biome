import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Edit3, Eye, FileText, Lock, PlusCircle, Sparkles } from 'lucide-react'

type EpisodeRow = {
    id: string
    title: string
    preview_text: string | null
    cover_image_url: string | null
    is_published: boolean
    is_subscription_only: boolean
    ppv_price: number | null
    word_count: number | null
    created_at: string
    season_id: string | null
    seasons?: { title?: string | null } | null
}

export default async function EpisodesPage({ searchParams }: { searchParams: Promise<{ published?: string; first_free?: string }> }) {
    const { published, first_free } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', user?.id ?? '')
        .maybeSingle()

    if (profile?.role !== 'creator') redirect('/dashboard')

    const { data } = await supabase
        .from('episodes')
        .select('id, title, preview_text, cover_image_url, is_published, is_subscription_only, ppv_price, word_count, created_at, season_id, seasons(title)')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false })

    const episodes = (data || []) as EpisodeRow[]
    const storyMap = new Map<string, { id: string; title: string; episodes: EpisodeRow[] }>()

    for (const episode of episodes) {
        const id = episode.season_id || `solo-${episode.id}`
        const title = episode.seasons?.title || 'Historias independientes'
        const current = storyMap.get(id) || { id, title, episodes: [] }
        current.episodes.push(episode)
        storyMap.set(id, current)
    }

    const stories = Array.from(storyMap.values()).map((story) => {
        const sorted = [...story.episodes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        const published = sorted.filter((e) => e.is_published)
        const words = sorted.reduce((sum, e) => sum + Number(e.word_count || 0), 0)
        const latest = sorted[0]
        const hasPaid = sorted.some((e) => e.is_subscription_only || e.ppv_price)
        const hasFree = sorted.some((e) => !e.is_subscription_only && !e.ppv_price)
        return { ...story, episodes: sorted, latest, published, words, hasPaid, hasFree }
    })

    const totalPublished = episodes.filter((e) => e.is_published).length
    const totalWords = episodes.reduce((sum, e) => sum + Number(e.word_count || 0), 0)

    return (
        <div className="space-y-6">
            {published === '1' && (
                <div className="rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-3 text-sm text-[#D8BA63]">
                    <strong>✓ Episodio publicado.</strong>{' '}
                    {first_free === '1'
                        ? 'Como es el primer capítulo de la historia, se publicó gratis — es el gancho que convierte lectores en suscriptores.'
                        : 'Ya está visible en tu perfil público.'}
                </div>
            )}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C9A84C]">Writer library</p>
                    <h1 className="mt-2 text-3xl font-black text-white">Tus historias</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Tus series y capítulos: estado, palabras y monetización.
                    </p>
                </div>
                <Link href="/dashboard/episodes/new">
                    <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#C9A84C] px-5 text-sm font-black text-[#0D0D0D] transition hover:bg-[#D8BA63]">
                        <PlusCircle size={16} />
                        Nuevo capitulo
                    </button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Stat label="Historias" value={stories.length} sub="Series o independientes" icon={BookOpen} />
                <Stat label="Capitulos publicados" value={totalPublished} sub={`${episodes.length - totalPublished} borradores`} icon={FileText} />
                <Stat label="Palabras" value={totalWords.toLocaleString('en-US')} sub="Inventario total" icon={Sparkles} />
            </div>

            {!episodes.length ? (
                <div className="rounded-2xl border border-dashed border-gray-800 bg-[#15171C] p-14 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C9A84C]/10">
                        <BookOpen size={24} className="text-[#C9A84C]" />
                    </div>
                    <p className="mb-2 text-xl font-black text-white">Tu primera historia empieza aqui</p>
                    <p className="mb-6 text-sm text-gray-400">Publica un capitulo gratis para que los lectores prueben tu voz.</p>
                    <Link href="/dashboard/episodes/new">
                        <button className="inline-flex items-center gap-2 rounded-xl bg-[#C9A84C] px-6 py-2.5 text-sm font-black text-[#0D0D0D] transition hover:bg-[#D8BA63]">
                            <PlusCircle size={15} />
                            Crear primer capitulo
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#15171C]">
                    <div className="hidden grid-cols-[1.4fr_0.7fr_0.7fr_1fr] gap-4 border-b border-gray-800 bg-[#101114] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-gray-500 lg:grid">
                        <span>Historia</span>
                        <span>Lectores</span>
                        <span>Inventario</span>
                        <span className="text-right">Acciones</span>
                    </div>
                    <div className="divide-y divide-gray-800">
                        {stories.map((story) => (
                            <article key={story.id} className="grid gap-5 px-5 py-5 lg:grid-cols-[1.4fr_0.7fr_0.7fr_1fr] lg:items-center">
                                <div className="flex min-w-0 gap-4">
                                    <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-800 bg-[#0D0D0D]">
                                        {story.latest.cover_image_url ? (
                                            <img src={story.latest.cover_image_url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[#C9A84C]">
                                                <BookOpen size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="line-clamp-2 text-xl font-black leading-tight text-white">{story.title}</h2>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <StatusPill active={story.published.length > 0} label={story.published.length > 0 ? 'Ongoing' : 'Draft'} />
                                            {story.hasFree && <StatusPill active label="Free hook" />}
                                            {story.hasPaid && <StatusPill active label="Monetized" />}
                                        </div>
                                        <p className="mt-2 line-clamp-1 text-xs text-gray-500">
                                            Ultimo: {story.latest.title} · {new Date(story.latest.created_at).toLocaleDateString('es-ES')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm lg:block">
                                    <Metric label="Subscribers" value="0" />
                                    <Metric label="Views" value="0" />
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm lg:block">
                                    <Metric label="Chapters" value={story.episodes.length} />
                                    <Metric label="Words" value={story.words.toLocaleString('en-US')} />
                                </div>

                                <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                                    {profile?.username && story.latest.is_published && (
                                        <Link href={`/${profile.username}/${story.latest.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/5 px-3 text-xs font-bold text-gray-200 hover:bg-white/10">
                                            <Eye size={13} /> Ver
                                        </Link>
                                    )}
                                    <Link href={`/dashboard/episodes/${story.latest.id}/edit`} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/5 px-3 text-xs font-bold text-gray-200 hover:bg-white/10">
                                        <Edit3 size={13} /> Story info
                                    </Link>
                                    <Link href="/dashboard/episodes" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/5 px-3 text-xs font-bold text-gray-200 hover:bg-white/10">
                                        All chapters
                                    </Link>
                                    <Link href="/dashboard/episodes/new" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#C9A84C] px-3 text-xs font-black text-[#0D0D0D] hover:bg-[#D8BA63]">
                                        New chapter
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function Stat({ label, value, sub, icon: Icon }: { label: string; value: string | number; sub: string; icon: any }) {
    return (
        <div className="rounded-2xl border border-gray-800 bg-[#15171C] p-5">
            <Icon size={18} className="mb-4 text-[#C9A84C]" />
            <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-white">{value}</p>
            <p className="mt-1 text-xs text-gray-500">{sub}</p>
        </div>
    )
}

function Metric({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="mb-2">
            <p className="text-[11px] font-bold text-gray-500">{label}</p>
            <p className="text-lg font-black text-white">{value}</p>
        </div>
    )
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
    return (
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wider ${active ? 'bg-[#C9A84C]/15 text-[#C9A84C]' : 'bg-gray-800 text-gray-400'}`}>
            {label === 'Monetized' && <Lock size={10} />}
            {label}
        </span>
    )
}

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, ChevronRight, Edit3, Eye, FileText, Lock, PlusCircle, Sparkles } from 'lucide-react'

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
    const storyMap = new Map<string, { id: string; title: string; isSeries: boolean; seasonId: string | null; episodes: EpisodeRow[] }>()

    for (const episode of episodes) {
        const isSeries = !!episode.season_id
        const id = episode.season_id || `solo-${episode.id}`
        // Serie: título de la serie. Independiente: el título del propio episodio
        // (antes todos los sueltos decían "Historias independientes" — confuso).
        const title = isSeries ? (episode.seasons?.title || 'Serie sin título') : episode.title
        const current = storyMap.get(id) || { id, title, isSeries, seasonId: episode.season_id ?? null, episodes: [] }
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
        <div className="mx-auto max-w-6xl space-y-7 px-4 py-8 pb-24 sm:px-6">
            {published === '1' && (
                <div className="border border-[#A63D2D]/20 bg-[#A63D2D]/6 px-4 py-3 text-sm text-[#873023]">
                    <strong>✓ Episodio publicado.</strong>{' '}
                    {first_free === '1'
                        ? 'Como es el primer capítulo de la historia, se publicó gratis — es el gancho que convierte lectores en suscriptores.'
                        : 'Ya está visible en tu perfil público.'}
                </div>
            )}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#A63D2D]">Biblioteca del autor</p>
                    <h1 className="mt-2 font-serif text-4xl font-black text-[#171512]">Entradas y obras</h1>
                    <p className="mt-1 text-sm text-[#746A5C]">
                        Administra publicaciones independientes, historias y novelas por capítulos.
                    </p>
                </div>
                <Link href="/dashboard/episodes/new">
                    <button className="inline-flex h-11 items-center gap-2 rounded-full bg-[#A63D2D] px-5 text-sm font-black text-white transition hover:bg-[#873023]">
                        <PlusCircle size={16} />
                        Nueva publicación
                    </button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Stat label="Obras y entradas" value={stories.length} sub="Formatos claramente separados" icon={BookOpen} />
                <Stat label="Publicaciones" value={totalPublished} sub={`${episodes.length - totalPublished} borradores`} icon={FileText} />
                <Stat label="Palabras" value={totalWords.toLocaleString('en-US')} sub="Inventario total" icon={Sparkles} />
            </div>

            {!episodes.length ? (
                <div className="border border-dashed border-[#171512]/18 bg-white/35 p-14 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-[#A63D2D]/8">
                        <BookOpen size={24} className="text-[#A63D2D]" />
                    </div>
                    <p className="mb-2 font-serif text-2xl font-black text-[#171512]">Tu primera publicación empieza aquí</p>
                    <p className="mb-6 text-sm text-[#746A5C]">Comparte una entrada o abre una obra con su primer capítulo gratuito.</p>
                    <Link href="/dashboard/episodes/new">
                        <button className="inline-flex items-center gap-2 rounded-full bg-[#A63D2D] px-6 py-2.5 text-sm font-black text-white transition hover:bg-[#873023]">
                            <PlusCircle size={15} />
                            Crear publicación
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="overflow-hidden border border-[#171512]/12 bg-[#FFFCF5]">
                    <div className="hidden grid-cols-[1.4fr_0.7fr_0.7fr_1fr] gap-4 border-b border-[#171512]/10 bg-[#EEE5D5] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#746A5C] lg:grid">
                        <span>Publicación</span>
                        <span>Lectores</span>
                        <span>Inventario</span>
                        <span className="text-right">Acciones</span>
                    </div>
                    <div className="divide-y divide-[#171512]/10">
                        {stories.map((story) => (
                            <article key={story.id} className="grid gap-5 px-5 py-5 lg:grid-cols-[1.4fr_0.7fr_0.7fr_1fr] lg:items-center">
                                <div className="flex min-w-0 gap-4">
                                    <div className="h-24 w-16 shrink-0 overflow-hidden border border-[#171512]/12 bg-[#DED6C7]">
                                        {story.latest.cover_image_url ? (
                                            <img src={story.latest.cover_image_url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[#A63D2D]">
                                                <BookOpen size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#A63D2D]">{story.isSeries ? 'Historia / novela' : 'Entrada'}</p>
                                        <h2 className="mt-1 line-clamp-2 font-serif text-xl font-black leading-tight text-[#171512]">{story.title}</h2>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <StatusPill active={story.published.length > 0} label={story.published.length > 0 ? 'Ongoing' : 'Draft'} />
                                            {story.hasFree && <StatusPill active label="Free hook" />}
                                            {story.hasPaid && <StatusPill active label="Monetized" />}
                                        </div>
                                        <p className="mt-2 line-clamp-1 text-xs text-[#746A5C]">
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
                                        <Link href={`/${profile.username}/${story.latest.id}`} className="inline-flex h-9 items-center gap-1.5 border border-[#171512]/12 px-3 text-xs font-bold text-[#574F45] hover:border-[#A63D2D]/30">
                                            <Eye size={13} /> Ver
                                        </Link>
                                    )}
                                    <Link href={`/dashboard/episodes/${story.latest.id}/edit`} className="inline-flex h-9 items-center gap-1.5 border border-[#171512]/12 px-3 text-xs font-bold text-[#574F45] hover:border-[#A63D2D]/30">
                                        <Edit3 size={13} /> Editar
                                    </Link>
                                    {/* "Nuevo capítulo" solo tiene sentido en una serie/hilo, no en
                                        una publicación suelta — y pre-selecciona la serie. */}
                                    {story.isSeries && (
                                        <Link href={`/dashboard/episodes/new?season=${story.seasonId}`} className="inline-flex h-9 items-center gap-1.5 bg-[#A63D2D] px-3 text-xs font-black text-white hover:bg-[#873023]">
                                            <PlusCircle size={13} /> Nuevo capitulo
                                        </Link>
                                    )}
                                </div>

                                {/* Lista de capítulos — reemplaza el botón "All chapters" que
                                    no hacía nada. Solo en series con más de un capítulo. */}
                                {story.isSeries && story.episodes.length > 1 && (
                                    <details className="group/ch border border-[#171512]/10 bg-[#F8F4EA] lg:col-span-4">
                                        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#746A5C] transition hover:text-[#171512]">
                                            <ChevronRight size={13} className="transition-transform group-open/ch:rotate-90" />
                                            Ver los {story.episodes.length} capitulos
                                        </summary>
                                        <div className="divide-y divide-[#171512]/8 border-t border-[#171512]/8">
                                            {story.episodes.map((ep) => (
                                                <div key={ep.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-[#171512]">{ep.title}</p>
                                                        <p className="text-[11px] text-[#746A5C]">
                                                            {ep.is_published ? 'Publicado' : 'Borrador'} · {Number(ep.word_count || 0).toLocaleString('en-US')} palabras
                                                        </p>
                                                    </div>
                                                    <div className="flex shrink-0 gap-2">
                                                        {profile?.username && ep.is_published && (
                                                            <Link href={`/${profile.username}/${ep.id}`} className="inline-flex h-8 items-center gap-1 border border-[#171512]/10 px-2.5 text-xs font-bold text-[#574F45]">
                                                                <Eye size={12} /> Ver
                                                            </Link>
                                                        )}
                                                        <Link href={`/dashboard/episodes/${ep.id}/edit`} className="inline-flex h-8 items-center gap-1 border border-[#171512]/10 px-2.5 text-xs font-bold text-[#574F45]">
                                                            <Edit3 size={12} /> Editar
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                )}
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
        <div className="border border-[#171512]/10 bg-[#F8F4EA] p-5">
            <Icon size={18} className="mb-4 text-[#A63D2D]" />
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#746A5C]">{label}</p>
            <p className="mt-2 font-serif text-3xl font-black text-[#171512]">{value}</p>
            <p className="mt-1 text-xs text-[#8A8174]">{sub}</p>
        </div>
    )
}

function Metric({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="mb-2">
            <p className="text-[11px] font-bold text-[#8A8174]">{label}</p>
            <p className="text-lg font-black text-[#171512]">{value}</p>
        </div>
    )
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-wider ${active ? 'bg-[#A63D2D]/8 text-[#A63D2D]' : 'bg-[#171512]/7 text-[#746A5C]'}`}>
            {label === 'Monetized' && <Lock size={10} />}
            {label}
        </span>
    )
}

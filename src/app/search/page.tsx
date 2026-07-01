import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { SearchBox } from '@/components/SearchBox'
import { CreatorCard } from '@/components/CreatorCard'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Users } from 'lucide-react'

export const metadata = { title: 'Buscar' }

// Escapa los comodines de PostgREST para que el término del usuario
// no rompa el patrón ilike
function escapeLike(term: string): string {
    return term.replace(/[%_,()]/g, (c) => `\\${c}`)
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams
    const query = (q || '').trim().slice(0, 80)
    const supabase = await createClient()

    let writers: any[] = []
    let episodes: any[] = []

    if (query.length >= 2) {
        const pattern = `%${escapeLike(query)}%`

        const [writersRes, episodesRes] = await Promise.all([
            supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url, bio, story_themes, creators!profile_id!inner(subscription_price, brand_tagline, posting_frequency, series_status, is_verified_storyteller)')
                .eq('role', 'creator')
                .or(`username.ilike.${pattern},full_name.ilike.${pattern},bio.ilike.${pattern}`)
                .limit(24),
            supabase
                .from('episodes')
                .select('id, title, preview_text, cover_image_url, created_at, creator_id')
                .eq('is_published', true)
                .or(`title.ilike.${pattern},preview_text.ilike.${pattern}`)
                .order('created_at', { ascending: false })
                .limit(24),
        ])

        writers = writersRes.data || []
        if (writersRes.error) console.error('[search] writers query failed:', writersRes.error.message)

        const episodesRaw = episodesRes.data || []
        if (episodesRes.error) console.error('[search] episodes query failed:', episodesRes.error.message)

        // Autores de los episodios en segunda query (FK ambigua episodes->creators/profiles)
        const creatorIds = Array.from(new Set(episodesRaw.map((e) => e.creator_id)))
        const authorMap: Record<string, { username: string | null; full_name: string | null }> = {}
        if (creatorIds.length > 0) {
            const { data: authors } = await supabase
                .from('profiles')
                .select('id, username, full_name')
                .in('id', creatorIds)
            authors?.forEach((a) => { authorMap[a.id] = { username: a.username, full_name: a.full_name } })
        }
        episodes = episodesRaw.map((e) => ({ ...e, author: authorMap[e.creator_id] || null }))
    }

    const hasResults = writers.length > 0 || episodes.length > 0

    return (
        <div className="min-h-screen bg-[#FAF7F0] text-[#0D0D0D]">
            <Navbar />

            <section className="border-b border-[#0D0D0D]/10 px-4 py-12 sm:px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="font-serif text-4xl font-black md:text-5xl">Buscar</h1>
                    <p className="mt-3 text-sm text-[#0D0D0D]/60">Escritores e historias, por nombre, tema o palabra.</p>
                    <div className="mx-auto mt-6 max-w-xl">
                        <SearchBox variant="light" placeholder="Buscar escritores o historias..." />
                    </div>
                </div>
            </section>

            <main className="mx-auto max-w-6xl space-y-12 px-4 py-10 pb-24 sm:px-6">
                {query.length > 0 && query.length < 2 && (
                    <p className="text-center text-sm text-[#0D0D0D]/55">Escribe al menos 2 letras para buscar.</p>
                )}

                {query.length >= 2 && !hasResults && (
                    <div className="rounded-3xl border border-dashed border-[#0D0D0D]/12 bg-white/70 p-12 text-center">
                        <p className="font-serif text-2xl font-black">Nada con “{query}” por ahora.</p>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#0D0D0D]/58">
                            Prueba con otra palabra, o explora los escritores en discovery.
                        </p>
                        <Link href="/discover" className="mt-6 inline-flex h-11 items-center rounded-full bg-[#0D0D0D] px-6 text-sm font-black text-[#FAF7F0] transition hover:bg-[#2A2418]">
                            Ir a discovery
                        </Link>
                    </div>
                )}

                {writers.length > 0 && (
                    <section>
                        <div className="mb-5 flex items-center gap-2">
                            <Users size={18} className="text-[#8A6A1C]" />
                            <h2 className="font-serif text-2xl font-black">Escritores</h2>
                            <span className="text-sm text-[#0D0D0D]/45">({writers.length})</span>
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {writers.map((creator) => (
                                <CreatorCard key={creator.id} creator={creator} />
                            ))}
                        </div>
                    </section>
                )}

                {episodes.length > 0 && (
                    <section>
                        <div className="mb-5 flex items-center gap-2">
                            <BookOpen size={18} className="text-[#8A6A1C]" />
                            <h2 className="font-serif text-2xl font-black">Historias</h2>
                            <span className="text-sm text-[#0D0D0D]/45">({episodes.length})</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {episodes.map((ep) => (
                                <Link
                                    key={ep.id}
                                    href={ep.author?.username ? `/${ep.author.username}/${ep.id}` : '#'}
                                    className="group flex gap-4 rounded-2xl border border-[#0D0D0D]/10 bg-white p-4 transition hover:border-[#C9A84C]"
                                >
                                    <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-[#0D0D0D]/10 bg-[#0D0D0D]/5">
                                        {ep.cover_image_url ? (
                                            <img src={ep.cover_image_url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[#C9A84C]">
                                                <BookOpen size={18} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="line-clamp-1 font-bold text-[#0D0D0D] transition group-hover:text-[#8A6A1C]">{ep.title}</h3>
                                        {ep.preview_text && (
                                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#0D0D0D]/60">{ep.preview_text}</p>
                                        )}
                                        <p className="mt-1.5 text-xs font-bold text-[#0D0D0D]/45">
                                            {ep.author?.full_name || ep.author?.username || 'Escritor'} · @{ep.author?.username}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}

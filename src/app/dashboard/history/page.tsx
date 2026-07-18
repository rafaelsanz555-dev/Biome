import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Bookmark, BookOpen, Compass } from 'lucide-react'

export default async function HistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: bookmarks } = user
        ? await supabase
            .from('reading_bookmarks')
            .select('episode_id, reached_percent, completed, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(40)
        : { data: [] }

    const episodeIds = (bookmarks || []).map((bookmark) => bookmark.episode_id)
    const { data: episodes } = episodeIds.length
        ? await supabase
            .from('episodes')
            .select('id, title, cover_image_url, creator_id')
            .in('id', episodeIds)
            .eq('is_published', true)
        : { data: [] }

    const creatorIds = Array.from(new Set((episodes || []).map((episode) => episode.creator_id)))
    const { data: creators } = creatorIds.length
        ? await supabase.from('profiles').select('id, username, full_name').in('id', creatorIds)
        : { data: [] }

    const episodeMap = new Map((episodes || []).map((episode) => [episode.id, episode]))
    const creatorMap = new Map((creators || []).map((creator) => [creator.id, creator]))
    const saved = (bookmarks || []).flatMap((bookmark) => {
        const episode = episodeMap.get(bookmark.episode_id)
        if (!episode) return []
        return [{ ...bookmark, episode, creator: creatorMap.get(episode.creator_id) }]
    })

    return (
        <div className="space-y-6">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A63D2D]">Tu biblioteca</p>
                <h1 className="mt-2 flex items-center gap-2 font-serif text-4xl font-black text-[#171512]">
                    <Bookmark size={24} className="text-[#A63D2D]" />
                    Guardados
                </h1>
                <p className="mt-2 text-sm text-[#746A5C]">Lecturas abiertas y capítulos terminados, ordenados por tu última visita.</p>
            </div>

            {saved.length === 0 ? (
                <div className="border border-dashed border-[#171512]/18 bg-white/35 p-14 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-[#A63D2D]/8">
                        <BookOpen size={22} className="text-[#A63D2D]" />
                    </div>
                    <p className="mb-2 font-serif text-2xl font-black text-[#171512]">Tu biblioteca está vacía</p>
                    <p className="mb-6 text-sm text-[#746A5C]">Empieza una lectura y Pergamo guardará tu lugar automáticamente.</p>
                    <Link href="/discover" className="inline-flex items-center gap-2 rounded-full bg-[#171512] px-6 py-2.5 text-sm font-black text-white transition hover:bg-[#A63D2D]">
                        <Compass size={15} /> Descubrir historias
                    </Link>
                </div>
            ) : (
                <div className="overflow-hidden border border-[#171512]/10 bg-[#FFFCF5]">
                    <div className="divide-y divide-[#171512]/8">
                        {saved.map(({ episode, creator, reached_percent, completed, updated_at }) => (
                            <Link
                                key={episode.id}
                                href={creator?.username ? `/${creator.username}/${episode.id}` : '/discover'}
                                className="grid grid-cols-[56px_1fr_auto] items-center gap-4 px-4 py-4 transition hover:bg-[#F8F4EA] sm:px-5"
                            >
                                <div className="flex h-14 w-14 items-center justify-center overflow-hidden border border-[#171512]/10 bg-[#EEE5D5]">
                                    {episode.cover_image_url
                                        ? <img src={episode.cover_image_url} alt="" className="h-full w-full object-cover" />
                                        : <BookOpen size={18} className="text-[#A63D2D]" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate font-serif text-lg font-black text-[#171512]">{episode.title}</p>
                                    <p className="truncate text-xs text-[#746A5C]">{creator?.full_name || `@${creator?.username || 'autor'}`} · {new Date(updated_at).toLocaleDateString('es-ES')}</p>
                                </div>
                                <div className="min-w-14 text-right">
                                    <p className="text-xs font-black text-[#A63D2D]">{completed ? 'Leído' : `${Math.max(1, reached_percent || 0)}%`}</p>
                                    {!completed && <div className="mt-2 h-1.5 w-14 overflow-hidden bg-[#171512]/10"><div className="h-full bg-[#A63D2D]" style={{ width: `${Math.max(2, reached_percent || 0)}%` }} /></div>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, ArrowRight } from 'lucide-react'

/**
 * Server Component: muestra hasta 4 episodios en progreso del usuario logueado.
 * Pega esto en el dashboard. Si no hay nada in-progress, no renderiza nada.
 */
export async function ResumeReading() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: bookmarks } = await supabase
        .from('reading_bookmarks')
        .select('episode_id, reached_percent, updated_at, episodes(id, title, cover_image_url, profiles:creator_id(username, full_name, avatar_url))')
        .eq('user_id', user.id)
        .eq('completed', false)
        .gt('reached_percent', 5)
        .order('updated_at', { ascending: false })
        .limit(4)

    if (!bookmarks || bookmarks.length === 0) return null

    return (
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-[#0F1114] to-[#0A0B0E] p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-green-400" />
                    <h3 className="text-sm font-bold text-white">Continúa donde lo dejaste</h3>
                </div>
                <span className="text-[10px] text-gray-500">{bookmarks.length} {bookmarks.length === 1 ? 'historia' : 'historias'}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
                {bookmarks.map((b: any) => {
                    const ep = b.episodes
                    if (!ep) return null
                    const username = ep.profiles?.username
                    const author = ep.profiles?.full_name || username
                    return (
                        <Link
                            key={b.episode_id}
                            href={`/${username}/${b.episode_id}`}
                            className="group flex gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-gray-800 transition"
                        >
                            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-[#15171C]">
                                {ep.cover_image_url ? (
                                    <img src={ep.cover_image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-green-900/40 to-[#0F1114]" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white line-clamp-2 group-hover:text-green-400 transition">
                                    {ep.title}
                                </p>
                                <p className="text-[11px] text-gray-500 mt-0.5">{author}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 h-1 rounded-full bg-gray-800 overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 transition-all"
                                            style={{ width: `${b.reached_percent}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono">{Math.round(b.reached_percent)}%</span>
                                </div>
                            </div>
                            <ArrowRight size={14} className="text-gray-600 group-hover:text-green-400 transition self-center shrink-0" />
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

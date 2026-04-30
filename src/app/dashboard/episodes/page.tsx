import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PenLine, Lock, DollarSign, Eye, PlusCircle } from 'lucide-react'

export default async function EpisodesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', user?.id ?? '')
        .maybeSingle()

    if (profile?.role !== 'creator') redirect('/dashboard')

    const { data: episodes } = await supabase
        .from('episodes')
        .select('*, seasons(title)')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-1 text-white">Mis Publicaciones</h1>
                    <p className="text-sm text-gray-500">
                        {episodes?.length || 0} publicación{episodes?.length !== 1 ? 'es' : ''}
                    </p>
                </div>
                <Link href="/dashboard/episodes/new">
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-gray-700 bg-[#15171C] text-white hover:bg-gray-800 transition-all shadow-md">
                        <PenLine size={14} />
                        Nuevo post
                    </button>
                </Link>
            </div>

            {!episodes || episodes.length === 0 ? (
                <div className="p-14 text-center rounded-2xl border border-dashed border-gray-800 bg-[#15171C]">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-blue-500/10">
                        <PenLine size={22} className="text-blue-500" />
                    </div>
                    <p className="text-xl font-bold mb-2 text-white">Sin publicaciones todavía</p>
                    <p className="text-sm mb-6 text-gray-400">Sube post y conecta con tus fans.</p>
                    <Link href="/dashboard/episodes/new">
                        <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                            <PlusCircle size={15} />
                            Crear primer post
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {episodes.map((episode) => (
                        <div
                            key={episode.id}
                            className="rounded-2xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center overflow-hidden transition-all bg-[#15171C] hover:border-gray-700 hover:shadow-lg hover:shadow-black/50"
                        >
                            <div className="p-5 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h2 className="font-bold text-white text-base truncate">{episode.title}</h2>
                                    {episode.is_published ? (
                                        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">Publicado</span>
                                    ) : (
                                        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md bg-gray-800 text-gray-400">Borrador</span>
                                    )}
                                    {episode.seasons?.title && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border border-gray-700 text-gray-400">{episode.seasons.title}</span>
                                    )}
                                </div>
                                <p className="text-sm line-clamp-1 text-gray-500">{episode.preview_text || 'Sin texto de vista previa.'}</p>
                            </div>
                            <div className="pb-4 sm:pb-0 px-5 sm:px-6 flex items-center gap-4 shrink-0">
                                {episode.is_subscription_only ? (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        <Lock size={10} />Exclusivo
                                    </span>
                                ) : episode.ppv_price ? (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                        <DollarSign size={10} />${episode.ppv_price} PPV
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs bg-gray-800 text-gray-400 border border-gray-700">
                                        <Eye size={10} />Gratis
                                    </span>
                                )}
                                <div className="flex items-center gap-4">
                                    {profile?.username && episode.is_published && (
                                        <Link href={`/${profile.username}/${episode.id}`} className="text-sm font-bold text-blue-500 hover:text-blue-400">Ver</Link>
                                    )}
                                    <Link href={`/dashboard/episodes/${episode.id}/edit`} className="text-sm font-bold text-gray-300 hover:text-white">Editar</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

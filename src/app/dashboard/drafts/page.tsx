import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText, PenLine, PlusCircle } from 'lucide-react'

export default async function DraftsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: _p } = await supabase.from('profiles').select('role').eq('id', user?.id ?? '').maybeSingle()
    if (_p?.role !== 'creator') redirect('/dashboard')

    const { data: drafts } = await supabase
        .from('episodes')
        .select('*, seasons(title)')
        .eq('creator_id', user?.id)
        .eq('is_published', false)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-1 text-white">Borradores</h1>
                    <p className="text-sm text-gray-500">
                        {drafts?.length || 0} borrador{drafts?.length !== 1 ? 'es' : ''} sin publicar
                    </p>
                </div>
                <Link href="/dashboard/episodes/new">
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/20">
                        <PenLine size={14} />
                        Nuevo borrador
                    </button>
                </Link>
            </div>

            {!drafts || drafts.length === 0 ? (
                <div className="p-14 text-center rounded-2xl border border-dashed border-gray-800 bg-[#15171C]">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-blue-500/10">
                        <FileText size={22} className="text-blue-500" />
                    </div>
                    <p className="text-xl font-bold mb-2 text-white">Sin borradores</p>
                    <p className="text-sm mb-6 text-gray-400">Guarda ideas antes de publicarlas.</p>
                    <Link href="/dashboard/episodes/new">
                        <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                            <PlusCircle size={15} />
                            Empezar un borrador
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {drafts.map((episode) => (
                        <div
                            key={episode.id}
                            className="rounded-2xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center overflow-hidden bg-[#15171C] hover:border-gray-700 transition-all"
                        >
                            <div className="p-5 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h2 className="font-bold text-white text-base truncate">{episode.title}</h2>
                                    <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md bg-gray-800 text-gray-400">Borrador</span>
                                    {episode.seasons?.title && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border border-gray-700 text-gray-400">{episode.seasons.title}</span>
                                    )}
                                </div>
                                <p className="text-sm line-clamp-1 text-gray-500">{episode.preview_text || 'Sin texto de vista previa.'}</p>
                                <p className="text-xs text-gray-600 mt-2">
                                    Creado {new Date(episode.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="pb-4 sm:pb-0 px-5 sm:px-6 flex items-center gap-3 shrink-0">
                                <span className="text-xs text-gray-500 italic">Edición próximamente</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

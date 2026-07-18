import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Edit3, FileText, PenLine, PlusCircle } from 'lucide-react'

export default async function DraftsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
    const { saved } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: _p } = await supabase.from('profiles').select('role').eq('id', user?.id ?? '').maybeSingle()
    if (_p?.role !== 'creator') redirect('/dashboard')

    const { data: drafts } = await supabase
        .from('episodes')
        .select('id, title, preview_text, created_at, seasons(title)')
        .eq('creator_id', user?.id)
        .eq('is_published', false)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            {saved === '1' && (
                <div className="border border-[#274C43]/20 bg-[#274C43]/8 px-4 py-3 text-sm text-[#274C43]">
                    <strong>✓ Borrador guardado.</strong> Cuando lo termines, ábrelo y actívalo como publicado.
                </div>
            )}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A63D2D]">Mesa de trabajo</p>
                    <h1 className="mt-2 font-serif text-4xl font-black text-[#171512]">Borradores</h1>
                    <p className="mt-2 text-sm text-[#746A5C]">
                        {drafts?.length || 0} borrador{drafts?.length !== 1 ? 'es' : ''} sin publicar — solo tú los ves
                    </p>
                </div>
                <Link href="/dashboard/episodes/new">
                    <button className="inline-flex h-11 items-center gap-2 rounded-full bg-[#A63D2D] px-5 text-sm font-black text-white transition hover:bg-[#873023]">
                        <PenLine size={14} />
                        Escribir nuevo
                    </button>
                </Link>
            </div>

            {!drafts || drafts.length === 0 ? (
                <div className="border border-dashed border-[#171512]/18 bg-white/35 p-14 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-[#A63D2D]/8">
                        <FileText size={22} className="text-[#A63D2D]" />
                    </div>
                    <p className="mb-2 font-serif text-2xl font-black text-[#171512]">Sin borradores</p>
                    <p className="mb-6 text-sm text-[#746A5C]">Guarda ideas antes de publicarlas.</p>
                    <Link href="/dashboard/episodes/new">
                        <button className="inline-flex items-center gap-2 rounded-full bg-[#171512] px-6 py-2.5 text-sm font-black text-white transition hover:bg-[#A63D2D]">
                            <PlusCircle size={15} />
                            Empezar un borrador
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {drafts.map((episode: any) => (
                        <div
                            key={episode.id}
                            className="flex flex-col items-start justify-between overflow-hidden border border-[#171512]/10 bg-[#FFFCF5] transition hover:border-[#A63D2D]/30 sm:flex-row sm:items-center"
                        >
                            <div className="p-5 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h2 className="truncate font-serif text-lg font-black text-[#171512]">{episode.title}</h2>
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
                                <Link
                                    href={`/dashboard/episodes/${episode.id}/edit`}
                                    className="inline-flex items-center gap-2 border border-[#171512]/12 px-4 py-2 text-xs font-bold text-[#574F45] transition hover:border-[#A63D2D]/35 hover:text-[#A63D2D]"
                                >
                                    <Edit3 size={13} /> Editar y publicar
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}


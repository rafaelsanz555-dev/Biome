import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSeason } from './actions'
import { Library, PlusCircle } from 'lucide-react'

export default async function SeasonsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: _p } = await supabase.from('profiles').select('role').eq('id', user?.id ?? '').maybeSingle()
    if (_p?.role !== 'creator') redirect('/dashboard')

    const { data: seasons } = await supabase
        .from('seasons')
        .select('*')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-1 text-white">Galerías / Series</h1>
                <p className="text-sm text-gray-500">Agrupa tus posts exclusivos en series o galerías temáticas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="rounded-2xl p-6 sticky top-6 bg-[#15171C] border border-gray-800 shadow-md">
                        <h2 className="font-bold text-white text-base mb-1">Nueva Galería</h2>
                        <p className="text-xs text-gray-500 mb-5">Crea un álbum para agrupar posts.</p>
                        <form action={createSeason} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-gray-400">Título</Label>
                                <Input id="title" name="title" required placeholder="ej. Sesión en la playa" className="h-10 text-sm bg-[#0A0B0E] border-gray-800 text-white focus-visible:ring-green-500" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-gray-400">Descripción (opcional)</Label>
                                <Input id="description" name="description" placeholder="Un breve resumen..." className="h-10 text-sm bg-[#0A0B0E] border-gray-800 text-white focus-visible:ring-green-500" />
                            </div>
                            <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-green-600 hover:bg-green-500 text-white transition-all shadow-lg shadow-green-500/20">
                                <PlusCircle size={16} />
                                Crear Galería
                            </button>
                        </form>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                    {!seasons || seasons.length === 0 ? (
                        <div className="p-12 text-center rounded-2xl border border-dashed border-gray-800 bg-[#15171C]">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-green-500/10">
                                <Library size={20} className="text-green-500" />
                            </div>
                            <p className="text-lg font-bold text-white mb-1">Sin galerías todavía</p>
                            <p className="text-sm text-gray-500">Crea tu primera serie en el panel izquierdo.</p>
                        </div>
                    ) : (
                        seasons.map((season) => (
                            <div key={season.id} className="rounded-2xl p-5 bg-[#15171C] border border-gray-800 hover:border-gray-700 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-green-500/10 border border-green-500/20">
                                        <Library size={18} className="text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-base mb-1">{season.title}</h3>
                                        {season.description && <p className="text-sm text-gray-500">{season.description}</p>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

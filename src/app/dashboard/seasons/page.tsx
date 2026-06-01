import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSeason } from './actions'
import { Library, PlusCircle, Sparkles } from 'lucide-react'

export default async function SeasonsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id ?? '').maybeSingle()
    if (profile?.role !== 'creator') redirect('/dashboard')

    const { data: seasons } = await supabase
        .from('seasons')
        .select('*')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C9A84C]">Story DNA</p>
                <h1 className="mt-2 text-2xl font-black text-white">Historias / Series</h1>
                <p className="text-sm text-gray-500">Define la promesa, tono y pregunta central de cada historia.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
                    <div className="sticky top-6 rounded-2xl border border-gray-800 bg-[#15171C] p-6 shadow-md">
                        <h2 className="text-base font-black text-white">Nueva historia</h2>
                        <p className="mb-5 text-xs text-gray-500">Crea una serie vendible antes de escribir capitulos.</p>
                        <form action={createSeason} className="space-y-4">
                            <Field name="title" label="Titulo" placeholder="ej. De cero a mi primera libertad" required />
                            <Field name="tagline" label="Linea vendible" placeholder="Una frase que haga abrir el capitulo 1..." />
                            <Field name="description" label="Sinopsis" placeholder="De que trata esta historia..." />
                            <Field name="promise" label="Promesa al lector" placeholder="Lo que el lector se lleva..." />
                            <Field name="central_question" label="Pregunta central" placeholder="Que pregunta mantiene viva la serie..." />
                            <Field name="audience" label="Audiencia ideal" placeholder="Para quien es esta historia..." />
                            <Field name="transformation" label="Transformacion" placeholder="Como cambia el lector al final..." />
                            <Field name="tone" label="Tono" placeholder="confesional, inspirador, oscuro..." />
                            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A84C] py-2.5 text-sm font-black text-[#0D0D0D] transition hover:bg-[#D8BA63]">
                                <PlusCircle size={16} />
                                Crear historia
                            </button>
                        </form>
                    </div>
                </div>

                <div className="space-y-3 md:col-span-2">
                    {!seasons || seasons.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-800 bg-[#15171C] p-12 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9A84C]/10">
                                <Library size={20} className="text-[#C9A84C]" />
                            </div>
                            <p className="mb-1 text-lg font-bold text-white">Sin historias todavia</p>
                            <p className="text-sm text-gray-500">Crea tu primera historia en el panel izquierdo.</p>
                        </div>
                    ) : (
                        seasons.map((season) => (
                            <div key={season.id} className="rounded-2xl border border-gray-800 bg-[#15171C] p-5 transition-colors hover:border-gray-700">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C9A84C]/20 bg-[#C9A84C]/10">
                                        <Sparkles size={18} className="text-[#C9A84C]" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-base font-black text-white">{season.title}</h3>
                                        {season.description && <p className="mt-1 text-sm text-gray-500">{season.description}</p>}
                                        <div className="mt-3 grid gap-2 text-xs text-gray-400 md:grid-cols-2">
                                            {season.promise && <p><span className="font-bold text-[#C9A84C]">Promesa:</span> {season.promise}</p>}
                                            {season.central_question && <p><span className="font-bold text-[#C9A84C]">Pregunta:</span> {season.central_question}</p>}
                                            {season.audience && <p><span className="font-bold text-[#C9A84C]">Para:</span> {season.audience}</p>}
                                            {season.tone && <p><span className="font-bold text-[#C9A84C]">Tono:</span> {season.tone}</p>}
                                        </div>
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

function Field({ name, label, placeholder, required = false }: { name: string; label: string; placeholder: string; required?: boolean }) {
    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="text-sm font-bold text-gray-400">{label}</Label>
            <Input id={name} name={name} required={required} placeholder={placeholder} className="h-10 border-gray-800 bg-[#0A0B0E] text-sm text-white focus-visible:ring-[#C9A84C]" />
        </div>
    )
}

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
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#A63D2D]">Story DNA</p>
                <h1 className="mt-2 font-serif text-4xl font-black text-[#171512]">Historias y novelas</h1>
                <p className="mt-2 text-sm text-[#746A5C]">Define la promesa, el tono y la pregunta central de cada obra.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
                    <div className="sticky top-6 border border-[#171512]/10 bg-[#FFFCF5] p-6">
                        <h2 className="font-serif text-lg font-black text-[#171512]">Nueva obra</h2>
                        <p className="mb-5 text-xs text-[#746A5C]">Organiza la obra antes de escribir sus capítulos.</p>
                        <form action={createSeason} className="space-y-4">
                            <Field name="title" label="Titulo" placeholder="ej. De cero a mi primera libertad" required />
                            <Field name="tagline" label="Linea vendible" placeholder="Una frase que haga abrir el capitulo 1..." />
                            <Field name="description" label="Sinopsis" placeholder="De que trata esta historia..." />
                            <Field name="promise" label="Promesa al lector" placeholder="Lo que el lector se lleva..." />
                            <Field name="central_question" label="Pregunta central" placeholder="Que pregunta mantiene viva la serie..." />
                            <Field name="audience" label="Audiencia ideal" placeholder="Para quien es esta historia..." />
                            <Field name="transformation" label="Transformacion" placeholder="Como cambia el lector al final..." />
                            <Field name="tone" label="Tono" placeholder="confesional, inspirador, oscuro..." />
                            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#A63D2D] py-2.5 text-sm font-black text-white transition hover:bg-[#873023]">
                                <PlusCircle size={16} />
                                Crear historia
                            </button>
                        </form>
                    </div>
                </div>

                <div className="space-y-3 md:col-span-2">
                    {!seasons || seasons.length === 0 ? (
                        <div className="border border-dashed border-[#171512]/18 bg-white/35 p-12 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center bg-[#A63D2D]/8">
                                <Library size={20} className="text-[#A63D2D]" />
                            </div>
                            <p className="mb-1 font-serif text-xl font-black text-[#171512]">Sin obras todavía</p>
                            <p className="text-sm text-[#746A5C]">Crea tu primera historia o novela en el panel izquierdo.</p>
                        </div>
                    ) : (
                        seasons.map((season) => (
                            <div key={season.id} className="border border-[#171512]/10 bg-[#FFFCF5] p-5 transition-colors hover:border-[#A63D2D]/30">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C9A84C]/20 bg-[#C9A84C]/10">
                                        <Sparkles size={18} className="text-[#C9A84C]" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-serif text-lg font-black text-[#171512]">{season.title}</h3>
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
            <Label htmlFor={name} className="text-sm font-bold text-[#574F45]">{label}</Label>
            <Input id={name} name={name} required={required} placeholder={placeholder} className="h-10 border-[#171512]/15 bg-[#F8F4EA] text-sm text-[#171512] placeholder:text-[#9A9082] focus-visible:ring-[#A63D2D]" />
        </div>
    )
}

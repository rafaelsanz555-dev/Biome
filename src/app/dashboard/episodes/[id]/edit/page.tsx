import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EditEpisodeForm } from './EditEpisodeForm'

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditEpisodePage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: episode } = await supabase
        .from('episodes')
        .select('*')
        .eq('id', id)
        .eq('creator_id', user.id)
        .maybeSingle()

    if (!episode) notFound()

    return (
        <div className="space-y-6 max-w-3xl">
            <Link href="/dashboard/episodes" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
                <ArrowLeft size={14} /> Volver a mis historias
            </Link>

            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Editar episodio</h1>
                <p className="text-sm text-gray-500">
                    Cambia título, descripción, portada, monetización o estado de publicación.
                </p>
            </div>

            <EditEpisodeForm episode={episode} />
        </div>
    )
}

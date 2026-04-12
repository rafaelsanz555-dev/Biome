import { createClient } from '@/lib/supabase/server'
import EpisodeForm from './EpisodeForm'
import Link from 'next/link'

export default async function NewEpisodePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch seasons so user can attach episode to an arc
    const { data: seasons } = await supabase
        .from('seasons')
        .select('id, title')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <Link href="/dashboard/episodes" className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 inline-block">&larr; Volver a Episodios</Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Nuevo Episodio</h1>
            </div>

            <EpisodeForm seasons={seasons || []} />
        </div>
    )
}

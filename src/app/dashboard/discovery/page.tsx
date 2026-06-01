import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CreatorCard } from '@/components/CreatorCard'
import { Compass, ArrowRight } from 'lucide-react'

export default async function DashboardDiscoveryPage() {
    const supabase = await createClient()

    const { data: creators } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, story_themes, creators!inner(subscription_price, brand_tagline, posting_frequency, series_status, is_verified_storyteller)')
        .eq('role', 'creator')
        .limit(50)

    return (
        <div className="space-y-7">
            <div className="rounded-3xl border border-[#C9A84C]/18 bg-[#11100E] p-6 text-[#FAF7F0]">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#C9A84C]">
                    <Compass size={16} />
                    Discovery
                </p>
                <h1 className="mt-3 font-serif text-4xl font-black leading-tight">
                    Escritores que el lector puede seguir hoy.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#FAF7F0]/58">
                    Este grid usa perfiles reales. La siguiente version debe rankear por retencion, follows y capitulos completados.
                </p>
            </div>

            {!creators || creators.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-800 bg-[#15171C] p-14 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C9A84C]/10">
                        <Compass size={22} className="text-[#C9A84C]" />
                    </div>
                    <p className="mb-2 text-xl font-black text-white">Sin escritores todavia</p>
                    <p className="text-sm text-gray-400">Cuando existan creadores reales, apareceran aqui.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {creators.map((creator) => (
                        <CreatorCard key={creator.id} creator={creator} />
                    ))}
                </div>
            )}

            <div className="text-center pt-2">
                <Link href="/discover" className="inline-flex items-center gap-2 text-sm font-black text-[#C9A84C] hover:text-[#E2C96E]">
                    Ver discovery publico
                    <ArrowRight size={15} />
                </Link>
            </div>
        </div>
    )
}

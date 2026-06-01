import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { DiscoverGrid } from '@/components/DiscoverGrid'

export default async function DiscoverPage() {
    const supabase = await createClient()

    const { data: creators } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, story_themes, creators!profile_id!inner(subscription_price, brand_tagline, posting_frequency, series_status, is_verified_storyteller)')
        .eq('role', 'creator')
        .limit(100)

    return (
        <div className="min-h-screen bg-[#FAF7F0] text-[#0D0D0D]">
            <Navbar />

            <section className="border-b border-[#0D0D0D]/10 bg-[#FAF7F0] px-4 py-14 sm:px-6 md:py-20">
                <div className="mx-auto max-w-5xl text-center">
                    <p className="text-xs font-black uppercase tracking-[0.26em] text-[#8A6A1C]">Discovery is the moat</p>
                    <h1 className="mx-auto mt-4 max-w-4xl font-serif text-5xl font-black leading-tight text-[#0D0D0D] md:text-7xl">
                        Encuentra escritores que convierten vida en serie.
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#0D0D0D]/64 md:text-lg">
                        Cada card debe vender una voz: quien escribe, que promesa tiene su historia, cual es el primer capitulo gratis y como apoyarlo.
                    </p>
                </div>
            </section>

            <main className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6">
                <DiscoverGrid creators={creators || []} />
            </main>
        </div>
    )
}

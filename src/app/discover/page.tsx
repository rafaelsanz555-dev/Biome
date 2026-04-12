import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { DiscoverGrid } from '@/components/DiscoverGrid'

export default async function DiscoverPage() {
    const supabase = await createClient()

    const { data: creators } = await supabase
        .from('profiles')
        .select('*, creators!inner(subscription_price)')
        .eq('role', 'creator')
        .limit(100)

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
            <Navbar />

            {/* Header */}
            <div
                className="py-16 px-6"
                style={{ borderBottom: '1px solid var(--cream-mid)' }}
            >
                <div className="max-w-6xl mx-auto text-center">
                    <p
                        className="text-xs font-bold tracking-widest uppercase mb-3"
                        style={{ color: 'var(--gold)' }}
                    >
                        Historias que valen la pena
                    </p>
                    <h1
                        className="font-serif font-bold text-4xl md:text-5xl mb-4"
                        style={{ color: 'var(--ink)' }}
                    >
                        Descubre escritores
                    </h1>
                    <p
                        className="text-lg max-w-xl mx-auto leading-relaxed"
                        style={{ color: 'var(--ink-light)' }}
                    >
                        Personas reales compartiendo historias auténticas de vida. Encuentra las que te hablan.
                    </p>
                </div>
            </div>

            {/* Filter pills + grid — client component handles interactivity */}
            <main className="max-w-6xl mx-auto px-6 pb-28">
                <DiscoverGrid creators={creators || []} />
            </main>
        </div>
    )
}

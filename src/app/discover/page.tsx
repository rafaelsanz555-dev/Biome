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
        <div className="min-h-screen bg-[#0A0B0E]">
            <Navbar />

            {/* Header */}
            <div className="bg-[#15171C] border-b border-gray-800/80 py-16 px-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-64 h-64 bg-green-600/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="max-w-3xl mx-auto relative z-10">
                    <p className="text-green-500 font-bold tracking-widest text-xs uppercase mb-3 drop-shadow-sm">
                        Creadores Premium
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Descubre historias reales
                    </h1>
                    <p className="text-gray-400 text-lg max-w-md mx-auto font-medium">
                        Encuentra escritores y sumérgete en sus mundos.
                    </p>
                </div>
            </div>

            {/* Grid */}
            <main className="max-w-6xl mx-auto px-6 py-12 pb-28 relative">
                <DiscoverGrid creators={creators || []} />
            </main>
        </div>
    )
}

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CreatorCard } from '@/components/CreatorCard'
import { Compass, TrendingUp, Flame } from 'lucide-react'

export default async function DashboardDiscoveryPage() {
    const supabase = await createClient()

    const { data: creators } = await supabase
        .from('profiles')
        .select('*, creators!inner(subscription_price)')
        .eq('role', 'creator')
        .limit(50)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-1 text-white flex items-center gap-2">
                    <Compass size={22} className="text-green-500" />
                    Discovery
                </h1>
                <p className="text-sm text-gray-500">Descubre escritores nuevos y voces destacadas.</p>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2">
                <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1.5">
                    <Flame size={12} />
                    Trending
                </button>
                <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#15171C] text-gray-400 border border-gray-800 hover:bg-[#1A1C23] transition">
                    Nuevas voces
                </button>
                <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#15171C] text-gray-400 border border-gray-800 hover:bg-[#1A1C23] transition">
                    <TrendingUp size={12} className="inline mr-1" />
                    Más leídos
                </button>
                <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#15171C] text-gray-400 border border-gray-800 hover:bg-[#1A1C23] transition">
                    Migración
                </button>
                <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#15171C] text-gray-400 border border-gray-800 hover:bg-[#1A1C23] transition">
                    Supervivencia
                </button>
                <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#15171C] text-gray-400 border border-gray-800 hover:bg-[#1A1C23] transition">
                    Amor y Pérdida
                </button>
                <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#15171C] text-gray-400 border border-gray-800 hover:bg-[#1A1C23] transition">
                    Maternidad
                </button>
            </div>

            {/* Grid */}
            {!creators || creators.length === 0 ? (
                <div className="p-14 text-center rounded-2xl border border-dashed border-gray-800 bg-[#15171C]">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-green-500/10">
                        <Compass size={22} className="text-green-500" />
                    </div>
                    <p className="text-xl font-bold mb-2 text-white">Sin escritores todavía</p>
                    <p className="text-sm text-gray-400">Vuelve pronto — los escritores fundadores están llegando.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {creators.map(creator => (
                        <CreatorCard key={creator.id} creator={creator} />
                    ))}
                </div>
            )}

            {/* See all link */}
            <div className="text-center pt-4">
                <Link href="/discover" className="text-sm font-bold text-green-500 hover:text-green-400 transition-colors">
                    Ver todos los escritores →
                </Link>
            </div>
        </div>
    )
}

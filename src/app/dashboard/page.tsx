import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Heart, MessageCircle, Gift, Lock, MoreHorizontal, Crown, Play } from 'lucide-react'
import { ResumeReading } from '@/components/reader/ResumeReading'

function timeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)
    if (mins < 1) return 'ahora'
    if (mins < 60) return `hace ${mins} min`
    if (hours < 24) return `hace ${hours}h`
    if (days < 7) return `hace ${days}d`
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

// Featured stories — shown when real data is thin, creates a vibrant feed
const FEATURED = [
    {
        id: 'feat-1',
        title: 'Cuando dormía en un sofá prestado',
        chapter: 'Capítulo 4 de 12',
        cover: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=600&fit=crop',
        author: 'Rafael Sanz',
        handle: 'rafael',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        time: 'hace 2 días',
        reads: '4.2k',
        comments: 182,
        gifts: 93,
        badges: ['free', 'series'],
        hero: true,
        preview: null,
    },
    {
        id: 'feat-2',
        title: 'Las cartas que nunca le mandé a mi padre',
        chapter: 'Capítulo 3 de 8',
        cover: 'https://images.unsplash.com/photo-1516627145497-ae6968895b40?w=1200&h=500&fit=crop',
        author: 'Carla Mendoza',
        handle: 'carla_m',
        avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&h=200&fit=crop',
        time: 'hace 3 horas',
        reads: '2.8k',
        comments: 97,
        gifts: 147,
        badges: ['top', 'series'],
        hero: false,
        preview: 'Guardé cartas durante ocho años. En cajas, en cajones, en archivos de Word. Nunca se las mandé. Este año decidí abrirlas todas y leerlas una por una...',
    },
    {
        id: 'feat-3',
        title: '3 años sin papeles en Barcelona',
        chapter: 'Capítulo 7 de 15',
        cover: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&h=500&fit=crop',
        author: 'María Santos',
        handle: 'maria_santos',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
        time: 'ayer',
        reads: '1.9k',
        comments: 88,
        gifts: 54,
        badges: ['exclusive'],
        hero: false,
        preview: 'Vivir sin DNI en España es vivir con miedo permanente. Te cuento cómo sobreviví tres años escondiéndome en una ciudad que amé y que me hizo daño...',
    },
    {
        id: 'feat-4',
        title: 'Sobrevivir al cáncer a los 28',
        chapter: 'Capítulo 2 de 10',
        cover: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=1200&h=500&fit=crop',
        author: 'James Okafor',
        handle: 'james_o',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        time: 'hace 2 días',
        reads: '5.1k',
        comments: 234,
        gifts: 312,
        badges: ['top', 'exclusive'],
        hero: false,
        preview: 'El día del diagnóstico no lloré. Lloré tres semanas después, en un McDonalds, mordiendo una papa fría. Así supe que algo se había roto adentro...',
    },
    {
        id: 'feat-5',
        title: 'Fundé mi empresa con $300',
        chapter: 'Capítulo 5 de 12',
        cover: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=500&fit=crop',
        author: 'Ana Reyes',
        handle: 'ana_reyes',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
        time: 'hace 4 días',
        reads: '3.4k',
        comments: 156,
        gifts: 89,
        badges: ['series', 'exclusive'],
        hero: false,
        preview: 'Con dos hijos, sin pareja, y 300 dólares guardados debajo del colchón. Así fundé la empresa que hoy factura $50K al mes. Aquí cómo lo hice paso a paso...',
    },
]

function Badge({ type }: { type: string }) {
    const styles: Record<string, string> = {
        free: 'bg-yellow-600/30 text-yellow-500 border-yellow-500/20',
        series: 'bg-blue-600/30 text-blue-400 border-blue-500/20',
        top: 'bg-red-900/30 text-red-400 border-red-500/20',
        exclusive: 'bg-purple-600/30 text-purple-400 border-purple-500/20',
    }
    const labels: Record<string, React.ReactNode> = {
        free: 'Gratis el primer capítulo',
        series: <><Play size={10} fill="currentColor" className="inline mr-1" /> Series en progreso</>,
        top: <><Crown size={10} className="inline mr-1" /> Top gifted</>,
        exclusive: <><Lock size={10} className="inline mr-1" /> Exclusivo</>,
    }
    return (
        <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase border ${styles[type] || styles.exclusive}`}>
            {labels[type] || type}
        </span>
    )
}

export default async function DashboardHome() {
    const supabase = await createClient()

    const { data: episodes } = await supabase
        .from('episodes')
        .select('id, title, preview_text, cover_image_url, is_subscription_only, ppv_price, created_at, creator_id, profiles:creator_id(username, full_name, avatar_url)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(10)

    const { data: gifts } = await supabase
        .from('gifts')
        .select('post_id')
        .eq('status', 'completed')

    const giftCount: Record<string, number> = {}
    gifts?.forEach(g => { if (g.post_id) giftCount[g.post_id] = (giftCount[g.post_id] || 0) + 1 })

    const realEpisodes = (episodes || []).map((ep: any) => ({
        id: ep.id,
        title: ep.title,
        chapter: null,
        cover: ep.cover_image_url,
        author: ep.profiles?.full_name || ep.profiles?.username || 'Escritor',
        handle: ep.profiles?.username || 'anonimo',
        avatar: ep.profiles?.avatar_url,
        time: timeAgo(ep.created_at),
        reads: '0',
        comments: 0,
        gifts: giftCount[ep.id] || 0,
        badges: [ep.is_subscription_only ? 'exclusive' : 'free'],
        hero: false,
        preview: ep.preview_text,
        realUrl: `/${ep.profiles?.username}/${ep.id}`,
    }))

    // Mix: real episodes first, then featured fill the rest
    const feed = [...realEpisodes, ...FEATURED].slice(0, 8)
    // Make the newest real episode the hero if any, otherwise featured[0]
    if (feed.length > 0) feed[0].hero = true

    return (
        <div className="w-full">
            <div className="px-8 pt-6">
                <div className="flex items-center space-x-8 mb-6 border-b border-[#262626] overflow-x-auto whitespace-nowrap">
                    <button className="pb-4 text-blue-500 border-b-2 border-blue-500 font-medium text-sm">Para ti</button>
                    <button className="pb-4 text-gray-500 hover:text-gray-300 font-medium text-sm transition">Trending</button>
                    <button className="pb-4 text-gray-500 hover:text-gray-300 font-medium text-sm transition">Nuevas voces</button>
                    <button className="pb-4 text-gray-500 hover:text-gray-300 font-medium text-sm transition">Historias reales</button>
                    <button className="pb-4 text-gray-500 hover:text-gray-300 font-medium text-sm transition">Más regaladas</button>
                </div>

                <div className="flex items-center space-x-3 mb-8 overflow-x-auto whitespace-nowrap pb-2">
                    <button className="px-4 py-1.5 bg-[#1E1E1E] hover:bg-[#2D2D2D] border border-[#333] rounded-full text-xs text-gray-300 transition">Gratis el primer capítulo</button>
                    <button className="px-4 py-1.5 bg-[#1E1E1E] hover:bg-[#2D2D2D] border border-[#333] rounded-full text-xs text-gray-300 transition">Series en progreso</button>
                    <button className="px-4 py-1.5 bg-[#1E1E1E] hover:bg-[#2D2D2D] border border-[#333] rounded-full text-xs text-gray-300 transition">Top gifted</button>
                    <button className="px-4 py-1.5 bg-[#1E1E1E] hover:bg-[#2D2D2D] border border-[#333] rounded-full text-xs text-gray-300 transition">Top episodios</button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6">
                {/* Continúa donde lo dejaste */}
                <ResumeReading />
            </div>

            <div className="max-w-3xl mx-auto space-y-6 px-6 pb-20">
                {feed.map((ep: any, idx: number) => {
                    const href = ep.realUrl || `/${ep.handle}`
                    const AvatarFallback = () => (
                        <div className="w-full h-full flex items-center justify-center bg-blue-900/40 text-blue-400 font-bold text-sm">
                            {(ep.author || '?').charAt(0).toUpperCase()}
                        </div>
                    )

                    // Hero card for first item
                    if (idx === 0 && ep.hero) {
                        return (
                            <article key={ep.id} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl overflow-hidden shadow-2xl">
                                <Link href={href} className="block">
                                    <div className="relative h-96 sm:h-[400px]" style={ep.cover ? {} : { background: 'linear-gradient(135deg, #14532d, #052e16)' }}>
                                        {ep.cover && (
                                            <img className="w-full h-full object-cover opacity-80" src={ep.cover} alt={ep.title} />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 w-full p-6">
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {ep.badges.map((b: string) => <Badge key={b} type={b} />)}
                                            </div>
                                            <h2 className="text-3xl font-bold text-white mb-2 leading-tight drop-shadow-md">{ep.title}</h2>
                                            {ep.chapter && (
                                                <p className="text-gray-300 text-sm mb-4 drop-shadow-md">{ep.chapter}</p>
                                            )}

                                            <div className="flex items-center justify-between flex-wrap gap-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-9 h-9 rounded-full border border-gray-600 overflow-hidden bg-[#15171C]">
                                                        {ep.avatar ? <img className="w-full h-full object-cover" src={ep.avatar} alt="" /> : <AvatarFallback />}
                                                    </div>
                                                    <span className="text-sm font-medium text-white">{ep.author}</span>
                                                    <span className="text-xs text-gray-500">· {ep.time}</span>
                                                </div>
                                                <div className="flex items-center space-x-4 text-xs font-medium text-gray-300">
                                                    <span className="flex items-center"><Heart size={14} className="mr-1.5 text-red-500" /> {ep.reads}</span>
                                                    <span className="flex items-center"><MessageCircle size={14} className="mr-1.5 text-gray-400" /> {ep.comments}</span>
                                                    <span className="flex items-center"><Gift size={14} className="mr-1.5 text-yellow-500" /> {ep.gifts}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                <div className="p-5 bg-[#242424] border-t border-[#333]">
                                    <Link href={href}>
                                        <button className="w-full bg-[#1e40af] hover:bg-[#24634c] text-blue-400 font-bold py-3.5 rounded-xl transition text-base tracking-wide shadow-lg border border-blue-500/20">
                                            Leer episodio
                                        </button>
                                    </Link>
                                </div>
                            </article>
                        )
                    }

                    // Compact card
                    return (
                        <article key={ep.id} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl overflow-hidden shadow-2xl p-6 hover:border-[#3D3D3D] transition">
                            <div className="flex items-center justify-between mb-4">
                                <Link href={`/${ep.handle}`} className="flex items-center space-x-3 group">
                                    <div className="w-12 h-12 rounded-full border border-gray-600 overflow-hidden bg-[#15171C] group-hover:border-blue-500 transition">
                                        {ep.avatar ? <img className="w-full h-full object-cover" src={ep.avatar} alt="" /> : <AvatarFallback />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-blue-400 transition">{ep.author}</h3>
                                        <p className="text-xs text-gray-500">{ep.time} · @{ep.handle}</p>
                                    </div>
                                </Link>
                                <button className="text-gray-500 hover:text-white"><MoreHorizontal size={20} /></button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {ep.badges.map((b: string) => <Badge key={b} type={b} />)}
                            </div>

                            <Link href={href}>
                                <h2 className="text-xl font-bold text-white mb-2 leading-snug hover:text-blue-400 transition">{ep.title}</h2>
                            </Link>
                            {ep.preview && (
                                <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">{ep.preview}</p>
                            )}

                            {ep.cover && (
                                <Link href={href}>
                                    <div className="w-full h-56 rounded-xl overflow-hidden mb-4 bg-[#0A0B0E] border border-gray-800 relative group">
                                        <img src={ep.cover} alt="" className="w-full h-full object-cover transition group-hover:scale-105" />
                                        {ep.badges.includes('exclusive') && !ep.badges.includes('free') && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2">
                                                    <Lock size={16} className="text-blue-400" />
                                                    <span className="text-blue-400 font-bold text-sm">Solo suscriptores</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                <div className="flex items-center gap-5 text-xs text-gray-400">
                                    <span className="flex items-center gap-1.5 hover:text-red-500 cursor-pointer transition">
                                        <Heart size={14} /> {ep.reads}
                                    </span>
                                    <span className="flex items-center gap-1.5 hover:text-white cursor-pointer transition">
                                        <MessageCircle size={14} /> {ep.comments}
                                    </span>
                                    <span className="flex items-center gap-1.5 hover:text-yellow-500 cursor-pointer transition">
                                        <Gift size={14} /> {ep.gifts}
                                    </span>
                                </div>
                                <Link href={href} className="text-xs font-bold text-blue-500 hover:text-blue-400 transition">
                                    Leer →
                                </Link>
                            </div>
                        </article>
                    )
                })}
            </div>
        </div>
    )
}

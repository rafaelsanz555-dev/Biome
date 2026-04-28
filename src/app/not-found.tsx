import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { Home, Compass, BookOpen, ArrowRight } from 'lucide-react'

export default async function NotFound() {
    // Cargar 4 creators reales para sugerir
    const supabase = await createClient()
    const { data: suggested } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, bio')
        .eq('role', 'creator')
        .limit(4)

    return (
        <div className="min-h-screen bg-[#0A0B0E] flex flex-col items-center justify-center p-6 selection:bg-blue-500/40 selection:text-white">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 text-center space-y-6 mb-12">
                <h1 className="text-[180px] font-black text-white/5 tracking-tighter mix-blend-overlay -mb-24 leading-none">404</h1>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                    No encontramos esa historia
                </h2>
                <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
                    El perfil o episodio que buscas pudo haber sido movido, eliminado, o quizás nunca existió.
                    <br />
                    <span className="text-zinc-500 text-sm">Tip: los usernames van sin guiones bajos (ej: <code className="text-blue-400 font-mono">anareyes</code>, no <code className="text-red-400 font-mono">ana_reyes</code>)</span>
                </p>

                <div className="flex items-center justify-center gap-3 pt-4">
                    <Link href="/">
                        <Button className="bg-white text-black hover:bg-zinc-200 font-semibold h-11 px-6">
                            <Home size={14} className="mr-2" /> Inicio
                        </Button>
                    </Link>
                    <Link href="/discover">
                        <Button variant="outline" className="border-gray-700 bg-transparent text-white hover:bg-white/5 h-11 px-6">
                            <Compass size={14} className="mr-2" /> Explorar
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Sugerencias de creators reales */}
            {suggested && suggested.length > 0 && (
                <div className="relative z-10 w-full max-w-3xl">
                    <p className="text-center text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-4">
                        O descubre estos escritores
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {suggested.map((c) => {
                            const initial = (c.full_name || c.username).charAt(0).toUpperCase()
                            return (
                                <Link
                                    key={c.username}
                                    href={`/${c.username}`}
                                    className="group p-4 rounded-xl border border-gray-800 bg-[#0F1114] hover:border-blue-500/50 hover:bg-blue-500/5 transition text-center"
                                >
                                    <div className="w-12 h-12 rounded-full mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold overflow-hidden">
                                        {c.avatar_url ? (
                                            <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : initial}
                                    </div>
                                    <p className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition">
                                        {c.full_name || c.username}
                                    </p>
                                    <p className="text-[11px] text-gray-500 truncate">@{c.username}</p>
                                    <ArrowRight size={11} className="mx-auto mt-2 text-gray-600 group-hover:text-blue-400 transition" />
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

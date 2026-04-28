import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { EarningsCalculator } from '@/components/EarningsCalculator'

const CATEGORIES = [
    { label: 'Exclusivos', icon: '💎', gradient: 'linear-gradient(135deg, #1A1C23 0%, #0A0B0E 100%)' },
    { label: 'Historias', icon: '🔥', gradient: 'linear-gradient(135deg, #1A1C23 0%, #0A0B0E 100%)' },
    { label: 'Comunidad', icon: '💬', gradient: 'linear-gradient(135deg, #1A1C23 0%, #0A0B0E 100%)' },
]

const GIFTS = [
    { emoji: '❤️', label: 'Amor', price: 1 },
    { emoji: '🔥', label: 'Fuego', price: 2 },
    { emoji: '👏', label: 'Aplauso', price: 3 },
    { emoji: '⭐', label: 'Estrella', price: 5 },
    { emoji: '💎', label: 'Diamante', price: 10 },
    { emoji: '👑', label: 'Corona', price: 25 },
    { emoji: '🚀', label: 'Cohete', price: 50 },
]

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0A0B0E] text-gray-100 font-sans selection:bg-blue-500/30">
            <Navbar />

            {/* ── HERO ──────────────────────────────────────────── */}
            <section className="relative overflow-hidden border-b border-gray-800/60 pb-20 pt-24 md:pb-32 md:pt-36">
                {/* Background ambient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-8 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        La red social premium para creadores
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
                        Tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-400">historia.</span><br />
                        Tus ingresos.
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        Sube publicaciones exclusivas, crea tu comunidad y recibe apoyo directo. 
                        Tus fans más leales pagarán por ver lo que tienes que contar.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 h-14 text-base rounded-xl shadow-[0_0_40px_-10px_rgba(37, 99, 235,0.5)] transition-all hover:scale-105 w-full">
                                Crear mi perfil — $5/mes
                            </Button>
                        </Link>
                        <Link href="/discover" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="border-gray-700 bg-[#15171C] text-gray-300 hover:bg-gray-800 hover:text-white font-bold px-10 h-14 text-base rounded-xl w-full">
                                Explorar creadores
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FEED PREVIEW (MOCK) ────────────────────────── */}
            <section className="py-20 px-6 border-b border-gray-800/60 bg-[#0A0B0E]">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-white">Un feed exclusivo para tus fans</h2>
                        <p className="text-gray-500 mt-2">Fotos, textos largos y propinas en cada publicación.</p>
                    </div>

                    {/* Fake Post Card */}
                    <div className="bg-[#15171C] border border-gray-800 rounded-2xl p-5 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-blue-400 p-0.5">
                                <div className="w-full h-full bg-[#15171C] rounded-full flex items-center justify-center font-bold text-lg">M</div>
                            </div>
                            <div>
                                <p className="font-bold text-white leading-tight">Maria Stories</p>
                                <p className="text-xs text-gray-500">Ayer a las 10:30 PM • Solo subscriptores</p>
                            </div>
                        </div>
                        <p className="text-gray-300 mb-4 leading-relaxed">
                            Hoy tomé la decisión más difícil de mi vida. Empaqué todo en dos maletas y dejé mi apartamento. Para todos los que estuvieron apoyándome en este proceso, aquí les cuento la historia completa y lo que viene...
                        </p>
                        <div className="w-full h-48 bg-[#0A0B0E] rounded-xl flex items-center justify-center border border-gray-800 mb-4 overflow-hidden relative">
                            {/* Blur mockup */}
                            <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-xl"></div>
                            <span className="relative text-blue-400 font-bold flex items-center gap-2">
                                🔒 Contenido bloqueado
                            </span>
                        </div>
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-800/80">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5 font-bold">
                                ❤️ Me gusta
                            </Button>
                            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 font-bold ml-auto">
                                🎁 Enviar propina
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── EARNINGS CALCULATOR ──────────────────────────── */}
            <EarningsCalculator />

            {/* ── GIFTS ─────────────────────────────────────────── */}
            <section className="py-24 px-6 border-b border-gray-800/60 bg-[#0A0B0E] relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <p className="text-xs font-bold tracking-widest uppercase text-blue-500 mb-3">
                        Monetización Directa
                    </p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Convierten su aprecio en ingresos
                    </h2>
                    <p className="text-gray-400 mb-14 text-lg leading-relaxed max-w-2xl mx-auto">
                        Tus seguidores pueden enviarte regalos directamente en cualquier publicación. 
                        Recibes el 88% de cada transacción de forma transparente.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        {GIFTS.map((g) => (
                            <div
                                key={g.label}
                                className="flex flex-col items-center gap-2 px-6 py-5 rounded-2xl bg-[#15171C] border border-gray-800 hover:border-blue-500/50 hover:bg-[#1A1C23] transition-all cursor-default w-32"
                            >
                                <span className="text-4xl drop-shadow-lg mb-2">{g.emoji}</span>
                                <span className="text-xs font-bold text-gray-500 tracking-wide uppercase">{g.label}</span>
                                <span className="text-lg font-black text-white">${g.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRICING ───────────────────────────────────────── */}
            <section className="py-24 px-6 bg-[#15171C]">
                <div className="max-w-lg mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Todo lo que necesitas.</h2>
                    <p className="text-gray-400 mb-10 text-lg">Eres dueño de tu contenido y de tus ganancias.</p>

                    <div className="bg-[#0A0B0E] border border-gray-800 rounded-[2rem] p-8 text-left shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>
                        
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-6xl font-black text-white">$5</span>
                            <span className="text-gray-500 mb-2 text-xl font-medium">/ mes</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-8 font-medium">Suscripción para creadores. 0% de comisión en tus subs.</p>

                        <ul className="space-y-4 mb-10">
                            {[
                                'Perfil público estilo red social',
                                'Publicaciones con fotos (hasta 10)',
                                'Bloqueo de contenido para subs',
                                'Recibe regalos y propinas ($1 - $50)',
                                'Tú defines el precio de tu membresía',
                                'Panel de control y ganancias',
                            ].map(item => (
                                <li key={item} className="flex items-start gap-4 text-gray-300 font-medium">
                                    <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <Link href="/login" className="block">
                            <Button size="lg" className="w-full bg-white text-black hover:bg-gray-200 font-bold h-14 text-base rounded-xl transition-all">
                                Crear mi cuenta →
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="bg-[#0A0B0E] py-12 px-6 border-t border-gray-800/60">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-2xl font-bold text-white tracking-tight">bio<span className="text-blue-500">.me</span></p>
                    <p className="text-sm font-medium text-gray-600">© 2026 bio.me · Premium Social Feed</p>
                </div>
            </footer>
        </div>
    )
}

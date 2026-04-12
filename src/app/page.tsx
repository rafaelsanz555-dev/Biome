import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'

const STORY_CATEGORIES = [
    {
        label: 'Migración',
        description: 'Dejarlo todo atrás para empezar de nuevo.',
        gradient: 'linear-gradient(160deg, #0A0C14 0%, #1A2A4A 50%, #2A4A7A 100%)',
    },
    {
        label: 'Supervivencia',
        description: 'Cuando la vida te pone a prueba al límite.',
        gradient: 'linear-gradient(160deg, #140402 0%, #4A1208 50%, #8A2A10 100%)',
    },
    {
        label: 'Amor y Pérdida',
        description: 'Las historias que nos rompen y nos rehacen.',
        gradient: 'linear-gradient(160deg, #0E040C 0%, #3A0A32 50%, #7A1460 100%)',
    },
    {
        label: 'Construyendo',
        description: 'De cero a algo real.',
        gradient: 'linear-gradient(160deg, #0A0C02 0%, #2A3A0A 50%, #5A7A14 100%)',
    },
    {
        label: 'Maternidad',
        description: 'La epopeya más poco contada de la historia.',
        gradient: 'linear-gradient(160deg, #100804 0%, #3A200A 50%, #7A4A14 100%)',
    },
    {
        label: 'Comenzar de nuevo',
        description: 'El coraje de empezar a cualquier edad.',
        gradient: 'linear-gradient(160deg, #04100E 0%, #0A3A30 50%, #146A54 100%)',
    },
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

const STEPS = [
    {
        number: '01',
        title: 'Escribe tu historia',
        desc: 'Publica episodios de tu vida — momentos del día a día, grandes capítulos, verdades sin filtro. Texto y fotos, sin mínimo.',
    },
    {
        number: '02',
        title: 'Engancha gratis',
        desc: 'Tu primer capítulo siempre es gratis. Los lectores se enganchan. Luego pagan para seguir leyendo.',
    },
    {
        number: '03',
        title: 'Gana desde el primer día',
        desc: 'Suscripciones, regalos y propinas — dinero real de personas que aman tu historia.',
    },
]

export default function LandingPage() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
            <Navbar />

            {/* ── Hero ─────────────────────────────────────────── */}
            <section className="relative overflow-hidden py-28 px-6">
                {/* Warm glow — subtle, not heavy */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(201,168,76,0.07) 0%, transparent 100%)',
                    }}
                />

                <div className="max-w-4xl mx-auto text-center relative">
                    {/* Eyebrow label */}
                    <div
                        className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-8 px-4 py-2 rounded-full"
                        style={{
                            backgroundColor: 'var(--gold-bg)',
                            color: 'var(--gold-dark)',
                            border: '1px solid var(--cream-mid)',
                        }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: 'var(--gold)' }}
                        />
                        La plataforma para escritores
                    </div>

                    {/* Main headline — Playfair, the identity piece */}
                    <h1 className="font-serif font-bold leading-[1.1] mb-6" style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', color: 'var(--ink)' }}>
                        Tu vida merece ser leída.
                        <br />
                        <em style={{ color: 'var(--gold-warm)', fontStyle: 'italic' }}>Y merece ser pagada.</em>
                    </h1>

                    <p
                        className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
                        style={{ color: 'var(--ink-light)' }}
                    >
                        bio.me es la única plataforma construida exclusivamente para escritores —
                        publica tu vida en capítulos, construye una audiencia fiel
                        y gana ingresos reales de quienes no pueden dejar de leerte.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login">
                            <Button
                                size="lg"
                                className="font-bold px-10 h-14 text-base w-full sm:w-auto rounded-xl transition-all hover:opacity-85"
                                style={{
                                    backgroundColor: 'var(--ink)',
                                    color: 'var(--cream)',
                                    border: 'none',
                                    boxShadow: '0 4px 24px rgba(20,16,10,0.18)',
                                }}
                            >
                                Empieza a escribir — $5/mes
                            </Button>
                        </Link>
                        <Link href="/discover">
                            <Button
                                size="lg"
                                variant="outline"
                                className="font-semibold px-10 h-14 text-base w-full sm:w-auto rounded-xl"
                                style={{
                                    borderColor: 'var(--cream-mid)',
                                    color: 'var(--ink)',
                                    backgroundColor: 'transparent',
                                }}
                            >
                                Explorar historias
                            </Button>
                        </Link>
                    </div>

                    <p className="text-sm mt-6" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>
                        Sin compromiso a largo plazo · Cancela cuando quieras
                    </p>
                </div>
            </section>

            {/* ── Story Categories ─────────────────────────────── */}
            <section className="py-20 px-6" style={{ borderTop: '1px solid var(--cream-mid)' }}>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <p
                            className="text-xs font-bold tracking-widest uppercase mb-3"
                            style={{ color: 'var(--gold)' }}
                        >
                            Historias que importan
                        </p>
                        <h2
                            className="font-serif font-bold text-3xl md:text-4xl"
                            style={{ color: 'var(--ink)' }}
                        >
                            Toda vida tiene capítulos que merecen ser compartidos
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {STORY_CATEGORIES.map((cat) => (
                            <Link href="/discover" key={cat.label} className="group block">
                                <div
                                    className="relative h-40 md:h-48 rounded-2xl overflow-hidden flex flex-col justify-end p-5 transition-transform duration-300 group-hover:-translate-y-0.5"
                                    style={{
                                        background: cat.gradient,
                                        boxShadow: '0 4px 20px rgba(20,16,10,0.12)',
                                    }}
                                >
                                    <p className="font-serif font-bold text-lg text-white leading-tight mb-1">
                                        {cat.label}
                                    </p>
                                    <p className="text-xs leading-snug hidden md:block" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                        {cat.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Earnings Proof — ONE dark section ────────────── */}
            <section
                className="py-24 px-6"
                style={{ backgroundColor: 'var(--dark-section)' }}
            >
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <p
                            className="text-xs font-bold tracking-widest uppercase mb-3"
                            style={{ color: 'var(--gold)' }}
                        >
                            El cálculo es simple
                        </p>
                        <h2
                            className="font-serif font-bold text-3xl md:text-4xl text-white"
                        >
                            Ingresos reales de quienes<br />aman tu historia
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                scenario: '100 suscriptores',
                                price: '$8/mes',
                                monthly: '$720/mes',
                                sub: '+ regalos encima',
                            },
                            {
                                scenario: '500 suscriptores',
                                price: '$10/mes',
                                monthly: '$4,500/mes',
                                sub: 'Ingreso de tiempo completo',
                                featured: true,
                            },
                            {
                                scenario: '1,000 suscriptores',
                                price: '$12/mes',
                                monthly: '$10,560/mes',
                                sub: 'Que cambia tu vida',
                            },
                        ].map((item) => (
                            <div
                                key={item.scenario}
                                className="rounded-2xl p-7 text-center"
                                style={{
                                    backgroundColor: item.featured ? 'rgba(201,168,76,0.12)' : 'var(--dark-card)',
                                    border: item.featured
                                        ? '1px solid rgba(201,168,76,0.35)'
                                        : '1px solid var(--dark-border)',
                                }}
                            >
                                <p
                                    className="text-xs font-semibold tracking-wider uppercase mb-4"
                                    style={{ color: item.featured ? 'var(--gold)' : 'rgba(255,255,255,0.4)' }}
                                >
                                    {item.scenario}
                                </p>
                                <p
                                    className="text-sm mb-2"
                                    style={{ color: 'rgba(255,255,255,0.5)' }}
                                >
                                    @ {item.price} promedio
                                </p>
                                <p
                                    className="font-serif font-bold text-4xl mb-2"
                                    style={{ color: item.featured ? 'var(--gold-warm)' : 'white' }}
                                >
                                    {item.monthly}
                                </p>
                                <p
                                    className="text-sm"
                                    style={{ color: 'rgba(255,255,255,0.4)' }}
                                >
                                    {item.sub}
                                </p>
                            </div>
                        ))}
                    </div>

                    <p
                        className="text-center text-xs mt-8"
                        style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                        Tú te quedas el 88% de cada regalo · Comisión de plataforma: 10% en suscripciones
                    </p>
                </div>
            </section>

            {/* ── How it Works ─────────────────────────────────── */}
            <section className="py-24 px-6" style={{ backgroundColor: 'var(--cream)' }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <p
                            className="text-xs font-bold tracking-widest uppercase mb-3"
                            style={{ color: 'var(--gold)' }}
                        >
                            Cómo funciona
                        </p>
                        <h2
                            className="font-serif font-bold text-3xl md:text-4xl"
                            style={{ color: 'var(--ink)' }}
                        >
                            Tres pasos hacia un ingreso<br />desde tu historia
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {STEPS.map((step) => (
                            <div key={step.number} className="flex flex-col">
                                <span
                                    className="font-serif font-bold text-5xl mb-4 leading-none"
                                    style={{ color: 'var(--cream-mid)' }}
                                >
                                    {step.number}
                                </span>
                                <h3
                                    className="font-serif font-semibold text-xl mb-3"
                                    style={{ color: 'var(--ink)' }}
                                >
                                    {step.title}
                                </h3>
                                <p
                                    className="text-sm leading-relaxed"
                                    style={{ color: 'var(--ink-light)' }}
                                >
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Gifts ────────────────────────────────────────── */}
            <section
                className="py-20 px-6"
                style={{
                    backgroundColor: 'var(--cream-dark)',
                    borderTop: '1px solid var(--cream-mid)',
                    borderBottom: '1px solid var(--cream-mid)',
                }}
            >
                <div className="max-w-3xl mx-auto text-center">
                    <p
                        className="text-xs font-bold tracking-widest uppercase mb-3"
                        style={{ color: 'var(--gold)' }}
                    >
                        Apreciación en dinero real
                    </p>
                    <h2
                        className="font-serif font-bold text-3xl mb-3"
                        style={{ color: 'var(--ink)' }}
                    >
                        Los lectores te regalan dinero de verdad
                    </h2>
                    <p
                        className="text-base mb-10"
                        style={{ color: 'var(--ink-light)' }}
                    >
                        Cuando tu historia impacta de verdad, lo hacen llover. Cada emoji es dinero real.
                    </p>

                    <div className="flex flex-wrap justify-center gap-3">
                        {GIFTS.map((g) => (
                            <div
                                key={g.label}
                                className="flex flex-col items-center gap-1.5 px-5 py-4 rounded-2xl cursor-default transition-all"
                                style={{
                                    backgroundColor: 'var(--cream)',
                                    border: '1px solid var(--cream-mid)',
                                }}
                            >
                                <span className="text-3xl">{g.emoji}</span>
                                <span
                                    className="text-xs font-semibold"
                                    style={{ color: 'var(--ink-light)' }}
                                >
                                    {g.label}
                                </span>
                                <span
                                    className="text-sm font-bold"
                                    style={{ color: 'var(--gold-dark)' }}
                                >
                                    ${g.price}
                                </span>
                            </div>
                        ))}
                    </div>

                    <p
                        className="text-xs mt-6"
                        style={{ color: 'var(--ink-light)', opacity: 0.6 }}
                    >
                        Tú te quedas el 88% de cada regalo · Sin límite en lo que puedes ganar
                    </p>
                </div>
            </section>

            {/* ── Pricing ──────────────────────────────────────── */}
            <section className="py-24 px-6" style={{ backgroundColor: 'var(--cream)' }}>
                <div className="max-w-lg mx-auto">
                    <div className="text-center mb-12">
                        <p
                            className="text-xs font-bold tracking-widest uppercase mb-3"
                            style={{ color: 'var(--gold)' }}
                        >
                            Precio
                        </p>
                        <h2
                            className="font-serif font-bold text-3xl"
                            style={{ color: 'var(--ink)' }}
                        >
                            Un precio. Historias ilimitadas.
                        </h2>
                    </div>

                    <div
                        className="rounded-3xl p-8"
                        style={{
                            backgroundColor: 'white',
                            border: '1px solid var(--cream-mid)',
                            boxShadow: '0 8px 40px rgba(20,16,10,0.08)',
                        }}
                    >
                        <div className="flex items-end gap-2 mb-2">
                            <span
                                className="font-serif font-black text-6xl"
                                style={{ color: 'var(--ink)', lineHeight: 1 }}
                            >
                                $5
                            </span>
                            <span
                                className="mb-2 text-lg"
                                style={{ color: 'var(--ink-light)' }}
                            >
                                / mes
                            </span>
                        </div>
                        <p
                            className="text-sm mb-8"
                            style={{ color: 'var(--ink-light)' }}
                        >
                            Para escritores. Los lectores siempre leen gratis.
                        </p>

                        <ul className="space-y-3 mb-8">
                            {[
                                'Publicaciones y episodios ilimitados',
                                'Subida de fotos en cada publicación',
                                'Tu propia página de perfil pública',
                                'Sistema de regalos — tú te quedas el 88%',
                                'Herramientas de gestión de suscriptores',
                                'Panel de ganancias en tiempo real',
                                'Cancela cuando quieras, sin penalizaciones',
                            ].map((item) => (
                                <li
                                    key={item}
                                    className="flex items-center gap-3 text-sm font-medium"
                                    style={{ color: 'var(--ink)' }}
                                >
                                    <span
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                        style={{
                                            backgroundColor: 'var(--gold-bg)',
                                            color: 'var(--gold-dark)',
                                        }}
                                    >
                                        ✓
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <Link href="/login" className="block">
                            <Button
                                size="lg"
                                className="w-full font-bold h-14 text-base rounded-xl transition-all hover:opacity-85"
                                style={{
                                    backgroundColor: 'var(--ink)',
                                    color: 'var(--cream)',
                                    border: 'none',
                                    boxShadow: '0 4px 24px rgba(20,16,10,0.18)',
                                }}
                            >
                                Empieza a escribir hoy
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Final CTA ────────────────────────────────────── */}
            <section
                className="py-24 px-6 text-center"
                style={{
                    backgroundColor: 'var(--cream-dark)',
                    borderTop: '1px solid var(--cream-mid)',
                }}
            >
                <div className="max-w-2xl mx-auto">
                    <h2
                        className="font-serif font-bold text-4xl md:text-5xl mb-6 leading-tight"
                        style={{ color: 'var(--ink)' }}
                    >
                        Tu historia lleva<br />
                        <em style={{ color: 'var(--gold-warm)', fontStyle: 'italic' }}>demasiado tiempo esperando.</em>
                    </h2>
                    <p
                        className="text-lg mb-10"
                        style={{ color: 'var(--ink-light)' }}
                    >
                        Únete a bio.me y convierte la vida que has vivido en los ingresos que mereces.
                    </p>
                    <Link href="/login">
                        <Button
                            size="lg"
                            className="font-bold px-12 h-14 text-base rounded-xl transition-all hover:opacity-85"
                            style={{
                                backgroundColor: 'var(--ink)',
                                color: 'var(--cream)',
                                border: 'none',
                                boxShadow: '0 4px 24px rgba(20,16,10,0.18)',
                            }}
                        >
                            Comienza tu historia
                        </Button>
                    </Link>
                </div>
            </section>

            {/* ── Footer ───────────────────────────────────────── */}
            <footer
                className="py-12 px-6"
                style={{ backgroundColor: 'var(--dark-section)' }}
            >
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <Link href="/" className="flex items-center gap-0">
                        <span className="font-serif text-2xl font-bold" style={{ color: 'var(--cream)' }}>
                            bio
                        </span>
                        <span className="font-serif text-2xl font-bold" style={{ color: 'var(--gold)' }}>
                            .me
                        </span>
                    </Link>

                    <div className="flex items-center gap-8">
                        <Link
                            href="/discover"
                            className="text-sm transition-colors"
                            style={{ color: 'rgba(250,247,240,0.45)' }}
                        >
                            Descubrir
                        </Link>
                        <Link
                            href="/login"
                            className="text-sm transition-colors"
                            style={{ color: 'rgba(250,247,240,0.45)' }}
                        >
                            Empieza a escribir
                        </Link>
                    </div>

                    <p className="text-sm" style={{ color: 'rgba(250,247,240,0.3)' }}>
                        © 2026 bio.me · Tu historia. Tus ingresos.
                    </p>
                </div>
            </footer>
        </div>
    )
}

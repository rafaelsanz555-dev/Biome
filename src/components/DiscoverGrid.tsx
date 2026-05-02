'use client'

import { useState } from 'react'
import { CreatorCard } from '@/components/CreatorCard'
import Link from 'next/link'

interface Creator {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
    bio: string | null
    creators?: { subscription_price: number | null } | null
}

interface DiscoverGridProps {
    creators: Creator[]
}

const FILTERS = [
    { label: 'Todos', key: 'all', keywords: [] },
    { label: 'Migración', key: 'migration', keywords: ['migra', 'immigra', 'moving', 'moved', 'leaving', 'left my country', 'expat', 'border', 'venezuel', 'barcelona', 'emigr', 'país', 'extranjero', 'frontera'] },
    { label: 'Supervivencia', key: 'survival', keywords: ['surviv', 'cancer', 'trauma', 'abuse', 'escap', 'disease', 'illness', 'addict', 'recover', 'diagnós', 'quimio', 'depresión', 'sobreviv', 'enferm'] },
    { label: 'Amor y Pérdida', key: 'love', keywords: ['love', 'loss', 'grief', 'heartbreak', 'divorce', 'mourn', 'widow', 'breakup', 'relationship', 'divorci', 'pérdida', 'duelo', 'amor', 'corazón'] },
    { label: 'Negocios', key: 'business', keywords: ['business', 'startup', 'entrepreneur', 'founder', 'built', 'company', 'brand', 'hustle', 'freelan', 'negocio', 'empren', 'fundé', 'empresa', 'cliente'] },
    { label: 'Maternidad', key: 'motherhood', keywords: ['mother', ' mom', 'mama', 'parent', 'child', 'baby', 'pregnan', 'daughter', 'son', 'family', 'mamá', 'madre', 'hijo', 'hija', 'bebé', 'familia'] },
    { label: 'Comenzar de Nuevo', key: 'starting', keywords: ['start over', 'restart', 'rebuild', 'new life', 'new chapter', 'after divorce', 'after loss', 'second chance', 'reinvent', 'empezar de cero', 'nueva vida', 'nuevo comienzo', 'volver a empezar'] },
]

const CATEGORY_CARDS = [
    {
        key: 'migration',
        label: 'Migración',
        desc: 'Historias de quienes cruzaron fronteras buscando una vida mejor.',
        gradient: 'linear-gradient(170deg, #0A0A1A 0%, #1A2A4A 50%, #2A4A7A 100%)',
        icon: '✈',
    },
    {
        key: 'survival',
        label: 'Supervivencia',
        desc: 'Enfermedades, traumas, adicciones. El viaje de volver a estar entero.',
        gradient: 'linear-gradient(170deg, #140402 0%, #4A1208 50%, #8A2A10 100%)',
        icon: '🔥',
    },
    {
        key: 'love',
        label: 'Amor y Pérdida',
        desc: 'Divorcios, duelos, corazones rotos — y lo que aprendiste de ellos.',
        gradient: 'linear-gradient(170deg, #0E040C 0%, #3A0A32 50%, #7A1460 100%)',
        icon: '♡',
    },
    {
        key: 'business',
        label: 'Negocios',
        desc: 'Fundaste algo. Fracasaste. Volviste a intentar. Esa historia importa.',
        gradient: 'linear-gradient(170deg, #0A0C02 0%, #2A3A0A 50%, #5A7A14 100%)',
        icon: '◈',
    },
    {
        key: 'motherhood',
        label: 'Maternidad',
        desc: 'La crianza sin filtros. El amor más grande y más complicado.',
        gradient: 'linear-gradient(170deg, #100804 0%, #3A200A 50%, #7A4A14 100%)',
        icon: '◉',
    },
    {
        key: 'starting',
        label: 'Comenzar de Nuevo',
        desc: 'A los 30, 40, 50. Después de todo. Nuevos comienzos reales.',
        gradient: 'linear-gradient(170deg, #04100E 0%, #0A3A30 50%, #146A54 100%)',
        icon: '◆',
    },
]

function matchesFilter(creator: Creator, filterKey: string): boolean {
    if (filterKey === 'all') return true
    const filter = FILTERS.find(f => f.key === filterKey)
    if (!filter || filter.keywords.length === 0) return true
    const bio = (creator.bio || '').toLowerCase()
    const name = (creator.full_name || creator.username || '').toLowerCase()
    const text = bio + ' ' + name
    return filter.keywords.some(kw => text.includes(kw.toLowerCase()))
}

export function DiscoverGrid({ creators }: DiscoverGridProps) {
    const [active, setActive] = useState('all')

    const filtered = creators.filter(c => matchesFilter(c, active))
    const hasWriters = creators.length > 0

    // ── Empty state: no writers in DB at all ───────────────────────────────
    if (!hasWriters) {
        return (
            <div className="mt-12">
                {/* Founding Writers Banner */}
                <div className="rounded-2xl p-8 md:p-10 mb-10 text-center bg-gradient-to-br from-blue-600/10 via-[#0F1114] to-[#0A0B0E] border border-blue-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                        <p className="text-xs font-bold tracking-widest uppercase mb-3 text-blue-400">
                            ◆  Escritores fundadores
                        </p>
                        <h2 className="font-bold text-2xl md:text-3xl mb-3 text-white" style={{ fontFamily: 'Georgia, "Playfair Display", serif' }}>
                            Los primeros escritores están llegando
                        </h2>
                        <p className="text-sm leading-relaxed mb-6 max-w-md mx-auto text-gray-300">
                            Sé parte de los primeros 300 Founding Storytellers de bio.me. Plan gratuito de por vida + badge permanente. Tu historia empieza aquí.
                        </p>
                        <Link href="/login">
                            <button className="font-bold px-8 py-3 rounded-xl text-sm transition bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                                Únete como Founding Storyteller →
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Category Cards Grid */}
                <p
                    className="text-xs font-bold tracking-widest uppercase text-center mb-6"
                    style={{ color: 'var(--ink-light)' }}
                >
                    Categorías que pronto tendrán historias
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {CATEGORY_CARDS.map((cat) => (
                        <div
                            key={cat.key}
                            className="rounded-2xl overflow-hidden"
                            style={{
                                background: cat.gradient,
                                border: '1px solid rgba(255,255,255,0.06)',
                                minHeight: '160px',
                            }}
                        >
                            <div className="p-6 h-full flex flex-col justify-between" style={{ minHeight: '160px' }}>
                                <div>
                                    <p
                                        className="text-2xl mb-3"
                                        style={{ color: 'rgba(255,255,255,0.7)' }}
                                    >
                                        {cat.icon}
                                    </p>
                                    <h3
                                        className="font-serif font-bold text-lg mb-2"
                                        style={{ color: 'rgba(255,255,255,0.95)' }}
                                    >
                                        {cat.label}
                                    </h3>
                                    <p
                                        className="text-sm leading-relaxed"
                                        style={{ color: 'rgba(255,255,255,0.55)' }}
                                    >
                                        {cat.desc}
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <span
                                        className="text-xs font-bold tracking-wide uppercase px-3 py-1 rounded-full"
                                        style={{
                                            backgroundColor: 'rgba(201,168,76,0.15)',
                                            color: 'rgba(201,168,76,0.8)',
                                            border: '1px solid rgba(201,168,76,0.2)',
                                        }}
                                    >
                                        Próximamente
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // ── Normal state: writers exist ────────────────────────────────────────
    return (
        <>
            {/* Filter pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setActive(f.key)}
                        className="text-xs font-semibold px-4 py-2 rounded-full transition-all"
                        style={
                            active === f.key
                                ? {
                                    backgroundColor: 'var(--ink)',
                                    color: 'var(--cream)',
                                    border: '1px solid var(--ink)',
                                }
                                : {
                                    backgroundColor: 'transparent',
                                    color: 'var(--ink-light)',
                                    border: '1px solid var(--cream-mid)',
                                }
                        }
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Count indicator */}
            {active !== 'all' && (
                <p
                    className="text-center text-xs mt-3"
                    style={{ color: 'var(--ink-light)', opacity: 0.7 }}
                >
                    {filtered.length === 0
                        ? 'Sin escritores en esta categoría todavía'
                        : `${filtered.length} escritor${filtered.length !== 1 ? 'es' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
                </p>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-10">
                {filtered.map(creator => (
                    <CreatorCard key={creator.id} creator={creator} />
                ))}

                {filtered.length === 0 && (
                    <div className="col-span-full py-28 text-center">
                        <p
                            className="font-serif text-2xl font-semibold mb-3"
                            style={{ color: 'var(--ink)' }}
                        >
                            {active === 'all'
                                ? 'Sin escritores todavía.'
                                : `Sin escritores de ${FILTERS.find(f => f.key === active)?.label} todavía.`}
                        </p>
                        <p
                            className="text-base mb-8"
                            style={{ color: 'var(--ink-light)' }}
                        >
                            {active === 'all'
                                ? 'Sé el primero en compartir tu historia.'
                                : 'Sé el primer escritor de esta categoría.'}
                        </p>
                        <Link href="/login">
                            <button
                                className="font-bold px-8 py-3 rounded-xl text-sm transition-all hover:opacity-85"
                                style={{
                                    backgroundColor: 'var(--ink)',
                                    color: 'var(--cream)',
                                    border: 'none',
                                }}
                            >
                                Únete como escritor
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}

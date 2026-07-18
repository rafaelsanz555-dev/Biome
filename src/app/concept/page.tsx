'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
    ArrowLeft,
    ArrowRight,
    Bell,
    BookMarked,
    BookOpen,
    Bookmark,
    Check,
    ChevronRight,
    CircleUserRound,
    Clock3,
    Compass,
    Ellipsis,
    Feather,
    Heart,
    Home,
    MessageCircle,
    PenLine,
    Plus,
    Search,
    Share2,
    Sparkles,
    TrendingUp,
    Users,
} from 'lucide-react'

type ViewId = 'home' | 'discover' | 'story' | 'studio'
type FilterId = 'Todo' | 'Vida real' | 'Ficción' | 'Breves'

const coverAssets = {
    house: '/covers/la-casa-que-dejamos-atras.webp',
    winters: '/covers/los-inviernos-de-abril.webp',
    reinvention: '/covers/volver-a-empezar-a-los-42.webp',
    garden: '/covers/el-jardin-de-las-promesas.webp',
    kitchen: '/covers/notas-desde-una-cocina-prestada.webp',
    city: '/covers/la-ciudad-bajo-el-agua.webp',
}

const discoveryStories = [
    {
        title: 'La casa que dejamos atrás',
        author: 'María Santos',
        category: 'Vida real',
        detail: 'Migración',
        chapters: 12,
        readers: '8.4k',
        image: coverAssets.house,
        tone: '#7D382B',
    },
    {
        title: 'Los inviernos de abril',
        author: 'James Okafor',
        category: 'Ficción',
        detail: 'Drama',
        chapters: 28,
        readers: '12.1k',
        image: coverAssets.winters,
        tone: '#334B62',
    },
    {
        title: 'Volver a empezar a los 42',
        author: 'Ana Reyes',
        category: 'Vida real',
        detail: 'Reinvención',
        chapters: 9,
        readers: '6.7k',
        image: coverAssets.reinvention,
        tone: '#78613A',
    },
    {
        title: 'El jardín de las promesas',
        author: 'Lena Kim',
        category: 'Ficción',
        detail: 'Romance',
        chapters: 34,
        readers: '18.9k',
        image: coverAssets.garden,
        tone: '#783A46',
    },
    {
        title: 'Notas desde una cocina prestada',
        author: 'Sofía Herrera',
        category: 'Breves',
        detail: 'Diario',
        chapters: 17,
        readers: '4.2k',
        image: coverAssets.kitchen,
        tone: '#355846',
    },
    {
        title: 'La ciudad bajo el agua',
        author: 'Mateo Silva',
        category: 'Ficción',
        detail: 'Fantasía',
        chapters: 41,
        readers: '21.5k',
        image: coverAssets.city,
        tone: '#263E58',
    },
]

const feedEntries = [
    {
        author: 'Ana Reyes',
        handle: '@anareyes',
        initials: 'AR',
        color: '#A63D2D',
        kind: 'Entrada de hoy',
        title: 'Hoy firmé el contrato del local que no podía pagar hace dos años',
        excerpt: 'No fue valentía. Fue cansancio de seguir esperando a sentirme lista. Mi hija llevó una caja vacía y dijo: aquí va la primera venta.',
        meta: '4 min de lectura',
        reactions: 482,
        comments: 39,
    },
    {
        author: 'James Okafor',
        handle: '@jamesokafor',
        initials: 'JO',
        color: '#355846',
        kind: 'Los inviernos de abril · Capítulo 14',
        title: 'El día que el teléfono dejó de sonar',
        excerpt: 'Durante meses temí las llamadas del hospital. Esa mañana, cuando por fin no llamaron, descubrí que el silencio también podía doler.',
        meta: '9 min de lectura',
        reactions: 721,
        comments: 84,
    },
]

const chapters = [
    { number: 1, title: 'Dos maletas y una llave prestada', read: true, free: true, time: '7 min' },
    { number: 2, title: 'La primera noche sin nombre', read: true, free: false, time: '8 min' },
    { number: 3, title: 'Aprender a pedir ayuda', read: true, free: false, time: '6 min' },
    { number: 4, title: 'Las llamadas de los domingos', read: true, free: false, time: '10 min' },
    { number: 5, title: 'La ciudad que no esperaba', read: true, free: false, time: '9 min' },
    { number: 6, title: 'Cosas que caben en una mesa', read: true, free: false, time: '8 min' },
    { number: 7, title: 'Mi madre cruzó la pantalla', read: false, free: false, time: '11 min' },
    { number: 8, title: 'La casa que empezamos a llamar nuestra', read: false, free: false, time: '9 min' },
]

function Avatar({ initials, color, size = 'md' }: { initials: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
    const sizes = size === 'sm' ? 'h-9 w-9 text-[11px]' : size === 'lg' ? 'h-16 w-16 text-lg' : 'h-11 w-11 text-xs'
    return (
        <div
            className={`${sizes} flex shrink-0 items-center justify-center rounded-full border-2 border-[#F8F4EA] font-black text-white shadow-sm`}
            style={{ backgroundColor: color }}
        >
            {initials}
        </div>
    )
}

function Cover({
    image,
    title,
    author,
    tone,
    compact = false,
    eager = false,
}: {
    image: string
    title: string
    author: string
    tone: string
    compact?: boolean
    eager?: boolean
}) {
    return (
        <div
            className={`relative shrink-0 overflow-hidden border border-black/15 shadow-[0_14px_35px_rgba(23,21,18,0.16)] ${compact ? 'h-28 w-20 rounded-[4px]' : 'aspect-[2/3] w-full rounded-[6px]'}`}
            style={{ backgroundColor: tone }}
        >
            <Image src={image} alt="" fill sizes={compact ? '80px' : '(max-width: 640px) 45vw, 180px'} loading={eager ? 'eager' : 'lazy'} className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-1 bg-[#C7A54B]" />
            <div className="absolute inset-0 flex flex-col justify-end p-3 text-white">
                <p className="mb-1 text-[8px] font-black uppercase tracking-[0.16em] text-white/70">Pergamo original</p>
                <p className={`${compact ? 'text-sm' : 'text-lg'} font-serif font-black leading-[1.05]`}>{title}</p>
                <p className="mt-2 text-[9px] font-bold text-white/75">{author}</p>
            </div>
        </div>
    )
}

function Logo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#A63D2D] text-[#F8F4EA] shadow-sm">
                <Feather size={17} strokeWidth={2.4} />
            </div>
            <p className="font-serif text-2xl font-black tracking-normal text-[#171512]">Pergamo<span className="text-[#B7913E]">.</span></p>
        </div>
    )
}

const navItems: Array<{ id: ViewId; label: string; icon: typeof Home }> = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'discover', label: 'Descubrir', icon: Compass },
    { id: 'story', label: 'Historia', icon: BookOpen },
    { id: 'studio', label: 'Estudio', icon: PenLine },
]

function DesktopRail({ active, onChange }: { active: ViewId; onChange: (view: ViewId) => void }) {
    return (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[84px] flex-col items-center border-r border-[#171512]/10 bg-[#F8F4EA] py-5 md:flex">
            <button type="button" title="Inicio de Pergamo" onClick={() => onChange('home')} className="mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-[#A63D2D] text-white">
                <Feather size={18} />
            </button>
            <nav className="flex flex-1 flex-col gap-3">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = item.id === active
                    return (
                        <button
                            key={item.id}
                            type="button"
                            title={item.label}
                            onClick={() => onChange(item.id)}
                            className={`relative flex h-12 w-12 items-center justify-center rounded-full transition ${isActive ? 'bg-[#171512] text-[#F8F4EA]' : 'text-[#736A5C] hover:bg-[#171512]/6 hover:text-[#171512]'}`}
                        >
                            <Icon size={19} strokeWidth={isActive ? 2.4 : 1.9} />
                            {isActive && <span className="absolute -right-[19px] h-6 w-[3px] rounded-full bg-[#A63D2D]" />}
                        </button>
                    )
                })}
            </nav>
            <button type="button" title="Tu perfil" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#171512]/15 bg-white text-[#171512]">
                <CircleUserRound size={19} />
            </button>
        </aside>
    )
}

function TopBar({ onNotice }: { onNotice: (message: string) => void }) {
    return (
        <header className="sticky top-0 z-30 border-b border-[#171512]/10 bg-[#F8F4EA]/95 backdrop-blur-xl md:ml-[84px]">
            <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-9">
                <div className="md:hidden"><Logo /></div>
                <div className="hidden items-center gap-3 text-sm font-semibold text-[#736A5C] md:flex">
                    <span className="h-2 w-2 rounded-full bg-[#4E715A]" />
                    Historias nuevas cada día
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" title="Notificaciones" onClick={() => onNotice('No tienes notificaciones nuevas.')} className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#4D463B] hover:bg-[#171512]/6">
                        <Bell size={19} />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#F8F4EA] bg-[#A63D2D]" />
                    </button>
                    <Avatar initials="RS" color="#334B62" size="sm" />
                </div>
            </div>
        </header>
    )
}

function MobileNav({ active, onChange }: { active: ViewId; onChange: (view: ViewId) => void }) {
    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-[#171512]/12 bg-[#F8F4EA]/97 px-2 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
            {navItems.map((item) => {
                const Icon = item.icon
                const isActive = active === item.id
                return (
                    <button key={item.id} type="button" onClick={() => onChange(item.id)} className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] font-bold ${isActive ? 'text-[#A63D2D]' : 'text-[#7B7264]'}`}>
                        <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
                        {item.label}
                    </button>
                )
            })}
        </nav>
    )
}

function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
    return (
        <div className="mb-5 flex items-end justify-between gap-4">
            <div>
                {eyebrow && <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#A63D2D]">{eyebrow}</p>}
                <h2 className="font-serif text-2xl font-black leading-tight text-[#171512] sm:text-3xl">{title}</h2>
            </div>
            {action}
        </div>
    )
}

function CreatorComposer({ onNotice }: { onNotice: (message: string) => void }) {
    const [open, setOpen] = useState(false)
    const [kind, setKind] = useState<'Entrada' | 'Capítulo'>('Entrada')
    const [draft, setDraft] = useState('')

    function startWriting(nextKind: 'Entrada' | 'Capítulo') {
        setKind(nextKind)
        setOpen(true)
    }

    function finishWriting(action: 'guardar' | 'publicar') {
        if (!draft.trim()) {
            onNotice('Escribe unas líneas antes de continuar.')
            return
        }

        onNotice(action === 'guardar' ? `${kind} guardada en borradores.` : `${kind} preparada para publicar.`)
        setDraft('')
        setOpen(false)
    }

    return (
        <section className="mb-9 border-y border-[#171512]/12 py-4 sm:py-5">
            <div className="flex items-start gap-3 sm:items-center">
                <Avatar initials="RS" color="#334B62" />
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#A63D2D]">
                        <PenLine size={13} /> Tu espacio creativo
                    </div>
                    <button type="button" onClick={() => setOpen(true)} className="w-full text-left font-serif text-lg font-bold text-[#6F6659] transition hover:text-[#171512] sm:text-xl">
                        ¿Qué quieres contar hoy?
                    </button>
                </div>
                <span className="hidden rounded-full bg-[#4E715A]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#355846] lg:block">Escritor</span>
            </div>

            {!open ? (
                <div className="mt-4 flex flex-wrap gap-2 pl-0 sm:pl-14">
                    <button type="button" onClick={() => startWriting('Entrada')} className="inline-flex h-9 items-center gap-2 rounded-full border border-[#171512]/12 px-4 text-xs font-black text-[#5F574B] hover:border-[#A63D2D] hover:text-[#A63D2D]"><PenLine size={14} /> Entrada</button>
                    <button type="button" onClick={() => startWriting('Capítulo')} className="inline-flex h-9 items-center gap-2 rounded-full border border-[#171512]/12 px-4 text-xs font-black text-[#5F574B] hover:border-[#A63D2D] hover:text-[#A63D2D]"><BookOpen size={14} /> Capítulo</button>
                    <button type="button" onClick={() => onNotice('Tienes 3 borradores esperando por ti.')} className="inline-flex h-9 items-center gap-2 rounded-full border border-[#171512]/12 px-4 text-xs font-black text-[#5F574B] hover:border-[#A63D2D] hover:text-[#A63D2D]"><BookMarked size={14} /> Borradores</button>
                </div>
            ) : (
                <div className="mt-4 pl-0 sm:pl-14">
                    <div className="mb-3 flex gap-2">
                        {(['Entrada', 'Capítulo'] as const).map((option) => (
                            <button key={option} type="button" onClick={() => setKind(option)} className={`h-8 rounded-full px-3 text-[10px] font-black uppercase tracking-[0.12em] ${kind === option ? 'bg-[#171512] text-[#F8F4EA]' : 'border border-[#171512]/12 text-[#6B6255]'}`}>{option}</button>
                        ))}
                    </div>
                    <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        autoFocus
                        rows={4}
                        maxLength={1200}
                        placeholder={kind === 'Entrada' ? 'Empieza por el momento que todavía sigue contigo…' : 'Escribe el siguiente momento de tu historia…'}
                        className="w-full resize-none border-0 border-l-2 border-[#A63D2D] bg-transparent px-4 py-2 font-serif text-lg leading-7 text-[#171512] outline-none placeholder:text-[#9A9081]"
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-[10px] font-bold text-[#8A8174]">{draft.length}/1200</p>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => { setDraft(''); setOpen(false) }} className="h-9 rounded-full px-4 text-xs font-black text-[#6B6255]">Cancelar</button>
                            <button type="button" onClick={() => finishWriting('guardar')} className="h-9 rounded-full border border-[#171512]/15 px-4 text-xs font-black text-[#171512]">Guardar borrador</button>
                            <button type="button" onClick={() => finishWriting('publicar')} className="h-9 rounded-full bg-[#A63D2D] px-4 text-xs font-black text-white">Continuar</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

function HomeScreen({ onOpenStory, onNotice }: { onOpenStory: () => void; onNotice: (message: string) => void }) {
    const [liked, setLiked] = useState(false)
    return (
        <div className="mx-auto max-w-[1320px] px-4 py-7 sm:px-6 lg:px-9 lg:py-10">
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7C715F]">Viernes, 17 de julio</p>
                    <h1 className="mt-2 font-serif text-4xl font-black leading-none text-[#171512] sm:text-5xl">Buenas noches, Rafael.</h1>
                </div>
                <button type="button" onClick={() => onNotice('El compositor de Pergamo se abriria aqui.')} className="hidden h-11 items-center gap-2 rounded-full bg-[#171512] px-5 text-sm font-black text-[#F8F4EA] hover:bg-[#A63D2D] sm:inline-flex">
                    <PenLine size={16} /> Escribir
                </button>
            </div>

            <CreatorComposer onNotice={onNotice} />

            <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
                <div className="min-w-0 space-y-10">
                    <section>
                        <SectionTitle eyebrow="Tu biblioteca" title="Continua donde lo dejaste" />
                        <article className="grid overflow-hidden rounded-[8px] border border-[#171512]/12 bg-[#FFFCF5] shadow-[0_16px_40px_rgba(52,42,24,0.07)] sm:grid-cols-[180px_1fr]">
                            <div className="relative min-h-52 overflow-hidden bg-[#334B62] sm:min-h-full">
                                <Image src={coverAssets.house} alt="" fill sizes="(max-width: 640px) 100vw, 180px" loading="eager" className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/5" />
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">Memoria serial</p>
                                    <p className="mt-1 font-serif text-2xl font-black leading-tight">La casa que dejamos atrás</p>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between p-5 sm:p-7">
                                <div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#A63D2D]"><BookMarked size={14} /> Capítulo 7 de 12</div>
                                    <h3 className="mt-3 font-serif text-2xl font-black text-[#171512]">Mi madre cruzó la pantalla</h3>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#675E50]">María llevaba ocho meses sin volver a escuchar la voz de su madre fuera de una nota de WhatsApp.</p>
                                </div>
                                <div className="mt-6">
                                    <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-[#756B5C]"><span>Tu progreso</span><span>63%</span></div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-[#DED6C7]"><div className="h-full w-[63%] rounded-full bg-[#A63D2D]" /></div>
                                    <button type="button" onClick={onOpenStory} className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#A63D2D] px-5 text-sm font-black text-white hover:bg-[#873025]">
                                        Continuar leyendo <ArrowRight size={15} />
                                    </button>
                                </div>
                            </div>
                        </article>
                    </section>

                    <section>
                        <SectionTitle eyebrow="Siguiendo" title="Nuevas entregas" action={<button type="button" onClick={() => onNotice('Ya estás viendo todas las publicaciones nuevas.')} className="text-xs font-black text-[#A63D2D]">Ver todas</button>} />
                        <div className="divide-y divide-[#171512]/10 border-y border-[#171512]/10">
                            {feedEntries.map((entry, index) => (
                                <article key={entry.title} className="py-6 sm:py-8">
                                    <div className="flex items-start gap-3">
                                        <Avatar initials={entry.initials} color={entry.color} />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-black text-[#171512]">{entry.author} <span className="font-medium text-[#8A8173]">{entry.handle}</span></p>
                                                    <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#A63D2D]">{entry.kind}</p>
                                                </div>
                                                <button type="button" title="Más opciones" onClick={() => onNotice('Opciones de publicación.')} className="flex h-9 w-9 items-center justify-center rounded-full text-[#807668] hover:bg-[#171512]/5"><Ellipsis size={18} /></button>
                                            </div>
                                            <button type="button" onClick={onOpenStory} className="mt-4 block w-full text-left">
                                                <h3 className="font-serif text-2xl font-black leading-tight text-[#171512] sm:text-3xl">{entry.title}</h3>
                                                <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#5E564A]">{entry.excerpt}</p>
                                            </button>
                                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-1 text-xs font-semibold text-[#807668]"><Clock3 size={14} /> {entry.meta}</div>
                                                <div className="flex items-center gap-1">
                                                    <button type="button" title="Me conmovió" onClick={() => index === 0 && setLiked(!liked)} className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold ${index === 0 && liked ? 'bg-[#A63D2D]/10 text-[#A63D2D]' : 'text-[#756C5F] hover:bg-[#171512]/5'}`}><Heart size={16} fill={index === 0 && liked ? 'currentColor' : 'none'} /> {entry.reactions + (index === 0 && liked ? 1 : 0)}</button>
                                                    <button type="button" title="Comentarios" onClick={() => onNotice('Conversación abierta.')} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-[#756C5F] hover:bg-[#171512]/5"><MessageCircle size={16} /> {entry.comments}</button>
                                                    <button type="button" title="Guardar" onClick={() => onNotice('Guardado en tu biblioteca.')} className="flex h-9 w-9 items-center justify-center rounded-full text-[#756C5F] hover:bg-[#171512]/5"><Bookmark size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="space-y-8 xl:sticky xl:top-24">
                    <section className="border-t-4 border-[#B7913E] bg-[#171512] p-5 text-[#F8F4EA]">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4B963]">Tu semana</p>
                        <div className="mt-4 flex items-end justify-between"><p className="font-serif text-5xl font-black">5</p><Sparkles className="mb-1 text-[#D4B963]" size={22} /></div>
                        <p className="mt-2 text-sm leading-6 text-[#D9D1C4]">días leyendo. Una historia puede cambiarte; el hábito te ayuda a encontrarla.</p>
                        <div className="mt-5 flex justify-between gap-1.5">
                            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => <span key={`${day}-${i}`} className={`flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-black ${i < 5 ? 'bg-[#A63D2D] text-white' : 'border border-white/15 text-white/45'}`}>{day}</span>)}
                        </div>
                    </section>
                    <section>
                        <SectionTitle eyebrow="Comunidad" title="Voces para seguir" />
                        <div className="space-y-4">
                            {[
                                ['LS', 'Lucía Serrano', 'Duelo y nuevos comienzos', '#7D382B'],
                                ['MS', 'Mateo Silva', 'Fantasía latinoamericana', '#334B62'],
                                ['SH', 'Sofía Herrera', 'Diarios de una chef migrante', '#355846'],
                            ].map(([initials, name, topic, color]) => (
                                <div key={name} className="flex items-center gap-3">
                                    <Avatar initials={initials} color={color} size="sm" />
                                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-[#171512]">{name}</p><p className="truncate text-xs text-[#807668]">{topic}</p></div>
                                    <button type="button" title={`Seguir a ${name}`} onClick={() => onNotice(`Ahora sigues a ${name}.`)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#171512]/15 text-[#171512] hover:border-[#A63D2D] hover:text-[#A63D2D]"><Plus size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    )
}

function DiscoverScreen({ onOpenStory, onNotice }: { onOpenStory: () => void; onNotice: (message: string) => void }) {
    const [query, setQuery] = useState('')
    const [filter, setFilter] = useState<FilterId>('Todo')
    const visible = useMemo(() => discoveryStories.filter((story) => {
        const matchesFilter = filter === 'Todo' || story.category === filter
        const needle = query.trim().toLowerCase()
        const matchesQuery = !needle || `${story.title} ${story.author} ${story.detail}`.toLowerCase().includes(needle)
        return matchesFilter && matchesQuery
    }), [filter, query])

    return (
        <div className="mx-auto max-w-[1320px] px-4 py-7 sm:px-6 lg:px-9 lg:py-10">
            <div className="max-w-3xl">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#A63D2D]">Descubrimiento editorial</p>
                <h1 className="mt-3 font-serif text-4xl font-black leading-tight text-[#171512] sm:text-6xl">Encuentra una historia que no quieras soltar.</h1>
            </div>

            <div className="mt-8 flex flex-col gap-4 border-y border-[#171512]/10 py-5 lg:flex-row lg:items-center lg:justify-between">
                <label className="flex h-12 w-full items-center gap-3 rounded-full border border-[#171512]/14 bg-white/55 px-4 lg:max-w-md">
                    <Search size={18} className="text-[#7A7163]" />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca una voz, historia o tema" className="w-full bg-transparent text-sm font-semibold text-[#171512] outline-none placeholder:text-[#948A7B]" />
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {(['Todo', 'Vida real', 'Ficción', 'Breves'] as FilterId[]).map((item) => (
                        <button key={item} type="button" onClick={() => setFilter(item)} className={`h-10 shrink-0 rounded-full px-4 text-xs font-black transition ${filter === item ? 'bg-[#171512] text-[#F8F4EA]' : 'border border-[#171512]/12 text-[#685F52] hover:border-[#A63D2D]'}`}>{item}</button>
                    ))}
                </div>
            </div>

            <section className="mt-10 grid overflow-hidden border border-[#171512]/12 bg-[#334B62] text-white lg:grid-cols-[1.05fr_0.95fr]">
                <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#E2C86D]">Colección de la semana</p>
                    <h2 className="mt-4 max-w-lg font-serif text-4xl font-black leading-tight sm:text-5xl">Historias sobre empezar de nuevo.</h2>
                    <p className="mt-4 max-w-lg text-sm leading-7 text-white/70">Cinco voces, cinco ciudades y ese momento exacto en que una vida deja de parecerse a la anterior.</p>
                    <button type="button" onClick={() => setFilter('Vida real')} className="mt-7 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-[#F8F4EA] px-5 text-sm font-black text-[#171512] hover:bg-[#EADDBF]">Explorar colección <ArrowRight size={15} /></button>
                </div>
                <div className="relative min-h-64 overflow-hidden lg:min-h-[390px]">
                    <Image src={coverAssets.reinvention} alt="Una mujer abre su nuevo local al amanecer" fill sizes="(max-width: 1024px) 100vw, 50vw" loading="eager" className="object-cover object-[center_35%]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/5" />
                    <div className="absolute inset-y-0 left-0 w-px bg-white/20" />
                    <div className="absolute bottom-6 left-6 right-6 border-l-2 border-[#E2C86D] pl-4">
                        <p className="font-serif text-2xl font-black">“A veces volver a casa significa inventar una nueva.”</p>
                        <p className="mt-2 text-xs font-bold text-white/65">María Santos · Capítulo 7</p>
                    </div>
                </div>
            </section>

            <section className="mt-12">
                <SectionTitle eyebrow={`${visible.length} ${visible.length === 1 ? 'historia' : 'historias'}`} title={query ? 'Resultados para ti' : filter === 'Todo' ? 'Historias que están creciendo' : filter} action={<button type="button" onClick={() => onNotice('La selección se actualiza cada semana.')} className="hidden text-xs font-black text-[#A63D2D] sm:block">Cómo elegimos</button>} />
                {visible.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
                        {visible.map((story) => (
                            <button key={story.title} type="button" onClick={onOpenStory} className="group text-left">
                                <Cover image={story.image} title={story.title} author={story.author} tone={story.tone} />
                                <p className="mt-3 line-clamp-2 font-serif text-base font-black leading-tight text-[#171512] group-hover:text-[#A63D2D]">{story.title}</p>
                                <p className="mt-1 text-xs font-semibold text-[#776E61]">{story.author}</p>
                                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-[#918777]"><span>{story.chapters} capítulos</span><span>·</span><span>{story.readers} lectores</span></div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="border-y border-[#171512]/10 py-16 text-center"><Search className="mx-auto text-[#A69C8D]" /><p className="mt-3 font-serif text-2xl font-black text-[#171512]">No encontramos esa historia.</p><button type="button" onClick={() => { setQuery(''); setFilter('Todo') }} className="mt-3 text-sm font-black text-[#A63D2D]">Limpiar búsqueda</button></div>
                )}
            </section>
        </div>
    )
}

function StoryScreen({ onBack, onNotice }: { onBack: () => void; onNotice: (message: string) => void }) {
    const [following, setFollowing] = useState(false)
    const [saved, setSaved] = useState(false)
    return (
        <div>
            <section className="border-b border-[#171512]/10 bg-[#EFE6D5]">
                <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-9 lg:py-12">
                    <button type="button" onClick={onBack} className="mb-7 inline-flex items-center gap-2 text-xs font-black text-[#6B6255] hover:text-[#A63D2D]"><ArrowLeft size={15} /> Volver</button>
                    <div className="grid items-start gap-7 sm:grid-cols-[190px_1fr] lg:grid-cols-[230px_minmax(0,1fr)_250px]">
                        <Cover image={coverAssets.house} title="La casa que dejamos atrás" author="María Santos" tone="#7D382B" eager />
                        <div className="pt-1">
                            <div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#A63D2D] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">Vida real</span><span className="rounded-full border border-[#171512]/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#655C4F]">Migración</span><span className="rounded-full border border-[#171512]/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#655C4F]">En curso</span></div>
                            <h1 className="mt-5 max-w-2xl font-serif text-4xl font-black leading-[1.02] text-[#171512] sm:text-6xl">La casa que dejamos atrás</h1>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5F574B]">Una familia sale de Venezuela con dos maletas, una llave que ya no abre ninguna puerta y la promesa de no olvidar quiénes eran antes de llegar.</p>
                            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-[#746A5D]"><span>12 capítulos</span><span>8.4k lectores</span><span>92% la recomienda</span><span>Actualiza los domingos</span></div>
                            <div className="mt-7 flex flex-wrap gap-2">
                                <button type="button" onClick={() => onNotice('Abriendo el capítulo 7 en modo lectura.')} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#171512] px-5 text-sm font-black text-[#F8F4EA] hover:bg-[#A63D2D]"><BookOpen size={16} /> Continuar · Cap. 7</button>
                                <button type="button" title="Guardar historia" onClick={() => setSaved(!saved)} className={`flex h-11 w-11 items-center justify-center rounded-full border ${saved ? 'border-[#A63D2D] bg-[#A63D2D]/10 text-[#A63D2D]' : 'border-[#171512]/15 text-[#171512]'}`}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /></button>
                                <button type="button" title="Compartir historia" onClick={() => onNotice('Enlace de la historia copiado.')} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#171512]/15 text-[#171512]"><Share2 size={17} /></button>
                            </div>
                        </div>
                        <aside className="border-t border-[#171512]/12 pt-5 sm:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-1">
                            <Avatar initials="MS" color="#7D382B" size="lg" />
                            <p className="mt-3 font-serif text-xl font-black text-[#171512]">María Santos</p>
                            <p className="mt-1 text-xs font-bold text-[#7C7264]">@mariasantos · Madrid</p>
                            <p className="mt-3 text-sm leading-6 text-[#655C4F]">Escribo sobre migración, familia y las casas que uno carga por dentro.</p>
                            <button type="button" onClick={() => setFollowing(!following)} className={`mt-5 inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-black ${following ? 'border border-[#4E715A] text-[#355846]' : 'bg-[#A63D2D] text-white'}`}>{following ? <Check size={14} /> : <Plus size={14} />}{following ? 'Siguiendo' : 'Seguir a María'}</button>
                        </aside>
                    </div>
                </div>
            </section>

            <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-9">
                <section>
                    <SectionTitle eyebrow="Tu progreso · 63%" title="Capítulos" />
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#DED6C7]"><div className="h-full w-[63%] rounded-full bg-[#A63D2D]" /></div>
                    <div className="mt-6 divide-y divide-[#171512]/10 border-y border-[#171512]/10">
                        {chapters.map((chapter) => (
                            <button key={chapter.number} type="button" onClick={() => onNotice(`Abriendo capítulo ${chapter.number}: ${chapter.title}`)} className="group grid w-full grid-cols-[38px_1fr_auto] items-center gap-3 py-4 text-left hover:bg-white/30 sm:px-3">
                                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${chapter.read ? 'bg-[#355846] text-white' : 'border border-[#171512]/15 text-[#776E60]'}`}>{chapter.read ? <Check size={14} /> : chapter.number}</span>
                                <div><p className="font-serif text-base font-black text-[#171512] group-hover:text-[#A63D2D]">{chapter.title}</p><p className="mt-1 text-[11px] font-semibold text-[#8B8172]">Capítulo {chapter.number} · {chapter.time}{chapter.free ? ' · Primer capítulo gratis' : ''}</p></div>
                                <ChevronRight size={17} className="text-[#9A9081]" />
                            </button>
                        ))}
                    </div>
                </section>
                <aside className="space-y-8">
                    <section className="border-t-4 border-[#B7913E] bg-[#FFFCF5] p-5 shadow-[0_10px_35px_rgba(52,42,24,0.06)]">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#A63D2D]">Anteriormente</p>
                        <p className="mt-3 font-serif text-lg font-black text-[#171512]">Cosas que caben en una mesa</p>
                        <p className="mt-3 text-sm leading-6 text-[#685F52]">María consigue su primer trabajo estable, pero la llamada de su madre convierte la celebración en una decisión imposible.</p>
                        <button type="button" onClick={() => onNotice('Resumen guardado para antes de continuar.')} className="mt-4 text-xs font-black text-[#A63D2D]">Leer resumen completo</button>
                    </section>
                    <section>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#817768]">Lectores que siguen esta historia</p>
                        <div className="mt-3 flex -space-x-2">{[['LR', '#334B62'], ['AC', '#A63D2D'], ['JO', '#355846'], ['SK', '#78613A']].map(([initials, color]) => <Avatar key={initials} initials={initials} color={color} size="sm" />)}<div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#F8F4EA] bg-[#171512] text-[10px] font-black text-white">+8k</div></div>
                    </section>
                </aside>
            </div>
        </div>
    )
}

function StudioScreen({ onNotice }: { onNotice: (message: string) => void }) {
    return (
        <div className="mx-auto max-w-[1320px] px-4 py-7 sm:px-6 lg:px-9 lg:py-10">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#A63D2D]">Estudio de María</p><h1 className="mt-2 font-serif text-4xl font-black text-[#171512] sm:text-5xl">Tus historias están vivas.</h1><p className="mt-2 text-sm text-[#746A5C]">Publica con constancia. Escucha a tus lectores. Mejora una entrega a la vez.</p></div>
                <button type="button" onClick={() => onNotice('El editor de un nuevo capítulo se abriría aquí.')} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#A63D2D] px-6 text-sm font-black text-white hover:bg-[#873025]"><PenLine size={17} /> Nuevo capítulo</button>
            </div>

            <section className="mt-9 grid grid-cols-2 border-y border-[#171512]/12 lg:grid-cols-4">
                {[
                    ['Capítulos publicados', '31', '3 este mes', BookOpen],
                    ['Lectores', '8.4k', '+12% este mes', Users],
                    ['Seguidores', '2,918', '+184 esta semana', Heart],
                    ['Finalización media', '71%', '+6 puntos', TrendingUp],
                ].map(([label, value, note, Icon], index) => (
                    <div key={String(label)} className={`py-5 ${index % 2 === 0 ? 'pr-4' : 'border-l border-[#171512]/12 pl-4'} lg:border-l lg:px-6 lg:first:border-l-0 lg:first:pl-0`}>
                        <div className="flex items-center gap-2 text-[#A63D2D]"><Icon size={15} /><p className="text-[10px] font-black uppercase tracking-[0.14em]">{String(label)}</p></div>
                        <p className="mt-3 font-serif text-3xl font-black text-[#171512] sm:text-4xl">{String(value)}</p>
                        <p className="mt-1 text-xs font-bold text-[#4E715A]">{String(note)}</p>
                    </div>
                ))}
            </section>

            <div className="mt-10 grid gap-9 xl:grid-cols-[minmax(0,1fr)_330px]">
                <section>
                    <SectionTitle eyebrow="Biblioteca" title="Tus historias" action={<button type="button" onClick={() => onNotice('Creando una nueva serie.')} className="inline-flex h-9 items-center gap-2 rounded-full border border-[#171512]/15 px-4 text-xs font-black text-[#171512]"><Plus size={14} /> Nueva serie</button>} />
                    <article className="grid gap-5 border-y border-[#171512]/10 py-6 sm:grid-cols-[100px_1fr_auto] sm:items-center">
                        <Cover image={coverAssets.house} title="La casa que dejamos atrás" author="María Santos" tone="#7D382B" compact />
                        <div>
                            <div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-2xl font-black text-[#171512]">La casa que dejamos atrás</h3><span className="rounded-full bg-[#4E715A]/12 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#355846]">En curso</span></div>
                            <p className="mt-2 text-sm text-[#746A5C]">12 capítulos · 14,280 palabras · Actualizada hace 2 días</p>
                            <div className="mt-4 grid max-w-lg grid-cols-3 gap-4 text-xs"><div><p className="font-black text-[#171512]">8.4k</p><p className="text-[#8A8174]">Lectores</p></div><div><p className="font-black text-[#171512]">71%</p><p className="text-[#8A8174]">Finaliza</p></div><div><p className="font-black text-[#171512]">642</p><p className="text-[#8A8174]">Guardados</p></div></div>
                        </div>
                        <div className="flex gap-2 sm:flex-col">
                            <button type="button" onClick={() => onNotice('Gestión de capítulos abierta.')} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#171512] px-4 text-xs font-black text-white">Gestionar <ArrowRight size={13} /></button>
                            <button type="button" title="Más opciones" onClick={() => onNotice('Opciones de la historia.')} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#171512]/15 text-[#171512]"><Ellipsis size={17} /></button>
                        </div>
                    </article>
                    <article className="grid gap-5 border-b border-[#171512]/10 py-6 sm:grid-cols-[100px_1fr_auto] sm:items-center">
                        <Cover image={coverAssets.kitchen} title="Domingos en la cocina" author="María Santos" tone="#78613A" compact />
                        <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-2xl font-black text-[#171512]">Domingos en la cocina</h3><span className="rounded-full bg-[#B7913E]/12 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#826A2C]">Borrador</span></div><p className="mt-2 text-sm text-[#746A5C]">3 borradores · Última edición ayer</p><p className="mt-4 max-w-lg text-sm leading-6 text-[#655C4F]">Relatos breves sobre comida, memoria y las recetas que sobrevivieron a la distancia.</p></div>
                        <button type="button" onClick={() => onNotice('Continuando el último borrador.')} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#171512]/15 px-4 text-xs font-black text-[#171512]">Continuar <ArrowRight size={13} /></button>
                    </article>
                </section>

                <aside className="space-y-9">
                    <section className="bg-[#171512] p-6 text-[#F8F4EA]">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4B963]">Ritmo editorial</p>
                        <h2 className="mt-3 font-serif text-3xl font-black">5 semanas publicando.</h2>
                        <p className="mt-3 text-sm leading-6 text-[#D8D0C3]">Tus lectores vuelven más los domingos entre 7 y 9 PM.</p>
                        <div className="mt-6 flex h-24 items-end gap-2">
                            {[42, 58, 46, 74, 82, 66, 92].map((height, index) => <div key={index} className="flex-1"><div className={`w-full ${index === 6 ? 'bg-[#D4B963]' : 'bg-[#A63D2D]'}`} style={{ height: `${height}%` }} /><p className="mt-2 text-center text-[8px] font-bold text-white/45">{['L','M','M','J','V','S','D'][index]}</p></div>)}
                        </div>
                    </section>
                    <section>
                        <SectionTitle eyebrow="Audiencia" title="Lo que dicen" />
                        <div className="space-y-5">
                            <blockquote className="border-l-2 border-[#A63D2D] pl-4"><p className="font-serif text-lg font-bold leading-7 text-[#171512]">“Sentí que estaba sentada en esa cocina con ustedes.”</p><footer className="mt-2 text-xs font-bold text-[#807669]">Lucía · Capítulo 6</footer></blockquote>
                            <blockquote className="border-l-2 border-[#B7913E] pl-4"><p className="font-serif text-lg font-bold leading-7 text-[#171512]">“Llamé a mi mamá después de terminarlo.”</p><footer className="mt-2 text-xs font-bold text-[#807669]">Andrea · Capítulo 5</footer></blockquote>
                        </div>
                        <button type="button" onClick={() => onNotice('Abriendo todos los comentarios.')} className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[#A63D2D]">Ver conversación <ChevronRight size={14} /></button>
                    </section>
                </aside>
            </div>
        </div>
    )
}

export default function PergamoConceptPage() {
    const [view, setView] = useState<ViewId>('home')
    const [notice, setNotice] = useState('')

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' })
    }, [view])

    function showNotice(message: string) {
        setNotice(message)
        window.setTimeout(() => setNotice(''), 2400)
    }

    return (
        <main className="min-h-screen bg-[#F8F4EA] text-[#171512] selection:bg-[#B7913E]/30">
            <DesktopRail active={view} onChange={setView} />
            <TopBar onNotice={showNotice} />
            <div className="pb-24 md:ml-[84px] md:pb-0">
                {view === 'home' && <HomeScreen onOpenStory={() => setView('story')} onNotice={showNotice} />}
                {view === 'discover' && <DiscoverScreen onOpenStory={() => setView('story')} onNotice={showNotice} />}
                {view === 'story' && <StoryScreen onBack={() => setView('home')} onNotice={showNotice} />}
                {view === 'studio' && <StudioScreen onNotice={showNotice} />}
            </div>
            <MobileNav active={view} onChange={setView} />
            {notice && <div className="fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#171512] px-5 py-3 text-center text-xs font-black text-[#F8F4EA] shadow-xl md:bottom-6">{notice}</div>}
        </main>
    )
}

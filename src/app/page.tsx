import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'

export default async function LandingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const t = await getTranslations('landing')
    const tLegal = await getTranslations('legal')

    const ctaHref = user ? '/dashboard' : '/login?mode=registro'
    const ctaLabel = user ? t('cta_dashboard') : t('cta_start')

    const revenue = [
        { label: t('rev_writer_label'), value: t('rev_writer_value'), note: t('rev_writer_note') },
        { label: t('rev_reader_label'), value: t('rev_reader_value'), note: t('rev_reader_note') },
        { label: t('rev_fee_label'), value: t('rev_fee_value'), note: t('rev_fee_note') },
    ]

    const principles = [
        { title: t('p1_title'), text: t('p1_text') },
        { title: t('p2_title'), text: t('p2_text') },
        { title: t('p3_title'), text: t('p3_text') },
    ]

    const hookSteps = [t('hook_step1'), t('hook_step2'), t('hook_step3')]

    return (
        <div className="min-h-screen bg-[#FAF7F0] text-[#0D0D0D] selection:bg-[#C9A84C]/30">
            <Navbar />

            <section className="relative min-h-[72svh] overflow-hidden border-b border-[#0D0D0D]/10">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/themes/golden_journal_bg.png')" }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,247,240,0.96)_0%,rgba(250,247,240,0.86)_46%,rgba(13,13,13,0.18)_100%)]" />

                <div className="relative mx-auto flex min-h-[64svh] max-w-6xl flex-col justify-center px-6 py-8 md:min-h-[72svh] md:py-20">
                    <div className="max-w-3xl">
                        <p className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-[#8A6B1E]">
                            {t('badge')}
                        </p>
                        <h1 className="font-serif text-[2.65rem] font-black leading-[0.98] tracking-normal text-[#0D0D0D] md:text-7xl">
                            {t('hero_title')}
                        </h1>
                        <p className="mt-5 max-w-2xl text-sm leading-6 text-[#3D3324] sm:text-lg sm:leading-8 md:text-xl">
                            {t('hero_description')}
                        </p>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            {/* Lector primero: explorar historias es el CTA principal */}
                            <Link
                                href="/discover"
                                className="inline-flex h-11 items-center justify-center rounded-md bg-[#0D0D0D] px-7 text-xs font-black uppercase tracking-[0.14em] text-[#FAF7F0] transition hover:bg-[#2A2117] sm:h-13 sm:text-sm"
                            >
                                {t('cta_read')}
                            </Link>
                            <Link
                                href={ctaHref}
                                className="inline-flex h-11 items-center justify-center rounded-md border border-[#0D0D0D]/20 bg-[#FAF7F0]/80 px-7 text-xs font-black uppercase tracking-[0.14em] text-[#0D0D0D] transition hover:border-[#C9A84C] sm:h-13 sm:text-sm"
                            >
                                {ctaLabel}
                            </Link>
                        </div>
                    </div>

                </div>
            </section>

            <section className="border-b border-[#0D0D0D]/10 bg-[#FFFCF5] px-6">
                <div className="mx-auto grid max-w-6xl grid-cols-1 border-x border-[#0D0D0D]/10 sm:grid-cols-3">
                    {revenue.map((item) => (
                        <div key={item.label} className="border-b border-[#0D0D0D]/10 px-5 py-5 sm:border-b-0 sm:border-r sm:last:border-r-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8A6B1E]">{item.label}</p>
                            <p className="mt-1 font-serif text-2xl font-black text-[#0D0D0D]">{item.value}</p>
                            <p className="mt-1 text-xs leading-5 text-[#5D5142]">{item.note}</p>
                        </div>
                    ))}
                </div>
            </section>

            <EditorialShelf />

            <section className="border-b border-[#0D0D0D]/10 bg-[#0D0D0D] px-6 py-20 text-[#FAF7F0]">
                <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#C9A84C]">{t('writers_kicker')}</p>
                        <h2 className="mt-4 font-serif text-4xl font-black leading-tight md:text-5xl">
                            {t('writers_title')}
                        </h2>
                    </div>
                    <div className="grid gap-4">
                        {principles.map((item) => (
                            <article key={item.title} className="rounded-md border border-[#FAF7F0]/12 bg-[#FAF7F0]/5 p-5">
                                <h3 className="text-lg font-black text-[#FAF7F0]">{item.title}</h3>
                                <p className="mt-2 leading-7 text-[#D8D0C1]">{item.text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#FAF7F0] px-6 py-20">
                <div className="mx-auto max-w-6xl">
                    <div className="max-w-2xl">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8A6B1E]">{t('hook_kicker')}</p>
                        <h2 className="mt-4 font-serif text-4xl font-black text-[#0D0D0D] md:text-5xl">
                            {t('hook_title')}
                        </h2>
                        <p className="mt-5 text-lg leading-8 text-[#4B4032]">
                            {t('hook_text')}
                        </p>
                    </div>

                    <div className="mt-12 grid gap-4 md:grid-cols-3">
                        {hookSteps.map((label, index) => (
                            <div key={label} className="rounded-md border border-[#0D0D0D]/12 bg-white/45 p-6">
                                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#C9A84C]">0{index + 1}</p>
                                <p className="mt-5 text-2xl font-black text-[#0D0D0D]">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="border-t border-[#0D0D0D]/10 bg-[#0D0D0D] px-6 py-10 text-[#FAF7F0]">
                <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 md:flex-row md:items-center">
                    <p className="text-2xl font-black tracking-normal">Pergamo<span className="text-[#C9A84C]">.</span></p>
                    <div className="flex flex-col gap-4 text-sm text-[#B9AD98] md:flex-row md:items-center">
                        <Link href="/legal/terms" className="transition hover:text-[#C9A84C]">{tLegal('terms')}</Link>
                        <Link href="/legal/privacy" className="transition hover:text-[#C9A84C]">{tLegal('privacy')}</Link>
                        <p>2026 Pergamo · {t('footer_note')}</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

async function EditorialShelf() {
    const t = await getTranslations('landing')
    const featuredCovers = [
        { src: '/covers/la-casa-que-dejamos-atras.webp', title: 'La casa que dejamos atrás', author: 'María Santos', kind: t('shelf_kind_life') },
        { src: '/covers/los-inviernos-de-abril.webp', title: 'Los inviernos de abril', author: 'James Okafor', kind: t('shelf_kind_serial') },
        { src: '/covers/volver-a-empezar-a-los-42.webp', title: 'Volver a empezar a los 42', author: 'Ana Reyes', kind: t('shelf_kind_memoir') },
        { src: '/covers/el-jardin-de-las-promesas.webp', title: 'El jardín de las promesas', author: 'Lucía Serrano', kind: t('shelf_kind_novel') },
        { src: '/covers/notas-desde-una-cocina-prestada.webp', title: 'Notas desde una cocina prestada', author: 'Mateo Cruz', kind: t('shelf_kind_diary') },
        { src: '/covers/la-ciudad-bajo-el-agua.webp', title: 'La ciudad bajo el agua', author: 'Elena Vidal', kind: t('shelf_kind_fiction') },
    ]

    return (
        <section className="overflow-hidden border-b border-[#0D0D0D]/10 bg-[#F1EBDD] py-14">
            <div className="mx-auto max-w-6xl px-6">
                <div className="flex items-end justify-between gap-5">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A63D2D]">{t('shelf_kicker')}</p>
                        <h2 className="mt-2 max-w-2xl font-serif text-3xl font-black leading-tight md:text-5xl">{t('shelf_title')}</h2>
                    </div>
                    <Link href="/discover" className="hidden text-xs font-black text-[#A63D2D] sm:block">{t('shelf_link')} →</Link>
                </div>
            </div>
            <div className="mt-10 overflow-x-auto px-6 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="mx-auto flex w-max min-w-full justify-center gap-4 [perspective:1200px]">
                    {featuredCovers.map((cover, index) => (
                        <Link key={cover.src} href="/discover" className="group block w-40 shrink-0 sm:w-48" style={{ transform: `translateY(${index % 2 === 0 ? 0 : 14}px)` }}>
                            <div className="relative aspect-[2/3] overflow-hidden border border-[#171512]/15 bg-[#D8C8A4] shadow-[0_18px_35px_rgba(37,28,18,0.16)] transition duration-500 group-hover:-translate-y-2 group-hover:rotate-1 group-hover:shadow-[0_25px_45px_rgba(37,28,18,0.24)]">
                                <Image src={cover.src} alt={`Portada de ${cover.title}`} fill sizes="192px" className="object-cover" />
                            </div>
                            <p className="mt-3 text-[9px] font-black uppercase tracking-[0.14em] text-[#A63D2D]">{cover.kind}</p>
                            <h3 className="mt-1 line-clamp-2 font-serif text-lg font-black leading-tight">{cover.title}</h3>
                            <p className="mt-1 text-xs text-[#746A5C]">{cover.author}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

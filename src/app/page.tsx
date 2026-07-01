import Link from 'next/link'
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

            <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden border-b border-[#0D0D0D]/10">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/themes/golden_journal_bg.png')" }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,247,240,0.96)_0%,rgba(250,247,240,0.86)_46%,rgba(13,13,13,0.18)_100%)]" />

                <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-6 py-20">
                    <div className="max-w-3xl">
                        <p className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-[#8A6B1E]">
                            {t('badge')}
                        </p>
                        <h1 className="font-serif text-5xl font-black leading-[0.98] tracking-normal text-[#0D0D0D] md:text-7xl">
                            {t('hero_title')}
                        </h1>
                        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#3D3324] md:text-xl">
                            {t('hero_description')}
                        </p>

                        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={ctaHref}
                                className="inline-flex h-13 items-center justify-center rounded-md bg-[#0D0D0D] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#FAF7F0] transition hover:bg-[#2A2117]"
                            >
                                {ctaLabel}
                            </Link>
                            <Link
                                href="/discover"
                                className="inline-flex h-13 items-center justify-center rounded-md border border-[#0D0D0D]/20 bg-[#FAF7F0]/80 px-7 text-sm font-black uppercase tracking-[0.14em] text-[#0D0D0D] transition hover:border-[#C9A84C]"
                            >
                                {t('cta_read')}
                            </Link>
                        </div>
                    </div>

                    <div className="mt-16 grid max-w-4xl grid-cols-1 border-y border-[#0D0D0D]/15 sm:grid-cols-3">
                        {revenue.map((item) => (
                            <div key={item.label} className="border-[#0D0D0D]/15 py-5 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8A6B1E]">{item.label}</p>
                                <p className="mt-2 text-3xl font-black text-[#0D0D0D]">{item.value}</p>
                                <p className="mt-2 text-sm leading-6 text-[#5D5142]">{item.note}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

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
                    <p className="text-2xl font-black tracking-normal">bio<span className="text-[#C9A84C]">.me</span></p>
                    <div className="flex flex-col gap-4 text-sm text-[#B9AD98] md:flex-row md:items-center">
                        <Link href="/legal/terms" className="transition hover:text-[#C9A84C]">{tLegal('terms')}</Link>
                        <Link href="/legal/privacy" className="transition hover:text-[#C9A84C]">{tLegal('privacy')}</Link>
                        <p>2026 bio.me · {t('footer_note')}</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

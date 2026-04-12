'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

// ─── Data ─────────────────────────────────────────────────────────────
const STORIES = [
    {
        tag: 'ZERO AUDIENCE → $300K',
        tagColor: '#C9A84C',
        quote:
            '"I started with zero followers. By month 12, my newsletter generated $300,000. I never wrote a book — I just wrote about what I lived."',
        author: 'E.D.',
        platform: 'Substack · 2023',
        initial: 'E',
        color: '#C9A84C',
    },
    {
        tag: '60,000 AUTHORS EARNING $5K+/MO',
        tagColor: '#00C2FF',
        quote:
            '"Amazon pays over $520 million a year to self-publishers. The best-paid ones don\'t write fiction. They write their own story — raw, real, and in installments."',
        author: 'Amazon KDP',
        platform: 'KDP · 2025 data',
        initial: 'A',
        color: '#00C2FF',
    },
    {
        tag: 'THE MATH THAT WORKS',
        tagColor: '#C9A84C',
        quote:
            '"1,000 subscribers at $5/month = $60,000/year. One post a week. About your own life. No fiction. No research. Just truth."',
        author: 'bio.me model',
        platform: 'bio.me · starting today',
        initial: 'B',
        color: '#C9A84C',
    },
]

const STATS = [
    { value: '$61.7M', label: 'Paid to Kindle authors in February 2025 alone', color: '#C9A84C' },
    { value: '50+', label: 'Newsletters earning $1M+ per year on Substack', color: '#00C2FF' },
    { value: 'Day 1', label: 'When you start earning on bio.me', color: '#C9A84C' },
]

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// ─── Animated counter — just animates in, no number rolling ──────────
function StatItem({ value, label, color, delay }: { value: string; label: string; color: string; delay: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true, margin: '-80px' })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE, delay }}
            className="flex flex-col items-center gap-3 px-6"
        >
            <span
                className="font-serif text-5xl md:text-6xl font-black leading-none"
                style={{ color }}
            >
                {value}
            </span>
            <span className="text-[#FAF7F0]/35 text-sm text-center max-w-[180px] leading-relaxed">
                {label}
            </span>
        </motion.div>
    )
}

// ─── Story card ───────────────────────────────────────────────────────
function StoryCard({
    story,
    delay,
}: {
    story: typeof STORIES[number]
    delay: number
}) {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true, margin: '-60px' })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.0, ease: EASE, delay }}
            className="relative flex flex-col gap-5 bg-[#111111] rounded-2xl p-7 min-w-[300px]"
            style={{ borderLeft: `2px solid ${story.color}` }}
        >
            {/* Tag */}
            <span
                className="text-[10px] font-black tracking-[0.32em] uppercase"
                style={{ color: story.tagColor }}
            >
                {story.tag}
            </span>

            {/* Quote */}
            <p className="text-[#FAF7F0]/70 text-[15px] leading-relaxed font-serif italic flex-1">
                {story.quote}
            </p>

            {/* Author row */}
            <div className="flex items-center gap-3 pt-2 border-t border-[#FAF7F0]/6">
                {/* Avatar initial */}
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-[#0D0D0D] shrink-0"
                    style={{ background: story.color }}
                >
                    {story.initial}
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[#FAF7F0]/60 text-xs font-semibold">{story.author}</span>
                    <span className="text-[#FAF7F0]/25 text-[10px]">{story.platform}</span>
                </div>
            </div>
        </motion.div>
    )
}

// ─── Main Section ─────────────────────────────────────────────────────
export function StorytellerProof() {
    const headlineRef = useRef<HTMLDivElement>(null)
    const headlineInView = useInView(headlineRef, { once: true, margin: '-60px' })

    return (
        <section className="bg-[#0D0D0D] py-32 px-6 relative overflow-hidden">
            {/* Electric blue ambient glow — subtle, left side */}
            <div
                className="absolute top-0 left-0 w-1/2 h-full pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse at 0% 40%, rgba(0,194,255,0.05) 0%, transparent 65%)',
                }}
            />
            {/* Gold ambient glow — right side */}
            <div
                className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse at 100% 60%, rgba(201,168,76,0.06) 0%, transparent 65%)',
                }}
            />

            <div className="max-w-6xl mx-auto relative">

                {/* ── Part A: Hook headline ── */}
                <motion.div
                    ref={headlineRef}
                    initial={{ opacity: 0, y: 40 }}
                    animate={headlineInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1.1, ease: EASE }}
                    className="text-center mb-24"
                >
                    <p className="text-[#C9A84C]/50 text-xs font-bold tracking-[0.35em] uppercase mb-8">
                        The proof
                    </p>

                    <h2 className="font-serif leading-[0.92] tracking-tight">
                        <span className="block text-5xl md:text-7xl lg:text-8xl font-black text-[#FAF7F0] mb-2">
                            Amazon pays
                        </span>
                        <span className="block text-6xl md:text-8xl lg:text-[6.5rem] font-black text-[#C9A84C] italic mb-3">
                            $520,000,000
                        </span>
                        <span className="block text-4xl md:text-5xl lg:text-6xl font-black text-[#FAF7F0] mb-2">
                            a year to storytellers.
                        </span>
                        <span
                            className="block text-3xl md:text-4xl lg:text-5xl font-black italic"
                            style={{ color: '#00C2FF' }}
                        >
                            You don&apos;t need them.
                        </span>
                    </h2>

                    <p className="text-[#FAF7F0]/30 text-base mt-8 max-w-lg mx-auto leading-relaxed">
                        The creator economy doesn&apos;t reward the best writers.
                        It rewards the ones who show up — with their truth — every single week.
                    </p>
                </motion.div>

                {/* ── Part B: Story cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-24">
                    {STORIES.map((story, i) => (
                        <StoryCard key={i} story={story} delay={i * 0.12} />
                    ))}
                </div>

                {/* ── Part C: Counter strip ── */}
                <div className="border-t border-b border-[#FAF7F0]/6 py-14">
                    <div className="flex flex-col md:flex-row items-center justify-around gap-10 md:gap-0">
                        {STATS.map((stat, i) => (
                            <StatItem
                                key={i}
                                value={stat.value}
                                label={stat.label}
                                color={stat.color}
                                delay={i * 0.15}
                            />
                        ))}
                    </div>
                </div>

                {/* ── Part D: Transition line ── */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    className="text-center text-[#FAF7F0]/35 text-lg italic font-serif mt-14 max-w-2xl mx-auto leading-relaxed"
                >
                    You don&apos;t need to write a book.
                    You need to tell your story — <span className="text-[#C9A84C]">episode by episode.</span>
                </motion.p>

            </div>
        </section>
    )
}

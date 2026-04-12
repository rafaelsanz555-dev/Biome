export function FeatureGrid() {
    return (
        <>
            {/* ─── Section 1: Manifesto dark strip ─── */}
            <section className="bg-[#0D0D0D] py-28 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,_rgba(201,168,76,0.06)_0%,_transparent_65%)] pointer-events-none" />
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row items-start gap-16">

                        {/* Left — quote */}
                        <div className="flex-1">
                            <p className="text-[#C9A84C]/50 text-xs font-bold tracking-[0.35em] uppercase mb-8">The philosophy</p>
                            <blockquote className="font-serif text-3xl md:text-4xl font-black text-[#FAF7F0] leading-tight">
                                &ldquo;Think like Bezos building the Kindle Store — writers are the product, discovery is the moat,{' '}
                                <span className="text-[#C9A84C] italic">monetization must feel dignified.</span>&rdquo;
                            </blockquote>
                        </div>

                        {/* Right — numbers */}
                        <div className="md:w-72 space-y-10 md:pt-14">
                            <div className="border-l-2 border-[#C9A84C]/30 pl-6">
                                <p className="font-serif text-4xl font-black text-[#C9A84C] mb-1">$25k</p>
                                <p className="text-[#FAF7F0]/35 text-sm leading-relaxed">Monthly platform revenue at just 1,000 writers</p>
                            </div>
                            <div className="border-l-2 border-[#C9A84C]/30 pl-6">
                                <p className="font-serif text-4xl font-black text-[#C9A84C] mb-1">90%</p>
                                <p className="text-[#FAF7F0]/35 text-sm leading-relaxed">Of every dollar your readers pay goes straight to you</p>
                            </div>
                            <div className="border-l-2 border-[#C9A84C]/30 pl-6">
                                <p className="font-serif text-4xl font-black text-[#C9A84C] mb-1">Day 1</p>
                                <p className="text-[#FAF7F0]/35 text-sm leading-relaxed">Monetization starts the moment you publish your first episode</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Section 2: How it works — cream ─── */}
            <section className="bg-[#FAF7F0] py-32 px-6">
                <div className="max-w-5xl mx-auto">

                    <div className="text-center mb-24">
                        <p className="text-[#C9A84C] text-xs font-bold tracking-[0.35em] uppercase mb-5">How it works</p>
                        <h2 className="font-serif text-5xl md:text-6xl font-black text-[#0D0D0D] leading-[0.95] tracking-tight">
                            Built for storytellers.<br />
                            <em className="font-light not-italic text-[#0D0D0D]/40">Monetized from day one.</em>
                        </h2>
                    </div>

                    {/* Feature rows — alternating layout for more drama */}
                    <div className="space-y-6">
                        {[
                            {
                                n: '01',
                                title: 'Write Episodes',
                                body: 'Publish real stories of your life in seasons and episodes. First chapter is always free — the hook that converts casual readers into paying subscribers.',
                                tag: 'Content creation',
                            },
                            {
                                n: '02',
                                title: 'Lock Premium Content',
                                body: 'Give free previews and monetize full stories through subscriptions or pay-per-view. You set your price. Readers pay you directly via Stripe.',
                                tag: 'Monetization',
                            },
                            {
                                n: '03',
                                title: 'Connect & Earn',
                                body: 'Discovery is the moat. The platform surfaces great stories to new readers. Your job: tell the truth. Our job: make sure the right people find you.',
                                tag: 'Growth',
                            },
                        ].map((f, i) => (
                            <div
                                key={f.n}
                                className={`group flex flex-col md:flex-row gap-8 items-center p-8 md:p-12 rounded-3xl border transition-all duration-400
                                    ${i % 2 === 1
                                        ? 'bg-[#0D0D0D] border-[#C9A84C]/15 hover:border-[#C9A84C]/35 md:flex-row-reverse'
                                        : 'bg-white border-[#0D0D0D]/6 hover:border-[#C9A84C]/25 hover:shadow-[0_12px_60px_rgba(201,168,76,0.08)]'
                                    }`}
                            >
                                {/* Number — large decorative */}
                                <div className="shrink-0 w-24 text-center">
                                    <span className={`font-serif text-7xl font-black leading-none
                                        ${i % 2 === 1 ? 'text-[#C9A84C]/20 group-hover:text-[#C9A84C]/40' : 'text-[#C9A84C]/15 group-hover:text-[#C9A84C]/30'}
                                        transition-colors duration-300`}
                                    >
                                        {f.n}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <span className={`text-[10px] font-bold tracking-[0.3em] uppercase mb-3 block
                                        ${i % 2 === 1 ? 'text-[#C9A84C]/50' : 'text-[#C9A84C]/60'}`}>
                                        {f.tag}
                                    </span>
                                    <h3 className={`font-serif text-2xl md:text-3xl font-black mb-4
                                        ${i % 2 === 1 ? 'text-[#FAF7F0]' : 'text-[#0D0D0D]'}`}>
                                        {f.title}
                                    </h3>
                                    <p className={`text-base leading-relaxed max-w-lg
                                        ${i % 2 === 1 ? 'text-[#FAF7F0]/45' : 'text-[#0D0D0D]/50'}`}>
                                        {f.body}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Section 3: Comparison dark — vs the competition ─── */}
            <section className="bg-[#0D0D0D] py-28 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,_rgba(201,168,76,0.05)_0%,_transparent_65%)] pointer-events-none" />
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-[#C9A84C]/50 text-xs font-bold tracking-[0.35em] uppercase mb-5">Competitive position</p>
                        <h2 className="font-serif text-4xl md:text-5xl font-black text-[#FAF7F0] leading-tight">
                            Why not Substack, Wattpad,<br />
                            <span className="text-[#C9A84C] italic">or Patreon?</span>
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="py-4 pr-8 text-[#FAF7F0]/30 text-xs font-bold tracking-widest uppercase">Platform</th>
                                    <th className="py-4 pr-8 text-[#FAF7F0]/30 text-xs font-bold tracking-widest uppercase">The problem</th>
                                    <th className="py-4 text-[#C9A84C]/70 text-xs font-bold tracking-widest uppercase">bio.me fixes it</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { platform: 'Substack', problem: 'Built for newsletters, not narratives', fix: 'Built exclusively for life stories' },
                                    { platform: 'Wattpad', problem: 'Terrible monetization', fix: 'Earn from your very first episode' },
                                    { platform: 'Medium', problem: 'Platform controls your earnings', fix: 'You set your price, you own your audience' },
                                    { platform: 'Patreon', problem: 'Generic — no story format', fix: 'Story-first UX with chapter series' },
                                ].map((row, i) => (
                                    <tr key={i} className="border-t border-[#FAF7F0]/5">
                                        <td className="py-5 pr-8 font-serif font-bold text-[#FAF7F0]/50 text-lg">{row.platform}</td>
                                        <td className="py-5 pr-8 text-[#FAF7F0]/30 text-sm">{row.problem}</td>
                                        <td className="py-5 text-[#C9A84C] text-sm font-medium">{row.fix}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ─── Section 4: Final CTA ─── */}
            <section className="bg-[#FAF7F0] py-32 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <p className="text-[#C9A84C] text-xs font-bold tracking-[0.35em] uppercase mb-8">Ready to start?</p>
                    <h2 className="font-serif text-5xl md:text-6xl font-black text-[#0D0D0D] leading-[0.95] mb-6">
                        Your story has been<br />
                        <span className="italic text-[#C9A84C]">waiting long enough.</span>
                    </h2>
                    <p className="text-[#0D0D0D]/40 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
                        $5/month to publish. No contracts. Cancel anytime. The first chapter is always free.
                    </p>
                    <a href="/login">
                        <button className="
                            group relative h-16 px-16 text-lg font-bold rounded-2xl overflow-hidden
                            bg-[#0D0D0D] text-[#FAF7F0]
                            hover:bg-[#C9A84C] hover:text-[#0D0D0D]
                            shadow-[0_8px_40px_rgba(13,13,13,0.2)]
                            hover:shadow-[0_8px_60px_rgba(201,168,76,0.4)]
                            hover:scale-[1.03] active:scale-[0.98]
                            transition-all duration-400
                        ">
                            Start Your Bio — Free
                        </button>
                    </a>
                </div>
            </section>
        </>
    )
}

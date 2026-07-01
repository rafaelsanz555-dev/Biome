'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, Gift, Sparkles } from 'lucide-react'

const readerSignals = [
    { label: 'El primer capítulo es gratis', detail: 'Prueba cualquier historia antes de pagar.', icon: BookOpen },
    { label: 'Seguir no cuesta nada', detail: 'Recibe lo nuevo de tus escritores favoritos.', icon: Sparkles },
    { label: 'Los regalos van directo', detail: 'El escritor recibe el 88% de cada apoyo.', icon: Gift },
]

export function RightSidebar() {
    return (
        <aside className="hidden w-80 overflow-y-auto border-l border-[#2A2418] bg-[#11100E] p-6 text-[#FAF7F0] lg:block">
            <section className="rounded-3xl border border-[#C9A84C]/20 bg-[#C9A84C]/8 p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C9A84C]">Descubre</p>
                <h3 className="mt-3 font-serif text-2xl font-black leading-tight">
                    Voces nuevas cada semana.
                </h3>
                <Link href="/discover" className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-5 text-sm font-black text-[#0D0D0D] transition hover:bg-[#E2C96E]">
                    Explorar escritores
                    <ArrowRight size={15} />
                </Link>
            </section>

            <section className="mt-8">
                <h4 className="text-sm font-black">Cómo funciona</h4>
                <div className="mt-4 space-y-3">
                    {readerSignals.map((item) => {
                        const Icon = item.icon
                        return (
                            <div key={item.label} className="rounded-2xl border border-[#FAF7F0]/8 bg-[#FAF7F0]/5 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C9A84C]/12 text-[#C9A84C]">
                                        <Icon size={17} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black">{item.label}</p>
                                        <p className="mt-1 text-xs leading-5 text-[#FAF7F0]/50">{item.detail}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>
        </aside>
    )
}

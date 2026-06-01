'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, Gift, HeartHandshake, Sparkles } from 'lucide-react'

const readerSignals = [
    { label: 'Primer capitulo gratis', detail: 'El lector prueba antes de pagar.', icon: BookOpen },
    { label: 'Follow gratis', detail: 'Convierte curiosos en audiencia propia.', icon: Sparkles },
    { label: 'Regalos y suscripcion', detail: 'Apoyo directo cuando una historia conecta.', icon: Gift },
]

export function RightSidebar() {
    return (
        <aside className="hidden w-80 overflow-y-auto border-l border-[#2A2418] bg-[#11100E] p-6 text-[#FAF7F0] lg:block">
            <section className="rounded-3xl border border-[#C9A84C]/20 bg-[#C9A84C]/8 p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C9A84C]">Discovery preview</p>
                <h3 className="mt-3 font-serif text-2xl font-black leading-tight">
                    Asi vera el lector a los escritores.
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#FAF7F0]/62">
                    Cada escritor aparece como una tarjeta editorial: voz, promesa, primer gancho gratis y una ruta clara al perfil.
                </p>
                <Link href="/discover" className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-5 text-sm font-black text-[#0D0D0D] transition hover:bg-[#E2C96E]">
                    Ver discovery
                    <ArrowRight size={15} />
                </Link>
            </section>

            <section className="mt-8">
                <h4 className="text-sm font-black">Senales que importan</h4>
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

            <section className="mt-8 rounded-3xl border border-[#FAF7F0]/8 bg-[#FAF7F0]/5 p-5">
                <HeartHandshake className="text-[#C9A84C]" size={22} />
                <h4 className="mt-4 font-serif text-xl font-black">Feed real, no ranking falso.</h4>
                <p className="mt-2 text-sm leading-6 text-[#FAF7F0]/56">
                    La proxima capa debe ordenar por lecturas, follows, finalizacion de capitulos y actividad reciente, no por nombres de demo.
                </p>
            </section>
        </aside>
    )
}

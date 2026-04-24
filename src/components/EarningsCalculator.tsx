'use client'

import { useState } from 'react'

const TIERS = [
    { subs: 20, label: 'Primer ingreso real' },
    { subs: 100, label: 'Ingreso extra constante', featured: true },
    { subs: 500, label: 'Ingreso tiempo completo' },
]

function formatMoney(n: number): string {
    return n >= 1000
        ? `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
        : `$${n.toFixed(0)}`
}

export function EarningsCalculator() {
    const [price, setPrice] = useState(5)

    return (
        <section className="py-20 px-6 border-b border-gray-800/60 bg-[#0A0B0E] relative overflow-hidden">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[300px] bg-green-600/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[11px] font-bold tracking-wider uppercase mb-4">
                        💡 Tú decides tu precio
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                        Calcula cuánto puedes ganar
                    </h2>
                    <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
                        Tú pones el precio de tu suscripción. Sugerimos entre $3 y $15 al mes. Recibes el{' '}
                        <strong className="text-green-400">90%</strong> — bio.me retiene solo 10%.
                    </p>
                </div>

                {/* Slider */}
                <div className="max-w-xl mx-auto mb-12 bg-[#15171C] border border-gray-800 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-400 font-semibold">
                            Precio de tu suscripción mensual:
                        </span>
                        <span className="text-3xl font-black text-green-400 tracking-tight">
                            ${price}
                            <span className="text-gray-600 text-base font-medium">/mes</span>
                        </span>
                    </div>
                    <input
                        type="range"
                        min="2"
                        max="20"
                        step="1"
                        value={price}
                        onChange={(e) => setPrice(parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider-blue"
                    />
                    <div className="flex justify-between text-[11px] text-gray-600 mt-3 font-medium">
                        <span>$2</span><span>$5</span><span>$10</span><span>$15</span><span>$20</span>
                    </div>
                </div>

                {/* Scenarios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {TIERS.map((tier) => {
                        const net = tier.subs * price * 0.9
                        return (
                            <div
                                key={tier.subs}
                                className={`text-center p-6 rounded-2xl border transition-all ${
                                    tier.featured
                                        ? 'bg-gradient-to-br from-green-900/30 to-[#15171C] border-green-500/30 shadow-[0_10px_40px_-10px_rgba(34,197,94,0.3)] md:scale-105'
                                        : 'bg-white/[0.03] border-gray-800'
                                }`}
                            >
                                <p className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${tier.featured ? 'text-green-400' : 'text-gray-500'}`}>
                                    {tier.subs} suscriptores
                                </p>
                                <p className="text-[11px] text-gray-600 font-mono mb-3">
                                    {tier.subs} × ${price} × 90%
                                </p>
                                <p className={`text-4xl font-black tracking-tight mb-2 ${tier.featured ? 'text-green-300' : 'text-white'}`}>
                                    {formatMoney(net)}
                                    <span className="text-sm font-medium text-gray-500">/mes</span>
                                </p>
                                <p className="text-xs text-gray-500 font-medium">{tier.label}</p>
                            </div>
                        )
                    })}
                </div>

                <p className="text-center text-xs text-gray-600 mt-8 italic max-w-lg mx-auto">
                    + ingresos extras por regalos de lectores ($1 – $50 por regalo) · Sin contratos · Tu 90%, siempre
                </p>
            </div>

            <style jsx>{`
                .slider-blue::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #4ADE80, #16A34A);
                    cursor: grab;
                    box-shadow: 0 0 20px rgba(34,197,94,0.5), 0 0 0 4px rgba(34,197,94,0.15);
                    border: 2px solid #0A0A0A;
                }
                .slider-blue::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #4ADE80, #16A34A);
                    cursor: grab;
                    box-shadow: 0 0 20px rgba(34,197,94,0.5);
                    border: 2px solid #0A0A0A;
                }
            `}</style>
        </section>
    )
}

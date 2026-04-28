'use client'

import { useState } from 'react'
import { Calendar, BookOpen, Sparkles, Pause, ShieldCheck } from 'lucide-react'
import { saveTrustSettings } from './trustActions'

interface Props {
    initial: {
        posting_frequency?: 'weekly' | 'biweekly' | 'monthly' | 'irregular' | null
        frequency_promise?: string | null
        series_status?: 'active' | 'paused' | 'completed' | 'planning' | null
        why_i_write?: string | null
        expected_episodes_per_month?: number | null
    }
}

const FREQUENCIES = [
    { value: 'weekly', label: 'Cada semana', icon: Calendar },
    { value: 'biweekly', label: 'Cada dos semanas', icon: Calendar },
    { value: 'monthly', label: 'Cada mes', icon: Calendar },
    { value: 'irregular', label: 'Irregular / sin compromiso', icon: Calendar },
] as const

const STATUSES = [
    { value: 'active', label: 'Activa', desc: 'Estoy publicando regularmente', icon: BookOpen, color: 'green' },
    { value: 'paused', label: 'En pausa', desc: 'Volveré pronto, los lectores serán avisados', icon: Pause, color: 'amber' },
    { value: 'completed', label: 'Completa', desc: 'La historia ya está terminada', icon: ShieldCheck, color: 'blue' },
    { value: 'planning', label: 'En preparación', desc: 'Estoy escribiendo, aún no publico', icon: Sparkles, color: 'violet' },
] as const

export function TrustSettingsForm({ initial }: Props) {
    const [frequency, setFrequency] = useState(initial.posting_frequency || 'irregular')
    const [promise, setPromise] = useState(initial.frequency_promise || '')
    const [status, setStatus] = useState(initial.series_status || 'active')
    const [whyIWrite, setWhyIWrite] = useState(initial.why_i_write || '')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        const result = await saveTrustSettings({
            posting_frequency: frequency,
            frequency_promise: promise || null,
            series_status: status,
            why_i_write: whyIWrite || null,
        })
        setSaving(false)
        if (!result.error) {
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <h2 className="text-lg font-bold text-white mb-1">Confianza y continuidad</h2>
                <p className="text-sm text-gray-400 mb-6">
                    Estas señales aparecen en tu perfil y en el paywall. Le dan al lector la información que necesita para decidir suscribirse con confianza.
                </p>
            </div>

            {/* Why I write */}
            <div>
                <label className="block text-sm font-semibold text-white mb-2">¿Por qué cuentas tu historia?</label>
                <p className="text-xs text-gray-500 mb-3">280 caracteres. Aparece destacado en tu bio. Tu manifesto.</p>
                <textarea
                    value={whyIWrite}
                    onChange={(e) => setWhyIWrite(e.target.value.slice(0, 280))}
                    placeholder="Escribo porque..."
                    rows={3}
                    className="w-full bg-[#0A0B0E] border border-gray-800 rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:border-gray-600 focus:outline-none"
                />
                <p className="text-[10px] text-gray-600 mt-1">{whyIWrite.length}/280</p>
            </div>

            {/* Series status */}
            <div>
                <label className="block text-sm font-semibold text-white mb-2">Estado de tu historia</label>
                <p className="text-xs text-gray-500 mb-3">Sé honesto. Los lectores confían en escritores transparentes.</p>
                <div className="grid sm:grid-cols-2 gap-2">
                    {STATUSES.map((s) => {
                        const Icon = s.icon
                        const active = status === s.value
                        return (
                            <button
                                key={s.value}
                                type="button"
                                onClick={() => setStatus(s.value)}
                                className={`text-left p-3 rounded-lg border transition ${active ? `border-${s.color}-500/50 bg-${s.color}-500/5` : 'border-gray-800 hover:border-gray-700'}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon size={14} className={active ? `text-${s.color}-400` : 'text-gray-500'} />
                                    <span className="text-sm font-semibold text-white">{s.label}</span>
                                </div>
                                <p className="text-xs text-gray-500">{s.desc}</p>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Posting frequency */}
            <div>
                <label className="block text-sm font-semibold text-white mb-2">¿Con qué frecuencia publicas?</label>
                <p className="text-xs text-gray-500 mb-3">Solo promételo si vas a cumplirlo. Mejor "irregular" honesto que "semanal" abandonado.</p>
                <div className="grid sm:grid-cols-2 gap-2 mb-4">
                    {FREQUENCIES.map((f) => (
                        <button
                            key={f.value}
                            type="button"
                            onClick={() => setFrequency(f.value)}
                            className={`text-left p-3 rounded-lg border transition ${frequency === f.value ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-800 hover:border-gray-700'}`}
                        >
                            <span className="text-sm font-semibold text-white">{f.label}</span>
                        </button>
                    ))}
                </div>
                {frequency !== 'irregular' && (
                    <input
                        type="text"
                        value={promise}
                        onChange={(e) => setPromise(e.target.value.slice(0, 60))}
                        placeholder='ej: "Cada domingo a las 7pm"'
                        className="w-full bg-[#0A0B0E] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gray-600 focus:outline-none"
                    />
                )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition disabled:opacity-50"
                >
                    {saving ? 'Guardando...' : 'Guardar'}
                </button>
                {saved && <span className="text-sm text-blue-400">✓ Guardado</span>}
            </div>
        </form>
    )
}

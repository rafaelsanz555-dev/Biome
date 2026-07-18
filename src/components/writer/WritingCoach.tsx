'use client'

import { useMemo, useState } from 'react'
import { Lightbulb, X, Type, Quote, Zap, Target, BookOpen, Eye } from 'lucide-react'

interface Props {
    title: string
    previewText: string
    wordCount: number
}

interface Tip {
    id: string
    icon: any
    label: string
    detail: string
    severity: 'info' | 'good' | 'warn'
}

/**
 * Coach contextual lateral. Analiza título, preview y wordCount y muestra tips
 * sobre hooks, longitud, claridad. NO usa IA — heurísticas locales rápidas.
 * Para feedback más profundo, ver el AI Assistant (Round 4).
 */
export function WritingCoach({ title, previewText, wordCount }: Props) {
    const [open, setOpen] = useState(false)
    const tips = useMemo(() => {
        const t: Tip[] = []

        // Title checks
        if (!title) {
            t.push({ id: 'title-empty', icon: Type, label: 'El título es lo primero que ven', detail: 'Sin título, el feed pasa de largo. Hazlo específico, no genérico.', severity: 'warn' })
        } else {
            const titleLen = title.length
            if (titleLen < 10) {
                t.push({ id: 'title-short', icon: Type, label: 'Título corto', detail: `${titleLen} caracteres. Los títulos de 30-65 chars suelen tener más CTR. Considera añadir contexto emocional.`, severity: 'info' })
            } else if (titleLen > 80) {
                t.push({ id: 'title-long', icon: Type, label: 'Título largo', detail: 'Más de 80 caracteres se cortan en mobile. Prueba a sintetizarlo.', severity: 'warn' })
            } else {
                t.push({ id: 'title-ok', icon: Type, label: 'Título con buena longitud', detail: 'Entre 30-80 caracteres es el sweet spot.', severity: 'good' })
            }
            // Cliché check
            const cliches = ['mi historia', 'la verdad sobre', 'lo que nadie te cuenta', 'parte 1', 'capítulo 1']
            if (cliches.some((c) => title.toLowerCase().includes(c))) {
                t.push({ id: 'title-cliche', icon: Zap, label: 'Cuidado con clichés', detail: 'Frases como "mi historia" o "la verdad sobre" suenan genéricas. Sé concreto.', severity: 'info' })
            }
        }

        // Preview text (hook)
        if (!previewText) {
            t.push({ id: 'preview-empty', icon: Quote, label: 'Falta el gancho', detail: 'El "preview text" es la primera frase que ve el lector. Es tu hook. Empezá fuerte.', severity: 'warn' })
        } else if (previewText.length < 40) {
            t.push({ id: 'preview-short', icon: Quote, label: 'Hook muy corto', detail: 'Apunta a 60-180 caracteres. Suficiente para crear curiosidad sin spoilear.', severity: 'info' })
        } else if (previewText.length > 240) {
            t.push({ id: 'preview-long', icon: Quote, label: 'Hook muy largo', detail: 'Más de 240 chars y se siente como bajada en vez de gancho.', severity: 'info' })
        }

        // Word count
        if (wordCount === 0) {
            t.push({ id: 'wc-empty', icon: BookOpen, label: 'Empieza a escribir', detail: 'Las mejores historias empiezan en mitad de la acción. No expliques — muestra.', severity: 'info' })
        } else if (wordCount < 300) {
            t.push({ id: 'wc-short', icon: BookOpen, label: `${wordCount} palabras`, detail: 'Bajo 300 palabras se siente como un teaser. Si es a propósito, ok. Si no, profundiza.', severity: 'info' })
        } else if (wordCount > 3000) {
            t.push({ id: 'wc-long', icon: BookOpen, label: `${wordCount} palabras`, detail: 'Más de 3000 palabras y los lectores empiezan a abandonar. Considera dividirlo en 2 episodios.', severity: 'warn' })
        } else if (wordCount >= 800 && wordCount <= 2000) {
            t.push({ id: 'wc-sweet', icon: BookOpen, label: `${wordCount} palabras`, detail: 'Sweet spot de retención: 800-2000 palabras tienen las mejores tasas de finalización.', severity: 'good' })
        }

        // Generic creative prompts always present
        t.push({ id: 'tip-cta', icon: Target, label: 'Termina con un anzuelo', detail: 'Las series ganan cuando el último párrafo deja una pregunta abierta. ¿Qué pasa después?', severity: 'info' })
        t.push({ id: 'tip-preview', icon: Eye, label: 'Probá el preview', detail: 'Antes de publicar, abrí "Vista previa" y léelo en mobile. Es el 80% de tus lectores.', severity: 'info' })

        return t
    }, [title, previewText, wordCount])

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed bottom-20 right-3 z-50 flex items-center gap-2 rounded-full border border-[#D4B963]/45 bg-[#FFFCF5]/95 px-3 py-2.5 text-sm font-bold text-[#8B6E1B] shadow-xl backdrop-blur transition hover:bg-[#EEE5D5] md:bottom-6 md:right-6 md:px-4 md:py-3"
            >
                <Lightbulb size={16} />
                Coach <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.5 rounded-full">{tips.length}</span>
            </button>
        )
    }

    return (
        <div className="fixed bottom-20 right-3 z-50 flex max-h-[68vh] w-[calc(100vw-1.5rem)] max-w-80 flex-col overflow-hidden border border-[#D4B963]/45 bg-[#FFFCF5]/98 shadow-2xl backdrop-blur-xl md:bottom-6 md:right-6">
            <div className="flex items-center justify-between border-b border-[#171512]/10 p-4">
                <div className="flex items-center gap-2">
                    <Lightbulb className="text-amber-400" size={16} />
                    <h3 className="text-sm font-bold text-[#171512]">Writing Coach</h3>
                </div>
                <button onClick={() => setOpen(false)} className="text-[#8A8174] hover:text-[#A63D2D]">
                    <X size={16} />
                </button>
            </div>
            <div className="overflow-y-auto p-3 space-y-2">
                {tips.map((tip) => {
                    const Icon = tip.icon
                    const colors = tip.severity === 'good'
                        ? 'border-[#C9A84C]/20 bg-[#C9A84C]/5'
                        : tip.severity === 'warn'
                            ? 'border-amber-500/30 bg-amber-500/5'
                            : 'border-[#171512]/10 bg-[#F8F4EA]'
                    const iconColor = tip.severity === 'good' ? 'text-[#D8BA63]'
                        : tip.severity === 'warn' ? 'text-amber-400'
                            : 'text-gray-400'
                    return (
                        <div key={tip.id} className={`p-3 rounded-lg border ${colors}`}>
                            <div className="flex items-start gap-2.5">
                                <Icon size={14} className={`shrink-0 mt-0.5 ${iconColor}`} />
                                <div>
                                    <p className="text-xs font-semibold text-[#171512]">{tip.label}</p>
                                    <p className="mt-1 text-[11px] leading-relaxed text-[#746A5C]">{tip.detail}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="border-t border-[#171512]/10 p-3 text-[10px] italic text-[#8A8174]">
                Heurísticas, no reglas. Tu voz manda.
            </div>
        </div>
    )
}


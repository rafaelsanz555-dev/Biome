'use client'

import { useState, useEffect } from 'react'
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
    const [tips, setTips] = useState<Tip[]>([])

    useEffect(() => {
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

        setTips(t)
    }, [title, previewText, wordCount])

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed right-6 bottom-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-bold shadow-xl backdrop-blur transition"
            >
                <Lightbulb size={16} />
                Coach <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.5 rounded-full">{tips.length}</span>
            </button>
        )
    }

    return (
        <div className="fixed right-6 bottom-6 z-50 w-80 max-h-[70vh] rounded-2xl border border-amber-500/30 bg-[#0F1114]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <Lightbulb className="text-amber-400" size={16} />
                    <h3 className="text-sm font-bold text-white">Writing Coach</h3>
                </div>
                <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white">
                    <X size={16} />
                </button>
            </div>
            <div className="overflow-y-auto p-3 space-y-2">
                {tips.map((tip) => {
                    const Icon = tip.icon
                    const colors = tip.severity === 'good'
                        ? 'border-green-500/20 bg-green-500/5'
                        : tip.severity === 'warn'
                            ? 'border-amber-500/30 bg-amber-500/5'
                            : 'border-gray-800 bg-white/[0.02]'
                    const iconColor = tip.severity === 'good' ? 'text-green-400'
                        : tip.severity === 'warn' ? 'text-amber-400'
                            : 'text-gray-400'
                    return (
                        <div key={tip.id} className={`p-3 rounded-lg border ${colors}`}>
                            <div className="flex items-start gap-2.5">
                                <Icon size={14} className={`shrink-0 mt-0.5 ${iconColor}`} />
                                <div>
                                    <p className="text-xs font-semibold text-white">{tip.label}</p>
                                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{tip.detail}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="p-3 border-t border-gray-800 text-[10px] text-gray-600 italic">
                Heurísticas, no reglas. Tu voz manda.
            </div>
        </div>
    )
}

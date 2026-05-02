'use client'

import { useState } from 'react'
import { Sparkles, X, Wand2, Type, Loader2, Copy, Check, Globe } from 'lucide-react'

interface Props {
    /** Devuelve el texto plano actual del editor */
    getText: () => string
    /** Permite al editor reemplazar contenido (opcional) */
    onReplaceText?: (text: string) => void
    /** Permite cambiar el título (opcional) */
    onChooseTitle?: (title: string) => void
}

type Mode = 'menu' | 'improve' | 'titles' | 'translate'

export function AIAssistant({ getText, onChooseTitle }: Props) {
    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<Mode>('menu')
    const [loading, setLoading] = useState(false)
    const [improvedText, setImprovedText] = useState<string | null>(null)
    const [titles, setTitles] = useState<string[] | null>(null)
    const [translatedText, setTranslatedText] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

    function reset() {
        setMode('menu')
        setImprovedText(null)
        setTitles(null)
        setTranslatedText(null)
        setError(null)
    }

    async function handleImprove() {
        const text = getText()
        if (!text || text.length < 30) {
            setError('Escribe al menos 30 caracteres antes de pedir mejoras.')
            return
        }
        setMode('improve')
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/ai/improve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            })
            if (!res.ok) {
                const j = await res.json().catch(() => null)
                setError(j?.error === 'ai_unavailable' ? 'IA no configurada (falta ANTHROPIC_API_KEY)' : 'Error generando mejora.')
                return
            }
            const j = await res.json()
            setImprovedText(j.output)
        } finally {
            setLoading(false)
        }
    }

    async function handleTitles() {
        const text = getText()
        if (!text || text.length < 100) {
            setError('Escribe al menos 100 caracteres antes de pedir títulos.')
            return
        }
        setMode('titles')
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/ai/titles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            })
            if (!res.ok) {
                const j = await res.json().catch(() => null)
                setError(j?.error === 'ai_unavailable' ? 'IA no configurada' : 'Error generando títulos.')
                return
            }
            const j = await res.json()
            setTitles(j.titles)
        } finally {
            setLoading(false)
        }
    }

    async function handleTranslate() {
        const text = getText()
        if (!text || text.length < 30) {
            setError('Escribe al menos 30 caracteres antes de traducir.')
            return
        }
        setMode('translate')
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/ai/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            })
            if (!res.ok) {
                const j = await res.json().catch(() => null)
                setError(j?.error === 'ai_unavailable' ? 'IA no configurada' : 'Error traduciendo.')
                return
            }
            const j = await res.json()
            setTranslatedText(j.output)
        } finally {
            setLoading(false)
        }
    }

    function copyText(text: string, idx: number) {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIdx(idx)
            setTimeout(() => setCopiedIdx(null), 1200)
        })
    }

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed left-6 bottom-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-400 text-sm font-bold shadow-xl backdrop-blur transition"
                title="Asistente IA"
            >
                <Sparkles size={16} />
                Copiloto IA
            </button>
        )
    }

    return (
        <div className="fixed left-6 bottom-6 z-50 w-96 max-h-[80vh] rounded-2xl border border-violet-500/30 bg-[#0F1114]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-violet-400" size={16} />
                    <h3 className="text-sm font-bold text-white">Copiloto IA</h3>
                    <span className="text-[10px] bg-violet-500/15 text-violet-300 px-2 py-0.5 rounded-full">Beta</span>
                </div>
                <button onClick={() => { setOpen(false); reset() }} className="text-gray-500 hover:text-white">
                    <X size={16} />
                </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-3">
                {error && (
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-red-400">{error}</div>
                )}

                {mode === 'menu' && (
                    <div className="space-y-2">
                        <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                            La IA es tu copiloto. <strong className="text-white">No reemplaza tu voz</strong> — solo te ayuda a pulir lo que ya escribiste.
                        </p>
                        <button
                            onClick={handleImprove}
                            className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-800 hover:border-violet-500/30 hover:bg-violet-500/5 text-left transition"
                        >
                            <Wand2 className="text-violet-400 shrink-0 mt-0.5" size={16} />
                            <div>
                                <p className="text-sm font-semibold text-white">Mejorar redacción</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">Pule claridad, ritmo y gramática manteniendo tu voz.</p>
                            </div>
                        </button>
                        <button
                            onClick={handleTitles}
                            className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-800 hover:border-violet-500/30 hover:bg-violet-500/5 text-left transition"
                        >
                            <Type className="text-violet-400 shrink-0 mt-0.5" size={16} />
                            <div>
                                <p className="text-sm font-semibold text-white">Sugerir títulos</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">5 alternativas basadas en tu texto.</p>
                            </div>
                        </button>
                        <button
                            onClick={handleTranslate}
                            className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-800 hover:border-violet-500/30 hover:bg-violet-500/5 text-left transition"
                        >
                            <Globe className="text-violet-400 shrink-0 mt-0.5" size={16} />
                            <div>
                                <p className="text-sm font-semibold text-white">Traducir al Inglés</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">Llega a una audiencia global sin perder tu voz.</p>
                            </div>
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="flex items-center justify-center gap-2 py-8 text-violet-400 text-sm">
                        <Loader2 className="animate-spin" size={16} /> Pensando...
                    </div>
                )}

                {mode === 'improve' && improvedText && !loading && (
                    <div className="space-y-3">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-violet-400">Versión sugerida</p>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-gray-800 text-sm text-gray-200 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif' }}>
                            {improvedText}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => copyText(improvedText, 0)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 text-xs font-semibold transition"
                            >
                                {copiedIdx === 0 ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                            </button>
                            <button onClick={reset} className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition">
                                Volver
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-600 italic">
                            Revisa siempre antes de aceptar. La IA puede malinterpretar contexto personal.
                        </p>
                    </div>
                )}

                {mode === 'titles' && titles && !loading && (
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-violet-400">Títulos sugeridos</p>
                        {titles.map((t, i) => (
                            <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-gray-800 hover:border-violet-500/30 transition group">
                                <p className="text-sm text-white mb-2 leading-snug" style={{ fontFamily: 'Georgia, serif' }}>{t}</p>
                                <div className="flex gap-1.5">
                                    {onChooseTitle && (
                                        <button
                                            onClick={() => onChooseTitle(t)}
                                            className="px-2.5 py-1 rounded-md bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 text-[11px] font-bold transition"
                                        >
                                            Usar este
                                        </button>
                                    )}
                                    <button
                                        onClick={() => copyText(t, i)}
                                        className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 text-[11px] font-semibold transition flex items-center gap-1"
                                    >
                                        {copiedIdx === i ? <><Check size={10} /> Copiado</> : <><Copy size={10} /> Copiar</>}
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button onClick={reset} className="w-full mt-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition">
                            Volver
                        </button>
                    </div>
                )}

                {mode === 'translate' && translatedText && !loading && (
                    <div className="space-y-3">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-violet-400">English Translation</p>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-gray-800 text-sm text-gray-200 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif' }}>
                            {translatedText}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => copyText(translatedText, 0)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 text-xs font-semibold transition"
                            >
                                {copiedIdx === 0 ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                            </button>
                            <button onClick={reset} className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition">
                                Volver
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-gray-800 text-[10px] text-gray-600 italic">
                Powered by Claude. Tu voz, tu historia — la IA solo te apoya.
            </div>
        </div>
    )
}

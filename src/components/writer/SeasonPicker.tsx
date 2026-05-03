'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus, Loader2, BookOpen, FileText, Check } from 'lucide-react'

interface Season {
    id: string
    title: string
}

interface Props {
    name: string                      // input hidden name (FormData)
    initialSeasons: Season[]
    initialValue?: string | null      // pre-selected season id
    inputClassName?: string
}

/**
 * SeasonPicker — dropdown custom que reemplaza el <select> nativo.
 *
 * Muestra:
 *  - Capítulo independiente (sin serie)
 *  - Series existentes del creador
 *  - "+ Crear serie nueva" inline (sin abrir otra pestaña)
 *
 * Cuando el creator crea una serie inline, el POST a /api/seasons
 * devuelve la fila nueva, la metemos en el state local y la
 * pre-seleccionamos en el dropdown. Sin recarga.
 *
 * Mantiene compatibilidad con el form: hay un <input type="hidden">
 * con el id de la serie seleccionada (vacio = independiente).
 */
export function SeasonPicker({ name, initialSeasons, initialValue, inputClassName }: Props) {
    const [seasons, setSeasons] = useState<Season[]>(initialSeasons)
    const [selectedId, setSelectedId] = useState<string>(initialValue || '')
    const [open, setOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const ref = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
                setCreating(false)
                setError(null)
            }
        }
        document.addEventListener('mousedown', onClick)
        return () => document.removeEventListener('mousedown', onClick)
    }, [])

    useEffect(() => {
        if (creating && inputRef.current) inputRef.current.focus()
    }, [creating])

    const selected = seasons.find((s) => s.id === selectedId) || null

    function pick(id: string) {
        setSelectedId(id)
        setOpen(false)
        setCreating(false)
        setError(null)
    }

    async function handleCreate() {
        const title = newTitle.trim()
        if (title.length < 1) {
            setError('El nombre no puede estar vacío.')
            return
        }
        if (title.length > 120) {
            setError('Máximo 120 caracteres.')
            return
        }
        setBusy(true)
        setError(null)
        try {
            const res = await fetch('/api/seasons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            })
            if (!res.ok) {
                const j = await res.json().catch(() => null)
                setError(j?.error === 'invalid_title' ? 'Título inválido.' : 'Error creando la serie.')
                return
            }
            const j = await res.json()
            if (j?.season) {
                setSeasons((prev) => [...prev, j.season])
                setSelectedId(j.season.id)
            }
            setNewTitle('')
            setCreating(false)
            setOpen(false)
        } finally {
            setBusy(false)
        }
    }

    return (
        <div ref={ref} className="relative">
            {/* hidden input para el FormData */}
            <input type="hidden" name={name} value={selectedId} />

            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`${inputClassName} px-3 py-2.5 text-sm flex items-center justify-between text-left`}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className="flex items-center gap-2 min-w-0">
                    {selected ? (
                        <>
                            <BookOpen size={14} className="text-blue-400 shrink-0" />
                            <span className="truncate">{selected.title}</span>
                        </>
                    ) : (
                        <>
                            <FileText size={14} className="text-gray-500 shrink-0" />
                            <span className="text-gray-300 truncate">Capítulo independiente</span>
                        </>
                    )}
                </span>
                <ChevronDown size={14} className={`text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute left-0 right-0 mt-1.5 bg-[#0F1114] border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {/* Independiente */}
                    <button
                        type="button"
                        onClick={() => pick('')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition ${
                            !selectedId ? 'bg-blue-500/10 text-blue-300' : 'text-gray-200 hover:bg-white/5'
                        }`}
                    >
                        <FileText size={14} className="text-gray-500 shrink-0" />
                        <span className="flex-1">Capítulo independiente</span>
                        {!selectedId && <Check size={14} className="text-blue-400" />}
                    </button>

                    {/* Series existentes */}
                    {seasons.length > 0 && (
                        <>
                            <div className="border-t border-gray-800/60" />
                            <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                                Tus series
                            </div>
                            {seasons.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => pick(s.id)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition ${
                                        selectedId === s.id ? 'bg-blue-500/10 text-blue-300' : 'text-gray-200 hover:bg-white/5'
                                    }`}
                                >
                                    <BookOpen size={14} className="text-blue-400 shrink-0" />
                                    <span className="flex-1 truncate">{s.title}</span>
                                    {selectedId === s.id && <Check size={14} className="text-blue-400" />}
                                </button>
                            ))}
                        </>
                    )}

                    {/* Crear nueva — inline */}
                    <div className="border-t border-gray-800/60">
                        {creating ? (
                            <div className="p-3 space-y-2 bg-[#0A0B0E]">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => { setNewTitle(e.target.value); setError(null) }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') { e.preventDefault(); handleCreate() }
                                        if (e.key === 'Escape') { setCreating(false); setNewTitle(''); setError(null) }
                                    }}
                                    placeholder='Ej: "Mi divorcio en 8 capítulos"'
                                    maxLength={120}
                                    disabled={busy}
                                    className="w-full bg-[#15171C] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
                                />
                                {error && <p className="text-[11px] text-red-400">{error}</p>}
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => { setCreating(false); setNewTitle(''); setError(null) }}
                                        disabled={busy}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreate}
                                        disabled={busy || newTitle.trim().length < 1}
                                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-xs font-bold flex items-center gap-1.5 transition"
                                    >
                                        {busy ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                        Crear
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setCreating(true)}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left text-blue-400 hover:bg-blue-500/5 transition"
                            >
                                <Plus size={14} className="shrink-0" />
                                <span>Crear serie nueva…</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { BookOpen, Check, ChevronDown, FileText, Loader2, NotebookPen, Plus, ScrollText } from 'lucide-react'

type SeasonFormat = 'series' | 'thread'
type StoryType = 'life_story' | 'fiction'

interface Season {
    id: string
    title: string
    format?: SeasonFormat | null
    story_type?: StoryType | null
}

interface Props {
    name: string
    contentTypeName?: string
    initialSeasons: Season[]
    initialValue?: string | null
    inputClassName?: string
}

type NewWorkKind = 'life_story' | 'fiction' | 'thread'

function workLabel(season: Season) {
    if (season.format === 'thread') return 'Diario serial'
    return season.story_type === 'fiction' ? 'Novela' : 'Historia'
}

function WorkIcon({ season, size = 14 }: { season: Season; size?: number }) {
    if (season.format === 'thread') return <NotebookPen size={size} />
    if (season.story_type === 'fiction') return <ScrollText size={size} />
    return <BookOpen size={size} />
}

export function SeasonPicker({
    name,
    contentTypeName = 'content_type',
    initialSeasons,
    initialValue,
    inputClassName,
}: Props) {
    const [seasons, setSeasons] = useState<Season[]>(initialSeasons)
    const [selectedId, setSelectedId] = useState(initialValue || '')
    const [open, setOpen] = useState(false)
    const [creating, setCreating] = useState<NewWorkKind | null>(null)
    const [newTitle, setNewTitle] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const rootRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        function close(event: MouseEvent) {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setOpen(false)
                setCreating(null)
                setError(null)
            }
        }
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
    }, [])

    useEffect(() => {
        if (creating) inputRef.current?.focus()
    }, [creating])

    const selected = seasons.find((season) => season.id === selectedId) || null

    async function createWork() {
        const title = newTitle.trim()
        if (!creating || !title) return
        if (title.length > 120) {
            setError('El nombre puede tener hasta 120 caracteres.')
            return
        }

        const format: SeasonFormat = creating === 'thread' ? 'thread' : 'series'
        const storyType: StoryType = creating === 'fiction' ? 'fiction' : 'life_story'
        setBusy(true)
        setError(null)
        try {
            const response = await fetch('/api/seasons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, format, story_type: storyType }),
            })
            const result = await response.json().catch(() => null)
            if (!response.ok || !result?.season) {
                setError(result?.error || 'No pudimos crear la obra.')
                return
            }
            const created = { ...result.season, format, story_type: storyType } as Season
            setSeasons((current) => [created, ...current])
            setSelectedId(created.id)
            setNewTitle('')
            setCreating(null)
            setOpen(false)
        } finally {
            setBusy(false)
        }
    }

    return (
        <div ref={rootRef} className="relative">
            <input type="hidden" name={name} value={selectedId} />
            <input type="hidden" name={contentTypeName} value={selectedId ? 'chapter' : 'entry'} />

            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className={`${inputClassName || ''} flex items-center justify-between px-3 py-2.5 text-left text-sm`}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className="flex min-w-0 items-center gap-2">
                    {selected ? <WorkIcon season={selected} /> : <FileText size={14} />}
                    <span className="truncate">{selected ? selected.title : 'Entrada independiente'}</span>
                    <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.12em] opacity-50">
                        {selected ? workLabel(selected) : 'Feed'}
                    </span>
                </span>
                <ChevronDown size={14} className={`shrink-0 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-[#171512]/15 bg-[#FFFCF5] text-[#171512] shadow-2xl">
                    <button
                        type="button"
                        onClick={() => { setSelectedId(''); setOpen(false) }}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-[#F1E8D7] ${!selectedId ? 'bg-[#EFE4CF]' : ''}`}
                    >
                        <FileText size={15} className="text-[#A63D2D]" />
                        <span className="flex-1">
                            <strong className="block">Entrada independiente</strong>
                            <span className="text-[11px] text-[#776E61]">Un post de hoy; no necesita portada ni capítulos.</span>
                        </span>
                        {!selectedId && <Check size={15} />}
                    </button>

                    {seasons.length > 0 && (
                        <div className="border-t border-[#171512]/10 py-2">
                            <p className="px-4 pb-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#8A8174]">Agregar a una obra</p>
                            {seasons.map((season) => (
                                <button
                                    key={season.id}
                                    type="button"
                                    onClick={() => { setSelectedId(season.id); setOpen(false) }}
                                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[#F1E8D7] ${selectedId === season.id ? 'bg-[#EFE4CF]' : ''}`}
                                >
                                    <span className="text-[#A63D2D]"><WorkIcon season={season} /></span>
                                    <span className="min-w-0 flex-1 truncate font-bold">{season.title}</span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.12em] text-[#8A8174]">{workLabel(season)}</span>
                                    {selectedId === season.id && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="border-t border-[#171512]/10 p-3">
                        {!creating ? (
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    ['life_story', 'Historia', BookOpen],
                                    ['fiction', 'Novela', ScrollText],
                                    ['thread', 'Diario', NotebookPen],
                                ].map(([value, label, Icon]) => (
                                    <button
                                        key={String(value)}
                                        type="button"
                                        onClick={() => setCreating(value as NewWorkKind)}
                                        className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border border-[#171512]/10 text-[10px] font-black uppercase tracking-[0.1em] text-[#5F574B] hover:border-[#A63D2D]/45 hover:text-[#A63D2D]"
                                    >
                                        <Icon size={15} />
                                        <span>{String(label)}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-[#A63D2D]">
                                    Nueva {creating === 'fiction' ? 'novela' : creating === 'thread' ? 'diario serial' : 'historia'}
                                </label>
                                <input
                                    ref={inputRef}
                                    value={newTitle}
                                    maxLength={120}
                                    onChange={(event) => { setNewTitle(event.target.value); setError(null) }}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') { event.preventDefault(); createWork() }
                                        if (event.key === 'Escape') setCreating(null)
                                    }}
                                    placeholder="Nombre de la obra"
                                    className="h-10 w-full rounded-lg border border-[#171512]/15 bg-white px-3 text-sm outline-none focus:border-[#A63D2D]"
                                />
                                {error && <p className="text-[11px] text-red-700">{error}</p>}
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setCreating(null)} className="h-8 px-3 text-xs font-bold text-[#776E61]">Cancelar</button>
                                    <button type="button" disabled={busy || !newTitle.trim()} onClick={createWork} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#171512] px-3 text-xs font-black text-white disabled:opacity-40">
                                        {busy ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                        Crear y seleccionar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}


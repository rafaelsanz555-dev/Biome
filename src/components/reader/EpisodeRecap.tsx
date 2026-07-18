'use client'

import { useState } from 'react'
import { ChevronDown, History } from 'lucide-react'

interface Props {
    previousTitle: string
    recap: string
}

export function EpisodeRecap({ previousTitle, recap }: Props) {
    const [open, setOpen] = useState(false)

    return (
        <div className="mb-8 overflow-hidden border border-[#171512]/10 bg-[#FFFCF5]">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between p-4 text-left transition hover:bg-[#F0E8D9]"
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center bg-[#A63D2D]/8">
                        <History className="text-[#A63D2D]" size={14} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#A63D2D]">Anteriormente</p>
                        <p className="text-sm font-semibold text-[#171512]">{previousTitle}</p>
                    </div>
                </div>
                <ChevronDown size={16} className={`text-[#746A5C] transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="border-t border-[#171512]/10 px-4 pb-4 pt-2">
                    <p className="font-serif text-sm italic leading-relaxed text-[#4B443A]">
                        {recap}
                    </p>
                    <p className="mt-3 text-[10px] italic text-[#8A8174]">
                        ⚡ Resumen generado con IA — solo para ayudarte a recordar
                    </p>
                </div>
            )}
        </div>
    )
}

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
        <div className="mb-8 rounded-xl border border-gray-800 bg-[#0F1114] overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <History className="text-violet-400" size={14} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-violet-400">Anteriormente</p>
                        <p className="text-sm font-semibold text-white">{previousTitle}</p>
                    </div>
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-800">
                    <p className="text-sm text-gray-300 leading-relaxed italic" style={{ fontFamily: 'Georgia, serif' }}>
                        {recap}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-3 italic">
                        ⚡ Resumen generado con IA — solo para ayudarte a recordar
                    </p>
                </div>
            )}
        </div>
    )
}

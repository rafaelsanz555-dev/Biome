'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { changeLocale } from '@/i18n/actions'
import { track } from '@/lib/analytics'
import { Globe, Check } from 'lucide-react'

const LANGS = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
]

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
    const currentLocale = useLocale()
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', onClick)
        return () => document.removeEventListener('mousedown', onClick)
    }, [])

    function handleSelect(code: string) {
        if (code === currentLocale) { setOpen(false); return }
        track('language_changed', { from: currentLocale, to: code })
        startTransition(async () => {
            await changeLocale(code)
            setOpen(false)
        })
    }

    const current = LANGS.find(l => l.code === currentLocale) || LANGS[0]

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                disabled={isPending}
                className={`flex items-center gap-1.5 rounded-lg transition hover:bg-white/5 ${
                    compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
                } font-medium text-gray-400 hover:text-white`}
                aria-label="Change language"
            >
                <Globe size={compact ? 14 : 16} />
                <span className="uppercase tracking-wider text-[11px] font-bold">
                    {current.code}
                </span>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 min-w-[160px] bg-[#15171C] border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50">
                    {LANGS.map(lang => {
                        const isActive = lang.code === currentLocale
                        return (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition text-left ${
                                    isActive
                                        ? 'bg-green-500/10 text-green-400'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <span className="font-mono text-[11px] tracking-wider uppercase w-6">{lang.code}</span>
                                <span className="flex-1">{lang.label}</span>
                                {isActive && <Check size={14} className="text-green-500" />}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

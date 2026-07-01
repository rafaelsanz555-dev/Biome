'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

interface SearchBoxProps {
    placeholder?: string
    className?: string
    inputClassName?: string
    /** light = páginas públicas crema, dark = dashboard */
    variant?: 'dark' | 'light'
}

export function SearchBox({ placeholder, className, inputClassName, variant = 'dark' }: SearchBoxProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [value, setValue] = useState(searchParams.get('q') || '')

    function submit(e: React.FormEvent) {
        e.preventDefault()
        const q = value.trim()
        if (!q) return
        router.push(`/search?q=${encodeURIComponent(q)}`)
    }

    const baseInput = variant === 'dark'
        ? 'block w-full bg-[#1E1E1E] border border-transparent rounded-lg pl-10 pr-3 py-2 text-sm focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C] text-white placeholder-gray-500 transition-all outline-none'
        : 'block w-full bg-white border border-[#0D0D0D]/12 rounded-full pl-11 pr-4 py-3 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] text-[#0D0D0D] placeholder-[#0D0D0D]/40 transition-all outline-none'

    return (
        <form onSubmit={submit} role="search" className={className || 'relative w-full max-w-xl group'}>
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Search size={16} className={variant === 'dark' ? 'text-gray-500 group-focus-within:text-[#C9A84C] transition-colors' : 'text-[#0D0D0D]/40 group-focus-within:text-[#8A6A1C] transition-colors'} />
            </span>
            <input
                type="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder || 'Buscar...'}
                className={inputClassName || baseInput}
                aria-label={placeholder || 'Buscar'}
            />
        </form>
    )
}

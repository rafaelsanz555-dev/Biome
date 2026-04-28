'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { logout } from '@/app/auth/actions'
import { LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react'

interface UserMenuProps {
    email: string
    username: string
    role: 'creator' | 'reader' | string
    avatarUrl?: string | null
}

export function UserMenu({ email, username, role, avatarUrl }: UserMenuProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', onClick)
        return () => document.removeEventListener('mousedown', onClick)
    }, [])

    const initial = (username || 'U').charAt(0).toUpperCase()
    const isCreator = role === 'creator'

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : initial}
                </div>
                <ChevronDown size={14} className={`text-gray-500 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#15171C] border border-gray-800 shadow-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold overflow-hidden">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : initial}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-white truncate text-sm">@{username}</p>
                                <p className="text-[11px] text-gray-500 truncate">{email}</p>
                            </div>
                        </div>
                        <span className="inline-block mt-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {isCreator ? 'Escritor' : 'Lector'}
                        </span>
                    </div>

                    <div className="p-2">
                        <Link
                            href="/dashboard"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition text-gray-300 hover:text-white text-sm font-medium"
                        >
                            <LayoutDashboard size={15} />
                            Dashboard
                        </Link>
                        <Link
                            href={`/${username}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition text-gray-300 hover:text-white text-sm font-medium"
                        >
                            <User size={15} />
                            Ver mi perfil público
                        </Link>
                    </div>

                    <div className="border-t border-gray-800 p-2">
                        <form action={logout}>
                            <button
                                type="submit"
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition text-gray-400 text-sm font-medium"
                            >
                                <LogOut size={15} />
                                Cerrar sesión
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

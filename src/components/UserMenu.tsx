'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { logout } from '@/app/auth/actions'
import { LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface UserMenuProps {
    email: string
    username: string
    role: 'creator' | 'reader' | string
    avatarUrl?: string | null
}

export function UserMenu({ email, username, role, avatarUrl }: UserMenuProps) {
    const t = useTranslations('dashboard')
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
                className="dashboard-user-button flex items-center gap-2 rounded-xl px-1 py-1.5 transition sm:px-2"
                aria-label={t('open_user_menu')}
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8A6A1C] flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : initial}
                </div>
                <ChevronDown size={14} className={`dashboard-muted hidden transition sm:block ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="dashboard-menu absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border shadow-2xl">
                    <div className="dashboard-menu-border border-b p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8A6A1C] flex items-center justify-center text-white font-bold overflow-hidden">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : initial}
                            </div>
                            <div className="min-w-0">
                                <p className="dashboard-strong truncate text-sm font-bold">@{username}</p>
                                <p className="dashboard-muted truncate text-[11px]">{email}</p>
                            </div>
                        </div>
                        <span className="inline-block mt-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C9A84C]/10 text-[#D8BA63] border border-[#C9A84C]/20">
                            {isCreator ? t('writer_role') : t('reader_role')}
                        </span>
                    </div>

                    <div className="p-2">
                        <Link
                            href="/dashboard"
                            onClick={() => setOpen(false)}
                            className="dashboard-menu-item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
                        >
                            <LayoutDashboard size={15} />
                            {t('menu_dashboard')}
                        </Link>
                        <Link
                            href={`/${username}`}
                            onClick={() => setOpen(false)}
                            className="dashboard-menu-item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
                        >
                            <User size={15} />
                            {t('menu_public_profile')}
                        </Link>
                    </div>

                    <div className="dashboard-menu-border border-t p-2">
                        <form action={logout}>
                            <button
                                type="submit"
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition text-gray-400 text-sm font-medium"
                            >
                                <LogOut size={15} />
                                {t('menu_logout')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}


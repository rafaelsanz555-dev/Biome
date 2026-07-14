'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
    Home,
    Compass,
    BookOpen,
    TrendingUp,
    Users,
    Star,
    Clock,
    FileText,
    Settings,
    BarChart3,
    ExternalLink,
    UserCircle,
} from 'lucide-react'

interface DashboardNavProps {
    isCreator: boolean
    username?: string | null
}

export function DashboardNav({ isCreator, username }: DashboardNavProps) {
    const pathname = usePathname()
    const t = useTranslations('dashboard')

    // Main links — role-specific
    const mainLinks = isCreator
        ? [
            { href: '/dashboard', label: t('nav_home'), icon: Home, exact: true },
            { href: '/dashboard/discovery', label: t('nav_discovery'), icon: Compass },
            { href: '/dashboard/episodes', label: t('nav_stories'), icon: BookOpen },
            { href: '/dashboard/billing', label: t('nav_monetization'), icon: TrendingUp },
            { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
            { href: '/dashboard/audience', label: t('nav_audience'), icon: Users },
        ]
        : [
            { href: '/dashboard', label: t('nav_home'), icon: Home, exact: true },
            { href: '/dashboard/discovery', label: t('nav_discovery'), icon: Compass },
        ]

    // Library section — role-specific
    const libraryLinks = isCreator
        ? [
            { href: '/dashboard/subscriptions', label: t('nav_subscriptions'), icon: Star },
            { href: '/dashboard/history', label: t('nav_history'), icon: Clock },
            { href: '/dashboard/drafts', label: t('nav_drafts'), icon: FileText },
            { href: '/dashboard/settings', label: t('nav_settings'), icon: Settings },
        ]
        : [
            { href: '/dashboard/subscriptions', label: t('nav_subscriptions'), icon: Star },
            { href: '/dashboard/history', label: t('nav_history'), icon: Clock },
            { href: '/dashboard/settings', label: t('nav_settings'), icon: Settings },
        ]

    const renderLink = (link: any) => {
        const Icon = link.icon
        const isActive = link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(link.href + '/')

        return (
            <Link
                key={link.href}
                href={link.href}
                title={link.label}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                        ? 'bg-white/5 border-l-4 border-[#C9A84C] text-white'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
            >
                <Icon size={20} className="w-5" />
                <span className="font-medium text-sm">{link.label}</span>
            </Link>
        )
    }

    return (
        <nav className="flex-1 w-full px-3 space-y-1 mt-4">
            {mainLinks.map(renderLink)}

            <div className="pt-6 pb-2 px-3 text-[10px] uppercase font-bold text-gray-600 tracking-wider">
                {t('nav_library')}
            </div>

            {libraryLinks.map(renderLink)}

            {/* Botón "Ver mi perfil" — destacado, abre en nueva pestaña */}
            {username && (
                <div className="pt-6 px-1">
                    <Link
                        href={`/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gradient-to-br from-[#C9A84C]/15 to-[#8A6A1C]/10 border border-[#C9A84C]/20 text-white hover:from-[#C9A84C]/25 hover:to-[#8A6A1C]/15 transition group"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/20 flex items-center justify-center shrink-0">
                                <UserCircle size={16} className="text-[#C9A84C]" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold leading-tight">Ver mi perfil</p>
                                <p className="text-[10px] text-gray-400 truncate">Pergamo/{username}</p>
                            </div>
                        </div>
                        <ExternalLink size={12} className="text-gray-500 group-hover:text-[#C9A84C] transition shrink-0" />
                    </Link>
                </div>
            )}
        </nav>
    )
}

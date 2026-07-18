'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { LucideIcon } from 'lucide-react'
import { BarChart3, BookOpen, Bookmark, Compass, FileText, Home, Settings, Star, UserCircle, Users } from 'lucide-react'
import { MONETIZATION_ENABLED } from '@/lib/flags'
import { TrendingUp } from 'lucide-react'

interface DashboardNavProps {
    isCreator: boolean
    username?: string | null
    compact?: boolean
}

interface NavItem {
    href: string
    label: string
    icon: LucideIcon
    exact?: boolean
}

export function DashboardNav({ isCreator, username, compact = false }: DashboardNavProps) {
    const pathname = usePathname()
    const t = useTranslations('dashboard')

    const mainLinks: NavItem[] = isCreator
        ? [
            { href: '/dashboard', label: t('nav_home'), icon: Home, exact: true },
            { href: '/dashboard/episodes/new', label: t('nav_publish'), icon: FileText },
            { href: '/dashboard/episodes', label: t('nav_publications'), icon: BookOpen },
            { href: '/discover', label: t('nav_discovery'), icon: Compass },
            { href: '/dashboard/analytics', label: t('nav_analytics'), icon: BarChart3 },
            { href: '/dashboard/audience', label: t('nav_audience'), icon: Users },
            ...(MONETIZATION_ENABLED ? [{ href: '/dashboard/billing', label: t('nav_monetization'), icon: TrendingUp }] : []),
        ]
        : [
            { href: '/dashboard', label: t('nav_home'), icon: Home, exact: true },
            { href: '/discover', label: t('nav_discovery'), icon: Compass },
            { href: '/dashboard/subscriptions', label: t('nav_following'), icon: Star },
            { href: '/dashboard/history', label: t('nav_saved'), icon: Bookmark },
        ]

    if (compact) {
        return (
            <nav className="grid grid-cols-4 gap-1">
                {mainLinks.slice(0, 4).map((link) => {
                    const Icon = link.icon
                    const active = link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`)
                    return <Link key={link.href} href={link.href} className={`flex min-w-0 flex-col items-center gap-1 py-1 text-[9px] font-bold ${active ? 'text-[#A63D2D]' : 'text-[#746A5C]'}`}><Icon size={17} /><span className="max-w-full truncate">{link.label}</span></Link>
                })}
            </nav>
        )
    }

    const secondary: NavItem[] = [
        { href: '/dashboard/settings', label: t('nav_settings'), icon: Settings },
        ...(username ? [{ href: `/${username}`, label: t('nav_public_profile'), icon: UserCircle }] : []),
    ]

    const render = (link: NavItem) => {
        const Icon = link.icon
        const active = link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
            <Link key={link.href} href={link.href} className={`dashboard-nav-link relative flex items-center gap-3 px-4 py-3 text-sm font-bold transition ${active ? 'dashboard-nav-link-active' : ''}`}>
                {active && <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 bg-[#A63D2D]" />}
                <Icon size={18} /> {link.label}
            </Link>
        )
    }

    return (
        <nav className="mt-4 px-3">
            <div className="space-y-1">{mainLinks.map(render)}</div>
            <p className="mb-2 mt-7 px-4 text-[9px] font-black uppercase tracking-[0.18em] text-[#9A9082]">{t('nav_account')}</p>
            <div className="space-y-1">{secondary.map(render)}</div>
        </nav>
    )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'

interface DashboardNavProps {
    isCreator: boolean
}

export function DashboardNav({ isCreator }: DashboardNavProps) {
    const pathname = usePathname()

    // Main links — role-specific
    const mainLinks = isCreator
        ? [
            { href: '/dashboard', label: 'Inicio', icon: Home, exact: true },
            { href: '/dashboard/discovery', label: 'Discovery', icon: Compass },
            { href: '/dashboard/episodes', label: 'Mis historias', icon: BookOpen },
            { href: '/dashboard/billing', label: 'Monetización', icon: TrendingUp },
            { href: '/dashboard/analytics', label: 'Analítica', icon: BarChart3 },
            { href: '/dashboard/audience', label: 'Audiencia', icon: Users },
        ]
        : [
            { href: '/dashboard', label: 'Inicio', icon: Home, exact: true },
            { href: '/dashboard/discovery', label: 'Discovery', icon: Compass },
        ]

    // Library section — role-specific
    const libraryLinks = isCreator
        ? [
            { href: '/dashboard/subscriptions', label: 'Mis suscripciones', icon: Star },
            { href: '/dashboard/history', label: 'Historial', icon: Clock },
            { href: '/dashboard/drafts', label: 'Borradores', icon: FileText },
            { href: '/dashboard/settings', label: 'Ajustes', icon: Settings },
        ]
        : [
            { href: '/dashboard/subscriptions', label: 'Mis suscripciones', icon: Star },
            { href: '/dashboard/history', label: 'Historial', icon: Clock },
            { href: '/dashboard/settings', label: 'Ajustes', icon: Settings },
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
                        ? 'bg-white/5 border-l-4 border-green-500 text-white'
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
                Biblioteca
            </div>

            {libraryLinks.map(renderLink)}
        </nav>
    )
}

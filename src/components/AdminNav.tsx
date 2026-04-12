'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
    { href: '/admin', label: 'Panel General', icon: '◆', exact: true },
    { href: '/admin/users', label: 'Usuarios', icon: '◇' },
    { href: '/admin/writers', label: 'Escritores', icon: '◈' },
    { href: '/admin/content', label: 'Contenido', icon: '▣' },
    { href: '/admin/revenue', label: 'Ingresos', icon: '▲' },
    { href: '/admin/analytics', label: 'Analytics', icon: '◉' },
]

export function AdminNav() {
    const pathname = usePathname()

    return (
        <nav className="flex-1 space-y-1">
            {links.map((link) => {
                const isActive = link.exact
                    ? pathname === link.href
                    : pathname === link.href || pathname.startsWith(link.href + '/')
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                            isActive
                                ? "bg-[#C9A84C]/15 text-[#C9A84C] font-semibold border border-[#C9A84C]/20"
                                : "text-[#999] hover:bg-[#1a1a1a] hover:text-[#FAF7F0] border border-transparent"
                        )}
                    >
                        <span className={cn(
                            "text-xs transition-colors",
                            isActive ? "text-[#C9A84C]" : "text-[#555]"
                        )}>
                            {link.icon}
                        </span>
                        {link.label}
                    </Link>
                )
            })}
        </nav>
    )
}

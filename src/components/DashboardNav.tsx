'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
    { href: '/dashboard', label: '◆ Panel', exact: true },
    { href: '/dashboard/episodes', label: '✦ Mis Episodios' },
    { href: '/dashboard/seasons', label: '◈ Series' },
    { href: '/dashboard/billing', label: '▲ Ganancias' },
    { href: '/dashboard/settings', label: '◉ Ajustes' },
]

export function DashboardNav() {
    const pathname = usePathname()

    return (
        <nav className="flex-1 space-y-0.5">
            {links.map((link) => {
                const isActive = link.exact
                    ? pathname === link.href
                    : pathname === link.href || pathname.startsWith(link.href + '/')

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="block px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={
                            isActive
                                ? {
                                    backgroundColor: 'var(--gold-bg)',
                                    color: 'var(--gold-dark)',
                                    borderLeft: '2px solid var(--gold)',
                                    paddingLeft: '10px',
                                }
                                : {
                                    color: 'var(--ink-light)',
                                    borderLeft: '2px solid transparent',
                                }
                        }
                        onMouseEnter={e => {
                            if (!isActive) {
                                e.currentTarget.style.color = 'var(--ink)'
                                e.currentTarget.style.backgroundColor = 'var(--cream-dark)'
                            }
                        }}
                        onMouseLeave={e => {
                            if (!isActive) {
                                e.currentTarget.style.color = 'var(--ink-light)'
                                e.currentTarget.style.backgroundColor = 'transparent'
                            }
                        }}
                    >
                        {link.label}
                    </Link>
                )
            })}
        </nav>
    )
}

'use client'

import { usePathname } from 'next/navigation'
import { RightSidebar } from './RightSidebar'
import { StudioPanel } from './StudioPanel'

/**
 * RightRail — decide qué sidebar derecho mostrar según la ruta.
 *
 * Casiani: "del lado del creador que vea su parte como si fuese studio:
 * write, edit, publish, analytics, monetization. Pero no top gifted ni eso."
 *
 * Reader mode (feed/discovery/subscriptions/history) → RightSidebar (Top Gifted, etc.)
 * Studio mode (episodes/analytics/audience/billing/etc.) → StudioPanel (contextual)
 */

const STUDIO_PATHS = [
    '/dashboard/episodes',
    '/dashboard/analytics',
    '/dashboard/audience',
    '/dashboard/billing',
    '/dashboard/seasons',
    '/dashboard/drafts',
    '/dashboard/settings',
    '/dashboard/notifications',
]

export function RightRail() {
    const pathname = usePathname() || ''
    const isStudio = STUDIO_PATHS.some((p) => pathname.startsWith(p))

    if (isStudio) return <StudioPanel />
    return <RightSidebar />
}

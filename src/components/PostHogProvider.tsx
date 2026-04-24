'use client'

import { useEffect } from 'react'
import { initPostHog, identify, setUserProperties } from '@/lib/analytics'

interface PostHogProviderProps {
    children: React.ReactNode
    user?: {
        id: string
        email?: string | null
        role?: string | null
        username?: string | null
    } | null
}

/**
 * Inicializa PostHog en client y, si hay usuario, lo identifica.
 * Se monta a nivel del root layout. No-op si NEXT_PUBLIC_POSTHOG_KEY no está.
 */
export function PostHogProvider({ children, user }: PostHogProviderProps) {
    useEffect(() => {
        initPostHog()
    }, [])

    useEffect(() => {
        if (!user?.id) return
        identify(user.id, {
            email: user.email || undefined,
            role: user.role || undefined,
            username: user.username || undefined,
        })
        setUserProperties({
            role: user.role || undefined,
            username: user.username || undefined,
        })
    }, [user?.id, user?.role, user?.username, user?.email])

    return <>{children}</>
}

'use client'

import { useEffect, useRef } from 'react'

interface Props {
    episodeId: string
}

function getAnonId(): string {
    if (typeof document === 'undefined') return ''
    const existing = document.cookie.split('; ').find((r) => r.startsWith('biome_anon='))
    if (existing) return existing.split('=')[1]
    const id = 'anon_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    document.cookie = `biome_anon=${id}; max-age=${60 * 60 * 24 * 365}; path=/; samesite=lax`
    return id
}

function deviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof navigator === 'undefined') return 'desktop'
    const ua = navigator.userAgent.toLowerCase()
    if (/tablet|ipad/.test(ua)) return 'tablet'
    if (/mobile|iphone|android/.test(ua)) return 'mobile'
    return 'desktop'
}

export default function ReadTracker({ episodeId }: Props) {
    const viewIdRef = useRef<string | null>(null)
    const startTsRef = useRef<number>(Date.now())
    const maxPctRef = useRef<number>(0)
    const lastSentPctRef = useRef<number>(0)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const res = await fetch('/api/track/view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        episode_id: episodeId,
                        anon_id: getAnonId(),
                        referrer: document.referrer || null,
                        device_type: deviceType(),
                    }),
                })
                const data = await res.json().catch(() => null)
                if (!cancelled && data?.view_id) viewIdRef.current = data.view_id
            } catch {}
        })()

        function sendSession(final = false) {
            const viewId = viewIdRef.current
            if (!viewId) return
            const pct = maxPctRef.current
            const elapsed = Math.round((Date.now() - startTsRef.current) / 1000)
            const body = JSON.stringify({
                view_id: viewId,
                reached_percent: pct,
                time_spent_seconds: elapsed,
                completed: pct >= 90,
            })
            if (final && navigator.sendBeacon) {
                navigator.sendBeacon('/api/track/session', new Blob([body], { type: 'application/json' }))
            } else {
                fetch('/api/track/session', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
            }
        }

        function onScroll() {
            const scrollTop = window.scrollY
            const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
            const pct = Math.min(100, Math.round((scrollTop / docHeight) * 100))
            if (pct > maxPctRef.current) maxPctRef.current = pct
            if (maxPctRef.current - lastSentPctRef.current >= 10) {
                lastSentPctRef.current = maxPctRef.current
                sendSession(false)
            }
        }

        function onHide() {
            if (document.visibilityState === 'hidden') sendSession(true)
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        document.addEventListener('visibilitychange', onHide)
        window.addEventListener('beforeunload', () => sendSession(true))

        return () => {
            cancelled = true
            window.removeEventListener('scroll', onScroll)
            document.removeEventListener('visibilitychange', onHide)
            sendSession(true)
        }
    }, [episodeId])

    return null
}

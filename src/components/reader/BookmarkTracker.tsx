'use client'

import { useEffect, useRef } from 'react'

interface Props {
    episodeId: string
    enabled: boolean
}

/**
 * Persiste el bookmark del lector autenticado para "Continúa donde lo dejaste".
 * Coexiste con ReadTracker (que es analytics anónima). Este es para el lector.
 */
export default function BookmarkTracker({ episodeId, enabled }: Props) {
    const lastSentRef = useRef<number>(0)

    useEffect(() => {
        if (!enabled) return
        let timeout: any = null

        function flush(final = false) {
            const scrollTop = window.scrollY
            const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
            const pct = Math.min(100, Math.round((scrollTop / docHeight) * 100))
            if (pct < lastSentRef.current && !final) return

            const completed = pct >= 85
            const body = JSON.stringify({ episode_id: episodeId, reached_percent: pct, completed })
            if (final && navigator.sendBeacon) {
                navigator.sendBeacon('/api/bookmarks', new Blob([body], { type: 'application/json' }))
            } else {
                fetch('/api/bookmarks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body,
                    keepalive: true,
                }).catch(() => {})
            }
            lastSentRef.current = pct
        }

        function onScroll() {
            if (timeout) return
            timeout = setTimeout(() => {
                flush(false)
                timeout = null
            }, 2000)
        }

        function onHide() {
            if (document.visibilityState === 'hidden') flush(true)
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        document.addEventListener('visibilitychange', onHide)
        window.addEventListener('beforeunload', () => flush(true))

        return () => {
            window.removeEventListener('scroll', onScroll)
            document.removeEventListener('visibilitychange', onHide)
            if (timeout) clearTimeout(timeout)
            flush(true)
        }
    }, [episodeId, enabled])

    return null
}

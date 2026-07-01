'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Bell, Check, AlertCircle } from 'lucide-react'

interface FollowButtonProps {
    targetType: 'creator' | 'story'
    targetId: string
    initialFollowing: boolean
    isAuthenticated: boolean
    className?: string
}

export function FollowButton({ targetType, targetId, initialFollowing, isAuthenticated, className }: FollowButtonProps) {
    const router = useRouter()
    const [following, setFollowing] = useState(initialFollowing)
    const [busy, setBusy] = useState(false)
    const [failed, setFailed] = useState(false)

    async function toggle() {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        if (busy) return
        setBusy(true)
        setFailed(false)
        const previous = following
        setFollowing(!previous)
        try {
            const res = await fetch('/api/follows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetType, targetId }),
            })
            const json = await res.json().catch(() => null)
            if (!res.ok) {
                console.error('[follow] failed:', json?.error || res.status)
                throw new Error('follow_failed')
            }
            setFollowing(!!json?.following)
            router.refresh()
        } catch {
            setFollowing(previous)
            setFailed(true)
            setTimeout(() => setFailed(false), 3000)
        } finally {
            setBusy(false)
        }
    }

    return (
        <button
            type="button"
            onClick={toggle}
            disabled={busy}
            className={className || 'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-700 bg-[#1A1C23] px-5 text-sm font-bold text-gray-200 transition hover:bg-gray-800 disabled:opacity-60'}
        >
            {failed ? (
                <><AlertCircle size={15} className="text-red-400" /> Error, reintenta</>
            ) : (
                <>
                    {following ? <Check size={15} /> : <Bell size={15} />}
                    {following ? 'Siguiendo' : targetType === 'story' ? 'Seguir historia' : 'Seguir gratis'}
                </>
            )}
        </button>
    )
}

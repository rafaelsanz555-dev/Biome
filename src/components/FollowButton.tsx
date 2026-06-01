'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Bell, Check } from 'lucide-react'

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

    async function toggle() {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        if (busy) return
        setBusy(true)
        const previous = following
        setFollowing(!previous)
        try {
            const res = await fetch('/api/follows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetType, targetId }),
            })
            if (!res.ok) throw new Error('follow_failed')
            const json = await res.json()
            setFollowing(!!json.following)
            router.refresh()
        } catch {
            setFollowing(previous)
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
            {following ? <Check size={15} /> : <Bell size={15} />}
            {following ? 'Siguiendo' : targetType === 'story' ? 'Seguir historia' : 'Seguir gratis'}
        </button>
    )
}

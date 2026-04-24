'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Eye } from 'lucide-react'

interface LiveReaderCountProps {
    episodeId: string
}

export function LiveReaderCount({ episodeId }: LiveReaderCountProps) {
    const [count, setCount] = useState(1)

    useEffect(() => {
        const supabase = createClient()
        const channel = supabase.channel(`episode:${episodeId}`, {
            config: { presence: { key: Math.random().toString(36).substring(2) } },
        })

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState()
                const n = Object.keys(state).length
                setCount(Math.max(1, n))
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ joined_at: Date.now() })
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [episodeId])

    if (count < 2) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700 text-xs font-medium text-gray-400">
                <Eye size={12} />
                Tú estás leyendo
            </div>
        )
    }

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-bold text-green-400">
            <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex w-2 h-2 rounded-full bg-green-500"></span>
            </span>
            <span>{count} {count === 2 ? 'persona leyendo' : 'personas leyendo'} ahora</span>
        </div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudOff, Check, Loader2 } from 'lucide-react'

type Status = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
    /** Llamar cada vez que el contenido cambia */
    triggerKey: string
    /** Función que persiste a localStorage o servidor */
    onSave: () => Promise<void>
    /** ms entre cambios y guardado (default 4000) */
    debounceMs?: number
}

/**
 * Indicador "ya guardado / guardando..." en estilo Notion/Linear.
 * Hace debounce del onSave para no spamear la red.
 */
export function AutosaveIndicator({ triggerKey, onSave, debounceMs = 4000 }: Props) {
    const [status, setStatus] = useState<Status>('idle')
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

    useEffect(() => {
        if (!triggerKey) return
        setStatus('idle')
        const t = setTimeout(async () => {
            setStatus('saving')
            try {
                await onSave()
                setStatus('saved')
                setLastSavedAt(new Date())
            } catch {
                setStatus('error')
            }
        }, debounceMs)
        return () => clearTimeout(t)
    }, [triggerKey, debounceMs, onSave])

    return (
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
            {status === 'idle' && lastSavedAt && (
                <>
                    <Check size={12} className="text-blue-500" />
                    <span>Guardado · {lastSavedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                </>
            )}
            {status === 'idle' && !lastSavedAt && (
                <>
                    <Cloud size={12} />
                    <span>Borrador local</span>
                </>
            )}
            {status === 'saving' && (
                <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Guardando...</span>
                </>
            )}
            {status === 'saved' && (
                <>
                    <Check size={12} className="text-blue-500" />
                    <span>Guardado</span>
                </>
            )}
            {status === 'error' && (
                <>
                    <CloudOff size={12} className="text-red-500" />
                    <span className="text-red-400">Error guardando</span>
                </>
            )}
        </div>
    )
}

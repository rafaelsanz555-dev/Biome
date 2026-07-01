'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { switchRole } from './roleActions'
import { PenLine, BookOpen, Loader2 } from 'lucide-react'

export function RoleSwitcher({ currentRole }: { currentRole: 'reader' | 'creator' }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [confirming, setConfirming] = useState(false)

    const toCreator = currentRole === 'reader'

    function handleSwitch() {
        setError(null)
        startTransition(async () => {
            const res = await switchRole(toCreator ? 'creator' : 'reader')
            if (res.error) {
                setError(res.error)
                setConfirming(false)
                return
            }
            setConfirming(false)
            router.refresh()
        })
    }

    return (
        <div className="rounded-2xl border border-gray-800 bg-[#15171C] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C9A84C]/10 text-[#C9A84C]">
                        {toCreator ? <PenLine size={18} /> : <BookOpen size={18} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-white">
                            {toCreator ? '¿Quieres escribir?' : 'Modo lector'}
                        </h3>
                        <p className="mt-1 max-w-md text-sm leading-6 text-gray-400">
                            {toCreator
                                ? 'Activa el modo escritor para publicar capítulos, definir tu precio de suscripción y recibir apoyo de tus lectores.'
                                : 'Si cambias a modo lector, las herramientas de escritor se ocultan. Tus capítulos, precio y marca quedan guardados — vuelve cuando quieras.'}
                        </p>
                    </div>
                </div>

                {!confirming ? (
                    <button
                        type="button"
                        onClick={() => setConfirming(true)}
                        className={`shrink-0 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                            toCreator
                                ? 'bg-[#C9A84C] text-[#0D0D0D] hover:bg-[#D8BA63]'
                                : 'border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
                        }`}
                    >
                        {toCreator ? 'Activar modo escritor' : 'Cambiar a modo lector'}
                    </button>
                ) : (
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setConfirming(false)}
                            disabled={isPending}
                            className="rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-bold text-gray-400 transition hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSwitch}
                            disabled={isPending}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#C9A84C] px-4 py-2.5 text-sm font-bold text-[#0D0D0D] transition hover:bg-[#D8BA63] disabled:opacity-60"
                        >
                            {isPending && <Loader2 size={14} className="animate-spin" />}
                            Confirmar
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-400">{error}</p>
            )}
        </div>
    )
}

'use client'

import { useState, useActionState, useEffect, useRef } from 'react'
import { completeOnboarding } from './actions'
import Link from 'next/link'
import { PenLine, BookOpen, Check } from 'lucide-react'
import { track } from '@/lib/analytics'

const initialState = { error: '' }

export default function OnboardingPage() {
    const [state, formAction, pending] = useActionState(completeOnboarding, initialState)
    const [selectedRole, setSelectedRole] = useState<'creator' | 'reader'>('creator')
    const trackedStart = useRef(false)

    useEffect(() => {
        if (trackedStart.current) return
        track('onboarding_started')
        trackedStart.current = true
    }, [])

    function handleSubmit(formData: FormData) {
        track('onboarding_completed', { role: selectedRole })
        formAction(formData)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FAF7F0] text-[#0D0D0D]">
            <div className="w-full max-w-md flex flex-col items-center space-y-8 relative z-10">

                <div className="text-center">
                    <Link href="/" className="font-black text-4xl tracking-tight hover:opacity-80 transition-opacity inline-block text-[#0D0D0D]">
                        Pergamo<span className="text-[#C9A84C]">.</span>
                    </Link>
                    <p className="text-[#0D0D0D]/50 font-medium tracking-wide text-sm mt-1">
                        Historias reales, capítulo a capítulo.
                    </p>
                </div>

                <div className="w-full rounded-3xl p-8 bg-white border border-[#0D0D0D]/10 shadow-xl">
                    <div className="mb-6">
                        <h1 className="font-serif font-black text-2xl text-[#0D0D0D] tracking-tight mb-1">
                            Completa tu perfil
                        </h1>
                        <p className="text-sm text-[#0D0D0D]/58">
                            Elige tu nombre de usuario y cómo quieres usar Pergamo.
                        </p>
                    </div>

                    <form action={handleSubmit} className="space-y-5">

                        {/* Username */}
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-black text-[#0D0D0D]">
                                Nombre de usuario
                            </label>
                            <div className="flex rounded-xl overflow-hidden bg-[#FAF7F0] border border-[#0D0D0D]/12 focus-within:border-[#C9A84C] transition">
                                <span className="inline-flex items-center px-3 text-xs font-bold shrink-0 text-[#0D0D0D]/45 bg-[#0D0D0D]/5 border-r border-[#0D0D0D]/10">
                                    pergamo.co/
                                </span>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="tunombre"
                                    required
                                    minLength={3}
                                    maxLength={20}
                                    pattern="[a-z0-9_]+"
                                    autoFocus
                                    onChange={(e) => { e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }}
                                    className="flex-1 h-11 text-sm font-medium px-3 bg-transparent text-[#0D0D0D] placeholder:text-[#0D0D0D]/35 focus:outline-none"
                                />
                            </div>
                            <p className="text-xs text-[#0D0D0D]/45">
                                3–20 caracteres. Solo minúsculas, números y guiones bajos. Tu URL será <code className="text-[#8A6A1C] font-mono">pergamo.co/tunombre</code>.
                            </p>
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <label className="text-sm font-black text-[#0D0D0D] block">
                                ¿Qué vienes a hacer en Pergamo?
                            </label>
                            <input type="hidden" name="role" value={selectedRole} />
                            <div className="grid grid-cols-2 gap-3">

                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('creator')}
                                    className={`relative flex flex-col gap-2 p-4 rounded-xl transition-all text-left ${
                                        selectedRole === 'creator'
                                            ? 'border-2 border-[#C9A84C] bg-[#C9A84C]/10 shadow-lg shadow-[#C9A84C]/10 scale-[1.02]'
                                            : 'border-2 border-[#0D0D0D]/10 bg-[#FAF7F0] hover:border-[#0D0D0D]/25'
                                    }`}
                                >
                                    {selectedRole === 'creator' && (
                                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#C9A84C] flex items-center justify-center">
                                            <Check size={12} className="text-[#0D0D0D] stroke-[3]" />
                                        </div>
                                    )}
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                        selectedRole === 'creator' ? 'bg-[#C9A84C]/20' : 'bg-[#0D0D0D]/5'
                                    }`}>
                                        <PenLine size={17} className={selectedRole === 'creator' ? 'text-[#8A6A1C]' : 'text-[#0D0D0D]/50'} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-[#0D0D0D]">
                                            Escribir
                                        </div>
                                        <div className="text-xs text-[#0D0D0D]/55 mt-0.5 leading-snug">
                                            Contar mi historia por capítulos
                                        </div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('reader')}
                                    className={`relative flex flex-col gap-2 p-4 rounded-xl transition-all text-left ${
                                        selectedRole === 'reader'
                                            ? 'border-2 border-[#C9A84C] bg-[#C9A84C]/10 shadow-lg shadow-[#C9A84C]/10 scale-[1.02]'
                                            : 'border-2 border-[#0D0D0D]/10 bg-[#FAF7F0] hover:border-[#0D0D0D]/25'
                                    }`}
                                >
                                    {selectedRole === 'reader' && (
                                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#C9A84C] flex items-center justify-center">
                                            <Check size={12} className="text-[#0D0D0D] stroke-[3]" />
                                        </div>
                                    )}
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                        selectedRole === 'reader' ? 'bg-[#C9A84C]/20' : 'bg-[#0D0D0D]/5'
                                    }`}>
                                        <BookOpen size={17} className={selectedRole === 'reader' ? 'text-[#8A6A1C]' : 'text-[#0D0D0D]/50'} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-[#0D0D0D]">
                                            Leer
                                        </div>
                                        <div className="text-xs text-[#0D0D0D]/55 mt-0.5 leading-snug">
                                            Seguir y leer a mis autores favoritos
                                        </div>
                                    </div>
                                </button>

                            </div>
                        </div>

                        {state?.error && (
                            <div className="text-sm p-3 rounded-xl text-red-700 bg-red-500/10 border border-red-500/20 font-bold">
                                {state.error}
                            </div>
                        )}

                        {/* Aceptación de términos */}
                        <label className="flex items-start gap-3 p-4 rounded-xl border border-[#0D0D0D]/10 bg-[#FAF7F0] cursor-pointer hover:border-[#0D0D0D]/25 transition">
                            <input
                                type="checkbox"
                                name="accept_terms"
                                required
                                className="mt-0.5 w-4 h-4 accent-[#C9A84C] cursor-pointer shrink-0"
                            />
                            <span className="text-xs text-[#0D0D0D]/65 leading-relaxed">
                                He leído y acepto los{' '}
                                <a href="/legal/terms" target="_blank" className="text-[#8A6A1C] font-bold hover:underline">Términos de Servicio</a>,{' '}
                                la{' '}
                                <a href="/legal/privacy" target="_blank" className="text-[#8A6A1C] font-bold hover:underline">Política de Privacidad</a>,{' '}
                                la{' '}
                                <a href="/legal/content-policy" target="_blank" className="text-[#8A6A1C] font-bold hover:underline">Política de Contenido</a>
                                {selectedRole === 'creator' && (
                                    <>{' '}y los{' '}
                                    <a href="/legal/creator-terms" target="_blank" className="text-[#8A6A1C] font-bold hover:underline">Creator Terms</a></>
                                )}
                                {' '}de Pergamo. Confirmo que tengo al menos 18 años.
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={pending}
                            className="w-full h-12 font-black text-sm tracking-wide bg-[#0D0D0D] hover:bg-[#2A2418] text-[#FAF7F0] rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {pending ? 'Guardando...' : 'Empezar en Pergamo →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

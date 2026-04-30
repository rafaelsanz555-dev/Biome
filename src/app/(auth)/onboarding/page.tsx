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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0A0B0E] text-white">
            <div className="w-full max-w-md flex flex-col items-center space-y-8 relative z-10">

                <div className="text-center">
                    <Link href="/" className="font-bold text-4xl tracking-tight hover:opacity-80 transition-opacity inline-block text-blue-500">
                        bio<span className="text-white">.me</span>
                    </Link>
                    <p className="text-gray-500 font-medium tracking-wide text-sm mt-1">
                        Tu historia. Tu ingreso.
                    </p>
                </div>

                <div className="w-full rounded-2xl p-8 bg-[#15171C] border border-gray-800 shadow-2xl">
                    <div className="mb-6">
                        <h1 className="font-bold text-xl text-white tracking-tight mb-1">
                            Completa tu perfil
                        </h1>
                        <p className="text-sm text-gray-400">
                            Elige tu nombre de usuario y cómo quieres usar bio.me.
                        </p>
                    </div>

                    <form action={handleSubmit} className="space-y-5">

                        {/* Username */}
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-bold text-gray-300">
                                Nombre de usuario
                            </label>
                            <div className="flex rounded-xl overflow-hidden bg-[#1A1C23] border border-gray-700 focus-within:border-blue-500/50 transition">
                                <span className="inline-flex items-center px-3 text-xs font-medium shrink-0 text-gray-500 bg-[#0A0B0E] border-r border-gray-700">
                                    bio.me/@
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
                                    className="flex-1 h-11 text-sm font-medium px-3 bg-transparent text-white placeholder:text-gray-600 focus:outline-none"
                                />
                            </div>
                            <p className="text-xs text-gray-600">
                                3–20 caracteres. Solo minúsculas, números y guiones bajos. Tu URL será <code className="text-blue-400 font-mono">bio.me/tunombre</code>.
                            </p>
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300 block">
                                ¿Qué vienes a hacer en bio.me?
                            </label>
                            <input type="hidden" name="role" value={selectedRole} />
                            <div className="grid grid-cols-2 gap-3">

                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('creator')}
                                    className={`relative flex flex-col gap-2 p-4 rounded-xl transition-all text-left ${
                                        selectedRole === 'creator'
                                            ? 'border-2 border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20 scale-[1.02]'
                                            : 'border-2 border-gray-800 bg-[#0A0B0E] hover:border-gray-700'
                                    }`}
                                >
                                    {selectedRole === 'creator' && (
                                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                            <Check size={12} className="text-black stroke-[3]" />
                                        </div>
                                    )}
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                        selectedRole === 'creator' ? 'bg-blue-500/20' : 'bg-gray-800/50'
                                    }`}>
                                        <PenLine size={17} className={selectedRole === 'creator' ? 'text-blue-400' : 'text-gray-400'} />
                                    </div>
                                    <div>
                                        <div className={`text-sm font-bold ${selectedRole === 'creator' ? 'text-white' : 'text-gray-300'}`}>
                                            Escribir
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5 leading-snug">
                                            Publicar mi historia y ganar dinero
                                        </div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('reader')}
                                    className={`relative flex flex-col gap-2 p-4 rounded-xl transition-all text-left ${
                                        selectedRole === 'reader'
                                            ? 'border-2 border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20 scale-[1.02]'
                                            : 'border-2 border-gray-800 bg-[#0A0B0E] hover:border-gray-700'
                                    }`}
                                >
                                    {selectedRole === 'reader' && (
                                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                            <Check size={12} className="text-black stroke-[3]" />
                                        </div>
                                    )}
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                        selectedRole === 'reader' ? 'bg-blue-500/20' : 'bg-gray-800/50'
                                    }`}>
                                        <BookOpen size={17} className={selectedRole === 'reader' ? 'text-blue-400' : 'text-gray-400'} />
                                    </div>
                                    <div>
                                        <div className={`text-sm font-bold ${selectedRole === 'reader' ? 'text-white' : 'text-gray-300'}`}>
                                            Leer
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5 leading-snug">
                                            Seguir y leer a mis escritores favoritos
                                        </div>
                                    </div>
                                </button>

                            </div>
                        </div>

                        {state?.error && (
                            <div className="text-sm p-3 rounded-xl text-red-400 bg-red-500/10 border border-red-500/20">
                                {state.error}
                            </div>
                        )}

                        {/* Aceptación de términos */}
                        <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-800 bg-[#0A0B0E] cursor-pointer hover:border-gray-700 transition">
                            <input
                                type="checkbox"
                                name="accept_terms"
                                required
                                className="mt-0.5 w-4 h-4 accent-blue-500 cursor-pointer shrink-0"
                            />
                            <span className="text-xs text-gray-400 leading-relaxed">
                                He leído y acepto los{' '}
                                <a href="/legal/terms" target="_blank" className="text-blue-400 hover:underline">Términos de Servicio</a>,{' '}
                                la{' '}
                                <a href="/legal/privacy" target="_blank" className="text-blue-400 hover:underline">Política de Privacidad</a>,{' '}
                                la{' '}
                                <a href="/legal/content-policy" target="_blank" className="text-blue-400 hover:underline">Política de Contenido</a>
                                {selectedRole === 'creator' && (
                                    <>{' '}y los{' '}
                                    <a href="/legal/creator-terms" target="_blank" className="text-blue-400 hover:underline">Creator Terms</a></>
                                )}
                                {' '}de bio.me. Confirmo que tengo al menos 18 años.
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={pending}
                            className="w-full h-12 font-bold text-sm tracking-wide bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {pending ? 'Guardando...' : 'Empezar en bio.me →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

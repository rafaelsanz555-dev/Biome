'use client'

import { useActionState } from 'react'
import { completeOnboarding } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const initialState = { error: '' }

export default function OnboardingPage() {
    const [state, formAction, pending] = useActionState(completeOnboarding, initialState)

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-4"
            style={{
                backgroundColor: 'var(--cream)',
                background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,168,76,0.12) 0%, var(--cream) 65%)',
            }}
        >
            <div className="w-full max-w-sm flex flex-col items-center space-y-8">

                {/* Logo */}
                <div className="text-center">
                    <p className="font-serif text-3xl font-bold" style={{ color: 'var(--ink)' }}>
                        bio<span style={{ color: 'var(--gold)' }}>.me</span>
                    </p>
                    <p className="text-xs mt-1 font-medium" style={{ color: 'var(--ink-light)' }}>
                        Tu historia. Tu ingreso.
                    </p>
                </div>

                {/* Card */}
                <div
                    className="w-full rounded-2xl p-7"
                    style={{
                        backgroundColor: 'white',
                        border: '1px solid var(--cream-mid)',
                        boxShadow: '0 4px 24px rgba(20,16,10,0.07)',
                    }}
                >
                    <div className="mb-6">
                        <h1
                            className="font-serif text-xl font-bold mb-1"
                            style={{ color: 'var(--ink)' }}
                        >
                            Completa tu perfil
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
                            Elige tu nombre de usuario y cómo quieres usar bio.me.
                        </p>
                    </div>

                    <form action={formAction} className="space-y-5">

                        {/* Username */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="username"
                                className="text-sm font-semibold"
                                style={{ color: 'var(--ink)' }}
                            >
                                Nombre de usuario
                            </label>
                            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--cream-mid)' }}>
                                <span
                                    className="inline-flex items-center px-3 text-sm font-medium"
                                    style={{
                                        backgroundColor: 'var(--cream-dark)',
                                        color: 'var(--ink-light)',
                                        borderRight: '1px solid var(--cream-mid)',
                                    }}
                                >
                                    bio.me/@
                                </span>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="tunombre"
                                    required
                                    minLength={3}
                                    maxLength={20}
                                    pattern="[a-zA-Z0-9_]+"
                                    autoFocus
                                    className="rounded-none border-0 h-11 text-sm font-medium focus-visible:ring-1 focus-visible:ring-offset-0 flex-1"
                                    style={{
                                        backgroundColor: 'var(--cream-dark)',
                                        color: 'var(--ink)',
                                        // @ts-expect-error CSS custom property
                                        '--tw-ring-color': 'var(--gold)',
                                    }}
                                />
                            </div>
                            <p className="text-xs" style={{ color: 'var(--ink-light)', opacity: 0.7 }}>
                                3–20 caracteres. Solo letras, números y guiones bajos.
                            </p>
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                                Quiero...
                            </p>
                            <div className="grid grid-cols-2 gap-3">

                                {/* Creator */}
                                <label
                                    className="relative flex cursor-pointer rounded-xl p-4 transition-all"
                                    style={{ border: '2px solid var(--cream-mid)', backgroundColor: 'var(--cream-dark)' }}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value="creator"
                                        className="sr-only"
                                        defaultChecked
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                e.target.closest('label')!.style.borderColor = 'var(--ink)'
                                                e.target.closest('label')!.style.backgroundColor = 'var(--ink)'
                                            }
                                        }}
                                    />
                                    <span className="flex flex-col gap-0.5">
                                        <span
                                            className="text-sm font-bold"
                                            style={{ color: 'var(--ink)' }}
                                        >
                                            ✦ Escribir
                                        </span>
                                        <span
                                            className="text-xs"
                                            style={{ color: 'var(--ink-light)' }}
                                        >
                                            Publicar y ganar dinero
                                        </span>
                                    </span>
                                </label>

                                {/* Reader */}
                                <label
                                    className="relative flex cursor-pointer rounded-xl p-4 transition-all"
                                    style={{ border: '2px solid var(--cream-mid)', backgroundColor: 'var(--cream-dark)' }}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value="reader"
                                        className="sr-only"
                                    />
                                    <span className="flex flex-col gap-0.5">
                                        <span
                                            className="text-sm font-bold"
                                            style={{ color: 'var(--ink)' }}
                                        >
                                            ◉ Leer
                                        </span>
                                        <span
                                            className="text-xs"
                                            style={{ color: 'var(--ink-light)' }}
                                        >
                                            Seguir escritores
                                        </span>
                                    </span>
                                </label>

                            </div>
                        </div>

                        {/* Error */}
                        {state?.error && (
                            <div
                                className="text-sm p-3 rounded-xl"
                                style={{
                                    color: '#7A1A1A',
                                    backgroundColor: '#FDF0F0',
                                    border: '1px solid #E8CCCC',
                                }}
                            >
                                {state.error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={pending}
                            className="w-full h-11 font-bold text-sm tracking-wide transition-opacity hover:opacity-90"
                            style={{
                                backgroundColor: 'var(--ink)',
                                color: 'var(--cream)',
                                border: 'none',
                            }}
                        >
                            {pending ? 'Guardando...' : 'Empezar en bio.me →'}
                        </Button>
                    </form>
                </div>

                <p className="text-xs text-center" style={{ color: 'var(--ink-light)', opacity: 0.5 }}>
                    Al continuar aceptas nuestros términos de uso.
                </p>
            </div>
        </div>
    )
}

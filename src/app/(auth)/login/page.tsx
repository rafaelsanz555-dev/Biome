import { login } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { error, message } = await searchParams
    const emailSent = message === 'enviado'

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-4"
            style={{
                backgroundColor: 'var(--cream)',
                background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,168,76,0.13) 0%, var(--cream) 70%)',
            }}
        >
            <div className="w-full max-w-sm flex flex-col items-center space-y-8">

                {/* Logo */}
                <div className="text-center space-y-2">
                    <Link
                        href="/"
                        className="font-serif text-4xl font-bold tracking-tight hover:opacity-80 transition-opacity inline-block"
                        style={{ color: 'var(--ink)' }}
                    >
                        bio<span style={{ color: 'var(--gold)' }}>.me</span>
                    </Link>
                    <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
                        Tu historia. Tu ingreso.
                    </p>
                </div>

                {/* Card */}
                <div
                    className="w-full rounded-2xl p-7 shadow-sm"
                    style={{
                        backgroundColor: 'white',
                        border: '1px solid var(--cream-mid)',
                        boxShadow: '0 4px 24px rgba(20,16,10,0.07)',
                    }}
                >
                    {emailSent ? (
                        /* ── Success state ── */
                        <div className="text-center py-4">
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                                style={{ backgroundColor: 'var(--gold-bg)' }}
                            >
                                <span className="text-2xl">📬</span>
                            </div>
                            <h2
                                className="font-serif text-xl font-bold mb-2"
                                style={{ color: 'var(--ink)' }}
                            >
                                Revisa tu correo
                            </h2>
                            <p
                                className="text-sm leading-relaxed"
                                style={{ color: 'var(--ink-light)' }}
                            >
                                Te enviamos un enlace mágico. Úsalo para entrar — no necesitas contraseña.
                            </p>
                            <p
                                className="text-xs mt-4"
                                style={{ color: 'var(--ink-light)', opacity: 0.5 }}
                            >
                                ¿No llegó? Revisa el spam o{' '}
                                <Link href="/login" className="underline" style={{ color: 'var(--gold-dark)' }}>
                                    intenta de nuevo
                                </Link>
                            </p>
                        </div>
                    ) : (
                        /* ── Form state ── */
                        <>
                            <div className="mb-6 space-y-1.5">
                                <h1
                                    className="font-serif text-xl font-bold"
                                    style={{ color: 'var(--ink)' }}
                                >
                                    Inicia sesión en bio.me
                                </h1>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-light)' }}>
                                    Ingresa tu email — te enviamos un enlace mágico. Sin contraseña.
                                </p>
                            </div>

                            <form action={login} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="email"
                                        className="text-sm font-medium"
                                        style={{ color: 'var(--ink)' }}
                                    >
                                        Correo electrónico
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="tu@correo.com"
                                        required
                                        autoFocus
                                        className="h-11 text-sm placeholder:opacity-50 focus-visible:ring-1 focus-visible:ring-offset-0"
                                        style={{
                                            backgroundColor: 'var(--cream-dark)',
                                            borderColor: 'var(--cream-mid)',
                                            color: 'var(--ink)',
                                            // @ts-expect-error CSS custom property
                                            '--tw-ring-color': 'var(--gold)',
                                        }}
                                    />
                                </div>

                                {error && (
                                    <div
                                        className="text-sm p-3 rounded-xl"
                                        style={{
                                            color: '#7A1A1A',
                                            backgroundColor: '#FDF0F0',
                                            border: '1px solid #E8CCCC',
                                        }}
                                    >
                                        No se pudo enviar el enlace. Verifica tu email e intenta de nuevo.
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-11 font-semibold text-sm tracking-wide transition-opacity hover:opacity-90"
                                    style={{
                                        backgroundColor: 'var(--ink)',
                                        color: 'var(--cream)',
                                        border: 'none',
                                    }}
                                >
                                    Enviar enlace mágico →
                                </Button>
                            </form>

                            <p
                                className="text-center text-xs mt-5"
                                style={{ color: 'var(--ink-light)', opacity: 0.6 }}
                            >
                                Gratis para leer · $5/mes para publicar
                            </p>
                        </>
                    )}
                </div>

            </div>
        </div>
    )
}

import { login, signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

const ERROR_MESSAGES: Record<string, string> = {
    credenciales: 'Email o contraseña incorrectos.',
    campos: 'Completa todos los campos.',
    existe: 'Ya existe una cuenta con ese email. Inicia sesión.',
    registro: 'No se pudo crear la cuenta. Intenta de nuevo.',
    password_corto: 'La contraseña debe tener al menos 6 caracteres.',
}

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const isRegistro = params.mode === 'registro'
    const errorKey = params.error as string
    const errorMsg = errorKey ? ERROR_MESSAGES[errorKey] || 'Error inesperado. Intenta de nuevo.' : null

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
                    className="w-full rounded-2xl p-7"
                    style={{
                        backgroundColor: 'white',
                        border: '1px solid var(--cream-mid)',
                        boxShadow: '0 4px 24px rgba(20,16,10,0.07)',
                    }}
                >
                    <div className="mb-6 space-y-1.5">
                        <h1
                            className="font-serif text-xl font-bold"
                            style={{ color: 'var(--ink)' }}
                        >
                            {isRegistro ? 'Crea tu cuenta' : 'Inicia sesión'}
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
                            {isRegistro
                                ? 'Ingresa tu email y elige una contraseña.'
                                : 'Ingresa con tu email y contraseña.'}
                        </p>
                    </div>

                    <form action={isRegistro ? signup : login} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
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

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                                Contraseña
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder={isRegistro ? 'Mínimo 6 caracteres' : '••••••••'}
                                required
                                minLength={6}
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

                        {errorMsg && (
                            <div
                                className="text-sm p-3 rounded-xl"
                                style={{
                                    color: '#7A1A1A',
                                    backgroundColor: '#FDF0F0',
                                    border: '1px solid #E8CCCC',
                                }}
                            >
                                {errorMsg}
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
                            {isRegistro ? 'Crear cuenta →' : 'Entrar →'}
                        </Button>
                    </form>

                    <div className="text-center mt-5">
                        {isRegistro ? (
                            <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
                                ¿Ya tienes cuenta?{' '}
                                <Link href="/login" className="font-semibold underline" style={{ color: 'var(--gold-dark)' }}>
                                    Inicia sesión
                                </Link>
                            </p>
                        ) : (
                            <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
                                ¿No tienes cuenta?{' '}
                                <Link href="/login?mode=registro" className="font-semibold underline" style={{ color: 'var(--gold-dark)' }}>
                                    Regístrate
                                </Link>
                            </p>
                        )}
                    </div>

                    <p
                        className="text-center text-xs mt-4"
                        style={{ color: 'var(--ink-light)', opacity: 0.5 }}
                    >
                        Gratis para leer · $5/mes para publicar
                    </p>
                </div>
            </div>
        </div>
    )
}

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
                        Your story. Your income.
                    </p>
                </div>

                {/* Card */}
                <div
                    className="w-full rounded-2xl p-7 shadow-sm"
                    style={{
                        backgroundColor: 'var(--cream)',
                        border: '1px solid var(--cream-mid)',
                    }}
                >
                    {/* Card heading */}
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
                                className="text-sm font-medium p-3 rounded-lg"
                                style={{
                                    color: '#7A1A1A',
                                    backgroundColor: '#FDF0F0',
                                    border: '1px solid #E8CCCC',
                                }}
                            >
                                No se pudo autenticar el usuario. Por favor, inténtalo de nuevo.
                            </div>
                        )}

                        {message && (
                            <div
                                className="text-sm font-medium p-3 rounded-lg"
                                style={{
                                    color: '#2D5A27',
                                    backgroundColor: '#F0F7EE',
                                    border: '1px solid #C2DFB8',
                                }}
                            >
                                {message}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 font-semibold text-sm tracking-wide transition-opacity hover:opacity-90"
                            style={{
                                backgroundColor: 'var(--ink)',
                                color: 'var(--cream)',
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
                </div>

            </div>
        </div>
    )
}

import Link from 'next/link'
import { login, signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ERROR_MESSAGES: Record<string, string> = {
    credenciales: 'Email o contraseña incorrectos.',
    campos: 'Completa todos los campos.',
    existe: 'Ya existe una cuenta con ese email. Inicia sesión.',
    registro: 'No se pudo crear la cuenta. Intenta de nuevo.',
    password_corto: 'La contraseña debe tener al menos 6 caracteres.',
    password_mismatch: 'Las contraseñas no coinciden. Escríbelas de nuevo.',
}

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const isRegistro = params.mode === 'registro'
    const errorKey = params.error as string
    const debugMsg = params.debug as string
    const errorMsg = errorKey ? ERROR_MESSAGES[errorKey] || `Error: ${debugMsg || 'Intenta de nuevo.'}` : null

    return (
        <div className="min-h-screen bg-[#FAF7F0] text-[#0D0D0D]">
            <div className="grid min-h-screen md:grid-cols-[1fr_520px]">
                <section className="hidden border-r border-[#0D0D0D]/10 bg-[#0D0D0D] p-10 text-[#FAF7F0] md:flex md:flex-col md:justify-between">
                    <Link href="/" className="text-3xl font-black tracking-tight">
                        Pergamo<span className="text-[#C9A84C]">.</span>
                    </Link>
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#C9A84C]">Historias reales, capítulo a capítulo</p>
                        <h1 className="mt-4 max-w-xl font-serif text-6xl font-black leading-tight">
                            Cada vida es una serie que merece contarse.
                        </h1>
                        <p className="mt-5 max-w-lg text-sm leading-7 text-[#FAF7F0]/64">
                            Lee vidas reales publicadas como series, sigue a sus autores y — si tienes una historia — cuéntala capítulo a capítulo.
                        </p>
                    </div>
                    <p className="text-xs font-bold text-[#FAF7F0]/42">El primer capítulo de cada historia es gratis, siempre.</p>
                </section>

                <main className="flex items-center justify-center px-4 py-10">
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center md:hidden">
                            <Link href="/" className="text-4xl font-black tracking-tight">
                                Pergamo<span className="text-[#C9A84C]">.</span>
                            </Link>
                            <p className="mt-2 text-sm font-bold text-[#0D0D0D]/50">Historias reales, capítulo a capítulo.</p>
                        </div>

                        <div className="rounded-3xl border border-[#0D0D0D]/10 bg-white p-7 shadow-xl md:p-9">
                            <div className="mb-8 text-center">
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8A6A1C]">
                                    {isRegistro ? 'Crear cuenta' : 'Bienvenido'}
                                </p>
                                <h2 className="mt-3 font-serif text-3xl font-black text-[#0D0D0D]">
                                    {isRegistro ? 'Empieza tu historia' : 'Bienvenido de vuelta'}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-[#0D0D0D]/58">
                                    {isRegistro ? 'Crea tu acceso con email y contraseña.' : 'Ingresa con tu email y contraseña.'}
                                </p>
                            </div>

                            <form action={isRegistro ? signup : login} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-black text-[#0D0D0D]">
                                        Correo electrónico
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="tu@correo.com"
                                        required
                                        autoFocus
                                        className="h-12 rounded-xl border-[#0D0D0D]/12 bg-[#FAF7F0] text-[#0D0D0D] placeholder:text-[#0D0D0D]/35 focus-visible:ring-[#C9A84C]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-black text-[#0D0D0D]">
                                        Contraseña
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder={isRegistro ? 'Mínimo 6 caracteres' : '••••••••'}
                                        required
                                        minLength={6}
                                        className="h-12 rounded-xl border-[#0D0D0D]/12 bg-[#FAF7F0] text-[#0D0D0D] placeholder:text-[#0D0D0D]/35 focus-visible:ring-[#C9A84C]"
                                    />
                                </div>

                                {isRegistro && (
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm_password" className="text-sm font-black text-[#0D0D0D]">
                                            Confirmar contraseña
                                        </Label>
                                        <Input
                                            id="confirm_password"
                                            name="confirm_password"
                                            type="password"
                                            placeholder="Repite tu contraseña"
                                            required
                                            minLength={6}
                                            className="h-12 rounded-xl border-[#0D0D0D]/12 bg-[#FAF7F0] text-[#0D0D0D] placeholder:text-[#0D0D0D]/35 focus-visible:ring-[#C9A84C]"
                                        />
                                    </div>
                                )}

                                {errorMsg && (
                                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-bold text-red-700">
                                        {errorMsg}
                                    </div>
                                )}

                                <Button type="submit" className="h-12 w-full rounded-xl bg-[#0D0D0D] text-base font-black text-[#FAF7F0] hover:bg-[#2A2418]">
                                    {isRegistro ? 'Crear cuenta' : 'Entrar'}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                {isRegistro ? (
                                    <p className="text-sm text-[#0D0D0D]/55">
                                        ¿Ya tienes cuenta?{' '}
                                        <Link href="/login" className="font-black text-[#8A6A1C] hover:underline">
                                            Inicia sesión
                                        </Link>
                                    </p>
                                ) : (
                                    <p className="text-sm text-[#0D0D0D]/55">
                                        ¿No tienes cuenta?{' '}
                                        <Link href="/login?mode=registro" className="font-black text-[#8A6A1C] hover:underline">
                                            Regístrate
                                        </Link>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

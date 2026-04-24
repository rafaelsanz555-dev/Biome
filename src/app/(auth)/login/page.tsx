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
    const debugMsg = params.debug as string
    const errorMsg = errorKey ? ERROR_MESSAGES[errorKey] || `Error: ${debugMsg || 'Intenta de nuevo.'}` : null

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0A0B0E] text-white">
            <div className="w-full max-w-sm flex flex-col items-center space-y-8 relative z-10">

                {/* Logo */}
                <div className="text-center space-y-2">
                    <Link href="/" className="font-bold text-4xl tracking-tight hover:opacity-80 transition-opacity inline-block text-green-500">
                        b<span className="text-white">.</span>me
                    </Link>
                    <p className="text-gray-500 font-medium tracking-wide text-sm">
                        Tu historia. Tu ingreso.
                    </p>
                </div>

                {/* Card */}
                <div className="w-full rounded-2xl p-8 bg-[#15171C] border border-gray-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full pointer-events-none"></div>

                    <div className="mb-8 space-y-2 text-center relative z-10">
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            {isRegistro ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}
                        </h1>
                        <p className="text-sm text-gray-400">
                            {isRegistro
                                ? 'Ingresa tu email y elige una contraseña.'
                                : 'Ingresa con tu email y contraseña.'}
                        </p>
                    </div>

                    <form action={isRegistro ? signup : login} className="space-y-5 relative z-10">
                        <div className="space-y-2 text-left">
                            <Label htmlFor="email" className="text-sm font-bold text-gray-300">
                                Correo electrónico
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="tu@correo.com"
                                required
                                autoFocus
                                className="h-12 text-sm border-gray-700 bg-[#1A1C23] text-white placeholder:text-gray-600 focus-visible:ring-green-500"
                            />
                        </div>

                        <div className="space-y-2 text-left">
                            <Label htmlFor="password" className="text-sm font-bold text-gray-300">
                                Contraseña
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder={isRegistro ? 'Mínimo 6 caracteres' : '••••••••'}
                                required
                                minLength={6}
                                className="h-12 text-sm border-gray-700 bg-[#1A1C23] text-white placeholder:text-gray-600 focus-visible:ring-green-500"
                            />
                        </div>

                        {errorMsg && (
                            <div className="text-sm p-3 rounded-xl text-red-400 bg-red-500/10 border border-red-500/20">
                                {errorMsg}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 font-bold text-base transition-all bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)]"
                        >
                            {isRegistro ? 'Crear cuenta' : 'Entrar'}
                        </Button>
                    </form>

                    <div className="text-center mt-6 relative z-10">
                        {isRegistro ? (
                            <p className="text-sm text-gray-500">
                                ¿Ya tienes cuenta?{' '}
                                <Link href="/login" className="font-bold text-green-500 hover:text-green-400 hover:underline">
                                    Inicia sesión
                                </Link>
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500">
                                ¿No tienes cuenta?{' '}
                                <Link href="/login?mode=registro" className="font-bold text-green-500 hover:text-green-400 hover:underline">
                                    Regístrate gratis
                                </Link>
                            </p>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-gray-600 font-medium">
                    Gratis para leer · $5/mes para publicar
                </p>
            </div>
        </div>
    )
}

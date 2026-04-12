import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/auth/actions'

export async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    if (user) {
        const { data } = await supabase.from('profiles').select('role, username, avatar_url').eq('id', user.id).single()
        profile = data
    }

    return (
        <header
            className="sticky top-0 z-50"
            style={{
                backgroundColor: 'var(--cream)',
                borderBottom: '1px solid var(--cream-mid)',
                backdropFilter: 'blur(8px)',
            }}
        >
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-0 group">
                    <span
                        className="font-serif text-2xl font-bold tracking-tight transition-opacity group-hover:opacity-75"
                        style={{ color: 'var(--ink)' }}
                    >
                        bio
                    </span>
                    <span
                        className="font-serif text-2xl font-bold transition-opacity group-hover:opacity-75"
                        style={{ color: 'var(--gold)' }}
                    >
                        .me
                    </span>
                </Link>

                {/* Nav links */}
                <nav className="hidden md:flex items-center gap-1">
                    <Link
                        href="/discover"
                        className="nav-link text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        Descubrir
                    </Link>
                    <Link
                        href="/login"
                        className="nav-link text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        Para escritores
                    </Link>
                </nav>

                {/* Auth Actions */}
                {user ? (
                    <div className="flex items-center gap-3">
                        {profile?.role === 'creator' ? (
                            <Link href="/dashboard">
                                <Button
                                    size="sm"
                                    className="font-semibold px-5 h-9 rounded-lg transition-all"
                                    style={{
                                        backgroundColor: 'var(--ink)',
                                        color: 'var(--cream)',
                                        border: 'none',
                                    }}
                                >
                                    Dashboard
                                </Button>
                            </Link>
                        ) : profile?.username ? (
                            <Link href={`/${profile.username}`}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 rounded-lg"
                                    style={{
                                        borderColor: 'var(--cream-mid)',
                                        color: 'var(--ink)',
                                        backgroundColor: 'transparent',
                                    }}
                                >
                                    Mi perfil
                                </Button>
                            </Link>
                        ) : null}

                        <form action={logout}>
                            <Button
                                type="submit"
                                variant="ghost"
                                size="sm"
                                className="h-9 text-sm"
                                style={{ color: 'var(--ink-light)' }}
                            >
                                Cerrar sesión
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="text-sm font-medium transition-colors hidden sm:block"
                            style={{ color: 'var(--ink-light)' }}
                        >
                            Iniciar sesión
                        </Link>
                        <Link href="/login">
                            <Button
                                size="sm"
                                className="font-semibold px-6 h-9 rounded-lg transition-all hover:opacity-85"
                                style={{
                                    backgroundColor: 'var(--ink)',
                                    color: 'var(--cream)',
                                    border: 'none',
                                }}
                            >
                                Empieza a escribir
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    )
}

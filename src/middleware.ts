import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware de sesión Supabase (patrón oficial @supabase/ssr).
 *
 * Sin esto, cuando el access token expira (~1h) los Server Components no
 * pueden refrescar la cookie (no pueden escribir headers) y el usuario queda
 * "deslogueado" a mitad de sesión con errores aleatorios en toda la app.
 */
export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANTE: getUser() refresca el token si expiró. No quitar.
    await supabase.auth.getUser()

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Todo excepto assets estáticos e imágenes — el refresh solo importa
         * en páginas y API routes.
         */
        '/((?!_next/static|_next/image|favicon.ico|themes/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|ttf)$).*)',
    ],
}

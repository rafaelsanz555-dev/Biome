import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Check if user already has a profile
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, username')
                    .eq('id', user.id)
                    .maybeSingle()

                const base = process.env.NEXT_PUBLIC_APP_URL || origin

                // Existing user → send to their space
                if (profile) {
                    if (profile.role === 'creator') {
                        return NextResponse.redirect(`${base}/dashboard`)
                    } else {
                        return NextResponse.redirect(`${base}/discover`)
                    }
                }

                // New user → onboarding
                return NextResponse.redirect(`${base}/onboarding`)
            }
        }
    }

    // Auth failed → back to login with error
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || origin}/login?error=true`)
}

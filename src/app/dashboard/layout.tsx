import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/auth/actions'
import { DashboardNav } from '@/components/DashboardNav'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, username, full_name')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'creator') {
        redirect('/discover')
    }

    return (
        <div
            className="min-h-screen flex flex-col md:flex-row"
            style={{ backgroundColor: 'var(--cream-dark)' }}
        >
            {/* Sidebar */}
            <aside
                className="w-full md:w-64 flex flex-col h-auto md:h-screen sticky top-0 p-5"
                style={{
                    backgroundColor: 'var(--cream)',
                    borderRight: '1px solid var(--cream-mid)',
                }}
            >
                {/* Logo + Writer badge */}
                <div className="mb-8 flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="font-serif text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--ink)' }}
                    >
                        bio<span style={{ color: 'var(--gold)' }}>.me</span>
                    </Link>
                    <span
                        className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{
                            backgroundColor: 'var(--gold-bg)',
                            color: 'var(--gold-dark)',
                            border: '1px solid var(--gold-warm)',
                        }}
                    >
                        Writer
                    </span>
                </div>

                {/* Profile box */}
                {profile?.username && (
                    <div
                        className="mb-6 px-3 py-3 rounded-xl"
                        style={{
                            backgroundColor: 'var(--cream-dark)',
                            border: '1px solid var(--cream-mid)',
                        }}
                    >
                        <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--ink-light)' }}>
                            Signed in as
                        </p>
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--ink)' }}>
                            @{profile.username}
                        </p>
                    </div>
                )}

                {/* Nav */}
                <DashboardNav />

                {/* Footer links */}
                <div
                    className="pt-5 mt-auto space-y-1"
                    style={{ borderTop: '1px solid var(--cream-mid)' }}
                >
                    <Link
                        href={`/${profile?.username}`}
                        className="block text-sm font-medium px-3 py-2 rounded-md transition-colors"
                        style={{ color: 'var(--ink-light)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-light)')}
                    >
                        ← View my profile
                    </Link>
                    <form action={logout}>
                        <Button
                            type="submit"
                            variant="ghost"
                            className="w-full justify-start font-medium h-9 px-3 transition-colors hover:bg-transparent"
                            style={{ color: 'var(--ink-light)' }}
                        >
                            Sign out
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className="flex-1 p-6 md:p-10 overflow-y-auto"
                style={{ backgroundColor: 'var(--cream-dark)' }}
            >
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/auth/actions'
import { AdminNav } from '@/components/AdminNav'

export default async function AdminLayout({
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
        .maybeSingle()

    if (profile?.role !== 'admin') {
        redirect('/discover')
    }

    return (
        <div className="min-h-screen bg-[#0D0D0D] flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-[#111111] border-b md:border-b-0 md:border-r border-[#222] p-5 flex flex-col h-auto md:h-screen sticky top-0">
                {/* Logo */}
                <div className="mb-8 flex items-center gap-3">
                    <Link href="/admin" className="text-xl font-bold text-[#FAF7F0] tracking-tight">
                        bio<span className="text-[#C9A84C]">.me</span>
                    </Link>
                    <span className="text-[8px] font-bold text-[#C9A84C] uppercase tracking-[0.2em] bg-[#C9A84C]/10 px-2.5 py-1 rounded-full border border-[#C9A84C]/20">
                        Admin
                    </span>
                </div>

                {/* Admin user info */}
                <div className="mb-6 px-4 py-3 bg-[#0D0D0D] rounded-xl border border-[#222]">
                    <p className="text-[10px] text-[#666] font-medium uppercase tracking-wider mb-1">Administrador</p>
                    <p className="text-sm font-bold text-[#FAF7F0] truncate">{profile?.full_name || `@${profile?.username}`}</p>
                </div>

                <AdminNav />

                {/* Footer */}
                <div className="pt-5 border-t border-[#222] mt-auto space-y-2">
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-[#666] hover:text-[#C9A84C] transition-colors block px-4 py-2.5 rounded-xl hover:bg-[#1a1a1a]"
                    >
                        ← Writer Dashboard
                    </Link>
                    <Link
                        href="/"
                        className="text-sm font-medium text-[#666] hover:text-[#FAF7F0] transition-colors block px-4 py-2.5 rounded-xl hover:bg-[#1a1a1a]"
                    >
                        ← Ver sitio publico
                    </Link>
                    <form action={logout}>
                        <Button
                            type="submit"
                            variant="ghost"
                            className="w-full justify-start font-medium text-[#666] hover:text-[#FAF7F0] hover:bg-[#1a1a1a] h-10 px-4 rounded-xl"
                        >
                            Cerrar sesion
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

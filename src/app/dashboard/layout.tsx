import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { Bell, Feather, PenLine, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import { DashboardNav } from '@/components/DashboardNav'
import { UserMenu } from '@/components/UserMenu'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { DashboardThemeProvider, DashboardThemeToggle, type DashboardTheme } from '@/components/dashboard/DashboardTheme'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const tCommon = await getTranslations('common')
    const t = await getTranslations('dashboard')
    const cookieStore = await cookies()
    const initialTheme: DashboardTheme = cookieStore.get('PERGAMO_DASHBOARD_THEME')?.value === 'dark' ? 'dark' : 'light'

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, username, full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile) redirect('/onboarding')

    const isCreator = profile.role === 'creator'
    const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    const initial = (profile.full_name || profile.username || 'P').charAt(0).toUpperCase()

    return (
        <DashboardThemeProvider initialTheme={initialTheme}>
        <div className="dashboard-shell flex h-screen w-full overflow-hidden font-sans">
            <aside className="dashboard-sidebar hidden w-64 shrink-0 flex-col border-r md:flex" data-purpose="main-sidebar">
                <Link href="/dashboard" className="flex h-20 items-center gap-3 border-b border-[#171512]/10 px-6">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#A63D2D] text-white">
                        <Feather size={17} />
                    </span>
                    <span className="font-serif text-2xl font-black">Pergamo</span>
                </Link>

                <Link href={`/${profile.username}`} className="mx-3 mt-5 flex items-center gap-3 border border-[#171512]/10 bg-white/45 p-3 transition hover:border-[#A63D2D]/35">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover" />
                    ) : (
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#274C43] text-sm font-black text-white">{initial}</span>
                    )}
                    <span className="min-w-0">
                        <strong className="block truncate text-sm">{profile.full_name || profile.username}</strong>
                        <span className="block truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[#8A8174]">
                            {isCreator ? t('creator_workspace') : t('reader_library')}
                        </span>
                    </span>
                </Link>

                <div className="flex-1 overflow-y-auto pb-4">
                    <DashboardNav isCreator={isCreator} username={profile.username} />
                </div>

                <div className="border-t border-[#171512]/10 p-4">
                    <form action={logout}>
                        <button type="submit" className="w-full px-3 py-2 text-left text-xs font-bold text-[#746A5C] transition hover:bg-[#A63D2D]/6 hover:text-[#A63D2D]">
                            {tCommon('logout')}
                        </button>
                    </form>
                </div>
            </aside>

            <main className="relative flex min-w-0 flex-1 flex-col pt-14 md:pt-0">
                <header className="dashboard-header fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b px-4 backdrop-blur md:static md:h-20 md:px-7">
                    <Link href="/dashboard" className="flex items-center gap-2 font-serif text-xl font-black md:hidden">
                        <Feather size={17} className="text-[#A63D2D]" /> Pergamo
                    </Link>
                    <Link href="/discover" className="hidden h-11 min-w-0 max-w-xl flex-1 items-center gap-3 border border-[#171512]/12 bg-white/55 px-4 text-sm text-[#8A8174] transition hover:border-[#A63D2D]/30 md:flex">
                        <Search size={16} /> {t('search_editorial')}
                    </Link>
                    <div className="flex items-center gap-1 sm:gap-3 md:ml-5">
                        <Link href="/dashboard/notifications" className="dashboard-icon-button relative flex h-9 w-9 items-center justify-center rounded-full transition" aria-label={t('notifications')}>
                            <Bell size={19} />
                            {(unreadCount || 0) > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#A63D2D] px-1 text-[9px] font-black text-white">{Math.min(unreadCount || 0, 9)}</span>}
                        </Link>
                        {isCreator && (
                            <Link href="/dashboard/episodes/new" className="dashboard-publish-button hidden h-9 items-center gap-2 rounded-full px-4 text-xs font-black transition sm:inline-flex">
                                <PenLine size={14} /> <span>{t('publish')}</span>
                            </Link>
                        )}
                        <DashboardThemeToggle />
                        <LanguageSwitcher compact />
                        <UserMenu email={user.email || ''} username={profile.username || ''} role={profile.role} avatarUrl={profile.avatar_url} />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>

                <div className="dashboard-mobile-nav border-t px-4 py-2 md:hidden">
                    <DashboardNav isCreator={isCreator} username={profile.username} compact />
                </div>
            </main>
        </div>
        </DashboardThemeProvider>
    )
}

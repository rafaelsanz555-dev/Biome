import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import { DashboardNav } from '@/components/DashboardNav'
import { RightRail } from '@/components/RightRail'
import { UserMenu } from '@/components/UserMenu'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Bell, Edit3, Play } from 'lucide-react'
import { SearchBox } from '@/components/SearchBox'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const tDash = await getTranslations('dashboard')
    const tCommon = await getTranslations('common')

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, username, full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile) redirect('/onboarding')
    const isCreator = profile.role === 'creator'

    // Badge real de notificaciones sin leer (antes estaba hardcodeado en "1")
    const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    const initial = (profile.full_name || profile.username || 'W').charAt(0).toUpperCase()

    return (
        <div className="h-screen w-full flex overflow-hidden bg-[#0A0A0A] text-gray-100 font-sans">
            
            {/* ── Left Sidebar (Expanded) ── */}
            <aside className="w-64 flex-shrink-0 bg-[#121212] border-r border-[#262626] flex flex-col hidden md:flex" data-purpose="main-sidebar">
                
                {/* Brand Logo */}
                <div className="p-6 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[#C9A84C] rounded-full flex items-center justify-center">
                        <Play size={12} fill="currentColor" className="text-white ml-0.5" />
                    </div>
                    <Link href="/dashboard" className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition">
                        Pergamo
                    </Link>
                </div>

                {/* User Profile Summary — clickable, navigates to public profile */}
                <Link
                    href={`/${profile.username}`}
                    className="px-6 py-4 mb-2 flex items-center space-x-3 group hover:bg-white/5 transition rounded-lg mx-2"
                    title="Ver mi perfil público"
                >
                    <div className="relative">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-gray-700 group-hover:border-[#C9A84C] transition-colors" />
                        ) : (
                            <div className="w-12 h-12 rounded-full border border-gray-700 bg-gray-800 flex items-center justify-center font-bold text-gray-300 group-hover:border-[#C9A84C] transition-colors">
                                {initial}
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#C9A84C] border-2 border-[#121212] rounded-full"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-white capitalize truncate group-hover:text-[#C9A84C] transition">{profile.username}</h3>
                        <p className="text-[10px] text-gray-500 truncate">{isCreator ? '→ ' + tCommon('profile') : tDash('reader_role')}</p>
                    </div>
                </Link>

                {/* Main Navigation */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <DashboardNav isCreator={isCreator} username={profile?.username} />
                </div>

                {/* Earnings — link real a Monetización (el botón "Retirar" se ocultó
                    hasta que Stripe Connect esté implementado; antes no hacía nada) */}
                {isCreator && <div className="p-6 border-t border-[#262626]">
                    <Link
                        href="/dashboard/billing"
                        className="block bg-gray-800/30 p-4 rounded-xl border border-white/5 hover:border-[#C9A84C]/30 transition group"
                    >
                        <div className="flex items-center gap-2">
                            <div className="bg-yellow-500/20 p-1.5 rounded-md">
                                <span className="text-yellow-500 text-sm font-bold">$</span>
                            </div>
                            <span className="text-sm font-medium text-white group-hover:text-[#C9A84C] transition">{tDash('nav_monetization')}</span>
                        </div>
                        <p className="mt-2 text-[11px] leading-4 text-gray-500">
                            {tDash('wallet_payouts_soon')}
                        </p>
                    </Link>
                </div>}

                {/* Logout — siempre visible */}
                <div className="px-4 pb-4">
                    <form action={logout}>
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            {tCommon('logout')}
                        </button>
                    </form>
                </div>
            </aside>

            {/* Mobile Nav Top */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-[#121212] border-b border-[#262626] backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#C9A84C] rounded-full flex items-center justify-center">
                        <Play size={8} fill="currentColor" className="text-white ml-0.5" />
                    </div>
                    <Link href="/dashboard" className="font-bold text-lg text-white tracking-tight">
                        Pergamo
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/notifications" className="relative text-gray-400">
                        <Bell size={20} />
                    </Link>
                    {isCreator && <Link href="/dashboard/episodes/new" className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#C9A84C] text-[#0D0D0D]">
                        {tCommon('publish')}
                    </Link>}
                    <UserMenu
                        email={user.email || ''}
                        username={profile.username || ''}
                        role={profile.role}
                        avatarUrl={profile.avatar_url}
                    />
                </div>
            </div>

            {/* ── Main Content Area ── */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A] relative pt-14 md:pt-0 h-full">
                {/* Top Header / Search (Desktop Only) */}
                <header className="hidden md:flex h-16 flex-shrink-0 border-b border-[#262626] px-8 items-center justify-between sticky top-0 bg-[#0A0A0A]/95 backdrop-blur-md z-30">
                    <SearchBox placeholder={tDash('topbar_search')} variant="dark" />
                    <div className="flex items-center space-x-6 pl-4">
                        <Link href="/dashboard/notifications" className="relative text-gray-400 hover:text-white transition group">
                            <Bell size={20} className="group-hover:text-[#C9A84C] transition" />
                            {(unreadCount || 0) > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold border-2 border-[#0A0A0A]">
                                    {Math.min(unreadCount || 0, 9)}
                                </span>
                            )}
                        </Link>
                        {isCreator ? (
                            <Link href="/dashboard/episodes/new" className="bg-[#C9A84C] text-[#0D0D0D] px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-black hover:bg-[#E2C96E] transition">
                                <Edit3 size={16} />
                                <span>{tCommon('publish')}</span>
                            </Link>
                        ) : (
                            <Link href="/discover" className="bg-[#C9A84C] text-[#0D0D0D] px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-black hover:bg-[#E2C96E] transition">
                                <Edit3 size={16} />
                                <span>{tCommon('explore')}</span>
                            </Link>
                        )}
                        <LanguageSwitcher compact />
                        <UserMenu
                            email={user.email || ''}
                            username={profile.username || ''}
                            role={profile.role}
                            avatarUrl={profile.avatar_url}
                        />
                    </div>
                </header>

                {/* Sub-pages Content Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </main>

            {/* ── Right Rail (RightSidebar en Reader mode, StudioPanel en Studio mode) ── */}
            <RightRail username={profile.username} />
            
        </div>
    )
}

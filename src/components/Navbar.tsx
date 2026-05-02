import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/UserMenu'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const tCommon = await getTranslations('common')
    const tLanding = await getTranslations('landing')
    const tOnboarding = await getTranslations('onboarding')

    let profile = null
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('role, username, avatar_url, full_name')
            .eq('id', user.id)
            .maybeSingle()
        profile = data
    }

    return (
        <header className="border-b border-gray-800 bg-[#0A0B0E]/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

                <div className="flex items-center gap-8">
                    <Link href="/" className="font-bold text-2xl text-white hover:opacity-80 transition-opacity tracking-tight">
                        bio<span className="text-blue-500">.me</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-2">
                        <Link href="/discover" className="text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all">
                            {tCommon('discover')}
                        </Link>
                        <Link href="/dashboard" className="text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all">
                            {tCommon('feed')}
                        </Link>
                    </nav>
                </div>

                {user && profile?.username ? (
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="hidden sm:block">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-9">
                                {profile.role === 'creator' ? tCommon('dashboard') : tCommon('feed')}
                            </Button>
                        </Link>
                        <UserMenu
                            email={user.email || ''}
                            username={profile.username}
                            role={profile.role}
                            avatarUrl={profile.avatar_url}
                        />
                    </div>
                ) : user ? (
                    <div className="flex items-center gap-3">
                        <Link href="/onboarding">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-9">
                                {tOnboarding('complete_profile')}
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher compact />
                        <Link href="/login" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors hidden sm:block">
                            {tCommon('login')}
                        </Link>
                        <Link href="/login?mode=registro">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 h-9">
                                {tCommon('signup')}
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    )
}

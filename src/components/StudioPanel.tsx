'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
    Wand2, BookOpen, BarChart3, Users, TrendingUp, FolderOpen, FileText, Settings, Bell,
    PenLine, Eye, Sparkles, ArrowRight,
} from 'lucide-react'

/**
 * StudioPanel — el lado derecho cuando el creator está en modo creación/gestión.
 * Reemplaza al RightSidebar (que es para modo lector/feed).
 *
 * Casiani lo describió así: "del lado del creador que vea su parte como si fuese
 * studio: write, edit, publish, analytics, monetization. Pero no top gifted ni eso."
 */

interface ContextConfig {
    titleKey: string
    descKey: string
    icon: any
    color: string
    shortcuts?: { labelKey: string; href: string; icon: any }[]
}

function getContextForPath(pathname: string): ContextConfig {
    if (pathname.startsWith('/dashboard/episodes/new')) {
        return {
            titleKey: 'publishing_title', descKey: 'publishing_desc', icon: PenLine, color: 'blue',
            shortcuts: [
                { labelKey: 'shortcut_preview', href: '#preview', icon: Eye },
                { labelKey: 'shortcut_my_stories', href: '/dashboard/episodes', icon: BookOpen },
                { labelKey: 'shortcut_drafts', href: '/dashboard/drafts', icon: FileText },
            ],
        }
    }
    if (pathname.includes('/dashboard/episodes/') && pathname.includes('/edit')) {
        return {
            titleKey: 'editing_title', descKey: 'editing_desc', icon: PenLine, color: 'blue',
            shortcuts: [
                { labelKey: 'shortcut_my_stories', href: '/dashboard/episodes', icon: BookOpen },
                { labelKey: 'shortcut_episode_analytics', href: '/dashboard/analytics', icon: BarChart3 },
            ],
        }
    }
    if (pathname.startsWith('/dashboard/episodes')) {
        return {
            titleKey: 'stories_title', descKey: 'stories_desc', icon: BookOpen, color: 'blue',
            shortcuts: [
                { labelKey: 'shortcut_new_episode', href: '/dashboard/episodes/new', icon: PenLine },
                { labelKey: 'shortcut_drafts', href: '/dashboard/drafts', icon: FileText },
                { labelKey: 'shortcut_seasons', href: '/dashboard/seasons', icon: FolderOpen },
            ],
        }
    }
    if (pathname.startsWith('/dashboard/analytics')) {
        return {
            titleKey: 'analytics_title', descKey: 'analytics_desc', icon: BarChart3, color: 'violet',
            shortcuts: [
                { labelKey: 'shortcut_my_stories', href: '/dashboard/episodes', icon: BookOpen },
                { labelKey: 'shortcut_audience', href: '/dashboard/audience', icon: Users },
            ],
        }
    }
    if (pathname.startsWith('/dashboard/audience')) {
        return {
            titleKey: 'audience_title', descKey: 'audience_desc', icon: Users, color: 'emerald',
            shortcuts: [
                { labelKey: 'shortcut_analytics', href: '/dashboard/analytics', icon: BarChart3 },
                { labelKey: 'shortcut_monetization', href: '/dashboard/billing', icon: TrendingUp },
            ],
        }
    }
    if (pathname.startsWith('/dashboard/billing')) {
        return {
            titleKey: 'monetization_title', descKey: 'monetization_desc', icon: TrendingUp, color: 'amber',
            shortcuts: [
                { labelKey: 'shortcut_audience', href: '/dashboard/audience', icon: Users },
                { labelKey: 'shortcut_my_stories', href: '/dashboard/episodes', icon: BookOpen },
            ],
        }
    }
    if (pathname.startsWith('/dashboard/seasons')) {
        return {
            titleKey: 'seasons_title', descKey: 'seasons_desc', icon: FolderOpen, color: 'rose',
            shortcuts: [
                { labelKey: 'shortcut_my_stories', href: '/dashboard/episodes', icon: BookOpen },
                { labelKey: 'shortcut_new_episode', href: '/dashboard/episodes/new', icon: PenLine },
            ],
        }
    }
    if (pathname.startsWith('/dashboard/drafts')) {
        return {
            titleKey: 'drafts_title', descKey: 'drafts_desc', icon: FileText, color: 'slate',
            shortcuts: [
                { labelKey: 'shortcut_new_episode', href: '/dashboard/episodes/new', icon: PenLine },
                { labelKey: 'shortcut_my_stories', href: '/dashboard/episodes', icon: BookOpen },
            ],
        }
    }
    if (pathname.startsWith('/dashboard/settings')) {
        return {
            titleKey: 'settings_title', descKey: 'settings_desc', icon: Settings, color: 'blue',
            shortcuts: [
                { labelKey: 'shortcut_my_public_profile', href: '#', icon: Eye },
                { labelKey: 'shortcut_my_stories', href: '/dashboard/episodes', icon: BookOpen },
            ],
        }
    }
    if (pathname.startsWith('/dashboard/notifications')) {
        return {
            titleKey: 'notifications_title', descKey: 'notifications_desc', icon: Bell, color: 'blue',
            shortcuts: [],
        }
    }
    // Fallback genérico
    return {
        titleKey: 'default_title', descKey: 'default_desc', icon: Wand2, color: 'blue',
        shortcuts: [],
    }
}

interface StudioPanelProps {
    username?: string | null
}

export function StudioPanel({ username }: StudioPanelProps = {}) {
    const pathname = usePathname()
    const ctx = getContextForPath(pathname)
    const Icon = ctx.icon
    const t = useTranslations('studio')
    const tDash = useTranslations('dashboard')

    return (
        <aside className="w-80 bg-[#0F1114] border-l border-[#262626] overflow-y-auto p-6 space-y-6 hidden lg:block">
            {/* Header sutil "Modo Estudio" */}
            <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                <Sparkles size={12} className="text-blue-400" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">{t('mode_label')}</span>
            </div>

            {/* Contexto actual */}
            <div className="space-y-3">
                <div className={`w-12 h-12 rounded-2xl bg-${ctx.color}-500/10 border border-${ctx.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`text-${ctx.color}-400`} size={20} />
                </div>
                <div>
                    <p className={`text-[10px] uppercase tracking-[0.2em] font-bold text-${ctx.color}-400 mb-1`}>{t('where')}</p>
                    <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>{t(ctx.titleKey)}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mt-1.5">{t(ctx.descKey)}</p>
                </div>
            </div>

            {/* Atajos contextuales */}
            {ctx.shortcuts && ctx.shortcuts.length > 0 && (
                <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-3">{t('shortcuts')}</p>
                    <div className="space-y-1">
                        {ctx.shortcuts.map((s) => {
                            const SIcon = s.icon
                            const label = t(s.labelKey)
                            // Resolver "Mi perfil público" al username real cuando lo tenemos
                            const realHref = s.labelKey === 'shortcut_my_public_profile' && username
                                ? `/${username}`
                                : s.href
                            // Si quedó como '#' (sin username disponible), no renderizamos el link
                            if (realHref === '#') return null
                            const isExternal = realHref.startsWith('/') && !realHref.startsWith('/dashboard')
                            return (
                                <Link
                                    key={s.labelKey + realHref}
                                    href={realHref}
                                    target={isExternal ? '_blank' : undefined}
                                    rel={isExternal ? 'noopener' : undefined}
                                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-white/5 transition group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <SIcon size={14} className="text-gray-500 group-hover:text-blue-400 transition" />
                                        <span className="text-xs text-gray-300 group-hover:text-white transition">{label}</span>
                                    </div>
                                    <ArrowRight size={11} className="text-gray-700 group-hover:text-blue-400 transition" />
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Mensaje sobrio */}
            <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-gray-600 italic leading-relaxed">
                    {t.rich('feed_returns', {
                        home: (chunks) => <Link href="/dashboard" className="text-blue-400 hover:underline">{chunks}</Link>,
                        discovery: (chunks) => <Link href="/dashboard/discovery" className="text-blue-400 hover:underline">{chunks}</Link>,
                    })}
                </p>
            </div>
        </aside>
    )
}

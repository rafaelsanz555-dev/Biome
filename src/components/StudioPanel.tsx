'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
    label: string
    icon: any
    color: string
    description: string
    shortcuts?: { label: string; href: string; icon: any }[]
}

function getContextForPath(pathname: string): ContextConfig {
    if (pathname.startsWith('/dashboard/episodes/new')) {
        return {
            label: 'Publicación',
            icon: PenLine,
            color: 'blue',
            description: 'Estás creando un episodio nuevo. La concentración importa más que el feed.',
            shortcuts: [
                { label: 'Vista previa', href: '#preview', icon: Eye },
                { label: 'Mis historias', href: '/dashboard/episodes', icon: BookOpen },
                { label: 'Borradores', href: '/dashboard/drafts', icon: FileText },
            ],
        }
    }
    if (pathname.includes('/dashboard/episodes/') && pathname.includes('/edit')) {
        return {
            label: 'Edición',
            icon: PenLine,
            color: 'blue',
            description: 'Estás afinando un episodio existente. Cambios visibles para tus lectores tras guardar.',
            shortcuts: [
                { label: 'Mis historias', href: '/dashboard/episodes', icon: BookOpen },
                { label: 'Analítica de este episodio', href: '/dashboard/analytics', icon: BarChart3 },
            ],
        }
    }
    if (pathname.startsWith('/dashboard/episodes')) {
        return {
            label: 'Mis historias',
            icon: BookOpen,
            color: 'blue',
            description: 'Tu archivo creativo. Episodios publicados y borradores en uno.',
            shortcuts: [
                { label: 'Nuevo episodio', href: '/dashboard/episodes/new', icon: PenLine },
                { label: 'Borradores', href: '/dashboard/drafts', icon: FileText },
                { label: 'Temporadas', href: '/dashboard/seasons', icon: FolderOpen },
            ],
        }
    }
    if (pathname.startsWith('/dashboard/analytics')) {
        return {
            label: 'Analítica',
            icon: BarChart3,
            color: 'violet',
            description: 'Cómo te leen, hasta dónde llegan, qué episodios funcionan mejor.',
            shortcuts: [
                { label: 'Mis historias', href: '/dashboard/episodes', icon: BookOpen },
                { label: 'Audiencia', href: '/dashboard/audience', icon: Users },
            ],
        }
    }
    if (pathname.startsWith('/dashboard/audience')) {
        return {
            label: 'Audiencia',
            icon: Users,
            color: 'emerald',
            description: 'Quiénes te siguen, suscriben y apoyan tu trabajo.',
            shortcuts: [
                { label: 'Analítica', href: '/dashboard/analytics', icon: BarChart3 },
                { label: 'Monetización', href: '/dashboard/billing', icon: TrendingUp },
            ],
        }
    }
    if (pathname.startsWith('/dashboard/billing')) {
        return {
            label: 'Monetización',
            icon: TrendingUp,
            color: 'amber',
            description: 'Tus ingresos, suscripciones activas y payouts.',
            shortcuts: [
                { label: 'Audiencia', href: '/dashboard/audience', icon: Users },
                { label: 'Mis historias', href: '/dashboard/episodes', icon: BookOpen },
            ],
        }
    }
    if (pathname.startsWith('/dashboard/seasons')) {
        return {
            label: 'Temporadas',
            icon: FolderOpen,
            color: 'rose',
            description: 'Agrupa episodios en historias largas. Cada temporada es un arco.',
            shortcuts: [
                { label: 'Mis historias', href: '/dashboard/episodes', icon: BookOpen },
                { label: 'Nuevo episodio', href: '/dashboard/episodes/new', icon: PenLine },
            ],
        }
    }
    if (pathname.startsWith('/dashboard/drafts')) {
        return {
            label: 'Borradores',
            icon: FileText,
            color: 'slate',
            description: 'Tus historias en proceso. Volvé cuando estés listo para terminarlas.',
            shortcuts: [
                { label: 'Nuevo episodio', href: '/dashboard/episodes/new', icon: PenLine },
                { label: 'Mis historias', href: '/dashboard/episodes', icon: BookOpen },
            ],
        }
    }
    if (pathname.startsWith('/dashboard/settings')) {
        return {
            label: 'Tu estudio',
            icon: Settings,
            color: 'blue',
            description: 'Identidad, theme visual, marca y políticas de tu serie.',
            shortcuts: [
                { label: 'Mi perfil público', href: '#', icon: Eye },
                { label: 'Mis historias', href: '/dashboard/episodes', icon: BookOpen },
            ],
        }
    }
    if (pathname.startsWith('/dashboard/notifications')) {
        return {
            label: 'Notificaciones',
            icon: Bell,
            color: 'blue',
            description: 'Suscriptores nuevos, regalos recibidos y actividad reciente.',
            shortcuts: [],
        }
    }
    // Fallback genérico
    return {
        label: 'Modo Estudio',
        icon: Wand2,
        color: 'blue',
        description: 'Estás en modo creador. Sin distracciones del feed.',
        shortcuts: [],
    }
}

export function StudioPanel() {
    const pathname = usePathname()
    const ctx = getContextForPath(pathname)
    const Icon = ctx.icon

    return (
        <aside className="w-80 bg-[#0F1114] border-l border-[#262626] overflow-y-auto p-6 space-y-6 hidden lg:block">
            {/* Header sutil "Modo Estudio" */}
            <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                <Sparkles size={12} className="text-blue-400" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">Modo Estudio</span>
            </div>

            {/* Contexto actual */}
            <div className="space-y-3">
                <div className={`w-12 h-12 rounded-2xl bg-${ctx.color}-500/10 border border-${ctx.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`text-${ctx.color}-400`} size={20} />
                </div>
                <div>
                    <p className={`text-[10px] uppercase tracking-[0.2em] font-bold text-${ctx.color}-400 mb-1`}>Donde estás</p>
                    <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>{ctx.label}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mt-1.5">{ctx.description}</p>
                </div>
            </div>

            {/* Atajos contextuales */}
            {ctx.shortcuts && ctx.shortcuts.length > 0 && (
                <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-3">Atajos</p>
                    <div className="space-y-1">
                        {ctx.shortcuts.map((s) => {
                            const SIcon = s.icon
                            return (
                                <Link
                                    key={s.label + s.href}
                                    href={s.href}
                                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-white/5 transition group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <SIcon size={14} className="text-gray-500 group-hover:text-blue-400 transition" />
                                        <span className="text-xs text-gray-300 group-hover:text-white transition">{s.label}</span>
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
                    El feed regresa cuando salgas a <Link href="/dashboard" className="text-blue-400 hover:underline">Inicio</Link> o <Link href="/dashboard/discovery" className="text-blue-400 hover:underline">Discovery</Link>.
                </p>
            </div>
        </aside>
    )
}

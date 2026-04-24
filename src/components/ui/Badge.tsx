import { type ReactNode } from 'react'

type BadgeVariant = 'free' | 'exclusive' | 'top' | 'new' | 'verified' | 'premium' | 'neutral'

interface BadgeProps {
    variant?: BadgeVariant
    icon?: ReactNode
    children: ReactNode
    className?: string
}

const VARIANTS: Record<BadgeVariant, string> = {
    free: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    exclusive: 'bg-green-500/10 text-green-400 border-green-500/20',
    top: 'bg-red-500/10 text-red-400 border-red-500/20',
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    premium: 'bg-yellow-400/10 text-yellow-300 border-yellow-400/30',
    neutral: 'bg-white/5 text-gray-400 border-gray-800',
}

export function Badge({ variant = 'neutral', icon, children, className = '' }: BadgeProps) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${VARIANTS[variant]} ${className}`}>
            {icon}
            {children}
        </span>
    )
}

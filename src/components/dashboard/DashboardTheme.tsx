'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'

export type DashboardTheme = 'light' | 'dark'

const DashboardThemeContext = createContext<{
    theme: DashboardTheme
    toggleTheme: () => void
} | null>(null)

export function DashboardThemeProvider({
    initialTheme,
    children,
}: {
    initialTheme: DashboardTheme
    children: React.ReactNode
}) {
    const [theme, setTheme] = useState<DashboardTheme>(initialTheme)
    const value = useMemo(() => ({
        theme,
        toggleTheme: () => {
            setTheme((current) => {
                const next = current === 'dark' ? 'light' : 'dark'
                document.cookie = `PERGAMO_DASHBOARD_THEME=${next}; path=/; max-age=31536000; samesite=lax`
                return next
            })
        },
    }), [theme])

    return (
        <DashboardThemeContext.Provider value={value}>
            <div
                className={`dashboard-theme h-full ${theme === 'dark' ? 'dark' : ''}`}
                data-dashboard-theme={theme}
            >
                {children}
            </div>
        </DashboardThemeContext.Provider>
    )
}

export function DashboardThemeToggle() {
    const context = useContext(DashboardThemeContext)
    const t = useTranslations('dashboard')

    if (!context) return null

    const isDark = context.theme === 'dark'
    const label = isDark ? t('theme_switch_light') : t('theme_switch_dark')

    return (
        <button
            type="button"
            onClick={context.toggleTheme}
            className="dashboard-icon-button flex h-9 w-9 items-center justify-center rounded-full transition"
            aria-label={label}
            title={label}
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    )
}

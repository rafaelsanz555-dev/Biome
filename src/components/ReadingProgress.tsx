'use client'

import { useEffect, useState } from 'react'

export function ReadingProgress() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        function handleScroll() {
            const scrolled = window.scrollY
            const height = document.documentElement.scrollHeight - window.innerHeight
            const pct = height > 0 ? Math.min(100, (scrolled / height) * 100) : 0
            setProgress(pct)
        }
        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleScroll)
        }
    }, [])

    return (
        <div
            className="fixed top-0 left-0 right-0 h-[3px] bg-transparent z-[60] pointer-events-none"
        >
            <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-[width] duration-100 ease-out shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}

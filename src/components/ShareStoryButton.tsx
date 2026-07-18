'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ShareStoryButtonProps {
    title: string
    text: string
    className?: string
}

export function ShareStoryButton({ title, text, className }: ShareStoryButtonProps) {
    const t = useTranslations('story_page')
    const [copied, setCopied] = useState(false)

    async function share() {
        const url = window.location.href
        try {
            if (navigator.share) {
                await navigator.share({ title, text, url })
                return
            }
            await navigator.clipboard.writeText(url)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1600)
        } catch {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url)
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1600)
            }
        }
    }

    return (
        <button
            type="button"
            onClick={share}
            className={className || 'inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-black'}
        >
            <Share2 size={16} />
            {copied ? t('copied') : t('share')}
        </button>
    )
}

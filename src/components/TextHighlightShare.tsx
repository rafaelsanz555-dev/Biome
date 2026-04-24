'use client'

import { useEffect, useState } from 'react'

interface TextHighlightShareProps {
    creatorUsername: string
    episodeTitle: string
}

export function TextHighlightShare({ creatorUsername, episodeTitle }: TextHighlightShareProps) {
    const [popup, setPopup] = useState<{
        x: number
        y: number
        text: string
    } | null>(null)

    useEffect(() => {
        function onMouseUp() {
            const selection = window.getSelection()
            if (!selection || selection.isCollapsed) {
                setPopup(null)
                return
            }
            const text = selection.toString().trim()
            if (text.length < 8) {
                setPopup(null)
                return
            }

            // Only trigger for selections inside the reader container
            const range = selection.getRangeAt(0)
            const container = range.commonAncestorContainer.parentElement
            if (!container?.closest('[data-reader-content]')) {
                setPopup(null)
                return
            }

            const rect = range.getBoundingClientRect()
            setPopup({
                x: rect.left + rect.width / 2,
                y: rect.top + window.scrollY - 12,
                text,
            })
        }

        function onScroll() {
            setPopup(null)
        }

        document.addEventListener('mouseup', onMouseUp)
        document.addEventListener('selectionchange', () => {
            const selection = window.getSelection()
            if (!selection || selection.isCollapsed) setPopup(null)
        })
        window.addEventListener('scroll', onScroll, { passive: true })

        return () => {
            document.removeEventListener('mouseup', onMouseUp)
            window.removeEventListener('scroll', onScroll)
        }
    }, [])

    if (!popup) return null

    const url = typeof window !== 'undefined' ? window.location.href : ''
    const tweetText = `"${popup.text.length > 180 ? popup.text.slice(0, 180) + '…' : popup.text}"\n— @${creatorUsername} en bio.me`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(`${popup!.text}\n\n— ${episodeTitle} via ${url}`)
            setPopup(null)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div
            className="fixed z-[70] -translate-x-1/2 -translate-y-full pointer-events-auto"
            style={{ left: popup.x, top: popup.y }}
        >
            <div className="bg-[#15171C] border border-gray-700 rounded-xl shadow-2xl p-1.5 flex items-center gap-1 backdrop-blur-md">
                <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm font-semibold text-white"
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Compartir
                </a>
                <button
                    onClick={copyLink}
                    onMouseDown={(e) => e.preventDefault()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm font-semibold text-gray-300"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copiar
                </button>
            </div>
            <div className="w-2 h-2 bg-[#15171C] border-r border-b border-gray-700 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
        </div>
    )
}

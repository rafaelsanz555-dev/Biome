/**
 * ReaderRenderer — renderiza el JSON de TipTap a HTML en el lado del lector.
 *
 * Server Component. No monta TipTap — usa `generateHTML` de @tiptap/html (que corre
 * en el server con prosemirror-core). Más ligero que montar el editor completo.
 *
 * Si el episodio no tiene `content_json` (legacy), el caller debe usar el fallback
 * plain-text con whitespace-pre-wrap.
 */

import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { PullQuote } from './PullQuote'

interface ReaderRendererProps {
    content: any
}

export function ReaderRenderer({ content }: ReaderRendererProps) {
    if (!content) return null

    let html = ''
    try {
        html = generateHTML(content, [
            StarterKit.configure({ heading: { levels: [2, 3] }, codeBlock: false, code: false }),
            Image.configure({ inline: false, HTMLAttributes: { class: 'bio-reader-img' } }),
            Link.configure({ openOnClick: true, HTMLAttributes: { class: 'bio-reader-link', rel: 'noopener noreferrer', target: '_blank' } }),
            PullQuote,
        ])
    } catch (e) {
        console.error('[ReaderRenderer] generateHTML failed:', e)
        return null
    }

    return (
        <div
            className="bio-reader-content selection:bg-green-500/40 selection:text-white"
            data-reader-content
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}

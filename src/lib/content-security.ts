const ALLOWED_NODE_TYPES = new Set([
    'doc',
    'paragraph',
    'text',
    'hardBreak',
    'heading',
    'bulletList',
    'orderedList',
    'listItem',
    'blockquote',
    'horizontalRule',
    'image',
    'pullQuote',
])

const ALLOWED_MARK_TYPES = new Set(['bold', 'italic', 'link'])

const IMAGE_HOST_ALLOWLIST = [
    'images.unsplash.com',
    'owmympqvgeekogqzumzl.supabase.co',
]

function isSafeHttpUrl(value: unknown, options: { imagesOnly?: boolean } = {}) {
    if (typeof value !== 'string') return false
    try {
        const url = new URL(value)
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return false
        if (options.imagesOnly) {
            const host = url.hostname.toLowerCase()
            return IMAGE_HOST_ALLOWLIST.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))
        }
        return true
    } catch {
        return false
    }
}

function sanitizeMarks(marks: unknown) {
    if (!Array.isArray(marks)) return undefined

    const clean = marks
        .map((mark) => {
            if (!mark || typeof mark !== 'object') return null
            const src = mark as { type?: unknown; attrs?: Record<string, unknown> }
            if (typeof src.type !== 'string' || !ALLOWED_MARK_TYPES.has(src.type)) return null

            if (src.type === 'link') {
                const href = src.attrs?.href
                if (!isSafeHttpUrl(href)) return null
                return {
                    type: 'link',
                    attrs: {
                        href,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                    },
                }
            }

            return { type: src.type }
        })
        .filter(Boolean)

    return clean.length > 0 ? clean : undefined
}

export function sanitizeTipTapContent(input: unknown): unknown | null {
    if (!input || typeof input !== 'object') return null

    function visit(node: unknown): Record<string, unknown> | null {
        if (!node || typeof node !== 'object') return null
        const src = node as {
            type?: unknown
            text?: unknown
            attrs?: Record<string, unknown>
            marks?: unknown
            content?: unknown
        }

        if (typeof src.type !== 'string' || !ALLOWED_NODE_TYPES.has(src.type)) return null

        const out: Record<string, unknown> = { type: src.type }

        if (src.type === 'text') {
            if (typeof src.text !== 'string') return null
            out.text = src.text.slice(0, 20000)
            const marks = sanitizeMarks(src.marks)
            if (marks) out.marks = marks
            return out
        }

        if (src.type === 'heading') {
            const level = Number(src.attrs?.level)
            out.attrs = { level: level === 3 ? 3 : 2 }
        }

        if (src.type === 'image') {
            const srcUrl = src.attrs?.src
            if (!isSafeHttpUrl(srcUrl, { imagesOnly: true })) return null
            out.attrs = {
                src: srcUrl,
                alt: typeof src.attrs?.alt === 'string' ? src.attrs.alt.slice(0, 140) : null,
                title: typeof src.attrs?.title === 'string' ? src.attrs.title.slice(0, 140) : null,
            }
        }

        if (Array.isArray(src.content)) {
            const content = src.content.map(visit).filter(Boolean)
            if (content.length > 0) out.content = content
        }

        return out
    }

    const clean = visit(input)
    if (!clean || clean.type !== 'doc') return null
    return clean
}

export function isSafeUserUrl(value: string | null | undefined) {
    if (!value) return false
    return isSafeHttpUrl(value)
}

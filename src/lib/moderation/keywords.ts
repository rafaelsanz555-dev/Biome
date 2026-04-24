/**
 * Keyword-based moderation fallback (used when OpenAI Moderation API is unavailable).
 * These are RED-FLAG terms that trigger a content_flag — NOT automatic blocks.
 * Flags are reviewed manually via /admin/moderation.
 */

export const MODERATION_KEYWORDS = {
    self_harm: [
        'suicidarme', 'quitarme la vida', 'matarme',
        'kill myself', 'end my life', 'commit suicide',
        'cortarme', 'cutting myself',
    ],
    hate: [
        'odio a los', 'exterminar', 'raza inferior',
        'kill all', 'exterminate', 'inferior race',
    ],
    explicit_copyright: [
        'copia textual de', 'copiado de wikipedia',
        'copied from', 'plagiarized from',
    ],
} as const

export type ModerationCategory = keyof typeof MODERATION_KEYWORDS

export interface KeywordMatch {
    category: ModerationCategory
    keyword: string
    context: string
}

export function scanKeywords(text: string): KeywordMatch[] {
    const lower = text.toLowerCase()
    const matches: KeywordMatch[] = []
    for (const [cat, words] of Object.entries(MODERATION_KEYWORDS)) {
        for (const w of words) {
            const idx = lower.indexOf(w)
            if (idx >= 0) {
                matches.push({
                    category: cat as ModerationCategory,
                    keyword: w,
                    context: text.slice(Math.max(0, idx - 40), idx + w.length + 40),
                })
            }
        }
    }
    return matches
}

/**
 * OpenAI Moderation API wrapper.
 * Free endpoint, rate-limited. Returns null on missing API key or error (graceful degrade).
 */

export interface ModerationResult {
    flagged: boolean
    categories: Record<string, boolean>
    category_scores: Record<string, number>
    topCategory: string | null
    topScore: number
}

export async function moderateText(text: string): Promise<ModerationResult | null> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return null

    // Trim to 32k chars for moderation endpoint safety
    const input = text.slice(0, 32000)

    try {
        const res = await fetch('https://api.openai.com/v1/moderations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ input, model: 'omni-moderation-latest' }),
        })
        if (!res.ok) return null
        const data = await res.json()
        const r = data?.results?.[0]
        if (!r) return null

        // Find top category
        let topCategory: string | null = null
        let topScore = 0
        for (const [cat, score] of Object.entries(r.category_scores as Record<string, number>)) {
            if (score > topScore) {
                topScore = score
                topCategory = cat
            }
        }

        return {
            flagged: !!r.flagged,
            categories: r.categories,
            category_scores: r.category_scores,
            topCategory,
            topScore,
        }
    } catch {
        return null
    }
}

/**
 * Maps OpenAI moderation category to bio.me flag_type enum.
 */
export function categoryToFlagType(cat: string | null): 'explicit' | 'hate' | 'self_harm' | 'similarity' {
    if (!cat) return 'explicit'
    if (cat.startsWith('hate')) return 'hate'
    if (cat.startsWith('self-harm') || cat.startsWith('self_harm')) return 'self_harm'
    return 'explicit'
}

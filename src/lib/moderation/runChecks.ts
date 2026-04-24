'use server'

import { createClient } from '@/lib/supabase/server'
import { persistShingles, findSimilar } from '@/lib/similarity'
import { moderateText, categoryToFlagType } from './openai'
import { scanKeywords } from './keywords'

/**
 * Run all moderation checks against a freshly-published episode.
 * Non-blocking: creates content_flags but NEVER blocks publication.
 * Call from server action after insert succeeds.
 */
export async function runEpisodeChecks(episodeId: string, fullText: string) {
    const supabase = await createClient()

    // 1) Shingles + similarity
    try {
        await persistShingles(episodeId, fullText)
        const similar = await findSimilar(episodeId, 0.4)
        for (const m of similar) {
            await supabase.from('content_flags').insert({
                episode_id: episodeId,
                flag_type: 'similarity',
                confidence: m.jaccard,
                evidence: { matched_episode_id: m.matchedEpisodeId, similarity_score: m.jaccard, shared_shingles: m.matches },
                auto_flagged: true,
            })
        }
    } catch (e) {
        // swallow — never block publish
        console.error('[moderation] similarity failed', e)
    }

    // 2) OpenAI Moderation
    try {
        const mod = await moderateText(fullText)
        if (mod && mod.flagged) {
            await supabase.from('content_flags').insert({
                episode_id: episodeId,
                flag_type: categoryToFlagType(mod.topCategory),
                confidence: mod.topScore,
                evidence: { source: 'openai_moderation', category: mod.topCategory, scores: mod.category_scores },
                auto_flagged: true,
            })
        }
    } catch (e) {
        console.error('[moderation] openai failed', e)
    }

    // 3) Keyword fallback (always runs)
    try {
        const kw = scanKeywords(fullText)
        if (kw.length > 0) {
            await supabase.from('content_flags').insert({
                episode_id: episodeId,
                flag_type: kw[0].category === 'explicit_copyright' ? 'similarity' : (kw[0].category as 'hate' | 'self_harm'),
                confidence: 0.5,
                evidence: { source: 'keywords', matches: kw.slice(0, 3) },
                auto_flagged: true,
            })
        }
    } catch (e) {
        console.error('[moderation] keywords failed', e)
    }
}

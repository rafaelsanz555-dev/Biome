import { createClient } from '@/lib/supabase/server'

/**
 * k-shingling for plaintext similarity detection.
 * Splits text into overlapping k-word windows, hashes each to a 63-bit BIGINT-safe number.
 */

const K = 5

// Simple 63-bit FNV-1a variant (fits in PostgreSQL BIGINT)
const FNV_OFFSET = BigInt('1469598103934665603')
const FNV_PRIME = BigInt('1099511628211')
const MASK_63 = BigInt('0x7fffffffffffffff')

function hashShingle(s: string): bigint {
    let h = FNV_OFFSET
    for (let i = 0; i < s.length; i++) {
        h ^= BigInt(s.charCodeAt(i))
        h = (h * FNV_PRIME) & MASK_63
    }
    return h
}

export function computeShingles(text: string, k: number = K): bigint[] {
    const clean = text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    const words = clean.split(' ').filter(Boolean)
    if (words.length < k) return []
    const seen = new Set<string>()
    const out: bigint[] = []
    for (let i = 0; i <= words.length - k; i++) {
        const sh = words.slice(i, i + k).join(' ')
        if (seen.has(sh)) continue
        seen.add(sh)
        out.push(hashShingle(sh))
    }
    return out
}

/**
 * Persist shingles for an episode. Idempotent: deletes previous shingles first.
 */
export async function persistShingles(episodeId: string, text: string) {
    const supabase = await createClient()
    const shingles = computeShingles(text)
    if (shingles.length === 0) return { inserted: 0 }

    await supabase.from('episode_shingles').delete().eq('episode_id', episodeId)

    // Insert in chunks of 500
    const rows = shingles.map((h) => ({
        episode_id: episodeId,
        shingle_hash: h.toString(), // BIGINT as string
    }))
    const chunkSize = 500
    for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize)
        await supabase.from('episode_shingles').insert(chunk)
    }
    return { inserted: rows.length }
}

/**
 * Find episodes with high shingle overlap (Jaccard similarity > threshold).
 * Returns top matches excluding the source episode.
 */
export async function findSimilar(
    episodeId: string,
    threshold: number = 0.4
): Promise<Array<{ matchedEpisodeId: string; jaccard: number; matches: number }>> {
    const supabase = await createClient()

    const { data: myShingles } = await supabase
        .from('episode_shingles')
        .select('shingle_hash')
        .eq('episode_id', episodeId)
    if (!myShingles || myShingles.length === 0) return []

    const mySize = myShingles.length
    const hashList = myShingles.map((r) => r.shingle_hash)

    // Find other episodes sharing any of these hashes
    const { data: matches } = await supabase
        .from('episode_shingles')
        .select('episode_id, shingle_hash')
        .in('shingle_hash', hashList)
        .neq('episode_id', episodeId)

    if (!matches) return []

    // Count overlap per other episode
    const counts = new Map<string, number>()
    for (const row of matches) {
        counts.set(row.episode_id, (counts.get(row.episode_id) ?? 0) + 1)
    }

    // For each candidate fetch its total shingle count to compute Jaccard
    const results: Array<{ matchedEpisodeId: string; jaccard: number; matches: number }> = []
    for (const [otherId, inter] of counts.entries()) {
        const { count: otherSize } = await supabase
            .from('episode_shingles')
            .select('*', { count: 'exact', head: true })
            .eq('episode_id', otherId)
        const union = mySize + (otherSize ?? 0) - inter
        const j = union > 0 ? inter / union : 0
        if (j >= threshold) {
            results.push({ matchedEpisodeId: otherId, jaccard: j, matches: inter })
        }
    }

    results.sort((a, b) => b.jaccard - a.jaccard)
    return results.slice(0, 5)
}

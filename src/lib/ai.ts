import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY

let client: Anthropic | null = null
function getClient(): Anthropic | null {
    if (!apiKey) return null
    if (!client) client = new Anthropic({ apiKey })
    return client
}

// Default: Claude Opus 4.7 (último flagship). Override via ANTHROPIC_MODEL si necesitas algo distinto.
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-7'
const MAX_INPUT_CHARS = 16000

export type AIAssistType = 'improve_text' | 'suggest_titles' | 'recap' | 'translate'

interface CallOpts {
    system: string
    user: string
    maxTokens?: number
    temperature?: number
    cacheSystem?: boolean
}

async function callClaude({ system, user, maxTokens = 1024, temperature = 0.7, cacheSystem = true }: CallOpts): Promise<string | null> {
    const c = getClient()
    if (!c) return null
    try {
        const sysBlocks: any[] = cacheSystem
            ? [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }]
            : [{ type: 'text', text: system }]
        const res = await c.messages.create({
            model: MODEL,
            max_tokens: maxTokens,
            temperature,
            system: sysBlocks,
            messages: [{ role: 'user', content: user.slice(0, MAX_INPUT_CHARS) }],
        })
        const block = res.content[0]
        if (block.type !== 'text') return null
        return block.text.trim()
    } catch (e: any) {
        console.error('[ai] anthropic call failed', {
            message: e?.message,
            status: e?.status,
            type: e?.error?.type,
            model: MODEL,
        })
        return null
    }
}

const SYSTEM_IMPROVE = `Eres un editor literario expert@ ayudando a un storyteller que cuenta historias reales de su vida en bio.me.

Tu rol: pulir y mejorar el texto MANTENIENDO la voz del autor. NUNCA inventes hechos. NUNCA cambies el sentido. NUNCA reemplaces detalles personales.

Reglas estrictas:
- Conserva la primera persona y el tono emocional
- Arregla solo claridad, ritmo, gramática y repeticiones evidentes
- Si una frase es ambigua, sugiere una alternativa pero respeta la elección del autor
- No añadas adjetivos floridos ni metáforas que el autor no usó
- Devuelve SOLO el texto mejorado, sin comentarios

Si el texto está bien como está, devuélvelo casi idéntico.`

const SYSTEM_TITLES = `Eres un editor de bio.me, una plataforma editorial para narrativa real.

Tarea: dado un fragmento o capítulo, genera 5 propuestas de título alternativas.

Criterios de buen título en bio.me:
- Específico, no genérico ("Mi historia" ❌, "El día que mi madre escondió las llaves" ✓)
- Evoca curiosidad sin spoilear
- 30-65 caracteres
- Suena humano, no clickbait
- Mantiene el tono del texto

Devuelve SOLO los 5 títulos, uno por línea, sin numeración ni comentarios.`

const SYSTEM_RECAP = `Eres un asistente que genera "previously on" — recaps cortos para que los lectores recuerden el episodio anterior antes de leer el siguiente.

Tarea: dado el texto del episodio, escribe un recap de 2-3 oraciones (máx 280 caracteres) que resuma lo esencial sin spoilers innecesarios.

Voz: tercera persona, presente narrativo. Tono: editorial, sobrio, sin adjetivos floridos.

Devuelve SOLO el recap, sin prefijos ni comentarios.`

const SYSTEM_TRANSLATE_EN = `Translate the following Spanish text into English.

Strict rules:
- Preserve first-person voice and emotional tone
- Keep proper nouns, place names, and cultural references intact
- Don't paraphrase — translate faithfully
- Maintain paragraph structure
- Return ONLY the translation, no commentary`

export async function improveText(text: string): Promise<string | null> {
    return callClaude({
        system: SYSTEM_IMPROVE,
        user: `Mejora este texto:\n\n${text}`,
        maxTokens: 2048,
        temperature: 0.4,
    })
}

export async function suggestTitles(text: string): Promise<string[] | null> {
    const out = await callClaude({
        system: SYSTEM_TITLES,
        user: `Genera 5 títulos para este capítulo:\n\n${text}`,
        maxTokens: 512,
        temperature: 0.85,
    })
    if (!out) return null
    return out.split('\n').map((l) => l.replace(/^[-•\d.)\s]+/, '').trim()).filter((l) => l.length > 5).slice(0, 5)
}

export async function generateRecap(text: string): Promise<string | null> {
    return callClaude({
        system: SYSTEM_RECAP,
        user: text,
        maxTokens: 256,
        temperature: 0.5,
    })
}

export async function translateToEnglish(text: string): Promise<string | null> {
    return callClaude({
        system: SYSTEM_TRANSLATE_EN,
        user: text,
        maxTokens: 4096,
        temperature: 0.3,
    })
}

export const CONTENT_TYPES = ['entry', 'chapter'] as const
export type ContentType = (typeof CONTENT_TYPES)[number]

export const STORY_TYPES = ['life_story', 'fiction'] as const
export type StoryType = (typeof STORY_TYPES)[number]

export const AGE_RATINGS = ['all', '13+', '16+', '18+'] as const
export type AgeRating = (typeof AGE_RATINGS)[number]

export const CONTENT_WARNING_OPTIONS = [
    { value: 'violence', label: 'Violencia' },
    { value: 'sexual_content', label: 'Contenido sexual' },
    { value: 'self_harm', label: 'Autolesiones' },
    { value: 'substance_use', label: 'Consumo de sustancias' },
    { value: 'abuse', label: 'Abuso o acoso' },
    { value: 'grief', label: 'Duelo o perdida' },
] as const

export function resolveContentType(seasonId?: string | null): ContentType {
    return seasonId ? 'chapter' : 'entry'
}

export function contentTypeLabel(type: ContentType) {
    return type === 'entry' ? 'Entrada' : 'Capitulo'
}

export function storyTypeLabel(type?: StoryType | null) {
    return type === 'fiction' ? 'Novela' : 'Historia real'
}

export function parseContentWarnings(value: FormDataEntryValue | null): string[] {
    if (typeof value !== 'string' || !value) return []
    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed)
            ? parsed.filter((item): item is string => typeof item === 'string').slice(0, 12)
            : []
    } catch {
        return []
    }
}


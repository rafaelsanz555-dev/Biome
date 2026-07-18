import { createAdminClient } from '@/lib/supabase/admin'

export const LEGAL_VERSIONS = {
    terms: '0.2-beta',
    privacy: '0.2-beta',
    content_policy: '0.2-beta',
    creator_terms: '0.2-beta',
} as const

export type LegalDocument = keyof typeof LEGAL_VERSIONS
export type LegalContext = 'signup' | 'onboarding' | 'publish' | 'legal_update'

type AcceptanceInput = {
    userId: string
    documents: LegalDocument[]
    context: LegalContext
    resourceId?: string | null
    metadata?: Record<string, unknown>
}

/**
 * Records an auditable acceptance in Postgres. During the migration window,
 * auth app_metadata is used as a durable fallback so onboarding/publishing do
 * not become unavailable before the SQL migration is applied.
 */
export async function recordLegalAcceptances(input: AcceptanceInput) {
    const admin = createAdminClient()
    const acceptedAt = new Date().toISOString()
    const rows = input.documents.map((document) => ({
        user_id: input.userId,
        document,
        version: LEGAL_VERSIONS[document],
        context: input.context,
        resource_id: input.resourceId || null,
        accepted_at: acceptedAt,
        metadata: input.metadata || {},
    }))

    const { error } = await admin.from('legal_acceptances').insert(rows)

    if (!error || error.code === '23505') return { stored: 'database' as const }

    const migrationMissing = /schema cache|does not exist|relation .*legal_acceptances/i.test(error.message)
    if (!migrationMissing) throw new Error(`No se pudo registrar la aceptacion legal: ${error.message}`)

    const { data } = await admin.auth.admin.getUserById(input.userId)
    const rawPrevious = data.user?.app_metadata?.legal_acceptances
    const previous = Array.isArray(rawPrevious) ? rawPrevious : []
    const fallbackRows = rows.map((row) => ({
        document: row.document,
        version: row.version,
        context: row.context,
        resource_id: row.resource_id,
        accepted_at: row.accepted_at,
    }))
    const merged = [...previous, ...fallbackRows].slice(-80)
    const { error: authError } = await admin.auth.admin.updateUserById(input.userId, {
        app_metadata: {
            ...(data.user?.app_metadata || {}),
            legal_acceptances: merged,
        },
    })
    if (authError) throw new Error(`No se pudo registrar la aceptacion legal: ${authError.message}`)
    return { stored: 'auth_metadata' as const }
}

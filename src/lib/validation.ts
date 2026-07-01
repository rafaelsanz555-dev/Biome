import { z } from 'zod'

export const uuidSchema = z.string().uuid()

export const profileRoleSchema = z.enum(['reader', 'creator'])
export const adminRoleSchema = z.enum(['reader', 'creator', 'admin'])

// Rutas propias de la app: si un usuario las toma como username, su perfil
// /{username} queda inaccesible (la ruta estática gana) y confunde URLs.
const RESERVED_USERNAMES = new Set([
    'admin', 'api', 'auth', 'dashboard', 'discover', 'search', 'login',
    'signup', 'register', 'onboarding', 'legal', 'settings', 'billing',
    'notifications', 'help', 'support', 'about', 'terms', 'privacy',
    'bio', 'biome', 'official', 'root', 'www',
])

export const usernameSchema = z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-zA-Z0-9_]{3,20}$/, 'invalid_username')
    .refine((u) => !RESERVED_USERNAMES.has(u), 'reserved_username')

export const safeText = (max: number) => z.string().trim().max(max)

export function parseJsonBody<T extends z.ZodTypeAny>(schema: T, body: unknown) {
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
        return { ok: false as const, error: parsed.error.flatten() }
    }
    return { ok: true as const, data: parsed.data as z.infer<T> }
}

export function formString(formData: FormData, key: string) {
    const value = formData.get(key)
    return typeof value === 'string' ? value : ''
}

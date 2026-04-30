/**
 * bio.me · Email transactional client (Resend)
 *
 * Wrapper sobre Resend SDK con graceful degradation: si RESEND_API_KEY
 * no está configurado, los emails son no-op (no rompen la app).
 */

import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const fromAddress = process.env.RESEND_FROM_ADDRESS || 'bio.me <noreply@bio.me>'

let resendClient: Resend | null = null
function getClient(): Resend | null {
    if (!apiKey) return null
    if (!resendClient) resendClient = new Resend(apiKey)
    return resendClient
}

export interface SendEmailParams {
    to: string | string[]
    subject: string
    html: string
    text?: string
    replyTo?: string
}

export async function sendEmail(params: SendEmailParams): Promise<{ ok: boolean; error?: string }> {
    const client = getClient()
    if (!client) {
        // No-op cuando no está configurado — no romper la app
        console.log('[email] RESEND_API_KEY missing, skipped:', params.subject)
        return { ok: true }
    }

    try {
        const { data, error } = await client.emails.send({
            from: fromAddress,
            to: params.to,
            subject: params.subject,
            html: params.html,
            text: params.text,
            replyTo: params.replyTo,
        })
        if (error) {
            console.error('[email] resend error:', error)
            return { ok: false, error: error.message }
        }
        return { ok: true }
    } catch (e: any) {
        console.error('[email] send failed:', e?.message)
        return { ok: false, error: e?.message }
    }
}

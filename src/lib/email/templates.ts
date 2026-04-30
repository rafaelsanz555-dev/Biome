/**
 * bio.me · Email templates (HTML responsivos con marca cobalt)
 *
 * Diseño: minimalista, editorial, dark tone con accent cobalto.
 * Compatible con Gmail / Outlook / Apple Mail.
 *
 * 5 plantillas core en este sprint:
 *  - welcome
 *  - verify
 *  - resetPassword
 *  - subscriptionSuccess (al lector + al escritor)
 *  - subscriptionCancelled
 *
 * Pendientes para próxima sesión: gift, newFollower, newEpisode, paymentFailed, accountDeleted.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://biome-app.vercel.app'

// ─────────────────────────────────────────────────
// Layout base — header + body + footer consistentes
// ─────────────────────────────────────────────────
function layout(opts: { preheader: string; bodyHtml: string }): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>bio.me</title>
</head>
<body style="margin:0;padding:0;background:#0A0B0E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#E5E7EB;">
<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${opts.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0B0E;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0F1114;border-radius:16px;border:1px solid #1f2937;">

<!-- HEADER -->
<tr><td style="padding:32px 32px 16px;border-bottom:1px solid #1f2937;">
<div style="font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#FFFFFF;">bio<span style="color:#2563EB;">.me</span></div>
<div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1.5px;margin-top:4px;">Tu historia · Tus ingresos</div>
</td></tr>

<!-- BODY -->
<tr><td style="padding:32px;">${opts.bodyHtml}</td></tr>

<!-- FOOTER -->
<tr><td style="padding:24px 32px;border-top:1px solid #1f2937;font-size:12px;color:#6B7280;">
<p style="margin:0 0 8px;">bio.me — la plataforma para storytellers que cuentan vida real.</p>
<p style="margin:0;">
<a href="${APP_URL}" style="color:#2563EB;text-decoration:none;">Visitar bio.me</a>
&nbsp;·&nbsp;
<a href="${APP_URL}/legal/privacy" style="color:#6B7280;text-decoration:none;">Privacidad</a>
&nbsp;·&nbsp;
<a href="${APP_URL}/legal/terms" style="color:#6B7280;text-decoration:none;">Términos</a>
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

function button(label: string, href: string): string {
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:#2563EB;border-radius:10px;">
<a href="${href}" style="display:inline-block;padding:14px 28px;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;">${label}</a>
</td></tr></table>`
}

function h1(text: string): string {
    return `<h1 style="font-size:24px;font-weight:700;color:#FFFFFF;margin:0 0 16px;line-height:1.3;">${text}</h1>`
}

function p(text: string): string {
    return `<p style="font-size:15px;line-height:1.7;color:#D1D5DB;margin:0 0 16px;">${text}</p>`
}

function hint(text: string): string {
    return `<p style="font-size:12px;line-height:1.6;color:#6B7280;margin:24px 0 0;font-style:italic;">${text}</p>`
}

// ═══════════════════════════════════════════════════
// 1. WELCOME (post-onboarding completado)
// ═══════════════════════════════════════════════════
export function welcomeEmail(opts: { username: string; fullName?: string; isCreator: boolean }): { subject: string; html: string; text: string } {
    const name = opts.fullName || opts.username
    const subject = opts.isCreator
        ? `Bienvenido a bio.me, ${name} — ya eres Founding Storyteller`
        : `Bienvenido a bio.me, ${name}`

    const body = opts.isCreator
        ? h1(`Hola, ${name}. Bienvenido al club fundador.`) +
          p(`Eres uno de los primeros escritores en bio.me. Eso te hace <strong>Founding Storyteller</strong> — un badge permanente en tu perfil y plan gratuito de por vida cuando empecemos a cobrar.`) +
          p(`Tu perfil está en <a href="${APP_URL}/${opts.username}" style="color:#60A5FA;">bio.me/${opts.username}</a>. Lo primero: completa tu identidad, escoge tu tema visual y publica tu primer episodio.`) +
          button('Ir a mi dashboard', `${APP_URL}/dashboard`) +
          hint('Tip: el primer episodio siempre es gratis para todos. Es tu hook. Empezá fuerte.')
        : h1(`Hola, ${name}.`) +
          p(`Bienvenido a bio.me — la plataforma de narrativa real. Aquí leés vidas, no posts. Personas reales contando lo que vivieron.`) +
          p(`Empieza explorando los escritores que ya están publicando.`) +
          button('Explorar creadores', `${APP_URL}/discover`)

    return {
        subject,
        html: layout({ preheader: subject, bodyHtml: body }),
        text: `${name},\n\n${opts.isCreator ? 'Bienvenido al club fundador de bio.me.' : 'Bienvenido a bio.me.'}\n\nIr a tu dashboard: ${APP_URL}/dashboard`,
    }
}

// ═══════════════════════════════════════════════════
// 2. VERIFY EMAIL
// ═══════════════════════════════════════════════════
export function verifyEmailEmail(opts: { confirmUrl: string }): { subject: string; html: string; text: string } {
    const subject = 'Confirma tu email en bio.me'
    const body =
        h1('Un click para confirmar tu cuenta') +
        p('Hiciste registro en bio.me. Para activar tu cuenta y empezar a leer/escribir, confirma que este email es tuyo.') +
        button('Confirmar mi email', opts.confirmUrl) +
        p(`Si el botón no funciona, copia este link en tu navegador:<br><span style="color:#60A5FA;word-break:break-all;font-size:13px;">${opts.confirmUrl}</span>`) +
        hint('Si no creaste esta cuenta, ignora este email. El link expira en 24h.')

    return {
        subject,
        html: layout({ preheader: 'Confirma tu cuenta de bio.me', bodyHtml: body }),
        text: `Confirma tu cuenta de bio.me:\n\n${opts.confirmUrl}\n\nSi no fuiste tú, ignora este email.`,
    }
}

// ═══════════════════════════════════════════════════
// 3. RESET PASSWORD
// ═══════════════════════════════════════════════════
export function resetPasswordEmail(opts: { resetUrl: string }): { subject: string; html: string; text: string } {
    const subject = 'Recupera tu contraseña de bio.me'
    const body =
        h1('Cambia tu contraseña') +
        p('Recibimos una solicitud para resetear tu contraseña. Click en el botón para crear una nueva.') +
        button('Cambiar contraseña', opts.resetUrl) +
        p(`Si el botón no funciona, copia este link:<br><span style="color:#60A5FA;word-break:break-all;font-size:13px;">${opts.resetUrl}</span>`) +
        hint('Si no pediste resetear tu contraseña, ignora este email. Tu contraseña actual sigue activa. El link expira en 1 hora.')

    return {
        subject,
        html: layout({ preheader: 'Reset password bio.me', bodyHtml: body }),
        text: `Reset password bio.me:\n\n${opts.resetUrl}\n\nIgnora si no fuiste tú.`,
    }
}

// ═══════════════════════════════════════════════════
// 4a. SUBSCRIPTION SUCCESS — al LECTOR
// ═══════════════════════════════════════════════════
export function subscriptionSuccessReaderEmail(opts: {
    creatorName: string
    creatorUsername: string
    amount: number
    validUntil: Date
}): { subject: string; html: string; text: string } {
    const subject = `Suscrito a @${opts.creatorUsername} — ya tienes acceso completo`
    const body =
        h1(`¡Listo! Acceso desbloqueado`) +
        p(`Te suscribiste a <strong style="color:#FFFFFF;">@${opts.creatorUsername}</strong>. Ya tienes acceso a todos sus episodios exclusivos, pasados y futuros.`) +
        `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;background:#0A0B0E;border-radius:10px;border:1px solid #1f2937;width:100%;">
<tr><td style="padding:16px;">
<p style="margin:0;font-size:13px;color:#9CA3AF;">Pago confirmado</p>
<p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#FFFFFF;">$${opts.amount.toFixed(2)}/mes</p>
<p style="margin:8px 0 0;font-size:11px;color:#6B7280;">Próxima renovación: ${opts.validUntil.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
</td></tr></table>` +
        button(`Leer historias de ${opts.creatorName}`, `${APP_URL}/${opts.creatorUsername}`) +
        hint(`Puedes cancelar cuando quieras desde <a href="${APP_URL}/dashboard/subscriptions" style="color:#60A5FA;">tus suscripciones</a>. Sin preguntas, sin penalizaciones.`)

    return {
        subject,
        html: layout({ preheader: `Acceso confirmado a @${opts.creatorUsername}`, bodyHtml: body }),
        text: `Suscripción confirmada a @${opts.creatorUsername} por $${opts.amount.toFixed(2)}/mes.\n\nLeer: ${APP_URL}/${opts.creatorUsername}`,
    }
}

// ═══════════════════════════════════════════════════
// 4b. SUBSCRIPTION SUCCESS — al ESCRITOR
// ═══════════════════════════════════════════════════
export function subscriptionSuccessCreatorEmail(opts: {
    creatorName: string
    subscriberName: string
    amount: number
    earnings: number
}): { subject: string; html: string; text: string } {
    const subject = `🎉 Tienes un nuevo suscriptor en bio.me`
    const body =
        h1(`¡Felicidades, ${opts.creatorName}!`) +
        p(`<strong style="color:#FFFFFF;">${opts.subscriberName}</strong> se acaba de suscribir a tu serie. Eso significa que tu narrativa los enganchó lo suficiente para que apoyen tu trabajo cada mes.`) +
        `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;background:linear-gradient(135deg,rgba(37,99,235,0.1),rgba(37,99,235,0.05));border-radius:10px;border:1px solid rgba(37,99,235,0.2);width:100%;">
<tr><td style="padding:20px;">
<p style="margin:0;font-size:13px;color:#9CA3AF;">Tu ganancia este mes</p>
<p style="margin:4px 0 0;font-size:24px;font-weight:700;color:#60A5FA;">$${opts.earnings.toFixed(2)}</p>
<p style="margin:8px 0 0;font-size:11px;color:#6B7280;">88% del pago de $${opts.amount.toFixed(2)} · 12% comisión bio.me</p>
</td></tr></table>` +
        button('Ver mi panel de monetización', `${APP_URL}/dashboard/billing`) +
        hint('Sigue publicando con la frecuencia que prometiste. La constancia es lo que convierte un suscriptor en lector de por vida.')

    return {
        subject,
        html: layout({ preheader: `Nueva suscripción de ${opts.subscriberName}`, bodyHtml: body }),
        text: `${opts.subscriberName} se suscribió. Ganaste $${opts.earnings.toFixed(2)}.\n\nVer billing: ${APP_URL}/dashboard/billing`,
    }
}

// ═══════════════════════════════════════════════════
// 5. SUBSCRIPTION CANCELLED — al lector cuando cancela
// ═══════════════════════════════════════════════════
export function subscriptionCancelledEmail(opts: {
    creatorUsername: string
    validUntil: Date
}): { subject: string; html: string; text: string } {
    const subject = `Cancelaste tu suscripción a @${opts.creatorUsername}`
    const body =
        h1('Cancelación confirmada') +
        p(`Tu suscripción a <strong style="color:#FFFFFF;">@${opts.creatorUsername}</strong> no se renovará al final del período actual.`) +
        `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;background:#0A0B0E;border-radius:10px;border:1px solid #1f2937;width:100%;">
<tr><td style="padding:16px;">
<p style="margin:0;font-size:13px;color:#9CA3AF;">Mantienes acceso hasta</p>
<p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#FFFFFF;">${opts.validUntil.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
</td></tr></table>` +
        p('Puedes seguir leyendo todo el contenido del autor hasta esa fecha. Después tu acceso se cierra automáticamente sin más cobros.') +
        button(`Volver a suscribirme`, `${APP_URL}/${opts.creatorUsername}`) +
        hint('¿Cancelaste por error? Reactivar es un click.')

    return {
        subject,
        html: layout({ preheader: `Suscripción a @${opts.creatorUsername} cancelada`, bodyHtml: body }),
        text: `Cancelación confirmada. Acceso hasta ${opts.validUntil.toLocaleDateString('es-ES')}.\n\n${APP_URL}/${opts.creatorUsername}`,
    }
}

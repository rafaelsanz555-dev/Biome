/**
 * Reglas de monetización de bio.me — ÚNICA fuente de verdad.
 *
 * Si cambias la comisión, cámbiala SOLO aquí: el webhook, el checkout de
 * regalos y las pantallas de ingresos leen estas constantes.
 */

/** Comisión de la plataforma sobre cada transacción del escritor (12%). */
export const PLATFORM_FEE_PCT = 0.12

/** Lo que recibe el escritor de cada transacción (88%). */
export const WRITER_SHARE = 1 - PLATFORM_FEE_PCT

/** Precio mínimo de suscripción mensual que puede fijar un escritor. */
export const MIN_SUBSCRIPTION_PRICE = 2

/** Redondeo a 2 decimales para montos en USD. */
export function usd(amount: number): number {
    return +amount.toFixed(2)
}

/** Parte del escritor de un monto bruto. */
export function writerEarnings(grossAmount: number): number {
    return usd(grossAmount * WRITER_SHARE)
}

/** Parte de la plataforma de un monto bruto. */
export function platformFee(grossAmount: number): number {
    return usd(grossAmount * PLATFORM_FEE_PCT)
}

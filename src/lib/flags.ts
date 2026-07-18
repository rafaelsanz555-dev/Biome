/**
 * Interruptores globales de producto.
 *
 * MVP: la monetización está APAGADA — todo el catálogo se lee gratis y la UI
 * de pagos (suscripciones, PPV, regalos, ingresos) se oculta. El código de
 * pagos sigue intacto por debajo; para reactivarlo en el futuro basta con
 * poner NEXT_PUBLIC_MONETIZATION=on en el entorno.
 */
export const MONETIZATION_ENABLED = process.env.NEXT_PUBLIC_MONETIZATION === 'on'

export const metadata = { title: 'Términos de servicio · bio.me' }

export default function TermsPage() {
    return (
        <>
            <h1>Términos de servicio</h1>
            <p className="text-sm text-gray-500">Última actualización: abril 2026</p>

            <h2>1. Aceptación</h2>
            <p>Al usar bio.me aceptas estos términos. Si no estás de acuerdo, no uses la plataforma.</p>

            <h2>2. Cuentas</h2>
            <p>Debes tener al menos 18 años. Eres responsable de la seguridad de tu cuenta y de toda la actividad que ocurra bajo ella.</p>

            <h2>3. Contenido del escritor</h2>
            <p>Tú mantienes la propiedad intelectual de todo lo que publicas. Nos concedes una licencia no exclusiva para alojar, mostrar y distribuir tu contenido dentro de bio.me.</p>

            <h2>4. Monetización</h2>
            <p>Los escritores pagan una suscripción mensual para publicar. Las suscripciones de lectores y los regalos generan comisión de plataforma (10-12%). Los pagos se procesan vía Stripe Connect.</p>

            <h2>5. Prohibiciones</h2>
            <ul>
                <li>Copiar contenido ajeno sin autorización.</li>
                <li>Publicar contenido explícitamente sexual, violento o que promueva daño.</li>
                <li>Acoso, spam o cualquier forma de abuso hacia otros usuarios.</li>
            </ul>

            <h2>6. Terminación</h2>
            <p>Podemos suspender cuentas que violen estos términos. Puedes cerrar tu cuenta en cualquier momento desde Ajustes.</p>

            <h2>7. Contacto</h2>
            <p>Para consultas legales: legal@bio.me</p>
        </>
    )
}

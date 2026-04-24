export const metadata = { title: 'Privacidad · bio.me' }

export default function PrivacyPage() {
    return (
        <>
            <h1>Política de privacidad</h1>
            <p className="text-sm text-gray-500">Última actualización: abril 2026</p>

            <h2>Qué recopilamos</h2>
            <ul>
                <li>Email, nombre, foto de perfil (registro).</li>
                <li>Contenido que publicas (episodios, comentarios, reacciones).</li>
                <li>Metadata de lectura (tiempo, scroll, país) para analíticas del escritor.</li>
                <li>Datos de pago procesados por Stripe (no almacenamos números de tarjeta).</li>
            </ul>

            <h2>Cómo lo usamos</h2>
            <p>Para operar la plataforma, mejorar la experiencia de lectura, entregar analíticas a los escritores y procesar pagos. No vendemos tus datos a terceros.</p>

            <h2>Tus derechos</h2>
            <p>Puedes exportar o eliminar tus datos en cualquier momento desde Ajustes. Para ejercer derechos GDPR/LOPD: privacy@bio.me</p>

            <h2>Cookies</h2>
            <p>Usamos cookies esenciales para sesión y preferencias (idioma). Analíticas con PostHog, opt-out disponible.</p>
        </>
    )
}

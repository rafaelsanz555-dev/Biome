export const metadata = { title: 'Creator Terms · bio.me [BORRADOR]' }

export default function CreatorTermsPage() {
    return (
        <>
            <h1>Creator Terms</h1>
            <p className="text-sm text-gray-500"><strong>BORRADOR — Pendiente de revisión legal</strong> · Versión: 0.1 · Última edición: abril 2026</p>

            <p>Estos Creator Terms aplican adicionalmente a los <a href="/legal/terms">Términos de Servicio</a> generales si tienes cuenta de tipo "Creator / Storyteller" en bio.me.</p>

            <h2>1. Definición de Creator</h2>
            <p>Un Creator es un usuario que publica contenido en bio.me y opcionalmente lo monetiza vía suscripciones, pagos por episodio (PPV), o recibiendo regalos.</p>

            <h2>2. Modelo de monetización</h2>

            <h3>2.1. Founding Storyteller Program</h3>
            <p>Los primeros 300-500 creators que se registren se incorporan al <strong>Founding Storyteller Program</strong>. Este programa otorga:</p>
            <ul>
                <li>Cuenta de creator gratuita (sin fee mensual)</li>
                <li>Badge permanente "Founding Storyteller" en el perfil</li>
                <li><strong>Plan gratuito de por vida</strong> cuando bio.me empiece a cobrar fee mensual a nuevos creadores</li>
                <li>Acceso prioritario a nuevas features</li>
                <li>Línea directa de comunicación con el equipo de bio.me</li>
            </ul>
            <p>Después de los primeros 300-500 creators, bio.me podrá introducir un fee mensual para nuevos registros (estimado en $5/mes), pero los Founding Storytellers mantienen su gratuidad.</p>

            <h3>2.2. Comisiones de plataforma</h3>
            <p>bio.me retiene un <strong>12% de comisión</strong> sobre cada transacción del creador:</p>
            <table>
                <thead><tr><th>Tipo</th><th>Creator recibe</th><th>bio.me retiene</th></tr></thead>
                <tbody>
                    <tr><td>Suscripción mensual</td><td>88%</td><td>12%</td></tr>
                    <tr><td>Pay-per-view (PPV)</td><td>88%</td><td>12%</td></tr>
                    <tr><td>Regalos / Tips</td><td>88%</td><td>12%</td></tr>
                </tbody>
            </table>
            <p>Adicionalmente, Stripe aplica sus propios fees (~2.9% + $0.30 por transacción) que se restan antes de la división 88/12.</p>

            <h3>2.3. Pricing</h3>
            <ul>
                <li>El creador define su precio de suscripción (mínimo recomendado: $2/mes)</li>
                <li>El creador define el precio PPV de cada episodio (mínimo $0.99, máximo $999.99)</li>
                <li>El primer episodio publicado siempre es gratis para todos (no se puede monetizar)</li>
            </ul>

            <h2>3. Pagos via Stripe Connect</h2>
            <p>bio.me usa Stripe Connect (modelo Express). Para recibir pagos, debes:</p>
            <ul>
                <li>Crear cuenta de Stripe Connect (proceso integrado en bio.me)</li>
                <li>Completar verificación de identidad (KYC) requerida por Stripe</li>
                <li>Proveer información bancaria para depósitos</li>
                <li>Aceptar los términos de Stripe Connect además de los nuestros</li>
            </ul>
            <p>Los pagos se depositan automáticamente en tu cuenta bancaria según el schedule de Stripe (típicamente diario o semanal).</p>
            <p>bio.me no tiene control directo sobre los fondos en tu cuenta Stripe Connect. Si hay disputas, contacta directamente a Stripe.</p>

            <h2>4. Reembolsos y disputas</h2>

            <h3>4.1. Suscripciones</h3>
            <p>Las suscripciones son <strong>no reembolsables</strong> por el período en curso. Los lectores pueden cancelar en cualquier momento; mantienen acceso hasta el final del período pagado.</p>

            <h3>4.2. Pay-per-view (PPV)</h3>
            <p>Una vez que el lector accede al contenido, el pago no es reembolsable salvo:</p>
            <ul>
                <li>Error técnico que impidió el acceso</li>
                <li>Contenido removido por moderación dentro de las 48h del pago</li>
                <li>Solicitud aprobada por bio.me a discreción</li>
            </ul>

            <h3>4.3. Disputes (chargebacks)</h3>
            <p>Si un lector hace chargeback con su banco:</p>
            <ul>
                <li>El monto del chargeback + fees de Stripe se restan de tus earnings</li>
                <li>Si el chargeback es fraudulento, bio.me apoya con evidencia disponible</li>
                <li>Múltiples chargebacks pueden derivar en revisión o suspensión de tu cuenta</li>
            </ul>

            <h2>5. Frecuencia de publicación y constancia</h2>
            <p>Si declaras una <strong>frecuencia prometida</strong> en tu perfil (semanal, quincenal, mensual), te comprometes a respetarla razonablemente. Si llevas <strong>+60 días sin publicar</strong>:</p>
            <ul>
                <li>Tu perfil mostrará alerta visible a los lectores</li>
                <li>Los lectores que se suscriban verán warning antes de pagar</li>
                <li>Tu serie se marcará automáticamente como "en pausa"</li>
            </ul>
            <p>bio.me NO obliga publicación regular ni penaliza pausas legítimas. Pero la transparencia con los lectores es responsabilidad del creator.</p>

            <h2>6. Calidad y moderación de contenido</h2>
            <ul>
                <li>Tu contenido debe cumplir con la <a href="/legal/content-policy">Política de Contenido</a></li>
                <li>Si se detectan violaciones, podemos despublicar episodios o suspender la cuenta</li>
                <li>Los flags automáticos (plagio, contenido prohibido) son indicativos, no bloqueantes — pero requieren tu atención</li>
            </ul>

            <h2>7. Suspensión y cierre</h2>
            <p>Si tu cuenta de creator es suspendida o cerrada:</p>
            <ul>
                <li>Los earnings ya transferidos a Stripe son tuyos</li>
                <li>Earnings pendientes (en holding por chargeback risk) se procesan según política de Stripe</li>
                <li>Las suscripciones activas de tus lectores se cancelan automáticamente sin reembolso por el período en curso</li>
                <li>Tienes derecho de exportar tu contenido antes del cierre</li>
            </ul>

            <h2>8. Impuestos</h2>
            <p><strong>Tú eres responsable</strong> de declarar y pagar los impuestos sobre tus earnings en tu jurisdicción. bio.me y Stripe pueden emitir documentos fiscales (1099 en USA, etc.) según aplique. Consulta con tu contador.</p>

            <h2>9. Restricciones geográficas</h2>
            <p>Stripe Connect no opera en todos los países. Si tu país no está soportado, no podrás recibir pagos a través de bio.me. Lista actualizada: <a href="https://stripe.com/global" target="_blank">stripe.com/global</a>.</p>

            <h2>10. Tu marca personal</h2>
            <p>Como creator, puedes:</p>
            <ul>
                <li>Personalizar tu theme visual (color, tipografía, fondo, imagen propia)</li>
                <li>Configurar tu manifesto, frecuencia, intereses</li>
                <li>Recibir badge "Storyteller Verificado" tras verificación de identidad</li>
                <li>Compartir el link de tu perfil bio.me/{'{tu_username}'} libremente</li>
            </ul>
            <p>bio.me no reclama derechos sobre tu marca personal, audiencia o lista de suscriptores. Si te vas, te vas con tu identidad intacta.</p>

            <h2>11. Modificaciones a estos Creator Terms</h2>
            <p>Cambios significativos al modelo de monetización (% comisión, fee fijo) requieren <strong>30 días de notificación previa</strong> por email. Los Founding Storytellers mantienen sus condiciones originales.</p>

            <hr style={{ margin: '3em 0', border: 0, borderTop: '1px solid #1f2937' }} />
            <p className="text-xs text-gray-600 italic"><strong>NOTAS PARA EL ATTORNEY:</strong></p>
            <ul className="text-xs text-gray-600">
                <li>Validar el modelo "Founding Storyteller forever free" como compromiso vinculante</li>
                <li>Definir cláusula clara para cambios de % comisión sin afectar founders</li>
                <li>Stripe Connect Express vs Standard — implicaciones legales</li>
                <li>1099 reporting threshold (USA: $600 desde 2024)</li>
                <li>Tax treatment internacional (creadores en LATAM cobrando en USD)</li>
                <li>Cláusula de arbitraje para disputas con creadores</li>
                <li>Definir qué pasa con earnings retenidos si el creator desaparece (escheatment)</li>
                <li>Política de "frecuencia prometida": ¿es contractual o solo informativa para lectores?</li>
            </ul>
        </>
    )
}

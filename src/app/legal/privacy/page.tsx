export const metadata = { title: 'Política de Privacidad · bio.me [BORRADOR]' }

export default function PrivacyPage() {
    return (
        <>
            <h1>Política de Privacidad</h1>
            <p className="text-sm text-gray-500"><strong>BORRADOR — Pendiente de revisión legal</strong> · Versión: 0.1 · Última edición: abril 2026</p>

            <p>Esta política describe qué datos personales recolecta bio.me, cómo se usan, con quién se comparten y cuáles son tus derechos.</p>

            <h2>1. Quién es el responsable de tus datos</h2>
            <p>El responsable del tratamiento es Rafael Bernardo Sanz Espinoza, operador de bio.me. Contacto: <strong>privacy@bio.me</strong> (pendiente de configurar).</p>

            <h2>2. Datos que recolectamos</h2>

            <h3>2.1. Datos que tú nos das directamente</h3>
            <ul>
                <li><strong>Al registrarte:</strong> email, password (hashed), username</li>
                <li><strong>Al completar tu perfil:</strong> nombre completo (opcional), biografía, foto de perfil, país, idiomas, pronombres, intereses</li>
                <li><strong>Si eres creador:</strong> precio de suscripción, frecuencia de publicación, manifesto personal, theme visual, datos de Stripe Connect (manejados por Stripe directamente)</li>
                <li><strong>Si publicas:</strong> el contenido de tus episodios (texto, imágenes, audio si aplica)</li>
                <li><strong>Si te suscribes:</strong> método de pago (manejado por Stripe, no almacenamos números de tarjeta)</li>
            </ul>

            <h3>2.2. Datos que recolectamos automáticamente</h3>
            <ul>
                <li><strong>Datos técnicos:</strong> dirección IP, user agent, tipo de dispositivo, sistema operativo, navegador</li>
                <li><strong>Datos de comportamiento de lectura:</strong> qué episodios abres, hasta dónde lees (% de scroll), cuánto tiempo pasas, en qué dispositivo</li>
                <li><strong>Datos de interacción:</strong> reacciones, gifts enviados, suscripciones, comentarios</li>
                <li><strong>Cookies:</strong> de sesión (autenticación) y de preferencias (idioma, theme)</li>
            </ul>

            <h3>2.3. Datos que NO recolectamos</h3>
            <ul>
                <li>Números de tarjeta de crédito (Stripe los maneja directamente)</li>
                <li>Datos biométricos</li>
                <li>Geolocalización exacta (solo país inferido por IP)</li>
                <li>Conversaciones privadas externas a la plataforma</li>
            </ul>

            <h2>3. Para qué usamos tus datos</h2>
            <ul>
                <li><strong>Operar la Plataforma:</strong> autenticación, mostrar tu perfil, gestionar suscripciones, procesar pagos</li>
                <li><strong>Mejorar el servicio:</strong> analytics agregadas (sin identificar individuos), funnels de uso</li>
                <li><strong>Comunicarnos contigo:</strong> emails transaccionales (welcome, suscripción, cancelación, etc.)</li>
                <li><strong>Cumplir obligaciones legales:</strong> respuestas a órdenes judiciales, prevención de fraude, anti-lavado de dinero</li>
                <li><strong>Moderación:</strong> detectar plagio (shingling interno), contenido prohibido (OpenAI Moderation API)</li>
            </ul>

            <h2>4. Con quién compartimos tus datos</h2>
            <p>Solo compartimos datos con proveedores estrictamente necesarios para operar bio.me:</p>
            <table>
                <thead><tr><th>Proveedor</th><th>Datos compartidos</th><th>Propósito</th></tr></thead>
                <tbody>
                    <tr><td>Supabase</td><td>email, perfil, contenido</td><td>Base de datos + auth + storage</td></tr>
                    <tr><td>Stripe / Stripe Connect</td><td>email, monto, payment method</td><td>Procesar pagos a escritores</td></tr>
                    <tr><td>Resend</td><td>email, contenido del email</td><td>Envío de emails transaccionales</td></tr>
                    <tr><td>Vercel</td><td>logs de servidor</td><td>Hosting</td></tr>
                    <tr><td>Anthropic (Claude API)</td><td>texto de episodio (solo si pides ayuda IA)</td><td>Mejora de redacción y sugerencias</td></tr>
                    <tr><td>OpenAI (Moderation)</td><td>texto de episodio publicado</td><td>Detectar contenido prohibido</td></tr>
                    <tr><td>PostHog</td><td>eventos de uso (sin email visible)</td><td>Product analytics</td></tr>
                </tbody>
            </table>
            <p>NO vendemos tus datos a terceros. NO compartimos con publicistas. NO compartimos con redes sociales sin tu consentimiento explícito.</p>

            <h2>5. Cuánto tiempo guardamos tus datos</h2>
            <ul>
                <li><strong>Mientras tengas cuenta activa:</strong> indefinidamente</li>
                <li><strong>Después de cerrar cuenta:</strong> eliminamos perfil + contenido en máximo 30 días, excepto:
                    <ul>
                        <li>Datos financieros (transacciones): 7 años por requisitos fiscales</li>
                        <li>Logs de seguridad: 90 días</li>
                        <li>Backups: ciclo de rotación de 90 días</li>
                    </ul>
                </li>
            </ul>

            <h2>6. Tus derechos</h2>
            <p>Tienes derecho a:</p>
            <ul>
                <li><strong>Acceso:</strong> solicitar copia de todos los datos que tenemos sobre ti</li>
                <li><strong>Rectificación:</strong> corregir datos incorrectos (la mayoría puedes editarlos directamente desde Ajustes)</li>
                <li><strong>Eliminación ("derecho al olvido"):</strong> cerrar cuenta y borrar perfil</li>
                <li><strong>Portabilidad:</strong> recibir tus datos en formato JSON exportable</li>
                <li><strong>Oposición:</strong> opt-out de analytics no esenciales</li>
                <li><strong>No discriminación:</strong> ejercer tus derechos no afecta tu uso del servicio</li>
            </ul>
            <p>Para ejercer cualquier derecho: <strong>privacy@bio.me</strong>. Respondemos dentro de 30 días.</p>

            <h2>7. Cookies</h2>
            <p>Usamos cookies esenciales (sesión, preferencia de idioma) sin requerir consentimiento explícito porque son necesarias para operar el servicio. Para analytics opcionales (PostHog), respetamos tu opt-out.</p>

            <h2>8. Menores de edad</h2>
            <p>bio.me NO está dirigido a menores de 18 años. Si descubrimos que un menor creó cuenta, la eliminamos inmediatamente. Si eres padre/madre y crees que tu hijo creó cuenta sin permiso, contacta privacy@bio.me.</p>

            <h2>9. Transferencias internacionales</h2>
            <p>bio.me opera con infraestructura en Estados Unidos (Vercel, Supabase). Si estás en EU/UK/Brasil, tus datos se transfieren a USA bajo cláusulas contractuales estándar (Standard Contractual Clauses) según aplique. <strong>[PENDIENTE — confirmar con attorney]</strong></p>

            <h2>10. Cambios a esta política</h2>
            <p>Cualquier cambio significativo se notifica por email con 14 días de anticipación.</p>

            <hr style={{ margin: '3em 0', border: 0, borderTop: '1px solid #1f2937' }} />
            <p className="text-xs text-gray-600 italic"><strong>NOTAS PARA EL ATTORNEY:</strong></p>
            <ul className="text-xs text-gray-600">
                <li>Validar cumplimiento GDPR (Article 13/14 — qué datos, base legal, transfers)</li>
                <li>Validar cumplimiento CCPA (California) si abrimos USA</li>
                <li>Validar LGPD (Brasil) si abrimos LATAM</li>
                <li>Standard Contractual Clauses para transfers EU → USA</li>
                <li>Definir Data Protection Officer (DPO) si aplica</li>
                <li>Revisar retención de datos vs requisitos fiscales (los 7 años pueden variar)</li>
                <li>Confirmar lista de subprocesadores (Supabase, Stripe, etc.) y SLA con cada uno</li>
            </ul>
        </>
    )
}

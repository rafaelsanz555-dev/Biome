export const metadata = { title: 'Términos de Servicio · bio.me [BORRADOR]' }

export default function TermsPage() {
    return (
        <>
            <h1>Términos de Servicio</h1>
            <p className="text-sm text-gray-500"><strong>BORRADOR — Pendiente de revisión legal</strong> · Versión: 0.1 · Última edición: abril 2026</p>

            <h2>1. Aceptación de los términos</h2>
            <p>Al acceder, registrarse o usar bio.me ("la Plataforma"), aceptas estos Términos de Servicio en su totalidad. Si no estás de acuerdo, no uses bio.me.</p>
            <p>bio.me es operado por Rafael Bernardo Sanz Espinoza ("nosotros", "bio.me"). Cualquier referencia a "nosotros" o "la Plataforma" se refiere a esta entidad.</p>

            <h2>2. Quién puede usar bio.me</h2>
            <ul>
                <li>Debes tener al menos <strong>18 años de edad</strong> o la mayoría de edad en tu jurisdicción, lo que sea mayor.</li>
                <li>Debes proveer información veraz al registrarte (email válido, nombre real opcional).</li>
                <li>Eres responsable de la seguridad de tu cuenta y de toda actividad bajo ella.</li>
                <li>No puedes usar bio.me si has sido previamente suspendido o si tu jurisdicción prohíbe el uso de plataformas similares.</li>
            </ul>

            <h2>3. Tipos de cuenta</h2>
            <p>bio.me ofrece dos tipos de cuenta:</p>
            <ul>
                <li><strong>Lector (reader):</strong> puede leer contenido público, suscribirse a creadores, enviar regalos, comentar, reaccionar.</li>
                <li><strong>Creador / Storyteller (creator):</strong> puede publicar episodios, recibir suscripciones, recibir regalos. Sujeto adicionalmente a los <a href="/legal/creator-terms">Creator Terms</a>.</li>
            </ul>

            <h2>4. Contenido del usuario</h2>
            <h3>4.1. Propiedad</h3>
            <p>Tú mantienes la propiedad intelectual de todo el contenido que publicas en bio.me ("Contenido del Usuario"). bio.me no reclama propiedad sobre tus historias, fotos, ni metadatos.</p>

            <h3>4.2. Licencia que nos otorgas</h3>
            <p>Al publicar contenido en bio.me, nos otorgas una licencia <strong>no exclusiva, mundial, sin regalías y revocable</strong> para alojar, almacenar, reproducir, mostrar, transmitir y distribuir tu Contenido del Usuario, exclusivamente con el propósito de operar la Plataforma. Esta licencia incluye:</p>
            <ul>
                <li>Mostrar tu contenido en tu perfil público</li>
                <li>Distribuirlo a tus suscriptores autorizados</li>
                <li>Crear previews y resúmenes para discovery</li>
                <li>Generar analytics agregadas</li>
            </ul>
            <p>La licencia termina automáticamente cuando borras el contenido o tu cuenta, salvo en lo que respecta a copias en respaldos legales o caches en distribución.</p>

            <h3>4.3. Tus garantías sobre el contenido</h3>
            <p>Al publicar declaras que: (a) eres el autor o tienes los derechos para publicarlo; (b) el contenido no infringe derechos de terceros (copyright, privacidad, marcas); (c) cumple con la <a href="/legal/content-policy">Política de Contenido</a>.</p>

            <h2>5. Conducta prohibida</h2>
            <p>NO puedes:</p>
            <ul>
                <li>Publicar contenido que viole la <a href="/legal/content-policy">Política de Contenido</a></li>
                <li>Hacerte pasar por otra persona o entidad</li>
                <li>Usar bio.me para spam, phishing o cualquier actividad fraudulenta</li>
                <li>Intentar acceder a cuentas de terceros o sistemas internos sin autorización</li>
                <li>Hacer scraping automatizado del contenido sin autorización escrita</li>
                <li>Revender, redistribuir o sublicenciar contenido de otros usuarios</li>
                <li>Manipular el sistema de detección de plagio o moderación</li>
            </ul>

            <h2>6. Suspensión y terminación</h2>
            <h3>6.1. Por parte de bio.me</h3>
            <p>Podemos suspender o terminar tu cuenta, con o sin notificación previa, si:</p>
            <ul>
                <li>Violas estos Términos o cualquier política aplicable</li>
                <li>Tu actividad pone en riesgo a otros usuarios o a la Plataforma</li>
                <li>Recibimos solicitud legítima de autoridades competentes</li>
                <li>Detectamos fraude en pagos o suscripciones</li>
            </ul>
            <p>Si la suspensión es por moderación, te notificaremos la razón y ofreceremos derecho de apelación dentro de 14 días (ver Política de Contenido).</p>

            <h3>6.2. Por parte del usuario</h3>
            <p>Puedes cerrar tu cuenta en cualquier momento desde Ajustes. El cierre:</p>
            <ul>
                <li>Elimina tu perfil público y contenido publicado</li>
                <li>Cancela suscripciones activas (sin reembolso de períodos en curso)</li>
                <li>Mantiene transacciones financieras en archivo durante el período legal requerido</li>
            </ul>

            <h2>7. Pagos y monetización</h2>
            <p>bio.me usa Stripe Connect para procesar pagos. Los detalles del modelo de monetización están en los <a href="/legal/creator-terms">Creator Terms</a>. En resumen:</p>
            <ul>
                <li>Los lectores pagan a los escritores directamente vía Stripe</li>
                <li>bio.me retiene una comisión del 12% sobre cada transacción</li>
                <li>Stripe aplica sus propios fees (~2.9% + $0.30 por transacción)</li>
                <li>Durante el Founding Storyteller Program (primeros 300-500 escritores), no se cobra fee fijo mensual</li>
            </ul>

            <h2>8. Propiedad de bio.me</h2>
            <p>El nombre "bio.me", el logo, el código fuente, el diseño, las marcas y todo lo relacionado con la Plataforma es propiedad de Rafael Bernardo Sanz Espinoza. No puedes copiar, modificar, distribuir ni hacer ingeniería inversa sin permiso escrito.</p>

            <h2>9. Limitación de responsabilidad</h2>
            <h3>9.1. bio.me NO certifica veracidad de las historias</h3>
            <p>bio.me es una plataforma. <strong>No verificamos la veracidad absoluta de las historias publicadas.</strong> Implementamos señales de confianza (verificación opcional de identidad, badges de constancia, detección de plagio) pero estas son indicativas, no garantías. Cada lector debe ejercer su propio criterio sobre el contenido.</p>

            <h3>9.2. Servicio "tal cual"</h3>
            <p>bio.me se ofrece "tal cual" y "según disponibilidad". No garantizamos:</p>
            <ul>
                <li>Disponibilidad ininterrumpida del servicio</li>
                <li>Que el contenido sea de tu agrado</li>
                <li>Que ganarás dinero como creador</li>
                <li>Que terceros no copien o usen indebidamente el contenido publicado</li>
            </ul>

            <h3>9.3. Limitación monetaria</h3>
            <p>En la máxima extensión permitida por la ley, la responsabilidad total de bio.me hacia ti por cualquier reclamación está limitada al monto que pagaste a la Plataforma en los últimos 12 meses (excluyendo pagos a escritores).</p>

            <h2>10. Indemnización</h2>
            <p>Aceptas indemnizar y mantener libre de daño a bio.me ante cualquier reclamación derivada de: (a) tu Contenido del Usuario; (b) tu violación de estos Términos; (c) tu violación de derechos de terceros.</p>

            <h2>11. Cambios a los Términos</h2>
            <p>Podemos actualizar estos Términos. Si los cambios son significativos, te notificaremos por email con al menos 14 días de anticipación. El uso continuado de la Plataforma tras los cambios implica aceptación.</p>

            <h2>12. Jurisdicción y ley aplicable</h2>
            <p><strong>[PENDIENTE — DEFINIR CON ATTORNEY]</strong> Probablemente: leyes de Florida, USA O Costa Rica, dependiendo de dónde se incorpore la entidad legal final. Disputas se resuelven primero por mediación antes que litigio.</p>

            <h2>13. Disposiciones varias</h2>
            <ul>
                <li>Si alguna cláusula es inválida, el resto sigue en vigor</li>
                <li>El no ejercicio de un derecho no implica renuncia a él</li>
                <li>Estos Términos constituyen el acuerdo completo entre tú y bio.me</li>
            </ul>

            <h2>14. Contacto</h2>
            <p>Para cualquier duda legal: <strong>legal@bio.me</strong> (pendiente de configurar)</p>

            <hr style={{ margin: '3em 0', border: 0, borderTop: '1px solid #1f2937' }} />
            <p className="text-xs text-gray-600 italic"><strong>NOTAS DEL AUTOR PARA EL ATTORNEY:</strong></p>
            <ul className="text-xs text-gray-600">
                <li>Definir entidad legal final (LLC en Delaware/Wyoming, o entidad latinoamericana)</li>
                <li>Definir jurisdicción y ley aplicable según entidad</li>
                <li>Revisar cumplimiento GDPR (Europa) y LGPD (Brasil) — si abrimos esos mercados</li>
                <li>Decidir si necesitamos Arbitration Clause</li>
                <li>Validar la limitación monetaria (varía por jurisdicción)</li>
                <li>Cláusulas DMCA si recibimos takedowns de USA</li>
                <li>Revisar nuestras obligaciones bajo Section 230 (USA) si aplica</li>
            </ul>
        </>
    )
}

export const metadata = { title: 'Política de Contenido · bio.me [BORRADOR]' }

export default function ContentPolicyPage() {
    return (
        <>
            <h1>Política de Contenido</h1>
            <p className="text-sm text-gray-500"><strong>BORRADOR — Pendiente de revisión legal</strong> · Versión: 0.1 · Última edición: abril 2026</p>

            <p>bio.me es una plataforma para narrativa personal auténtica. Esta política define qué contenido se permite, qué no se permite, cómo se modera y cómo se apelan las decisiones.</p>

            <h2>1. Filosofía editorial</h2>
            <p>bio.me cree en la libertad creativa <strong>con responsabilidad</strong>. Apoyamos historias difíciles, incómodas, profundas. No moralizamos. Pero hay límites concretos cuando el contenido daña a otros o viola la ley.</p>
            <p><strong>No certificamos que toda historia sea verdad absoluta</strong>, pero implementamos señales de confianza para que los lectores tengan contexto al evaluar cada perfil.</p>

            <h2>2. Contenido permitido</h2>
            <ul>
                <li><strong>Narrativa autobiográfica:</strong> tu historia, tu vida, tus experiencias</li>
                <li><strong>Memorias y crónicas:</strong> reflexiones sobre eventos vividos</li>
                <li><strong>Ensayos personales:</strong> reflexiones, opiniones, análisis desde experiencia propia</li>
                <li><strong>Ficción autobiográfica:</strong> historias inspiradas en tu vida con elementos novelados (etiquetadas como tal)</li>
                <li><strong>Temas difíciles tratados con propósito narrativo:</strong> trauma, duelo, adicción, abuso, salud mental, conflicto familiar</li>
                <li><strong>Lenguaje fuerte cuando sirve a la narrativa</strong></li>
                <li><strong>Crítica social, política, cultural</strong> desde experiencia personal</li>
            </ul>

            <h2>3. Contenido PROHIBIDO</h2>

            <h3>3.1. Contenido ilegal</h3>
            <ul>
                <li><strong>Material sexual de menores (CSAM):</strong> ban permanente + reporte inmediato a NCMEC y autoridades</li>
                <li>Promoción explícita de actividades ilegales (tráfico, terrorismo, etc.)</li>
                <li>Contenido que facilite acceso a sustancias controladas, armas, etc.</li>
            </ul>

            <h3>3.2. Daño a terceros</h3>
            <ul>
                <li><strong>Doxxing:</strong> publicar información privada de terceros sin consentimiento (direcciones, teléfonos, identidades reveladas sin autorización)</li>
                <li><strong>Acoso dirigido:</strong> ataques personales, amenazas, llamados a hostigar a una persona específica</li>
                <li><strong>Discurso de odio:</strong> ataques basados en raza, etnia, religión, género, orientación sexual, discapacidad</li>
                <li><strong>Suplantación de identidad:</strong> hacerte pasar por otra persona real</li>
            </ul>

            <h3>3.3. Contenido sexual</h3>
            <p>Permitido cuando:</p>
            <ul>
                <li>Es parte de una narrativa autobiográfica con propósito (no gratuito)</li>
                <li>Está etiquetado como "Contenido sensible" para que los lectores opten</li>
                <li>NO involucra menores en ningún contexto</li>
            </ul>
            <p>Prohibido cuando:</p>
            <ul>
                <li>Es pornografía explícita visual (imágenes/video)</li>
                <li>Es contenido sexual no consentido o no etiquetado</li>
            </ul>

            <h3>3.4. Plagio y copyright</h3>
            <ul>
                <li>Copiar contenido de otros sin atribución</li>
                <li>Reproducir letras de canciones completas</li>
                <li>Usar imágenes con copyright sin licencia</li>
                <li>Traducir obras protegidas sin permiso</li>
            </ul>
            <p>bio.me usa <strong>shingling interno (k=5)</strong> para detectar similitud entre episodios publicados en la plataforma. Si un episodio nuevo tiene más de 40% de similitud con uno existente, levantamos un flag automático para revisión.</p>

            <h3>3.5. Spam y manipulación</h3>
            <ul>
                <li>Publicaciones masivas idénticas o casi idénticas</li>
                <li>Esquemas de "follow-for-follow" o suscripciones cruzadas artificiales</li>
                <li>Crear cuentas falsas para inflar métricas</li>
                <li>Manipular el sistema de detección o moderación</li>
            </ul>

            <h3>3.6. Promoción de daño</h3>
            <ul>
                <li>Glorificación o instrucciones explícitas para suicidio, autolesión, trastornos alimenticios</li>
                <li>Contenido que celebre violencia hacia personas</li>
            </ul>
            <p>Sin embargo, <strong>relatar una experiencia personal</strong> con estos temas (ej: "viví una depresión", "salí de un trastorno alimenticio") <strong>SÍ está permitido</strong> y es valioso.</p>

            <h2>4. Sistema de moderación</h2>

            <h3>4.1. Detección automática</h3>
            <p>Cada episodio publicado pasa por:</p>
            <ul>
                <li><strong>Shingling interno:</strong> compara fragmentos de 5 palabras con todo bio.me. Detecta plagio entre creadores.</li>
                <li><strong>OpenAI Moderation API:</strong> detecta categorías de riesgo (autolesión, odio, contenido explícito, violencia).</li>
                <li><strong>Keyword matching:</strong> lista regulable de términos que requieren revisión humana.</li>
            </ul>
            <p><strong>Los flags automáticos NUNCA bloquean la publicación.</strong> Solo notifican al equipo de moderación para revisión.</p>

            <h3>4.2. Reportes de usuarios</h3>
            <p>Cualquier usuario puede reportar contenido o perfiles usando el botón "Reportar" con razones predefinidas (copyright, acoso, explícito, spam, otro). Todos los reportes se revisan en <strong>máximo 72 horas</strong>.</p>

            <h3>4.3. Decisiones de moderación</h3>
            <p>Posibles acciones:</p>
            <ul>
                <li><strong>Sin acción:</strong> el reporte no se sostiene</li>
                <li><strong>Etiquetado:</strong> agregar etiqueta "Contenido sensible" requiere consentimiento explícito del lector</li>
                <li><strong>Despublicación:</strong> el episodio queda como borrador, el creador puede editarlo y republicar</li>
                <li><strong>Eliminación:</strong> el contenido se borra permanentemente</li>
                <li><strong>Suspensión temporal de cuenta:</strong> 7-30 días</li>
                <li><strong>Ban permanente:</strong> casos graves o reincidencia</li>
            </ul>

            <h2>5. Apelaciones</h2>
            <p>Si tu contenido fue removido o tu cuenta suspendida:</p>
            <ul>
                <li>Recibirás email con la razón específica</li>
                <li>Tienes <strong>14 días</strong> para apelar respondiendo al email</li>
                <li>Una persona distinta de la que tomó la decisión inicial revisa la apelación</li>
                <li>Te respondemos dentro de 7 días con decisión final</li>
            </ul>

            <h2>6. DMCA y copyright takedowns</h2>
            <p>Si crees que contenido en bio.me viola tu copyright, envía notificación DMCA a <strong>dmca@bio.me</strong> incluyendo:</p>
            <ul>
                <li>Identificación del trabajo protegido</li>
                <li>URL del contenido infractor en bio.me</li>
                <li>Tus datos de contacto</li>
                <li>Declaración de buena fe</li>
                <li>Firma física o electrónica</li>
            </ul>
            <p>Procesamos takedowns válidos en máximo 5 días hábiles.</p>

            <h2>7. Transparencia</h2>
            <p>Anualmente publicamos un reporte de transparencia con: número de reportes, decisiones tomadas, takedowns DMCA, solicitudes legales recibidas. Sin datos personales identificables.</p>

            <hr style={{ margin: '3em 0', border: 0, borderTop: '1px solid #1f2937' }} />
            <p className="text-xs text-gray-600 italic"><strong>NOTAS PARA EL ATTORNEY:</strong></p>
            <ul className="text-xs text-gray-600">
                <li>Confirmar cumplimiento Section 230 (USA) — safe harbor para UGC</li>
                <li>Definir CSAM reporting flow (NCMEC en USA, CYBERTIPLINE)</li>
                <li>DMCA: validar formato del takedown, contar nuestras counter-notifications</li>
                <li>Revisar Digital Services Act (Europa) — transparencia y procedimientos</li>
                <li>Política sobre AI-generated content: ¿permitimos? ¿requerimos disclosure?</li>
                <li>Cláusulas de menores expuestos en historias autobiográficas (un autor adulto contando sobre su infancia menciona a otros menores reales)</li>
            </ul>
        </>
    )
}

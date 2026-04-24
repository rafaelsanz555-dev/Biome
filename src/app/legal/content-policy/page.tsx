export const metadata = { title: 'Política de contenido · bio.me' }

export default function ContentPolicyPage() {
    return (
        <>
            <h1>Política de contenido</h1>
            <p className="text-sm text-gray-500">Última actualización: abril 2026</p>

            <p>bio.me es una plataforma para narrativa personal auténtica. Creemos en la libertad creativa con responsabilidad.</p>

            <h2>Contenido permitido</h2>
            <ul>
                <li>Historias personales, memorias, ensayos autobiográficos.</li>
                <li>Ficción basada en experiencias reales.</li>
                <li>Temas difíciles tratados con propósito narrativo (duelo, trauma, adicción).</li>
            </ul>

            <h2>Contenido prohibido</h2>
            <ul>
                <li><strong>Plagio:</strong> contenido copiado de otras fuentes sin atribución.</li>
                <li><strong>Contenido explícito sin etiquetar:</strong> descripción gráfica sexual o violenta sin warning.</li>
                <li><strong>Incitación al daño:</strong> glorificación de suicidio, autolesión, odio racial o de género.</li>
                <li><strong>Doxxing:</strong> publicar información privada de terceros sin consentimiento.</li>
                <li><strong>Contenido de menores:</strong> cualquier material sexual que involucre menores resulta en ban permanente y reporte a autoridades.</li>
            </ul>

            <h2>Detección automática</h2>
            <p>Usamos detección de similitud interna (shingling k=5) para identificar posibles plagios, y la API de moderación de OpenAI para contenido de riesgo. Los flags automáticos <strong>nunca bloquean</strong> una publicación — solo la marcan para revisión humana.</p>

            <h2>Apelaciones</h2>
            <p>Si tu contenido fue removido y crees que fue un error, responde al email de notificación dentro de 14 días. Revisamos cada apelación individualmente.</p>

            <h2>Reportes</h2>
            <p>Cualquier usuario puede reportar contenido usando el botón "Reportar" en episodios y perfiles. Todos los reportes son revisados en un máximo de 72 horas.</p>
        </>
    )
}

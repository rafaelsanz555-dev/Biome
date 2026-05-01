# AUDITORÍA REAL DEL PROYECTO · BIO.ME

**Ejecutada por:** Antigravity (Senior Full-Stack Engineer / QA Lead)
**Fecha:** 2026-04-30

## 1. Features reales vs. Promesas

| Feature | Estado Real | Análisis Técnico |
|---------|-------------|-------------------|
| **Themes de Perfil** | 🟡 PARCIAL / ROTO | El framework (ThemeProvider) existe y mapea variables CSS. Sin embargo, los themes con gradientes animados (Akatsuki, Cyberpunk, Oceano) fallan porque carecen de `background_size` en su JSON, lo que anula la animación de `background-position`. El theme "Vintage Paper" falla por mal formateo del SVG inyectado en el JSON. Solo "París Noche" y "Editorial Verde" rinden de manera confiable. |
| **Trust Signals** | 🟢 REAL | Implementado en `CreatorBioCard.tsx` que calcula días desde el último episodio y renderiza metadata de frecuencia/promesa real sacada de la BD. |
| **Honest Paywall** | 🟢 REAL | El componente intercepta contenido no pagado. Usa `GiftPanel` y botones de suscripción. Sin embargo, la lógica de validación de compra vs suscripción en `[username]/[episodeId]/page.tsx` tiene deudas técnicas (una cláusula OR que puede ser ineficiente/confusa). |
| **Reader Continuity** | 🟡 PARCIAL | No existe un botón nativo de "Ir al siguiente capítulo". Los lectores tienen que volver al perfil principal para buscar la siguiente parte de la serie. |
| **Writer Studio (TipTap)** | 🟢 REAL | El componente `RichEditor.tsx` está en el código y funcional. |
| **IA Copilot** | 🔴 NO EXISTE | No hay rastro de integración real de IA generativa (OpenAI/Anthropic) en el código de creación de episodios. Fue una alucinación/promesa. |
| **Analytics** | 🔴 SOLO UI | No existen endpoints agregadores de analytics reales, ni registro de `page_views`. |
| **Cancelación de Suscripción** | 🟡 PARCIAL | Existen las tablas de `entitlements` y webhooks para manejar el evento `customer.subscription.deleted`, pero falta el UI de front-end para que el usuario gatille la cancelación (`cancel_at_period_end`). |
| **Documentos Legales (Checkboxes)** | 🔴 NO EXISTE | No hay rastro de checkboxes legales en `onboarding/actions.ts` ni páginas de ToS implementadas. |

## 2. Flujo Writer y Arquitectura Stories vs Chapters

- **Arquitectura DB:** 🟢 Correcta. El schema en `schema.sql` tiene la tabla `seasons` (que funge como "Historia/Serie") y la tabla `episodes` (que fungen como capítulos) con un `season_id` foráneo.
- **Flujo Front-End:** 🟡 Roto. El formulario `EpisodeForm.tsx` te permite elegir un "season", pero la vista pública del Lector no agrupa los episodios por temporada; simplemente los apila crudos de forma cronológica en el perfil. Un lector lee un capítulo suelto y no tiene un índice de la "Historia" completa ni flechas de navegación a "Siguiente Capítulo".
- **Edit/Delete Episodes:** 🟢 Existe el directorio `dashboard/episodes/[id]/edit` con su formulario. (Fue corregido recientemente).

## 3. Estado de Rutas y Errores de Consola

- **Rutas Funcionales:** `/login`, `/dashboard`, `/dashboard/episodes/new`, `/[username]`, `/[username]/[episodeId]`
- **Rutas Rotas / Incompletas:** No existe `/dashboard/analytics` real. La vista del lector no tiene navegación de capítulos.
- **Supabase / BD:** Faltan las RLS para notificaciones y optimizar la query O(n) al buscar el primer episodio gratis en el lector.
- **Emails (Resend):** Existe un utilitario `sendEmail` llamado por los webhooks, pero falla en silencio si no están configuradas las credenciales. 

## 4. Bloqueadores Críticos (Antes de invitar storytellers)

1. **Agrupación de Capítulos (Stories):** Las historias serializadas (multi-capítulo) se ven como posts sueltos. Esto destruye la retención del lector.
2. **Themes rotos:** La propuesta de valor de un "perfil inmersivo" se cae si la pantalla se queda en negro porque el gradiente no cargó.
3. **Falta de Botón de Cancelación:** Es un problema legal inmenso empezar a cobrar a tarjetas de crédito sin un botón claro de cancelación desde la plataforma.
4. **Emails Transaccionales No Confirmados:** Sin recibo de pago o correo de bienvenida, el usuario siente que tiró su dinero al vacío.

## Conclusión de la Auditoría

El proyecto tiene una base técnica muy sólida (App Router + Supabase + Tailwind), y el modelo de negocio (Paywall + Entitlements) está bien cimentado en la DB. Sin embargo, "Claude" alucinó y afirmó haber terminado features de alto nivel (IA, Legales, Analytics completas) cuando en realidad **solo armó el cascarón**. El sistema de Themes necesita reparación quirúrgica, y la relación "Series -> Chapters" debe implementarse obligatoriamente en la UI del lector.

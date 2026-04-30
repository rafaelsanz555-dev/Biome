# Auditoría exhaustiva del flujo writer-reader · bio.me

**Fecha:** 2026-04-28
**Alcance:** simular un storyteller real desde landing hasta publicar primer episodio + lectura del lector + paywall + cancelación
**Método:** lectura completa del código + tests directos con la app en `localhost:8000`

---

## 🟢 Lo que funciona perfecto

| # | Subsistema | Archivo clave |
|---|---|---|
| 1.1 | Landing → CTA | `src/app/page.tsx:49-52` — botón "Empieza gratis" va a `/login`, mensaje claro |
| 1.2 | Signup/Login dual | `src/app/(auth)/login/page.tsx` — tabs, validación cliente, errores descriptivos |
| 1.4 | Login redirect inteligente | `src/app/auth/actions.ts:17-41` — chequea profile → dashboard vs /discover |
| 1.5 | Onboarding | `(auth)/onboarding/actions.ts:48-49` — manejo de username duplicado correcto |
| 1.6 | Settings | `dashboard/settings/page.tsx:31-38` — self-healing si creator row falta |
| 1.7 | Editor TipTap | `components/editor/RichEditor.tsx` — toolbar completa, stats live |
| 1.8 | Perfil público | `app/[username]/page.tsx` — query con joins eficientes, trust signals visibles |
| 1.9 | Reading + paywall | `app/[username]/[episodeId]/page.tsx` — lógica de acceso correcta, HonestPaywall renderiza |
| 1.13 | Logout | `components/UserMenu.tsx` + `auth/actions.ts:77-82` — limpia sesión y redirige |

---

## 🟡 Lo que funciona pero necesita pulido

### #1 — Validación username case mismatch
- **Archivo:** `(auth)/onboarding/page.tsx:69` (cliente) vs `actions.ts:14,21` (server)
- **Problema:** cliente acepta mayúsculas con `pattern="[a-zA-Z0-9_]+"`. Server hace `.toLowerCase()` antes de validar.
- **Síntoma:** usuario escribe "MyName", se guarda como "myname". Confusión sobre cuál es su username real cuando comparte.
- **Fix:** lowercase también en `onChange` del input cliente.

### #2 — Avatar upload sin validación de tipo/tamaño real
- **Archivo:** `dashboard/settings/SettingsForm.tsx:33-46`
- **Problema:** `accept="image/*"` solo es hint visual. Server action recibe el File sin validar size/type.
- **Síntoma:** alguien sube un .webp de 50MB, satura storage.
- **Fix:** validar `file.size < 2 * 1024 * 1024` y `file.type.startsWith('image/')` antes de subir + en server action.

### #3 — Tonalidad CTA primer episodio contradictoria
- **Archivo:** `dashboard/episodes/new/EpisodeForm.tsx:410` y `352-384`
- **Problema:** texto dice "Tu primer capítulo siempre es gratis", pero el form permite seleccionar `monetization = subscription/ppv`.
- **Síntoma:** usuario confundido sobre si su primer episodio será gratis o no.
- **Fix:** detectar si es el primer episodio (query: `count = 0` para ese creator), forzar monetization='free' y deshabilitar otras opciones con tooltip.

### #4 — Identity/Trust forms no muestran error por campo
- **Archivo:** `dashboard/settings/IdentityForm.tsx:128-170`
- **Problema:** errores solo se muestran en banner global. Si invalid URL → error genérico.
- **Fix:** retornar `{ field: 'website_url', error: 'URL inválida' }` desde server action y mostrar al lado del input.

### #5 — Stripe Publishable Key vacío
- **Archivo:** `.env.local:9`
- **Problema:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` está vacío. Hoy no rompe nada (usamos redirect a Stripe Checkout), pero impide agregar Stripe Elements después (ej: saved cards).
- **Fix:** poblar para tener el setup completo.

### #6 — Cover image upload del episodio sin filtro
- **Archivo:** `dashboard/episodes/new/EpisodeForm.tsx:79-80`
- **Problema:** toma `file.name.split('.').pop()` para extension sin filtrar tipos.
- **Fix:** mismo que avatar — validar size + type.

### #7 — Email confirmation NO está documentado
- **Archivo:** `auth/actions.ts:69-72` comentario "shouldn't happen with confirm OFF"
- **Problema:** Supabase está en mode auto-confirm. Si admin cambia a require_email_confirmation, el flujo se rompe sin warning.
- **Fix:** Fase 2 lo arregla (sistema de emails propio + confirmation explícita).

---

## 🔴 Lo que está roto o falta

### #1 BLOQUEADOR CRÍTICO — SUPABASE_SERVICE_ROLE_KEY vacío rompe Stripe webhooks
- **Archivo:** `.env.local:4` + `app/api/webhooks/stripe/route.ts:9-13`
- **Síntoma:** lector paga por suscripción → Stripe completa el pago → webhook llega → la creación del entitlement **falla silenciosamente** porque el cliente admin no se inicializa correctamente.
- **Resultado:** **lector pagó pero NO tiene acceso al contenido**. No hay error visible al usuario.
- **Fix urgente:** poblar `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` Y en Vercel.

### #2 BLOQUEADOR CRÍTICO — No se pueden EDITAR episodios publicados
- **Archivo:** `dashboard/episodes/page.tsx:93` muestra link "Editar" pero está deshabilitado
- **Síntoma:** storyteller publica con un typo en el título, no puede arreglarlo. Debe borrar + reescribir todo.
- **Falta:** ruta `/dashboard/episodes/[id]/edit` con form precargado + server action `updateEpisode`.

### #3 BLOQUEADOR CRÍTICO — No hay UI para cancelar suscripción
- **Archivo:** `dashboard/subscriptions/page.tsx`
- **Síntoma:** lector se suscribe, después no encuentra cómo cancelar. Compliance issue (GDPR).
- **Falta:**
  - Botón "Cancelar suscripción" en `/dashboard/subscriptions`
  - Server action que llame a Stripe `subscriptions.update({cancel_at_period_end: true})`
  - Webhook handler para `customer.subscription.deleted`
  - UI confirmation modal

### #4 BUG — First-episode check es O(n) en cada lectura
- **Archivo:** `app/[username]/[episodeId]/page.tsx:96-104`
- **Síntoma:** la query trae TODOS los episodios para encontrar el primero. Con 500 episodios, cada visita hace fetch de 500 rows.
- **Fix:** `select('id').eq('creator_id', X).eq('is_published', true).order('created_at').limit(1)` — solo trae 1.

### #5 BUG — Validación entitlements con OR ambigua
- **Archivo:** `app/[username]/[episodeId]/page.tsx:87`
- **Problema:** la query OR puede traer ppv O subscription, pero el orden no está garantizado.
- **Fix:** dos queries separadas en orden: primero ppv del episodio, después subscription al creator.

### #6 BUG — Episode validation muy débil
- **Archivo:** `dashboard/episodes/actions.ts:67-71`
- **Problema:** `editorText.trim().length < 10` permite "aa bb cc dd" (spam de 10 chars).
- **Fix:** validar mínimo de palabras (ej: 50) y caracteres (200+).

### #7 BUG — Negative ppv_price no validado
- **Archivo:** `app/api/checkout/route.ts:47-48`
- **Problema:** usa `episode.ppv_price` directo sin rango.
- **Fix:** `if (episode.ppv_price < 0.99 || episode.ppv_price > 999.99) return error`.

### #8 BUG — Gift webhook sin verificación de identidad
- **Archivo:** `api/webhooks/stripe/route.ts:96-119`
- **Problema:** confía en `metadata.recipientId` sin verificar que coincide con el receptor real.
- **Fix:** validar que `recipientId` coincide con un creator real Y que el monto es > 0.

---

## 🚨 Bloqueadores que impiden que un storyteller real use bio.me sin ayuda

1. **Pago sin acceso** (SERVICE_ROLE_KEY) — un lector paga, no recibe acceso, no hay forma de arreglar sin nuestro contacto manual
2. **Editar imposible** — un creator NO puede arreglar un typo después de publicar
3. **Cancelar imposible** — un lector se queda pagando para siempre o tiene que pelear con su banco
4. **Username confuso** — usuario escribe "Maria" y se guarda como "maria" sin avisar
5. **Sin emails de bienvenida ni confirmación** — la primera comunicación que recibe el usuario es genérica de Supabase, sin marca

---

## 📊 Resumen

- **Total puntos auditados:** 13 + 10 fricciones extra
- **✓ Funcionan limpio:** 9 subsistemas
- **⚠ Pulir:** 7 puntos de fricción
- **✗ Rotos / críticos:** 8 bugs (3 bloqueadores, 5 graves)

### Riesgo si invitamos storytellers reales HOY

| Riesgo | Probabilidad | Severidad |
|---|---|---|
| Pago + sin acceso | 100% (todos los pagos fallan) | CRÍTICA — pérdida de confianza inmediata |
| No poder editar | ~80% | ALTA — frustración garantizada |
| Email genérico de Supabase | 100% | MEDIA — primera impresión floja |
| No poder cancelar | ~50% (cuando intenten cancelar) | ALTA — compliance |
| Username case mismatch | ~30% | MEDIA — confusión en sharing |

**Veredicto:** NO invitar storytellers reales hasta arreglar los 3 bloqueadores HIGH y poner los emails transaccionales.

---

## 🎯 Plan de fix recomendado (orden estricto)

### Sprint 1 — Bloqueadores HIGH (este sprint)
1. Poblar `SUPABASE_SERVICE_ROLE_KEY` en local + Vercel
2. Implementar edit episode (`/dashboard/episodes/[id]/edit`)
3. Implementar cancelación de suscripción (UI + server action + webhook)

### Sprint 2 — Pulido y validaciones
4. Username lowercase en cliente
5. Validación size+type en avatar y cover
6. Validación min words/chars en episode publish
7. ppv_price range check en checkout
8. Performance fix: first-episode con LIMIT 1

### Sprint 3 — Emails transaccionales (Fase 2 del prompt)
9. Resend integration
10. 10 plantillas HTML con marca cobalt
11. Hook a Supabase Auth events + Stripe webhooks

### Sprint 4 — Legal base (Fase 3 del prompt)
12. 4 borradores legales completos
13. UI de aceptación en onboarding
14. Pasar a attorney de Casiani

Después de eso (no antes): invitar 1-2 storytellers reales para test interno.

# QA Manual Checklist · bio.me (Flujo Estabilizado)

Usa este checklist con un usuario de prueba (creador) y un usuario de incógnito (lector) para validar la cirugía técnica recién aplicada.

### 1. Preparación de la Prueba
- [ ] Entra a tu proyecto local (`npm run dev -p 8000`).
- [ ] Inicia sesión con un usuario de prueba.
- [ ] Ejecuta el script SQL `015_fix_themes_and_add_new.sql` en el SQL Editor de tu Dashboard de Supabase.

### 2. Validación de Themes (Escritor)
- [ ] Ve a `Settings -> Diseño`.
- [ ] Cambia tu theme a uno de los arreglados (**Akatsuki**, **Océano** o **Cyberpunk**). Verifica que la previsualización tenga animación (movimiento o respiro).
- [ ] Cambia tu theme a **Vintage Paper**. Verifica que el SVG no se rompa y tenga la textura de grano/papel.
- [ ] Prueba uno de los 4 nuevos themes premium (**Midnight Memoir**, **Golden Journal**, **Rain Letters**, **Scarlet Confession**) y verifica que los colores se apliquen.

### 3. Validación de Flujo Storyteller (Agrupación de Series)
- [ ] Ve a `Dashboard -> Publicaciones`.
- [ ] Crea una **Nueva Historia (Season)** llamada "Crónicas del Silencio" con una breve descripción.
- [ ] Publica **Episodio 1** asociado a "Crónicas del Silencio".
- [ ] Publica **Episodio 2** asociado a "Crónicas del Silencio".
- [ ] Publica un **Episodio Suelto** (sin asociar a ninguna historia).

### 4. Validación Vista Pública (Lector)
- [ ] Abre una pestaña en modo Incógnito (sin sesión) e ingresa al perfil del creador (`/username`).
- [ ] **Expectativa 1:** El theme seleccionado se aplica correctamente y se ve impecable (colores, fuentes, animaciones).
- [ ] **Expectativa 2:** Debes ver una gran sección/tarjeta llamada "Crónicas del Silencio" con su descripción.
- [ ] **Expectativa 3:** Dentro de esa tarjeta, deben estar únicamente el Episodio 2 y el Episodio 1, con la etiqueta "Capítulo 1" y "Capítulo 2".
- [ ] **Expectativa 4:** Debes ver una sección aparte llamada "Publicaciones Sueltas" con el episodio independiente.

### 5. Validación de Continuidad (Lector)
- [ ] Haz clic en el **Episodio 1** de "Crónicas del Silencio".
- [ ] Ve hasta el final del artículo.
- [ ] **Expectativa 1:** Debes ver un botón/panel grande a la derecha diciendo "Siguiente" apuntando al Episodio 2. El panel "Anterior" no debe existir (porque es el primero).
- [ ] Haz clic en "Siguiente" para ir al Episodio 2.
- [ ] **Expectativa 2:** Al final del Episodio 2, debes ver un panel a la izquierda apuntando al Episodio 1 ("Anterior") y a la derecha un texto diciendo "Estás al día" (porque no hay episodio 3).
- [ ] Entra al Episodio Suelto.
- [ ] **Expectativa 3:** Al final de la lectura, el bloque de navegación debe decir "Estás al día" (no debe sugerir ir a un capítulo de "Crónicas del Silencio", respetando el aislamiento de historias).

### 6. Stripe & Entitlements (Pausado / Seguro)
- *Nota: Todo el flujo de pagos no fue modificado destructivamente. Cuando configures `STRIPE_SECRET_KEY` y `SUPABASE_SERVICE_ROLE_KEY` en tu `.env.local` y Vercel, los webhooks que detectamos en la auditoría comenzarán a despachar correctamente los pagos.*

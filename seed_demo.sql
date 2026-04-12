-- ============================================================
-- bio.me — Seed de Escritores Demo
-- Pega esto en Supabase SQL Editor → Run
-- ============================================================

DO $$
DECLARE
  u1 uuid := '11111111-0000-0000-0000-000000000001';
  u2 uuid := '22222222-0000-0000-0000-000000000002';
  u3 uuid := '33333333-0000-0000-0000-000000000003';
  u4 uuid := '44444444-0000-0000-0000-000000000004';
  u5 uuid := '55555555-0000-0000-0000-000000000005';
  u6 uuid := '66666666-0000-0000-0000-000000000006';
BEGIN

-- ── 1. Crear usuarios en auth.users ─────────────────────────────────────────

INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, recovery_token,
  email_change_token_new, email_change
) VALUES
  (u1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'maria@demo.biome.app', '', now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}',
   false, '', '', '', ''),
  (u2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'james@demo.biome.app', '', now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}',
   false, '', '', '', ''),
  (u3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'ana@demo.biome.app', '', now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}',
   false, '', '', '', ''),
  (u4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'lena@demo.biome.app', '', now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}',
   false, '', '', '', ''),
  (u5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'carlos@demo.biome.app', '', now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}',
   false, '', '', '', ''),
  (u6, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'sofia@demo.biome.app', '', now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}',
   false, '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- ── 2. Perfiles ─────────────────────────────────────────────────────────────

INSERT INTO profiles (id, username, full_name, bio, role) VALUES
  (u1, 'mariasantos', 'María Santos',
   'Salí de Venezuela con $200 y un sueño. Escribo sobre construir una nueva vida en Barcelona, un día a la vez. Migración, identidad, y lo que significa llamar "hogar" a un lugar que no te vio nacer.',
   'creator'),
  (u2, 'jamesokafor', 'James Okafor',
   'Diagnóstico de cáncer en estadio 3 a los 34 años. Documento todo: el miedo, el tratamiento, la esperanza, y lo que aprendí sobre lo que significa estar vivo. Sin filtros.',
   'creator'),
  (u3, 'anareyes', 'Ana Reyes',
   'Mamá soltera de 3, empecé un negocio a los 42 sin ahorros ni contactos. Comparto cada fracaso y cada victoria, sin filtros. Porque el emprendimiento real no se parece a Instagram.',
   'creator'),
  (u4, 'lenakim', 'Lena Kim',
   'Emigré de Seúl a los 19. Ahora escribo sobre identidad, pertenencia, y los espacios intermedios de vivir entre dos culturas. ¿Coreana o americana? Las dos. Ninguna. Las dos.',
   'creator'),
  (u5, 'carlosmendoza', 'Carlos Mendoza',
   'Divorciado a los 38, dos hijos, empezando de cero. Escribo sobre lo que nadie te dice de los nuevos comienzos: que son aterradores, liberadores, y absolutamente necesarios.',
   'creator'),
  (u6, 'sofiatorres', 'Sofía Torres',
   'Sobreviví una depresión que casi me cuesta todo. Ahora escribo para los que luchan en silencio, para que sepan que no están solos. Salud mental sin tabúes.',
   'creator')
ON CONFLICT (id) DO NOTHING;

-- ── 3. Registro en tabla creators ───────────────────────────────────────────

INSERT INTO creators (profile_id, subscription_price, is_active) VALUES
  (u1, 6.00, true),
  (u2, 8.00, true),
  (u3, 5.00, true),
  (u4, 7.00, true),
  (u5, 5.00, true),
  (u6, 6.00, true)
ON CONFLICT (profile_id) DO NOTHING;

-- ── 4. Episodios ─────────────────────────────────────────────────────────────

-- MARÍA SANTOS — Migración

INSERT INTO episodes (creator_id, title, preview_text, full_text, is_published, is_subscription_only, ppv_price, created_at) VALUES

(u1,
 'El día que dejé Caracas',
 'Era martes cuando empaqué todo lo que cabía en dos maletas. No lloré. Creo que ya había agotado las lágrimas semanas antes, cuando supe que no había vuelta atrás.',
 'Era martes cuando empaqué todo lo que cabía en dos maletas.

No lloré. Creo que ya había agotado las lágrimas semanas antes, cuando supe que no había vuelta atrás.

Mi mamá me ayudó a doblar la ropa. Ninguna hablaba. Había palabras que no queríamos decir en voz alta porque decirlas las haría reales. "Esto es un hasta luego" vs "esto es un adiós" — y las dos sabíamos que era lo segundo.

El taxi al aeropuerto olía a ambientador de pino. Recuerdo ese detalle con claridad absurda. Mientras Caracas pasaba por la ventana — las montañas, el caos, los colores que solo existen en esa ciudad — yo pensaba en el ambientador de pino.

En el avión, cuando despegamos, miré hacia abajo. Las luces de la ciudad se iban achicando. Sentí algo que hasta hoy no sé nombrar bien. No era tristeza exactamente. Era más como soltar algo muy pesado que cargabas tanto tiempo que ya no recordabas cómo era no cargarlo.

Llegué a Barcelona con $200, una dirección en un papel, y el número de una prima que no veía desde hacía ocho años.

Eso fue el principio.',
 true, false, null, now() - interval '30 days'),

(u1,
 'Mi primer trabajo en España: lo que nadie te cuenta',
 'Me contrataron de cajera en un supermercado. Tenía dos títulos universitarios y cinco años de experiencia en marketing. Pero aquí era "la venezolana" y eso pesaba más que cualquier CV.',
 'Contenido premium — suscríbete para leer.',
 true, true, null, now() - interval '20 days'),

(u1,
 'Cuando extrañas lo que dejaste',
 'La nostalgia no llega cuando ves fotos ni cuando escuchas canciones. Llega cuando hueles algo — un plato de comida, un perfume — y por un segundo tu cerebro cree que estás en casa.',
 'Contenido premium — suscríbete para leer.',
 true, true, null, now() - interval '10 days'),

-- JAMES OKAFOR — Supervivencia

(u2,
 'El diagnóstico',
 'El médico habló durante diez minutos. Yo escuché exactamente las primeras tres palabras: "James, es cáncer." El resto fue ruido blanco.',
 'El médico habló durante diez minutos.

Yo escuché exactamente las primeras tres palabras: "James, es cáncer."

El resto fue ruido blanco.

No es que no estuviera prestando atención. Mi cerebro simplemente tomó esas tres palabras y las puso en un loop, y mientras el doctor seguía hablando de estadios y protocolos y opciones de tratamiento, yo estaba atrapado en un bucle de "James, es cáncer. James, es cáncer. James, es cáncer."

Tenía 34 años. Corría 5 kilómetros tres veces por semana. Comía bastante sano. No fumaba. Era el tipo de persona que jamás esperaría escuchar esas palabras.

Nadie espera escuchar esas palabras.

Salí de la consulta y me senté en mi coche durante cuarenta minutos sin arrancar. No llamé a nadie. No lloré. Solo me quedé sentado viendo el tablero del coche, pensando en que esa mañana había tenido la preocupación más grande de que se me iba a enfriar el café.

El café ya no importaba.',
 true, false, null, now() - interval '25 days'),

(u2,
 'Semana 1 de quimioterapia: la verdad',
 'Todo el mundo me dijo "vas a estar bien." Nadie me dijo qué se siente realmente. Esto es lo que nadie te cuenta sobre la primera semana.',
 'Contenido premium — suscríbete para leer.',
 true, true, null, now() - interval '15 days'),

(u2,
 'Lo que el cáncer me enseñó que no podría haber aprendido de otra forma',
 'No voy a romantizarlo. El cáncer fue la peor experiencia de mi vida. Pero también fue la más honesta.',
 'Contenido premium — suscríbete para leer.',
 true, true, null, now() - interval '5 days'),

-- ANA REYES — Negocios / Maternidad

(u3,
 'Por qué renuncié a mi trabajo seguro a los 42',
 'Todo el mundo pensó que estaba loca. Trabajo estable, buenos beneficios, seguro médico — y lo dejé todo para empezar algo que no existía todavía. Aquí está el por qué.',
 'Todo el mundo pensó que estaba loca.

Trabajo estable, sueldo decente, seguro médico para mis tres hijos — y lo dejé todo para empezar algo que no existía todavía.

Mi mamá no me habló por dos semanas. Mi ex-esposo me mandó un mensaje que decía "¿estás bien?" con ese tono de "claramente no estás bien." Mis amigas me decían "qué valiente" pero en sus ojos leía "qué irresponsable."

Tenía 42 años, tres hijos, y $3,400 en ahorros. No exactamente el capital inicial de sueños.

¿Por qué lo hice? Porque un martes por la mañana, manejando al trabajo, me di cuenta de que llevaba ocho años haciendo exactamente lo mismo. Ocho años de reuniones sobre las reuniones, de proyectos que no llegaban a nada, de fingir que me importaba el "plan estratégico Q3."

Ocho años de construirle el sueño a alguien más mientras el mío se oxidaba.

Ese martes, en lugar de entrar al estacionamiento de la oficina, seguí derecho.

No llegué a trabajar ese día.

En cambio, fui a una cafetería, pedí el café más grande del menú, y empecé a escribir. No un plan de negocios sofisticado. Solo: qué sé hacer, qué necesita el mundo, qué podría yo ofrecer que valga dinero.

Tres horas después, tenía el borrador de lo que se convertiría en mi empresa.',
 true, false, null, now() - interval '22 days'),

(u3,
 'El primer cliente: cómo conseguí mi primera venta siendo nadie',
 'Sin seguidores, sin reputación, sin LinkedIn inflado. Así conseguí mi primer cliente pagando — y lo que aprendí del proceso.',
 'Contenido premium — suscríbete para leer.',
 true, true, null, now() - interval '12 days'),

(u3,
 'Cuando quise rendirme (y por qué no lo hice)',
 'Hubo un mes donde no entró ni un peso. Mis hijos me preguntaban si íbamos a tener que mudarnos. Aquí está la historia completa.',
 'Contenido premium — suscríbete para leer.',
 true, true, null, now() - interval '2 days'),

-- LENA KIM — Migración / Identidad

(u4,
 'Mi primer año en América: 12 meses de confusión',
 'Vine a estudiar con una beca. Pensé que sería difícil por el idioma. El idioma era la parte fácil.',
 'Vine a América con una beca universitaria y la certeza de que el inglés era mi problema más grande.

El inglés resultó ser la parte más fácil.

Nadie te prepara para la sensación de ser invisible. No invisible de forma cruel — la gente era amable, incluso demasiado amable a veces, con esa amabilidad americana que suena genuina pero que crea distancia. "Oh, ¿eres de Corea? ¡Me ENCANTA el K-pop!" Y yo sonrío y asiento, aunque yo no escucho K-pop, aunque crecí escuchando lo mismo que ellos, aunque soy mucho más americana de lo que esperan.

Pero tampoco soy completamente coreana. Cuando vuelvo a Seúl, noto que algo no encaja. Hablo el idioma pero hay referencias que me pierdo, actitudes que no comparto, una manera de ser que ya no es del todo mía.

Hay una palabra en coreano — 눈치 (nunchi) — que no tiene traducción exacta al inglés. Es como la habilidad de leer la situación, de sentir lo que otros esperan de ti sin que lo digan. En Corea, soy muy mala en nunchi. En América, soy demasiado buena.

Ese primer año en América lo pasé buscando en cuál de los dos mundos cabía.

La respuesta, eventualmente, fue: en los dos. Y en ninguno. Y eso, después de mucho tiempo, aprendí a llamarlo hogar.',
 true, false, null, now() - interval '28 days'),

(u4,
 '¿Coreana o americana? La pregunta que odio y la respuesta honesta',
 'Me lo preguntan en los dos países. La respuesta larga que nunca doy en voz alta.',
 'Contenido premium — suscríbete para leer.',
 true, true, null, now() - interval '18 days'),

(u4,
 'Llamando a casa: lo que digo y lo que no digo',
 'Hablo con mi mamá todos los domingos. Siempre le digo que estoy bien. Aquí está lo que realmente no le cuento.',
 'Contenido premium — suscríbete para leer.',
 true, true, null, now() - interval '8 days'),

-- CARLOS MENDOZA — Comenzar de Nuevo

(u5,
 'La noche que se rompió todo',
 'No fue una pelea grande. Fue una conversación muy tranquila, muy civilizada, que duró cuarenta minutos y al final de la cual los dos supimos que ya no había nada que salvar.',
 'No fue una pelea grande.

No hubo gritos, no hubo platos rotos, no hubo nadie que dijera cosas que no se puedan retirar. Fue una conversación muy tranquila, muy civilizada, que duró cuarenta minutos — yo recuerdo haberme dado cuenta de que eran exactamente cuarenta minutos porque miré el reloj cuando terminó — y al final de la cual los dos supimos que ya no había nada que salvar.

Nos miramos un momento.

"¿Qué hacemos ahora?" pregunté yo.

"No sé," dijo ella.

Y eso era todo. Dieciséis años. Dos hijos. Una hipoteca. Una historia. Y "no sé."

Los siguientes días fueron los más extraños de mi vida. Seguíamos viviendo en la misma casa porque ninguno sabía cómo logísticamente hacer otra cosa todavía. Comíamos en tiempos distintos. Evitábamos los mismos espacios. Era como vivir con un fantasma — o ser el fantasma.

Mis hijos tenían ocho y once años. El de once, Diego, me preguntó la tercera noche: "¿Se van a divorciar?"

Le dije que sí.

Se quedó callado un momento y luego dijo: "Okay." Y se fue a jugar videojuegos.

No sé qué esperaba. Creo que esperaba que llorara. Su "okay" me dolió más que cualquier pelea que pude haber imaginado.',
 true, false, null, now() - interval '35 days'),

(u5,
 'Aprendiendo a cocinar solo a los 38 años',
 'Siempre pensé que sabía cocinar. Resulta que sabía calentar cosas. La diferencia la aprendí de la peor manera.',
 'Contenido premium — suscríbete para leer.',
 true, true, null, now() - interval '25 days'),

(u5,
 'La primera vez que sonreí de verdad después del divorcio',
 'Fueron nueve meses. No es que no sonriera en ese tiempo — sonreía todo el tiempo, para los niños, para el trabajo. Pero la primera sonrisa real tardó nueve meses.',
 'Contenido premium — suscríbete para leer.',
 true, true, null, now() - interval '15 days'),

-- SOFÍA TORRES — Supervivencia / Salud Mental

(u6,
 'El año que desaparecí',
 'No es una metáfora. Un día dejé de contestar mensajes. Luego dejé de salir. Luego dejé de hacer casi todo. Esto es lo que pasó realmente ese año.',
 'No es una metáfora.

Un día dejé de contestar mensajes. Al principio pensé que era cansancio — tenía razones para estar cansada, el trabajo estaba difícil, mi relación estaba en un momento complicado, había dormido mal varias semanas seguidas. "Cuando descanse, vuelvo a ser yo," me dije.

Luego dejé de salir, excepto al trabajo. Luego empecé a llegar tarde al trabajo. Luego falté días. Luego dejé el trabajo.

Nadie lo vio venir porque yo era muy buena ocultándolo. Tenía una cara para el mundo — sonriente, funcional, "estoy bien, solo un poco cansada" — y una cara para cuando estaba sola que no le hubiera mostrado a nadie.

Lo que nadie te dice sobre la depresión severa es que no se parece a lo que muestran en las películas. No es llorar todo el día. A veces es no sentir nada. Es estar sentada frente a un plato de comida que te gusta y no poder comer porque el mecanismo que convierte el hambre en ganas de hacer algo está roto. Es querer dormir no porque estés cansada sino porque mientras duermes no tienes que estar presente.

El año que "desaparecí" casi no lo cuento.

Pero alguien tiene que contarlo, porque la persona que fui ese año necesitaba saber que había otro lado.',
 true, false, null, now() - interval '40 days'),

(u6,
 'Terapia: todo lo que nadie te cuenta antes de empezar',
 'Empecé terapia creyendo que en tres sesiones me iban a "arreglar." No fue así. Esto es lo que realmente pasa en terapia.',
 'Contenido premium — suscríbete para leer.',
 true, true, null, now() - interval '30 days'),

(u6,
 'Cuando la luz regresó: cómo supe que estaba sanando',
 'No fue un momento dramático. Fue una tarde cualquiera, una taza de té, y darme cuenta de que por primera vez en meses quería que fuera mañana.',
 'Contenido premium — suscríbete para leer.',
 true, true, null, now() - interval '20 days');

END $$;

-- ── Verificación ──────────────────────────────────────────────────────────
SELECT p.username, p.full_name, c.subscription_price,
       COUNT(e.id) as episodios
FROM profiles p
JOIN creators c ON c.profile_id = p.id
LEFT JOIN episodes e ON e.creator_id = p.id
GROUP BY p.username, p.full_name, c.subscription_price
ORDER BY p.username;

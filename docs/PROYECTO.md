# multas-app — brief para el agente

Eres el desarrollador principal de este proyecto y lo vamos a construir juntos por fases. Este documento recoge decisiones ya tomadas: síguelas. Si algo no está definido, elige la opción más simple y dímelo. Si es una decisión de producto, pregúntame antes de seguir.

**Lo primero:** guarda este documento tal cual en `docs/PROYECTO.md`. Es la fuente de verdad del proyecto y en sesiones futuras te pediré que lo releas.

## Qué es

Una PWA para llevar las multas internas de equipos de fútbol amateur y de cualquier grupo con sistema de multas. Funciona así:

- Cada equipo tiene su catálogo de multas (llegar tarde, olvidar la equipación, tarjeta amarilla…).
- El tesorero pone las multas y todos ven cuánto debe cada uno.
- Se paga por Bizum o en efectivo fuera de la app.
- El dinero acumulado (el bote) se gasta en cenas o material.

La app solo lleva la cuenta: nunca mueve dinero.

Primero la usará mi equipo, pero es multi-equipo desde el día 1: la compartiré con otros equipos mediante un enlace.

Nombre provisional: «Multas» (repo `multas-app`).

## Stack (decidido)

- **Frontend:** Angular, última versión estable, sin SSR, con SCSS. Componentes standalone, signals y el control de flujo nuevo.
- **PWA:** `ng add @angular/pwa` (service worker y manifest).
- **Backend:** Supabase (Postgres + Auth + RLS), sin API propia. Angular habla con Supabase mediante `@supabase/supabase-js`. Si hace falta lógica de servidor con permisos elevados (por ejemplo, borrar una cuenta), se usan Edge Functions.
- **Base de datos como código:** Supabase CLI. Todo el esquema va en migraciones SQL versionadas en `supabase/migrations`, sin cambios a mano en el panel. Los tipos TypeScript se generan con `supabase gen types`.
- **UI:** componentes propios con SCSS y variables CSS como design tokens, apoyados en Angular CDK (dialog, overlay, a11y). Sin librerías de componentes pesadas.
- **Idioma:** euskera por defecto y castellano (`LOCALE_ID` `eu` o `es-ES` según el idioma elegido), con euros y fechas en el formato de cada idioma. Ver «Decisiones».
- **Hosting:** estático (Vercel, Netlify o Cloudflare) con fallback SPA a `index.html`. Se decide en la fase 5.

## Reglas de trabajo

- **Fases:** trabaja por fases (al final del documento). Al terminar cada una, dame un resumen de lo hecho, cómo probarlo, la lista de tareas manuales que me tocan (panel de Supabase, Google, etc.) y un mensaje de commit propuesto. Después para y espera mi OK.
- **Entorno:** comprueba qué tengo instalado (Node, npm, Angular CLI, Supabase CLI, Docker) y, si falta algo, dime cómo instalarlo.
- **Documentación:** si algo de este documento choca con la versión actual de Angular o Supabase, sigue la documentación oficial vigente y avísame. Si dudas de una API, consúltala en vez de suponer.
- **Nombres:** los del dominio van en español en BD y código (equipos, miembros, multas…), en snake_case en SQL.
- **Seguridad:** vive en la BD (RLS). Ocultar un botón no es un permiso.
- **Claves:** la clave secreta (secret/service_role) de Supabase nunca va al frontend ni al repo. La URL y la clave pública (publishable/anon) sí pueden ir en `environment.ts`, porque la protección la dan las RLS.
- **Acceso a datos:** los componentes no llaman a Supabase directamente. Un servicio por feature encapsula los accesos, con estado en signals y tipos generados.
- **Dependencias:** las mínimas. Usa lo que trae Angular antes de añadir librerías.

## Roles

- **admin:** todo, incluido gestionar el equipo, miembros, roles y catálogo. Siempre debe quedar al menos un admin.
- **tesorero:** pone y anula multas, registra y anula pagos y gastos, y gestiona el catálogo.
- **jugador:** solo lectura de todo lo de su equipo (multas de todos, saldos y bote). La transparencia es parte de la gracia.

Un usuario puede estar en varios equipos con roles distintos.

## Modelo de datos

Campos comunes:

- Todas las tablas llevan `id uuid default gen_random_uuid()` y `creado_en timestamptz default now()`.
- Las que reciben escrituras de usuarios llevan además `creado_por uuid`, forzado en BD a `auth.uid()` y nunca el que mande el cliente.
- Los importes van en céntimos (`integer`, > 0) para evitar errores de coma flotante.

Tablas:

- `equipos`: nombre, codigo_invitacion (único, 8 caracteres sin ambiguos como 0/O o 1/l).
- `miembros`: equipo_id, usuario_id (nullable, referencia a `auth.users`), nombre, rol (`admin` | `tesorero` | `jugador`), activo. Lleva índice único parcial `(equipo_id, usuario_id)` cuando usuario_id no es nulo, y `unique (id, equipo_id)` para las FKs compuestas.
- `tipos_multa`: equipo_id, nombre, importe_centimos, activo. Lleva `unique (id, equipo_id)`.
- `multas`: equipo_id, miembro_id, tipo_multa_id (nullable, para multas libres), concepto, importe_centimos, fecha, nota, anulada, anulada_en, anulada_por.
- `pagos`: equipo_id, miembro_id, importe_centimos, fecha, metodo (`bizum` | `efectivo` | `otro`), nota, anulado, anulado_en, anulado_por.
- `gastos`: equipo_id, concepto, importe_centimos, fecha, nota, anulado, anulado_en, anulado_por.

Invariantes:

- **Aislamiento por equipo:** todo cuelga de `equipo_id`. Usa FKs compuestas `(miembro_id, equipo_id)` y `(tipo_multa_id, equipo_id)` para que sea imposible apuntar a un miembro o un tipo de otro equipo.
- **Fichas sin cuenta:** `usuario_id` nulo significa un jugador dado de alta por el tesorero que aún no tiene cuenta. Al unirse con el enlace, el usuario puede reclamar su ficha. Así la app es útil aunque solo la use el tesorero.
- **Histórico estable:** una multa con tipo copia el nombre (en `concepto`) y el importe del catálogo en el momento de ponerla, mediante un trigger en BD. Cambiar el catálogo no altera el histórico.
- **Nada se borra:** multas, pagos y gastos no se editan ni se borran, se anulan con una RPC. Para corregir, se anula y se crea otra. Los tipos de multa y los miembros se desactivan.
- **Saldos calculados:** no se guardan, se calculan en vistas con `security_invoker = on` (para que respeten RLS).
  - `saldos_miembros`: por miembro, total de multas, total pagado y saldo pendiente, sin contar anulados.
  - `resumen_equipo`: recaudado, gastado, bote actual (recaudado − gastado) y pendiente de cobro.
- **Índices:** en todas las FKs y en `miembros.usuario_id`.

## Seguridad (RLS y RPCs)

- RLS activado en todas las tablas, todo denegado por defecto.
- **Funciones auxiliares:** `es_miembro(equipo_id)` y `tiene_rol(equipo_id, roles[])`.
  - Son `security definer`, `stable` y llevan `set search_path = ''`, cualificando todo con su esquema.
  - Viven en un esquema no expuesto por la API, por ejemplo `private`.
  - En las políticas, usa `(select auth.uid())`.
- **Lectura:** cualquier miembro activo lee todo lo de su equipo.
- **Escritura directa** (por políticas, según rol):
  - `tipos_multa`: INSERT y UPDATE para tesorero y admin. Sin DELETE (se desactivan).
  - `multas`, `pagos` y `gastos`: solo INSERT para tesorero y admin. Ni UPDATE ni DELETE.
  - `miembros`: INSERT solo para admin y siempre con `usuario_id` nulo (las cuentas se vinculan solo por RPC). UPDATE solo de la columna `nombre`, para admin o el propio usuario (usa privilegios por columna o un trigger).
  - `equipos`: UPDATE del nombre solo para admin. Se crean por RPC.
- **RPCs:** `security definer`, validando todo dentro. Revoca EXECUTE a `public` y `anon` y concédelo solo a `authenticated`.
  - `crear_equipo(nombre_equipo, mi_nombre, con_catalogo_ejemplo)`: crea el equipo, añade al creador como admin y genera el código de invitación. Opcionalmente precarga un catálogo de ejemplo editable.
  - `miembros_reclamables(codigo)`: devuelve id y nombre de los miembros activos sin cuenta de ese equipo, y nada más.
  - `unirse_con_codigo(codigo, miembro_id?, mi_nombre?)`: vincula al usuario a una ficha libre de ese equipo o crea una nueva como jugador. Valida que la ficha sea de ese equipo y esté libre, y que el usuario no esté ya dentro.
  - `regenerar_codigo(equipo_id)`: solo admin.
  - `anular_multa`, `anular_pago` y `anular_gasto`: tesorero o admin.
  - Cambiar rol, desactivar miembro y desvincular la cuenta de una ficha: solo admin, y nunca dejando el equipo sin admins.
- **Tests de RLS:** con pgTAP (`supabase test db`) si tengo Docker. Si no, un script SQL de comprobación. Casos mínimos:
  - Un usuario de otro equipo no puede leer ni escribir nada.
  - Un jugador no puede escribir.

## Autenticación

- **Sin contraseñas.** Login con código de un solo uso por email (OTP de Supabase, con la plantilla de email mostrando `{{ .Token }}` y verificación con `verifyOtp`). No uses enlace mágico: en iPhone, la app instalada no comparte sesión con Safari y los enlaces del correo se abren en Safari, así que el enlace iniciaría sesión fuera de la app.
- **Google:** login con Google como alternativa. Hay que probarlo dentro de la app instalada en iPhone.
- **Rutas:** guard para las rutas privadas y cierre de sesión.
- **Tareas manuales:** el email por defecto de Supabase no sirve para usuarios reales, así que configuraré un SMTP propio (Brevo o Resend). Inclúyelo en mis tareas manuales, junto con:
  - la plantilla del email con el código (y su equivalente en la configuración local),
  - el cliente OAuth de Google,
  - las URLs permitidas (localhost y producción).

## Pantallas y flujos

- `/login`: email y luego el código. Botón de Google.
- `/`: entrada. Con un solo equipo (o el último usado) entra directo en él; si no, va a `/equipos`.
- `/equipos`: mis equipos, crear equipo y unirse con código.
- `/unirse/:codigo`: llega por WhatsApp.
  - Si no hay sesión, guarda el código, pide login y vuelve.
  - Después pregunta «¿Eres alguno de estos?» con las fichas reclamables, o «Soy nuevo».
  - Al terminar, invita a instalar la app y avisa de que en iPhone tendrá que volver a entrar dentro de la app instalada.
- `/e/:equipoId`: inicio del equipo, con el bote, lo pendiente de cobro, el saldo de cada jugador y las últimas multas.
- **Poner multa:** es la acción estrella, siempre a mano y en 3 toques como máximo (jugador → tipo → confirmar). También permite multa libre con concepto e importe.
- `/e/:equipoId/multas`: calendario del mes, con las multas y pagos de cada día y filtro por jugador. Se cambia de mes con flechas o deslizando. Al tocar un día se ve su detalle; anular pide confirmación.
- `/e/:equipoId/jugador/:miembroId`: multas y pagos de un jugador. Desde aquí se registra un pago.
- `/e/:equipoId/gastos`: registrar y listar los gastos del bote.
- `/e/:equipoId/ajustes` (admin):
  - datos del equipo y su foto (solo admin);
  - miembros (alta sin cuenta, roles, desactivar, desvincular);
  - catálogo;
  - enlace de invitación para compartir por WhatsApp y regenerar.
- `/instalar`: cómo instalarla en iPhone (Compartir → Añadir a pantalla de inicio) y en Android.
  - En iPhone sin instalar, un aviso discreto que lleve aquí.
  - En Android, botón «Instalar» con `beforeinstallprompt`.
- Lo que un rol no puede hacer, no se le muestra.

## Diseño

- **Mobile-first:** se usará casi siempre en el móvil, en el vestuario o en el bar. Objetivos táctiles grandes y uso con una mano.
- **Plan visual previo:** antes de maquetar (fase 4), propón un plan corto y espera mi OK. Debe incluir:
  - paleta de 4 a 6 colores en hex;
  - tipografías y su papel;
  - layout en ASCII de la pantalla de inicio y de «Poner multa».
- **Estilo:** inspíralo en el mundo del fútbol amateur (tarjetas del árbitro, marcador, pizarra de vestuario), no en el look genérico de tarjetas SaaS iguales con sombra gris. Un solo elemento memorable y el resto sobrio.
- **Textos:** verbos claros y nombres consistentes en todo el flujo («Poner multa» → aviso «Multa puesta»). Los errores dicen qué pasó y cómo arreglarlo. Los estados vacíos invitan a actuar («Aún no hay multas. Pon la primera.»).
- **Mínimos de calidad:** foco visible, contraste suficiente, `prefers-reduced-motion` respetado y tema claro y oscuro según el sistema.

## Fases

0. **Base.**
   - Proyecto Angular en esta carpeta, con PWA, ESLint y Prettier.
   - Estructura `core/` (Supabase, auth, guards, modelos), `features/` y `shared/` (con un pipe para mostrar céntimos como euros).
   - Cliente de Supabase como servicio único, environments y locale `es-ES`.
   - Supabase CLI inicializado y README con los comandos.
   - Comprobar que compila y arranca.
1. **Base de datos.**
   - Migración con tablas, restricciones, índices, triggers, funciones, RLS, RPCs y vistas.
   - `seed.sql` con un equipo de ejemplo, solo para desarrollo.
   - Tipos TS generados y tests de RLS.
2. **Auth.** Login con código y con Google, guard y cierre de sesión.
3. **Equipos.** Crear equipo, unirse por enlace o código (con reclamar ficha) y ajustes (miembros, roles, catálogo e invitación).
4. **Núcleo.**
   - Primero el plan visual (para y espera OK).
   - Después: inicio con bote y saldos, poner multa, historial y anulación, pagos, gastos y detalle de jugador.
5. **PWA y despliegue.**
   - Manifest e iconos (incluido `apple-touch-icon`).
   - Pantalla `/instalar` y avisos.
   - App shell offline.
   - Configuración del hosting con fallback SPA.

**Fuera de alcance por ahora (no lo hagas):** tiempo real, pagos dentro de la app, apps nativas o tiendas y estadísticas avanzadas.

**Antes de abrirla a otros equipos (más adelante):** política de privacidad, «Borrar mi cuenta» (Edge Function) y una revisión de seguridad de las RLS.

---

**Empieza ahora por la fase 0.** Primero comprueba lo que tengo instalado y dime qué datos de Supabase vas a necesitar.

## Decisiones tomadas durante el desarrollo

- **Fichas sin cuenta = jugador.** Una ficha sin cuenta solo puede tener rol jugador (restricción en BD). Así, quien reclame una ficha con el enlace no hereda permisos. Los roles se dan cuando la persona ya se ha unido. Al desvincular una cuenta, la ficha vuelve a jugador.
- **Admins:** el creador del equipo es admin y puede hacer admin (o tesorero) a cualquier miembro con cuenta. Puede haber varios admins y nunca menos de uno.
- **Fichas desactivadas:** no se les pueden poner multas, pero sí registrar pagos (para saldar deudas).
- **Pendiente de cobro:** suma solo los saldos positivos. Un saldo a favor no resta la deuda de los demás.
- **Entrar como nuevo requiere aprobación.** Con el enlace se reclama al momento una ficha libre creada por el admin. Quien entra como «Soy nuevo» queda como solicitud (`pendiente = true`, inactiva) y no ve nada del equipo hasta que un admin la acepta (`aceptar_solicitud`). Rechazarla (`rechazar_solicitud`) la borra y la persona puede volver a pedirlo. Las fichas propias en cualquier estado se consultan con `mis_equipos()`.
- **Orden de entrada por enlace:** enlace en el navegador → login → reclamar ficha o pedir entrar → pantalla de instalar → abrir la app instalada y volver a entrar (en iPhone la app instalada no comparte sesión con Safari).
- **`info_invitacion(codigo)`:** RPC extra (solo usuarios con sesión) que devuelve id y nombre del equipo de un código, para que `/unirse` muestre «Te unes a X» y distinga un código inexistente.
- **Ajustes:** el admin ve todo; el tesorero entra en ajustes pero solo ve el catálogo.
- **Diseño (fase 4):** tras dos tiradas de direcciones «de objeto» (cromos, acta, carnet, pizarra) que el autor rechazó, se eligió el estándar de la categoría con el listón de las apps de Apple (Wallet, Fitness, Salud): listas agrupadas de iOS, cifras redondeadas, claro y oscuro según el sistema. Un solo elemento memorable: la tarjeta amarilla del árbitro, reservada a «Poner multa». El sistema está documentado en `DESIGN.md`; el contexto de producto, en `PRODUCT.md`.
- **Nombre:** la app se llama **Multak** (antes «Multas»).
- **Idioma:** la interfaz está en euskera por defecto, con selector para castellano en el menú lateral. Es i18n en tiempo de ejecución: diccionarios tipados en `core/i18n/` (`es.ts` define las claves y `eu.ts` tiene que traducirlas todas) y servicio `I18n` (`t()`, `frase()` para las frases con gracia al azar, `error()`, fechas e importes). El idioma se guarda en el dispositivo y cambiarlo recarga la app. Los errores de la BD se traducen en el cliente (`claveError`).
- **Catálogo de ejemplo en el idioma de quien crea el equipo:** `crear_equipo` recibe `idioma` ('eu' por defecto, o 'es').
- **Menú lateral:** el botón para volver a equipos se sustituye por el avatar del equipo, que abre un menú con los equipos, «Unirme o crear», apariencia (sistema, claro u oscuro), idioma, privacidad y cerrar sesión.
- **Foto del equipo:** bucket privado `equipos` de Supabase Storage (`{equipoId}/foto.jpg`, recortada a 512 px en el cliente, máx. 1 MB). La ven los miembros (URL firmada) y solo la sube o la quita el admin (políticas de Storage). `equipos.foto_version` invalida la caché.
- **Más vida:** cifras que cuentan, listas escalonadas, entrada animada de cada pantalla (CSS, sin View Transitions: bloqueaban los toques mientras duraban), vibración al poner multa o registrar pago y celebración cuando todo el equipo está al día. Todo respeta `prefers-reduced-motion`.
- **Tema «Bero klub» y color del club:** suelo crema, sombras cálidas, radios grandes y Figtree autoalojada (sin llamadas a Google). Cada equipo elige dos colores de club (`equipos.color` y `color_secundario`, hex con check en la BD): una de 8 combinaciones hechas o «Personalizado», con un selector completo para cada color. La app calcula el contraste (texto blanco u oscuro sobre el color y tinta legible para enlaces). Lo elige quien crea el equipo y lo cambia el admin en Ajustes. Viste la app del equipo: el «pase de temporada» del Inicio, el escudo rayado (si no hay foto), los enlaces, la pestaña activa y la cinta de la tarjeta amarilla. La deuda va siempre en rojo sobre una pastilla clara. Hay interacción física: el pase y la tarjeta se inclinan hacia el dedo, y hay confeti cuando el equipo o un jugador queda al día. El sistema está en `DESIGN.md`.
- **Escudo de fondo:** en todas las pantallas del equipo, el escudo (su foto o sus rayas) aparece al fondo en gris y casi transparente, como una marca de agua. Las fotos se suben a 1080×1080.
- **Colores personalizados:** en «Personalizado» cada color (principal y rayas) se elige con un selector completo: cuadro para arrastrar, barra de tono y código hex.
- **Notificaciones push (Web Push):** avisan al multado (multa nueva), a quien le apuntan un pago y a los admins (alguien pide entrar). Cada dispositivo se activa o desactiva con un interruptor en el menú lateral; al cerrar sesión se olvida. La suscripción se guarda en `suscripciones_push` (RLS: cada uno las suyas). La app llama a la Edge Function `notificar` justo después de la acción ({ tipo, id }); la función comprueba que quien llama acaba de hacerlo (`creado_por` y menos de 10 minutos), busca a quién avisar y envía con VAPID. Las suscripciones muertas (404/410) se borran. La clave pública VAPID va en `environment*.ts`; la privada solo en los secretos de Supabase. En iPhone solo funcionan con la app instalada en la pantalla de inicio (iOS 16.4+).
- **Recordatorios mensuales de deuda (push):** a quien debe algo en un equipo, tres al mes: cuando quedan 5 días, cuando queda 1 y el día 1 del mes siguiente («ya es noviembre y sigues debiendo…»), con frases pícaras al azar. pg_cron llama cada día a las 17:00 UTC a la Edge Function `recordatorios`; la BD (`recordatorios_de_hoy`, hora de Madrid) decide si toca y a quién, y apunta lo enviado en `recordatorios_enviados`: llamarla de más no repite nada. La URL de las funciones está en `private.ajustes` (el seed la cambia en local).
- **Puntito en el icono de la app:** en Android lo pone el sistema mientras haya notificaciones de Multak sin quitar; en iPhone (app instalada) y ordenador, la Badging API desde el service worker (`public/sw-multak.js`, que envuelve al de Angular). Al abrir la app se da todo por visto: se quita el puntito y se cierran las notificaciones.
- **Código del email:** Supabase puede mandar 6 u 8 cifras según la configuración del proyecto; el login acepta las dos.
- **Frases con gracia:** con tono de vestuario, para picar; las mismas ideas en euskera y en castellano (`docs/frases-graciosas.md`).

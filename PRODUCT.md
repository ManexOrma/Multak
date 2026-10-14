# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

PWA instalable (Angular). Se usa sobre todo instalada en la pantalla de inicio de iPhone y Android; también en navegador de tablet, portátil y PC.

## Users

- **Tesorero o admin del equipo**: quien pone las multas y registra pagos y gastos. Lo hace en el momento, con el móvil en una mano, en el vestuario, en la banda o en el bar después del partido. Necesita poner una multa en 3 toques como máximo.
- **Jugadores**: miran cuánto deben, qué multas les han puesto (y a los demás) y cuánto hay en el bote. Entran a ratos, sobre todo cuando les llega una multa o antes de pagar.
- Equipos de fútbol amateur y, en general, cualquier grupo con sistema de multas internas (cuadrillas, peñas, otros deportes).

## Product Purpose

Llevar la cuenta de las multas internas de un grupo: catálogo de multas propio, quién debe cuánto, lo pagado y el bote común que se gasta en cenas o material. La app solo lleva la cuenta; el dinero se mueve fuera (Bizum o efectivo).

Éxito: el tesorero deja la libreta o la hoja de cálculo, y nadie discute cuánto debe porque todo el equipo ve lo mismo.

## Positioning

La transparencia es parte de la gracia: todo el equipo ve las multas de todos, los saldos y el bote. Es multi-equipo desde el día 1 y se entra por un enlace de WhatsApp: reclamas tu ficha («¿Eres alguno de estos?») y ya estás dentro. Funciona aunque solo la use el tesorero (fichas sin cuenta).

## Operating Context

- Momento clave: justo después de que pase algo (llega tarde, tarjeta, se olvida la equipación). Prisa, ruido, poca atención, luz variable (vestuario, campo de noche, bar).
- Se comparte por WhatsApp: enlace de invitación al grupo y avisos.
- iPhone: la app instalada no comparte sesión con Safari; hay que volver a entrar dentro de la app (login con código de 6 cifras por email, o Google).
- Pagos por Bizum o en efectivo fuera de la app; en la app solo se registran.

## Capabilities and Constraints

- Roles: **admin** (todo, incluido gestionar equipo, miembros, roles y catálogo; siempre al menos uno), **tesorero** (pone y anula multas, pagos y gastos; gestiona el catálogo), **jugador** (solo lectura de todo lo de su equipo). Lo que un rol no puede hacer, no se le muestra.
- Multas con tipo del catálogo o libres (concepto e importe). Nada se borra: multas, pagos y gastos se anulan. El histórico no cambia si cambia el catálogo.
- Importes en euros, formato español (12,50 €). Saldos y bote calculados.
- Entrar como nuevo requiere aprobación de un admin; las fichas creadas por el admin se reclaman al momento.
- Fuera de alcance por ahora: notificaciones push, tiempo real, pagos dentro de la app, apps nativas, estadísticas avanzadas.
- Idiomas: hoy solo castellano (es-ES). A largo plazo, también euskera y otros idiomas: los textos no pueden ir incrustados en imágenes y el diseño debe aguantar textos más largos.

## Brand Commitments

- **Nombre: Multak.** (El repo y la URL ya lo usan.)
- **Voz: «vestuario con gracia».** Cercana y con guasa en los momentos ligeros (estados vacíos, multa puesta, bienvenida), pero clara y seria con el dinero, los permisos y los errores. Verbos claros y nombres consistentes en todo el flujo («Poner multa» → «Multa puesta»). Los errores dicen qué pasó y cómo arreglarlo. Los estados vacíos invitan a actuar («Aún no hay multas. Pon la primera.»).
- **Listón visual: las apps de Apple** (Wallet, Fitness, Salud). Moderno, limpio y nativo, con animaciones finas y profesionales; nada recargado. Tras dos tiradas de direcciones «de objeto» (cromos, acta, carnet, pizarra), el autor eligió el estándar de la categoría ejecutado con calidad de Apple (decisión del 14/10/2026).
- Inspiración del mundo del fútbol amateur (tarjetas del árbitro, marcador, pizarra de vestuario), no el look genérico de tarjetas SaaS. Un solo elemento memorable y el resto sobrio. (Brief fijado en docs/PROYECTO.md.)

## Evidence on Hand

- Sin logo, iconos ni imágenes propias todavía (el icono de la PWA es el de Angular por defecto).
- Sin testimonios, usuarios reales ni datos de uso. Primer equipo usuario: el del autor. No inventar cifras ni testimonios.
- Datos de ejemplo solo en `supabase/seed.sql` (equipo «CD Vestuario»).

## Product Principles

1. **Poner una multa es la acción estrella**: siempre a mano y en 3 toques como máximo (jugador → tipo → confirmar).
2. **Todos ven lo mismo**: la transparencia evita discusiones; el saldo de cada uno y el bote están a la vista.
3. **Útil aunque solo la use el tesorero**: las fichas sin cuenta permiten empezar sin convencer a nadie.
4. **Con el dinero no se bromea**: importes, saldos y anulaciones siempre claros e inequívocos.
5. **Rápida en el móvil y con una mano**: objetivos táctiles grandes, nada que exija precisión ni lectura larga.

## Accessibility & Inclusion

WCAG 2.2 AA y AXE sin errores: foco visible, contraste suficiente, `prefers-reduced-motion` respetado, tema claro y oscuro según el sistema, navegable con teclado y lector de pantalla. Se usa con luz variable (exterior de noche, interior con poca luz).

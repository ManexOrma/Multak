---
version: 1
slug: "src-app"
primary_target: "src/app"
related_targets: []
---

## Scope

Toda la app web de Multak (modo Operate): login, mis equipos, unirse, inicio del equipo, poner multa, historial, jugador, gastos y ajustes. Móvil primero (iPhone y Android), y bien resuelta en tablet, portátil y PC.

## Direction contract

THESIS: Multak se siente como una app de Apple (Wallet, Fitness, Salud): las cuentas del equipo en cifras redondeadas grandes, listas agrupadas limpias y una sola nota de color propia, la tarjeta amarilla del árbitro. Rechaza la rejilla de tarjetas SaaS iguales con sombra gris, el disfraz de fútbol y lo infantil.

OWN-WORLD: fondos agrupados de iOS (gris claro #F2F2F7 con celdas blancas; negro puro con celdas #1C1C1E en oscuro, hojas elevadas #1C1C1E con celdas #2C2C2E), separadores finos, texto del sistema (SF Pro / Roboto), cifras en SF Pro Rounded tabulares, avatares de iniciales en gris como en Contactos. Rojo de sistema para lo que se debe, verde para «al día», azul de sistema para enlaces y acciones de texto, y amarillo tarjeta (#FFCC00 / #FFD60A) reservado a «Poner multa» y a la multa recién puesta.

STORY: cada jugador ve al abrir lo que debe y el bote; el tesorero pone una multa en 3 toques y la ve salir como una tarjeta amarilla; todos ven los saldos de todos.

FIRST VIEWPORT: título grande con el nombre del equipo que se pliega en una barra translúcida al hacer scroll; cifra grande «lo tuyo» (roja si debes, «Al día» verde) con el nombre en la frase de debajo; fila del bote; lista agrupada de saldos con monograma de iniciales y cifra a la derecha; botón amarillo «Poner multa» flotando sobre la barra de pestañas translúcida (Inicio, Multas, Gastos, Ajustes). Desde 768px, barra lateral tipo iPadOS (con el nombre del equipo para orientarse en todas las pantallas) y, desde 1100px, el inicio a dos columnas.

FORM: estándar de la categoría ejecutado con el listón de Apple; posición: canon, fijado por el autor en sus palabras («más moderno y limpio», «apps de Apple», «ver la app de verdad») tras rechazar dos tiradas. seed: none (unavailable)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature

«Poner multa» es una hoja que sube desde abajo. Al confirmar (botón amarillo), una tarjeta amarilla con el jugador, el motivo en grande y el importe se levanta con un leve giro y sale volando; la hoja se cierra y la fila del jugador en Saldos se ilumina en amarillo un instante con su nueva cifra.

## Decisiones

- El nombre del equipo se queda en la barra lateral aunque en Inicio coincida con el título grande: en Multas, Gastos y Ajustes es la única referencia de en qué equipo estás.

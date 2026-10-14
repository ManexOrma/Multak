---
name: Multak
description: Las multas del equipo con el listón de las apps de Apple y una sola nota propia, la tarjeta amarilla del árbitro.
colors:
  fondo: '#f2f2f7'
  celda: '#ffffff'
  celda-2: '#f2f2f7'
  fondo-hoja: '#f2f2f7'
  barra: 'rgb(249 249 249 / 0.78)'
  texto: '#000000'
  texto-2: 'rgb(60 60 67 / 0.78)'
  texto-3: 'rgb(60 60 67 / 0.45)'
  separador: 'rgb(60 60 67 / 0.2)'
  relleno: 'rgb(118 118 128 / 0.12)'
  relleno-2: 'rgb(118 118 128 / 0.2)'
  tinte: '#0066cc'
  rojo: '#ff3b30'
  rojo-texto: '#d70015'
  verde: '#34c759'
  verde-texto: '#1f7a35'
  amarillo: '#ffcc00'
  sobre-amarillo: '#1c1c1e'
typography:
  display:
    fontFamily: "ui-rounded, 'SF Pro Rounded', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: '56px'
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: '-0.03em'
    fontFeature: 'tnum'
  headline:
    fontFamily: "system-ui, -apple-system, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: '34px'
    fontWeight: 700
    lineHeight: '41px'
    letterSpacing: '-0.022em'
  title:
    fontFamily: "system-ui, -apple-system, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: '22px'
    fontWeight: 700
    lineHeight: '28px'
    letterSpacing: '-0.017em'
  headline-row:
    fontFamily: "system-ui, -apple-system, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: '17px'
    fontWeight: 600
    lineHeight: '22px'
  body:
    fontFamily: "system-ui, -apple-system, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: '17px'
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: '-0.01em'
  subhead:
    fontFamily: "system-ui, -apple-system, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: '15px'
    fontWeight: 400
    lineHeight: '20px'
  label:
    fontFamily: "system-ui, -apple-system, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: '13px'
    fontWeight: 400
    lineHeight: '18px'
    letterSpacing: '0'
  numeral:
    fontFamily: "ui-rounded, 'SF Pro Rounded', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: '17px'
    fontWeight: 600
    letterSpacing: '-0.01em'
    fontFeature: 'tnum'
rounded:
  interior: '8px'
  segmento: '10px'
  radio: '12px'
  dialogo: '14px'
  hoja: '16px'
  pastilla: '999px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '20px'
  seccion: '32px'
  alto-control: '50px'
  ancho-contenido: '44rem'
components:
  boton-tarjeta:
    backgroundColor: '{colors.amarillo}'
    textColor: '{colors.sobre-amarillo}'
    typography: '{typography.headline-row}'
    rounded: '{rounded.radio}'
    padding: '0 20px'
    height: '50px'
  boton-tarjeta-flotante:
    backgroundColor: '{colors.amarillo}'
    textColor: '{colors.sobre-amarillo}'
    rounded: '26px'
    padding: '0 26px 0 22px'
    height: '52px'
  boton-principal:
    backgroundColor: '{colors.texto}'
    textColor: '{colors.fondo}'
    typography: '{typography.headline-row}'
    rounded: '{rounded.radio}'
    padding: '0 20px'
    height: '50px'
  boton-secundario:
    backgroundColor: '{colors.relleno}'
    textColor: '{colors.texto}'
    rounded: '{rounded.radio}'
    padding: '0 20px'
    height: '50px'
  boton-peligro:
    backgroundColor: '{colors.relleno}'
    textColor: '{colors.rojo-texto}'
    rounded: '{rounded.radio}'
    padding: '0 20px'
    height: '50px'
  boton-enlace:
    textColor: '{colors.tinte}'
    typography: '{typography.body}'
    height: '44px'
  lista:
    backgroundColor: '{colors.celda}'
    rounded: '{rounded.radio}'
  fila:
    textColor: '{colors.texto}'
    typography: '{typography.body}'
    padding: '10px 16px'
    height: '52px'
  campo:
    backgroundColor: '{colors.celda}'
    textColor: '{colors.texto}'
    typography: '{typography.body}'
    rounded: '{rounded.radio}'
    padding: '0 16px'
    height: '50px'
  chip:
    backgroundColor: '{colors.celda}'
    textColor: '{colors.texto}'
    typography: '{typography.subhead}'
    rounded: '18px'
    padding: '0 14px'
    height: '36px'
  chip-activo:
    backgroundColor: '{colors.texto}'
    textColor: '{colors.fondo}'
  etiqueta:
    backgroundColor: '{colors.relleno}'
    textColor: '{colors.texto-2}'
    rounded: '{rounded.pastilla}'
    padding: '0 8px'
    height: '22px'
  segmentado:
    backgroundColor: '{colors.relleno}'
    rounded: '{rounded.segmento}'
    padding: '2px'
  segmentado-activo:
    backgroundColor: '{colors.celda}'
    textColor: '{colors.texto}'
    rounded: '{rounded.interior}'
    height: '36px'
  avatar:
    textColor: '#ffffff'
    rounded: '{rounded.pastilla}'
    size: '36px'
  tarjeta-multa:
    backgroundColor: '{colors.amarillo}'
    textColor: '{colors.sobre-amarillo}'
    rounded: '{rounded.hoja}'
    padding: '18px 18px 20px'
    width: '250px'
  barra-pestanas:
    backgroundColor: '{colors.barra}'
    textColor: '{colors.texto-2}'
    height: '46px'
---

# Design System: Multak

## Overview

**Creative North Star: "La tarjeta del árbitro en una app de Apple"**

Multak es el estándar de la categoría ejecutado con el listón de Wallet, Fitness y Salud: fondos agrupados de iOS, celdas limpias, separadores finos, texto del sistema y las cuentas del equipo en cifras redondeadas grandes. Todo es sobrio y nativo; la densidad es la de una lista de Ajustes de iPhone, con objetivos táctiles generosos pensados para una mano y poca atención (vestuario, banda, bar).

Sobre esa calma hay una sola nota de color propia: el amarillo de la tarjeta del árbitro. Vive en el botón «Poner multa», en la tarjeta de multa que sale volando al confirmar y en el destello de la fila del jugador recién multado. El rojo y el verde de sistema no son decoración: dicen quién debe y quién está al día. El azul de sistema queda para enlaces y acciones de texto.

Se rechaza explícitamente la rejilla de tarjetas SaaS iguales con sombra gris, el disfraz de fútbol (céspedes, balones, pizarras dibujadas) y lo infantil.

**Key Characteristics:**

- Fondo agrupado gris con celdas blancas en claro; negro puro con celdas grafito en oscuro, y hojas que se elevan un tono.
- Cifras en fuente redondeada y tabular; la cifra de «lo tuyo» es lo más grande de la pantalla.
- Un único acento propio (amarillo tarjeta), escaso y con significado.
- Barras translúcidas con desenfoque arriba y abajo; título grande que se pliega en la barra.
- Animaciones finas con curvas de salida rápidas; todas se anulan con `prefers-reduced-motion`.

## Colors

Paleta de sistema de iOS, casi monocroma, con colores semánticos para el dinero y un solo acento de marca.

### Primary

- **Amarillo tarjeta** (`amarillo`): la tarjeta del árbitro. Solo en «Poner multa» (botón de la barra lateral, botón flotante y confirmación de la hoja), en la tarjeta de multa, en el icono de la fila «Bote» y en el destello de la fila recién multada. En oscuro pasa al amarillo de sistema oscuro (#FFD60A). El texto encima siempre es **Grafito sobre amarillo** (`sobre-amarillo`), nunca blanco.

### Secondary

- **Azul de sistema** (`tinte`): enlaces, acciones de texto («Cancelar», «Atrás», «Ver todas»), anillo de foco y borde de campo enfocado. Es el azul AA (#0066CC), no el #007AFF de iOS, para aprobar contraste sobre blanco; en oscuro, #4DA3FF.

### Tertiary

- **Rojo de sistema** (`rojo`) y **Rojo legible** (`rojo-texto`): lo que se debe y las acciones destructivas. El rojo vivo marca bordes de error; el legible (#D70015 claro / #FF6961 oscuro) es el que se usa para texto e importes.
- **Verde de sistema** (`verde`) y **Verde legible** (`verde-texto`): «Al día» y casillas marcadas. El legible (#1F7A35) es el de texto en claro; en oscuro ambos son #30D158.

### Neutral

- **Gris agrupado** (`fondo`): fondo de toda la app en claro; negro puro (#000000) en oscuro.
- **Celda** (`celda`): blanco de grupos, filas, campos y chips; #1C1C1E en oscuro, y #2C2C2E dentro de hojas y diálogos oscuros.
- **Celda interior** (`celda-2`) y **Fondo de hoja** (`fondo-hoja`): celda dentro de celda (pulsado de la rejilla de jugadores) y superficie de hojas. En oscuro, la hoja es #1C1C1E para elevarse sobre el negro.
- **Barra translúcida** (`barra`): barra de navegación plegada, barra de pestañas y avisos, siempre con desenfoque. Con `prefers-reduced-transparency` se vuelve opaca (`celda`).
- **Texto** (`texto`), **Secundario** (`texto-2`) y **Terciario** (`texto-3`): tinta principal, detalle y explicaciones (AA sobre blanco y sobre gris), y terciario solo para placeholders, chevrons y estados deshabilitados de enlaces, nunca para texto que haya que leer.
- **Separador** (`separador`): líneas de 0,5px entre filas y bajo las barras.
- **Relleno** (`relleno`, `relleno-2`): controles grises (botón secundario y de peligro, etiquetas, pista del segmentado, fila activa de la barra lateral, asa de la hoja).

### Named Rules

**The Una Sola Tarjeta Rule.** El amarillo es la tarjeta del árbitro y nada más: solo para poner multas y para la multa recién puesta. Si una pantalla no tiene que ver con poner una multa, no lleva amarillo salvo el icono del bote.

**The El Color Es Dinero Rule.** Rojo significa «debe», verde significa «al día». No se usan como decoración ni para categorías; los avatares son grises precisamente para dejar el color al dinero y a la tarjeta.

**The Rojo Que Se Lee Rule.** Todo texto o importe rojo o verde usa la variante `-texto`; el tono vivo de sistema solo pinta bordes y controles.

## Typography

**Display Font:** SF Pro Rounded (con `ui-rounded`, y como respaldo la fuente del sistema)
**Body Font:** fuente del sistema: SF Pro en Apple, Roboto en Android, Segoe UI en Windows
**Label/Mono Font:** la misma fuente del sistema; las cifras usan la redondeada con números tabulares

**Character:** la tipografía es la del propio dispositivo, para que Multak se sienta nativa; la única voz distinta son las cifras redondeadas, como en Fitness y Wallet, que hacen del dinero el protagonista sin gritar.

### Hierarchy

- **Display** (700, 56px, 1.05): la cifra «lo tuyo» en Inicio y el bote en Gastos. En la ficha del jugador baja a 40px. «Al día» también se escribe en esta talla, en verde.
- **Headline** (700, 34px/41px): título grande de cada pantalla, que al hacer scroll se pliega en la barra a 17px semibold.
- **Title** (700, 22px/28px): títulos de sección sobre las listas («Saldos», «Últimas multas»), pasos de la hoja («¿A quién?») y nombre del equipo en la barra lateral.
- **Headline de fila** (600, 17px): títulos de hoja y diálogo, texto de botones, título de la barra plegada.
- **Body** (400, 17px, 1.35): texto de filas y campos. Nunca menos de 16px en campos para que iOS no haga zoom.
- **Subhead** (400, 15px/20px): detalle de filas, explicaciones bajo la cifra grande (máx. 34ch), chips y avisos (estos en 600).
- **Label** (400, 13px/18px): etiquetas de campo, pies de grupo, notas y errores de campo. Las cabeceras de día del historial usan esta talla en mayúsculas con 0.02em, como las cabeceras de grupo de las listas de iOS.
- **Pestañas** (500, 11px): rótulos de la barra de pestañas.

### Named Rules

**The Cifras Redondas Rule.** Todo importe va en la fuente redondeada con `tabular-nums`, sea la cifra grande o el valor a la derecha de una fila (600). Así las columnas de euros se alinean y el dinero se reconoce de un vistazo.

**The Sin Fuentes Ajenas Rule.** No se cargan fuentes web: la app usa la del sistema para sentirse nativa en cada dispositivo.

## Layout

Móvil primero. La página es una columna centrada de hasta 44rem con 16px de margen lateral, que respeta las zonas seguras (`env(safe-area-inset-*)`) arriba y abajo. Las secciones se separan 32px; dentro de los formularios y pilas los elementos van a 8px. Los textos de cabecera y notas se sangran 4px respecto al borde de las listas; los pies de grupo, 16px, alineados con el texto de las filas.

En móvil, la navegación es una barra de pestañas translúcida fija abajo (Inicio, Multas, Gastos, Ajustes) y, para quien puede gestionar, el botón amarillo «Poner multa» flota centrado sobre ella. Desde 768px aparece una barra lateral tipo iPadOS de 240px con «Mis equipos», el nombre del equipo, el botón amarillo y las secciones; pestañas y botón flotante desaparecen. Desde 1100px, el Inicio pasa a dos columnas (saldos a la izquierda, últimas multas a la derecha) y la página se ensancha a 72rem. Las hojas son de abajo a arriba en móvil y pasan a panel centrado desde 700px.

El ritmo de espaciado es de 4px (4, 8, 12, 16, 20, 32). Las filas miden al menos 52px y los controles 50px; ningún objetivo táctil baja de 44px.

## Elevation & Depth

Sistema plano por capas tonales, como iOS: la profundidad la dan el contraste entre fondo gris y celda blanca (o negro y grafito en oscuro), los separadores finos y el desenfoque de las barras. Las listas y celdas nunca llevan sombra. Las sombras solo aparecen en lo que de verdad flota sobre el contenido: hojas, diálogos, avisos, el botón flotante y la tarjeta amarilla. En oscuro, hojas y diálogos añaden un filo interior de 0,5px para separarse del negro.

### Shadow Vocabulary

- **Hoja** (`box-shadow: 0 -8px 40px rgb(0 0 0 / 0.12)`; 0.6 en oscuro): hoja que sube desde abajo en móvil.
- **Flotante** (`box-shadow: 0 8px 24px rgb(0 0 0 / 0.14), 0 2px 6px rgb(0 0 0 / 0.08)`; `0 8px 24px rgb(0 0 0 / 0.55)` en oscuro): diálogos, hoja en pantallas anchas y avisos.
- **Tarjeta** (`box-shadow: 0 14px 30px rgb(0 0 0 / 0.18), 0 2px 6px rgb(0 0 0 / 0.1)`): solo la tarjeta amarilla de la multa.
- **Segmento** (`box-shadow: 0 3px 8px rgb(0 0 0 / 0.12), 0 1px 1px rgb(0 0 0 / 0.04)`): la pieza blanca del control segmentado.
- **Barra** (`box-shadow: 0 0.5px 0 var(--separador)`): la línea bajo la barra plegada y sobre las pestañas; es un separador, no una sombra.

### Named Rules

**The Celdas Planas Rule.** Grupos, filas, chips y campos no llevan sombra: se separan del fondo por tono. Una sombra en una celda es la rejilla SaaS que este sistema rechaza.

**The Cristal Rule.** Lo que se queda fijo sobre el contenido (barra de navegación plegada, barra de pestañas, avisos) es translúcido con `blur(20px) saturate(180%)` y se vuelve opaco con `prefers-reduced-transparency`.

## Shapes

Esquinas continuas y suaves, sin bordes visibles. Grupos, filas sueltas, campos, botones y estados vacíos usan el radio de celda (12px); los diálogos 14px; las hojas, la tarjeta de multa y los avisos 16px. Dentro de controles compuestos el radio baja: pista del segmentado 10px, segmento 8px, filas de la barra lateral 10px, icono de fila 9px. Avatares redondos; etiquetas, chips y el botón flotante, en pastilla. No hay trazos alrededor de nada: los límites los marcan el tono de la celda y los separadores de 0,5px, que empiezan donde empieza el texto (16px, o 64px en listas con avatar).

La única forma con carácter es la tarjeta del árbitro: un rectángulo vertical amarillo que en la marca aparece girado −9° y en la hoja se levanta con un leve giro.

## Components

### Buttons

Táctiles y seguros: macizos, sin borde, se encogen al pulsar.

- **Shape:** esquinas de celda (12px), alto mínimo de 50px, 20px de relleno lateral, texto 17px semibold, icono de 20px.
- **Tarjeta (acción estrella):** amarillo con texto grafito. Es el único botón amarillo y siempre dice «Poner multa». En móvil flota en pastilla (52px de alto, sombra propia) centrado sobre las pestañas.
- **Principal:** tinta sobre fondo (negro con texto gris claro; en oscuro, blanco con texto negro). Para continuar, guardar y entrar.
- **Secundario / Peligro:** relleno gris con texto normal o rojo legible.
- **Enlace:** sin fondo, azul de sistema, 44px de alto; versión roja para acciones destructivas.
- **Hover / Focus / Active:** al pulsar, `scale(0.97)` en 140ms con la curva de salida; deshabilitado al 40% de opacidad. Foco con anillo azul de 3px y 2px de separación.

### Chips

- **Style:** filtros por jugador del historial: celda blanca en pastilla (36px de alto, 15px medium), en una fila con scroll horizontal sin barra.
- **State:** el seleccionado se invierte a tinta con texto de fondo (`aria-pressed`); al pulsar, `scale(0.96)`.
- **Etiqueta:** pastilla de 22px en relleno gris con texto secundario 12px semibold («Anulada», roles).

### Cards / Containers

- **Corner Style:** 12px.
- **Background:** celda sobre fondo agrupado.
- **Shadow Strategy:** ninguna (ver The Celdas Planas Rule).
- **Border:** ninguno; separadores internos de 0,5px.
- **Internal Padding:** 16px lateral en filas; 28px × 20px en estados vacíos.

### Listas agrupadas

El corazón de la interfaz, al estilo «inset grouped» de iOS. Cada fila tiene 52px mínimos, 12px entre piezas: avatar o icono, texto (título truncado con puntos suspensivos y detalle de 15px secundario debajo), valor a la derecha en cifra redondeada semibold y chevron gris terciario. Al pulsar, la fila toma el relleno gris; con ratón, un hover más suave. Una multa anulada nunca desaparece: se tacha (1,5px), pasa a texto secundario y lleva la etiqueta «Anulada».

### Inputs / Fields

- **Style:** celda sin borde, 12px de radio, 50px de alto, 16px de relleno, texto de 17px; placeholder en terciario. La etiqueta va encima, en 13px secundario.
- **Focus:** borde interior azul de 2px (`inset 0 0 0 2px`) en 140ms.
- **Error / Disabled:** borde interior rojo de 2px con `aria-invalid`; el mensaje va debajo en 13px rojo legible y reserva su línea para no saltar.
- **Selector y casilla:** el select lleva un chevron gris dibujado; las casillas son filas de celda con la casilla en verde de sistema.
- **Control segmentado:** pista de relleno gris con 2px de holgura; la opción activa es una pieza de celda con sombra de segmento (#636366 en oscuro).

### Navigation

- **Cabecera de pantalla:** título grande de 34px en la página; al pasar bajo la barra, la barra se vuelve de cristal con línea inferior y el título aparece en ella a 17px semibold (200ms). A la izquierda, «atrás» en azul con chevron; a la derecha, acciones.
- **Barra de pestañas (móvil):** cristal fijo abajo, iconos de 26px y rótulo de 11px; inactiva en secundario, activa en tinta. Al pulsar, el icono se encoge a 0.92.
- **Barra lateral (≥768px):** celda con línea derecha de 0,5px; filas de 44px con icono de 22px; la activa lleva relleno gris y texto semibold.

### Avatar

Monograma de Contactos: círculo de 36px (52px en la rejilla de jugadores, 28–32px en línea) con degradado gris (#6E6E73 → #545458; #636366 → #48484A en oscuro, para que las iniciales blancas pasen 4,5:1), iniciales blancas semibold al 40% del tamaño. Siempre gris, para que el color quede para el dinero y la tarjeta.

### Hojas y diálogos

- **Hoja:** sube desde abajo en 420ms con `cubic-bezier(0.32, 0.72, 0, 1)`, asa de 36×5px, cabecera de tres columnas (Atrás · título · Cancelar). Desde 700px es un panel centrado que entra con un leve zoom.
- **Diálogo de confirmación:** celda centrada de 14px de radio con título 17px y mensaje 15px centrados; acciones en columnas iguales de 46px. Entra de `scale(0.96)` en 220ms.
- **Aviso:** píldora de cristal arriba (como las notificaciones de iOS), 15px semibold, que no tapa el botón amarillo ni las pestañas.

### Tarjeta del árbitro (componente firma)

La multa a punto de ponerse se presenta como una tarjeta amarilla de hasta 250px de ancho y alto según su contenido: arriba, avatar y nombre del jugador; debajo, el motivo grande (26px bold), el importe en cifra (40px bold) y el equipo con la fecha (13px al 70%). Entra levantándose con un giro de 2° (380ms). Al confirmar, se eleva 14px girando −3° y sale volando hacia arriba a −12° en 620ms con `cubic-bezier(0.77, 0, 0.175, 1)`; después, la fila del jugador en Saldos se ilumina en amarillo (38%) durante 1,6s. Con movimiento reducido, no vuela.

## Do's and Don'ts

### Do:

- **Do** poner el amarillo solo donde se pone una multa: botón «Poner multa», tarjeta de multa y destello de la fila recién multada.
- **Do** escribir todo importe en la fuente redondeada con números tabulares, en rojo legible si se debe y «Al día» en verde legible si no.
- **Do** construir las pantallas con listas agrupadas: celdas de 12px sobre fondo gris, separadores de 0,5px que empiezan en el texto y valor a la derecha.
- **Do** abrir cada pantalla con el título grande de 34px que se pliega en la barra de cristal.
- **Do** mantener objetivos táctiles de al menos 44px (controles de 50px, filas de 52px) y campos de 17px.
- **Do** animar con las curvas del sistema (`--ease-out` para estados, `--ease-hoja` para hojas) y anular el movimiento con `prefers-reduced-motion`.
- **Do** tachar lo anulado y marcarlo con la etiqueta «Anulada»; nada desaparece.

### Don't:

- **Don't** montar rejillas de tarjetas iguales con sombra gris: las celdas son planas y se separan por tono.
- **Don't** disfrazar la app de fútbol (céspedes, balones, pizarras, texturas) ni hacerla infantil; la única referencia al árbitro es la tarjeta amarilla.
- **Don't** poner texto blanco sobre amarillo, ni usar el amarillo como color de estado, de enlace o de categoría.
- **Don't** usar rojo o verde como decoración, ni dar color a los avatares.
- **Don't** usar el texto terciario para nada que haya que leer; solo para placeholders, chevrons y estados apagados.
- **Don't** cargar fuentes web ni sustituir la fuente del sistema por otra con personalidad.
- **Don't** usar el azul #007AFF de iOS sobre blanco para texto: el tinte es #0066CC por contraste.

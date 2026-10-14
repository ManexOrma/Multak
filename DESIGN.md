---
name: Multak
description: «Bero klub». Las multas del equipo con el listón de las apps de Apple, con calor de vestuario, el color del club y la tarjeta amarilla del árbitro.
colors:
  fondo: '#f7f1ec'
  celda: '#ffffff'
  celda-2: '#f3ece6'
  fondo-pastilla: '#ffffff'
  fondo-hoja: '#f7f1ec'
  barra: 'rgb(255 250 246 / 0.82)'
  texto: '#1e1612'
  texto-2: '#6b5d55'
  texto-3: '#a8988e'
  separador: '#ece2da'
  relleno: 'rgb(120 80 50 / 0.09)'
  relleno-2: 'rgb(120 80 50 / 0.16)'
  tinte: 'var(--klub-tinta)'
  rojo: '#e0283c'
  rojo-texto: '#c4162a'
  verde: '#22a355'
  verde-texto: '#13652f'
  verde-fondo: '#ddf3e4'
  amarillo: '#ffc72c'
  sobre-amarillo: '#2a1a00'
  avatar-texto: '#4a3b33'
  klub-urdin: '#0b5cad'
  klub-zeru: '#0369a1'
  klub-berde: '#0f6b3a'
  klub-gorri: '#c8102e'
  klub-granate: '#7a1f3d'
  klub-more: '#5b2a86'
  klub-laranja: '#c2410c'
  klub-beltz: '#2a2421'
typography:
  display:
    fontFamily: "'Figtree Variable', system-ui, sans-serif"
    fontSize: '52px'
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: '-0.03em'
    fontFeature: 'tnum'
  headline:
    fontFamily: "'Figtree Variable', system-ui, sans-serif"
    fontSize: '34px'
    fontWeight: 800
    lineHeight: '41px'
    letterSpacing: '-0.028em'
  title:
    fontFamily: "'Figtree Variable', system-ui, sans-serif"
    fontSize: '22px'
    fontWeight: 800
    lineHeight: '28px'
    letterSpacing: '-0.02em'
  headline-row:
    fontFamily: "'Figtree Variable', system-ui, sans-serif"
    fontSize: '17px'
    fontWeight: 600
    lineHeight: '22px'
  body:
    fontFamily: "'Figtree Variable', system-ui, sans-serif"
    fontSize: '17px'
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: '-0.01em'
  subhead:
    fontFamily: "'Figtree Variable', system-ui, sans-serif"
    fontSize: '15px'
    fontWeight: 400
    lineHeight: '20px'
  label:
    fontFamily: "'Figtree Variable', system-ui, sans-serif"
    fontSize: '13px'
    fontWeight: 400
    lineHeight: '18px'
  numeral:
    fontFamily: "'Figtree Variable', system-ui, sans-serif"
    fontSize: '17px'
    fontWeight: 600
    fontFeature: 'tnum'
rounded:
  segmento: '12px'
  segmento-pista: '14px'
  radio: '16px'
  grupo: '22px'
  dialogo: '24px'
  pase: '28px'
  hoja: '28px'
  pastilla: '999px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '20px'
  seccion: '32px'
  alto-control: '52px'
  ancho-contenido: '44rem'
components:
  pase:
    backgroundColor: 'linear-gradient(140deg, var(--klub), var(--klub-sakon))'
    textColor: '#ffffff'
    rounded: '{rounded.pase}'
    padding: '10px 10px 16px'
  pastilla-deuda:
    backgroundColor: '{colors.fondo-pastilla}'
    rounded: '20px'
    padding: '12px 16px 8px'
  boton-tarjeta:
    backgroundColor: 'linear-gradient(135deg, #ffd84d, #ffb300)'
    textColor: '{colors.sobre-amarillo}'
    rounded: '{rounded.radio}'
    padding: '0 20px'
    height: '52px'
  boton-tarjeta-flotante:
    backgroundColor: 'linear-gradient(135deg, #ffd84d, #ffb300)'
    textColor: '{colors.sobre-amarillo}'
    rounded: '27px'
    padding: '0 28px 0 22px'
    height: '54px'
  boton-principal:
    backgroundColor: '{colors.texto}'
    textColor: '{colors.fondo}'
    rounded: '{rounded.radio}'
    height: '52px'
  boton-secundario:
    backgroundColor: '{colors.relleno}'
    textColor: '{colors.texto}'
    rounded: '{rounded.radio}'
    height: '52px'
  lista:
    backgroundColor: '{colors.celda}'
    rounded: '{rounded.grupo}'
  campo:
    backgroundColor: '{colors.celda}'
    rounded: '{rounded.radio}'
    height: '52px'
  chip-activo:
    backgroundColor: 'linear-gradient(140deg, var(--klub), var(--klub-sakon))'
    textColor: '#ffffff'
  escudo:
    backgroundColor: 'repeating-linear-gradient(90deg, var(--klub) 0 20%, #fff 20% 40%)'
    rounded: '34%'
  avatar:
    backgroundColor: 'linear-gradient(135deg, #f3ebe5, #e8ddd5)'
    textColor: '{colors.avatar-texto}'
    rounded: '{rounded.pastilla}'
    size: '36px'
  tarjeta-multa:
    backgroundColor: 'linear-gradient(150deg, #ffe066, #ffc72c 45%, #ffa81c)'
    textColor: '{colors.sobre-amarillo}'
    rounded: '26px'
    width: '260px'
---

# Design System: Multak

## Overview

**Creative North Star: «Bero klub»: el pase de temporada de tu club, con el listón de una app de Apple**

Multak sigue siendo el estándar de la categoría con el listón de Wallet, Fitness y Salud: listas agrupadas, cifras grandes y tabulares, título grande que se pliega en una barra de cristal. Lo que cambia es la temperatura. El suelo es crema y no gris, las sombras son cálidas, los radios son grandes y la tipografía (Figtree) tiene más peso y redondez que la del sistema.

Hay dos notas de color, y cada una tiene un trabajo:

- **El color del club.** Lo elige el equipo y viste su app: el «pase de temporada» del Inicio, el escudo rayado, los enlaces, la pestaña activa, tu avatar y la cinta de la tarjeta amarilla.
- **La tarjeta amarilla del árbitro.** Sigue reservada a poner multas.

El rojo y el verde siguen siendo dinero: quién debe y quién está al día. Por eso la deuda va en una pastilla clara encajada en el pase, y nunca depende del color del club.

Se rechazan la rejilla de tarjetas SaaS iguales, el disfraz de fútbol (céspedes, balones, pizarras) y lo infantil. Las rayas de camiseta son la única referencia textil, y solo en el escudo, el pase y la cinta.

**Key Characteristics:**

- Suelo crema (#F7F1EC) con celdas blancas y sombra cálida suave. En oscuro, marrón casi negro (#14100E) con celdas #221C19 y sin sombras.
- El pase de temporada es lo más grande y lo más vivo: se inclina hacia el dedo y su brillo lo sigue.
- La app está viva pero educada:
  - las cifras cuentan, las listas entran escalonadas y los iconos rebotan al activarse;
  - un destello cruza de vez en cuando el botón amarillo;
  - hay confeti cuando el equipo o un jugador queda al día.
- Todo el movimiento se anula con `prefers-reduced-motion`.

## Colors

### Primary: el color del club

Cada equipo guarda dos colores en hex: el principal (`equipos.color`) y el de las rayas (`equipos.color_secundario`). Se eligen entre 8 combinaciones hechas (el color con rayas blancas) o en «Personalizado», libremente de una paleta de 16 colores (`PALETA` en `core/tema/klub.ts`).

A partir del color principal, `tokensKlub()` calcula:

- `--klub`: el color;
- `--klub-sakon`: su tono profundo, para degradados;
- `--klub-tinta`: el color usado como texto sobre el fondo, oscurecido (o aclarado en oscuro) hasta tener AA;
- `--sobre-klub`: el texto encima del color: blanco si llega a 4,5:1, o tinta oscura si no (con amarillo o blanco, el texto del pase es oscuro).

`--klub-2` es el secundario y solo se usa para las rayas (escudo, cinta y rayas del pase). En oscuro, el color se apaga un poco y la tinta se aclara.

`TemaService.ponerKlub()` los pone como variables en `<html>` (`--klub-*-l` / `--klub-*-d` para claro y oscuro). Lo llama el shell del equipo; fuera de un equipo se usan los iniciales (azul y blanco). El escudo de cada equipo en un listado lleva sus propios colores inline. Un test (`klub.spec.ts`) comprueba el AA con todos los colores de la paleta.

**Usos:**

- el pase de temporada;
- el escudo;
- `--tinte`: enlaces, «Atrás» y foco;
- la pestaña activa (con su píldora al 14 %) y la fila activa de la barra lateral (al 12 %);
- el chip de filtro activo;
- el círculo de «hoy» y el borde del día elegido en el calendario;
- tu avatar en Saldos y el avatar del multado en la tarjeta;
- la cinta de la tarjeta amarilla;
- las casillas y el confeti.

### Secondary: la tarjeta amarilla

- **Amarillo tarjeta:** en degradado ámbar (#FFD84D → #FFB300 en botones; #FFE066 → #FFC72C → #FFA81C en la tarjeta), con brillo arriba y sombra amarilla.
- **Dónde se usa:** solo en «Poner multa», la tarjeta de la multa, el icono del bote y el destello de la fila recién multada.
- **Texto encima:** siempre `sobre-amarillo` (#2A1A00), nunca blanco.

### Tertiary: el dinero

- **Rojo:** `rojo-texto` (#C4162A en claro, #FF8080 en oscuro) para importes y para «Debes»; `rojo` para bordes de error.
- **Verde:** `verde-texto` (#13652F en claro, #6EE7A0 en oscuro) para «Al día»; `verde-fondo` para su píldora y el aviso de «todos al día».

### Neutral

- `fondo`: crema. `celda`: blanco. `celda-2`: crema más oscura.
- `fondo-pastilla`: la pastilla de la deuda (blanco en claro, #1A1412 en oscuro).
- `texto`: #1E1612. `texto-2`: #6B5D55, AA sobre blanco y sobre crema. `texto-3`: solo placeholders y chevrons.
- `separador`: #ECE2DA.
- `relleno`: un marrón translúcido, para los controles.
- `barra`: crema translúcida con desenfoque.

### Named Rules

**The Dos Colores Con Trabajo Rule.** El color del club (y sus rayas) identifica (de quién es esta app, qué es tuyo, dónde estás). El amarillo actúa (poner una multa). Ninguno de los dos se usa como decoración suelta.

**The La Deuda No Se Tiñe Rule.** Lo que debes siempre va en rojo sobre una superficie clara (la pastilla), nunca en blanco sobre el color del club. Así un club rojo no confunde.

**The Rojo Que Se Lee Rule.** El texto rojo o verde usa siempre la variante `-texto`.

## Typography

**Fuente:** Figtree Variable, autoalojada con `@fontsource-variable/figtree`, sin llamadas a Google. Si falta, usa la del sistema. Se usa en todo, con `tabular-nums` en las cifras.

### Hierarchy

- **Display** (800, 52px): la cifra de la pastilla del pase y el bote en Gastos. «Al día» se escribe en esta misma talla, en verde.
- **Headline** (800, 34px): el título grande de cada pantalla, con el escudo-menú delante en el Inicio.
- **Title** (800, 22px): títulos de sección, pasos de la hoja y el motivo en la tarjeta (26px).
- **Headline de fila** (600, 17px): botones (700 en los amarillos) y títulos de hoja.
- **Body** (400, 17px): filas y campos, nunca por debajo de 16px.
- **Subhead** (15px): detalles. **Label** (13px): etiquetas y pies.
- **Pestañas** (600 en reposo, 700 la activa; 11px).

### Named Rules

**The Peso De Vestuario Rule.** Los títulos van en 800 con interletraje negativo. Es lo que da carácter sin decorar.

## Layout

No cambia respecto al sistema anterior:

- móvil primero, en una columna de hasta 44rem con 16px de margen y zonas seguras;
- pestañas abajo y el botón amarillo flotando encima;
- barra lateral desde 768px;
- el Inicio a dos columnas desde 1100px.

En el móvil, el Inicio abre con el escudo (botón del menú) delante del título grande y, debajo, el pase de temporada.

## Elevation & Depth

En claro, las celdas sí llevan una sombra cálida muy suave (`--sombra-celda`: `0 1px 2px rgb(80 40 20 / 6%), 0 10px 28px rgb(80 40 20 / 7%)`), igual que los campos, las casillas y los estados vacíos. En oscuro se anula, y la separación la da el tono.

Lo que flota lleva sombra propia:

- **El pase:** sombra teñida del club (`0 16px 34px` del club al 34 %).
- **La tarjeta amarilla:** `0 22px 44px rgb(255 160 0 / 42%)`.
- **Los botones amarillos:** `0 10px 28px` en ámbar.
- **Hojas y diálogos:** sombras cálidas, más un filo interior de crema al 8 % en oscuro.

**The Cristal Rule.** Las barras fijas son translúcidas con desenfoque, y se vuelven opacas con `prefers-reduced-transparency`.

## Shapes

Los radios son grandes y continuos:

| Pieza                                               | Radio                     |
| --------------------------------------------------- | ------------------------- |
| Controles, campos y botones                         | 16px                      |
| Listas, estados vacíos y calendario                 | 22px                      |
| Diálogos                                            | 24px                      |
| Pase, hojas, tarjeta amarilla (26px) y menú lateral | 28px                      |
| Segmentado                                          | pista 14px, segmento 12px |
| Escudo                                              | 34 % de su lado           |

Avatares redondos; chips y el botón flotante, en pastilla.

**Las rayas de camiseta:** franjas verticales del club y blanco al 20 % del ancho en el escudo; franjas blancas al 7 % sobre el pase; y la cinta diagonal de la tarjeta.

## Components

### Marca de agua del escudo (todas las pantallas del equipo)

El escudo del club al fondo, fijo y centrado (hasta 420px), en escala de grises y casi transparente (6 %; 10 % con foto). Se ve entre las tarjetas, nunca encima.

- **Con foto:** con `mix-blend-mode: multiply` el fondo blanco de un escudo desaparece y solo queda su contorno. En oscuro se invierte y usa `screen`.
- **Sin foto:** las rayas del escudo, en gris.
- **Resolución:** la foto se sube recortada a 1080×1080 (JPEG al 82 %).

### Pase de temporada (Inicio)

- **Fondo:** la camiseta del club: rayas de 26px de los dos colores, macizas, sin velos ni transparencias, que se mecen despacio (9s, ida y vuelta).
- **Contenido:** todo el texto va en una pastilla clara encajada, así se lee con cualquier combinación de colores:
  - el estado («Zor duzu / Debes» en rojo, o «No debes nada» en verde) con un punto que late;
  - la cifra grande (o «Al día»);
  - la explicación debajo, en texto secundario.
- **Movimiento:**
  - entra con un pequeño rebote;
  - se inclina hacia el dedo hasta 8° (directiva `appInclinar`), con un brillo radial que sigue al dedo.

### Escudo

`app-escudo`: la foto del equipo, o si no hay, las rayas del club con un brillo de tela. Se usa en el botón del menú (las tres líneas en su propio círculo y el escudo suelto al lado), la barra lateral, el menú lateral, Mis equipos y Ajustes. Al pulsar, gira −8°.

### Tarjeta del árbitro (componente firma)

- **Forma:** ámbar en degradado con brillo de plástico arriba, 26px de radio y hasta 260px de ancho.
- **Cinta del club:** diagonal en la esquina, como el brazalete del capitán, que ondea suave.
- **Entrada:** se levanta girando con rebote.
- **Interacción:** se inclina hasta 12° con brillo que sigue al dedo.
- **Al confirmar:** sale volando y la fila del jugador destella en amarillo.

### Buttons

- **Tarjeta (amarillo):** ámbar en degradado con sombra amarilla, en 700.
- **Flotante:** pastilla de 54px que entra con rebote. Un destello la cruza cada 7s y, al pulsar, su icono gira.
- **Principal / Secundario / Peligro / Enlace:** como antes, con 16px de radio y 52px de alto. Los enlaces van en la tinta del club.
- **Pulsado:** botones `scale(0.97)`, filas `scale(0.985)`, celdas de jugador `scale(0.94)` con el avatar girando.

### Navegación

- **Pestañas:** la activa va en la tinta del club, con una píldora detrás del icono que crece con rebote, y el icono da un saltito.
- **Barra lateral:** la fila activa con fondo del club al 12 %.

### Calendario y chips

- **Chips:** el activo, en degradado del club con texto blanco.
- **Días:** «hoy», círculo del club; el día elegido, borde de tinta del club y un pequeño «pop». Los días con multas se calientan en amarillo según el importe.

### Selector de color

`app-selector-color`: las 8 combinaciones rayadas y una muestra arcoíris «Personalizado» con su nombre debajo, en una rejilla de 3 columnas (5 desde 420px). Es un grupo de radios accesible: la muestra elegida crece, gira un poco y muestra un check con rebote. «Personalizado» abre una tarjeta con la vista previa del escudo, un control segmentado para elegir qué color cambias (principal o rayas) y `app-paleta-color`: un cuadro de saturación y brillo para arrastrar (también con flechas), una barra de tono y el código hex.

- **En Crear equipo:** se elige el color al crear el equipo.
- **En Ajustes (solo admin):** el cambio se ve al momento en toda la app y se guarda cuando dejas de tocar colores (0,8 s, con un solo aviso). Si falla, vuelve a los colores guardados.

### Avatar

Monograma en degradado crema (#F3EBE5 → #E8DDD5) con iniciales #4A3B33 en 700; en oscuro, marrón (#3A302B → #2E2622) con #E3D5CC. Con `destacado` va en el degradado del club con iniciales blancas: tú en Saldos y el multado en la tarjeta.

### Celebración

`lanzarConfeti()` lanza unas 34 piezas con los colores del club, amarillo, blanco y naranja, animadas con la Web Animations API. Se usa:

- cuando todo el equipo está al día (una vez por sesión y equipo);
- cuando un pago salda toda la deuda de un jugador.

Con movimiento reducido no sale nada.

## Do's and Don'ts

### Do:

- **Do** usar el color del club para identificar (pase, escudo, enlaces, «tú», pestaña activa) y el amarillo solo para multar.
- **Do** poner la deuda en rojo sobre la pastilla clara, nunca sobre el color del club.
- **Do** dar respuesta física a lo que se toca: inclinación, rebote, giro del icono. Siempre corta (≤ 600ms, salvo los ambientes lentos) y anulada con movimiento reducido.
- **Do** usar Figtree 800 en los títulos y cifras tabulares en todo importe.
- **Do** mantener objetivos táctiles de al menos 44px (controles de 52px).

### Don't:

- **Don't** poner texto fijo en blanco sobre el color del club: usa `--sobre-klub`, que se calcula para cada color.
- **Don't** poner texto blanco sobre amarillo, ni usar el amarillo como estado o enlace.
- **Don't** abusar del movimiento ambiental: solo las rayas del pase, la cinta, el punto que late y el destello del botón amarillo se mueven solos.
- **Don't** cargar fuentes desde Google ni ningún CDN: Figtree va autoalojada.
- **Don't** disfrazar la app de fútbol más allá de las rayas de camiseta y la tarjeta del árbitro.

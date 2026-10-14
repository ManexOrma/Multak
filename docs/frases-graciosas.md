# Frases con gracia

La app elige una variante al azar en cada momento. El tono es de vestuario: van a picar, pero sin insultar. `{nombre}` se sustituye por el nombre de la persona.

En euskera, el nombre va siempre sin declinar (al principio o tras una coma), para que funcione con cualquier nombre.

Viven en `src/app/core/i18n/es.ts` y `eu.ts` (claves `gracia.*`). Para añadir o cambiar una, edita las dos.

## Al poner una multa (`gracia.multa-puesta`)

| Castellano                                                  | Euskara                                                                |
| ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| Multa para {nombre}. Ve sacando la cartera.                 | {nombre}, multa! Atera zorroa.                                         |
| {nombre}, otra al saco. El bote te quiere.                  | {nombre}, beste bat zakura. Poltsak maite zaitu.                       |
| Tarjeta para {nombre}. Ni el árbitro te aguanta.            | {nombre}: txartela. Ezta arbitroak ere ez zaitu jasaten.               |
| {nombre} vuelve a pagar la cena de todos. Gracias, crack.   | {nombre}, zuk ordainduko duzu afaria berriz ere. Eskerrik asko, crack. |
| Apuntado, {nombre}. Esta no se te olvida como los entrenos. | Apuntatuta, {nombre}. Hau ez zaizu ahaztuko, entrenamenduak bezala.    |

## Al registrar un pago (`gracia.pago-registrado`)

| Castellano                                              | Euskara                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------- |
| Pagado. Milagro: ha soltado la pasta.                   | Ordainduta. Mirarria: dirua askatu du.                                    |
| Pago registrado. Ya puedes mirar al tesorero a la cara. | Ordainketa apuntatuta. Diruzainari begietara begiratu diezaiokezu berriz. |
| Pagado. A ver cuánto te dura.                           | Ordainduta. Ea zenbat irauten duzun.                                      |
| Pagado. El bote llora de alegría.                       | Ordainduta. Poltsa pozez negarrez dago.                                   |

## Inicio, cuando no debes nada (`gracia.al-dia`)

| Castellano                                           | Euskara                                                   |
| ---------------------------------------------------- | --------------------------------------------------------- |
| {nombre}, no debes nada. Sospechoso.                 | {nombre}, ez duzu ezer zor. Susmagarria.                  |
| {nombre}, limpio. ¿Seguro que vas a entrenar?        | {nombre}, garbi zaude. Ziur entrenatzera joaten zarela?   |
| Ni un euro, {nombre}. Disfrútalo, que no va a durar. | Euro bat ere ez, {nombre}. Gozatu, ez da luze iraungo.    |
| {nombre} al día. Que alguien avise a la prensa.      | {nombre}, egunean. Norbaitek prentsari abisatu diezaiola. |

## Inicio, cuando nadie debe nada (`gracia.todos-al-dia`, con confeti)

| Castellano                                              | Euskara                                                  |
| ------------------------------------------------------- | -------------------------------------------------------- |
| ¡Nadie debe nada! ¿Quién ha hackeado la app?            | Inork ez du ezer zor! Nork hackeatu du aplikazioa?       |
| Todos al día. Esto huele a cena.                        | Denak egunean. Afari usaina dago.                        |
| Cero deudas. El tesorero no sabe qué hacer con su vida. | Zero zor. Diruzainak ez daki zer egin bere bizitzarekin. |

## Inicio sin multas, visto por un tesorero o admin (`gracia.sin-multas-gestor`)

| Castellano                                             | Euskara                                                        |
| ------------------------------------------------------ | -------------------------------------------------------------- |
| Ni una multa. ¿Sois un equipo o un convento?           | Multarik ez. Talde bat zarete ala komentu bat?                 |
| Cero multas. Pon la primera, que el bote tiene hambre. | Zero multa. Jarri lehenengoa, poltsa gose da.                  |
| Nadie multado aún. Tú sabrás a quién le tienes ganas.  | Oraindik inor ez multatuta. Zuk badakizu nor duzun begiz jota. |

## Inicio sin multas, visto por un jugador (`gracia.sin-multas-jugador`)

| Castellano                                   | Euskara                                               |
| -------------------------------------------- | ----------------------------------------------------- |
| Ni una multa. Esto no es normal.             | Multarik ez. Hau ez da normala.                       |
| Cero multas. El tesorero estará dormido.     | Zero multa. Diruzaina lotan egongo da.                |
| Sin multas todavía. Disfrutad mientras dure. | Oraindik multarik ez. Gozatu, irauten duen bitartean. |

## Ficha de un jugador sin multas (`gracia.sin-multas-jugador-ficha`)

| Castellano                                   | Euskara                                                  |
| -------------------------------------------- | -------------------------------------------------------- |
| Sin multas. O es un santo o nadie le vigila. | Multarik ez. Edo santua da, edo inork ez dio begiratzen. |
| Expediente limpio. Por ahora.                | Espediente garbia. Oraingoz.                             |
| Ni una multa. Sospechosamente perfecto.      | Multarik ez. Perfektuegia, susmagarria.                  |

## Gastos, cuando el bote no ha gastado nada (`gracia.sin-gastos`)

| Castellano                                                   | Euskara                                                   |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| El bote no ha gastado nada. ¿Para cuándo la cena?            | Poltsak ez du ezer gastatu. Noizko afaria?                |
| Cero gastos. El tesorero guarda la pasta debajo del colchón. | Zero gastu. Diruzainak dirua koltxoi azpian gordetzen du. |

## Calendario, día sin multas (`gracia.dia-sin-multas`)

| Castellano                                       | Euskara                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| Día sin multas. Nadie hizo nada… o nadie lo vio. | Multarik gabeko eguna. Inork ez zuen ezer egin… edo inork ez zuen ikusi. |
| Ni una multa. Día de santos.                     | Multarik ez. Santuen eguna.                                              |
| Día limpio. Raro, raro.                          | Egun garbia. Arraroa, oso arraroa.                                       |

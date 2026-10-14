/**
 * Colores de club que puede elegir un equipo. Paleta cerrada (la misma que admite
 * la BD) para que el texto blanco sobre el color siempre tenga contraste AA.
 * Los valores de cada color viven en styles.scss (`[data-klub='…']`).
 */
export const COLORES_KLUB = [
  'urdin',
  'zeru',
  'berde',
  'gorri',
  'granate',
  'more',
  'laranja',
  'beltz',
] as const;

export type ColorKlub = (typeof COLORES_KLUB)[number];

export const COLOR_KLUB_INICIAL: ColorKlub = 'urdin';

export function colorKlub(valor: string | null | undefined): ColorKlub {
  return (COLORES_KLUB as readonly string[]).includes(valor ?? '')
    ? (valor as ColorKlub)
    : COLOR_KLUB_INICIAL;
}

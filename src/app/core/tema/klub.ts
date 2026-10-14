/**
 * Colores del club. Cada equipo guarda dos: el principal (pase, enlaces, pestaña
 * activa…) y el secundario (las rayas del escudo y de la cinta). Se eligen entre
 * combinaciones hechas o, en «Personalizado», libremente de la PALETA.
 *
 * Todo lo que depende del contraste se calcula aquí: el texto sobre el color
 * (blanco u oscuro), la tinta para enlaces sobre el fondo y los tonos de oscuro.
 * Así cualquier combinación se lee bien (WCAG AA).
 */

export interface ColoresKlub {
  color: string;
  secundario: string;
}

export const PALETA = [
  { clave: 'urdin', hex: '#0b5cad' },
  { clave: 'zeru', hex: '#4aa3df' },
  { clave: 'itsas', hex: '#14284b' },
  { clave: 'berde', hex: '#0f6b3a' },
  { clave: 'berde-argi', hex: '#3cb371' },
  { clave: 'gorri', hex: '#c8102e' },
  { clave: 'granate', hex: '#7a1f3d' },
  { clave: 'arrosa', hex: '#e4579b' },
  { clave: 'more', hex: '#5b2a86' },
  { clave: 'laranja', hex: '#f07c00' },
  { clave: 'hori', hex: '#ffcc00' },
  { clave: 'urre', hex: '#c9a227' },
  { clave: 'marroi', hex: '#6b3e26' },
  { clave: 'gris', hex: '#8a8d91' },
  { clave: 'beltz', hex: '#1a1a1a' },
  { clave: 'zuri', hex: '#ffffff' },
] as const;

export type ClaveColor = (typeof PALETA)[number]['clave'];

/** Combinaciones hechas: el color del club con rayas blancas. */
export const COMBINACIONES = (
  ['urdin', 'zeru', 'berde', 'gorri', 'granate', 'more', 'laranja', 'beltz'] as const
).map((clave) => ({
  clave,
  color: PALETA.find((c) => c.clave === clave)!.hex,
  secundario: '#ffffff',
}));

export const COLORES_INICIALES: ColoresKlub = { color: '#0b5cad', secundario: '#ffffff' };

const HEX = /^#[0-9a-f]{6}$/;

export function normalizarColores(
  color: string | null | undefined,
  secundario: string | null | undefined,
): ColoresKlub {
  return {
    color: color && HEX.test(color) ? color : COLORES_INICIALES.color,
    secundario: secundario && HEX.test(secundario) ? secundario : COLORES_INICIALES.secundario,
  };
}

// --- Contraste (WCAG) --------------------------------------------------------------

type Rgb = [number, number, number];

const aRgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;
const aHex = (rgb: Rgb): string =>
  '#' +
  rgb
    .map((v) =>
      Math.round(Math.min(255, Math.max(0, v)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');

/** Mezcla `hex` con `con` (0 = hex, 1 = con). */
function mezclar(hex: string, con: string, cuanto: number): string {
  const a = aRgb(hex);
  const b = aRgb(con);
  return aHex(a.map((v, i) => v + (b[i] - v) * cuanto) as Rgb);
}

function luminancia(hex: string): number {
  const [r, g, b] = aRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const BLANCO = '#ffffff';
const TINTA_OSCURA = '#1e1612';
const FONDO_CLARO = '#f7f1ec';
const FONDO_OSCURO = '#14100e';

/** Oscurece (o aclara) hasta tener contraste AA con `fondo`. */
function legibleSobre(hex: string, fondo: string, hacia: string): string {
  let tinta = hex;
  for (let paso = 0; paso < 12 && contraste(tinta, fondo) < 4.5; paso++) {
    tinta = mezclar(tinta, hacia, 0.12);
  }
  return tinta;
}

/** Texto sobre el color: blanco si se lee; si no, tinta oscura. */
const sobre = (hex: string): string => (contraste(hex, BLANCO) >= 4.5 ? BLANCO : TINTA_OSCURA);

export interface TokensKlub {
  klub: string;
  sakon: string;
  tinta: string;
  sobre: string;
}

/** Tokens para el tema claro y el oscuro (en oscuro el color se apaga un poco). */
export function tokensKlub(color: string): { claro: TokensKlub; oscuro: TokensKlub } {
  // Con texto oscuro encima, el degradado oscurece poco para que siga leyéndose.
  const conTextoOscuro = sobre(color) !== BLANCO;
  const sakon = mezclar(color, '#000000', conTextoOscuro ? 0.08 : 0.22);
  const klubOscuro = conTextoOscuro ? color : mezclar(color, '#000000', 0.15);
  return {
    claro: {
      klub: color,
      sakon,
      tinta: legibleSobre(color, FONDO_CLARO, '#000000'),
      sobre: sobre(color),
    },
    oscuro: {
      klub: klubOscuro,
      sakon: mezclar(color, '#000000', conTextoOscuro ? 0.12 : 0.38),
      tinta: legibleSobre(color, FONDO_OSCURO, '#ffffff'),
      sobre: sobre(klubOscuro),
    },
  };
}

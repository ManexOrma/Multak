/** Importe máximo que se acepta al teclear (evita errores de dedo): 1.000 €. */
export const IMPORTE_MAXIMO_CENTIMOS = 100_000;

/**
 * Convierte lo que teclea el usuario («2,50», «2.5», «3», «3 €») a céntimos.
 * Devuelve null si no es un importe válido y positivo.
 */
export function eurosACentimos(texto: string): number | null {
  const limpio = texto.replace(/[€\s]/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return null;
  const centimos = Math.round(Number(limpio) * 100);
  return centimos > 0 && centimos <= IMPORTE_MAXIMO_CENTIMOS ? centimos : null;
}

/** Céntimos a texto editable en español: 250 → «2,50», 300 → «3». */
export function centimosATexto(centimos: number): string {
  return centimos % 100 === 0
    ? String(centimos / 100)
    : (centimos / 100).toFixed(2).replace('.', ',');
}

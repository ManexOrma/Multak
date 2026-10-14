/** Fecha local de hoy en formato de la BD (AAAA-MM-DD). */
export function hoyISO(ahora: Date = new Date()): string {
  return aISO(ahora);
}

/** Date local → AAAA-MM-DD. */
export function aISO(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** AAAA-MM-DD → Date local (sin desfase de zona horaria). */
export function deISO(fechaISO: string): Date {
  const [a, m, d] = fechaISO.split('-').map(Number);
  return new Date(a, m - 1, d);
}

const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

/** «Hoy», «Ayer», el día de la semana (última semana) o la fecha, en el idioma dado. */
export function fechaRelativa(
  fechaISO: string,
  locale: string,
  textos: { hoy: string; ayer: string },
  ahora: Date = new Date(),
): string {
  const fecha = deISO(fechaISO);
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const dias = Math.round((hoy.getTime() - fecha.getTime()) / 86_400_000);
  if (dias === 0) return textos.hoy;
  if (dias === 1) return textos.ayer;
  if (dias > 1 && dias < 7) {
    return capitalizar(new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(fecha));
  }
  const opciones: Intl.DateTimeFormatOptions =
    fecha.getFullYear() === ahora.getFullYear()
      ? { day: 'numeric', month: 'long' }
      : { day: 'numeric', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat(locale, opciones).format(fecha);
}

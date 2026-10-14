/** Fecha local de hoy en formato de la BD (AAAA-MM-DD). */
export function hoyISO(ahora: Date = new Date()): string {
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

const DIA_SEMANA = new Intl.DateTimeFormat('es-ES', { weekday: 'long' });
const DIA_MES = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' });
const DIA_MES_ANO = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** «Hoy», «Ayer», «Lunes» (última semana), «6 de octubre» o «6 de octubre de 2025». */
export function fechaRelativa(fechaISO: string, ahora: Date = new Date()): string {
  const [a, m, d] = fechaISO.split('-').map(Number);
  const fecha = new Date(a, m - 1, d);
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const dias = Math.round((hoy.getTime() - fecha.getTime()) / 86_400_000);
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Ayer';
  if (dias > 1 && dias < 7) {
    const nombre = DIA_SEMANA.format(fecha);
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  }
  return a === ahora.getFullYear() ? DIA_MES.format(fecha) : DIA_MES_ANO.format(fecha);
}

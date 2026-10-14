import { fechaRelativa, hoyISO } from './fechas';

describe('fechas', () => {
  const ahora = new Date(2026, 9, 14); // 14 oct 2026 (martes)

  it('hoyISO usa la fecha local', () => {
    expect(hoyISO(ahora)).toBe('2026-10-14');
  });

  it('fechaRelativa', () => {
    expect(fechaRelativa('2026-10-14', ahora)).toBe('Hoy');
    expect(fechaRelativa('2026-10-13', ahora)).toBe('Ayer');
    expect(fechaRelativa('2026-10-10', ahora)).toBe('Sábado');
    expect(fechaRelativa('2026-09-20', ahora)).toBe('20 de septiembre');
    expect(fechaRelativa('2025-09-20', ahora)).toBe('20 de septiembre de 2025');
  });
});

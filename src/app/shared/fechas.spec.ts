import { aISO, deISO, fechaRelativa, hoyISO } from './fechas';

describe('fechas', () => {
  const ahora = new Date(2026, 9, 14); // 14 oct 2026 (martes)
  const es = { hoy: 'Hoy', ayer: 'Ayer' };

  it('hoyISO y conversiones usan la fecha local', () => {
    expect(hoyISO(ahora)).toBe('2026-10-14');
    expect(aISO(deISO('2026-02-03'))).toBe('2026-02-03');
  });

  it('fechaRelativa en castellano', () => {
    expect(fechaRelativa('2026-10-14', 'es-ES', es, ahora)).toBe('Hoy');
    expect(fechaRelativa('2026-10-13', 'es-ES', es, ahora)).toBe('Ayer');
    expect(fechaRelativa('2026-10-10', 'es-ES', es, ahora)).toBe('Sábado');
    expect(fechaRelativa('2026-09-20', 'es-ES', es, ahora)).toBe('20 de septiembre');
    expect(fechaRelativa('2025-09-20', 'es-ES', es, ahora)).toBe('20 de septiembre de 2025');
  });

  it('fechaRelativa en euskera', () => {
    expect(fechaRelativa('2026-10-14', 'eu', { hoy: 'Gaur', ayer: 'Atzo' }, ahora)).toBe('Gaur');
    expect(fechaRelativa('2026-10-10', 'eu', { hoy: 'Gaur', ayer: 'Atzo' }, ahora)).toBe(
      'Larunbata',
    );
  });
});

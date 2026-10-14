import { contraste, normalizarColores, PALETA, tokensKlub } from './klub';

describe('colores del club', () => {
  it('con cualquier color de la paleta, el texto encima y los enlaces se leen (AA)', () => {
    for (const { hex } of PALETA) {
      const { claro, oscuro } = tokensKlub(hex);
      expect(contraste(claro.sobre, claro.klub), `sobre ${hex}`).toBeGreaterThanOrEqual(4.5);
      expect(contraste(claro.tinta, '#f7f1ec'), `tinta ${hex}`).toBeGreaterThanOrEqual(4.5);
      expect(contraste(oscuro.sobre, oscuro.klub), `sobre oscuro ${hex}`).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contraste(oscuro.tinta, '#14100e'), `tinta oscura ${hex}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('colores no válidos vuelven a los iniciales', () => {
    expect(normalizarColores('rojo', null)).toEqual({ color: '#0b5cad', secundario: '#ffffff' });
    expect(normalizarColores('#c8102e', '#ffcc00')).toEqual({
      color: '#c8102e',
      secundario: '#ffcc00',
    });
  });
});

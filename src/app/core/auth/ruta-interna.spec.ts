import { RUTA_INICIO, rutaInterna } from './ruta-interna';

describe('rutaInterna', () => {
  it('acepta rutas internas', () => {
    expect(rutaInterna('/unirse/VESTUAR2')).toBe('/unirse/VESTUAR2');
    expect(rutaInterna('/e/123?x=1')).toBe('/e/123?x=1');
  });

  it('sin volver, va al inicio', () => {
    expect(rutaInterna(undefined)).toBe(RUTA_INICIO);
    expect(rutaInterna(null)).toBe(RUTA_INICIO);
    expect(rutaInterna('')).toBe(RUTA_INICIO);
  });

  it('rechaza redirecciones a otros dominios', () => {
    expect(rutaInterna('https://malo.com')).toBe(RUTA_INICIO);
    expect(rutaInterna('//malo.com')).toBe(RUTA_INICIO);
    expect(rutaInterna('/\\malo.com')).toBe(RUTA_INICIO);
    expect(rutaInterna('javascript:alert(1)')).toBe(RUTA_INICIO);
  });
});

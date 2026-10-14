import { centimosATexto, eurosACentimos } from './importe';

describe('eurosACentimos', () => {
  it('entiende comas, puntos y el símbolo del euro', () => {
    expect(eurosACentimos('2,50')).toBe(250);
    expect(eurosACentimos('2.5')).toBe(250);
    expect(eurosACentimos('3')).toBe(300);
    expect(eurosACentimos(' 10 € ')).toBe(1000);
    expect(eurosACentimos('0,1')).toBe(10);
  });

  it('rechaza lo que no es un importe válido', () => {
    expect(eurosACentimos('')).toBeNull();
    expect(eurosACentimos('0')).toBeNull();
    expect(eurosACentimos('-2')).toBeNull();
    expect(eurosACentimos('2,555')).toBeNull();
    expect(eurosACentimos('abc')).toBeNull();
    expect(eurosACentimos('1000,01')).toBeNull();
  });
});

describe('centimosATexto', () => {
  it('formatea para editar', () => {
    expect(centimosATexto(250)).toBe('2,50');
    expect(centimosATexto(300)).toBe('3');
    expect(centimosATexto(5)).toBe('0,05');
  });
});

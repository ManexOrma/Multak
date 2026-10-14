import { mensajeError } from './mensaje-error';

describe('mensajeError', () => {
  it('usa el mensaje de nuestras RPCs', () => {
    expect(mensajeError({ code: 'P0001', message: 'Esa ficha ya no está libre.' })).toBe(
      'Esa ficha ya no está libre.',
    );
    expect(mensajeError({ code: '42501', message: 'Solo un admin puede cambiar roles.' })).toBe(
      'Solo un admin puede cambiar roles.',
    );
  });

  it('oculta los mensajes internos de Postgres', () => {
    expect(mensajeError({ code: '42501', message: 'permission denied for table multas' })).toBe(
      'No tienes permiso para hacer esto.',
    );
    expect(
      mensajeError({ code: '23514', message: 'new row violates check constraint "x"' }),
    ).toContain('no es válido');
  });

  it('sin conexión', () => {
    expect(mensajeError({ message: 'TypeError: Failed to fetch' })).toContain('conexión');
  });

  it('cualquier otra cosa', () => {
    expect(mensajeError(undefined)).toContain('Vuelve a intentarlo');
  });
});

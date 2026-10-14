import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';
import { claveError } from './mensaje-error';

describe('claveError', () => {
  it('traduce los mensajes de nuestras RPCs', () => {
    expect(
      claveError({
        code: 'P0001',
        message: 'Esa ficha ya no está libre. Elige otra o entra como nuevo.',
      }),
    ).toBe('error.db.ficha-ocupada');
    expect(
      claveError({
        code: '42501',
        message: 'Solo un admin puede cambiar el enlace de invitación.',
      }),
    ).toBe('error.db.solo-admin-enlace');
  });

  it('oculta los mensajes internos de Postgres', () => {
    expect(claveError({ code: '42501', message: 'permission denied for table multas' })).toBe(
      'error.permiso',
    );
    expect(claveError({ code: '23514', message: 'new row violates check constraint "x"' })).toBe(
      'error.datos',
    );
  });

  it('errores de login', () => {
    expect(claveError(new AuthApiError('expired', 403, 'otp_expired'))).toBe('error.auth.codigo');
    expect(claveError(new AuthApiError('rate', 429, 'over_email_send_rate_limit'))).toBe(
      'error.auth.demasiados',
    );
    expect(claveError(new AuthRetryableFetchError('Failed to fetch', 0))).toBe('error.conexion');
  });

  it('sin conexión y cualquier otra cosa', () => {
    expect(claveError({ message: 'TypeError: Failed to fetch' })).toBe('error.conexion');
    expect(claveError(undefined)).toBe('error.generico');
  });
});

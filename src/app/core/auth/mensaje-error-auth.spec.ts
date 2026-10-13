import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';
import { mensajeErrorAuth } from './mensaje-error-auth';

describe('mensajeErrorAuth', () => {
  it('código incorrecto o caducado', () => {
    const error = new AuthApiError('Token has expired or is invalid', 403, 'otp_expired');
    expect(mensajeErrorAuth(error)).toContain('caducado');
  });

  it('demasiados envíos', () => {
    const error = new AuthApiError('rate limit', 429, 'over_email_send_rate_limit');
    expect(mensajeErrorAuth(error)).toContain('Espera');
  });

  it('sin conexión', () => {
    expect(mensajeErrorAuth(new AuthRetryableFetchError('Failed to fetch', 0))).toContain(
      'conexión',
    );
  });

  it('cualquier otro error da un mensaje genérico', () => {
    expect(mensajeErrorAuth(new Error('x'))).toContain('Vuelve a intentarlo');
  });
});

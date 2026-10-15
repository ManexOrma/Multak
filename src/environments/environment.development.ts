// Desarrollo contra Supabase local (`npm run db:start`). La clave publishable sale en `npx supabase status`.
export const environment = {
  production: false,
  supabaseUrl: 'http://127.0.0.1:54321',
  supabaseKey: 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
  // En local no hay cliente OAuth de Google configurado (ver README).
  loginGoogle: false,
  // Clave pública VAPID de las notificaciones push (la privada solo está en los secretos de Supabase).
  vapidPublicKey:
    'BM2rsDAjqjDRphQmcGnAt80kiaAYOZQ9VUwD2VjHmhtCm6vLti1TO8yScwLNepqqXFTVx5_WfnZfOsSjLscBGGs',
};

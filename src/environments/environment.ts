// Producción. La URL y la clave publishable pueden ir en el repo: la protección la dan las RLS.
// La clave secret/service_role NUNCA va aquí.
export const environment = {
  production: true,
  supabaseUrl: 'https://htvzktptkyuvfmxofuwd.supabase.co',
  supabaseKey: 'sb_publishable_dOphFM-IECvbOwGid4cnAQ_57RVxxhx',
  loginGoogle: true,
  // Clave pública VAPID de las notificaciones push (la privada solo está en los secretos de Supabase).
  vapidPublicKey:
    'BM2rsDAjqjDRphQmcGnAt80kiaAYOZQ9VUwD2VjHmhtCm6vLti1TO8yScwLNepqqXFTVx5_WfnZfOsSjLscBGGs',
};

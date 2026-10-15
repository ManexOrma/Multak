-- Notificaciones push (Web Push). Una fila por dispositivo con las notificaciones
-- activadas. Las envía la Edge Function «notificar» con la clave service_role; desde
-- la app cada persona solo ve, crea y borra las suyas.

create table public.suscripciones_push (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- URL del servicio de push del navegador (única por dispositivo y navegador).
  endpoint text not null unique check (endpoint ~ '^https://'),
  p256dh text not null check (char_length(p256dh) between 1 and 200),
  auth text not null check (char_length(auth) between 1 and 100),
  -- Idioma de los avisos en este dispositivo.
  idioma text not null default 'eu' check (idioma in ('eu', 'es')),
  creado_en timestamptz not null default now()
);

create index suscripciones_push_usuario on public.suscripciones_push (usuario_id);

alter table public.suscripciones_push enable row level security;

create policy "Cada uno ve sus suscripciones" on public.suscripciones_push
  for select to authenticated
  using (usuario_id = (select auth.uid()));

create policy "Cada uno crea sus suscripciones" on public.suscripciones_push
  for insert to authenticated
  with check (usuario_id = (select auth.uid()));

create policy "Cada uno cambia sus suscripciones" on public.suscripciones_push
  for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

create policy "Cada uno borra sus suscripciones" on public.suscripciones_push
  for delete to authenticated
  using (usuario_id = (select auth.uid()));

revoke all on public.suscripciones_push from anon;
grant select, insert, delete on public.suscripciones_push to authenticated;
grant update (idioma) on public.suscripciones_push to authenticated;

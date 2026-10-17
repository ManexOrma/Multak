-- Recordatorios mensuales de deuda (notificación push). Tres al mes, a quien debe algo
-- en un equipo:
--   'faltan-5'  → quedan 5 días para que acabe el mes;
--   'falta-1'   → queda 1 día;
--   'mes-nuevo' → el día 1, si el mes acabó y sigue debiendo.
-- Cada día, pg_cron llama a la Edge Function «recordatorios», que pide a
-- recordatorios_de_hoy() la lista y envía los avisos. Lo enviado se apunta: aunque la
-- función se llame varias veces, nadie recibe el mismo recordatorio dos veces.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

create table public.recordatorios_enviados (
  usuario_id uuid not null references auth.users (id) on delete cascade,
  equipo_id uuid not null references public.equipos (id) on delete cascade,
  dia date not null,
  tipo text not null check (tipo in ('faltan-5', 'falta-1', 'mes-nuevo')),
  enviado_en timestamptz not null default now(),
  primary key (usuario_id, equipo_id, dia, tipo)
);

-- Solo la usa la función de abajo (security definer); nadie más la lee ni la escribe.
alter table public.recordatorios_enviados enable row level security;
revoke all on public.recordatorios_enviados from public, anon, authenticated;

-- Qué recordatorio toca un día (hora de Madrid) o null.
create function private.tipo_recordatorio(p_dia date)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_dia = (date_trunc('month', p_dia) + interval '1 month - 1 day')::date - 5 then 'faltan-5'
    when p_dia = (date_trunc('month', p_dia) + interval '1 month - 1 day')::date - 1 then 'falta-1'
    when extract(day from p_dia) = 1 then 'mes-nuevo'
  end;
$$;

-- Lista de recordatorios pendientes de hoy y los marca como enviados (de una vez).
-- Solo para la Edge Function (service_role).
create function public.recordatorios_de_hoy(
  hoy date default (now() at time zone 'Europe/Madrid')::date
)
returns table (
  usuario_id uuid,
  equipo_id uuid,
  equipo_nombre text,
  saldo_centimos bigint,
  tipo text,
  dia date
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tipo text := private.tipo_recordatorio(hoy);
begin
  if v_tipo is null then
    return;
  end if;

  return query
  with deudas as (
    select s.usuario_id, s.equipo_id, e.nombre, s.saldo_centimos
    from public.saldos_miembros s
    join public.equipos e on e.id = s.equipo_id
    where s.usuario_id is not null and s.activo and not s.pendiente and s.saldo_centimos > 0
  ),
  nuevos as (
    insert into public.recordatorios_enviados (usuario_id, equipo_id, dia, tipo)
    select d.usuario_id, d.equipo_id, hoy, v_tipo from deudas d
    on conflict do nothing
    returning recordatorios_enviados.usuario_id, recordatorios_enviados.equipo_id
  )
  select d.usuario_id, d.equipo_id, d.nombre, d.saldo_centimos, v_tipo, hoy
  from deudas d
  join nuevos n on n.usuario_id = d.usuario_id and n.equipo_id = d.equipo_id;
end;
$$;

revoke all on function private.tipo_recordatorio(date) from public;
revoke all on function public.recordatorios_de_hoy(date) from public, anon, authenticated;
grant execute on function public.recordatorios_de_hoy(date) to service_role;

-- Dónde están las Edge Functions (en local, seed.sql lo cambia por la URL de Docker).
create table private.ajustes (
  clave text primary key,
  valor text not null
);
insert into private.ajustes (clave, valor)
values ('url_funciones', 'https://htvzktptkyuvfmxofuwd.supabase.co/functions/v1');

-- Todos los días a las 17:00 UTC (18:00 o 19:00 en Madrid). La función es inofensiva
-- si se llama de más: solo envía lo que toca hoy y no repite.
select cron.schedule(
  'multak-recordatorios',
  '0 17 * * *',
  $$
    select net.http_post(
      url := (select valor from private.ajustes where clave = 'url_funciones') || '/recordatorios',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);

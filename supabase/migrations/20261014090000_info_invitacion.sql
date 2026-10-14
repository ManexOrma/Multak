-- Datos mínimos del equipo de un código de invitación, para la pantalla de unirse
-- («Te unes a CD Vestuario»). Vacío si el código no existe. Solo id y nombre.
create function public.info_invitacion(codigo text)
returns table (equipo_id uuid, equipo_nombre text)
language sql
stable
security definer
set search_path = ''
as $$
  select e.id, e.nombre
  from public.equipos e
  where e.codigo_invitacion = private.normalizar_codigo(info_invitacion.codigo);
$$;

revoke all on function public.info_invitacion(text) from public, anon;
grant execute on function public.info_invitacion(text) to authenticated;

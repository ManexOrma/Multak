-- Foto del equipo: la sube el admin y solo la ven los miembros activos.
-- Se guarda en Storage (bucket privado «equipos») en «<equipo_id>/foto.jpg».
-- foto_version: null = sin foto; cambia con cada subida (sirve para refrescar cachés).

alter table public.equipos add column foto_version integer check (foto_version > 0);

-- El admin ya puede actualizar su equipo (política existente); se le permite esta columna.
grant update (foto_version) on public.equipos to authenticated;

-- Bucket privado, solo imágenes y como mucho 1 MB (la app las reduce antes de subirlas).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('equipos', 'equipos', false, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- La primera carpeta de la ruta es el id del equipo.
create function private.equipo_de_ruta(p_nombre text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case
    when (storage.foldername(p_nombre))[1] ~ '^[0-9a-f-]{36}$'
      then (storage.foldername(p_nombre))[1]::uuid
  end;
$$;

revoke all on function private.equipo_de_ruta(text) from public;
grant execute on function private.equipo_de_ruta(text) to authenticated;

create policy "Miembros ven la foto de su equipo" on storage.objects
  for select to authenticated
  using (bucket_id = 'equipos' and private.es_miembro(private.equipo_de_ruta(name)));

create policy "Admin sube la foto del equipo" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'equipos' and private.tiene_rol(private.equipo_de_ruta(name), '{admin}')
  );

create policy "Admin cambia la foto del equipo" on storage.objects
  for update to authenticated
  using (bucket_id = 'equipos' and private.tiene_rol(private.equipo_de_ruta(name), '{admin}'))
  with check (
    bucket_id = 'equipos' and private.tiene_rol(private.equipo_de_ruta(name), '{admin}')
  );

create policy "Admin quita la foto del equipo" on storage.objects
  for delete to authenticated
  using (bucket_id = 'equipos' and private.tiene_rol(private.equipo_de_ruta(name), '{admin}'));

-- mis_equipos devuelve también la versión de la foto (cambia el tipo de retorno).
drop function public.mis_equipos();

create function public.mis_equipos()
returns table (
  equipo_id uuid,
  equipo_nombre text,
  miembro_id uuid,
  mi_nombre text,
  rol public.rol_miembro,
  activo boolean,
  pendiente boolean,
  foto_version integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select e.id, e.nombre, m.id, m.nombre, m.rol, m.activo, m.pendiente, e.foto_version
  from public.miembros m
  join public.equipos e on e.id = m.equipo_id
  where m.usuario_id = (select auth.uid())
  order by e.nombre;
$$;

revoke all on function public.mis_equipos() from public, anon;
grant execute on function public.mis_equipos() to authenticated;

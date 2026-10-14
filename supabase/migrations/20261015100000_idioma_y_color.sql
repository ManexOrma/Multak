-- Color del club: lo elige quien crea el equipo y lo cambia el admin. Viste la app
-- (tarjeta del inicio, escudo, cinta de la tarjeta amarilla). Paleta cerrada para
-- garantizar el contraste del texto blanco sobre el color.
alter table public.equipos
  add column color text not null default 'urdin'
  check (color in ('urdin', 'zeru', 'berde', 'gorri', 'granate', 'more', 'laranja', 'beltz'));

grant update (color) on public.equipos to authenticated;

-- mis_equipos devuelve también el color (cambia el tipo de retorno).
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
  foto_version integer,
  color text
)
language sql
stable
security definer
set search_path = ''
as $$
  select e.id, e.nombre, m.id, m.nombre, m.rol, m.activo, m.pendiente, e.foto_version, e.color
  from public.miembros m
  join public.equipos e on e.id = m.equipo_id
  where m.usuario_id = (select auth.uid())
  order by e.nombre;
$$;

revoke all on function public.mis_equipos() from public, anon;
grant execute on function public.mis_equipos() to authenticated;

-- crear_equipo: el catálogo de ejemplo de un equipo nuevo, en el idioma de quien lo crea
-- (euskera por defecto; 'es' para castellano) y con su color.
drop function public.crear_equipo(text, text, boolean);

create function public.crear_equipo(
  nombre_equipo text,
  mi_nombre text,
  con_catalogo_ejemplo boolean default true,
  idioma text default 'eu',
  color text default 'urdin'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_equipo_id uuid;
begin
  if v_uid is null then
    raise exception 'Tienes que iniciar sesión.' using errcode = '42501';
  end if;

  insert into public.equipos (nombre, codigo_invitacion, color)
  values (btrim(crear_equipo.nombre_equipo), private.generar_codigo(), crear_equipo.color)
  returning id into v_equipo_id;

  insert into public.miembros (equipo_id, usuario_id, nombre, rol)
  values (v_equipo_id, v_uid, btrim(crear_equipo.mi_nombre), 'admin');

  if crear_equipo.con_catalogo_ejemplo then
    if crear_equipo.idioma = 'es' then
      insert into public.tipos_multa (equipo_id, nombre, importe_centimos)
      values
        (v_equipo_id, 'Llegar tarde al entreno', 200),
        (v_equipo_id, 'Llegar tarde al partido', 500),
        (v_equipo_id, 'Faltar sin avisar', 500),
        (v_equipo_id, 'Olvidar la equipación', 300),
        (v_equipo_id, 'Tarjeta amarilla', 300),
        (v_equipo_id, 'Tarjeta roja', 1000),
        (v_equipo_id, 'Móvil en la charla', 200);
    else
      insert into public.tipos_multa (equipo_id, nombre, importe_centimos)
      values
        (v_equipo_id, 'Entrenamendura berandu iristea', 200),
        (v_equipo_id, 'Partidura berandu iristea', 500),
        (v_equipo_id, 'Abisatu gabe huts egitea', 500),
        (v_equipo_id, 'Ekipazioa ahaztea', 300),
        (v_equipo_id, 'Txartel horia', 300),
        (v_equipo_id, 'Txartel gorria', 1000),
        (v_equipo_id, 'Mugikorra hitzaldian', 200);
    end if;
  end if;

  return v_equipo_id;
end;
$$;

revoke all on function public.crear_equipo(text, text, boolean, text, text) from public, anon;
grant execute on function public.crear_equipo(text, text, boolean, text, text) to authenticated;

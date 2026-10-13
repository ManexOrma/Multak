-- =============================================================================
-- Esquema inicial de Multas: tablas, restricciones, índices, triggers,
-- funciones auxiliares, RLS, RPCs y vistas de saldos.
--
-- Principios (ver docs/PROYECTO.md):
--   * Todo cuelga de equipo_id; las FKs compuestas impiden cruzar equipos.
--   * Importes en céntimos (integer > 0).
--   * Multas, pagos y gastos no se editan ni se borran: se anulan por RPC.
--   * La seguridad vive aquí (RLS + privilegios por columna), no en el front.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Esquema privado (no expuesto por la API) para funciones auxiliares
-- -----------------------------------------------------------------------------

create schema if not exists private;
revoke all on schema private from public;
-- Las políticas RLS llaman a private.es_miembro/tiene_rol con el rol del usuario.
grant usage on schema private to authenticated;


-- -----------------------------------------------------------------------------
-- Tipos
-- -----------------------------------------------------------------------------

create type public.rol_miembro as enum ('admin', 'tesorero', 'jugador');
create type public.metodo_pago as enum ('bizum', 'efectivo', 'otro');


-- -----------------------------------------------------------------------------
-- Tablas
-- -----------------------------------------------------------------------------

create table public.equipos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(btrim(nombre)) between 1 and 60),
  -- 8 caracteres sin ambiguos (sin 0/O, 1/I/L).
  codigo_invitacion text not null unique
    check (codigo_invitacion ~ '^[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{8}$'),
  creado_en timestamptz not null default now(),
  creado_por uuid
);

create table public.miembros (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references public.equipos (id) on delete cascade,
  -- Nulo = ficha sin cuenta (dada de alta por el admin, reclamable con el enlace).
  usuario_id uuid references auth.users (id) on delete set null,
  nombre text not null check (char_length(btrim(nombre)) between 1 and 40),
  rol public.rol_miembro not null default 'jugador',
  activo boolean not null default true,
  -- Solicitud de alguien que entró como nuevo: inactiva hasta que un admin la acepte.
  pendiente boolean not null default false,
  creado_en timestamptz not null default now(),
  creado_por uuid,
  constraint miembros_pendiente_coherente
    check (not pendiente or (usuario_id is not null and not activo and rol = 'jugador')),
  -- Una ficha sin cuenta solo puede ser jugador: quien reclame la ficha con el
  -- enlace de invitación no puede heredar permisos de admin o tesorero.
  constraint miembros_rol_requiere_cuenta check (usuario_id is not null or rol = 'jugador'),
  constraint miembros_id_equipo_key unique (id, equipo_id)
);

create unique index miembros_equipo_usuario_key
  on public.miembros (equipo_id, usuario_id)
  where usuario_id is not null;

create table public.tipos_multa (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references public.equipos (id) on delete cascade,
  nombre text not null check (char_length(btrim(nombre)) between 1 and 60),
  importe_centimos integer not null check (importe_centimos > 0),
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  creado_por uuid,
  constraint tipos_multa_id_equipo_key unique (id, equipo_id)
);

create table public.multas (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references public.equipos (id) on delete cascade,
  miembro_id uuid not null,
  -- Nulo = multa libre (concepto e importe a mano).
  tipo_multa_id uuid,
  concepto text not null check (char_length(btrim(concepto)) between 1 and 60),
  importe_centimos integer not null check (importe_centimos > 0),
  fecha date not null default current_date,
  nota text check (char_length(nota) <= 500),
  anulada boolean not null default false,
  anulada_en timestamptz,
  anulada_por uuid,
  creado_en timestamptz not null default now(),
  creado_por uuid,
  constraint multas_miembro_fkey foreign key (miembro_id, equipo_id)
    references public.miembros (id, equipo_id),
  constraint multas_tipo_multa_fkey foreign key (tipo_multa_id, equipo_id)
    references public.tipos_multa (id, equipo_id),
  constraint multas_anulacion_coherente check (anulada = (anulada_en is not null))
);

create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references public.equipos (id) on delete cascade,
  miembro_id uuid not null,
  importe_centimos integer not null check (importe_centimos > 0),
  fecha date not null default current_date,
  metodo public.metodo_pago not null default 'bizum',
  nota text check (char_length(nota) <= 500),
  anulado boolean not null default false,
  anulado_en timestamptz,
  anulado_por uuid,
  creado_en timestamptz not null default now(),
  creado_por uuid,
  constraint pagos_miembro_fkey foreign key (miembro_id, equipo_id)
    references public.miembros (id, equipo_id),
  constraint pagos_anulacion_coherente check (anulado = (anulado_en is not null))
);

create table public.gastos (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references public.equipos (id) on delete cascade,
  concepto text not null check (char_length(btrim(concepto)) between 1 and 60),
  importe_centimos integer not null check (importe_centimos > 0),
  fecha date not null default current_date,
  nota text check (char_length(nota) <= 500),
  anulado boolean not null default false,
  anulado_en timestamptz,
  anulado_por uuid,
  creado_en timestamptz not null default now(),
  creado_por uuid,
  constraint gastos_anulacion_coherente check (anulado = (anulado_en is not null))
);


-- -----------------------------------------------------------------------------
-- Índices (todas las FKs + miembros.usuario_id). Los de (equipo_id, fecha)
-- cubren la FK a equipos y el orden habitual de los listados.
-- -----------------------------------------------------------------------------

create index miembros_equipo_id_idx on public.miembros (equipo_id);
create index miembros_usuario_id_idx on public.miembros (usuario_id);
create index tipos_multa_equipo_id_idx on public.tipos_multa (equipo_id);
create index multas_equipo_fecha_idx on public.multas (equipo_id, fecha desc);
create index multas_miembro_idx on public.multas (miembro_id, equipo_id);
create index multas_tipo_multa_idx on public.multas (tipo_multa_id, equipo_id);
create index pagos_equipo_fecha_idx on public.pagos (equipo_id, fecha desc);
create index pagos_miembro_idx on public.pagos (miembro_id, equipo_id);
create index gastos_equipo_fecha_idx on public.gastos (equipo_id, fecha desc);


-- -----------------------------------------------------------------------------
-- Funciones auxiliares (privadas)
-- -----------------------------------------------------------------------------

-- ¿El usuario actual es miembro activo del equipo?
create function private.es_miembro(p_equipo_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.miembros m
    where m.equipo_id = p_equipo_id
      and m.usuario_id = (select auth.uid())
      and m.activo
  );
$$;

-- ¿El usuario actual es miembro activo del equipo con alguno de estos roles?
create function private.tiene_rol(p_equipo_id uuid, p_roles public.rol_miembro[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.miembros m
    where m.equipo_id = p_equipo_id
      and m.usuario_id = (select auth.uid())
      and m.activo
      and m.rol = any (p_roles)
  );
$$;

revoke all on function private.es_miembro(uuid) from public;
revoke all on function private.tiene_rol(uuid, public.rol_miembro[]) from public;
grant execute on function private.es_miembro(uuid) to authenticated;
grant execute on function private.tiene_rol(uuid, public.rol_miembro[]) to authenticated;

-- Código de invitación aleatorio y único.
create function private.generar_codigo()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alfabeto constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  bytes bytea;
  codigo text;
begin
  loop
    bytes := extensions.gen_random_bytes(8);
    codigo := '';
    for i in 0..7 loop
      codigo := codigo || substr(alfabeto, (get_byte(bytes, i) % length(alfabeto)) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.equipos e where e.codigo_invitacion = codigo);
  end loop;
  return codigo;
end;
$$;

-- Normaliza lo que teclea el usuario: mayúsculas y sin espacios ni guiones.
create function private.normalizar_codigo(p_codigo text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(upper(coalesce(p_codigo, '')), '[^A-Z0-9]', '', 'g');
$$;

-- Bloquea el equipo (serializa operaciones de admins) y falla si, sin contar
-- p_excluido, no queda ningún admin activo.
create function private.exigir_otro_admin(p_equipo_id uuid, p_excluido uuid)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.miembros m
    where m.equipo_id = p_equipo_id
      and m.id <> p_excluido
      and m.rol = 'admin'
      and m.activo
      and m.usuario_id is not null
  ) then
    raise exception 'El equipo tiene que tener al menos un admin. Nombra a otro admin antes.'
      using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function private.generar_codigo() from public;
revoke all on function private.normalizar_codigo(text) from public;
revoke all on function private.exigir_otro_admin(uuid, uuid) from public;


-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

-- creado_por siempre es el usuario autenticado, nunca lo que mande el cliente.
create function private.forzar_creado_por()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.creado_por := auth.uid();
  return new;
end;
$$;

create trigger equipos_creado_por before insert on public.equipos
  for each row execute function private.forzar_creado_por();
create trigger miembros_creado_por before insert on public.miembros
  for each row execute function private.forzar_creado_por();
create trigger tipos_multa_creado_por before insert on public.tipos_multa
  for each row execute function private.forzar_creado_por();
create trigger multas_creado_por before insert on public.multas
  for each row execute function private.forzar_creado_por();
create trigger pagos_creado_por before insert on public.pagos
  for each row execute function private.forzar_creado_por();
create trigger gastos_creado_por before insert on public.gastos
  for each row execute function private.forzar_creado_por();

-- Histórico estable: una multa con tipo copia nombre e importe del catálogo
-- en el momento de ponerla. Además, no se multa a fichas desactivadas.
create function private.preparar_multa()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_tipo record;
begin
  if not exists (
    select 1 from public.miembros m
    where m.id = new.miembro_id and m.equipo_id = new.equipo_id and m.activo
  ) then
    raise exception 'Ese jugador no está activo en el equipo.' using errcode = 'P0001';
  end if;

  if new.tipo_multa_id is not null then
    select t.nombre, t.importe_centimos, t.activo
      into v_tipo
      from public.tipos_multa t
      where t.id = new.tipo_multa_id and t.equipo_id = new.equipo_id;

    if not found or not v_tipo.activo then
      raise exception 'Ese tipo de multa no existe o está desactivado.' using errcode = 'P0001';
    end if;

    new.concepto := v_tipo.nombre;
    new.importe_centimos := v_tipo.importe_centimos;
  end if;

  return new;
end;
$$;

create trigger multas_preparar before insert on public.multas
  for each row execute function private.preparar_multa();

-- Los pagos se admiten en fichas desactivadas (para saldar deudas), no en solicitudes.
create function private.validar_pago()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.miembros m
    where m.id = new.miembro_id and m.equipo_id = new.equipo_id and m.pendiente
  ) then
    raise exception 'Ese miembro aún no ha sido aceptado en el equipo.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger pagos_validar before insert on public.pagos
  for each row execute function private.validar_pago();

-- Si una ficha se queda sin cuenta (desvinculada o cuenta borrada), vuelve a jugador.
create function private.ficha_sin_cuenta_es_jugador()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.usuario_id is null then
    new.rol := 'jugador';
  end if;
  return new;
end;
$$;

create trigger miembros_sin_cuenta_jugador before update of usuario_id on public.miembros
  for each row execute function private.ficha_sin_cuenta_es_jugador();

revoke all on function private.forzar_creado_por() from public;
revoke all on function private.preparar_multa() from public;
revoke all on function private.validar_pago() from public;
revoke all on function private.ficha_sin_cuenta_es_jugador() from public;


-- -----------------------------------------------------------------------------
-- Privilegios: nada para anon; para authenticated, solo lo necesario y por
-- columna (lo demás se hace por RPC). RLS filtra además por fila.
-- -----------------------------------------------------------------------------

revoke all on public.equipos, public.miembros, public.tipos_multa,
  public.multas, public.pagos, public.gastos
  from anon, authenticated;

grant select on public.equipos, public.miembros, public.tipos_multa,
  public.multas, public.pagos, public.gastos
  to authenticated;

grant update (nombre) on public.equipos to authenticated;

grant insert (equipo_id, nombre) on public.miembros to authenticated;
grant update (nombre) on public.miembros to authenticated;

grant insert (equipo_id, nombre, importe_centimos) on public.tipos_multa to authenticated;
grant update (nombre, importe_centimos, activo) on public.tipos_multa to authenticated;

grant insert (equipo_id, miembro_id, tipo_multa_id, concepto, importe_centimos, fecha, nota)
  on public.multas to authenticated;
grant insert (equipo_id, miembro_id, importe_centimos, fecha, metodo, nota)
  on public.pagos to authenticated;
grant insert (equipo_id, concepto, importe_centimos, fecha, nota)
  on public.gastos to authenticated;


-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.equipos enable row level security;
alter table public.miembros enable row level security;
alter table public.tipos_multa enable row level security;
alter table public.multas enable row level security;
alter table public.pagos enable row level security;
alter table public.gastos enable row level security;

-- equipos: se crean por RPC; el admin puede renombrar.
create policy "Miembros leen su equipo" on public.equipos
  for select to authenticated
  using (private.es_miembro(id));

create policy "Admin edita su equipo" on public.equipos
  for update to authenticated
  using (private.tiene_rol(id, '{admin}'))
  with check (private.tiene_rol(id, '{admin}'));

-- miembros: el admin da de alta fichas sin cuenta; nombre editable por el
-- admin o por el propio usuario. Roles, bajas y vínculos van por RPC.
create policy "Miembros leen los miembros de su equipo" on public.miembros
  for select to authenticated
  using (private.es_miembro(equipo_id));

create policy "Admin da de alta fichas sin cuenta" on public.miembros
  for insert to authenticated
  with check (usuario_id is null and private.tiene_rol(equipo_id, '{admin}'));

create policy "Admin o el propio usuario editan el nombre" on public.miembros
  for update to authenticated
  using (
    private.tiene_rol(equipo_id, '{admin}')
    or (usuario_id = (select auth.uid()) and private.es_miembro(equipo_id))
  )
  with check (
    private.tiene_rol(equipo_id, '{admin}')
    or (usuario_id = (select auth.uid()) and private.es_miembro(equipo_id))
  );

-- tipos_multa: tesorero y admin gestionan el catálogo (sin borrar).
create policy "Miembros leen el catálogo" on public.tipos_multa
  for select to authenticated
  using (private.es_miembro(equipo_id));

create policy "Tesorero o admin crean tipos" on public.tipos_multa
  for insert to authenticated
  with check (private.tiene_rol(equipo_id, '{tesorero,admin}'));

create policy "Tesorero o admin editan tipos" on public.tipos_multa
  for update to authenticated
  using (private.tiene_rol(equipo_id, '{tesorero,admin}'))
  with check (private.tiene_rol(equipo_id, '{tesorero,admin}'));

-- multas, pagos y gastos: solo lectura e inserción.
create policy "Miembros leen las multas" on public.multas
  for select to authenticated
  using (private.es_miembro(equipo_id));

create policy "Tesorero o admin ponen multas" on public.multas
  for insert to authenticated
  with check (private.tiene_rol(equipo_id, '{tesorero,admin}'));

create policy "Miembros leen los pagos" on public.pagos
  for select to authenticated
  using (private.es_miembro(equipo_id));

create policy "Tesorero o admin registran pagos" on public.pagos
  for insert to authenticated
  with check (private.tiene_rol(equipo_id, '{tesorero,admin}'));

create policy "Miembros leen los gastos" on public.gastos
  for select to authenticated
  using (private.es_miembro(equipo_id));

create policy "Tesorero o admin registran gastos" on public.gastos
  for insert to authenticated
  with check (private.tiene_rol(equipo_id, '{tesorero,admin}'));


-- -----------------------------------------------------------------------------
-- RPCs (security definer: validan todo dentro)
-- -----------------------------------------------------------------------------

-- Crea un equipo con el usuario actual como admin. Devuelve el id del equipo.
create function public.crear_equipo(
  nombre_equipo text,
  mi_nombre text,
  con_catalogo_ejemplo boolean default true
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

  insert into public.equipos (nombre, codigo_invitacion)
  values (btrim(crear_equipo.nombre_equipo), private.generar_codigo())
  returning id into v_equipo_id;

  insert into public.miembros (equipo_id, usuario_id, nombre, rol)
  values (v_equipo_id, v_uid, btrim(crear_equipo.mi_nombre), 'admin');

  if crear_equipo.con_catalogo_ejemplo then
    insert into public.tipos_multa (equipo_id, nombre, importe_centimos)
    values
      (v_equipo_id, 'Llegar tarde al entreno', 200),
      (v_equipo_id, 'Llegar tarde al partido', 500),
      (v_equipo_id, 'Faltar sin avisar', 500),
      (v_equipo_id, 'Olvidar la equipación', 300),
      (v_equipo_id, 'Tarjeta amarilla', 300),
      (v_equipo_id, 'Tarjeta roja', 1000),
      (v_equipo_id, 'Móvil en la charla', 200);
  end if;

  return v_equipo_id;
end;
$$;

-- Fichas libres (activas y sin cuenta) del equipo con ese código. Solo id y nombre.
create function public.miembros_reclamables(codigo text)
returns table (id uuid, nombre text)
language sql
stable
security definer
set search_path = ''
as $$
  select m.id, m.nombre
  from public.miembros m
  join public.equipos e on e.id = m.equipo_id
  where e.codigo_invitacion = private.normalizar_codigo(miembros_reclamables.codigo)
    and m.usuario_id is null
    and m.activo
  order by m.nombre;
$$;

-- Une al usuario al equipo reclamando una ficha libre (miembro_id), o envía una
-- solicitud como nuevo (mi_nombre) que un admin tiene que aceptar. Devuelve el id
-- del equipo; el estado se consulta con mis_equipos().
create function public.unirse_con_codigo(
  codigo text,
  miembro_id uuid default null,
  mi_nombre text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_equipo_id uuid;
  v_activo boolean;
  v_pendiente boolean;
begin
  if v_uid is null then
    raise exception 'Tienes que iniciar sesión.' using errcode = '42501';
  end if;

  select e.id into v_equipo_id
  from public.equipos e
  where e.codigo_invitacion = private.normalizar_codigo(unirse_con_codigo.codigo);

  if v_equipo_id is null then
    raise exception 'Ese código de invitación no existe. Revisa el enlace o pide uno nuevo.'
      using errcode = 'P0001';
  end if;

  select m.activo, m.pendiente into v_activo, v_pendiente
  from public.miembros m
  where m.equipo_id = v_equipo_id and m.usuario_id = v_uid;

  if found then
    if v_pendiente then
      raise exception 'Tu solicitud ya está enviada. Falta que un admin la acepte.'
        using errcode = 'P0001';
    end if;
    if v_activo then
      raise exception 'Ya estás en este equipo.' using errcode = 'P0001';
    end if;
    raise exception 'Tu ficha en este equipo está desactivada. Pide a un admin que la reactive.'
      using errcode = 'P0001';
  end if;

  if unirse_con_codigo.miembro_id is not null then
    update public.miembros m
    set usuario_id = v_uid
    where m.id = unirse_con_codigo.miembro_id
      and m.equipo_id = v_equipo_id
      and m.usuario_id is null
      and m.activo;

    if not found then
      raise exception 'Esa ficha ya no está libre. Elige otra o entra como nuevo.'
        using errcode = 'P0001';
    end if;
  else
    if coalesce(btrim(unirse_con_codigo.mi_nombre), '') = '' then
      raise exception 'Escribe tu nombre para unirte.' using errcode = 'P0001';
    end if;

    -- Nuevo sin ficha: queda como solicitud hasta que un admin la acepte.
    insert into public.miembros (equipo_id, usuario_id, nombre, rol, activo, pendiente)
    values (v_equipo_id, v_uid, btrim(unirse_con_codigo.mi_nombre), 'jugador', false, true);
  end if;

  return v_equipo_id;
end;
$$;

-- Genera un código nuevo (el anterior deja de valer). Solo admin.
create function public.regenerar_codigo(equipo_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_codigo text;
begin
  if not private.tiene_rol(regenerar_codigo.equipo_id, '{admin}') then
    raise exception 'Solo un admin puede cambiar el enlace de invitación.' using errcode = '42501';
  end if;

  v_codigo := private.generar_codigo();

  update public.equipos e
  set codigo_invitacion = v_codigo
  where e.id = regenerar_codigo.equipo_id;

  return v_codigo;
end;
$$;

-- Anulaciones: tesorero o admin. No se borra nada; se marca y se registra quién y cuándo.
create function public.anular_multa(multa_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_equipo_id uuid;
  v_anulada boolean;
begin
  select m.equipo_id, m.anulada into v_equipo_id, v_anulada
  from public.multas m
  where m.id = anular_multa.multa_id
  for update;

  if not found or not private.tiene_rol(v_equipo_id, '{tesorero,admin}') then
    raise exception 'No puedes anular esta multa.' using errcode = '42501';
  end if;
  if v_anulada then
    raise exception 'Esta multa ya estaba anulada.' using errcode = 'P0001';
  end if;

  update public.multas m
  set anulada = true, anulada_en = now(), anulada_por = auth.uid()
  where m.id = anular_multa.multa_id;
end;
$$;

create function public.anular_pago(pago_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_equipo_id uuid;
  v_anulado boolean;
begin
  select p.equipo_id, p.anulado into v_equipo_id, v_anulado
  from public.pagos p
  where p.id = anular_pago.pago_id
  for update;

  if not found or not private.tiene_rol(v_equipo_id, '{tesorero,admin}') then
    raise exception 'No puedes anular este pago.' using errcode = '42501';
  end if;
  if v_anulado then
    raise exception 'Este pago ya estaba anulado.' using errcode = 'P0001';
  end if;

  update public.pagos p
  set anulado = true, anulado_en = now(), anulado_por = auth.uid()
  where p.id = anular_pago.pago_id;
end;
$$;

create function public.anular_gasto(gasto_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_equipo_id uuid;
  v_anulado boolean;
begin
  select g.equipo_id, g.anulado into v_equipo_id, v_anulado
  from public.gastos g
  where g.id = anular_gasto.gasto_id
  for update;

  if not found or not private.tiene_rol(v_equipo_id, '{tesorero,admin}') then
    raise exception 'No puedes anular este gasto.' using errcode = '42501';
  end if;
  if v_anulado then
    raise exception 'Este gasto ya estaba anulado.' using errcode = 'P0001';
  end if;

  update public.gastos g
  set anulado = true, anulado_en = now(), anulado_por = auth.uid()
  where g.id = anular_gasto.gasto_id;
end;
$$;

-- Gestión de miembros (solo admin). Todas bloquean la fila del equipo para que
-- dos admins a la vez no puedan dejarlo sin admins.
create function private.miembro_para_admin(p_miembro_id uuid)
returns public.miembros
language plpgsql
set search_path = ''
as $$
declare
  v_equipo_id uuid;
  v_miembro public.miembros;
begin
  select m.equipo_id into v_equipo_id from public.miembros m where m.id = p_miembro_id;

  if v_equipo_id is null or not private.tiene_rol(v_equipo_id, '{admin}') then
    raise exception 'Solo un admin del equipo puede gestionar sus miembros.' using errcode = '42501';
  end if;

  perform 1 from public.equipos e where e.id = v_equipo_id for update;
  select * into v_miembro from public.miembros m where m.id = p_miembro_id;
  return v_miembro;
end;
$$;

revoke all on function private.miembro_para_admin(uuid) from public;

create function public.cambiar_rol(miembro_id uuid, rol public.rol_miembro)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_miembro public.miembros := private.miembro_para_admin(cambiar_rol.miembro_id);
begin
  if v_miembro.pendiente then
    raise exception 'Acepta antes la solicitud de esta persona.' using errcode = 'P0001';
  end if;
  if v_miembro.usuario_id is null and cambiar_rol.rol <> 'jugador' then
    raise exception 'Solo se puede dar un rol a alguien con cuenta. Pídele que se una con el enlace.'
      using errcode = 'P0001';
  end if;
  if v_miembro.rol = 'admin' and cambiar_rol.rol <> 'admin' and v_miembro.activo then
    perform private.exigir_otro_admin(v_miembro.equipo_id, v_miembro.id);
  end if;

  update public.miembros m set rol = cambiar_rol.rol where m.id = v_miembro.id;
end;
$$;

create function public.desactivar_miembro(miembro_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_miembro public.miembros := private.miembro_para_admin(desactivar_miembro.miembro_id);
begin
  if v_miembro.pendiente then
    raise exception 'Es una solicitud: acéptala o recházala.' using errcode = 'P0001';
  end if;
  if v_miembro.rol = 'admin' and v_miembro.activo then
    perform private.exigir_otro_admin(v_miembro.equipo_id, v_miembro.id);
  end if;

  update public.miembros m set activo = false where m.id = v_miembro.id;
end;
$$;

create function public.reactivar_miembro(miembro_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_miembro public.miembros := private.miembro_para_admin(reactivar_miembro.miembro_id);
begin
  if v_miembro.pendiente then
    raise exception 'Es una solicitud: acéptala o recházala.' using errcode = 'P0001';
  end if;
  update public.miembros m set activo = true where m.id = v_miembro.id;
end;
$$;

-- Quita la cuenta de una ficha (la ficha y su histórico se quedan, como jugador).
create function public.desvincular_miembro(miembro_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_miembro public.miembros := private.miembro_para_admin(desvincular_miembro.miembro_id);
begin
  if v_miembro.pendiente then
    raise exception 'Es una solicitud: acéptala o recházala.' using errcode = 'P0001';
  end if;
  if v_miembro.usuario_id is null then
    raise exception 'Esta ficha no tiene ninguna cuenta vinculada.' using errcode = 'P0001';
  end if;
  if v_miembro.rol = 'admin' and v_miembro.activo then
    perform private.exigir_otro_admin(v_miembro.equipo_id, v_miembro.id);
  end if;

  update public.miembros m set usuario_id = null where m.id = v_miembro.id;
end;
$$;

-- Solicitudes de nuevos (solo admin).
create function public.aceptar_solicitud(miembro_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_miembro public.miembros := private.miembro_para_admin(aceptar_solicitud.miembro_id);
begin
  if not v_miembro.pendiente then
    raise exception 'Esa solicitud ya no está pendiente.' using errcode = 'P0001';
  end if;

  update public.miembros m set pendiente = false, activo = true where m.id = v_miembro.id;
end;
$$;

-- Rechazar borra la solicitud (no tiene histórico); la persona puede volver a pedirlo.
create function public.rechazar_solicitud(miembro_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_miembro public.miembros := private.miembro_para_admin(rechazar_solicitud.miembro_id);
begin
  if not v_miembro.pendiente then
    raise exception 'Esa solicitud ya no está pendiente.' using errcode = 'P0001';
  end if;

  delete from public.miembros m where m.id = v_miembro.id;
end;
$$;

-- Mis fichas en todos los equipos y en cualquier estado (también solicitudes
-- pendientes y fichas desactivadas, que por RLS no pueden leer el equipo).
create function public.mis_equipos()
returns table (
  equipo_id uuid,
  equipo_nombre text,
  miembro_id uuid,
  mi_nombre text,
  rol public.rol_miembro,
  activo boolean,
  pendiente boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select e.id, e.nombre, m.id, m.nombre, m.rol, m.activo, m.pendiente
  from public.miembros m
  join public.equipos e on e.id = m.equipo_id
  where m.usuario_id = (select auth.uid())
  order by e.nombre;
$$;

-- Solo usuarios autenticados pueden llamar a las RPCs.
revoke all on function public.crear_equipo(text, text, boolean) from public, anon;
revoke all on function public.miembros_reclamables(text) from public, anon;
revoke all on function public.unirse_con_codigo(text, uuid, text) from public, anon;
revoke all on function public.regenerar_codigo(uuid) from public, anon;
revoke all on function public.anular_multa(uuid) from public, anon;
revoke all on function public.anular_pago(uuid) from public, anon;
revoke all on function public.anular_gasto(uuid) from public, anon;
revoke all on function public.cambiar_rol(uuid, public.rol_miembro) from public, anon;
revoke all on function public.desactivar_miembro(uuid) from public, anon;
revoke all on function public.reactivar_miembro(uuid) from public, anon;
revoke all on function public.desvincular_miembro(uuid) from public, anon;
revoke all on function public.aceptar_solicitud(uuid) from public, anon;
revoke all on function public.rechazar_solicitud(uuid) from public, anon;
revoke all on function public.mis_equipos() from public, anon;

grant execute on function public.crear_equipo(text, text, boolean) to authenticated;
grant execute on function public.miembros_reclamables(text) to authenticated;
grant execute on function public.unirse_con_codigo(text, uuid, text) to authenticated;
grant execute on function public.regenerar_codigo(uuid) to authenticated;
grant execute on function public.anular_multa(uuid) to authenticated;
grant execute on function public.anular_pago(uuid) to authenticated;
grant execute on function public.anular_gasto(uuid) to authenticated;
grant execute on function public.cambiar_rol(uuid, public.rol_miembro) to authenticated;
grant execute on function public.desactivar_miembro(uuid) to authenticated;
grant execute on function public.reactivar_miembro(uuid) to authenticated;
grant execute on function public.desvincular_miembro(uuid) to authenticated;
grant execute on function public.aceptar_solicitud(uuid) to authenticated;
grant execute on function public.rechazar_solicitud(uuid) to authenticated;
grant execute on function public.mis_equipos() to authenticated;


-- -----------------------------------------------------------------------------
-- Vistas de saldos (security_invoker: respetan las RLS de quien consulta)
-- -----------------------------------------------------------------------------

-- Por miembro: multas, pagado y saldo pendiente (positivo = debe), sin anulados.
create view public.saldos_miembros
with (security_invoker = on)
as
select
  m.id as miembro_id,
  m.equipo_id,
  m.nombre,
  m.rol,
  m.activo,
  m.pendiente,
  m.usuario_id,
  coalesce(mu.total, 0)::bigint as total_multas_centimos,
  coalesce(pa.total, 0)::bigint as total_pagado_centimos,
  (coalesce(mu.total, 0) - coalesce(pa.total, 0))::bigint as saldo_centimos
from public.miembros m
left join (
  select x.miembro_id, sum(x.importe_centimos) as total
  from public.multas x
  where not x.anulada
  group by x.miembro_id
) mu on mu.miembro_id = m.id
left join (
  select x.miembro_id, sum(x.importe_centimos) as total
  from public.pagos x
  where not x.anulado
  group by x.miembro_id
) pa on pa.miembro_id = m.id;

-- Por equipo: recaudado, gastado, bote y pendiente de cobro (lo que deben los
-- que deben; un saldo a favor no reduce lo que deben los demás).
create view public.resumen_equipo
with (security_invoker = on)
as
select
  e.id as equipo_id,
  r.recaudado::bigint as recaudado_centimos,
  g.gastado::bigint as gastado_centimos,
  (r.recaudado - g.gastado)::bigint as bote_centimos,
  s.pendiente::bigint as pendiente_cobro_centimos
from public.equipos e
cross join lateral (
  select coalesce(sum(p.importe_centimos), 0) as recaudado
  from public.pagos p
  where p.equipo_id = e.id and not p.anulado
) r
cross join lateral (
  select coalesce(sum(x.importe_centimos), 0) as gastado
  from public.gastos x
  where x.equipo_id = e.id and not x.anulado
) g
cross join lateral (
  select coalesce(sum(greatest(sm.saldo_centimos, 0)), 0) as pendiente
  from public.saldos_miembros sm
  where sm.equipo_id = e.id
) s;

revoke all on public.saldos_miembros, public.resumen_equipo from anon, authenticated;
grant select on public.saldos_miembros, public.resumen_equipo to authenticated;

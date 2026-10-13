-- =============================================================================
-- Datos de ejemplo SOLO para desarrollo local (`npm run db:reset`).
-- Nunca se aplica en producción (db push no ejecuta el seed).
--
-- Usuarios de prueba (login con código: el correo llega a Mailpit,
-- http://127.0.0.1:54324):
--   admin@multas.test     → admin del «CD Vestuario» (Iker)
--   tesorero@multas.test  → tesorero del «CD Vestuario» (Ane)
--   jugador@multas.test   → jugador del «CD Vestuario» (Unai)
--   nuevo@multas.test     → solicitud pendiente en el «CD Vestuario» (Jon)
--   rival@multas.test     → admin de «Atlético Banquillo» (otro equipo)
--   libre@multas.test     → sin equipo: prueba crear uno o unirse con VESTUAR2
-- =============================================================================

-- Usuarios -------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated',
  u.email, '', now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(),
  '', '', '', ''
from (values
  ('00000000-0000-4000-a000-000000000001'::uuid, 'admin@multas.test'),
  ('00000000-0000-4000-a000-000000000002'::uuid, 'tesorero@multas.test'),
  ('00000000-0000-4000-a000-000000000003'::uuid, 'jugador@multas.test'),
  ('00000000-0000-4000-a000-000000000004'::uuid, 'nuevo@multas.test'),
  ('00000000-0000-4000-a000-000000000005'::uuid, 'rival@multas.test'),
  ('00000000-0000-4000-a000-000000000006'::uuid, 'libre@multas.test')
) as u (id, email);

insert into auth.identities (user_id, provider_id, provider, identity_data, created_at, updated_at)
select u.id, u.id::text, 'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  now(), now()
from auth.users u
where u.email like '%@multas.test';

-- Equipos ----------------------------------------------------------------------

insert into public.equipos (id, nombre, codigo_invitacion) values
  ('10000000-0000-4000-a000-000000000001', 'CD Vestuario', 'VESTUAR2'),
  ('10000000-0000-4000-a000-000000000002', 'Atlético Banquillo', 'BANQUE22');

-- Miembros -----------------------------------------------------------------

insert into public.miembros (id, equipo_id, usuario_id, nombre, rol, activo, pendiente) values
  -- CD Vestuario
  ('20000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001',
   '00000000-0000-4000-a000-000000000001', 'Iker', 'admin', true, false),
  ('20000000-0000-4000-a000-000000000002', '10000000-0000-4000-a000-000000000001',
   '00000000-0000-4000-a000-000000000002', 'Ane', 'tesorero', true, false),
  ('20000000-0000-4000-a000-000000000003', '10000000-0000-4000-a000-000000000001',
   '00000000-0000-4000-a000-000000000003', 'Unai', 'jugador', true, false),
  ('20000000-0000-4000-a000-000000000004', '10000000-0000-4000-a000-000000000001',
   null, 'Mikel', 'jugador', true, false),
  ('20000000-0000-4000-a000-000000000005', '10000000-0000-4000-a000-000000000001',
   null, 'Asier', 'jugador', true, false),
  ('20000000-0000-4000-a000-000000000006', '10000000-0000-4000-a000-000000000001',
   null, 'Gorka', 'jugador', false, false),
  ('20000000-0000-4000-a000-000000000007', '10000000-0000-4000-a000-000000000001',
   '00000000-0000-4000-a000-000000000004', 'Jon', 'jugador', false, true),
  -- Atlético Banquillo
  ('20000000-0000-4000-a000-000000000011', '10000000-0000-4000-a000-000000000002',
   '00000000-0000-4000-a000-000000000005', 'Rival', 'admin', true, false),
  ('20000000-0000-4000-a000-000000000012', '10000000-0000-4000-a000-000000000002',
   null, 'Portero rival', 'jugador', true, false);

-- Catálogo -------------------------------------------------------------------

insert into public.tipos_multa (id, equipo_id, nombre, importe_centimos, activo) values
  ('30000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001', 'Llegar tarde al entreno', 200, true),
  ('30000000-0000-4000-a000-000000000002', '10000000-0000-4000-a000-000000000001', 'Llegar tarde al partido', 500, true),
  ('30000000-0000-4000-a000-000000000003', '10000000-0000-4000-a000-000000000001', 'Olvidar la equipación', 300, true),
  ('30000000-0000-4000-a000-000000000004', '10000000-0000-4000-a000-000000000001', 'Tarjeta amarilla', 300, true),
  ('30000000-0000-4000-a000-000000000005', '10000000-0000-4000-a000-000000000001', 'Tarjeta roja', 1000, true),
  ('30000000-0000-4000-a000-000000000006', '10000000-0000-4000-a000-000000000001', 'Móvil en la charla', 200, false),
  ('30000000-0000-4000-a000-000000000011', '10000000-0000-4000-a000-000000000002', 'Llegar tarde', 100, true);

-- Movimientos ------------------------------------------------------------------
-- Las multas con tipo copian concepto e importe del catálogo (trigger).

insert into public.multas (equipo_id, miembro_id, tipo_multa_id, concepto, importe_centimos, fecha, nota)
values
  ('10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000003',
   '30000000-0000-4000-a000-000000000001', '', 1, current_date - 20, null),
  ('10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000003',
   '30000000-0000-4000-a000-000000000004', '', 1, current_date - 13, 'Protestar al árbitro'),
  ('10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000004',
   '30000000-0000-4000-a000-000000000002', '', 1, current_date - 13, null),
  ('10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000004',
   '30000000-0000-4000-a000-000000000005', '', 1, current_date - 6, null),
  ('10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000005',
   '30000000-0000-4000-a000-000000000003', '', 1, current_date - 6, null),
  ('10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000002',
   null, 'Perder las llaves del vestuario', 400, current_date - 2, 'Multa libre'),
  ('10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001',
   '30000000-0000-4000-a000-000000000001', '', 1, current_date - 1, null),
  ('10000000-0000-4000-a000-000000000002', '20000000-0000-4000-a000-000000000012',
   '30000000-0000-4000-a000-000000000011', '', 1, current_date - 3, null);

-- Una multa anulada (no cuenta en los saldos).
insert into public.multas (equipo_id, miembro_id, tipo_multa_id, concepto, importe_centimos,
  fecha, anulada, anulada_en, anulada_por)
values
  ('10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000005',
   '30000000-0000-4000-a000-000000000005', '', 1, current_date - 6,
   true, now(), '00000000-0000-4000-a000-000000000002');

insert into public.pagos (equipo_id, miembro_id, importe_centimos, fecha, metodo, nota) values
  ('10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000003', 500, current_date - 10, 'bizum', null),
  ('10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000004', 500, current_date - 5, 'efectivo', 'A cuenta'),
  ('10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000002', 400, current_date - 2, 'bizum', null);

insert into public.gastos (equipo_id, concepto, importe_centimos, fecha, nota) values
  ('10000000-0000-4000-a000-000000000001', 'Balones nuevos', 600, current_date - 4, null);

-- Tests de seguridad (RLS, privilegios y RPCs). Ejecutar con `npm run db:test`.
-- Todo corre en una transacción que se deshace al final; no depende del seed.
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(55);

-- -----------------------------------------------------------------------------
-- Datos de prueba (como postgres, sin RLS)
-- -----------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('a0000000-0000-4000-a000-000000000001', 'ua@test'),   -- admin E1
  ('a0000000-0000-4000-a000-000000000002', 'ut@test'),   -- tesorero E1
  ('a0000000-0000-4000-a000-000000000003', 'uj@test'),   -- jugador E1
  ('a0000000-0000-4000-a000-000000000004', 'ux@test'),   -- admin E2 (otro equipo)
  ('a0000000-0000-4000-a000-000000000005', 'up@test'),   -- solicitud pendiente en E1
  ('a0000000-0000-4000-a000-000000000006', 'un@test'),   -- sin equipo
  ('a0000000-0000-4000-a000-000000000007', 'un2@test');  -- sin equipo

insert into public.equipos (id, nombre, codigo_invitacion) values
  ('e0000000-0000-4000-a000-000000000001', 'Equipo uno', 'TESTAAAA'),
  ('e0000000-0000-4000-a000-000000000002', 'Equipo dos', 'TESTBBBB');

insert into public.miembros (id, equipo_id, usuario_id, nombre, rol, activo, pendiente) values
  ('b0000000-0000-4000-a000-000000000001', 'e0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001', 'Admin', 'admin', true, false),
  ('b0000000-0000-4000-a000-000000000002', 'e0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000002', 'Tesorero', 'tesorero', true, false),
  ('b0000000-0000-4000-a000-000000000003', 'e0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000003', 'Jugador', 'jugador', true, false),
  ('b0000000-0000-4000-a000-000000000004', 'e0000000-0000-4000-a000-000000000001', null, 'Libre', 'jugador', true, false),
  ('b0000000-0000-4000-a000-000000000005', 'e0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000005', 'Pendiente', 'jugador', false, true),
  ('b0000000-0000-4000-a000-000000000011', 'e0000000-0000-4000-a000-000000000002', 'a0000000-0000-4000-a000-000000000004', 'Rival', 'admin', true, false);

insert into public.tipos_multa (id, equipo_id, nombre, importe_centimos) values
  ('c0000000-0000-4000-a000-000000000001', 'e0000000-0000-4000-a000-000000000001', 'Tarde', 250),
  ('c0000000-0000-4000-a000-000000000011', 'e0000000-0000-4000-a000-000000000002', 'Tarde rival', 100);

insert into public.multas (id, equipo_id, miembro_id, tipo_multa_id, concepto, importe_centimos) values
  ('d0000000-0000-4000-a000-000000000001', 'e0000000-0000-4000-a000-000000000001',
   'b0000000-0000-4000-a000-000000000003', 'c0000000-0000-4000-a000-000000000001', '', 1);
insert into public.pagos (equipo_id, miembro_id, importe_centimos) values
  ('e0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000003', 100);
insert into public.gastos (equipo_id, concepto, importe_centimos) values
  ('e0000000-0000-4000-a000-000000000001', 'Balones', 50);


-- -----------------------------------------------------------------------------
-- Jugador: lee todo lo de su equipo, no escribe nada
-- -----------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-4000-a000-000000000003","role":"authenticated"}';

select is((select count(*)::int from equipos), 1, 'jugador: ve solo su equipo');
select is((select count(*)::int from multas), 1, 'jugador: lee las multas del equipo');
select is((select saldo_centimos::int from saldos_miembros where miembro_id = 'b0000000-0000-4000-a000-000000000003'),
  150, 'jugador: ve su saldo (250 de multa - 100 pagado)');
select is((select bote_centimos::int from resumen_equipo), 50, 'jugador: ve el bote (100 - 50)');

select throws_ok($$ insert into multas (equipo_id, miembro_id, concepto, importe_centimos)
  values ('e0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000003', 'x', 100) $$,
  '42501', null, 'jugador: no pone multas');
select throws_ok($$ insert into pagos (equipo_id, miembro_id, importe_centimos)
  values ('e0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000003', 100) $$,
  '42501', null, 'jugador: no registra pagos');
select throws_ok($$ insert into gastos (equipo_id, concepto, importe_centimos)
  values ('e0000000-0000-4000-a000-000000000001', 'x', 100) $$,
  '42501', null, 'jugador: no registra gastos');
select throws_ok($$ insert into tipos_multa (equipo_id, nombre, importe_centimos)
  values ('e0000000-0000-4000-a000-000000000001', 'x', 100) $$,
  '42501', null, 'jugador: no toca el catálogo');
select throws_ok($$ update multas set anulada = true $$, '42501', null, 'jugador: no edita multas');
select throws_ok($$ delete from multas $$, '42501', null, 'jugador: no borra multas');
select throws_ok($$ select anular_multa('d0000000-0000-4000-a000-000000000001') $$,
  '42501', null, 'jugador: no anula multas');
select throws_ok($$ insert into miembros (equipo_id, nombre) values ('e0000000-0000-4000-a000-000000000001', 'x') $$,
  '42501', null, 'jugador: no da de alta miembros');
select throws_ok($$ update miembros set rol = 'admin' where id = 'b0000000-0000-4000-a000-000000000003' $$,
  '42501', null, 'jugador: no se cambia el rol');
select throws_ok($$ select cambiar_rol('b0000000-0000-4000-a000-000000000003', 'admin') $$,
  '42501', null, 'jugador: no usa cambiar_rol');

update miembros set nombre = 'Jugador 2' where id = 'b0000000-0000-4000-a000-000000000003';
update miembros set nombre = 'Hackeado' where id = 'b0000000-0000-4000-a000-000000000001';
select is((select nombre from miembros where id = 'b0000000-0000-4000-a000-000000000003'), 'Jugador 2',
  'jugador: cambia su propio nombre');
select is((select nombre from miembros where id = 'b0000000-0000-4000-a000-000000000001'), 'Admin',
  'jugador: no cambia el nombre de otros');


-- -----------------------------------------------------------------------------
-- Usuario de otro equipo: ni lee ni escribe nada del equipo 1
-- -----------------------------------------------------------------------------
set local request.jwt.claims = '{"sub":"a0000000-0000-4000-a000-000000000004","role":"authenticated"}';

select is(
  (select count(*)::int from equipos where id = 'e0000000-0000-4000-a000-000000000001')
  + (select count(*)::int from miembros where equipo_id = 'e0000000-0000-4000-a000-000000000001')
  + (select count(*)::int from tipos_multa where equipo_id = 'e0000000-0000-4000-a000-000000000001')
  + (select count(*)::int from multas where equipo_id = 'e0000000-0000-4000-a000-000000000001')
  + (select count(*)::int from pagos where equipo_id = 'e0000000-0000-4000-a000-000000000001')
  + (select count(*)::int from gastos where equipo_id = 'e0000000-0000-4000-a000-000000000001')
  + (select count(*)::int from saldos_miembros where equipo_id = 'e0000000-0000-4000-a000-000000000001')
  + (select count(*)::int from resumen_equipo where equipo_id = 'e0000000-0000-4000-a000-000000000001'),
  0, 'otro equipo: no lee nada del equipo 1');

select throws_ok($$ insert into gastos (equipo_id, concepto, importe_centimos)
  values ('e0000000-0000-4000-a000-000000000001', 'x', 100) $$,
  '42501', null, 'otro equipo: no escribe en el equipo 1');
select throws_ok($$ insert into tipos_multa (equipo_id, nombre, importe_centimos)
  values ('e0000000-0000-4000-a000-000000000001', 'x', 100) $$,
  '42501', null, 'otro equipo: no toca el catálogo del equipo 1');
select throws_ok($$ insert into multas (equipo_id, miembro_id, concepto, importe_centimos)
  values ('e0000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-000000000003', 'x', 100) $$,
  'P0001', null, 'otro equipo: no multa a un miembro del equipo 1 desde su equipo');
select throws_ok($$ insert into pagos (equipo_id, miembro_id, importe_centimos)
  values ('e0000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-000000000003', 100) $$,
  '23503', null, 'otro equipo: FK compuesta impide pagos cruzados');
select throws_ok($$ select anular_multa('d0000000-0000-4000-a000-000000000001') $$,
  '42501', null, 'otro equipo: no anula multas del equipo 1');
select throws_ok($$ select aceptar_solicitud('b0000000-0000-4000-a000-000000000005') $$,
  '42501', null, 'otro equipo: no acepta solicitudes del equipo 1');
update equipos set nombre = 'Hackeado' where id = 'e0000000-0000-4000-a000-000000000001';
reset role;
select is((select nombre from equipos where id = 'e0000000-0000-4000-a000-000000000001'), 'Equipo uno',
  'otro equipo: no renombra el equipo 1');


-- -----------------------------------------------------------------------------
-- Tesorero: pone y anula multas; histórico estable; creado_por forzado
-- -----------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-4000-a000-000000000002","role":"authenticated"}';

insert into multas (equipo_id, miembro_id, tipo_multa_id, concepto, importe_centimos)
values ('e0000000-0000-4000-a000-000000000001',
  'b0000000-0000-4000-a000-000000000004', 'c0000000-0000-4000-a000-000000000001', 'Trampa', 1);
select results_eq(
  $$ select concepto, importe_centimos, creado_por from multas where miembro_id = 'b0000000-0000-4000-a000-000000000004' $$,
  $$ values ('Tarde'::text, 250, 'a0000000-0000-4000-a000-000000000002'::uuid) $$,
  'tesorero: la multa copia el catálogo y creado_por es el usuario');

update tipos_multa set importe_centimos = 999 where id = 'c0000000-0000-4000-a000-000000000001';
select is((select importe_centimos from multas where miembro_id = 'b0000000-0000-4000-a000-000000000004'), 250,
  'tesorero: cambiar el catálogo no altera el histórico');

select throws_ok($$ insert into multas (equipo_id, miembro_id, concepto, importe_centimos, creado_por)
  values ('e0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000004', 'x', 100,
  'a0000000-0000-4000-a000-000000000001') $$,
  '42501', null, 'tesorero: no puede fijar creado_por');
select throws_ok($$ insert into multas (equipo_id, miembro_id, concepto, importe_centimos, anulada)
  values ('e0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000004', 'x', 100, true) $$,
  '42501', null, 'tesorero: no puede insertar multas ya anuladas');
select throws_ok($$ insert into multas (equipo_id, miembro_id, tipo_multa_id, concepto, importe_centimos)
  values ('e0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000004',
  'c0000000-0000-4000-a000-000000000011', 'x', 100) $$,
  'P0001', null, 'tesorero: no usa tipos de otro equipo');
select throws_ok($$ insert into multas (equipo_id, miembro_id, concepto, importe_centimos)
  values ('e0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000005', 'x', 100) $$,
  'P0001', null, 'tesorero: no multa a una solicitud pendiente');
select throws_ok($$ insert into multas (equipo_id, miembro_id, concepto, importe_centimos)
  values ('e0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000004', 'x', 0) $$,
  '23514', null, 'tesorero: el importe tiene que ser > 0');

select lives_ok($$ select anular_multa((select id from multas where miembro_id = 'b0000000-0000-4000-a000-000000000004')) $$, 'tesorero: anula una multa');
select is((select saldo_centimos::int from saldos_miembros where miembro_id = 'b0000000-0000-4000-a000-000000000004'),
  0, 'tesorero: la multa anulada no cuenta en el saldo');
select throws_ok($$ select anular_multa((select id from multas where miembro_id = 'b0000000-0000-4000-a000-000000000004')) $$,
  'P0001', null, 'tesorero: no anula dos veces');
select throws_ok($$ select desactivar_miembro('b0000000-0000-4000-a000-000000000003') $$,
  '42501', null, 'tesorero: no gestiona miembros');


-- -----------------------------------------------------------------------------
-- Admin: miembros, roles, solicitudes y siempre al menos un admin
-- -----------------------------------------------------------------------------
set local request.jwt.claims = '{"sub":"a0000000-0000-4000-a000-000000000001","role":"authenticated"}';

select throws_ok($$ select cambiar_rol('b0000000-0000-4000-a000-000000000001', 'jugador') $$,
  'P0001', null, 'admin: no puede dejar el equipo sin admins');
select throws_ok($$ select cambiar_rol('b0000000-0000-4000-a000-000000000004', 'tesorero') $$,
  'P0001', null, 'admin: una ficha sin cuenta solo puede ser jugador');
select throws_ok($$ insert into miembros (equipo_id, usuario_id, nombre)
  values ('e0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000006', 'x') $$,
  '42501', null, 'admin: no vincula cuentas al dar de alta');
select lives_ok($$ insert into miembros (equipo_id, nombre) values ('e0000000-0000-4000-a000-000000000001', 'Nueva ficha') $$,
  'admin: da de alta una ficha sin cuenta');
select lives_ok($$ select aceptar_solicitud('b0000000-0000-4000-a000-000000000005') $$, 'admin: acepta una solicitud');
select lives_ok($$ select cambiar_rol('b0000000-0000-4000-a000-000000000003', 'admin') $$,
  'admin: hace admin a otro miembro con cuenta');
select lives_ok($$ select cambiar_rol('b0000000-0000-4000-a000-000000000001', 'jugador') $$,
  'admin: con otro admin, ya puede dejar de serlo');


-- -----------------------------------------------------------------------------
-- Unirse con código
-- -----------------------------------------------------------------------------
set local request.jwt.claims = '{"sub":"a0000000-0000-4000-a000-000000000006","role":"authenticated"}';

select results_eq($$ select nombre from miembros_reclamables('test-aaaa') $$,
  $$ values ('Libre'::text), ('Nueva ficha'::text) $$,
  'reclamables: solo fichas libres, con el código normalizado');
select results_eq($$ select equipo_nombre from info_invitacion(' testaaaa ') $$,
  $$ values ('Equipo uno'::text) $$, 'info_invitacion: nombre del equipo del código');
select is((select count(*)::int from info_invitacion('NOEXISTE')), 0,
  'info_invitacion: código inexistente, vacío');
select is(unirse_con_codigo('TESTAAAA', 'b0000000-0000-4000-a000-000000000004'),
  'e0000000-0000-4000-a000-000000000001'::uuid, 'unirse: reclama una ficha libre');
select is((select count(*)::int from multas), 2, 'unirse: tras reclamar, ve las multas del equipo');

set local request.jwt.claims = '{"sub":"a0000000-0000-4000-a000-000000000007","role":"authenticated"}';

select throws_ok($$ select unirse_con_codigo('TESTAAAA', 'b0000000-0000-4000-a000-000000000004') $$,
  'P0001', null, 'unirse: no reclama una ficha ya ocupada');
select lives_ok($$ select unirse_con_codigo('TESTAAAA', null, 'Recién llegado') $$, 'unirse: entra como nuevo');
select results_eq($$ select activo, pendiente, (select count(*)::int from multas) from mis_equipos() $$,
  $$ values (false, true, 0) $$, 'unirse: el nuevo queda pendiente y no ve nada');

select isnt(crear_equipo('Equipo nuevo', 'Yo', true), null, 'crear_equipo: crea el equipo');
select results_eq(
  $$ select m.rol::text, (select count(*)::int from tipos_multa t where t.equipo_id = m.equipo_id)
     from mis_equipos() m where m.equipo_nombre = 'Equipo nuevo' $$,
  $$ values ('admin', 7) $$,
  'crear_equipo: el creador es admin y tiene el catálogo de ejemplo');


-- -----------------------------------------------------------------------------
-- Anónimo: nada
-- -----------------------------------------------------------------------------
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';

select throws_ok($$ select count(*) from multas $$, '42501', null, 'anon: no lee tablas');
select throws_ok($$ select * from miembros_reclamables('TESTAAAA') $$, '42501', null, 'anon: no llama a RPCs');
select throws_ok($$ select * from info_invitacion('TESTAAAA') $$, '42501', null, 'anon: no consulta invitaciones');

reset role;
select * from finish();
rollback;

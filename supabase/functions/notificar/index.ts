// Envía las notificaciones push de Multak (Web Push con VAPID).
//
// La llama la app justo después de poner una multa, registrar un pago o pedir entrar
// en un equipo: { tipo: 'multa' | 'pago' | 'solicitud', id } (en «solicitud», el id es el
// del equipo). La función comprueba
// que quien llama acaba de hacer eso de verdad (creado_por y hace poco), busca a quién
// avisar y envía el aviso a todos sus dispositivos. Las suscripciones que el servicio
// de push da por muertas (404/410) se borran.
//
// Secretos (supabase secrets set): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.
// SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY los pone Supabase.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { enviarAUsuarios, euros, type Idioma } from '../_shared/push.ts';

type Tipo = 'multa' | 'pago' | 'solicitud';

interface Aviso {
  usuarios: string[];
  titulo: Record<Idioma, string>;
  cuerpo: Record<Idioma, string>;
  url: string;
  etiqueta: string;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Solo se avisa de lo que se acaba de hacer (evita reenvíos de cosas viejas).
const RECIENTE_MS = 10 * 60 * 1000;

const responder = (cuerpo: unknown, estado = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

Deno.serve(async (peticion) => {
  if (peticion.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (peticion.method !== 'POST') return responder({ error: 'método' }, 405);

  // Quién llama (con su propio token).
  const cliente = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: peticion.headers.get('Authorization') ?? '' } },
  });
  const {
    data: { user },
  } = await cliente.auth.getUser();
  if (!user) return responder({ error: 'sesión' }, 401);

  let datos: { tipo?: Tipo; id?: string };
  try {
    datos = await peticion.json();
  } catch {
    return responder({ error: 'json' }, 400);
  }
  if (!datos.id || !['multa', 'pago', 'solicitud'].includes(datos.tipo ?? '')) {
    return responder({ error: 'datos' }, 400);
  }

  // Lecturas y envío con service_role (salta RLS): solo aquí, en el servidor.
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const aviso = await prepararAviso(admin, datos.tipo!, datos.id, user.id);
  if (!aviso) return responder({ enviados: 0 });

  // A quien hace la acción no se le avisa de lo que él mismo ha hecho.
  const destinatarios = aviso.usuarios.filter((u) => u !== user.id);
  const enviados = await enviarAUsuarios(
    admin,
    destinatarios,
    (idioma) => ({ titulo: aviso.titulo[idioma], cuerpo: aviso.cuerpo[idioma] }),
    aviso.url,
    aviso.etiqueta,
  );
  return responder({ enviados });
});

// deno-lint-ignore no-explicit-any
type Admin = any;

async function prepararAviso(
  admin: Admin,
  tipo: Tipo,
  id: string,
  quien: string,
): Promise<Aviso | null> {
  const reciente = (creado: string) => Date.now() - new Date(creado).getTime() < RECIENTE_MS;

  if (tipo === 'multa') {
    const { data: m } = await admin
      .from('multas')
      .select(
        'equipo_id, miembro_id, concepto, importe_centimos, creado_en, creado_por, equipos(nombre), miembros!multas_miembro_fkey(usuario_id)',
      )
      .eq('id', id)
      .maybeSingle();
    if (!m || m.creado_por !== quien || !reciente(m.creado_en) || !m.miembros?.usuario_id)
      return null;
    return {
      usuarios: [m.miembros.usuario_id],
      titulo: { eu: 'Multa berria 🟨', es: 'Nueva multa 🟨' },
      cuerpo: {
        eu: `${m.concepto} · ${euros(m.importe_centimos)}. Atera zorroa! (${m.equipos.nombre})`,
        es: `${m.concepto} · ${euros(m.importe_centimos)}. ¡Saca la cartera! (${m.equipos.nombre})`,
      },
      url: `/e/${m.equipo_id}/jugador/${m.miembro_id}`,
      etiqueta: `multa-${id}`,
    };
  }

  if (tipo === 'pago') {
    const { data: p } = await admin
      .from('pagos')
      .select(
        'equipo_id, miembro_id, importe_centimos, creado_en, creado_por, equipos(nombre), miembros!pagos_miembro_fkey(usuario_id)',
      )
      .eq('id', id)
      .maybeSingle();
    if (!p || p.creado_por !== quien || !reciente(p.creado_en) || !p.miembros?.usuario_id)
      return null;
    return {
      usuarios: [p.miembros.usuario_id],
      titulo: { eu: 'Ordainketa apuntatuta ✅', es: 'Pago registrado ✅' },
      cuerpo: {
        eu: `${euros(p.importe_centimos)} apuntatu dizkizute ${p.equipos.nombre} taldean.`,
        es: `Te han apuntado ${euros(p.importe_centimos)} en ${p.equipos.nombre}.`,
      },
      url: `/e/${p.equipo_id}/jugador/${p.miembro_id}`,
      etiqueta: `pago-${id}`,
    };
  }

  // Solicitud (id = equipo): quien pide entrar avisa a los admins del equipo.
  const { data: s, error } = await admin
    .from('miembros')
    .select('equipo_id, nombre, creado_en, equipos(nombre)')
    .eq('equipo_id', id)
    .eq('usuario_id', quien)
    .eq('pendiente', true)
    .maybeSingle();
  if (error) console.error('solicitud', error.message);
  if (!s || !reciente(s.creado_en)) return null;
  const { data: admins } = await admin
    .from('miembros')
    .select('usuario_id')
    .eq('equipo_id', s.equipo_id)
    .eq('rol', 'admin')
    .eq('activo', true)
    .not('usuario_id', 'is', null);
  return {
    usuarios: (admins ?? []).map((a: { usuario_id: string }) => a.usuario_id),
    titulo: { eu: 'Sartzeko eskaera 🙋', es: 'Quieren entrar 🙋' },
    cuerpo: {
      eu: `${s.equipos.nombre}: ${s.nombre} sartu nahi du.`,
      es: `${s.nombre} quiere entrar en ${s.equipos.nombre}.`,
    },
    url: `/e/${s.equipo_id}/ajustes`,
    etiqueta: `solicitud-${id}`,
  };
}

// Recordatorios mensuales de deuda (push). La llama pg_cron todos los días; la base de
// datos (recordatorios_de_hoy) decide si hoy toca alguno —quedan 5 días, queda 1, o ya
// es el mes siguiente— y a quién, y lo apunta para no repetir. Llamarla de más no hace
// daño: solo envía lo que toca hoy y una sola vez.
//
// En local, con RECORDATORIOS_PRUEBAS=1 se puede pasar { hoy: 'AAAA-MM-DD' } para probar.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { alAzar, enviarAUsuarios, euros, type Idioma, type Mensaje } from '../_shared/push.ts';

type Tipo = 'faltan-5' | 'falta-1' | 'mes-nuevo';

const MESES: Record<Idioma, string[]> = {
  eu: [
    'Urtarrila',
    'Otsaila',
    'Martxoa',
    'Apirila',
    'Maiatza',
    'Ekaina',
    'Uztaila',
    'Abuztua',
    'Iraila',
    'Urria',
    'Azaroa',
    'Abendua',
  ],
  es: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
};

interface Datos {
  importe: string;
  equipo: string;
  mes: string; // el mes en curso (para «ya es noviembre…»)
}

// Con mala leche, como el resto de frases de la app. Se elige una al azar.
const TEXTOS: Record<
  Tipo,
  Record<Idioma, { titulo: (d: Datos) => string; cuerpos: ((d: Datos) => string)[] }>
> = {
  'faltan-5': {
    es: {
      titulo: () => 'Quedan 5 días 💸',
      cuerpos: [
        (d) => `Debes ${d.importe} en ${d.equipo}. El mes se acaba y tus excusas también.`,
        (d) =>
          `${d.importe} pendientes en ${d.equipo}. Cinco días para hacerte el despistado… o pagar.`,
        (d) => `Aún debes ${d.importe} en ${d.equipo}. El tesorero ya está afilando la libreta.`,
      ],
    },
    eu: {
      titulo: () => '5 egun falta 💸',
      cuerpos: [
        (d) =>
          `${d.importe} zor dituzu ${d.equipo} taldean. Hilabetea amaitzen ari da, eta zure aitzakiak ere bai.`,
        (d) =>
          `${d.importe} ordaintzeko ${d.equipo} taldean. Bost egun ahaztuarena egiteko… edo ordaintzeko.`,
        (d) =>
          `Oraindik ${d.importe} zor dituzu ${d.equipo} taldean. Diruzaina koadernoa zorrozten ari da.`,
      ],
    },
  },
  'falta-1': {
    es: {
      titulo: () => 'Mañana se acaba el mes ⏰',
      cuerpos: [
        (d) => `Último aviso: ${d.importe} en ${d.equipo}. Mañana ya no cuela.`,
        (d) => `${d.importe} en ${d.equipo}. Hoy pagas y mañana presumes.`,
        (d) => `Queda un día y debes ${d.importe} en ${d.equipo}. El bote te mira fijamente.`,
      ],
    },
    eu: {
      titulo: () => 'Bihar amaitzen da hilabetea ⏰',
      cuerpos: [
        (d) => `Azken abisua: ${d.importe} ${d.equipo} taldean. Bihar ez da balioko.`,
        (d) => `${d.importe} ${d.equipo} taldean. Gaur ordaindu eta bihar harro ibili.`,
        (d) =>
          `Egun bat falta da eta ${d.importe} zor dituzu ${d.equipo} taldean. Poltsak begi-begitara begiratzen dizu.`,
      ],
    },
  },
  'mes-nuevo': {
    es: {
      titulo: (d) => `Ya es ${d.mes.toLowerCase()} 🙃`,
      cuerpos: [
        (d) =>
          `Ya es ${d.mes.toLowerCase()} y sigues debiendo ${d.importe} en ${d.equipo}. Clásico.`,
        (d) => `Nuevo mes, misma deuda: ${d.importe} en ${d.equipo}.`,
        (d) => `${d.mes} ha llegado. Tu pago a ${d.equipo} (${d.importe}), todavía no.`,
      ],
    },
    eu: {
      titulo: (d) => `${d.mes} da jada 🙃`,
      cuerpos: [
        (d) =>
          `${d.mes} da jada eta oraindik ${d.importe} zor dituzu ${d.equipo} taldean. Klasikoa.`,
        (d) => `Hilabete berria, zor bera: ${d.importe} ${d.equipo} taldean.`,
        (d) =>
          `${d.mes} iritsi da. Zure ordainketa ${d.equipo} taldera (${d.importe}), oraindik ez.`,
      ],
    },
  },
};

Deno.serve(async (peticion) => {
  if (peticion.method !== 'POST') return new Response('método', { status: 405 });

  let hoy: string | undefined;
  // Solo en local (URL sin https): en producción nunca se puede elegir el día.
  const local = !(Deno.env.get('SUPABASE_URL') ?? '').startsWith('https://');
  if (local && Deno.env.get('RECORDATORIOS_PRUEBAS') === '1') {
    hoy = (await peticion.json().catch(() => ({})))?.hoy;
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const { data: pendientes, error } = await admin.rpc('recordatorios_de_hoy', hoy ? { hoy } : {});
  if (error) {
    console.error('recordatorios', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let enviados = 0;
  for (const r of (pendientes ?? []) as {
    usuario_id: string;
    equipo_id: string;
    equipo_nombre: string;
    saldo_centimos: number;
    tipo: Tipo;
    dia: string;
  }[]) {
    const mes = Number(r.dia.slice(5, 7)) - 1;
    const mensaje = (idioma: Idioma): Mensaje => {
      const datos: Datos = {
        importe: euros(r.saldo_centimos),
        equipo: r.equipo_nombre,
        mes: MESES[idioma][mes],
      };
      const textos = TEXTOS[r.tipo][idioma];
      return { titulo: textos.titulo(datos), cuerpo: alAzar(textos.cuerpos)(datos) };
    };
    enviados += await enviarAUsuarios(
      admin,
      [r.usuario_id],
      mensaje,
      `/e/${r.equipo_id}`,
      `recordatorio-${r.equipo_id}-${r.dia}`,
    );
  }

  return new Response(JSON.stringify({ recordatorios: pendientes?.length ?? 0, enviados }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

# Multas (multas-app)

PWA para llevar las multas internas de un equipo: catálogo de multas, saldos de cada jugador y bote común. La app solo lleva la cuenta; nunca mueve dinero.

La fuente de verdad del proyecto (decisiones, modelo de datos, fases) está en [docs/PROYECTO.md](docs/PROYECTO.md).

## Stack

- Angular 22 (standalone, signals, zoneless, sin SSR) + SCSS + Angular CDK
- PWA con `@angular/service-worker`
- Supabase (Postgres + Auth + RLS) con `@supabase/supabase-js`; esquema como código con la Supabase CLI

## Requisitos

- Node 22 o superior y npm
- Docker Desktop arrancado (para Supabase local)
- La Angular CLI y la Supabase CLI van como dependencias del proyecto: se usan con `npx ng …` y `npx supabase …` (o con los scripts de abajo).

## Primer arranque

```bash
npm install
npm run db:start      # levanta Supabase local en Docker (la primera vez descarga imágenes)
npm run db:status     # muestra la URL y la clave publishable locales
```

Copia la clave publishable local en `src/environments/environment.development.ts` y arranca la app:

```bash
npm start             # http://localhost:4200
```

Correos de prueba (Mailpit, aquí llegan los códigos de login): http://127.0.0.1:54324

`db:start` arranca solo los servicios que usa la app (BD, Auth, API y Mailpit) para ahorrar disco. Si quieres el panel web (Studio, http://127.0.0.1:54323), usa `npx supabase start` a secas.

### Usuarios de prueba (seed, solo local)

`npm run db:reset` carga `supabase/seed.sql`. Entra con cualquiera de estos emails; el código llega a Mailpit.

| Email                  | Qué es                                                       |
| ---------------------- | ------------------------------------------------------------ |
| `admin@multas.test`    | Admin del «CD Vestuario»                                     |
| `tesorero@multas.test` | Tesorero del «CD Vestuario»                                  |
| `jugador@multas.test`  | Jugador del «CD Vestuario»                                   |
| `nuevo@multas.test`    | Solicitud pendiente en el «CD Vestuario»                     |
| `rival@multas.test`    | Admin de «Atlético Banquillo» (para probar el aislamiento)   |
| `libre@multas.test`    | Sin equipo: para crear uno o unirse con el código `VESTUAR2` |

## Comandos

| Comando                   | Qué hace                                                        |
| ------------------------- | --------------------------------------------------------------- |
| `npm start`               | Servidor de desarrollo en http://localhost:4200                 |
| `npm run build`           | Build de producción en `dist/` (con service worker)             |
| `npm test`                | Tests unitarios (Vitest)                                        |
| `npm run lint`            | ESLint                                                          |
| `npm run format`          | Prettier sobre todo el proyecto (`format:check` solo comprueba) |
| `npm run db:start`        | Arranca Supabase local                                          |
| `npm run db:stop`         | Para Supabase local                                             |
| `npm run db:status`       | URLs y claves locales                                           |
| `npm run db:new <nombre>` | Crea una migración vacía en `supabase/migrations`               |
| `npm run db:reset`        | Recrea la BD local: aplica migraciones y `supabase/seed.sql`    |
| `npm run db:test`         | Tests de BD/RLS con pgTAP (`supabase/tests`)                    |
| `npm run db:types`        | Regenera `src/app/core/models/database.types.ts`                |

Producción (cuando exista el proyecto en la nube):

```bash
npx supabase login
npx supabase link --project-ref htvzktptkyuvfmxofuwd
npx supabase db push   # aplica las migraciones pendientes
```

## Estructura

```
src/app/
  core/       # singleton: cliente Supabase, auth, guards, modelos/tipos generados
  features/   # una carpeta por funcionalidad, con su servicio de datos
  shared/     # piezas reutilizables (p. ej. el pipe `euros`)
supabase/
  config.toml # configuración local
  migrations/ # esquema versionado (nunca cambios a mano en el panel)
  seed.sql    # datos de ejemplo solo para desarrollo
```

## Claves

- La URL y la clave **publishable** (antes «anon») pueden ir en `environment*.ts`: la seguridad la dan las RLS.
- La clave **secret** (antes «service_role») nunca va al frontend ni al repo.

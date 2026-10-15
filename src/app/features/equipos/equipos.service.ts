import { ColoresKlub } from '../../core/tema/klub';
import { computed, inject, Service, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { I18n } from '../../core/i18n/i18n.service';
import { FichaReclamable, InfoInvitacion, MiEquipo } from '../../core/models/modelos';
import { exigir } from '../../core/supabase/mensaje-error';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { NotificacionesService } from '../../core/notificaciones/notificaciones.service';

const ULTIMO = 'multak.ultimo-equipo';

/** Mis equipos (en cualquier estado), crear equipo y unirse con código. */
@Service()
export class EquiposService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18n);
  private readonly notificaciones = inject(NotificacionesService);
  private readonly cargados = signal<{ usuarioId: string; equipos: MiEquipo[] } | null>(null);

  /** undefined mientras no se han cargado los del usuario actual (si cambia de usuario, se descartan). */
  readonly misEquipos = computed(() => {
    const cargados = this.cargados();
    return cargados && cargados.usuarioId === this.auth.usuario()?.id
      ? cargados.equipos
      : undefined;
  });

  /** Recuerda el último equipo abierto en este dispositivo (para entrar directo la próxima vez). */
  recordar(equipoId: string): void {
    try {
      localStorage.setItem(ULTIMO, equipoId);
    } catch {
      // Sin almacenamiento: no pasa nada.
    }
  }

  /** A qué equipo entrar al abrir la app: el único, o el último abierto si sigue activo. */
  async equipoDeEntrada(): Promise<string | null> {
    const activos = (this.misEquipos() ?? (await this.cargar())).filter((e) => e.activo);
    if (activos.length === 1) return activos[0].equipo_id;
    let ultimo: string | null = null;
    try {
      ultimo = localStorage.getItem(ULTIMO);
    } catch {
      ultimo = null;
    }
    return activos.find((e) => e.equipo_id === ultimo)?.equipo_id ?? null;
  }

  async cargar(): Promise<MiEquipo[]> {
    const usuarioId = this.auth.usuario()?.id;
    const equipos = exigir(await this.supabase.rpc('mis_equipos'));
    if (usuarioId) this.cargados.set({ usuarioId, equipos });
    return equipos;
  }

  /** Mi ficha activa en el equipo, o null si no soy miembro activo. */
  async miFichaActiva(equipoId: string): Promise<MiEquipo | null> {
    const equipos = this.misEquipos() ?? (await this.cargar());
    return equipos.find((e) => e.equipo_id === equipoId && e.activo) ?? null;
  }

  /** Crea el equipo con el usuario como admin y devuelve su id. */
  async crear(
    nombreEquipo: string,
    miNombre: string,
    conCatalogo: boolean,
    colores: ColoresKlub,
  ): Promise<string> {
    const id = exigir(
      await this.supabase.rpc('crear_equipo', {
        nombre_equipo: nombreEquipo,
        mi_nombre: miNombre,
        con_catalogo_ejemplo: conCatalogo,
        idioma: this.i18n.idioma(),
        color: colores.color,
        color_secundario: colores.secundario,
      }),
    );
    await this.cargar();
    return id;
  }

  async infoInvitacion(codigo: string): Promise<InfoInvitacion | null> {
    const filas = exigir(await this.supabase.rpc('info_invitacion', { codigo }));
    return filas[0] ?? null;
  }

  async fichasReclamables(codigo: string): Promise<FichaReclamable[]> {
    return exigir(await this.supabase.rpc('miembros_reclamables', { codigo }));
  }

  /** Reclama una ficha libre (al momento) o pide entrar como nuevo (queda pendiente). */
  async unirse(codigo: string, union: { miembroId: string } | { miNombre: string }): Promise<void> {
    const equipoId = exigir(
      await this.supabase.rpc('unirse_con_codigo', {
        codigo,
        ...('miembroId' in union ? { miembro_id: union.miembroId } : { mi_nombre: union.miNombre }),
      }),
    );
    // Entrar como nuevo deja una solicitud: se avisa a los admins del equipo.
    if ('miNombre' in union) this.notificaciones.avisar('solicitud', equipoId);
    await this.cargar();
  }
}

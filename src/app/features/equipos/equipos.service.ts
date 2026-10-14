import { computed, inject, Service, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { FichaReclamable, InfoInvitacion, MiEquipo } from '../../core/models/modelos';
import { exigir } from '../../core/supabase/mensaje-error';
import { SupabaseService } from '../../core/supabase/supabase.service';

/** Mis equipos (en cualquier estado), crear equipo y unirse con código. */
@Service()
export class EquiposService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly auth = inject(AuthService);
  private readonly cargados = signal<{ usuarioId: string; equipos: MiEquipo[] } | null>(null);

  /** undefined mientras no se han cargado los del usuario actual (si cambia de usuario, se descartan). */
  readonly misEquipos = computed(() => {
    const cargados = this.cargados();
    return cargados && cargados.usuarioId === this.auth.usuario()?.id
      ? cargados.equipos
      : undefined;
  });

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
  async crear(nombreEquipo: string, miNombre: string, conCatalogo: boolean): Promise<string> {
    const id = exigir(
      await this.supabase.rpc('crear_equipo', {
        nombre_equipo: nombreEquipo,
        mi_nombre: miNombre,
        con_catalogo_ejemplo: conCatalogo,
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
    exigir(
      await this.supabase.rpc('unirse_con_codigo', {
        codigo,
        ...('miembroId' in union ? { miembro_id: union.miembroId } : { mi_nombre: union.miNombre }),
      }),
    );
    await this.cargar();
  }
}

import { computed, inject, Service, signal } from '@angular/core';
import { Equipo, Miembro, Rol, TipoMulta } from '../../core/models/modelos';
import { exigir } from '../../core/supabase/mensaje-error';
import { SupabaseService } from '../../core/supabase/supabase.service';

/**
 * Datos y acciones de los ajustes de un equipo: nombre, invitación, miembros,
 * solicitudes y catálogo. Se provee en la página de ajustes (un equipo por instancia).
 */
@Service({ autoProvided: false })
export class AjustesService {
  private readonly supabase = inject(SupabaseService).client;
  private equipoId = '';

  readonly equipo = signal<Pick<
    Equipo,
    'id' | 'nombre' | 'codigo_invitacion' | 'foto_version' | 'color'
  > | null>(null);
  readonly miembros = signal<Miembro[]>([]);
  readonly tipos = signal<TipoMulta[]>([]);

  readonly solicitudes = computed(() => this.miembros().filter((m) => m.pendiente));
  /** Fichas del equipo (sin solicitudes): activas primero. */
  readonly fichas = computed(() =>
    this.miembros()
      .filter((m) => !m.pendiente)
      .sort((a, b) => Number(b.activo) - Number(a.activo)),
  );

  async cargar(equipoId: string): Promise<void> {
    this.equipoId = equipoId;
    await Promise.all([this.cargarEquipo(), this.cargarMiembros(), this.cargarTipos()]);
  }

  // --- Equipo e invitación ----------------------------------------------------

  async renombrarEquipo(nombre: string): Promise<void> {
    exigirFila(
      await this.supabase.from('equipos').update({ nombre }).eq('id', this.equipoId).select('id'),
    );
    await this.cargarEquipo();
  }

  async cambiarColor(color: string): Promise<void> {
    exigirFila(
      await this.supabase.from('equipos').update({ color }).eq('id', this.equipoId).select('id'),
    );
    await this.cargarEquipo();
  }

  async regenerarCodigo(): Promise<void> {
    exigir(await this.supabase.rpc('regenerar_codigo', { equipo_id: this.equipoId }));
    await this.cargarEquipo();
  }

  // --- Miembros -----------------------------------------------------------------

  /** Alta de una ficha sin cuenta (jugador); la persona la reclama con el enlace. */
  async altaFicha(nombre: string): Promise<void> {
    exigir(await this.supabase.from('miembros').insert({ equipo_id: this.equipoId, nombre }));
    await this.cargarMiembros();
  }

  async renombrarMiembro(miembroId: string, nombre: string): Promise<void> {
    exigirFila(
      await this.supabase.from('miembros').update({ nombre }).eq('id', miembroId).select('id'),
    );
    await this.cargarMiembros();
  }

  async cambiarRol(miembroId: string, rol: Rol): Promise<void> {
    exigir(await this.supabase.rpc('cambiar_rol', { miembro_id: miembroId, rol }));
    await this.cargarMiembros();
  }

  async desactivar(miembroId: string): Promise<void> {
    exigir(await this.supabase.rpc('desactivar_miembro', { miembro_id: miembroId }));
    await this.cargarMiembros();
  }

  async reactivar(miembroId: string): Promise<void> {
    exigir(await this.supabase.rpc('reactivar_miembro', { miembro_id: miembroId }));
    await this.cargarMiembros();
  }

  async desvincular(miembroId: string): Promise<void> {
    exigir(await this.supabase.rpc('desvincular_miembro', { miembro_id: miembroId }));
    await this.cargarMiembros();
  }

  async aceptarSolicitud(miembroId: string): Promise<void> {
    exigir(await this.supabase.rpc('aceptar_solicitud', { miembro_id: miembroId }));
    await this.cargarMiembros();
  }

  async rechazarSolicitud(miembroId: string): Promise<void> {
    exigir(await this.supabase.rpc('rechazar_solicitud', { miembro_id: miembroId }));
    await this.cargarMiembros();
  }

  // --- Catálogo -----------------------------------------------------------------

  async crearTipo(nombre: string, importeCentimos: number): Promise<void> {
    exigir(
      await this.supabase
        .from('tipos_multa')
        .insert({ equipo_id: this.equipoId, nombre, importe_centimos: importeCentimos }),
    );
    await this.cargarTipos();
  }

  async editarTipo(
    tipoId: string,
    cambios: Partial<Pick<TipoMulta, 'nombre' | 'importe_centimos' | 'activo'>>,
  ): Promise<void> {
    exigirFila(
      await this.supabase.from('tipos_multa').update(cambios).eq('id', tipoId).select('id'),
    );
    await this.cargarTipos();
  }

  // --- Carga ----------------------------------------------------------------------

  /** Tras cambiar la foto o el nombre fuera de este servicio. */
  recargarEquipo(): Promise<void> {
    return this.cargarEquipo();
  }

  private async cargarEquipo(): Promise<void> {
    this.equipo.set(
      exigir(
        await this.supabase
          .from('equipos')
          .select('id, nombre, codigo_invitacion, foto_version, color')
          .eq('id', this.equipoId)
          .single(),
      ),
    );
  }

  private async cargarMiembros(): Promise<void> {
    this.miembros.set(
      exigir(
        await this.supabase
          .from('miembros')
          .select('*')
          .eq('equipo_id', this.equipoId)
          .order('nombre'),
      ),
    );
  }

  private async cargarTipos(): Promise<void> {
    this.tipos.set(
      exigir(
        await this.supabase
          .from('tipos_multa')
          .select('*')
          .eq('equipo_id', this.equipoId)
          .order('activo', { ascending: false })
          .order('nombre'),
      ),
    );
  }
}

/** Un UPDATE que RLS filtra no da error: devuelve 0 filas. Lo tratamos como falta de permiso. */
function exigirFila(respuesta: { data: unknown[] | null; error: unknown }): void {
  const filas = exigir(respuesta);
  if (filas.length === 0) throw { code: '42501', message: '' };
}

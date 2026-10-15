import { computed, inject, Service, signal } from '@angular/core';
import { Tables, TablesInsert } from '../../core/models/database.types';
import { MetodoPago, MiEquipo } from '../../core/models/modelos';
import { exigir } from '../../core/supabase/mensaje-error';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { NotificacionesService } from '../../core/notificaciones/notificaciones.service';

export type Saldo = Tables<'saldos_miembros'>;
export type Resumen = Tables<'resumen_equipo'>;
export type Multa = Tables<'multas'>;
export type Pago = Tables<'pagos'>;
export type Gasto = Tables<'gastos'>;
export type TipoActivo = Pick<Tables<'tipos_multa'>, 'id' | 'nombre' | 'importe_centimos'>;

export type NuevaMulta =
  | { miembroId: string; tipoId: string; fecha: string; nota: string | null }
  | {
      miembroId: string;
      concepto: string;
      importeCentimos: number;
      fecha: string;
      nota: string | null;
    };

/**
 * Datos del día a día de un equipo: bote, saldos, multas, pagos y gastos.
 * Se provee en la estructura de /e/:equipoId (una instancia por equipo).
 */
@Service({ autoProvided: false })
export class EquipoService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly notificaciones = inject(NotificacionesService);
  private equipoId = '';

  readonly resumen = signal<Resumen | null>(null);
  /** Saldos de miembros activos y desactivados (sin solicitudes pendientes). */
  readonly saldos = signal<Saldo[]>([]);
  readonly multas = signal<Multa[]>([]);
  readonly gastos = signal<Gasto[]>([]);
  /** Pagos de todo el equipo (para el calendario). */
  readonly pagos = signal<Pago[]>([]);
  readonly tipos = signal<TipoActivo[]>([]);
  readonly cargado = signal(false);
  /** Jugador al que se acaba de multar (la lista lo resalta un instante). */
  readonly ultimoMultado = signal<string | null>(null);
  /** Mi ficha en este equipo (la fija la estructura del equipo). */
  readonly miFicha = signal<MiEquipo | null>(null);
  readonly puedeGestionar = computed(() => {
    const rol = this.miFicha()?.rol;
    return rol === 'admin' || rol === 'tesorero';
  });
  readonly esAdmin = computed(() => this.miFicha()?.rol === 'admin');

  /** Nombre de cada miembro por id, para pintar multas y pagos. */
  readonly nombres = computed(
    () => new Map(this.saldos().map((s) => [s.miembro_id ?? '', s.nombre ?? ''])),
  );
  /** Miembros a los que se puede multar: activos, ordenados por nombre. */
  readonly multables = computed(() =>
    this.saldos()
      .filter((s) => s.activo)
      .sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es')),
  );

  /** Cambia de equipo (o recarga el actual). */
  async cargar(equipoId: string): Promise<void> {
    if (equipoId !== this.equipoId) {
      this.equipoId = equipoId;
      this.cargado.set(false);
      this.resumen.set(null);
      this.saldos.set([]);
      this.multas.set([]);
      this.gastos.set([]);
      this.pagos.set([]);
      this.tipos.set([]);
    }
    await Promise.all([
      this.cargarCuentas(),
      this.cargarMultas(),
      this.cargarGastos(),
      this.cargarTipos(),
      this.cargarPagos(),
    ]);
    this.cargado.set(true);
  }

  saldoDe(miembroId: string): Saldo | undefined {
    return this.saldos().find((s) => s.miembro_id === miembroId);
  }

  async pagosDe(miembroId: string): Promise<Pago[]> {
    return exigir(
      await this.supabase
        .from('pagos')
        .select('*')
        .eq('equipo_id', this.equipoId)
        .eq('miembro_id', miembroId)
        .order('fecha', { ascending: false })
        .order('creado_en', { ascending: false }),
    );
  }

  // --- Acciones (tesorero y admin; las RLS lo garantizan) -----------------------------

  async ponerMulta(multa: NuevaMulta): Promise<Multa> {
    const fila: TablesInsert<'multas'> =
      'tipoId' in multa
        ? {
            equipo_id: this.equipoId,
            miembro_id: multa.miembroId,
            tipo_multa_id: multa.tipoId,
            // El trigger copia nombre e importe del catálogo; estos valores se ignoran.
            concepto: '-',
            importe_centimos: 1,
            fecha: multa.fecha,
            nota: multa.nota,
          }
        : {
            equipo_id: this.equipoId,
            miembro_id: multa.miembroId,
            concepto: multa.concepto,
            importe_centimos: multa.importeCentimos,
            fecha: multa.fecha,
            nota: multa.nota,
          };
    const creada = exigir(await this.supabase.from('multas').insert(fila).select().single());
    this.notificaciones.avisar('multa', creada.id);
    await Promise.all([this.cargarCuentas(), this.cargarMultas()]);
    return creada;
  }

  /** Resalta un instante la fila del jugador recién multado (cuando ya se ve la lista). */
  resaltar(miembroId: string): void {
    this.ultimoMultado.set(miembroId);
    setTimeout(() => this.ultimoMultado.set(null), 2000);
  }

  async anularMulta(multaId: string): Promise<void> {
    exigir(await this.supabase.rpc('anular_multa', { multa_id: multaId }));
    await Promise.all([this.cargarCuentas(), this.cargarMultas()]);
  }

  async registrarPago(pago: {
    miembroId: string;
    importeCentimos: number;
    metodo: MetodoPago;
    fecha: string;
    nota: string | null;
  }): Promise<void> {
    const creado = exigir(
      await this.supabase
        .from('pagos')
        .insert({
          equipo_id: this.equipoId,
          miembro_id: pago.miembroId,
          importe_centimos: pago.importeCentimos,
          metodo: pago.metodo,
          fecha: pago.fecha,
          nota: pago.nota,
        })
        .select('id')
        .single(),
    );
    this.notificaciones.avisar('pago', creado.id);
    await Promise.all([this.cargarCuentas(), this.cargarPagos()]);
  }

  async anularPago(pagoId: string): Promise<void> {
    exigir(await this.supabase.rpc('anular_pago', { pago_id: pagoId }));
    await Promise.all([this.cargarCuentas(), this.cargarPagos()]);
  }

  async registrarGasto(gasto: {
    concepto: string;
    importeCentimos: number;
    fecha: string;
    nota: string | null;
  }): Promise<void> {
    exigir(
      await this.supabase.from('gastos').insert({
        equipo_id: this.equipoId,
        concepto: gasto.concepto,
        importe_centimos: gasto.importeCentimos,
        fecha: gasto.fecha,
        nota: gasto.nota,
      }),
    );
    await Promise.all([this.cargarCuentas(), this.cargarGastos()]);
  }

  async anularGasto(gastoId: string): Promise<void> {
    exigir(await this.supabase.rpc('anular_gasto', { gasto_id: gastoId }));
    await Promise.all([this.cargarCuentas(), this.cargarGastos()]);
  }

  // --- Carga ---------------------------------------------------------------------------

  private async cargarCuentas(): Promise<void> {
    const [resumen, saldos] = await Promise.all([
      this.supabase.from('resumen_equipo').select('*').eq('equipo_id', this.equipoId).single(),
      this.supabase
        .from('saldos_miembros')
        .select('*')
        .eq('equipo_id', this.equipoId)
        .eq('pendiente', false)
        .order('saldo_centimos', { ascending: false })
        .order('nombre'),
    ]);
    this.resumen.set(exigir(resumen));
    this.saldos.set(exigir(saldos));
  }

  private async cargarMultas(): Promise<void> {
    this.multas.set(
      exigir(
        await this.supabase
          .from('multas')
          .select('*')
          .eq('equipo_id', this.equipoId)
          .order('fecha', { ascending: false })
          .order('creado_en', { ascending: false })
          .limit(500),
      ),
    );
  }

  private async cargarGastos(): Promise<void> {
    this.gastos.set(
      exigir(
        await this.supabase
          .from('gastos')
          .select('*')
          .eq('equipo_id', this.equipoId)
          .order('fecha', { ascending: false })
          .order('creado_en', { ascending: false }),
      ),
    );
  }

  private async cargarPagos(): Promise<void> {
    this.pagos.set(
      exigir(
        await this.supabase
          .from('pagos')
          .select('*')
          .eq('equipo_id', this.equipoId)
          .order('fecha', { ascending: false })
          .limit(500),
      ),
    );
  }

  private async cargarTipos(): Promise<void> {
    this.tipos.set(
      exigir(
        await this.supabase
          .from('tipos_multa')
          .select('id, nombre, importe_centimos')
          .eq('equipo_id', this.equipoId)
          .eq('activo', true)
          .order('nombre'),
      ),
    );
  }
}

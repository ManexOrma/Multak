import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { MetodoPago, NOMBRE_METODO } from '../../core/models/modelos';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { Avatar } from '../../shared/avatar';
import { Cabecera } from '../../shared/cabecera';
import { DialogosService } from '../../shared/dialogos/dialogos.service';
import { fechaRelativa } from '../../shared/fechas';
import { Icono } from '../../shared/icono';
import { EurosPipe } from '../../shared/pipes/euros.pipe';
import { AccionesEquipo } from './acciones-equipo';
import { EquipoService, Pago } from './equipo.service';
import { FilaMulta } from './fila-multa';

/** Ficha de un jugador: su saldo, sus multas y sus pagos. Desde aquí se registra un pago. */
@Component({
  selector: 'app-jugador',
  imports: [NgTemplateOutlet, Cabecera, Avatar, Icono, EurosPipe, FilaMulta],
  templateUrl: './jugador.html',
  styleUrl: './jugador.scss',
})
export class Jugador {
  protected readonly equipo = inject(EquipoService);
  private readonly acciones = inject(AccionesEquipo);
  private readonly dialogos = inject(DialogosService);
  private readonly avisos = inject(AvisosService);

  readonly equipoId = input.required<string>();
  readonly miembroId = input.required<string>();

  protected readonly vista = signal<'multas' | 'pagos'>('multas');
  protected readonly pagos = signal<Pago[] | null>(null);

  protected readonly saldo = computed(() => this.equipo.saldoDe(this.miembroId()));
  protected readonly esYo = computed(() => this.miembroId() === this.equipo.miFicha()?.miembro_id);
  protected readonly multas = computed(() =>
    this.equipo.multas().filter((m) => m.miembro_id === this.miembroId()),
  );

  constructor() {
    effect(() => this.acciones.jugadorEnPantalla.set(this.miembroId()));
    inject(DestroyRef).onDestroy(() => this.acciones.jugadorEnPantalla.set(null));
    // Recarga los pagos al cambiar de jugador y cuando cambian sus cuentas.
    effect(() => {
      const id = this.miembroId();
      this.saldo();
      untracked(() => void this.cargarPagos(id));
    });
  }

  protected textoMetodo(metodo: MetodoPago): string {
    return NOMBRE_METODO[metodo];
  }

  protected fecha(fechaISO: string): string {
    return fechaRelativa(fechaISO);
  }

  protected registrarPago(): void {
    void this.acciones.registrarPago(this.miembroId());
  }

  protected async anularPago(pago: Pago): Promise<void> {
    const confirmado = await this.dialogos.confirmar({
      titulo: '¿Anular este pago?',
      mensaje: `${(pago.importe_centimos / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} del ${this.fecha(pago.fecha).toLowerCase()}. Volverá a contar como deuda y quedará tachado.`,
      aceptar: 'Anular',
      peligro: true,
    });
    if (!confirmado) return;
    try {
      await this.equipo.anularPago(pago.id);
      this.avisos.mostrar('Pago anulado.');
    } catch (e) {
      this.avisos.mostrar(mensajeError(e));
    }
  }

  private async cargarPagos(miembroId: string): Promise<void> {
    try {
      this.pagos.set(await this.equipo.pagosDe(miembroId));
    } catch (e) {
      this.avisos.mostrar(mensajeError(e));
    }
  }
}

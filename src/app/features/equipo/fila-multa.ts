import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { Avatar } from '../../shared/avatar';
import { DialogosService } from '../../shared/dialogos/dialogos.service';
import { fechaRelativa } from '../../shared/fechas';
import { EurosPipe } from '../../shared/pipes/euros.pipe';
import { EquipoService, Multa } from './equipo.service';

/**
 * Una multa en una lista. Anulada: tachada y con etiqueta (nunca desaparece).
 * Para tesorero y admin, tocarla permite anularla con confirmación.
 */
@Component({
  selector: 'app-fila-multa',
  imports: [NgTemplateOutlet, Avatar, EurosPipe],
  template: `
    @if (anulable()) {
      <button type="button" class="fila" (click)="anular()" [attr.aria-label]="etiqueta()">
        <ng-container *ngTemplateOutlet="contenido" />
      </button>
    } @else {
      <div class="fila" [attr.aria-label]="etiqueta()" role="group">
        <ng-container *ngTemplateOutlet="contenido" />
      </div>
    }
    <ng-template #contenido>
      @if (conJugador()) {
        <app-avatar [nombre]="jugador()" [semilla]="multa().miembro_id" />
      }
      <span class="fila-texto" [class.anulada]="multa().anulada">
        <span>{{ multa().concepto }}</span>
        <span class="fila-detalle">
          {{ detalle() }}
        </span>
      </span>
      @if (multa().anulada) {
        <span class="etiqueta">Anulada</span>
      }
      <span class="fila-valor" [class.anulada]="multa().anulada">
        {{ multa().importe_centimos | euros }}
      </span>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }

    .anulada {
      color: var(--texto-2);

      > :first-child,
      &.fila-valor {
        text-decoration: line-through;
        text-decoration-thickness: 1.5px;
      }
    }

    .fila-detalle {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
})
export class FilaMulta {
  private readonly equipo = inject(EquipoService);
  private readonly dialogos = inject(DialogosService);
  private readonly avisos = inject(AvisosService);

  readonly multa = input.required<Multa>();
  /** Muestra avatar y nombre del jugador (no hace falta en su propia ficha). */
  readonly conJugador = input(true);
  /** Oculta la fecha cuando la lista ya va agrupada por días. */
  readonly conFecha = input(true);

  protected readonly jugador = computed(
    () => this.equipo.nombres().get(this.multa().miembro_id) ?? '—',
  );
  protected readonly fecha = computed(() => fechaRelativa(this.multa().fecha));
  protected readonly detalle = computed(() =>
    [
      this.conJugador() ? this.jugador() : null,
      this.conFecha() ? this.fecha() : null,
      this.multa().nota,
    ]
      .filter(Boolean)
      .join(' · '),
  );
  protected readonly anulable = computed(
    () => this.equipo.puedeGestionar() && !this.multa().anulada,
  );
  protected readonly etiqueta = computed(() => {
    const m = this.multa();
    const estado = m.anulada ? ', anulada' : '';
    return `${this.jugador()}: ${m.concepto}, ${(m.importe_centimos / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}, ${this.fecha()}${estado}`;
  });

  protected async anular(): Promise<void> {
    const m = this.multa();
    const confirmado = await this.dialogos.confirmar({
      titulo: '¿Anular esta multa?',
      mensaje: `${this.jugador()} · ${m.concepto}. Dejará de contar en su saldo y quedará tachada en el historial.`,
      aceptar: 'Anular',
      peligro: true,
    });
    if (!confirmado) return;
    try {
      await this.equipo.anularMulta(m.id);
      this.avisos.mostrar('Multa anulada.');
    } catch (e) {
      this.avisos.mostrar(mensajeError(e));
    }
  }
}

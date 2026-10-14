import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { I18n } from '../../core/i18n/i18n.service';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { Avatar } from '../../shared/avatar';
import { DialogosService } from '../../shared/dialogos/dialogos.service';
import { EquipoService, Multa } from './equipo.service';

/**
 * Una multa en una lista. Anulada: tachada y con etiqueta (nunca desaparece).
 * Para tesorero y admin, tocarla permite anularla con confirmación.
 */
@Component({
  selector: 'app-fila-multa',
  imports: [NgTemplateOutlet, Avatar],
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
        <app-avatar [nombre]="jugador()" />
      }
      <span class="fila-texto" [class.anulada]="multa().anulada">
        <span>{{ multa().concepto }}</span>
        <span class="fila-detalle">
          {{ detalle() }}
        </span>
      </span>
      @if (multa().anulada) {
        <span class="etiqueta">{{ t('comun.anulada') }}</span>
      }
      <span class="fila-valor" [class.anulada]="multa().anulada">
        {{ i18n.euros(multa().importe_centimos) }}
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
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
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
  protected readonly fecha = computed(() => this.i18n.fecha(this.multa().fecha));
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
    const estado = m.anulada ? this.t('fila.anulada-sufijo') : '';
    return `${this.jugador()}: ${m.concepto}, ${this.i18n.euros(m.importe_centimos)}, ${this.fecha()}${estado}`;
  });

  protected async anular(): Promise<void> {
    const m = this.multa();
    const confirmado = await this.dialogos.confirmar({
      titulo: this.t('fila.anular-titulo'),
      mensaje: this.t('fila.anular-texto', { nombre: this.jugador(), motivo: m.concepto }),
      aceptar: this.t('comun.anular'),
      peligro: true,
    });
    if (!confirmado) return;
    try {
      await this.equipo.anularMulta(m.id);
      this.avisos.mostrar(this.t('fila.anulada-aviso'));
    } catch (e) {
      this.avisos.mostrar(this.i18n.error(e));
    }
  }
}

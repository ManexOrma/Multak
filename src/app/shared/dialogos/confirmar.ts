import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { I18n } from '../../core/i18n/i18n.service';

export interface OpcionesConfirmar {
  titulo: string;
  mensaje: string;
  /** Texto del botón de confirmar: un verbo claro («Anular multa», «Desactivar»). */
  aceptar: string;
  peligro?: boolean;
}

/** Alerta de confirmación, como las de iOS: título, mensaje y dos acciones. */
@Component({
  selector: 'app-confirmar',
  template: `
    <h2 id="confirmar-titulo">{{ opciones.titulo }}</h2>
    <p>{{ opciones.mensaje }}</p>
    <div class="dialogo-acciones">
      <button type="button" class="boton boton-secundario" (click)="ref.close(false)">
        {{ t('comun.cancelar') }}
      </button>
      <button
        type="button"
        class="boton"
        [class.boton-peligro]="opciones.peligro"
        [class.boton-principal]="!opciones.peligro"
        (click)="ref.close(true)"
      >
        {{ opciones.aceptar }}
      </button>
    </div>
  `,
})
export class Confirmar {
  protected readonly opciones = inject<OpcionesConfirmar>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
  protected readonly t = inject(I18n).t;
}

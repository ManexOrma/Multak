import { Component, inject, signal } from '@angular/core';
import { Miembro } from '../../core/models/modelos';
import { I18n } from '../../core/i18n/i18n.service';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { DialogosService } from '../../shared/dialogos/dialogos.service';
import { Avatar } from '../../shared/avatar';
import { AjustesService } from './ajustes.service';

@Component({
  selector: 'app-solicitudes',
  imports: [Avatar],
  template: `
    @if (ajustes.solicitudes().length > 0) {
      <section class="seccion" aria-labelledby="titulo-solicitudes">
        <h2 id="titulo-solicitudes">
          {{ t('ajustes.solicitudes', { n: ajustes.solicitudes().length }) }}
        </h2>
        <ul class="lista lista--avatares">
          @for (solicitud of ajustes.solicitudes(); track solicitud.id) {
            <li class="fila">
              <app-avatar [nombre]="solicitud.nombre" [semilla]="solicitud.id" />
              <span class="fila-texto">
                <span>{{ solicitud.nombre }}</span>
                <span class="fila-detalle">{{ t('ajustes.quiere-entrar') }}</span>
              </span>
              <span class="acciones">
                <button
                  type="button"
                  class="boton boton-secundario pequeno"
                  [attr.aria-label]="t('ajustes.rechazar-a', { nombre: solicitud.nombre })"
                  (click)="rechazar(solicitud)"
                >
                  {{ t('ajustes.rechazar') }}
                </button>
                <button
                  type="button"
                  class="boton boton-principal pequeno"
                  [attr.aria-label]="t('ajustes.aceptar-a', { nombre: solicitud.nombre })"
                  (click)="aceptar(solicitud)"
                >
                  {{ t('ajustes.aceptar') }}
                </button>
              </span>
            </li>
          }
        </ul>
        <p class="error" role="alert">{{ error() }}</p>
      </section>
    }
  `,
  styles: `
    .acciones {
      display: flex;
      gap: 8px;
    }

    .pequeno {
      min-height: 36px;
      padding: 0 14px;
      border-radius: 18px;
      font-size: 15px;
    }
  `,
})
export class Solicitudes {
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  protected readonly ajustes = inject(AjustesService);
  private readonly avisos = inject(AvisosService);
  private readonly dialogos = inject(DialogosService);

  protected readonly error = signal<string | null>(null);

  protected async aceptar(solicitud: Miembro): Promise<void> {
    this.error.set(null);
    try {
      await this.ajustes.aceptarSolicitud(solicitud.id);
      this.avisos.mostrar(this.t('ajustes.aceptado', { nombre: solicitud.nombre }));
    } catch (e) {
      this.error.set(this.i18n.error(e));
    }
  }

  protected async rechazar(solicitud: Miembro): Promise<void> {
    const confirmado = await this.dialogos.confirmar({
      titulo: this.t('ajustes.rechazar-titulo', { nombre: solicitud.nombre }),
      mensaje: this.t('ajustes.rechazar-texto'),
      aceptar: this.t('ajustes.rechazar'),
      peligro: true,
    });
    if (!confirmado) return;
    this.error.set(null);
    try {
      await this.ajustes.rechazarSolicitud(solicitud.id);
      this.avisos.mostrar(this.t('ajustes.rechazada'));
    } catch (e) {
      this.error.set(this.i18n.error(e));
    }
  }
}

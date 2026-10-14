import { Component, inject, signal } from '@angular/core';
import { Miembro } from '../../core/models/modelos';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { DialogosService } from '../../shared/dialogos/dialogos.service';
import { AjustesService } from './ajustes.service';

@Component({
  selector: 'app-solicitudes',
  template: `
    @if (ajustes.solicitudes().length > 0) {
      <section class="seccion" aria-labelledby="titulo-solicitudes">
        <h2 id="titulo-solicitudes">Quieren entrar ({{ ajustes.solicitudes().length }})</h2>
        <ul class="lista">
          @for (solicitud of ajustes.solicitudes(); track solicitud.id) {
            <li class="fila">
              <strong>{{ solicitud.nombre }}</strong>
              <span class="acciones">
                <button
                  type="button"
                  class="boton boton-secundario"
                  [attr.aria-label]="'Rechazar a ' + solicitud.nombre"
                  (click)="rechazar(solicitud)"
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  class="boton boton-principal"
                  [attr.aria-label]="'Aceptar a ' + solicitud.nombre"
                  (click)="aceptar(solicitud)"
                >
                  Aceptar
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
      gap: 0.5rem;
    }
  `,
})
export class Solicitudes {
  protected readonly ajustes = inject(AjustesService);
  private readonly avisos = inject(AvisosService);
  private readonly dialogos = inject(DialogosService);

  protected readonly error = signal<string | null>(null);

  protected async aceptar(solicitud: Miembro): Promise<void> {
    this.error.set(null);
    try {
      await this.ajustes.aceptarSolicitud(solicitud.id);
      this.avisos.mostrar(`${solicitud.nombre} ya está en el equipo.`);
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }

  protected async rechazar(solicitud: Miembro): Promise<void> {
    const confirmado = await this.dialogos.confirmar({
      titulo: `¿Rechazar a ${solicitud.nombre}?`,
      mensaje: 'No entrará en el equipo. Si es un error, podrá volver a pedirlo con el enlace.',
      aceptar: 'Rechazar',
      peligro: true,
    });
    if (!confirmado) return;
    this.error.set(null);
    try {
      await this.ajustes.rechazarSolicitud(solicitud.id);
      this.avisos.mostrar('Solicitud rechazada.');
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}

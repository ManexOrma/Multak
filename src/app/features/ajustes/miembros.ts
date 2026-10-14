import { Component, inject, Injector, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { AuthService } from '../../core/auth/auth.service';
import { Miembro, NOMBRE_ROL } from '../../core/models/modelos';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { DialogosService } from '../../shared/dialogos/dialogos.service';
import { AjustesService } from './ajustes.service';
import { DatosMiembroDialogo, MiembroDialogo } from './miembro-dialogo';

@Component({
  selector: 'app-miembros',
  imports: [FormRoot, FormField],
  template: `
    <section class="seccion" aria-labelledby="titulo-miembros">
      <h2 id="titulo-miembros">Miembros</h2>

      <ul class="lista">
        @for (miembro of ajustes.fichas(); track miembro.id) {
          <li>
            <button type="button" class="fila" (click)="gestionar(miembro)">
              <span>
                <strong>{{ miembro.nombre }}</strong>
                @if (miembro.usuario_id === yoId) {
                  (tú)
                }
              </span>
              <span class="etiquetas">
                @if (miembro.rol !== 'jugador') {
                  <span class="etiqueta">{{ nombreRol[miembro.rol] }}</span>
                }
                @if (!miembro.usuario_id) {
                  <span class="etiqueta">Sin cuenta</span>
                }
                @if (!miembro.activo) {
                  <span class="etiqueta">Desactivado</span>
                }
                <span aria-hidden="true">›</span>
              </span>
            </button>
          </li>
        }
      </ul>

      <form [formRoot]="formulario" class="pila alta">
        <label for="alta-nombre">Añadir jugador sin cuenta</label>
        <p id="alta-ayuda" class="texto-suave">
          Para poder multarle aunque aún no use la app. Con el enlace podrá reclamar su ficha.
        </p>
        <div class="en-linea">
          <input
            id="alta-nombre"
            autocomplete="off"
            placeholder="Nombre"
            [formField]="formulario.nombre"
            [attr.aria-invalid]="formulario.nombre().touched() && formulario.nombre().invalid()"
            aria-describedby="alta-ayuda alta-error"
          />
          <button
            type="submit"
            class="boton boton-secundario"
            [disabled]="formulario().submitting()"
          >
            Añadir
          </button>
        </div>
        <p id="alta-error" class="error-campo">
          @if (formulario.nombre().touched() && formulario.nombre().invalid()) {
            {{ formulario.nombre().errors()[0].message }}
          }
        </p>
      </form>
      <p class="error" role="alert">{{ error() }}</p>
    </section>
  `,
  styles: `
    .etiquetas {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      align-items: center;
      gap: 0.375rem;
    }

    .alta {
      margin-top: 1.5rem;
    }

    .alta .texto-suave {
      margin: 0 0 0.25rem;
    }

    .en-linea {
      display: flex;
      gap: 0.5rem;

      input {
        flex: 1;
        min-width: 0;
      }
    }
  `,
})
export class Miembros {
  protected readonly ajustes = inject(AjustesService);
  private readonly avisos = inject(AvisosService);
  private readonly dialogos = inject(DialogosService);
  private readonly injector = inject(Injector);

  protected readonly nombreRol = NOMBRE_ROL;
  protected readonly yoId = inject(AuthService).usuario()?.id;
  protected readonly error = signal<string | null>(null);

  protected readonly modelo = signal({ nombre: '' });
  protected readonly formulario = form(
    this.modelo,
    (campo) => {
      required(campo.nombre, { message: 'Escribe el nombre.' });
      maxLength(campo.nombre, 40, { message: 'Como mucho 40 caracteres.' });
    },
    { submission: { action: () => this.alta() } },
  );

  protected gestionar(miembro: Miembro): void {
    void this.dialogos.abrir<void, DatosMiembroDialogo>(
      MiembroDialogo,
      { miembro, esYo: miembro.usuario_id === this.yoId },
      'miembro-dialogo-titulo',
      this.injector,
    );
  }

  private async alta(): Promise<void> {
    this.error.set(null);
    const nombre = this.modelo().nombre.trim();
    try {
      await this.ajustes.altaFicha(nombre);
      this.formulario().reset({ nombre: '' });
      this.avisos.mostrar(`${nombre} añadido al equipo.`);
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}

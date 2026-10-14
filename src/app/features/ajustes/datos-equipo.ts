import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { EquiposService } from '../equipos/equipos.service';
import { AjustesService } from './ajustes.service';

@Component({
  selector: 'app-datos-equipo',
  imports: [FormRoot, FormField],
  template: `
    <section class="seccion" aria-labelledby="titulo-datos">
      <h2 id="titulo-datos">Datos del equipo</h2>
      <form [formRoot]="formulario" class="pila">
        <label for="equipo-nombre">Nombre del equipo</label>
        <input
          id="equipo-nombre"
          autocomplete="off"
          [formField]="formulario.nombre"
          [attr.aria-invalid]="formulario.nombre().touched() && formulario.nombre().invalid()"
          aria-describedby="equipo-nombre-error"
        />
        <p id="equipo-nombre-error" class="error-campo">
          @if (formulario.nombre().touched() && formulario.nombre().invalid()) {
            {{ formulario.nombre().errors()[0].message }}
          }
        </p>
        <button type="submit" class="boton boton-secundario" [disabled]="formulario().submitting()">
          Guardar nombre
        </button>
        <p class="error" role="alert">{{ error() }}</p>
      </form>
    </section>
  `,
})
export class DatosEquipo {
  private readonly ajustes = inject(AjustesService);
  private readonly equipos = inject(EquiposService);
  private readonly avisos = inject(AvisosService);

  protected readonly error = signal<string | null>(null);
  protected readonly modelo = signal({ nombre: this.ajustes.equipo()?.nombre ?? '' });
  protected readonly formulario = form(
    this.modelo,
    (campo) => {
      required(campo.nombre, { message: 'Ponle un nombre al equipo.' });
      maxLength(campo.nombre, 60, { message: 'Como mucho 60 caracteres.' });
    },
    { submission: { action: () => this.guardar() } },
  );

  private async guardar(): Promise<void> {
    this.error.set(null);
    try {
      await this.ajustes.renombrarEquipo(this.modelo().nombre.trim());
      await this.equipos.cargar();
      this.avisos.mostrar('Nombre guardado.');
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}

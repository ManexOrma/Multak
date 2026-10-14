import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { EquiposService } from './equipos.service';

@Component({
  selector: 'app-crear-equipo',
  imports: [FormRoot, FormField],
  template: `
    <form [formRoot]="formulario" class="pila">
      <label for="crear-nombre-equipo">Nombre del equipo</label>
      <input
        id="crear-nombre-equipo"
        autocomplete="off"
        [formField]="formulario.nombreEquipo"
        [attr.aria-invalid]="mostrarError(formulario.nombreEquipo)"
        aria-describedby="crear-nombre-equipo-error"
      />
      <p id="crear-nombre-equipo-error" class="error-campo">
        @if (mostrarError(formulario.nombreEquipo)) {
          {{ formulario.nombreEquipo().errors()[0].message }}
        }
      </p>

      <label for="crear-mi-nombre">Tu nombre en el equipo</label>
      <input
        id="crear-mi-nombre"
        autocomplete="given-name"
        [formField]="formulario.miNombre"
        [attr.aria-invalid]="mostrarError(formulario.miNombre)"
        aria-describedby="crear-mi-nombre-error"
      />
      <p id="crear-mi-nombre-error" class="error-campo">
        @if (mostrarError(formulario.miNombre)) {
          {{ formulario.miNombre().errors()[0].message }}
        }
      </p>

      <label class="casilla">
        <input type="checkbox" [formField]="formulario.conCatalogo" />
        Empezar con un catálogo de multas de ejemplo (lo podrás cambiar)
      </label>

      <button
        type="submit"
        class="boton boton-principal crear"
        [disabled]="formulario().submitting()"
      >
        {{ formulario().submitting() ? 'Creando…' : 'Crear equipo' }}
      </button>
      <p class="error" role="alert">{{ error() }}</p>
    </form>
  `,
  styles: `
    .casilla {
      margin-bottom: 12px;
      font-size: 15px;
    }
  `,
})
export class CrearEquipo {
  private readonly equipos = inject(EquiposService);
  private readonly avisos = inject(AvisosService);
  private readonly router = inject(Router);

  protected readonly error = signal<string | null>(null);
  protected readonly modelo = signal({
    nombreEquipo: '',
    miNombre: inject(AuthService).nombreSugerido(),
    conCatalogo: true,
  });
  protected readonly formulario = form(
    this.modelo,
    (campo) => {
      required(campo.nombreEquipo, { message: 'Ponle un nombre al equipo.' });
      maxLength(campo.nombreEquipo, 60, { message: 'Como mucho 60 caracteres.' });
      required(campo.miNombre, { message: 'Escribe cómo te llaman en el equipo.' });
      maxLength(campo.miNombre, 40, { message: 'Como mucho 40 caracteres.' });
    },
    { submission: { action: () => this.crear() } },
  );

  protected mostrarError(campo: typeof this.formulario.nombreEquipo): boolean {
    return campo().touched() && campo().invalid();
  }

  private async crear(): Promise<void> {
    this.error.set(null);
    const { nombreEquipo, miNombre, conCatalogo } = this.modelo();
    try {
      const id = await this.equipos.crear(nombreEquipo.trim(), miNombre.trim(), conCatalogo);
      this.avisos.mostrar('Equipo creado. Ahora invita a tu gente.');
      await this.router.navigate(['/e', id, 'ajustes']);
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}

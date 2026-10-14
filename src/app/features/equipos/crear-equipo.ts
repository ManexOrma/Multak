import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { I18n } from '../../core/i18n/i18n.service';
import { AuthService } from '../../core/auth/auth.service';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { COLOR_KLUB_INICIAL, ColorKlub } from '../../core/tema/klub';
import { SelectorColor } from '../../shared/selector-color';
import { EquiposService } from './equipos.service';

@Component({
  selector: 'app-crear-equipo',
  imports: [FormRoot, FormField, SelectorColor],
  template: `
    <form [formRoot]="formulario" class="pila">
      <label for="crear-nombre-equipo">{{ t('equipos.nombre-equipo') }}</label>
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

      <label for="crear-mi-nombre">{{ t('equipos.mi-nombre') }}</label>
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

      <app-selector-color nombre="color-crear" [(valor)]="color" />

      <label class="casilla">
        <input type="checkbox" [formField]="formulario.conCatalogo" />
        {{ t('equipos.catalogo') }}
      </label>

      <button
        type="submit"
        class="boton boton-principal crear"
        [disabled]="formulario().submitting()"
      >
        {{ formulario().submitting() ? t('equipos.creando') : t('equipos.boton-crear') }}
      </button>
      <p class="error" role="alert">{{ error() }}</p>
    </form>
  `,
  styles: `
    app-selector-color {
      margin-bottom: 16px;
    }

    .casilla {
      margin-bottom: 12px;
      font-size: 15px;
    }
  `,
})
export class CrearEquipo {
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  private readonly equipos = inject(EquiposService);
  private readonly avisos = inject(AvisosService);
  private readonly router = inject(Router);

  protected readonly error = signal<string | null>(null);
  protected readonly color = signal<ColorKlub>(COLOR_KLUB_INICIAL);
  protected readonly modelo = signal({
    nombreEquipo: '',
    miNombre: inject(AuthService).nombreSugerido(),
    conCatalogo: true,
  });
  protected readonly formulario = form(
    this.modelo,
    (campo) => {
      required(campo.nombreEquipo, { message: this.t('equipos.nombre-equipo-requerido') });
      maxLength(campo.nombreEquipo, 60, { message: this.t('comun.max-caracteres', { n: 60 }) });
      required(campo.miNombre, { message: this.t('equipos.mi-nombre-requerido') });
      maxLength(campo.miNombre, 40, { message: this.t('comun.max-caracteres', { n: 40 }) });
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
      const id = await this.equipos.crear(
        nombreEquipo.trim(),
        miNombre.trim(),
        conCatalogo,
        this.color(),
      );
      this.avisos.mostrar(this.t('equipos.creado'));
      await this.router.navigate(['/e', id, 'ajustes']);
    } catch (e) {
      this.error.set(this.i18n.error(e));
    }
  }
}

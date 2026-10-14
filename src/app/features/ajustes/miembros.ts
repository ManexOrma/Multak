import { Component, inject, Injector, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { AuthService } from '../../core/auth/auth.service';
import { Miembro, Rol } from '../../core/models/modelos';
import { I18n } from '../../core/i18n/i18n.service';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { DialogosService } from '../../shared/dialogos/dialogos.service';
import { Avatar } from '../../shared/avatar';
import { Icono } from '../../shared/icono';
import { AjustesService } from './ajustes.service';
import { DatosMiembroDialogo, MiembroDialogo } from './miembro-dialogo';

@Component({
  selector: 'app-miembros',
  imports: [FormRoot, FormField, Avatar, Icono],
  template: `
    <section class="seccion" aria-labelledby="titulo-miembros">
      <h2 id="titulo-miembros">{{ t('ajustes.miembros') }}</h2>

      <ul class="lista lista--avatares">
        @for (miembro of ajustes.fichas(); track miembro.id) {
          <li>
            <button type="button" class="fila" (click)="gestionar(miembro)">
              <app-avatar [nombre]="miembro.nombre" />
              <span class="fila-texto" [class.inactivo]="!miembro.activo">
                <span>
                  {{ miembro.nombre }}
                  @if (miembro.usuario_id === yoId) {
                    <span class="texto-suave">{{ t('comun.tu') }}</span>
                  }
                </span>
                <span class="fila-detalle">{{ detalle(miembro) }}</span>
              </span>
              @if (miembro.rol !== 'jugador') {
                <span class="etiqueta">{{ nombreRol(miembro.rol) }}</span>
              }
              <app-icono class="chevron" nombre="chevron-derecha" [grosor]="2.5" />
            </button>
          </li>
        }
      </ul>

      <form [formRoot]="formulario" class="alta">
        <label for="alta-nombre">{{ t('ajustes.alta') }}</label>
        <div class="en-linea">
          <input
            id="alta-nombre"
            autocomplete="off"
            [placeholder]="t('ajustes.alta-nombre')"
            enterkeyhint="done"
            [formField]="formulario.nombre"
            [attr.aria-invalid]="formulario.nombre().touched() && formulario.nombre().invalid()"
            aria-describedby="alta-ayuda alta-error"
          />
          <button
            type="submit"
            class="boton boton-secundario"
            [disabled]="formulario().submitting()"
          >
            <app-icono nombre="persona-mas" />
            {{ t('ajustes.alta-boton') }}
          </button>
        </div>
        <p id="alta-error" class="error-campo">
          @if (formulario.nombre().touched() && formulario.nombre().invalid()) {
            {{ formulario.nombre().errors()[0].message }}
          }
        </p>
        <p id="alta-ayuda" class="pie-grupo">
          {{ t('ajustes.alta-ayuda') }}
        </p>
      </form>
      <p class="error" role="alert">{{ error() }}</p>
    </section>
  `,
  styles: `
    .inactivo > :first-child {
      color: var(--texto-2);
    }

    .alta {
      display: grid;
      gap: 6px;
      margin-top: 20px;
    }

    .en-linea {
      display: flex;
      gap: 8px;

      input {
        flex: 1;
        min-width: 0;
      }
    }

    .pie-grupo {
      margin-top: 0;
    }
  `,
})
export class Miembros {
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  protected readonly ajustes = inject(AjustesService);
  private readonly avisos = inject(AvisosService);
  private readonly dialogos = inject(DialogosService);
  private readonly injector = inject(Injector);

  protected readonly yoId = inject(AuthService).usuario()?.id;
  protected readonly error = signal<string | null>(null);

  protected readonly modelo = signal({ nombre: '' });
  protected readonly formulario = form(
    this.modelo,
    (campo) => {
      required(campo.nombre, { message: this.t('ajustes.alta-requerido') });
      maxLength(campo.nombre, 40, { message: this.t('comun.max-caracteres', { n: 40 }) });
    },
    { submission: { action: () => this.alta() } },
  );

  protected nombreRol(rol: Rol): string {
    return this.t(`rol.${rol}`);
  }

  protected detalle(miembro: Miembro): string {
    if (!miembro.activo) return this.t('ajustes.desactivado');
    return miembro.usuario_id ? this.t('ajustes.con-cuenta') : this.t('ajustes.sin-cuenta-largo');
  }

  protected gestionar(miembro: Miembro): void {
    void this.dialogos.abrirHoja<void, DatosMiembroDialogo>(
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
      this.avisos.mostrar(this.t('ajustes.anadido', { nombre }));
    } catch (e) {
      this.error.set(this.i18n.error(e));
    }
  }
}

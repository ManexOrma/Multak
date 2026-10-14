import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { disabled, form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { Miembro, NOMBRE_ROL, Rol } from '../../core/models/modelos';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { Avatar } from '../../shared/avatar';
import { cerrarHoja, DialogosService } from '../../shared/dialogos/dialogos.service';
import { EquiposService } from '../equipos/equipos.service';
import { AjustesService } from './ajustes.service';

export interface DatosMiembroDialogo {
  miembro: Miembro;
  esYo: boolean;
}

const ROLES: Rol[] = ['jugador', 'tesorero', 'admin'];

@Component({
  selector: 'app-miembro-dialogo',
  imports: [FormRoot, FormField, Avatar],
  template: `
    <div class="hoja-cabecera">
      <span></span>
      <h2 id="miembro-dialogo-titulo">Miembro</h2>
      <button type="button" class="boton-enlace" (click)="cerrar()">Cerrar</button>
    </div>

    <div class="quien">
      <app-avatar [nombre]="miembro.nombre" [semilla]="miembro.id" [tamano]="64" />
      <p class="titulo-2">{{ miembro.nombre }}{{ esYo ? ' (tú)' : '' }}</p>
      <p class="nota">
        {{ miembro.usuario_id ? 'Tiene cuenta' : 'Sin cuenta: aún no ha reclamado su ficha' }}
        @if (!miembro.activo) {
          · Desactivado
        }
      </p>
    </div>

    <form [formRoot]="formulario" class="pila">
      <label for="miembro-nombre">Nombre</label>
      <input
        id="miembro-nombre"
        autocomplete="off"
        [formField]="formulario.nombre"
        [attr.aria-invalid]="formulario.nombre().touched() && formulario.nombre().invalid()"
        aria-describedby="miembro-nombre-error"
      />
      <p id="miembro-nombre-error" class="error-campo">
        @if (formulario.nombre().touched() && formulario.nombre().invalid()) {
          {{ formulario.nombre().errors()[0].message }}
        }
      </p>

      <label for="miembro-rol">Rol</label>
      <select id="miembro-rol" [formField]="formulario.rol" aria-describedby="miembro-rol-ayuda">
        @for (rol of roles; track rol) {
          <option [value]="rol">{{ nombreRol[rol] }}</option>
        }
      </select>
      <p id="miembro-rol-ayuda" class="pie-grupo">
        @if (miembro.usuario_id) {
          Tesorero: pone multas y registra pagos y gastos. Admin: además gestiona el equipo.
        } @else {
          Solo se puede dar un rol a alguien con cuenta.
        }
      </p>

      <button
        type="submit"
        class="boton boton-principal guardar"
        [disabled]="formulario().submitting()"
      >
        Guardar cambios
      </button>
    </form>

    <ul class="lista otras">
      <li>
        @if (miembro.activo) {
          <button type="button" class="fila peligro" (click)="desactivar()">Desactivar</button>
        } @else {
          <button type="button" class="fila enlace" (click)="reactivar()">Reactivar</button>
        }
      </li>
      @if (miembro.usuario_id) {
        <li>
          <button type="button" class="fila peligro" (click)="desvincular()">
            Desvincular cuenta
          </button>
        </li>
      }
    </ul>

    <p class="error" role="alert">{{ error() }}</p>
  `,
  styles: `
    .quien {
      display: grid;
      justify-items: center;
      gap: 4px;
      margin: 4px 0 20px;
      text-align: center;

      app-avatar {
        margin-bottom: 6px;
      }
    }

    .pie-grupo {
      margin-top: 2px;
    }

    .guardar {
      margin-top: 12px;
    }

    .otras {
      margin-top: 24px;
    }

    .peligro {
      color: var(--rojo-texto);
    }

    .enlace {
      color: var(--tinte);
    }
  `,
})
export class MiembroDialogo {
  private readonly datos = inject<DatosMiembroDialogo>(DIALOG_DATA);
  private readonly ref = inject<DialogRef<void>>(DialogRef);
  private readonly ajustes = inject(AjustesService);
  private readonly equipos = inject(EquiposService);
  private readonly avisos = inject(AvisosService);
  private readonly dialogos = inject(DialogosService);

  protected readonly miembro = this.datos.miembro;
  protected readonly esYo = this.datos.esYo;
  protected readonly roles = ROLES;
  protected readonly nombreRol = NOMBRE_ROL;
  protected readonly error = signal<string | null>(null);

  protected readonly modelo = signal({ nombre: this.miembro.nombre, rol: this.miembro.rol });
  protected readonly formulario = form(
    this.modelo,
    (campo) => {
      required(campo.nombre, { message: 'Escribe el nombre.' });
      maxLength(campo.nombre, 40, { message: 'Como mucho 40 caracteres.' });
      disabled(campo.rol, { when: () => !this.miembro.usuario_id });
    },
    { submission: { action: () => this.guardar() } },
  );

  protected cerrar(): void {
    void cerrarHoja(this.ref);
  }

  private async guardar(): Promise<void> {
    const nombre = this.modelo().nombre.trim();
    const rol = this.modelo().rol;
    await this.ejecutar(async () => {
      if (nombre !== this.miembro.nombre)
        await this.ajustes.renombrarMiembro(this.miembro.id, nombre);
      if (rol !== this.miembro.rol) await this.ajustes.cambiarRol(this.miembro.id, rol);
    }, 'Cambios guardados.');
  }

  protected async desactivar(): Promise<void> {
    const confirmado = await this.dialogos.confirmar({
      titulo: `¿Desactivar a ${this.miembro.nombre}?`,
      mensaje:
        'Dejará de ver el equipo y no se le podrán poner multas. Su historial y su saldo se quedan, y podrás reactivarle cuando quieras.',
      aceptar: 'Desactivar',
      peligro: true,
    });
    if (confirmado) {
      await this.ejecutar(() => this.ajustes.desactivar(this.miembro.id), 'Miembro desactivado.');
    }
  }

  protected async reactivar(): Promise<void> {
    await this.ejecutar(() => this.ajustes.reactivar(this.miembro.id), 'Miembro reactivado.');
  }

  protected async desvincular(): Promise<void> {
    const confirmado = await this.dialogos.confirmar({
      titulo: '¿Desvincular la cuenta?',
      mensaje:
        'La ficha y su historial se quedan, como jugador y sin cuenta. Esa persona dejará de ver el equipo, aunque podrá volver a reclamar la ficha con el enlace.',
      aceptar: 'Desvincular',
      peligro: true,
    });
    if (confirmado) {
      await this.ejecutar(() => this.ajustes.desvincular(this.miembro.id), 'Cuenta desvinculada.');
    }
  }

  /** Ejecuta la acción; si me afecta a mí, recarga mis equipos (puede que pierda permisos). */
  private async ejecutar(accion: () => Promise<void>, aviso: string): Promise<void> {
    this.error.set(null);
    try {
      await accion();
      if (this.esYo) await this.equipos.cargar();
      this.avisos.mostrar(aviso);
      await cerrarHoja(this.ref);
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}

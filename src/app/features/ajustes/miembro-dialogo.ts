import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { disabled, form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { Miembro, NOMBRE_ROL, Rol } from '../../core/models/modelos';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { DialogosService } from '../../shared/dialogos/dialogos.service';
import { EquiposService } from '../equipos/equipos.service';
import { AjustesService } from './ajustes.service';

export interface DatosMiembroDialogo {
  miembro: Miembro;
  esYo: boolean;
}

const ROLES: Rol[] = ['jugador', 'tesorero', 'admin'];

@Component({
  selector: 'app-miembro-dialogo',
  imports: [FormRoot, FormField],
  template: `
    <h2 id="miembro-dialogo-titulo">{{ miembro.nombre }}{{ esYo ? ' (tú)' : '' }}</h2>
    <p class="texto-suave estado">
      {{ miembro.usuario_id ? 'Tiene cuenta' : 'Sin cuenta: aún no ha reclamado su ficha' }}
      @if (!miembro.activo) {
        · Desactivado
      }
    </p>

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
      <p id="miembro-rol-ayuda" class="texto-suave ayuda">
        @if (miembro.usuario_id) {
          Tesorero: pone multas, pagos y gastos. Admin: además gestiona el equipo.
        } @else {
          Solo se puede dar un rol a alguien con cuenta.
        }
      </p>

      <button type="submit" class="boton boton-principal" [disabled]="formulario().submitting()">
        Guardar cambios
      </button>
    </form>

    <div class="otras-acciones">
      @if (miembro.activo) {
        <button type="button" class="boton-enlace" (click)="desactivar()">Desactivar</button>
      } @else {
        <button type="button" class="boton-enlace" (click)="reactivar()">Reactivar</button>
      }
      @if (miembro.usuario_id) {
        <button type="button" class="boton-enlace" (click)="desvincular()">
          Desvincular cuenta
        </button>
      }
    </div>

    <p class="error" role="alert">{{ error() }}</p>

    <div class="dialogo-acciones">
      <button type="button" class="boton boton-secundario" (click)="ref.close()">Cerrar</button>
    </div>
  `,
  styles: `
    .estado {
      margin-top: -0.5rem;
    }

    .ayuda {
      margin: 0 0 0.75rem;
    }

    .otras-acciones {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-top: 1rem;
    }
  `,
})
export class MiembroDialogo {
  private readonly datos = inject<DatosMiembroDialogo>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<void>>(DialogRef);
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
      this.ref.close();
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}

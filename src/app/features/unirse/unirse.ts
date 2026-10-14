import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { FichaReclamable, InfoInvitacion, MiEquipo } from '../../core/models/modelos';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { InstalarNota } from '../../shared/instalar-nota';
import { EquiposService } from '../equipos/equipos.service';

const NUEVO = 'nuevo';

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'no-existe' }
  | { tipo: 'ya-dentro'; ficha: MiEquipo }
  | { tipo: 'elegir'; info: InfoInvitacion; fichas: FichaReclamable[] }
  | { tipo: 'hecho'; info: InfoInvitacion; pendiente: boolean };

/** /unirse/:codigo — llega por WhatsApp. El guard ya ha pedido login si hacía falta. */
@Component({
  selector: 'app-unirse',
  imports: [FormRoot, FormField, RouterLink, InstalarNota],
  templateUrl: './unirse.html',
  styleUrl: './unirse.scss',
})
export class Unirse implements OnInit {
  private readonly equipos = inject(EquiposService);

  readonly codigo = input.required<string>();

  protected readonly nuevo = NUEVO;
  protected readonly estado = signal<Estado>({ tipo: 'cargando' });
  protected readonly error = signal<string | null>(null);

  protected readonly modelo = signal({
    eleccion: '',
    nombre: inject(AuthService).nombreSugerido(),
  });
  protected readonly formulario = form(
    this.modelo,
    (campo) => {
      required(campo.eleccion, { message: 'Elige tu nombre o «Soy nuevo».' });
      required(campo.nombre, {
        message: 'Escribe cómo te llaman en el equipo.',
        when: ({ valueOf }) => valueOf(campo.eleccion) === NUEVO,
      });
      maxLength(campo.nombre, 40, { message: 'Como mucho 40 caracteres.' });
    },
    { submission: { action: () => this.unirse() } },
  );

  /** Texto del botón: «Soy Mikel» o «Pedir entrar». */
  protected readonly textoBoton = computed(() => {
    const estado = this.estado();
    const eleccion = this.modelo().eleccion;
    if (eleccion === NUEVO || estado.tipo !== 'elegir') return 'Pedir entrar';
    const ficha = estado.fichas.find((f) => f.id === eleccion);
    return ficha ? `Soy ${ficha.nombre}` : 'Continuar';
  });

  ngOnInit(): void {
    void this.cargar();
  }

  protected async cargar(): Promise<void> {
    this.estado.set({ tipo: 'cargando' });
    try {
      const [info, mios] = await Promise.all([
        this.equipos.infoInvitacion(this.codigo()),
        this.equipos.cargar(),
      ]);
      if (!info) {
        this.estado.set({ tipo: 'no-existe' });
        return;
      }
      const ficha = mios.find((e) => e.equipo_id === info.equipo_id);
      if (ficha) {
        this.estado.set({ tipo: 'ya-dentro', ficha });
        return;
      }
      const fichas = await this.equipos.fichasReclamables(this.codigo());
      // Sin fichas libres, la única opción es entrar como nuevo.
      if (fichas.length === 0) this.modelo.update((m) => ({ ...m, eleccion: NUEVO }));
      this.estado.set({ tipo: 'elegir', info, fichas });
    } catch (e) {
      this.estado.set({ tipo: 'error', mensaje: mensajeError(e) });
    }
  }

  private async unirse(): Promise<void> {
    const estado = this.estado();
    if (estado.tipo !== 'elegir') return;
    this.error.set(null);
    const { eleccion, nombre } = this.modelo();
    const esNuevo = eleccion === NUEVO;
    try {
      await this.equipos.unirse(
        this.codigo(),
        esNuevo ? { miNombre: nombre.trim() } : { miembroId: eleccion },
      );
      this.estado.set({ tipo: 'hecho', info: estado.info, pendiente: esNuevo });
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}

import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { Cabecera } from '../../shared/cabecera';
import { EquiposService } from '../equipos/equipos.service';
import { AjustesService } from './ajustes.service';
import { Catalogo } from './catalogo';
import { DatosEquipo } from './datos-equipo';
import { Invitacion } from './invitacion';
import { Miembros } from './miembros';
import { Solicitudes } from './solicitudes';

/** /e/:equipoId/ajustes — admin: todo; tesorero: solo el catálogo. */
@Component({
  selector: 'app-ajustes',
  imports: [Cabecera, Invitacion, Solicitudes, Miembros, Catalogo, DatosEquipo],
  providers: [AjustesService],
  template: `
    <main class="pagina">
      <app-cabecera titulo="Ajustes" />

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
        <button type="button" class="boton boton-secundario" (click)="cargar()">Reintentar</button>
      } @else if (ajustes.equipo()) {
        @if (esAdmin()) {
          <app-invitacion />
          <app-solicitudes />
          <app-miembros />
        }
        <app-catalogo />
        @if (esAdmin()) {
          <app-datos-equipo />
        }
      } @else {
        <p class="nota" role="status">Cargando…</p>
      }
    </main>
  `,
})
export class Ajustes implements OnInit {
  protected readonly ajustes = inject(AjustesService);
  private readonly equipos = inject(EquiposService);
  private readonly router = inject(Router);

  readonly equipoId = input.required<string>();

  protected readonly error = signal<string | null>(null);
  private readonly miFicha = computed(() =>
    this.equipos.misEquipos()?.find((e) => e.equipo_id === this.equipoId() && e.activo),
  );
  protected readonly esAdmin = computed(() => this.miFicha()?.rol === 'admin');

  constructor() {
    // Si pierdo el permiso aquí mismo (me quito el rol o me desactivo), salgo de ajustes.
    effect(() => {
      const ficha = this.miFicha();
      if (this.equipos.misEquipos() === undefined) return;
      if (!ficha) void this.router.navigateByUrl('/equipos');
      else if (ficha.rol === 'jugador') void this.router.navigate(['/e', this.equipoId()]);
    });
  }

  ngOnInit(): void {
    void this.cargar();
  }

  protected async cargar(): Promise<void> {
    this.error.set(null);
    try {
      await this.ajustes.cargar(this.equipoId());
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}

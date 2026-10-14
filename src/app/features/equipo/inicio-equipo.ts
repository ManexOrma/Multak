import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NOMBRE_ROL } from '../../core/models/modelos';
import { EquiposService } from '../equipos/equipos.service';

/** Inicio del equipo. Provisional: bote, saldos y «Poner multa» llegan en la fase 4. */
@Component({
  selector: 'app-inicio-equipo',
  imports: [RouterLink],
  template: `
    <main class="pagina">
      <p><a routerLink="/equipos">‹ Mis equipos</a></p>
      @if (ficha(); as f) {
        <h1>{{ f.equipo_nombre }}</h1>
        <p class="texto-suave">{{ f.mi_nombre }} · {{ nombreRol[f.rol] }}</p>
        <p class="estado-vacio">Aquí verás el bote, lo que debe cada uno y las últimas multas.</p>
        @if (f.rol !== 'jugador') {
          <p>
            <a class="boton boton-secundario" [routerLink]="['/e', f.equipo_id, 'ajustes']">
              Ajustes del equipo
            </a>
          </p>
        }
      }
    </main>
  `,
})
export class InicioEquipo {
  private readonly equipos = inject(EquiposService);

  readonly equipoId = input.required<string>();

  protected readonly nombreRol = NOMBRE_ROL;
  protected readonly ficha = computed(
    () => this.equipos.misEquipos()?.find((e) => e.equipo_id === this.equipoId()) ?? null,
  );
}

import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { mensajeError } from '../../core/supabase/mensaje-error';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { Icono, NombreIcono } from '../../shared/icono';
import { EquiposService } from '../equipos/equipos.service';
import { AccionesEquipo } from './acciones-equipo';
import { EquipoService } from './equipo.service';

interface Seccion {
  ruta: string;
  texto: string;
  icono: NombreIcono;
  soloGestion?: boolean;
}

const SECCIONES: Seccion[] = [
  { ruta: '.', texto: 'Inicio', icono: 'inicio' },
  { ruta: 'multas', texto: 'Multas', icono: 'multas' },
  { ruta: 'gastos', texto: 'Gastos', icono: 'gastos' },
  { ruta: 'ajustes', texto: 'Ajustes', icono: 'ajustes', soloGestion: true },
];

/**
 * Estructura de /e/:equipoId: pestañas abajo en el móvil, barra lateral en
 * pantallas anchas y el botón amarillo «Poner multa» siempre a mano.
 */
@Component({
  selector: 'app-equipo-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icono],
  providers: [EquipoService, AccionesEquipo],
  templateUrl: './equipo-shell.html',
  styleUrl: './equipo-shell.scss',
})
export class EquipoShell {
  protected readonly equipo = inject(EquipoService);
  private readonly equipos = inject(EquiposService);
  private readonly acciones = inject(AccionesEquipo);
  private readonly avisos = inject(AvisosService);

  readonly equipoId = input.required<string>();

  protected readonly secciones = SECCIONES;
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );
  /** «Poner multa» flota donde tiene sentido: inicio, historial y ficha de jugador. */
  protected readonly conAccion = computed(
    () => this.equipo.puedeGestionar() && !/\/(ajustes|gastos)(\?|$)/.test(this.url()),
  );

  constructor() {
    effect(() => {
      const id = this.equipoId();
      const ficha = this.equipos.misEquipos()?.find((e) => e.equipo_id === id && e.activo) ?? null;
      this.equipo.miFicha.set(ficha);
    });
    effect(() => {
      const id = this.equipoId();
      untracked(() => void this.cargar(id));
    });
    // Al cambiar de pantalla, refresca: puede haber varios tesoreros apuntando a la vez.
    inject(Router)
      .events.pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => void this.cargar(this.equipoId()));
  }

  protected visible(seccion: Seccion): boolean {
    return !seccion.soloGestion || this.equipo.puedeGestionar();
  }

  protected ponerMulta(): void {
    void this.acciones.ponerMulta();
  }

  private async cargar(equipoId: string): Promise<void> {
    try {
      await Promise.all([this.equipo.cargar(equipoId), this.equipos.miFichaActiva(equipoId)]);
    } catch (e) {
      this.avisos.mostrar(mensajeError(e));
    }
  }
}

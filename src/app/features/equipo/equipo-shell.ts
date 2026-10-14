import { Component, computed, DestroyRef, effect, inject, input, untracked } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { I18n } from '../../core/i18n/i18n.service';
import { FotosService } from '../../core/supabase/fotos.service';
import { TemaService } from '../../core/tema/tema.service';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { Escudo } from '../../shared/escudo';
import { Icono, NombreIcono } from '../../shared/icono';
import { EquiposService } from '../equipos/equipos.service';
import { MenuService } from '../menu/menu.service';
import { AccionesEquipo } from './acciones-equipo';
import { EquipoService } from './equipo.service';

interface Seccion {
  ruta: string;
  clave: 'nav.inicio' | 'nav.multas' | 'nav.gastos' | 'nav.ajustes';
  icono: NombreIcono;
  soloGestion?: boolean;
}

const SECCIONES: Seccion[] = [
  { ruta: '.', clave: 'nav.inicio', icono: 'inicio' },
  { ruta: 'multas', clave: 'nav.multas', icono: 'calendario' },
  { ruta: 'gastos', clave: 'nav.gastos', icono: 'gastos' },
  { ruta: 'ajustes', clave: 'nav.ajustes', icono: 'ajustes', soloGestion: true },
];

/**
 * Estructura de /e/:equipoId: pestañas abajo en el móvil, barra lateral en
 * pantallas anchas y el botón amarillo «Poner multa» siempre a mano.
 */
@Component({
  selector: 'app-equipo-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icono, Escudo],
  providers: [EquipoService, AccionesEquipo],
  templateUrl: './equipo-shell.html',
  styleUrl: './equipo-shell.scss',
})
export class EquipoShell {
  protected readonly equipo = inject(EquipoService);
  private readonly equipos = inject(EquiposService);
  private readonly acciones = inject(AccionesEquipo);
  private readonly avisos = inject(AvisosService);
  private readonly menu = inject(MenuService);
  private readonly fotos = inject(FotosService);
  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

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
  /** «Poner multa» flota donde tiene sentido: inicio, calendario y ficha de jugador. */
  protected readonly conAccion = computed(
    () => this.equipo.puedeGestionar() && !/\/(ajustes|gastos)(\?|$)/.test(this.url()),
  );
  protected readonly foto = computed(() => {
    const ficha = this.equipo.miFicha();
    return ficha ? this.fotos.url(ficha.equipo_id, ficha.foto_version) : null;
  });

  constructor() {
    effect(() => {
      const id = this.equipoId();
      const ficha = this.equipos.misEquipos()?.find((e) => e.equipo_id === id && e.activo) ?? null;
      this.equipo.miFicha.set(ficha);
    });
    // La app se viste con el color del club mientras estás en el equipo.
    const tema = inject(TemaService);
    effect(() => tema.ponerKlub(this.equipo.miFicha()?.color));
    inject(DestroyRef).onDestroy(() => tema.ponerKlub(null));
    effect(() => {
      const id = this.equipoId();
      untracked(() => {
        this.equipos.recordar(id);
        void this.cargar(id);
      });
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

  protected abrirMenu(): void {
    this.menu.abrir(this.equipoId());
  }

  private async cargar(equipoId: string): Promise<void> {
    try {
      await Promise.all([this.equipo.cargar(equipoId), this.equipos.miFichaActiva(equipoId)]);
    } catch (e) {
      this.avisos.mostrar(this.i18n.error(e));
    }
  }
}

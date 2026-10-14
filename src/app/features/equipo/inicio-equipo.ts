import { DOCUMENT } from '@angular/common';
import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../../core/i18n/i18n.service';
import { Avatar } from '../../shared/avatar';
import { Cabecera } from '../../shared/cabecera';
import { CifraAnimada } from '../../shared/cifra-animada';
import { lanzarConfeti } from '../../shared/confeti';
import { Inclinar } from '../../shared/inclinar';
import { Icono } from '../../shared/icono';
import { BotonMenu } from '../menu/boton-menu';
import { EquipoService } from './equipo.service';
import { FilaMulta } from './fila-multa';

const ULTIMAS = 5;

/** Inicio del equipo: lo tuyo y el bote arriba; saldos de todos y lo último abajo. */
@Component({
  selector: 'app-inicio-equipo',
  imports: [RouterLink, Cabecera, BotonMenu, Avatar, CifraAnimada, Icono, FilaMulta, Inclinar],
  templateUrl: './inicio-equipo.html',
  styleUrl: './inicio-equipo.scss',
})
export class InicioEquipo {
  protected readonly equipo = inject(EquipoService);
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  protected readonly titulo = computed(
    () => this.equipo.miFicha()?.equipo_nombre ?? this.t('titulo.equipo'),
  );
  protected readonly yo = computed(() => {
    const id = this.equipo.miFicha()?.miembro_id;
    return id ? this.equipo.saldoDe(id) : undefined;
  });
  protected readonly debo = computed(() => (this.yo()?.saldo_centimos ?? 0) > 0);
  protected readonly multasPendientes = computed(() => {
    const id = this.equipo.miFicha()?.miembro_id;
    return this.equipo.multas().filter((m) => m.miembro_id === id && !m.anulada).length;
  });
  protected readonly ultimas = computed(() => this.equipo.multas().slice(0, ULTIMAS));
  protected readonly hayMas = computed(() => this.equipo.multas().length > ULTIMAS);

  /** Todo el equipo al día (y ya ha habido multas): pequeña celebración. */
  protected readonly todosAlDia = computed(
    () =>
      this.equipo.multas().length > 0 &&
      this.equipo.saldos().every((s) => !s.activo || (s.saldo_centimos ?? 0) <= 0),
  );

  private readonly documento = inject(DOCUMENT);
  private readonly celebracion = viewChild<ElementRef<HTMLElement>>('celebracion');

  constructor() {
    // Todo el equipo al día: confeti con los colores del club (una vez por sesión y equipo).
    afterRenderEffect(() => {
      const aviso = this.celebracion()?.nativeElement;
      const equipoId = this.equipo.miFicha()?.equipo_id;
      if (!aviso || !equipoId) return;
      untracked(() => {
        const clave = `multak.celebrado.${equipoId}`;
        try {
          if (sessionStorage.getItem(clave)) return;
          sessionStorage.setItem(clave, '1');
        } catch {
          // Sin almacenamiento: celebra igual.
        }
        lanzarConfeti(this.documento, aviso);
      });
    });
  }

  // Frases con gracia: una por visita (no cambian en cada refresco).
  protected readonly fraseAlDia = this.i18n.frase('gracia.al-dia', {
    nombre: this.equipo.miFicha()?.mi_nombre ?? '',
  });
  protected readonly fraseTodos = this.i18n.frase('gracia.todos-al-dia');
  protected readonly fraseSinMultas = this.equipo.puedeGestionar()
    ? this.i18n.frase('gracia.sin-multas-gestor')
    : this.i18n.frase('gracia.sin-multas-jugador');
}

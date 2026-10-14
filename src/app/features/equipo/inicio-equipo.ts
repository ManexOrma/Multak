import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avatar } from '../../shared/avatar';
import { Cabecera } from '../../shared/cabecera';
import { Icono } from '../../shared/icono';
import { EurosPipe } from '../../shared/pipes/euros.pipe';
import { EquipoService } from './equipo.service';
import { FilaMulta } from './fila-multa';

const ULTIMAS = 5;

/** Inicio del equipo: lo tuyo y el bote arriba; saldos de todos y lo último abajo. */
@Component({
  selector: 'app-inicio-equipo',
  imports: [RouterLink, Cabecera, Avatar, Icono, EurosPipe, FilaMulta],
  templateUrl: './inicio-equipo.html',
  styleUrl: './inicio-equipo.scss',
})
export class InicioEquipo {
  protected readonly equipo = inject(EquipoService);

  protected readonly titulo = computed(() => this.equipo.miFicha()?.equipo_nombre ?? 'Equipo');
  protected readonly yo = computed(() => {
    const id = this.equipo.miFicha()?.miembro_id;
    return id ? this.equipo.saldoDe(id) : undefined;
  });
  protected readonly multasPendientes = computed(() => {
    const id = this.equipo.miFicha()?.miembro_id;
    return this.equipo.multas().filter((m) => m.miembro_id === id && !m.anulada).length;
  });
  protected readonly ultimas = computed(() => this.equipo.multas().slice(0, ULTIMAS));
  protected readonly hayMas = computed(() => this.equipo.multas().length > ULTIMAS);
}

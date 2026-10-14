import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { I18n, Idioma } from '../../core/i18n/i18n.service';
import { MiEquipo } from '../../core/models/modelos';
import { FotosService } from '../../core/supabase/fotos.service';
import { Tema, TemaService } from '../../core/tema/tema.service';
import { Escudo } from '../../shared/escudo';
import { Icono } from '../../shared/icono';
import { Marca } from '../../shared/marca';
import { EquiposService } from '../equipos/equipos.service';
import { cerrarMenu } from './cerrar-menu';

/** Menú lateral (se desliza desde la izquierda): equipos, apariencia, idioma y sesión. */
@Component({
  selector: 'app-menu-lateral',
  imports: [RouterLink, Escudo, Icono, Marca],
  templateUrl: './menu-lateral.html',
  styleUrl: './menu-lateral.scss',
})
export class MenuLateral {
  private readonly datos = inject<{ equipoActual: string | null }>(DIALOG_DATA);
  private readonly ref = inject(DialogRef);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  protected readonly equipos = inject(EquiposService);
  protected readonly fotos = inject(FotosService);
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  protected readonly temaService = inject(TemaService);

  protected readonly email = this.auth.usuario()?.email ?? '';
  protected readonly equipoActual = this.datos.equipoActual;
  protected readonly temas: {
    valor: Tema;
    clave: 'menu.tema-sistema' | 'menu.tema-claro' | 'menu.tema-oscuro';
  }[] = [
    { valor: 'sistema', clave: 'menu.tema-sistema' },
    { valor: 'claro', clave: 'menu.tema-claro' },
    { valor: 'oscuro', clave: 'menu.tema-oscuro' },
  ];
  // Los nombres de idioma van en su propio idioma.
  protected readonly idiomas: { valor: Idioma; nombre: string }[] = [
    { valor: 'eu', nombre: 'Euskara' },
    { valor: 'es', nombre: 'Castellano' },
  ];

  constructor() {
    if (!this.equipos.misEquipos()) void this.equipos.cargar().catch(() => undefined);
  }

  protected rol(equipo: MiEquipo): string {
    return this.t(`rol.${equipo.rol}`);
  }

  protected async ir(ruta: string | string[]): Promise<void> {
    await cerrarMenu(this.ref);
    await this.router.navigate(Array.isArray(ruta) ? ruta : [ruta]);
  }

  protected async cerrarSesion(): Promise<void> {
    await cerrarMenu(this.ref);
    await this.auth.cerrarSesion();
    await this.router.navigateByUrl('/login');
  }

  protected cerrar(): void {
    void cerrarMenu(this.ref);
  }
}

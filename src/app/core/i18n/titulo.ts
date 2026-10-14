import { inject, Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { ClaveTexto } from './es';
import { I18n } from './i18n.service';

/** Los títulos de las rutas son claves de traducción: «Multak» y la sección en el idioma actual. */
@Injectable()
export class TituloTraducido extends TitleStrategy {
  private readonly i18n = inject(I18n);

  override updateTitle(estado: RouterStateSnapshot): void {
    const clave = this.buildTitle(estado) as ClaveTexto | undefined;
    const seccion = clave ? this.i18n.t(clave as 'titulo.login') : null;
    globalThis.document.title = seccion ? `${seccion} · Multak` : 'Multak';
  }
}

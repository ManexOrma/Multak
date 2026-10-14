import { DOCUMENT } from '@angular/common';
import { inject, Service, signal } from '@angular/core';
import { colorKlub } from './klub';

export type Tema = 'sistema' | 'claro' | 'oscuro';

const CLAVE_ALMACEN = 'multak.tema';
const COLOR_BARRA = { claro: '#F7F1EC', oscuro: '#14100E' };

/**
 * Tema claro, oscuro o el del sistema. Se aplica con `data-tema` en <html>
 * (styles.scss redefine los tokens) y se recuerda en este dispositivo. El color del
 * club del equipo abierto se aplica con `data-klub`.
 */
@Service()
export class TemaService {
  private readonly document = inject(DOCUMENT);
  private readonly elegido = signal<Tema>(this.leer());

  readonly tema = this.elegido.asReadonly();

  constructor() {
    this.aplicar(this.elegido());
  }

  cambiar(tema: Tema): void {
    this.elegido.set(tema);
    try {
      localStorage.setItem(CLAVE_ALMACEN, tema);
    } catch {
      // Sin almacenamiento: dura lo que la sesión.
    }
    this.aplicar(tema);
  }

  /** Viste la app con el color del club del equipo abierto (o el inicial, fuera de un equipo). */
  ponerKlub(color: string | null | undefined): void {
    this.document.documentElement.dataset['klub'] = colorKlub(color);
  }

  private aplicar(tema: Tema): void {
    const raiz = this.document.documentElement;
    if (tema === 'sistema') raiz.removeAttribute('data-tema');
    else raiz.dataset['tema'] = tema;

    // La barra de estado del móvil sigue al tema elegido.
    for (const meta of Array.from(
      this.document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    )) {
      const esquema = meta.media.includes('dark') ? 'oscuro' : 'claro';
      meta.content = COLOR_BARRA[tema === 'sistema' ? esquema : tema];
    }
  }

  private leer(): Tema {
    try {
      const guardado = localStorage.getItem(CLAVE_ALMACEN);
      return guardado === 'claro' || guardado === 'oscuro' ? guardado : 'sistema';
    } catch {
      return 'sistema';
    }
  }
}

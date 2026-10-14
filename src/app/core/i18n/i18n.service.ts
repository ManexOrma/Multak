import { DOCUMENT } from '@angular/common';
import { inject, Service, signal } from '@angular/core';
import { fechaRelativa } from '../../shared/fechas';
import { claveError } from '../supabase/mensaje-error';
import { ClaveLista, ClaveTexto, Diccionario, es } from './es';
import { eu } from './eu';

export type Idioma = 'eu' | 'es';

const CLAVE_ALMACEN = 'multak.idioma';
const DICCIONARIOS: Record<Idioma, Diccionario> = { eu, es };
const LOCALES: Record<Idioma, string> = { eu: 'eu', es: 'es-ES' };

type Parametros<K extends ClaveTexto> = Diccionario[K] extends (p: infer P) => string ? [P] : [];
type ParametrosLista<K extends ClaveLista> = Diccionario[K] extends readonly ((
  p: infer P,
) => string)[]
  ? unknown extends P
    ? []
    : [P]
  : [];

/** Idioma guardado en este dispositivo; euskera por defecto. */
export function idiomaGuardado(): Idioma {
  try {
    const guardado = globalThis.localStorage?.getItem(CLAVE_ALMACEN);
    return guardado === 'es' || guardado === 'eu' ? guardado : 'eu';
  } catch {
    return 'eu';
  }
}

/**
 * Textos de la interfaz en euskera o castellano. El idioma se fija al arrancar
 * (fechas, euros y LOCALE_ID dependen de él); cambiarlo recarga la app.
 */
@Service()
export class I18n {
  private readonly document = inject(DOCUMENT);

  readonly idioma = signal<Idioma>(idiomaGuardado()).asReadonly();
  readonly locale = LOCALES[this.idioma()];

  constructor() {
    this.document.documentElement.lang = this.idioma();
  }

  /** Texto de una clave; las claves con parámetros los reciben como objeto. */
  readonly t = <K extends ClaveTexto>(clave: K, ...parametros: Parametros<K>): string => {
    const valor = DICCIONARIOS[this.idioma()][clave] as string | ((p: unknown) => string);
    return typeof valor === 'function' ? valor((parametros as unknown[])[0]) : valor;
  };

  /** Una variante al azar de una lista (para los mensajes con gracia). */
  readonly frase = <K extends ClaveLista>(clave: K, ...parametros: ParametrosLista<K>): string => {
    const lista = DICCIONARIOS[this.idioma()][clave] as readonly ((p: unknown) => string)[];
    return lista[Math.floor(Math.random() * lista.length)]((parametros as unknown[])[0]);
  };

  /** Mensaje para el usuario de un error de Supabase (auth, BD o red). */
  readonly error = (error: unknown): string => this.t(claveError(error) as 'error.generico');

  /** «Gaur», «Atzo», el día de la semana o la fecha, según el idioma. */
  readonly fecha = (fechaISO: string): string =>
    fechaRelativa(fechaISO, this.locale, { hoy: this.t('fecha.hoy'), ayer: this.t('fecha.ayer') });

  /** «Urria 2026» / «Octubre de 2026». */
  readonly mesAno = (fecha: Date): string => {
    const mes = new Intl.DateTimeFormat(this.locale, { month: 'long' }).format(fecha);
    const capital = mes.charAt(0).toUpperCase() + mes.slice(1);
    return this.idioma() === 'eu'
      ? `${capital} ${fecha.getFullYear()}`
      : `${capital} de ${fecha.getFullYear()}`;
  };

  /** «Asteazkena, urriak 14» / «Miércoles, 14 de octubre». */
  readonly diaLargo = (fecha: Date): string => {
    const semana = new Intl.DateTimeFormat(this.locale, { weekday: 'long' }).format(fecha);
    const mes = new Intl.DateTimeFormat(this.locale, { month: 'long' }).format(fecha);
    const dia = fecha.getDate();
    const texto =
      this.idioma() === 'eu' ? `${semana}, ${mes}k ${dia}` : `${semana}, ${dia} de ${mes}`;
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  /** Importe en céntimos como euros en el idioma actual. */
  readonly euros = (centimos: number): string => this.t('comun.euros', { centimos });

  cambiar(idioma: Idioma): void {
    if (idioma === this.idioma()) return;
    try {
      localStorage.setItem(CLAVE_ALMACEN, idioma);
    } catch {
      // Sin almacenamiento (modo privado): el cambio dura lo que la página.
    }
    this.document.location.reload();
  }
}

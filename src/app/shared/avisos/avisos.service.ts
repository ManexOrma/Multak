import { Service, signal } from '@angular/core';

const DURACION_MS = 4000;

/** Avisos breves tras una acción («Equipo creado», «Enlace copiado»). */
@Service()
export class AvisosService {
  private readonly actual = signal<string | null>(null);
  private temporizador: ReturnType<typeof setTimeout> | undefined;

  readonly mensaje = this.actual.asReadonly();

  mostrar(mensaje: string): void {
    clearTimeout(this.temporizador);
    this.actual.set(mensaje);
    this.temporizador = setTimeout(() => this.actual.set(null), DURACION_MS);
  }
}

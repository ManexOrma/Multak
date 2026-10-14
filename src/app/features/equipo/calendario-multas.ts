import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { I18n } from '../../core/i18n/i18n.service';
import { Cabecera } from '../../shared/cabecera';
import { aISO, deISO, hoyISO } from '../../shared/fechas';
import { Icono } from '../../shared/icono';
import { BotonMenu } from '../menu/boton-menu';
import { EquipoService, Multa, Pago } from './equipo.service';
import { FilaMulta } from './fila-multa';

interface Dia {
  iso: string;
  numero: number;
  delMes: boolean;
  multas: Multa[];
  pagos: Pago[];
  importe: number;
}

/** Umbral de arrastre horizontal (px) para cambiar de mes con el dedo. */
const UMBRAL_DESLIZAR = 50;

/**
 * Multas en un calendario: el mes entero de un vistazo (cuántas y cuánto cada
 * día), se cambia de mes con flechas o deslizando, y al tocar un día se ve su detalle.
 */
@Component({
  selector: 'app-calendario-multas',
  imports: [Cabecera, BotonMenu, Icono, FilaMulta],
  templateUrl: './calendario-multas.html',
  styleUrl: './calendario-multas.scss',
})
export class CalendarioMultas {
  protected readonly equipo = inject(EquipoService);
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  private readonly hoy = hoyISO();
  protected readonly hoyIso = this.hoy;
  /** Primer día del mes que se ve. */
  protected readonly mes = signal(deISO(this.hoy.slice(0, 8) + '01'));
  protected readonly seleccionado = signal<string | null>(this.hoy);
  protected readonly filtro = signal<string | null>(null);
  /** Dirección del último cambio de mes, para animar la entrada desde ese lado. */
  protected readonly direccion = signal<'adelante' | 'atras' | null>(null);

  protected readonly diasSemana = this.t('multas.dias-semana').split(',');
  private readonly rejilla = viewChild<ElementRef<HTMLElement>>('rejilla');
  private inicioArrastre: { x: number; y: number } | null = null;

  protected readonly tituloMes = computed(() => this.i18n.mesAno(this.mes()));
  protected readonly esMesActual = computed(
    () => aISO(this.mes()).slice(0, 7) === this.hoy.slice(0, 7),
  );

  /** Multas y pagos por día (con el filtro de jugador aplicado). */
  private readonly porDia = computed(() => {
    const filtro = this.filtro();
    const mapa = new Map<string, { multas: Multa[]; pagos: Pago[] }>();
    const entrada = (fecha: string) => {
      let valor = mapa.get(fecha);
      if (!valor) mapa.set(fecha, (valor = { multas: [], pagos: [] }));
      return valor;
    };
    for (const multa of this.equipo.multas()) {
      if (!filtro || multa.miembro_id === filtro) entrada(multa.fecha).multas.push(multa);
    }
    for (const pago of this.equipo.pagos()) {
      if (!pago.anulado && (!filtro || pago.miembro_id === filtro))
        entrada(pago.fecha).pagos.push(pago);
    }
    return mapa;
  });

  /** 6 semanas × 7 días, de lunes a domingo. */
  protected readonly dias = computed<Dia[]>(() => {
    const primero = this.mes();
    const desfase = (primero.getDay() + 6) % 7;
    const inicio = new Date(primero.getFullYear(), primero.getMonth(), 1 - desfase);
    const porDia = this.porDia();
    return Array.from({ length: 42 }, (_, i) => {
      const fecha = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);
      const iso = aISO(fecha);
      const datos = porDia.get(iso);
      const multas = datos?.multas ?? [];
      return {
        iso,
        numero: fecha.getDate(),
        delMes: fecha.getMonth() === primero.getMonth(),
        multas,
        pagos: datos?.pagos ?? [],
        importe: multas.filter((m) => !m.anulada).reduce((t, m) => t + m.importe_centimos, 0),
      };
    });
  });

  /** Intensidad del día (0–3) según el dinero en multas: el mes «se calienta» a la vista. */
  protected intensidad(dia: Dia): number {
    if (dia.importe === 0) return 0;
    if (dia.importe <= 300) return 1;
    if (dia.importe <= 800) return 2;
    return 3;
  }

  protected readonly resumenMes = computed(() => {
    const delMes = this.dias().filter((d) => d.delMes);
    const vigentes = delMes.flatMap((d) => d.multas.filter((m) => !m.anulada));
    return this.t('multas.resumen-mes', {
      n: vigentes.length,
      importe: this.i18n.euros(vigentes.reduce((t, m) => t + m.importe_centimos, 0)),
    });
  });

  protected readonly diaSeleccionado = computed(
    () => this.dias().find((d) => d.iso === this.seleccionado()) ?? null,
  );

  protected readonly tituloDia = computed(() => {
    const iso = this.seleccionado();
    return iso ? this.i18n.diaLargo(deISO(iso)) : '';
  });

  /** Frase del día sin multas: fija mientras no cambie el día. */
  protected readonly fraseVacia = computed(() => {
    this.seleccionado();
    return this.i18n.frase('gracia.dia-sin-multas');
  });

  protected etiqueta(dia: Dia): string {
    const fecha = new Intl.DateTimeFormat(this.i18n.locale, {
      day: 'numeric',
      month: 'long',
    }).format(deISO(dia.iso));
    return this.t('multas.dia-etiqueta', { fecha, n: dia.multas.filter((m) => !m.anulada).length });
  }

  protected textoMetodo(pago: Pago): string {
    return this.t(`metodo.${pago.metodo}`);
  }

  protected puntos(dia: Dia): number[] {
    return Array.from(
      { length: Math.min(dia.multas.filter((m) => !m.anulada).length, 3) },
      (_, i) => i,
    );
  }

  protected cambiarMes(delta: number): void {
    const actual = this.mes();
    this.direccion.set(delta > 0 ? 'adelante' : 'atras');
    this.mes.set(new Date(actual.getFullYear(), actual.getMonth() + delta, 1));
    // Al cambiar de mes se elige hoy (si está en él) o el primer día con multas.
    const enMes = this.dias().filter((d) => d.delMes);
    this.seleccionado.set(
      enMes.find((d) => d.iso === this.hoy)?.iso ?? enMes.find((d) => d.multas.length)?.iso ?? null,
    );
  }

  protected irAHoy(): void {
    const destino = deISO(this.hoy.slice(0, 8) + '01');
    this.direccion.set(destino < this.mes() ? 'atras' : 'adelante');
    this.mes.set(destino);
    this.seleccionado.set(this.hoy);
  }

  protected elegir(dia: Dia): void {
    if (!dia.delMes) {
      this.cambiarMes(dia.iso < aISO(this.mes()) ? -1 : 1);
    }
    this.seleccionado.set(dia.iso);
  }

  // --- Deslizar para cambiar de mes ---------------------------------------------------

  protected empezarArrastre(evento: PointerEvent): void {
    if (evento.pointerType === 'mouse') return;
    this.inicioArrastre = { x: evento.clientX, y: evento.clientY };
  }

  protected terminarArrastre(evento: PointerEvent): void {
    const inicio = this.inicioArrastre;
    this.inicioArrastre = null;
    if (!inicio) return;
    const dx = evento.clientX - inicio.x;
    const dy = evento.clientY - inicio.y;
    if (Math.abs(dx) > UMBRAL_DESLIZAR && Math.abs(dx) > Math.abs(dy) * 1.5) {
      this.cambiarMes(dx < 0 ? 1 : -1);
      this.rejilla()?.nativeElement.focus({ preventScroll: true });
    }
  }
}

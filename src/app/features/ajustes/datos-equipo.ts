import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { I18n } from '../../core/i18n/i18n.service';
import { FotosService } from '../../core/supabase/fotos.service';
import { AvisosService } from '../../shared/avisos/avisos.service';
import { colorKlub, ColorKlub } from '../../core/tema/klub';
import { TemaService } from '../../core/tema/tema.service';
import { Escudo } from '../../shared/escudo';
import { SelectorColor } from '../../shared/selector-color';
import { Icono } from '../../shared/icono';
import { EquiposService } from '../equipos/equipos.service';
import { AjustesService } from './ajustes.service';

/** Nombre, foto y color del club (solo admin). */
@Component({
  selector: 'app-datos-equipo',
  imports: [FormRoot, FormField, Escudo, Icono, SelectorColor],
  template: `
    <section class="seccion" aria-labelledby="titulo-datos">
      <h2 id="titulo-datos">{{ t('ajustes.datos') }}</h2>

      <div class="foto">
        <app-escudo
          [color]="color()"
          [foto]="urlFoto()"
          [tamano]="88"
          [class.subiendo]="subiendo()"
        />
        <div class="foto-acciones">
          <p class="etiqueta-campo">{{ t('ajustes.foto') }}</p>
          <button
            type="button"
            class="boton boton-secundario"
            [disabled]="subiendo()"
            (click)="elegirFoto()"
          >
            <app-icono nombre="camara" />
            {{
              subiendo()
                ? t('ajustes.foto-subiendo')
                : version()
                  ? t('ajustes.foto-cambiar')
                  : t('ajustes.foto-poner')
            }}
          </button>
          @if (version() && !subiendo()) {
            <button type="button" class="boton-enlace boton-enlace--peligro" (click)="quitarFoto()">
              {{ t('ajustes.foto-quitar') }}
            </button>
          }
          <p class="pie-grupo">{{ t('ajustes.foto-ayuda') }}</p>
        </div>
        <input #selector type="file" accept="image/*" hidden (change)="subirFoto($event)" />
      </div>

      <div class="color">
        <app-selector-color
          nombre="color-ajustes"
          ayudaId="color-ayuda"
          [valor]="color()"
          [desactivado]="guardandoColor()"
          (valorChange)="cambiarColor($event)"
        />
        <p id="color-ayuda" class="pie-grupo">{{ t('color.ayuda') }}</p>
      </div>

      <form [formRoot]="formulario" class="pila">
        <label for="equipo-nombre">{{ t('equipos.nombre-equipo') }}</label>
        <input
          id="equipo-nombre"
          autocomplete="off"
          [formField]="formulario.nombre"
          [attr.aria-invalid]="formulario.nombre().touched() && formulario.nombre().invalid()"
          aria-describedby="equipo-nombre-error"
        />
        <p id="equipo-nombre-error" class="error-campo">
          @if (formulario.nombre().touched() && formulario.nombre().invalid()) {
            {{ formulario.nombre().errors()[0].message }}
          }
        </p>
        <button type="submit" class="boton boton-secundario" [disabled]="formulario().submitting()">
          {{ t('ajustes.guardar-nombre') }}
        </button>
        <p class="error" role="alert">{{ error() }}</p>
      </form>
    </section>
  `,
  styles: `
    .foto {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      padding: 16px;
      border-radius: var(--radio-grupo);
      background: var(--celda);
      box-shadow: var(--sombra-celda);
    }

    .color {
      margin-bottom: 24px;

      .pie-grupo {
        margin-top: 4px;
      }
    }

    .foto-acciones {
      display: grid;
      justify-items: start;
      gap: 6px;

      .etiqueta-campo {
        margin: 0;
      }

      .boton {
        min-height: 40px;
        padding: 0 14px;
        font-size: 15px;
      }

      .boton-enlace {
        min-height: 32px;
        font-size: 15px;
      }

      .pie-grupo {
        margin: 0;
      }
    }

    .subiendo {
      animation: latido 1s var(--ease-in-out) infinite alternate;
    }

    @keyframes latido {
      to {
        opacity: 0.45;
        transform: scale(0.96);
      }
    }
  `,
})
export class DatosEquipo {
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  protected readonly ajustes = inject(AjustesService);
  private readonly equipos = inject(EquiposService);
  private readonly fotos = inject(FotosService);
  private readonly avisos = inject(AvisosService);
  private readonly selector = viewChild.required<ElementRef<HTMLInputElement>>('selector');

  protected readonly error = signal<string | null>(null);
  protected readonly subiendo = signal(false);
  private readonly tema = inject(TemaService);
  protected readonly guardandoColor = signal(false);
  protected readonly color = computed(() => colorKlub(this.ajustes.equipo()?.color));
  protected readonly version = computed(() => this.ajustes.equipo()?.foto_version ?? null);
  protected readonly urlFoto = computed(() => {
    const equipo = this.ajustes.equipo();
    return equipo ? this.fotos.url(equipo.id, equipo.foto_version) : null;
  });

  protected readonly modelo = signal({ nombre: this.ajustes.equipo()?.nombre ?? '' });
  protected readonly formulario = form(
    this.modelo,
    (campo) => {
      required(campo.nombre, { message: this.t('equipos.nombre-equipo-requerido') });
      maxLength(campo.nombre, 60, { message: this.t('comun.max-caracteres', { n: 60 }) });
    },
    { submission: { action: () => this.guardar() } },
  );

  protected elegirFoto(): void {
    this.selector().nativeElement.click();
  }

  protected async subirFoto(evento: Event): Promise<void> {
    const entrada = evento.target as HTMLInputElement;
    const archivo = entrada.files?.[0];
    entrada.value = '';
    const equipo = this.ajustes.equipo();
    if (!archivo || !equipo) return;
    this.subiendo.set(true);
    this.error.set(null);
    try {
      await this.fotos.subir(equipo.id, archivo, equipo.foto_version);
      await Promise.all([this.ajustes.recargarEquipo(), this.equipos.cargar()]);
      this.avisos.mostrar(this.t('ajustes.foto-lista'));
    } catch {
      this.error.set(this.t('error.foto'));
    } finally {
      this.subiendo.set(false);
    }
  }

  protected async quitarFoto(): Promise<void> {
    const equipo = this.ajustes.equipo();
    if (!equipo) return;
    this.error.set(null);
    try {
      await this.fotos.quitar(equipo.id);
      await Promise.all([this.ajustes.recargarEquipo(), this.equipos.cargar()]);
      this.avisos.mostrar(this.t('ajustes.foto-quitada'));
    } catch (e) {
      this.error.set(this.i18n.error(e));
    }
  }

  protected async cambiarColor(color: ColorKlub): Promise<void> {
    const anterior = this.color();
    if (color === anterior) return;
    // Se ve al momento; si falla, vuelve atrás.
    this.tema.ponerKlub(color);
    this.guardandoColor.set(true);
    this.error.set(null);
    try {
      await this.ajustes.cambiarColor(color);
      await this.equipos.cargar();
      this.avisos.mostrar(this.t('color.guardado'));
    } catch (e) {
      this.tema.ponerKlub(anterior);
      this.error.set(this.i18n.error(e));
    } finally {
      this.guardandoColor.set(false);
    }
  }

  private async guardar(): Promise<void> {
    this.error.set(null);
    try {
      await this.ajustes.renombrarEquipo(this.modelo().nombre.trim());
      await this.equipos.cargar();
      this.avisos.mostrar(this.t('ajustes.nombre-guardado'));
    } catch (e) {
      this.error.set(this.i18n.error(e));
    }
  }
}

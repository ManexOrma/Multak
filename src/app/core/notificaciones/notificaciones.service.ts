import { DOCUMENT } from '@angular/common';
import { computed, inject, Service, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SwPush } from '@angular/service-worker';
import { environment } from '../../../environments/environment';
import { I18n } from '../i18n/i18n.service';
import { SupabaseService } from '../supabase/supabase.service';

/**
 * - activadas / desactivadas: se puede elegir.
 * - instalar: iPhone o iPad sin la app instalada (Safari no deja; la app de la pantalla de inicio sí).
 * - bloqueado: el permiso está denegado; solo se cambia en los ajustes del navegador.
 * - no-soportado: el navegador no tiene push (o la app corre sin service worker, en desarrollo).
 */
export type EstadoAvisos = 'activadas' | 'desactivadas' | 'instalar' | 'bloqueado' | 'no-soportado';

/** Lo que dispara un aviso (la Edge Function «notificar» decide a quién avisar). */
export type TipoAviso = 'multa' | 'pago' | 'solicitud';

/**
 * Notificaciones push de este dispositivo: activar, desactivar y avisar de lo que
 * pasa. La suscripción del navegador se guarda en `suscripciones_push` (RLS: cada uno
 * las suyas) y la usa la Edge Function «notificar» para enviar los avisos.
 */
@Service()
export class NotificacionesService {
  private readonly swPush = inject(SwPush);
  private readonly supabase = inject(SupabaseService).client;
  private readonly i18n = inject(I18n);
  private readonly vista = inject(DOCUMENT).defaultView;

  private readonly suscripcion = toSignal(this.swPush.subscription, { initialValue: null });
  private readonly permiso = signal<NotificationPermission>(
    this.vista && 'Notification' in this.vista ? Notification.permission : 'default',
  );
  readonly ocupado = signal(false);

  private readonly soportado =
    this.swPush.isEnabled &&
    !!this.vista &&
    'PushManager' in this.vista &&
    'Notification' in this.vista;

  private readonly iosSinInstalar = (() => {
    const v = this.vista;
    if (!v) return false;
    const ios = /iPhone|iPad|iPod/.test(v.navigator.userAgent);
    const instalada =
      v.matchMedia('(display-mode: standalone)').matches ||
      (v.navigator as Navigator & { standalone?: boolean }).standalone === true;
    return ios && !instalada;
  })();

  readonly estado = computed<EstadoAvisos>(() => {
    if (!this.soportado) return this.iosSinInstalar ? 'instalar' : 'no-soportado';
    if (this.permiso() === 'denied') return 'bloqueado';
    return this.suscripcion() ? 'activadas' : 'desactivadas';
  });

  /** Pide permiso, suscribe este dispositivo y lo guarda. */
  async activar(): Promise<void> {
    this.ocupado.set(true);
    try {
      const suscripcion = await this.swPush.requestSubscription({
        serverPublicKey: environment.vapidPublicKey,
      });
      await this.guardar(suscripcion);
    } finally {
      this.permiso.set(Notification.permission);
      this.ocupado.set(false);
    }
  }

  async desactivar(): Promise<void> {
    this.ocupado.set(true);
    try {
      await this.olvidarDispositivo();
    } finally {
      this.ocupado.set(false);
    }
  }

  /**
   * Al abrir la app con las notificaciones activas: se asegura de que la suscripción
   * está guardada (p. ej. si el servidor la borró) y con el idioma actual.
   */
  async sincronizar(): Promise<void> {
    const suscripcion = this.suscripcion();
    if (this.estado() !== 'activadas' || !suscripcion) return;
    try {
      await this.guardar(suscripcion);
    } catch {
      // Sin red: se reintenta la próxima vez.
    }
  }

  /** Al cerrar sesión: este dispositivo deja de recibir los avisos de esa cuenta. */
  async olvidarDispositivo(): Promise<void> {
    const suscripcion = this.suscripcion();
    if (!suscripcion) return;
    await this.supabase.from('suscripciones_push').delete().eq('endpoint', suscripcion.endpoint);
    await this.swPush.unsubscribe().catch(() => undefined);
  }

  /**
   * Avisa a quien corresponda (en segundo plano: si falla, no molesta). El id es el de
   * la multa o el pago; en «solicitud», el del equipo.
   */
  avisar(tipo: TipoAviso, id: string): void {
    void this.supabase.functions.invoke('notificar', { body: { tipo, id } }).catch(() => undefined);
  }

  private async guardar(suscripcion: PushSubscription): Promise<void> {
    const { endpoint, keys } = suscripcion.toJSON();
    if (!endpoint || !keys?.['p256dh'] || !keys?.['auth']) throw new Error('suscripción');
    const idioma = this.i18n.idioma();
    const { error } = await this.supabase
      .from('suscripciones_push')
      .insert({ endpoint, p256dh: keys['p256dh'], auth: keys['auth'], idioma });
    // 23505: ya estaba guardada (es de este usuario); solo se actualiza el idioma.
    if (error && error.code !== '23505') throw error;
    if (error) {
      await this.supabase.from('suscripciones_push').update({ idioma }).eq('endpoint', endpoint);
    }
  }
}

import { computed, inject, Service, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';

/** Estado de la sesión. Los métodos de login llegan en la fase 2. */
@Service()
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly sesionActual = signal<Session | null>(null);
  private readonly sesionInicial: Promise<void>;

  readonly sesion = this.sesionActual.asReadonly();
  readonly usuario = computed(() => this.sesionActual()?.user ?? null);
  readonly haySesion = computed(() => this.sesionActual() !== null);

  constructor() {
    this.sesionInicial = new Promise((resolve) => {
      this.supabase.auth.onAuthStateChange((evento, sesion) => {
        this.sesionActual.set(sesion);
        if (evento === 'INITIAL_SESSION') resolve();
      });
    });
  }

  /** Resuelve cuando Supabase ha recuperado (o descartado) la sesión guardada. */
  esperarSesion(): Promise<void> {
    return this.sesionInicial;
  }

  async cerrarSesion(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}

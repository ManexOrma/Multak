import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEu from '@angular/common/locales/eu';
import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  inject,
  isDevMode,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withRouterConfig,
  withViewTransitions,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { I18n } from './core/i18n/i18n.service';
import { TituloTraducido } from './core/i18n/titulo';
import { TemaService } from './core/tema/tema.service';

registerLocaleData(localeEs);
registerLocaleData(localeEu);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Las rutas hijas de /e/:equipoId reciben equipoId como input.
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      // Transiciones suaves entre pantallas (styles.scss las ajusta y respeta el movimiento reducido).
      withViewTransitions({ skipInitialTransition: true }),
    ),
    { provide: TitleStrategy, useClass: TituloTraducido },
    // El idioma se fija al arrancar: fechas y euros salen en euskera o castellano.
    { provide: LOCALE_ID, useFactory: () => inject(I18n).locale },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' },
    provideAppInitializer(() => {
      inject(TemaService);
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};

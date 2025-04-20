import { ApplicationConfig, importProvidersFrom, LOCALE_ID } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  RouteReuseStrategy,
  withPreloading,
} from '@angular/router';
import { IonicRouteStrategy } from '@ionic/angular';

import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';

// Importaciones para localización
import { registerLocaleData } from '@angular/common';
import localeEnUS from '@angular/common/locales/en';
import localeEsES from '@angular/common/locales/es';
import localeEsCO from '@angular/common/locales/es-CO';
import { MAT_CARD_CONFIG } from '@angular/material/card';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MAT_MENU_DEFAULT_OPTIONS } from '@angular/material/menu';
import { httpHeadersInterceptor } from './shared/interceptores/http-headers.interceptor';
import { httpSpinnerInterceptor } from './shared/interceptores/http-spinner.interceptor';

// Registrar los locales
registerLocaleData(localeEsCO);
registerLocaleData(localeEsES);
registerLocaleData(localeEnUS);

// Factory function para el loader de traducciones
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'en-US' }, // Locale por defecto
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([httpHeadersInterceptor, httpSpinnerInterceptor]),
    ),
    provideAnimations(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient],
        },
        defaultLanguage: 'en',
      }),
    ),
    {
      provide: MAT_CARD_CONFIG,
      useValue: { appearance: 'outlined' },
    },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        hasBackdrop: true,
        panelClass: 'white-dialog-container',
      },
    },
    {
      provide: MAT_MENU_DEFAULT_OPTIONS,
      useValue: {
        overlayPanelClass: 'white-menu-panel',
      },
    },
  ],
};

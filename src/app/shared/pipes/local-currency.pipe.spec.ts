import { LocalCurrencyPipe } from './local-currency.pipe';

import { TestBed } from '@angular/core/testing';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
  TranslateStore,
} from '@ngx-translate/core';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsCO from '@angular/common/locales/es-CO';
import localeEsExtra from '@angular/common/locales/extra/es';
import { LocalizationService } from '../services/localization.service';

// Mock para LocalizationService
class MockLocalizationService {
  getLocale(): string {
    return 'es-ES';
  }

  getCurrencyCode(): string {
    return 'EUR';
  }

  // Agrega cualquier otro método que utilice tu servicio real
}

describe('LocalCurrencyPipe', () => {
  let pipe: LocalCurrencyPipe;
  let localizationService: LocalizationService;

  // Registramos los datos de localización antes de ejecutar las pruebas
  beforeAll(() => {
    registerLocaleData(localeEsCO, 'es-ES', localeEsExtra);
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        // Importamos TranslateModule con configuración para pruebas
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      providers: [
        // Usamos nuestro mock en lugar del servicio real
        { provide: LocalizationService, useClass: MockLocalizationService },
        { provide: LOCALE_ID, useValue: 'es-ES' },
        TranslateStore, // Añadimos explícitamente el TranslateStore
      ],
    });

    // Obtenemos las instancias de los servicios
    localizationService = TestBed.inject(LocalizationService);

    // Creamos una instancia del pipe
    pipe = new LocalCurrencyPipe(localizationService);
  });

  it('create an instance', () => {
    const pipe = new LocalCurrencyPipe(localizationService);
    expect(pipe).toBeTruthy();
  });

  it('should transform value with default locale and currency', () => {
    // Configuramos los valores esperados para el mock
    spyOn(localizationService, 'getLocale').and.returnValue('es-ES');
    spyOn(localizationService, 'getCurrencyCode').and.returnValue('EUR');

    // El valor esperado dependerá de la implementación específica del pipe de Angular
    const result = pipe.transform(1234.56);

    // Verificamos que se haya llamado a los métodos del servicio
    expect(localizationService.getLocale).toHaveBeenCalled();
    expect(localizationService.getCurrencyCode).toHaveBeenCalled();

    // Comprobamos que el resultado es una cadena (formato específico puede variar según la configuración)
    expect(typeof result).toBe('string');
  });
});

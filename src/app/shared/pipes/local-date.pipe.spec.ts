import { LocalDatePipe } from './local-date.pipe';
import { TestBed } from '@angular/core/testing';
import {
  TranslateService,
  TranslateStore,
  TranslateLoader,
  TranslateFakeLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEsExtra from '@angular/common/locales/extra/es';
import localeCo from '@angular/common/locales/es-CO';
import localeCoExtra from '@angular/common/locales/extra/es-CO';
import localeEn from '@angular/common/locales/en';
import localeEnExtra from '@angular/common/locales/extra/en';
import { BehaviorSubject } from 'rxjs';
import { LocalizationService } from '../services/localization.service';

// Mock para LocalizationService
class MockLocalizationService implements Partial<LocalizationService> {
  private locale = 'es-ES';

  // Propiedades requeridas por LocalizationService
  currentLocalizationSubject = new BehaviorSubject<any>({});
  currentLocalization$ = this.currentLocalizationSubject.asObservable();
  currentLang$ = new BehaviorSubject<string>('es').asObservable();
  localeId = 'es-ES';
  currentLocale$ = new BehaviorSubject<string>(this.locale);

  // Implementación de métodos utilizados por el pipe
  getLocale(): string {
    return this.locale;
  }

  // Método para cambiar el locale en las pruebas
  setLocale(newLocale: string): void {
    this.locale = newLocale;
    this.currentLocale$.next(newLocale);
  }

  // Añade otros métodos que tu LocalizationService tenga y que el pipe pueda llamar
  // Por ejemplo:
  getLang(): string {
    return this.locale.split('-')[0];
  }

  getCurrencyCode(): string {
    switch (this.locale) {
      case 'es-CO':
        return 'COP';
      case 'es-ES':
        return 'EUR';
      default:
        return 'USD';
    }
  }

  // Agrega aquí cualquier otro método que necesites
}

describe('LocalDatePipe', () => {
  let pipe: LocalDatePipe;
  let localizationService: LocalizationService;

  // Registramos los datos de localización antes de ejecutar las pruebas
  beforeAll(() => {
    registerLocaleData(localeEs, 'es-ES', localeEsExtra);
    registerLocaleData(localeCo, 'es-CO', localeCoExtra);
    registerLocaleData(localeEn, 'en-US', localeEnExtra);
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

    // Obtenemos la instancia del servicio
    localizationService = TestBed.inject(LocalizationService);

    // Creamos una instancia del pipe
    pipe = new LocalDatePipe(localizationService);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format date according to es-ES locale', () => {
    // Aseguramos que estamos usando el mock
    const mockService = localizationService as any;
    // Configuramos el locale español
    mockService.setLocale('es-ES');

    // Creamos una fecha fija para la prueba
    const testDate = new Date(2023, 0, 15, 14, 30); // 15 de enero de 2023, 14:30

    // Obtenemos el resultado formateado
    const result = pipe.transform(testDate);

    // Formato esperado para es-ES: dd/MM/yyyy HH:mm
    expect(result).toBe('15/01/2023 14:30');
  });

  it('should format date according to es-CO locale', () => {
    // Aseguramos que estamos usando el mock
    const mockService = localizationService as any;
    // Configuramos el locale colombiano
    mockService.setLocale('es-CO');

    // Creamos una fecha fija para la prueba (mañana)
    const testDateAM = new Date(2023, 0, 15, 10, 30); // 15 de enero de 2023, 10:30 AM
    const resultAM = pipe.transform(testDateAM);

    // Verificamos que la fecha tenga el formato esperado sin comparar exactamente el string
    expect(resultAM).toMatch(/15\/01\/2023\s+10:30\s+a\.\s*m\./);

    // Alternativa: verificamos que contenga las partes principales
    expect(resultAM).toContain('15/01/2023');
    expect(resultAM).toContain('10:30');
    expect(resultAM).toContain('a.');
    expect(resultAM).toContain('m.');

    // Prueba con PM
    const testDatePM = new Date(2023, 0, 15, 14, 30); // 15 de enero de 2023, 2:30 PM
    const resultPM = pipe.transform(testDatePM);

    // Verificamos que la fecha tenga el formato esperado sin comparar exactamente el string
    expect(resultPM).toMatch(/15\/01\/2023\s+2:30\s+p\.\s*m\./);

    // Alternativa: verificamos que contenga las partes principales
    expect(resultPM).toContain('15/01/2023');
    expect(resultPM).toContain('2:30');
    expect(resultPM).toContain('p.');
    expect(resultPM).toContain('m.');
  });

  it('should format date according to en-US locale', () => {
    // Aseguramos que estamos usando el mock
    const mockService = localizationService as any;
    // Configuramos el locale estadounidense
    mockService.setLocale('en-US');

    // Creamos una fecha fija para la prueba
    const testDate = new Date(2023, 0, 15, 14, 30); // January 15, 2023, 2:30 PM

    // Obtenemos el resultado formateado
    const result = pipe.transform(testDate);

    // Formato esperado para en-US: MM/dd/yyyy h:mm a
    expect(result).toContain('1/15/2023'); // Note: some browsers might not add leading zeros
    expect(result).toContain('PM');
  });

  it('should use custom format when provided', () => {
    // Aseguramos que estamos usando el mock
    const mockService = localizationService as any;
    // Probamos con cualquier locale y un formato personalizado
    mockService.setLocale('es-ES');

    const testDate = new Date(2023, 0, 15);
    const result = pipe.transform(testDate, 'yyyy-MM-dd');

    // El formato debe respetarse independientemente del locale
    expect(result).toBe('2023-01-15');
  });

  // Nuevas pruebas para el formato dateOnly

  it('should format date-only according to es-ES locale', () => {
    const mockService = localizationService as any;
    mockService.setLocale('es-ES');

    const testDate = new Date(2023, 0, 15, 14, 30);
    const result = pipe.transform(testDate, undefined, true);

    // Solo debe mostrar la fecha sin la hora
    expect(result).toBe('15/01/2023');
  });

  it('should format date-only according to es-CO locale', () => {
    const mockService = localizationService as any;
    mockService.setLocale('es-CO');

    const testDate = new Date(2023, 0, 15, 14, 30);
    const result = pipe.transform(testDate, undefined, true);

    // Solo debe mostrar la fecha sin la hora
    expect(result).toBe('15/01/2023');
  });

  it('should format date-only according to en-US locale', () => {
    const mockService = localizationService as any;
    mockService.setLocale('en-US');

    const testDate = new Date(2023, 0, 15, 14, 30);
    const result = pipe.transform(testDate, undefined, true);

    // Solo debe mostrar la fecha sin la hora para el formato estadounidense
    expect(result).toContain('1/15/2023');
    // No debe contener indicación AM/PM
    expect(result).not.toContain('PM');
    expect(result).not.toContain('AM');
  });

  it('should prioritize custom format over dateOnly parameter', () => {
    const mockService = localizationService as any;
    mockService.setLocale('es-ES');

    const testDate = new Date(2023, 0, 15, 14, 30);
    // Si se proporciona un formato personalizado, debe usarse ese formato
    // independientemente del valor de dateOnly
    const result = pipe.transform(testDate, 'yyyy/MM/dd', true);

    expect(result).toBe('2023/01/15');
  });
});

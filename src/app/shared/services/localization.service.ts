import { registerLocaleData } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

// Importamos todos los locales que necesitamos
import localeEsCO from '@angular/common/locales/es-CO';
import localeEsES from '@angular/common/locales/es';
import localeEnUS from '@angular/common/locales/en';
import { LanguageConfig } from '../modelos/LanguajeConfig.interface';

@Injectable({
  providedIn: 'root',
})
export class LocalizationService {
  // Configuraciones disponibles
  public availableLanguages: LanguageConfig[] = [
    {
      langCode: 'es',
      localeCode: 'es-CO',
      name: 'Español (CO)',
      currencyCode: 'COP',
      region: 'Colombia',
    },
    {
      langCode: 'es',
      localeCode: 'es-ES',
      name: 'Español (ES)',
      currencyCode: 'EUR',
      region: 'España',
    },
    {
      langCode: 'en',
      localeCode: 'en-US',
      name: 'English (US)',
      currencyCode: 'USD',
      region: 'United States',
    },
  ];

  // Único subject para manejar toda la información de localización
  private currentLocalizationSubject = new BehaviorSubject<LanguageConfig>(
    this.availableLanguages.find(l => l.localeCode === 'en-US') || this.availableLanguages[0],
  );
  public currentLocalization$ = this.currentLocalizationSubject.asObservable();

  // Derivamos los observables específicos a partir del principal
  public currentLocale$: Observable<string> = this.currentLocalization$.pipe(
    map(config => config?.localeCode || 'en-US'),
  );

  public currentLang$: Observable<string> = this.currentLocalization$.pipe(
    map(config => config?.langCode || 'en'),
  );

  constructor(
    @Inject(LOCALE_ID) private localeId: string,
    private translateService: TranslateService,
  ) {
    // Registramos todos los locales
    registerLocaleData(localeEsCO);
    registerLocaleData(localeEsES);
    registerLocaleData(localeEnUS);

    // Inicializar con la configuración guardada o del dispositivo
    this.initializeLanguage();
  }

  private initializeLanguage() {
    // Primero intentamos obtener el locale completo del localStorage
    const savedLocale = localStorage.getItem('selectedLocale');

    if (savedLocale) {
      // Buscamos la configuración para este locale
      const langConfig = this.availableLanguages.find(l => l.localeCode === savedLocale);
      if (langConfig) {
        this.setLocalization(langConfig);
        return;
      }
    }

    // Si no hay un locale guardado, usamos la detección avanzada
    try {
      // Obtenemos el locale completo del navegador (ej: "es-CO", "es-ES", "en-US")
      const deviceLocale = navigator.language;

      // Primero intentamos encontrar una coincidencia exacta
      let langConfig = this.availableLanguages.find(l => l.localeCode === deviceLocale);

      if (!langConfig) {
        // Si no hay coincidencia exacta, intentamos con solo el idioma base
        const baseLanguage = deviceLocale.split('-')[0]; // "es", "en", etc.

        // Encontramos la primera configuración con ese idioma base
        langConfig = this.availableLanguages.find(l => l.langCode === baseLanguage);
      }

      if (langConfig) {
        this.setLocalization(langConfig);
      } else {
        // Si no hay coincidencia, usar el predeterminado (inglés)
        const defaultConfig = this.availableLanguages.find(l => l.localeCode === 'en-US');
        if (defaultConfig) {
          this.setLocalization(defaultConfig);
        }
      }
    } catch (error) {
      console.error('Error al detectar idioma/región:', error);
      const defaultConfig = this.availableLanguages.find(l => l.localeCode === 'en-US');
      if (defaultConfig) {
        this.setLocalization(defaultConfig);
      }
    }
  }

  // Nuevo método centralizado para establecer la configuración de localización
  private setLocalization(config: LanguageConfig) {
    // Guardar en localStorage
    localStorage.setItem('selectedLocale', config.localeCode);

    // Configurar traducciones (usando el idioma base)
    this.translateService.use(config.langCode);

    // Actualizar el subject único
    this.currentLocalizationSubject.next(config);
  }

  public setLocale(localeCode: string) {
    // Buscar la configuración para este locale
    const langConfig = this.availableLanguages.find(l => l.localeCode === localeCode);

    if (!langConfig) {
      console.error(`Locale no soportado: ${localeCode}`);
      return;
    }

    this.setLocalization(langConfig);
  }

  // Método para cambiar solo la región manteniendo el idioma
  public setRegion(regionCode: string) {
    const currentLang = this.getCurrentLanguage();

    // Buscamos una configuración con el mismo idioma y la nueva región
    const newLocaleConfig = this.availableLanguages.find(
      l => l.langCode === currentLang && l.localeCode.endsWith(`-${regionCode}`),
    );

    if (newLocaleConfig) {
      this.setLocalization(newLocaleConfig);
    } else {
      console.error(`No hay configuración disponible para ${currentLang}-${regionCode}`);
    }
  }

  public getLocale(): string {
    return this.getCurrentLocalization()?.localeCode || 'en-US';
  }

  public getCurrentLanguage(): string {
    return this.getCurrentLocalization()?.langCode || 'en';
  }

  public getCurrentLocalization(): LanguageConfig {
    return this.currentLocalizationSubject.value;
  }

  public getCurrentRegion(): string {
    const locale = this.getLocale();
    return locale.split('-')[1]; // Devuelve "CO", "ES", "US", etc.
  }

  public getCurrencyCode(): string {
    return this.getCurrentLocalization()?.currencyCode || 'USD';
  }

  public getAllAvailableLanguages(): LanguageConfig[] {
    return this.availableLanguages;
  }
}

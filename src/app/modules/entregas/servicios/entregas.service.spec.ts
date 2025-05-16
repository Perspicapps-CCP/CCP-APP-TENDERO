import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { EntregasService } from './entregas.service';
import { environment } from '../../../../environments/environment';
import { Entrega } from '../interfaces/entregas.interface';

describe('EntregasService', () => {
  let service: EntregasService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let localizationServiceSpy: jasmine.SpyObj<LocalizationService>;
  let localDatePipeMock: any;

  // Mock de datos para las pruebas
  const mockEntregas: Entrega[] = [
    {
      guide_number: '001',
      address: 'Calle falsa 123',
      status: 'Finalizado',
      delivery_date: '2025-05-12',
      initial_date: 'COMPLETADO',
      phone: '3212599772',
    },
    {
      guide_number: '002',
      address: 'Calle falsa 123',
      status: 'Enrregado',
      delivery_date: '2025-05-12',
      initial_date: 'ESPERA',
      phone: '3212599772',
    },
  ];
  beforeEach(() => {
    // Spy para HttpClient
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

    // Spy para LocalizationService con propiedades observables
    localizationServiceSpy = jasmine.createSpyObj('LocalizationService', ['getCurrentLanguage'], {
      currentLocalization$: new BehaviorSubject({
        langCode: 'es',
        localeCode: 'es-CO',
      }).asObservable(),
      currentLocale$: of('es-CO'),
      currentLang$: of('es'),
    });

    localizationServiceSpy.getCurrentLanguage.and.returnValue('es');

    // Mock simple para LocalDatePipe
    localDatePipeMock = {
      transform: jasmine.createSpy('transform').and.callFake((date, format, toDate) => {
        // Simulamos la transformación de fechas basándonos en la entrada
        if (date === '2025-05-12T00:00:00.000Z') {
          return '12/05/2025';
        } else if (date === '2025-05-11T00:00:00.000Z') {
          return '11/05/2025';
        }
        return '01/01/2025'; // Valor por defecto
      }),
    };

    // Creamos el servicio directamente y reemplazamos la propiedad LocalDatePipe
    service = new EntregasService(httpClientSpy, localizationServiceSpy);
    // Sobreescribimos la propiedad privada para evitar la instanciación de LocalDatePipe
    Object.defineProperty(service, 'localDatePipe', {
      value: localDatePipeMock,
      writable: true,
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { EntregasService } from './entregas.service';
import { environment } from '../../../../environments/environment';
import { Entrega } from '../interfaces/entregas.interface';
import { Producto } from '../interfaces/productos.interface';

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
      initial_date: '2025-05-10',
      phone: '3212599772',
      products: [
        {
          name: 'Producto 1',
          price: '100',
          quantity: 2,
          product_code: 'P001',
          image: 'image1.jpg',
        },
      ],
    },
    {
      guide_number: '002',
      address: 'Calle falsa 123',
      status: 'Entregado',
      delivery_date: '2025-05-12',
      initial_date: '2025-05-11',
      phone: '3212599772',
      products: [
        {
          name: 'Producto 2',
          price: '200',
          quantity: 1,
          product_code: 'P002',
          image: 'image2.jpg',
        },
      ],
    },
  ];

  // Mock de respuesta del API
  const mockApiResponse = [
    {
      status: 'Finalizado',
      client: {
        phone: '3212599772',
      },
      address: {
        line: 'Calle falsa 123',
      },
      items: [
        {
          quantity: 2,
          product: {
            name: 'Producto 1',
            price: '100',
            product_code: 'P001',
            images: ['image1.jpg'],
          },
        },
      ],
      deliveries: [
        {
          shipping_number: '001',
          delivery_date: '2025-05-12T10:00:00Z',
          created_at: '2025-05-10T10:00:00Z',
          orders: [
            {
              product_code: 'P001',
            },
          ],
        },
      ],
    },
    {
      status: 'Entregado',
      client: {
        phone: '3212599772',
      },
      address: {
        line: 'Calle falsa 123',
      },
      items: [
        {
          quantity: 1,
          product: {
            name: 'Producto 2',
            price: '200',
            product_code: 'P002',
            images: ['image2.jpg'],
          },
        },
      ],
      deliveries: [
        {
          shipping_number: '002',
          delivery_date: '2025-05-12T10:00:00Z',
          created_at: '2025-05-11T10:00:00Z',
          orders: [
            {
              product_code: 'P002',
            },
          ],
        },
      ],
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

  it('should return a transformed array of Entrega objects when getDeliveries is called', done => {
    // Configuramos la respuesta mock del HttpClient
    httpClientSpy.get.and.returnValue(of(mockApiResponse));

    // Llamamos al método que estamos probando
    service.getDeliveries().subscribe({
      next: (entregas: Entrega[]) => {
        expect(entregas.length).toBe(2);

        // Verificamos que la primera entrega se ha transformado correctamente
        expect(entregas[0].guide_number).toBe('001');
        expect(entregas[0].status).toBe('Finalizado');
        expect(entregas[0].delivery_date).toBe('2025-05-12');
        expect(entregas[0].initial_date).toBe('2025-05-10');
        expect(entregas[0].phone).toBe('3212599772');
        expect(entregas[0].address).toBe('Calle falsa 123');

        // Verificamos que los productos se han transformado correctamente
        expect(entregas[0].products?.length).toBe(1);
        expect(entregas[0].products?.[0].name).toBe('Producto 1');
        expect(entregas[0].products?.[0].price).toBe('100');
        expect(entregas[0].products?.[0].quantity).toBe(2);
        expect(entregas[0].products?.[0].product_code).toBe('P001');
        expect(entregas[0].products?.[0].image).toBe('image1.jpg');

        // Verificamos que la segunda entrega se ha transformado correctamente
        expect(entregas[1].guide_number).toBe('002');
        expect(entregas[1].status).toBe('Entregado');

        done();
      },
      error: error => {
        done.fail('No debería haber un error: ' + JSON.stringify(error));
      },
    });

    // Verificamos que se ha llamado al método get con la URL correcta
    expect(httpClientSpy.get).toHaveBeenCalledWith(`${environment.apiUrlCCP}/api/v1/sales/sales`);
    expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
  });

  it('should handle empty response from API', done => {
    // Configuramos la respuesta vacía del HttpClient
    httpClientSpy.get.and.returnValue(of([]));

    // Llamamos al método que estamos probando
    service.getDeliveries().subscribe({
      next: (entregas: Entrega[]) => {
        expect(entregas.length).toBe(0);
        done();
      },
      error: error => {
        done.fail('No debería haber un error: ' + JSON.stringify(error));
      },
    });
  });

  it('should handle null response from API', done => {
    // Configuramos la respuesta nula del HttpClient
    httpClientSpy.get.and.returnValue(of(null));

    // Llamamos al método que estamos probando
    service.getDeliveries().subscribe({
      next: (entregas: Entrega[]) => {
        expect(entregas.length).toBe(0);
        done();
      },
      error: error => {
        done.fail('No debería haber un error: ' + JSON.stringify(error));
      },
    });
  });

  it('should handle response with no deliveries', done => {
    // Configuramos la respuesta sin entregas
    const responseWithNoDeliveries = [
      {
        status: 'Pendiente',
        client: { phone: '3212599772' },
        address: { line: 'Calle falsa 123' },
        items: [],
        deliveries: [], // Sin entregas
      },
    ];

    httpClientSpy.get.and.returnValue(of(responseWithNoDeliveries));

    // Llamamos al método que estamos probando
    service.getDeliveries().subscribe({
      next: (entregas: Entrega[]) => {
        expect(entregas.length).toBe(0);
        done();
      },
      error: error => {
        done.fail('No debería haber un error: ' + JSON.stringify(error));
      },
    });
  });

  it('should handle response with no orders in delivery', done => {
    // Configuramos la respuesta con entrega pero sin órdenes
    const responseWithNoOrders = [
      {
        status: 'Pendiente',
        client: { phone: '3212599772' },
        address: { line: 'Calle falsa 123' },
        items: [
          {
            quantity: 1,
            product: {
              name: 'Producto Test',
              price: '100',
              product_code: 'P003',
              images: ['image.jpg'],
            },
          },
        ],
        deliveries: [
          {
            shipping_number: '003',
            delivery_date: '2025-05-12T10:00:00Z',
            created_at: '2025-05-11T10:00:00Z',
            orders: [], // Sin órdenes
          },
        ],
      },
    ];

    httpClientSpy.get.and.returnValue(of(responseWithNoOrders));

    // Llamamos al método que estamos probando
    service.getDeliveries().subscribe({
      next: (entregas: Entrega[]) => {
        expect(entregas.length).toBe(1);
        expect(entregas[0].guide_number).toBe('003');
        expect(entregas[0].products).toEqual([]);
        done();
      },
      error: error => {
        done.fail('No debería haber un error: ' + JSON.stringify(error));
      },
    });
  });
});

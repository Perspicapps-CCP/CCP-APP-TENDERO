import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { PedidosService } from './pedidos.service';
import {
  Sales,
  Client,
  Product,
  Manufacturer,
  Item,
  Warehouse,
  Delivery,
} from '../interfaces/ventas.interface';

describe('PedidosService', () => {
  let service: PedidosService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let localizationServiceSpy: jasmine.SpyObj<LocalizationService>;
  let localDatePipeMock: any;

  // Mock de datos para las pruebas
  const mockManufacturer: Manufacturer = {
    id: 'M001',
    name: 'Fabricante A',
    country: 'Colombia',
  };

  const mockProduct1: Product = {
    id: 'P001',
    product_code: 'PROD-001',
    name: 'Producto 1',
    price: 50000,
    images: ['image1.jpg'],
    manufacturer: mockManufacturer,
  };

  const mockWarehouse: Warehouse = {
    id: 'W001',
    name: 'Bodega Principal',
    location: 'Bogotá',
  };

  const mockClient1: Client = {
    id: 'C001',
    full_name: 'Juan Pérez',
    email: 'juan@example.com',
    username: 'juanperez',
    phone: '3001234567',
    id_type: 'CC',
    identification: '123456789',
    role: 'CLIENT',
  };

  const mockSeller: Client = {
    id: 'S001',
    full_name: 'Carlos Vendedor',
    email: 'carlos@example.com',
    username: 'carlosv',
    phone: '3002223333',
    id_type: 'CC',
    identification: '112233445',
    role: 'SELLER',
  };

  const mockItems1: Item[] = [
    {
      product: mockProduct1,
      quantity: 2,
      subtotal: 100000,
    },
  ];

  const mockDelivery1: Delivery = {
    shipping_number: 'SHIP-001',
    license_plate: 'ABC123',
    driver_name: 'Pedro Conductor',
    warehouse: mockWarehouse,
    delivery_status: 'PENDIENTE',
    created_at: new Date('2025-05-10'),
    updated_at: new Date('2025-05-10'),
  };

  // Mock de respuesta de la API
  const mockApiResponse: any[] = [
    {
      id: '001',
      order_number: 'ORD-001-2025',
      total: 100000,
      date: '2025-05-12T00:00:00.000Z',
      status: 'COMPLETADO',
      client: mockClient1,
      seller: mockSeller,
      items: mockItems1,
      deliveries: [mockDelivery1],
    },
    {
      id: '002',
      order_number: 'ORD-002-2025',
      total: 200000,
      date: '2025-05-11T00:00:00.000Z',
      status: 'PENDIENTE',
      client: {
        id: 'C002',
        full_name: 'María López',
        email: 'maria@example.com',
        username: 'marialopez',
        phone: '3007654321',
        id_type: 'CC',
        identification: '987654321',
        role: 'CLIENT',
      },
      seller: mockSeller,
      items: [
        {
          product: mockProduct1,
          quantity: 1,
          subtotal: 50000,
        },
        {
          product: {
            id: 'P002',
            product_code: 'PROD-002',
            name: 'Producto 2',
            price: 75000,
            images: ['image2.jpg'],
            manufacturer: mockManufacturer,
          },
          quantity: 2,
          subtotal: 150000,
        },
      ],
      deliveries: [
        {
          shipping_number: 'SHIP-002',
          license_plate: 'XYZ789',
          driver_name: 'Luisa Conductora',
          warehouse: mockWarehouse,
          delivery_status: 'ENTREGADO',
          created_at: new Date('2025-05-08'),
          updated_at: new Date('2025-05-09'),
        },
      ],
    },
  ];

  // Resultado esperado después de la transformación
  const expectedSales: Sales[] = [
    {
      id: '001',
      order_number: 'ORD-001-2025',
      total: 100000,
      date: '12/05/2025', // Fecha transformada por el pipe
      status: 'COMPLETADO',
      client: mockClient1,
      seller: mockSeller,
      items: mockItems1,
      deliveries: [mockDelivery1],
      totalItems: '1',
    },
    {
      id: '002',
      order_number: 'ORD-002-2025',
      total: 200000,
      date: '11/05/2025', // Fecha transformada por el pipe
      status: 'PENDIENTE',
      client: {
        id: 'C002',
        full_name: 'María López',
        email: 'maria@example.com',
        username: 'marialopez',
        phone: '3007654321',
        id_type: 'CC',
        identification: '987654321',
        role: 'CLIENT',
      },
      seller: mockSeller,
      items: [
        {
          product: mockProduct1,
          quantity: 1,
          subtotal: 50000,
        },
        {
          product: {
            id: 'P002',
            product_code: 'PROD-002',
            name: 'Producto 2',
            price: 75000,
            images: ['image2.jpg'],
            manufacturer: mockManufacturer,
          },
          quantity: 2,
          subtotal: 150000,
        },
      ],
      deliveries: [
        {
          shipping_number: 'SHIP-002',
          license_plate: 'XYZ789',
          driver_name: 'Luisa Conductora',
          warehouse: mockWarehouse,
          delivery_status: 'ENTREGADO',
          created_at: new Date('2025-05-08'),
          updated_at: new Date('2025-05-09'),
        },
      ],
      totalItems: '2',
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
    service = new PedidosService(httpClientSpy, localizationServiceSpy);
    // Sobreescribimos la propiedad privada para evitar la instanciación de LocalDatePipe
    Object.defineProperty(service, 'localDatePipe', {
      value: localDatePipeMock,
      writable: true,
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve sales from the API and transform them correctly', () => {
    // Configuramos el spy para devolver la respuesta mockeada
    httpClientSpy.get.and.returnValue(of(mockApiResponse));

    // Llamamos al método a probar
    service.obtenerVentasCliente().subscribe(ventas => {
      expect(ventas.length).toBe(2);

      // Verificamos la primera venta
      expect(ventas[0].id).toBe('001');
      expect(ventas[0].totalItems).toBe('1');
      expect(ventas[0].date).toBe('12/05/2025');

      // Verificamos la segunda venta
      expect(ventas[1].id).toBe('002');
      expect(ventas[1].totalItems).toBe('2');
      expect(ventas[1].date).toBe('11/05/2025');

      // Verificamos que se llamó al método transform
      expect(localDatePipeMock.transform).toHaveBeenCalledTimes(2);

      // Verificamos las llamadas al pipe
      const calls = localDatePipeMock.transform.calls.all();
      expect(calls[0].args[0]).toBe('2025-05-12T00:00:00.000Z');
      expect(calls[0].args[1]).toBeUndefined();
      expect(calls[0].args[2]).toBeTrue();

      expect(calls[1].args[0]).toBe('2025-05-11T00:00:00.000Z');
      expect(calls[1].args[1]).toBeUndefined();
      expect(calls[1].args[2]).toBeTrue();
    });

    // Verificamos que se llamó al API con la URL correcta
    expect(httpClientSpy.get).toHaveBeenCalledWith(`${environment.apiUrlCCP}/api/v1/sales/sales/`);
  });

  it('should handle empty sales array', () => {
    // Configuramos el spy para devolver un array vacío
    httpClientSpy.get.and.returnValue(of([]));

    // Llamamos al método a probar
    service.obtenerVentasCliente().subscribe(ventas => {
      expect(ventas).toEqual([]);
      expect(ventas.length).toBe(0);

      // Verificamos que no se llamó al método transform
      expect(localDatePipeMock.transform).not.toHaveBeenCalled();
    });

    // Verificamos que se llamó al API con la URL correcta
    expect(httpClientSpy.get).toHaveBeenCalledWith(`${environment.apiUrlCCP}/api/v1/sales/sales/`);
  });

  it('should calculate totalItems correctly', () => {
    // Creamos un mock con diferentes cantidades de items
    const mockWithDifferentItems = [
      {
        ...mockApiResponse[0],
        items: [], // Sin items
      },
      {
        ...mockApiResponse[1],
        items: Array(5).fill(mockItems1[0]), // 5 items
      },
    ];

    // Configuramos el spy para devolver la respuesta modificada
    httpClientSpy.get.and.returnValue(of(mockWithDifferentItems));

    // Llamamos al método a probar
    service.obtenerVentasCliente().subscribe(ventas => {
      expect(ventas[0].totalItems).toBe('0'); // Debería ser '0' para el array vacío
      expect(ventas[1].totalItems).toBe('5'); // Debería ser '5' para el array con 5 items
    });
  });
});

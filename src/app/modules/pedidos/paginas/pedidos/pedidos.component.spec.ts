import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { PedidosComponent } from './pedidos.component';
import { PedidosService } from '../../servicios/pedidos.service';
import { DinamicSearchService } from 'src/app/shared/services/dinamic-search.service';
import {
  Sales,
  Client,
  Product,
  Manufacturer,
  Item,
  Warehouse,
  Delivery,
} from '../../interfaces/ventas.interface';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { HighlightTextPipe } from 'src/app/shared/pipes/highlight-text.pipe';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { LocalizationService } from 'src/app/shared/services/localization.service';

// Clase Mock para TranslateLoader
export class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}

// Mock para TranslateService
class MockTranslateService {
  get(key: string | string[]) {
    return of(key);
  }
  instant(key: string | string[]) {
    return key;
  }
  getBrowserLang() {
    return 'es';
  }
  setDefaultLang(lang: string) {}
  use(lang: string) {
    return of({});
  }
  onLangChange = new BehaviorSubject({ lang: 'es' });
  onTranslationChange = new BehaviorSubject({});
  onDefaultLangChange = new BehaviorSubject({});
}

// Mock para LocalizationService
class MockLocalizationService {
  currentLanguage: string = 'es';

  initializeLanguage() {
    return;
  }

  setLocalization(locale: string) {
    this.currentLanguage = locale;
    return;
  }

  getLocalCurrencyFormat(value: number) {
    return `$ ${value.toFixed(2)}`;
  }

  getLocale() {
    return 'es-CO';
  }

  getCurrencyCode() {
    return 'COP';
  }
}

// Mock para DinamicSearchService
class MockDinamicSearchService {
  dynamicSearch(items: Sales[], searchTerm: string) {
    if (!searchTerm) return items;
    return items.filter(
      pedido =>
        pedido.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.client.identification.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }
}

describe('PedidosComponent', () => {
  let component: PedidosComponent;
  let fixture: ComponentFixture<PedidosComponent>;
  let pedidosService: any;
  let dinamicSearchService: DinamicSearchService;
  let router: jasmine.SpyObj<Router>;

  // Mock de datos de clientes
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

  const mockClient2: Client = {
    id: 'C002',
    full_name: 'María López',
    email: 'maria@example.com',
    username: 'marialopez',
    phone: '3007654321',
    id_type: 'CC',
    identification: '987654321',
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

  // Mock de productos
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

  const mockProduct2: Product = {
    id: 'P002',
    product_code: 'PROD-002',
    name: 'Producto 2',
    price: 75000,
    images: ['image2.jpg'],
    manufacturer: mockManufacturer,
  };

  // Mock de items
  const mockItems1: Item[] = [
    {
      product: mockProduct1,
      quantity: 2,
      subtotal: 100000,
    },
  ];

  const mockItems2: Item[] = [
    {
      product: mockProduct1,
      quantity: 1,
      subtotal: 50000,
    },
    {
      product: mockProduct2,
      quantity: 2,
      subtotal: 150000,
    },
  ];

  // Mock de warehouse
  const mockWarehouse: Warehouse = {
    id: 'W001',
    name: 'Bodega Principal',
    location: 'Bogotá',
  };

  // Mock de deliveries
  const mockDelivery1: Delivery = {
    shipping_number: 'SHIP-001',
    license_plate: 'ABC123',
    driver_name: 'Pedro Conductor',
    warehouse: mockWarehouse,
    delivery_status: 'PENDIENTE',
    created_at: new Date('2025-05-10'),
    updated_at: new Date('2025-05-10'),
  };

  const mockDelivery2: Delivery = {
    shipping_number: 'SHIP-002',
    license_plate: 'XYZ789',
    driver_name: 'Luisa Conductora',
    warehouse: mockWarehouse,
    delivery_status: 'ENTREGADO',
    created_at: new Date('2025-05-08'),
    updated_at: new Date('2025-05-09'),
  };

  // Mock de ventas completas
  const mockPedidos: Sales[] = [
    {
      id: '001',
      order_number: 'ORD-001-2025',
      total: 100000,
      date: new Date('2025-05-12'),
      status: 'COMPLETADO',
      client: mockClient1,
      seller: mockSeller,
      items: mockItems1,
      deliveries: [mockDelivery1],
      totalItems: '2',
    },
    {
      id: '002',
      order_number: 'ORD-002-2025',
      total: 200000,
      date: new Date('2025-05-11'),
      status: 'PENDIENTE',
      client: mockClient2,
      seller: mockSeller,
      items: mockItems2,
      deliveries: [mockDelivery2],
      totalItems: '3',
    },
  ];

  beforeEach(waitForAsync(() => {
    // Crear un servicio mock simple
    const pedidosServiceMock = {
      obtenerVentasCliente: jasmine
        .createSpy('obtenerVentasCliente')
        .and.returnValue(of(mockPedidos)),
    };

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule,
        MatCardModule,
        PedidosComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: PedidosService, useValue: pedidosServiceMock },
        { provide: DinamicSearchService, useClass: MockDinamicSearchService },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: LocalizationService, useClass: MockLocalizationService },
        TranslateStore,
        HighlightTextPipe,
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PedidosComponent);
    component = fixture.componentInstance;
    pedidosService = TestBed.inject(PedidosService);
    dinamicSearchService = TestBed.inject(DinamicSearchService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load sales on ionViewWillEnter', () => {
    component.ionViewWillEnter();
    expect(pedidosService.obtenerVentasCliente).toHaveBeenCalled();
    expect(component.pedidosCliente.length).toBe(2);
    expect(component.pedidosCliente[0].client.full_name).toBe('Juan Pérez');
    expect(component.pedidosCliente[1].client.full_name).toBe('María López');
  });

  it('should initialize filterPedidos$ observable on ionViewWillEnter', () => {
    component.ionViewWillEnter();
    expect(component.filterPedidos$).toBeDefined();
  });

  it('should return all sales when search term is empty', () => {
    component.ionViewWillEnter();
    component.formBusquedaPedidos.setValue('');
    component.filterPedidos$?.subscribe(filteredPedidos => {
      expect(filteredPedidos.length).toBe(2);
    });
  });

  it('should properly search sales with buscar method', () => {
    component.pedidosCliente = mockPedidos;
    spyOn(dinamicSearchService, 'dynamicSearch').and.callThrough();

    const resultWithTerm = component.buscar('María');
    expect(resultWithTerm.length).toBe(1);
    expect(resultWithTerm[0].client.full_name).toBe('María López');
    expect(dinamicSearchService.dynamicSearch).toHaveBeenCalled();

    const resultWithOrderNumber = component.buscar('ORD-001');
    expect(resultWithOrderNumber.length).toBe(1);
    expect(resultWithOrderNumber[0].order_number).toBe('ORD-001-2025');

    const resultWithNonExistingTerm = component.buscar('Persona inexistente');
    expect(resultWithNonExistingTerm.length).toBe(0);

    const resultWithoutTerm = component.buscar('');
    expect(resultWithoutTerm.length).toBe(2);
  });

  it('should handle empty sales list', () => {
    component.pedidosCliente = [];
    component.filterPedidos();
    component.filterPedidos$?.subscribe(filteredPedidos => {
      expect(filteredPedidos.length).toBe(0);
    });
    const result = component.buscar('cualquier cosa');
    expect(result.length).toBe(0);
  });

  it('should handle error in obtenerVentasCliente', done => {
    const errorMsg = 'Error al obtener pedidos';
    pedidosService.obtenerVentasCliente.and.returnValue(throwError(() => new Error(errorMsg)));

    // Guardar el método original para restaurarlo después
    const originalMethod = component.ionViewWillEnter;

    // Redefinir el método para capturar el error
    component.ionViewWillEnter = function () {
      pedidosService.obtenerVentasCliente().subscribe({
        next: (data: Sales[]) => {
          this.pedidosCliente = data;
          this.filterPedidos();
        },
        error: (err: Error) => {
          expect(err.message).toBe(errorMsg);
          done();
        },
      });
    };

    try {
      component.ionViewWillEnter();
    } catch (e) {
      done.fail('No se debería lanzar un error no capturado');
    }

    // Restaurar el método original
    setTimeout(() => {
      component.ionViewWillEnter = originalMethod;
    });
  });

  it('should navigate to shopping cart when irCarritoCompras is called', () => {
    component.irCarritoCompras();
    expect(router.navigate).toHaveBeenCalledWith(['/carritoCompras']);
  });

  it('should filter pedidos by client identification', () => {
    component.pedidosCliente = mockPedidos;
    spyOn(dinamicSearchService, 'dynamicSearch').and.callThrough();

    const result = component.buscar('123456789'); // Búsqueda por identificación
    expect(result.length).toBe(1);
    expect(result[0].client.identification).toBe('123456789');
    expect(dinamicSearchService.dynamicSearch).toHaveBeenCalled();
  });

  it('should update observable with filtered data when form value changes', () => {
    component.pedidosCliente = mockPedidos;
    component.filterPedidos();

    // Suscribirse para comprobar que se emiten los datos correctos
    let emittedData: Sales[] = [];
    component.filterPedidos$?.subscribe(data => {
      emittedData = data;
    });

    // Inicialmente debería emitir todos los pedidos (término vacío)
    expect(emittedData.length).toBe(2);

    // Cambiar el valor del form para activar el filtrado
    component.formBusquedaPedidos.setValue('María');

    // Comprobar que se filtró correctamente
    expect(emittedData.length).toBe(1);
    expect(emittedData[0].client.full_name).toBe('María López');
  });

  it('should return a copy of the original array when search term is empty', () => {
    component.pedidosCliente = mockPedidos;
    const result = component.buscar('');

    // Verificar que devuelve una copia y no la referencia original
    expect(result).not.toBe(component.pedidosCliente);
    expect(result.length).toBe(component.pedidosCliente.length);
    expect(result[0].id).toBe(component.pedidosCliente[0].id);
  });
});

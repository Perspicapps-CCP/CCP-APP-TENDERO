import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CatalogoService } from './catalogo.service';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { LocalCurrencyPipe } from 'src/app/shared/pipes/local-currency.pipe';
import { Producto } from '../interfaces/productos.interface';
import { environment } from 'src/environments/environment';

describe('CatalogoService', () => {
  let service: CatalogoService;
  let httpMock: HttpTestingController;
  let localizationServiceMock: jasmine.SpyObj<LocalizationService>;
  let localCurrencyPipeMock: jasmine.SpyObj<LocalCurrencyPipe>;

  // Mock de productos para usar en las pruebas
  const mockProductos: Producto[] = [
    {
      product_id: 'P001',
      product_name: 'Producto 1',
      product_code: 'PROD-001',
      manufacturer_name: 'Fabricante 1',
      price: 100,
      price_currency: '',
      images: ['imagen1.jpg', 'imagen2.jpg'],
      quantity: 1,
      quantity_selected: 0,
    },
    {
      product_id: 'P002',
      product_name: 'Producto 2',
      product_code: 'PROD-002',
      manufacturer_name: 'Fabricante 2',
      price: 200,
      price_currency: '',
      images: ['imagen3.jpg', 'imagen4.jpg'],
      quantity: 2,
      quantity_selected: 0,
    },
  ];

  // Producto transformado esperado después de aplicar el pipe
  const mockProductosTransformados: Producto[] = [
    {
      product_id: 'P001',
      product_name: 'Producto 1',
      product_code: 'PROD-001',
      manufacturer_name: 'Fabricante 1',
      price: 100,
      price_currency: '$ 100.00',
      images: ['imagen1.jpg', 'imagen2.jpg'],
      quantity: 1,
      quantity_selected: 0,
    },
    {
      product_id: 'P002',
      product_name: 'Producto 2',
      product_code: 'PROD-002',
      manufacturer_name: 'Fabricante 2',
      price: 200,
      price_currency: '$ 200.00',
      images: ['imagen3.jpg', 'imagen4.jpg'],
      quantity: 2,
      quantity_selected: 0,
    },
  ];

  beforeEach(() => {
    // Creamos los mocks para los servicios y pipes
    localCurrencyPipeMock = jasmine.createSpyObj('LocalCurrencyPipe', ['transform']);
    localizationServiceMock = jasmine.createSpyObj('LocalizationService', ['getCurrentLocale']);

    // Configuramos el comportamiento del mock del pipe
    localCurrencyPipeMock.transform.and.callFake((value: number) => {
      return `$ ${value.toFixed(2)}`;
    });

    // Configuramos TestBed con el nuevo enfoque recomendado
    TestBed.configureTestingModule({
      providers: [
        CatalogoService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LocalizationService, useValue: localizationServiceMock },
      ],
    });

    // Obtenemos instancias de los servicios
    service = TestBed.inject(CatalogoService);
    httpMock = TestBed.inject(HttpTestingController);

    // Reemplazamos la instancia de LocalCurrencyPipe que se crea en el constructor
    // @ts-ignore: Accedemos a una propiedad privada para testing
    service['localCurrencyPipe'] = localCurrencyPipeMock;
  });

  afterEach(() => {
    // Verificamos que no haya solicitudes pendientes
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get products from API and transform prices', () => {
    // Llamamos al método a probar
    service.obtenerProductos().subscribe(productos => {
      // Verificamos que la respuesta sea la esperada
      expect(productos).toEqual(mockProductosTransformados);

      // Verificamos que el pipe se haya llamado para cada producto
      expect(localCurrencyPipeMock.transform).toHaveBeenCalledTimes(2);
      expect(localCurrencyPipeMock.transform).toHaveBeenCalledWith(100);
      expect(localCurrencyPipeMock.transform).toHaveBeenCalledWith(200);
    });

    // Configuramos la respuesta mock para la solicitud HTTP
    const req = httpMock.expectOne(`${environment.apiUrlCCP}/inventory/stock/catalog/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProductos);
  });

  it('should handle pipe transformation returning null', () => {
    // Modificamos el comportamiento del mock para devolver null en un caso
    localCurrencyPipeMock.transform.and.callFake((value: number) => {
      if (value === 100) return null;
      return `$ ${value.toFixed(2)}`;
    });

    // Llamamos al método a probar
    service.obtenerProductos().subscribe(productos => {
      // Verificamos que cuando el pipe devuelve null, se usa '0'
      expect(productos[0].price_currency).toBe('0');
      expect(productos[1].price_currency).toBe('$ 200.00');
    });

    // Configuramos la respuesta mock
    const req = httpMock.expectOne(`${environment.apiUrlCCP}/inventory/stock/catalog/`);
    req.flush(mockProductos);
  });

  it('should get and set productoSeleccionado', () => {
    // Verificamos que inicialmente sea undefined
    expect(service.productoSeleccionado).toBeUndefined();

    // Asignamos un producto
    service.productoSeleccionado = mockProductos[0];

    // Verificamos que se haya asignado correctamente
    expect(service.productoSeleccionado).toEqual(mockProductos[0]);
  });

  it('should handle HTTP errors in obtenerProductos', () => {
    // Espiamos console.error para verificar manejo de errores
    spyOn(console, 'error');

    // Llamamos al método a probar
    service.obtenerProductos().subscribe({
      next: () => fail('Expected an error, not products'),
      error: error => {
        // Verificamos que el error se propague correctamente
        expect(error.status).toBe(500);
      },
    });

    // Configuramos un error en la respuesta HTTP
    const req = httpMock.expectOne(`${environment.apiUrlCCP}/inventory/stock/catalog/`);
    req.flush('Error loading products', {
      status: 500,
      statusText: 'Server Error',
    });
  });
});

import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subject, of, throwError } from 'rxjs';

import { User } from 'src/app/modules/auth/interfaces/usuario.interface';
import { UsuarioService } from 'src/app/modules/auth/servicios/usuario.service';
import { LocalizationService } from 'src/app/shared/services/localization.service'; // Añadida importación
import { Producto } from '../../interfaces/productos.interface';
import { CarritoComprasService } from '../../servicios/carrito-compras.service';
import { CrearPedidoService } from '../../servicios/crear-pedido.service';
import { CarritoComprasComponent } from './carrito-compras.component';

// Productos mock para el carrito
const mockProductosCarrito: Producto[] = [
  {
    product_id: 'P001',
    product_name: 'Producto 1',
    product_code: 'PROD-001',
    manufacturer_name: 'Fabricante 1',
    price: 100,
    price_currency: '$ 100.00',
    images: ['imagen1.jpg'],
    quantity: 10,
    quantity_selected: 2,
  },
  {
    product_id: 'P002',
    product_name: 'Producto 2',
    product_code: 'PROD-002',
    manufacturer_name: 'Fabricante 2',
    price: 200,
    price_currency: '$ 200.00',
    images: ['imagen2.jpg'],
    quantity: 5,
    quantity_selected: 1,
  },
];

// Mock de usuario
const mockUsuario: User = {
  id: '001',
  username: 'juanp',
  email: 'juan.perez@example.com',
  role: 'client',
};

// Mock para el LocalizationService
const mockLocalizationService = jasmine.createSpyObj('LocalizationService', [
  'setLocalization',
  'initializeLanguage',
  'getLocalization',
  'initAppLanguage',
]);
mockLocalizationService.setLocalization.and.returnValue(null);
mockLocalizationService.getLocalization.and.returnValue('es');
mockLocalizationService.initAppLanguage.and.returnValue(null);
mockLocalizationService.initializeLanguage.and.returnValue(null);

describe('CarritoComprasComponent', () => {
  let component: CarritoComprasComponent;
  let fixture: ComponentFixture<CarritoComprasComponent>;
  let usuarioService: jasmine.SpyObj<Partial<UsuarioService>>;
  let router: jasmine.SpyObj<Router>;
  let carritoComprasService: jasmine.SpyObj<Partial<CarritoComprasService>>;
  let translateService: jasmine.SpyObj<Partial<TranslateService>>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let crearPedidoService: jasmine.SpyObj<Partial<CrearPedidoService>>;

  beforeEach(() => {
    // Crear spies para los servicios
    const usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', [], {
      usuario: mockUsuario,
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const carritoComprasServiceSpy = jasmine.createSpyObj(
      'CarritoComprasService',
      [
        'getCurrentCart',
        'getCurrentClientId',
        'removeFromCurrentCart',
        'updateProductQuantity',
        'clearCurrentCart',
      ],
      { productAvailabilityChanged$: new Subject<string | null>() },
    );
    carritoComprasServiceSpy.getCurrentCart.and.returnValue([...mockProductosCarrito]);
    carritoComprasServiceSpy.getCurrentClientId.and.returnValue('001');

    const translateServiceSpy = jasmine.createSpyObj(
      'TranslateService',
      [
        'get',
        'use',
        'setDefaultLang',
        'currentLang',
        'instant',
        'onTranslationChange',
        'onLangChange',
        'onDefaultLangChange',
        'getBrowserLang',
        'stream',
        'instant',
      ],
      {
        onTranslationChange: new Subject(),
        onLangChange: new Subject(),
        onDefaultLangChange: new Subject(),
      },
    );
    translateServiceSpy.get.and.returnValue(of('mensaje traducido'));
    translateServiceSpy.use.and.returnValue(of({}));
    translateServiceSpy.instant.and.returnValue('mensaje traducido');
    translateServiceSpy.stream.and.returnValue(of('mensaje traducido'));
    translateServiceSpy.currentLang = 'es';

    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    const crearPedidoServiceSpy = jasmine.createSpyObj('CrearPedidoService', ['crearPedido']);
    crearPedidoServiceSpy.crearPedido.and.returnValue(of({}));

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), CommonModule, ReactiveFormsModule],
      providers: [
        { provide: UsuarioService, useValue: usuarioServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: CarritoComprasService, useValue: carritoComprasServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: CrearPedidoService, useValue: crearPedidoServiceSpy },
        // Añadir el mock del LocalizationService
        { provide: LocalizationService, useValue: mockLocalizationService },
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CarritoComprasComponent);
    component = fixture.componentInstance;

    // Obtener instancias de los servicios
    usuarioService = TestBed.inject(UsuarioService) as jasmine.SpyObj<Partial<UsuarioService>>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    carritoComprasService = TestBed.inject(CarritoComprasService) as jasmine.SpyObj<
      Partial<CarritoComprasService>
    >;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<
      Partial<TranslateService>
    >;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    crearPedidoService = TestBed.inject(CrearPedidoService) as jasmine.SpyObj<
      Partial<CrearPedidoService>
    >;

    // Espiar métodos del componente
    spyOn(component, 'obtenerProductosCarritoCompras').and.callThrough();
    spyOn(component, 'subscribeToInventoryChanges').and.callThrough();
    spyOn(window.history, 'back');

    // Por defecto, no queremos que se ejecute .detectChanges() ya que estamos probando lógica del componente,
    // no la plantilla. Esto evita errores relacionados con el procesamiento de la plantilla.
    // fixture.detectChanges();
  });

  // Tests básicos de componente y servicios
  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(usuarioService).toBeTruthy();
    expect(router).toBeTruthy();
    expect(carritoComprasService).toBeTruthy();
    expect(translateService).toBeTruthy();
    expect(snackBar).toBeTruthy();
    expect(crearPedidoService).toBeTruthy();
  });

  // Tests de ciclo de vida
  it('should call obtenerInfoCliente on ionViewWillEnter', () => {
    spyOn(component, 'obtenerInfoCliente');
    component.ionViewWillEnter();
    expect(component.obtenerInfoCliente).toHaveBeenCalled();
  });

  // Tests de obtención de información
  it('should get user info and cart products when user is available', () => {
    component.obtenerInfoCliente();
    expect(component.usuario).toEqual(mockUsuario);
    expect(component.obtenerProductosCarritoCompras).toHaveBeenCalled();
    expect(component.subscribeToInventoryChanges).toHaveBeenCalled();
  });

  it('should navigate to home if no user is selected or client id is not available', () => {
    // Cambiar el valor para simular que no hay clientId
    (carritoComprasService.getCurrentClientId as jasmine.Spy).and.returnValue(null);

    component.obtenerInfoCliente();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should get cart products from service', () => {
    component.obtenerProductosCarritoCompras();
    expect(carritoComprasService.getCurrentCart).toHaveBeenCalled();
    expect(component.productosCarritoCompras).toEqual(mockProductosCarrito);
  });

  // Tests de navegación
  it('should call window.history.back when back method is called', () => {
    component.back();
    expect(window.history.back).toHaveBeenCalled();
  });

  // Tests de operaciones con el carrito
  it('should remove product from cart and show snackbar', () => {
    // Configurar un producto para eliminar
    component.currentProductDelete = mockProductosCarrito[0];

    // Ejecutar el método
    component.eliminarProducto();

    // Verificar resultados
    expect(carritoComprasService.removeFromCurrentCart).toHaveBeenCalledWith('P001');
    expect(translateService.get).toHaveBeenCalledWith('CARRITO_COMPRAS.PRODUCT_DELETED');
    expect(snackBar.open).toHaveBeenCalledWith('mensaje traducido', '', { duration: 3000 });
    expect(component.obtenerProductosCarritoCompras).toHaveBeenCalled();
    expect(component.currentProductDelete).toBeUndefined();
  });

  it('should update product quantity and refresh cart', () => {
    // Crear un producto para actualizar
    const productoActualizar = { ...mockProductosCarrito[0], quantity_selected: 3 };

    // Ejecutar el método
    component.onChangeCantidad(productoActualizar);

    // Verificar resultados
    expect(carritoComprasService.updateProductQuantity).toHaveBeenCalledWith('P001', 3);
    expect(component.obtenerProductosCarritoCompras).toHaveBeenCalled();
  });

  // Tests de cálculos
  it('should calculate total cart value correctly', () => {
    component.productosCarritoCompras = [...mockProductosCarrito];
    // El total debería ser (100 * 2) + (200 * 1) = 400
    expect(component.totalCarritoCompras).toBe(400);
  });

  // Tests de validación
  it('should disable order button when cart is empty', () => {
    component.productosCarritoCompras = [];
    expect(component.disabledPedido).toBe(true);
  });

  it('should disable order button when products have invalid quantities', () => {
    // Caso 1: Producto con cantidad 0
    component.productosCarritoCompras = [
      { ...mockProductosCarrito[0], quantity_selected: 0 },
      mockProductosCarrito[1],
    ];
    expect(component.disabledPedido).toBe(true);

    // Caso 2: Producto con cantidad mayor a la disponible
    component.productosCarritoCompras = [
      { ...mockProductosCarrito[0], quantity: 5, quantity_selected: 6 },
      mockProductosCarrito[1],
    ];
    expect(component.disabledPedido).toBe(true);

    // Caso 3: Todos los productos con cantidades válidas
    component.productosCarritoCompras = [
      { ...mockProductosCarrito[0], quantity: 5, quantity_selected: 3 },
      { ...mockProductosCarrito[1], quantity: 10, quantity_selected: 5 },
    ];
    expect(component.disabledPedido).toBe(false);
  });

  // Tests de creación de pedido
  it('should create order successfully and show success message', () => {
    // Configurar datos
    component.usuario = mockUsuario;
    component.productosCarritoCompras = [...mockProductosCarrito];

    // Ejecutar método
    component.realizarPedido();

    // Verificar llamadas
    expect(crearPedidoService.crearPedido).toHaveBeenCalledWith({
      client_id: '001',
      items: [
        { product_id: 'P001', quantity: 2 },
        { product_id: 'P002', quantity: 1 },
      ],
    });

    // Verificar mensaje
    expect(translateService.get).toHaveBeenCalledWith('CARRITO_COMPRAS.CONFIRM_PEDIDO_SUCCESS');
    expect(snackBar.open).toHaveBeenCalledWith('mensaje traducido', '', { duration: 3000 });

    // Verificar limpieza
    expect(carritoComprasService.clearCurrentCart).toHaveBeenCalled();
    expect(window.history.back).toHaveBeenCalled();
  });

  it('should handle error when creating order fails', () => {
    // Configurar datos
    component.usuario = mockUsuario;
    component.productosCarritoCompras = [...mockProductosCarrito];

    // Configurar error
    (crearPedidoService.crearPedido as jasmine.Spy).and.returnValue(
      throwError(() => new Error('Error al crear pedido')),
    );

    // Ejecutar método
    component.realizarPedido();

    // Verificar mensaje de error
    expect(translateService.get).toHaveBeenCalledWith('CARRITO_COMPRAS.CONFIRM_PEDIDO_ERROR');
    expect(snackBar.open).toHaveBeenCalledWith('mensaje traducido', '', { duration: 3000 });

    // Verificar que no se limpia el carrito
    expect(carritoComprasService.clearCurrentCart).not.toHaveBeenCalled();
  });

  // Tests de reactividad
  it('should update cart when product availability changes', () => {
    component.subscribeToInventoryChanges();

    // Resetear el contador de llamadas para obtenerProductosCarritoCompras
    (component.obtenerProductosCarritoCompras as jasmine.Spy).calls.reset();

    // Simular cambio de disponibilidad
    (carritoComprasService.productAvailabilityChanged$ as Subject<string | null>).next('P001');

    // Verificar actualización
    expect(component.obtenerProductosCarritoCompras).toHaveBeenCalled();
  });

  // Test de limpieza
  it('should unsubscribe from subscription on destroy', () => {
    // Crear un subscription mock
    const subscriptionSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component['subscription'] = subscriptionSpy;

    // Ejecutar ngOnDestroy
    component.ngOnDestroy();

    // Verificar que se llamó unsubscribe
    expect(subscriptionSpy.unsubscribe).toHaveBeenCalled();
  });
});

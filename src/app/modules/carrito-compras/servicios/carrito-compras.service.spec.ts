import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CarritoComprasService } from './carrito-compras.service';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';
import { of } from 'rxjs';
import { Producto } from '../interfaces/productos.interface';
import { take } from 'rxjs/operators';

describe('CarritoComprasService', () => {
  let service: CarritoComprasService;
  let storageMock: any;
  let platformMock: any;

  // Mock producto para pruebas
  const mockProducto: Producto = {
    product_id: 'prod-001',
    product_name: 'Producto de prueba',
    product_code: 'TEST-001',
    manufacturer_name: 'Fabricante Test',
    price: 100,
    price_currency: 'USD',
    images: ['img1.jpg'],
    quantity: 10,
    quantity_selected: 1,
  };

  // Segundo producto para pruebas
  const mockProducto2: Producto = {
    product_id: 'prod-002',
    product_name: 'Producto de prueba 2',
    product_code: 'TEST-002',
    manufacturer_name: 'Fabricante Test',
    price: 50,
    price_currency: 'USD',
    images: ['img2.jpg'],
    quantity: 5,
    quantity_selected: 1,
  };

  beforeEach(() => {
    // Mock de Storage
    storageMock = {
      create: jasmine.createSpy('create').and.returnValue(Promise.resolve()),
      get: jasmine.createSpy('get').and.returnValue(Promise.resolve(null)),
      set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
    };

    // Mock de Platform
    platformMock = {
      pause: of(null),
    };

    TestBed.configureTestingModule({
      providers: [
        CarritoComprasService,
        { provide: Storage, useValue: storageMock },
        { provide: Platform, useValue: platformMock },
      ],
    });

    service = TestBed.inject(CarritoComprasService);

    // Marcamos el storage como listo manualmente para evitar problemas asíncronos
    (service as any).storageReady = true;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Manejo de clientes', () => {
    it('debería establecer un cliente actual', () => {
      service.setCurrentClient('client-001');
      expect(service.getCurrentClientId()).toBe('client-001');
    });

    it('debería devolver null cuando no hay cliente actual', () => {
      expect(service.getCurrentClientId()).toBeNull();
    });
  });

  describe('Operaciones básicas del carrito', () => {
    beforeEach(() => {
      service.setCurrentClient('client-001');
    });

    it('debería añadir un producto al carrito', () => {
      service.addToCurrentCart(mockProducto);
      const cart = service.getCurrentCart();
      expect(cart.length).toBe(1);
      expect(cart[0].product_id).toBe('prod-001');
    });

    it('debería incrementar la cantidad al añadir un producto existente', () => {
      service.addToCurrentCart(mockProducto);
      service.addToCurrentCart(mockProducto);
      const cart = service.getCurrentCart();
      expect(cart.length).toBe(1);
      expect(cart[0].quantity_selected).toBe(2);
    });

    it('debería respetar la cantidad máxima disponible al añadir productos', () => {
      const limitedProduct = { ...mockProducto, quantity: 3 };

      service.addToCurrentCart(limitedProduct);
      service.addToCurrentCart(limitedProduct);
      service.addToCurrentCart(limitedProduct);
      service.addToCurrentCart(limitedProduct); // Intentamos añadir más de lo disponible

      const cart = service.getCurrentCart();
      expect(cart[0].quantity_selected).toBe(3); // No debería exceder quantity
    });

    it('debería actualizar la cantidad de un producto en el carrito', () => {
      service.addToCurrentCart(mockProducto);
      service.updateProductQuantity('prod-001', 3);

      const cart = service.getCurrentCart();
      expect(cart[0].quantity_selected).toBe(3);
    });

    it('debería eliminar un producto del carrito', () => {
      service.addToCurrentCart(mockProducto);
      service.addToCurrentCart(mockProducto2);

      service.removeFromCurrentCart('prod-001');

      const cart = service.getCurrentCart();
      expect(cart.length).toBe(1);
      expect(cart[0].product_id).toBe('prod-002');
    });

    it('debería vaciar el carrito actual', () => {
      service.addToCurrentCart(mockProducto);
      service.addToCurrentCart(mockProducto2);

      service.clearCurrentCart();

      const cart = service.getCurrentCart();
      expect(cart.length).toBe(0);
    });
  });

  describe('Carritos de múltiples clientes', () => {
    it('debería manejar carritos separados para diferentes clientes', () => {
      // Añadir al carrito del cliente 1
      service.setCurrentClient('client-001');
      service.addToCurrentCart(mockProducto);

      // Añadir al carrito del cliente 2
      service.setCurrentClient('client-002');
      service.addToCurrentCart(mockProducto2);

      // Verificar carrito del cliente 1
      const cartClient1 = service.getCartByClientId('client-001');
      expect(cartClient1.length).toBe(1);
      expect(cartClient1[0].product_id).toBe('prod-001');

      // Verificar carrito del cliente 2
      const cartClient2 = service.getCartByClientId('client-002');
      expect(cartClient2.length).toBe(1);
      expect(cartClient2[0].product_id).toBe('prod-002');
    });

    it('debería permitir añadir productos al carrito de un cliente específico', () => {
      service.setCurrentClient('client-001');

      // Añadir a otro cliente sin cambiar el cliente actual
      service.addToClientCart('client-002', mockProducto2);

      // Verificar que el cliente actual no cambió
      expect(service.getCurrentClientId()).toBe('client-001');

      // Verificar que el producto se añadió al cliente específico
      const cartClient2 = service.getCartByClientId('client-002');
      expect(cartClient2.length).toBe(1);
      expect(cartClient2[0].product_id).toBe('prod-002');
    });

    it('debería eliminar el carrito de un cliente específico', () => {
      service.setCurrentClient('client-001');
      service.addToCurrentCart(mockProducto);

      service.deleteClientCart('client-001');

      expect(service.getCartByClientId('client-001').length).toBe(0);
    });
  });

  describe('Observables del carrito', () => {
    beforeEach(() => {
      service.setCurrentClient('client-001');
    });

    it('debería emitir la cantidad correcta de items en el carrito', done => {
      // Primero añadimos los productos
      service.addToCurrentCart(mockProducto);
      service.addToCurrentCart(mockProducto);

      // Después nos suscribimos y solo tomamos 1 valor
      service
        .getCartItemCount()
        .pipe(take(1))
        .subscribe(count => {
          expect(count).toBe('2');
          done();
        });
    });

    it('debería mostrar "99+" cuando hay más de 99 items', done => {
      // Creamos un producto con alta cantidad seleccionada
      const bulkProduct = {
        ...mockProducto,
        quantity: 100,
        quantity_selected: 0, // Inicializado con 0
      };

      // Añadimos al carrito con cantidad 100
      bulkProduct.quantity_selected = 100;
      service.addToCurrentCart(bulkProduct);

      // Tomamos solo un valor
      service
        .getCartItemCount()
        .pipe(take(1))
        .subscribe(count => {
          expect(count).toBe('99+');
          done();
        });
    });

    it('debería emitir el importe total correcto', done => {
      // Añadimos los productos primero
      service.addToCurrentCart(mockProducto);
      service.addToCurrentCart(mockProducto); // Agregamos 2 unidades (quantity_selected = 2)
      service.addToCurrentCart(mockProducto2);

      // Tomamos solo un valor
      service
        .getCartTotalAmount()
        .pipe(take(1))
        .subscribe(total => {
          expect(total).toBe(250); // 100*2 + 50*1
          done();
        });
    });

    it('debería emitir la lista de clientes con carritos', done => {
      // Añadimos los productos primero
      service.addToCurrentCart(mockProducto);
      service.addToClientCart('client-002', mockProducto2);

      // Nos aseguramos de que se emita el valor actualizado
      service
        .getClientsWithCarts()
        .pipe(take(1))
        .subscribe(clients => {
          expect(clients.length).toBe(2);
          expect(clients).toContain('client-001');
          expect(clients).toContain('client-002');
          done();
        });
    });
  });

  describe('Actualización de disponibilidad de productos', () => {
    beforeEach(() => {
      service.setCurrentClient('client-001');
      service.addToCurrentCart({ ...mockProducto, quantity_selected: 10 });

      service.setCurrentClient('client-002');
      service.addToCurrentCart({ ...mockProducto, quantity_selected: 8 });
    });

    it('debería actualizar la disponibilidad en todos los carritos', () => {
      service.updateProductAvailability('prod-001', 5);

      const cart1 = service.getCartByClientId('client-001');
      const cart2 = service.getCartByClientId('client-002');

      // La cantidad disponible debería ser 5 en ambos carritos
      expect(cart1[0].quantity).toBe(5);
      expect(cart2[0].quantity).toBe(5);

      // La cantidad seleccionada no debería exceder la disponible
      expect(cart1[0].quantity_selected).toBe(5);
      expect(cart2[0].quantity_selected).toBe(5);
    });
  });

  describe('Persistencia de datos', () => {
    it('debería guardar todos los carritos', fakeAsync(() => {
      // Aseguramos que el storage está listo
      (service as any).storageReady = true;

      // Establecemos cliente y añadimos producto
      service.setCurrentClient('client-001');
      service.addToCurrentCart(mockProducto);

      // Llamamos al método a probar
      service.saveAllCarts();

      // Avanzamos el tiempo para completar las promesas
      tick();

      // Verificamos que se llamó al storage con los parámetros correctos
      expect(storageMock.set).toHaveBeenCalledWith('clientCarts', jasmine.any(Array));
      expect(storageMock.set).toHaveBeenCalledWith('currentClientId', 'client-001');
    }));

    it('debería cargar todos los carritos almacenados', fakeAsync(() => {
      // Preparamos los datos de prueba
      const mockStoredCarts = [
        {
          clientId: 'client-001',
          items: [{ ...mockProducto }],
          lastUpdated: new Date().toISOString(),
        },
      ];

      // Configuramos el mock del storage para devolver datos específicos
      storageMock.get.and.callFake((key: string) => {
        if (key === 'clientCarts') return Promise.resolve(mockStoredCarts);
        if (key === 'currentClientId') return Promise.resolve('client-001');
        return Promise.resolve(null);
      });

      // Aseguramos que el storage está listo
      (service as any).storageReady = true;

      // Llamamos al método a probar
      service.loadAllCarts();

      // Avanzamos el tiempo para completar las promesas
      tick();

      // Verificamos que los datos se cargaron correctamente
      const cart = service.getCartByClientId('client-001');
      expect(cart.length).toBe(1);
      expect(cart[0].product_id).toBe('prod-001');
      expect(service.getCurrentClientId()).toBe('client-001');
    }));
  });
});

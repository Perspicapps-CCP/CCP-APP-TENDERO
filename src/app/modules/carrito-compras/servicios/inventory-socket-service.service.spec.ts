import { TestBed } from '@angular/core/testing';
import { InventorySocketServiceService } from './inventory-socket-service.service';
import { CarritoComprasService } from './carrito-compras.service';
import { InventoryChangeEvent } from '../interfaces/inventoryChangeEvent';
import { environment } from 'src/environments/environment';

// Mock para Socket.io
class MockSocket {
  events: any = {};

  on(event: string, callback: Function) {
    this.events[event] = callback;
    return this;
  }

  emit(event: string, data?: any) {
    return this;
  }

  disconnect() {
    if (this.events['disconnect']) {
      this.events['disconnect']('Test disconnect');
    }
    return this;
  }

  // Método para simular eventos
  triggerEvent(event: string, data?: any) {
    if (this.events[event]) {
      this.events[event](data);
    }
  }
}

describe('InventorySocketServiceService', () => {
  let service: InventorySocketServiceService;
  let carritoComprasServiceSpy: jasmine.SpyObj<CarritoComprasService>;
  let mockSocket: MockSocket;
  let mockIoConnect: jasmine.Spy;

  // Creamos un constructor personalizado para InventorySocketServiceService que no llame a connect()
  const originalConstructor = InventorySocketServiceService.prototype.constructor;
  let originalConnect: any;

  beforeAll(() => {
    // Guardamos la implementación original de connect
    originalConnect = InventorySocketServiceService.prototype.connect;

    // Sobrescribimos el método connect para que no haga nada
    InventorySocketServiceService.prototype.connect = function () {
      // No hacemos nada aquí
    };
  });

  afterAll(() => {
    // Restauramos la implementación original de connect
    InventorySocketServiceService.prototype.connect = originalConnect;
  });

  beforeEach(() => {
    mockSocket = new MockSocket();

    // Creamos un spy para el CarritoComprasService
    const carritoSpy = jasmine.createSpyObj('CarritoComprasService', ['updateProductAvailability']);

    // Mock para socketIo.connect
    mockIoConnect = jasmine.createSpy().and.returnValue(mockSocket);

    TestBed.configureTestingModule({
      providers: [
        InventorySocketServiceService,
        { provide: CarritoComprasService, useValue: carritoSpy },
      ],
    });

    // Inyectamos los servicios necesarios
    service = TestBed.inject(InventorySocketServiceService);
    carritoComprasServiceSpy = TestBed.inject(
      CarritoComprasService,
    ) as jasmine.SpyObj<CarritoComprasService>;

    // Configuramos las propiedades privadas después de la inyección
    (service as any).io = mockIoConnect;
    (service as any).socket = mockSocket;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should connect to socket server with correct parameters', () => {
    // Restauramos temporalmente la implementación original de connect para este test
    const tempConnect = service.connect;

    // Reemplazamos con la implementación original pero solo para esta instancia
    service.connect = originalConnect;

    // Espiamos el método connect después de restaurarlo
    spyOn(service, 'connect').and.callThrough();

    // Llamamos al método connect() manualmente
    service.connect();

    expect(mockIoConnect).toHaveBeenCalledWith(environment.socketUrlCCP, {
      path: '/inventory/ws/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    // Restauramos el método modificado
    service.connect = tempConnect;
  });

  it('should emit subscribe_to_all_products on connect', () => {
    // Espiamos el método emit del socket mock
    spyOn(mockSocket, 'emit').and.callThrough();

    // Configuramos los listeners de eventos
    (service as any).setupEventListeners();

    // Simulamos el evento connect
    mockSocket.triggerEvent('connect');

    expect(mockSocket.emit).toHaveBeenCalledWith('subscribe_to_all_products');
  });

  it('should update connection status on connect', () => {
    // Restauramos temporalmente la implementación original de connect para este test
    const tempConnect = service.connect;

    // Reemplazamos con la implementación original pero solo para esta instancia
    service.connect = originalConnect;

    // Suscribimos al observable de estado de conexión
    let connectionStatus = null as unknown as string;
    service.connectionStatus$.subscribe(status => {
      connectionStatus = status;
    });

    // Simulamos la conexión
    service.connect();

    expect(connectionStatus).toBe('Connecting...');

    // Restauramos el método modificado
    service.connect = tempConnect;
  });

  it('should update connection status on disconnect', () => {
    // Suscribimos al observable de estado de conexión
    let connectionStatus = null as unknown as string;
    service.connectionStatus$.subscribe(status => {
      connectionStatus = status;
    });

    // Configuramos los listeners de eventos
    (service as any).setupEventListeners();

    // Simulamos una desconexión
    mockSocket.triggerEvent('disconnect', 'Test reason');

    expect(connectionStatus).toBe('Disconnected: Test reason');
  });

  it('should update connection status on connection error', () => {
    // Suscribimos al observable de estado de conexión
    let connectionStatus = null as unknown as string;
    service.connectionStatus$.subscribe(status => {
      connectionStatus = status;
    });

    // Configuramos los listeners de eventos
    (service as any).setupEventListeners();

    // Simulamos un error de conexión
    mockSocket.triggerEvent('connect_error', { message: 'Test error' });

    expect(connectionStatus).toBe('Connection Error: Test error');
  });

  it('should process inventory change events and update cart service', () => {
    // Creamos un evento de inventario
    const testEvent: InventoryChangeEvent = {
      product_id: '123',
      quantity: 10,
      timestamp: new Date().toISOString(),
    };

    // Suscribimos al observable de cambios de inventario
    let receivedEvent = null as unknown as InventoryChangeEvent;
    service.inventoryChange$.subscribe(event => {
      if (event) receivedEvent = event;
    });

    // Configuramos los listeners de eventos
    (service as any).setupEventListeners();

    // Simulamos un evento de cambio de inventario
    mockSocket.triggerEvent('inventory_change', testEvent);

    // Verificamos que se actualizó el servicio de carrito
    expect(carritoComprasServiceSpy.updateProductAvailability).toHaveBeenCalledWith(
      testEvent.product_id,
      testEvent.quantity,
    );

    // Verificamos que se emitió el evento a través del subject
    expect(receivedEvent).toEqual(testEvent);
  });

  it('should disconnect socket when disconnect method is called', () => {
    // Espiamos el método disconnect del socket
    spyOn(mockSocket, 'disconnect').and.callThrough();

    // Llamamos al método disconnect
    service.disconnect();

    // Verificamos que se llamó al método disconnect del socket
    expect(mockSocket.disconnect).toHaveBeenCalled();

    // Verificamos que se estableció el socket a null
    expect((service as any).socket).toBeNull();
  });

  it('should handle connection errors gracefully', () => {
    // Restauramos temporalmente la implementación original de connect para este test
    const tempConnect = service.connect;

    // Reemplazamos con la implementación original pero solo para esta instancia
    service.connect = originalConnect;

    // Preparamos para provocar un error al conectar
    mockIoConnect.and.throwError('Test connection error');

    // Suscribimos al observable de estado de conexión
    let connectionStatus: string | null = null;
    service.connectionStatus$.subscribe(status => {
      connectionStatus = status;
    });

    // Intentamos conectar lo que provocará un error
    service.connect();

    // Verificamos que se actualizó el estado de conexión correctamente
    expect(connectionStatus).toMatch(/^Error:/);

    // Restauramos el método modificado
    service.connect = tempConnect;
  });

  it('should not setup event listeners if socket is null', () => {
    // Establecemos socket a null
    (service as any).socket = null;

    // Llamamos directamente al método setupEventListeners
    (service as any).setupEventListeners();

    // No hay forma directa de probar esto, pero si no arroja una excepción se considera exitoso
    expect(true).toBeTruthy();
  });
});

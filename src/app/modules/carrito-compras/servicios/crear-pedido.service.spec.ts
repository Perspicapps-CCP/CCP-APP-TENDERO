import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CrearPedidoService } from './crear-pedido.service';
import { CrearPedido } from '../interfaces/crearPedido.interface';
import { environment } from 'src/environments/environment';

describe('CrearPedidoService', () => {
  let service: CrearPedidoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CrearPedidoService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CrearPedidoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no hay solicitudes pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a POST request with the correct data to create a pedido', () => {
    // Arrange: Crear un objeto de prueba siguiendo la interfaz CrearPedido
    const mockPedido: CrearPedido = {
      client_id: '12345',
      items: [
        {
          product_id: 'PROD-001',
          quantity: 2,
        },
        {
          product_id: 'PROD-002',
          quantity: 1,
        },
      ],
    };

    // Act: Llamar al método que queremos probar
    service.crearPedido(mockPedido).subscribe(response => {
      // Assert: Verificar la respuesta
      expect(response).toBeTruthy();
    });

    // Assert: Verificar que se hizo la solicitud HTTP correcta
    const req = httpMock.expectOne(`${environment.apiUrlCCP}/api/v1/sales/sales/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockPedido);

    // Flush: Proporcionar una respuesta mock
    req.flush({ success: true, order_id: 'ORD-2025-001' });
  });
});

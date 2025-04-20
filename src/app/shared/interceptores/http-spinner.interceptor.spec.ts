import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { httpSpinnerInterceptor } from './http-spinner.interceptor';
import { SpinnerService } from '../servicios/spinner.service';
import { Observable, of } from 'rxjs';

describe('httpSpinnerInterceptor', () => {
  let spinnerService: jasmine.SpyObj<SpinnerService>;

  beforeEach(() => {
    // Crear un SpinnerService mock con métodos espiados
    const spinnerSpy = jasmine.createSpyObj('SpinnerService', ['show', 'hide']);

    TestBed.configureTestingModule({
      providers: [{ provide: SpinnerService, useValue: spinnerSpy }],
    });

    // Obtener la instancia del servicio desde el TestBed
    spinnerService = TestBed.inject(SpinnerService) as jasmine.SpyObj<SpinnerService>;
  });

  it('should be created', () => {
    const interceptor: HttpInterceptorFn = (req, next) =>
      TestBed.runInInjectionContext(() => httpSpinnerInterceptor(req, next));
    expect(interceptor).toBeTruthy();
  });

  it('should show spinner before request and hide after request completes', () => {
    // Crear una solicitud HTTP mock
    const mockRequest = new HttpRequest('GET', '/test');

    // Crear un handler mock que retorna un Observable completado
    const mockNext: HttpHandlerFn = () => of(new HttpResponse({ status: 200 }));

    // Ejecutar el interceptor en el contexto de inyección
    TestBed.runInInjectionContext(() => {
      // Llamar al interceptor
      const result$ = httpSpinnerInterceptor(mockRequest, mockNext);

      // Verificar que show fue llamado
      expect(spinnerService.show).toHaveBeenCalledTimes(1);

      // Suscribirse y completar inmediatamente para que finalize() se ejecute
      result$.subscribe({
        next: () => {
          // Mock implementation that doesn't rely on 'this' context
        },
        complete: () => {
          //Mock implementation that doesn't rely on 'this' context
        },
      });

      // Verificar que hide fue llamado después de que el observable se completó
      expect(spinnerService.hide).toHaveBeenCalledTimes(1);
    });
  });

  it('should hide spinner even when request fails', () => {
    // Crear una solicitud HTTP mock
    const mockRequest = new HttpRequest('GET', '/test');

    // Crear un handler que devuelve un error
    const errorHandler: HttpHandlerFn = () =>
      new Observable(observer => {
        observer.error(new Error('Test error'));
      });

    // Ejecutar el interceptor en el contexto de inyección
    TestBed.runInInjectionContext(() => {
      // Llamar al interceptor
      const result$ = httpSpinnerInterceptor(mockRequest, errorHandler);

      // Verificar que show fue llamado
      expect(spinnerService.show).toHaveBeenCalledTimes(1);

      // Suscribirse y manejar el error para que finalize() se ejecute
      result$.subscribe({
        next: () => {
          // Mock implementation that doesn't rely on 'this' context
        },
        error: () => {
          // Mock implementation that doesn't rely on 'this' context
        },
        complete: () => {
          // Mock implementation that doesn't rely on 'this' context
        },
      });

      // Verificar que hide fue llamado después de que ocurrió el error
      expect(spinnerService.hide).toHaveBeenCalledTimes(1);
    });
  });
});

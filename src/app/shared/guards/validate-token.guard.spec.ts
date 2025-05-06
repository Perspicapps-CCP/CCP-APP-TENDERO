import { TestBed } from '@angular/core/testing';
import { CanActivateChildFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, firstValueFrom } from 'rxjs';
import { validateTokenGuard } from './validate-token.guard';
import { LoginService } from '../../modules/auth/servicios/login.service';
import { environment } from 'src/environments/environment';

describe('validateTokenGuard', () => {
  const executeGuard: CanActivateChildFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => validateTokenGuard(...guardParameters));

  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;

  beforeEach(() => {
    // Crear spies para HttpClient y LoginService
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    loginServiceSpy = jasmine.createSpyObj('LoginService', ['cerrarSesion']);

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: LoginService, useValue: loginServiceSpy },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return true when API call is successful', async () => {
    // Arrange
    const childRouteMock = {} as ActivatedRouteSnapshot;
    const stateMock = {} as RouterStateSnapshot;
    const mockResponse = { name: 'Test User' };

    // Configure el mock de HttpClient para devolver un Observable exitoso
    httpClientSpy.get.and.returnValue(of(mockResponse));

    // Act: ejecutar el guard y manejar tanto valor directo como Observable
    const result = executeGuard(childRouteMock, stateMock);

    // Si el resultado es un Observable, obtenemos su valor
    const finalResult = result instanceof Observable ? await firstValueFrom(result) : result;

    // Assert
    expect(finalResult).toBe(true);
    expect(httpClientSpy.get).toHaveBeenCalledWith(
      `${environment.apiUrlCCP}/api/v1/users/profile`,
      {},
    );
    expect(loginServiceSpy.cerrarSesion).not.toHaveBeenCalled();
  });

  it('should return false and call cerrarSesion when API call fails', async () => {
    // Arrange
    const childRouteMock = {} as ActivatedRouteSnapshot;
    const stateMock = {} as RouterStateSnapshot;
    const mockError = new Error('API Error');

    // Configure el mock de HttpClient para devolver un Observable con error
    httpClientSpy.get.and.returnValue(throwError(() => mockError));

    // Act: ejecutar el guard y manejar tanto valor directo como Observable
    const result = executeGuard(childRouteMock, stateMock);

    // Si el resultado es un Observable, obtenemos su valor
    const finalResult = result instanceof Observable ? await firstValueFrom(result) : result;

    // Assert
    expect(finalResult).toBe(false);
    expect(httpClientSpy.get).toHaveBeenCalledWith(
      `${environment.apiUrlCCP}/api/v1/users/profile`,
      {},
    );
    expect(loginServiceSpy.cerrarSesion).toHaveBeenCalledOnceWith();
  });
});

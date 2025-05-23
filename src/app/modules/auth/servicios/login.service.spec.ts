import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { LoginService } from './login.service';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { UsuarioService } from './usuario.service';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;
  let router: Router;
  let usuarioService: any; // Cambiamos el tipo para mayor flexibilidad
  let originalLocalStorage: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
  };

  // Guarda las referencias originales antes de modificarlas
  beforeAll(() => {
    originalLocalStorage = {
      getItem: () => null,
      setItem: (key: string, value: string) => {
        console.log(`setItem called with key: ${key}, value: ${value}`);
      },
      removeItem: (key: string) => {
        console.log(`removeItem called with key: ${key}`);
      },
    };
    originalLocalStorage.getItem = localStorage.getItem;
    originalLocalStorage.setItem = localStorage.setItem;
    originalLocalStorage.removeItem = localStorage.removeItem;
  });

  // Restaura las funciones originales después de todas las pruebas
  afterAll(() => {
    localStorage.getItem = originalLocalStorage.getItem;
    localStorage.setItem = originalLocalStorage.setItem;
    localStorage.removeItem = originalLocalStorage.removeItem;
  });

  beforeEach(() => {
    // Crear mocks nuevos para cada prueba
    const getItemSpy = jasmine.createSpy('getItem');
    const setItemSpy = jasmine.createSpy('setItem');
    const removeItemSpy = jasmine.createSpy('removeItem');

    // Asignar los spies directamente sin usar spyOn()
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: getItemSpy,
        setItem: setItemSpy,
        removeItem: removeItemSpy,
      },
      writable: true,
    });

    // Crear un mock para UsuarioService con la capacidad de almacenar el valor de usuario
    const usuarioServiceMock = {
      _usuario: null,
      get usuario() {
        return this._usuario;
      },
      set usuario(value) {
        this._usuario = value;
      },
    };

    TestBed.configureTestingModule({
      providers: [
        LoginService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: UsuarioService, useValue: usuarioServiceMock },
      ],
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    usuarioService = TestBed.inject(UsuarioService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log in user and save data to localStorage', () => {
    const mockUser = { username: 'testuser', password: 'testpassword' };
    const mockResponse = {
      access_token: 'e77c0b8a-a7b9-4c31-a524-a7c32e87b248',
      user: {
        id: '253e3e87-1981-4197-a140-eddb470b00af',
        username: 'Esteban.Bins',
        email: 'Nola_Wiza72@gmail.com',
        role: 'CLIENT',
      },
    };

    spyOn(router, 'navigate');

    service.iniciarSesion(mockUser.username, mockUser.password).subscribe(usuario => {
      expect(usuario).toEqual(mockResponse);
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockResponse.access_token);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'usuario',
        JSON.stringify(mockResponse.user),
      );
      // Verificar que se asignó el usuario al servicio
      expect(usuarioService._usuario).toEqual(mockResponse.user);
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    const req = httpMock.expectOne(`${environment.apiUrlCCP}/api/v1/users/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockResponse);
  });

  it('should throw error and call cerrarSesion when user role is not CLIENT', done => {
    const mockUser = { username: 'testuser', password: 'testpassword' };
    const mockResponse = {
      access_token: 'e77c0b8a-a7b9-4c31-a524-a7c32e87b248',
      user: {
        id: '253e3e87-1981-4197-a140-eddb470b00af',
        username: 'Esteban.Bins',
        email: 'Nola_Wiza72@gmail.com',
        role: 'SELLER',
      },
    };

    spyOn(router, 'navigate');
    spyOn(service, 'cerrarSesion').and.callThrough();

    service.iniciarSesion(mockUser.username, mockUser.password).subscribe({
      next: () => {
        // Si llegamos aquí, la prueba debería fallar
        fail('Should have failed with role error');
      },
      error: error => {
        // Verificamos que se llamó a cerrarSesion
        expect(service.cerrarSesion).toHaveBeenCalled();
        // Verificamos el mensaje de error
        expect(error.message).toBe('Acceso denegado. Este portal es exclusivo para clientes.');
        // Verificamos que se eliminaron los datos del localStorage
        expect(localStorage.removeItem).toHaveBeenCalledWith('token');
        expect(localStorage.removeItem).toHaveBeenCalledWith('usuario');
        // Verificamos la navegación a la página de login
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
        // También verificamos que el usuario se haya asignado antes del error
        // Como en este flujo se llama a cerrarSesion, es posible que _usuario ya no tenga el valor,
        // así que no hacemos esta comprobación
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrlCCP}/api/v1/users/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should log out user and remove data from localStorage', () => {
    spyOn(router, 'navigate');

    service.cerrarSesion();

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('usuario');
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should handle HTTP errors during login', done => {
    const mockUser = { username: 'testuser', password: 'testpassword' };
    const mockErrorResponse = { status: 401, statusText: 'Unauthorized' };

    service.iniciarSesion(mockUser.username, mockUser.password).subscribe({
      next: () => {
        fail('Should have failed with HTTP error');
      },
      error: error => {
        expect(error.status).toBe(401);
        // Verificamos que NO se asignó usuario al servicio
        expect(usuarioService._usuario).toBeNull();
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrlCCP}/api/v1/users/login`);
    expect(req.request.method).toBe('POST');
    req.flush('Invalid credentials', mockErrorResponse);
  });
});

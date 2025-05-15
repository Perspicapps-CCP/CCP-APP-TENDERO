import { TestBed } from '@angular/core/testing';
import { UsuarioService } from './usuario.service';
import { User } from '../interfaces/usuario.interface';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let originalLocalStorage: Storage;
  let localStorageMock: {
    getItem: jasmine.Spy;
    setItem: jasmine.Spy;
    removeItem: jasmine.Spy;
    clear: jasmine.Spy;
    key: jasmine.Spy;
    length: number;
  };

  // Mock del objeto User según la nueva interfaz
  const mockUser: User = {
    id: '253e3e87-1981-4197-a140-eddb470b00af',
    username: 'Esteban.Bins',
    email: 'Nola_Wiza72@gmail.com',
    role: 'CLIENT',
  };

  beforeEach(() => {
    // Guardar referencia al localStorage original
    originalLocalStorage = window.localStorage;

    // Crear mocks para localStorage
    localStorageMock = {
      getItem: jasmine.createSpy('getItem').and.returnValue(null),
      setItem: jasmine.createSpy('setItem'),
      removeItem: jasmine.createSpy('removeItem'),
      clear: jasmine.createSpy('clear'),
      key: jasmine.createSpy('key'),
      length: 0,
    };

    // Mock del localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuarioService);
  });

  afterEach(() => {
    // Restaurar el localStorage original
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return undefined when localStorage is empty and _usuario is not set', () => {
    const user = service.usuario;
    expect(localStorageMock.getItem).toHaveBeenCalledWith('usuario');
    expect(user).toBeUndefined();
  });

  it('should get user from localStorage when available', () => {
    // Cambiar el comportamiento del mock para devolver un usuario
    localStorageMock.getItem.and.returnValue(JSON.stringify(mockUser));

    const user = service.usuario;

    expect(localStorageMock.getItem).toHaveBeenCalledWith('usuario');
    expect(user).toEqual(mockUser);
    expect(user?.id).toEqual('253e3e87-1981-4197-a140-eddb470b00af');
    expect(user?.username).toEqual('Esteban.Bins');
    expect(user?.email).toEqual('Nola_Wiza72@gmail.com');
    expect(user?.role).toEqual('CLIENT');
  });

  it('should set user correctly through the setter', () => {
    // Configuramos localStorage para devolver null (no hay usuario almacenado)
    localStorageMock.getItem.and.returnValue(null);

    // Asignamos un valor a través del setter
    service.usuario = mockUser;

    // Al llamar al getter, siempre consulta localStorage primero (que devuelve null)
    // pero luego debe retornar el valor que asignamos con el setter
    const user = service.usuario;

    // Verificamos que se consultó localStorage
    expect(localStorageMock.getItem).toHaveBeenCalledWith('usuario');

    // A pesar de que localStorage devuelve null, el servicio debe retornar
    // el usuario que asignamos a través del setter
    expect(user).toEqual(mockUser);
  });

  it('should use localStorage value over _usuario when both exist', () => {
    // Primero asignamos un valor a través del setter
    service.usuario = mockUser;

    // Luego configuramos localStorage para devolver un usuario diferente
    const localStorageUser: User = {
      id: 'local-storage-id',
      username: 'LocalStorage.User',
      email: 'local@storage.com',
      role: 'ADMIN',
    };
    localStorageMock.getItem.and.returnValue(JSON.stringify(localStorageUser));

    // Al llamar al getter, debe preferir el valor de localStorage
    const user = service.usuario;

    expect(localStorageMock.getItem).toHaveBeenCalledWith('usuario');
    expect(user).toEqual(localStorageUser);
  });

  it('should return empty string when token is not in localStorage', () => {
    const token = service.token;
    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
    expect(token).toEqual('');
  });

  it('should return token from localStorage when it exists', () => {
    const tokenValue = 'token-from-localStorage';
    localStorageMock.getItem.and.returnValue(tokenValue);

    const token = service.token;

    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
    expect(token).toEqual(tokenValue);
  });
});

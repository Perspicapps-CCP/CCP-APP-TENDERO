import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { SignupService } from './signup.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SignUp } from '../interfaces/signup.interface';
import { environment } from '../../../../environments/environment';

describe('SignupService', () => {
  let service: SignupService;
  let httpMock: HttpTestingController;

  // Mock para environment
  const mockEnvironment = {
    apiUrlCCP: 'http://test-api-url',
    apiKey: 'test-api-key',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SignupService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: 'environment',
          useValue: mockEnvironment,
        },
      ],
    });

    service = TestBed.inject(SignupService);

    // Sobrescribe las propiedades privadas del servicio para asegurarnos
    (service as any).apiUrl = mockEnvironment.apiUrlCCP;
    (service as any).apiKey = mockEnvironment.apiKey;

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a POST request for signUp', () => {
    const mockSignUp: SignUp = {
      full_name: 'Juan Pérez',
      email: 'juan@example.com',
      identification: '123456789',
      phone: '3001234567',
      username: 'juanp',
      password: 'securePass123',
      id_type: 'CC',
    };

    const expectedResponse = {
      ...mockSignUp,
      id: 'abc123', // simulamos que el backend asigna un id
    };

    service.signUp(mockSignUp).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${mockEnvironment.apiUrlCCP}/api/v1/users/clients/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockSignUp);
    req.flush(expectedResponse); // simulamos respuesta con ID asignado
  });

  it('should handle case where address is missing expected components', () => {
    const mockAddress = 'Unknown place';
    const mockResponse = {
      status: 'OK',
      results: [
        {
          geometry: {
            location: {
              lat: 0,
              lng: 0,
            },
          },
          address_components: [], // no componentes
        },
      ],
    };

    service.getCoordinates(mockAddress).subscribe(address => {
      expect(address).toEqual({
        line: ' ',
        neighborhood: '',
        city: '',
        state: '',
        country: '',
        latitude: 0,
        longitude: 0,
      });
    });

    const req = httpMock.expectOne(req =>
      req.url.startsWith('https://maps.googleapis.com/maps/api/geocode/json'),
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});

import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { SignupService } from './signup.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

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
});

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { LoginComponent } from './login.component';
import { LoginService } from '../../servicios/login.service';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';

// Mock del TranslateLoader
export class MockTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

// Mock para LocalizationService si es necesario
class MockLocalizationService {
  currentLocalizationSubject = new BehaviorSubject<unknown>({});
  currentLocalization$ = this.currentLocalizationSubject.asObservable();
  currentLang$ = new BehaviorSubject<string>('es').asObservable();
  localeId = 'es-ES';
  currentLocale$ = new BehaviorSubject<string>('es-ES');

  getLocale() {
    return 'es-ES';
  }
  getCurrentLanguage() {
    return 'es';
  }
  getCurrentLocale() {
    return 'es-ES';
  }
  getCurrencyCode() {
    return 'EUR';
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loginServiceMock: jasmine.SpyObj<LoginService>;
  let snackBarMock: jasmine.SpyObj<MatSnackBar>;
  let translateService: TranslateService;

  beforeEach(async () => {
    // Create spies for services
    loginServiceMock = jasmine.createSpyObj('LoginService', ['iniciarSesion']);
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    loginServiceMock.iniciarSesion.and.returnValue(
      of({
        access_token: 'e77c0b8a-a7b9-4c31-a524-a7c32e87b248',
        user: {
          id: '253e3e87-1981-4197-a140-eddb470b00af',
          username: 'Esteban.Bins',
          email: 'Nola_Wiza72@gmail.com',
          role: 'STAFF',
        },
      }),
    );

    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        LoginComponent,
        ReactiveFormsModule,
        MatCardModule,
        MatSnackBarModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        provideHttpClient(),
        { provide: LoginService, useValue: loginServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        TranslateService,
        TranslateStore,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);

    // Spy on TranslateService.get
    spyOn(translateService, 'get').and.returnValue(of('Mensaje traducido'));

    // Importante: reemplazar el snackBar privado del componente con nuestro mock
    // Esto es necesario porque Angular no inyecta automáticamente el mock en las propiedades privadas
    Object.defineProperty(component, '_snackBar', { value: snackBarMock });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call iniciarSesion when form is valid', () => {
    // Set valid form values
    component.loginForm.controls['username'].setValue('usuario123');
    component.loginForm.controls['password'].setValue('password123');

    // Call iniciarSesion
    component.iniciarSesion();

    // Verify service was called with correct values
    expect(loginServiceMock.iniciarSesion).toHaveBeenCalledWith('usuario123', 'password123');
  });

  it('should not call iniciarSesion when form is invalid', () => {
    // Set invalid form (empty username)
    component.loginForm.controls['username'].setValue('');
    component.loginForm.controls['password'].setValue('password123');

    // Call iniciarSesion
    component.iniciarSesion();

    // Verify service was not called
    expect(loginServiceMock.iniciarSesion).not.toHaveBeenCalled();
  });

  it('should show error message when iniciarSesion fails', fakeAsync(() => {
    // Make login service return an error
    loginServiceMock.iniciarSesion.and.returnValue(
      throwError(() => ({ message: 'Error de autenticación' })),
    );

    // Set valid form values
    component.loginForm.controls['username'].setValue('usuario123');
    component.loginForm.controls['password'].setValue('password123');

    // Call iniciarSesion
    component.iniciarSesion();

    // Use tick to handle async operations
    tick();

    // Verify TranslateService.get was called
    expect(translateService.get).toHaveBeenCalledWith('LOGIN.ERROR_MESSAGE');

    // Verify snackBar.open was called
    expect(snackBarMock.open).toHaveBeenCalled();

    // Si necesitas verificar argumentos específicos, asegúrate de que calls.mostRecent() existe
    if (snackBarMock.open.calls.mostRecent()) {
      const args = snackBarMock.open.calls.mostRecent().args;
      expect(args[0]).toContain('Mensaje traducido');
    }
  }));

  it('should toggle password visibility', () => {
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';

    // Toggle to show password
    component.togglePasswordVisibility(passwordInput);
    expect(component.showPassword).toBe(true);
    expect(passwordInput.type).toBe('text');

    // Toggle to hide password
    component.togglePasswordVisibility(passwordInput);
    expect(component.showPassword).toBe(false);
    expect(passwordInput.type).toBe('password');
  });

  it('should correctly identify invalid controls', () => {
    const usernameControl = component.loginForm.get('username')!;

    // Initially not invalid (not dirty or touched)
    expect(component.isInvalid('username')).toBe(false);

    // Mark as touched and still empty (invalid)
    usernameControl.markAsTouched();
    expect(component.isInvalid('username')).toBe(true);

    // Set valid value
    usernameControl.setValue('usuario123');
    expect(component.isInvalid('username')).toBe(false);

    // Set invalid value (too short)
    usernameControl.setValue('us');
    expect(component.isInvalid('username')).toBe(true);
  });

  it('should return appropriate error messages', () => {
    // Required error
    component.loginForm.get('username')!.setValue('');
    component.getErrorMessage('username').subscribe(message => {
      expect(translateService.get).toHaveBeenCalledWith('LOGIN.FORM_ERRORS.FIELD_REQUIRED');
    });

    // Minlength error for username
    component.loginForm.get('username')!.setValue('ab');
    component.getErrorMessage('username').subscribe(message => {
      expect(translateService.get).toHaveBeenCalledWith('LOGIN.FORM_ERRORS.USERNAME_MIN_LENGTH');
    });

    // Minlength error for password
    component.loginForm.get('password')!.setValue('12345');
    component.getErrorMessage('password').subscribe(message => {
      expect(translateService.get).toHaveBeenCalledWith('LOGIN.FORM_ERRORS.PASSWORD_MIN_LENGTH');
    });

    // No error
    component.loginForm.get('username')!.setValue('usuario123');
    component.getErrorMessage('username').subscribe(message => {
      expect(message).toBe('');
    });
  });
});

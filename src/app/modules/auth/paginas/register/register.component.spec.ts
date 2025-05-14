import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RegisterComponent } from './register.component';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { SignupService } from '../../servicios/signup.service';
import { Address } from '../../interfaces/address.interface';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormControl } from '@angular/forms';
import { SignUp } from '../../interfaces/signup.interface';

class MockTranslateService {
  get(key: string | string[]) {
    return of(key);
  }
  instant(key: string | string[]) {
    return key;
  }
  getBrowserLang() {
    return 'es';
  }
  setDefaultLang(lang: string) {}
  use(lang: string) {
    return of({});
  }
  onLangChange = new BehaviorSubject({ lang: 'es' });
  onTranslationChange = new BehaviorSubject({});
  onDefaultLangChange = new BehaviorSubject({});
}
const mockAddress: Address = {
  id: 'addr001',
  line: 'Calle 136 # 156 a20',
  neighborhood: 'Suba',
  city: 'Bogotá',
  state: 'Cundinamarca',
  country: 'Colombia',
  latitude: 4.60971,
  longitude: -74.08175,
};
describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let signupService: jasmine.SpyObj<Partial<SignupService>>;

  beforeEach(async () => {
    const signupServiceSpy = jasmine.createSpyObj('SignupService', ['getCoordinates', 'signUp'], {
      productAvailabilityChanged$: new Subject<string | null>(),
    });
    signupServiceSpy.getCoordinates.and.returnValue(of(mockAddress));
    signupServiceSpy.signUp.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), RegisterComponent, HttpClientTestingModule],
      providers: [
        RegisterComponent,
        { provide: SignupService, useValue: signupServiceSpy },
        { provide: TranslateService, useClass: MockTranslateService },
        TranslateStore,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    component = TestBed.inject(RegisterComponent);
    signupService = TestBed.inject(SignupService) as jasmine.SpyObj<Partial<SignupService>>;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(signupService).toBeTruthy();
  });

  it('should call signUpService.getCoordinates and signUpService.signUp on valid form', () => {
    component.signUpForm.setValue({
      userName: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      address: 'Calle 136 # 156 a20',
      phone: '123456789',
      identificationType: 'CC',
      identification: '123456',
      password: 'Test@1234',
      passwordConfirmation: 'Test@1234',
      email: 'test@example.com',
    });

    component.signUp();
    expect(signupService.getCoordinates).toHaveBeenCalledWith('Calle 136 # 156 a20');
    expect(signupService.signUp).toHaveBeenCalled();
  });

  it('should mark passwordConfirmation as invalid when passwords do not match', () => {
    component.signUpForm.get('password')?.setValue('Test@1234');
    component.signUpForm.get('passwordConfirmation')?.setValue('Different123');

    const result = component.isInvalid('passwordConfirmation');
    expect(result).toBeTrue();
  });

  it('should return required field error message', done => {
    component.signUpForm.get('email')?.setValue('');
    component.getErrorMessage('email').subscribe(msg => {
      expect(msg).toBe('SIGNUP.FORM_ERRORS.FIELD_REQUIRED');
      done();
    });
  });

  it('should toggle the password visibility', () => {
    const passwordInput: HTMLInputElement = document.createElement('input');
    passwordInput.type = 'password';
    component.togglePasswordVisibility(passwordInput);
    expect(passwordInput.type).toBe('text');
    component.togglePasswordVisibility(passwordInput);
    expect(passwordInput.type).toBe('password');
  });

  it('should mark userName as invalid when its length is less than 3 characters', () => {
    const control = component.signUpForm.get('userName');
    control?.setValue('ab');
    expect(control?.valid).toBeFalsy();
  });

  it('should disable the save button if form is invalid', () => {
    const formValue = {
      userName: '',
      firstName: '',
      lastName: '',
      address: '',
      phone: '',
      identificationType: '',
      identification: '',
      password: '',
      passwordConfirmation: '',
      email: '',
    };
    component.signUpForm.setValue(formValue);
    expect(component.disableSaveButton()).toBeTruthy();
  });
});

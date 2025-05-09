import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { MatCardModule } from '@angular/material/card';
import { SignupService } from '../../servicios/signup.service';
import { SignUp } from '../../interfaces/signup.interface';
import { Router } from '@angular/router';
import { Address } from '../../interfaces/address.interface';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [sharedImports, MatCardModule, ReactiveFormsModule, MatSnackBarModule],
})
export class RegisterComponent {
  errorMessages: string[] = [];
  regex = /[!@#$%^&*(),.?":{}|<>]/;
  signUpForm = new FormGroup({
    userName: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    firstName: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    lastName: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    address: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    phone: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    identificationType: new FormControl<string>('', [Validators.required]),
    identification: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(8),
      this.specialCharacterValidator(),
    ]),
    passwordConfirmation: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(8),
    ]),
    email: new FormControl<string>('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
  });

  showPassword = false;

  constructor(
    private signUpService: SignupService,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
    private router: Router,
  ) {}

  signUp() {
    if (this.signUpForm.valid) {
      const valuesForm = this.signUpForm.value;
      let address: Address | undefined;

      this.signUpService
        .getCoordinates(valuesForm.address!)
        .pipe(
          finalize(() => {
            const signUp: SignUp = {
              full_name: valuesForm.lastName! + valuesForm.firstName!,
              email: valuesForm.email!,
              id_type: valuesForm.identificationType!,
              identification: valuesForm.identification!,
              phone: valuesForm.phone!,
              username: valuesForm.userName!,
              password: valuesForm.password!,
              address: address!,
            };
            this.save(signUp);
          }),
        )
        .subscribe({
          next: (data: any) => {
            address = data;
          },
          error: err => {
            console.error('Error al obtener coordenadas:', err);
            address = {
              line: 'Calle 136 156a-20',
              neighborhood: 'Suba',
              city: 'Bogotá',
              state: 'Bogotá',
              country: 'Colombia',
              latitude: 4.742746599999999,
              longitude: -74.12681529999999,
            };
          },
        });
    }
  }

  save(signUp: SignUp) {
    this.signUpService.signUp(signUp).subscribe({
      next: response => {
        console.log('Signup exitoso', response);
        this.goToLoginPage();
      },
      error: error => {
        this.errorMessages = [];
        console.error('Fallo en REGISTRAR', JSON.stringify(error));
        error.error.detail.forEach((err: any) => {
          this.errorMessages.push(err.msg);
        });
        debugger;
        const errorMessage = this.errorMessages.length > 0 ? this.errorMessages : error.message;
        this.translate.get('LOGIN.ERROR_MESSAGE').subscribe((mensaje: string) => {
          this._snackBar.open(mensaje + ' ' + errorMessage, '', {
            duration: 6000,
          });
        });
      },
    });
  }

  goToLoginPage() {
    this.router.navigate(['/auth/login']);
  }

  isInvalid(controlName: string) {
    if (controlName === 'passwordConfirmation') {
      return this.passwordMatch(
        this.signUpForm.value.password?.toString(),
        this.signUpForm.value.passwordConfirmation?.toString(),
      );
    }
    return (
      this.signUpForm.get(controlName)!.invalid &&
      (this.signUpForm.get(controlName)!.dirty || this.signUpForm.get(controlName)!.touched)
    );
  }

  getErrorMessage(controlName: string): Observable<string> {
    if (this.signUpForm.get(controlName)?.hasError('required')) {
      return this.translate.get('SIGNUP.FORM_ERRORS.FIELD_REQUIRED');
    }

    if (this.signUpForm.get(controlName)?.hasError('minlength') && controlName === 'username') {
      return this.translate.get('SIGNUP.FORM_ERRORS.USERNAME_MIN_LENGTH');
    }

    if (this.signUpForm.get(controlName)?.hasError('minlength') && controlName === 'password') {
      return this.translate.get('SIGNUP.FORM_ERRORS.PASSWORD_MIN_LENGTH');
    }

    if (
      this.signUpForm.get(controlName)?.hasError('missingSpecialCharacter') &&
      controlName === 'password'
    ) {
      return this.translate.get('SIGNUP.FORM_ERRORS.PASSWORD_SPECIAL_CHARACTER');
    }

    if (
      this.passwordMatch(
        this.signUpForm.value.password?.toString(),
        this.signUpForm.value.passwordConfirmation?.toString(),
      ) &&
      controlName === 'passwordConfirmation'
    ) {
      return this.translate.get('SIGNUP.FORM_ERRORS.PASSWORD_DOES_NOT_MATCH');
    }

    return of('');
  }

  passwordMatch(
    password: string | undefined,
    passwordConfirmation: string | null | undefined,
  ): boolean {
    return password != passwordConfirmation;
  }

  disableSaveButton(): boolean {
    let passwordMatch = this.passwordMatch(
      this.signUpForm.value.password?.toString(),
      this.signUpForm.value.passwordConfirmation?.toString(),
    );
    return this.signUpForm.invalid || passwordMatch;
  }

  togglePasswordVisibility(passwordInput: HTMLInputElement): void {
    this.showPassword = !this.showPassword;
    passwordInput.type = this.showPassword ? 'text' : 'password';
  }

  specialCharacterValidator(): ValidatorFn {
    const regex = /[!@#$%^&*(),.?":{}|<>]/;
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      return regex.test(value) ? null : { missingSpecialCharacter: true };
    };
  }
}

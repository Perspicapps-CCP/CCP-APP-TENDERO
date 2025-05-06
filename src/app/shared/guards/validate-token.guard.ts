import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateChildFn } from '@angular/router';
import { environment } from 'src/environments/environment';
import { LoginService } from '../../modules/auth/servicios/login.service';
import { Observable, catchError, map, of } from 'rxjs';

export const validateTokenGuard: CanActivateChildFn = (): Observable<boolean> => {
  const url = environment.apiUrlCCP;
  const http = inject(HttpClient);
  const loginService = inject(LoginService);

  return http.get(`${url}/api/v1/users/profile`, {}).pipe(
    map(() => true),
    catchError(() => {
      loginService.cerrarSesion();
      return of(false);
    }),
  );
};

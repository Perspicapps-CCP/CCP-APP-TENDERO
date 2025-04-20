import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UsuarioService } from '../../modules/auth/servicios/usuario.service';

export const httpHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  if (!(req.url.includes('login') || req.url.includes('signin'))) {
    const usuarioService = inject(UsuarioService);
    const token = usuarioService.token;

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return next(req);
};

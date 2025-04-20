import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UsuarioService } from './usuario.service';
import { Login } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = environment.apiUrlCCP;

  constructor(
    private http: HttpClient,
    private router: Router,
    private usuarioService: UsuarioService,
  ) {}

  iniciarSesion(username: string, password: string) {
    console.log('AUTH-DEBUG: Iniciando petición a ' + this.apiUrl);
    console.log('AUTH-DEBUG: Datos enviados', JSON.stringify({ username, password }));

    return this.http.post<Login>(`${this.apiUrl}/api/v1/users/login`, { username, password }).pipe(
      timeout(30000),
      tap(res => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('usuario', JSON.stringify(res.user));
        this.usuarioService.usuario = res;
        this.router.navigate(['/home']);
      }),

      catchError(error => {
        console.error('Error en login:', error);

        if (error.status === 0) {
          console.error('Error de conexión. Detalles:', {
            name: error.name,
            message: error.message,
            url: error.url,
            type: typeof error,
            stack: error.stack,
          });

          // Intenta obtener más información sobre la red
          fetch('http://34.8.227.72').then(
            () => console.log('Fetch básico funciona'),
            err => console.error('Fetch básico falla:', err),
          );
        }

        return throwError(() => new Error('Error de login: ' + (error.message || 'Desconocido')));
      }),
    );
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/auth/login']);
  }
}

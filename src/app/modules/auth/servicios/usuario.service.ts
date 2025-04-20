import { Injectable } from '@angular/core';
import { Login } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private _usuario: Login | undefined;

  get usuario(): Login | undefined {
    return this._usuario;
  }

  set usuario(usuario: Login) {
    this._usuario = usuario;
  }

  get token(): string {
    const tokenSession = localStorage.getItem('token');
    if (tokenSession) {
      return tokenSession;
    }
    return this._usuario?.access_token || '';
  }
}

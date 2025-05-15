import { Injectable } from '@angular/core';
import { User } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private _usuario: User | undefined;

  get usuario(): User | undefined {
    const usuarioSession = localStorage.getItem('usuario');

    if (usuarioSession) {
      this._usuario = JSON.parse(usuarioSession);
    }

    return this._usuario;
  }

  set usuario(usuario: User) {
    this._usuario = usuario;
  }

  get token(): string {
    const tokenSession = localStorage.getItem('token');
    if (tokenSession) {
      return tokenSession;
    }
    return '';
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CrearPedido } from '../interfaces/crearPedido.interface';

@Injectable({
  providedIn: 'root',
})
export class CrearPedidoService {
  private apiUrl = environment.apiUrlCCP;

  constructor(private http: HttpClient) {}

  crearPedido(pedido: CrearPedido) {
    console.log('pedido', pedido);
    return this.http.post(`${this.apiUrl}/api/v1/sales/sales/`, pedido);
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as socketIo from 'socket.io-client';
import { InventoryChangeEvent } from '../interfaces/inventoryChangeEvent';
import { CarritoComprasService } from './carrito-compras.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InventorySocketServiceService {
  private socket: any = null;
  private io = socketIo.connect;
  private serverUrl = environment.socketUrlCCP;

  private path = '/inventory/ws/socket.io';

  // Observables para los estados y eventos
  private connectionStatusSubject = new BehaviorSubject<string>('Disconnected');
  private inventoryChangeSubject = new BehaviorSubject<InventoryChangeEvent | null>(null);

  // Exponer observables públicos
  connectionStatus$ = this.connectionStatusSubject.asObservable();
  inventoryChange$ = this.inventoryChangeSubject.asObservable();

  constructor(private carritoComprasService: CarritoComprasService) {
    this.connect();
  }

  // Conectar al servidor Socket.IO
  connect(): void {
    try {
      this.socket = this.io(this.serverUrl, {
        path: this.path,
        transports: ['websocket', 'polling'],
        reconnection: true,
      });

      // Configurar listeners de eventos
      this.setupEventListeners();

      this.connectionStatusSubject.next('Connecting...');
    } catch (error: any) {
      console.error('Error connecting to socket server:', error);
      this.connectionStatusSubject.next(`Error: ${error.message}`);
    }
  }

  // Desconectar del servidor
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Configurar todos los event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Eventos de conexión
    this.socket.on('connect', () => {
      this.socket.emit('subscribe_to_all_products');
    });

    this.socket.on('disconnect', (reason: string) => {
      this.connectionStatusSubject.next(`Disconnected: ${reason}`);
    });

    this.socket.on('connect_error', (error: any) => {
      this.connectionStatusSubject.next(`Connection Error: ${error.message}`);
    });

    // Eventos de cambio de inventario
    this.socket.on('inventory_change', (data: InventoryChangeEvent) => {
      this.carritoComprasService.updateProductAvailability(data.product_id, data.quantity);
      this.inventoryChangeSubject.next(data);
    });
  }
}

import { Producto } from './productos.interface';

export interface ClientCart {
  clientId: string;
  items: Producto[];
  lastUpdated: Date;
}

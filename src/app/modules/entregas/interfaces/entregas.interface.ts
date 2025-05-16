import { Producto } from './productos.interface';

export interface Entrega {
  guide_number: string;
  address: string;
  status: string;
  delivery_date: string;
  initial_date: string;
  phone: string;
  products?: Producto[];
}
